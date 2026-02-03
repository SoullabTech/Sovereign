/**
 * MICROSOFT OAUTH CALLBACK
 *
 * GET: Handle Microsoft redirect after authorization
 */

import { NextRequest, NextResponse } from 'next/server';
import { MicrosoftGraphService } from '@/lib/calendar/MicrosoftGraphService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // memberId
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth errors
    if (error) {
      console.error('[Microsoft Callback] OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(`/studio/settings?error=microsoft_auth_failed&message=${encodeURIComponent(errorDescription || error)}`, request.url)
      );
    }

    // Validate required params
    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/studio/settings?error=microsoft_auth_invalid', request.url)
      );
    }

    const memberId = state;

    // Exchange code for tokens
    const tokens = await MicrosoftGraphService.exchangeCodeForTokens(code);

    if (!tokens) {
      return NextResponse.redirect(
        new URL('/studio/settings?error=microsoft_token_exchange_failed', request.url)
      );
    }

    // Store tokens
    await MicrosoftGraphService.storeTokens(memberId, tokens);

    // Get user email to store for display
    await MicrosoftGraphService.getUserEmail(memberId);

    // Redirect to settings with success
    return NextResponse.redirect(
      new URL('/studio/settings?success=microsoft_connected', request.url)
    );
  } catch (error) {
    console.error('[Microsoft Callback] Error:', error);
    return NextResponse.redirect(
      new URL('/studio/settings?error=microsoft_auth_error', request.url)
    );
  }
}
