export const dynamic = 'force-dynamic';

/**
 * GET /api/studio/relationships/[id]/divinations
 *
 * List divination history for a relationship (I Ching + Council).
 * Supports limit/offset pagination.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import db from '@/lib/db/postgres';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const practitioner = await getCurrentPractitioner(request);
    if (!practitioner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { practitionerId } = practitioner;

    // Verify ownership
    const check = await db.query(
      `SELECT id FROM studio_relationships WHERE id = $1 AND practitioner_id = $2`,
      [id, practitionerId]
    );
    if (check.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const res = await db.query(
      `SELECT id, divination_type, question, hexagram_number, hexagram_name,
              relating_hexagram_number, changing_lines, casting_method,
              interpretation_json, council_result, created_at
       FROM relationship_divinations
       WHERE relationship_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    const divinations = res.rows.map((r: {
      id: string;
      divination_type: string;
      question: string | null;
      hexagram_number: number | null;
      hexagram_name: string | null;
      relating_hexagram_number: number | null;
      changing_lines: number[] | null;
      casting_method: string | null;
      interpretation_json: Record<string, unknown> | null;
      council_result: Record<string, unknown> | null;
      created_at: string;
    }) => ({
      id: r.id,
      divinationType: r.divination_type,
      question: r.question,
      ichingResult: r.interpretation_json || null,
      councilResult: r.council_result || null,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ divinations });
  } catch (error) {
    console.error('[divinations] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch divinations' }, { status: 500 });
  }
}
