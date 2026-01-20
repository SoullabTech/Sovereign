/**
 * WebAuthn Authentication Verification
 *
 * POST /api/auth/webauthn/authenticate/verify
 *
 * Verifies the authentication response and creates a session.
 * This is the biometric signin endpoint.
 */

export const dynamic = 'force-static'

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthentication } from '@/lib/auth/webauthnServer';
import { createSession, setSessionCookie, getCurrentSession } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';
import { logAuthEvent } from '@/lib/security/authAudit';
import {
  checkRateLimit,
  resetRateLimit,
  getClientIP,
  buildRateLimitHeaders
} from '@/lib/auth/rateLimiter';
import type { AuthenticationResponseJSON } from '@simplewebauthn/server';

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

      return NextResponse.json(
        { error: result.error || 'Authentication failed' },
        { status: 401 }
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
      memberId: member.id,
      result: 'success',
      metadata: { credentialId: result.credentialId, isStepUpReauth }
    }, request);

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        username: member.username,
        name: member.name,
        preferredName: member.preferred_name || member.name,
        onboarded: member.onboarded,
        onboardingStep: member.onboarding_step,
        hasWebauthn: member.has_webauthn || true,
        preferredAuthMethod: 'webauthn'
      },
      session: session ? {
        expiresAt: session.expiresAt.toISOString()
      } : undefined
    });

  } catch (error) {
    console.error('[WebAuthn] Authentication verify error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
