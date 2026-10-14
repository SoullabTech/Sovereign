/**
 * ASTRO-PRO-R4b — preserve the independently established Swiss/Moshier
 * geocentric speed signs while refusing unwarranted certainty near stations.
 *
 * Each row: UTC wall time, independent Swiss retrograde classification,
 * expected member-visible status under a provisional station guard.
 * +/-10 minute cases remain close to the independent station even where
 * the two ephemerides disagree; +/-2 hour cases retain a definite direction.
 * No personal or member birth records appear in this fixture.
 */
import { calculateBirthChart, type PlanetMotionStatus } from '../ephemerisCalculator';

type SwissSample = readonly [clock: string, swissRetrograde: boolean, expectedStatus: PlanetMotionStatus];
type Station = readonly [body: 'mercury'|'venus'|'mars'|'jupiter'|'saturn'|'uranus'|'neptune'|'pluto', date: string, samples: readonly SwissSample[]];
const stations: readonly Station[] = [
  ['mercury','2026-02-26', [
    ['04:48',false,'direct'],['06:38',false,'stationary-uncertain'],
    ['06:58',true,'stationary-uncertain'],['08:48',true,'retrograde']]],
  ['venus','2026-10-03', [
    ['05:15',false,'direct'],['07:05',false,'stationary-uncertain'],
    ['07:25',true,'stationary-uncertain'],['09:15',true,'retrograde']]],
  ['jupiter','2026-03-11', [
    ['01:30',true,'retrograde'],['03:20',true,'stationary-uncertain'],
    ['03:40',false,'stationary-uncertain'],['05:30',false,'direct']]],
  ['saturn','2026-07-26', [
    ['17:56',false,'direct'],['19:46',false,'stationary-uncertain'],
    ['20:06',true,'stationary-uncertain'],['21:56',true,'retrograde']]],
  ['uranus','2026-02-04', [
    ['00:33',true,'retrograde'],['02:23',true,'stationary-uncertain'],
    ['02:43',false,'stationary-uncertain'],['04:33',false,'direct']]],
  ['neptune','2026-07-07', [
    ['08:54',false,'direct'],['10:44',false,'stationary-uncertain'],
    ['11:04',true,'stationary-uncertain'],['12:54',true,'retrograde']]],
  ['pluto','2026-05-06', [
    ['13:34',false,'direct'],['15:24',false,'stationary-uncertain'],
    ['15:44',true,'stationary-uncertain'],['17:34',true,'retrograde']]],
  ['mars','2024-12-06', [
    ['21:33',false,'direct'],['23:23',false,'stationary-uncertain'],
    ['23:43',true,'stationary-uncertain']]],
  ['mars','2024-12-07', [['01:33',true,'retrograde']]],
  ['mars','2025-02-23', [['23:59',true,'retrograde']]],
  ['mars','2025-02-24', [
    ['01:49',true,'stationary-uncertain'],['02:09',false,'stationary-uncertain'],
    ['03:59',false,'direct']]],
] as const;

describe('ASTRO-PRO-R4b — apparent stations with independent Swiss speed-sign reference', () => {
  for (const [body, date, samples] of stations) {
    for (const [time, swissRetrograde, status] of samples) {
      it(`${body} ${date}T${time}Z: ${status} (Swiss Rx=${swissRetrograde})`, async () => {
        const chart = await calculateBirthChart({
          date, time, location: { lat:0,lng:0,timezone:'UTC' },
          houseSystem:'porphyry',qualityMode:'strict-core',
        });
        const motion = chart[body];
        expect(motion.motionStatus).toBe(status);
        if (status === 'stationary-uncertain') {
          // Legacy boolean is deliberately NOT a confident direct claim.
          // It is suppressed; consumers must use motionStatus.
          expect(motion.retrograde).toBe(false);
        } else {
          expect(motion.retrograde).toBe(swissRetrograde);
        }
      });
    }
  }
});
