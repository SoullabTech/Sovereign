/**
 * SMS NOTIFICATION API
 *
 * Sends SMS reminders for practitioner sessions
 * Uses Twilio for delivery
 *
 * Requires practitioner to have Twilio credentials configured
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { TwilioProvider } from '@/lib/comms/providers/TwilioProvider';
import { resolveSendAuthority } from '@/lib/notifications/sendAuthority';

export const dynamic = 'force-dynamic';

const isDev = process.env.NODE_ENV === 'development';
const twilioProvider = new TwilioProvider();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, message, practitionerId: claimedPractitionerId } = body;

    // Authority to send is resolved from the verified session, never the body.
    // The caller may request a delivery; the server decides whose credentials
    // may perform it. Fails closed. See lib/notifications/sendAuthority.
    const auth = await resolveSendAuthority(request, claimedPractitionerId);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const practitionerId = auth.practitionerId;

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, message' },
        { status: 400 }
      );
    }

    // Dev bypass: log and return success
    if (isDev) {
      console.log('[SMS Notifications] Dev mode - would send:');
      console.log('  To:', to);
      console.log('  Message:', message);
      return NextResponse.json({
        success: true,
        devMode: true,
        message: 'SMS logged (dev mode)',
      });
    }

    // Get practitioner's Twilio credentials from database
    let credentials: {
      account_sid: string;
      auth_token: string;
      from_number: string;
      messaging_service_sid?: string;
    } | null = null;

    if (practitionerId) {
      try {
        const result = await query(
          `SELECT config_encrypted
           FROM practitioner_integrations
           WHERE practitioner_id = $1
           AND integration_type = 'sms'
           AND status = 'connected'`,
          [practitionerId]
        );

        if (result.rows.length > 0 && result.rows[0].config_encrypted) {
          const config = typeof result.rows[0].config_encrypted === 'string'
            ? JSON.parse(result.rows[0].config_encrypted)
            : result.rows[0].config_encrypted;
          if (config.account_sid && config.auth_token && config.from_number) {
            credentials = config;
          }
        }
      } catch (error) {
        console.warn('[SMS Notifications] Practitioner credential lookup failed, falling back to env vars:', error instanceof Error ? error.message : error);
      }
    }

    // Fallback to environment variables if no practitioner credentials
    if (!credentials) {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_FROM_NUMBER;
      const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

      if (accountSid && authToken && (fromNumber || messagingServiceSid)) {
        credentials = {
          account_sid: accountSid,
          auth_token: authToken,
          from_number: fromNumber || '',
          messaging_service_sid: messagingServiceSid,
        };
      }
    }

    if (!credentials) {
      return NextResponse.json(
        { error: 'SMS service not configured. Please set up Twilio integration.' },
        { status: 503 }
      );
    }

    // Send via Twilio
    const result = await twilioProvider.send(
      {
        to,
        bodyText: message,
        messageId: `sms-${Date.now()}`,
        practitionerId: practitionerId || 'system',
      },
      credentials
    );

    if (!result.success) {
      // Surface the real Twilio reason (code + message + status) in the log and the
      // API response so failures are truthful instead of a generic "Failed to send SMS".
      // Do NOT log result.rawResponse — for a message resource it can contain the
      // recipient number and message body. The code/message/status are content-free.
      console.error('[SMS Notifications] Failed to send:', {
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
        status: result.status,
      });
      return NextResponse.json(
        {
          error:
            result.errorMessage ||
            `SMS send failed (${result.errorCode || result.status || 'unknown error'})`,
          errorCode: result.errorCode ?? null,
          status: result.status ?? null,
        },
        { status: 500 }
      );
    }

    // Record the initial delivery state so the async StatusCallback has a row to
    // update. "accepted" = Twilio received it; delivered/failed arrive later.
    // Best-effort: never fail the send response on a bookkeeping error.
    if (result.externalId) {
      try {
        const initialStatus =
          (result.rawResponse as { status?: string } | undefined)?.status || 'accepted';
        await query(
          `INSERT INTO sms_delivery_status (message_sid, status)
           VALUES ($1, $2)
           ON CONFLICT (message_sid) DO NOTHING`,
          [result.externalId, initialStatus],
        );
      } catch (e) {
        console.warn(
          '[SMS Notifications] sms_delivery_status insert failed:',
          e instanceof Error ? e.message : e,
        );
      }
    }

    console.log(`[SMS Notifications] Reminder sent to ${to}`);

    return NextResponse.json({
      success: true,
      id: result.externalId,
    });
  } catch (error) {
    console.error('[SMS Notifications] Error:', error);

    // Dev bypass on error
    if (isDev) {
      console.log('[SMS Notifications] Dev bypass: returning success');
      return NextResponse.json({
        success: true,
        devMode: true,
        message: 'SMS logged (dev mode - error bypassed)',
      });
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
