/**
 * ASTRO-R4d — MAIA's legacy sky must agree with Astro Pro's geocentric
 * current sky and abstain from direct/retrograde certainty near a station.
 * Synthetic public UTC instants only. No member data, network, or model calls.
 */
import { calculateTransits, getMoonPhaseData } from '../ephemerisCalculator';
import { calculateTransitPositions } from '@/app/api/astrology/current-transits/route';
import * as Astronomy from 'astronomy-engine';

const signs = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];
const asLongitude = (p: {sign:string;degree:number}) =>
  signs.indexOf(p.sign) * 30 + p.degree;
const circularError = (a:number,b:number) =>
  Math.abs(((a-b+540)%360)-180);
const planets = [
  'Sun','Moon','Mercury','Venus','Mars','Jupiter',
  'Saturn','Uranus','Neptune','Pluto'
] as const;
const fixtures = [
  '2000-01-01T12:00:00.000Z',
  '2026-02-26T06:38:00.000Z', // Mercury near a station
  '2026-10-13T15:00:00.000Z',
];

describe('ASTRO-R4d — MAIA legacy/current-sky factual parity', () => {
  for (const iso of fixtures) {
    it(`${iso}: Earth-observed planetary longitudes and motion statuses align`,async()=>{
      const at = new Date(iso);
      const maia = await calculateTransits(at);
      const astro = calculateTransitPositions(at);
      for (const name of planets) {
        const fromMaia = maia[name.toLowerCase()];
        const fromAstro = astro.find(t => t.planet===name);
        expect(fromMaia).toBeDefined();
        expect(fromAstro).toBeDefined();
        const error = circularError(asLongitude(fromMaia),fromAstro!.longitude);
        expect({name,error,iso}).toEqual({
          name,error:expect.any(Number),iso
        });
        expect(error).toBeLessThanOrEqual(0.05);
        expect(fromMaia.motionStatus).toBe(fromAstro!.motionStatus);
        expect(fromMaia.retrograde).toBe(fromAstro!.retrograde);
      }
    });
  }

  it('marks Mercury uncertain at the documented 2026 station fixture',async()=>{
    const sky = await calculateTransits(new Date('2026-02-26T06:38:00Z'));
    expect(sky.mercury.motionStatus).toBe('stationary-uncertain');
    expect(sky.mercury.retrograde).toBe(false);
  });

  it('uses the astronomy engine’s geocentric lunar phase convention',()=>{
    const at=new Date('2026-02-26T06:38:00Z');
    const time=Astronomy.MakeTime(at);
    // MoonPhase differs by about 0.006° from directly subtracting the
    // apparent Sun/Moon ecliptic longitudes at this public synthetic instant.
    // Compare the selected canonical engine calculation, not a mixed method.
    // External professional ephemeris accuracy remains a separate review gate.
    expect(circularError(getMoonPhaseData(at).degrees,Astronomy.MoonPhase(time)))
      .toBeLessThan(0.00001);
  });

  it('does not mislabel lunar phase-cycle progress as percent illuminated',()=>{
    for (const iso of fixtures) {
      const at=new Date(iso);
      const expected=Math.round(Astronomy.Illumination(Astronomy.Body.Moon,Astronomy.MakeTime(at)).phase_fraction*100);
      expect(getMoonPhaseData(at).percentage).toBe(expected);
    }
  });
});
