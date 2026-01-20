/**
 * Session Cookie Management
 *
 * Call these functions after successful authentication to set
 * the cookies that middleware uses for access control.
 *
 * Usage (in signin API route):
 *   const response = NextResponse.json({ success: true });
 *   setSessionCookies(response, {
 *     memberId: user.id,
 *     tier: user.subscription_tier,
 *     roles: user.roles,
 *   });
 *   return response;
 */

import { NextResponse } from 'next/server';
import type { Tier, Role } from '@/config/accessMatrix';

export interface SessionData {
  memberId: string;
  tier: Tier;
  roles: Role[];
  /** Session token (optional, for additional validation) */
  sessionToken?: string;
}

/**
 * Cookie configuration
 */
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  // 30 days default, adjust as needed
  maxAge: 60 * 60 * 24 * 30,
};

/**
 * Set session cookies on a response
 */
export function setSessionCookies(
  response: NextResponse,
  session: SessionData
): NextResponse {
  // Session indicator (presence = authenticated)
  response.cookies.set('maia_session', session.sessionToken || 'active', {
    ...COOKIE_OPTIONS,
    httpOnly: true, // Can't be read by JS
  });

  // Member ID (for API routes that need it)
  response.cookies.set('maia_member_id', session.memberId, {
    ...COOKIE_OPTIONS,
    httpOnly: true,
  });

  // Tier (for middleware access checks)
  response.cookies.set('maia_tier', session.tier, {
    ...COOKIE_OPTIONS,
    httpOnly: false, // Allow client to read for UI gating
  });

  // Roles (for middleware access checks)
  response.cookies.set('maia_roles', JSON.stringify(session.roles), {
    ...COOKIE_OPTIONS,
    httpOnly: false, // Allow client to read for UI gating
  });

  return response;
}

/**
 * Clear session cookies (for logout)
 */
export function clearSessionCookies(response: NextResponse): NextResponse {
  const clearOptions = {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  };

  response.cookies.set('maia_session', '', clearOptions);
  response.cookies.set('maia_member_id', '', clearOptions);
  response.cookies.set('maia_tier', '', clearOptions);
  response.cookies.set('maia_roles', '', clearOptions);

  return response;
}

/**
 * Update tier cookie (e.g., after Stripe webhook confirms upgrade)
 */
export function updateTierCookie(response: NextResponse, tier: Tier): NextResponse {
  response.cookies.set('maia_tier', tier, {
    ...COOKIE_OPTIONS,
    httpOnly: false,
  });
  return response;
}

/**
 * Update roles cookie (e.g., after role assignment)
 */
export function updateRolesCookie(response: NextResponse, roles: Role[]): NextResponse {
  response.cookies.set('maia_roles', JSON.stringify(roles), {
    ...COOKIE_OPTIONS,
    httpOnly: false,
  });
  return response;
}

/**
 * Helper to get session from cookies (server-side)
 */
export function getSessionFromCookies(cookies: {
  get: (name: string) => { value: string } | undefined;
}): SessionData | null {
  const session = cookies.get('maia_session')?.value;
  const memberId = cookies.get('maia_member_id')?.value;
  const tier = cookies.get('maia_tier')?.value as Tier | undefined;
  const rolesRaw = cookies.get('maia_roles')?.value;

  if (!session || !memberId) return null;

  let roles: Role[] = ['member'];
  if (rolesRaw) {
    try {
      roles = JSON.parse(rolesRaw);
    } catch {
      // Invalid JSON
    }
  }

  return {
    memberId,
    tier: tier || 'free',
    roles,
    sessionToken: session,
  };
}
