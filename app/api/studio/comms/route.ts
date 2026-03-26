export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO COMMS API — Inbox
 *
 * GET: Unified inbox (threads with latest message preview)
 * POST: Create new thread + first message (compose)
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import crypto from 'crypto';

// NOTE: comms_threads.practitioner_id FK references members(id), not practitioners(id)
// So we use the member_id directly as the "practitioner_id" in comms tables
function getMemberId(memberId: string): string {
  return memberId;
}

// ── GET: Inbox ──
export async function GET(request: NextRequest) {
  try {
    let memberId = await getMemberIdFromRequest(request);
    if (!memberId && process.env.NODE_ENV === 'development') {
      memberId = '00000000-0000-0000-0000-000000000001';
    }
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // comms_threads.practitioner_id FK → members(id), so use memberId directly
    const practitionerId = memberId;

    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain') || 'all';
    const filter = searchParams.get('filter') || 'all';

    const domainFilter = domain === 'all' ? '' : `AND t.domain = '${domain}'`;

    const result = await db.query(
      `SELECT
        t.id as thread_id,
        t.domain,
        t.thread_type,
        t.client_id,
        t.subject,
        t.status,
        t.last_message_at,
        t.created_at,
        COALESCE(pc.name, sc.name, t.participants->'recipient'->>'name', 'Unknown') as client_name,
        COALESCE(pc.email, sc.email, t.participants->'recipient'->>'email') as client_email,
        (SELECT COUNT(*)::int FROM comms_messages m WHERE m.thread_id = t.id AND m.read_at IS NULL AND m.sender_type != 'practitioner') as unread_count,
        (SELECT m2.body FROM comms_messages m2 WHERE m2.thread_id = t.id ORDER BY m2.created_at DESC LIMIT 1) as latest_message,
        (SELECT m2.sender_type FROM comms_messages m2 WHERE m2.thread_id = t.id ORDER BY m2.created_at DESC LIMIT 1) as latest_sender,
        (SELECT m2.created_at FROM comms_messages m2 WHERE m2.thread_id = t.id ORDER BY m2.created_at DESC LIMIT 1) as latest_message_at,
        (SELECT m2.channel_type FROM comms_messages m2 WHERE m2.thread_id = t.id ORDER BY m2.created_at DESC LIMIT 1) as latest_channel
      FROM comms_threads t
      LEFT JOIN practitioner_clients pc ON pc.id = t.client_id
      LEFT JOIN stellium_clients sc ON sc.id = t.client_id
      WHERE t.practitioner_id = $1
        AND t.status = 'active'
        ${domainFilter}
      ORDER BY
        t.last_message_at DESC NULLS LAST,
        t.created_at DESC
      LIMIT 50`,
      [practitionerId]
    );

    // Summary counts
    const summaryResult = await db.query(
      `SELECT
        COUNT(*)::int as total_threads,
        COUNT(*) FILTER (WHERE EXISTS (
          SELECT 1 FROM comms_messages m WHERE m.thread_id = t.id AND m.read_at IS NULL AND m.sender_type != 'practitioner'
        ))::int as unread_threads
      FROM comms_threads t
      WHERE t.practitioner_id = $1 AND t.status = 'active'`,
      [practitionerId]
    );

    return NextResponse.json({
      threads: result.rows,
      summary: summaryResult.rows[0] || { total_threads: 0, unread_threads: 0 },
    });
  } catch (error) {
    console.error('[Studio Comms] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch inbox' }, { status: 500 });
  }
}

