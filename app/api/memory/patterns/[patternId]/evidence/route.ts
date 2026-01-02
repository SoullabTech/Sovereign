/**
 * Pattern Evidence API
 *
 * GET /api/memory/patterns/[patternId]/evidence
 * Returns memories that support a specific pattern.
 * Powers the "Show why" drawer in the UI.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

interface EvidenceRow {
  id: string;
  memory_type: string;
  content_text: string;
  formed_at: Date;
  facet_code: string | null;
  link_confidence: number;
  weight: number;
  linked_at: Date;
}

/**
 * GET: Fetch supporting evidence for a pattern
 *
 * Query params:
 *   limit (default: 25)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ patternId: string }> }
) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing x-user-id header' },
        { status: 401 }
      );
    }

    const { patternId } = await params;
    if (!patternId) {
      return NextResponse.json(
        { error: 'Missing patternId' },
        { status: 400 }
      );
    }

    const limit = Math.min(
      parseInt(req.nextUrl.searchParams.get('limit') ?? '25'),
      100
    );

    // First verify the pattern exists and belongs to this user
    const patternCheck = await query<{ id: string; pattern_key: string }>(
      `
      SELECT id, entity_tags[1] as pattern_key
      FROM developmental_memories
      WHERE id = $1
        AND user_id = $2
        AND memory_type = 'emergent_pattern'
      `,
      [patternId, userId]
    );

    if (patternCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Pattern not found' },
        { status: 404 }
      );
    }

    const patternKey = patternCheck.rows[0].pattern_key;

    // Get supporting memories via memory_links
    const result = await query<EvidenceRow>(
      `
      SELECT
        dm.id,
        dm.memory_type,
        dm.content_text,
        dm.formed_at,
        dm.facet_code,
        ml.confidence AS link_confidence,
        ml.weight,
        ml.created_at AS linked_at
      FROM memory_links ml
      JOIN developmental_memories dm
        ON dm.id = ml.from_id::uuid
      WHERE ml.user_id = $1
        AND ml.to_id = $2
        AND ml.link_type = 'supports'
      ORDER BY ml.created_at DESC
      LIMIT $3
      `,
      [userId, patternId, limit]
    );

    const evidence = result.rows.map((row) => ({
      id: row.id,
      memoryType: row.memory_type,
      content: row.content_text,
      formedAt: row.formed_at,
      facetCode: row.facet_code,
      linkConfidence: row.link_confidence,
      weight: row.weight,
      linkedAt: row.linked_at,
    }));

    return NextResponse.json({
      ok: true,
      patternId,
      patternKey,
      evidenceCount: evidence.length,
      evidence,
    });
  } catch (err) {
    console.error('[patterns/evidence] GET error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch pattern evidence' },
      { status: 500 }
    );
  }
}
