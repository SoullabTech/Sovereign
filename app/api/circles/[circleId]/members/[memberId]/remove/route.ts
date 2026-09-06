export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireCircleAccess } from '@/lib/circles/circleAccess';
import { removeMember } from '@/lib/circles/removalService';

/**
 * FR-05 removal — a boundary or safety act, never an interpretive judgment.
 *
 * Mirrors the shape of /[circleId]/leave, with two differences that are the
 * whole point: an actor distinct from the subject, and required grounds.
 */
const removeSchema = z.object({
  grounds: z.string().min(1).max(2000),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ circleId: string; memberId: string }> }
) {
  try {
    const access = await requireCircleAccess(request);
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const { circleId, memberId } = await params;
    const body = removeSchema.parse(await request.json());

    const record = await removeMember({
      circleId,
      actingMemberId: access.memberId,
      targetMemberId: memberId,
      grounds: body.grounds,
    });

    return NextResponse.json({ removal: record }, { status: 201 });
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json({ error: 'Grounds are required' }, { status: 400 });
    }
    switch (error?.message) {
      case 'GROUNDS_REQUIRED':
        return NextResponse.json({ error: 'Grounds are required' }, { status: 400 });
      case 'SELF_REMOVAL':
        return NextResponse.json({ error: 'Use leave to depart a circle' }, { status: 400 });
      case 'NOT_A_MEMBER':
      case 'ROLE_INSUFFICIENT':
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      case 'TARGET_NOT_ACTIVE':
        return NextResponse.json({ error: 'Not an active member' }, { status: 404 });
    }
    console.error('[Circles] POST /api/circles/[circleId]/members/[memberId]/remove error:', error);
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
  }
}
