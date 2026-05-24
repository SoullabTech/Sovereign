/**
 * Admin Engine Comparison Reviewer — GET (list).
 *
 * Joins maia_turns ⋈ maia_engine_comparisons on turn_id.
 *
 * Primary response lives in maia_turns.maia_text (with primary_engine).
 * Shadow response lives in maia_engine_comparisons.response_text (with engine_name).
 * No duplication: the comparison is the join.
 *
 * Query params:
 *   ?status=unreviewed|reviewed|all  (default: unreviewed)
 *   ?limit=N                          (default: 50, clamped 1..200)
 *
 * Auth: x-member-id header (matches /admin/maia/substrate convention).
 * Read-only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const memberId = request.headers.get('x-member-id');
  if (!memberId) {
    return NextResponse.json({ error: 'Member ID required' }, { status: 401 });
  }

  const url = new URL(request.url);
  const statusParam = url.searchParams.get('status') ?? 'unreviewed';
  const status = ['unreviewed', 'reviewed', 'all'].includes(statusParam)
    ? statusParam
    : 'unreviewed';

  const limitRaw = parseInt(url.searchParams.get('limit') ?? '50', 10);
  const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 50 : limitRaw, 1), 200);

  const where =
    status === 'reviewed'
      ? 'WHERE ec.reviewed_at IS NOT NULL'
      : status === 'all'
        ? ''
        : 'WHERE ec.reviewed_at IS NULL';

  try {
    const result = await query(
      `
      SELECT
        ec.id                 AS comparison_id,
        ec.turn_id            AS turn_id,
        ec.engine_name        AS shadow_engine,
        ec.is_primary         AS is_primary,
        ec.response_text      AS shadow_response,
        ec.response_time_ms   AS shadow_response_time_ms,
        ec.processing_profile AS mode,
        ec.confidence_score   AS confidence_score,
        ec.reviewer_label     AS reviewer_label,
        ec.attunement_score   AS attunement_score,
        ec.reviewer_note      AS reviewer_note,
        ec.reviewed_at        AS reviewed_at,
        ec.created_at         AS created_at,
        t.user_text           AS member_input,
        t.maia_text           AS primary_response,
        t.primary_engine      AS primary_engine,
        t.session_id          AS session_id
      FROM maia_engine_comparisons ec
      LEFT JOIN maia_turns t ON ec.turn_id = t.id
      ${where}
      ORDER BY ec.created_at DESC
      LIMIT $1
      `,
      [limit],
    );

    const totals = await query(`
      SELECT
        count(*)::int                                AS total,
        count(reviewed_at)::int                      AS reviewed,
        (count(*) - count(reviewed_at))::int         AS unreviewed
      FROM maia_engine_comparisons
    `);

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      filter: { status, limit },
      totals: totals.rows[0] ?? { total: 0, reviewed: 0, unreviewed: 0 },
      rows: result.rows,
    });
  } catch (error) {
    console.error('[admin/maia/engine-comparisons] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to load engine comparisons' },
      { status: 500 },
    );
  }
}
