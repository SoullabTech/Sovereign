import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { verifyPassword } from '@/lib/auth/passwordUtils';
import { createSession, setSessionCookie, setAccessCookies } from '@/lib/auth/serverSessions';
import { logAuthEvent } from '@/lib/security/authAudit';
import { checkRateLimit, resetRateLimit, getClientIP } from '@/lib/auth/rateLimiter';

/**
 * POST /api/now-what/signin — sign-in at the environment's own door.
 *
 * Exists alongside /api/members/signin for one honest reason (Kelly ruling
 * 2026-07-16, existing-identity correction): an invited client who already
 * has a Soullab identity signs in AS THEMSELVES — and a client knows their
 * email far more reliably than a username. This route accepts either.
 * Same verification, same session mechanics, same rate limiting; no second
 * identity system.
 */

export const dynamic = 'force-dynamic';
const ENDPOINT = '/api/now-what/signin';

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  try {
    const rate = await checkRateLimit(clientIP, 'ip', ENDPOINT);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const identifier = (body.identifier || '').trim();
    const password = body.password || '';
    if (!identifier || !password) {
      return NextResponse.json({ error: 'Please enter your username or email, and your password.' }, { status: 400 });
    }

    const result = await query(
      `SELECT id, username, name, email, password_hash, onboarded, onboarding_step, tier, roles
       FROM members
       WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)
       LIMIT 1`,
      [identifier]
    );
    const member = result.rows[0];
    // Uniform failure: never reveals whether the identifier exists.
    const failure = NextResponse.json(
      { error: 'That didn’t match. Check your username or email, and your password.' },
      { status: 401 }
    );
    if (!member || !member.password_hash) return failure;

    const verifyResult = await verifyPassword(password, member.password_hash);
    if (!verifyResult.ok) {
      await logAuthEvent({ action: 'now_what_signin', memberId: member.id, result: 'failure' }, request);
      return failure;
    }

    await resetRateLimit(clientIP, 'ip', ENDPOINT);

    let session;
    try {
      session = await createSession({ memberId: member.id, ipAddress: clientIP, userAgent });
      await setSessionCookie(session.sessionToken, session.expiresAt);
      await setAccessCookies(member.id, member.tier || 'free', member.roles || ['member'], session.expiresAt);
    } catch (sessionError) {
      console.error('[NowWhatSignin] session creation failed:', sessionError);
    }

    await query(`UPDATE members SET last_sign_in = NOW() WHERE id = $1`, [member.id]);
    await logAuthEvent({ action: 'now_what_signin', memberId: member.id, result: 'success' }, request);

    return NextResponse.json({
      success: true,
      memberId: member.id,
      member: { id: member.id, username: member.username, name: member.name, onboarded: member.onboarded },
      session: session
        ? { expiresAt: session.expiresAt.toISOString(), token: session.sessionToken }
        : undefined,
    });
  } catch (error) {
    console.error('[NowWhatSignin] error:', error);
    return NextResponse.json({ error: 'Something went wrong on our side. Please try again.' }, { status: 500 });
  }
}
