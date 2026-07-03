/**
 * Server-side session management
 *
 * Sessions are stored in PostgreSQL instead of localStorage-only.
 * This enables:
 * - Session revocation
 * - Multi-device session management
 * - Audit logging
 * - Secure HttpOnly cookies
 */

import { query } from '@/lib/db/postgres';
import { generateSecureToken } from './passwordUtils';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'maia_session';
const SESSION_DURATION_DAYS = 30;

export interface Session {
  id: string;
  memberId: string;
  sessionToken: string;
  deviceId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  expiresAt: Date;
  lastActiveAt: Date;
  revoked: boolean;
}

export interface CreateSessionOptions {
  memberId: string;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
  durationDays?: number;
}

/**
 * Thrown when a session mint is refused because the member is not active
 * (disabled or archived). Distinct from generic session failures so callers can
 * surface a clear message. See docs/specs/MEMBER_LIFECYCLE_2026-06-10.md.
 */
export class MemberNotActiveError extends Error {
  readonly code = 'MEMBER_NOT_ACTIVE';
  constructor(public readonly memberId: string, public readonly status: string) {
    super(`Member ${memberId} is ${status}; session mint refused`);
    this.name = 'MemberNotActiveError';
  }
}

/**
 * Create a new server-side session
 */
export async function createSession(options: CreateSessionOptions): Promise<Session> {
  const {
    memberId,
    deviceId = null,
    ipAddress = null,
    userAgent = null,
    durationDays = SESSION_DURATION_DAYS
  } = options;

  // Lifecycle gate — single chokepoint for ALL sign-in / session-mint paths.
  // A member whose status is not 'active' (disabled / archived) cannot mint a
  // session. A missing row is left to the existing INSERT behavior (no behavior
  // change for flows that create the member and session together).
  const statusResult = await query(`SELECT status FROM members WHERE id = $1`, [memberId]);
  const memberStatus = statusResult.rows[0]?.status;
  if (memberStatus && memberStatus !== 'active') {
    throw new MemberNotActiveError(memberId, memberStatus);
  }

  const sessionToken = generateSecureToken(32); // 64 hex chars
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + durationDays);

  try {
    const result = await query(
      `INSERT INTO auth_sessions (
        member_id, session_token, device_id, ip_address, user_agent, expires_at
      ) VALUES ($1, $2, $3, $4::inet, $5, $6)
      RETURNING id, member_id, session_token, device_id, ip_address, user_agent,
                expires_at, last_active_at, revoked`,
      [memberId, sessionToken, deviceId, ipAddress, userAgent, expiresAt.toISOString()]
    );

    const row = result.rows[0];
    return {
      id: row.id,
      memberId: row.member_id,
      sessionToken: row.session_token,
      deviceId: row.device_id,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      expiresAt: new Date(row.expires_at),
      lastActiveAt: new Date(row.last_active_at),
      revoked: row.revoked
    };
  } catch (error) {
    console.error('[Sessions] Failed to create session:', error);
    throw new Error('Failed to create session');
  }
}

/**
 * Validate a session token and return the session
 */
