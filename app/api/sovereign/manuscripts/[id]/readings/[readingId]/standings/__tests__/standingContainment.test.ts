/**
 * SERVER-SIDE STANDING CONTAINMENT — Founder Pilot, 2026-09-06.
 *
 * DEVELOP moved into the tester surface, so the UI-only kill switch stopped
 * being containment. These tests hold the refusal at the server, where a hidden
 * control cannot be the boundary.
 *
 * They also pin the three things containment must NOT break: reading, dialogue,
 * and the standing history already recorded.
 */

const mockGetMemberId = jest.fn();
const mockRecordStanding = jest.fn();
const mockCurrentStandings = jest.fn();
const mockReadingIsAddressable = jest.fn();

jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  __esModule: true,
  getMemberIdFromRequest: (r: unknown) => mockGetMemberId(r),
}));
jest.mock('@/lib/manuscript/standing/store', () => ({
  __esModule: true,
  recordStanding: (...a: unknown[]) => mockRecordStanding(...a),
  currentStandings: (...a: unknown[]) => mockCurrentStandings(...a),
  readingIsAddressable: (...a: unknown[]) => mockReadingIsAddressable(...a),
}));

import { NextRequest } from 'next/server';
import { POST, GET } from '../route';

const M = '11111111-1111-4111-8111-111111111111';
const R = '22222222-2222-4222-8222-222222222222';
const params = Promise.resolve({ id: M, readingId: R });

const post = (body: unknown) =>
  new NextRequest(`https://soullab.life/api/sovereign/manuscripts/${M}/readings/${R}/standings`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  });
const get = () =>
  new NextRequest(`https://soullab.life/api/sovereign/manuscripts/${M}/readings/${R}/standings`);

const ORIGINAL = process.env.WS_STANDING_ENABLED;
afterAll(() => { process.env.WS_STANDING_ENABLED = ORIGINAL; });

beforeEach(() => {
  jest.clearAllMocks();
  mockGetMemberId.mockResolvedValue('member-1');
  mockReadingIsAddressable.mockResolvedValue(true);
  mockCurrentStandings.mockResolvedValue([]);
});

describe('while standing is disabled', () => {
  beforeEach(() => { delete process.env.WS_STANDING_ENABLED; });

  it('REFUSES a direct standing POST', async () => {
    const res = await POST(post({ observationKey: 'o1', standing: 'keep', expectedCurrentEventId: null }), { params });
    expect(res.status).toBe(403);
    expect((await res.json()).refusal).toBe('standing_unavailable');
  });

  it('REFUSES a stale-client POST — a cached page cannot write either', async () => {
    const res = await POST(post({ observationKey: 'o1', standing: 'dismiss', expectedCurrentEventId: 'old-event' }), { params });
    expect(res.status).toBe(403);
  });

  it('writes NOTHING — the store is never reached', async () => {
    await POST(post({ observationKey: 'o1', standing: 'keep', expectedCurrentEventId: null }), { params });
    expect(mockRecordStanding).not.toHaveBeenCalled();
  });

  it('refuses BEFORE identity and existence are consulted — no probe surface', async () => {
    await POST(post({ observationKey: 'o1', standing: 'keep', expectedCurrentEventId: null }), { params });
    expect(mockGetMemberId).not.toHaveBeenCalled();
    expect(mockReadingIsAddressable).not.toHaveBeenCalled();
  });

  it('leaves READING standing history readable — containment is not deletion', async () => {
    mockCurrentStandings.mockResolvedValue([
      { id: 'e1', observationKey: 'o1', standing: 'keep', eventIndex: 0, recordedAt: '2026-09-06T17:21:42Z' },
    ]);
    const res = await GET(get(), { params });
    expect(res.status).toBe(200);
    expect((await res.json()).standings).toHaveLength(1);
  });

  it('the PUBLIC flag alone does not open the server', async () => {
    process.env.NEXT_PUBLIC_WS_STANDING_ENABLED = '1';
    const res = await POST(post({ observationKey: 'o1', standing: 'keep', expectedCurrentEventId: null }), { params });
    expect(res.status).toBe(403);
    delete process.env.NEXT_PUBLIC_WS_STANDING_ENABLED;
  });
});

describe('while standing is enabled', () => {
  beforeEach(() => { process.env.WS_STANDING_ENABLED = '1'; });

  it('the ordinary write path is reached unchanged', async () => {
    mockRecordStanding.mockResolvedValue({
      outcome: 'appended',
      event: { id: 'e1', observationKey: 'o1', standing: 'keep', eventIndex: 0, recordedAt: '2026-09-06T20:00:00Z' },
    });
    const res = await POST(post({ observationKey: 'o1', standing: 'keep', expectedCurrentEventId: null }), { params });
    expect(res.status).toBe(200);
    expect(mockRecordStanding).toHaveBeenCalledTimes(1);
  });
});
