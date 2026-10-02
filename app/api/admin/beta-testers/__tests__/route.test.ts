import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

const ADMIN_PW = 'beta-roster-admin-secret';

type QueryResult = { rows: any[] };
const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<QueryResult>>();

jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
  default: { query: (sql: string, params?: unknown[]) => mockQuery(sql, params) },
}));

import { GET } from '../route';

function req(admin?: string): NextRequest {
  return new NextRequest('http://localhost/api/admin/beta-testers', {
    headers: admin ? { 'x-admin-password': admin } : {},
  });
}
beforeEach(() => {
  process.env.LABTOOLS_ADMIN_PASSWORD = ADMIN_PW;
  process.env.EARLY_FIELD_ENABLED = 'true';
  process.env.EARLY_FIELD_MEMBER_IDS = '11111111-1111-4111-8111-111111111111';
  mockQuery.mockReset();
  mockQuery.mockImplementation(async (sql) => {
    if (sql.includes('INSERT INTO admin_access_log')) return { rows: [] };
    if (sql.includes('COUNT(*) AS n FROM ops_contacts')) return { rows: [{ n: '3' }] };
    if (sql.includes('FROM members m')) {
      return {
        rows: [{
          id: '11111111-1111-4111-8111-111111111111',
          flag: true,
          has_role: true,
          has_pipeline: false,
          name: 'Tester One',
          preferred_name: 'One',
          username: 'tester-one',
          email: 'one@example.test',
          tier: 'free',
          roles: ['member'],
          onboarded: true,
          password_hash: 'secret-hash-never-returned',
          has_webauthn: false,
          preferred_auth_method: 'password',
          subscription_active: false,
          subscription_expires_at: null,
          last_sign_in: '2026-10-01T00:00:00Z',
          created_at: '2026-01-01T00:00:00Z',
        }],
      };
    }
    return { rows: [] };
  });
});

describe('GET /api/admin/beta-testers', () => {
  it('fails closed without admin authority', async () => {
    const res = await GET(req());
    expect(res.status).toBe(401);
    expect(mockQuery.mock.calls.some(([sql]) => String(sql).includes('FROM members m'))).toBe(false);
  });

  it('reports every beta signal separately and keeps Early Field separate from platform access', async () => {
    const res = await GET(req(ADMIN_PW));
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.summary).toEqual({
      total: 1,
      signInReady: 1,
      needsReview: 0,
      earlyField: 1,
      onboarded: 1,
      bySignal: { flag: 1, role: 1, pipeline: 0 },
      unlinkedPipelineContacts: 3,
    });
    expect(body.authority.platformAccess).toBe('authenticated member; minimum tier free');
    expect(body.authority.subscriptionGatesOrdinaryPlatform).toBe(false);
    expect(body.authority.earlyFieldSeparate).toBe(true);
    expect(body.authority.signals.map((x: { id: string }) => x.id)).toEqual(['flag', 'role', 'pipeline']);
    expect(body.testers[0]).toMatchObject({
      name: 'One',
      signInMethods: ['email-code', 'password'],
      signInReady: true,
      earlyFieldAdmitted: true,
      subscriptionActive: false,
      signals: { flag: true, role: true, pipeline: false },
    });
    expect(JSON.stringify(body)).not.toContain('secret-hash-never-returned');
  });

  it('selects the union of signals, not the flag alone, and includes the Early Field cohort', async () => {
    await GET(req(ADMIN_PW));
    const sql = String(mockQuery.mock.calls.map(([q]) => String(q)).find((q) => q.includes('FROM members m')));
    expect(sql).toContain('m.tester = TRUE');
    expect(sql).toContain("m.roles @> ARRAY['beta_tester']");
    expect(sql).toContain("c.contact_type = 'beta_tester'");
    expect(sql).toContain('m.id = ANY($1::uuid[])');
    const call = mockQuery.mock.calls.find(([q]) => String(q).includes('FROM members m'));
    expect(call?.[1]).toEqual([['11111111-1111-4111-8111-111111111111']]);
  });
});

const COHORT = [
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444',
];

function memberRow(id: string, over: Record<string, unknown> = {}) {
  return {
    id, flag: false, has_role: false, has_pipeline: false,
    name: `M-${id.slice(0, 2)}`, preferred_name: null, username: null,
    email: `${id.slice(0, 2)}@example.test`, tier: 'free', roles: ['member'],
    onboarded: true, password_hash: null, has_webauthn: false,
    preferred_auth_method: null, subscription_active: false,
    subscription_expires_at: null, last_sign_in: null, created_at: '2026-01-01T00:00:00Z',
    ...over,
  };
}

