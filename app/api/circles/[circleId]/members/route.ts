export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { listCircleMembers } from '@/lib/circles/circleService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ circleId: string }> }
) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { circleId } = await params;
    const members = await listCircleMembers(circleId, memberId);
    return NextResponse.json({ members });
  } catch (error: any) {
    if (error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    console.error('[Circles] GET /api/circles/[circleId]/members error:', error);
    return NextResponse.json({ error: 'Failed to list members' }, { status: 500 });
  }
}
