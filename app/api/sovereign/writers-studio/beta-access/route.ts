import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { writersStudioBetaAccess } from '@/lib/writersStudio/betaAccessServer';
import { writerPublicReleaseCapabilities } from '@/lib/writersStudio/releaseAuthority';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const access = await writersStudioBetaAccess(memberId);
  return NextResponse.json({
    ...access,
    capabilities: writerPublicReleaseCapabilities(),
  }, { headers: { 'Cache-Control': 'private, no-store' } });
}
