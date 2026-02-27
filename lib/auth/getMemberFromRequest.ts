import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db/postgres';

/**
 * Extract member ID from a request.
 * Checks in order:
 * 1. x-member-id header (for Capacitor/iOS apps where cookies don't work cross-origin)
 * 2. memberId cookie (for web apps)
 *
 * Returns the member ID if found and valid, null otherwise.
 */
export async function getMemberIdFromRequest(request: NextRequest): Promise<string | null> {
  // 1. Check x-member-id header (Capacitor/iOS apps)
  const headerMemberId = request.headers.get('x-member-id');
  if (headerMemberId) {
    // Validate the member exists
    const result = await query('SELECT id FROM members WHERE id = $1', [headerMemberId]);
    if (result.rows.length > 0) {
      return headerMemberId;
    }
  }

  // 2. Check maia_member_id cookie (web apps — set by setAccessCookies)
  const cookieStore = await cookies();
  const cookieMemberId = cookieStore.get('maia_member_id')?.value;
  if (cookieMemberId) {
    // Validate the member exists
    const result = await query('SELECT id FROM members WHERE id = $1', [cookieMemberId]);
    if (result.rows.length > 0) {
      return cookieMemberId;
    }
  }

  // 3. Fall back to maia_session cookie → look up member from session table
  const sessionToken = cookieStore.get('maia_session')?.value;
  if (sessionToken) {
    const result = await query(
      `SELECT member_id FROM auth_sessions WHERE session_token = $1 AND expires_at > NOW() AND revoked = FALSE`,
      [sessionToken]
    );
    if (result.rows.length > 0) {
      return result.rows[0].member_id;
    }
  }

  return null;
}
