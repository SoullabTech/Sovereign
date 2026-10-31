import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { writersStudioBetaAccess } from '@/lib/writersStudio/betaAccessServer';
import { writerPublicReleaseCapabilities } from '@/lib/writersStudio/releaseAuthority';

export const dynamic = 'force-dynamic';
const privateHeaders = {
  'Cache-Control': 'private, no-store',
  Vary: 'Cookie, x-session-token',
};

export async function GET(req: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(req);
    if (!memberId) {
      return NextResponse.json(
        { error: 'unauthenticated' },
        { status: 401, headers: privateHeaders },
      );
    }
    const access = await writersStudioBetaAccess(memberId);
    return NextResponse.json(
      { ...access, capabilities: writerPublicReleaseCapabilities() },
      { headers: privateHeaders },
    );
  } catch {
    return NextResponse.json(
      { error: 'beta_access_unavailable' },
      { status: 503, headers: privateHeaders },
    );
  }
}
