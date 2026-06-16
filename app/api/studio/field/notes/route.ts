export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * FIELD NOTES — POST (place an authored attention)
 *
 * A Field Note is the person authoring their own field: a small note placed into
 * one of the four orientation questions (alive / asking / emerging / tending).
 * The Personal Field is both derived (studio_changes / studio_decisions) and
 * authored (here). Placement IS the act of authorship.
 *
 * Deliberately minimal — no status, owner, due date, or completion. If a thing
 * needs those it is a task, not a Field Note (see the redesign spec's test).
 *
 * Scope mirrors the pulse route: personal = team_id NULL; co-lab = team_id set.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';

const SECTIONS = new Set(['alive', 'asking', 'emerging', 'tending']);
const MAX_BODY = 2000;

export async function POST(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { practitionerId } = identity;

    const payload = await request.json().catch(() => null);
    const section = typeof payload?.section === 'string' ? payload.section : '';
    const body = typeof payload?.body === 'string' ? payload.body.trim() : '';
    const teamId =
      typeof payload?.teamId === 'string' && payload.teamId ? payload.teamId : null;

    if (!SECTIONS.has(section)) {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
    }
    if (!body) {
      return NextResponse.json({ error: 'Note is empty' }, { status: 400 });
    }
    if (body.length > MAX_BODY) {
      return NextResponse.json({ error: 'Note is too long' }, { status: 400 });
    }

    const result = await db.query(
      `INSERT INTO field_notes (practitioner_id, team_id, section, body)
       VALUES ($1, $2, $3, $4)
       RETURNING id, section, body, created_at`,
      [practitionerId, teamId, section, body],
    );

    const row = result.rows[0];
    return NextResponse.json(
      { id: row.id, section: row.section, body: row.body, createdAt: row.created_at },
      { status: 201 },
    );
  } catch (error) {
    console.error('[Field Notes] POST error:', error);
    return NextResponse.json({ error: 'Failed to place note' }, { status: 500 });
  }
}
