export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  crossingIsAllowed,
  validateFacetCrossingSource,
  type CarrySourceFacet,
  type CarryTargetFacet,
} from '@/lib/house/facetCrossing.server';

const SOURCE_FACETS = new Set(['journal', 'dream', 'reflections', 'ideas', 'relationships', 'changes', 'decisions', 'divination']);
const TARGET_FACETS = new Set(['changes', 'decisions', 'journal', 'anchor']);

export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sourceFacet = request.nextUrl.searchParams.get('sourceFacet') || '';
  const sourceRefId = request.nextUrl.searchParams.get('sourceRefId') || '';
  const targetFacet = request.nextUrl.searchParams.get('targetFacet') || '';
  const crossingId = request.nextUrl.searchParams.get('crossingId') || '';

  if (!SOURCE_FACETS.has(sourceFacet) || !TARGET_FACETS.has(targetFacet) || !sourceRefId || !crossingId) {
    return NextResponse.json({ error: 'Invalid crossing request' }, { status: 400 });
  }

  if (!crossingIsAllowed(crossingId, sourceFacet, targetFacet as CarryTargetFacet)) {
    return NextResponse.json({ error: 'Crossing not admitted' }, { status: 400 });
  }

  const source = await validateFacetCrossingSource({
    memberId,
    targetFacet: targetFacet as CarryTargetFacet,
    sourceRef: {
      crossingId,
      sourceFacet: sourceFacet as CarrySourceFacet,
      sourceRefId,
    },
  });

  if (!source) {
    return NextResponse.json({ error: 'Source not available' }, { status: 404 });
  }

  return NextResponse.json({ source });
}
