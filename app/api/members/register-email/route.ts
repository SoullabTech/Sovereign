export const dynamic = 'force-dynamic';

/** AUTH-RETURN-01 — create a member from one exact registration proof. */

import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { transaction } from '@/lib/db/postgres';
import { consumeRegistrationProof, lockRegistrationProof, RegistrationProofError } from '@/lib/auth/registrationProof';
import { generateSecureToken, hashPassword } from '@/lib/auth/passwordUtils';
import { setSessionCookies } from '@/lib/auth/setSessionCookies';
import { revokeSession } from '@/lib/auth/serverSessions';
import {
  AuthOriginError,
  normalizeReturnDestination,
  requireSameOriginAuthMutation,
} from '@/lib/auth/returnDestination';
import { checkRateLimit, getClientIP, buildRateLimitHeaders } from '@/lib/auth/rateLimiter';
import { memberRef } from '@/lib/privacy/memberRef';

const ENDPOINT = '/api/members/register-email';
const NO_STORE = { 'Cache-Control': 'private, no-store' };
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const PROOF_COOKIE = 'maia_registration_proof';

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { ...NO_STORE, ...headers } });
}

class RegistrationConflict extends Error {
  constructor(readonly field: 'email' | 'username') {
    super(`${field} is already registered`);
    this.name = 'RegistrationConflict';
  }
}

