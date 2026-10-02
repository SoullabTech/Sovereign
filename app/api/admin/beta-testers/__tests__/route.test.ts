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
