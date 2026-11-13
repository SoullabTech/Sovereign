import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { writersStudioStanding } from '@/lib/writersStudio/betaAccessServer';
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
    // `eligible` means "may be in the Studio" — the journey, feedback and import surfaces read it. A writer whose dated
    // beta grant ended is still eligible, on `plan: 'free'` (design #2263). Pro is `writing.wholeWork`, read elsewhere.
    const { admitted, ...standing } = await writersStudioStanding(memberId);
    return NextResponse.json(
      { eligible: admitted, ...standing, capabilities: writerPublicReleaseCapabilities() },
      { headers: privateHeaders },
    );
  } catch {
    return NextResponse.json(
      { error: 'beta_access_unavailable' },
      { status: 503, headers: privateHeaders },
    );
  }
}
