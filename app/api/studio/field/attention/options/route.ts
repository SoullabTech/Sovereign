export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * FIELD ATTENTION OPTIONS — the member's open Changes & Decisions, offered for the
 * "pull in…" picker on the home's curated fields. This is an OFFER, not a placement:
 * nothing is curated until the member chooses. No ranking — recency only. Scope
 * mirrors field_notes (personal = team_id NULL; co-lab = team_id set).
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { hasTeamRole } from '@/lib/auth/teamPermissions';

function scopeFor(teamId: string | null, includePersonal: boolean): { clause: string; params: string[] } {
  if (!teamId) return { clause: 'AND team_id IS NULL', params: [] };
  return includePersonal
    ? { clause: 'AND (team_id = $2 OR team_id IS NULL)', params: [teamId] }
    : { clause: 'AND team_id = $2', params: [teamId] };
}

export async function GET(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { practitionerId } = identity;

    const teamId = request.nextUrl.searchParams.get('teamId') || null;
    // Options are previews of objects that may be placed into a team Field.
    // A guessed or former team ID is never display authority.
    if (teamId && (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(teamId) ||
        !(await hasTeamRole(identity.memberId, teamId, 'viewer')))) {
      return NextResponse.json({ error: 'Team not found' }, { status: 403 });
    }
    const includePersonal = request.nextUrl.searchParams.get('includePersonal') !== 'false';
    const scope = scopeFor(teamId, includePersonal);

    const [changesResult, decisionsResult] = await Promise.all([
      db.query(
        `SELECT id, title, status FROM studio_changes
          WHERE practitioner_id = $1 ${scope.clause}
            AND ($2::uuid IS NULL OR EXISTS (
              SELECT 1 FROM studio_team_members membership
               WHERE membership.team_id = $2::uuid
                 AND membership.member_id = $3::uuid
                 AND membership.role IN ('owner','admin','member','viewer')
            ))
            AND client_id IS NULL
            AND (member_id IS NULL OR member_id = $3::uuid)
            AND status IN ('naming','casting','consulting','active')
            AND length(btrim(coalesce(title,''))) > 0
          ORDER BY created_at DESC LIMIT 50`,
        [practitionerId, teamId, identity.memberId],
      ),
      db.query(
        `SELECT id, title, status FROM studio_decisions
          WHERE practitioner_id = $1 ${scope.clause}
            AND ($2::uuid IS NULL OR EXISTS (
              SELECT 1 FROM studio_team_members membership
               WHERE membership.team_id = $2::uuid
                 AND membership.member_id = $3::uuid
                 AND membership.role IN ('owner','admin','member','viewer')
            ))
            AND decision_scope IN ('practice','team')
            AND client_id IS NULL
            AND status IN ('draft','consulting','active')
            AND length(btrim(coalesce(title,''))) > 0
          ORDER BY created_at DESC LIMIT 50`,
        [practitionerId, teamId, identity.memberId],
      ),
    ]);

    return NextResponse.json({
      changes: changesResult.rows.map((r) => ({ id: r.id, title: r.title, status: r.status })),
      decisions: decisionsResult.rows.map((r) => ({ id: r.id, title: r.title, status: r.status })),
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    console.error('[Field Attention Options] Read unavailable', { failureKind: 'query_failed' });
    return NextResponse.json(
      { error: 'Field options temporarily unavailable' },
      { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
    );
  }
}
