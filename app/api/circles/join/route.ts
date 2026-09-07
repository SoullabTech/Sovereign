export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireCircleAccess } from '@/lib/circles/circleAccess';
import { joinCircleSchema } from '@/lib/circles/types';
import { joinWithInvite } from '@/lib/circles/inviteService';

export async function POST(request: NextRequest) {
  try {
    const access = await requireCircleAccess(request);
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }
    const memberId = access.memberId;

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
    if (error?.message === 'REINSTATEMENT_REQUIRED') {
      // I-01: a generic invitation cannot reinstate a removed member. The
      // response deliberately carries no Circle name, no grounds, and no token
      // verdict — a refusal is not an occasion to disclose.
      return NextResponse.json(
        { error: 'This invitation cannot restore your place in this circle' },
        { status: 409 }
      );
    }
    console.error('[Circles] POST /api/circles/join error:', error);
    return NextResponse.json({ error: 'Failed to join circle' }, { status: 500 });
  }
}
