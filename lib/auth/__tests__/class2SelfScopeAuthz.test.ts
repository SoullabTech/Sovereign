/**
 * T1 — Class-2 self-scoped actor→subject authorization. Ten handlers, six routes.
 *
 * Contract under test, uniform across all ten:
 *   client memberId  -> SUBJECT / redundant claim, never ACTOR
 *   verified session -> ACTOR
 *   authorization    -> BEFORE read, write, model call, or service effect
 *
 * TWO CONTROLS ARE STRONGER THAN "no member-scoped SELECT", by design:
 *   invites/list  the first DB effect is an UNPARAMETERIZED global expiry UPDATE
 *                 that precedes every read. A gate placed one line too low still
 *                 fires a table-wide write for an anonymous caller. So refusal
 *                 must prove ZERO SQL, not "no member SELECT".
 *   reader/ask    the LLM call is a distinct side effect that SQL-counting cannot
 *                 see. Refusal must prove the provider was never invoked.
 *
 * WHAT THIS PROVES: refusal semantics and effect-freedom at the route layer.
 * WHAT IT DOES NOT PROVE: native transport (T0), or any deployed behaviour.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';

// Three of these routes stub on CAPACITOR_BUILD *before* the auth path. If the
// test env inherited that flag, every refusal test would vacuously return a 200
// stub and pass while proving nothing.
delete process.env.CAPACITOR_BUILD;

const mockResolve = jest.fn<(r: unknown) => Promise<string | null>>();
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  __esModule: true,
  getMemberIdFromRequest: (r: unknown) => mockResolve(r),
}));

const mockQuery = jest.fn<(sql: string, p?: unknown[]) => Promise<{ rows: unknown[] }>>();
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  query: (s: string, p?: unknown[]) => mockQuery(s, p),
  pool: { query: (s: string, p?: unknown[]) => mockQuery(s, p) },
}));

const mockGenerate = jest.fn(async () => ({ text: 'synthetic' }));
jest.mock('@/lib/consciousness/LLMProvider', () => ({
  __esModule: true,
  getLLMProvider: () => ({ generateSimple: mockGenerate }),
}));

const u = (p: string, qs = '') => `http://localhost${p}${qs}`;
const getReq = (p: string, qs = ''): any => ({ url: u(p, qs), nextUrl: new URL(u(p, qs)), headers: new Headers() });
const postReq = (p: string, body: unknown): any => ({
  url: u(p), nextUrl: new URL(u(p)), headers: new Headers(), json: async () => body,
});

const sqlCount = () => mockQuery.mock.calls.length;
const llmCount = () => mockGenerate.mock.calls.length;

beforeEach(() => {
  jest.clearAllMocks();
  delete process.env.CAPACITOR_BUILD;
  mockQuery.mockResolvedValue({ rows: [{ id: 'x', member_id: A, onboarded: false, onboarding_step: 'faq', invites_remaining: 1 }] });
});

/** name, module, invoke-with-subject-B, invoke-with-subject-A, invoke-with-no-echo */
type Case = {
  name: string; mod: string;
  withB: (m: any) => Promise<any>;
  withA: (m: any) => Promise<any>;
  noEcho?: (m: any) => Promise<any>;
};

const CASES: Case[] = [
  { name: 'members/progress POST', mod: '@/app/api/members/progress/route',
    withB: (m) => m.POST(postReq('/api/members/progress', { memberId: B, step: 'faq' })),
    withA: (m) => m.POST(postReq('/api/members/progress', { memberId: A, step: 'faq' })),
    noEcho: (m) => m.POST(postReq('/api/members/progress', { step: 'faq' })) },
  { name: 'members/progress GET', mod: '@/app/api/members/progress/route',
    withB: (m) => m.GET(getReq('/api/members/progress', `?memberId=${B}`)),
    withA: (m) => m.GET(getReq('/api/members/progress', `?memberId=${A}`)),
    noEcho: (m) => m.GET(getReq('/api/members/progress')) },
  { name: 'invites/list GET', mod: '@/app/api/invites/list/route',
    withB: (m) => m.GET(getReq('/api/invites/list', `?memberId=${B}`)),
    withA: (m) => m.GET(getReq('/api/invites/list', `?memberId=${A}`)) },
  { name: 'trajectory/focus POST', mod: '@/app/api/maia/trajectory/focus/route',
    withB: (m) => m.POST(postReq('/api/maia/trajectory/focus', { memberId: B, domain: 'identity', intention: 'x' })),
    withA: (m) => m.POST(postReq('/api/maia/trajectory/focus', { memberId: A, domain: 'identity', intention: 'x' })) },
  { name: 'trajectory/focus GET', mod: '@/app/api/maia/trajectory/focus/route',
    withB: (m) => m.GET(getReq('/api/maia/trajectory/focus', `?memberId=${B}`)),
    withA: (m) => m.GET(getReq('/api/maia/trajectory/focus', `?memberId=${A}`)) },
  { name: 'reader/moments GET', mod: '@/app/api/reader/moments/route',
    withB: (m) => m.GET(getReq('/api/reader/moments')),   // actor came from a header; no echo param
    withA: (m) => m.GET(getReq('/api/reader/moments')) },
  { name: 'reader/moments POST', mod: '@/app/api/reader/moments/route',
    withB: (m) => m.POST(postReq('/api/reader/moments', { segmentId: 's1', momentType: 'note' })),
    withA: (m) => m.POST(postReq('/api/reader/moments', { segmentId: 's1', momentType: 'note' })) },
  { name: 'reader/ask POST', mod: '@/app/api/reader/ask/route',
    withB: (m) => m.POST(postReq('/api/reader/ask', { segmentId: 's1', question: 'q' })),
    withA: (m) => m.POST(postReq('/api/reader/ask', { segmentId: 's1', question: 'q' })) },
  { name: 'orientation GET', mod: '@/app/api/commons/contributions/orientation/route',
    withB: (m) => m.GET(getReq('/api/commons/contributions/orientation', `?memberId=${B}`)),
    withA: (m) => m.GET(getReq('/api/commons/contributions/orientation', `?memberId=${A}`)) },
  { name: 'orientation POST', mod: '@/app/api/commons/contributions/orientation/route',
    withB: (m) => m.POST(postReq('/api/commons/contributions/orientation', { memberId: B })),
    withA: (m) => m.POST(postReq('/api/commons/contributions/orientation', { memberId: A })) },
];

