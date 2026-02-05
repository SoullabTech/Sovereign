/**
 * Practitioner API Authentication Helper
 *
 * Provides consistent authentication for all practitioner API routes.
 * Uses session token from cookie or x-session-token header.
 */

import { NextRequest } from 'next/server';
import { cookies, headers } from 'next/headers';
import { query } from '@/lib/db/postgres';

/**
 * Get authenticated member from request
 * Checks: 1) maia_session cookie, 2) x-session-token header
 *
 * @returns Member ID if authenticated, null otherwise
 */
export async function getAuthenticatedMember(request?: NextRequest): Promise<{ id: string } | null> {
  try {
    // Method 1: Session cookie (works for same-origin requests)
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get('maia_session')?.value;

    if (cookieToken) {
      const memberId = await validateSessionToken(cookieToken);
      if (memberId) {
        return { id: memberId };
      }
    }

    // Method 2: x-session-token header (Safari/iOS fallback)
    const headerStore = await headers();
    const headerToken = headerStore.get('x-session-token');

    if (headerToken) {
      const memberId = await validateSessionToken(headerToken);
      if (memberId) {
        return { id: memberId };
      }
    }

    // Method 3: If request object provided, check its headers directly
    // (useful for middleware or non-standard contexts)
    if (request) {
      const reqToken = request.headers.get('x-session-token');
      if (reqToken) {
        const memberId = await validateSessionToken(reqToken);
        if (memberId) {
          return { id: memberId };
        }
      }
    }

    return null;
  } catch (error) {
    console.error('[PractitionerAuth] Error:', error);
    return null;
  }
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
 * Verify that a member owns a specific practice
 */
export async function verifyPracticeOwnership(practiceId: string, memberId: string): Promise<boolean> {
  const result = await query(
    'SELECT id FROM rl_practices WHERE id = $1 AND owner_user_id = $2',
    [practiceId, memberId]
  );
  return result.rows.length > 0;
}

/**
 * Verify that a member has access to a specific container (through practice ownership)
 */
export async function verifyContainerAccess(containerId: string, memberId: string): Promise<boolean> {
  const result = await query(
    `SELECT c.id FROM rl_containers c
     JOIN rl_practices p ON p.id = c.practice_id
     WHERE c.id = $1 AND p.owner_user_id = $2`,
    [containerId, memberId]
  );
  return result.rows.length > 0;
}

/**
 * Verify that a member has access to a specific session (through container -> practice)
 */
export async function verifySessionAccess(sessionId: string, memberId: string): Promise<boolean> {
  const result = await query(
    `SELECT s.id FROM rl_sessions s
     JOIN rl_containers c ON c.id = s.container_id
     JOIN rl_practices p ON p.id = c.practice_id
     WHERE s.id = $1 AND p.owner_user_id = $2`,
    [sessionId, memberId]
  );
  return result.rows.length > 0;
}

/**
 * Verify that a member has access to a specific task (through practice ownership)
 */
export async function verifyTaskAccess(taskId: string, memberId: string): Promise<boolean> {
  const result = await query(
    `SELECT t.id FROM rl_tasks t
     JOIN rl_practices p ON p.id = t.practice_id
     WHERE t.id = $1 AND p.owner_user_id = $2`,
    [taskId, memberId]
  );
  return result.rows.length > 0;
}
