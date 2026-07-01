export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { resolveCurrentTeamId, COLAB_TEAM_COOKIE } from '@/lib/team/colabTeams';
import { randomUUID } from 'crypto';

async function resolveTeam(memberId: string, request: NextRequest): Promise<string | null> {
  const jar = await cookies();
  const cookieTeam = jar.get(COLAB_TEAM_COOKIE)?.value
    ?? request.headers.get('x-colab-team-id')
    ?? null;
  return resolveCurrentTeamId(memberId, cookieTeam);
}

export async function GET(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const teamId = await resolveTeam(identity.memberId, request);
    if (!teamId) return NextResponse.json({ encounters: [] });

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');

    const params: unknown[] = [teamId, limit, offset];
    let statusClause = '';
    if (status) {
      params.push(status);
      statusClause = `AND e.status = $${params.length}`;
    }

    const result = await db.query(
      `SELECT
         e.id, e.practitioner_id, e.session_id, e.title, e.status,
         e.encounter_type, e.started_at, e.ended_at, e.duration_seconds,
         e.audio_filename, e.transcription_status,
         e.created_at, e.updated_at,
         COUNT(ep.id)::int AS participant_count
       FROM encounters e
       LEFT JOIN encounter_participants ep ON ep.encounter_id = e.id
       WHERE e.team_id = $1
       ${statusClause}
       GROUP BY e.id
       ORDER BY e.created_at DESC
       LIMIT $2 OFFSET $3`,
      params
    );

    return NextResponse.json({ encounters: result.rows, teamId });
  } catch (error) {
    console.error('[Encounters] GET error:', error);
    return NextResponse.json({ error: 'Failed to list encounters' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { practitionerId, memberId } = identity;

    const teamId = await resolveTeam(memberId, request);
    if (!teamId) {
      return NextResponse.json({ error: 'No active Co-Lab. Select a workspace before creating an encounter.' }, { status: 400 });
    }

    const body = await request.json();
    const { title, session_id, encounter_type, participants } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    const encounterId = randomUUID();
    const resolvedType = typeof encounter_type === 'string' && encounter_type.trim()
      ? encounter_type.trim()
      : 'therapy_session';

    await db.query(
      `INSERT INTO encounters (id, practitioner_id, team_id, session_id, title, encounter_type)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [encounterId, practitionerId, teamId, session_id ?? null, title.trim(), resolvedType]
    );

    if (Array.isArray(participants) && participants.length > 0) {
      for (const p of participants) {
        await db.query(
          `INSERT INTO encounter_participants (id, encounter_id, person_id, display_name, role, member_id)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [randomUUID(), encounterId, p.person_id ?? null, p.display_name ?? 'Unknown', p.role ?? 'client', p.member_id ?? null]
        );
      }
    }

    const row = await db.query(`SELECT * FROM encounters WHERE id = $1`, [encounterId]);
    return NextResponse.json({ encounter: row.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('[Encounters] POST error:', error);
    return NextResponse.json({ error: 'Failed to create encounter' }, { status: 500 });
  }
}
