/**
 * Patterns API
 *
 * GET /api/memory/patterns
 * Returns emergent patterns detected for the current user.
 * Powers the "Patterns" view and provides metadata for "Show why" drawers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

interface PatternRow {
  id: string;
  pattern_key: string;
  description: string;
  seen_count: number;
  significance: number;
  formed_at: Date;
  last_seen_at: Date | null;
  facet_code: string | null;
}

/**
 * GET: Fetch patterns for the current user
 *
 * Query params:
 *   limit (default: 20)
 *   minSignificance (default: 0) - filter by minimum significance
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing x-user-id header' },
        { status: 401 }
      );
    }

    const limit = Math.min(
      parseInt(req.nextUrl.searchParams.get('limit') ?? '20'),
      100
    );
    const minSignificance = parseFloat(
      req.nextUrl.searchParams.get('minSignificance') ?? '0'
    );

    const result = await query<PatternRow>(
      `
      SELECT
        id,
        entity_tags[1] AS pattern_key,
        content_text AS description,
        COALESCE((trigger_event->>'seenCount')::int, 1) AS seen_count,
        significance,
        formed_at,
        (trigger_event->>'lastSeenAt')::timestamptz AS last_seen_at,
        facet_code
      FROM developmental_memories
      WHERE user_id = $1
        AND memory_type = 'emergent_pattern'
        AND significance >= $2
        AND (valid_to IS NULL OR valid_to > NOW())
      ORDER BY significance DESC, last_seen_at DESC NULLS LAST
      LIMIT $3
      `,
      [userId, minSignificance, limit]
    );

    const patterns = result.rows.map((row) => ({
      id: row.id,
      patternKey: row.pattern_key,
      description: row.description,
      seenCount: row.seen_count,
      significance: row.significance,
      formedAt: row.formed_at,
      lastSeenAt: row.last_seen_at,
      facetCode: row.facet_code,
    }));

    return NextResponse.json({
      ok: true,
      count: patterns.length,
      patterns,
    });
  } catch (err) {
    console.error('[patterns] GET error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch patterns' },
      { status: 500 }
    );
  }
}
