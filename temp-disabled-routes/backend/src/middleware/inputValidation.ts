// Input Validation and Sanitization Middleware
import { Request, Response, NextFunction } from "express";
import { z, ZodSchema, ZodError } from "zod";
import { logger } from "../utils/logger";
import {
  OracleErrorResponseBuilder,
  OracleErrorCodes,
} from "../types/oracleResponse";

// Common validation schemas
export const commonSchemas = {
  // User ID validation
  userId: z
    .string()
    .min(1, "User ID is required")
    .max(100, "User ID is too long")
    .regex(/^[a-zA-Z0-9_-]+$/, "User ID contains invalid characters"),

  // Oracle query validation
  oracleQuery: z
    .string()
    .min(1, "Query cannot be empty")
    .max(2000, "Query is too long (max 2000 characters)")
    .trim(),

  // Element validation
  element: z.enum(["fire", "water", "earth", "air", "aether"], {
    errorMap: () => ({
      message: "Element must be one of: fire, water, earth, air, aether",
    }),
  }),

  // Email validation
  email: z
    .string()
    .email("Invalid email format")
    .min(1, "Email is required")
    .max(320, "Email is too long"), // RFC 5321 limit

  // Password validation
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
    ),

  // Pagination
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
  }),

  // Date range
  dateRange: z
    .object({
      from: z.string().datetime("Invalid start date"),
      to: z.string().datetime("Invalid end date"),
    })
    .refine((data) => new Date(data.from) <= new Date(data.to), {
      message: "Start date must be before end date",
      path: ["from"],
    }),

  // Symbols array
  symbols: z.array(z.string().min(1).max(50)).max(20, "Too many symbols"),

  // Metadata object
  metadata: z.record(z.any()).optional(),

  // Session ID
  sessionId: z.string().uuid("Invalid session ID format").optional(),

  // Confidence score
  confidence: z.number().min(0).max(1).optional(),
};

// Oracle-specific schemas
export const oracleSchemas = {
  // Oracle consultation request
  consultationRequest: z.object({
    userId: commonSchemas.userId,
    query: commonSchemas.oracleQuery,
    targetElement: commonSchemas.element.optional(),
    sessionId: commonSchemas.sessionId,
    metadata: commonSchemas.metadata,
  }),

  // Memory creation
  createMemory: z.object({
    userId: commonSchemas.userId,
    content: z
      .string()
      .min(1, "Content is required")
      .max(5000, "Content is too long"),
    element: commonSchemas.element.optional(),
    sourceAgent: z.string().max(50).optional(),
    confidence: commonSchemas.confidence,
    symbols: commonSchemas.symbols,
    metadata: commonSchemas.metadata,
  }),

  // Memory query
  memoryQuery: z.object({
    userId: commonSchemas.userId,
    element: commonSchemas.element.optional(),
    sourceAgent: z.string().max(50).optional(),
    symbols: commonSchemas.symbols,
    dateRange: commonSchemas.dateRange.optional(),
    pagination: commonSchemas.pagination,
  }),

  // User authentication
  authLogin: z.object({
    email: commonSchemas.email,
    password: z.string().min(1, "Password is required"),
  }),

  // User registration
  authRegister: z
    .object({
      email: commonSchemas.email,
      password: commonSchemas.password,
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
};

/**
 * Generic validation middleware factory
 */
export function validateInput(
  schema: ZodSchema,
  source: "body" | "query" | "params" = "body",
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[source];
      const validated = schema.parse(data);

      // Replace the request data with validated and sanitized data
      req[source] = validated;

      logger.debug("Input validation successful", {
        path: req.path,
        method: req.method,
        source,
        validatedFields: Object.keys(validated),
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorResponse = OracleErrorResponseBuilder.create()
          .code(OracleErrorCodes.VALIDATION_FAILED)
          .message("Input validation failed")
          .details({
            source,
            issues: error.issues.map((issue) => ({
              path: issue.path.join("."),
              message: issue.message,
              received: (issue as any).received,
            })),
          })
          .path(req.path)
          .method(req.method)
          .build();

        logger.warn("Input validation failed", {
          error: errorResponse,
          path: req.path,
          method: req.method,
        });

        res.status(400).json(errorResponse);
      } else {
        logger.error("Unexpected validation error", { error, path: req.path });
        res.status(500).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "An unexpected error occurred during validation",
          },
        });
      }
    }
  };
}

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHtml(req: Request, res: Response, next: NextFunction) {
  const sanitizeString = (str: string): string => {
    return str
      .replace(/[<>]/g, "") // Remove < and > characters
      .replace(/javascript:/gi, "") // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, "") // Remove event handlers like onclick=
      .trim();
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === "string") {
      return sanitizeString(obj);
    } else if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    } else if (obj && typeof obj === "object") {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
}

