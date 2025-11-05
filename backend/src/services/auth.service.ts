import {PrismaClient} from '@prisma/client';
import {hashPassword, sha256, verifyPassword} from "@/utils/hash";
import {signAccess, signRefresh, verifyRefresh} from "@/utils/jwt";
import {env} from '@/config/env';
import {throwError} from "@/utils/errors";

const prisma = new PrismaClient();

export const AuthService = {
    async signup(emailRaw: string, password: string) {
        const email = emailRaw.trim().toLowerCase();

        // Check if email is already taken
        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        // If so, throw an error
        if (existingUser) throwError(409, 'EMAIL_TAKEN', 'Email already in use');

        // Hash the password
        const passwordHash = await hashPassword(password);

        // Create the user in the database
        const newUser = await prisma.user.create({
           data: { email, passwordHash, role: 'USER' },
        });

        // Generate JWT tokens
        const accessToken = signAccess({ sub: newUser.id, role: newUser.role })
        const refreshToken = signRefresh({ sub: newUser.id, role: newUser.role })

        // Save refreshToken hash in the database
        const refreshTokenHash = sha256(refreshToken);
        const expiresAt = new Date(Date.now() + extendRefreshTokenDuration(env.refreshTtl));

        await prisma.session.create({
            data: {
                userId: newUser.id,
                refreshTokenHash,
                expiresAt,
            }
        })

        return {
            user: {id: newUser.id, email: newUser.email},
            accessToken,
            refreshToken,
        }
    },

    async login(emailRaw: string, password: string) {
        // Normalize email
        const email = emailRaw.trim().toLowerCase();

        // Check if user exists with the given email
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (! user) throwError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

        // Verify password
        const { passwordHash } = user;
        const verified = await verifyPassword(password, passwordHash);

        if (! verified) throwError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

        // Generate JWT tokens
        const accessToken = signAccess({ sub: user.id, role: user.role })
        const refreshToken = signRefresh({ sub: user.id, role: user.role })


        const refreshTokenHash = sha256(refreshToken);
        const expiresAt = new Date(Date.now() + extendRefreshTokenDuration(env.refreshTtl));

        // Save refreshToken hash in the database
        await prisma.session.create({
            data: {
                userId: user.id,
                refreshTokenHash,
                expiresAt,
            }
        })

        // Return user info and tokens (refresh will be set as HttpOnly cookie in controller)
        return {
            user: {id: user.id, email: user.email},
            accessToken,
            refreshToken,
        }
    },

    async logout(refreshToken: string) {
        const refreshTokenHash = sha256(refreshToken);
        const session = await prisma.session.findUnique(
            { where: { refreshTokenHash } }
        )

        // Revoke the session only if it hasn't revoked yet
        await prisma.session.updateMany({
            where: { refreshTokenHash, revokedAt: null },
            data: { revokedAt: new Date() },
        })

        // For idempotency, regardless of matched row count return 204
        return {status: 204};
    },

    async refresh(refreshToken: string) {

        // Verify the refresh token
        const payload = verifyRefresh(refreshToken);

        if (!payload) throwError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token invalid or expired');

        // Hash the refresh token
        const refreshTokenHash = sha256(refreshToken);
        const session = await prisma.session.findUnique({
            where: { refreshTokenHash },
        })

        if (!session) throwError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token invalid or expired');

        if ((session.revokedAt || session.expiresAt <= new Date())) throwError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is expired');

        // Revoke the old session
        await prisma.session.updateMany({
            where: { refreshTokenHash, revokedAt: null },
            data: { revokedAt: new Date() },
        });

        // Generate new JWT tokens
        const newAccessToken = signAccess({ sub: payload.sub, role: payload.role });
        const newRefreshToken = signRefresh({ sub: payload.sub, role: payload.role });

        // Create a new session for the new refresh token
        await prisma.session.create({
            data: {
                userId: payload.sub,
                refreshTokenHash: sha256(newRefreshToken),
                expiresAt: new Date(Date.now() + extendRefreshTokenDuration(env.refreshTtl)),
            }
        })

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }
}

function extendRefreshTokenDuration(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) throwError(400, 'INVALID_REFRESH_TOKEN_DURATION', 'Refresh token duration must be a number followed by s, m, h, or d.');

    const num = parseInt(duration);
    if (duration.endsWith('s')) return num * 1000;
    if (duration.endsWith('m')) return num * 60 * 1000;
    if (duration.endsWith('h')) return num * 60 * 60 * 1000;
    if (duration.endsWith('d')) return num * 24 * 60 * 60 * 1000;
    return num;
}