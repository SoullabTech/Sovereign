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
    const includePersonal = request.nextUrl.searchParams.get('includePersonal') !== 'false';
    const scope = scopeFor(teamId, includePersonal);

    const [changesResult, decisionsResult] = await Promise.all([
      db.query(
        `SELECT id, title, status FROM studio_changes
          WHERE practitioner_id = $1 ${scope.clause}
            AND status IN ('naming','casting','consulting','active')
            AND length(btrim(coalesce(title,''))) > 0
          ORDER BY created_at DESC LIMIT 50`,
        [practitionerId, ...scope.params],
      ),
      db.query(
        `SELECT id, title, status FROM studio_decisions
          WHERE practitioner_id = $1 ${scope.clause}
            AND status IN ('draft','consulting','active')
            AND length(btrim(coalesce(title,''))) > 0
          ORDER BY created_at DESC LIMIT 50`,
        [practitionerId, ...scope.params],
      ),
    ]);

    return NextResponse.json({
      changes: changesResult.rows.map((r) => ({ id: r.id, title: r.title, status: r.status })),
      decisions: decisionsResult.rows.map((r) => ({ id: r.id, title: r.title, status: r.status })),
    });
  } catch (error) {
    console.warn('[Field Attention Options] GET failed:', error instanceof Error ? error.message : error);
    return NextResponse.json({ changes: [], decisions: [] });
  }
}
