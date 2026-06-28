/**
 * TWILIO SMS STATUS CALLBACK
 *
 * Twilio POSTs delivery status updates (sent / delivered / undelivered / failed)
 * here for messages sent via /api/notifications/sms. This closes the truth loop:
 * a synchronous "accepted" only means Twilio took the message — this endpoint
 * records whether it was actually delivered or failed.
 *
 * Public at the session layer (config/accessMatrix.ts) because Twilio has no
 * MAIA session — it is authenticated instead by the X-Twilio-Signature header.
 *
 * Sovereignty: persists ONLY message SID + provider status + error code/message.
 * No recipient phone number, no message body.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { validateTwilioSignature } from '@/lib/comms/twilioSignature';

export const dynamic = 'force-dynamic';

// Must match the StatusCallback URL set on the outbound message (TwilioProvider).
// Twilio computes its signature over this exact URL.
const CALLBACK_URL =
  process.env.TWILIO_STATUS_CALLBACK_URL ||
  'https://soullab.life/api/notifications/sms/status';

export async function POST(request: NextRequest) {
  try {
    const raw = await request.text();
    const params: Record<string, string> = {};
    new URLSearchParams(raw).forEach((value, key) => {
      params[key] = value;
    });

    // Authenticate the request as genuinely from Twilio.
    const signature = request.headers.get('x-twilio-signature');
    const authToken = process.env.TWILIO_AUTH_TOKEN || '';
    if (!validateTwilioSignature(authToken, CALLBACK_URL, params, signature)) {
      console.warn('[SMS Status] Rejected: invalid or missing X-Twilio-Signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    const sid = params.MessageSid || params.SmsSid;
    const status = params.MessageStatus || params.SmsStatus;
    if (!sid || !status) {
      return NextResponse.json(
        { error: 'Missing MessageSid/MessageStatus' },
        { status: 400 },
      );
    }
    const errorCode = params.ErrorCode || null;
    const errorMessage = params.ErrorMessage || null;

    // Monotonic upsert by SID. Status may advance through the lifecycle but must
    // never regress: Twilio callbacks can arrive out of order (a late "queued"
    // after "delivered"), so the WHERE guard keeps the more-advanced state.
    // sms_status_rank (migration 20260611000002) makes this an atomic, race-safe
    // comparison. Self-sufficient — the callback may arrive before/without the
    // send-path insert.
    const upsert = await query(
      `INSERT INTO sms_delivery_status (message_sid, status, error_code, error_message, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (message_sid)
       DO UPDATE SET status = EXCLUDED.status,
                     error_code = EXCLUDED.error_code,
                     error_message = EXCLUDED.error_message,
                     updated_at = NOW()
       WHERE sms_status_rank(EXCLUDED.status) >= sms_status_rank(sms_delivery_status.status)`,
      [sid, status, errorCode, errorMessage],
    );

    // rowCount === 0 on an existing SID means the monotonic guard rejected a
    // non-advancing (out-of-order) callback — the more-advanced state is kept.
    if ((upsert.rowCount ?? 0) === 0) {
      console.log(`[SMS Status] ignored non-advancing sid=${sid} status=${status} (kept current)`);
    } else if (status === 'delivered') {
      console.log(`[SMS Status] delivered sid=${sid}`);
    } else if (status === 'failed' || status === 'undelivered') {
      console.error(
        `[SMS Status] ${status} sid=${sid} code=${errorCode ?? 'none'} msg=${errorMessage ?? 'none'}`,
      );
    } else {
      console.log(`[SMS Status] update sid=${sid} status=${status}`);
    }

    // Twilio ignores the body; 204 is sufficient. (Non-2xx triggers retries.)
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // Return 500 so Twilio retries (transient DB issues can recover). Signature
    // and validation failures already returned 4xx above and are not retried.
    console.error(
      '[SMS Status] handler error:',
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
