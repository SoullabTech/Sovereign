export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO SESSIONS API — the canonical facilitation Session (ADR-006).
 *
 * Studio is the facilitation layer; the meeting provider (Teams/Zoom/Meet/Jitsi) is a
 * swappable service UNDER the Session. A studio_session is practitioner-owned, owns its
 * Resources (see ./[id]/resources), references a provider, and bridges to existing facets
 * (booking/rl/group/scribe/practitioner sessions) without collapsing them.
 *
 *   GET    ?id=…         → one session + its resources;  (no id) → list
 *   POST                 → create a facilitation session
 *   PATCH  { id, … }     → update (status, schedule, provider, notes, bridges)
 *   DELETE ?id=…         → archive (soft)
 *
 * New facilitation capability attaches HERE; legacy tables stay facets unless bridged.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { randomUUID } from 'crypto';

const VALID_STATUS = ['draft', 'scheduled', 'live', 'completed', 'cancelled', 'archived'] as const;
const VALID_STATUS_SET = new Set<string>(VALID_STATUS);

// Mirrors the meeting_provider enum (20260407000001_trust_layer_phase1 / 20260627000003).
const VALID_PROVIDERS = ['none', 'livekit', 'jitsi', 'zoom', 'google_meet', 'proton_meet', 'microsoft_teams', 'custom'] as const;
const VALID_PROVIDER_SET = new Set<string>(VALID_PROVIDERS);

const SESSION_COLUMNS = `
  id, practitioner_id, title, status, scheduled_at,
  meeting_provider, meeting_url, meeting_id, notes,
  booking_session_id, rl_session_id, group_session_id, scribe_session_id, practitioner_session_id,
  created_at, updated_at
`;

