export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireCircleAccess } from '@/lib/circles/circleAccess';
import { regenerateInvite } from '@/lib/circles/inviteService';

export async function POST(
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
    const invite = await regenerateInvite(circleId, memberId);
    return NextResponse.json({ invite }, { status: 201 });
  } catch (error: any) {
    if (error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    console.error('[Circles] POST /api/circles/[circleId]/invite error:', error);
    return NextResponse.json({ error: 'Failed to generate invite' }, { status: 500 });
  }
}
