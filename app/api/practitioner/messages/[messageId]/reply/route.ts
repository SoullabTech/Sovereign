/**
 * MESSAGE REPLY API
 *
 * POST /api/practitioner/messages/[messageId]/reply
 *
 * Send a reply to a specific message.
 * The message's client_id is used to determine the recipient.
 *
 * AUTHORIZATION: Session-based. Practitioner can only reply to their own messages.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import {
  getMessage,
  sendReply,
  sendQuickResponse,
  type QuickResponseType,
  QUICK_RESPONSES,
} from '@/lib/practitioner/messages';

interface RouteParams {
  params: Promise<{ messageId: string }>;
}

/**
 * POST /api/practitioner/messages/[messageId]/reply
 *
 * Body options:
 * - body: string (required unless quick_response)
 * - quick_response: 'noted' | 'discuss_next_session' | 'acknowledged'
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const practitionerId = await requireMemberId();
    const { messageId } = await params;

    // Get the original message to find the client
    const originalMessage = await getMessage(practitionerId, messageId);

    if (!originalMessage) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Handle quick response
    if (body.quick_response) {
      const responseType = body.quick_response as QuickResponseType;
      if (!QUICK_RESPONSES[responseType]) {
        return NextResponse.json(
          { error: `Invalid quick response type. Valid options: ${Object.keys(QUICK_RESPONSES).join(', ')}` },
          { status: 400 }
        );
      }

      const reply = await sendQuickResponse(
        practitionerId,
        originalMessage.client_id,
        responseType,
        messageId
      );

      if (!reply) {
        return NextResponse.json(
          { error: 'Failed to send reply' },
          { status: 500 }
        );
      }

      return NextResponse.json({ message: reply }, { status: 201 });
    }

    // Handle custom reply
    if (!body.body || typeof body.body !== 'string' || body.body.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message body is required (or use quick_response)' },
        { status: 400 }
      );
    }

    if (body.body.length > 10000) {
      return NextResponse.json(
        { error: 'Message too long (max 10000 characters)' },
        { status: 400 }
      );
    }

    const reply = await sendReply(practitionerId, originalMessage.client_id, {
      body: body.body.trim(),
      reply_to_id: messageId,
    });

    if (!reply) {
      return NextResponse.json(
        { error: 'Failed to send reply' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: reply }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message === 'Replies are disabled for this client') {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    console.error('[Message Reply API] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to send reply' },
      { status: 500 }
    );
  }
}
