/**
 * GOOGLE OAUTH CALLBACK
 *
 * Handles the OAuth callback from Google after user grants calendar access.
 * Exchanges the authorization code for tokens and stores them.
 */

export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { GoogleCalendarService } from '@/lib/calendar/GoogleCalendarService';

export async function GET(request: NextRequest) {
  // Handle static generation gracefully
  let searchParams: URLSearchParams;
  try {
    searchParams = request.nextUrl.searchParams;
  } catch {
    // During static export, return placeholder redirect
    return NextResponse.json({ error: 'Static export mode' }, { status: 503 });
  }

  try {
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // userId
    const error = searchParams.get('error');

    // Handle user denial
    if (error) {
      console.log('[GoogleCallback] User denied access:', error);
      return NextResponse.redirect(new URL('/settings?error=access_denied', request.url));
    }

    // Validate required params
    if (!code || !state) {
      console.error('[GoogleCallback] Missing code or state');
      return NextResponse.redirect(new URL('/settings?error=missing_params', request.url));
    }

    const userId = state;

    // Exchange code for tokens
    const tokens = await GoogleCalendarService.exchangeCodeForTokens(code);

    if (!tokens) {
      console.error('[GoogleCallback] Token exchange failed');
      return NextResponse.redirect(new URL('/settings?error=auth_failed', request.url));
    }

    // Store tokens
    await GoogleCalendarService.storeTokens(userId, tokens);

    console.log(`[GoogleCallback] Successfully connected Google Calendar for user ${userId}`);

    // Redirect to success page
    return NextResponse.redirect(new URL('/settings?calendar=connected', request.url));

  } catch (error) {
    console.error('[GoogleCallback] Error:', error);
    return NextResponse.redirect(new URL('/settings?error=server_error', request.url));
  }
}
