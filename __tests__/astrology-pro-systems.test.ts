/**
 * ASTRO-PRO-SYSTEMS-01 — Vedic, Chinese and Mayan views of a Pro chart:
 * the route's access and input refusals, agreement with the Free calculators,
 * and that no birth detail is returned. The chart is fictional.
 */
import { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { proMemberAllowed, proPreviewEnabled } from '@/lib/astrology/proAccess';
import { calculateMayanBirthSign } from '@/lib/astrology/mayanAstrology';
import { getChineseZodiacAnimal } from '@/lib/astrology/chineseAstrology';
import { POST } from '../app/api/astrology/pro/systems/route';
import { POST as FREE_VEDIC } from '../app/api/astrology/vedic/list/route';

jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(),
  getMemberIdFromSessionToken: jest.fn(),
}));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/astrology/proAccess', () => ({ proPreviewEnabled: jest.fn(), proMemberAllowed: jest.fn() }));

const A = '11111111-1111-4111-8111-111111111111';
const CHART = '33333333-3333-4333-8333-333333333333';
// Fictional chart: 15 June 1990, 14:30, New York.
const ROW = { birth_date: '1990-06-15', birth_time: '14:30:00', latitude: 40.7128, longitude: -74.006, timezone: 'America/New_York' };

const req = (body: unknown, url = 'https://soullab.life/api/astrology/pro/systems') => new NextRequest(url, {
  method: 'POST',
  headers: { host: 'soullab.life', origin: 'https://soullab.life', 'sec-fetch-site': 'same-origin', 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

describe('Pro other-systems route', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(proPreviewEnabled).mockReturnValue(true);
    jest.mocked(proMemberAllowed).mockResolvedValue(true);
    jest.mocked(getMemberIdFromRequest).mockResolvedValue(A);
  });

  it('is unavailable when the Pro preview is off', async () => {
    jest.mocked(proPreviewEnabled).mockReturnValue(false);
    expect((await POST(req({ subject: 'own' }))).status).toBe(404);
    expect(query).not.toHaveBeenCalled();
  });

  it('refuses members without Pro access before reading birth data', async () => {
    jest.mocked(proMemberAllowed).mockResolvedValue(false);
    expect((await POST(req({ subject: CHART }))).status).toBe(403);
    expect(query).not.toHaveBeenCalled();
  });

  it('refuses signed-out requests', async () => {
    jest.mocked(getMemberIdFromRequest).mockResolvedValue(null);
    expect((await POST(req({ subject: 'own' }))).status).toBe(401);
    expect(query).not.toHaveBeenCalled();
  });

  it('refuses unknown fields, a browser-sent birth date and unsupported ayanamsas', async () => {
    expect((await POST(req({ subject: 'own', birthDate: '1990-06-15' }))).status).toBe(400);
    expect((await POST(req({ subject: 'own', memberId: A }))).status).toBe(400);
    expect((await POST(req({ subject: 'own', ayanamsa: 'fagan' }))).status).toBe(400);
    expect((await POST(req({ subject: 'not-a-chart' }))).status).toBe(400);
    expect(query).not.toHaveBeenCalled();
  });

  it('reads a saved chart only for its owner', async () => {
    jest.mocked(query).mockResolvedValue({ rows: [] } as never);
    const res = await POST(req({ subject: CHART }));
    expect(res.status).toBe(404);
    expect(jest.mocked(query).mock.calls[0][1]).toEqual([CHART, A]);
  });

  it('requires astrology consent for the member’s own chart', async () => {
    jest.mocked(query).mockResolvedValue({ rows: [{ astrology_consent: 'declined' }] } as never);
    expect((await POST(req({ subject: 'own' }))).status).toBe(403);
  });

  it('returns the three systems for a saved chart, matching the Free calculators, without birth details', async () => {
    jest.mocked(query).mockResolvedValue({ rows: [ROW] } as never);
    const res = await POST(req({ subject: CHART, ayanamsa: 'lahiri' }));
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('private, no-store');
    const text = await res.text();
    // No birth time (local 14:30 = 18:30 UTC), place or timezone; the birth
    // date appears only as the first dasha boundary, kept to the day.
    expect(text).not.toContain('14:30');
    expect(text).not.toContain('18:30');
    expect(text).not.toContain('-74.006');
    expect(text).not.toContain('40.7128');
    expect(text).not.toContain('America/New_York');
    const { data } = JSON.parse(text);

    // Vedic: same chart as the Free Vedic route for the same birth.
    const free = await FREE_VEDIC(new NextRequest('https://soullab.life/api/astrology/vedic/list', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        date: '1990-06-15', time: '14:30', ayanamsa: 'lahiri', includeDasha: true,
        location: { lat: 40.7128, lng: -74.006, timezone: 'America/New_York' },
      }),
    }));
    const freeBody = await free.json();
    expect(freeBody.success).toBe(true);
    expect(data.vedic.lagna.rashi).toBe(freeBody.data.ascendantSign.name);
    expect(data.vedic.birthNakshatra.name).toBe(freeBody.data.birthNakshatra.name);
    const moon = data.vedic.grahas.find((g: { graha: string }) => g.graha === 'Chandra');
    expect(moon.rashi).toBe(freeBody.data.chart.grahas.Chandra.rashi.name);
    expect(data.vedic.grahas).toHaveLength(9);
    expect(data.vedic.dasha.mahadashas[0].startDate).toBe('1990-06-15T00:00:00.000Z');
    expect(data.vedic.dasha.mahadashas[0].ruler).toBe(freeBody.data.dasha.mahadashas[0].ruler);

    // Chinese year sign and Mayan kin: same as the Free pages' calculators.
    expect(data.chinese.animal).toBe(getChineseZodiacAnimal(1990).name);
    expect(data.chinese.animal).toBe('Horse');
    expect(data.mayan.galacticSignature).toBe(calculateMayanBirthSign(new Date('1990-06-15T12:00:00.000Z')).galacticSignature);
  });

  it('changes the sidereal positions when the ayanamsa changes', async () => {
    jest.mocked(query).mockResolvedValue({ rows: [ROW] } as never);
    const lahiri = (await (await POST(req({ subject: CHART, ayanamsa: 'lahiri' }))).json()).data.vedic;
    const kp = (await (await POST(req({ subject: CHART, ayanamsa: 'krishnamurti' }))).json()).data.vedic;
    expect(kp.ayanamsaValue).not.toBe(lahiri.ayanamsaValue);
  });
});
