/**
 * WHATSAPP NOTIFICATION API
 *
 * Sends WhatsApp messages via Twilio WhatsApp API
 *
 * Requires:
 * - Twilio account with WhatsApp enabled
 * - WhatsApp-enabled phone number
 * - Environment variables or practitioner integration config
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { WhatsAppProvider } from '@/lib/comms/providers/WhatsAppProvider';
import { resolveSendAuthority } from '@/lib/notifications/sendAuthority';

export const dynamic = 'force-dynamic';

const isDev = process.env.NODE_ENV === 'development';
const whatsappProvider = new WhatsAppProvider();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, message, practitionerId: claimedPractitionerId, mediaUrl } = body;

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
      console.log('[WhatsApp Notifications] Dev mode - would send:');
      console.log('  To:', to);
      console.log('  Message:', message);
      if (mediaUrl) console.log('  Media:', mediaUrl);
      return NextResponse.json({
        success: true,
        devMode: true,
        message: 'WhatsApp logged (dev mode)',
      });
    }

    // Get practitioner's WhatsApp/Twilio credentials from database
    let credentials: {
      account_sid: string;
      auth_token: string;
      whatsapp_number: string;
    } | null = null;

    if (practitionerId) {
      try {
        const result = await query(
          `SELECT config_encrypted
           FROM practitioner_integrations
           WHERE practitioner_id = $1
           AND integration_type = 'whatsapp'
           AND status = 'connected'`,
          [practitionerId]
        );

        if (result.rows.length > 0 && result.rows[0].config_encrypted) {
          const creds = typeof result.rows[0].config_encrypted === 'string'
            ? JSON.parse(result.rows[0].config_encrypted)
            : result.rows[0].config_encrypted;
          credentials = {
            account_sid: creds.account_sid,
            auth_token: creds.auth_token,
            whatsapp_number: creds.whatsapp_number || creds.from_number,
          };
        }
      } catch (error) {
        console.warn('[WhatsApp Notifications] Practitioner credential lookup failed, falling back to env vars:', error instanceof Error ? error.message : error);
      }
    }

    // Fallback to environment variables
    if (!credentials) {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

      if (accountSid && authToken && whatsappNumber) {
        credentials = {
          account_sid: accountSid,
          auth_token: authToken,
          whatsapp_number: whatsappNumber,
        };
      }
    }

    if (!credentials) {
      return NextResponse.json(
        { error: 'WhatsApp not configured. Please set up Twilio WhatsApp integration.' },
        { status: 503 }
      );
    }

    // Send via WhatsApp provider
    const result = await whatsappProvider.send(
      {
        to,
        bodyText: message,
        messageId: `whatsapp-${Date.now()}`,
        practitionerId: practitionerId || 'system',
        tags: mediaUrl ? { mediaUrl } : undefined,
      },
      credentials
    );

    if (!result.success) {
      console.error('[WhatsApp Notifications] Failed to send:', result.errorMessage);
      return NextResponse.json(
        { error: result.errorMessage || 'Failed to send WhatsApp message' },
        { status: 500 }
      );
    }

    console.log(`[WhatsApp Notifications] Message sent to ${to}`);

    return NextResponse.json({
      success: true,
      id: result.externalId,
    });
  } catch (error) {
    console.error('[WhatsApp Notifications] Error:', error);

    if (isDev) {
      console.log('[WhatsApp Notifications] Dev bypass: returning success');
      return NextResponse.json({
        success: true,
        devMode: true,
        message: 'WhatsApp logged (dev mode - error bypassed)',
      });
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
