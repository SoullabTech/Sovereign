/**
 * Shared admin authentication utility.
 *
 * Two paths (in priority order):
 *   1. Verified member session — x-session-token header OR maia_session cookie, validated against
 *      auth_sessions (unexpired, not revoked); member must have admin_role. A bare x-member-id
 *      header is NEVER trusted for admin (no session proof = privilege-escalation risk).
 *   2. Shared password fallback — x-admin-password or Authorization: Bearer header (grants founder)
 *
 * All access attempts (including denials) are written to admin_access_log.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export type AdminRole = 'founder' | 'cto' | 'practitioner_admin' | 'operations' | 'tester';

export const ALL_ADMIN_ROLES: AdminRole[] = [
  'founder', 'cto', 'practitioner_admin', 'operations', 'tester',
];

export type AdminAuthResult =
  | { authed: true; via: 'member' | 'password'; role: AdminRole; memberId?: string }
  | { authed: false; via: null; role?: never };

async function auditLog(
  via: 'member' | 'password' | 'denied',
  route: string,
  ip: string,
  memberId?: string,
  role?: string,
): Promise<void> {
  try {
    await query(
      `INSERT INTO admin_access_log (via, member_id, admin_role, route, ip)
       VALUES ($1, $2, $3, $4, $5)`,
      [via, memberId ?? null, role ?? null, route, ip],
    );
  } catch {
    // Audit log must never block access
  }
}

/**
 * Checks admin auth via member session or LABTOOLS_ADMIN_PASSWORD.
 * Pass allowedRoles to restrict to specific roles (defaults to ALL_ADMIN_ROLES).
 */
export async function checkAdminAuth(
  req: NextRequest,
  allowedRoles: AdminRole[] = ALL_ADMIN_ROLES,
  routeOverride?: string,
): Promise<AdminAuthResult> {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';
  const route = routeOverride ?? req.nextUrl.pathname;

  // --- Path 1: VERIFIED member session ---
  // SECURITY: admin access requires PROOF of an authenticated session. The session token is taken
  // from the x-session-token header (Safari/iOS) or the maia_session cookie (web), and validated
  // against auth_sessions (unexpired, not revoked) before the member's admin_role is checked.
  // A bare x-member-id header is NEVER trusted here: it carries no session proof, so trusting it
  // would let anyone who knows an admin member's UUID escalate to admin. (Member-identity flows
  // elsewhere may use x-member-id; admin authority must not.)
  const sessionToken =
    req.headers.get('x-session-token') ??
    req.cookies.get('maia_session')?.value ??
    null;

  if (sessionToken) {
    try {
      const r = await query<{ id: string; admin_role: AdminRole }>(
        `SELECT m.id, m.admin_role FROM members m
         JOIN auth_sessions s ON s.member_id = m.id
         WHERE s.session_token = $1
           AND m.admin_role IS NOT NULL
           AND s.expires_at > NOW()
           AND s.revoked = FALSE
         LIMIT 1`,
        [sessionToken],
      );
      if (r.rows.length) {
        const { id, admin_role } = r.rows[0];
        if (allowedRoles.includes(admin_role)) {
          await auditLog('member', route, ip, id, admin_role);
          return { authed: true, via: 'member', role: admin_role, memberId: id };
        }
      }
    } catch (err) {
      console.error('[admin/auth] Member session lookup error:', err);
    }
  }

  // --- Path 2: shared password fallback (grants founder-equivalent) ---
  const adminPassword = process.env.LABTOOLS_ADMIN_PASSWORD;
  if (adminPassword) {
    const raw =
      req.headers.get('x-admin-password') ?? req.headers.get('authorization') ?? '';
    const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw;
    if (token && token === adminPassword) {
      await auditLog('password', route, ip, undefined, 'founder');
      return { authed: true, via: 'password', role: 'founder' };
    }
  }

  await auditLog('denied', route, ip);
  return { authed: false, via: null };
}

export function adminUnauthorized(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
