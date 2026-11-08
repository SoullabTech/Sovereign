import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

const OWNER_ID = 'a0a0a0a0-1111-4222-8333-b4b4b4b4b4b4';
const TARGET = '877cd939-12b7-428c-96f9-dc4b9ce798c6';
const CONTACT = 'c0c0c0c0-2222-4333-8444-d5d5d5d5d5d5';

type QueryResult = { rows: any[] };
const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<QueryResult>>();
const mockTx = jest.fn<(sql: string, params?: unknown[]) => Promise<QueryResult>>();

jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
  transaction: async (cb: (c: unknown) => Promise<unknown>) =>
    cb({ query: (sql: string, params?: unknown[]) => mockTx(sql, params) }),
}));

const mockAuth = jest.fn<(...args: unknown[]) => Promise<unknown>>();
jest.mock('@/lib/admin/adminAuth', () => {
  const actual = jest.requireActual('@/lib/admin/adminAuth') as Record<string, unknown>;
  return { ...actual, checkAdminAuth: (...args: unknown[]) => mockAuth(...args) };
});

import { GET, POST } from '../route';
import { AUDIT_ACTION } from '@/lib/admin/memberPermissions';

const asOwner = (role: 'founder' | 'cto' = 'founder') =>
  mockAuth.mockResolvedValue({ authed: true, via: 'member', role, memberId: OWNER_ID });
const asAdmin = (role: string) => mockAuth.mockResolvedValue({ authed: true, via: 'member', role, memberId: TARGET });
const asSharedPassword = () => mockAuth.mockResolvedValue({ authed: true, via: 'password', role: 'founder' });
const asNobody = () => mockAuth.mockResolvedValue({ authed: false, via: null });

function post(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/admin/members/permissions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '10.0.0.5', 'user-agent': 'jest' },
    body: JSON.stringify(body),
  });
}
const get = () => new NextRequest('http://localhost/api/admin/members/permissions');

const txCalls = (frag: string) => mockTx.mock.calls.filter(([s]) => String(s).includes(frag));
const anyWrite = () =>
  [...mockTx.mock.calls, ...mockQuery.mock.calls].some(([s]) => /\b(UPDATE|INSERT|DELETE)\b/.test(String(s)));

let target: Record<string, unknown>;
let founderCount: string;
let contacts: any[];

beforeEach(() => {
  mockQuery.mockReset();
  mockTx.mockReset();
  mockAuth.mockReset();
  asOwner();
  target = { id: TARGET, name: 'Heather Hampton', username: 'wbp', email: 'h@example.com', tier: 'free', roles: ['member'], admin_role: 'operations' };
  founderCount = '2';
  contacts = [];
  mockTx.mockImplementation(async (sql) => {
    if (sql.includes('FROM members WHERE id = $1 FOR UPDATE')) return { rows: [target] };
    if (sql.includes("COUNT(*)::text AS n FROM members WHERE admin_role = 'founder'")) return { rows: [{ n: founderCount }] };
    if (sql.includes('FROM ops_contacts')) return { rows: contacts };
    if (sql.includes('INSERT INTO ops_contacts')) return { rows: [{ id: CONTACT }] };
    return { rows: [] };
  });
  mockQuery.mockResolvedValue({ rows: [] });
});

const WRITES = [
  { permission: 'tier', value: 'pro' },
  { permission: 'role', role: 'admin', grant: true },
  { permission: 'role', role: 'member', grant: false },
  { permission: 'admin_level', value: 'cto' },
  { permission: 'admin_level', value: null },
  { permission: 'writers_studio', grant: true },
  { permission: 'writers_studio', grant: false },
];

