/**
 * GOOGLE CONNECTION STATUS
 *
 * Check if a user has connected their Google account (Calendar + Gmail).
 *
 * MAIL-04c: the subject is the SESSION's member. A `?userId=` query parameter
 * previously let any caller read whether an arbitrary account had a connected
 * Google identity, and its address — an enumeration surface over connected
 * accounts. It is now ignored.
 */


// Production requires force-dynamic for per-user database access
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { GoogleCalendarService } from '@/lib/calendar/GoogleCalendarService';
import { GmailService } from '@/lib/gmail/GmailService';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  // Handle static generation gracefully
  let userId: string | null = null;
  try {
    // Subject from the session. `?userId=` is deliberately not read.
    userId = await getMemberIdFromRequest(request);
  } catch {
    // During static export, return default response
    return NextResponse.json({
      configured: false,
      connected: false,
      email: null,
      message: 'Static export mode'
    });
  }

  try {

    if (!userId) {
      return NextResponse.json(
        { error: 'Sign in to view Google connection status' },
        { status: 401 }
      );
    }

    // Check configuration
    const isConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

    if (!isConfigured) {
      return NextResponse.json({
        configured: false,
        connected: false,
        email: null,
        message: 'Google integration not configured'
      });
    }

    // Check if user has connected
    const isConnected = await GoogleCalendarService.isConnected(userId);

    // Get user's email if connected
    let email: string | null = null;
    if (isConnected) {
      email = await GmailService.getUserEmail(userId);
    }

    return NextResponse.json({
      configured: true,
      connected: isConnected,
      email,
    });

  } catch (error) {
    console.error('[GoogleStatus] Error:', error);

    // Graceful degradation if table doesn't exist yet
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('relation') || message.includes('does not exist')) {
      return NextResponse.json({
        configured: true,
        connected: false,
        email: null,
        message: 'Database migration pending'
      });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
