/**
 * BUILD-07D — the readings boundary, falsified without a database or a model.
 *
 * Auth, isolation (no existence leak), the one-lens body, and the promise that
 * a refusal at any stage returns the stage and stores nothing. The commission
 * itself is 07C's and is mocked here; its own gates prove it.
 */

import { NextRequest } from 'next/server';

jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn(), transaction: jest.fn() }));
jest.mock('@/lib/manuscript/developmentalReading/commission', () => ({ commissionReading: jest.fn() }));
jest.mock('@/lib/manuscript/developmentalReading/store', () => ({ listReadings: jest.fn(), loadReading: jest.fn() }));
jest.mock('@/lib/manuscript/development/capture', () => ({ loadLiveWork: jest.fn() }));

import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { commissionReading } from '@/lib/manuscript/developmentalReading/commission';
import { listReadings, loadReading } from '@/lib/manuscript/developmentalReading/store';
import { loadLiveWork } from '@/lib/manuscript/development/capture';
import { GET as LIST, POST } from '../route';
import { GET as ONE } from '../[readingId]/route';

const mockAuth = getMemberIdFromRequest as jest.Mock;
const mockQuery = query as jest.Mock;
const mockCommission = commissionReading as jest.Mock;
const mockList = listReadings as jest.Mock;
const mockLoad = loadReading as jest.Mock;
const mockLive = loadLiveWork as jest.Mock;

const MEMBER = '11111111-1111-1111-1111-111111111111';
const MS = '22222222-2222-2222-2222-222222222222';
const READING = '33333333-3333-3333-3333-333333333333';
const ctx = { params: Promise.resolve({ id: MS }) };
const ctxOne = (readingId: string) => ({ params: Promise.resolve({ id: MS, readingId }) });

const post = (body: unknown) => new NextRequest(`http://localhost/api/sovereign/manuscripts/${MS}/readings`, {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: typeof body === 'string' ? body : JSON.stringify(body),
});
const get = (path = '') => new NextRequest(`http://localhost/api/sovereign/manuscripts/${MS}/readings${path}`, { method: 'GET' });

/** The route's SQL, answered by shape: ownership, addressable section ids, structure count, current sections. */
function answerSql(opts: { owns: boolean; sections: string[]; units: number }) {
  mockQuery.mockImplementation(async (sql: string) => {
    if (/FROM member_manuscripts WHERE id/.test(sql)) return { rows: opts.owns ? [{ id: MS }] : [] };
    if (/section_addressable_at IS NOT NULL/.test(sql)) return { rows: opts.owns ? opts.sections.map((id) => ({ id })) : [] };
    if (/manuscript_structure_units/.test(sql)) return { rows: [{ n: String(opts.owns ? opts.units : 0) }] };
    if (/LEFT JOIN manuscript_sections/.test(sql)) return { rows: opts.owns ? opts.sections.map((id, position) => ({ id, position, heading: null })) : [] };
    throw new Error(`unexpected SQL: ${sql}`);
  });
}

beforeEach(() => { jest.clearAllMocks(); });

describe('GET /readings — the ledger', () => {
  it('401 without a verified member; nothing is read', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await LIST(get(), ctx);
    expect(res.status).toBe(401);
    expect(mockList).not.toHaveBeenCalled();
  });

  it('404 for a Work that is not the caller\'s — indistinguishable from absent', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    answerSql({ owns: false, sections: [], units: 0 });
    const res = await LIST(get(), ctx);
    expect(res.status).toBe(404);
    expect(mockList).not.toHaveBeenCalled();
  });

  it('summaries only, scoped by the member', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    answerSql({ owns: true, sections: ['a'], units: 0 });
    mockList.mockResolvedValue([{ id: READING, outcome: 'reading', commissionedLens: 'voice', frozenAt: 't', observationCount: 2 }]);
    const res = await LIST(get(), ctx);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ readings: [{ id: READING, outcome: 'reading', commissionedLens: 'voice', frozenAt: 't', observationCount: 2 }] });
    expect(mockList).toHaveBeenCalledWith(MS, MEMBER);
  });
});

