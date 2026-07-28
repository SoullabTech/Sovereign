/**
 * Outbound delivery authority.
 *
 * The caller may REQUEST a delivery. The server determines whose authority and
 * whose credentials may perform it. That separation is the whole point of this
 * module, and it is why the request body is never consulted for identity.
 *
 * BEFORE (2026-07-28): the outbound routes read `practitionerId` from the request
 * body, looked up that practitioner's provider credentials, and sent a
 * body-supplied message to a body-supplied recipient — with no session resolution
 * at all. Caller-selected actor, caller-selected credentials, caller-selected
 * recipient and content, and a real side effect outside the platform.
 *
 * AFTER: the acting member comes from a verified `auth_sessions`-backed session
 * (via getCurrentPractitioner → getMemberIdFromRequest), and the credential owner
 * is derived from authoritative records — the `practitioners` row linked to that
 * member. A body-supplied `practitionerId` is no longer an input; supplying one
 * that disagrees with the session is rejected rather than silently ignored, so a
 * stale or hostile caller gets an error instead of a surprise.
 *
 * Fails closed: no session, no active practitioner, or a mismatch → refusal.
 */

import { NextRequest } from 'next/server';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';

export type SendAuthority =
  | { ok: true; memberId: string; practitionerId: string }
  | { ok: false; status: 401 | 403; error: string };

/**
 * Resolve who is permitted to send, from verified session state only.
 *
 * @param claimedPractitionerId Whatever the body said, purely so a mismatch can
 *   be refused. It is never used to select credentials.
 */
export async function resolveSendAuthority(
  request: NextRequest,
  claimedPractitionerId?: unknown,
): Promise<SendAuthority> {
  const identity = await getCurrentPractitioner(request);

  if (!identity) {
    // Either no verified session, or the session's member has no active
    // practitioner record. Both are refusals — outbound delivery spends real
    // money and real reputation on someone's provider account.
    return { ok: false, status: 401, error: 'Authentication required' };
  }

  if (
    typeof claimedPractitionerId === 'string' &&
    claimedPractitionerId.length > 0 &&
    claimedPractitionerId !== identity.practitionerId
  ) {
    return {
      ok: false,
      status: 403,
      error: 'Requested sender does not match the authenticated practitioner',
    };
  }

  return { ok: true, memberId: identity.memberId, practitionerId: identity.practitionerId };
}
