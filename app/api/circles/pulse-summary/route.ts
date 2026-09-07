export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireCircleAccess } from '@/lib/circles/circleAccess';
import { getCirclePulseSummariesForMember } from '@/lib/circles/fieldPulseService';

export async function GET(request: NextRequest) {
  try {
    const access = await requireCircleAccess(request);
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }
    const memberId = access.memberId;

    // One membership-scoped query. Authorization is the join, not a per-circle
    // check — no N+1, and no Circle the member does not belong to can appear.
    const summaries = await getCirclePulseSummariesForMember(memberId);

    return NextResponse.json({ summaries });
  } catch (error) {
    console.error('[Circles] GET pulse-summary error:', error);
    return NextResponse.json({ error: 'Failed to get pulse summaries' }, { status: 500 });
  }
}
