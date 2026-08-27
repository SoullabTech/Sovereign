// Production requires force-dynamic for database access
export const dynamic = 'force-dynamic';

/**
 * Magic Link Sign-In
 *
 * POST /api/members/magic-link - Request magic link (sends email)
 * GET /api/members/magic-link?token=xxx - Verify token and sign in
 *
 * DESIGN:
 * - Works for both existing members and new signups
 * - Always succeeds from user's perspective (no email enumeration)
 * - 1 hour expiration for security
 * - Graceful degradation if tables missing
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { randomBytes } from 'crypto';
import { sendEmail, SENDERS } from '@/lib/email/sendEmail';
import { memberRef } from '@/lib/privacy/memberRef';
import {
  checkRateLimit,
  getClientIP,
  buildRateLimitHeaders
} from '@/lib/auth/rateLimiter';
import { createSession } from '@/lib/auth/serverSessions';
import { getNextOnboardingStep } from '@/lib/onboarding/state';
import { trackOnboarding } from '@/lib/onboarding/telemetry';
import { ACCESS_CONTEXT_COOKIE, signAccessContext } from '@/lib/auth/accessContext';

const ENDPOINT = '/api/members/magic-link';

// Generate secure token
function generateToken(): string {
  return randomBytes(32).toString('hex');
}

// Safe query that handles missing tables
async function safeQuery(sql: string, params: unknown[] = []): Promise<{ rows: Record<string, unknown>[]; error?: string }> {
  try {
    const result = await query(sql, params);
    return { rows: result.rows };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('does not exist') || message.includes('column')) {
      console.warn(`[MAGIC-LINK] Query skipped (missing table/column): ${message}`);
      return { rows: [], error: message };
    }
    throw error;
  }
}

/**
 * POST - Request magic link
 * Sends email with sign-in link
 */
