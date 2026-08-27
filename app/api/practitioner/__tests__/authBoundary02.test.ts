/**
 * AUTH-BOUNDARY-02 — hostile cross-member proofs for the repaired routes.
 *
 * THE INVARIANT UNDER TEST:
 *   a client may name a TARGET resource; it may never name WHO IT IS.
 *
 * These drive the real route handlers with `@/lib/db/postgres` and
 * `next/headers` mocked, so the caller-identity path and the ownership path are
 * both exercised for real. The ownership SQL is deliberately NOT stubbed to
 * "always true": the fake database enforces `owner_user_id`, because a test that
 * cannot fail on ownership cannot prove ownership.
 *
 * SEPARATION KEPT EXPLICIT, per the unit's rule:
 *   AUTHENTICATION — who are you        → getMemberIdFromRequest / auth_sessions
 *   AUTHORIZATION  — may you touch that → verifyPracticeOwnership / owner_user_id
 * A verified member is still refused another member's practice.
 */
import { NextRequest } from 'next/server';

const MEMBER_A = 'aaaaaaaa-0000-4000-8000-000000000001';
const MEMBER_B = 'bbbbbbbb-0000-4000-8000-000000000002';
const PRACTICE_OF_A = 'ppppaaaa-0000-4000-8000-00000000000a';
const PRACTICE_OF_B = 'ppppbbbb-0000-4000-8000-00000000000b';

const SESSION_A = 'session-token-for-member-a';
const SESSION_B = 'session-token-for-member-b';

/** Cookie jar the mocked `next/headers` serves. Reset per test. */
let cookieJar: Record<string, string> = {};

jest.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (cookieJar[name] ? { value: cookieJar[name] } : undefined),
  }),
  headers: async () => ({ get: () => null }),
}));

jest.mock('@/lib/db/postgres', () => ({
  query: jest.fn(async (sql: string, params: unknown[] = []) => {
    // Session validation — the ONLY thing that establishes a caller.
    if (/FROM auth_sessions/i.test(sql)) {
      const token = params[0];
      if (token === SESSION_A) return { rows: [{ member_id: MEMBER_A }] };
      if (token === SESSION_B) return { rows: [{ member_id: MEMBER_B }] };
      return { rows: [] };
    }
    // Practice ownership — real check against a real owner map.
    if (/FROM rl_practices/i.test(sql) && /owner_user_id/i.test(sql)) {
      const [practiceId, memberId] = params as string[];
      const owner = practiceId === PRACTICE_OF_A ? MEMBER_A
                  : practiceId === PRACTICE_OF_B ? MEMBER_B
                  : null;
      return { rows: owner && owner === memberId ? [{ id: practiceId }] : [] };
    }
    // Practitioner profile by slug — the portal route's target lookup.
    if (/FROM practitioners/i.test(sql)) {
      const slug = (params as string[])[0];
      if (slug === 'practice-of-a') {
        return { rows: [{ id: 'prac-a', member_id: MEMBER_A, slug, name: 'A', email: 'a@example.com', is_active: true }] };
      }
      return { rows: [] };
    }
    // Bare member existence — the pattern this unit removed. If a repaired
    // route still calls it to establish a caller, it now gets nothing useful.
    if (/SELECT id FROM members WHERE id/i.test(sql)) {
      return { rows: [{ id: params[0] }] };
    }
    // Everything else: one benign aggregate row. The handler's own SELECTs are
    // not what this suite measures, and an empty result would 500 the legitimate
    // path — which would let a capability regression hide as a crash.
    return { rows: [{ active: 0, total: 0, count: 0, sum: 0 }] };
  }),
}));

function req(url: string, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest(url, { headers: { host: 'soullab.life', ...headers } });
}

const dashboardUrl = (p: string) =>
  `https://soullab.life/api/practitioner/practices/${p}/labtools/dashboard`;

// Imported after the mocks are registered.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { GET: dashboardGET } = require('../practices/[practiceId]/labtools/dashboard/route');

const ctx = (practiceId: string) => ({ params: Promise.resolve({ practiceId }) });

beforeEach(() => {
  cookieJar = {};
  jest.clearAllMocks();
});

