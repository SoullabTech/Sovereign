/**
 * EMAIL NOTIFICATION API
 *
 * Sends email reminders for practitioner sessions
 * Uses Resend for delivery
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/sendEmail';
import { resolveSendAuthority } from '@/lib/notifications/sendAuthority';

export const dynamic = 'force-dynamic';

const isDev = process.env.NODE_ENV === 'development';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, body: emailBody, practitionerId: claimedPractitionerId } = body;

    // Authority to send is resolved from the verified session, never the body.
    // The caller may request a delivery; the server decides whose credentials
    // may perform it. Fails closed. See lib/notifications/sendAuthority.
    const auth = await resolveSendAuthority(request, claimedPractitionerId);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const practitionerId = auth.practitionerId;

    if (!to || !subject || !emailBody) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, body' },
        { status: 400 }
      );
    }

    // Dev bypass: log and return success
    if (isDev) {
      console.log('[Email Notifications] Dev mode - would send:');
      console.log('  To:', to);
      console.log('  Subject:', subject);
      console.log('  Body:', emailBody);
      return NextResponse.json({
        success: true,
        devMode: true,
        message: 'Email logged (dev mode)',
      });
    }

    const result = await sendEmail({
      purpose: 'reminder:session',
      from: 'Session Reminder <reminders@soullab.life>',
      to,
      subject,
      text: emailBody,
      html: generateReminderHtml(emailBody),
      tags: [
        { name: 'type', value: 'session-reminder' },
        { name: 'practitioner', value: practitionerId || 'unknown' },
      ],
    });

    // Never report a reminder as sent on a refusal. `not_configured` keeps its
    // distinct 503 so an unconfigured environment stays diagnosable.
    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error ?? 'Could not send the reminder.',
          failureKind: result.failureKind ?? 'unclassified',
          retryable: result.retryable === true,
        },
        { status: result.status === 'not_configured' ? 503 : 502 }
      );
    }

    return NextResponse.json({
      success: true,
      id: result.id,
    });
  } catch (error) {
    console.error('[Email Notifications] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

function generateReminderHtml(body: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #251F33 0%, #2D2640 100%); padding: 24px; text-align: center;">
              <h1 style="margin: 0; color: #E5C158; font-size: 20px; font-weight: 600;">Session Reminder</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0; color: #333; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${body}</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8f8f8; border-top: 1px solid #e5e5e5; text-align: center;">
              <p style="margin: 0; color: #999; font-size: 12px;">
                Sent via Soullab
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
