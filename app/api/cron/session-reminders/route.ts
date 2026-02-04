export const dynamic = 'force-dynamic';

/**
 * SESSION REMINDERS CRON ENDPOINT
 *
 * Called periodically (every 10-15 minutes) to send scheduled reminders
 * Sends BOTH WhatsApp AND SMS for better US coverage
 *
 * Security: Protected by CRON_SECRET header
 *
 * Reminder schedule:
 * - 24 hours before: First reminder
 * - 1 hour before: Final reminder
 */

import { NextRequest, NextResponse } from 'next/server';
import { processScheduledReminders, processPractitionerReminders } from '@/lib/notifications/SessionNotificationService';

// Verify cron secret to prevent unauthorized calls
function verifyCronSecret(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;

  // In development, allow without secret
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  if (!cronSecret) {
    console.warn('[SessionReminders] CRON_SECRET not configured');
    return false;
  }

  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  // Verify authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as '24h' | '1h' | '15m' | 'all' | null;
  const includePractitioner = searchParams.get('practitioner') !== 'false';

  try {
    const clientResults: {
      '24h'?: Awaited<ReturnType<typeof processScheduledReminders>>;
      '1h'?: Awaited<ReturnType<typeof processScheduledReminders>>;
    } = {};

    const practitionerResults: {
      '24h'?: Awaited<ReturnType<typeof processPractitionerReminders>>;
      '1h'?: Awaited<ReturnType<typeof processPractitionerReminders>>;
      '15m'?: Awaited<ReturnType<typeof processPractitionerReminders>>;
    } = {};

    // Process client reminders
    if (type === '24h' || type === 'all' || !type) {
      console.log('[SessionReminders] Processing 24h client reminders...');
      clientResults['24h'] = await processScheduledReminders('24h');
    }

    if (type === '1h' || type === 'all' || !type) {
      console.log('[SessionReminders] Processing 1h client reminders...');
      clientResults['1h'] = await processScheduledReminders('1h');
    }

    // Process practitioner self-reminders (ADHD support)
    if (includePractitioner) {
      if (type === '24h' || type === 'all' || !type) {
        console.log('[SessionReminders] Processing 24h practitioner reminders...');
        practitionerResults['24h'] = await processPractitionerReminders('24h');
      }

      if (type === '1h' || type === 'all' || !type) {
        console.log('[SessionReminders] Processing 1h practitioner reminders...');
        practitionerResults['1h'] = await processPractitionerReminders('1h');
      }

      // 15-minute reminder - extra nudge for ADHD
      if (type === '15m' || type === 'all' || !type) {
        console.log('[SessionReminders] Processing 15m practitioner reminders...');
        practitionerResults['15m'] = await processPractitionerReminders('15m');
      }
    }

    const clientProcessed = (clientResults['24h']?.processed || 0) + (clientResults['1h']?.processed || 0);
    const clientSuccessful = (clientResults['24h']?.successful || 0) + (clientResults['1h']?.successful || 0);
    const clientFailed = (clientResults['24h']?.failed || 0) + (clientResults['1h']?.failed || 0);

    const practitionerProcessed = (practitionerResults['24h']?.processed || 0) +
      (practitionerResults['1h']?.processed || 0) + (practitionerResults['15m']?.processed || 0);
    const practitionerSuccessful = (practitionerResults['24h']?.successful || 0) +
      (practitionerResults['1h']?.successful || 0) + (practitionerResults['15m']?.successful || 0);
    const practitionerFailed = (practitionerResults['24h']?.failed || 0) +
      (practitionerResults['1h']?.failed || 0) + (practitionerResults['15m']?.failed || 0);

    console.log(`[SessionReminders] Complete - Clients: ${clientSuccessful}/${clientProcessed}, Practitioner: ${practitionerSuccessful}/${practitionerProcessed}`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        client: { processed: clientProcessed, successful: clientSuccessful, failed: clientFailed },
        practitioner: { processed: practitionerProcessed, successful: practitionerSuccessful, failed: practitionerFailed },
      },
      details: { client: clientResults, practitioner: practitionerResults },
    });
  } catch (error) {
    console.error('[SessionReminders] Cron error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Send manual reminder for specific session
 */
export async function POST(request: NextRequest) {
  // Verify authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    const { sendManualReminder } = await import('@/lib/notifications/SessionNotificationService');
    const result = await sendManualReminder(sessionId);

    return NextResponse.json({
      success: result.whatsapp.success || result.sms.success,
      sessionId,
      whatsapp: result.whatsapp,
      sms: result.sms,
    });
  } catch (error) {
    console.error('[SessionReminders] Manual reminder error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
