/**
 * RF01 S0-A1.1 — physical PostgreSQL qualification with invented members only.
 * HARD STOP if an explicit disposable local socket URL is not supplied.
 */
import { describe, it, expect, jest, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { NextRequest } from 'next/server';

const DB_URL = process.env.DATABASE_URL || '';
const localSocketFixture = DB_URL.includes('rf01_fixture') &&
  DB_URL.includes('/private/tmp/rf01-s0a1-pg-20261016/socket');
const localDocker16Fixture = (() => {
  if (process.env.RF01_LOCAL_PG16 !== '1') return false;
  try {
    const u = new URL(DB_URL);
    return u.protocol === 'postgresql:' && u.hostname === '127.0.0.1' &&
      u.port === '55468' && u.pathname === '/rf01_fixture' &&
      u.username === 'soullab';
  } catch { return false; }
})();
if (!localSocketFixture && !localDocker16Fixture) {
  throw new Error('Refusing RF01 physical tests outside the disposable fictional database');
}

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: async (req: NextRequest) =>
    req.headers.get('x-session-token') === 'fictional-a' ? A :
    req.headers.get('x-session-token') === 'fictional-b' ? B : null,
  getMemberIdFromSessionToken: async (token: string) =>
    token === 'fictional-a' ? A : token === 'fictional-b' ? B : null,
}));
import { query, closePool } from '@/lib/db/postgres';
import { GET as settingsGET, PUT as settingsPUT } from '@/app/api/members/settings/route';
import { GET as recallGET, PATCH as recallPATCH } from '@/app/api/members/recall-preferences/route';
import { GET as storageGET, POST as storagePOST } from '@/app/api/account/storage-consent/route';

const req = (path: string, method = 'GET', body?: unknown, actor = 'fictional-a') =>
  new NextRequest('https://soullab.life' + path, {
    method,
    headers: {
      'x-session-token': actor,
      ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

beforeAll(async () => {
  const check = await query<{ db: string }>('SELECT current_database() as db');
  expect(check.rows[0]?.db).toBe('rf01_fixture');
});
beforeEach(async () => {
  await query(
    "UPDATE member_settings SET default_memory_mode='sanctuary', " +
    "preferred_assistant_name='MAIA', storage_consent='{\"conversationsServer\":false}'::jsonb " +
    'WHERE member_id=$1', [A],
  );
  await query('UPDATE members SET conversational_recall_enabled=true, episodic_recall_enabled=true');
});
afterAll(async () => { await closePool(); });

describe('RF01 physical PostgreSQL storage and refusal evidence', () => {
  it('reads own settings without changing another account', async () => {
    const res = await settingsGET(req('/api/members/settings'));
    expect(res.status).toBe(200);
    expect((await res.json()).maia.defaultMemoryMode).toBe('sanctuary');
    const rows = await query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM member_settings',
    );
    expect(rows.rows[0].count).toBe('1');
  });
  it('returns unresolved preference for missing row without INSERT', async () => {
    const before = await query<{ count: string }>('SELECT COUNT(*)::text AS count FROM member_settings');
    const res = await settingsGET(req('/api/members/settings', 'GET', undefined, 'fictional-b'));
    expect(res.status).toBe(200);
    expect((await res.json()).maia.defaultMemoryMode).toBeNull();
    const after = await query<{ count: string }>('SELECT COUNT(*)::text AS count FROM member_settings');
    expect(after.rows[0].count).toBe(before.rows[0].count);
  });
  it('rolls back an attempted storage-consent update when subsequent update SQL fails', async () => {
    const res = await settingsPUT(req('/api/members/settings', 'PUT', {
      memberId: A,
      storageConsent: { conversationsServer: true },
      preferredAssistantName: 'RF01_FORCE_FAILURE',
    }));
    expect(res.status).toBe(500);
    const rows = await query<{ storage_consent: { conversationsServer: boolean }; preferred_assistant_name: string }>(
      'SELECT storage_consent, preferred_assistant_name FROM member_settings WHERE member_id=$1',
      [A],
    );
    expect(rows.rows[0].storage_consent.conversationsServer).toBe(false);
    expect(rows.rows[0].preferred_assistant_name).toBe('MAIA');
  });
  it('commits a legitimate multi-field privacy change as one result', async () => {
    const res = await settingsPUT(req('/api/members/settings', 'PUT', {
      memberId: A,
      defaultMemoryMode: 'sanctuary',
      storageConsent: { conversationsServer: true, memoriesServer: false },
    }));
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    const rows = await query<{ storage_consent: { conversationsServer: boolean; memoriesServer: boolean } }>(
      'SELECT storage_consent FROM member_settings WHERE member_id=$1', [A],
    );
    expect(rows.rows[0].storage_consent).toMatchObject({
      conversationsServer: true, memoriesServer: false,
    });
  });
  it('persists only authenticated member recall choices', async () => {
    const denied = await recallPATCH(req('/api/members/recall-preferences?memberId=' + B,
      'PATCH', { conversational_recall_enabled: false }));
    expect(denied.status).toBe(403);
    const allowed = await recallPATCH(req('/api/members/recall-preferences',
      'PATCH', { conversational_recall_enabled: false }));
    expect(allowed.status).toBe(200);
    const rows = await query<{ id: string; conversational_recall_enabled: boolean }>(
      'SELECT id, conversational_recall_enabled FROM members ORDER BY id',
    );
    expect(rows.rows.find(x => x.id === A)?.conversational_recall_enabled).toBe(false);
    expect(rows.rows.find(x => x.id === B)?.conversational_recall_enabled).toBe(true);
    expect((await recallGET(req('/api/members/recall-preferences'))).status).toBe(200);
  });
  it('does not accept cross-member storage consent writes', async () => {
    const denied = await storagePOST(req('/api/account/storage-consent',
      'POST', { memberId: B, conversationsServer: true }));
    expect(denied.status).toBe(403);
    const allowed = await storagePOST(req('/api/account/storage-consent',
      'POST', { memberId: A, conversationsServer: false }));
    expect(allowed.status).toBe(200);
    const own = await storageGET(req('/api/account/storage-consent'));
    expect(own.status).toBe(200);
    expect((await own.json()).consent.conversationsServer).toBe(false);
  });
});
