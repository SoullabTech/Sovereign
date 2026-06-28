/**
 * Admin Engine Comparison Reviewer — PATCH (review fields).
 *
 * Updates reviewer_label, attunement_score, reviewer_note for a single
 * maia_engine_comparisons row, and stamps reviewed_at = NOW().
 *
 * Body shape (all fields optional; at least one of label/score/note required):
 *   {
 *     reviewer_label?: 'better' | 'worse' | 'neutral' | 'interesting'
 *     attunement_score?: integer 1..10
 *     reviewer_note?: string | null
 *   }
 *
 * No writes to maia_turns. No duplication of primary content.
 * Auth: isAdminRequest (LABTOOLS_ADMIN_PASSWORD via x-admin-password).
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { isAdminRequest } from '@/lib/admin/requireAdmin';

export const dynamic = 'force-dynamic';

const VALID_LABELS = ['better', 'worse', 'neutral', 'interesting'] as const;
type ReviewerLabel = (typeof VALID_LABELS)[number];

interface PatchBody {
  reviewer_label?: ReviewerLabel;
  attunement_score?: number;
  reviewer_note?: string | null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: idParam } = await params;
  const id = parseInt(idParam, 10);
  if (Number.isNaN(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const hasLabel = body.reviewer_label !== undefined;
  const hasScore = body.attunement_score !== undefined;
  const hasNote = body.reviewer_note !== undefined;

  if (!hasLabel && !hasScore && !hasNote) {
    return NextResponse.json(
      { error: 'No review fields provided' },
      { status: 400 },
    );
  }

  if (hasLabel && !VALID_LABELS.includes(body.reviewer_label as ReviewerLabel)) {
    return NextResponse.json(
      { error: `reviewer_label must be one of: ${VALID_LABELS.join(', ')}` },
      { status: 400 },
    );
  }

  if (hasScore) {
    const s = body.attunement_score;
    if (typeof s !== 'number' || !Number.isInteger(s) || s < 1 || s > 10) {
      return NextResponse.json(
        { error: 'attunement_score must be an integer between 1 and 10' },
        { status: 400 },
      );
    }
  }

  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (hasLabel) {
    sets.push(`reviewer_label = $${i++}`);
    values.push(body.reviewer_label);
  }
  if (hasScore) {
    sets.push(`attunement_score = $${i++}`);
    values.push(body.attunement_score);
  }
  if (hasNote) {
    sets.push(`reviewer_note = $${i++}`);
    values.push(body.reviewer_note);
  }
  sets.push(`reviewed_at = NOW()`);
  values.push(id);

  try {
    const result = await query(
      `UPDATE maia_engine_comparisons
       SET ${sets.join(', ')}
       WHERE id = $${i}
       RETURNING id, reviewer_label, attunement_score, reviewer_note, reviewed_at`,
      values,
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Comparison not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ row: result.rows[0] });
  } catch (error) {
    console.error('[admin/maia/engine-comparisons] PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update review fields' },
      { status: 500 },
    );
  }
}
