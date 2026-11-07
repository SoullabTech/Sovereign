/**
 * Member permissions — one owner-only view of every per-member permission, and
 * the add/remove changes for the four that this view may edit.
 *
 * Design note: docs/programme/ADMIN_MEMBER_PERMISSIONS_CENSUS_2026-11-07.md
 *
 * EDITABLE here (founder ruling 2026-11-07, "recommended scope"):
 *   tier            members.tier                   free | personal | pro
 *   role            members.roles (text[])          add / remove one role
 *   admin_level     members.admin_role             founder | cto | operations | practitioner_admin | tester | none
 *   writers_studio  ops_contacts beta_tester row   metadata.writers_studio_beta true/false
 *
 * SHOWN READ-ONLY (not editable from a web view):
 *   members.tester (the member's own Field Lab opt-in — theirs to change),
 *   practitioner standing, studio team roles, and the production env allowlists
 *   (FOUNDER_MEMBER_IDS etc. — changed only by editing the production env).
 *
 * AUTHORITY: only a SIGNED-IN owner (admin_role founder or cto, proven by a
 * verified session). The shared admin password is refused here, so every audit
 * record names a person. Enforced server-side; the UI is presentation only.
 */

import { isIP } from 'node:net';
import { NextRequest, NextResponse } from 'next/server';
import type { TransactionClient } from '@/lib/db/postgres';
import { checkAdminAuth, ALL_ADMIN_ROLES, AdminRole } from '@/lib/admin/adminAuth';

export const OWNER_ROLES: AdminRole[] = ['founder', 'cto'];

export const TIERS = ['free', 'personal', 'pro'] as const;
export type MemberTier = (typeof TIERS)[number];

/** Roles that may be ADDED here. Any existing role (even unknown) may be removed. */
export const GRANTABLE_ROLES = [
  'admin',
  'steward',
  'curator',
  'practitioner',
  'partner',
  'member',
  'beta_tester',
] as const;

export type PermissionChange =
  | { permission: 'tier'; value: MemberTier }
  | { permission: 'role'; role: string; grant: boolean }
  | { permission: 'admin_level'; value: AdminRole | null }
  | { permission: 'writers_studio'; grant: boolean };

export const AUDIT_ACTION = 'admin.member_permission_changed';

// ---------------------------------------------------------------------------
// Authority
// ---------------------------------------------------------------------------

export type OwnerCheck =
  | { ok: true; actorId: string; actorRole: AdminRole }
  | { ok: false; response: NextResponse };

/**
 * Signed-in owner only. 401 when no admin identity at all; 403 when the caller
 * is an admin but not an owner, or came in through the shared password.
 */
export async function requireSignedInOwner(req: NextRequest): Promise<OwnerCheck> {
  const auth = await checkAdminAuth(req, ALL_ADMIN_ROLES);
  if (!auth.authed) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (auth.via !== 'member' || !auth.memberId) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Permissions can only be changed by a signed-in owner. The shared admin password is not accepted here.' },
        { status: 403 },
      ),
    };
  }
  if (!OWNER_ROLES.includes(auth.role)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Only owners (founder or CTO) can view or change member permissions.' },
        { status: 403 },
      ),
    };
  }
  return { ok: true, actorId: auth.memberId, actorRole: auth.role };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function parseChange(body: unknown): { ok: true; change: PermissionChange } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Body must be a JSON object' };
  const b = body as Record<string, unknown>;
  switch (b.permission) {
    case 'tier':
      if (typeof b.value === 'string' && (TIERS as readonly string[]).includes(b.value)) {
        return { ok: true, change: { permission: 'tier', value: b.value as MemberTier } };
      }
      return { ok: false, error: `tier must be one of: ${TIERS.join(', ')}` };
    case 'role': {
      if (typeof b.role !== 'string' || !/^[a-z_]{1,40}$/.test(b.role)) {
        return { ok: false, error: 'role must be a lowercase role name' };
      }
      if (typeof b.grant !== 'boolean') return { ok: false, error: 'grant must be true or false' };
      if (b.grant && !(GRANTABLE_ROLES as readonly string[]).includes(b.role)) {
        return { ok: false, error: `role to add must be one of: ${GRANTABLE_ROLES.join(', ')}` };
      }
      return { ok: true, change: { permission: 'role', role: b.role, grant: b.grant } };
    }
    case 'admin_level':
      if (b.value === null || (typeof b.value === 'string' && ALL_ADMIN_ROLES.includes(b.value as AdminRole))) {
        return { ok: true, change: { permission: 'admin_level', value: b.value as AdminRole | null } };
      }
      return { ok: false, error: `admin level must be null or one of: ${ALL_ADMIN_ROLES.join(', ')}` };
    case 'writers_studio':
      if (typeof b.grant !== 'boolean') return { ok: false, error: 'grant must be true or false' };
      return { ok: true, change: { permission: 'writers_studio', grant: b.grant } };
    default:
      return { ok: false, error: 'permission must be one of: tier, role, admin_level, writers_studio' };
  }
}

