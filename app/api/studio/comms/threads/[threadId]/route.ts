export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO COMMS API — Thread
 *
 * GET: Thread messages
 * POST: Reply to thread
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import crypto from 'crypto';

const DEV_PRACTITIONER_ID = '0a93962d-55a2-4deb-ad46-5268ee19be54';

async function getPractitionerId(memberId: string): Promise<string | null> {
  if (process.env.NODE_ENV === 'development') return DEV_PRACTITIONER_ID;
  const result = await db.query(
    'SELECT id FROM practitioners WHERE member_id = $1',
    [memberId]
  );
  return result.rows[0]?.id || DEV_PRACTITIONER_ID;
}

// ── GET: Thread messages ──
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params;

    let memberId = await getMemberIdFromRequest(request);
    if (!memberId && process.env.NODE_ENV === 'development') {
      memberId = '00000000-0000-0000-0000-000000000001';
    }
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerId(memberId);

    // Get thread (fall back to participants JSON for name/email)
    const threadResult = await db.query(
      `SELECT
        t.*,
        COALESCE(pc.name, sc.name, t.participants->'recipient'->>'name', 'Unknown') as client_name,
        COALESCE(pc.email, sc.email, t.participants->'recipient'->>'email') as client_email
      FROM comms_threads t
      LEFT JOIN practitioner_clients pc ON pc.id = t.client_id
      LEFT JOIN stellium_clients sc ON sc.id = t.client_id
      WHERE t.id = $1 AND t.practitioner_id = $2`,
      [threadId, practitionerId]
    );

    if (threadResult.rows.length === 0) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    const thread = threadResult.rows[0];

    // Get messages
    const messagesResult = await db.query(
      `SELECT
        id, sender_type, sender_id, channel_type, body,
        message_type, urgency, delivery_status,
        sent_at, delivered_at, read_at,
        reply_to_id, is_quick_response, quick_response_type,
        created_at
      FROM comms_messages
      WHERE thread_id = $1
      ORDER BY created_at ASC`,
      [threadId]
    );

    // Mark unread messages as read
    await db.query(
      `UPDATE comms_messages
       SET read_at = NOW()
       WHERE thread_id = $1 AND read_at IS NULL AND sender_type != 'practitioner'`,
      [threadId]
    );

    return NextResponse.json({
      thread: {
        id: thread.id,
        domain: thread.domain,
        threadType: thread.thread_type,
        clientId: thread.client_id,
        clientName: thread.client_name,
        clientEmail: thread.client_email,
        subject: thread.subject,
        status: thread.status,
        participants: thread.participants,
        createdAt: thread.created_at,
      },
      messages: messagesResult.rows.map(m => ({
        id: m.id,
        senderType: m.sender_type,
        senderId: m.sender_id,
        channelType: m.channel_type,
        body: m.body,
        messageType: m.message_type,
        urgency: m.urgency,
        deliveryStatus: m.delivery_status,
        sentAt: m.sent_at,
        deliveredAt: m.delivered_at,
        readAt: m.read_at,
        replyToId: m.reply_to_id,
        createdAt: m.created_at,
      })),
    });
  } catch (error) {
    console.error('[Studio Comms Thread] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch thread' }, { status: 500 });
  }
}

// ── POST: Reply to thread ──
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params;

    let memberId = await getMemberIdFromRequest(request);
    if (!memberId && process.env.NODE_ENV === 'development') {
      memberId = '00000000-0000-0000-0000-000000000001';
    }
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerId(memberId);

    // Verify thread belongs to practitioner
    // COALESCE: try client tables first, then fall back to participants JSON
    const threadResult = await db.query(
      `SELECT t.*,
              COALESCE(pc.email, sc.email, t.participants->'recipient'->>'email') as client_email,
              p.name as practitioner_name, p.email as practitioner_email, p.business_name
       FROM comms_threads t
       LEFT JOIN practitioner_clients pc ON pc.id = t.client_id
       LEFT JOIN stellium_clients sc ON sc.id = t.client_id
       JOIN practitioners p ON p.id = t.practitioner_id
       WHERE t.id = $1 AND t.practitioner_id = $2`,
      [threadId, practitionerId]
    );

    if (threadResult.rows.length === 0) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    const thread = threadResult.rows[0];
    const body = await request.json();
    const { message, channelType = 'email' } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Create message
    const messageId = crypto.randomUUID();
    await db.query(
      `INSERT INTO comms_messages
       (id, thread_id, sender_type, sender_id, channel_type, body, message_type, urgency, delivery_status, queued_at, created_at, updated_at)
       VALUES ($1, $2, 'practitioner', $3, $4, $5, 'reply', 'normal', 'queued', NOW(), NOW(), NOW())`,
      [messageId, threadId, practitionerId, channelType, message.trim()]
    );

    // Update thread timestamp
    await db.query(
      `UPDATE comms_threads SET last_message_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [threadId]
    );

    // Send via email
    if (channelType === 'email' && thread.client_email) {
      const Resend = (await import('resend')).Resend;
      const apiKey = process.env.RESEND_API_KEY;

      if (apiKey) {
        const resend = new Resend(apiKey);
        try {
          const fromName = thread.business_name || thread.practitioner_name || 'Soullab';

          const result = await resend.emails.send({
            from: `${fromName} <comms@soullab.life>`,
            replyTo: thread.practitioner_email || 'hello@soullab.life',
            to: thread.client_email,
            subject: thread.subject ? `Re: ${thread.subject}` : 'Message from your practitioner',
            html: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; color: #333; line-height: 1.7;">
              <p>${message.trim().replace(/\n/g, '<br>')}</p>
              <p style="color: #999; font-size: 12px; margin-top: 24px; border-top: 1px solid #eee; padding-top: 12px;">
                Sent via Soullab
              </p>
            </div>`,
            text: message.trim(),
          });

          await db.query(
            `UPDATE comms_messages SET delivery_status = 'sent', sent_at = NOW(), external_message_id = $1 WHERE id = $2`,
            [result.data?.id || null, messageId]
          );
        } catch (emailError) {
          console.error('[Studio Comms Thread] Email send failed:', emailError);
          await db.query(
            `UPDATE comms_messages SET delivery_status = 'failed', delivery_error = $1 WHERE id = $2`,
            [String(emailError), messageId]
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      messageId,
    });
  } catch (error) {
    console.error('[Studio Comms Thread] POST error:', error);
    return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 });
  }
}
