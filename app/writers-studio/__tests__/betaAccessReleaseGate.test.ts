/**
 * Beta access release matrix — entirely synthetic, no member/production writes.
 * Covers the server authority used by the Writer's Studio opt-in pilot.
 */
import { NextRequest } from 'next/server';

const memberIdentity = jest.fn();
const databaseQuery = jest.fn();

jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: (...args: unknown[]) => memberIdentity(...args),
}));
jest.mock('@/lib/db/postgres', () => ({
  query: (...args: unknown[]) => databaseQuery(...args),
}));

import { GET } from '@/app/api/sovereign/writers-studio/beta-access/route';

const request = () => new NextRequest('http://localhost:3762/api/sovereign/writers-studio/beta-access');

beforeEach(() => {
  jest.clearAllMocks();
  memberIdentity.mockResolvedValue('test-member');
  databaseQuery.mockResolvedValue({ rows: [{ beta: false, founder: false }] });
});

describe('Writer’s Studio beta server admission', () => {
  it('refuses signed-out requests before any DB lookup', async () => {
    memberIdentity.mockResolvedValue(null);
    const response = await GET(request());
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'unauthenticated' });
    expect(databaseQuery).not.toHaveBeenCalled();
  });

  it('refuses ordinary authenticated members who have no active linked pilot record', async () => {
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ eligible: false, basis: 'not_in_pilot' });
  });

  it('admits only the active linked beta tester signal', async () => {
    databaseQuery.mockResolvedValue({ rows: [{ beta: true, founder: false }] });
    const response = await GET(request());
    expect(await response.json()).toEqual({ eligible: true, basis: 'active_beta_tester' });
  });

  it('retains founder witness authority distinct from tester admission', async () => {
    databaseQuery.mockResolvedValue({ rows: [{ beta: false, founder: true }] });
    const response = await GET(request());
    expect(await response.json()).toEqual({ eligible: true, basis: 'founder_witness' });
  });

  it('refuses a missing row rather than inferring admission from the query flag', async () => {
    databaseQuery.mockResolvedValue({ rows: [] });
    const response = await GET(request());
    expect(await response.json()).toEqual({ eligible: false, basis: 'not_in_pilot' });
  });

  it('uses exact member identity, active state, and live nondeleted contact constraints', async () => {
    await GET(request());
    expect(databaseQuery).toHaveBeenCalledTimes(1);
    const [sql, args] = databaseQuery.mock.calls[0] as [string, unknown[]];
    expect(args).toEqual(['test-member']);
    expect(sql).toContain('c.member_id = $1');
    expect(sql).toContain("c.contact_type = 'beta_tester'");
    expect(sql).toContain("c.pipeline_stage = 'active'");
    expect(sql).toContain('c.deleted_at IS NULL');
    expect(sql).toContain("m.admin_role IN ('founder','cto')");
  });
});
