/**
 * COMMS SPINE: Thread API
 *
 * GET /api/comms/threads/[threadId]
 *   Get full thread with messages and context
 *
 * PATCH /api/comms/threads/[threadId]
 *   Update thread (archive, mark read, etc.)
 *
 * AUTHORIZATION: Session-based. Verifies practitioner owns thread.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { getThread, markMessagesRead } from '@/lib/comms/ThreadService';

interface RouteParams {
  params: Promise<{ threadId: string }>;
}

/**
 * GET /api/comms/threads/[threadId]
 *
 * Returns:
 * - thread: Thread metadata
 * - context: Client info, policy, spiral stage, etc.
 * - messages: All messages with safety flags
 * - unread_count: Number of unread messages
 *
 * Query params:
 * - mark_read: boolean (default: false) - mark all as read on fetch
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const practitionerId = await requireMemberId();
    const { threadId } = await params;

    const url = new URL(request.url);
    const markRead = url.searchParams.get('mark_read') === 'true';

    // Get thread with context and messages
    const threadData = await getThread(practitionerId, threadId);

    if (!threadData) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    // Optionally mark all messages as read
    if (markRead && threadData.unread_count > 0) {
      await markMessagesRead(practitionerId, threadId);
      threadData.unread_count = 0;
    }

    // Transform to UI expected format
    const messages = threadData.messages.map((m: any) => ({
      id: m.id,
      sender_type: m.sender_type,
      sender_id: m.sender_id,
      body: m.body,
      message_type: m.message_type,
      urgency: m.urgency,
      delivery_status: markRead && m.sender_type === 'client' ? 'read' : m.delivery_status,
      read_at: markRead && m.sender_type === 'client' && !m.read_at
        ? new Date().toISOString()
        : m.read_at,
      created_at: m.created_at,
      is_quick_response: m.is_quick_response || false,
      quick_response_type: m.quick_response_type,
      maia_analysis: m.maia_analysis || null,
      safety_flags: m.safety_flag ? [{
        id: m.safety_flag.id,
        severity: m.safety_flag.severity,
        cues: m.safety_flag.detected_cues || [],
        acknowledged_at: m.safety_flag.acknowledged_at,
        recommended_action: null, // TODO: add to query
      }] : [],
    }));

    const response = {
      thread: {
        thread_id: threadData.thread.id,
        domain: threadData.thread.domain,
        thread_type: threadData.thread.thread_type,
        client: threadData.context.client ? {
          id: threadData.context.client.id,
          name: threadData.context.client.preferred_name || threadData.context.client.name,
          email: undefined, // Not fetched currently
          spiral_stage: threadData.context.client.spiral_stage,
          last_session: threadData.context.client.last_session,
        } : null,
        policy: threadData.context.policy ? {
          check_days: threadData.context.policy.check_days_formatted?.split(', ') || [],
          check_window_start: threadData.context.policy.check_window?.split(' - ')[0] || '09:00',
          check_window_end: threadData.context.policy.check_window?.split(' - ')[1] || '17:00',
          timezone: threadData.context.policy.timezone || 'America/New_York',
          max_response_hours: threadData.context.policy.max_response_hours || 48,
          crisis_copy: threadData.context.policy.crisis_copy || '',
          outbound_enabled: true, // Default to enabled
        } : null,
      },
      messages,
      unread_count: threadData.unread_count,
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[Comms Thread API] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch thread' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/comms/threads/[threadId]
 *
 * Body:
 * - status: 'active' | 'archived' | 'closed'
 * - mark_all_read: boolean
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const practitionerId = await requireMemberId();
    const { threadId } = await params;

    const body = await request.json();
    const { status, mark_all_read } = body;

    // Verify thread exists and belongs to practitioner
    const threadData = await getThread(practitionerId, threadId);
    if (!threadData) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    // Handle mark all read
    if (mark_all_read) {
      const count = await markMessagesRead(practitionerId, threadId);
      return NextResponse.json({
        success: true,
        messages_marked_read: count,
      });
    }

    // Handle status change (future implementation)
    if (status) {
      // TODO: Implement status update
      return NextResponse.json(
        { error: 'Status update not yet implemented' },
        { status: 501 }
      );
    }

    return NextResponse.json(
      { error: 'No valid update provided' },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[Comms Thread API] PATCH Error:', error);
    return NextResponse.json(
      { error: 'Failed to update thread' },
      { status: 500 }
    );
  }
}
