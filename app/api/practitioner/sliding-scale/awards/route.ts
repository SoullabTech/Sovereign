/**
 * SLIDING SCALE AWARDS LIST API
 *
 * GET /api/practitioner/sliding-scale/awards
 *
 * List active sliding scale awards for the practitioner.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { listAwards } from '@/lib/practitioner/slidingScale';

/**
 * GET /api/practitioner/sliding-scale/awards
 *
 * Query params:
 * - status: 'active' | 'paused' | 'ended' (default 'active')
 * - limit: number (default 100)
 */
export async function GET(request: NextRequest) {
  try {
    const practitionerId = await requireMemberId();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as
      | 'active'
      | 'paused'
      | 'ended'
      | null;
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '100', 10));

    const awards = await listAwards(practitionerId, {
      status: status || 'active',
      limit,
    });

    return NextResponse.json({ awards });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[SlidingScale Awards] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch awards' },
      { status: 500 }
    );
  }
}
