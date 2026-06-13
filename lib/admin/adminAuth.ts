/**
 * Shared admin authentication utility.
 *
 * Two paths (in priority order):
 *   1. Member session — x-member-id or x-session-token header; member must have admin_role set
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

  // --- Path 1: member session ---
  const memberId = req.headers.get('x-member-id');
  const sessionToken = req.headers.get('x-session-token');

  if (memberId || sessionToken) {
    try {
      let rows: Array<{ id: string; admin_role: AdminRole }> = [];

      if (memberId) {
        const r = await query<{ id: string; admin_role: AdminRole }>(
          `SELECT id, admin_role FROM members
           WHERE id = $1 AND admin_role IS NOT NULL LIMIT 1`,
          [memberId],
        );
        rows = r.rows;
      }

      if (!rows.length && sessionToken) {
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
        rows = r.rows;
      }

      if (rows.length) {
        const { id, admin_role } = rows[0];
        if (allowedRoles.includes(admin_role)) {
          await auditLog('member', route, ip, id, admin_role);
          return { authed: true, via: 'member', role: admin_role, memberId: id };
        }
      }
    } catch (err) {
      console.error('[admin/auth] Member lookup error:', err);
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
