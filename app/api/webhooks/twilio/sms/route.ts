/**
 * TWILIO SMS INBOUND WEBHOOK
 * ==========================
 * Receives inbound SMS from Twilio, verifies signature,
 * resolves client identity, creates/finds thread, inserts message,
 * and enqueues for MAIA analysis.
 *
 * POST /api/webhooks/twilio/sms
 *
 * Twilio sends form-urlencoded POST with:
 *   From, To, Body, MessageSid, NumMedia, MediaUrl0..N
 *
 * Returns empty TwiML <Response/> (200) on success.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db/postgres';
import { TwilioProvider } from '@/lib/comms/providers/TwilioProvider';
import { resolveByAddress, resolvePractitionerByNumber } from '@/lib/comms/IdentityService';
import { findOrCreateThread } from '@/lib/comms/ThreadService';

// Empty TwiML response — Twilio expects this
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

    const { From, To, Body, MessageSid, NumMedia } = params;

    if (!From || !To || !MessageSid) {
      console.error('[Twilio SMS Webhook] Missing required fields');
      return twimlResponse(400);
    }

    // ── 2. Verify Twilio signature ────────────────────────────────────
    const signature = request.headers.get('x-twilio-signature') || '';
    const webhookUrl = `${process.env.BASE_URL || 'https://soullab.life'}/api/webhooks/twilio/sms`;

    // Get auth token for verification
    const authToken = process.env.TWILIO_AUTH_TOKEN || '';

    if (process.env.NODE_ENV === 'production' && authToken) {
      const valid = TwilioProvider.verifyWebhookSignature(webhookUrl, params, signature, authToken);
      if (!valid) {
        console.error('[Twilio SMS Webhook] Invalid signature');
        return twimlResponse(403);
      }
    }

    // ── 3. Idempotency guard (Twilio retries) ─────────────────────────
    const existing = await queryOne<{ id: string }>(
      `SELECT id FROM comms_messages
       WHERE external_message_id = $1
       LIMIT 1`,
      [MessageSid]
    );

    if (existing) {
      // Already processed — acknowledge silently
      return twimlResponse();
    }

    // ── 4. Resolve practitioner by To number ──────────────────────────
    const practitioner = await resolvePractitionerByNumber(To);
    if (!practitioner) {
      console.error(`[Twilio SMS Webhook] No practitioner found for number: ${To}`);
      return twimlResponse();
    }

    const { practitionerId } = practitioner;

    // ── 5. Resolve client identity ────────────────────────────────────
    const identity = await resolveByAddress('sms', From, practitionerId);

    // ── 6. Find or create thread (1 thread per client) ────────────────
    const domain = identity.isKnown ? 'clinical' : 'ops';
    const threadType = identity.isKnown ? 'between_session' : 'logistics';
    const clientId = identity.clientId || identity.identityId; // Use identity ID as fallback

    const thread = await findOrCreateThread(
      practitionerId,
      clientId,
      domain,
      threadType
    );

    // ── 7. Insert message ─────────────────────────────────────────────
    const mediaCount = parseInt(NumMedia || '0', 10);
    const mediaUrls: string[] = [];
    for (let i = 0; i < mediaCount; i++) {
      const url = params[`MediaUrl${i}`];
      if (url) mediaUrls.push(url);
    }

    const message = await queryOne<{ id: string }>(
      `INSERT INTO comms_messages (
         thread_id, sender_type, sender_id,
         channel_type, body, message_type, urgency,
         delivery_status, delivered_at,
         external_message_id
       ) VALUES (
         $1, 'client', $2,
         'sms', $3, NULL, 'normal',
         'delivered', NOW(),
         $4
       ) RETURNING id`,
      [
        thread.id,
        identity.clientId || identity.identityId,
        Body || '',
        MessageSid,
      ]
    );

    if (!message) {
      console.error('[Twilio SMS Webhook] Failed to insert message');
      return twimlResponse(500);
    }

    // ── 8. Update thread last_message_at ──────────────────────────────
    await query(
      `UPDATE comms_threads SET last_message_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [thread.id]
    );

    // ── 9. Enqueue for MAIA analysis (fire-and-forget) ────────────────
    query(
      `INSERT INTO comms_analysis_queue (message_id, thread_id, status)
       VALUES ($1, $2, 'queued')`,
      [message.id, thread.id]
    ).catch(err => {
      console.error('[Twilio SMS Webhook] Failed to enqueue for analysis:', err);
    });

    // ── 10. Audit event (fire-and-forget) ─────────────────────────────
    query(
      `INSERT INTO comms_events (event_type, thread_id, message_id, identity_id, actor_type, actor_id, data)
       VALUES ('message.created', $1, $2, $3, 'client', $4, $5::jsonb)`,
      [
        thread.id,
        message.id,
        identity.identityId,
        identity.clientId || identity.identityId,
        JSON.stringify({
          channel: 'sms',
          direction: 'inbound',
          from: From,
          isUnresolved: identity.isUnresolved,
        }),
      ]
    ).catch(err => {
      console.error('[Twilio SMS Webhook] Failed to emit audit event:', err);
    });

    console.log(`[Twilio SMS Webhook] Inbound SMS processed: ${MessageSid} → thread ${thread.id}`);

    return twimlResponse();
  } catch (error) {
    console.error('[Twilio SMS Webhook] Error:', error);
    return twimlResponse(500);
  }
}
