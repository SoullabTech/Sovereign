export const dynamic = 'force-dynamic';

/**
 * Encounter Threshold — practitioner side.
 *
 * POST  /api/studio/encounters/[id]/threshold  — mint per-participant threshold links
 * GET   /api/studio/encounters/[id]/threshold  — consent status per participant
 *
 * The practitioner mints and DELIVERS the links; the practitioner cannot author a
 * client's consent. Consent rows are written only via the open threshold route,
 * by the holder of the participant-scoped token (spec §3: consent authored by the
 * client at the threshold).
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { mintThresholdToken } from '@/lib/encounters/threshold';

async function loadOwnedEncounter(encounterId: string, practitionerId: string) {
  const result = await db.query(
    `SELECT id, title, status FROM encounters WHERE id = $1 AND practitioner_id = $2`,
    [encounterId, practitionerId]
  );
  return result.rows[0] ?? null;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const identity = await getCurrentPractitioner(request);
    if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const encounter = await loadOwnedEncounter(id, identity.practitionerId);
    if (!encounter) return NextResponse.json({ error: 'Encounter not found' }, { status: 404 });

    const participants = await db.query(
      `SELECT id, display_name, role FROM encounter_participants WHERE encounter_id = $1 ORDER BY created_at`,
      [id]
    );
    if (participants.rows.length === 0) {
      return NextResponse.json(
        { error: 'Encounter has no participants — add participants before minting threshold links' },
        { status: 400 }
      );
    }

    const links = participants.rows.map((p) => ({
      participantId: p.id,
      displayName: p.display_name,
      role: p.role,
      thresholdPath: `/open/threshold/${mintThresholdToken(id, p.id)}`,
    }));

    return NextResponse.json({ encounterId: id, title: encounter.title, links });
  } catch (error) {
    console.error('[Threshold] POST error:', error);
    return NextResponse.json({ error: 'Failed to mint threshold links' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const identity = await getCurrentPractitioner(request);
    if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const encounter = await loadOwnedEncounter(id, identity.practitionerId);
    if (!encounter) return NextResponse.json({ error: 'Encounter not found' }, { status: 404 });

    const result = await db.query(
      `SELECT ep.id AS participant_id, ep.display_name, ep.role,
              BOOL_OR(ce.kind = 'join')   AS joined,
              BOOL_OR(ce.kind = 'record') AS record_consented
       FROM encounter_participants ep
       LEFT JOIN encounter_consent_events ce ON ce.participant_id = ep.id
       WHERE ep.encounter_id = $1
       GROUP BY ep.id, ep.display_name, ep.role
       ORDER BY MIN(ep.created_at)`,
      [id]
    );

    const rows = result.rows.map((r) => ({
      participantId: r.participant_id,
      displayName: r.display_name,
      role: r.role,
      joined: r.joined ?? false,
      recordConsented: r.record_consented ?? false,
    }));
    const allConsented = rows.length > 0 && rows.every((r) => r.recordConsented);

    return NextResponse.json({ encounterId: id, title: encounter.title, participants: rows, allConsented });
  } catch (error) {
    console.error('[Threshold] GET error:', error);
    return NextResponse.json({ error: 'Failed to load threshold status' }, { status: 500 });
  }
}
