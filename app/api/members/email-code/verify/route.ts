export const dynamic = 'force-dynamic';

/** AUTH-RETURN-01 — verify one accepted email challenge. */

import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db/postgres';
import { EmailCodeError, verifyEmailCode } from '@/lib/auth/emailCodeService';
import { createSession, revokeSession, validateSession } from '@/lib/auth/serverSessions';
import { setSessionCookies } from '@/lib/auth/setSessionCookies';
import {
  AuthOriginError,
  normalizeReturnDestination,
  requireSameOriginAuthMutation,
} from '@/lib/auth/returnDestination';
import { checkRateLimit, getClientIP, buildRateLimitHeaders } from '@/lib/auth/rateLimiter';
import { getNextOnboardingStep } from '@/lib/onboarding/state';
import { memberRef } from '@/lib/privacy/memberRef';
import type { Tier, Role } from '@/config/accessMatrix';

const ENDPOINT = '/api/members/email-code/verify';
const NO_STORE = { 'Cache-Control': 'private, no-store' };

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { ...NO_STORE, ...headers } });
}

interface MemberRow {
  id: string;
  username: string;
  name: string;
  onboarded: boolean;
  onboarding_step: string | null;
  tier: Tier;
  roles: Role[];
}

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return json({ error: 'Not available in app build' }, 503);
  }

  try {
    requireSameOriginAuthMutation(request);
  } catch (error) {
    if (error instanceof AuthOriginError) {
      return json({ error: 'Request origin refused', reason: error.code }, 403);
    }
    throw error;
  }

  const clientIP = getClientIP(request);
  const rateLimitResult = await checkRateLimit(clientIP, 'ip', ENDPOINT);
  if (!rateLimitResult.allowed) {
    return json(
      { error: 'Too many attempts. Please wait a moment and try again.' },
      429,
      buildRateLimitHeaders(rateLimitResult),
    );
  }

  try {
    const body = await request.json();
    if (typeof body?.email !== 'string' || typeof body?.code !== 'string') {
      return json({ error: 'Email and code are required.' }, 400);
    }
    const requestedReturn = normalizeReturnDestination(body.next, '/home');
    const verified = await transaction((client) =>
      verifyEmailCode(client, { email: body.email, code: body.code }),
    );

    // Verification refusals may have advanced the durable attempt/expiry
    // state. Respond only after the transaction has committed those changes.
    if (verified.kind === 'refused') {
      return json({ error: verified.message, reason: verified.code }, 400);
    }

    if (verified.kind === 'registration-required') {
      const response = json({
        success: true,
        authenticated: false,
        registrationRequired: true,
        email: verified.email,
        registrationProofExpiresAt: verified.registrationProofExpiresAt.toISOString(),
        redirect: requestedReturn,
      });
      response.cookies.set('maia_registration_proof', verified.registrationProof, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/members/register-email',
        expires: verified.registrationProofExpiresAt,
      });
      console.log(`[EMAIL-CODE/verify] HttpOnly registration proof issued challenge=${verified.challengeId}`);
      return response;
    }

    const memberResult = await query<MemberRow>(
      `SELECT id, username, name, onboarded, onboarding_step,
              COALESCE(tier, 'free') AS tier,
              COALESCE(roles, ARRAY['member']::TEXT[]) AS roles
         FROM members WHERE id = $1 LIMIT 1`,
      [verified.memberId],
    );
    const member = memberResult.rows[0];
    if (!member) {
      return json({ error: 'Member record is unavailable.' }, 503);
    }

    const target = getNextOnboardingStep(member);
    const redirect = target.ready ? requestedReturn : target.path;
    let session: Awaited<ReturnType<typeof createSession>> | undefined;
    try {
      session = await createSession({
        memberId: member.id,
        ipAddress: clientIP,
        userAgent: request.headers.get('user-agent') || '',
      });
      const readback = await validateSession(session.sessionToken);
      if (!readback || readback.id !== session.id || readback.memberId !== member.id || readback.revoked) {
        throw new Error('session readback did not match issuance');
      }
      const response = json({
        success: true,
        authenticated: true,
        registrationRequired: false,
        member: {
          id: member.id,
          username: member.username,
          name: member.name,
          onboarded: member.onboarded,
          onboardingStep: member.onboarding_step,
          tier: member.tier,
          roles: member.roles,
        },
        redirect,
      });
      setSessionCookies(response, {
        memberId: member.id,
        tier: member.tier,
        roles: member.roles,
        sessionToken: session.sessionToken,
      });
      console.log(`[EMAIL-CODE/verify] Verified session read back member=${memberRef(member.id)}`);
      return response;
    } catch {
      if (session) await revokeSession(session.id, 'session_readback_failed');
      console.error(`[EMAIL-CODE/verify] Session issuance/readback unavailable member=${memberRef(member.id)}`);
      return json(
        { error: "We verified your email but couldn't start a secure session. Request a new code." },
        503,
      );
    }
  } catch (error) {
    if (error instanceof EmailCodeError) {
      const status = error.code === 'AUTH_CODE_CONFIGURATION_REQUIRED' ? 503 : 400;
      return json({ error: error.message, reason: error.code }, status);
    }
    console.error('[EMAIL-CODE/verify] Verification failed');
    return json({ error: 'Could not verify the code. Please try again.' }, 500);
  }
}
