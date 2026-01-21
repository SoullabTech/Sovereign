/**
 * SINGLE MESSAGE API
 *
 * GET/PATCH /api/practitioner/messages/[messageId]
 *
 * Get or update a single message.
 * PATCH can mark as read or review safety concerns.
 *
 * AUTHORIZATION: Session-based. Practitioner can only access their own messages.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import {
  getMessage,
  markMessageRead,
  reviewSafetyConcern,
} from '@/lib/practitioner/messages';

interface RouteParams {
  params: Promise<{ messageId: string }>;
}

/**
 * GET /api/practitioner/messages/[messageId]
 *
 * Get a single message by ID.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const practitionerId = await requireMemberId();
    const { messageId } = await params;

    const message = await getMessage(practitionerId, messageId);

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[Message API] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch message' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/practitioner/messages/[messageId]
 *
 * Update a message:
 * - mark_read: true - mark as read
 * - review_safety: true - acknowledge safety concern
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const practitionerId = await requireMemberId();
    const { messageId } = await params;

    const body = await request.json();

    let message = null;

    if (body.mark_read === true) {
      message = await markMessageRead(practitionerId, messageId);
    }

    if (body.review_safety === true) {
      message = await reviewSafetyConcern(practitionerId, messageId);
    }

    if (!message) {
      // Try to get the message to see if it exists
      const existing = await getMessage(practitionerId, messageId);
      if (!existing) {
        return NextResponse.json(
          { error: 'Message not found' },
          { status: 404 }
        );
      }
      // Message exists but no update was made
      message = existing;
    }

    return NextResponse.json({ message });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[Message API] PATCH Error:', error);
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    );
  }
}
