import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest} from "@/middlewares/requireAuth";

/**
 * Middleware to check if the user is an admin. If not, returns a 403 Forbidden response.
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    if (req.user?.role !== 'ADMIN') {
        return res
            .status(403)
            .json({
                error: 'FORBIDDEN',
                message: 'You do not have permission to perform this action'
            });
    }
    next();
}