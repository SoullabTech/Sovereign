/**
 * SLIDING SCALE POLICY API
 *
 * GET/POST /api/practitioner/sliding-scale/policy
 *
 * Manage the practitioner's sliding scale policy.
 * Controls availability, rate bounds, and capacity.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import {
  getPolicy,
  upsertPolicy,
  getDashboardCounts,
  type PolicyInput,
} from '@/lib/practitioner/slidingScale';

/**
 * GET /api/practitioner/sliding-scale/policy
 *
 * Get the practitioner's sliding scale policy + dashboard counts.
 */
export async function GET() {
  try {
    const practitionerId = await requireMemberId();

    const [policy, counts] = await Promise.all([
      getPolicy(practitionerId),
      getDashboardCounts(practitionerId),
    ]);

    if (!policy) {
      // Return defaults if no policy exists
      return NextResponse.json({
        policy: null,
        counts: {
          pending_requests: 0,
          active_awards: 0,
          spots_available: 0,
        },
        defaults: {
          is_enabled: false,
          public_label: 'Sliding scale availability',
          public_description: null,
          min_rate_cents: 0,
          max_rate_cents: 15000, // $150 default
          session_length_minutes: 60,
          currency: 'USD',
          spots_total: 0,
          request_form_enabled: true,
          auto_close_when_full: true,
          intake_prompt:
            'If cost is a barrier, share what feels sustainable right now—briefly is fine.',
        },
      });
    }

    return NextResponse.json({ policy, counts });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[SlidingScale Policy] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch policy' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/practitioner/sliding-scale/policy
 *
 * Create or update the practitioner's sliding scale policy.
 */
export async function POST(request: NextRequest) {
  try {
    const practitionerId = await requireMemberId();

    const body = await request.json();

    // Validate and build input
    const input: PolicyInput = {};

    if (body.is_enabled !== undefined) {
      input.is_enabled = Boolean(body.is_enabled);
    }

    if (body.public_label !== undefined) {
      if (typeof body.public_label !== 'string' || body.public_label.length > 100) {
        return NextResponse.json(
          { error: 'public_label must be a string under 100 characters' },
          { status: 400 }
        );
      }
      input.public_label = body.public_label;
    }

    if (body.public_description !== undefined) {
      if (typeof body.public_description !== 'string' || body.public_description.length > 500) {
        return NextResponse.json(
          { error: 'public_description must be a string under 500 characters' },
          { status: 400 }
        );
      }
      input.public_description = body.public_description;
    }

    if (body.min_rate_cents !== undefined) {
      const rate = parseInt(body.min_rate_cents, 10);
      if (isNaN(rate) || rate < 0) {
        return NextResponse.json(
          { error: 'min_rate_cents must be a non-negative integer' },
          { status: 400 }
        );
      }
      input.min_rate_cents = rate;
    }

    if (body.max_rate_cents !== undefined) {
      const rate = parseInt(body.max_rate_cents, 10);
      if (isNaN(rate) || rate < 0) {
        return NextResponse.json(
          { error: 'max_rate_cents must be a non-negative integer' },
          { status: 400 }
        );
      }
      input.max_rate_cents = rate;
    }

    if (body.session_length_minutes !== undefined) {
      const minutes = parseInt(body.session_length_minutes, 10);
      if (isNaN(minutes) || minutes < 15 || minutes > 180) {
        return NextResponse.json(
          { error: 'session_length_minutes must be between 15 and 180' },
          { status: 400 }
        );
      }
      input.session_length_minutes = minutes;
    }

    if (body.currency !== undefined) {
      if (typeof body.currency !== 'string' || body.currency.length !== 3) {
        return NextResponse.json(
          { error: 'currency must be a 3-letter currency code' },
          { status: 400 }
        );
      }
      input.currency = body.currency.toUpperCase();
    }

    if (body.spots_total !== undefined) {
      const spots = parseInt(body.spots_total, 10);
      if (isNaN(spots) || spots < 0) {
        return NextResponse.json(
          { error: 'spots_total must be a non-negative integer' },
          { status: 400 }
        );
      }
      input.spots_total = spots;
    }

    if (body.request_form_enabled !== undefined) {
      input.request_form_enabled = Boolean(body.request_form_enabled);
    }

    if (body.auto_close_when_full !== undefined) {
      input.auto_close_when_full = Boolean(body.auto_close_when_full);
    }

    if (body.intake_prompt !== undefined) {
      if (typeof body.intake_prompt !== 'string' || body.intake_prompt.length > 500) {
        return NextResponse.json(
          { error: 'intake_prompt must be a string under 500 characters' },
          { status: 400 }
        );
      }
      input.intake_prompt = body.intake_prompt;
    }

    const policy = await upsertPolicy(practitionerId, input);

    return NextResponse.json({ policy });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'AUTH_REQUIRED') {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      if (error.message === 'INVALID_RATE_ORDER') {
        return NextResponse.json(
          { error: 'Minimum rate cannot exceed maximum rate' },
          { status: 400 }
        );
      }

      if (error.message === 'SPOTS_BELOW_FILLED') {
        return NextResponse.json(
          { error: 'Cannot reduce spots below current active awards' },
          { status: 409 }
        );
      }
    }

    console.error('[SlidingScale Policy] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to update policy' },
      { status: 500 }
    );
  }
}
