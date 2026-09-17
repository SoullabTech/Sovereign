export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { transaction } from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { randomUUID } from 'crypto';
import {
  decryptTranscriptRow,
  decryptTurnRows,
  decryptMomentRow,
  decryptReflectionRow,
} from '@/lib/security/phiAccessors/encounterTranscripts';

type Params = { params: Promise<{ id: string }> };

async function resolveEncounter(encounterId: string, practitionerId: string) {
  const result = await db.query(
    `SELECT * FROM encounters WHERE id = $1 AND practitioner_id = $2`,
    [encounterId, practitionerId]
  );
  return result.rows[0] ?? null;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { practitionerId } = identity;
    const { id } = await params;

    const encounter = await resolveEncounter(id, practitionerId);
    if (!encounter) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const [participantsRes, transcriptRes, momentsRes, reflectionsRes] = await Promise.all([
      db.query(
        `SELECT * FROM encounter_participants
          WHERE encounter_id = $1 AND team_id = $2
          ORDER BY created_at`,
        [id, encounter.team_id]
      ),
      db.query(`SELECT * FROM encounter_transcripts WHERE encounter_id = $1`, [id]),
      db.query(`SELECT * FROM encounter_moments WHERE encounter_id = $1 ORDER BY start_ms, created_at`, [id]),
      db.query(`SELECT * FROM encounter_reflections WHERE encounter_id = $1 ORDER BY created_at`, [id]),
    ]);

    let transcript = null;
    let turns: unknown[] = [];
    if (transcriptRes.rows[0]) {
      transcript = decryptTranscriptRow(transcriptRes.rows[0], id);
      const turnsRes = await db.query(
        `SELECT * FROM transcript_turns WHERE transcript_id = $1 ORDER BY turn_index`,
        [transcriptRes.rows[0].id]
      );
      turns = decryptTurnRows(turnsRes.rows, id);
    }

    return NextResponse.json({
      encounter,
      participants: participantsRes.rows,
      transcript,
      turns,
      moments: momentsRes.rows.map((m) => decryptMomentRow(m, id)),
      reflections: reflectionsRes.rows.map((r) => decryptReflectionRow(r, id)),
    });
  } catch (error) {
    console.error('[Encounter] GET error:', error);
    return NextResponse.json({ error: 'Failed to load encounter' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { practitionerId } = identity;
    const { id } = await params;

    const encounter = await resolveEncounter(id, practitionerId);
    if (!encounter) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, status, participants } = body;

    const updates: string[] = [];
    const values: unknown[] = [];

    if (title !== undefined) {
      values.push(title);
      updates.push(`title = $${values.length}`);
    }
    if (status !== undefined) {
      values.push(status);
      updates.push(`status = $${values.length}`);
    }

    const participantRows = Array.isArray(participants) ? participants : null;
    const personIds = participantRows
      ? [...new Set(
          participantRows.map((p: any) => p?.person_id)
            .filter((personId: unknown): personId is string => typeof personId === 'string')
        )]
      : [];

    const mutation = await transaction(async (client) => {
      if (personIds.length > 0) {
        const people = await client.query(
          `SELECT id FROM studio_people WHERE id = ANY($1::uuid[]) AND team_id = $2`,
          [personIds, encounter.team_id]
        );
        if (people.rows.length !== personIds.length) return { error: 'Participant not found' as const };
      }

      if (updates.length > 0) {
        const scopedValues = [...values, id, practitionerId, encounter.team_id];
        await client.query(
          `UPDATE encounters
              SET ${updates.join(', ')}, updated_at = NOW()
            WHERE id = $${values.length + 1}
              AND practitioner_id = $${values.length + 2}
              AND team_id = $${values.length + 3}`,
          scopedValues
        );
      }

      if (participantRows) {
        await client.query(
          `DELETE FROM encounter_participants WHERE encounter_id = $1 AND team_id = $2`,
          [id, encounter.team_id]
        );
        for (const p of participantRows) {
          await client.query(
            `INSERT INTO encounter_participants
               (id, encounter_id, team_id, person_id, display_name, role, member_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              randomUUID(), id, encounter.team_id, p.person_id ?? null,
              p.display_name ?? 'Unknown', p.role ?? 'client', p.member_id ?? null,
            ]
          );
        }
      }
      return { ok: true as const };
    });

    if ('error' in mutation) {
      return NextResponse.json({ error: mutation.error }, { status: 404 });
    }

    const updated = await db.query(
      `SELECT * FROM encounters WHERE id = $1 AND practitioner_id = $2 AND team_id = $3`,
      [id, practitionerId, encounter.team_id]
    );
    return NextResponse.json({ encounter: updated.rows[0] });
  } catch (error) {
    console.error('[Encounter] PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update encounter' }, { status: 500 });
  }
}
