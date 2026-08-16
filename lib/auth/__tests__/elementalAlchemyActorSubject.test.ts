/**
 * Elemental Alchemy — actor/subject authorization across all 12 handlers.
 *
 * The cluster is a MEMBER EXPERIENCE surface that reached member stores without
 * traversing the AIN foundation (identity → authority → provenance). Every
 * handler took its actor from the same client-supplied field it used as subject.
 *
 * TWO CONTROL PHILOSOPHIES, both required:
 *
 *   1. No SQL before authorization.
 *   2. No SERVICE OR CACHE EFFECT before authorization. This is the load-bearing
 *      one: `journey POST` persists via `journeyStateCache.set(state.userId, …)`
 *      with no database call at all, so counting SQL would have passed a handler
 *      that still mutated process-local state for an arbitrary member.
 *
 * WHAT THIS PROVES: unauthenticated and cross-member requests are refused, and a
 * refused request reaches neither SQL nor the service layer.
 * WHAT IT DOES NOT PROVE: runtime behaviour of the deployed system, or that any
 * pre-repair effect was ever exploited.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';

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
  insertOne: (...a: unknown[]) => mockQuery('insertOne', a),
  findOne: (...a: unknown[]) => mockQuery('findOne', a),
  updateOne: (...a: unknown[]) => mockQuery('updateOne', a),
}));

// Service layer — spied so we can prove ZERO invocation before authorization.
const svc = {
  recordShadowInstance: jest.fn(async () => ({ id: 'i' })),
  createShadowPattern: jest.fn(async () => ({ id: 'p' })),
  getShadowTransformationMetrics: jest.fn(async () => ({})),
  getUserShadowPatterns: jest.fn(async () => []),
  getPatternInstances: jest.fn(async () => []),
  getShadowPatternHistory: jest.fn(async () => ({ pattern: null, instances: [], timeline: [], progressSummary: {} })),
  updateJourneyProgress: jest.fn(async () => ({})),
  getJourneySnapshot: jest.fn(async () => ({})),
  detectCurrentFacet: jest.fn(async () => ({})),
  askTheBook: jest.fn(async () => ({ answer: 'x', chaptersLoaded: [] })),
  getTodaysAlchemy: jest.fn(async () => ({ morning: {}, midday: {}, evening: {} })),
  getDailyAlchemy: jest.fn(async () => ({})),
  getWeeklyAlchemyPlan: jest.fn(async () => ({})),
};
jest.mock('@/lib/features/ShadowIntegrationTracker', () => ({ __esModule: true, ...svc }));
jest.mock('@/lib/features/ElementalJourneyTracker', () => ({ __esModule: true, ...svc }));
jest.mock('@/lib/features/AskTheBookService', () => ({ __esModule: true, ...svc }));
jest.mock('@/lib/features/DailyAlchemyService', () => ({ __esModule: true, ...svc }));

const url = (p: string, qs = '') => `http://localhost${p}${qs}`;
const getReq = (p: string, qs = ''): any => ({ url: url(p, qs), nextUrl: new URL(url(p, qs)), headers: new Headers() });
const bodyReq = (p: string, body: unknown): any => ({
  url: url(p), nextUrl: new URL(url(p)), headers: new Headers(), json: async () => body,
});

const serviceCalls = () => Object.values(svc).reduce((n, f) => n + f.mock.calls.length, 0);

beforeEach(() => {
  jest.clearAllMocks();
  mockQuery.mockResolvedValue({ rows: [] });
});

// ===========================================================================
// The 10 standard self-scoped handlers
// ===========================================================================

type H = { name: string; mod: string; method: 'GET' | 'POST'; call: (m: any) => Promise<any> };

const STANDARD: H[] = [
  { name: 'shadow POST', mod: '@/app/api/elemental-alchemy/shadow/route', method: 'POST',
    call: (m) => m.POST(bodyReq('/api/elemental-alchemy/shadow', { userId: B, facet: 'f', shadowPattern: 'p', intensity: 3, noticeMethod: 'n', awareness: 'a' })) },
  { name: 'shadow GET', mod: '@/app/api/elemental-alchemy/shadow/route', method: 'GET',
    call: (m) => m.GET(getReq('/api/elemental-alchemy/shadow', `?userId=${B}`)) },
  { name: 'ask POST', mod: '@/app/api/elemental-alchemy/ask/route', method: 'POST',
    call: (m) => m.POST(bodyReq('/api/elemental-alchemy/ask', { userId: B, question: 'what is fire?' })) },
  { name: 'ask GET', mod: '@/app/api/elemental-alchemy/ask/route', method: 'GET',
    call: (m) => m.GET(getReq('/api/elemental-alchemy/ask', `?userId=${B}`)) },
  { name: 'daily GET', mod: '@/app/api/elemental-alchemy/daily/route', method: 'GET',
    call: (m) => m.GET(getReq('/api/elemental-alchemy/daily', `?userId=${B}`)) },
  { name: 'daily POST', mod: '@/app/api/elemental-alchemy/daily/route', method: 'POST',
    call: (m) => m.POST(bodyReq('/api/elemental-alchemy/daily', { userId: B, type: 'morning', element: 'fire' })) },
  { name: 'journey GET', mod: '@/app/api/elemental-alchemy/journey/route', method: 'GET',
    call: (m) => m.GET(getReq('/api/elemental-alchemy/journey', `?userId=${B}`)) },
  { name: 'journey POST', mod: '@/app/api/elemental-alchemy/journey/route', method: 'POST',
    call: (m) => m.POST(bodyReq('/api/elemental-alchemy/journey', { userId: B, update: {} })) },
  { name: 'practices/complete POST', mod: '@/app/api/elemental-alchemy/practices/complete/route', method: 'POST',
    call: (m) => m.POST(bodyReq('/api/elemental-alchemy/practices/complete', { userId: B, practiceId: 'p1' })) },
  { name: 'practices/complete GET', mod: '@/app/api/elemental-alchemy/practices/complete/route', method: 'GET',
    call: (m) => m.GET(getReq('/api/elemental-alchemy/practices/complete', `?userId=${B}`)) },
];

describe('10 standard self-scoped handlers', () => {
  for (const h of STANDARD) {
    it(`${h.name}: unauthenticated -> 401, and touches nothing`, async () => {
      mockResolve.mockResolvedValue(null);
      const mod = await import(h.mod);
      const res = await h.call(mod);
      expect({ h: h.name, status: res.status }).toEqual({ h: h.name, status: 401 });
      expect({ h: h.name, sql: mockQuery.mock.calls.length }).toEqual({ h: h.name, sql: 0 });
      expect({ h: h.name, services: serviceCalls() }).toEqual({ h: h.name, services: 0 });
    });

    it(`${h.name}: actor A naming subject B -> 403, and touches nothing`, async () => {
      mockResolve.mockResolvedValue(A); // every fixture above supplies userId: B
      const mod = await import(h.mod);
      const res = await h.call(mod);
      expect({ h: h.name, status: res.status }).toEqual({ h: h.name, status: 403 });
      expect({ h: h.name, sql: mockQuery.mock.calls.length }).toEqual({ h: h.name, sql: 0 });
      expect({ h: h.name, services: serviceCalls() }).toEqual({ h: h.name, services: 0 });
    });

    it(`${h.name}: actor B naming subject B -> authorization admits`, async () => {
      // The control is the authorization DECISION. A full 200 additionally depends
      // on service and schema behaviour that is out of this unit's scope, so the
      // assertion is that the request was neither refused 401 nor 403.
      mockResolve.mockResolvedValue(B);
      const mod = await import(h.mod);
      const res = await h.call(mod);
      expect({ h: h.name, refused: res.status === 401 || res.status === 403 }).toEqual({ h: h.name, refused: false });
    });
  }
});

// ===========================================================================
// ask PATCH — resource-owned
// ===========================================================================

describe('ask PATCH — resource-owned', () => {
  const patch = async (m: any) => m.PATCH(bodyReq('/api/elemental-alchemy/ask', { queryId: 'q1', wasHelpful: true, timeSpent: 5 }));

  it('unauthenticated -> 401, no SQL', async () => {
    mockResolve.mockResolvedValue(null);
    const mod = await import('@/app/api/elemental-alchemy/ask/route');
    const res = await patch(mod);
    expect(res.status).toBe(401);
    expect(mockQuery.mock.calls.length).toBe(0);
  });

  it("targeting another member's queryId -> 404, never 403 (403 would confirm it exists)", async () => {
    mockResolve.mockResolvedValue(A);
    mockQuery.mockResolvedValue({ rows: [] }); // ownership predicate matched nothing
    const mod = await import('@/app/api/elemental-alchemy/ask/route');
    const res = await patch(mod);
    expect(res.status).toBe(404);
    const sql = String(mockQuery.mock.calls[0]?.[0] ?? '');
    expect(sql).toMatch(/AND\s+user_id\s*=\s*\$4/);
    expect((mockQuery.mock.calls[0]?.[1] as unknown[])?.[3]).toBe(A); // scoped to the ACTOR
  });

  it('targeting own queryId -> succeeds', async () => {
    mockResolve.mockResolvedValue(A);
    mockQuery.mockResolvedValue({ rows: [{ id: 'q1' }] });
    const mod = await import('@/app/api/elemental-alchemy/ask/route');
    const res = await patch(mod);
    expect(res.status ?? 200).toBe(200);
  });
});

// ===========================================================================
// shadow PATCH — disabled, fail closed
// ===========================================================================

describe('shadow PATCH — disabled', () => {
  const patch = async (m: any) => m.PATCH(bodyReq('/api/elemental-alchemy/shadow', { patternId: 'p1', status: 'integrated', integrationNotes: 'x' }));

  it('unauthenticated -> 401 (learns nothing about the endpoint)', async () => {
    mockResolve.mockResolvedValue(null);
    const mod = await import('@/app/api/elemental-alchemy/shadow/route');
    expect((await patch(mod)).status).toBe(401);
  });

  it('authenticated -> 501, and ZERO mutation is reachable', async () => {
    mockResolve.mockResolvedValue(A);
    const mod = await import('@/app/api/elemental-alchemy/shadow/route');
    const res = await patch(mod);
    expect(res.status).toBe(501);
    expect(mockQuery.mock.calls.length).toBe(0);
    expect(serviceCalls()).toBe(0);
  });
});

// ===========================================================================
// Extra pre-SQL effect controls — the load-bearing ones
// ===========================================================================

describe('pre-SQL service/cache effects are unreachable unauthenticated', () => {
  const cases: Array<[string, string, (m: any) => Promise<any>]> = [
    ['journey POST', '@/app/api/elemental-alchemy/journey/route',
      (m) => m.POST(bodyReq('/api/elemental-alchemy/journey', { userId: B, update: { facet: 2 } }))],
    ['shadow POST', '@/app/api/elemental-alchemy/shadow/route',
      (m) => m.POST(bodyReq('/api/elemental-alchemy/shadow', { userId: B, shadowPatternId: 'p1', facet: 'f', shadowPattern: 'p', intensity: 3, noticeMethod: 'n', awareness: 'a' }))],
    ['shadow GET ?patternId', '@/app/api/elemental-alchemy/shadow/route',
      (m) => m.GET(getReq('/api/elemental-alchemy/shadow', `?userId=${B}&patternId=p1`))],
  ];

  for (const [name, mod, call] of cases) {
    it(`${name}: unauthenticated invokes NO service function`, async () => {
      // journey POST persists via journeyStateCache.set() with no SQL at all, so
      // "zero SQL" would be a false pass here. This asserts the service layer.
      mockResolve.mockResolvedValue(null);
      const m = await import(mod);
      const res = await call(m);
      expect({ name, status: res.status }).toEqual({ name, status: 401 });
      expect({ name, services: serviceCalls() }).toEqual({ name, services: 0 });
      expect({ name, sql: mockQuery.mock.calls.length }).toEqual({ name, sql: 0 });
    });
  }
});
