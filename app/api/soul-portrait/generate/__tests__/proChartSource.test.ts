/**
 * Soul Portrait from a Pro chart (founder ruling 2026-11-05): the request names
 * the chart, the server reads its birth details, and the Pro calculator draws
 * it. Only a Pro member may ask, and only for their own chart or saved charts.
 */
import { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { proMemberAllowed, proPreviewEnabled } from '@/lib/astrology/proAccess';
import { generateSoulPortrait } from '@/lib/soulPortrait/generator/generatePortrait';
import { createDraftPortrait } from '@/lib/soulPortrait/portraitStore';
import { POST } from '../route';

jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/astrology/proAccess', () => ({
  proPreviewEnabled: jest.fn(() => true),
  proMemberAllowed: jest.fn(),
}));
jest.mock('@/lib/soulPortrait/generator/generatePortrait', () => ({ generateSoulPortrait: jest.fn() }));
jest.mock('@/lib/soulPortrait/portraitStore', () => ({ createDraftPortrait: jest.fn() }));
jest.mock('@/lib/soulPortrait/subjectScope', () => ({ subjectIsInColab: jest.fn() }));
jest.mock('@/lib/team/colabTeams', () => ({ resolveCurrentTeamId: jest.fn(), COLAB_TEAM_COOKIE: 'c' }));
jest.mock('next/headers', () => ({ cookies: jest.fn(async () => ({ get: () => undefined })) }));

const A = '11111111-1111-4111-8111-111111111111';
const CHART = '33333333-3333-4333-8333-333333333333';
const identity = jest.mocked(getMemberIdFromRequest);
const sql = jest.mocked(query);
const allowed = jest.mocked(proMemberAllowed);
const enabled = jest.mocked(proPreviewEnabled);
const generate = jest.mocked(generateSoulPortrait);
const store = jest.mocked(createDraftPortrait);

function post(body: unknown) {
  return POST(new NextRequest('http://localhost/api/soul-portrait/generate', {
    method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' },
  }));
}

beforeEach(() => {
  jest.resetAllMocks();
  identity.mockResolvedValue(A);
  enabled.mockReturnValue(true);
  allowed.mockResolvedValue(true);
  generate.mockResolvedValue({
    portrait: { person: { slug: 'sam-1' } } as never,
    provenance: { provider: 'claude', model: 'm' },
  });
  store.mockResolvedValue({ id: 'p1', slug: 'sam-1' } as never);
});

describe('Soul Portrait from a Pro chart', () => {
  it('reads a saved chart on the server, owned by the caller, and uses the Pro calculator', async () => {
    sql.mockResolvedValueOnce({ rows: [{
      birth_date: '1990-06-15', birth_time: '14:30:00', latitude: '40.7128', longitude: '-74.006', timezone: 'America/New_York',
    }] } as never);
    const res = await post({
      name: 'Sam', proChartSource: CHART,
      // A browser-supplied birth record is ignored when a Pro chart is named.
      birthData: { date: '2000-01-01', time: '00:00', location: { lat: 0, lng: 0, timezone: 'UTC' } },
    });
    expect(res.status).toBe(201);
    expect(sql.mock.calls[0][1]).toEqual([CHART, A]);
    const input = generate.mock.calls[0][0];
    expect(input.calculator).toBe('pro');
    expect(input.birthData.date).toBe('1990-06-15');
    expect(input.birthData.location.lat).toBeCloseTo(40.7128);
  });

  it('refuses a saved chart the caller does not own', async () => {
    sql.mockResolvedValueOnce({ rows: [] } as never);
    const res = await post({ name: 'Sam', proChartSource: CHART });
    expect(res.status).toBe(404);
    expect(generate).not.toHaveBeenCalled();
  });

  it('refuses anyone without Pro access, before reading any chart', async () => {
    allowed.mockResolvedValue(false);
    const res = await post({ name: 'Sam', proChartSource: CHART });
    expect(res.status).toBe(403);
    expect(sql).not.toHaveBeenCalled();
    expect(generate).not.toHaveBeenCalled();
  });

  it('reads your own chart only while astrology consent is opted in', async () => {
    sql.mockResolvedValueOnce({ rows: [{
      birth_date: '1990-06-15', birth_time: '14:30:00', birth_location_lat: '40.7128',
      birth_location_lng: '-74.006', birth_timezone: 'America/New_York', astrology_consent: 'not_set',
    }] } as never);
    const res = await post({ name: 'Me', proChartSource: 'mine' });
    expect(res.status).toBe(403);
    expect(generate).not.toHaveBeenCalled();
  });

  it('rejects a chart reference that is neither "mine" nor a saved-chart id', async () => {
    const res = await post({ name: 'Sam', proChartSource: '../etc' });
    expect(res.status).toBe(400);
    expect(sql).not.toHaveBeenCalled();
  });

  it('leaves ordinary portraits on the standard calculator', async () => {
    const res = await post({
      name: 'Sam', birthData: { date: '1990-06-15', time: '14:30', location: { lat: 40.7, lng: -74, timezone: 'America/New_York' } },
    });
    expect(res.status).toBe(201);
    expect(generate.mock.calls[0][0].calculator).toBe('standard');
    expect(allowed).not.toHaveBeenCalled();
  });
});
