/**
 * SLIDING SCALE REQUEST DETAIL API
 *
 * GET /api/practitioner/sliding-scale/requests/[requestId]
 *
 * Get details of a specific sliding scale request.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { getRequest } from '@/lib/practitioner/slidingScale';

interface RouteParams {
  params: Promise<{ requestId: string }>;
}

/**
 * GET /api/practitioner/sliding-scale/requests/[requestId]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const practitionerId = await requireMemberId();
    const { requestId } = await params;

    const slidingRequest = await getRequest(requestId);

    if (!slidingRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (slidingRequest.practitioner_id !== practitionerId) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ request: slidingRequest });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[SlidingScale Request Detail] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch request' },
      { status: 500 }
    );
  }
}
