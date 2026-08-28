/**
 * WebAuthn Authentication Verification
 *
 * POST /api/auth/webauthn/authenticate/verify
 *
 * Verifies the authentication response and creates a session.
 * This is the biometric signin endpoint.
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthentication } from '@/lib/auth/webauthnServer';
import { createSession, setSessionCookie, getCurrentSession } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';
import { logAuthEvent, hashCredential } from '@/lib/security/authAudit';
import {
  checkRateLimit,
  resetRateLimit,
  getClientIP,
  buildRateLimitHeaders
} from '@/lib/auth/rateLimiter';
import type { AuthenticationResponseJSON } from '@simplewebauthn/server';
import { resolveMemberDisplayName } from '@/lib/stellium/clients';

const ENDPOINT = '/api/auth/webauthn/authenticate/verify';

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || undefined;

  try {
    // Rate limit
    const rateLimitResult = await checkRateLimit(clientIP, 'ip', ENDPOINT);
    if (!rateLimitResult.allowed) {
      const headers = buildRateLimitHeaders(rateLimitResult);
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429, headers }
      );
    }

    const body = await request.json();
    const { response, challengeKey } = body as {
      response: AuthenticationResponseJSON;
      challengeKey: string;
    };

    if (!response || !challengeKey) {
      return NextResponse.json(
        { error: 'Authentication response and challenge key required' },
        { status: 400 }
      );
    }

    // Verify authentication
    const result = await verifyAuthentication(challengeKey, response);

    if (!result.verified || !result.memberId) {
      await logAuthEvent({
        action: 'webauthn_authenticate',
        memberId: null,
        result: 'failure',
        errorMessage: result.error
      }, request);

      // Map known errors to diagnostic codes (case-insensitive)
      let code = 'VERIFICATION_FAILED';
      const err = (result.error || '').toLowerCase();
      if (err.includes('challenge') && err.includes('expire')) code = 'CHALLENGE_EXPIRED';
      else if (err.includes('credential') && err.includes('not found')) code = 'CREDENTIAL_NOT_FOUND';
      else if (err.includes('not found')) code = 'CREDENTIAL_NOT_FOUND';

      return NextResponse.json(
        { ok: false, code, error: result.error || 'Authentication failed' },
        { status: 400 }
      );
    }

    // Reset rate limit on success
    await resetRateLimit(clientIP, 'ip', ENDPOINT);

    // Get member info
    const memberResult = await query(
      `SELECT id, username, name, preferred_name, onboarded, onboarding_step,
              has_webauthn, preferred_auth_method
       FROM members WHERE id = $1`,
      [result.memberId]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    const member = memberResult.rows[0];

    // Check for existing valid session (step-up re-auth vs initial signin)
    const existingSession = await getCurrentSession();
    const isStepUpReauth = existingSession && existingSession.memberId === member.id;

    // Only create new session if this is initial signin, not step-up re-auth
    let session;
    if (!isStepUpReauth) {
      try {
        session = await createSession({
          memberId: member.id,
          ipAddress: clientIP,
          userAgent
        });
        await setSessionCookie(session.sessionToken, session.expiresAt);
      } catch (sessionError) {
        console.error('[WebAuthn] Failed to create session:', sessionError);
      }
    } else {
      // Step-up re-auth: use existing session, don't create new one
      session = existingSession;
    }

    // Update last sign in and set preferred auth method
    await query(
      `UPDATE members SET last_sign_in = NOW(), preferred_auth_method = 'webauthn'
       WHERE id = $1`,
      [member.id]
    );

    await logAuthEvent({
      action: isStepUpReauth ? 'webauthn_step_up' : 'webauthn_authenticate',
      // Verification succeeded, so the member IS established here — unlike the
      // failure branch above, which correctly leaves the actor unset.
      actorId: member.id,
      memberId: member.id,
      result: 'success',
      metadata: { credential_hash: hashCredential(result.credentialId ?? ''), isStepUpReauth }
    }, request);

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        username: member.username,
        name: member.name,
        preferredName: resolveMemberDisplayName(member),
        onboarded: member.onboarded,
        onboardingStep: member.onboarding_step,
        // `|| true` here was unconditional — it reported an enrolled member for
        // every caller regardless of the column. The native sibling uses `|| false`.
        // AUTH-BIOMETRIC-01B: enrollment state must be reported honestly, since
        // the sign-in surface now decides what to offer from it.
        hasWebauthn: member.has_webauthn === true,
        preferredAuthMethod: 'webauthn'
      },
      session: session ? {
        expiresAt: session.expiresAt.toISOString(),
        // Include session token for Safari/iOS clients where cookies are blocked by ITP
        // Client should store this in localStorage and send via x-session-token header
        token: session.sessionToken
      } : undefined
    });

  } catch (error) {
    console.error('[WebAuthn] Authentication verify error:', error);

    // Extract diagnostic code from error (case-insensitive)
    const errMsg = error instanceof Error ? error.message : String(error);
    const errLower = errMsg.toLowerCase();
    let code = 'UNKNOWN';
    let status = 500; // Default to server error

    // Client errors (400) - user/config issues
    if (errLower.includes('origin')) {
      code = 'ORIGIN_MISMATCH';
      status = 400;
    } else if (errLower.includes('rp id') || errLower.includes('rpid') || errLower.includes('relying party')) {
      code = 'RPID_MISMATCH';
      status = 400;
    } else if (errLower.includes('challenge')) {
      code = 'CHALLENGE_INVALID';
      status = 400;
    } else if (errLower.includes('credential') || errLower.includes('passkey')) {
      code = 'CREDENTIAL_NOT_FOUND';
      status = 400;
    } else if (errLower.includes('user verification') || errLower.includes('uv')) {
      code = 'USER_VERIFICATION_REQUIRED';
      status = 400;
    } else if (errLower.includes('counter')) {
      code = 'COUNTER_MISMATCH';
      status = 400;
    }

    return NextResponse.json(
      {
        ok: false,
        code,
        error: 'Authentication failed',
        detail: process.env.NODE_ENV === 'development' ? errMsg : undefined
      },
      { status }
    );
  }
}
