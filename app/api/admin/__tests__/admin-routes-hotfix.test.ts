/**
 * Tier-1 admin security hotfix PoC.
 *
 * The four routes now enforce a route-level admin-secret guard
 * (isAdminRequest → LABTOOLS_ADMIN_PASSWORD via x-admin-password), fail-closed,
 * with NO middleware reliance and NO x-member-id. reset-member-password no
 * longer has a hardcoded fallback secret.
 *
 * Hermetic: DB + alert engine + password hashing are mocked. isAdminRequest is
 * NOT mocked — it runs for real against process.env + request headers.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';

const ADMIN_PW = 'test-admin-secret-pw';

const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>>();
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  default: { query: (s: string, p?: unknown[]) => mockQuery(s, p) },
  query: (s: string, p?: unknown[]) => mockQuery(s, p),
}));
jest.mock('@/lib/security/alertEngine', () => ({
  __esModule: true,
  runSecurityCheck: jest.fn(async () => ({ newAlerts: [], emailsSent: 0 })),
  listRecentAlerts: jest.fn(async () => []),
  acknowledgeAlert: jest.fn(async () => true),
}));
jest.mock('@/lib/auth/passwordUtils', () => ({
  __esModule: true,
  hashPassword: jest.fn(async () => 'hashed'),
}));

import { GET as settingsGET, POST as settingsPOST } from '../settings/route';
import { POST as sessionsPOST } from '../security/sessions/route';
import { GET as alertsGET, POST as alertsPOST } from '../security/alerts/route';
import { POST as resetPOST } from '../reset-member-password/route';

function req(
  path: string,
  opts: { method?: string; admin?: string; cron?: string; body?: unknown } = {},
): NextRequest {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (opts.admin) headers['x-admin-password'] = opts.admin;
  if (opts.cron) headers['x-internal-token'] = opts.cron;
  return new NextRequest(`http://localhost${path}`, {
    method: opts.method ?? 'GET',
    headers,
    ...(opts.body !== undefined ? { body: JSON.stringify(opts.body) } : {}),
  });
}

beforeEach(() => {
  mockQuery.mockReset();
  mockQuery.mockResolvedValue({ rows: [{ id: 'x', key: 'k', value: 1, username: 'u', name: 'n' }] });
  process.env.LABTOOLS_ADMIN_PASSWORD = ADMIN_PW;
  delete process.env.ADMIN_RESET_SECRET;
  delete process.env.INTERNAL_ALERT_TOKEN;
  delete process.env.CAPACITOR_BUILD;
});

describe('Tier-1 hotfix — unauthenticated requests are denied (401)', () => {
  it('settings GET, no secret → 401', async () => {
    expect((await settingsGET(req('/api/admin/settings'))).status).toBe(401);
  });
  it('settings POST, no secret → 401 AND no write', async () => {
    const res = await settingsPOST(req('/api/admin/settings', { method: 'POST', body: { key: 'k', value: 1 } }));
    expect(res.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });
  it('security/sessions POST, no secret → 401 AND no revoke', async () => {
    const res = await sessionsPOST(req('/api/admin/security/sessions', { method: 'POST', body: { sessionId: 's', action: 'revoke' } }));
    expect(res.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });
  it('security/alerts GET, no secret → 401', async () => {
    expect((await alertsGET(req('/api/admin/security/alerts'))).status).toBe(401);
  });
  it('security/alerts POST, no secret/cron → 401', async () => {
    expect((await alertsPOST(req('/api/admin/security/alerts', { method: 'POST', body: { action: 'check' } }))).status).toBe(401);
  });
});

describe('Tier-1 hotfix — wrong secret is denied (401)', () => {
  it('settings POST, wrong secret → 401', async () => {
    expect((await settingsPOST(req('/api/admin/settings', { method: 'POST', admin: 'nope', body: { key: 'k', value: 1 } }))).status).toBe(401);
  });
});

describe('Tier-1 hotfix — valid admin secret passes the guard', () => {
  it('settings GET → not 401', async () => {
    expect((await settingsGET(req('/api/admin/settings', { admin: ADMIN_PW }))).status).not.toBe(401);
  });
  it('settings POST → writes (not 401)', async () => {
    const res = await settingsPOST(req('/api/admin/settings', { method: 'POST', admin: ADMIN_PW, body: { key: 'k', value: 1 } }));
    expect(res.status).not.toBe(401);
    expect(mockQuery).toHaveBeenCalled();
  });
  it('security/sessions POST → not 401', async () => {
    expect((await sessionsPOST(req('/api/admin/security/sessions', { method: 'POST', admin: ADMIN_PW, body: { sessionId: 's', action: 'revoke' } }))).status).not.toBe(401);
  });
  it('security/alerts GET → not 401', async () => {
    expect((await alertsGET(req('/api/admin/security/alerts', { admin: ADMIN_PW }))).status).not.toBe(401);
  });
});

describe('Tier-1 hotfix — alerts cron path preserved', () => {
  it('alerts POST with internal cron token → not 401', async () => {
    process.env.INTERNAL_ALERT_TOKEN = 'cron-token';
    expect((await alertsPOST(req('/api/admin/security/alerts', { method: 'POST', cron: 'cron-token', body: { action: 'check' } }))).status).not.toBe(401);
  });
});

describe('reset-member-password — no hardcoded fallback path', () => {
  it('env UNSET + old fallback secret in body → 503 (fallback removed, fail-closed)', async () => {
    const res = await resetPOST(req('/api/admin/reset-member-password', { method: 'POST', body: { email: 'a@b.c', newPassword: 'xxxxxx', adminSecret: 'maia-admin-reset-2026' } }));
    expect(res.status).toBe(503);
    expect(mockQuery).not.toHaveBeenCalled();
  });
  it('env SET + wrong secret → 401', async () => {
    process.env.ADMIN_RESET_SECRET = 'real-reset-secret';
    expect((await resetPOST(req('/api/admin/reset-member-password', { method: 'POST', body: { email: 'a@b.c', newPassword: 'xxxxxx', adminSecret: 'wrong' } }))).status).toBe(401);
  });
  it('env SET + correct secret → passes guard (not 401/503)', async () => {
    process.env.ADMIN_RESET_SECRET = 'real-reset-secret';
    const res = await resetPOST(req('/api/admin/reset-member-password', { method: 'POST', body: { email: 'a@b.c', newPassword: 'xxxxxx', adminSecret: 'real-reset-secret' } }));
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(503);
  });
});
