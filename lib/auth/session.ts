/**
 * Server-side session authentication
 *
 * Provides secure member authentication via:
 * 1. httpOnly session cookies (primary)
 * 2. x-session-token header (fallback for Safari/iOS)
 *
 * Safari ITP blocks cookies in cross-origin contexts. The header fallback
 * allows clients to include their session token directly when cookies fail.
 */

import { cookies, headers } from 'next/headers';
import { query } from '@/lib/db/postgres';
import { resolveConsistentSessionCredentials } from './verifiedAccess';

/**
 * UUID validation regex
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Require authenticated member from session cookie or header fallback.
 * Throws if no valid session exists.
 *
 * Authentication credentials (each independently checked if present):
 * 1. maia_session cookie → lookup session in DB
 * 2. x-session-token header → lookup session in DB (Safari/iOS fallback)
 * Two valid credentials must identify the same member; identity claims never
 * stand in for credentials. Query-token SSE authority stays in its own path.
 *
 * @returns memberId from verified session
 * @throws Error with message 'AUTH_REQUIRED' if not authenticated
 */
export async function requireMemberId(): Promise<string> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const resolved = await resolveConsistentSessionCredentials<{ member_id: string }>(
    cookieStore.get('maia_session')?.value || null,
    headerStore.get('x-session-token'),
    async (token) => {
      const memberId = await validateSessionToken(token);
      return memberId ? { member_id: memberId } : null;
    },
  );
  if (!resolved.member) throw new Error('AUTH_REQUIRED');
  const memberId = resolved.member.member_id;

  // All client-provided identity claims are untrusted: no bare x-member-id,
  // stale member cookie, or second conflicting claim can select a principal.
  const claims = [
    headerStore.get('x-member-id'),
    headerStore.get('x-maia-member-id'),
    cookieStore.get('maia_member_id')?.value,
  ];
  if (claims.some((claim) => claim && claim !== memberId)) {
    throw new Error('AUTH_REQUIRED');
  }

  return memberId;
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
