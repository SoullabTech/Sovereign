/**
 * The Pro Mayan room's data: the Free Mayan page's path of life and galactic
 * signature, computed on the server with no birth date in the payload.
 *
 * Independent facts for 3 Sep 2003: Dreamspell Kin 193 = Red Spectral Skywalker
 * (Ben), Haab 11 Mol, traditional 13 Ak'b'al; Ben is a red (east) sign. The
 * youth and future signs sit 180 days either side, which is nine day-sign
 * cycles (so the same sign) except across the skipped 29 February 2004.
 */
import { calculateProOtherSystems } from '@/lib/astrology/proOtherSystems';

const BIRTH = {
  date: '2003-09-03', time: '08:15',
  location: { lat: 41.3083, lng: -72.9279, timezone: 'America/New_York' },
};
const UTC = '2003-09-03T12:15:00.000Z';

describe('Pro Mayan room data', () => {
  let mayan: any;
  beforeAll(async () => { mayan = (await calculateProOtherSystems(BIRTH, UTC, 'lahiri')).mayan; });

  it('carries the full Dreamspell profile the Free page shows', () => {
    const p = mayan.profile;
    expect(p.tzolkin.tzolkinNumber).toBe(193);
    expect(p.tzolkin.galacticSignature).toBe('Spectral Ben');
    expect(p.haab.fullDate).toBe('11 Mol');
    expect(p.cardinalDirection.direction).toBe('east');
    expect(p.pathOfLife.youth.daySign.name).toBe('Ben');   // 180 days before: no 29 February in between
    expect(p.pathOfLife.future.daySign.name).not.toBe('Ben'); // 180 days after crosses 29 Feb 2004
    expect(p.lifeCycleInsight.length).toBeGreaterThan(40);
  });

  it('keeps the traditional count beside it, as a different system', () => {
    expect(mayan.traditional.number).toBe(13);
    expect(mayan.traditional.kiche).toBe('Aq’ab’al');
    expect(mayan.traditional.longCount).toBe('12.19.10.10.3');
  });

  it('holds no birth date, time, place or zone in the room data', () => {
    const text = JSON.stringify(mayan.profile);
    for (const secret of ['birthDate', '2003-09-03', '08:15', '12:15', 'America/New_York', '41.3083', '-72.9279']) {
      expect(text).not.toContain(secret);
    }
  });
});
