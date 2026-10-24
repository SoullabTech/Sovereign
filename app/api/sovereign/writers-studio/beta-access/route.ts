import { NextRequest, NextResponse } from 'next/server';
import { verifiedPilotWriterActor } from '@/lib/writersStudio/pilotWriteSecurity';
import { writersStudioBetaAccess } from '@/lib/writersStudio/betaAccessServer';

export const dynamic = 'force-dynamic';
const privateHeaders = { 'Cache-Control': 'private, no-store', 'Vary': 'Cookie, x-session-token' };

export async function GET(req: NextRequest) {
  try {
    // Session authority is identical to pilot writes: cookie and header
    // credentials must both validate and identify the SAME member.
    const actor = await verifiedPilotWriterActor(req);
    if (!actor) return NextResponse.json(
      { error: 'unauthenticated' }, { status: 401, headers: privateHeaders },
    );
    return NextResponse.json(await writersStudioBetaAccess(actor.memberId), {
      headers: privateHeaders,
    });
  } catch {
    // A missing R20 trust anchor or a DB/session failure cannot return true.
    return NextResponse.json(
      { error: 'pilot_access_unavailable' }, { status: 503, headers: privateHeaders },
    );
  }
}