describe('authority: only a signed-in owner', () => {
  it.each(WRITES)('refuses a non-owner admin with 403 and writes nothing: %o', async (change) => {
    for (const role of ['operations', 'practitioner_admin', 'tester']) {
      asAdmin(role);
      const res = await POST(post({ memberId: TARGET, ...change }));
      expect(res.status).toBe(403);
    }
    expect(anyWrite()).toBe(false);
  });

  it.each(WRITES)('refuses the shared admin password with 403 and writes nothing: %o', async (change) => {
    asSharedPassword();
    const res = await POST(post({ memberId: TARGET, ...change }));
    expect(res.status).toBe(403);
    expect(anyWrite()).toBe(false);
  });

  it.each(WRITES)('refuses an unauthenticated caller with 401: %o', async (change) => {
    asNobody();
    const res = await POST(post({ memberId: TARGET, ...change }));
    expect(res.status).toBe(401);
    expect(anyWrite()).toBe(false);
  });

  it('refuses the read view to non-owners and the shared password', async () => {
    asAdmin('operations');
    expect((await GET(get())).status).toBe(403);
    asSharedPassword();
    expect((await GET(get())).status).toBe(403);
    asNobody();
    expect((await GET(get())).status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('accepts a cto owner', async () => {
    asOwner('cto');
    const res = await POST(post({ memberId: TARGET, permission: 'tier', value: 'pro' }));
    expect(res.status).toBe(200);
  });
});

describe('audit record', () => {
  it('records who, what, before and after for every successful change', async () => {
    const res = await POST(post({ memberId: TARGET, permission: 'tier', value: 'pro' }));
    expect(res.status).toBe(200);
    const audit = txCalls('INSERT INTO audit_logs');
    expect(audit).toHaveLength(1);
    const params = audit[0][1] as unknown[];
    expect(params[0]).toBe(OWNER_ID); // who
    expect(params[1]).toBe(AUDIT_ACTION);
    expect(params[2]).toBe(TARGET); // on whom
    expect(params[3]).toBe('10.0.0.5');
    const meta = JSON.parse(String(params[5]));
    expect(meta.change).toEqual({ permission: 'tier', value: 'pro' }); // what
    expect(meta.before).toBe('free');
    expect(meta.after).toBe('pro');
  });

  it('records role before/after arrays', async () => {
    await POST(post({ memberId: TARGET, permission: 'role', role: 'admin', grant: true }));
    const meta = JSON.parse(String(txCalls('INSERT INTO audit_logs')[0][1]![5]));
    expect(meta.before).toEqual(['member']);
    expect(meta.after).toEqual(['member', 'admin']);
  });

  it('also writes the admin_role_grants ledger for admin level changes', async () => {
    await POST(post({ memberId: TARGET, permission: 'admin_level', value: 'cto' }));
    const grants = txCalls('INSERT INTO admin_role_grants');
    expect(grants).toHaveLength(1);
    expect(grants[0][1]).toEqual([OWNER_ID, TARGET, 'operations', 'cto']);
    expect(txCalls('INSERT INTO audit_logs')).toHaveLength(1);
  });

  it('writes no audit record when the change is refused', async () => {
    target.admin_role = 'founder';
    founderCount = '1';
    await POST(post({ memberId: TARGET, permission: 'admin_level', value: null }));
    expect(txCalls('INSERT INTO audit_logs')).toHaveLength(0);
  });
});

describe('founder protection', () => {
  it('refuses removing the last founder (409) and does not update', async () => {
    target.admin_role = 'founder';
    founderCount = '1';
    const res = await POST(post({ memberId: TARGET, permission: 'admin_level', value: 'operations' }));
    expect(res.status).toBe(409);
    expect(txCalls('UPDATE members')).toHaveLength(0);
  });

  it('allows removing a founder when another founder remains', async () => {
    target.admin_role = 'founder';
    founderCount = '2';
    const res = await POST(post({ memberId: TARGET, permission: 'admin_level', value: null }));
    expect(res.status).toBe(200);
    expect(txCalls('UPDATE members SET admin_role')).toHaveLength(1);
  });

  it('refuses an owner removing their own founder standing even with other founders', async () => {
    target = { ...target, id: OWNER_ID, admin_role: 'founder' };
    founderCount = '3';
    const res = await POST(post({ memberId: OWNER_ID, permission: 'admin_level', value: 'operations' }));
    expect(res.status).toBe(409);
    expect(txCalls('UPDATE members')).toHaveLength(0);
  });

  it('refuses an owner dropping their own cto standing', async () => {
    asOwner('cto');
    target = { ...target, id: OWNER_ID, admin_role: 'cto' };
    const res = await POST(post({ memberId: OWNER_ID, permission: 'admin_level', value: null }));
    expect(res.status).toBe(409);
  });
});

describe("Writer's Studio access", () => {
  it('creates an active beta_tester roster row when none exists', async () => {
    const res = await POST(post({ memberId: TARGET, permission: 'writers_studio', grant: true }));
    expect(res.status).toBe(200);
    const ins = txCalls('INSERT INTO ops_contacts');
    expect(ins).toHaveLength(1);
    expect(String(ins[0][0])).toContain("'beta_tester', 'active'");
    expect(String(ins[0][0])).toContain('"writers_studio_beta": true');
  });

  it('updates the existing row by merging the flag, preserving other metadata', async () => {
    contacts = [{ id: CONTACT, pipeline_stage: 'committed', flag: null }];
    await POST(post({ memberId: TARGET, permission: 'writers_studio', grant: true }));
    const upd = txCalls('UPDATE ops_contacts');
    expect(upd).toHaveLength(1);
    expect(String(upd[0][0])).toMatch(/COALESCE\(metadata, '\{\}'::jsonb\) \|\|/);
    expect(String(upd[0][0])).toContain("pipeline_stage = 'active'");
    expect(txCalls('INSERT INTO ops_contacts')).toHaveLength(0);
  });

  it('removal sets the flag false and never deletes the row', async () => {
    contacts = [{ id: CONTACT, pipeline_stage: 'active', flag: true }];
    const res = await POST(post({ memberId: TARGET, permission: 'writers_studio', grant: false }));
    expect(res.status).toBe(200);
    const upd = txCalls('UPDATE ops_contacts');
    expect(upd).toHaveLength(1);
    expect(String(upd[0][0])).toContain('"writers_studio_beta": false');
    expect(String(upd[0][0])).not.toContain('pipeline_stage');
    expect(txCalls('DELETE')).toHaveLength(0);
  });
});

describe('validation', () => {
  it.each([
    { memberId: 'not-a-uuid', permission: 'tier', value: 'pro' },
    { memberId: TARGET, permission: 'tier', value: 'platinum' },
    { memberId: TARGET, permission: 'role', role: 'god_mode', grant: true },
    { memberId: TARGET, permission: 'admin_level', value: 'emperor' },
    { memberId: TARGET, permission: 'nothing' },
  ])('rejects %o with 400', async (body) => {
    const res = await POST(post(body));
    expect(res.status).toBe(400);
    expect(anyWrite()).toBe(false);
  });

  it('allows removing an unknown legacy role', async () => {
    target.roles = ['member', 'team_admin'];
    const res = await POST(post({ memberId: TARGET, permission: 'role', role: 'team_admin', grant: false }));
    expect(res.status).toBe(200);
  });

  it('returns 404 for an unknown member', async () => {
    mockTx.mockImplementation(async () => ({ rows: [] }));
    const res = await POST(post({ memberId: TARGET, permission: 'tier', value: 'pro' }));
    expect(res.status).toBe(404);
  });
});
