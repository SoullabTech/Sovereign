/**
 * GOOGLE CALENDAR CONNECT
 *
 * Initiates the OAuth flow to connect Google Calendar.
 * Returns the authorization URL for the frontend to redirect to.
 *
 * MAIL-04c (2026-09-07)
 * ====================
 * This route previously took `userId` from the request body and embedded it in
 * the OAuth `state`, so the caller chose which account the resulting Google
 * credentials would be stored under. The actor is now resolved from a verified
 * session, and `state` is an opaque single-use transaction whose member binding
 * lives server-side.
 *
 *   a caller may not choose the SENDING IDENTITY
 *
 * the same rule as MAIL-04a's destination constraint, one axis over.
 */


export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { GoogleCalendarService } from '@/lib/calendar/GoogleCalendarService';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { beginOAuthTransaction } from '@/lib/auth/googleOAuthState';
import { getClientIP } from '@/lib/auth/rateLimiter';

export async function POST(request: NextRequest) {
  try {
    // Authority from the session, never from the body. A `userId` in the
    // request is ignored rather than honoured — reading it at all would invite
    // it back.
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json(
        { error: 'Sign in to connect a Google account' },
        { status: 401 }
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

    // Opaque, expiring, single-use. The member binding is recorded server-side
    // and never travels in the URL.
    const state = await beginOAuthTransaction(memberId, getClientIP(request));
    const authUrl = GoogleCalendarService.getAuthUrl(state);

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
