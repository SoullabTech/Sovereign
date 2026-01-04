/**
 * TEST ROUTE: Gmail Send
 *
 * Quick way to test Gmail integration without going through conversation flow.
 *
 * Usage: POST /api/test/gmail-send
 * Body: { "to": "recipient@example.com", "subject": "Test", "body": "Hello" }
 */

import { NextRequest, NextResponse } from 'next/server';
import { GmailService } from '@/lib/gmail/GmailService';

export const dynamic = 'force-static';

const TEST_USER_ID = 'soullab1@gmail.com';

export async function GET() {
  // Check connection status
  const hasPermission = await GmailService.hasGmailPermission(TEST_USER_ID);
  const email = hasPermission ? await GmailService.getUserEmail(TEST_USER_ID) : null;

  return NextResponse.json({
    status: hasPermission ? 'connected' : 'not_connected',
    email,
    usage: {
      method: 'POST',
      body: {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        body: 'Test email body',
      },
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { to, subject, body } = await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, body' },
        { status: 400 }
      );
    }

    const result = await GmailService.sendEmail(TEST_USER_ID, {
      to,
      subject,
      body,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send email', details: String(error) },
      { status: 500 }
    );
  }
}
