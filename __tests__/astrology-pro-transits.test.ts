/**
 * ASTRO-PRO-TRANSITS-01 — transit geometry and the Pro sky route.
 */
import { NextRequest } from 'next/server';
import { angularSeparation, transitBodies, transitMomentInRange, transitToNatalAspects } from '../lib/astrology/proTransits';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { proMemberAllowed, proPreviewEnabled } from '@/lib/astrology/proAccess';
import { GET } from '../app/api/astrology/pro/sky/route';

jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(),
  getMemberIdFromSessionToken: jest.fn(),
}));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/astrology/proAccess', () => ({ proPreviewEnabled: jest.fn(), proMemberAllowed: jest.fn() }));

const A = '11111111-1111-4111-8111-111111111111';
const pos = (sign: string, degree: number) => ({ sign, degree, house: 0, retrograde: false });

describe('transit geometry', () => {
  it('measures separation across 0° Aries', () => {
    expect(angularSeparation(359, 1)).toBe(2);
    expect(angularSeparation(10, 190)).toBe(180);
  });

  it('finds the aspect within orb and nothing outside it', () => {
    const t = transitBodies({ sun: pos('Aries', 10), moon: pos('Leo', 0) });
    const natal = [{ name: 'Sun' as const, longitude: 100 }]; // 10° Cancer
    const aspects = transitToNatalAspects(t, natal, 3);
    expect(aspects).toEqual([{ transit: 'Sun', natal: 'Sun', type: 'square', orb: 0 }]);
    expect(transitToNatalAspects(t, natal, 0.5).map((a) => a.transit)).toEqual(['Sun']);
    expect(transitToNatalAspects(transitBodies({ sun: pos('Aries', 25) }), natal, 3)).toEqual([]);
  });

  it('drops positions it cannot place', () => {
    expect(transitBodies({ sun: pos('Nowhere', 3), moon: pos('Leo', 31) })).toEqual([]);
  });

  it('bounds the accepted moments', () => {
    expect(transitMomentInRange(new Date('2027-08-03T12:00:00Z'))).toBe(true);
    expect(transitMomentInRange(new Date('1700-01-01T00:00:00Z'))).toBe(false);
    expect(transitMomentInRange(new Date('nope'))).toBe(false);
  });
});

describe('Pro sky route', () => {
  const req = (q: string) => new NextRequest('https://soullab.life/api/astrology/pro/sky' + q);
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(proPreviewEnabled).mockReturnValue(true);
    jest.mocked(proMemberAllowed).mockResolvedValue(true);
    jest.mocked(getMemberIdFromRequest).mockResolvedValue(A);
  });

  it('refuses members without Pro access', async () => {
    jest.mocked(proMemberAllowed).mockResolvedValue(false);
    expect((await GET(req('?at=2027-08-03T12:00:00Z'))).status).toBe(403);
  });

  it('refuses extra parameters and malformed or out-of-range moments', async () => {
    expect((await GET(req('?at=2027-08-03T12:00:00Z&memberId=' + A))).status).toBe(400);
    expect((await GET(req('?at=tomorrow'))).status).toBe(400);
    expect((await GET(req('?at=1700-01-01T00:00:00Z'))).status).toBe(422);
  });

  it('returns the ten bodies for a valid moment', async () => {
    const res = await GET(req('?at=2027-08-03T12:00:00Z'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(transitBodies(body.positions)).toHaveLength(10);
  });
});
