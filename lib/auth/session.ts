/**
 * Server-side session authentication
 *
 * Provides secure member authentication via:
 * 1. httpOnly session cookies (primary)
 * 2. x-member-id header with session token (fallback for Safari/iOS)
 *
 * Safari ITP blocks cookies in cross-origin contexts. The header fallback
 * allows clients to include their session token directly when cookies fail.
 */

import { cookies, headers } from 'next/headers';
import { query } from '@/lib/db/postgres';

/**
 * UUID validation regex
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Require authenticated member from session cookie or header fallback.
 * Throws if no valid session exists.
 *
 * Authentication methods (in priority order):
 * 1. maia_session cookie → lookup session in DB
 * 2. x-session-token header → lookup session in DB (Safari/iOS fallback)
 * 3. x-member-id header → direct member ID (legacy Capacitor support, requires valid session)
 *
 * @returns memberId from verified session
 * @throws Error with message 'AUTH_REQUIRED' if not authenticated
 */
export async function requireMemberId(): Promise<string> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  // Method 1: Session cookie (preferred - works when cookies are sent)
  const cookieToken = cookieStore.get('maia_session')?.value;
  if (cookieToken) {
    const memberId = await validateSessionToken(cookieToken);
    if (memberId) {
      return memberId;
    }
  }

  // Method 2: Session token header (Safari/iOS fallback when cookies blocked)
  const headerToken = headerStore.get('x-session-token');
  if (headerToken) {
    const memberId = await validateSessionToken(headerToken);
    if (memberId) {
      return memberId;
    }
  }

  // Method 3 (x-member-id without session token) REMOVED for security.
  // Previously accepted any valid member UUID if they had an active session,
  // which allowed impersonation attacks. Use x-session-token header instead.

  throw new Error('AUTH_REQUIRED');
}

/**
 * Validate a session token and return the member ID if valid
 */
async function validateSessionToken(token: string): Promise<string | null> {
  const res = await query<{ member_id: string }>(
    `SELECT member_id
     FROM auth_sessions
     WHERE session_token = $1
       AND revoked = FALSE
       AND expires_at > NOW()
     LIMIT 1`,
    [token]
  );

  return res.rows[0]?.member_id || null;
}

/**
 * Get member ID if authenticated, null otherwise.
 * Use this for optional auth (e.g., public pages with optional personalization).
 */
export async function getMemberIdIfAuthenticated(): Promise<string | null> {
  try {
    return await requireMemberId();
  } catch {
    return null;
  }
}

/**
 * Check if current request has valid authentication.
 */
export async function isAuthenticated(): Promise<boolean> {
  const memberId = await getMemberIdIfAuthenticated();
  return memberId !== null;
}
