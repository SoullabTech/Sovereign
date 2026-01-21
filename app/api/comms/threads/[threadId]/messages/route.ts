/**
 * COMMS SPINE: Thread Messages API
 *
 * POST /api/comms/threads/[threadId]/messages
 *   Send a message in the thread (practitioner reply)
 *
 * AUTHORIZATION: Session-based. Verifies practitioner owns thread.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { sendMessage, getThread } from '@/lib/comms/ThreadService';
import { QUICK_RESPONSE_TEMPLATES } from '@/lib/comms/types';
import type {
  SendMessageInput,
  CommsChannelType,
  CommsMessageType,
  CommsUrgency,
  CommsQuickResponseType,
} from '@/lib/comms/types';

interface RouteParams {
  params: Promise<{ threadId: string }>;
}

/**
 * POST /api/comms/threads/[threadId]/messages
 *
 * Body:
 * - body: string (required unless using quick_response)
 * - channel_type: 'in_app' | 'email' | 'sms' (default: 'in_app')
 * - message_type: string (default: 'reply')
 * - urgency: 'normal' | 'time_sensitive' | 'safety_concern' (default: 'normal')
 * - is_quick_response: boolean
 * - quick_response_type: 'noted' | 'discuss_next_session' | 'acknowledged'
 * - reply_to_id: string (optional, for threading)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const practitionerId = await requireMemberId();
    const { threadId } = await params;

    const body = await request.json();

    // Handle quick response
    let messageBody = body.body;
    let isQuickResponse = body.is_quick_response || false;
    let quickResponseType = body.quick_response_type as CommsQuickResponseType | undefined;

    if (body.quick_response_type && !body.body) {
      // Use template for quick response
      const template = QUICK_RESPONSE_TEMPLATES[body.quick_response_type as CommsQuickResponseType];
      if (!template) {
        return NextResponse.json(
          { error: 'Invalid quick_response_type' },
          { status: 400 }
        );
      }
      messageBody = template.body;
      isQuickResponse = true;
      quickResponseType = body.quick_response_type;
    }

    // Validate body
    if (!messageBody || typeof messageBody !== 'string' || messageBody.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message body is required' },
        { status: 400 }
      );
    }

    if (messageBody.length > 10000) {
      return NextResponse.json(
        { error: 'Message body exceeds 10,000 character limit' },
        { status: 400 }
      );
    }

    // Validate channel_type
    const validChannels: CommsChannelType[] = ['in_app', 'email', 'sms'];
    if (body.channel_type && !validChannels.includes(body.channel_type)) {
      return NextResponse.json(
        { error: 'Invalid channel_type. Must be in_app, email, or sms.' },
        { status: 400 }
      );
    }

    // Validate urgency
    const validUrgency: CommsUrgency[] = ['normal', 'time_sensitive', 'safety_concern'];
    if (body.urgency && !validUrgency.includes(body.urgency)) {
      return NextResponse.json(
        { error: 'Invalid urgency. Must be normal, time_sensitive, or safety_concern.' },
        { status: 400 }
      );
    }

    // Build input
    const input: SendMessageInput = {
      body: messageBody.trim(),
      channel_type: body.channel_type || 'in_app',
      message_type: body.message_type || 'reply',
      urgency: body.urgency || 'normal',
      is_quick_response: isQuickResponse,
      quick_response_type: quickResponseType,
      reply_to_id: body.reply_to_id,
    };

    // Send message
    const message = await sendMessage(practitionerId, threadId, input);

    return NextResponse.json(
      { message },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'AUTH_REQUIRED') {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      if (error.message === 'Thread not found') {
        return NextResponse.json(
          { error: 'Thread not found' },
          { status: 404 }
        );
      }

      if (error.message === 'Outbound messages disabled for this thread') {
        return NextResponse.json(
          { error: 'Outbound messages are disabled for this thread' },
          { status: 403 }
        );
      }
    }

    console.error('[Comms Messages API] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
