export const dynamic = 'force-dynamic';

/**
 * Google OAuth Initiation
 *
 * GET /api/auth/google - Redirects to Google's OAuth consent screen
 *
 * Required env vars:
 * - GOOGLE_CLIENT_ID
 * - GOOGLE_CLIENT_SECRET
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { randomBytes } from 'crypto';

// Generate secure state token for CSRF protection
function generateState(): string {
  return randomBytes(32).toString('hex');
}

export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.error('[GOOGLE AUTH] Missing GOOGLE_CLIENT_ID');
      return NextResponse.redirect(new URL('/signin?error=oauth_not_configured', request.url));
    }

    // Generate state for CSRF protection
    const state = generateState();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store state in database
    try {
      await query(
        'INSERT INTO oauth_states (state, provider, expires_at) VALUES ($1, $2, $3)',
        [state, 'google', expiresAt]
      );
    } catch (dbError) {
      // If table doesn't exist, create it on the fly
      console.log('[GOOGLE AUTH] Creating oauth_states table...');
      await query(`
        CREATE TABLE IF NOT EXISTS oauth_states (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          state VARCHAR(64) NOT NULL UNIQUE,
          provider VARCHAR(20) NOT NULL,
          redirect_uri TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '10 minutes'
        )
      `);
      await query(
        'INSERT INTO oauth_states (state, provider, expires_at) VALUES ($1, $2, $3)',
        [state, 'google', expiresAt]
      );
    }

    // Build Google OAuth URL - use NEXTAUTH_URL for production
    const baseUrl = process.env.NEXTAUTH_URL || process.env.BASE_URL || new URL(request.url).origin;
    const redirectUri = `${baseUrl}/api/auth/signin/google/callback`;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state: state,
      access_type: 'offline',
      prompt: 'select_account', // Always show account selector
    });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    console.log('[GOOGLE AUTH] Redirecting to Google OAuth');
    return NextResponse.redirect(googleAuthUrl);
  } catch (error) {
    console.error('[GOOGLE AUTH] Error:', error);
    return NextResponse.redirect(new URL('/signin?error=oauth_error', request.url));
  }
}
