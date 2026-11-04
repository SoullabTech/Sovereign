/**
 * ASTRO-PRO-ASTROMAP-01 — map lines checked against the actual sky, and the
 * place route's ownership and input refusals.
 */
import * as Astronomy from 'astronomy-engine';
import { NextRequest } from 'next/server';
import { astroMapInput, astroMapLines } from '../lib/astrology/proAstroMap';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { proMemberAllowed, proPreviewEnabled } from '@/lib/astrology/proAccess';
import { POST } from '../app/api/astrology/pro/place/route';
import { calculateBirthChart } from '../lib/astrology/proEphemerisCalculator';

jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn(), getMemberIdFromSessionToken: jest.fn() }));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/astrology/proAccess', () => ({ proPreviewEnabled: jest.fn(), proMemberAllowed: jest.fn() }));

const A = '11111111-1111-4111-8111-111111111111';
const CHART = '33333333-3333-4333-8333-333333333333';
const utc = '1990-06-15T18:30:00Z';
const time = Astronomy.MakeTime(new Date(utc));

function horizon(body: 'Venus' | 'Mars', lat: number, lng: number) {
  const observer = new Astronomy.Observer(lat, lng, 0);
  const eq = Astronomy.Equator(Astronomy.Body[body], time, observer, true, true);
  return Astronomy.Horizon(time, observer, eq.ra, eq.dec);
}

describe('astro map lines', () => {
  const lines = astroMapLines(astroMapInput(utc));

  it('puts the body on the meridian along its MC line', () => {
    const mc = lines.find((l) => l.body === 'Mars' && l.angle === 'MC')!;
    const lng = mc.points[0]![0];
    const observer = new Astronomy.Observer(35, lng, 0);
    const hourAngle = Astronomy.HourAngle(Astronomy.Body.Mars, time, observer);
    expect(Math.min(hourAngle, 24 - hourAngle)).toBeLessThan(0.01); // hours
  });

  it('puts the body on the horizon along its Ascendant line, rising in the east', () => {
    const asc = lines.find((l) => l.body === 'Venus' && l.angle === 'ASC')!;
    const sample = asc.points.find((p) => p && p[1] === 40)!;
    const h = horizon('Venus', sample[1], sample[0]);
    expect(Math.abs(h.altitude)).toBeLessThan(0.1);
    expect(h.azimuth).toBeLessThan(180);
    const dsc = lines.find((l) => l.body === 'Venus' && l.angle === 'DSC')!;
    const s2 = dsc.points.find((p) => p && p[1] === 40)!;
    const h2 = horizon('Venus', s2[1], s2[0]);
    expect(Math.abs(h2.altitude)).toBeLessThan(0.1);
    expect(h2.azimuth).toBeGreaterThan(180);
  });
});

describe('Pro place route', () => {
  const req = (body: unknown) => new NextRequest('https://soullab.life/api/astrology/pro/place', {
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

  it('refuses bad locations and unknown fields before reading birth data', async () => {
    expect((await POST(req({ subject: CHART, lat: 95, lng: 0 }))).status).toBe(400);
    expect((await POST(req({ subject: CHART, lat: 10 }))).status).toBe(400);
    expect((await POST(req({ subject: CHART, memberId: A }))).status).toBe(400);
    expect(query).not.toHaveBeenCalled();
  });

  it('reads a saved chart only for its owner', async () => {
    jest.mocked(query).mockResolvedValue({ rows: [] } as never);
    expect((await POST(req({ subject: CHART }))).status).toBe(404);
    expect(jest.mocked(query).mock.calls[0][1]).toEqual([CHART, A]);
  });

  it('returns the map and a relocated chart for the same moment', async () => {
    jest.mocked(query).mockResolvedValue({ rows: [{
      birth_date: '1990-06-15', birth_time: '14:30:00', latitude: 40.7128, longitude: -74.006, timezone: 'America/New_York',
    }] } as never);
    const res = await POST(req({ subject: CHART, lat: 51.5, lng: -0.13 }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.map.bodies).toHaveLength(10);
    // Same moment: planets match the natal chart; the place moves the angles.
    const natal = await calculateBirthChart({
      date: '1990-06-15', time: '14:30', location: { lat: 40.7128, lng: -74.006, timezone: 'America/New_York' }, houseSystem: 'porphyry',
    });
    expect(body.relocated.data.sun.sign).toBe(natal.sun.sign);
    expect(body.relocated.data.sun.degree).toBeCloseTo(natal.sun.degree, 1);
    expect(body.relocated.data.ascendant).not.toEqual(natal.ascendant);
  });
});
