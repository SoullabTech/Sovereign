/**
 * COMMS SPINE: Safety Flag Acknowledge API
 *
 * POST /api/comms/safety/[flagId]/acknowledge
 *   Acknowledge a safety flag
 *
 * AUTHORIZATION: Session-based. Verifies practitioner owns the thread.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { acknowledgeSafetyFlag } from '@/lib/comms/SafetyService';

interface RouteParams {
  params: Promise<{ flagId: string }>;
}

/**
 * POST /api/comms/safety/[flagId]/acknowledge
 *
 * Body:
 * - review_note: string (optional) - practitioner's note about the review
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const practitionerId = await requireMemberId();
    const { flagId } = await params;

    const body = await request.json().catch(() => ({}));
    const { review_note } = body;

    // Validate review_note if provided
    if (review_note !== undefined && typeof review_note !== 'string') {
      return NextResponse.json(
        { error: 'review_note must be a string' },
        { status: 400 }
      );
    }

    if (review_note && review_note.length > 2000) {
      return NextResponse.json(
        { error: 'review_note exceeds 2000 character limit' },
        { status: 400 }
      );
    }

    // Acknowledge the flag
    const flag = await acknowledgeSafetyFlag(practitionerId, flagId, {
      review_note: review_note?.trim(),
    });

    return NextResponse.json({
      success: true,
      flag,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'AUTH_REQUIRED') {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      if (error.message === 'Safety flag not found') {
        return NextResponse.json(
          { error: 'Safety flag not found' },
          { status: 404 }
        );
      }

      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'You do not have permission to acknowledge this safety flag' },
          { status: 403 }
        );
      }

      if (error.message === 'Safety flag already acknowledged') {
        return NextResponse.json(
          { error: 'This safety flag has already been acknowledged' },
          { status: 409 }
        );
      }
    }

    console.error('[Comms Safety Acknowledge API] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to acknowledge safety flag' },
      { status: 500 }
    );
  }
}
