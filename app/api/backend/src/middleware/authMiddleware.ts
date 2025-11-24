// Enhanced Authentication Middleware with JWT and Role-based Access Control
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger";

// JWT Configuration with proper validation
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

// Validate JWT secret on startup
if (!JWT_SECRET) {
  const errorMessage = "CRITICAL: JWT_SECRET environment variable is not set. Authentication will not work.";
  logger.error(errorMessage);
  
  if (process.env.NODE_ENV === "production") {
    // In production, fail fast
    throw new Error(errorMessage);
  } else {
    // In development, warn but continue with a secure random secret
    const crypto = require('crypto');
    const devSecret = crypto.randomBytes(32).toString('hex');
    logger.warn(`DEV MODE: Using temporary JWT secret. Set JWT_SECRET in .env file!`);
    // Note: We don't assign to JWT_SECRET here to maintain const
  }
}

// Use validated secret or generate secure temporary one for dev
const VALIDATED_JWT_SECRET = JWT_SECRET || (() => {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
})();

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: "user" | "facilitator" | "admin";
  permissions: string[];
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  iat?: number;
  exp?: number;
}

/**
 * Generate access token
 */
export function generateAccessToken(
  user: Omit<AuthenticatedUser, "permissions"> & { permissions?: string[] },
): string {
  const payload: Omit<JWTPayload, "iat" | "exp"> = {
    userId: user.id,
    email: user.email,
    role: user.role,
    permissions: user.permissions || getDefaultPermissions(user.role),
  };

  return (jwt as any).sign(payload, VALIDATED_JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(userId: string): string {
  return (jwt as any).sign({ userId, type: "refresh" }, VALIDATED_JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, VALIDATED_JWT_SECRET) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    }
    throw new Error("Token verification failed");
  }
}

/**
 * Main authentication middleware
 */
export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      error: "Access token required",
      message:
        "Please provide a valid access token in the Authorization header",
    });
    return;
  }

  try {
    const decoded = verifyToken(token);

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role as "user" | "facilitator" | "admin",
      permissions: decoded.permissions,
    };

    logger.info("User authenticated", {
      userId: req.user.id,
      role: req.user.role,
    });
    next();
  } catch (error) {
    logger.warn("Authentication failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      token: token.substring(0, 20) + "...",
    });

    if (error instanceof Error && error.message === "Token expired") {
      res.status(401).json({
        error: "Token expired",
        message: "Please refresh your access token",
      });
    } else {
      res.status(403).json({
        error: "Invalid token",
        message: "Please provide a valid access token",
      });
    }
  }
}

/**
 * Role-based authorization middleware factory
 */
export function requireRole(
  ...roles: ("user" | "facilitator" | "admin")[]
): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      res.status(401).json({
        error: "Authentication required",
        message: "Please authenticate first",
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: "Insufficient privileges",
        message: `Required role: ${roles.join(" or ")}, current role: ${req.user.role}`,
      });
      return;
    }

    next();
  };
}

/**
 * Permission-based authorization middleware factory
 */
export function requirePermission(
  ...permissions: string[]
): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      res.status(401).json({
        error: "Authentication required",
        message: "Please authenticate first",
      });
      return;
    }

    const hasPermission = permissions.some(
      (permission) =>
        req.user!.permissions.includes(permission) ||
        req.user!.role === "admin",
    );

    if (!hasPermission) {
      res.status(403).json({
        error: "Insufficient permissions",
        message: `Required permission: ${permissions.join(" or ")}`,
      });
      return;
    }

    next();
  };
}

/**
 * Optional authentication - doesn't fail if no token provided
 */
export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role as "user" | "facilitator" | "admin",
      permissions: decoded.permissions,
    };
  } catch (error) {
    // Silently ignore invalid tokens for optional auth
    logger.debug("Optional auth token invalid", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }

  next();
}

/**
 * Get default permissions for a role
 */
function getDefaultPermissions(role: string): string[] {
  switch (role) {
    case "admin":
      return [
        "read:all",
        "write:all",
        "delete:all",
        "manage:users",
        "manage:system",
      ];
    case "facilitator":
      return [
        "read:sessions",
        "write:sessions",
        "read:users",
        "manage:sessions",
      ];
    case "user":
    default:
      return ["read:own", "write:own", "delete:own"];
  }
}

/**
 * Middleware to ensure user can only access their own data
 */
export function ensureOwnData(userIdParam: string = "userId") {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      res.status(401).json({
        error: "Authentication required",
        message: "Please authenticate first",
      });
      return;
    }

    const requestedUserId =
      req.params[userIdParam] ||
      req.body[userIdParam] ||
      req.query[userIdParam];

    // Admins can access any data
    if (req.user.role === "admin") {
      next();
      return;
    }

    // Users can only access their own data
    if (requestedUserId && requestedUserId !== req.user.id) {
      res.status(403).json({
        error: "Access denied",
        message: "You can only access your own data",
      });
      return;
    }

    next();
  };
}
