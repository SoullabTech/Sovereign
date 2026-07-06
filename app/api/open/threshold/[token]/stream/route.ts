export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Evidence stream creation — the Recording Coordinator's entry point. PUBLIC (token-scoped).
 *
 * POST /api/open/threshold/[token]/stream
 *
 * Capability inversion (Phase B step 2): the recorder never asks "am I allowed?" — this
 * route converts (threshold token + existing record-consent row) into a stream capability.
 * The consent_event_id is derived SERVER-SIDE from the participant's own consent; the
 * client cannot supply one. No consent row → 403, and even if this code path were wrong,
 * the R-A1 DB trigger refuses the INSERT structurally.
 *
 * Evidence layer only: this route knows nothing about transcription, diarization, or
 * interpretation. It produces "participant X has a media stream" — nothing more.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { verifyThresholdToken } from '@/lib/encounters/threshold';

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const claims = verifyThresholdToken(token);
    if (!claims) return NextResponse.json({ error: 'Invalid or expired threshold link' }, { status: 404 });

    let body: { format?: string };
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    // Derive the recording capability from the participant's OWN consent row.
    const consent = await db.query(
      `SELECT id FROM encounter_consent_events
       WHERE encounter_id = $1 AND participant_id = $2 AND kind = 'record'`,
      [claims.encounterId, claims.participantId]
    );
    if (consent.rows.length === 0) {
      console.log('[Stream/open] REFUSED: no record consent', {
        participantIdPrefix: claims.participantId.slice(0, 8),
      });
      return NextResponse.json(
        { error: 'Recording requires your consent at the threshold first' },
        { status: 403 }
      );
    }
    const consentEventId = consent.rows[0].id;

    // One live stream per participant: refuse if one is already recording.
    const live = await db.query(
      `SELECT id FROM encounter_media_streams
       WHERE participant_id = $1 AND status = 'recording'`,
      [claims.participantId]
    );
    if (live.rows.length > 0) {
      return NextResponse.json(
        { error: 'A recording is already in progress for this participant', streamId: live.rows[0].id },
        { status: 409 }
      );
    }

    const result = await db.query(
      `INSERT INTO encounter_media_streams
         (encounter_id, participant_id, consent_event_id, kind, format, status, started_at)
       VALUES ($1, $2, $3, 'mic', $4, 'recording', NOW())
       RETURNING id`,
      [claims.encounterId, claims.participantId, consentEventId, body.format ?? null]
    );
    const streamId = result.rows[0].id;

    console.log('[Stream/open] stream opened', {
      streamIdPrefix: String(streamId).slice(0, 8),
      participantIdPrefix: claims.participantId.slice(0, 8),
    });

    return NextResponse.json({ streamId }, { status: 201 });
  } catch (error) {
    console.error('[Stream/open] POST error:', error);
    return NextResponse.json({ error: 'Failed to open stream' }, { status: 500 });
  }
}
