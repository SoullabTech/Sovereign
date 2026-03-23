/**
 * TWILIO VOICE/CALL STATUS WEBHOOK
 * =================================
 * Logs call events (initiated, ringing, answered, completed) to comms threads.
 *
 * POST /api/webhooks/twilio/voice
 *
 * Twilio sends form-urlencoded POST with:
 *   CallSid, CallStatus, From, To, CallDuration, Direction
 *
 * Only 'completed' calls create a message in the thread.
 * Other statuses log to comms_events only.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db/postgres';
import { TwilioProvider } from '@/lib/comms/providers/TwilioProvider';
import { resolveByAddress, resolvePractitionerByNumber } from '@/lib/comms/IdentityService';
import { findOrCreateThread } from '@/lib/comms/ThreadService';

const TWIML_OK = '<Response/>';

function twimlResponse(status = 200) {
  return new NextResponse(TWIML_OK, {
    status,
    headers: { 'Content-Type': 'text/xml' },
  });
}

export async function POST(request: NextRequest) {
  try {
    // ── 1. Parse form-urlencoded body ─────────────────────────────────
    const formData = await request.text();
    const params: Record<string, string> = {};
    new URLSearchParams(formData).forEach((value, key) => {
      params[key] = value;
    });

    const { CallSid, CallStatus, From, To, CallDuration, Direction } = params;

    if (!CallSid || !CallStatus) {
      console.error('[Twilio Voice Webhook] Missing required fields');
      return twimlResponse(400);
    }

    // ── 2. Verify Twilio signature ────────────────────────────────────
    const signature = request.headers.get('x-twilio-signature') || '';
    const webhookUrl = `${process.env.BASE_URL || 'https://soullab.life'}/api/webhooks/twilio/voice`;
    const authToken = process.env.TWILIO_AUTH_TOKEN || '';

    if (process.env.NODE_ENV === 'production' && authToken) {
      const valid = TwilioProvider.verifyWebhookSignature(webhookUrl, params, signature, authToken);
      if (!valid) {
        console.error('[Twilio Voice Webhook] Invalid signature');
        return twimlResponse(403);
      }
    }

    // ── 3. Only process completed calls as messages ───────────────────
    const status = CallStatus.toLowerCase();

    if (status !== 'completed') {
      // Log non-terminal statuses as events only (fire-and-forget)
      if (['initiated', 'ringing', 'in-progress'].includes(status)) {
        query(
          `INSERT INTO comms_events (event_type, actor_type, data)
           VALUES ('ops.call_status', 'system', $1::jsonb)`,
          [JSON.stringify({
            callSid: CallSid,
            status: CallStatus,
            from: From,
            to: To,
            direction: Direction,
          })]
        ).catch(() => {});
      }
      return twimlResponse();
    }

    // ── 4. Idempotency guard ──────────────────────────────────────────
    const existing = await queryOne<{ id: string }>(
      `SELECT id FROM comms_messages
       WHERE external_message_id = $1
       LIMIT 1`,
      [CallSid]
    );

    if (existing) {
      return twimlResponse();
    }

    // ── 5. Resolve practitioner and client ────────────────────────────
    // For inbound calls, To = practice number, From = client
    // For outbound calls, From = practice number, To = client
    const isInbound = Direction === 'inbound';
    const practiceNumber = isInbound ? To : From;
    const clientNumber = isInbound ? From : To;

    const practitioner = await resolvePractitionerByNumber(practiceNumber || '');
    if (!practitioner) {
      console.error(`[Twilio Voice Webhook] No practitioner for number: ${practiceNumber}`);
      return twimlResponse();
    }

    const identity = await resolveByAddress('voice', clientNumber || '', practitioner.practitionerId);

    // ── 6. Find or create thread ──────────────────────────────────────
    const domain = identity.isKnown ? 'clinical' : 'ops';
    const threadType = identity.isKnown ? 'between_session' : 'logistics';
    const clientId = identity.clientId || identity.identityId;

    const thread = await findOrCreateThread(
      practitioner.practitionerId,
      clientId,
      domain,
      threadType
    );

    // ── 7. Insert call log message ────────────────────────────────────
    const duration = parseInt(CallDuration || '0', 10);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const durationStr = minutes > 0
      ? `${minutes}m ${seconds}s`
      : `${seconds}s`;

    const directionLabel = isInbound ? 'Inbound' : 'Outbound';

    const message = await queryOne<{ id: string }>(
      `INSERT INTO comms_messages (
         thread_id, sender_type, sender_id,
         channel_type, body, message_type, urgency,
         delivery_status, delivered_at,
         external_message_id
       ) VALUES (
         $1, $2, $3,
         'voice', $4, NULL, 'normal',
         'delivered', NOW(),
         $5
       ) RETURNING id`,
      [
        thread.id,
        isInbound ? 'client' : 'practitioner',
        isInbound ? (identity.clientId || identity.identityId) : practitioner.practitionerId,
        `${directionLabel} call — ${durationStr}`,
        CallSid,
      ]
    );

    if (!message) {
      console.error('[Twilio Voice Webhook] Failed to insert call log');
      return twimlResponse(500);
    }

    // ── 8. Update thread ──────────────────────────────────────────────
    await query(
      `UPDATE comms_threads SET last_message_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [thread.id]
    );

    // ── 9. Audit event (fire-and-forget) ──────────────────────────────
    query(
      `INSERT INTO comms_events (event_type, thread_id, message_id, identity_id, actor_type, actor_id, data)
       VALUES ('message.created', $1, $2, $3, $4, $5, $6::jsonb)`,
      [
        thread.id,
        message.id,
        identity.identityId,
        isInbound ? 'client' : 'practitioner',
        isInbound ? (identity.clientId || identity.identityId) : practitioner.practitionerId,
        JSON.stringify({
          channel: 'voice',
          direction: isInbound ? 'inbound' : 'outbound',
          durationSeconds: duration,
        }),
      ]
    ).catch(() => {});

    console.log(`[Twilio Voice Webhook] Call logged: ${CallSid} (${durationStr}) → thread ${thread.id}`);

    return twimlResponse();
  } catch (error) {
    console.error('[Twilio Voice Webhook] Error:', error);
    return twimlResponse(500);
  }
}
