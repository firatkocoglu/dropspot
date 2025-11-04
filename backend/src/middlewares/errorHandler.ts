import { NextFunction, Request, Response } from "express";

export interface ErrorHandler {
    statusCode?: number,
    message?: string,
}

/**
 * Standardize error responses
 */
export function errorHandler (error: ErrorHandler, req: Request, res: Response, next: NextFunction) {
    console.error(`ERROR ${req.method} ${req.url}: ${error}`)

    const statusCode = error.statusCode ?? 500;

    // Do not expose internal server errors to the client
    const response = {
        error: error.message ?? 'Internal Server Error',
    }

    res.status(statusCode).json(response);
}