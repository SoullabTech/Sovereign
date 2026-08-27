export const dynamic = 'force-dynamic';

/**
 * Session Management Endpoint
 *
 * GET: Returns current session data (validates session, returns fresh member data)
 * POST: Refreshes session cookies with fresh tier/roles from database
 *
 * Use cases:
 * - After Stripe checkout success → call POST to refresh tier cookie
 * - On page load → call GET to validate session and get current member data
 * - Periodically → call POST to ensure cookies reflect DB state
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db/postgres';
import type { Tier, Role } from '@/config/accessMatrix';
import { resolveMemberDisplayName } from '@/lib/stellium/clients';
import { ACCESS_CONTEXT_COOKIE, signAccessContext } from '@/lib/auth/accessContext';

interface SessionRow {
  member_id: string;
  expires_at: Date;
  revoked: boolean;
}

interface MemberRow {
  id: string;
  username: string;
  name: string;
  preferred_name: string | null;
  onboarded: boolean;
  onboarding_step: string;
  tier: Tier;
  roles: Role[];
}

const COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

/**
 * GET /api/members/session
 * Returns current session state without modifying cookies
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('maia_session')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Validate session in database
    const sessionResult = await query<SessionRow>(
      `SELECT member_id, expires_at, revoked
       FROM auth_sessions
       WHERE session_token = $1`,
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return NextResponse.json({ authenticated: false, reason: 'invalid_session' }, { status: 401 });
    }

    const session = sessionResult.rows[0];

    if (session.revoked) {
      return NextResponse.json({ authenticated: false, reason: 'revoked' }, { status: 401 });
    }

    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json({ authenticated: false, reason: 'expired' }, { status: 401 });
    }

    // Get fresh member data
    const memberResult = await query<MemberRow>(
      `SELECT id, username, name, preferred_name, onboarded, onboarding_step,
              COALESCE(tier, 'free') as tier,
              COALESCE(roles, ARRAY['member']::TEXT[]) as roles
       FROM members WHERE id = $1`,
      [session.member_id]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json({ authenticated: false, reason: 'member_not_found' }, { status: 401 });
    }

    const member = memberResult.rows[0];

    return NextResponse.json({
      authenticated: true,
      member: {
        id: member.id,
        username: member.username,
        name: member.name,
        preferredName: resolveMemberDisplayName(member),
        onboarded: member.onboarded,
        onboardingStep: member.onboarding_step,
        tier: member.tier,
        roles: member.roles,
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[MEMBERS] Session check error: ${message}`);
    return NextResponse.json(
      { error: 'Failed to check session' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/members/session
 * Refreshes session cookies with fresh tier/roles from database
 * Call this after Stripe checkout or when you need to sync cookies with DB
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('maia_session')?.value;

    if (!token) {
      return NextResponse.json({ refreshed: false, reason: 'no_session' }, { status: 401 });
    }

    // Validate session in database
    const sessionResult = await query<SessionRow>(
      `SELECT member_id, expires_at, revoked
       FROM auth_sessions
       WHERE session_token = $1`,
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return NextResponse.json({ refreshed: false, reason: 'invalid_session' }, { status: 401 });
    }

    const session = sessionResult.rows[0];

    if (session.revoked) {
      return NextResponse.json({ refreshed: false, reason: 'revoked' }, { status: 401 });
    }

    const expiresAt = new Date(session.expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json({ refreshed: false, reason: 'expired' }, { status: 401 });
    }

    // Get fresh member data
    const memberResult = await query<MemberRow>(
      `SELECT id, username, name, preferred_name, onboarded, onboarding_step,
              COALESCE(tier, 'free') as tier,
              COALESCE(roles, ARRAY['member']::TEXT[]) as roles
       FROM members WHERE id = $1`,
      [session.member_id]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json({ refreshed: false, reason: 'member_not_found' }, { status: 401 });
    }

    const member = memberResult.rows[0];

    // Refresh all cookies with fresh data
    cookieStore.set('maia_member_id', member.id, {
      ...COOKIE_OPTIONS,
      httpOnly: true,
      expires: expiresAt,
    });

    cookieStore.set('maia_tier', member.tier, {
      ...COOKIE_OPTIONS,
      httpOnly: true,
      expires: expiresAt,
    });

    cookieStore.set('maia_roles', JSON.stringify(member.roles), {
      ...COOKIE_OPTIONS,
      httpOnly: true,
      expires: expiresAt,
    });

    // Signed access context (AUTH-BOUNDARY-01B). The cookies above are
    // server-issued but not server-verified on arrival; this one is signed so
    // the Edge gate can distinguish a grant the server made from one a caller
    // wrote. Best-effort: no secret configured -> null, and middleware falls
    // through to the bounded compatibility path. Sign-in never fails over it.
    const signedAccessCtx = await signAccessContext({
      sub: String(member.id),
      roles: (member.roles) as string[],
      tier: String(member.tier),
    });
    if (signedAccessCtx) cookieStore.set(ACCESS_CONTEXT_COOKIE, signedAccessCtx, {
      ...COOKIE_OPTIONS,
      httpOnly: true,
      expires: expiresAt,
    });

    console.log(`[MEMBERS] Session refreshed for ${member.username}: tier=${member.tier} roles=${member.roles.join(',')}`);

    return NextResponse.json({
      refreshed: true,
      member: {
        id: member.id,
        username: member.username,
        name: member.name,
        preferredName: resolveMemberDisplayName(member),
        onboarded: member.onboarded,
        onboardingStep: member.onboarding_step,
        tier: member.tier,
        roles: member.roles,
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[MEMBERS] Session refresh error: ${message}`);
    return NextResponse.json(
      { error: 'Failed to refresh session' },
      { status: 500 }
    );
  }
}
