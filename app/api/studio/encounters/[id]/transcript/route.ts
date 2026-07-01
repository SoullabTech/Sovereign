export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { randomUUID } from 'crypto';
import {
  encryptRawText,
  encryptTurnText,
  decryptTranscriptRow,
  decryptTurnRows,
  isEncounterStageBActive,
} from '@/lib/security/phiAccessors/encounterTranscripts';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { practitionerId } = identity;
    const { id: encounterId } = await params;

    const encounterRes = await db.query(
      `SELECT id FROM encounters WHERE id = $1 AND practitioner_id = $2`,
      [encounterId, practitionerId]
    );
    if (encounterRes.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await request.json();
    const { raw_text, turns = [], source = 'recording' } = body;

    if (!raw_text || typeof raw_text !== 'string') {
      return NextResponse.json({ error: 'raw_text is required' }, { status: 400 });
    }

    const stageB = isEncounterStageBActive();
    const { raw_text_enc, raw_text_enc_meta } = encryptRawText(raw_text, encounterId);

    const wordCount = raw_text.trim().split(/\s+/).length;
    const speakerSet = new Set<string>(
      (turns as { speaker?: string }[]).map((t) => t.speaker ?? '').filter(Boolean)
    );

    const transcriptId = randomUUID();

    // Upsert transcript (encounter has UNIQUE constraint on encounter_id)
    await db.query(
      `INSERT INTO encounter_transcripts
         (id, encounter_id, raw_text, raw_text_enc, raw_text_enc_meta, word_count, speaker_count, source)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8)
       ON CONFLICT (encounter_id) DO UPDATE SET
         raw_text = EXCLUDED.raw_text,
         raw_text_enc = EXCLUDED.raw_text_enc,
         raw_text_enc_meta = EXCLUDED.raw_text_enc_meta,
         word_count = EXCLUDED.word_count,
         speaker_count = EXCLUDED.speaker_count,
         source = EXCLUDED.source,
         updated_at = NOW()`,
      [
        transcriptId,
        encounterId,
        stageB ? null : raw_text,
        raw_text_enc,
        raw_text_enc_meta,
        wordCount,
        speakerSet.size,
        source,
      ]
    );

    // Resolve the actual transcript id (may differ if ON CONFLICT triggered)
    const tRes = await db.query(
      `SELECT id FROM encounter_transcripts WHERE encounter_id = $1`,
      [encounterId]
    );
    const actualTranscriptId = tRes.rows[0].id;

    // Replace turns
    await db.query(`DELETE FROM transcript_turns WHERE transcript_id = $1`, [actualTranscriptId]);

    for (let i = 0; i < (turns as unknown[]).length; i++) {
      const t = (turns as { speaker?: string; text?: string; start_ms?: number; end_ms?: number }[])[i];
      const turnId = randomUUID();
      const turnText = t.text ?? '';
      const { text_enc, text_enc_meta } = encryptTurnText(turnText, turnId, encounterId);

      await db.query(
        `INSERT INTO transcript_turns
           (id, transcript_id, encounter_id, speaker, text, text_enc, text_enc_meta, start_ms, end_ms, turn_index)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10)`,
        [
          turnId,
          actualTranscriptId,
          encounterId,
          t.speaker ?? null,
          stageB ? null : turnText,
          text_enc,
          text_enc_meta,
          t.start_ms ?? null,
          t.end_ms ?? null,
          i,
        ]
      );
    }

    await db.query(
      `UPDATE encounters SET transcription_status = 'complete', updated_at = NOW() WHERE id = $1`,
      [encounterId]
    );

    return NextResponse.json({ ok: true, transcript_id: actualTranscriptId }, { status: 201 });
  } catch (error) {
    console.error('[Encounter Transcript] POST error:', error);
    return NextResponse.json({ error: 'Failed to store transcript' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { practitionerId } = identity;
    const { id: encounterId } = await params;

    const encounterRes = await db.query(
      `SELECT id FROM encounters WHERE id = $1 AND practitioner_id = $2`,
      [encounterId, practitionerId]
    );
    if (encounterRes.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const tRes = await db.query(
      `SELECT * FROM encounter_transcripts WHERE encounter_id = $1`,
      [encounterId]
    );
    if (tRes.rows.length === 0) {
      return NextResponse.json({ transcript: null, turns: [] });
    }

    const transcript = decryptTranscriptRow(tRes.rows[0], encounterId);
    const turnsRes = await db.query(
      `SELECT * FROM transcript_turns WHERE transcript_id = $1 ORDER BY turn_index`,
      [tRes.rows[0].id]
    );

    return NextResponse.json({
      transcript,
      turns: decryptTurnRows(turnsRes.rows, encounterId),
    });
  } catch (error) {
    console.error('[Encounter Transcript] GET error:', error);
    return NextResponse.json({ error: 'Failed to load transcript' }, { status: 500 });
  }
}
