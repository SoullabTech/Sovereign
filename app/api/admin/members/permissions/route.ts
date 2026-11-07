/**
 * Member permissions — owner-only.
 *
 * GET  /api/admin/members/permissions
 *   Every member with every per-member permission: tier, roles, admin level,
 *   Writer's Studio access (editable), plus read-only Field Lab tester,
 *   practitioner, team roles and env allowlist membership.
 *
 * POST /api/admin/members/permissions
 *   Body: { memberId, permission: 'tier', value }
 *       | { memberId, permission: 'role', role, grant }
 *       | { memberId, permission: 'admin_level', value | null }
 *       | { memberId, permission: 'writers_studio', grant }
 *
 * AUTHORITY: signed-in owner (founder/cto) only; the shared admin password is
 * refused (403) so every change names a person. Every change writes an
 * audit_logs row (who, what, before, after) in the same transaction.
 * Platform stewardship only — no conversation or relationship content is read.
 *
 * Design note: docs/programme/ADMIN_MEMBER_PERMISSIONS_CENSUS_2026-11-07.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db/postgres';
import {
  applyChange,
  envAllowlistLabels,
  parseChange,
  requireSignedInOwner,
  writeAudit,
} from '@/lib/admin/memberPermissions';

export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  const owner = await requireSignedInOwner(req);
  if (!owner.ok) return owner.response;

  try {
    const result = await query<{
      id: string;
      name: string | null;
      username: string | null;
      email: string | null;
      tier: string | null;
      roles: string[] | null;
      admin_role: string | null;
      tester: boolean | null;
      is_practitioner: boolean | null;
      ws_beta: boolean;
      ws_contact: boolean;
      teams: string[] | null;
    }>(
      `SELECT m.id, m.name, m.username, m.email, m.tier, m.roles, m.admin_role,
              m.tester, m.is_practitioner,
              EXISTS (
                SELECT 1 FROM ops_contacts c
                 WHERE c.member_id = m.id AND c.deleted_at IS NULL
                   AND c.contact_type = 'beta_tester' AND c.pipeline_stage = 'active'
                   AND c.metadata @> '{"writers_studio_beta": true}'::jsonb
              ) AS ws_beta,
              EXISTS (
                SELECT 1 FROM ops_contacts c
                 WHERE c.member_id = m.id AND c.deleted_at IS NULL AND c.contact_type = 'beta_tester'
              ) AS ws_contact,
              (SELECT array_agg(t.name || ' (' || tm.role || ')' ORDER BY t.name)
                 FROM studio_team_members tm JOIN studio_teams t ON t.id = tm.team_id
                WHERE tm.member_id = m.id) AS teams
         FROM members m
        ORDER BY (m.admin_role IS NULL), m.name NULLS LAST, m.username NULLS LAST`,
    );

    const members = result.rows.map((r) => ({
      id: r.id,
      name: r.name,
      username: r.username,
      email: r.email,
      tier: r.tier ?? 'free',
      roles: r.roles ?? [],
      adminLevel: r.admin_role,
      writersStudio: {
        // Admission as the Writer's Studio gate computes it.
        admitted: r.ws_beta || r.admin_role === 'founder' || r.admin_role === 'cto',
        viaRoster: r.ws_beta,
        viaOwnerLevel: r.admin_role === 'founder' || r.admin_role === 'cto',
        hasRosterRow: r.ws_contact,
      },
      readOnly: {
        fieldLabTester: r.tester === true,
        practitioner: r.is_practitioner === true,
        teams: r.teams ?? [],
        envAllowlists: envAllowlistLabels(r.id),
      },
    }));

    return NextResponse.json({ members, viewerId: owner.actorId, viewerRole: owner.actorRole });
  } catch (err) {
    console.error('[admin/members/permissions] read error:', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const owner = await requireSignedInOwner(req);
  if (!owner.ok) return owner.response;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const memberId = body?.memberId;
  if (typeof memberId !== 'string' || !UUID.test(memberId)) {
    return NextResponse.json({ error: 'memberId must be a member UUID' }, { status: 400 });
  }
  const parsed = parseChange(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const change = parsed.change;

  try {
    const outcome = await transaction(async (tx) => {
      const result = await applyChange(tx, owner.actorId, memberId, change);
      if (result.status === 200) {
        await writeAudit(tx, req, owner.actorId, memberId, change, result.before, result.after);
      }
      return result;
    });

    if (outcome.status !== 200) {
      return NextResponse.json({ error: outcome.error }, { status: outcome.status });
    }

    console.log(
      `[admin/members/permissions] ${change.permission} changed for ${memberId} by ${owner.actorId}`,
    );
    return NextResponse.json({ ok: true, memberId, change, before: outcome.before, after: outcome.after });
  } catch (err) {
    console.error('[admin/members/permissions] write error:', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
