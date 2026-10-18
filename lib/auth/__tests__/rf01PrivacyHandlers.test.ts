/**
 * RF01 S0-A1.1 — actual privacy route handlers with fictional actors.
 * Database and auth_sessions are mocked; no real member, database or network.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';

const mockQuery = jest.fn<(...args: any[]) => Promise<any>>();
const mockTx = jest.fn<(fn: (client: any) => Promise<any>) => Promise<any>>();
const mockGetActor = jest.fn<(req: NextRequest) => Promise<string | null>>();
const mockTokenActor = jest.fn<(token: string) => Promise<string | null>>();

jest.mock('@/lib/db/postgres', () => ({
  query: (...args: any[]) => mockQuery(...args),
  transaction: (fn: any) => mockTx(fn),
}));
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: (req: NextRequest) => mockGetActor(req),
  getMemberIdFromSessionToken: (token: string) => mockTokenActor(token),
}));

import { GET as settingsGET, PUT as settingsPUT } from '@/app/api/members/settings/route';
import { GET as recallGET, PATCH as recallPATCH } from '@/app/api/members/recall-preferences/route';
import { GET as storageGET, POST as storagePOST } from '@/app/api/account/storage-consent/route';
import { matchRule, checkAccess } from '@/config/accessMatrix';

const tokenToActor = (token: string | null | undefined) =>
  token === 'good-a' ? A : token === 'good-b' ? B : null;
const req = (
  path: string,
  method = 'GET',
  body?: unknown,
  cookieToken?: string,
  headerToken?: string,
) => new NextRequest('https://soullab.life' + path, {
  method,
  headers: {
    ...(cookieToken ? { cookie: 'maia_session=' + cookieToken } : {}),
    ...(headerToken ? { 'x-session-token': headerToken } : {}),
    ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
  },
  ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
});

beforeEach(() => {
  delete process.env.CAPACITOR_BUILD;
  delete process.env.ACCESS_CONTROL_MODE;
  mockQuery.mockReset();
  mockTx.mockReset();
  mockGetActor.mockReset();
  mockTokenActor.mockReset();
  mockGetActor.mockImplementation(async (r: NextRequest) =>
    tokenToActor(r.cookies.get('maia_session')?.value) ||
    tokenToActor(r.headers.get('x-session-token')));
  mockTokenActor.mockImplementation(async (token: string) => tokenToActor(token));
  mockQuery.mockImplementation(async () => ({ rows: [] }));
  mockTx.mockImplementation(async fn => fn({
    query: async (sql: string) => sql.includes('RETURNING *')
      ? { rows: [{ member_id: A, default_memory_mode: 'sanctuary', storage_consent: { conversationsServer: false } }] }
      : { rows: [] },
  }));
});

describe('RF01 proxy access policy', () => {
  it('maps all 3 privacy endpoints as authenticated free-tier, in both modes', () => {
    for (const path of [
      '/api/members/settings', '/api/members/recall-preferences',
      '/api/account/storage-consent',
    ]) {
      expect(matchRule(path)).toMatchObject({ exact: path, minTier: 'free' });
      expect(checkAccess(path, 'free', ['member'], false).allowed).toBe(false);
      expect(checkAccess(path, 'free', ['member'], true).allowed).toBe(true);
      process.env.ACCESS_CONTROL_MODE = 'strict';
      expect(checkAccess(path, 'free', ['member'], false).allowed).toBe(false);
      expect(checkAccess(path, 'free', ['member'], true).allowed).toBe(true);
    }
  });
});

describe('RF01 direct privacy handlers', () => {
  it('refuses settings GET based on bare member ID with no SQL', async () => {
    const res = await settingsGET(req('/api/members/settings?memberId=' + B));
    expect(res.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });
  it('returns absent-row settings without INSERT or invented consent', async () => {
    const res = await settingsGET(req('/api/members/settings', 'GET', undefined, 'good-a'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.maia.defaultMemoryMode).toBeNull();
    expect(json.maia.memoryModeChoiceProvenance).toBe('unresolved');
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(String(mockQuery.mock.calls[0][0])).toMatch(/^SELECT/);
  });
  it('refuses foreign query identity before settings SQL', async () => {
    const res = await settingsGET(req('/api/members/settings?memberId=' + B, 'GET', undefined, 'good-a'));
    expect(res.status).toBe(403);
    expect(mockQuery).not.toHaveBeenCalled();
  });
  it('refuses two valid conflicting credentials rather than cookie precedence', async () => {
    const res = await settingsGET(req('/api/members/settings', 'GET', undefined, 'good-a', 'good-b'));
    expect(res.status).toBe(403);
    expect(mockQuery).not.toHaveBeenCalled();
  });
  it('preserves valid header-only native settings authentication', async () => {
    const res = await settingsGET(req('/api/members/settings', 'GET', undefined, undefined, 'good-a'));
    expect(res.status).toBe(200);
    expect(mockQuery.mock.calls[0][1]).toEqual([A]);
  });
  it('invalid privacy patch is rejected before any write or transaction', async () => {
    const res = await settingsPUT(req('/api/members/settings', 'PUT', {
      memberId: A, defaultMemoryMode: 'not-a-mode',
      storageConsent: { conversationsServer: true },
    }, 'good-a'));
    expect(res.status).toBe(400);
    expect(mockTx).not.toHaveBeenCalled();
    expect(mockQuery).not.toHaveBeenCalled();
  });
  it('rejects ungoverned membership mutation', async () => {
    const res = await settingsPUT(req('/api/members/settings', 'PUT', {
      memberId: A, circleTier: 'pro',
    }, 'good-a'));
    expect(res.status).toBe(403);
    expect(mockTx).not.toHaveBeenCalled();
  });
  it('commits both consent and another preference on one tx client', async () => {
    const res = await settingsPUT(req('/api/members/settings', 'PUT', {
      memberId: A, defaultMemoryMode: 'sanctuary',
      storageConsent: { conversationsServer: false },
    }, 'good-a'));
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(mockTx).toHaveBeenCalledTimes(1);
    expect(mockQuery).not.toHaveBeenCalled();
  });
  it('reports failure when a second transactional SQL command throws', async () => {
    mockTx.mockImplementation(async cb => cb({
      query: async (sql: string) => {
        if (sql.startsWith('UPDATE')) throw new Error('FICTIONAL_DATABASE_FAILURE');
        return { rows: [] };
      },
    }));
    const res = await settingsPUT(req('/api/members/settings', 'PUT', {
      memberId: A, shareAnonymousInsights: false,
      storageConsent: { conversationsServer: false },
    }, 'good-a'));
    expect(res.status).toBe(500);
    expect(mockTx).toHaveBeenCalledTimes(1);
    // DB rollback itself requires separately authorized physical PG verification.
  });
  it('refuses unauthenticated recall GET and PATCH with zero SQL', async () => {
    const get = await recallGET(req('/api/members/recall-preferences?memberId=' + B));
    const patch = await recallPATCH(req('/api/members/recall-preferences?memberId=' + B,
      'PATCH', { conversational_recall_enabled: false }));
    expect([get.status, patch.status]).toEqual([401, 401]);
    expect(mockQuery).not.toHaveBeenCalled();
  });
  it('recall PATCH is owned by verified native header token, not URL', async () => {
    const denied = await recallPATCH(req('/api/members/recall-preferences?memberId=' + B,
      'PATCH', { conversational_recall_enabled: false }, undefined, 'good-a'));
    expect(denied.status).toBe(403);
    expect(mockQuery).not.toHaveBeenCalled();
    mockQuery.mockImplementation(async () => ({ rows: [{
      conversational_recall_enabled: false, episodic_recall_enabled: true,
    }] }));
    const allowed = await recallPATCH(req('/api/members/recall-preferences',
      'PATCH', { conversational_recall_enabled: false }, undefined, 'good-a'));
    expect(allowed.status).toBe(200);
    expect(mockQuery.mock.calls[0][1][0]).toBe(A);
  });
  it('refuses unauthenticated storage GET and POST with zero SQL', async () => {
    const get = await storageGET(req('/api/account/storage-consent?memberId=' + B));
    const post = await storagePOST(req('/api/account/storage-consent',
      'POST', { memberId: B, conversationsServer: true }));
    expect([get.status, post.status]).toEqual([401, 401]);
    expect(mockQuery).not.toHaveBeenCalled();
  });
  it('refuses a foreign storage POST and allows an owned native-token POST', async () => {
    const denied = await storagePOST(req('/api/account/storage-consent',
      'POST', { memberId: B, conversationsServer: true }, undefined, 'good-a'));
    expect(denied.status).toBe(403);
    expect(mockQuery).not.toHaveBeenCalled();
    const allowed = await storagePOST(req('/api/account/storage-consent',
      'POST', { memberId: A, conversationsServer: false }, undefined, 'good-a'));
    expect(allowed.status).toBe(200);
    expect(mockQuery.mock.calls[0][1][0]).toBe(A);
  });
});
