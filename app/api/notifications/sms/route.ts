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

export const dynamic = 'force-dynamic';

const isDev = process.env.NODE_ENV === 'development';
const twilioProvider = new TwilioProvider();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, message, practitionerId } = body;

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
    } | null = null;

    if (practitionerId) {
      const result = await query(
        `SELECT credentials_data
         FROM practitioner_integrations
         WHERE practitioner_id = $1
         AND integration_type = 'twilio'
         AND is_active = true`,
        [practitionerId]
      );

      if (result.rows.length > 0 && result.rows[0].credentials_data) {
        credentials = result.rows[0].credentials_data;
      }
    }

    // Fallback to environment variables if no practitioner credentials
    if (!credentials) {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_FROM_NUMBER;

      if (accountSid && authToken && fromNumber) {
        credentials = {
          account_sid: accountSid,
          auth_token: authToken,
          from_number: fromNumber,
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
      console.error('[SMS Notifications] Failed to send:', result.errorMessage);
      return NextResponse.json(
        { error: result.errorMessage || 'Failed to send SMS' },
        { status: 500 }
      );
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
