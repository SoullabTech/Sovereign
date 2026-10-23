import { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getSynastryAnalysisById, setSynastryAnalysisSaved } from '@/lib/astrology/synastry/synastryStore';
import { GET, POST } from '../list/route';
import { POST as SAVE } from '../save/route';
import { checkAccess, matchRule } from '@/config/accessMatrix';

jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/astrology/synastry/synastryStore', () => ({
  createSynastryAnalysis: jest.fn(),
  getSynastryAnalysisById: jest.fn(),
  setSynastryAnalysisSaved: jest.fn(),
}));

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const ID = '33333333-3333-4333-8333-333333333333';
const auth = jest.mocked(getMemberIdFromRequest);
const getAnalysis = jest.mocked(getSynastryAnalysisById);
const saveAnalysis = jest.mocked(setSynastryAnalysisSaved);
const url = 'https://soullab.life/api/astrology/synastry/';
function req(path: string, data?: object, headers?: Record<string, string>) {
  return new NextRequest(url + path, {
    method: data ? 'POST' : 'GET',
    headers: data ? { 'content-type': 'application/json', ...headers } : headers,
    body: data ? JSON.stringify(data) : undefined,
  });
}

describe('Synastry privacy — real handlers', () => {
  beforeEach(() => { jest.resetAllMocks(); delete process.env.CAPACITOR_BUILD; });

  it('denies anonymous analysis fetch without touching storage', async () => {
    auth.mockResolvedValue(null);
    const res = await GET(req('list?analysisId=' + ID));
    expect(res.status).toBe(401);
    expect(getAnalysis).not.toHaveBeenCalled();
  });

  it('returns a non-enumerating 404 for a foreign owner', async () => {
    auth.mockResolvedValue(A);
    getAnalysis.mockResolvedValue({
      id: ID, requested_by_member_id: B, result: { success: true, secret: 'private' },
      created_at: '', updated_at: '', saved_at: null, a_member_id: null,
      b_member_id: null, a_birth: null, b_birth: null,
    });
    const res = await GET(req('list?analysisId=' + ID));
    expect(res.status).toBe(404);
    expect(JSON.stringify(await res.json())).not.toContain('private');
  });

  it('lets the owner retrieve only their own analysis', async () => {
    auth.mockResolvedValue(A);
    getAnalysis.mockResolvedValue({
      id: ID, requested_by_member_id: A, result: { success: true, synastry: { aspects: [] } },
      created_at: '', updated_at: '', saved_at: null, a_member_id: null,
      b_member_id: null, a_birth: null, b_birth: null,
    });
    const res = await GET(req('list?analysisId=' + ID));
    expect(res.status).toBe(200);
    expect((await res.json()).analysisId).toBe(ID);
  });

  it('rejects foreign stored member birth data before querying it', async () => {
    auth.mockResolvedValue(A);
    const res = await POST(req('list', { a: { memberId: B }, b: { birth: { date: '1990-01-01' } } }));
    expect(res.status).toBe(403);
  });

  it('rejects a foreign persistence-owner assertion', async () => {
    auth.mockResolvedValue(A);
    const res = await POST(req('list', { requestedByMemberId: B, a: {}, b: {}, persist: true }));
    expect(res.status).toBe(403);
  });

  it('rejects cross-origin relationship writes', async () => {
    auth.mockResolvedValue(A);
    const res = await POST(req('list', { a: {}, b: {} }, { origin: 'https://evil.example' }));
    expect(res.status).toBe(403);
  });

  it('rejects anonymous Save even when a memberId is provided', async () => {
    auth.mockResolvedValue(null);
    const res = await SAVE(req('save', { analysisId: ID, memberId: A }));
    expect(res.status).toBe(401);
    expect(saveAnalysis).not.toHaveBeenCalled();
  });

  it('rejects forged Save identity', async () => {
    auth.mockResolvedValue(A);
    const res = await SAVE(req('save', { analysisId: ID, memberId: B }));
    expect(res.status).toBe(403);
    expect(saveAnalysis).not.toHaveBeenCalled();
  });

  it('Save binds the verified session without needing a browser member ID', async () => {
    auth.mockResolvedValue(A);
    saveAnalysis.mockResolvedValue({ id: ID, saved_at: '2026-10-23T00:00:00Z' });
    const res = await SAVE(req('save', { analysisId: ID, saved: true }));
    expect(res.status).toBe(200);
    expect(saveAnalysis).toHaveBeenCalledWith(ID, A, true);
  });

  it('rejects cross-origin Save mutation', async () => {
    auth.mockResolvedValue(A);
    const res = await SAVE(req('save', { analysisId: ID }, { origin: 'https://evil.example' }));
    expect(res.status).toBe(403);
    expect(saveAnalysis).not.toHaveBeenCalled();
  });
});

describe('Astrology extended access registry', () => {
  const paths = [
    '/api/astrology/synastry/list',
    '/api/astrology/synastry/save',
    '/api/astrology/spiralogic-report',
    '/api/astrology/vedic/list',
    '/api/astrology/vedic/gochara',
    '/api/astrology/vedic/ashtakavarga',
    '/api/astrology/vedic/dasha',
    '/api/astrology/da-yun',
    '/api/astrology/chinese/discuss',
  ];
  const prior = process.env.ACCESS_CONTROL_MODE;
  beforeAll(() => { process.env.ACCESS_CONTROL_MODE = 'strict'; });
  afterAll(() => {
    if (prior === undefined) delete process.env.ACCESS_CONTROL_MODE;
    else process.env.ACCESS_CONTROL_MODE = prior;
  });
  it.each(paths)('admits only signed-in Free/Personal/Pro users at %s', (path) => {
    expect(matchRule(path)).toMatchObject({ exact: path, minTier: 'free' });
    expect(checkAccess(path, 'free', [], false).allowed).toBe(false);
    for (const tier of ['free','personal','pro'] as const) {
      expect(checkAccess(path, tier, ['member'], true).allowed).toBe(true);
    }
  });
  it('does not expand authorization to adjacent astrology APIs', () => {
    expect(checkAccess('/api/astrology/private-member-profile', 'pro', ['admin'], true))
      .toMatchObject({ allowed: false, reason: 'no-rule-match' });
  });
});
