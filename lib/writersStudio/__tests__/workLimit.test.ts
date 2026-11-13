/**
 * Free new-Work limit (founder rulings 2026-11-02 "ONE-WORK FREE", 2026-11-13 "Free limits NEW Works only").
 * Exercises the decision, the in-transaction check, the Pro lookup, and BOTH real create routes.
 */
jest.mock('server-only', () => ({}), { virtual: true });
jest.mock('@/lib/cabin/request', () => ({ cabinStore: () => null, cabinMemberFromRequest: () => null, setCabinSessionCookie: jest.fn() }));
const query = jest.fn();
const txQuery = jest.fn();
jest.mock('@/lib/db/postgres', () => ({
  query: (...a: unknown[]) => query(...a),
  transaction: async (cb: (tx: { query: typeof txQuery }) => unknown) => cb({ query: txQuery }),
}));
const plan = jest.fn();
jest.mock('@/lib/writersStudio/planAccessServer', () => ({ writerStudioPlanForMember: (...a: unknown[]) => plan(...a) }));
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: async () => 'm1' }));

import { NextRequest } from 'next/server';
import { decideNewWork, freeWorkLimitEnabled, isWriterProForWorks, mayStartWorkInTx } from '../workLimit';
import { FREE_WORK_LIMIT_CODE, FreeWorkLimitError, freeWorkLimitFrom, workLimitMessageOr } from '../workLimitShared';
import { POST as createLivingWork } from '@/app/api/sovereign/living-works/route';
import { POST as saveManuscript } from '@/app/api/sovereign/manuscripts/route';

const saved = process.env.WS_FREE_WORK_LIMIT_ENABLED;
const free = { plan: 'free' } as const;
const pro = { plan: 'pro' } as const;
/** txQuery answering: lock → ok, count → n Works held, insert → a new Work row. */
function held(n: number) {
  txQuery.mockImplementation(async (sql: string) => {
    if (String(sql).includes('count(*)')) return { rows: [{ n }] };
    if (String(sql).includes('INSERT INTO living_works')) return { rows: [{ id: 'w-new', title: null }] };
    return { rows: [] };
  });
}
const inserts = (table: string) => txQuery.mock.calls.filter(([sql]) => String(sql).includes(`INSERT INTO ${table}`)).length
  + query.mock.calls.filter(([sql]) => String(sql).includes(`INSERT INTO ${table}`)).length;
const post = (url: string, body: unknown) =>
  new NextRequest(`https://soullab.life${url}`, { method: 'POST', body: JSON.stringify(body) });

beforeEach(() => {
  query.mockReset(); txQuery.mockReset(); plan.mockReset();
  delete process.env.WS_FREE_WORK_LIMIT_ENABLED;
  query.mockResolvedValue({ rows: [{ id: 'w-new', title: null, tier: 'free' }] });
});
afterAll(() => { if (saved === undefined) delete process.env.WS_FREE_WORK_LIMIT_ENABLED; else process.env.WS_FREE_WORK_LIMIT_ENABLED = saved; });

describe('decision', () => {
  it('switch opens only on exactly "true"', () => {
    expect(freeWorkLimitEnabled({ WS_FREE_WORK_LIMIT_ENABLED: 'true' })).toBe(true);
    for (const v of [undefined, '', '1', 'TRUE', 'on']) expect(freeWorkLimitEnabled({ WS_FREE_WORK_LIMIT_ENABLED: v })).toBe(false);
  });
  it('Free may start a first Work, not a second; Pro and switch-off are never limited', () => {
    expect(decideNewWork({ limitOn: true, isPro: false, worksHeld: 0 })).toEqual({ allowed: true });
    expect(decideNewWork({ limitOn: true, isPro: false, worksHeld: 1 })).toEqual({ allowed: false, code: FREE_WORK_LIMIT_CODE });
    expect(decideNewWork({ limitOn: true, isPro: true, worksHeld: 7 })).toEqual({ allowed: true });
    expect(decideNewWork({ limitOn: false, isPro: false, worksHeld: 7 })).toEqual({ allowed: true });
  });
});

describe('Pro for Works', () => {
  it('pilot/grant/founder plan is Pro; Soullab Pro tier is Pro; otherwise Free', async () => {
    plan.mockResolvedValue(pro);
    expect(await isWriterProForWorks('m1')).toBe(true);
    plan.mockResolvedValue(free); query.mockResolvedValue({ rows: [{ tier: 'pro' }] });
    expect(await isWriterProForWorks('m1')).toBe(true);
    query.mockResolvedValue({ rows: [{ tier: 'free' }] });
    expect(await isWriterProForWorks('m1')).toBe(false);
  });
  it('a lookup failure throws (never read as Free or Pro)', async () => {
    plan.mockRejectedValue(new Error('db down'));
    await expect(isWriterProForWorks('m1')).rejects.toThrow('db down');
  });
});

