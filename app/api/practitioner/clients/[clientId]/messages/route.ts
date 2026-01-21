/**
 * CLIENT MESSAGES API
 *
 * GET/POST /api/practitioner/clients/[clientId]/messages
 *
 * Get message thread for a specific client.
 * POST to send a reply to the client.
 *
 * AUTHORIZATION: Session-based. Practitioner can only access their own clients.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import {
  getClientThread,
  sendReply,
  markAllClientMessagesRead,
  type SendReplyInput,
} from '@/lib/practitioner/messages';

interface RouteParams {
  params: Promise<{ clientId: string }>;
}

/**
 * GET /api/practitioner/clients/[clientId]/messages
 *
 * Get the message thread for a specific client.
 * Includes client info, effective policy, and all messages.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const practitionerId = await requireMemberId();
    const { clientId } = await params;

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const markRead = url.searchParams.get('mark_read') === 'true';

    const thread = await getClientThread(practitionerId, clientId, { limit, offset });

    if (!thread) {
      return NextResponse.json(
        { error: 'Client not found or access denied' },
        { status: 403 }
      );
    }

    // Optionally mark all messages as read
    if (markRead && thread.unread_count > 0) {
      await markAllClientMessagesRead(practitionerId, clientId);
      thread.unread_count = 0;
      // Update message statuses in response
      thread.messages = thread.messages.map(m => ({
        ...m,
        status: m.direction === 'client_to_practitioner' && m.status === 'sent'
          ? 'read'
          : m.status,
        read_at: m.direction === 'client_to_practitioner' && !m.read_at
          ? new Date().toISOString()
          : m.read_at,
      }));
    }

    return NextResponse.json({
      thread: {
        client: thread.client,
        policy: thread.policy,
        unread_count: thread.unread_count,
      },
      messages: thread.messages,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[Client Messages API] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/practitioner/clients/[clientId]/messages
 *
 * Send a reply to the client.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const practitionerId = await requireMemberId();
    const { clientId } = await params;

    const body = await request.json();

    // Validate input
    if (!body.body || typeof body.body !== 'string' || body.body.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message body is required' },
        { status: 400 }
      );
    }

    if (body.body.length > 10000) {
      return NextResponse.json(
        { error: 'Message too long (max 10000 characters)' },
        { status: 400 }
      );
    }

    const input: SendReplyInput = {
      body: body.body.trim(),
      is_quick_response: body.is_quick_response || false,
      quick_response_type: body.quick_response_type,
      reply_to_id: body.reply_to_id,
    };

    const message = await sendReply(practitionerId, clientId, input);

    if (!message) {
      return NextResponse.json(
        { error: 'Client not found or access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ message }, { status: 201 });
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

    console.error('[Client Messages API] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
