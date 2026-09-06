export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireCircleAccess } from '@/lib/circles/circleAccess';
import { getCircleWithMembership } from '@/lib/circles/circleService';

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
    const { circle, membership } = await getCircleWithMembership(circleId, memberId);
    return NextResponse.json({ circle, membership });
  } catch (error: any) {
    const msg = error?.message;
    if (msg === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    if (msg === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    }
    console.error('[Circles] GET /api/circles/[circleId] error:', error);
    return NextResponse.json({ error: 'Failed to get circle' }, { status: 500 });
  }
}
