import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

const ADMIN_PW = 'reset-link-admin-secret';
const MEMBER = '877cd939-12b7-428c-96f9-dc4b9ce798c6';

type QueryResult = { rows: any[] };
const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<QueryResult>>();

jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
  default: { query: (sql: string, params?: unknown[]) => mockQuery(sql, params) },
}));

import { POST } from '../route';

function req(body: unknown, admin?: string): NextRequest {
  return new NextRequest('http://localhost/api/admin/members/reset-link', {
    method: 'POST',
    headers: admin ? { 'x-admin-password': admin, 'content-type': 'application/json' } : { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}
const wrote = (frag: string) => mockQuery.mock.calls.some(([s]) => String(s).includes(frag));

beforeEach(() => {
  process.env.LABTOOLS_ADMIN_PASSWORD = ADMIN_PW;
  mockQuery.mockReset();
  mockQuery.mockImplementation(async (sql) => {
    if (sql.includes('FROM members WHERE')) return { rows: [{ id: MEMBER, name: 'Cece Campbell', username: 'cece' }] };
    return { rows: [] };
  });
});

describe('POST /api/admin/members/reset-link', () => {
  it('fails closed without owner authority and writes no token', async () => {
    const res = await POST(req({ memberId: MEMBER }));
    expect(res.status).toBe(401);
    expect(wrote('password_reset_tokens')).toBe(false);
  });

  it('requires exactly one identifier', async () => {
    expect((await POST(req({}, ADMIN_PW))).status).toBe(400);
    expect((await POST(req({ memberId: MEMBER, email: 'a@b.test' }, ADMIN_PW))).status).toBe(400);
    expect((await POST(req({ memberId: 'not-a-uuid' }, ADMIN_PW))).status).toBe(400);
  });

  it('404s an unknown member and 409s an ambiguous one without issuing', async () => {
    mockQuery.mockImplementation(async () => ({ rows: [] }));
    expect((await POST(req({ username: 'nobody' }, ADMIN_PW))).status).toBe(404);
    mockQuery.mockImplementation(async (sql) =>
      sql.includes('FROM members WHERE') ? { rows: [{ id: MEMBER }, { id: MEMBER }] } : { rows: [] });
    expect((await POST(req({ email: 'dup@x.test' }, ADMIN_PW))).status).toBe(409);
    expect(wrote('INSERT INTO password_reset_tokens')).toBe(false);
  });

  it('issues a one-time link, retires older ones, never stores or logs the token in audit', async () => {
    const res = await POST(req({ memberId: MEMBER }, ADMIN_PW));
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('no-store');
    const body = await res.json();
    const token = String(body.resetLink).split('token=')[1];
    expect(token).toMatch(/^[0-9a-f]{64}$/);

    const sqls = mockQuery.mock.calls.map(([s]) => String(s));
    expect(sqls.findIndex((s) => s.includes('SET used = true'))).toBeLessThan(
      sqls.findIndex((s) => s.includes('INSERT INTO password_reset_tokens')));

    const audit = mockQuery.mock.calls.find(([s]) => String(s).includes('INSERT INTO audit_logs'));
    expect(audit).toBeTruthy();
    expect(JSON.stringify(audit![1])).not.toContain(token);
    expect(JSON.stringify(body)).not.toContain('password_hash');
  });
});