export async function validateSession(sessionToken: string): Promise<Session | null> {
  try {
    const result = await query(
      `SELECT id, member_id, session_token, device_id, ip_address, user_agent,
              expires_at, last_active_at, revoked
       FROM auth_sessions
       WHERE session_token = $1
         AND revoked = FALSE
         AND expires_at > NOW()`,
      [sessionToken]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    // Update last_active_at
    await query(
      `UPDATE auth_sessions SET last_active_at = NOW() WHERE id = $1`,
      [row.id]
    );

    return {
      id: row.id,
      memberId: row.member_id,
      sessionToken: row.session_token,
      deviceId: row.device_id,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      expiresAt: new Date(row.expires_at),
      lastActiveAt: new Date(row.last_active_at),
      revoked: row.revoked
    };
  } catch (error) {
    console.error('[Sessions] Failed to validate session:', error);
    return null;
  }
}

/**
 * Revoke a session
 */
export async function revokeSession(
  sessionId: string,
  reason: string = 'manual_revocation'
): Promise<boolean> {
  try {
    const result = await query(
      `UPDATE auth_sessions
       SET revoked = TRUE, revoked_at = NOW(), revoked_reason = $2
       WHERE id = $1`,
      [sessionId, reason]
    );
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('[Sessions] Failed to revoke session:', error);
    return false;
  }
}

/**
 * Revoke all sessions for a member (e.g., on password change)
 */
export async function revokeAllSessions(
  memberId: string,
  reason: string = 'password_changed',
  exceptSessionId?: string
): Promise<number> {
  try {
    let sql = `UPDATE auth_sessions
               SET revoked = TRUE, revoked_at = NOW(), revoked_reason = $2
               WHERE member_id = $1 AND revoked = FALSE`;
    const params: (string | undefined)[] = [memberId, reason];

    if (exceptSessionId) {
      sql += ` AND id != $3`;
      params.push(exceptSessionId);
    }

    const result = await query(sql, params);
    return result.rowCount ?? 0;
  } catch (error) {
    console.error('[Sessions] Failed to revoke all sessions:', error);
    return 0;
  }
}

/**
 * Get all active sessions for a member
 */
export async function getMemberSessions(memberId: string): Promise<Session[]> {
  try {
    const result = await query(
      `SELECT id, member_id, session_token, device_id, ip_address, user_agent,
              expires_at, last_active_at, revoked
       FROM auth_sessions
       WHERE member_id = $1 AND revoked = FALSE AND expires_at > NOW()
       ORDER BY last_active_at DESC`,
      [memberId]
    );

    return result.rows.map(row => ({
      id: row.id,
      memberId: row.member_id,
      sessionToken: row.session_token,
      deviceId: row.device_id,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      expiresAt: new Date(row.expires_at),
      lastActiveAt: new Date(row.last_active_at),
      revoked: row.revoked
    }));
  } catch (error) {
    console.error('[Sessions] Failed to get member sessions:', error);
    return [];
  }
}

/**
 * Set session cookie
 * Call this after creating a session
 */
export async function setSessionCookie(sessionToken: string, expiresAt: Date): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt
  });
}

/**
 * Get session token from cookie
 */
export async function getSessionFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE_NAME);
  return cookie?.value ?? null;
}

/**
 * Set access cookies (tier, roles, member_id)
 * These are read by middleware for access control
 */
export async function setAccessCookies(
  memberId: string,
  tier: string,
  roles: string[],
  expiresAt: Date
): Promise<void> {
  const cookieStore = await cookies();
  const cookieOptions = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    expires: expiresAt
  };

  // Member ID (for API routes)
  cookieStore.set('maia_member_id', memberId, {
    ...cookieOptions,
    httpOnly: true,
  });

  // Tier (for middleware access checks)
  cookieStore.set('maia_tier', tier || 'free', {
    ...cookieOptions,
    httpOnly: true,
  });

  // Roles (for middleware access checks)
  cookieStore.set('maia_roles', JSON.stringify(roles || ['member']), {
    ...cookieOptions,
    httpOnly: true,
  });
}

/**
 * Clear session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Get current session from cookie and validate it
 */
export async function getCurrentSession(): Promise<Session | null> {
  const token = await getSessionFromCookie();
  if (!token) return null;
  return validateSession(token);
}

/**
 * Extend session expiry (for "remember me" functionality)
 */
export async function extendSession(sessionId: string, additionalDays: number = 30): Promise<boolean> {
  try {
    const result = await query(
      `UPDATE auth_sessions
       SET expires_at = expires_at + ($2 || ' days')::INTERVAL,
           last_active_at = NOW()
       WHERE id = $1 AND revoked = FALSE`,
      [sessionId, additionalDays]
    );
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('[Sessions] Failed to extend session:', error);
    return false;
  }
}
