export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Google Sign-In OAuth Callback
 *
 * GET /api/auth/signin/google/callback?code=xxx&state=xxx
 *
 * - Validates state for CSRF protection
 * - Exchanges code for tokens
 * - Fetches user profile
 * - Links or creates member
 * - Redirects to oauth-success page
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { query } from '@/lib/db/postgres';
import { createSession, setSessionCookie } from '@/lib/auth/serverSessions';
import { ACCESS_CONTEXT_COOKIE, signAccessContext } from '@/lib/auth/accessContext';

// Safe query wrapper
async function safeQuery(
  sql: string,
  params: unknown[] = []
): Promise<{ rows: Record<string, unknown>[]; error?: string }> {
  try {
    const result = await query(sql, params);
    return { rows: result.rows };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown';
    if (message.includes('does not exist') || message.includes('column')) {
      console.warn(`[OAUTH] Query skipped: ${message}`);
      return { rows: [], error: message };
    }
    throw error;
  }
}

export async function GET(req: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ message: 'OAuth callback not available in static export' });
  }

  // Use configured base URL for production (container returns 0.0.0.0:3000)
  // Fail closed in production if not configured
  const configuredUrl = process.env.NEXTAUTH_URL || process.env.BASE_URL;
  if (process.env.NODE_ENV === 'production' && !configuredUrl) {
    console.error('[OAUTH] NEXTAUTH_URL or BASE_URL must be set in production');
    return NextResponse.json({ error: 'OAuth not configured' }, { status: 500 });
  }
  const baseUrl = configuredUrl || new URL(req.url).origin;
  const params = new URL(req.url).searchParams;
  const code = params.get('code');
  const state = params.get('state');
  const errorParam = params.get('error');

  // User cancelled
  if (errorParam) {
    console.log(`[OAUTH] Google cancelled: ${errorParam}`);
    return NextResponse.redirect(`${baseUrl}/oauth-success?ok=0&code=USER_CANCELLED&detail=${encodeURIComponent(errorParam)}`);
  }

  if (!code || !state) {
    console.error('[OAUTH] Missing code or state');
    return NextResponse.redirect(`${baseUrl}/oauth-success?ok=0&code=MISSING_CODE_OR_STATE`);
  }

  // Validate state (CSRF protection)
  const stateCheck = await safeQuery(
    `SELECT id FROM oauth_states
     WHERE state = $1 AND provider = 'google' AND expires_at > NOW()`,
    [state]
  );

  if (stateCheck.rows.length === 0) {
    console.error('[OAUTH] Invalid or expired state');
    return NextResponse.redirect(`${baseUrl}/oauth-success?ok=0&code=STATE_INVALID_OR_EXPIRED`);
  }

  // Clean up used state
  await safeQuery('DELETE FROM oauth_states WHERE state = $1', [state]);

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('[OAUTH] Missing Google credentials');
    return NextResponse.redirect(`${baseUrl}/oauth-success?ok=0&code=MISSING_CREDENTIALS`);
  }

  const redirectUri = `${baseUrl}/api/auth/signin/google/callback`;

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error(`[OAUTH] Token exchange failed: ${err}`);
      return NextResponse.redirect(`${baseUrl}/oauth-success?ok=0&code=TOKEN_EXCHANGE_FAILED&detail=${encodeURIComponent(err.slice(0, 100))}`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error('[OAUTH] No access token');
      return NextResponse.redirect(`${baseUrl}/oauth-success?ok=0&code=NO_ACCESS_TOKEN`);
    }

    // Fetch user profile
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      console.error('[OAUTH] Userinfo failed');
      return NextResponse.redirect(`${baseUrl}/oauth-success?ok=0&code=USERINFO_FAILED`);
    }

    const userInfo = await userRes.json();
    const providerUserId = String(userInfo.id);
    const email = String(userInfo.email || '').toLowerCase();
    const name = String(userInfo.name || '');
    const picture = String(userInfo.picture || '');

    console.log(`[OAUTH] Google user: ${email}`);

    // Check oauth_accounts table exists
    const tableCheck = await safeQuery('SELECT 1 FROM oauth_accounts LIMIT 1');
    if (tableCheck.error) {
      console.error('[OAUTH] oauth_accounts missing - run migrations');
      return NextResponse.redirect(`${baseUrl}/oauth-success?ok=0&code=SCHEMA_MISSING&detail=oauth_accounts`);
    }

    // Look for existing link
    const existing = await safeQuery(
      `SELECT m.id, m.username, m.name, m.onboarded, m.onboarding_step
       FROM oauth_accounts oa
       JOIN members m ON oa.member_id = m.id
       WHERE oa.provider = 'google' AND oa.provider_user_id = $1
       LIMIT 1`,
      [providerUserId]
    );

    let memberId: string;
    let memberData: Record<string, unknown>;
    let isNew = false;

    if (existing.rows.length > 0) {
      // Existing linked account
      memberData = existing.rows[0];
      memberId = memberData.id as string;
      console.log(`[OAUTH] Existing link: ${memberId}`);
    } else {
      // Check if member exists by email
      const byEmail = await safeQuery(
        'SELECT id, username, name, onboarded, onboarding_step FROM members WHERE email = $1 LIMIT 1',
        [email]
      );

      if (byEmail.rows.length > 0) {
        // Link to existing member
        memberData = byEmail.rows[0];
        memberId = memberData.id as string;
        console.log(`[OAUTH] Linking to existing member: ${memberId}`);
      } else {
        // Create new member
        const username = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') +
          crypto.randomBytes(2).toString('hex');
        const passkey = 'GOOGLE-' + crypto.randomBytes(6).toString('hex').toUpperCase();

        const created = await query(
          `INSERT INTO members (username, name, email, passkey, onboarded, onboarding_step, created_at)
           VALUES ($1, $2, $3, $4, false, 'begin', NOW())
           RETURNING id, username, name, onboarded, onboarding_step`,
          [username, name || 'Member', email, passkey]
        );

        memberData = created.rows[0];
        memberId = memberData.id as string;
        isNew = true;
        console.log(`[OAUTH] Created new member: ${memberId}`);
      }

      // Create OAuth link
      await query(
        `INSERT INTO oauth_accounts (member_id, provider, provider_user_id, email, profile_data, created_at)
         VALUES ($1, 'google', $2, $3, $4, NOW())
         ON CONFLICT (provider, provider_user_id) DO UPDATE
         SET email = EXCLUDED.email, profile_data = EXCLUDED.profile_data`,
        [memberId, providerUserId, email, JSON.stringify({ name, picture })]
      );
    }

    // Create server session and set cookies (required for middleware auth)
    const session = await createSession({
      memberId,
      ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
      userAgent: req.headers.get('user-agent') || 'google-oauth'
    });

    // Set session cookie
    await setSessionCookie(session.sessionToken, session.expiresAt);

    // Fetch member tier and roles for access control
    const tierResult = await safeQuery(
      `SELECT m.tier, m.roles, ms.circle_tier
       FROM members m
       LEFT JOIN member_settings ms ON m.id = ms.member_id
       WHERE m.id = $1`,
      [memberId]
    );
    const memberTier = tierResult.rows[0]?.tier as string | null;
    const circleTier = tierResult.rows[0]?.circle_tier as string | null;
    const memberRoles = tierResult.rows[0]?.roles as string[] | null;

    // Map tier to access matrix (prefer members.tier, fallback to member_settings.circle_tier)
    let accessTier: 'free' | 'personal' | 'pro' = 'personal';
    const dbTier = memberTier || circleTier;
    if (dbTier) {
      const t = dbTier.toLowerCase();
      if (t === 'pro' || t === 'premium' || t === 'vip') accessTier = 'pro';
      else if (t === 'free' || t === 'guest') accessTier = 'free';
    }

    // Get roles from members table (default to ['member'] if not set)
    const roles = Array.isArray(memberRoles) && memberRoles.length > 0
      ? memberRoles
      : ['member'];

    // Set tier and roles cookies
    const cookieStore = await cookies();
    cookieStore.set('maia_tier', accessTier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: session.expiresAt
    });

    cookieStore.set('maia_roles', JSON.stringify(roles), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: session.expiresAt
    });

    // Signed access context (AUTH-BOUNDARY-01B). The cookies above are
    // server-issued but not server-verified on arrival; this one is signed so
    // the Edge gate can distinguish a grant the server made from one a caller
    // wrote. Best-effort: no secret configured -> null, and middleware falls
    // through to the bounded compatibility path. Sign-in never fails over it.
    const signedAccessCtx = await signAccessContext({
      sub: String(memberId),
      roles: (roles) as string[],
      tier: String(accessTier),
    });
    if (signedAccessCtx) {
      cookieStore.set(ACCESS_CONTEXT_COOKIE, signedAccessCtx, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        expires: session.expiresAt
      });
    }

    console.log(`[OAUTH] Session created for ${memberId} (tier: ${accessTier}, roles: ${roles.join(',')})`);

    // Redirect to success page with session data
    const successUrl = new URL('/oauth-success', baseUrl);
    successUrl.searchParams.set('ok', '1');
    successUrl.searchParams.set('memberId', memberData.id as string);
    successUrl.searchParams.set('username', (memberData.username as string) || '');
    successUrl.searchParams.set('name', (memberData.name as string) || '');
    successUrl.searchParams.set('onboarded', String(memberData.onboarded || false));
    successUrl.searchParams.set('onboardingStep', (memberData.onboarding_step as string) || 'begin');
    successUrl.searchParams.set('isNew', String(isNew));
    successUrl.searchParams.set('provider', 'google');

    return NextResponse.redirect(successUrl.toString());
  } catch (error) {
    console.error('[OAUTH] Error:', error);
    const errMsg = error instanceof Error ? error.message : 'Unknown';
    return NextResponse.redirect(`${baseUrl}/oauth-success?ok=0&code=EXCEPTION&detail=${encodeURIComponent(errMsg.slice(0, 100))}`);
  }
}
