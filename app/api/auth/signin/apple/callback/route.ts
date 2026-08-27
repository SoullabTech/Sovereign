export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Apple Sign-In OAuth Callback
 *
 * POST /api/auth/signin/apple/callback
 *
 * Apple uses form_post response mode, sending:
 * - code: Authorization code
 * - id_token: JWT containing user info
 * - state: CSRF token
 * - user: JSON with name (only on first sign-in!)
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { query } from '@/lib/db/postgres';
import { createSession, setSessionCookie } from '@/lib/auth/serverSessions';
import { SignJWT, jwtVerify, createRemoteJWKSet } from 'jose';
import { ACCESS_CONTEXT_COOKIE, signAccessContext } from '@/lib/auth/accessContext';

// Apple's JWKS endpoint for verifying id_tokens
const APPLE_JWKS = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));

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
      console.warn(`[APPLE] Query skipped: ${message}`);
      return { rows: [], error: message };
    }
    throw error;
  }
}

// Generate Apple client_secret JWT
async function generateClientSecret(): Promise<string> {
  const teamId = process.env.APPLE_TEAM_ID;
  const clientId = process.env.APPLE_CLIENT_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const privateKey = process.env.APPLE_PRIVATE_KEY;

  if (!teamId || !clientId || !keyId || !privateKey) {
    throw new Error('Missing Apple OAuth credentials');
  }

  // Parse the private key (handle escaped newlines from env var)
  const formattedKey = privateKey.replace(/\\n/g, '\n');
  const key = crypto.createPrivateKey(formattedKey);

  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: keyId })
    .setIssuer(teamId)
    .setIssuedAt()
    .setExpirationTime('5m')
    .setAudience('https://appleid.apple.com')
    .setSubject(clientId)
    .sign(key);

  return jwt;
}

// Parse and verify Apple's id_token
async function verifyIdToken(idToken: string): Promise<{
  sub: string;
  email?: string;
  email_verified?: boolean;
}> {
  const { payload } = await jwtVerify(idToken, APPLE_JWKS, {
    issuer: 'https://appleid.apple.com',
    audience: process.env.APPLE_CLIENT_ID,
  });

  return {
    sub: payload.sub as string,
    email: payload.email as string | undefined,
    email_verified: payload.email_verified as boolean | undefined,
  };
}

