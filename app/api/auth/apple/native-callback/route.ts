export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Apple Sign-In Native Callback
 *
 * POST /api/auth/apple/native-callback
 *
 * Called from iOS after SignInWithApple.authorize() returns an identityToken.
 * Verifies the token server-side using Apple's public JWKS, finds or creates
 * a member, creates a server session, and returns member + sessionToken as JSON.
 *
 * Unlike the web OAuth flow, there is no redirect — the iOS client
 * reads the JSON response directly.
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { query } from '@/lib/db/postgres';
import { createSession, setSessionCookie } from '@/lib/auth/serverSessions';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { ACCESS_CONTEXT_COOKIE, signAccessContext } from '@/lib/auth/accessContext';

// Apple's JWKS endpoint for verifying identity tokens
const APPLE_JWKS = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));

// Safe query wrapper (consistent with other auth routes)
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
      console.warn(`[APPLE-NATIVE] Query skipped: ${message}`);
      return { rows: [], error: message };
    }
    throw error;
  }
}

// Verify Apple's identityToken (JWT) against Apple's public keys.
// On iOS native, the audience is the bundle ID (life.soullab.maia),
// not the Service ID used in web flows.
async function verifyIdentityToken(identityToken: string): Promise<{
  sub: string;
  email?: string;
  email_verified?: boolean;
}> {
  // For native iOS, the aud is the bundle ID
  const nativeBundleId = 'life.soullab.maia';
  const webServiceId = process.env.APPLE_CLIENT_ID;

  // Try bundle ID first (native), fall back to service ID (web)
  let payload: Record<string, unknown>;
  try {
    const result = await jwtVerify(identityToken, APPLE_JWKS, {
      issuer: 'https://appleid.apple.com',
      audience: nativeBundleId,
    });
    payload = result.payload as Record<string, unknown>;
  } catch {
    if (webServiceId && webServiceId !== nativeBundleId) {
      const result = await jwtVerify(identityToken, APPLE_JWKS, {
        issuer: 'https://appleid.apple.com',
        audience: webServiceId,
      });
      payload = result.payload as Record<string, unknown>;
    } else {
      throw new Error('Apple identityToken audience mismatch');
    }
  }

  return {
    sub: payload.sub as string,
    email: payload.email as string | undefined,
    email_verified:
      payload.email_verified === 'true' || payload.email_verified === true,
  };
}

