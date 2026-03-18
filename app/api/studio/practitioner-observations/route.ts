export const dynamic = 'force-dynamic';

/**
 * Practitioner Observations API
 *
 * GET  — list observations for a decision or change
 * POST — create a new observation
 *
 * Observations are distinct from general notes: they are named, typed,
 * second-person events. "Client interrupted twice during emotionally charged material."
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import type { PractitionerObservation } from '@/lib/studio/practitioner/types';

function rowToObs(row: Record<string, unknown>): PractitionerObservation {
  return {
    id: row.id as string,
    decisionId: row.decision_id as string | null,
    changeId: row.change_id as string | null,
    studioSessionId: row.studio_session_id as string | null,
    practitionerId: row.practitioner_id as string,
    clientId: row.client_id as string | null,
    observationType: row.observation_type as PractitionerObservation['observationType'],
    content: row.content as string,
    tags: (row.tags as string[]) || [],
    createdAt: row.created_at as string,
  };
}

export async function GET(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { practitionerId } = identity;
    const { searchParams } = new URL(request.url);
    const decisionId = searchParams.get('decisionId');
    const changeId = searchParams.get('changeId');
    const clientId = searchParams.get('clientId');

    const conditions: string[] = ['practitioner_id = $1'];
    const values: unknown[] = [practitionerId];
    let idx = 2;

    if (decisionId) { conditions.push(`decision_id = $${idx++}`); values.push(decisionId); }
    if (changeId)   { conditions.push(`change_id = $${idx++}`);   values.push(changeId); }
    if (clientId)   { conditions.push(`client_id = $${idx++}`);   values.push(clientId); }

    const result = await db.query(
      `SELECT * FROM studio_practitioner_observations WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
      values
    );

    return NextResponse.json({ observations: result.rows.map(rowToObs) });
  } catch (error) {
    console.error('[Practitioner Observations] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch observations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { practitionerId } = identity;
    const body = await request.json();

    const {
      decisionId = null,
      changeId = null,
      studioSessionId = null,
      clientId = null,
      observationType,
      content,
      tags = [],
    } = body;

    if (!observationType || !content?.trim()) {
      return NextResponse.json({ error: 'observationType and content are required' }, { status: 400 });
    }

    const VALID_TYPES = ['in_session', 'relational_field', 'somatic_shift', 'pattern_notice', 'interruption', 'repair', 'other'];
    if (!VALID_TYPES.includes(observationType)) {
      return NextResponse.json({ error: 'Invalid observationType' }, { status: 400 });
    }

    const result = await db.query(
      `INSERT INTO studio_practitioner_observations
        (decision_id, change_id, studio_session_id, practitioner_id, client_id,
         observation_type, content, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [decisionId, changeId, studioSessionId, practitionerId, clientId,
       observationType, content.trim(), tags]
    );

    return NextResponse.json({ observation: rowToObs(result.rows[0]) }, { status: 201 });
  } catch (error) {
    console.error('[Practitioner Observations] POST error:', error);
    return NextResponse.json({ error: 'Failed to create observation' }, { status: 500 });
  }
}
