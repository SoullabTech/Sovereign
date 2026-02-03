export const dynamic = 'force-dynamic';

/**
 * MANUAL SESSION REMINDER API
 *
 * Allows practitioners to manually send a reminder for a specific session
 * Sends BOTH WhatsApp and SMS for better coverage
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { sendManualReminder, getSessionForNotification } from '@/lib/notifications/SessionNotificationService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await params;

    // Verify session exists
    const session = await getSessionForNotification(sessionId);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    if (!session.clientPhone) {
      return NextResponse.json(
        { success: false, error: 'Client has no phone number' },
        { status: 400 }
      );
    }

    // Send dual-channel reminder
    const result = await sendManualReminder(sessionId);

    const anySuccess = result.whatsapp.success || result.sms.success;

    return NextResponse.json({
      success: anySuccess,
      sessionId,
      clientName: session.clientName,
      channels: {
        whatsapp: {
          sent: result.whatsapp.success,
          messageId: result.whatsapp.messageId,
          error: result.whatsapp.error,
        },
        sms: {
          sent: result.sms.success,
          messageId: result.sms.messageId,
          error: result.sms.error,
        },
      },
    });
  } catch (error) {
    console.error('[Studio Sessions] Remind error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to send reminder' },
      { status: 500 }
    );
  }
}
