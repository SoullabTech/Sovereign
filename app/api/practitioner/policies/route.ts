/**
 * MESSAGE POLICIES API
 *
 * GET/POST /api/practitioner/policies
 *
 * Manage the practitioner's default message policy.
 * This controls between-session messaging boundaries.
 *
 * AUTHORIZATION: Session-based. Practitioner ID derived from session.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import {
  getDefaultPolicy,
  upsertDefaultPolicy,
  type CreateMessagePolicyInput,
} from '@/lib/practitioner/messages';

/**
 * GET /api/practitioner/policies
 *
 * Get the practitioner's default message policy.
 */
export async function GET() {
  try {
    const practitionerId = await requireMemberId();

    const policy = await getDefaultPolicy(practitionerId);

    if (!policy) {
      // Return a default configuration if none exists
      return NextResponse.json({
        policy: null,
        defaults: {
          check_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          check_window_start: '09:00',
          check_window_end: '17:00',
          timezone: 'America/New_York',
          max_response_hours: 48,
          crisis_copy: 'This is not monitored 24/7. If you are in crisis, please call 988 or text HOME to 741741.',
          allow_client_messages: true,
          allow_practitioner_reply: true,
        },
      });
    }

    return NextResponse.json({ policy });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[Policies API] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch policy' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/practitioner/policies
 *
 * Create or update the practitioner's default message policy.
 */
export async function POST(request: NextRequest) {
  try {
    const practitionerId = await requireMemberId();

    const body = await request.json();

    // Validate input
    const input: CreateMessagePolicyInput = {};

    if (body.check_days !== undefined) {
      if (!Array.isArray(body.check_days)) {
        return NextResponse.json(
          { error: 'check_days must be an array' },
          { status: 400 }
        );
      }
      const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const invalidDays = body.check_days.filter((d: string) => !validDays.includes(d.toLowerCase()));
      if (invalidDays.length > 0) {
        return NextResponse.json(
          { error: `Invalid days: ${invalidDays.join(', ')}` },
          { status: 400 }
        );
      }
      input.check_days = body.check_days.map((d: string) => d.toLowerCase());
    }

    if (body.check_window_start !== undefined) {
      if (!/^\d{2}:\d{2}$/.test(body.check_window_start)) {
        return NextResponse.json(
          { error: 'check_window_start must be in HH:MM format' },
          { status: 400 }
        );
      }
      input.check_window_start = body.check_window_start;
    }

    if (body.check_window_end !== undefined) {
      if (!/^\d{2}:\d{2}$/.test(body.check_window_end)) {
        return NextResponse.json(
          { error: 'check_window_end must be in HH:MM format' },
          { status: 400 }
        );
      }
      input.check_window_end = body.check_window_end;
    }

    if (body.timezone !== undefined) {
      input.timezone = body.timezone;
    }

    if (body.max_response_hours !== undefined) {
      const hours = parseInt(body.max_response_hours, 10);
      if (isNaN(hours) || hours < 1 || hours > 168) { // Max 1 week
        return NextResponse.json(
          { error: 'max_response_hours must be between 1 and 168' },
          { status: 400 }
        );
      }
      input.max_response_hours = hours;
    }

    if (body.crisis_copy !== undefined) {
      if (typeof body.crisis_copy !== 'string' || body.crisis_copy.length > 1000) {
        return NextResponse.json(
          { error: 'crisis_copy must be a string under 1000 characters' },
          { status: 400 }
        );
      }
      input.crisis_copy = body.crisis_copy;
    }

    if (body.allow_client_messages !== undefined) {
      input.allow_client_messages = Boolean(body.allow_client_messages);
    }

    if (body.allow_practitioner_reply !== undefined) {
      input.allow_practitioner_reply = Boolean(body.allow_practitioner_reply);
    }

    const policy = await upsertDefaultPolicy(practitionerId, input);

    return NextResponse.json({ policy }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[Policies API] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to update policy' },
      { status: 500 }
    );
  }
}
