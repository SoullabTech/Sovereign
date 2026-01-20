/**
 * GMAIL SEND API
 *
 * Sends an email via Gmail on behalf of the authenticated user.
 * Used by Avoidance Breaker to send drafted messages.
 */

import { NextRequest, NextResponse } from 'next/server';
import { GmailService } from '@/lib/gmail/GmailService';

export const dynamic = 'force-dynamic';

interface SendEmailRequest {
  userId: string;
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SendEmailRequest = await request.json();
    const { userId, to, subject, body: emailBody, cc, bcc } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (!to) {
      return NextResponse.json(
        { error: 'Recipient (to) is required' },
        { status: 400 }
      );
    }

    if (!subject || !emailBody) {
      return NextResponse.json(
        { error: 'Subject and body are required' },
        { status: 400 }
      );
    }

    // Check if user has Gmail permission
    const hasPermission = await GmailService.hasGmailPermission(userId);
    if (!hasPermission) {
      return NextResponse.json({
        success: false,
        error: 'Gmail not connected',
        needsReauth: true,
        message: 'Please reconnect Google with Gmail send permission.',
      }, { status: 401 });
    }

    // Send the email
    const result = await GmailService.sendEmail(userId, {
      to,
      subject,
      body: emailBody,
      cc,
      bcc,
    });

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
        needsReauth: result.error?.includes('permission') || result.error?.includes('reconnect'),
      }, { status: 400 });
    }

    console.log(`[GmailSend] Email sent to ${to} for user ${userId}`);

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      threadId: result.threadId,
      message: `Email sent to ${to}`,
    });

  } catch (error) {
    console.error('[GmailSend] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Check Gmail connection status
 */
export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  const userId = request.nextUrl.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'userId is required' },
      { status: 400 }
    );
  }

  const hasPermission = await GmailService.hasGmailPermission(userId);
  const userEmail = hasPermission ? await GmailService.getUserEmail(userId) : null;

  return NextResponse.json({
    connected: hasPermission,
    email: userEmail,
  });
}
