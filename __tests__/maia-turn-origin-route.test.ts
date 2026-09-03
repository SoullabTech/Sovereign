/**
 * R1 serving-route witness — regression pins for the 2026-08-13 continuity incident.
 *
 * On 2026-08-13 two member-witnessed turns (173899 PWA, 173902 iOS) could not be
 * attributed to the route that served them. `maia_turns` carried no route column, and
 * `agent_runs.origin_route` — the only existing route witness — is populated from a
 * hardcoded fallback (`originRoute ?? '/api/sovereign/app/maia'` in maiaService), so
 * BOTH serving routes were recorded under one label. `meta.endpoint` is no better:
 * `/api/sovereign/app/maia/list` sets that field to its sibling's path in eight places.
 *
 * These tests pin the seam, not the symptom:
 *   1. the shared service seam carries distinct origin values without collapsing them
 *   2. an undeclared origin persists as NULL — never a default, because a default that
 *      looks like a measurement is exactly what cost us the attribution today
 *   3. each serving route declares its OWN literal at the HTTP boundary
 *
 * This is diagnostic wiring only. It changes no routing, no guard, no memory
 * composition, and no Sanctuary behavior (Sanctuary turns skip logMaiaTurn entirely
 * and therefore never reach this column).
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const mockQuery = jest.fn();

jest.mock('pg', () => ({
  // getPool() attaches an 'error' listener, so the stub must be event-emitter shaped.
  Pool: jest.fn().mockImplementation(() => ({
    query: mockQuery,
    on: jest.fn(),
    end: jest.fn(),
    connect: jest.fn(),
  })),
}));

const ROOT = join(__dirname, '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

const LIST_ROUTE = '/api/sovereign/app/maia/list';
const SIBLING_ROUTE = '/api/sovereign/app/maia';

/** Drive logTurn once and return the params of the UPDATE that carries origin_route. */
async function logTurnCapturingUpdate(originRoute?: string) {
  const { MaiaTrainingDataService } = await import('@/lib/learning/maiaTrainingDataService');

  mockQuery.mockReset();
  // 1st call: SELECT log_maia_conversation_turn(...) -> turn id
  mockQuery.mockResolvedValueOnce({ rows: [{ turn_id: 4242 }] });
  // 2nd call (if issued): the UPDATE carrying origin_route
  mockQuery.mockResolvedValueOnce({ rows: [] });

  await MaiaTrainingDataService.logTurn({
    sessionId: 'session-under-test',
    turnIndex: 0,
    userText: 'hello',
    maiaText: 'hello back',
    processingProfile: 'CORE',
    originRoute,
  });

  const updateCall = mockQuery.mock.calls.find(([sql]) =>
    typeof sql === 'string' && sql.includes('UPDATE maia_turns')
  );
  return { updateCall, allCalls: mockQuery.mock.calls };
}

describe('R1: origin_route survives the shared service seam', () => {
  beforeEach(() => {
    process.env.DATABASE_URL = 'postgresql://test@localhost:5432/test';
    jest.resetModules();
  });

  it('persists the /list route literal it was given', async () => {
    const { updateCall } = await logTurnCapturingUpdate(LIST_ROUTE);
    expect(updateCall).toBeDefined();
    expect(updateCall![0]).toContain('origin_route');
    expect(updateCall![1]).toContain(LIST_ROUTE);
  });

  it('persists the sibling route literal it was given', async () => {
    const { updateCall } = await logTurnCapturingUpdate(SIBLING_ROUTE);
    expect(updateCall).toBeDefined();
    expect(updateCall![1]).toContain(SIBLING_ROUTE);
  });

  it('does NOT collapse the two routes to a single value', async () => {
    const a = await logTurnCapturingUpdate(LIST_ROUTE);
    const b = await logTurnCapturingUpdate(SIBLING_ROUTE);
    const valueOf = (c: typeof a) => (c.updateCall![1] as unknown[]).find(
      (p) => typeof p === 'string' && p.startsWith('/api/')
    );
    expect(valueOf(a)).toBe(LIST_ROUTE);
    expect(valueOf(b)).toBe(SIBLING_ROUTE);
    expect(valueOf(a)).not.toBe(valueOf(b));
  });

  it('leaves origin_route NULL when the caller declares nothing — never a default', async () => {
    const { updateCall, allCalls } = await logTurnCapturingUpdate(undefined);
    // Either no UPDATE is issued at all, or it is issued with an explicit null —
    // what must never happen is a route path appearing that nobody declared.
    const params = (updateCall?.[1] ?? []) as unknown[];
    const invented = params.find((p) => typeof p === 'string' && p.startsWith('/api/'));
    expect(invented).toBeUndefined();
    const anyInvented = allCalls.some(([, ps]) =>
      Array.isArray(ps) && ps.some((p) => typeof p === 'string' && p.startsWith('/api/'))
    );
    expect(anyInvented).toBe(false);
  });
});

describe('R1: each serving route declares its own literal at the HTTP boundary', () => {
  it('/list declares the /list path to getMaiaResponse', () => {
    const src = read('app/api/sovereign/app/maia/list/route.ts');
    expect(src).toContain(`originRoute: '${LIST_ROUTE}'`);
  });

  it('the retired sibling route reaches no cognition and declares no originRoute', () => {
    // CMT-01 Step 3: the sibling is structurally retired. The invariant this
    // test guards — no route path appearing that nobody declared — is best
    // served by the sibling declaring nothing, because it calls nothing.
    const raw = read('app/api/sovereign/app/maia/route.ts');
    // Its header explains what was removed by naming it; strip comments so the
    // explanation is not mistaken for the thing it explains.
    const src = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    expect(src).not.toMatch(/getMaiaResponse\(/);
    expect(src).not.toContain(`originRoute: '${SIBLING_ROUTE}'`);
    expect(src).toMatch(/status: 410/);
  });

  it('maiaService forwards originRoute to logMaiaTurn with no fallback', () => {
    const src = read('lib/sovereign/maiaService.ts');
    // The turn-logging call must forward the bare identifier. A `??` default here
    // would reproduce the agent_runs defect, where an unattributed turn is
    // indistinguishable from one served by the sibling route.
    expect(src).toMatch(/originRoute,\s*\n\s*\}/);
    expect(src).not.toMatch(/originRoute:\s*originRoute\s*\?\?\s*'[^']*',\s*\n\s*\}\s*\n\s*\);/);
  });

  it('migration adds origin_route as nullable with no default', () => {
    const sql = read('database/migrations/20260813000001_maia_turns_origin_route.sql');
    expect(sql).toMatch(/ADD COLUMN IF NOT EXISTS origin_route text/);
    expect(sql).not.toMatch(/NOT NULL/);
    expect(sql).not.toMatch(/DEFAULT\s+'/);
  });
});