describe('AUTH-BOUNDARY-02 · a client cannot choose who it is', () => {
  it('unauthenticated caller naming a valid member id is refused', async () => {
    // The exact removed pattern: a real member UUID, no credential at all.
    const res = await dashboardGET(req(dashboardUrl(PRACTICE_OF_A), { 'x-member-id': MEMBER_A }), ctx(PRACTICE_OF_A));
    expect(res.status).toBe(401);
  });

  it('unauthenticated caller with no header at all is refused', async () => {
    const res = await dashboardGET(req(dashboardUrl(PRACTICE_OF_A)), ctx(PRACTICE_OF_A));
    expect(res.status).toBe(401);
  });

  it('a forged x-member-id alongside a REAL session cannot switch the caller', async () => {
    // Member B signs in honestly, then claims to be A. The resolver rejects the
    // mismatch outright rather than preferring either side.
    cookieJar['maia_session'] = SESSION_B;
    const res = await dashboardGET(
      req(dashboardUrl(PRACTICE_OF_A), { 'x-member-id': MEMBER_A }),
      ctx(PRACTICE_OF_A)
    );
    expect(res.status).toBe(401);
  });

  it('member B with a real session cannot read member A’s practice', async () => {
    // AUTHENTICATION passes, AUTHORIZATION does not. This is the case that
    // proves the two were never collapsed into one.
    cookieJar['maia_session'] = SESSION_B;
    const res = await dashboardGET(req(dashboardUrl(PRACTICE_OF_A)), ctx(PRACTICE_OF_A));
    expect(res.status).toBe(404);
  });

  it('a stale/revoked session token is refused', async () => {
    cookieJar['maia_session'] = 'revoked-or-expired-token';
    const res = await dashboardGET(req(dashboardUrl(PRACTICE_OF_A)), ctx(PRACTICE_OF_A));
    expect(res.status).toBe(401);
  });

  it('x-session-token header path works and is still ownership-bound', async () => {
    // Safari/iOS transport. Member B is genuinely authenticated here and still
    // refused A's practice — the header transport is not a privilege.
    const res = await dashboardGET(
      req(dashboardUrl(PRACTICE_OF_A), { 'x-session-token': SESSION_B }),
      ctx(PRACTICE_OF_A)
    );
    expect(res.status).toBe(404);
  });
});

describe('AUTH-BOUNDARY-02 · legitimate practitioner capability is preserved', () => {
  it('member A reaches their OWN practice via session cookie', async () => {
    cookieJar['maia_session'] = SESSION_A;
    const res = await dashboardGET(req(dashboardUrl(PRACTICE_OF_A)), ctx(PRACTICE_OF_A));
    expect(res.status).toBe(200);
  });

  it('member A reaches their own practice via the x-session-token transport', async () => {
    const res = await dashboardGET(
      req(dashboardUrl(PRACTICE_OF_A), { 'x-session-token': SESSION_A }),
      ctx(PRACTICE_OF_A)
    );
    expect(res.status).toBe(200);
  });

  it('member A may send a MATCHING x-member-id — a claim that agrees is not an error', async () => {
    // apiFetch sends x-member-id alongside the token. Treating agreement as
    // conflict would break every native client, which would be repairing the
    // boundary by removing capability.
    cookieJar['maia_session'] = SESSION_A;
    const res = await dashboardGET(
      req(dashboardUrl(PRACTICE_OF_A), { 'x-member-id': MEMBER_A }),
      ctx(PRACTICE_OF_A)
    );
    expect(res.status).toBe(200);
  });

  it('member B reaches their own practice — the repair is not owner-specific', async () => {
    cookieJar['maia_session'] = SESSION_B;
    const res = await dashboardGET(req(dashboardUrl(PRACTICE_OF_B)), ctx(PRACTICE_OF_B));
    expect(res.status).toBe(200);
  });
});


/**
 * The portal route is a separate class: its target is a practitioner PROFILE
 * addressed by slug, and its response carries that practitioner's name and
 * email. Before the repair the caller was `member_id` cookie || `x-member-id`
 * header — both client-authored, neither validated — so naming a practitioner's
 * member id returned their profile. That is a PII disclosure, not only an access
 * error, which is why it gets its own hostile case.
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { GET: portalGET } = require('../../portal/[slug]/auth/route');
const portalCtx = (slug: string) => ({ params: { slug } });
const portalUrl = (slug: string) => `https://soullab.life/api/portal/${slug}/auth`;

describe('AUTH-BOUNDARY-02 · portal practitioner profile', () => {
  it('a forged x-member-id no longer returns another practitioner’s profile', async () => {
    const res = await portalGET(
      req(portalUrl('practice-of-a'), { 'x-member-id': MEMBER_A }),
      portalCtx('practice-of-a')
    );
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(JSON.stringify(body)).not.toContain('a@example.com');
  });

  it('a forged member_id COOKIE no longer returns it either', async () => {
    // The cookie half of the same vector: `member_id` is not part of the
    // canonical auth contract and was never validated against a session.
    cookieJar['member_id'] = MEMBER_A;
    const res = await portalGET(req(portalUrl('practice-of-a')), portalCtx('practice-of-a'));
    expect(res.status).toBe(401);
  });

  it('member B, genuinely authenticated, is refused member A’s profile', async () => {
    cookieJar['maia_session'] = SESSION_B;
    const res = await portalGET(req(portalUrl('practice-of-a')), portalCtx('practice-of-a'));
    expect(res.status).toBe(403);
  });

  it('member A still reaches their own practitioner profile', async () => {
    cookieJar['maia_session'] = SESSION_A;
    const res = await portalGET(req(portalUrl('practice-of-a')), portalCtx('practice-of-a'));
    expect(res.status).toBe(200);
  });
});