export async function POST(req: NextRequest) {
  // Use configured base URL for production (container returns 0.0.0.0:3000)
  const configuredUrl = process.env.NEXTAUTH_URL || process.env.BASE_URL;

  // Fail-closed in production: require explicit base URL config
  if (!configuredUrl && process.env.NODE_ENV === 'production') {
    console.error('[APPLE] FATAL: NEXTAUTH_URL or BASE_URL must be set in production');
    return new Response('Server misconfiguration: missing base URL', { status: 500 });
  }

  const baseUrl = configuredUrl || new URL(req.url).origin;

  try {
    // Parse form data (Apple uses form_post)
    const formData = await req.formData();
    const code = formData.get('code') as string | null;
    const idToken = formData.get('id_token') as string | null;
    const state = formData.get('state') as string | null;
    const userJson = formData.get('user') as string | null; // Only on first sign-in
    const errorParam = formData.get('error') as string | null;

    if (errorParam) {
      console.log(`[APPLE] Auth error: ${errorParam}`);
      return NextResponse.redirect(`${baseUrl}/oauth-success?ok=0&code=USER_CANCELLED&detail=${encodeURIComponent(errorParam)}`);
    }

    if (!code || !state) {
      console.error('[APPLE] Missing code or state');
      return NextResponse.redirect(`${baseUrl}/oauth-success?ok=0&code=MISSING_CODE_OR_STATE`);
    }

    // Validate state
    const stateCheck = await safeQuery(
      `SELECT id FROM oauth_states
       WHERE state = $1 AND provider = 'apple' AND expires_at > NOW()`,
      [state]
    );

    if (stateCheck.rows.length === 0) {
      console.error('[APPLE] Invalid or expired state');
      return NextResponse.redirect(`${baseUrl}/oauth-success?ok=0&code=STATE_INVALID_OR_EXPIRED`);
    }

    // Clean up used state
    await safeQuery('DELETE FROM oauth_states WHERE state = $1', [state]);

    // Parse user info if provided (first sign-in only)
    let userName = '';
    if (userJson) {
      try {
        const userData = JSON.parse(userJson);
        userName = [userData.name?.firstName, userData.name?.lastName].filter(Boolean).join(' ');
      } catch {
        console.warn('[APPLE] Failed to parse user data');
      }
    }

    // Verify id_token to get user info
    let providerUserId: string;
    let email = '';

    if (idToken) {
      try {
        const tokenData = await verifyIdToken(idToken);
        providerUserId = tokenData.sub;
        email = tokenData.email || '';
      } catch (e) {
        console.error('[APPLE] id_token verification failed:', e);
        const errMsg = e instanceof Error ? e.message : 'Unknown';
        return NextResponse.redirect(`${baseUrl}/oauth-success?ok=0&code=ID_TOKEN_INVALID&detail=${encodeURIComponent(errMsg.slice(0, 100))}`);
      }
    } else {
      // If no id_token, exchange code for tokens
      const clientId = process.env.APPLE_CLIENT_ID;
      const clientSecret = await generateClientSecret();
      const redirectUri = `${baseUrl}/api/auth/signin/apple/callback`;

      const tokenRes = await fetch('https://appleid.apple.com/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId!,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenRes.ok) {
        const err = await tokenRes.text();
        console.error(`[APPLE] Token exchange failed: ${err}`);
        return NextResponse.redirect(`${baseUrl}/oauth-success?ok=0&code=TOKEN_EXCHANGE_FAILED&detail=${encodeURIComponent(err.slice(0, 100))}`);
      }

      const tokenData = await tokenRes.json();
      const newIdToken = tokenData.id_token;

      if (!newIdToken) {
        console.error('[APPLE] No id_token in response');
        return NextResponse.redirect(`${baseUrl}/oauth-success?ok=0&code=NO_ID_TOKEN`);
      }

      const verified = await verifyIdToken(newIdToken);
      providerUserId = verified.sub;
      email = verified.email || '';
    }

    console.log(`[APPLE] User: ${email || providerUserId}`);

    // Check oauth_accounts table
    const tableCheck = await safeQuery('SELECT 1 FROM oauth_accounts LIMIT 1');
    if (tableCheck.error) {
      console.error('[APPLE] oauth_accounts missing');
      return NextResponse.redirect(`${baseUrl}/oauth-success?ok=0&code=SCHEMA_MISSING&detail=oauth_accounts`);
    }

    // Look for existing link
    const existing = await safeQuery(
      `SELECT m.id, m.username, m.name, m.onboarded, m.onboarding_step
       FROM oauth_accounts oa
       JOIN members m ON oa.member_id = m.id
       WHERE oa.provider = 'apple' AND oa.provider_user_id = $1
       LIMIT 1`,
      [providerUserId]
    );

    let memberId: string;
    let memberData: Record<string, unknown>;
    let isNew = false;

    if (existing.rows.length > 0) {
      memberData = existing.rows[0];
      memberId = memberData.id as string;
      console.log(`[APPLE] Existing link: ${memberId}`);
    } else {
      // Check by email
      const byEmail = email
        ? await safeQuery(
            'SELECT id, username, name, onboarded, onboarding_step FROM members WHERE email = $1 LIMIT 1',
            [email.toLowerCase()]
          )
        : { rows: [] };

      if (byEmail.rows.length > 0) {
        memberData = byEmail.rows[0];
        memberId = memberData.id as string;
        console.log(`[APPLE] Linking to existing: ${memberId}`);
      } else {
        // Create new member
        const username = (email ? email.split('@')[0] : 'apple').replace(/[^a-zA-Z0-9]/g, '') +
          crypto.randomBytes(2).toString('hex');
        const passkey = 'APPLE-' + crypto.randomBytes(6).toString('hex').toUpperCase();

        const created = await query(
          `INSERT INTO members (username, name, email, passkey, onboarded, onboarding_step, created_at)
           VALUES ($1, $2, $3, $4, false, 'begin', NOW())
           RETURNING id, username, name, onboarded, onboarding_step`,
          [username, userName || 'Member', email.toLowerCase() || null, passkey]
        );

        memberData = created.rows[0];
        memberId = memberData.id as string;
        isNew = true;
        console.log(`[APPLE] Created: ${memberId}`);
      }

      // Create OAuth link
      await query(
        `INSERT INTO oauth_accounts (member_id, provider, provider_user_id, email, profile_data, created_at)
         VALUES ($1, 'apple', $2, $3, $4, NOW())
         ON CONFLICT (provider, provider_user_id) DO UPDATE
         SET email = EXCLUDED.email, profile_data = EXCLUDED.profile_data`,
        [memberId, providerUserId, email.toLowerCase() || null, JSON.stringify({ name: userName })]
      );
    }

    // Create server session and set cookies (required for middleware auth)
    const session = await createSession({
      memberId,
      ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
      userAgent: req.headers.get('user-agent') || 'apple-oauth'
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

    console.log(`[APPLE] Session created for ${memberId} (tier: ${accessTier}, roles: ${roles.join(',')})`);

    // Redirect to success page
    const successUrl = new URL('/oauth-success', baseUrl);
    successUrl.searchParams.set('ok', '1');
    successUrl.searchParams.set('memberId', memberData.id as string);
    successUrl.searchParams.set('username', (memberData.username as string) || '');
    successUrl.searchParams.set('name', (memberData.name as string) || '');
    successUrl.searchParams.set('onboarded', String(memberData.onboarded || false));
    successUrl.searchParams.set('onboardingStep', (memberData.onboarding_step as string) || 'begin');
    successUrl.searchParams.set('isNew', String(isNew));
    successUrl.searchParams.set('provider', 'apple');

    return NextResponse.redirect(successUrl.toString());
  } catch (error) {
    console.error('[APPLE] Error:', error);
    const errMsg = error instanceof Error ? error.message : 'Unknown';
    return NextResponse.redirect(`${baseUrl}/oauth-success?ok=0&code=EXCEPTION&detail=${encodeURIComponent(errMsg.slice(0, 100))}`);
  }
}

// Handle GET for browser redirects (shouldn't happen with form_post but just in case)
export async function GET(req: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }

  // Use configured base URL for production (container returns 0.0.0.0:3000)
  const configuredUrl = process.env.NEXTAUTH_URL || process.env.BASE_URL;

  if (!configuredUrl && process.env.NODE_ENV === 'production') {
    console.error('[APPLE] FATAL: NEXTAUTH_URL or BASE_URL must be set in production');
    return new Response('Server misconfiguration: missing base URL', { status: 500 });
  }

  const baseUrl = configuredUrl || new URL(req.url).origin;
  return NextResponse.redirect(`${baseUrl}/oauth-success?ok=0&code=WRONG_HTTP_METHOD&detail=Apple_uses_POST`);
}
