/**
 * CLIENT MESSAGE POLICY API
 *
 * GET/POST/DELETE /api/practitioner/clients/[clientId]/policy
 *
 * Manage client-specific message policy overrides.
 * If no override exists, the default policy applies.
 *
 * AUTHORIZATION: Session-based. Practitioner can only access their own clients.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import {
  getClientPolicy,
  upsertClientPolicy,
  deleteClientPolicy,
  getEffectivePolicy,
  type CreateMessagePolicyInput,
} from '@/lib/practitioner/messages';

interface RouteParams {
  params: Promise<{ clientId: string }>;
}

/**
 * GET /api/practitioner/clients/[clientId]/policy
 *
 * Get the effective policy for a client.
 * Returns client-specific override if exists, otherwise returns default.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const practitionerId = await requireMemberId();
    const { clientId } = await params;

    // Get client-specific policy (may be null)
    const clientPolicy = await getClientPolicy(practitionerId, clientId);

    // Get effective policy (falls back to default)
    const effectivePolicy = await getEffectivePolicy(practitionerId, clientId);

    if (!effectivePolicy) {
      return NextResponse.json(
        { error: 'No message policy configured' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      policy: effectivePolicy,
      is_override: clientPolicy !== null,
      has_override: clientPolicy !== null,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[Client Policy API] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch policy' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/practitioner/clients/[clientId]/policy
 *
 * Create or update a client-specific policy override.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const practitionerId = await requireMemberId();
    const { clientId } = await params;

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
      if (isNaN(hours) || hours < 1 || hours > 168) {
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

    const policy = await upsertClientPolicy(practitionerId, clientId, input);

    if (!policy) {
      return NextResponse.json(
        { error: 'Client not found or access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ policy, is_override: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[Client Policy API] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to update policy' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/practitioner/clients/[clientId]/policy
 *
 * Delete client-specific policy override (reverts to default).
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const practitionerId = await requireMemberId();
    const { clientId } = await params;

    const deleted = await deleteClientPolicy(practitionerId, clientId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'No client-specific policy found' },
        { status: 404 }
      );
    }

    // Return the effective policy (now the default)
    const effectivePolicy = await getEffectivePolicy(practitionerId, clientId);

    return NextResponse.json({
      deleted: true,
      policy: effectivePolicy,
      is_override: false,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[Client Policy API] DELETE Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete policy' },
      { status: 500 }
    );
  }
}
