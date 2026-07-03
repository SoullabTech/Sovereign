/**
 * GET /api/admin/members — list members with their platform admin_role.
 *
 * Owner-gated (admin_role 'founder' or 'cto', or shared password). Read side of
 * the Studio admin-management surface. Returns ONLY platform-authority fields
 * (identity + admin_role) — never relationship/consent data. Grant/revoke is the
 * separate POST /api/admin/members/admin-role.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { checkAdminAuth, adminUnauthorized, AdminRole } from '@/lib/admin/adminAuth';

export const dynamic = 'force-dynamic';

const OWNER_ROLES: AdminRole[] = ['founder', 'cto'];

export async function GET(req: NextRequest) {
  const auth = await checkAdminAuth(req, OWNER_ROLES);
  if (!auth.authed) return adminUnauthorized();

  try {
    const result = await query<{
      id: string;
      name: string | null;
      username: string | null;
      email: string | null;
      admin_role: AdminRole | null;
    }>(
      `SELECT id, name, username, email, admin_role
         FROM members
        ORDER BY (admin_role IS NULL), name NULLS LAST, username NULLS LAST`,
    );

    return NextResponse.json({
      members: result.rows,
      viewerRole: auth.role,
    });
  } catch (err) {
    console.error('[admin/members] DB error:', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
