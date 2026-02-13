export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { joinCircleSchema } from '@/lib/circles/types';
import { joinWithInvite } from '@/lib/circles/inviteService';

export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = joinCircleSchema.parse(await request.json());
    const circleId = await joinWithInvite(body.token, memberId, body.consentMode);
    return NextResponse.json({ circleId });
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    if (error?.message === 'INVALID_INVITE') {
      return NextResponse.json({ error: 'Invalid or revoked invite' }, { status: 400 });
    }
    console.error('[Circles] POST /api/circles/join error:', error);
    return NextResponse.json({ error: 'Failed to join circle' }, { status: 500 });
  }
}
