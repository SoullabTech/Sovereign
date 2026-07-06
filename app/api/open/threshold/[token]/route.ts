export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Encounter Threshold — participant side. PUBLIC (guest joins with a link).
 *
 * GET  /api/open/threshold/[token]  — what is being consented to (title, name, consent text)
 * POST /api/open/threshold/[token]  — author this participant's consent (join + record)
 *
 * The token is a participant-scoped HMAC capability minted by the practitioner route.
 * Holding it = acting as that participant; the consent row is authored at the client's
 * own device, at the threshold (spec §3). Idempotent: re-consent upserts nothing new
 * (UNIQUE encounter/participant/kind).
 *
 * This route writes ONLY consent rows. No media, no stream, no recorder state. The
 * recorder path (Phase B step 2) is separately refused by the R-A1 DB trigger unless
 * the `record` row written here exists.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { verifyThresholdToken, RECORD_CONSENT_TEXT } from '@/lib/encounters/threshold';

async function loadThresholdContext(token: string) {
  const claims = verifyThresholdToken(token);
  if (!claims) return null;
  const result = await db.query(
    `SELECT e.id AS encounter_id, e.title, e.status,
            ep.id AS participant_id, ep.display_name, ep.role
     FROM encounters e
     JOIN encounter_participants ep ON ep.encounter_id = e.id
     WHERE e.id = $1 AND ep.id = $2`,
    [claims.encounterId, claims.participantId]
  );
  return result.rows[0] ?? null;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const ctx = await loadThresholdContext(token);
    if (!ctx) return NextResponse.json({ error: 'Invalid or expired threshold link' }, { status: 404 });

    const consents = await db.query(
      `SELECT kind FROM encounter_consent_events WHERE encounter_id = $1 AND participant_id = $2`,
      [ctx.encounter_id, ctx.participant_id]
    );
    const kinds = consents.rows.map((r) => r.kind as string);

    return NextResponse.json({
      encounterId: ctx.encounter_id,
      encounterTitle: ctx.title,
      displayName: ctx.display_name,
      role: ctx.role,
      consentText: RECORD_CONSENT_TEXT,
      joined: kinds.includes('join'),
      recordConsented: kinds.includes('record'),
    });
  } catch (error) {
    console.error('[Threshold/open] GET error:', error);
    return NextResponse.json({ error: 'Failed to load threshold' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const ctx = await loadThresholdContext(token);
    if (!ctx) return NextResponse.json({ error: 'Invalid or expired threshold link' }, { status: 404 });

    let body: { consent?: boolean };
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    // Explicit affirmative only. Absence, false, or anything else writes nothing.
    if (body.consent !== true) {
      return NextResponse.json({ error: 'Consent requires an explicit affirmative' }, { status: 400 });
    }

    // join + record, idempotent (UNIQUE encounter_id, participant_id, kind).
    await db.query(
      `INSERT INTO encounter_consent_events (encounter_id, participant_id, kind, text_snapshot)
       VALUES ($1, $2, 'join', NULL), ($1, $2, 'record', $3)
       ON CONFLICT (encounter_id, participant_id, kind) DO NOTHING`,
      [ctx.encounter_id, ctx.participant_id, RECORD_CONSENT_TEXT]
    );

    console.log('[Threshold/open] record consent authored', {
      encounterIdPrefix: String(ctx.encounter_id).slice(0, 8),
      participantIdPrefix: String(ctx.participant_id).slice(0, 8),
    });

    return NextResponse.json({ ok: true, encounterId: ctx.encounter_id, joined: true, recordConsented: true });
  } catch (error) {
    console.error('[Threshold/open] POST error:', error);
    return NextResponse.json({ error: 'Failed to record consent' }, { status: 500 });
  }
}
