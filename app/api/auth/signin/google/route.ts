export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Google Sign-In OAuth Initiation
 *
 * GET /api/auth/signin/google
 *
 * - Generates CSRF state
 * - Stores state in oauth_states table
 * - Redirects to Google OAuth consent screen
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { query } from '@/lib/db/postgres';

export async function GET(req: NextRequest) {
  // Use configured base URL for production
  const configuredUrl = process.env.NEXTAUTH_URL || process.env.BASE_URL;
  if (process.env.NODE_ENV === 'production' && !configuredUrl) {
    console.error('[OAUTH] NEXTAUTH_URL or BASE_URL must be set in production');
    return NextResponse.json({ error: 'OAuth not configured' }, { status: 500 });
  }
  const baseUrl = configuredUrl || new URL(req.url).origin;

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.error('[OAUTH] GOOGLE_CLIENT_ID not set');
    return NextResponse.redirect(`${baseUrl}/signin?error=oauth_not_configured`);
  }

  // Generate CSRF state
  const state = crypto.randomBytes(32).toString('hex');

  // Store state with 10 minute expiry
  try {
    await query(
      `INSERT INTO oauth_states (state, provider, expires_at)
       VALUES ($1, 'google', NOW() + INTERVAL '10 minutes')`,
      [state]
    );
  } catch (error) {
    console.error('[OAUTH] Failed to store state:', error);
    return NextResponse.redirect(`${baseUrl}/signin?error=oauth_state_failed`);
  }

  // Build Google OAuth URL
  const redirectUri = `${baseUrl}/api/auth/signin/google/callback`;
  const scope = 'openid email profile';

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', scope);
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'select_account');

  console.log(`[OAUTH] Redirecting to Google OAuth (state: ${state.slice(0, 8)}...)`);

  return NextResponse.redirect(authUrl.toString());
}
