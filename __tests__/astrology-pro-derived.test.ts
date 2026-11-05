/**
 * ASTRO-PRO-DERIVED-01 — progression and return moments, and the route's
 * ownership and input refusals.
 */
import { NextRequest } from 'next/server';
import {
  findReturn, geocentricLongitude, secondaryProgressionInstant, utcParts,
} from '../lib/astrology/proDerivedMoments';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { proMemberAllowed, proPreviewEnabled } from '@/lib/astrology/proAccess';
import { POST } from '../app/api/astrology/pro/derived/route';

jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(),
  getMemberIdFromSessionToken: jest.fn(),
}));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/astrology/proAccess', () => ({ proPreviewEnabled: jest.fn(), proMemberAllowed: jest.fn() }));

const A = '11111111-1111-4111-8111-111111111111';
const CHART = '33333333-3333-4333-8333-333333333333';
const birth = new Date('1990-06-15T18:30:00Z');

function angleDiff(a: number, b: number) {
  const d = Math.abs(((a - b) % 360 + 360) % 360);
  return Math.min(d, 360 - d);
}

describe('progression and return moments', () => {
  it('progresses one day per year of life', () => {
    const p = secondaryProgressionInstant(birth, new Date('2026-06-15T18:30:00Z'));
    const days = (p.getTime() - birth.getTime()) / 86_400_000;
    expect(days).toBeCloseTo(36, 1);
  });

  it('finds a solar return on the birthday, exact to the arc-second', () => {
    const natal = geocentricLongitude('Sun', birth);
    const r = findReturn('Sun', natal, new Date('2026-01-01T00:00:00Z'))!;
    expect(r.toISOString().slice(0, 7)).toBe('2026-06');
    expect(angleDiff(geocentricLongitude('Sun', r), natal)).toBeLessThan(0.001);
  });

  it('finds the next lunar return within a month', () => {
    const natal = geocentricLongitude('Moon', birth);
    const from = new Date('2026-11-04T00:00:00Z');
    const r = findReturn('Moon', natal, from)!;
    expect(r.getTime() - from.getTime()).toBeLessThan(28 * 86_400_000);
    expect(angleDiff(geocentricLongitude('Moon', r), natal)).toBeLessThan(0.001);
  });

  it('finds the first Saturn return of a 1990 birth in early 2020', () => {
    const natal = geocentricLongitude('Saturn', birth);
    expect(findReturn('Saturn', natal, new Date('2018-01-01T00:00:00Z'))!.getUTCFullYear()).toBe(2020);
  });

  it('formats a UTC minute for casting', () => {
    expect(utcParts(new Date('2026-06-15T11:23:51Z'))).toEqual({ date: '2026-06-15', time: '11:24' });
  });
});

describe('Pro derived route', () => {
  const req = (body: unknown) => new NextRequest('https://soullab.life/api/astrology/pro/derived', {
    method: 'POST',
    headers: { host: 'soullab.life', origin: 'https://soullab.life', 'sec-fetch-site': 'same-origin', 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(proPreviewEnabled).mockReturnValue(true);
    jest.mocked(proMemberAllowed).mockResolvedValue(true);
    jest.mocked(getMemberIdFromRequest).mockResolvedValue(A);
  });

  it('refuses members without Pro access before reading birth data', async () => {
    jest.mocked(proMemberAllowed).mockResolvedValue(false);
    expect((await POST(req({ subject: 'own', kind: 'progressed', at: '2026-01-01T00:00:00Z' }))).status).toBe(403);
    expect(query).not.toHaveBeenCalled();
  });

  it('refuses unknown fields, kinds and bodies before reading birth data', async () => {
    expect((await POST(req({ subject: 'own', kind: 'progressed', at: '2026-01-01T00:00:00Z', memberId: A }))).status).toBe(400);
    expect((await POST(req({ subject: 'own', kind: 'solar-arc', at: '2026-01-01T00:00:00Z' }))).status).toBe(400);
    expect((await POST(req({ subject: 'own', kind: 'return', body: 'Pluto', at: '2026-01-01T00:00:00Z' }))).status).toBe(400);
    expect(query).not.toHaveBeenCalled();
  });

  it('reads a saved chart only for its owner', async () => {
    jest.mocked(query).mockResolvedValue({ rows: [] } as never);
    const res = await POST(req({ subject: CHART, kind: 'progressed', at: '2026-01-01T00:00:00Z' }));
    expect(res.status).toBe(404);
    expect(jest.mocked(query).mock.calls[0][1]).toEqual([CHART, A]);
  });

  it('requires astrology consent for the member’s own chart', async () => {
    jest.mocked(query).mockResolvedValue({ rows: [{ astrology_consent: 'declined' }] } as never);
    expect((await POST(req({ subject: 'own', kind: 'progressed', at: '2026-01-01T00:00:00Z' }))).status).toBe(403);
  });

  it('returns a progressed chart for a saved chart', async () => {
    jest.mocked(query).mockResolvedValue({ rows: [{
      birth_date: '1990-06-15', birth_time: '14:30:00', latitude: 40.7128, longitude: -74.006, timezone: 'America/New_York',
    }] } as never);
    const res = await POST(req({ subject: CHART, kind: 'progressed', at: '2026-06-15T12:00:00Z' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.kind).toBe('progressed');
    expect(body.instant.slice(0, 10)).toBe('1990-07-21');
    expect(body.data.sun.sign).toBe('Cancer');
  });
});
