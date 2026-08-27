export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Google Sign-In Native Callback
 *
 * POST /api/auth/google/native-callback
 *
 * Called from iOS after GIDSignIn returns an idToken.
 * Verifies the token server-side, finds or creates a member,
 * creates a server session, and returns member + sessionToken as JSON.
 *
 * Unlike the web OAuth flow, there is no redirect — the iOS client
 * reads the JSON response directly.
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { query } from '@/lib/db/postgres';
import { createSession, setSessionCookie } from '@/lib/auth/serverSessions';
import { ACCESS_CONTEXT_COOKIE, signAccessContext } from '@/lib/auth/accessContext';

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
      console.warn(`[GOOGLE-NATIVE] Query skipped: ${message}`);
      return { rows: [], error: message };
    }
    throw error;
  }
}

// Verify Google idToken using Google's tokeninfo endpoint.
// This validates the signature and expiry server-side without requiring
// local JWKS key management.
async function verifyGoogleIdToken(idToken: string): Promise<{
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
  aud: string;
}> {
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google tokeninfo rejected: ${body.slice(0, 200)}`);
  }

  const data = await res.json();

  if (!data.sub) {
    throw new Error('Google tokeninfo missing sub claim');
  }

  // Verify the token was issued for one of our clients
  const allowedAudiences = [
    process.env.NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    process.env.GOOGLE_CLIENT_ID,
  ].filter(Boolean);

  if (allowedAudiences.length > 0 && !allowedAudiences.includes(data.aud)) {
    throw new Error(`Google idToken audience mismatch: got ${data.aud}`);
  }

  return {
    sub: String(data.sub),
    email: String(data.email || '').toLowerCase(),
    email_verified: data.email_verified === 'true' || data.email_verified === true,
    name: data.name ? String(data.name) : undefined,
    picture: data.picture ? String(data.picture) : undefined,
    aud: data.aud,
  };
}

export async function POST(req: NextRequest) {
  // Static export stub — this route is server-only
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Native callback not available in static export' }, { status: 400 });
  }

  let idToken: string;
  let clientName: string | undefined;
  let clientEmail: string | undefined;

  try {
    const body = await req.json();
    idToken = body.idToken;
    clientName = body.name ? String(body.name) : undefined;
    clientEmail = body.email ? String(body.email).toLowerCase() : undefined;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!idToken) {
    return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
  }

  // Verify the Google idToken
  let tokenData: Awaited<ReturnType<typeof verifyGoogleIdToken>>;
  try {
    tokenData = await verifyGoogleIdToken(idToken);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown';
    console.error('[GOOGLE-NATIVE] Token verification failed:', msg);
    return NextResponse.json({ error: 'Invalid Google token', detail: msg }, { status: 401 });
  }

  const providerUserId = tokenData.sub;
  const email = tokenData.email || clientEmail || '';
  const name = tokenData.name || clientName || '';

  console.log(`[GOOGLE-NATIVE] Verified: ${email || providerUserId}`);

  try {
    // Check oauth_accounts table exists
    const tableCheck = await safeQuery('SELECT 1 FROM oauth_accounts LIMIT 1');
    if (tableCheck.error) {
      console.error('[GOOGLE-NATIVE] oauth_accounts missing — run migrations');
      return NextResponse.json({ error: 'Schema not ready', code: 'SCHEMA_MISSING' }, { status: 500 });
    }

    // Look for existing OAuth link
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
      memberData = existing.rows[0];
      memberId = memberData.id as string;
      console.log(`[GOOGLE-NATIVE] Existing link: ${memberId}`);
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
        console.log(`[GOOGLE-NATIVE] Linking to existing member: ${memberId}`);
      } else {
        // Create new member
        const username =
          (email ? email.split('@')[0] : 'google').replace(/[^a-zA-Z0-9]/g, '') +
          crypto.randomBytes(2).toString('hex');
        const passkey = 'GOOGLE-' + crypto.randomBytes(6).toString('hex').toUpperCase();

        const created = await query(
          `INSERT INTO members (username, name, email, passkey, onboarded, onboarding_step, created_at)
           VALUES ($1, $2, $3, $4, false, 'begin', NOW())
           RETURNING id, username, name, onboarded, onboarding_step`,
          [username, name || 'Member', email || null, passkey]
        );

        memberData = created.rows[0];
        memberId = memberData.id as string;
        isNew = true;
        console.log(`[GOOGLE-NATIVE] Created new member: ${memberId}`);
      }

      // Create OAuth link
      await query(
        `INSERT INTO oauth_accounts (member_id, provider, provider_user_id, email, profile_data, created_at)
         VALUES ($1, 'google', $2, $3, $4, NOW())
         ON CONFLICT (provider, provider_user_id) DO UPDATE
         SET email = EXCLUDED.email, profile_data = EXCLUDED.profile_data`,
        [memberId, providerUserId, email || null, JSON.stringify({ name })]
      );
    }

    // Create server session
    const session = await createSession({
      memberId,
      ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
      userAgent: req.headers.get('user-agent') || 'google-native-ios',
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

    console.log(`[GOOGLE-NATIVE] Session created for ${memberId} (tier: ${accessTier}, new: ${isNew})`);

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
    console.error('[GOOGLE-NATIVE] Error:', msg);
    return NextResponse.json({ error: 'Sign-in failed', detail: msg }, { status: 500 });
  }
}
