/**
 * ASTRO-PRO-SAVED-CHARTS-01 — saved charts belong only to the verified Pro
 * member, require a permission attestation, and are never released to
 * anyone outside Pro access.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { proMemberAllowed, proPreviewEnabled } from '@/lib/astrology/proAccess';
import { validateSavedChartInput } from '@/lib/astrology/proSavedCharts';
import { GET as LIST, POST as SAVE } from '../route';
import { GET as VERIFY, DELETE as REMOVE, POST as CALCULATE } from '../[id]/route';

jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(),
  getMemberIdFromSessionToken: jest.fn(),
}));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/astrology/proAccess', () => ({
  proPreviewEnabled: jest.fn(() => true),
  proMemberAllowed: jest.fn(),
}));

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const CHART = '33333333-3333-4333-8333-333333333333';
const identity = jest.mocked(getMemberIdFromRequest);
const sql = jest.mocked(query);
const allowed = jest.mocked(proMemberAllowed);
const enabled = jest.mocked(proPreviewEnabled);

const valid = {
  label: 'Sam', birthDate: '1990-06-15', birthTime: '14:30',
  latitude: 40.7128, longitude: -74.006, timezone: 'America/New_York',
  placeLabel: 'New York', permissionAttested: true,
};

function req(url: string, init?: { method?: string; body?: unknown }) {
  return new NextRequest('https://soullab.life' + url, {
    method: init?.method ?? 'GET',
    headers: { host: 'soullab.life', origin: 'https://soullab.life', 'sec-fetch-site': 'same-origin', 'content-type': 'application/json' },
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
  });
}
const params = (id: string) => ({ params: Promise.resolve({ id }) });

describe('Pro saved charts — input', () => {
  it('accepts a complete, calculable chart with permission', () => {
    expect(validateSavedChartInput(valid)).toMatchObject({ ok: true });
  });
  it('refuses without the permission attestation', () => {
    expect(validateSavedChartInput({ ...valid, permissionAttested: false })).toEqual({ ok: false, error: 'permission_attestation_required' });
  });
  it('refuses a browser-supplied owner or any unknown field', () => {
    expect(validateSavedChartInput({ ...valid, ownerMemberId: B })).toEqual({ ok: false, error: 'unexpected_field' });
  });
  it('refuses an empty name and an invalid timezone', () => {
    expect(validateSavedChartInput({ ...valid, label: '  ' })).toEqual({ ok: false, error: 'label_invalid' });
    expect(validateSavedChartInput({ ...valid, timezone: 'Not/AZone' })).toMatchObject({ ok: false });
  });
});

describe('Pro saved charts — ownership', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    enabled.mockReturnValue(true);
    allowed.mockResolvedValue(true);
  });

  it('refuses a signed-out request before any database access', async () => {
    identity.mockResolvedValue(null);
    expect((await LIST(req('/api/astrology/pro/charts'))).status).toBe(401);
    expect(sql).not.toHaveBeenCalled();
  });

  it('refuses a member without Pro access before any database access', async () => {
    identity.mockResolvedValue(B);
    allowed.mockResolvedValue(false);
    expect((await LIST(req('/api/astrology/pro/charts'))).status).toBe(403);
    expect((await SAVE(req('/api/astrology/pro/charts', { method: 'POST', body: valid }))).status).toBe(403);
    expect(sql).not.toHaveBeenCalled();
  });

  it('lists and saves only under the verified member', async () => {
    identity.mockResolvedValue(A);
    sql.mockResolvedValue({ rows: [] } as never);
    await LIST(req('/api/astrology/pro/charts'));
    expect(sql.mock.calls[0][1]).toEqual([A]);
    sql.mockResolvedValue({ rows: [{ id: CHART, label: 'Sam', birth_date: '1990-06-15', birth_time: '14:30:00', place_label: null, created_at: 'x' }] } as never);
    const res = await SAVE(req('/api/astrology/pro/charts', { method: 'POST', body: valid }));
    expect(res.status).toBe(201);
    const insert = sql.mock.calls.at(-1)!;
    expect(insert[0]).toMatch(/INSERT INTO astrology_pro_saved_charts/);
    expect(insert[1]![0]).toBe(A);
  });

  it('treats another member’s chart exactly as a missing chart', async () => {
    identity.mockResolvedValue(B);
    sql.mockResolvedValue({ rows: [] } as never);
    expect((await VERIFY(req('/api/astrology/pro/charts/' + CHART), params(CHART))).status).toBe(404);
    expect((await REMOVE(req('/api/astrology/pro/charts/' + CHART, { method: 'DELETE' }), params(CHART))).status).toBe(404);
    expect((await CALCULATE(req('/api/astrology/pro/charts/' + CHART, { method: 'POST', body: {} }), params(CHART))).status).toBe(404);
    for (const call of sql.mock.calls) {
      expect(call[0]).toMatch(/owner_member_id = \$2/);
      expect(call[1]).toEqual([CHART, B]);
    }
  });

  it('refuses a cross-site write', async () => {
    identity.mockResolvedValue(A);
    const res = await SAVE(new NextRequest('https://soullab.life/api/astrology/pro/charts', {
      method: 'POST', headers: { 'sec-fetch-site': 'cross-site', 'content-type': 'application/json' }, body: JSON.stringify(valid),
    }));
    expect(res.status).toBe(403);
    expect(sql).not.toHaveBeenCalled();
  });
});

describe('Pro saved charts — storage', () => {
  it('cascades with the owner, stores no computed chart or notes, and is hard-deleted', () => {
    const migration = readFileSync(path.join(__dirname, '../../../../../../database/migrations/20261104000001_astrology_pro_saved_charts.sql'), 'utf8');
    expect(migration).toMatch(/REFERENCES members\(id\) ON DELETE CASCADE/);
    expect(migration).toMatch(/permission_attested_at timestamptz NOT NULL/);
    expect(migration).not.toMatch(/\b(result|chart_data|notes?|interpretation)\b\s+(jsonb|text)/i);
    expect(migration).toMatch(/SET LOCAL lock_timeout/);
  });
});
