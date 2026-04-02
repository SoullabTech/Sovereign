export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { listMyCircles } from '@/lib/circles/circleService';
import { getCirclePulseLight } from '@/lib/circles/fieldPulseService';

export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

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