// ---------------------------------------------------------------------------
// Applying a change (inside a transaction; caller supplies the client)
// ---------------------------------------------------------------------------

export type ApplyOutcome =
  | { status: 200; before: unknown; after: unknown }
  | { status: 404 | 409; error: string };

type TargetRow = {
  id: string;
  name: string | null;
  username: string | null;
  email: string | null;
  tier: string | null;
  roles: string[] | null;
  admin_role: AdminRole | null;
};

export async function applyChange(
  tx: TransactionClient,
  actorId: string,
  targetId: string,
  change: PermissionChange,
): Promise<ApplyOutcome> {
  const cur = await tx.query<TargetRow>(
    `SELECT id, name, username, email, tier, roles, admin_role
       FROM members WHERE id = $1 FOR UPDATE`,
    [targetId],
  );
  if (!cur.rows.length) return { status: 404, error: 'Member not found' };
  const m = cur.rows[0];

  switch (change.permission) {
    case 'tier': {
      await tx.query(`UPDATE members SET tier = $1 WHERE id = $2`, [change.value, targetId]);
      return { status: 200, before: m.tier, after: change.value };
    }

    case 'role': {
      const before = m.roles ?? [];
      const has = before.includes(change.role);
      const after = change.grant
        ? has ? before : [...before, change.role]
        : before.filter((r) => r !== change.role);
      await tx.query(`UPDATE members SET roles = $1::text[] WHERE id = $2`, [after, targetId]);
      return { status: 200, before, after };
    }

    case 'admin_level': {
      const oldRole = m.admin_role;
      const newRole = change.value;
      const losesOwner = oldRole !== null && OWNER_ROLES.includes(oldRole) && (newRole === null || !OWNER_ROLES.includes(newRole));
      const losesFounder = oldRole === 'founder' && newRole !== 'founder';

      // Owners cannot remove their own owner standing through this view.
      if (targetId === actorId && (losesFounder || losesOwner)) {
        return {
          status: 409,
          error: 'You cannot remove your own owner standing here. Another owner must make that change.',
        };
      }
      // Never leave the platform with zero founders.
      if (losesFounder) {
        const founders = await tx.query<{ n: string }>(
          `SELECT COUNT(*)::text AS n FROM members WHERE admin_role = 'founder'`,
        );
        if (parseInt(founders.rows[0].n, 10) <= 1) {
          return {
            status: 409,
            error: 'Cannot remove the last founder — the platform must retain at least one founder.',
          };
        }
      }
      await tx.query(`UPDATE members SET admin_role = $1 WHERE id = $2`, [newRole, targetId]);
      // Keep the existing admin-role ledger complete as well.
      await tx.query(
        `INSERT INTO admin_role_grants (actor_id, actor_via, target_id, old_role, new_role)
         VALUES ($1, 'member', $2, $3, $4)`,
        [actorId, targetId, oldRole, newRole],
      );
      return { status: 200, before: oldRole, after: newRole };
    }

    case 'writers_studio': {
      const rows = await tx.query<{ id: string; pipeline_stage: string; flag: boolean | null }>(
        `SELECT id, pipeline_stage, (metadata->>'writers_studio_beta')::boolean AS flag
           FROM ops_contacts
          WHERE member_id = $1 AND contact_type = 'beta_tester' AND deleted_at IS NULL
          ORDER BY updated_at DESC
          FOR UPDATE`,
        [targetId],
      );
      const before = rows.rows.map((r) => ({ contactId: r.id, stage: r.pipeline_stage, writersStudio: r.flag === true }));

      if (change.grant) {
        if (rows.rows.length) {
          // Update the most recent row: flag on, stage active. Other metadata kept.
          const row = rows.rows[0];
          await tx.query(
            `UPDATE ops_contacts
                SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"writers_studio_beta": true}'::jsonb,
                    pipeline_stage = 'active'
              WHERE id = $1`,
            [row.id],
          );
          return { status: 200, before, after: { contactId: row.id, stage: 'active', writersStudio: true } };
        }
        const ins = await tx.query<{ id: string }>(
          `INSERT INTO ops_contacts (name, email, contact_type, pipeline_stage, source, member_id, metadata)
           VALUES ($1, $2, 'beta_tester', 'active', 'platform', $3, '{"writers_studio_beta": true}'::jsonb)
           RETURNING id`,
          [m.name || m.username || 'Member', m.email, targetId],
        );
        return { status: 200, before, after: { contactId: ins.rows[0].id, stage: 'active', writersStudio: true, created: true } };
      }

      // Removal: flag false on every matching row. Rows are never deleted; stage untouched.
      if (rows.rows.length) {
        await tx.query(
          `UPDATE ops_contacts
              SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"writers_studio_beta": false}'::jsonb
            WHERE id = ANY($1::uuid[])`,
          [rows.rows.map((r) => r.id)],
        );
      }
      return {
        status: 200,
        before,
        after: rows.rows.map((r) => ({ contactId: r.id, stage: r.pipeline_stage, writersStudio: false })),
      };
    }
  }
}

