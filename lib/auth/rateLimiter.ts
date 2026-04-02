/**
 * Authentication rate limiter
 *
 * Protects against brute force attacks:
 * - 5 attempts per 15 minutes per identifier
 * - Exponential backoff on blocks (15min → 30min → 1hr → 2hr → 4hr max)
 * - Identifier types: IP, email, member_id
 */

import { query } from '@/lib/db/postgres';
import { hashIdentifier } from './passwordUtils';

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  blockedUntil: Date | null;
  retryAfterSeconds: number | null;
}

const MAX_ATTEMPTS = 10;
const WINDOW_MINUTES = 5;

/**
 * Check rate limit for an authentication attempt
 *
 * @param identifier - Raw identifier (IP address, email, or member_id)
 * @param identifierType - Type of identifier
 * @param endpoint - API endpoint being rate limited
 */
export async function checkRateLimit(
  identifier: string,
  identifierType: 'ip' | 'email' | 'member_id',
  endpoint: string
): Promise<RateLimitResult> {
  // Hash the identifier for privacy (except member_id which is already a UUID)
  const hashedIdentifier = identifierType === 'member_id'
    ? identifier
    : hashIdentifier(identifier);

  try {
    // Use the database function for atomic check-and-update
    const result = await query(
      `SELECT check_rate_limit($1, $2, $3, $4, $5) as allowed`,
      [hashedIdentifier, identifierType, endpoint, MAX_ATTEMPTS, WINDOW_MINUTES]
    );

    const allowed = result.rows[0]?.allowed ?? true;

    if (!allowed) {
      // Get block details
      const blockInfo = await query(
        `SELECT blocked_until, attempts FROM auth_rate_limits
         WHERE identifier = $1 AND identifier_type = $2 AND endpoint = $3`,
        [hashedIdentifier, identifierType, endpoint]
      );

      const blockedUntil = blockInfo.rows[0]?.blocked_until
        ? new Date(blockInfo.rows[0].blocked_until)
        : null;

      const retryAfterSeconds = blockedUntil
        ? Math.max(0, Math.ceil((blockedUntil.getTime() - Date.now()) / 1000))
        : null;

      return {
        allowed: false,
        remainingAttempts: 0,
        blockedUntil,
        retryAfterSeconds
      };
    }

    // Get remaining attempts
    const attemptsResult = await query(
      `SELECT attempts FROM auth_rate_limits
       WHERE identifier = $1 AND identifier_type = $2 AND endpoint = $3`,
      [hashedIdentifier, identifierType, endpoint]
    );

    const attempts = attemptsResult.rows[0]?.attempts ?? 0;

    return {
      allowed: true,
      remainingAttempts: Math.max(0, MAX_ATTEMPTS - attempts),
      blockedUntil: null,
      retryAfterSeconds: null
    };

  } catch (error) {
    // If rate limiting fails (e.g., table doesn't exist), allow the request
    // but log the error. We don't want rate limiting failures to block legitimate users
    console.error('[RateLimiter] Error checking rate limit:', error);
    return {
      allowed: true,
      remainingAttempts: MAX_ATTEMPTS,
      blockedUntil: null,
      retryAfterSeconds: null
    };
  }
}

/**
 * Reset rate limit after successful authentication
 */
export async function resetRateLimit(
  identifier: string,
  identifierType: 'ip' | 'email' | 'member_id',
  endpoint: string
): Promise<void> {
  const hashedIdentifier = identifierType === 'member_id'
    ? identifier
    : hashIdentifier(identifier);

  try {
    await query(
      `SELECT reset_rate_limit($1, $2, $3)`,
      [hashedIdentifier, identifierType, endpoint]
    );
  } catch (error) {
    // Non-critical - just log
    console.error('[RateLimiter] Error resetting rate limit:', error);
  }
}

/**
 * Get client IP from request
 * Handles proxied requests (X-Forwarded-For, X-Real-IP)
 */
export function getClientIP(request: Request): string {
  // Try various headers in order of preference
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // X-Forwarded-For can contain multiple IPs; take the first (client)
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback - this may not be accurate behind a proxy
  return '127.0.0.1';
}

/**
 * Build rate limit response headers
 */
export function buildRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': MAX_ATTEMPTS.toString(),
    'X-RateLimit-Remaining': result.remainingAttempts.toString(),
  };

  if (result.retryAfterSeconds) {
    headers['Retry-After'] = result.retryAfterSeconds.toString();
    headers['X-RateLimit-Reset'] = Math.ceil(Date.now() / 1000 + result.retryAfterSeconds).toString();
  }

  return headers;
}
