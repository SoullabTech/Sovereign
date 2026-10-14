/** R4: independent synthetic PySwissEph 2.10.03 Moshier + speed-sign reference.
 * Covers apparent geocentric motion, not heliocentric orbital longitude.
 * No member birth data. Reference statuses were calculated outside this repo.
 */
import { calculateBirthChart } from '../ephemerisCalculator';
import { admitProCalculation } from '../proCalculationPolicy';

const cases = [
  ['J2000Equator','2000-01-01','12:00',0,0,'UTC','00001000'],
  ['1950Delhi','1950-06-21','23:45',28.6139,77.209,'Asia/Kolkata','00000010'],
  ['1970Sydney','1970-07-20','10:17',-33.8688,151.2093,'Australia/Sydney','00000010'],
  ['1985NY','1985-03-15','14:30',40.7128,-74.006,'America/New_York','01001001'],
  ['2024SpringNY','2024-03-10','03:30',40.7128,-74.006,'America/New_York','00000000'],
  ['2024FallNY','2024-11-03','02:30',40.7128,-74.006,'America/New_York','00011110'],
  ['2026London','2026-10-12','14:00',51.5074,-0.1278,'Europe/London','01001111'],
  ['2026Auckland','2026-10-12','14:00',-36.8485,174.7633,'Pacific/Auckland','01001111'],
  ['1905CapeTown','1905-03-12','19:45',-33.9258,18.4232,'Africa/Johannesburg','00000010'],
  ['2045MexicoCity','2045-06-10','09:15',19.4326,-99.1332,'America/Mexico_City','00001001'],
  ['2000Northern65','2000-05-12','09:40',65,13.6,'Europe/Oslo','00000011'],
  ['2026SunJustBeforeAries','2026-03-20','14:45',0,0,'UTC','10000000'],
  ['2026SunJustAfterAries','2026-03-20','14:46',0,0,'UTC','10000000'],
  ['2026AscNearAries','2026-06-15','01:22',40.7128,-74.006,'America/New_York','00000001'],
] as const;

const bodies=['mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'] as const;
describe('ASTRO-PRO-R4 geocentric retrograde vs independent Swiss/Moshier speed', () => {
  for(const [name,date,time,lat,lng,timezone,expected] of cases) {
    it(name+' has correct apparent retrograde flags',async()=>{
      const admitted = admitProCalculation({date,time,
        location:{lat,lng,timezone},houseSystem:'porphyry'});
      expect(admitted.ok).toBe(true);
      if(!admitted.ok) return;
      const chart=await calculateBirthChart(admitted.birthData);
      const actual=bodies.map(b=>chart[b].retrograde?'1':'0').join('');
      expect(actual).toBe(expected);
    });
  }
});
