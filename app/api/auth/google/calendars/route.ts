/**
 * LIST GOOGLE CALENDARS
 *
 * Returns all calendars the user has access to.
 * Used for selecting which calendar to use for focus events.
 */

export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { GoogleCalendarService } from '@/lib/calendar/GoogleCalendarService';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Check if connected
    const isConnected = await GoogleCalendarService.isConnected(userId);
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Google Calendar not connected' },
        { status: 401 }
      );
    }

    // Get calendars
    const calendars = await GoogleCalendarService.listCalendars(userId);

    return NextResponse.json({
      success: true,
      calendars,
    });

  } catch (error) {
    console.error('[GoogleCalendars] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