// ── POST: Create thread + send first message ──
export async function POST(request: NextRequest) {
  try {
    let memberId = await getMemberIdFromRequest(request);
    if (!memberId && process.env.NODE_ENV === 'development') {
      memberId = '00000000-0000-0000-0000-000000000001';
    }
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // comms_threads.practitioner_id FK → members(id), so use memberId directly
    const practitionerId = memberId;

    const body = await request.json();
    const {
      recipientEmail,
      recipientPhone,
      recipientName,
      subject,
      message,
      domain = 'ops',
      threadType = 'logistics',
      channelType = 'email',
      clientId,
    } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!recipientEmail && !recipientPhone && !clientId) {
      return NextResponse.json({ error: 'Recipient email, phone, or client ID is required' }, { status: 400 });
    }

    // Resolve or create client reference
    let resolvedClientId = clientId;
    if (!resolvedClientId && recipientEmail) {
      // Check stellium_clients first
      const clientResult = await db.query(
        `SELECT id FROM stellium_clients WHERE practitioner_id = $1 AND email = $2`,
        [practitionerId, recipientEmail]
      );
      if (clientResult.rows.length > 0) {
        resolvedClientId = clientResult.rows[0].id;
      } else {
        // Check practitioner_clients
        const pcResult = await db.query(
          `SELECT id FROM practitioner_clients WHERE practitioner_id = $1 AND email = $2`,
          [practitionerId, recipientEmail]
        );
        if (pcResult.rows.length > 0) {
          resolvedClientId = pcResult.rows[0].id;
        }
      }
    }

    // Create thread
    const threadId = crypto.randomUUID();
    await db.query(
      `INSERT INTO comms_threads
       (id, domain, thread_type, practitioner_id, client_id, status, subject, participants, metadata, created_at, updated_at, last_message_at)
       VALUES ($1, $2, $3, $4, $5, 'active', $6, $7, '{}', NOW(), NOW(), NOW())`,
      [
        threadId,
        domain,
        threadType,
        practitionerId,
        resolvedClientId || null,
        subject || null,
        JSON.stringify({
          practitioner: practitionerId,
          recipient: {
            email: recipientEmail || null,
            phone: recipientPhone || null,
            name: recipientName || null,
          },
        }),
      ]
    );

    // Create message
    const messageId = crypto.randomUUID();
    await db.query(
      `INSERT INTO comms_messages
       (id, thread_id, sender_type, sender_id, channel_type, body, message_type, urgency, delivery_status, queued_at, created_at, updated_at)
       VALUES ($1, $2, 'practitioner', $3, $4, $5, 'reply', 'normal', 'queued', NOW(), NOW(), NOW())`,
      [messageId, threadId, practitionerId, channelType, message.trim()]
    );

    // Send via email if channel is email
    if (channelType === 'email' && recipientEmail) {
      const Resend = (await import('resend')).Resend;
      const apiKey = process.env.RESEND_API_KEY;

      if (apiKey) {
        const resend = new Resend(apiKey);
        try {
          // Get practitioner info for from name (practitionerId here is actually memberId)
          const practResult = await db.query(
            `SELECT name, email, business_name FROM practitioners WHERE member_id = $1`,
            [practitionerId]
          );
          const pract = practResult.rows[0];
          const fromName = pract?.business_name || pract?.name || 'Soullab';

          const result = await resend.emails.send({
            from: `${fromName} <comms@soullab.life>`,
            replyTo: pract?.email || 'hello@soullab.life',
            to: recipientEmail,
            subject: subject || 'Message from your practitioner',
            html: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; color: #333; line-height: 1.7;">
              <p>${message.trim().replace(/\n/g, '<br>')}</p>
              <p style="color: #999; font-size: 12px; margin-top: 24px; border-top: 1px solid #eee; padding-top: 12px;">
                Sent via Soullab
              </p>
            </div>`,
            text: message.trim(),
          });

          // Update delivery status
          await db.query(
            `UPDATE comms_messages SET delivery_status = 'sent', sent_at = NOW(), external_message_id = $1 WHERE id = $2`,
            [result.data?.id || null, messageId]
          );
        } catch (emailError) {
          console.error('[Studio Comms] Email send failed:', emailError);
          await db.query(
            `UPDATE comms_messages SET delivery_status = 'failed', delivery_error = $1 WHERE id = $2`,
            [String(emailError), messageId]
          );
        }
      }
    }

    // Send via SMS if channel is sms
    if (channelType === 'sms' && recipientPhone) {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_FROM_NUMBER;

      if (accountSid && authToken && fromNumber) {
        try {
          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
          const params = new URLSearchParams({
            To: recipientPhone,
            From: fromNumber,
            Body: message.trim(),
          });

          const twilioRes = await fetch(twilioUrl, {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          });

          const twilioData = await twilioRes.json();

          if (twilioRes.ok && twilioData.sid) {
            await db.query(
              `UPDATE comms_messages SET delivery_status = 'sent', sent_at = NOW(), external_message_id = $1 WHERE id = $2`,
              [twilioData.sid, messageId]
            );
          } else {
            console.error('[Studio Comms] SMS send failed:', twilioData);
            await db.query(
              `UPDATE comms_messages SET delivery_status = 'failed', delivery_error = $1 WHERE id = $2`,
              [JSON.stringify(twilioData), messageId]
            );
          }
        } catch (smsError) {
          console.error('[Studio Comms] SMS send error:', smsError);
          await db.query(
            `UPDATE comms_messages SET delivery_status = 'failed', delivery_error = $1 WHERE id = $2`,
            [String(smsError), messageId]
          );
        }
      } else {
        console.warn('[Studio Comms] SMS credentials not configured');
      }
    }

    return NextResponse.json({
      success: true,
      threadId,
      messageId,
    });
  } catch (error) {
    console.error('[Studio Comms] POST error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