describe('CAPACITOR_BUILD is cleared — refusal tests are not vacuous stubs', () => {
  it('flag is unset for the whole suite', () => {
    expect(process.env.CAPACITOR_BUILD).toBeUndefined();
  });
});

describe('unauthenticated: refused, with zero effects', () => {
  for (const c of CASES) {
    it(`${c.name} -> 401, zero SQL, zero model calls`, async () => {
      mockResolve.mockResolvedValue(null);
      const m = await import(c.mod);
      const res = await c.withB(m);
      expect({ c: c.name, status: res.status }).toEqual({ c: c.name, status: 401 });
      expect({ c: c.name, sql: sqlCount() }).toEqual({ c: c.name, sql: 0 });
      expect({ c: c.name, llm: llmCount() }).toEqual({ c: c.name, llm: 0 });
    });
  }
});

describe('actor A naming subject B: refused, with zero effects', () => {
  // reader/* take the actor from a header and carry no echo param, so a
  // cross-member claim is not expressible there — those two are covered by the
  // hardened resolver rejecting a mismatched x-member-id, not by a 403 here.
  const echoing = CASES.filter((c) => !c.name.startsWith('reader/'));
  for (const c of echoing) {
    it(`${c.name} -> 403, zero SQL, zero model calls`, async () => {
      mockResolve.mockResolvedValue(A);
      const m = await import(c.mod);
      const res = await c.withB(m);
      expect({ c: c.name, status: res.status }).toEqual({ c: c.name, status: 403 });
      expect({ c: c.name, sql: sqlCount() }).toEqual({ c: c.name, sql: 0 });
      expect({ c: c.name, llm: llmCount() }).toEqual({ c: c.name, llm: 0 });
    });
  }
});

describe('actor A naming A (or omitting the echo): admitted, effects bind A', () => {
  for (const c of CASES) {
    it(`${c.name} -> admitted`, async () => {
      mockResolve.mockResolvedValue(A);
      const m = await import(c.mod);
      const res = await c.withA(m);
      expect({ c: c.name, refused: res.status === 401 || res.status === 403 })
        .toEqual({ c: c.name, refused: false });
      // No member-scoped statement may be parameterised with anyone but A.
      for (const call of mockQuery.mock.calls) {
        const params = (call[1] ?? []) as unknown[];
        expect({ c: c.name, leakedB: params.includes(B) }).toEqual({ c: c.name, leakedB: false });
      }
    });
  }

  for (const c of CASES.filter((x) => x.noEcho)) {
    it(`${c.name} -> admitted with no redundant echo supplied`, async () => {
      mockResolve.mockResolvedValue(A);
      const m = await import(c.mod);
      const res = await c.noEcho!(m);
      expect({ c: c.name, refused: res.status === 401 || res.status === 403 })
        .toEqual({ c: c.name, refused: false });
    });
  }
});

// ===========================================================================
// The two specials
// ===========================================================================

describe('reader/ask — the model is a side effect, not a query', () => {
  it('unauthenticated: generateSimple is NEVER called', async () => {
    mockResolve.mockResolvedValue(null);
    const m = await import('@/app/api/reader/ask/route');
    const res = await m.POST(postReq('/api/reader/ask', { segmentId: 's1', question: 'q' }));
    expect(res.status).toBe(401);
    expect(mockGenerate).not.toHaveBeenCalled();
    expect(sqlCount()).toBe(0);
  });
});

describe('invites/list — the first DB effect is an unparameterized global write', () => {
  it('unauthenticated: the global expiry UPDATE never fires', async () => {
    mockResolve.mockResolvedValue(null);
    const m = await import('@/app/api/invites/list/route');
    const res = await m.GET(getReq('/api/invites/list', `?memberId=${B}`));
    expect(res.status).toBe(401);
    expect(sqlCount()).toBe(0);
    const statements = mockQuery.mock.calls.map((k) => String(k[0]));
    expect(statements.filter((s) => /UPDATE\s+invites/i.test(s))).toEqual([]);
  });

  it('cross-member: the global expiry UPDATE never fires', async () => {
    mockResolve.mockResolvedValue(A);
    const m = await import('@/app/api/invites/list/route');
    const res = await m.GET(getReq('/api/invites/list', `?memberId=${B}`));
    expect(res.status).toBe(403);
    expect(sqlCount()).toBe(0);
  });
});
