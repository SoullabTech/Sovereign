/**
 * Error Handling Middleware
 *
 * Standardized error handling for the API service.
 */

import { Request, Response, NextFunction } from 'express';

/**
 * API Error class for structured errors
 */
export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'ApiError';
  }
}

/**
 * Common error factories
 */
export const Errors = {
  badRequest: (message: string, details?: unknown) =>
    new ApiError(400, 'BAD_REQUEST', message, details),

  unauthorized: (message = 'Authentication required') =>
    new ApiError(401, 'UNAUTHORIZED', message),

  forbidden: (message = 'Access denied') =>
    new ApiError(403, 'FORBIDDEN', message),

  notFound: (resource = 'Resource') =>
    new ApiError(404, 'NOT_FOUND', `${resource} not found`),

  conflict: (message: string) =>
    new ApiError(409, 'CONFLICT', message),

  rateLimit: (message = 'Rate limit exceeded') =>
    new ApiError(429, 'RATE_LIMIT', message),

  internal: (message = 'Internal server error') =>
    new ApiError(500, 'INTERNAL_ERROR', message),

  validation: (errors: unknown) =>
    new ApiError(400, 'VALIDATION_ERROR', 'Validation failed', errors)
};

/**
 * Error handler middleware
 */
export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  console.error(`[API Error] ${req.method} ${req.path}:`, err);

  // Handle ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: process.env.NODE_ENV === 'production' ? undefined : err.details
      }
    });
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: process.env.NODE_ENV === 'production' ? undefined : (err as any).errors
      }
    });
  }

  // Handle database errors
  if ((err as any).code?.startsWith?.('42')) {
    // PostgreSQL table/column doesn't exist
    console.error('Database schema error:', (err as any).code);
    return res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Database error'
      }
    });
  }

  // Handle CORS errors - 403 not 500
  if (err.message?.includes('CORS')) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'CORS_FORBIDDEN',
        message: 'Origin not allowed'
      }
    });
  }

  // Generic error
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message
    }
  });
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