describe('POST /readings — one member gesture, one lens', () => {
  it('401 without a verified member; no commission', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(post({ lens: 'voice' }), ctx);
    expect(res.status).toBe(401);
    expect(mockCommission).not.toHaveBeenCalled();
  });

  it('400 for a malformed body, a foreign lens, or any field beyond the lens — the client may not name scope, sections or text', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    expect((await POST(post('{not json'), ctx)).status).toBe(400);
    expect((await POST(post({ lens: 'irony' }), ctx)).status).toBe(400);
    expect((await POST(post({}), ctx)).status).toBe(400);
    for (const extra of [{ bodyScope: ['a'] }, { sections: [] }, { text: 'x' }, { observation: 'x' }, { withStructure: false }]) {
      const res = await POST(post({ lens: 'voice', ...extra }), ctx);
      expect(res.status).toBe(400);
      expect((await res.json()).refusal).toBe('foreign_field');
    }
    expect(mockCommission).not.toHaveBeenCalled();
  });

  it('404 not_readable when the Work is not the caller\'s or has no addressable draft; no commission', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    answerSql({ owns: false, sections: [], units: 0 });
    const res = await POST(post({ lens: 'voice' }), ctx);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ refusal: 'not_readable', stage: 'capture' });
    expect(mockCommission).not.toHaveBeenCalled();
  });

  it('the server derives the scope: every addressable section at body depth, structure iff any authored unit exists', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    answerSql({ owns: true, sections: ['a', 'b', 'c'], units: 2 });
    mockCommission.mockResolvedValue({ outcome: 'frozen', reading: { id: READING, outcome: 'reading', observations: [{}, {}], provenance: { frozenAt: 't' } } });
    const res = await POST(post({ lens: 'continuity' }), ctx);
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ readingId: READING, outcome: 'reading', observationCount: 2, frozenAt: 't' });
    expect(mockCommission).toHaveBeenCalledWith({ manuscriptId: MS, memberId: MEMBER, lens: 'continuity', bodyScope: ['a', 'b', 'c'], withStructure: true });

    answerSql({ owns: true, sections: ['a'], units: 0 });
    await POST(post({ lens: 'voice' }), ctx);
    expect(mockCommission).toHaveBeenLastCalledWith(expect.objectContaining({ withStructure: false, bodyScope: ['a'] }));
  });

  it('a refusal at any stage comes back typed with its stage and a status by stage; the response never carries a reading', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    answerSql({ owns: true, sections: ['a'], units: 0 });
    const cases: [string, string, number][] = [
      ['capture', 'not_found', 404], ['capture', 'not_addressable', 409], ['recover', 'revision_content_required', 409],
      ['read', 'ceiling_exceeded', 422], ['read', 'claim_unbindable', 422], ['read', 'structured_inference_unavailable', 503],
      ['classify', 'classifier_unclassifiable', 422], ['classify', 'structured_inference_unavailable', 503],
      ['freeze', 'claim_unbindable', 422], ['store', 'prose_in_state', 500],
    ];
    for (const [stage, refusal, status] of cases) {
      mockCommission.mockResolvedValueOnce({ outcome: 'refused', stage, refusal, detail: 'd' });
      const res = await POST(post({ lens: 'arc' }), ctx);
      expect(`${stage}/${refusal} → ${res.status}`).toBe(`${stage}/${refusal} → ${status}`);
      expect(await res.json()).toEqual({ refusal, stage, detail: 'd' });
    }
  });
});

describe('GET /readings/[readingId] — one frozen reading, by identity', () => {
  const frozen = { id: READING, manuscriptId: MS, outcome: 'none', observations: [], scope: { commissionedLens: 'voice', bodyScope: ['a'], withStructure: false },
    readState: { draftId: 'd', revisionNumber: 1, revisionDigest: 'x', sectionTopology: ['a'], sections: { a: { revisionNumber: 1, range: { start: 0, end: 1 }, digest: 'y' } }, inputFingerprint: 'f' },
    coverage: { sections: { a: 'body' } }, provenance: { reader: {}, classifier: null, frozenAt: 't' } };

  it('401 without a verified member', async () => {
    mockAuth.mockResolvedValue(null);
    expect((await ONE(get(`/${READING}`), ctxOne(READING))).status).toBe(401);
    expect(mockLoad).not.toHaveBeenCalled();
  });

  it('404 for a non-uuid, an absent reading, another member\'s reading, or a reading of a different Work', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    expect((await ONE(get('/nope'), ctxOne('nope'))).status).toBe(404);
    expect(mockLoad).not.toHaveBeenCalled();
    mockLoad.mockResolvedValueOnce(null);
    expect((await ONE(get(`/${READING}`), ctxOne(READING))).status).toBe(404);
    expect(mockLoad).toHaveBeenCalledWith(READING, MEMBER);
    mockLoad.mockResolvedValueOnce({ ...frozen, manuscriptId: '44444444-4444-4444-4444-444444444444' });
    expect((await ONE(get(`/${READING}`), ctxOne(READING))).status).toBe(404);
    expect(mockLive).not.toHaveBeenCalled();
  });

  it('returns the reading AS STORED plus a three-state assessment against the live Work and the current section labels', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    answerSql({ owns: true, sections: ['a'], units: 0 });
    mockLoad.mockResolvedValue(frozen);
    mockLive.mockResolvedValue({ sections: null, structure: null });   // could not be measured
    const res = await ONE(get(`/${READING}`), ctxOne(READING));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.reading).toEqual(frozen);
    expect(body.assessment.reading).toEqual({ state: 'unmeasured' });
    expect(body.sections).toEqual([{ id: 'a', position: 0, heading: null }]);
    expect(mockLive).toHaveBeenCalledWith(MS, MEMBER);
  });
});
