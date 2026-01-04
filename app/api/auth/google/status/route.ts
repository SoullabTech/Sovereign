/**
 * GOOGLE CALENDAR STATUS
 *
 * Check if a user has connected their Google Calendar.
 */

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

    // Check configuration
    const isConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

    if (!isConfigured) {
      return NextResponse.json({
        configured: false,
        connected: false,
        message: 'Google Calendar integration not configured'
      });
    }

    // Check if user has connected
    const isConnected = await GoogleCalendarService.isConnected(userId);

    return NextResponse.json({
      configured: true,
      connected: isConnected,
    });

  } catch (error) {
    console.error('[GoogleStatus] Error:', error);

    // Graceful degradation if table doesn't exist yet
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('relation') || message.includes('does not exist')) {
      return NextResponse.json({
        configured: true,
        connected: false,
        message: 'Database migration pending'
      });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
