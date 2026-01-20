// Static during Capacitor build (returns stub), dynamic at runtime on server
export const dynamic = 'force-static';

/**
 * Apple Sign-In OAuth Initiation
 *
 * GET /api/auth/apple - Redirects to Apple's OAuth consent screen
 *
 * Required env vars:
 * - APPLE_CLIENT_ID (Service ID, e.g., "life.soullab.signin")
 * - APPLE_TEAM_ID
 * - APPLE_KEY_ID
 * - APPLE_PRIVATE_KEY (contents of .p8 file)
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { randomBytes } from 'crypto';

function generateState(): string {
  return randomBytes(32).toString('hex');
}

export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const clientId = process.env.APPLE_CLIENT_ID;

    if (!clientId) {
      console.error('[APPLE AUTH] Missing APPLE_CLIENT_ID');
      return NextResponse.redirect(new URL('/signin?error=oauth_not_configured', request.url));
    }

    // Generate state for CSRF protection
    const state = generateState();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store state in database
    try {
      await query(
        'INSERT INTO oauth_states (state, provider, expires_at) VALUES ($1, $2, $3)',
        [state, 'apple', expiresAt]
      );
    } catch {
      // Create table if it doesn't exist
      console.log('[APPLE AUTH] Creating oauth_states table...');
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
        [state, 'apple', expiresAt]
      );
    }

    // Build Apple OAuth URL - use NEXTAUTH_URL for production
    const baseUrl = process.env.NEXTAUTH_URL || process.env.BASE_URL || new URL(request.url).origin;
    const redirectUri = `${baseUrl}/api/auth/signin/apple/callback`;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code id_token',
      response_mode: 'form_post', // Apple sends data via POST
      scope: 'name email',
      state: state,
    });

    const appleAuthUrl = `https://appleid.apple.com/auth/authorize?${params.toString()}`;

    console.log('[APPLE AUTH] Redirecting to Apple OAuth');
    return NextResponse.redirect(appleAuthUrl);
  } catch (error) {
    console.error('[APPLE AUTH] Error:', error);
    return NextResponse.redirect(new URL('/signin?error=oauth_error', request.url));
  }
}
