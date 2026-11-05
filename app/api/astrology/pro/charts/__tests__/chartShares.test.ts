/**
 * ASTRO-PRO-CHART-SHARE-01 — a private client link for a saved chart. Only the
 * chart's owner may make or turn off a link; making one needs the owner's
 * confirmation that the person agreed; a turned-off link reads nothing.
 */
import { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { proMemberAllowed, proPreviewEnabled } from '@/lib/astrology/proAccess';
import { proChartWriteOriginAllowed } from '@/lib/astrology/proRequestGuard';
import { isShareToken, readSharedChartBirth, sharePath } from '@/lib/astrology/proChartShares';
import { GET, POST, DELETE } from '../[id]/share/route';

jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(),
  getMemberIdFromSessionToken: jest.fn(),
}));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/astrology/proAccess', () => ({
  proPreviewEnabled: jest.fn(() => true),
  proMemberAllowed: jest.fn(),
}));
jest.mock('@/lib/astrology/proRequestGuard', () => ({ proChartWriteOriginAllowed: jest.fn() }));

const A = '11111111-1111-4111-8111-111111111111';
const CHART = '33333333-3333-4333-8333-333333333333';
const identity = jest.mocked(getMemberIdFromRequest);
const sql = jest.mocked(query);
const allowed = jest.mocked(proMemberAllowed);
const enabled = jest.mocked(proPreviewEnabled);
const params = { params: Promise.resolve({ id: CHART }) };

function req(method: string, body?: unknown) {
  return new NextRequest(`http://localhost/api/astrology/pro/charts/${CHART}/share`, {
    method, body: body === undefined ? undefined : JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

beforeEach(() => {
  jest.resetAllMocks();
  identity.mockResolvedValue(A);
  enabled.mockReturnValue(true);
  allowed.mockResolvedValue(true);
  jest.mocked(proChartWriteOriginAllowed).mockResolvedValue(true);
});

describe('Pro chart share links', () => {
  it('refuses to make a link without the consent confirmation', async () => {
    const res = await POST(req('POST', {}), params);
    expect(res.status).toBe(400);
    expect(sql).not.toHaveBeenCalled();
  });

  it('makes a link only for a chart the caller owns, with an unguessable token', async () => {
    sql.mockResolvedValueOnce({ rows: [{ id: 's1', token: 'x', created_at: '2026-11-05T00:00:00Z' }] } as never);
    const res = await POST(req('POST', { consentAttested: true }), params);
    expect(res.status).toBe(201);
    const [text, values] = sql.mock.calls[0] as [string, unknown[]];
    expect(text).toContain('c.owner_member_id = $2');
    expect(values[1]).toBe(A);
    expect(values[2]).toBe(CHART);
    expect(isShareToken(values[0])).toBe(true);
  });

  it('reports a chart the caller does not own as not found', async () => {
    sql.mockResolvedValueOnce({ rows: [] } as never) // insert finds no owned chart
      .mockResolvedValueOnce({ rows: [] } as never); // no live link either
    const res = await POST(req('POST', { consentAttested: true }), params);
    expect(res.status).toBe(404);
  });

  it('refuses everyone without Pro access', async () => {
    allowed.mockResolvedValue(false);
    expect((await POST(req('POST', { consentAttested: true }), params)).status).toBe(403);
    expect((await GET(req('GET'), params)).status).toBe(403);
    expect((await DELETE(req('DELETE'), params)).status).toBe(403);
    expect(sql).not.toHaveBeenCalled();
  });

  it('turns the live link off for the owner', async () => {
    sql.mockResolvedValueOnce({ rows: [{ exists: true }], rowCount: 1 } as never)
      .mockResolvedValueOnce({ rows: [], rowCount: 1 } as never);
    const res = await DELETE(req('DELETE'), params);
    expect(res.status).toBe(200);
    const [text, values] = sql.mock.calls[1] as [string, unknown[]];
    expect(text).toContain('SET revoked_at = now()');
    expect(values).toEqual([A, CHART]);
  });

  it('reads a shared chart only through a live link', async () => {
    expect(await readSharedChartBirth('not-a-token')).toBeNull();
    expect(sql).not.toHaveBeenCalled();
    sql.mockResolvedValueOnce({ rows: [] } as never);
    expect(await readSharedChartBirth('A'.repeat(43))).toBeNull();
    expect((sql.mock.calls[0] as [string])[0]).toContain('s.revoked_at IS NULL');
  });

  it('builds links outside the member astrology shell', () => {
    expect(sharePath('A'.repeat(43))).toBe(`/shared-chart/${'A'.repeat(43)}`);
  });
});