function serve(rows: unknown[], unlinkedN: unknown = '0') {
  mockQuery.mockImplementation(async (sql) => {
    if (sql.includes('INSERT INTO admin_access_log')) return { rows: [] };
    if (sql.includes('COUNT(*) AS n FROM ops_contacts')) return { rows: unlinkedN === undefined ? [] : [{ n: unlinkedN }] };
    if (sql.includes('FROM members m')) return { rows: rows as any[] };
    return { rows: [] };
  });
}

describe('union semantics and failure behaviour', () => {
  it('gate 4: a member holding several signals is one row, and the SQL cannot multiply rows', async () => {
    serve([memberRow(COHORT[0]!, { flag: true, has_role: true, has_pipeline: true })]);
    const body = await (await GET(req(ADMIN_PW))).json();
    expect(body.testers).toHaveLength(1);
    expect(body.summary.total).toBe(1);
    expect(body.testers[0].signals).toEqual({ flag: true, role: true, pipeline: true });
    expect(body.summary.bySignal).toEqual({ flag: 1, role: 1, pipeline: 1 });
    const sql = String(mockQuery.mock.calls.map(([q]) => String(q)).find((q) => q.includes('FROM members m')));
    // Pipeline is an EXISTS predicate, never a JOIN: two contacts for one member cannot yield two rows.
    expect(sql).not.toMatch(/JOIN\s+ops_contacts/i);
    expect(sql).not.toMatch(/\bUNION\b/i);
  });

  it('gate 5: the four configured cohort members resolve to an Early Field count of 4', async () => {
    process.env.EARLY_FIELD_MEMBER_IDS = COHORT.join(',');
    serve(COHORT.map((id) => memberRow(id)));
    const body = await (await GET(req(ADMIN_PW))).json();
    expect(body.summary.earlyField).toBe(4);
    expect(body.testers.every((t: { earlyFieldAdmitted: boolean }) => t.earlyFieldAdmitted)).toBe(true);
    const call = mockQuery.mock.calls.find(([q]) => String(q).includes('FROM members m'));
    expect(call?.[1]).toEqual([COHORT.map((c) => c.toLowerCase())]);
  });

  it('gate 6: unlinked pipeline contacts are counted but create no member rows', async () => {
    serve([memberRow(COHORT[0]!, { flag: true })], '9');
    const body = await (await GET(req(ADMIN_PW))).json();
    expect(body.summary.unlinkedPipelineContacts).toBe(9);
    expect(body.testers).toHaveLength(1);
    expect(body.summary.total).toBe(1);
  });

  it('gate 7: empty signal sets fail safe to zeros', async () => {
    serve([], undefined);
    const res = await GET(req(ADMIN_PW));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.testers).toEqual([]);
    expect(body.summary).toMatchObject({ total: 0, signInReady: 0, needsReview: 0, earlyField: 0, onboarded: 0, unlinkedPipelineContacts: 0 });
    expect(body.summary.bySignal).toEqual({ flag: 0, role: 0, pipeline: 0 });
  });

  it('gate 7: a malformed cohort config yields an empty cohort array and no Early Field members', async () => {
    process.env.EARLY_FIELD_MEMBER_IDS = `${COHORT[0]},not-a-uuid`;
    serve([memberRow(COHORT[0]!, { flag: true })]);
    const body = await (await GET(req(ADMIN_PW))).json();
    const call = mockQuery.mock.calls.find(([q]) => String(q).includes('FROM members m'));
    expect(call?.[1]).toEqual([[]]);
    expect(body.summary.earlyField).toBe(0);
  });

  it('gate 7: duplicate pipeline contacts count as contacts, never as extra members', async () => {
    // Two unlinked duplicate contacts are two contacts; the roster itself is unchanged.
    serve([memberRow(COHORT[0]!, { has_pipeline: true })], 2);
    const body = await (await GET(req(ADMIN_PW))).json();
    expect(body.summary.unlinkedPipelineContacts).toBe(2);
    expect(body.testers).toHaveLength(1);
  });

  it('a database failure returns 500 with no partial roster', async () => {
    mockQuery.mockImplementation(async (sql) => {
      if (sql.includes('FROM members m')) throw new Error('boom');
      return { rows: [] };
    });
    const res = await GET(req(ADMIN_PW));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Database error' });
  });
});