/**
 * Content Security Policy validation
 */
export function validateContentSecurity(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const contentType = req.headers["content-type"] || "";

  // Only allow specific content types
  const allowedTypes = [
    "application/json",
    "application/x-www-form-urlencoded",
    "multipart/form-data",
    "text/plain",
  ];

  if (
    req.method !== "GET" &&
    req.method !== "HEAD" &&
    !allowedTypes.some((type) => contentType.includes(type))
  ) {
    const errorResponse = OracleErrorResponseBuilder.create()
      .code("INVALID_CONTENT_TYPE")
      .message(`Content-Type '${contentType}' is not allowed`)
      .path(req.path)
      .method(req.method)
      .build();

    logger.warn("Invalid content type blocked", {
      contentType,
      path: req.path,
    });
    res.status(415).json(errorResponse);
    return;
  }

  // Set security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");

  next();
}

/**
 * Request size validation
 */
export function validateRequestSize(maxSizeBytes: number = 1024 * 1024) {
  // 1MB default
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers["content-length"] || "0", 10);

    if (contentLength > maxSizeBytes) {
      const errorResponse = OracleErrorResponseBuilder.create()
        .code("REQUEST_TOO_LARGE")
        .message(
          `Request size ${contentLength} bytes exceeds limit of ${maxSizeBytes} bytes`,
        )
        .path(req.path)
        .method(req.method)
        .build();

      logger.warn("Request size exceeded", {
        contentLength,
        maxSizeBytes,
        path: req.path,
      });
      res.status(413).json(errorResponse);
      return;
    }

    next();
  };
}

/**
 * Validate user agent to block potential bots/scrapers
 */
export function validateUserAgent(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userAgent = req.headers["user-agent"] || "";

  // List of suspicious patterns (customize based on your needs)
  const suspiciousPatterns = [
    /bot/i,
    /spider/i,
    /crawler/i,
    /scraper/i,
    /curl/i,
    /wget/i,
  ];

  // Skip validation for health checks and metrics
  const skipPaths = ["/health", "/ready", "/live", "/metrics"];
  if (skipPaths.some((path) => req.path.startsWith(path))) {
    next();
    return;
  }

  const isSuspicious = suspiciousPatterns.some((pattern) =>
    pattern.test(userAgent),
  );

  if (isSuspicious) {
    logger.warn("Suspicious user agent detected", {
      userAgent,
      ip: req.ip,
      path: req.path,
    });

    // You might want to rate limit more aggressively or block entirely
    // For now, just log and continue
  }

  next();
}

// Pre-configured validation middleware for common use cases
export const validators = {
  oracleConsultation: validateInput(oracleSchemas.consultationRequest),
  createMemory: validateInput(oracleSchemas.createMemory),
  memoryQuery: validateInput(oracleSchemas.memoryQuery, "query"),
  authLogin: validateInput(oracleSchemas.authLogin),
  authRegister: validateInput(oracleSchemas.authRegister),
  userId: validateInput(z.object({ userId: commonSchemas.userId }), "params"),
};

export default {
  validate: validateInput,
  sanitize: sanitizeHtml,
  contentSecurity: validateContentSecurity,
  requestSize: validateRequestSize,
  userAgent: validateUserAgent,
  validators,
  schemas: { ...commonSchemas, ...oracleSchemas },
};