export async function POST(request: NextRequest) {
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
      { error: 'Too many registration attempts. Please try again later.' },
      429,
      buildRateLimitHeaders(rateLimitResult),
    );
  }

  let committedSessionId: string | undefined;
  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const username = typeof body?.username === 'string' ? body.username.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const bodyProof = typeof body?.registrationProof === 'string' ? body.registrationProof.trim() : '';
    const registrationProof = bodyProof || request.cookies.get(PROOF_COOKIE)?.value || '';
    const requestedReturn = normalizeReturnDestination(body?.next, '/home');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: 'A valid email is required.' }, 400);
    }
    if (!/^[a-zA-Z0-9_]{3,32}$/.test(username)) {
      return json({ error: 'Username must be 3–32 letters, numbers, or underscores.' }, 400);
    }
    if (password.length < 12 || password.length > 200) {
      return json({ error: 'Password must be at least 12 characters.' }, 400);
    }
    if (!registrationProof) {
      return json({ error: 'A verified registration proof is required.' }, 403);
    }

    // Slow password work occurs before the transaction, while the proof remains
    // unconsumed. The transaction then performs only bounded indexed work.
    const passwordHash = await hashPassword(password);
    const memberId = randomUUID();
    const sessionId = randomUUID();
    // Match the existing session schema and createSession's 256-bit token.
    const sessionToken = generateSecureToken(32);
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    const displayName = name || username;
    const syntheticPasskey = `EMAIL-${randomUUID()}`;
    const userAgent = request.headers.get('user-agent') || '';

    const created = await transaction(async (client) => {
      await client.query(
        `SELECT pg_advisory_xact_lock(hashtextextended($1, 0))`,
        [`AUTH-RETURN-01:register:${email}`],
      );
      await client.query(
        `SELECT pg_advisory_xact_lock(hashtextextended($1, 0))`,
        [`AUTH-RETURN-01:username:${username.toLowerCase()}`],
      );

      // Establish proof authority before disclosing conflicts or creating a
      // member. Retain the proof lock until the whole transaction completes.
      await lockRegistrationProof(client, {
        proof: registrationProof, email,
      });

      const emailConflict = await client.query(
        `SELECT id FROM members WHERE LOWER(email) = $1 LIMIT 1`,
        [email],
      );
      if (emailConflict.rows.length) throw new RegistrationConflict('email');
      const usernameConflict = await client.query(
        `SELECT id FROM members WHERE LOWER(username) = LOWER($1) LIMIT 1`,
        [username],
      );
      if (usernameConflict.rows.length) throw new RegistrationConflict('username');

      const memberResult = await client.query(
        `INSERT INTO members (
           id, passkey, username, password_hash, name, email, onboarding_step
         ) VALUES ($1, $2, $3, $4, $5, $6, 'faq')
         RETURNING id, username, name, onboarded, onboarding_step,
                   COALESCE(tier, 'free') AS tier,
                   COALESCE(roles, ARRAY['member']::TEXT[]) AS roles`,
        [memberId, syntheticPasskey, username, passwordHash, displayName, email],
      );
      const member = memberResult.rows[0] as {
        id: string; username: string; name: string; onboarded: boolean;
        onboarding_step: string | null; tier: 'free'; roles: Array<'member'>;
      };

      // The member now exists for the proof's immediate foreign key. Proof,
      // member and session still commit together or all roll back on failure.
      await consumeRegistrationProof(client, {
        proof: registrationProof, email, memberId,
      });

      await client.query(
        `INSERT INTO auth_sessions (
           id, member_id, session_token, expires_at, ip_address, user_agent
         ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [sessionId, memberId, sessionToken, expiresAt.toISOString(), clientIP || null, userAgent || null],
      );
      const sessionReadback = await client.query(
        `SELECT id, member_id, session_token, revoked, expires_at
           FROM auth_sessions
          WHERE id = $1 AND member_id = $2 AND session_token = $3
            AND revoked = FALSE AND expires_at > NOW()
          LIMIT 1`,
        [sessionId, memberId, sessionToken],
      );
      const durableSession = sessionReadback.rows[0] as {
        id?: string; member_id?: string; session_token?: string; revoked?: boolean;
      } | undefined;
      if (
        !durableSession
        || durableSession.id !== sessionId
        || durableSession.member_id !== memberId
        || durableSession.session_token !== sessionToken
        || durableSession.revoked !== false
      ) {
        throw new Error('registration session readback did not match issuance');
      }

      return member;
    });

    committedSessionId = sessionId;
    const onboardingRedirect = `/faq?next=${encodeURIComponent(requestedReturn)}`;
    const response = json({
      success: true,
      authenticated: true,
      member: {
        id: created.id,
        username: created.username,
        name: created.name,
        onboarded: created.onboarded,
        onboardingStep: created.onboarding_step,
        tier: created.tier,
        roles: created.roles,
      },
      redirect: onboardingRedirect,
    });
    setSessionCookies(response, {
      memberId: created.id,
      tier: created.tier,
      roles: created.roles,
      sessionToken,
    });
    response.cookies.set(PROOF_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: ENDPOINT,
      maxAge: 0,
    });
    console.log(`[register-email] Member and verified session committed member=${memberRef(created.id)}`);
    return response;
  } catch (error) {
    if (committedSessionId) {
      // Account, proof and session already committed. A failed response cannot
      // undo that fact or be reported as a retryable, uncreated registration.
      const revoked = await revokeSession(committedSessionId, 'registration_response_failed');
      if (!revoked) console.error('[register-email] Unreturned session revocation unavailable');
      console.error('[register-email] Account created; authentication response could not be completed');
      return json({
        success: false,
        authenticated: false,
        registrationCreated: true,
        error: 'Your account was created, but we could not confirm a secure session. Please sign in to continue.',
        reason: 'session_issuance_failed',
        recovery: { action: 'signin', path: '/signin' },
      }, 503);
    }
    if (error instanceof RegistrationProofError) {
      const status = error.code === 'REGISTRATION_PROOF_CONSUMED' ? 409 : 403;
      return json({ error: error.message, reason: error.code }, status);
    }
    if (error instanceof RegistrationConflict) {
      return json(
        {
          error: error.field === 'email'
            ? 'An account with this email already exists. Try signing in instead.'
            : 'Username already taken. Please choose a different one.',
          reason: `registration_${error.field}_conflict`,
        },
        409,
      );
    }
    const code = (error as { code?: unknown })?.code;
    if (code === '23505') {
      return json({ error: 'That email or username is already registered.' }, 409);
    }
    console.error('[register-email] Registration outcome could not be confirmed');
    return json({ error: 'We could not confirm registration. Please try signing in or contact support.' }, 500);
  }
}
