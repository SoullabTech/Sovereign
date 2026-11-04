/**
 * ASTRO-PRO-EPHEMERIS-01 — sampled longitudes, exact transit hits and the
 * Pro ephemeris route's limits.
 */
import * as Astronomy from 'astronomy-engine';
import { NextRequest } from 'next/server';
import { ephemerisSeries, longitudeOf, transitHits } from '../lib/astrology/proEphemerisSeries';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { proMemberAllowed, proPreviewEnabled } from '@/lib/astrology/proAccess';
import { GET } from '../app/api/astrology/pro/ephemeris/route';

jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn(), getMemberIdFromSessionToken: jest.fn() }));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/astrology/proAccess', () => ({ proPreviewEnabled: jest.fn(), proMemberAllowed: jest.fn() }));

describe('ephemeris series', () => {
  it('samples every step and refuses oversized ranges', () => {
    const s = ephemerisSeries(new Date('2026-01-01T00:00:00Z'), new Date('2026-01-31T00:00:00Z'), 24)!;
    expect(s.longitudes.Sun).toHaveLength(31);
    expect(ephemerisSeries(new Date('2026-01-01T00:00:00Z'), new Date('2030-01-01T00:00:00Z'), 24)).toBeNull();
    expect(ephemerisSeries(new Date('2026-01-01T00:00:00Z'), new Date('2026-12-31T00:00:00Z'), 1)).toBeNull();
  });

  it('finds the Sun crossing a natal point on the right day, to within hours', () => {
    const s = ephemerisSeries(new Date('2026-01-01T00:00:00Z'), new Date('2026-12-31T00:00:00Z'), 24)!;
    // A natal point at the exact solar longitude of 2026-06-15 12:00 UTC.
    const truth = new Date('2026-06-15T12:00:00Z');
    const natal = [{ name: 'Test', longitude: longitudeOf('Sun', Astronomy.MakeTime(truth)) }];
    const conj = transitHits(s, natal).filter((h) => h.transit === 'Sun' && h.type === 'conjunction');
    expect(conj).toHaveLength(1);
    expect(Math.abs(new Date(conj[0].at).getTime() - truth.getTime())).toBeLessThan(2 * 3_600_000);
  });

  it('reports each pass of a retrograde planet, marking the retrograde one', () => {
    // Mercury stations retrograde several times a year; a point in a
    // retrograde zone is crossed three times.
    const s = ephemerisSeries(new Date('2026-01-01T00:00:00Z'), new Date('2026-12-31T00:00:00Z'), 12)!;
    const lons = s.longitudes.Mercury;
    let station = -1;
    for (let i = 1; i < lons.length - 1 && station < 0; i++) {
      const d1 = ((lons[i] - lons[i - 1] + 540) % 360) - 180;
      const d2 = ((lons[i + 1] - lons[i] + 540) % 360) - 180;
      if (d1 > 0 && d2 < 0) station = i;
    }
    expect(station).toBeGreaterThan(0);
    const point = lons[station] - 2; // inside the retrograde arc
    const passes = transitHits(s, [{ name: 'P', longitude: point }]).filter((h) => h.transit === 'Mercury' && h.type === 'conjunction');
    expect(passes.length).toBeGreaterThanOrEqual(3);
    expect(passes.some((h) => h.retrograde)).toBe(true);
  });
});

describe('Pro ephemeris route', () => {
  const req = (q: string) => new NextRequest('https://soullab.life/api/astrology/pro/ephemeris' + q);
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(proPreviewEnabled).mockReturnValue(true);
    jest.mocked(proMemberAllowed).mockResolvedValue(true);
    jest.mocked(getMemberIdFromRequest).mockResolvedValue('11111111-1111-4111-8111-111111111111');
  });

  it('refuses without Pro access, with extra parameters, and over the limit', async () => {
    const ok = '?from=2026-01-01T00:00:00Z&to=2026-02-01T00:00:00Z&step=24';
    expect((await GET(req(ok))).status).toBe(200);
    expect((await GET(req(ok + '&memberId=x'))).status).toBe(400);
    expect((await GET(req('?from=2026-01-01T00:00:00Z&to=2031-01-01T00:00:00Z&step=24'))).status).toBe(422);
    jest.mocked(proMemberAllowed).mockResolvedValue(false);
    expect((await GET(req(ok))).status).toBe(403);
  });
});
