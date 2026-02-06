export const dynamic = 'force-dynamic';

/**
 * CALENDAR SYNC API
 *
 * POST: Trigger bulk sync of unsynced MAIA sessions to Google Calendar
 * Returns count of synced, failed, and skipped sessions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { syncAllPendingSessions } from '@/lib/calendar/syncSessionToGoogle';
import { GoogleCalendarService } from '@/lib/calendar/GoogleCalendarService';

export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check if Google Calendar is connected
    const connected = await GoogleCalendarService.isConnected(memberId);
    if (!connected) {
      return NextResponse.json({
        success: false,
        error: 'Google Calendar is not connected. Connect it from Settings first.',
      }, { status: 400 });
    }

    const result = await syncAllPendingSessions(memberId);

    return NextResponse.json({
      success: true,
      ...result,
      message: result.synced > 0
        ? `Synced ${result.synced} session${result.synced !== 1 ? 's' : ''} to Google Calendar`
        : 'No sessions needed syncing',
    });
  } catch (error) {
    console.error('[Calendar Sync] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync sessions' },
      { status: 500 }
    );
  }
}
