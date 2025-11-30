// ===============================================
// PRODUCTION ERROR HANDLING & GRACEFUL FALLBACKS
// Sacred Technology Platform Error Recovery
// ===============================================

import { Request, Response, NextFunction } from "express";
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
} from "../utils/errors";
import { logger } from "../utils/logger";
import { config } from "../config";

// ===============================================
// ENHANCED ERROR TYPES
// ===============================================

export interface SacredError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  context?: any;
  fallbackAction?: string;
}

export enum ErrorType {
  VALIDATION = "validation",
  AUTH = "authentication",
  PERMISSION = "permission",
  NOT_FOUND = "not_found",
  DATABASE = "database",
  EXTERNAL_API = "external_api",
  MEMORY_STORAGE = "memory_storage",
  ORACLE_PROCESSING = "oracle_processing",
  RATE_LIMIT = "rate_limit",
  SYSTEM = "system",
}

// ===============================================
// GRACEFUL FALLBACK STRATEGIES
// ===============================================

class FallbackStrategy {
  static async handleDatabaseFailure(
    operation: string,
    context: any,
  ): Promise<any> {
    logger.warn(
      `Database operation failed: ${operation}. Using fallback strategy.`,
      context,
    );

    switch (operation) {
      case "memory_store":
        return {
          stored: false,
          error: "Storage temporarily unavailable",
          fallback: true,
        };

      case "user_profile":
        return { id: context.userId, minimal: true, fallback: true };

      case "oracle_session":
        return { id: `temp_${Date.now()}`, temporary: true, persisted: false };

      default:
        return { error: "Service temporarily unavailable", fallback: true };
    }
  }

  static async handleOracleProcessingFailure(userInput: string): Promise<any> {
    logger.warn("Oracle processing failed. Using fallback response.");

    return {
      response:
        "I sense a disturbance in the digital realm. While I gather my sacred energies, please know that your words are heard. Try again in a moment, and the wisdom will flow.",
      mode: "guardian",
      fallback: true,
      retryIn: 30000,
    };
  }

  static async handleExternalAPIFailure(service: string): Promise<any> {
    logger.warn(`External API failure: ${service}. Using fallback.`);

    return {
      error: `Service ${service} temporarily unavailable`,
      fallback: true,
      retryIn: 60000,
    };
  }
}

// ===============================================
// ENHANCED ERROR HANDLER
// ===============================================

export const errorHandler = async (
  error: SacredError,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // Enhanced logging with context
  logger.error(`[${error.name}] ${error.message}`, {
    stack: config.server.env === "development" ? error.stack : undefined,
    url: req.url,
    method: req.method,
    userId: (req as any).user?.id,
    timestamp: new Date().toISOString(),
    context: error.context,
  });

  // Determine error type and appropriate response
  const errorType = classifyError(error);
  const statusCode = error.statusCode || getStatusCodeForErrorType(errorType);

  // Try graceful fallback
  let fallbackResponse = null;
  try {
    fallbackResponse = await handleGracefulFallback(error, req);
  } catch (fallbackError) {
    logger.error("Fallback strategy failed:", fallbackError);
  }

  // Handle specific error types
  if (error instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: { type: "validation", message: error.message },
      ...(fallbackResponse && { fallback: fallbackResponse }),
    });
  }

  if (error instanceof AuthenticationError) {
    return res.status(401).json({
      success: false,
      error: {
        type: "authentication",
        message: "Sacred authentication required",
      },
      ...(fallbackResponse && { fallback: fallbackResponse }),
    });
  }

  if (error instanceof AuthorizationError) {
    return res.status(403).json({
      success: false,
      error: { type: "permission", message: "Sacred permission required" },
      ...(fallbackResponse && { fallback: fallbackResponse }),
    });
  }

  if (error instanceof NotFoundError) {
    return res.status(404).json({
      success: false,
      error: { type: "not_found", message: error.message },
      ...(fallbackResponse && { fallback: fallbackResponse }),
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        type: errorType,
        message: getClientSafeMessage(error, errorType),
      },
      ...(fallbackResponse && { fallback: fallbackResponse }),
    });
  }

  // General error response with fallback
  return res.status(statusCode).json({
    success: false,
    error: {
      type: errorType,
      message: getClientSafeMessage(error, errorType),
      timestamp: new Date().toISOString(),
    },
    ...(fallbackResponse && { fallback: fallbackResponse }),
    ...(config.server.env === "development" && {
      debug: {
        originalMessage: error.message,
        stack: error.stack,
      },
    }),
  });
};

// ===============================================
// HELPER FUNCTIONS
// ===============================================

function classifyError(error: SacredError): ErrorType {
  const message = error.message.toLowerCase();

  if (message.includes("database") || message.includes("connection")) {
    return ErrorType.DATABASE;
  }
  if (message.includes("unauthorized") || message.includes("token")) {
    return ErrorType.AUTH;
  }
  if (message.includes("memory") || message.includes("storage")) {
    return ErrorType.MEMORY_STORAGE;
  }
  if (message.includes("oracle") || message.includes("divination")) {
    return ErrorType.ORACLE_PROCESSING;
  }
  if (message.includes("openai") || message.includes("api")) {
    return ErrorType.EXTERNAL_API;
  }
  if (message.includes("rate limit")) {
    return ErrorType.RATE_LIMIT;
  }
  if (message.includes("validation") || message.includes("invalid")) {
    return ErrorType.VALIDATION;
  }

  return ErrorType.SYSTEM;
}

function getStatusCodeForErrorType(errorType: ErrorType): number {
  switch (errorType) {
    case ErrorType.VALIDATION:
      return 400;
    case ErrorType.AUTH:
      return 401;
    case ErrorType.PERMISSION:
      return 403;
    case ErrorType.NOT_FOUND:
      return 404;
    case ErrorType.RATE_LIMIT:
      return 429;
    default:
      return 500;
  }
}

function getClientSafeMessage(
  error: SacredError,
  errorType: ErrorType,
): string {
  switch (errorType) {
    case ErrorType.DATABASE:
      return "The sacred records are temporarily unavailable. Your data is safe.";
    case ErrorType.MEMORY_STORAGE:
      return "Memory weaving is temporarily disrupted. Please try again.";
    case ErrorType.ORACLE_PROCESSING:
      return "The oracle is gathering wisdom. Please allow a moment for deeper insight.";
    case ErrorType.EXTERNAL_API:
      return "External wisdom sources are temporarily unreachable.";
    case ErrorType.RATE_LIMIT:
      return "You're moving quickly through the sacred space. Please pause and try again.";
    case ErrorType.VALIDATION:
      return error.message;
    default:
      return "A temporary disturbance in the digital realm. Please try again.";
  }
}

async function handleGracefulFallback(
  error: SacredError,
  req: Request,
): Promise<any> {
  const errorType = classifyError(error);
  const context = {
    ...error.context,
    userId: (req as any).user?.id,
    path: req.path,
  };

  switch (errorType) {
    case ErrorType.DATABASE:
      return await FallbackStrategy.handleDatabaseFailure(
        error.context?.operation || "unknown",
        context,
      );

    case ErrorType.ORACLE_PROCESSING:
      return await FallbackStrategy.handleOracleProcessingFailure(
        error.context?.userInput || "",
      );

    case ErrorType.EXTERNAL_API:
      return await FallbackStrategy.handleExternalAPIFailure(
        error.context?.service || "unknown",
      );

    default:
      return null;
  }
}

// ===============================================
// ASYNC ERROR WRAPPER
// ===============================================

export const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
