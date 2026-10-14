/**
 * ASTRO-CALC-PRIV-01 — independent numerical discrepancy detector.
 *
 * Generated independently with PySwissEph 2.10.03 using Swiss Ephemeris'
 * Moshier analytical backend (FLG_MOSEPH | FLG_SPEED), default tropical,
 * geocentric apparent longitudes, and swe.houses_ex house system O (Porphyry).
 * This is a bound test fixture, NOT proof of commercial license or professional
 * ephemeris certification. Numerical tolerances are provisional/falsification
 * thresholds for diagnostic work and require professional adjudication.
 *
 * NO member charts; all fixtures are synthetic/public dates and locations.
 */
import { calculateBirthChart, type BirthChart } from '../ephemerisCalculator';

const SIGN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
function longitude(p: { sign: string; degree: number }): number {
  const index=SIGN.indexOf(p.sign);
  if(index < 0) throw new Error('Unknown sign in chart');
  return index*30+p.degree;
}
function circularDistance(a: number, b: number): number {
  const distance=Math.abs(((a-b+540)%360)-180);
  return distance;
}
function deviations(chart: BirthChart, reference: Record<string, number>) {
  return Object.entries(reference).map(([key,target])=>{
    const pos=chart[key as keyof BirthChart] as { sign:string; degree:number };
    const result=longitude(pos);
    return {body:key, actual:result, target, error:circularDistance(result,target)};
  });
}
const cases = [
  {
    label:'J2000 2000-01-01 12:00 UTC Greenwich',
    input:{date:'2000-01-01',time:'12:00',location:{lat:0,lng:0,timezone:'UTC'},houseSystem:'porphyry' as const},
    bodies:{sun:280.368920,moon:223.323775,mercury:271.889275,venus:241.565798,mars:327.963313,
      jupiter:25.253030,saturn:40.395639,uranus:314.809223,neptune:303.192981,pluto:251.454709},
    asc:11.3738996046, mc:279.6110878003,
    cusps:[11.3738996046, 99.6110878003,191.3738996046,279.6110878003],
  },
  {
    label:'1985-03-15 14:30 America/New_York (19:30 UTC)',
    input:{date:'1985-03-15',time:'14:30',location:{lat:40.7128,lng:-74.006,timezone:'America/New_York'},houseSystem:'porphyry' as const},
    bodies:{sun:355.161076,moon:290.557389,mercury:13.400727,venus:22.210619,mars:30.435894,
      jupiter:307.984071,saturn:238.068357,uranus:257.963505,neptune:273.502443,pluto:214.347690},
    asc:134.2041903209,mc:34.0879092852,
    cusps:[134.2041903209,214.0879092852,314.2041903209,34.0879092852],
  },
  {
    label:'2026-10-12 14:00 America/New_York (18:00 UTC) synthetic CT location',
    input:{date:'2026-10-12',time:'14:00',location:{lat:41.383,lng:-72.9,timezone:'America/New_York'},houseSystem:'porphyry' as const},
    bodies:{sun:199.428413,moon:224.038423,mercury:224.427090,venus:216.734371,mars:128.390077,
      jupiter:141.590993,saturn:10.658211,uranus:65.277675,neptune:2.543833,pluto:303.071205},
    asc:285.6698542551,mc:220.8490482731,
    cusps:[285.6698542551,40.8490482731,105.6698542551,220.8490482731],
  },
];

describe('ASTRO-CALC-PRIV independent Swiss / Moshier diagnostic fixtures',()=>{
  for(const c of cases){
    it(c.label+' — geocentric major-body longitudes (0.35° diagnostic)',async()=>{
      const chart=await calculateBirthChart(c.input);
      const delta=deviations(chart,c.bodies);
      const failed=delta.filter(x=>x.error>0.35);
      if(failed.length) console.warn('SWISS_REFERENCE_LONGITUDE_MISMATCH', c.label, failed);
      expect(failed).toEqual([]);
    });
    it(c.label+' — Porphyry angular cusps / ASC / MC (0.6° diagnostic)',async()=>{
      const chart=await calculateBirthChart(c.input);
      const actuals=[chart.houses[0],chart.houses[3],chart.houses[6],chart.houses[9]];
      const diffs=actuals.map((actual,i)=>circularDistance(actual,c.cusps[i]));
      const angles=[circularDistance(longitude(chart.ascendant),c.asc),
         circularDistance(longitude(chart.midheaven),c.mc)];
      if(diffs.some(x=>x>0.6)||angles.some(x=>x>0.6))
        console.warn('SWISS_REFERENCE_ANGLE_MISMATCH',c.label,{actuals,diffs,angles});
      expect(Math.max(...diffs,...angles)).toBeLessThanOrEqual(0.6);
    });
  }
});
