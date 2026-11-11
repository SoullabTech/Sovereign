/**
 * The Pro Vedic room's data: the Free Vedic page's profile and planets views,
 * computed on the server with no birth detail in the payload.
 *
 * Independent expectations for 3 Sep 2003 08:15 in New Haven (12:15 UT), Lahiri:
 * Moon 250.39° tropical (Meeus lunar series), Sun 160.6°, Ascendant Libra 2.4°,
 * Lahiri ayanamsa 23.905° (1956 definition advanced by precession). Sidereal:
 * Moon 226.49° = Scorpio (Vrischika) 16.5°, in Anuradha (213.33-226.67°), pada 4;
 * Sun 136.7° = Leo (Simha); Ascendant 158.5° = Virgo (Kanya).
 */
import { calculateProOtherSystems } from '@/lib/astrology/proOtherSystems';

const BIRTH = {
  date: '2003-09-03', time: '08:15',
  location: { lat: 41.3083, lng: -72.9279, timezone: 'America/New_York' },
};
const UTC = '2003-09-03T12:15:00.000Z';

describe('Pro Vedic room data', () => {
  let vedic: any;
  beforeAll(async () => { vedic = (await calculateProOtherSystems(BIRTH, UTC, 'lahiri')).vedic; });

  it('carries the three signs, the nakshatra and the Spiralogic integration for the sidereal chart', () => {
    expect(vedic.profile.moonSign.name).toBe('Vrischika');
    expect(vedic.profile.sunSign.name).toBe('Simha');
    expect(vedic.profile.ascendantSign.name).toBe('Kanya');
    expect(vedic.birthNakshatra.name).toBe('Anuradha');
    expect(vedic.moonPada).toBe(4);
    expect(vedic.profile.spiralogicIntegration.integration.length).toBeGreaterThan(20);
  });

  it('carries every graha with its sign, nakshatra, house and dignity, and the ayanamsa', () => {
    const names = Object.keys(vedic.profile.chart.grahas);
    expect(names).toHaveLength(9);
    for (const g of Object.values<any>(vedic.profile.chart.grahas)) {
      expect(g.rashi.name).toBeTruthy();
      expect(g.nakshatra.name).toBeTruthy();
      expect(g.house).toBeGreaterThanOrEqual(1);
      expect(g.dignity).toBeTruthy();
    }
    expect(Math.abs(vedic.profile.chart.ayanamsaValue - 23.905)).toBeLessThan(0.01);
  });

  it('holds no birth time, place, zone or birth instant in the room data', () => {
    const text = JSON.stringify(vedic.profile);
    for (const secret of ['08:15', '12:15', 'America/New_York', '41.3083', '-72.9279', '2003-09-03T']) {
      expect(text).not.toContain(secret);
    }
  });
});
