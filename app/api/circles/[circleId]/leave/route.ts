export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { leaveCircle } from '@/lib/circles/membershipService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ circleId: string }> }
) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { circleId } = await params;
    await leaveCircle(circleId, memberId);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    console.error('[Circles] POST /api/circles/[circleId]/leave error:', error);
    return NextResponse.json({ error: 'Failed to leave circle' }, { status: 500 });
  }
}
