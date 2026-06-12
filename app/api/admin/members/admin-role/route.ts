/**
 * Admin Role Grant/Revoke
 *
 * POST /api/admin/members/admin-role
 * Body: { memberId: string, role: AdminRole | null }
 *
 * role: null  = revoke admin access
 * role: 'cto' = grant that specific role
 *
 * Only founder-role members (or password auth) can grant/revoke roles.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { checkAdminAuth, adminUnauthorized, AdminRole, ALL_ADMIN_ROLES } from '@/lib/admin/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = await checkAdminAuth(req, ['founder']);
  if (!auth.authed) return adminUnauthorized();

  let body: { memberId?: string; role?: AdminRole | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { memberId, role } = body;

  if (!memberId || typeof memberId !== 'string') {
    return NextResponse.json({ error: 'memberId is required' }, { status: 400 });
  }
  if (role !== null && role !== undefined && !ALL_ADMIN_ROLES.includes(role)) {
    return NextResponse.json(
      { error: `role must be null or one of: ${ALL_ADMIN_ROLES.join(', ')}` },
      { status: 400 },
    );
  }
  if (role === undefined) {
    return NextResponse.json({ error: 'role is required (use null to revoke)' }, { status: 400 });
  }

  try {
    const result = await query<{ id: string; admin_role: AdminRole | null }>(
      `UPDATE members SET admin_role = $1 WHERE id = $2
       RETURNING id, admin_role`,
      [role ?? null, memberId],
    );

    if (!result.rows.length) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const { id, admin_role } = result.rows[0];
    const action = role ? `granted role '${role}'` : 'revoked admin';
    console.log(
      `[admin/members/admin-role] ${action} for ${id} by ${auth.via}${auth.memberId ? ` (${auth.memberId})` : ''}`,
    );

    return NextResponse.json({ ok: true, memberId: id, role: admin_role });
  } catch (err) {
    console.error('[admin/members/admin-role] DB error:', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
