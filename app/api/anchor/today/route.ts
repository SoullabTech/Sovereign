export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db/postgres';
import {
  recordFacetCrossing,
  validateFacetCrossingSource,
  type FacetCrossingRef,
} from '@/lib/house/facetCrossing.server';
import { getAuthenticatedMember } from '@/lib/practitioner/auth';
import { promptForDate } from '@/lib/maia/dailyAnchor';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
  const member = await getAuthenticatedMember();
  if (!member) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || '';
  if (!ISO_DATE.test(date)) {
    return NextResponse.json({ error: 'invalid date' }, { status: 400 });
  }

  const prompt = promptForDate(date);

  const result = await query<{
    id: string;
    response: string;
    created_at: string;
    updated_at: string;
  }>(
    `SELECT id::text AS id,
            response,
            created_at::text AS created_at,
            updated_at::text AS updated_at
       FROM member_daily_anchors
      WHERE member_id = $1 AND anchor_date = $2
      LIMIT 1`,
    [member.id, date]
  );

  return NextResponse.json({
    date,
    prompt,
    anchorId: result.rows[0]?.id ?? null,
    response: result.rows[0]?.response ?? null,
    createdAt: result.rows[0]?.created_at ?? null,
    updatedAt: result.rows[0]?.updated_at ?? null,
  });
}

export async function POST(request: NextRequest) {
  const member = await getAuthenticatedMember();
  if (!member) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const { date, response, sourceRef } = body as {
    date?: string;
    response?: string;
    sourceRef?: FacetCrossingRef;
  };
  if (!date || !ISO_DATE.test(date)) {
    return NextResponse.json({ error: 'invalid date' }, { status: 400 });
  }
  if (typeof response !== 'string' || response.trim().length === 0) {
    return NextResponse.json({ error: 'response required' }, { status: 400 });
  }

  const trimmed = response.trim().slice(0, 4000);
  const prompt = promptForDate(date);

  if (sourceRef) {
    const source = await validateFacetCrossingSource({
      memberId: member.id,
      targetFacet: 'anchor',
      sourceRef,
    });
    if (!source) {
      return NextResponse.json(
        { error: 'Source not available for this crossing' },
        { status: 400 },
      );
    }
  }

  const row = await transaction(async (client) => {
    const result = await client.query<{
      id: string;
      created_at: string;
      updated_at: string;
    }>(
      `INSERT INTO member_daily_anchors (member_id, anchor_date, prompt_shown, response)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (member_id, anchor_date)
       DO UPDATE SET response = EXCLUDED.response, updated_at = NOW()
       RETURNING id::text AS id,
                 created_at::text AS created_at,
                 updated_at::text AS updated_at`,
      [member.id, date, prompt, trimmed],
    );

    const anchor = result.rows[0];

    if (sourceRef) {
      await recordFacetCrossing(client, {
        memberId: member.id,
        crossingId: sourceRef.crossingId,
        sourceFacet: sourceRef.sourceFacet,
        sourceRefId: sourceRef.sourceRefId,
        targetFacet: 'anchor',
        targetRefId: anchor.id,
      });
    }

    return anchor;
  });

  return NextResponse.json({
    ok: true,
    anchorId: row.id,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  });
}
