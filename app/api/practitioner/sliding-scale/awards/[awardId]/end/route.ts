/**
 * END SLIDING SCALE AWARD API
 *
 * POST /api/practitioner/sliding-scale/awards/[awardId]/end
 *
 * End an active sliding scale award.
 * Decrements spots_filled to free up capacity.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { endAward } from '@/lib/practitioner/slidingScale';

interface RouteParams {
  params: Promise<{ awardId: string }>;
}

/**
 * POST /api/practitioner/sliding-scale/awards/[awardId]/end
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const practitionerId = await requireMemberId();
    const { awardId } = await params;

    const award = await endAward(awardId, practitionerId);

    return NextResponse.json({ award });
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case 'AUTH_REQUIRED':
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );

        case 'AWARD_NOT_FOUND':
          return NextResponse.json(
            { error: 'Award not found' },
            { status: 404 }
          );

        case 'OWNERSHIP_MISMATCH':
          return NextResponse.json(
            { error: 'Award not found' },
            { status: 404 }
          );

        case 'ALREADY_ENDED':
          return NextResponse.json(
            { error: 'Award has already been ended' },
            { status: 409 }
          );
      }
    }

    console.error('[SlidingScale End Award] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to end award' },
      { status: 500 }
    );
  }
}
