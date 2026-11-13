import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { admittedToStudio, writersStudioStanding } from '@/lib/writersStudio/betaAccessServer';
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
    const { admitted, ...standing } = await writersStudioStanding(memberId);
    return NextResponse.json(
      // `eligible` = beta cohort standing: current beta Pro, or Free after the member's own dated grant ended (design
      // #2263; journey and feedback read it). `admitted` = may use the Studio (that, or Free while Free admission is
      // open). Release capabilities (export, erasure, intake) are author rights, not Pro, so admitted Free writers get
      // them too (founder principle 2026-11-13: export never depends on Pro).
      { eligible: admitted, ...standing, admitted: admittedToStudio({ admitted }), capabilities: writerPublicReleaseCapabilities() },
      { headers: privateHeaders },
    );
  } catch {
    return NextResponse.json(
      { error: 'beta_access_unavailable' },
      { status: 503, headers: privateHeaders },
    );
  }
}