describe('in-transaction check', () => {
  it('takes the per-member lock before counting', async () => {
    held(0);
    await mayStartWorkInTx({ query: txQuery }, 'm1', false);
    expect(String(txQuery.mock.calls[0][0])).toContain('pg_advisory_xact_lock');
    expect(txQuery.mock.calls[0][1]).toEqual(['living-work-create:m1']);
  });
});

describe('POST /api/sovereign/living-works', () => {
  it('⭐ switch off: exactly as before — one insert, no plan read, no transaction', async () => {
    const res = await createLivingWork(post('/api/sovereign/living-works', {}));
    expect(res.status).toBe(201);
    expect(plan).not.toHaveBeenCalled();
    expect(txQuery).not.toHaveBeenCalled();
    expect(query).toHaveBeenCalledTimes(1);
  });

  describe('switch on', () => {
    beforeEach(() => { process.env.WS_FREE_WORK_LIMIT_ENABLED = 'true'; });
    it('a Free writer with no Work starts one', async () => {
      plan.mockResolvedValue(free); query.mockResolvedValue({ rows: [{ tier: 'free' }] }); held(0);
      expect((await createLivingWork(post('/api/sovereign/living-works', {}))).status).toBe(201);
      expect(inserts('living_works')).toBe(1);
    });
    it('⭐ a Free writer who holds a Work is refused a second, plainly, and nothing is written', async () => {
      plan.mockResolvedValue(free); query.mockResolvedValue({ rows: [{ tier: 'free' }] }); held(1);
      const res = await createLivingWork(post('/api/sovereign/living-works', { title: 'Second' }));
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.code).toBe(FREE_WORK_LIMIT_CODE);
      expect(body.error).toMatch(/every Work you already have is still yours/);
      expect(inserts('living_works')).toBe(0);
    });
    it('⭐ an expired beta tester holding 3 Works is refused only a 4th — the route never reads, hides or changes the 3', async () => {
      plan.mockResolvedValue(free); query.mockResolvedValue({ rows: [{ tier: 'free' }] }); held(3);
      expect((await createLivingWork(post('/api/sovereign/living-works', {}))).status).toBe(403);
      const touched = [...txQuery.mock.calls, ...query.mock.calls].map(([sql]) => String(sql));
      expect(touched.some((sql) => /UPDATE living_works|DELETE FROM living_works/.test(sql))).toBe(false);
    });
    it('a Pro writer is never limited (and the Work count is not even read)', async () => {
      plan.mockResolvedValue(pro); held(9);
      expect((await createLivingWork(post('/api/sovereign/living-works', {}))).status).toBe(201);
      expect(txQuery.mock.calls.some(([sql]) => String(sql).includes('count(*)'))).toBe(false);
    });
    it('a plan lookup failure answers 503 and writes nothing', async () => {
      plan.mockRejectedValue(new Error('db down'));
      expect((await createLivingWork(post('/api/sovereign/living-works', {}))).status).toBe(503);
      expect(inserts('living_works')).toBe(0);
    });
  });
});

describe('POST /api/sovereign/manuscripts (save that declares a new Work)', () => {
  const save = { title: 'A Book', sections: [{ position: 0, heading: 'One', body: 'Text.' }], createWork: true };
  beforeEach(() => { process.env.WS_FREE_WORK_LIMIT_ENABLED = 'true'; });
  it('⭐ a Free writer who holds a Work is refused BEFORE anything is written (no manuscript, no sections, no Work)', async () => {
    plan.mockResolvedValue(free); query.mockResolvedValue({ rows: [{ tier: 'free' }] }); held(1);
    const res = await saveManuscript(post('/api/sovereign/manuscripts', save));
    expect(res.status).toBe(403);
    expect((await res.json()).code).toBe(FREE_WORK_LIMIT_CODE);
    expect(inserts('member_manuscripts')).toBe(0);
    expect(inserts('manuscript_sections')).toBe(0);
    expect(inserts('living_works')).toBe(0);
  });
  it('a save that does not declare a new Work is never limited', async () => {
    plan.mockResolvedValue(free); held(5);
    await saveManuscript(post('/api/sovereign/manuscripts', { ...save, createWork: false }));
    expect(plan).not.toHaveBeenCalled();
    expect(txQuery.mock.calls.some(([sql]) => String(sql).includes('count(*)'))).toBe(false);
  });
});

describe('browser helpers', () => {
  it('recognise the Free-limit refusal and only that', async () => {
    const limit = new Response(JSON.stringify({ code: FREE_WORK_LIMIT_CODE }), { status: 403 });
    expect(await freeWorkLimitFrom(limit)).toBeInstanceOf(FreeWorkLimitError);
    expect(await freeWorkLimitFrom(new Response(JSON.stringify({ code: 'other' }), { status: 403 }))).toBeNull();
    expect(await freeWorkLimitFrom(new Response('{}', { status: 500 }))).toBeNull();
    expect(workLimitMessageOr(new FreeWorkLimitError(), 'fallback')).toMatch(/Writer’s Studio Pro/);
    expect(workLimitMessageOr(new Error('x'), 'fallback')).toBe('fallback');
  });
});
