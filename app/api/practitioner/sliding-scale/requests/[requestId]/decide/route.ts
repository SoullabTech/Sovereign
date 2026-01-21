/**
 * SLIDING SCALE REQUEST DECISION API
 *
 * POST /api/practitioner/sliding-scale/requests/[requestId]/decide
 *
 * Approve or decline a sliding scale request.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { decideRequest, getRequest, getPolicy } from '@/lib/practitioner/slidingScale';

interface RouteParams {
  params: Promise<{ requestId: string }>;
}

/**
 * POST /api/practitioner/sliding-scale/requests/[requestId]/decide
 *
 * Body:
 * - decision: 'approve' | 'decline' (required)
 * - approved_rate_cents: number (required for approve)
 * - decision_note: string (optional, de-identified)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const practitionerId = await requireMemberId();
    const { requestId } = await params;

    const body = await request.json();

    // Validate decision
    if (!body.decision || !['approve', 'decline'].includes(body.decision)) {
      return NextResponse.json(
        { error: 'decision must be "approve" or "decline"' },
        { status: 400 }
      );
    }

    // For approve, validate rate
    if (body.decision === 'approve') {
      if (body.approved_rate_cents === undefined) {
        return NextResponse.json(
          { error: 'approved_rate_cents is required for approval' },
          { status: 400 }
        );
      }

      const rate = parseInt(body.approved_rate_cents, 10);
      if (isNaN(rate) || rate < 0) {
        return NextResponse.json(
          { error: 'approved_rate_cents must be a non-negative integer' },
          { status: 400 }
        );
      }

      // Check bounds against policy
      const policy = await getPolicy(practitionerId);
      if (!policy) {
        return NextResponse.json(
          { error: 'No sliding scale policy configured' },
          { status: 400 }
        );
      }

      if (rate < policy.min_rate_cents || rate > policy.max_rate_cents) {
        return NextResponse.json(
          {
            error: `Rate must be between ${policy.min_rate_cents} and ${policy.max_rate_cents} cents`,
            bounds: {
              min: policy.min_rate_cents,
              max: policy.max_rate_cents,
            },
          },
          { status: 400 }
        );
      }
    }

    // Validate decision note length
    if (body.decision_note !== undefined) {
      if (typeof body.decision_note !== 'string' || body.decision_note.length > 500) {
        return NextResponse.json(
          { error: 'decision_note must be a string under 500 characters' },
          { status: 400 }
        );
      }
    }

    const result = await decideRequest(requestId, practitionerId, {
      decision: body.decision,
      approved_rate_cents: body.approved_rate_cents
        ? parseInt(body.approved_rate_cents, 10)
        : undefined,
      decision_note: body.decision_note,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case 'AUTH_REQUIRED':
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );

        case 'REQUEST_NOT_FOUND':
          return NextResponse.json(
            { error: 'Request not found' },
            { status: 404 }
          );

        case 'OWNERSHIP_MISMATCH':
          return NextResponse.json(
            { error: 'Request not found' },
            { status: 404 }
          );

        case 'ALREADY_DECIDED':
          // Return current status
          const current = await getRequest((await params).requestId);
          return NextResponse.json(
            {
              error: 'Request has already been decided',
              current_status: current?.status,
            },
            { status: 409 }
          );

        case 'CAPACITY_FULL':
          return NextResponse.json(
            { error: 'No sliding scale spots available' },
            { status: 409 }
          );

        case 'RATE_OUT_OF_BOUNDS':
          return NextResponse.json(
            { error: 'Approved rate is outside policy bounds' },
            { status: 400 }
          );

        case 'RATE_REQUIRED':
          return NextResponse.json(
            { error: 'Approved rate is required for approval' },
            { status: 400 }
          );

        case 'NO_POLICY':
          return NextResponse.json(
            { error: 'No sliding scale policy configured' },
            { status: 400 }
          );
      }
    }

    console.error('[SlidingScale Decide] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to process decision' },
      { status: 500 }
    );
  }
}
