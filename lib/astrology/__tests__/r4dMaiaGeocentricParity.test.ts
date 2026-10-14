/**
 * R4d independent-source consistency: MAIA must use the same geocentric sky
 * as the published Current Transits engine, never heliocentric positions.
 * Synthetic UTC instants, no member data or provider API.
 */
import * as Astronomy from 'astronomy-engine';
import { calculateTransits, getMoonPhaseData } from '../ephemerisCalculator';
import { calculateTransitPositions } from '@/app/api/astrology/current-transits/route';

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const toLongitude = (p: {sign:string;degree:number}): number =>
  SIGNS.indexOf(p.sign)*30+p.degree;
const delta = (a:number,b:number): number => Math.abs(((a-b+540)%360)-180);
const BODIES = ['sun','moon','mercury','venus','mars','jupiter',
  'saturn','uranus','neptune','pluto'] as const;

const cases = [
  '1905-03-12T17:45:00.000Z',
  '1950-06-21T18:15:00.000Z',
  '1970-07-20T00:17:00.000Z',
  '1985-03-15T19:30:00.000Z',
  '2000-01-01T12:00:00.000Z',
  '2000-05-12T07:40:00.000Z',
  '2024-03-10T07:30:00.000Z',
  '2024-11-03T07:30:00.000Z',
  '2026-02-26T06:38:00.000Z', // Mercury station
  '2026-02-04T02:23:00.000Z', // Uranus station
  '2026-07-07T11:04:00.000Z', // Neptune station
  '2026-10-12T13:00:00.000Z',
  '2045-06-10T15:15:00.000Z',
  '2026-03-20T14:46:00.000Z', // longitude near 0 Aries
] as const;

describe('ASTRO-PRO-R4d: geocentric MAIA sky parity and no fabricated houses', () => {
  for (const utc of cases) {
    it('same Earth-observed positions and direction as Current Transits at '+utc, async () => {
      const instant=new Date(utc);
      const maia=await calculateTransits(instant);
      const current=calculateTransitPositions(instant);
      for (const body of BODIES) {
        const actual=maia[body];
        const reference=current.find(x=>x.planet.toLowerCase()===body);
        expect(reference).toBeDefined();
        expect(actual).toBeDefined();
        expect(delta(toLongitude(actual),reference!.longitude)).toBeLessThanOrEqual(0.02);
        expect(actual.motionStatus).toBe(reference!.motionStatus);
        expect(actual.retrograde).toBe(reference!.retrograde);
        expect(actual.house).toBe(0); // no location => NO house assignment
      }
    });
  }

  it('moon illumination is a true observed fraction, not phase-angle percentage', () => {
    const newMoon=new Date('2024-04-08T18:00:00.000Z');
    const fullMoon=new Date('2024-03-25T07:00:00.000Z');
    const n=getMoonPhaseData(newMoon),f=getMoonPhaseData(fullMoon);
    expect(n.percentage).toBeLessThan(10);
    expect(f.percentage).toBeGreaterThan(90);
    for(const date of [newMoon,fullMoon,new Date('2026-10-12T18:00:00Z')]){
      const p=getMoonPhaseData(date);
      const time=Astronomy.MakeTime(date);
      expect(p.degrees).toBeCloseTo(Astronomy.MoonPhase(time),6);
      expect(p.percentage).toBe(Math.round(Astronomy.Illumination(Astronomy.Body.Moon,time).phase_fraction*100));
    }
  });
});
