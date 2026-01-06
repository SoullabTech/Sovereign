/**
 * GOOGLE CALENDAR CONNECT
 *
 * Initiates the OAuth flow to connect Google Calendar.
 * Returns the authorization URL for the frontend to redirect to.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { GoogleCalendarService } from '@/lib/calendar/GoogleCalendarService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Check if Google Calendar is configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return NextResponse.json({
        success: false,
        error: 'Google Calendar not configured',
        message: 'Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local'
      }, { status: 503 });
    }

    // Get auth URL
    const authUrl = GoogleCalendarService.getAuthUrl(userId);

    if (!authUrl) {
      return NextResponse.json(
        { error: 'Failed to generate auth URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      authUrl,
    });

  } catch (error) {
    console.error('[GoogleConnect] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
