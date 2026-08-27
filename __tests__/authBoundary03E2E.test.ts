/**
 * AUTH-BOUNDARY-03 — integrated adversarial end-to-end.
 *
 * ACCEPTANCE STATEMENT UNDER TEST:
 *   Across middleware, signed access context, request/session resolution and the
 *   repaired route-local fallbacks, no client-controlled identity, role, tier or
 *   target identifier can elevate or switch caller authority.
 *
 * This chains the REAL pipeline: `middleware()` first, and only if it does not
 * deny, the REAL route handler. That ordering matters — a case that middleware
 * lets through and the route refuses is a different fact from one middleware
 * blocks, and collapsing them would hide which layer is load-bearing.
 *
 * THE PROOF IS NOT THE STATUS CODE. Each case also records the caller the system
 * resolves and the authority it grants BEFORE authorization runs. A 403 reached
 * with the wrong resolved caller would be the right answer for the wrong reason,
 * and this unit exists to tell those apart.
 */
import { NextRequest } from 'next/server';

const MEMBER_A = 'aaaaaaaa-0000-4000-8000-000000000001';
const MEMBER_B = 'bbbbbbbb-0000-4000-8000-000000000002';
const PRACTICE_OF_A = 'ppppaaaa-0000-4000-8000-00000000000a';
const SESSION_A = 'session-token-for-member-a';
const SESSION_B = 'session-token-for-member-b';
const CTX_SECRET = 'e2e-secret-at-least-thirty-two-characters!';

let cookieJar: Record<string, string> = {};

jest.mock('next/headers', () => ({
  cookies: async () => ({
    get: (n: string) => (cookieJar[n] ? { value: cookieJar[n] } : undefined),
  }),
  headers: async () => ({ get: () => null }),
}));

jest.mock('@/lib/db/postgres', () => ({
  query: jest.fn(async (sql: string, params: unknown[] = []) => {
    if (/FROM auth_sessions/i.test(sql)) {
      const t = params[0];
      if (t === SESSION_A) return { rows: [{ member_id: MEMBER_A }] };
      if (t === SESSION_B) return { rows: [{ member_id: MEMBER_B }] };
      return { rows: [] };
    }
    if (/FROM rl_practices/i.test(sql) && /owner_user_id/i.test(sql)) {
      const [practiceId, memberId] = params as string[];
      const owner = practiceId === PRACTICE_OF_A ? MEMBER_A : null;
      return { rows: owner && owner === memberId ? [{ id: practiceId }] : [] };
    }
    if (/SELECT id FROM members WHERE id/i.test(sql)) return { rows: [{ id: params[0] }] };
    return { rows: [{ active: 0, total: 0, count: 0, sum: 0 }] };
  }),
}));

// Imported after mocks are registered.
/* eslint-disable @typescript-eslint/no-var-requires */
const { middleware } = require('@/middleware');
const { getMemberIdFromRequest } = require('@/lib/auth/getMemberFromRequest');
const { verifyAccessContext, signAccessContext } = require('@/lib/auth/accessContext');
const { GET: dashboardGET } = require('@/app/api/practitioner/practices/[practiceId]/labtools/dashboard/route');
/* eslint-enable @typescript-eslint/no-var-requires */

const TARGET = `https://soullab.life/api/practitioner/practices/${PRACTICE_OF_A}/labtools/dashboard`;

interface Case {
  name: string;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
  expected: number;
  expectCaller: string | null;
}

interface Record_ {
  request: string;
  resolvedCaller: string | null;
  resolvedAuthority: string;
  target: string;
  decision: number;
  expected: number;
  actual: number;
}

const records: Record_[] = [];

/**
 * Drive the whole path. Cookies are mirrored into BOTH the request's `Cookie`
 * header (middleware reads NextRequest cookies) and the `next/headers` jar (the
 * route's resolver reads that), because a real browser sends one thing and the
 * two layers read it through different APIs.
 */
