// oracle-backend/src/middleware/auth.ts

import { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase";
import { logger } from "../utils/logger";
// Create error helper - simplified for build fix
function createError(message: string, status: number) {
  const error = new Error(message) as any;
  error.statusCode = status;
  return error;
}

/**
 * Middleware to check if the request is authenticated via Supabase JWT
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(createError("Missing or invalid authorization header", 401));
  }

  const token = authHeader.split(" ")[1];

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    logger.warn("Unauthorized access attempt", error);
    return next(createError("Invalid or expired token", 401));
  }

  // Attach user to request for downstream access
  (req as any).user = {
    id: user.id,
    email: user.email,
    role: user.role || "user",
  };

  next();
};

/**
 * Extends Express request to include authenticated user
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}
