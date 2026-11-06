/**
 * GET /api/sovereign/studio/history in the offline cabin: the cabin keeps no record of acts, so the honest answer is an empty list,
 * not a 401. A 401 would make every re-read that includes History (Home's, after a deletion) report that it could not read, and
 * would make a signed-in cabin member look signed out.
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
const get = () => GET(new NextRequest('http://localhost/api/sovereign/studio/history'));
const original = process.env.MAIA_CABIN_MODE;

beforeEach(() => {
  jest.clearAllMocks();
  (cabinStore as jest.Mock).mockReturnValue({ close });
  (cabinMemberFromRequest as jest.Mock).mockReturnValue({ member: { id: 'cabin-member' }, issuedToken: 'issued' });
});
afterEach(() => { if (original === undefined) delete process.env.MAIA_CABIN_MODE; else process.env.MAIA_CABIN_MODE = original; });

describe('history in the offline cabin', () => {
  it('answers an empty list (200), sets the cabin session, closes the store, and never touches the database or the web credential', async () => {
    process.env.MAIA_CABIN_MODE = 'offline';
    const res = await get();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ acts: [] });
    expect(setCabinSessionCookie).toHaveBeenCalledWith(expect.anything(), 'issued');
    expect(close).toHaveBeenCalledTimes(1);
    expect(query).not.toHaveBeenCalled();
    expect(getMemberIdFromRequest).not.toHaveBeenCalled();
  });

  it('outside the cabin it is the web route as before: no credential, 401, and the cabin store is never opened', async () => {
    delete process.env.MAIA_CABIN_MODE;
    (getMemberIdFromRequest as jest.Mock).mockResolvedValue(null);
    const res = await get();
    expect(res.status).toBe(401);
    expect(cabinStore).not.toHaveBeenCalled();
  });
});