async function run(c: Case): Promise<Record_> {
  cookieJar = { ...(c.cookies ?? {}) };
  const cookieHeader = Object.entries(cookieJar).map(([k, v]) => `${k}=${v}`).join('; ');
  const headers: Record<string, string> = { host: 'soullab.life', ...(c.headers ?? {}) };
  if (cookieHeader) headers.cookie = cookieHeader;

  const req = new NextRequest(TARGET, { headers });

  // What the system believes about the caller, before any authorization.
  const resolvedCaller = await getMemberIdFromRequest(req);
  const ctx = await verifyAccessContext(cookieJar['maia_ctx']);
  const resolvedAuthority = ctx.ok
    ? `signed:${(ctx.payload.roles as string[]).join('|')}/${ctx.payload.tier}`
    : `unsigned(${ctx.reason})`;

  // Layer 1: middleware. Layer 2 only runs if layer 1 did not deny.
  const mw = await middleware(req);
  let decision = mw?.status ?? 0;
  if (decision === 200 || decision === 0) {
    const res = await dashboardGET(req, { params: Promise.resolve({ practiceId: PRACTICE_OF_A }) });
    decision = res.status;
  }

  const rec: Record_ = {
    request: c.name,
    resolvedCaller,
    resolvedAuthority,
    target: `practice ${PRACTICE_OF_A.slice(0, 8)} (owner ${MEMBER_A.slice(0, 8)})`,
    decision,
    expected: c.expected,
    actual: decision,
  };
  records.push(rec);
  return rec;
}

beforeEach(() => {
  process.env.AUTH_CONTEXT_SECRET = CTX_SECRET;
  cookieJar = {};
  jest.clearAllMocks();
});
afterEach(() => {
  delete process.env.AUTH_CONTEXT_COMPAT_UNTIL;
});

afterAll(() => {
  const pad = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s.padEnd(n));
  const lines = records.map(
    (r) =>
      `${pad(r.request, 46)} caller=${pad(String(r.resolvedCaller ?? 'none'), 10)} ` +
      `authority=${pad(r.resolvedAuthority, 24)} decision=${r.decision} expected=${r.expected}`
  );
  console.log('\nAUTH-BOUNDARY-03 case record\n' + lines.join('\n'));
});

