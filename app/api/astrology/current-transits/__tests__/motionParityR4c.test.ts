/**
 * ASTRO-PRO-R4c: current sky and natal chart must share the same provisional
 * Earth-observed motion statuses. All test instants are synthetic, public and
 * deterministic. No member account, browser, network or database read.
 */
import { calculateTransitPositions } from '../route';
import { calculateBirthChart } from '@/lib/astrology/ephemerisCalculator';

const fixed = [
  ['uranus','2026-02-04','02:23','stationary-uncertain'],
  ['uranus','2026-02-04','00:33','retrograde'],
  ['uranus','2026-02-04','04:33','direct'],
  ['neptune','2026-07-07','11:04','stationary-uncertain'],
  ['neptune','2026-07-07','12:54','retrograde'],
  ['pluto','2026-05-06','15:44','stationary-uncertain'],
  ['mercury','2026-02-26','06:38','stationary-uncertain'],
  ['mercury','2026-02-26','08:48','retrograde'],
  ['venus','2026-10-03','07:05','stationary-uncertain'],
  ['jupiter','2026-03-11','03:20','stationary-uncertain'],
  ['saturn','2026-07-26','19:46','stationary-uncertain'],
  ['mars','2024-12-06','23:23','stationary-uncertain'],
] as const;

describe('ASTRO-PRO-R4c shared natal/current transit motion', () => {
  it.each(fixed)('%s %sT%s must report %s in BOTH pathways', async (planet,date,time,want) => {
    const sky = calculateTransitPositions(new Date(date+'T'+time+':00Z'));
    const current = sky.find(x => x.planet.toLowerCase()===planet);
    const natal = await calculateBirthChart({
      date,time,location:{lat:0,lng:0,timezone:'UTC'},
      houseSystem:'porphyry',qualityMode:'strict-core'
    });
    const natalPosition = natal[planet] as {motionStatus?:string;retrograde:boolean};
    expect(current?.motionStatus).toBe(want);
    expect(natalPosition.motionStatus).toBe(want);
    expect(current?.retrograde).toBe(natalPosition.retrograde);
    if(want==='stationary-uncertain')expect(current?.retrograde).toBe(false);
  });

  it('preserves legacy transport fields and explicitly declines certainty for approximate bodies', () => {
    const sky=calculateTransitPositions(new Date('2026-02-04T02:23:00Z'));
    expect(sky.find(x=>x.planet==='Sun')).toEqual(expect.objectContaining({motionStatus:'direct',retrograde:false}));
    expect(sky.find(x=>x.planet==='Moon')).toEqual(expect.objectContaining({motionStatus:'direct',retrograde:false}));
    for(const name of ['North Node','South Node','Chiron','Lilith','Ceres','Pallas','Juno','Vesta']) {
      expect(sky.find(x=>x.planet===name)?.motionStatus).toBe('not-evaluated');
    }
    expect(sky.every(x=>typeof x.retrograde==='boolean'&&Number.isFinite(x.longitude))).toBe(true);
  });
});
