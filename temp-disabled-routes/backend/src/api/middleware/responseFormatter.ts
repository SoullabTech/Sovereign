// Response Formatter Middleware - Ensures all API responses follow standardized schema
import { Request, Response, NextFunction } from "express";
import { StandardAPIResponse } from "../../utils/sharedUtilities";

/**
 * Extends Express Response with standardized formatting methods
 */
declare module "express-serve-static-core" {
  interface Response {
    success<T>(data: T, statusCode?: number): Response;
    error(errors: string | string[], statusCode?: number): Response;
  }
}

/**
 * Response formatter middleware - adds standardized response methods to Express Response
 */
export function responseFormatter(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  /**
   * Send successful response with standardized format
   */
  res.success = function <T>(data: T, statusCode: number = 200): Response {
    const response: StandardAPIResponse<T> = {
      success: true,
      data,
      errors: [],
      metadata: {
        timestamp: new Date().toISOString(),
        version: process.env.APP_VERSION || "1.0.0",
        requestId: req.headers["x-request-id"] as string,
      },
    };

    return this.status(statusCode).json(response);
  };

  /**
   * Send error response with standardized format
   */
  res.error = function (
    errors: string | string[],
    statusCode: number = 400,
  ): Response {
    const errorArray = Array.isArray(errors) ? errors : [errors];

    const response: StandardAPIResponse = {
      success: false,
      errors: errorArray,
      metadata: {
        timestamp: new Date().toISOString(),
        version: process.env.APP_VERSION || "1.0.0",
        requestId: req.headers["x-request-id"] as string,
      },
    };

    return this.status(statusCode).json(response);
  };

  next();
}

/**
 * Request ID middleware - adds unique request ID to each request
 */
export function addRequestId(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.headers["x-request-id"]) {
    req.headers["x-request-id"] =
      `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Add to response headers as well
  res.setHeader("X-Request-ID", req.headers["x-request-id"]);

  next();
}

export default responseFormatter;
