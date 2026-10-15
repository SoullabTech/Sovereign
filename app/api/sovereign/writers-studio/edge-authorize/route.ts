/**
 * WS-BETA-ENTRY-R1: authorization response for Caddy forward_auth.
 *
 * Only a validated session for an exact approved beta member can pass.
 * No new account, session or identity is created by this route.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { writersStudioBetaAccess } from '@/lib/writersStudio/betaAccessServer';
import { restrictedBetaEnabled } from '@/lib/writersStudio/restrictedBetaAdmission';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DENY_HEADERS = { 'Cache-Control': 'no-store' };
function deny(status: number): NextResponse {
  return new NextResponse(null, { status, headers: DENY_HEADERS });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!restrictedBetaEnabled(process.env.WRITERS_STUDIO_RESTRICTED_BETA)) {
    return deny(404);
  }
  // This is never a production Soullab or private-tunnel grant endpoint.
  const host = request.headers.get('host')?.split(':', 1)[0]?.toLowerCase();
  if (host !== 'beta.soullab.life') return deny(403);

  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return deny(401);
    const admission = await writersStudioBetaAccess(memberId);
    if (!admission.eligible) return deny(403);
    return new NextResponse(null, { status: 204, headers: DENY_HEADERS });
  } catch {
    return deny(503);
  }
}
