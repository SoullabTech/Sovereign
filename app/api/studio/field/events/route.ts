export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * FIELD EVENTS — the person's day calendar (Today panel).
 * Person-authored: you add your own day's events. The system never schedules/infers.
 * GET returns TODAY's events (server day), soonest first. Scope mirrors field_notes.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';

const MAX_TITLE = 200;

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
      `SELECT id, title, event_at
         FROM field_events
        WHERE practitioner_id = $1 ${scope.clause}
          AND event_at >= date_trunc('day', now())
          AND event_at <  date_trunc('day', now()) + interval '1 day'
        ORDER BY event_at ASC
        LIMIT 50`,
      [practitionerId, ...scope.params],
    );
    return NextResponse.json({ events: result.rows });
  } catch (error) {
    // Orientation surface — fail quiet (e.g. table not migrated yet).
    console.warn('[Field Events] GET error (table pending?):', error instanceof Error ? error.message : error);
    return NextResponse.json({ events: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { practitionerId } = identity;
    const payload = await request.json().catch(() => null);
    const title = typeof payload?.title === 'string' ? payload.title.trim() : '';
    const eventAt = typeof payload?.eventAt === 'string' ? payload.eventAt : '';
    const teamId = typeof payload?.teamId === 'string' && payload.teamId ? payload.teamId : null;
    if (!title) return NextResponse.json({ error: 'Title is empty' }, { status: 400 });
    if (title.length > MAX_TITLE) return NextResponse.json({ error: 'Title is too long' }, { status: 400 });
    const when = new Date(eventAt);
    if (!eventAt || isNaN(when.getTime())) return NextResponse.json({ error: 'Invalid time' }, { status: 400 });
    const result = await db.query(
      `INSERT INTO field_events (practitioner_id, team_id, title, event_at)
       VALUES ($1, $2, $3, $4) RETURNING id, title, event_at`,
      [practitionerId, teamId, title, when.toISOString()],
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('[Field Events] POST error:', error);
    return NextResponse.json({ error: 'Failed to add event' }, { status: 500 });
  }
}
