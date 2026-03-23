/**
 * PORTAL THREAD API
 * =================
 * Cookie-authenticated access to a client's unified comms thread.
 * This is the primary messaging endpoint for the portal — all messages
 * land in comms_messages as channel_type='in_app'.
 *
 * GET  /api/portal/[slug]/thread — fetch thread + messages
 * POST /api/portal/[slug]/thread — send a message
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db/postgres';
import { requireClientSession } from '@/lib/auth/clientSession';

/**
 * GET — Fetch the client's thread and messages
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await requireClientSession(slug);
    if (session instanceof NextResponse) return session;

    const { clientId, practitionerId } = session;

    // Find the client's active thread
    const thread = await queryOne<{
      id: string;
      domain: string;
      thread_type: string;
      last_message_at: string | null;
    }>(
      `SELECT id, domain, thread_type, last_message_at
       FROM comms_threads
       WHERE practitioner_id = $1
         AND client_id = $2
         AND domain = 'clinical'
         AND thread_type = 'between_session'
         AND status = 'active'
       LIMIT 1`,
      [practitionerId, clientId]
    );

    if (!thread) {
      return NextResponse.json({
        thread_id: null,
        messages: [],
        practitioner_name: null,
      });
    }

    // Fetch messages (most recent 50)
    const messagesResult = await query<{
      id: string;
      sender_type: string;
      channel_type: string;
      body: string;
      message_type: string | null;
      urgency: string;
      created_at: string;
    }>(
      `SELECT id, sender_type, channel_type, body, message_type, urgency, created_at
       FROM comms_messages
       WHERE thread_id = $1
       ORDER BY created_at ASC
       LIMIT 50`,
      [thread.id]
    );

    // Get practitioner name
    const practitioner = await queryOne<{ name: string }>(
      `SELECT m.name
       FROM practitioners p
       JOIN members m ON m.id = p.member_id
       WHERE p.member_id = $1`,
      [practitionerId]
    );

    // Mark client messages as read
    query(
      `UPDATE comms_messages
       SET read_at = NOW(), delivery_status = 'read'
       WHERE thread_id = $1
         AND sender_type = 'practitioner'
         AND read_at IS NULL`,
      [thread.id]
    ).catch(() => {});

    return NextResponse.json({
      thread_id: thread.id,
      messages: messagesResult.rows,
      practitioner_name: practitioner?.name || 'Your Practitioner',
    });
  } catch (error) {
    console.error('[Portal Thread API] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch thread' }, { status: 500 });
  }
}

/**
 * POST — Send a message in the thread
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await requireClientSession(slug);
    if (session instanceof NextResponse) return session;

    const { clientId, practitionerId } = session;

    const body = await request.json().catch(() => ({}));
    const messageBody = (body?.body || '').trim();
    const messageType = body?.message_type || null;
    const urgency = body?.urgency || 'normal';

    if (!messageBody) {
      return NextResponse.json({ error: 'Message body is required' }, { status: 400 });
    }

    if (messageBody.length > 5000) {
      return NextResponse.json({ error: 'Message too long (max 5000 chars)' }, { status: 400 });
    }

    // Validate urgency
    if (!['normal', 'time_sensitive', 'safety_concern'].includes(urgency)) {
      return NextResponse.json({ error: 'Invalid urgency level' }, { status: 400 });
    }

    // Find thread
    const thread = await queryOne<{ id: string }>(
      `SELECT id FROM comms_threads
       WHERE practitioner_id = $1
         AND client_id = $2
         AND domain = 'clinical'
         AND thread_type = 'between_session'
         AND status = 'active'
       LIMIT 1`,
      [practitionerId, clientId]
    );

    if (!thread) {
      return NextResponse.json({ error: 'No active thread found' }, { status: 404 });
    }

    // Insert message into comms_messages
    const message = await queryOne<{ id: string; created_at: string }>(
      `INSERT INTO comms_messages (
         thread_id, sender_type, sender_id,
         channel_type, body, message_type, urgency,
         delivery_status, delivered_at
       ) VALUES (
         $1, 'client', $2,
         'in_app', $3, $4, $5,
         'delivered', NOW()
       ) RETURNING id, created_at`,
      [thread.id, clientId, messageBody, messageType, urgency]
    );

    if (!message) {
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    // Update thread timestamp
    query(
      `UPDATE comms_threads SET last_message_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [thread.id]
    ).catch(() => {});

    // Enqueue for MAIA analysis (fire-and-forget)
    query(
      `INSERT INTO comms_analysis_queue (message_id, thread_id, status)
       VALUES ($1, $2, 'queued')`,
      [message.id, thread.id]
    ).catch(() => {});

    // Audit event (fire-and-forget)
    query(
      `INSERT INTO comms_events (event_type, thread_id, message_id, actor_type, actor_id, data)
       VALUES ('message.created', $1, $2, 'client', $3, $4::jsonb)`,
      [thread.id, message.id, clientId, JSON.stringify({
        channel: 'in_app',
        direction: 'inbound',
        source: 'portal',
      })]
    ).catch(() => {});

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        created_at: message.created_at,
        body: messageBody,
        sender_type: 'client',
        channel_type: 'in_app',
        urgency,
      },
    });
  } catch (error) {
    console.error('[Portal Thread API] POST error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
