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
import { GET, POST, PATCH, DELETE } from '../[id]/share/route';
import { GET as SKY } from '@/app/api/shared-chart/[token]/sky/route';

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

  it('includes the Elemental Alchemy overview only when the owner chooses it', async () => {
    sql.mockResolvedValue({ rows: [{ id: 's1', token: 'x', created_at: '2026-11-05T00:00:00Z', include_elemental: false }] } as never);
    await POST(req('POST', { consentAttested: true }), params);
    expect((sql.mock.calls[0] as [string, unknown[]])[1][3]).toBe(false);
    sql.mockClear();
    await POST(req('POST', { consentAttested: true, includeElemental: true }), params);
    expect((sql.mock.calls[0] as [string, unknown[]])[1][3]).toBe(true);
  });

  it('lets the owner switch the overview on a live link, and nothing else', async () => {
    expect((await PATCH(req('PATCH', { includeElemental: 'yes' }), params)).status).toBe(400);
    sql.mockResolvedValueOnce({ rows: [{ id: 's1', token: 'x', created_at: '2026-11-05T00:00:00Z', include_elemental: true }] } as never);
    const res = await PATCH(req('PATCH', { includeElemental: true }), params);
    expect(res.status).toBe(200);
    expect((await res.json()).share.includeElemental).toBe(true);
    const [text, values] = sql.mock.calls[0] as [string, unknown[]];
    expect(text).toContain('revoked_at IS NULL');
    expect(values).toEqual([A, CHART, true]);
  });

  it('gives a client the sky only through a live link', async () => {
    const at = encodeURIComponent('2026-11-05T12:00:00Z');
    const token = 'A'.repeat(43);
    sql.mockResolvedValueOnce({ rows: [] } as never); // link turned off or unknown
    const dead = await SKY(new NextRequest(`http://localhost/api/shared-chart/${token}/sky?at=${at}`), { params: Promise.resolve({ token }) });
    expect(dead.status).toBe(404);
    sql.mockResolvedValueOnce({ rows: [{
      owner_member_id: A, label: 'X', place_label: null, birth_date: '1990-06-15', birth_time: '14:30:00',
      latitude: 40.7, longitude: -74, timezone: 'America/New_York', include_elemental: false,
    }] } as never);
    const live = await SKY(new NextRequest(`http://localhost/api/shared-chart/${token}/sky?at=${at}`), { params: Promise.resolve({ token }) });
    expect(live.status).toBe(200);
    const body = await live.json();
    expect(body.positions.sun).toBeDefined();
    expect(JSON.stringify(body)).not.toContain('1990-06-15');
  });
});

