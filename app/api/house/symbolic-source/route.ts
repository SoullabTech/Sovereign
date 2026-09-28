export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { resolveDivinationSymbolicSourcePacket } from '@/lib/house/symbolicSource.server';

export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sourceFacet = request.nextUrl.searchParams.get('sourceFacet') || '';
  const sourceRefId = request.nextUrl.searchParams.get('sourceRefId') || '';

  if (sourceFacet !== 'divination' || !sourceRefId) {
    return NextResponse.json({ error: 'Invalid symbolic source request' }, { status: 400 });
  }

  const source = await resolveDivinationSymbolicSourcePacket(memberId, sourceRefId);
  if (!source) {
    return NextResponse.json({ error: 'Source not available' }, { status: 404 });
  }

  return NextResponse.json({ source });
}
