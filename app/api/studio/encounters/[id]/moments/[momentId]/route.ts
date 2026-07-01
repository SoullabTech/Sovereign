export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import {
  encryptMomentFields,
  decryptMomentRow,
  isEncounterStageBActive,
} from '@/lib/security/phiAccessors/encounterTranscripts';

type Params = { params: Promise<{ id: string; momentId: string }> };

const VALID_STATUSES = ['candidate','accepted','rejected','edited'] as const;

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { practitionerId } = identity;
    const { id: encounterId, momentId } = await params;

    // Verify encounter ownership
    const enc = await db.query(
      `SELECT id FROM encounters WHERE id = $1 AND practitioner_id = $2`,
      [encounterId, practitionerId]
    );
    if (enc.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const momentRes = await db.query(
      `SELECT * FROM encounter_moments WHERE id = $1 AND encounter_id = $2`,
      [momentId, encounterId]
    );
    if (momentRes.rows.length === 0) return NextResponse.json({ error: 'Moment not found' }, { status: 404 });

    const body = await request.json();
    const { status, title, candidate_interpretation, excerpt } = body;

    const updates: string[] = [];
    const values: unknown[] = [];

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      values.push(status);
      updates.push(`status = $${values.length}`);
    }

    if (title !== undefined) {
      values.push(title);
      updates.push(`title = $${values.length}`);
    }

    // Re-encrypt if PHI fields are being updated
    if (excerpt !== undefined || candidate_interpretation !== undefined) {
      const stageB = isEncounterStageBActive();
      const newExcerpt = excerpt ?? momentRes.rows[0].excerpt;
      const newInterp = candidate_interpretation ?? momentRes.rows[0].candidate_interpretation;

      const encrypted = encryptMomentFields(newExcerpt, newInterp, momentId, encounterId);

      if (excerpt !== undefined) {
        values.push(stageB ? null : newExcerpt);
        updates.push(`excerpt = $${values.length}`);
        values.push(encrypted.excerpt_enc);
        updates.push(`excerpt_enc = $${values.length}`);
        values.push(encrypted.excerpt_enc_meta);
        updates.push(`excerpt_enc_meta = $${values.length}::jsonb`);
      }

      if (candidate_interpretation !== undefined) {
        values.push(stageB ? null : newInterp);
        updates.push(`candidate_interpretation = $${values.length}`);
        values.push(encrypted.candidate_interpretation_enc);
        updates.push(`candidate_interpretation_enc = $${values.length}`);
        values.push(encrypted.candidate_interpretation_enc_meta);
        updates.push(`candidate_interpretation_enc_meta = $${values.length}::jsonb`);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(momentId);
    await db.query(
      `UPDATE encounter_moments SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${values.length}`,
      values
    );

    const updated = await db.query(`SELECT * FROM encounter_moments WHERE id = $1`, [momentId]);
    return NextResponse.json({ moment: decryptMomentRow(updated.rows[0], encounterId) });
  } catch (error) {
    console.error('[Moment PATCH] error:', error);
    return NextResponse.json({ error: 'Failed to update moment' }, { status: 500 });
  }
}