export async function POST(req: NextRequest) {
  // Static export stub — this route is server-only
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json(
      { error: 'Native callback not available in static export' },
      { status: 400 }
    );
  }

  let identityToken: string;
  let clientGivenName: string | undefined;
  let clientFamilyName: string | undefined;
  let clientEmail: string | undefined;

  try {
    const body = await req.json();
    identityToken = body.identityToken;
    clientGivenName = body.givenName ? String(body.givenName) : undefined;
    clientFamilyName = body.familyName ? String(body.familyName) : undefined;
    clientEmail = body.email ? String(body.email).toLowerCase() : undefined;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!identityToken) {
    return NextResponse.json({ error: 'Missing identityToken' }, { status: 400 });
  }

  // Verify the Apple identityToken
  let tokenData: Awaited<ReturnType<typeof verifyIdentityToken>>;
  try {
    tokenData = await verifyIdentityToken(identityToken);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown';
    console.error('[APPLE-NATIVE] Token verification failed:', msg);
    return NextResponse.json({ error: 'Invalid Apple token', detail: msg }, { status: 401 });
  }

  const providerUserId = tokenData.sub;
  // Apple only sends email on the very first sign-in; fall back to client-provided
  const email = (tokenData.email || clientEmail || '').toLowerCase();
  const name = [clientGivenName, clientFamilyName].filter(Boolean).join(' ');

  console.log(`[APPLE-NATIVE] Verified: ${email || providerUserId}`);

  try {
    // Check oauth_accounts table exists
    const tableCheck = await safeQuery('SELECT 1 FROM oauth_accounts LIMIT 1');
    if (tableCheck.error) {
      console.error('[APPLE-NATIVE] oauth_accounts missing — run migrations');
      return NextResponse.json({ error: 'Schema not ready', code: 'SCHEMA_MISSING' }, { status: 500 });
    }

    // Look for existing OAuth link
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
      console.log(`[APPLE-NATIVE] Existing link: ${memberId}`);
    } else {
      // Check if member exists by email
      const byEmail = email
        ? await safeQuery(
            'SELECT id, username, name, onboarded, onboarding_step FROM members WHERE email = $1 LIMIT 1',
            [email]
          )
        : { rows: [] };

      if (byEmail.rows.length > 0) {
        memberData = byEmail.rows[0];
        memberId = memberData.id as string;
        console.log(`[APPLE-NATIVE] Linking to existing member: ${memberId}`);
      } else {
        // Create new member
        const username =
          (email ? email.split('@')[0] : 'apple').replace(/[^a-zA-Z0-9]/g, '') +
          crypto.randomBytes(2).toString('hex');
        const passkey = 'APPLE-' + crypto.randomBytes(6).toString('hex').toUpperCase();

        const created = await query(
          `INSERT INTO members (username, name, email, passkey, onboarded, onboarding_step, created_at)
           VALUES ($1, $2, $3, $4, false, 'begin', NOW())
           RETURNING id, username, name, onboarded, onboarding_step`,
          [username, name || 'Member', email || null, passkey]
        );

        memberData = created.rows[0];
        memberId = memberData.id as string;
        isNew = true;
        console.log(`[APPLE-NATIVE] Created new member: ${memberId}`);
      }

      // Create OAuth link
      await query(
        `INSERT INTO oauth_accounts (member_id, provider, provider_user_id, email, profile_data, created_at)
         VALUES ($1, 'apple', $2, $3, $4, NOW())
         ON CONFLICT (provider, provider_user_id) DO UPDATE
         SET email = EXCLUDED.email, profile_data = EXCLUDED.profile_data`,
        [memberId, providerUserId, email || null, JSON.stringify({ name })]
      );
    }

    // Create server session
    const session = await createSession({
      memberId,
      ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
      userAgent: req.headers.get('user-agent') || 'apple-native-ios',
    });

    // Set cookies (best-effort — iOS WKWebView may block HttpOnly cookies cross-origin)
    await setSessionCookie(session.sessionToken, session.expiresAt);

    // Fetch tier and roles
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

    let accessTier: 'free' | 'personal' | 'pro' = 'personal';
    const dbTier = memberTier || circleTier;
    if (dbTier) {
      const t = dbTier.toLowerCase();
      if (t === 'pro' || t === 'premium' || t === 'vip') accessTier = 'pro';
      else if (t === 'free' || t === 'guest') accessTier = 'free';
    }

    const roles =
      Array.isArray(memberRoles) && memberRoles.length > 0 ? memberRoles : ['member'];

    const cookieStore = await cookies();
    cookieStore.set('maia_tier', accessTier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: session.expiresAt,
    });
    cookieStore.set('maia_roles', JSON.stringify(roles), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: session.expiresAt,
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
        expires: session.expiresAt,
      });
    }

    console.log(`[APPLE-NATIVE] Session created for ${memberId} (tier: ${accessTier}, new: ${isNew})`);

    // Return JSON — the iOS client stores this via storeSession()
    // sessionToken is returned so the native app can use header-based auth
    // (iOS ITP blocks HttpOnly cookies on WKWebView cross-origin requests)
    return NextResponse.json({
      member: {
        id: memberData.id,
        username: memberData.username,
        name: memberData.name,
        onboarded: memberData.onboarded,
        onboarding_step: memberData.onboarding_step,
        tier: accessTier,
        isNew,
      },
      sessionToken: session.sessionToken,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown';
    console.error('[APPLE-NATIVE] Error:', msg);
    return NextResponse.json({ error: 'Sign-in failed', detail: msg }, { status: 500 });
  }
}
