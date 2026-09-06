export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireCircleAccess } from '@/lib/circles/circleAccess';
import { listCircleMembers } from '@/lib/circles/circleService';

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
