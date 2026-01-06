/**
 * CREATE GOOGLE CALENDAR
 *
 * Creates a new calendar in the user's Google account.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { GoogleCalendarService } from '@/lib/calendar/GoogleCalendarService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, description } = body;

    if (!userId || !name) {
      return NextResponse.json(
        { error: 'userId and name are required' },
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

    // Create calendar
    const calendar = await GoogleCalendarService.createCalendar(userId, name, description);

    if (!calendar) {
      return NextResponse.json(
        { error: 'Failed to create calendar' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      calendar,
    });

  } catch (error) {
    console.error('[CreateCalendar] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
