// Production requires force-dynamic for database access
export const dynamic = 'force-dynamic';

/**
 * Email One-Time Code — verify
 *
 * POST /api/members/email-code/verify  { email, code }
 *
 * On success the code row is marked used (so /api/members/register-email accepts
 * the email as recently-verified for new signups). For an existing member we
 * create a server session and return their onboarding destination; for a new
 * email we return { verified: true } so the client collects a name and calls
 * register-email.
 *
 * - 5 attempts per code, then the code is burned (request a new one).
 * - Constant-ish failure messaging; no email enumeration.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import {
  checkRateLimit,
  getClientIP,
  buildRateLimitHeaders,
} from '@/lib/auth/rateLimiter';
import { createSession } from '@/lib/auth/serverSessions';
import { getNextOnboardingStep } from '@/lib/onboarding/state';
import { trackOnboarding } from '@/lib/onboarding/telemetry';
import { ACCESS_CONTEXT_COOKIE, signAccessContext } from '@/lib/auth/accessContext';

const ENDPOINT = '/api/members/email-code/verify';
const MAX_ATTEMPTS = 5;

async function safeQuery(sql: string, params: unknown[] = []): Promise<{ rows: Record<string, unknown>[]; error?: string }> {
  try {
    const result = await query(sql, params);
    return { rows: result.rows };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('does not exist') || message.includes('column')) {
      console.warn(`[EMAIL-CODE/verify] Query skipped (missing table/column): ${message}`);
      return { rows: [], error: message };
    }
    throw error;
  }
}

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in app build' }, { status: 503 });
  }

  const clientIP = getClientIP(request);

  const rateLimitResult = await checkRateLimit(clientIP, 'ip', ENDPOINT);
  if (!rateLimitResult.allowed) {
    const headers = buildRateLimitHeaders(rateLimitResult);
    return NextResponse.json(
      { error: 'Too many attempts. Please wait a moment and try again.' },
      { status: 429, headers }
    );
  }

  try {
    const { email, code } = await request.json();
    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const submitted = String(code).trim();

    // Most recent live code for this email.
    const lookup = await safeQuery(
      `SELECT id, member_id, code, attempts
         FROM magic_link_tokens
        WHERE email = $1 AND used = false AND expires_at > NOW()
        ORDER BY created_at DESC
        LIMIT 1`,
      [normalizedEmail]
    );

    if (lookup.error || lookup.rows.length === 0) {
      return NextResponse.json(
        { error: 'That code has expired. Request a new one.' },
        { status: 400 }
      );
    }

    const row = lookup.rows[0];
    const rowId = row.id as string;
    const attempts = Number(row.attempts || 0);

    if (attempts >= MAX_ATTEMPTS) {
      // Burn it so a fresh code is required.
      await safeQuery('UPDATE magic_link_tokens SET used = true WHERE id = $1', [rowId]);
      trackOnboarding({ event: 'token_already_used', email: normalizedEmail, path: ENDPOINT });
      return NextResponse.json(
        { error: 'Too many attempts on this code. Request a new one.' },
        { status: 429 }
      );
    }

    if (!row.code || String(row.code) !== submitted) {
      await safeQuery('UPDATE magic_link_tokens SET attempts = attempts + 1 WHERE id = $1', [rowId]);
      const remaining = Math.max(0, MAX_ATTEMPTS - (attempts + 1));
      return NextResponse.json(
        { error: remaining > 0 ? `Incorrect code. ${remaining} ${remaining === 1 ? 'try' : 'tries'} left.` : 'Incorrect code. Request a new one.' },
        { status: 400 }
      );
    }

    // Correct — atomically burn the code (one-time use). We deliberately do NOT
    // touch used_at here: that column may be absent on older schemas, and replay
    // protection must not silently fail if it is. WHERE used = false makes this
    // race-safe (only one concurrent request wins). Fail closed: if no row was
    // claimed (already used / update error), do not grant verification.
    const claim = await safeQuery(
      'UPDATE magic_link_tokens SET used = true WHERE id = $1 AND used = false RETURNING id',
      [rowId]
    );
    if (claim.rows.length === 0) {
      return NextResponse.json(
        { error: 'That code was just used. Request a new one.' },
        { status: 400 }
      );
    }
    trackOnboarding({ event: 'token_redeemed', email: normalizedEmail, path: ENDPOINT });

    const memberId = row.member_id as string | null;

    if (!memberId) {
      // New email — verified. Client collects a name and calls register-email.
      console.log(`[EMAIL-CODE/verify] New email verified: ${normalizedEmail}`);
      return NextResponse.json({ success: true, verified: true, email: normalizedEmail });
    }

    // Existing member — create a session and report destination.
    const memberResult = await safeQuery(
      `SELECT id, username, name, onboarded, onboarding_step,
              COALESCE(tier, 'free') as tier,
              COALESCE(roles, ARRAY['member']) as roles
         FROM members WHERE id = $1 LIMIT 1`,
      [memberId]
    );
    const record = memberResult.rows[0] || {};
    const onboardingTarget = getNextOnboardingStep({
      onboarded: Boolean(record.onboarded),
      onboarding_step: record.onboarding_step as string,
    });

    // ── SESSION IS AUTHENTICATION (invariant) ──────────────────────────────
    // Session creation used to be caught and treated as non-fatal: the route
    // still returned success and a member payload, and the client stored a
    // localStorage session with no server session behind it. That is the
    // "signed in here but not there / MAIA thinks I'm someone else" class of
    // bug — the client believes it is authenticated while the server does not.
    //
    // No valid server session means authentication has NOT completed. The
    // session is therefore created BEFORE any success is reported, and a
    // failure is returned as a failure.
    let session: Awaited<ReturnType<typeof createSession>>;
    try {
      const userAgent = request.headers.get('user-agent') || '';
      session = await createSession({ memberId, ipAddress: clientIP, userAgent });
    } catch (sessionErr) {
      console.error('[EMAIL-CODE/verify] Session creation FAILED — authentication not completed:', sessionErr);
      trackOnboarding({ event: 'session_missing_after_verify', memberId, path: ENDPOINT });
      // The code was already burned above, so a retry starts from a fresh code.
      return NextResponse.json(
        { error: "We verified your email but couldn't sign you in. Please request a new code." },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      success: true,
      member: {
        id: memberId,
        username: (record.username as string) || '',
        name: (record.name as string) || '',
        onboarded: Boolean(record.onboarded),
        onboardingStep: record.onboarding_step,
      },
      redirect: onboardingTarget.path,
    });

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

    // Signed access context (AUTH-BOUNDARY-01B). The four cookies above are
    // server-issued but not server-verified on arrival; this one is HMAC-signed
    // so the Edge gate can tell a grant the server made from one a caller wrote.
    // Best-effort: a missing secret returns null and logs, and middleware falls
    // through to the bounded compat path — sign-in never fails over this.
    const signedCtx = await signAccessContext({
      sub: String(memberId),
      roles: (record.roles as string[]) || ['member'],
      tier: String(record.tier || 'free'),
    });
    if (signedCtx) response.cookies.set(ACCESS_CONTEXT_COOKIE, signedCtx, cookieOpts);
    trackOnboarding({ event: 'session_created', memberId, path: ENDPOINT });
    console.log(`[EMAIL-CODE/verify] Session created for existing member: ${record.username}`);

    return response;
  } catch (error) {
    console.error('[EMAIL-CODE/verify] Error:', error);
    return NextResponse.json({ error: 'Could not verify the code. Please try again.' }, { status: 500 });
  }
}
