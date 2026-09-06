export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireCircleAccess } from '@/lib/circles/circleAccess';
import { listMyCircles } from '@/lib/circles/circleService';
import { getCirclePulseLight } from '@/lib/circles/fieldPulseService';

export async function GET(request: NextRequest) {
  try {
    const access = await requireCircleAccess(request);
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }
    const memberId = access.memberId;

    const circles = await listMyCircles(memberId);
    const summaries: Record<string, Awaited<ReturnType<typeof getCirclePulseLight>>> = {};

    // Acceptable for <10 circles. Optimize to single query if needed later.
    await Promise.all(
      circles.map(async (c) => {
        try {
          summaries[c.id] = await getCirclePulseLight(c.id);
        } catch {
          // Graceful degradation — card shows without pulse data
        }
      })
    );

    return NextResponse.json({ summaries });
  } catch (error) {
    console.error('[Circles] GET pulse-summary error:', error);
    return NextResponse.json({ error: 'Failed to get pulse summaries' }, { status: 500 });
  }
}
