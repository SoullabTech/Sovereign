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

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db/postgres';
import type { Tier, Role } from '@/config/accessMatrix';
import { resolveMemberDisplayName } from '@/lib/stellium/clients';
import { CabinLocalStore } from '@/lib/cabin/localStore';
import { deriveVerifiedAccess } from '@/lib/auth/verifiedAccess';
import { AuthOriginError, requireSameOriginAuthMutation } from '@/lib/auth/returnDestination';

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

function sessionJson(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set('Cache-Control', 'private, no-store');
  return NextResponse.json(body, { ...init, headers });
}

async function cabinSessionResponse() {
  const dataPath = process.env.MAIA_CABIN_DATA_PATH;
  if (!dataPath) {
    return sessionJson(
      { authenticated: false, reason: 'cabin_data_unavailable' },
      { status: 503 },
    );
  }

  const cookieStore = await cookies();
  const store = new CabinLocalStore(dataPath);

  try {
    const incoming = cookieStore.get('maia_cabin_session')?.value || null;
    let member = store.resolveSession(incoming);
    let issuedToken: string | null = null;

    if (!member) {
      member = store.ensureLocalMember();
      issuedToken = store.issueSession(member.id);
    }

    const response = sessionJson({
      authenticated: true,
      member: {
        id: member.id,
        username: member.username,
        name: member.name,
        preferredName: member.preferredName || member.name,
        onboarded: member.onboarded,
        onboardingStep: member.onboardingStep,
        tier: member.tier,
        roles: member.roles,
      },
    });

    if (issuedToken) {
      response.cookies.set('maia_cabin_session', issuedToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/',
        maxAge: 60 * 60 * 24 * 365 * 5,
      });
    }

    return response;
  } finally {
    store.close();
  }
}

/**
 * GET /api/members/session
 * Returns current session state without modifying cookies
 */
export async function GET(request?: NextRequest) {
  if (process.env.MAIA_CABIN_MODE === 'offline') {
    return cabinSessionResponse();
  }
  if (!request) {
    return sessionJson({ authenticated: false, reason: 'request_required' }, { status: 401 });
  }

  try {
    // Handler authority remains independent of Proxy admission. Every supplied
    // session transport and member claim must resolve to the same member.
    const authority = await deriveVerifiedAccess(request);
    if (!authority.authenticated) {
      return sessionJson(
        { authenticated: false, reason: authority.reason },
        { status: authority.reason === 'authority_unavailable' ? 503 : 401 },
      );
    }
    const cookieStore = await cookies();
    const token = cookieStore.get('maia_session')?.value;

    if (!token) {
      return sessionJson({ authenticated: false }, { status: 401 });
    }

    // Validate session in database
    const sessionResult = await query<SessionRow>(
      `SELECT member_id, expires_at, revoked
       FROM auth_sessions
       WHERE session_token = $1 AND member_id = $2
         AND revoked = FALSE AND expires_at > NOW()`,
      [token, authority.memberId]
    );

    if (sessionResult.rows.length === 0) {
      return sessionJson({ authenticated: false, reason: 'invalid_session' }, { status: 401 });
    }

    const session = sessionResult.rows[0];

    if (session.revoked || session.member_id !== authority.memberId) {
      return sessionJson({ authenticated: false, reason: 'revoked' }, { status: 401 });
    }

    const expiry = new Date(session.expires_at).getTime();
    if (!Number.isFinite(expiry) || expiry <= Date.now()) {
      return sessionJson({ authenticated: false, reason: 'expired' }, { status: 401 });
    }

    // Get fresh member data
    const memberResult = await query<MemberRow>(
      `SELECT id, username, name, preferred_name, onboarded, onboarding_step,
              COALESCE(tier, 'free') as tier,
              COALESCE(roles, ARRAY['member']::TEXT[]) as roles
       FROM members WHERE id = $1`,
      [session.member_id]
    );

    if (memberResult.rows.length === 0 || memberResult.rows[0].id !== authority.memberId) {
      return sessionJson({ authenticated: false, reason: 'member_not_found' }, { status: 401 });
    }

    const member = memberResult.rows[0];

    return sessionJson({
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
  } catch {
    console.error('[MEMBERS] Session check unavailable');
    return sessionJson(
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
export async function POST(request?: NextRequest) {
  if (process.env.MAIA_CABIN_MODE === 'offline') {
    return cabinSessionResponse();
  }
  if (!request) {
    return sessionJson({ refreshed: false, reason: 'request_required' }, { status: 401 });
  }
  try {
    requireSameOriginAuthMutation(request);
  } catch (error) {
    if (error instanceof AuthOriginError) {
      return sessionJson(
        { refreshed: false, error: 'Request origin refused', reason: error.code },
        { status: 403 },
      );
    }
    throw error;
  }

  try {
    const authority = await deriveVerifiedAccess(request);
    if (!authority.authenticated) {
      return sessionJson(
        { refreshed: false, reason: authority.reason },
        { status: authority.reason === 'authority_unavailable' ? 503 : 401 },
      );
    }
    const cookieStore = await cookies();
    const token = cookieStore.get('maia_session')?.value;

    if (!token) {
      return sessionJson({ refreshed: false, reason: 'no_session' }, { status: 401 });
    }

    // Validate session in database
    const sessionResult = await query<SessionRow>(
      `SELECT member_id, expires_at, revoked
       FROM auth_sessions
       WHERE session_token = $1 AND member_id = $2
         AND revoked = FALSE AND expires_at > NOW()`,
      [token, authority.memberId]
    );

    if (sessionResult.rows.length === 0) {
      return sessionJson({ refreshed: false, reason: 'invalid_session' }, { status: 401 });
    }

    const session = sessionResult.rows[0];

    if (session.revoked || session.member_id !== authority.memberId) {
      return sessionJson({ refreshed: false, reason: 'revoked' }, { status: 401 });
    }

    const expiresAt = new Date(session.expires_at);
    if (!Number.isFinite(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
      return sessionJson({ refreshed: false, reason: 'expired' }, { status: 401 });
    }

    // Get fresh member data
    const memberResult = await query<MemberRow>(
      `SELECT id, username, name, preferred_name, onboarded, onboarding_step,
              COALESCE(tier, 'free') as tier,
              COALESCE(roles, ARRAY['member']::TEXT[]) as roles
       FROM members WHERE id = $1`,
      [session.member_id]
    );

    if (memberResult.rows.length === 0 || memberResult.rows[0].id !== authority.memberId) {
      return sessionJson({ refreshed: false, reason: 'member_not_found' }, { status: 401 });
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

    console.log(`[MEMBERS] Session refreshed for ${member.username}: tier=${member.tier} roles=${member.roles.join(',')}`);

    return sessionJson({
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
  } catch {
    console.error('[MEMBERS] Session refresh unavailable');
    return sessionJson(
      { error: 'Failed to refresh session' },
      { status: 500 }
    );
  }
}
