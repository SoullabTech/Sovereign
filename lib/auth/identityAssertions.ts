/**
 * AUTH-BOUNDARY-01 — the client-assertable surface, named in one place.
 *
 * This module is deliberately DEPENDENCY-FREE so it can be imported by the Edge
 * runtime (`middleware.ts`) and by the Node runtime (`lib/auth/verifiedAccess.ts`)
 * alike. It must never import the postgres driver, or anything that does — the
 * middleware would fail to build.
 *
 * It answers exactly two questions, and deliberately no others:
 *   1. Which inbound headers are identity/role/tier ASSERTIONS a client can forge?
 *   2. Did this request present something that could be a session credential?
 *
 * Neither question is "is this caller authenticated". That question requires a
 * database and is answered only by `deriveVerifiedAccess` in the Node runtime.
 */

import type { NextRequest } from 'next/server';

/**
 * Headers a client can set that assert identity, role, or tier.
 *
 * Every one of these is stripped from the inbound request in the middleware,
 * before any handler can read it. The list lives here — one name, one place —
 * because a header contained at the edge and forgotten in the application is
 * exactly the gap this unit was opened to close.
 *
 * Note that `x-session-token` is NOT in this list. It is a credential, not an
 * assertion: it is worthless to a forger without a valid token value, and it is
 * validated against `auth_sessions` before it grants anything.
 */
export const CLIENT_ASSERTABLE_IDENTITY_HEADERS: readonly string[] = [
  // Identity claims.
  'x-member-id',
  'x-maia-member-id',
  // Role / tier claims.
  'x-maia-roles',
  'x-maia-tier',
  // Middleware-derived context. These are OURS to set on the forwarded
  // request; an inbound copy is always a forgery attempt.
  'x-access-authed',
  'x-access-tier',
  'x-access-roles',
  'x-access-member-id',
  'x-access-rule',
  'x-access-unmapped',
  'x-access-capacitor-bypass',
];

/**
 * The ONE client-assertable name a real client actually sends.
 *
 * `apiFetch()` sets `x-member-id` deliberately (lib/http/apiBase.ts), because
 * iOS WebView cannot carry a SameSite cookie cross-origin. It is an identity
 * CLAIM, not authority: the resolvers verify the session first and reject a
 * claim that disagrees with it.
 *
 * The list is a list because the exemption has to be argued per name, with a
 * real sender behind it. Nothing else has one.
 */
export const CLIENT_SENT_IDENTITY_CLAIM_HEADERS: readonly string[] = ['x-member-id'];

/**
 * The subset a legitimate client NEVER sends — derived, so it cannot drift.
 *
 * Everything else in `CLIENT_ASSERTABLE_IDENTITY_HEADERS` is either middleware's
 * own derived answer ("an inbound copy is always a forgery attempt", above) or a
 * role/tier claim no client has any business making. A route reached WITHOUT
 * middleware sanitisation can refuse these outright rather than merely ignoring
 * them: there is no honest sender to break.
 *
 * `x-maia-member-id` is HERE, not exempt. It is an alias `getMemberIdFromRequest`
 * does not even inspect, and no client in this repo sends it — so exempting it
 * would leave an unverified identity assertion ambient in a handler, which is
 * exactly the boundary this list exists to hold.
 */
export const NEVER_CLIENT_SENT_IDENTITY_HEADERS: readonly string[] =
  CLIENT_ASSERTABLE_IDENTITY_HEADERS.filter(
    (h) => !CLIENT_SENT_IDENTITY_CLAIM_HEADERS.includes(h),
  );

/** Which of those a request is carrying. Empty for every honest request. */
export function forgedIdentityHeaders(inbound: Headers): string[] {
  return NEVER_CLIENT_SENT_IDENTITY_HEADERS.filter((h) => inbound.has(h));
}

/**
 * Read the session credential a request presents, in priority order.
 *
 * 1. `maia_session` cookie    — web, sent automatically (incl. by EventSource)
 * 2. `x-session-token` header — Safari/iOS, where ITP blocks the cookie
 * 3. `?_t=` query param        — SSE/EventSource, which cannot set headers
 *
 * Note what is NOT here: `x-member-id`, and the `?_m=` member-id query param.
 * Presenting an identifier is not presenting a credential. Treating `_m` as
 * authentication is precisely the defect this unit repairs.
 */
export function readSessionCredential(req: NextRequest): string | null {
  const cookieToken = req.cookies.get('maia_session')?.value;
  if (cookieToken) return cookieToken;

  const headerToken = req.headers.get('x-session-token');
  if (headerToken) return headerToken;

  try {
    const queryToken = new URL(req.url).searchParams.get('_t');
    if (queryToken) return queryToken;
  } catch {
    // Malformed URL — no credential.
  }

  return null;
}

/**
 * True when the request presents *something* that could be a session token.
 *
 * This is the only authentication question the Edge runtime can answer, and it
 * is named so that no caller mistakes it for validation. Presence is not
 * validity. A caller that needs authority calls `deriveVerifiedAccess`.
 */
export function hasSessionCredential(req: NextRequest): boolean {
  return readSessionCredential(req) !== null;
}

/**
 * Strip every client-assertable identity header from an inbound header set.
 *
 * Returns a NEW Headers instance; the caller decides what to add back. The
 * middleware adds back only values it derived itself, so a handler reading
 * `x-access-roles` reads our answer or nothing at all — never the caller's.
 */
export function stripClientIdentityAssertions(inbound: Headers): Headers {
  const sanitized = new Headers(inbound);
  for (const header of CLIENT_ASSERTABLE_IDENTITY_HEADERS) {
    sanitized.delete(header);
  }
  return sanitized;
}
