/**
 * DELETE /api/sovereign/manuscripts/[id] — the Work the card named (hermetic: no database).
 *
 * The PostgreSQL probes (tests/constitutional/ws-delete/dynamic) prove what the database does. This file runs in the ordinary jest
 * run and pins the HTTP contract the client depends on: which `workId` values are accepted, what is passed to the erase, and the
 * exact status and body of every outcome. The Work ids here are real UUIDs, the shape the route accepts.
 */
jest.mock('server-only', () => ({}), { virtual: true });
jest.mock('@/lib/cabin/request', () => ({ cabinStore: jest.fn(), cabinMemberFromRequest: jest.fn(), setCabinSessionCookie: jest.fn() }));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/manuscript/source/eraseManuscript', () => ({ eraseManuscript: jest.fn() }));

import { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { eraseManuscript } from '@/lib/manuscript/source/eraseManuscript';
import { DELETE } from '../route';

const member = getMemberIdFromRequest as jest.Mock;
const erase = eraseManuscript as jest.Mock;
const MEMBER = '11111111-1111-4111-8111-111111111111';
const MS = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const WORK = 'A0000000-0000-4000-8000-00000000000A';          // upper case on purpose: UUIDs are case-insensitive
const del = async (query = '') => {
  const res = await DELETE(new NextRequest(`http://localhost/api/sovereign/manuscripts/${MS}${query}`, { method: 'DELETE' }), { params: Promise.resolve({ id: MS }) });
  return { status: res.status, body: await res.json() };
};

beforeEach(() => {
  jest.clearAllMocks();
  member.mockResolvedValue(MEMBER);
  erase.mockResolvedValue({ ok: true, artifactsQueued: 0, sweptAll: true, recoverySealed: true });
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterEach(() => jest.restoreAllMocks());

describe('the workId the card names', () => {
  it('a Work card\'s request passes that Work to the erase, lower-cased', async () => {
    const out = await del(`?workId=${WORK}`);
    expect(out.status).toBe(200);
    expect(erase).toHaveBeenCalledWith(MS, MEMBER, { viaWorkId: WORK.toLowerCase() });
  });
  it('a request that names no Work (loose writing, History) passes none: the erase behaves as it always did', async () => {
    await del();
    expect(erase).toHaveBeenCalledWith(MS, MEMBER, {});
    expect(Object.keys(erase.mock.calls[0]![2])).toEqual([]);
  });
  it.each(['not-a-uuid', '', ' ', '../../etc', `${WORK}x`, 'a0000000-0000-4000-8000-00000000000'])('a malformed workId (%j) is refused 400 and the erase is NEVER called (ignoring it would turn a guarded delete into an unguarded one)', async (bad) => {
    const out = await del(`?workId=${encodeURIComponent(bad)}`);
    expect(out.status).toBe(400);
    expect(out.body).toEqual({ error: 'Bad request' });
    expect(erase).not.toHaveBeenCalled();
  });
  it('a repeated workId parameter uses the first, and a malformed first is still refused', async () => {
    await del(`?workId=${WORK}&workId=not-a-uuid`);
    expect(erase).toHaveBeenCalledWith(MS, MEMBER, { viaWorkId: WORK.toLowerCase() });
    erase.mockClear();
    expect((await del(`?workId=not-a-uuid&workId=${WORK}`)).status).toBe(400);
    expect(erase).not.toHaveBeenCalled();
  });
});

describe('every outcome, with the exact status and body the client reads', () => {
  it('shared writing: 409 with the refusal AND how many Works hold it', async () => {
    erase.mockResolvedValue({ ok: false, refusal: 'declared_in_other_works', works: 2 });
    expect(await del()).toEqual({ status: 409, body: { refusal: 'declared_in_other_works', works: 2 } });
  });
  it('a stale card: 409 with the refusal and NOTHING about other Works (it must not reveal them)', async () => {
    erase.mockResolvedValue({ ok: false, refusal: 'work_no_longer_holds_it' });
    const out = await del(`?workId=${WORK}`);
    expect(out).toEqual({ status: 409, body: { refusal: 'work_no_longer_holds_it' } });
    expect('works' in out.body).toBe(false);
  });
  it('not found (including a writing that is already gone): 404', async () => {
    erase.mockResolvedValue({ ok: false, refusal: 'not_found' });
    expect(await del(`?workId=${WORK}`)).toEqual({ status: 404, body: { error: 'Not found' } });
  });
  it('removed and everything confirmed: 200', async () => {
    expect(await del()).toEqual({ status: 200, body: { removed: true } });
  });
  it('removed but custody not confirmed: 500 with removed:true and the custody refusal, so the client re-reads and says so', async () => {
    erase.mockResolvedValue({ ok: true, artifactsQueued: 1, sweptAll: false, recoverySealed: false });
    expect(await del()).toEqual({ status: 500, body: { removed: true, refusal: 'custody_incomplete' } });
  });
  it('an exception: a BARE 500 that does not claim the Work was removed', async () => {
    erase.mockRejectedValue(new Error('boom'));
    const out = await del();
    expect(out).toEqual({ status: 500, body: { error: 'Failed to remove manuscript' } });
    expect('removed' in out.body).toBe(false);
  });
  it('no session: 401, and nothing is erased', async () => {
    member.mockResolvedValue(null);
    expect((await del(`?workId=${WORK}`)).status).toBe(401);
    expect(erase).not.toHaveBeenCalled();
  });
});
