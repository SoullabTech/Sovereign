// Shared Utilities - Consolidated common patterns across the codebase
import { logger } from "./logger";

/**
 * Standardized API response wrapper
 */
export interface StandardAPIResponse<T = any> {
  success: boolean;
  data?: T;
  errors?: string[];
  metadata?: {
    timestamp: string;
    version: string;
    requestId?: string;
  };
}

/**
 * Create standardized API response
 */
export function createAPIResponse<T>(
  success: boolean,
  data?: T,
  errors?: string[],
  requestId?: string,
): StandardAPIResponse<T> {
  return {
    success,
    data,
    errors,
    metadata: {
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || "1.0.0",
      requestId,
    },
  };
}

/**
 * Success response helper
 */
export function successResponse<T>(
  data: T,
  requestId?: string,
): StandardAPIResponse<T> {
  return createAPIResponse(true, data, undefined, requestId);
}

/**
 * Error response helper
 */
export function errorResponse(
  errors: string | string[],
  requestId?: string,
): StandardAPIResponse {
  const errorArray = Array.isArray(errors) ? errors : [errors];
  return createAPIResponse(false, undefined, errorArray, requestId);
}

/**
 * Async error handler wrapper
 */
export function asyncErrorHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      logger.error("Async operation failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        args: args.length > 0 ? "provided" : "none",
      });
      throw error;
    }
  };
}

/**
 * Retry mechanism with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");

      if (attempt === maxRetries) {
        logger.error(`Operation failed after ${maxRetries} attempts`, {
          error: lastError.message,
          attempts: maxRetries,
        });
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      logger.warn(`Operation failed, retrying in ${delay}ms`, {
        attempt,
        maxRetries,
        error: lastError.message,
      });

      await sleep(delay);
    }
  }

  throw lastError!;
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate required environment variables
 */
export function validateEnvironmentVariables(requiredVars: string[]): void {
  const missing: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    const error = `Missing required environment variables: ${missing.join(", ")}`;
    logger.error(error);
    throw new Error(error);
  }

  logger.info("Environment variables validated successfully", {
    checked: requiredVars.length,
  });
}

/**
 * Safe JSON parsing with fallback
 */
export function safeJSONParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    logger.warn("JSON parse failed, using fallback", {
      error: error instanceof Error ? error.message : "Unknown error",
      fallback: typeof fallback,
    });
    return fallback;
  }
}

/**
 * Debounce function calls
 */
export function debounce<T extends any[]>(
  func: (...args: T) => void,
  wait: number,
): (...args: T) => void {
  let timeout: NodeJS.Timeout;

  return (...args: T) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  const result = { ...target };

  for (const source of sources) {
    for (const key in source) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (
        sourceValue &&
        typeof sourceValue === "object" &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === "object" &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(targetValue, sourceValue);
      } else {
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}

/**
 * Array chunk utility
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Remove undefined values from object
 */
export function removeUndefined<T extends Record<string, any>>(
  obj: T,
): Partial<T> {
  const result: Partial<T> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key as keyof T] = value;
    }
  }

  return result;
}

/**
 * Type-safe object pick
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;

  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }

  return result;
}

/**
 * Type-safe object omit
 */
export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };

  for (const key of keys) {
    delete result[key];
  }

  return result;
}
