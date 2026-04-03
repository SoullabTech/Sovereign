/**
 * GOOGLE OAUTH CALLBACK
 *
 * Handles the OAuth callback from Google after user grants calendar access.
 * Exchanges the authorization code for tokens and stores them.
 */


// Production requires force-dynamic for per-user database access
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { GoogleCalendarService } from '@/lib/calendar/GoogleCalendarService';
import { upsertConnector } from '@/lib/connectors/connectorDb';

// Get the base URL for redirects (production domain or request origin)
function getBaseUrl(request: NextRequest): string {
  // Always use production domain in production
  if (process.env.NODE_ENV === 'production') {
    return 'https://soullab.life';
  }
  // In development, use the request origin
  return request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
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

    const baseUrl = getBaseUrl(request);

    // Handle user denial
    if (error) {
      console.log('[GoogleCallback] User denied access:', error);
      return NextResponse.redirect(new URL('/account/settings?error=access_denied', baseUrl));
    }

    // Validate required params
    if (!code || !state) {
      console.error('[GoogleCallback] Missing code or state');
      return NextResponse.redirect(new URL('/account/settings?error=missing_params', baseUrl));
    }

    const userId = state;

    // Exchange code for tokens
    const tokens = await GoogleCalendarService.exchangeCodeForTokens(code);

    if (!tokens) {
      console.error('[GoogleCallback] Token exchange failed');
      return NextResponse.redirect(new URL('/account/settings?error=auth_failed', baseUrl));
    }

    // Store tokens
    await GoogleCalendarService.storeTokens(userId, tokens);

    console.log(`[GoogleCallback] Successfully connected Google Calendar for user ${userId}`);

    // Register in service_connectors for unified connector list
    upsertConnector(userId, 'google', {
      connectorClass: 'oauth',
      status: 'connected',
      displayName: 'Google',
      capabilities: ['send_email', 'create_calendar_event', 'read_calendar', 'read_contacts'],
    }).catch((err) => {
      console.error('[GoogleCallback] Failed to register in service_connectors:', err.message);
    });

    // Redirect to success page
    return NextResponse.redirect(new URL('/account/settings?calendar=connected', baseUrl));

  } catch (error) {
    console.error('[GoogleCallback] Error:', error);
    const baseUrl = getBaseUrl(request);
    return NextResponse.redirect(new URL('/account/settings?error=server_error', baseUrl));
  }
}
