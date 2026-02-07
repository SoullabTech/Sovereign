import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db/postgres';

/**
 * Validate a session token against the auth_sessions table.
 * Returns the member_id if the token is valid, null otherwise.
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
 * Extract member ID from a request.
 *
 * Authentication methods (in priority order):
 * 1. maia_session cookie → validated against auth_sessions table
 * 2. x-session-token header → validated against auth_sessions table
 * 3. x-member-id header → requires a valid session alongside it (prevents impersonation)
 * 4. memberId cookie (legacy) → member existence check only
 *
 * Returns the member ID if found and valid, null otherwise.
 */
export async function getMemberIdFromRequest(request: NextRequest): Promise<string | null> {
  const cookieStore = await cookies();

  // 1. Session cookie (preferred — secure, httpOnly)
  const sessionCookie = cookieStore.get('maia_session')?.value;
  if (sessionCookie) {
    const memberId = await validateSessionToken(sessionCookie);
    if (memberId) return memberId;
  }

  // 2. Session token header (Safari/iOS fallback when cookies blocked by ITP)
  const sessionTokenHeader = request.headers.get('x-session-token');
  if (sessionTokenHeader) {
    const memberId = await validateSessionToken(sessionTokenHeader);
    if (memberId) return memberId;
  }

  // 3. x-member-id header — only trusted when accompanied by a valid session
  //    The client sends both x-session-token and x-member-id; if the session
  //    validated above, we already returned. If we're here, the session was
  //    invalid or missing — reject bare x-member-id to prevent impersonation.
  const headerMemberId = request.headers.get('x-member-id');
  if (headerMemberId) {
    // Bare x-member-id without valid session: log and reject
    console.warn(
      `[auth] Rejected bare x-member-id without valid session: ${headerMemberId.slice(0, 8)}…`
    );
    return null;
  }

  // 4. Legacy memberId cookie (for older web sessions before auth_sessions migration)
  const cookieMemberId = cookieStore.get('memberId')?.value;
  if (cookieMemberId) {
    const result = await query('SELECT id FROM members WHERE id = $1', [cookieMemberId]);
    if (result.rows.length > 0) {
      return cookieMemberId;
    }
  }

  return null;
}
