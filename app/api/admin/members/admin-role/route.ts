/**
 * Admin Role Grant/Revoke
 *
 * POST /api/admin/members/admin-role
 * Body: { memberId: string, role: AdminRole | null }
 *
 * role: null  = revoke admin access
 * role: 'cto' = grant that specific role
 *
 * GRANT AUTHORITY: only OWNERS (admin_role 'founder' or 'cto'), or shared-password
 * auth, may grant/revoke. This is the platform-authority boundary — see
 * memory project_platform_admin_jurisdiction: one admin_role model, owners-only
 * grant power, and admin authority is platform stewardship ONLY (this route
 * writes members.admin_role and nothing else — it never touches relationship data).
 *
 * SELF-PROTECTION: the last remaining 'founder' cannot be revoked or downgraded,
 * so the platform can never be left with zero founders (no lockout).
 *
 * PROVENANCE: every grant/revoke writes an admin_role_grants row (actor, target,
 * old_role -> new_role, when). Authority changes must leave a durable trail.
 */

import { NextRequest, NextResponse } from 'next/server';
import { transaction } from '@/lib/db/postgres';
import { checkAdminAuth, adminUnauthorized, AdminRole, ALL_ADMIN_ROLES } from '@/lib/admin/adminAuth';

export const dynamic = 'force-dynamic';

// Owners — the only roles permitted to grant/revoke admin standing.
const OWNER_ROLES: AdminRole[] = ['founder', 'cto'];

export async function POST(req: NextRequest) {
  const auth = await checkAdminAuth(req, OWNER_ROLES);
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
  const newRole: AdminRole | null = role;

  try {
    const outcome = await transaction(async (tx) => {
      // Lock the target row so the last-founder check and the update are atomic.
      const cur = await tx.query<{ admin_role: AdminRole | null }>(
        `SELECT admin_role FROM members WHERE id = $1 FOR UPDATE`,
        [memberId],
      );
      if (!cur.rows.length) {
        return { status: 404 as const, error: 'Member not found' };
      }
      const oldRole = cur.rows[0].admin_role;

      // Self-protection: never leave the platform with zero founders. If the
      // target is currently a founder and this change would drop that (revoke
      // or downgrade to a non-founder role), refuse when they are the last one.
      if (oldRole === 'founder' && newRole !== 'founder') {
        const founders = await tx.query<{ n: string }>(
          `SELECT COUNT(*)::text AS n FROM members WHERE admin_role = 'founder'`,
        );
        if (parseInt(founders.rows[0].n, 10) <= 1) {
          return {
            status: 409 as const,
            error: 'Cannot remove the last founder — the platform must retain at least one founder.',
          };
        }
      }

      const upd = await tx.query<{ id: string; admin_role: AdminRole | null }>(
        `UPDATE members SET admin_role = $1 WHERE id = $2 RETURNING id, admin_role`,
        [newRole, memberId],
      );

      // Provenance: durable record of the authority change.
      await tx.query(
        `INSERT INTO admin_role_grants (actor_id, actor_via, target_id, old_role, new_role)
         VALUES ($1, $2, $3, $4, $5)`,
        [auth.memberId ?? null, auth.via, memberId, oldRole, newRole],
      );

      return { status: 200 as const, id: upd.rows[0].id, role: upd.rows[0].admin_role, oldRole };
    });

    if (outcome.status !== 200) {
      return NextResponse.json({ error: outcome.error }, { status: outcome.status });
    }

    const action = outcome.role ? `granted role '${outcome.role}'` : 'revoked admin';
    console.log(
      `[admin/members/admin-role] ${action} for ${outcome.id} (was ${outcome.oldRole ?? 'none'}) ` +
        `by ${auth.via}${auth.memberId ? ` (${auth.memberId})` : ''}`,
    );

    return NextResponse.json({ ok: true, memberId: outcome.id, role: outcome.role });
  } catch (err) {
    console.error('[admin/members/admin-role] DB error:', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