export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in app build' }, { status: 503 });
  }

  const clientIP = getClientIP(request);

  // Rate limit: 3 magic link requests per 15 minutes per IP
  const rateLimitResult = await checkRateLimit(clientIP, 'ip', ENDPOINT);
  if (!rateLimitResult.allowed) {
    const headers = buildRateLimitHeaders(rateLimitResult);
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers }
    );
  }

  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`[MAGIC-LINK] Request for: ${normalizedEmail}`);

    // Check if member exists with this email (case-insensitive)
    const memberResult = await safeQuery(
      'SELECT id, name, username FROM members WHERE LOWER(email) = $1',
      [normalizedEmail]
    );

    const member = memberResult.rows[0] || null;
    const memberId = member?.id as string | null;
    const memberName = (member?.name as string) || 'Beautiful Soul';

    // Generate token with 1 hour expiration
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Invalidate any existing tokens for this email
    await safeQuery(
      'UPDATE magic_link_tokens SET used = true WHERE email = $1 AND used = false',
      [normalizedEmail]
    );

    // Store new token
    const insertResult = await safeQuery(
      'INSERT INTO magic_link_tokens (email, member_id, token, expires_at) VALUES ($1, $2, $3, $4)',
      [normalizedEmail, memberId, token, expiresAt]
    );

    if (insertResult.error) {
      // If magic_link_tokens table doesn't exist, create it on the fly
      console.log('[MAGIC-LINK] Creating magic_link_tokens table...');
      await query(`
        CREATE TABLE IF NOT EXISTS magic_link_tokens (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) NOT NULL,
          member_id UUID REFERENCES members(id) ON DELETE CASCADE,
          token VARCHAR(64) NOT NULL UNIQUE,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          used BOOLEAN DEFAULT FALSE,
          used_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);
      // Retry insert
      await query(
        'INSERT INTO magic_link_tokens (email, member_id, token, expires_at) VALUES ($1, $2, $3, $4)',
        [normalizedEmail, memberId, token, expiresAt]
      );
    }

    // Build magic link — points to client-side page, NOT the API directly.
    // Email scanners (Gmail, ProtonMail, Outlook) prefetch links in emails.
    // If the link hit the API, scanners would consume the token before the user clicks.
    // The /magic-link page shows a button; only a real user click redeems the token.
    const baseOrigin = process.env.NEXTAUTH_URL || process.env.BASE_URL || 'https://soullab.life';
    const magicLink = `${baseOrigin}/magic-link?token=${token}`;

    // Determine flow: existing member or new user
    const isExistingMember = !!member;
    const subject = isExistingMember
      ? 'Sign in to Soullab'
      : 'Complete your Soullab signup';
    const heading = isExistingMember
      ? 'Sign in to Soullab'
      : 'Welcome to Soullab';
    const bodyText = isExistingMember
      ? 'Click the button below to sign in instantly — no password needed.'
      : 'Click the button below to continue setting up your account.';
    const buttonText = isExistingMember ? 'Sign In' : 'Continue Signup';

    // Send magic link email
    const delivery = await sendEmail({
      purpose: 'auth:magic-link',
      from: SENDERS.noreply,
        to: normalizedEmail,
        subject,
        html: `
          <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <img src="https://soullab.life/Soullablogo.png" alt="Soullab" width="150" style="max-width: 150px;" />
            </div>

            <h1 style="color: #1A2F24; font-size: 24px; text-align: center; margin-bottom: 24px;">
              ${heading}
            </h1>

            <p style="color: #2D3748; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Hello ${memberName},
            </p>

            <p style="color: #2D3748; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              ${bodyText}
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #1A2F24, #2C5530); color: #FFFFFF; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
                ${buttonText}
              </a>
            </div>

            <p style="color: #718096; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
              This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
            </p>

            <p style="color: #718096; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
              Or copy this link: <br>
              <a href="${magicLink}" style="color: #2C5530; word-break: break-all;">${magicLink}</a>
            </p>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-top: 32px; text-align: center;">
              <p style="color: #718096; font-size: 14px; margin: 0;">
                With presence,<br>
                <strong style="color: #1A2F24;">The Soullab Team</strong>
              </p>
            </div>
          </div>
        `,
        text: `
${heading}

Hello ${memberName},

${bodyText}

${magicLink}

This link expires in 1 hour. If you didn't request this, you can safely ignore this email.

With presence,
The Soullab Team
        `.trim()
      });

    // Resend RESOLVES with { data, error } when the provider rejects a send — it
    // does not throw — so an `await` in a bare try/catch reported success for
    // mail that never left (2026-08-24 quota incident). `sendEmail` reads that
    // result and never throws, so this is a value to be read, not an exception
    // that may be ignored.
    //
    // The provider's own name is logged as its own field: "quota exhausted" and
    // "domain not verified" are indistinguishable once flattened into a
    // sentence, and they need opposite responses from an operator.
    //
    // NO EMAIL ADDRESS IN THE LOG LINE. Correlation during an outage is
    // genuine — you need to know whose send failed — but a raw address is not
    // how to get it. memberRef() is the sanctioned derivation
    // (lib/privacy/memberRef.ts); a truncated id would not be.
    if (!delivery.success) {
      console.error(
        `[MAGIC-LINK] Provider REFUSED the send for member=${memberRef(memberId)} — status=${delivery.status} failureKind=${delivery.failureKind ?? 'unclassified'} providerCode=${delivery.providerCode ?? 'unnamed'} retryable=${delivery.retryable === true} error=${delivery.error ?? 'none'}`
      );

      // `retryable` governs the advice, not tone. Telling someone to retry a
      // refusal that cannot succeed is the loop this lane exists to remove.
      if (!delivery.ourFault) {
        return NextResponse.json(
          {
            error: "We couldn't send to that address. Please check it and try again.",
            reason: 'email_address_rejected',
            retryable: false,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error: delivery.retryable
            ? "Failed to send magic link email. That's a problem on our side, not yours. Please try again in a few minutes."
            : "Failed to send magic link email. That's a problem on our side, not yours, and retrying won't help. Please contact support@soullab.life and we'll get you in.",
          reason: 'email_provider_refused',
          retryable: delivery.retryable === true,
        },
        { status: 502 }
      );
    }

    console.log(`[MAGIC-LINK] Email sent to: ${normalizedEmail} (existing: ${isExistingMember}, resendId: ${delivery.id ?? 'none'})`);

    trackOnboarding({ event: 'magic_link_sent', email: normalizedEmail, path: 'POST /api/members/magic-link', metadata: { isExistingMember } });

    // NO `isExistingMember` IN THE RESPONSE. It told an anonymous caller whether
    // an address has a Soullab account before that caller had proved they own
    // it. It still shapes the email body and server-side telemetry; it no longer
    // crosses the wire. Existing-vs-new is resolved when the link is followed.
    return NextResponse.json({
      success: true,
      message: 'Check your email for a sign-in link.',
    });
  } catch (error) {
    console.error('[MAGIC-LINK] Request error:', error);
    return NextResponse.json(
      { error: 'Failed to send magic link. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * GET - Verify magic link token and redirect
 * This is what the email link points to
 */
export async function GET(request: NextRequest) {
  // Use NEXTAUTH_URL for redirects to avoid Docker internal URLs
  const baseUrl = process.env.NEXTAUTH_URL || process.env.BASE_URL || new URL(request.url).origin;

  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/signin?link=invalid', baseUrl));
    }

    trackOnboarding({ event: 'magic_link_opened', path: 'GET /api/members/magic-link' });

    // Atomically claim the token: UPDATE WHERE used = false ensures only one
    // concurrent request wins. PostgreSQL row-level lock prevents double-redemption.
    const claimResult = await safeQuery(
      `UPDATE magic_link_tokens
       SET used = true, used_at = NOW()
       WHERE token = $1
         AND used = false
         AND expires_at > NOW()
       RETURNING id, email, member_id`,
      [token]
    );

    if (claimResult.error || claimResult.rows.length === 0) {
      // Distinguish already-used from expired for human-readable errors
      const diagResult = await safeQuery(
        `SELECT used, expires_at FROM magic_link_tokens WHERE token = $1`,
        [token]
      );
      let reason = 'invalid_token';
      let telemetryEvent: 'token_already_used' | 'token_expired' | 'token_invalid' = 'token_invalid';
      if (!diagResult.error && diagResult.rows.length > 0) {
        const row = diagResult.rows[0];
        if (row.used) {
          reason = 'already_used';
          telemetryEvent = 'token_already_used';
        } else {
          reason = 'expired';
          telemetryEvent = 'token_expired';
        }
      }
      trackOnboarding({ event: telemetryEvent, path: 'GET /api/members/magic-link' });
      console.log(`[MAGIC-LINK] Token failure (${reason}): ${token.substring(0, 8)}...`);
      return NextResponse.redirect(new URL(`/signin?link=${reason}`, baseUrl));
    }

    const claimed = claimResult.rows[0];
    trackOnboarding({ event: 'token_redeemed', email: claimed.email as string, path: 'GET /api/members/magic-link' });

    // Fetch member data (including tier/roles for session cookie setup)
    const memberResult = await safeQuery(
      `SELECT id as found_member_id, username, name, onboarded, onboarding_step,
              COALESCE(tier, 'free') as tier,
              COALESCE(roles, ARRAY['member']) as roles
       FROM members
       WHERE id = $1 OR LOWER(email) = LOWER($2)
       LIMIT 1`,
      [claimed.member_id || null, claimed.email]
    );

    const record = {
      ...claimed,
      ...(memberResult.rows[0] || {}),
    };

    const memberId = record.found_member_id || record.member_id;

    if (memberId) {
      // Existing member — use canonical step resolver
      const onboardingTarget = getNextOnboardingStep({
        onboarded: record.onboarded,
        onboarding_step: record.onboarding_step as string,
      });

      console.log(`[MAGIC-LINK] Existing member: ${record.username} → ${onboardingTarget.path}`);

      // Redirect via magic-link-success so it can hydrate localStorage (native/iOS compat)
      // and do a server-state recovery fetch if needed
      const successUrl = new URL('/magic-link-success', baseUrl);
      successUrl.searchParams.set('member_id', memberId as string);
      successUrl.searchParams.set('username', (record.username as string) || '');
      successUrl.searchParams.set('name', (record.name as string) || '');
      successUrl.searchParams.set('onboarded', String(record.onboarded));
      successUrl.searchParams.set('redirect', onboardingTarget.path);

      const response = NextResponse.redirect(successUrl);

      // Set HttpOnly session cookies so middleware recognises the member
      try {
        const clientIP = getClientIP(request);
        const userAgent = request.headers.get('user-agent') || '';
        const session = await createSession({ memberId: memberId as string, ipAddress: clientIP, userAgent });
        const cookieOpts = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax' as const,
          path: '/',
          expires: session.expiresAt,
        };
        response.cookies.set('maia_session', session.sessionToken, cookieOpts);
        response.cookies.set('maia_member_id', String(memberId), cookieOpts);
        response.cookies.set('maia_tier', String(record.tier || 'free'), cookieOpts);
        response.cookies.set('maia_roles', JSON.stringify(record.roles || ['member']), cookieOpts);

        // Signed access context (AUTH-BOUNDARY-01B). The cookies above are
        // server-issued but not server-verified on arrival; this one is signed so
        // the Edge gate can distinguish a grant the server made from one a caller
        // wrote. Best-effort: no secret configured -> null, and middleware falls
        // through to the bounded compatibility path. Sign-in never fails over it.
        const signedAccessCtx = await signAccessContext({
          sub: String(String(memberId)),
          roles: (record.roles || ['member']) as string[],
          tier: String(String(record.tier || 'free')),
        });
        if (signedAccessCtx) response.cookies.set(ACCESS_CONTEXT_COOKIE, signedAccessCtx, cookieOpts);
        trackOnboarding({ event: 'session_created', memberId: memberId as string, path: 'magic-link' });
        console.log(`[MAGIC-LINK] Session created for: ${record.username}`);
      } catch (sessionErr) {
        console.error('[MAGIC-LINK] Session creation failed (non-fatal):', sessionErr);
        trackOnboarding({ event: 'session_missing_after_verify', memberId: memberId as string, path: 'magic-link' });
      }

      return response;

    } else {
      // New user — email is verified, send them to /signup to finish (collect a
      // name, create the account via /api/members/register-email). The navy
      // /signup reads ?verified=true&email= and renders its completion state.
      console.log(`[MAGIC-LINK] New user email verified: ${record.email}`);
      const signupUrl = new URL('/signup', baseUrl);
      signupUrl.searchParams.set('email', record.email as string);
      signupUrl.searchParams.set('verified', 'true');
      return NextResponse.redirect(signupUrl);
    }

  } catch (error) {
    console.error('[MAGIC-LINK] Verify error:', error);
    return NextResponse.redirect(new URL('/signin?link=failed', baseUrl));
  }
}
