import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    let error = err;

    // If the error isn't an instance of our custom ApiError, convert it
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || "Something went wrong";
        error = new ApiError(statusCode, message, error?.errors || [], error.stack);
    }

    const response = {
        ...error,
        message: error.message,
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}), // Hide stack in production
    };

    // Send the response
    res.status(error.statusCode).json(response);
};

export { errorHandler };