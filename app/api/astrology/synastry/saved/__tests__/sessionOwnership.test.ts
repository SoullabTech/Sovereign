import { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { listSavedSynastryAnalyses } from '@/lib/astrology/synastry/synastryStore';
import { GET } from '../route';

jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(),
}));
jest.mock('@/lib/astrology/synastry/synastryStore', () => ({
  listSavedSynastryAnalyses: jest.fn(),
}));

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const identity = jest.mocked(getMemberIdFromRequest);
const list = jest.mocked(listSavedSynastryAnalyses);
const request = (search = '') => new NextRequest('https://soullab.life/api/astrology/synastry/saved' + search);

describe('Saved synastry — server-owned identity', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    delete process.env.CAPACITOR_BUILD;
  });

  it('denies unauthenticated requests before any database access', async () => {
    identity.mockResolvedValue(null);
    const res = await GET(request('?memberId=' + A));
    expect(res.status).toBe(401);
    expect(list).not.toHaveBeenCalled();
  });

  it('rejects a client-supplied foreign member ID', async () => {
    identity.mockResolvedValue(A);
    const res = await GET(request('?memberId=' + B));
    expect(res.status).toBe(403);
    expect(list).not.toHaveBeenCalled();
  });

  it('lists only the authenticated member when no browser ID is supplied', async () => {
    identity.mockResolvedValue(A);
    list.mockResolvedValue([]);
    const res = await GET(request('?limit=3'));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true, items: [] });
    expect(list).toHaveBeenCalledWith(A, { limit: 3, offset: 0 });
  });

  it('bounds user-supplied page size and offset', async () => {
    identity.mockResolvedValue(A);
    list.mockResolvedValue([]);
    const res = await GET(request('?limit=1000000&offset=-100'));
    expect(res.status).toBe(200);
    expect(list).toHaveBeenCalledWith(A, { limit: 50, offset: 0 });
  });

  it('does not expose internal database exception messages', async () => {
    identity.mockResolvedValue(A);
    list.mockRejectedValue(new Error('private-database-detail'));
    const res = await GET(request());
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain('private-database-detail');
  });
});
