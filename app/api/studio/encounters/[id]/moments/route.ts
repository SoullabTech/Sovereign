export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { randomUUID } from 'crypto';
import {
  encryptMomentFields,
  decryptMomentRow,
  isEncounterStageBActive,
} from '@/lib/security/phiAccessors/encounterTranscripts';

type Params = { params: Promise<{ id: string }> };

const VALID_MOMENT_TYPES = [
  'emotional_shift','rupture_repair','insight','resistance',
  'aliveness','silence','intervention','self_recognition','unresolved_question',
] as const;

const VALID_ARTIFACT_TYPES = [
  'source_record','human_reflection','ai_candidate','accepted_recognition','developmental_synthesis',
] as const;

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { practitionerId } = identity;
    const { id: encounterId } = await params;

    const enc = await db.query(
      `SELECT id FROM encounters WHERE id = $1 AND practitioner_id = $2`,
      [encounterId, practitionerId]
    );
    if (enc.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const result = await db.query(
      `SELECT * FROM encounter_moments WHERE encounter_id = $1 ORDER BY start_ms, created_at`,
      [encounterId]
    );

    return NextResponse.json({ moments: result.rows.map((m) => decryptMomentRow(m, encounterId)) });
  } catch (error) {
    console.error('[Moments] GET error:', error);
    return NextResponse.json({ error: 'Failed to list moments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { practitionerId, memberId } = identity;
    const { id: encounterId } = await params;

    const enc = await db.query(
      `SELECT id FROM encounters WHERE id = $1 AND practitioner_id = $2`,
      [encounterId, practitionerId]
    );
    if (enc.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = await request.json();
    const {
      moment_type,
      title,
      start_ms,
      end_ms,
      excerpt,
      candidate_interpretation,
      confidence,
      artifact_type = 'ai_candidate',
    } = body;

    if (!moment_type || !VALID_MOMENT_TYPES.includes(moment_type)) {
      return NextResponse.json({ error: 'Invalid moment_type' }, { status: 400 });
    }
    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }
    if (!VALID_ARTIFACT_TYPES.includes(artifact_type)) {
      return NextResponse.json({ error: 'Invalid artifact_type' }, { status: 400 });
    }

    const momentId = randomUUID();
    const stageB = isEncounterStageBActive();

    const {
      excerpt_enc,
      excerpt_enc_meta,
      candidate_interpretation_enc,
      candidate_interpretation_enc_meta,
    } = encryptMomentFields(excerpt ?? null, candidate_interpretation ?? null, momentId, encounterId);

    const isAI = artifact_type === 'ai_candidate';
    const authoredBy = isAI ? null : (memberId ?? null);

    await db.query(
      `INSERT INTO encounter_moments
         (id, encounter_id, moment_type, title, start_ms, end_ms,
          excerpt, excerpt_enc, excerpt_enc_meta,
          candidate_interpretation, candidate_interpretation_enc, candidate_interpretation_enc_meta,
          confidence, artifact_type, authored_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11,$12::jsonb,$13,$14,$15)`,
      [
        momentId, encounterId, moment_type, title.trim(),
        start_ms ?? null, end_ms ?? null,
        stageB ? null : (excerpt ?? null),
        excerpt_enc, excerpt_enc_meta,
        stageB ? null : (candidate_interpretation ?? null),
        candidate_interpretation_enc, candidate_interpretation_enc_meta,
        confidence ?? null, artifact_type, authoredBy,
      ]
    );

    const row = await db.query(`SELECT * FROM encounter_moments WHERE id = $1`, [momentId]);
    return NextResponse.json({ moment: decryptMomentRow(row.rows[0], encounterId) }, { status: 201 });
  } catch (error) {
    console.error('[Moments] POST error:', error);
    return NextResponse.json({ error: 'Failed to create moment' }, { status: 500 });
  }
}
