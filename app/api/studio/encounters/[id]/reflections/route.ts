export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { randomUUID } from 'crypto';
import {
  encryptReflectionBody,
  decryptReflectionRow,
  isEncounterStageBActive,
} from '@/lib/security/phiAccessors/encounterTranscripts';

type Params = { params: Promise<{ id: string }> };

const VALID_AUTHOR_ROLES = ['practitioner','client','supervisor'] as const;

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
      `SELECT * FROM encounter_reflections WHERE encounter_id = $1 ORDER BY created_at`,
      [encounterId]
    );

    return NextResponse.json({
      reflections: result.rows.map((r) => decryptReflectionRow(r, encounterId)),
    });
  } catch (error) {
    console.error('[Reflections] GET error:', error);
    return NextResponse.json({ error: 'Failed to list reflections' }, { status: 500 });
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
    const { body: reflectionBody, author_role = 'practitioner' } = body;

    if (!reflectionBody || typeof reflectionBody !== 'string' || reflectionBody.trim().length === 0) {
      return NextResponse.json({ error: 'body is required' }, { status: 400 });
    }
    if (!VALID_AUTHOR_ROLES.includes(author_role)) {
      return NextResponse.json({ error: 'Invalid author_role' }, { status: 400 });
    }
    if (!memberId) {
      return NextResponse.json({ error: 'Member identity required' }, { status: 401 });
    }

    const reflectionId = randomUUID();
    const stageB = isEncounterStageBActive();
    const { body_enc, body_enc_meta } = encryptReflectionBody(reflectionBody, reflectionId, encounterId);

    await db.query(
      `INSERT INTO encounter_reflections
         (id, encounter_id, body, body_enc, body_enc_meta, authored_by, author_role)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7)`,
      [
        reflectionId, encounterId,
        stageB ? null : reflectionBody,
        body_enc, body_enc_meta,
        memberId, author_role,
      ]
    );

    const row = await db.query(`SELECT * FROM encounter_reflections WHERE id = $1`, [reflectionId]);
    return NextResponse.json({ reflection: decryptReflectionRow(row.rows[0], encounterId) }, { status: 201 });
  } catch (error) {
    console.error('[Reflections] POST error:', error);
    return NextResponse.json({ error: 'Failed to create reflection' }, { status: 500 });
  }
}
