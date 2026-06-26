/**
 * Release as Consented Authorship — DELETE-route gating.
 *
 * Proves the acceptance criteria without a DB: deps are mocked. The handler only
 * reads `request.url`, so a minimal object stands in for NextRequest.
 *
 * Gate for recognition = recognize flag AND a session AND that session releasing
 * its OWN entry AND the labs.preview entitlement. Anything missing → plain delete.
 */

import type { NextRequest } from 'next/server';

const mockDeleteJournalEntry = jest.fn();
const mockGetCurrentSession = jest.fn();
const mockResolveEntitlements = jest.fn();
const mockRecordRelease = jest.fn();

jest.mock('@/lib/elemental-alchemy/journalService', () => ({
  createJournalEntry: jest.fn(),
  getJournalEntries: jest.fn(),
  getJournalStats: jest.fn(),
  updateJournalEntry: jest.fn(),
  deleteJournalEntry: (...a: unknown[]) => mockDeleteJournalEntry(...a),
}));
jest.mock('@/lib/auth/serverSessions', () => ({
  getCurrentSession: (...a: unknown[]) => mockGetCurrentSession(...a),
}));
jest.mock('@/lib/auth/entitlements', () => ({
  resolveEntitlements: (...a: unknown[]) => mockResolveEntitlements(...a),
  hasEntitlement: (set: Set<string>, key: string) => set.has(key),
}));
jest.mock('@/lib/recognition/releaseService', () => ({
  recordRelease: (...a: unknown[]) => mockRecordRelease(...a),
}));

import { DELETE } from '@/app/api/community/elemental-alchemy/journal/route';

const MEMBER = '11111111-1111-1111-1111-111111111111';
const delReq = (params: Record<string, string>) =>
  ({
    url: `http://localhost/api/community/elemental-alchemy/journal?${new URLSearchParams(params)}`,
  } as unknown as NextRequest);

beforeEach(() => {
  jest.clearAllMocks();
  mockDeleteJournalEntry.mockResolvedValue(true);
  mockGetCurrentSession.mockResolvedValue({ memberId: MEMBER });
  mockResolveEntitlements.mockResolvedValue(new Set(['labs.preview']));
  mockRecordRelease.mockResolvedValue(undefined);
});

describe('Release gating — acceptance criteria', () => {
  test('no recognition flag → plain delete, nothing recorded (byte-unchanged path)', async () => {
    const res = await DELETE(delReq({ id: 'e1', userId: MEMBER }));
    expect(await res.json()).toEqual({ ok: true, recognized: false });
    expect(mockDeleteJournalEntry).toHaveBeenCalledWith('e1', MEMBER);
    expect(mockRecordRelease).not.toHaveBeenCalled();
  });

  test('tester + own entry + recognition → recorded exactly once (the act + type + note)', async () => {
    const res = await DELETE(delReq({ id: 'e1', userId: MEMBER, recognize: 'true', note: 'letting this go' }));
    expect(await res.json()).toEqual({ ok: true, recognized: true });
    expect(mockRecordRelease).toHaveBeenCalledTimes(1);
    expect(mockRecordRelease).toHaveBeenCalledWith(MEMBER, 'journal_entry', 'letting this go');
  });

  test('not a tester (no labs.preview) → not recorded', async () => {
    mockResolveEntitlements.mockResolvedValue(new Set());
    const res = await DELETE(delReq({ id: 'e1', userId: MEMBER, recognize: 'true' }));
    expect((await res.json()).recognized).toBe(false);
    expect(mockRecordRelease).not.toHaveBeenCalled();
  });

  test('no session → not recorded', async () => {
    mockGetCurrentSession.mockResolvedValue(null);
    const res = await DELETE(delReq({ id: 'e1', userId: MEMBER, recognize: 'true' }));
    expect((await res.json()).recognized).toBe(false);
    expect(mockRecordRelease).not.toHaveBeenCalled();
  });

  test("releasing someone else's entry (session ≠ userId) → not recorded", async () => {
    mockGetCurrentSession.mockResolvedValue({ memberId: 'someone-else' });
    const res = await DELETE(delReq({ id: 'e1', userId: MEMBER, recognize: 'true' }));
    expect((await res.json()).recognized).toBe(false);
    expect(mockRecordRelease).not.toHaveBeenCalled();
  });

  test('content is ALWAYS released, even if recognition recording fails (best-effort)', async () => {
    mockRecordRelease.mockRejectedValue(new Error('db down'));
    const res = await DELETE(delReq({ id: 'e1', userId: MEMBER, recognize: 'true' }));
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
    expect(mockDeleteJournalEntry).toHaveBeenCalled();
  });

  test('entry not found → 404, nothing recorded', async () => {
    mockDeleteJournalEntry.mockResolvedValue(false);
    const res = await DELETE(delReq({ id: 'missing', userId: MEMBER, recognize: 'true' }));
    expect(res.status).toBe(404);
    expect(mockRecordRelease).not.toHaveBeenCalled();
  });
});
