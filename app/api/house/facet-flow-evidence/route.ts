export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { loadFacetFlowEvidence } from '@/lib/house/facetCrossing.server';

export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const flowId = request.nextUrl.searchParams.get('flowId') || '';
  if (!flowId) {
    return NextResponse.json({ error: 'flowId required' }, { status: 400 });
  }

  const evidence = await loadFacetFlowEvidence(memberId, flowId);
  if (!evidence) {
    return NextResponse.json({ error: 'Flow evidence not available' }, { status: 404 });
  }

  return NextResponse.json({ evidence });
}
