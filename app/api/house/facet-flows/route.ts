export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { loadRecentFacetFlows } from '@/lib/house/facetCrossing.server';

export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const requested = Number.parseInt(request.nextUrl.searchParams.get('limit') || '8', 10);
  const limit = Number.isFinite(requested) ? requested : 8;

  try {
    const flows = await loadRecentFacetFlows(memberId, limit);
    return NextResponse.json({ flows });
  } catch (error) {
    console.error('[House facet flows] GET failed:', error);
    return NextResponse.json({ error: 'Facet flows unavailable' }, { status: 500 });
  }
}
