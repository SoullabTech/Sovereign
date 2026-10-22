import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { writerStudioPlanForMember } from '@/lib/writersStudio/planAccessServer';
import { WRITER_INDEPENDENT_RELEASE_HOLDS } from '@/lib/writersStudio/planPolicy';

export const dynamic = 'force-dynamic';
const privateHeaders = {
  'Cache-Control': 'private, no-store',
  'Vary': 'Cookie, x-session-token',
};

export async function GET(req: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(req);
    if (!memberId) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: 401, headers: privateHeaders });
    }
    const decision = await writerStudioPlanForMember(memberId);
    return NextResponse.json({
      ...decision,
      heldSeparately: WRITER_INDEPENDENT_RELEASE_HOLDS,
      note: 'Plan inclusion does not open held features or replace manuscript ownership checks.',
    }, { headers: privateHeaders });
  } catch {
    // A DB/session failure cannot result in a Pro claim or an optimistic grant.
    return NextResponse.json({ error: 'plan_unavailable' }, { status: 503, headers: privateHeaders });
  }
}
