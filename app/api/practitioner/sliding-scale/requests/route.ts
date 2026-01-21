/**
 * SLIDING SCALE REQUESTS LIST API
 *
 * GET /api/practitioner/sliding-scale/requests
 *
 * List sliding scale requests for the practitioner.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { listRequests, getPendingCount } from '@/lib/practitioner/slidingScale';

/**
 * GET /api/practitioner/sliding-scale/requests
 *
 * Query params:
 * - status: 'pending' | 'approved' | 'declined' | 'withdrawn' | 'expired'
 * - limit: number (default 50)
 * - offset: number (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    const practitionerId = await requireMemberId();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as
      | 'pending'
      | 'approved'
      | 'declined'
      | 'withdrawn'
      | 'expired'
      | null;
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '50', 10));
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const { requests, total } = await listRequests(practitionerId, {
      status: status || undefined,
      limit,
      offset,
    });

    // Also get pending count for badge display
    const pendingCount = await getPendingCount(practitionerId);

    return NextResponse.json({
      requests,
      total,
      pending_count: pendingCount,
      pagination: {
        limit,
        offset,
        has_more: offset + requests.length < total,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[SlidingScale Requests] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}
