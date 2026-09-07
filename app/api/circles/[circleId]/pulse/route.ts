export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireCircleAccess } from '@/lib/circles/circleAccess';
import { getCircleWithMembership } from '@/lib/circles/circleService';
import { getCirclePulse } from '@/lib/circles/fieldPulseService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ circleId: string }> }
) {
  try {
    const access = await requireCircleAccess(request);
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }
    const memberId = access.memberId;

    const { circleId } = await params;
    await getCircleWithMembership(circleId, memberId);

    const pulse = await getCirclePulse(circleId, memberId);
    return NextResponse.json({ pulse });
  } catch (error: any) {
    const msg = error?.message;
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    if (msg === 'NOT_FOUND') return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    console.error('[Circles] GET pulse error:', error);
    return NextResponse.json({ error: 'Failed to get pulse' }, { status: 500 });
  }
}
