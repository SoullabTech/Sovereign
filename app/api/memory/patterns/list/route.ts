export const dynamic = 'force-dynamic';
/**
 * Patterns API
 *
 * GET /api/memory/patterns
 * Returns emergent patterns detected for the current user.
 * Powers the "Patterns" view and provides metadata for "Show why" drawers.
 */

import { NextRequest, NextResponse } from 'next/server';

export const revalidate = false;
import { query } from '@/lib/db/postgres';

// Skip during static export (Capacitor builds)

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
 * GET: Static placeholder for Capacitor builds
 * Use POST for runtime pattern fetching
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    count: 0,
    patterns: [],
    note: 'Static placeholder - use POST for runtime data'
  });
}

/**
 * POST: Fetch patterns for the current user
 *
 * Body params:
 *   userId (required)
 *   limit (default: 20)
 *   minSignificance (default: 0) - filter by minimum significance
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId;
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId in request body' },
        { status: 401 }
      );
    }

    const limit = Math.min(parseInt(body.limit ?? '20'), 100);
    const minSignificance = parseFloat(body.minSignificance ?? '0');

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
    console.error('[patterns] POST error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch patterns' },
      { status: 500 }
    );
  }
}
