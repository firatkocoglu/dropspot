export function throwError(statusCode: number, name: string, message: string, details?: unknown): never {
    const error = new Error(message) as any;
    error.statusCode = statusCode;
    error.name = name;
    error.details = details;
    throw error;
}