function shapeSession(row: any) {
  return {
    sessionId: row.id,
    title: row.title,
    status: row.status,
    scheduledAt: row.scheduled_at,
    provider: { name: row.meeting_provider, url: row.meeting_url, meetingId: row.meeting_id },
    notes: row.notes,
    bridges: {
      booking: row.booking_session_id,
      rl: row.rl_session_id,
      group: row.group_session_id,
      scribe: row.scribe_session_id,
      practitioner: row.practitioner_session_id,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Maps an optional camelCase bridge input to its column. Returns [column, value] pairs.
const BRIDGE_FIELDS: Array<[string, string]> = [
  ['bookingSessionId', 'booking_session_id'],
  ['rlSessionId', 'rl_session_id'],
  ['groupSessionId', 'group_session_id'],
  ['scribeSessionId', 'scribe_session_id'],
  ['practitionerSessionId', 'practitioner_session_id'],
];

export async function GET(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized or not a practitioner' }, { status: 401 });
    }
    const { practitionerId } = identity;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const sessionRes = await db.query(
        `SELECT ${SESSION_COLUMNS} FROM studio_sessions WHERE id = $1 AND practitioner_id = $2`,
        [id, practitionerId]
      );
      if (sessionRes.rows.length === 0) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
      const resources = await db.query(
        `SELECT id, media_project_id, external_url, resource_kind, title, sort_order, visibility, created_at
         FROM studio_session_resources WHERE studio_session_id = $1 ORDER BY sort_order, created_at`,
        [id]
      );
      return NextResponse.json({
        session: shapeSession(sessionRes.rows[0]),
        resources: resources.rows.map(shapeResource),
      });
    }

    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200);
    let sql = `SELECT ${SESSION_COLUMNS} FROM studio_sessions WHERE practitioner_id = $1`;
    const params: (string | number)[] = [practitionerId];
    if (status && VALID_STATUS_SET.has(status)) {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }
    params.push(limit);
    sql += ` ORDER BY scheduled_at DESC NULLS LAST, created_at DESC LIMIT $${params.length}`;
    const result = await db.query(sql, params);
    return NextResponse.json({ sessions: result.rows.map(shapeSession) });
  } catch (error) {
    console.error('[Studio Sessions] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized or not a practitioner' }, { status: 401 });
    }
    const { practitionerId } = identity;
    const body = await request.json();

    const status = body.status ?? 'draft';
    if (!VALID_STATUS_SET.has(String(status))) {
      return NextResponse.json({ error: `status must be one of: ${VALID_STATUS.join(', ')}` }, { status: 400 });
    }
    const provider = body.meetingProvider ?? 'none';
    if (!VALID_PROVIDER_SET.has(String(provider))) {
      return NextResponse.json({ error: `meetingProvider must be one of: ${VALID_PROVIDERS.join(', ')}` }, { status: 400 });
    }

    const id = randomUUID();
    const columns = ['id', 'practitioner_id', 'title', 'status', 'scheduled_at', 'meeting_provider', 'meeting_url', 'meeting_id', 'notes'];
    const values: (string | null)[] = [
      id, practitionerId,
      typeof body.title === 'string' && body.title.trim() ? body.title.trim() : null,
      status,
      body.scheduledAt || null,
      provider,
      typeof body.meetingUrl === 'string' && body.meetingUrl.trim() ? body.meetingUrl.trim() : null,
      typeof body.meetingId === 'string' && body.meetingId.trim() ? body.meetingId.trim() : null,
      typeof body.notes === 'string' && body.notes.trim() ? body.notes.trim() : null,
    ];
    for (const [inKey, col] of BRIDGE_FIELDS) {
      if (body[inKey]) { columns.push(col); values.push(String(body[inKey])); }
    }
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const result = await db.query(
      `INSERT INTO studio_sessions (${columns.join(', ')}) VALUES (${placeholders}) RETURNING ${SESSION_COLUMNS}`,
      values
    );
    return NextResponse.json({ session: shapeSession(result.rows[0]) });
  } catch (error) {
    console.error('[Studio Sessions] POST error:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized or not a practitioner' }, { status: 401 });
    }
    const { practitionerId } = identity;
    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: 'Session id is required' }, { status: 400 });
    }

    const updateFields: string[] = [];
    const params: (string | null)[] = [id, practitionerId];

    if (body.title !== undefined) {
      updateFields.push(`title = $${params.length + 1}`);
      params.push(typeof body.title === 'string' && body.title.trim() ? body.title.trim() : null);
    }
    if (body.status !== undefined) {
      if (!VALID_STATUS_SET.has(String(body.status))) {
        return NextResponse.json({ error: `status must be one of: ${VALID_STATUS.join(', ')}` }, { status: 400 });
      }
      updateFields.push(`status = $${params.length + 1}`);
      params.push(body.status);
    }
    if (body.scheduledAt !== undefined) {
      updateFields.push(`scheduled_at = $${params.length + 1}`);
      params.push(body.scheduledAt || null);
    }
    if (body.meetingProvider !== undefined) {
      if (!VALID_PROVIDER_SET.has(String(body.meetingProvider))) {
        return NextResponse.json({ error: `meetingProvider must be one of: ${VALID_PROVIDERS.join(', ')}` }, { status: 400 });
      }
      updateFields.push(`meeting_provider = $${params.length + 1}`);
      params.push(body.meetingProvider);
    }
    if (body.meetingUrl !== undefined) {
      updateFields.push(`meeting_url = $${params.length + 1}`);
      params.push(typeof body.meetingUrl === 'string' && body.meetingUrl.trim() ? body.meetingUrl.trim() : null);
    }
    if (body.meetingId !== undefined) {
      updateFields.push(`meeting_id = $${params.length + 1}`);
      params.push(typeof body.meetingId === 'string' && body.meetingId.trim() ? body.meetingId.trim() : null);
    }
    if (body.notes !== undefined) {
      updateFields.push(`notes = $${params.length + 1}`);
      params.push(typeof body.notes === 'string' && body.notes.trim() ? body.notes.trim() : null);
    }
    for (const [inKey, col] of BRIDGE_FIELDS) {
      if (body[inKey] !== undefined) {
        updateFields.push(`${col} = $${params.length + 1}`);
        params.push(body[inKey] ? String(body[inKey]) : null);
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }
    updateFields.push(`updated_at = NOW()`);

    const result = await db.query(
      `UPDATE studio_sessions SET ${updateFields.join(', ')}
       WHERE id = $1 AND practitioner_id = $2 RETURNING ${SESSION_COLUMNS}`,
      params
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    return NextResponse.json({ session: shapeSession(result.rows[0]) });
  } catch (error) {
    console.error('[Studio Sessions] PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized or not a practitioner' }, { status: 401 });
    }
    const { practitionerId } = identity;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Session id is required' }, { status: 400 });
    }
    // Soft archive (consistent with the clients route). Resources cascade only on hard delete.
    const result = await db.query(
      `UPDATE studio_sessions SET status = 'archived', updated_at = NOW()
       WHERE id = $1 AND practitioner_id = $2 RETURNING id`,
      [id, practitionerId]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Studio Sessions] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to archive session' }, { status: 500 });
  }
}

// Resource shaper for the single-session GET above.
function shapeResource(row: any) {
  return {
    id: row.id,
    mediaProjectId: row.media_project_id,
    externalUrl: row.external_url,
    resourceKind: row.resource_kind,
    title: row.title,
    sortOrder: row.sort_order,
    visibility: row.visibility,
    createdAt: row.created_at,
  };
}
