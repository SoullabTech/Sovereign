/**
 * RF01 S0-A1.1: member identity for account/privacy controls.
 *
 * Credentials name the actor. Client member IDs can only be consistency claims.
 * A request bearing two valid credentials for different members fails closed.
 * Deliberately independent of the access matrix: route handlers must stand alone.
 */
import type { NextRequest } from 'next/server';
import { getMemberIdFromRequest, getMemberIdFromSessionToken } from './getMemberFromRequest';

export type PrivacyActor =
  | { ok: true; memberId: string }
  | { ok: false; status: 400 | 401 | 403; code: string };

export function matchingClaim(claim: unknown, actor: string): boolean {
  return claim == null || (typeof claim === 'string' && claim === actor);
}

export async function resolvePrivacyActor(
  request: NextRequest,
  claimedMemberId?: unknown,
): Promise<PrivacyActor> {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return { ok: false, status: 401, code: 'SESSION_REQUIRED' };

  // A valid browser cookie and a different valid native token must not choose
  // an actor through cookie-first or header-first precedence.
  const cookieToken = request.cookies.get('maia_session')?.value;
  const headerToken = request.headers.get('x-session-token');
  if (cookieToken && headerToken && cookieToken !== headerToken) {
    const [cookieMember, headerMember] = await Promise.all([
      getMemberIdFromSessionToken(cookieToken),
      getMemberIdFromSessionToken(headerToken),
    ]);
    if (cookieMember && headerMember && cookieMember !== headerMember) {
      return { ok: false, status: 403, code: 'CREDENTIAL_CONFLICT' };
    }
  }

  if (claimedMemberId != null && typeof claimedMemberId !== 'string') {
    return { ok: false, status: 400, code: 'INVALID_MEMBER_CLAIM' };
  }
  if (!matchingClaim(claimedMemberId, memberId)) {
    return { ok: false, status: 403, code: 'MEMBER_CLAIM_MISMATCH' };
  }

  return { ok: true, memberId };
}
