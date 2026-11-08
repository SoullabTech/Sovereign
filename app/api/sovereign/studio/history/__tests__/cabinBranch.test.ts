/**
 * GET /api/sovereign/studio/history in the offline cabin. The cabin has no source custody, revisions or keeps, so only the acts its own
 * tables can establish are listed (a Work begun, something declared in a Work), in the web route's shape, newest first. A 401 would
 * make a signed-in cabin member look signed out and would make every re-read that includes History report that it could not read.
 */
jest.mock('server-only', () => ({}), { virtual: true });
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/cabin/request', () => ({
  cabinStore: jest.fn(),
  cabinMemberFromRequest: jest.fn(),
  setCabinSessionCookie: jest.fn(),
}));

import { NextRequest } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { cabinStore, cabinMemberFromRequest, setCabinSessionCookie } from '@/lib/cabin/request';
import { GET } from '../route';

const close = jest.fn();
const listWorks = jest.fn();
const listManuscripts = jest.fn();
const get = (query = '') => GET(new NextRequest(`http://localhost/api/sovereign/studio/history${query}`));
const original = process.env.MAIA_CABIN_MODE;
const ME = 'cabin-member';

const work = (id: string, title: string | null, createdAt: string, expressions: Array<{ id: string; type: string; expressionId: string; at: string; by?: string }> = []) => ({
  id, memberId: ME, title, purpose: null, form: null, stage: null, manuscriptState: null, createdAt, updatedAt: createdAt,
  expressions: expressions.map((e) => ({ id: e.id, livingWorkId: id, expressionType: e.type, expressionId: e.expressionId, declaredBy: e.by ?? ME, declaredAt: e.at })),
});

beforeEach(() => {
  jest.clearAllMocks();
  listWorks.mockReturnValue([]);
  listManuscripts.mockReturnValue([]);
  (cabinStore as jest.Mock).mockReturnValue({ close, listWorks, listManuscripts });
  (cabinMemberFromRequest as jest.Mock).mockReturnValue({ member: { id: ME }, issuedToken: 'issued' });
});
afterEach(() => { if (original === undefined) delete process.env.MAIA_CABIN_MODE; else process.env.MAIA_CABIN_MODE = original; });

describe('history in the offline cabin', () => {
  beforeEach(() => { process.env.MAIA_CABIN_MODE = 'offline'; });

  it('a cabin member with nothing begun gets an empty list (200): sets the cabin session, closes the store, never touches the database or the web credential', async () => {
    const res = await get();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ acts: [] });
    expect(setCabinSessionCookie).toHaveBeenCalledWith(expect.anything(), 'issued');
    expect(close).toHaveBeenCalledTimes(1);
    expect(query).not.toHaveBeenCalled();
    expect(getMemberIdFromRequest).not.toHaveBeenCalled();
  });

  it('lists a Work begun and a writing declared in it, in the web route\'s shape, newest first (the page would otherwise say "Nothing has been recorded yet" to a member who has Works)', async () => {
    listWorks.mockReturnValue([work('w1', 'My Book', '2026-10-01T10:00:00.000Z', [{ id: 'e1', type: 'manuscript', expressionId: 'm1', at: '2026-10-02T10:00:00.000Z' }])]);
    listManuscripts.mockReturnValue([{ id: 'm1', title: 'Chapter Draft' }]);
    const res = await get();
    expect((await res.json()).acts).toEqual([
      { id: 'e1', kind: 'expression_declared', at: '2026-10-02T10:00:00.000Z', workTitle: 'My Book', manuscriptTitle: 'Chapter Draft', manuscriptId: 'm1', detail: 'manuscript', note: null },
      { id: 'w1', kind: 'work_begun', at: '2026-10-01T10:00:00.000Z', workTitle: 'My Book', manuscriptTitle: null, manuscriptId: null, detail: null, note: null },
    ]);
  });

  it('only what this member declared: an expression declared by someone else is not this member\'s act', async () => {
    listWorks.mockReturnValue([work('w1', 'W', '2026-10-01T10:00:00.000Z', [{ id: 'e1', type: 'manuscript', expressionId: 'm1', at: '2026-10-02T10:00:00.000Z', by: 'someone-else' }])]);
    expect((await (await get()).json()).acts.map((a: { kind: string }) => a.kind)).toEqual(['work_begun']);
  });

  it('a declared thing that is not a writing carries no manuscript title', async () => {
    listWorks.mockReturnValue([work('w1', 'W', '2026-10-01T10:00:00.000Z', [{ id: 'e2', type: 'material', expressionId: 'x1', at: '2026-10-02T10:00:00.000Z' }])]);
    const acts = (await (await get()).json()).acts;
    expect(acts[0]).toMatchObject({ kind: 'expression_declared', manuscriptTitle: null, detail: 'material' });
  });

  it('honours the limit (and the route\'s ceiling) like the web route', async () => {
    listWorks.mockReturnValue([1, 2, 3, 4].map((n) => work(`w${n}`, `W${n}`, `2026-10-0${n}T10:00:00.000Z`)));
    const two = (await (await get('?limit=2')).json()).acts;
    expect(two.map((a: { id: string }) => a.id)).toEqual(['w4', 'w3']);
    const huge = (await (await get('?limit=100000')).json()).acts;
    expect(huge).toHaveLength(4);
  });
});

describe('outside the cabin', () => {
  it('it is the web route as before: no credential, 401, and the cabin store is never opened', async () => {
    delete process.env.MAIA_CABIN_MODE;
    (getMemberIdFromRequest as jest.Mock).mockResolvedValue(null);
    const res = await get();
    expect(res.status).toBe(401);
    expect(cabinStore).not.toHaveBeenCalled();
  });
});
