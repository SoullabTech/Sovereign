export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * FIELD PEOPLE — people the person is tending (People panel).
 * Person-authored: YOU name who you tend. The system never infers "who keeps
 * returning" (that would be the system authoring your relationships). Scope mirrors field_notes.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';

const MAX_NAME = 120;
const MAX_NOTE = 500;

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
    const result = await db.query(
      `SELECT id, name, note FROM field_people
        WHERE practitioner_id = $1 ${scope.clause}
        ORDER BY created_at DESC
        LIMIT 50`,
      [practitionerId, ...scope.params],
    );
    return NextResponse.json({ people: result.rows });
  } catch (error) {
    console.warn('[Field People] GET error (table pending?):', error instanceof Error ? error.message : error);
    return NextResponse.json({ people: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { practitionerId } = identity;
    const payload = await request.json().catch(() => null);
    const name = typeof payload?.name === 'string' ? payload.name.trim() : '';
    const note = typeof payload?.note === 'string' ? payload.note.trim() : '';
    const teamId = typeof payload?.teamId === 'string' && payload.teamId ? payload.teamId : null;
    if (!name) return NextResponse.json({ error: 'Name is empty' }, { status: 400 });
    if (name.length > MAX_NAME) return NextResponse.json({ error: 'Name is too long' }, { status: 400 });
    if (note.length > MAX_NOTE) return NextResponse.json({ error: 'Note is too long' }, { status: 400 });
    const result = await db.query(
      `INSERT INTO field_people (practitioner_id, team_id, name, note)
       VALUES ($1, $2, $3, $4) RETURNING id, name, note`,
      [practitionerId, teamId, name, note || null],
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('[Field People] POST error:', error);
    return NextResponse.json({ error: 'Failed to add person' }, { status: 500 });
  }
}