/** Audit record: who, what, before and after. Written in the same transaction as the change. */
export async function writeAudit(
  tx: TransactionClient,
  req: NextRequest,
  actorId: string,
  targetId: string,
  change: PermissionChange,
  before: unknown,
  after: unknown,
): Promise<void> {
  const rawIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? '';
  const ip = isIP(rawIp) ? rawIp : null;
  await tx.query(
    `INSERT INTO audit_logs (
       user_id, action_type, resource_type, resource_id, ip_address, user_agent,
       action_result, metadata, phi_accessed, consent_verified
     ) VALUES ($1, $2, 'member', $3, $4::inet, $5, 'success', $6, false, NULL)`,
    [
      actorId,
      AUDIT_ACTION,
      targetId,
      ip,
      req.headers.get('user-agent'),
      JSON.stringify({ change, before, after }),
    ],
  );
}

// ---------------------------------------------------------------------------
// Read-only environment allowlists (shown, never edited here)
// ---------------------------------------------------------------------------

export const ENV_ALLOWLISTS: { key: string; label: string }[] = [
  { key: 'FOUNDER_MEMBER_IDS', label: 'Founder console (env)' },
  { key: 'LAB_ACCESS_MEMBER_IDS', label: 'Lab Tools (env)' },
  { key: 'EARLY_FIELD_MEMBER_IDS', label: 'Early Field (env)' },
  { key: 'CIRCLE_ACCESS_MEMBER_IDS', label: 'Circles (env)' },
  { key: 'PRO_STUDIO_REFLECT_BETA_MEMBER_IDS', label: 'Pro Studio Reflect beta (env)' },
];

export function envAllowlistLabels(memberId: string, env: NodeJS.ProcessEnv = process.env): string[] {
  const id = memberId.toLowerCase();
  return ENV_ALLOWLISTS.filter(({ key }) =>
    (env[key] ?? '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
      .includes(id),
  ).map(({ label }) => label);
}