describe('AUTH-BOUNDARY-03 · hostile classes', () => {
  it('1. forged identity header alone resolves NO caller and is denied', async () => {
    const r = await run({ name: '1 forged x-member-id', headers: { 'x-member-id': MEMBER_A }, expected: 401, expectCaller: null });
    expect(r.resolvedCaller).toBeNull();   // the point: not merely denied — nobody
    expect(r.decision).toBe(401);
  });

  it('2. forged role/tier headers grant no authority', async () => {
    const r = await run({
      name: '2 forged x-maia-roles/tier',
      headers: { 'x-member-id': MEMBER_A, 'x-maia-roles': 'admin', 'x-maia-tier': 'pro' },
      expected: 401, expectCaller: null,
    });
    expect(r.resolvedCaller).toBeNull();
    expect(r.resolvedAuthority).toMatch(/^unsigned/);
    expect(r.decision).toBe(401);
  });

  it('3. forged unsigned cookies grant no caller', async () => {
    process.env.AUTH_CONTEXT_COMPAT_UNTIL = '2000-01-01T00:00:00Z';
    const r = await run({
      name: '3 forged unsigned cookies',
      cookies: { maia_session: 'not-a-real-token', maia_member_id: MEMBER_A, maia_roles: '["admin"]', maia_tier: 'pro' },
      expected: 401, expectCaller: null,
    });
    // maia_session is unvalidatable at the Edge, so middleware routes it; the
    // route's resolver is where it dies. That layering is the finding.
    expect(r.resolvedCaller).toBeNull();
    expect(r.decision).toBe(401);
  });

  it('4. malformed signed context is refused and does not fall through as absent', async () => {
    process.env.AUTH_CONTEXT_COMPAT_UNTIL = '2000-01-01T00:00:00Z';
    const r = await run({
      name: '4 malformed signed context',
      cookies: { maia_session: SESSION_A, maia_ctx: 'garbage-no-dot' },
      expected: 200, expectCaller: MEMBER_A,
    });
    expect(r.resolvedAuthority).toBe('unsigned(malformed)');
    expect(r.resolvedCaller).toBe(MEMBER_A);  // identity survives; authority does not
  });

  it('5. valid context with a modified payload is refused', async () => {
    const good = (await signAccessContext({ sub: MEMBER_B, roles: ['member'], tier: 'free' }))!;
    const [body, sig] = good.split('.');
    const p = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    p.roles = ['admin']; p.sub = MEMBER_A;
    const forged = `${Buffer.from(JSON.stringify(p)).toString('base64url')}.${sig}`;
    const r = await run({
      name: '5 tampered signed payload',
      cookies: { maia_session: SESSION_B, maia_ctx: forged },
      expected: 404, expectCaller: MEMBER_B,
    });
    expect(r.resolvedAuthority).toBe('unsigned(bad_signature)');
    expect(r.resolvedCaller).toBe(MEMBER_B);  // still B — the forged sub bought nothing
    expect(r.decision).toBe(404);
  });

  it('6. expired signed context is refused', async () => {
    const stale = await signAccessContext({ sub: MEMBER_A, roles: ['admin'], tier: 'pro', ttlSeconds: -1 });
    const r = await run({
      name: '6 expired signed context',
      cookies: { maia_session: SESSION_A, maia_ctx: stale! },
      expected: 200, expectCaller: MEMBER_A,
    });
    expect(r.resolvedAuthority).toBe('unsigned(expired)');
  });

  it('7. signed member context + forged elevated cookie beside it does not top up', async () => {
    const ctx = (await signAccessContext({ sub: MEMBER_A, roles: ['member'], tier: 'free' }))!;
    const r = await run({
      name: '7 signed member + forged roles cookie',
      cookies: { maia_session: SESSION_A, maia_ctx: ctx, maia_roles: '["admin"]', maia_tier: 'pro' },
      expected: 200, expectCaller: MEMBER_A,
    });
    expect(r.resolvedAuthority).toBe('signed:member/free');  // NOT admin/pro
  });

  it('8. authenticated member A targeting member B — resolved as A, refused B’s resource', async () => {
    // Inverted here: B is authenticated, A owns the practice.
    const r = await run({
      name: '8 member B targets A resource',
      cookies: { maia_session: SESSION_B },
      expected: 404, expectCaller: MEMBER_B,
    });
    expect(r.resolvedCaller).toBe(MEMBER_B);  // correct caller...
    expect(r.decision).toBe(404);             // ...then correctly unauthorized
  });

  it('9. practitioner targeting an unrelated resource is refused on ownership', async () => {
    const ctx = (await signAccessContext({ sub: MEMBER_B, roles: ['practitioner'], tier: 'pro' }))!;
    const r = await run({
      name: '9 practitioner B, unrelated resource',
      cookies: { maia_session: SESSION_B, maia_ctx: ctx },
      expected: 404, expectCaller: MEMBER_B,
    });
    // A real, verified practitioner role does NOT substitute for ownership.
    expect(r.resolvedAuthority).toBe('signed:practitioner/pro');
    expect(r.decision).toBe(404);
  });

  it('10. revoked / invalid session token resolves no caller', async () => {
    const r = await run({
      name: '10 revoked session token',
      headers: { 'x-session-token': 'revoked-token' },
      expected: 401, expectCaller: null,
    });
    expect(r.resolvedCaller).toBeNull();
    expect(r.decision).toBe(401);
  });
});

