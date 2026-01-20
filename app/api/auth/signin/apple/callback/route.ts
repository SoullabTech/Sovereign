export const dynamic = 'force-static';

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
import { query } from '@/lib/db/postgres';
import { SignJWT, jwtVerify, createRemoteJWKSet } from 'jose';

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
  const baseUrl = new URL(req.url).origin;

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
      return NextResponse.redirect(`${baseUrl}/signin?error=oauth_cancelled`);
    }

    if (!code || !state) {
      console.error('[APPLE] Missing code or state');
      return NextResponse.redirect(`${baseUrl}/signin?error=oauth_invalid`);
    }

    // Validate state
    const stateCheck = await safeQuery(
      `SELECT id FROM oauth_states
       WHERE state = $1 AND provider = 'apple' AND expires_at > NOW()`,
      [state]
    );

    if (stateCheck.rows.length === 0) {
      console.error('[APPLE] Invalid or expired state');
      return NextResponse.redirect(`${baseUrl}/signin?error=oauth_state_invalid`);
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
        return NextResponse.redirect(`${baseUrl}/signin?error=oauth_token_invalid`);
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
        return NextResponse.redirect(`${baseUrl}/signin?error=oauth_token`);
      }

      const tokenData = await tokenRes.json();
      const newIdToken = tokenData.id_token;

      if (!newIdToken) {
        console.error('[APPLE] No id_token in response');
        return NextResponse.redirect(`${baseUrl}/signin?error=oauth_no_token`);
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
      return NextResponse.redirect(`${baseUrl}/signin?error=oauth_schema`);
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

    // Redirect to success page
    const successUrl = new URL('/oauth-success', baseUrl);
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
    return NextResponse.redirect(`${baseUrl}/signin?error=oauth_failed`);
  }
}

// Handle GET for browser redirects (shouldn't happen with form_post but just in case)
export async function GET(req: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  const baseUrl = new URL(req.url).origin;
  return NextResponse.redirect(`${baseUrl}/signin?error=oauth_method`);
}
