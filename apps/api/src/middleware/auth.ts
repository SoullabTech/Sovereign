/**
 * Authentication Middleware
 *
 * Handles authentication for API requests via:
 * - Bearer JWT tokens
 * - Session cookies
 * - API keys
 *
 * NOTE: hashPassword here uses legacy SHA256 for verifying existing hashes.
 * New passwords in the main app use bcrypt via lib/auth/passwordUtils.
 */

import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  memberId?: string;
  sessionToken?: string;
}

/**
 * Validate JWT token (placeholder - implement with jose)
 */
async function validateJwtToken(token: string): Promise<{ userId: string } | null> {
  // TODO: Implement JWT validation using jose library
  // For now, return null to indicate not authenticated via JWT
  return null;
}

/**
 * Validate session token from cookie
 */
async function validateSessionToken(token: string): Promise<{ userId: string } | null> {
  // TODO: Implement session validation against database
  // For now, return null to indicate not authenticated
  return null;
}

/**
 * Validate API key
 */
async function validateApiKey(apiKey: string): Promise<{ userId: string } | null> {
  // TODO: Implement API key validation against database
  // For now, return null to indicate not authenticated
  return null;
}

/**
 * Authentication middleware - optional authentication
 * Sets req.userId if authenticated, but doesn't require it
 */
export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-api-key'] as string | undefined;
  const sessionToken = req.cookies?.['session-token'];

  (async () => {
    try {
      // Try Bearer token
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const result = await validateJwtToken(token);
        if (result) {
          req.userId = result.userId;
          return next();
        }
      }

      // Try API key
      if (apiKey) {
        const result = await validateApiKey(apiKey);
        if (result) {
          req.userId = result.userId;
          return next();
        }
      }

      // Try session token
      if (sessionToken) {
        const result = await validateSessionToken(sessionToken);
        if (result) {
          req.userId = result.userId;
          req.sessionToken = sessionToken;
          return next();
        }
      }

      // Development: Allow X-User-ID header
      const devUserId = req.headers['x-user-id'] as string | undefined;
      if (devUserId && process.env.NODE_ENV === 'development') {
        req.userId = devUserId;
        return next();
      }

      // No authentication - continue anyway (optional auth)
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      next();
    }
  })();
}

/**
 * Require authentication middleware
 * Returns 401 if not authenticated
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  authMiddleware(req, res, () => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }
    next();
  });
}

/**
 * Hash password with SHA256 (legacy format)
 * NOTE: This is for verifying existing SHA256 password hashes.
 * New passwords in the main app use bcrypt via lib/auth/passwordUtils.ts
 */
export function hashPassword(password: string): string {
  const salt = process.env.PASSWORD_SALT || 'maia-sovereign-salt';
  return createHash('sha256').update(password + salt).digest('hex');
}
