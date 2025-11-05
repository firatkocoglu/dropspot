import {NextFunction, Request, Response} from "express";
import {TokenExpiredError} from "jsonwebtoken";
import {verifyAccess} from "@/utils/jwt";
import {AuthService} from "@/services/auth.service";
import {redis} from "@/utils/redis";

/**
 * Middleware to refresh user session based on access token validity.
 * If the access token is valid, the request is allowed to proceed.
 * If the access token is expired but refresh token is valid, a new access token is generated and attached to the response.
 */

export async function refreshSession(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.headers.authorization?.split(' ')[1];

    if (!accessToken) {
        return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Access token is missing' });
    }

    try {
        const payload = verifyAccess(accessToken);
        // Check if the token has been blacklisted
        const isBlacklisted = await redis.get(`deny:access:${payload.jti}`);

        // If the token has been blacklisted, return a 401 Unauthorized response
        if (isBlacklisted) {
            return res.status(401).json({ error: 'TOKEN_BLACKLISTED', message: 'Access token has been blacklisted'})
        }

        return next();
    } catch (e) {
        if (!(e instanceof TokenExpiredError)) return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    // If the access token is expired, try to refresh it
    const refreshToken = req.cookies["refresh-token"];
    if (!refreshToken) {
        return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Refresh token is missing' });
    }

    // Call the refresh token service to generate a new access token
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await AuthService.refresh(refreshToken);

    // Set a new access token in the response
    req.headers.authorization = `Bearer ${newAccessToken}`;

    res.clearCookie('refresh-token', { path: '/' });
    res.cookie('refresh-token', newRefreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    next();
}
