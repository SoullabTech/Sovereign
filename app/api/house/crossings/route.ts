export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import {
  resolveFacetFlowSource,
  type RelationSourceFacet,
  type RelationTargetFacet,
} from '@/lib/house/facetCrossing.server';

const TARGETS = new Set<RelationTargetFacet>(['changes', 'decisions', 'journal', 'anchor', 'reflections']);
const SOURCES = new Set<RelationSourceFacet>(['journal', 'dream', 'reflections', 'ideas', 'relationships', 'changes', 'decisions', 'divination', 'astrology']);

export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const targetFacet = request.nextUrl.searchParams.get('targetFacet') || '';
  const targetRefId = request.nextUrl.searchParams.get('targetRefId') || '';

  if (!TARGETS.has(targetFacet as RelationTargetFacet) || !targetRefId) {
    return NextResponse.json({ error: 'Invalid target' }, { status: 400 });
  }

  const result = await query<{
    crossing_id: string;
    source_facet: string;
    source_ref_id: string;
    created_at: string;
  }>(
    `SELECT crossing_id, source_facet, source_ref_id, created_at::text AS created_at
       FROM member_facet_crossings
      WHERE member_id = $1
        AND target_facet = $2
        AND target_ref_id = $3
      ORDER BY created_at ASC`,
    [memberId, targetFacet, targetRefId],
  );

  const crossings = await Promise.all(
    result.rows.map(async (row) => {
      const sourceFacet = SOURCES.has(row.source_facet as RelationSourceFacet)
        ? row.source_facet as RelationSourceFacet
        : null;
      const source = sourceFacet
        ? await resolveFacetFlowSource(memberId, sourceFacet, row.source_ref_id)
        : null;

      return {
        crossingId: row.crossing_id,
        crossedAt: row.created_at,
        source: source
          ? {
              facet: source.facet,
              refId: source.refId,
              label: source.label,
              excerpt: source.excerpt,
              returnHref: source.href,
            }
          : null,
      };
    }),
  );

  return NextResponse.json({
    targetFacet: targetFacet as RelationTargetFacet,
    targetRefId,
    crossings,
  });
}
