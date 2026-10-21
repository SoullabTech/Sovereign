/**
 * stellium/sessions/[id] — auth + governance (urgent follow-up Patch 1).
 *
 * Closes the side door the coverage audit found: identity is taken from the
 * authenticated session only (body/query practitionerId ignored), the maiaPrep PUT is
 * persist-gated, and the GET withholds maia_prep when the client case forbids it.
 *
 * Proves: (1) spoofed practitionerId fails, (2) private refuses PUT, (3) consent_based
 * without consent refuses PUT, (4) private/withheld prep does not surface on GET,
 * (5) transparent/authorized path still works.
 */
jest.mock('@/lib/scribe/scribeAuth', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/stellium/sessions', () => ({
  getSession: jest.fn(),
  storeMaiaPrep: jest.fn(),
  updateSession: jest.fn(),
  cancelSession: jest.fn(),
  getSessionContext: jest.fn(),
  markFollowUpSent: jest.fn(),
  getClientJourney: jest.fn(),
}));

import { GET, PUT } from '../route';
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';
import { query } from '@/lib/db/postgres';
import { getSession, storeMaiaPrep } from '@/lib/stellium/sessions';

const mockAuth = getMemberIdFromRequest as jest.Mock;
const mockQuery = query as jest.Mock;
const mockGetSession = getSession as jest.Mock;
const mockStore = storeMaiaPrep as jest.Mock;

function posture(privacyMode: string, consentCapturedAt: Date | null) {
  mockQuery.mockResolvedValue({ rows: [{ privacy_mode: privacyMode, consent_captured_at: consentCapturedAt }], rowCount: 1 });
}
const params = { params: Promise.resolve({ id: 'sess-1' }) };
const putReq = (body: unknown) => ({ json: async () => body }) as never;
const getReq = () => ({ nextUrl: { searchParams: new URLSearchParams('') } }) as never;

beforeEach(() => {
  jest.clearAllMocks();
  delete process.env.CAPACITOR_BUILD;
  mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
});

describe('stellium/sessions/[id] — auth + governance', () => {
  it('1. spoofed practitionerId (no authenticated session) ⇒ 401, no persist', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await PUT(putReq({ practitionerId: 'spoofed-prac', maiaPrep: { summary: 'x' } }), params);
    expect(res.status).toBe(401);
    expect(mockStore).not.toHaveBeenCalled();
  });

  it('2. private case ⇒ PUT maiaPrep refused (403 REPRESENTATION_NOT_PERMITTED), no persist', async () => {
    mockAuth.mockResolvedValue('prac-1');
    posture('private', null);
    const res = await PUT(putReq({ maiaPrep: { summary: 'x' } }), params);
    expect(res.status).toBe(403);
    expect((await res.json()).code).toBe('REPRESENTATION_NOT_PERMITTED');
    expect(mockStore).not.toHaveBeenCalled();
  });

  it('3. consent_based without consent ⇒ PUT maiaPrep refused (403 CONSENT_REQUIRED), no persist', async () => {
    mockAuth.mockResolvedValue('prac-1');
    posture('consent_based', null);
    const res = await PUT(putReq({ maiaPrep: { summary: 'x' } }), params);
    expect(res.status).toBe(403);
    expect((await res.json()).code).toBe('CONSENT_REQUIRED');
    expect(mockStore).not.toHaveBeenCalled();
  });

  it('4. private case ⇒ GET withholds maia_prep (stripped; content not in payload)', async () => {
    mockAuth.mockResolvedValue('prac-1');
    mockGetSession.mockResolvedValue({ id: 'sess-1', client_id: 'c1', maia_prep: { secret: 'WITHHELD_SECRET' } });
    posture('private', null);
    const res = await GET(getReq(), params);
    const body = await res.json();
    expect(body.session.maia_prep).toBeNull();
    expect(JSON.stringify(body)).not.toContain('WITHHELD_SECRET');
  });

  it('5. transparent ⇒ PUT persists, GET surfaces maia_prep', async () => {
    mockAuth.mockResolvedValue('prac-1');
    posture('transparent', null);
    mockGetSession.mockResolvedValue({ id: 'sess-1', client_id: 'c1', maia_prep: { summary: 'PREP_OK' } });

    const putRes = await PUT(putReq({ maiaPrep: { summary: 'PREP_OK' } }), params);
    expect(putRes.status).toBe(200);
    expect(mockStore).toHaveBeenCalledWith('prac-1', 'sess-1', { summary: 'PREP_OK' });

    const getRes = await GET(getReq(), params);
    expect((await getRes.json()).session.maia_prep).toEqual({ summary: 'PREP_OK' });
  });
});
