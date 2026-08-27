/**
 * AUTH-BOUNDARY-01 — adversarial proof that the middleware gate is not
 * satisfiable by client-supplied identity, role or tier assertions.
 *
 * WHY THIS EXISTS, AND WHY IT IS BEHAVIOURAL RATHER THAN STRUCTURAL.
 *
 * The Caddy containment that stripped `X-Maia-Roles` / `X-Maia-Tier` at the edge
 * has not been enforced since 2026-08-25T18:38:38Z (EDGE-SECURITY-CUSTODY-01),
 * and it never stripped `x-access-roles` at all. So the acceptance bar for this
 * unit is not "tests green" — it is:
 *
 *     removing Caddy's header stripping must no longer make a forged client
 *     identity authoritative.
 *
 * A source-grep guard cannot demonstrate that. These cases send the forged
 * headers a stripped edge would have removed and assert the request is refused
 * anyway.
 *
 * The path under test is `/api/founder/tasks`: `rolesAnyOf: ['admin']` in
 * `config/accessMatrix.ts`, and an API route, so denials are JSON status codes
 * rather than redirects. `/api/founder/*` handlers additionally self-guard with
 * `requireFounder()` — that is the correct posture and is deliberately NOT what
 * these cases measure. They measure the gate alone, because 48 other role-gated
 * API routes have no such second guard (AUTH-BOUNDARY-01 census).
 */
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

const ORIGIN = 'https://soullab.life';
const ROLE_GATED = `${ORIGIN}/api/founder/tasks`;

/** A real-looking member UUID. Member ids are routinely exposed to clients. */
const KNOWN_MEMBER_ID = '88099bb1-977c-4c1e-9f3a-000000000000';

function request(url: string, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest(url, { headers: { host: 'soullab.life', ...headers } });
}

async function statusOf(req: NextRequest): Promise<number> {
  const res = await middleware(req);
  return res?.status ?? 0;
}

describe('AUTH-BOUNDARY-01 · forged client assertions are not authentication', () => {
  it('refuses a request carrying no credential at all', async () => {
    expect(await statusOf(request(ROLE_GATED))).toBe(401);
  });

  it('refuses a bare x-member-id — an identifier is not a credential', async () => {
    // BEFORE: `isAuthenticated()` returned true for ANY x-member-id value, so
    // this passed the gate and reached the handler.
    expect(await statusOf(request(ROLE_GATED, { 'x-member-id': KNOWN_MEMBER_ID }))).toBe(401);
  });

  it('refuses ?_m= — the resolver never honoured it, only the gate did', async () => {
    expect(await statusOf(request(`${ROLE_GATED}?_m=${KNOWN_MEMBER_ID}`))).toBe(401);
  });

  it('refuses forged identity + forged admin role together', async () => {
    // The exact shape a stripped edge was compensating for.
    const res = request(ROLE_GATED, {
      'x-member-id': KNOWN_MEMBER_ID,
      'x-maia-roles': 'admin',
      'x-maia-tier': 'pro',
    });
    expect(await statusOf(res)).toBe(401);
  });

  it('does not grant admin from x-maia-roles when a credential IS present', async () => {
    // A session token makes the gate treat the request as *routable*, which is
    // all an Edge-runtime gate can honestly say — it cannot reach Postgres to
    // validate. Roles must NOT come along for the ride: the caller is a plain
    // member, so a role-gated path is 403, never 200.
    const status = await statusOf(
      request(ROLE_GATED, { 'x-session-token': 'forged-not-in-auth_sessions', 'x-maia-roles': 'admin' })
    );
    expect(status).toBe(403);
    expect(status).not.toBe(200);
  });

  it('does not grant admin from x-access-roles either', async () => {
    // `x-access-*` are stamped onto the RESPONSE by middleware, so they never
    // arrive from middleware on a request. The edge containment never stripped
    // them. If they were ever read as input, this is where it would show.
    const status = await statusOf(
      request(ROLE_GATED, { 'x-session-token': 'forged', 'x-access-roles': 'admin', 'x-access-tier': 'pro' })
    );
    expect(status).toBe(403);
  });

  it('does not grant pro tier from x-maia-tier', async () => {
    const status = await statusOf(
      request(ROLE_GATED, { 'x-session-token': 'forged', 'x-maia-tier': 'pro' })
    );
    expect(status).not.toBe(200);
  });
});

describe('AUTH-BOUNDARY-01 · legitimate server-issued context still works', () => {
  it('admits a session whose roles came from the server-issued cookie', async () => {
    // `setSessionCookies.ts` writes maia_session / maia_roles / maia_tier from
    // the member record at login. Removing the HEADER sources must not remove
    // this path — that would be repairing by deleting functionality.
    //
    // NOTE the standing limit, named rather than hidden: a cookie is not yet a
    // trustworthy authority. `httpOnly` constrains browser JS, not a non-browser
    // client sending its own `Cookie:` line. Closing that half requires a signed
    // context and is NOT claimed by this unit.
    const res = request(ROLE_GATED, {
      cookie: `maia_session=server-issued; maia_roles=${encodeURIComponent('["admin"]')}; maia_tier=pro`,
    });
    const status = await statusOf(res);
    expect(status).not.toBe(401);
    expect(status).not.toBe(403);
  });
});
