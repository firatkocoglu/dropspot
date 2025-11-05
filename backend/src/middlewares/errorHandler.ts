import { NextFunction, Request, Response } from "express";

export interface ErrorHandler {
    statusCode?: number,
    message?: string,
    name?: string,
}

/**
 * Standardize error responses
 */
export function errorHandler (error: ErrorHandler, req: Request, res: Response, next: NextFunction) {
    console.error(`ERROR ${req.method} ${req.url}: ${error}`)

    const statusCode = error.statusCode ?? 500;

    // Do not expose internal server errors to the client
    const response = {
        name: error.name ?? 'INTERNAL_ERROR',
        message: error.message ?? 'Internal Server Error',
        status: statusCode
    }

    res.status(statusCode).json(response);
}