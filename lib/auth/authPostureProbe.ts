import { NextRequest } from 'next/server';
import { getMemberIdFromSessionToken } from './getMemberFromRequest';

/**
 * Phase 0 of the auth-posture convergence (docs/specs/AUTH_POSTURE_X_MEMBER_ID_2026-07-11.md).
 *
 * LOG-ONLY. Returns exactly the bare `x-member-id` header — identical to the
 * header read it replaces — while asynchronously answering the one question
 * Phase 1 is gated on: does a live client population send `x-member-id`
 * WITHOUT a resolvable `auth_sessions` credential?
 *
 * Marker: `[auth-posture]` — grep production logs for it. Expected steady
 * state is `credentialPresent: true, match: true` (apiFetch sends both).
 * Any sustained `headerPresent: true, sessionResolved: false` population is
 * the legacy-client break risk and must be resolved before Phase 1 ships.
 *
 * This helper is scaffolding: Phase 1 replaces every call site with
 * `getMemberIdFromRequest` and deletes this file.
 */
export function probeAuthPosture(request: NextRequest): string | null {
  const headerId = request.headers.get('x-member-id');

  void (async () => {
    try {
      const credential =
        request.cookies.get('maia_session')?.value ||
        request.headers.get('x-session-token') ||
        null;
      const sessionMemberId = await getMemberIdFromSessionToken(credential);
      const queryClaim = request.nextUrl.searchParams.get('memberId');
      console.log(
        '[auth-posture]',
        JSON.stringify({
          route: request.nextUrl.pathname,
          method: request.method,
          headerPresent: !!headerId,
          queryClaimPresent: !!queryClaim,
          credentialPresent: !!credential,
          sessionResolved: !!sessionMemberId,
          match: !!headerId && sessionMemberId === headerId,
          headerIdPrefix: headerId ? headerId.slice(0, 8) : null,
        })
      );
    } catch {
      // Observability must never affect the request.
    }
  })();

  return headerId;
}
