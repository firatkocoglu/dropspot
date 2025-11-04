import jwt, { JwtPayload as JwtStandardPayload, Secret } from 'jsonwebtoken';
import { env } from '@/config/env';

// App-specific JWT payload shape
// - subject holds the userId
// - role is used for authorization checks
export interface AppJwtPayload extends JwtStandardPayload {
    subject: string;
    role: 'USER' | 'ADMIN';
}

// Create a short-lived access token
export const signAccess = (payload: AppJwtPayload): string =>
    jwt.sign(payload, env.accessSecret, { expiresIn: env.accessTtl });

// Create a refresh token
export const signRefresh = (payload: AppJwtPayload): string =>
    jwt.sign(payload, env.refreshSecret, {expiresIn: env.refreshTtl});

// Verify the access token
export const verifyAccess = (token: string): AppJwtPayload =>
    jwt.verify(token, env.accessSecret) as AppJwtPayload;

// Verify the refresh token
export const verifyRefresh = (token: string): AppJwtPayload =>
    jwt.verify(token, env.refreshSecret) as AppJwtPayload;