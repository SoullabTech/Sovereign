/**
 * Server-side session authentication
 *
 * Provides secure member authentication via httpOnly cookies.
 * Never trust client-provided identity - always derive from session.
 */

import { cookies } from 'next/headers';
import { query } from '@/lib/db/postgres';

/**
 * Require authenticated member from session cookie.
 * Throws if no valid session exists.
 *
 * @returns memberId from verified session
 * @throws Error with message 'AUTH_REQUIRED' if not authenticated
 */
export async function requireMemberId(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get('maia_session')?.value;

  if (!token) {
    throw new Error('AUTH_REQUIRED');
  }

  const res = await query<{ member_id: string }>(
    `SELECT member_id
     FROM auth_sessions
     WHERE session_token = $1
       AND revoked = FALSE
       AND expires_at > NOW()
     LIMIT 1`,
    [token]
  );

  const memberId = res.rows[0]?.member_id;
  if (!memberId) {
    throw new Error('AUTH_REQUIRED');
  }

  return memberId;
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
