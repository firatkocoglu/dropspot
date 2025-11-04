import { NextFunction, Request, Response } from "express";
import { verifyAccess } from "@/utils/jwt";

/**
 * Shape attached to req.user after successful authentication
 */

export interface AuthenticatedUser {
    id: string;
    role: 'USER' | 'ADMIN';
}

/**
    * Extends the Express Request interface to include the user property
 */
export interface AuthenticatedRequest extends Request {
    user?: AuthenticatedUser;
}

/**
 * Extracts the auth token from the request headers and verifies it. If valid, attaches the user info to req.user.
 * If the token is missing or invalid, returns null
 */
function getBearerTokenFromHeader (authHeader?: string | undefined): string | any
{
    if (!authHeader) return null;
    if (!authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.slice('Bearer '.length).trim();
    return token.length > 0 ? token : null;
}

/**
 * Middleware to verify the authentication token in the request headers.
 * If valid, attaches the user info to req.user.
 * If the token is missing or invalid, returns a 401 Unauthorized response.
 */
function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const token = getBearerTokenFromHeader(authHeader)

    if (!token) {
        return res
            .status(401)
            .json({
                error: 'UNAUTHORIZED',
                message: 'Authentication token is missing'
            });
    }

    try {
        const payload = verifyAccess(token);
        req.user = { id: payload.subject, role: payload.role };
        return next();
    } catch (e) {
        return res
            .status(401)
            .json({
                error: 'TOKEN_INVALID_OR_EXPIRED',
                message: 'Invalid or expired token'
            });
    }
}