describe('AUTH-BOUNDARY-03 · legitimate classes', () => {
  it('11. legitimate cookie session reaches its own resource', async () => {
    const r = await run({ name: '11 legit cookie session', cookies: { maia_session: SESSION_A }, expected: 200, expectCaller: MEMBER_A });
    expect(r.resolvedCaller).toBe(MEMBER_A);
    expect(r.decision).toBe(200);
  });

  it('12. legitimate x-session-token session reaches its own resource', async () => {
    const r = await run({ name: '12 legit x-session-token', headers: { 'x-session-token': SESSION_A }, expected: 200, expectCaller: MEMBER_A });
    expect(r.resolvedCaller).toBe(MEMBER_A);
    expect(r.decision).toBe(200);
  });

  it('13. legitimate ownership holds with a matching identity claim present', async () => {
    const r = await run({
      name: '13 legit owner + matching claim',
      headers: { 'x-member-id': MEMBER_A },
      cookies: { maia_session: SESSION_A },
      expected: 200, expectCaller: MEMBER_A,
    });
    expect(r.decision).toBe(200);
  });

  it('14. legitimate signed elevated access is honoured', async () => {
    process.env.AUTH_CONTEXT_COMPAT_UNTIL = '2000-01-01T00:00:00Z';
    const ctx = (await signAccessContext({ sub: MEMBER_A, roles: ['admin', 'practitioner'], tier: 'pro' }))!;
    const r = await run({
      name: '14 legit signed elevated',
      cookies: { maia_session: SESSION_A, maia_ctx: ctx },
      expected: 200, expectCaller: MEMBER_A,
    });
    expect(r.resolvedAuthority).toBe('signed:admin|practitioner/pro');
    expect(r.decision).toBe(200);
  });
});

describe('AUTH-BOUNDARY-03 · cross-layer: passing middleware is not passing the route', () => {
  it('15. a request crafted to SATISFY middleware still cannot impersonate at the route', async () => {
    // This is the case the falsification chain turns on. The attacker sends an
    // unvalidatable `x-session-token` (Edge cannot check it), plus forged role
    // and tier cookies which — WHILE THE COMPATIBILITY WINDOW IS OPEN —
    // middleware still honours, plus a forged `x-member-id`. Middleware lets it
    // through. The route's resolver is what refuses it.
    //
    // Recorded as a live, bounded exposure rather than hidden: until the window
    // closes, forged role cookies do satisfy middleware role gates. That is the
    // migration's stated cost, and it is precisely why the route layer had to be
    // repaired rather than left to the edge.
    process.env.AUTH_CONTEXT_COMPAT_UNTIL = '2099-01-01T00:00:00Z';
    const r = await run({
      name: '15 middleware-passing forged identity',
      headers: { 'x-session-token': 'unvalidatable-at-edge', 'x-member-id': MEMBER_A },
      cookies: { maia_roles: '["practitioner"]', maia_tier: 'pro' },
      expected: 401, expectCaller: null,
    });
    expect(r.resolvedCaller).toBeNull();
    expect(r.decision).toBe(401);
  });

  it('16. closing the window does NOT move the denial to middleware — a real finding', async () => {
    // I expected 403 from middleware here. It is 401 from the route, and the
    // reason is worth recording rather than smoothing over.
    //
    // With the window closed the grant collapses to roles=['member'] tier='free'.
    // The matrix rule for /api/practitioner/practices carries BOTH
    // `minTier: 'pro'` and `rolesAnyOf: ['practitioner','admin']`, and
    // `checkAccess` reports the tier failure first. Middleware's
    // `case 'insufficient-tier'` is an explicit development bypass that returns
    // `NextResponse.next()` — so the request is waved through and the ROLE check
    // never runs at all.
    //
    // Consequence, stated plainly: for any rule that pairs minTier with
    // rolesAnyOf, middleware's role gate is unreachable whenever tier is
    // insufficient. Middleware is therefore not the enforcer for these routes in
    // either window state — the route layer is. That is an argument for the
    // repair order this programme followed, and a defect to file separately; it
    // is NOT something AUTH-BOUNDARY-03 should quietly fix.
    process.env.AUTH_CONTEXT_COMPAT_UNTIL = '2000-01-01T00:00:00Z';
    const r = await run({
      name: '16 same request, compat closed',
      headers: { 'x-session-token': 'unvalidatable-at-edge', 'x-member-id': MEMBER_A },
      cookies: { maia_roles: '["practitioner"]', maia_tier: 'pro' },
      expected: 401, expectCaller: null,
    });
    expect(r.decision).toBe(401);       // the ROUTE refuses, not middleware
    expect(r.resolvedCaller).toBeNull(); // and it refuses because nobody is authenticated
  });
});
