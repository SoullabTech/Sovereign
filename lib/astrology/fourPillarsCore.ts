/**
 * Four Pillars indices and Da Yun start age for the Free Da Yun calculator and
 * the member Bazi service.
 *
 * Single source of truth: the astronomy and the pillar arithmetic live in
 * `proFourPillars.ts` (the Pro module, which also carries hidden stems, Ten
 * Gods and the luck pillars). This file only adapts its result to the
 * index-based shape those callers use, so the two can never disagree.
 *
 * Conventions (inherited): the year turns at Lichun and the month at each Jie
 * solar term, found from the Sun's longitude for the birth instant; the day
 * count is (JDN + 49) mod 60 of the local civil date; the day changes at 00:00
 * local time; the hour stem follows the Five Rats rule, and the late Zi hour
 * (23:00-24:00) takes the next day's stem sequence. Clock time, not true solar
 * time.
 *
 * Reference check (published): 2000-01-01 = 己卯 year, 丙子 month, 戊午 day.
 */
import { calculateFourPillars, lichun as proLichun } from './proFourPillars';

export { proLichun as lichun };

export interface PillarIndices { stem: number; branch: number }
export interface FourPillarIndices {
  year: PillarIndices; month: PillarIndices; day: PillarIndices; hour: PillarIndices;
}

function localParts(instant: Date, tzOffsetMin: number) {
  const iso = new Date(instant.getTime() + tzOffsetMin * 60_000).toISOString();
  return { date: iso.slice(0, 10), time: iso.slice(11, 16) };
}

/**
 * @param instant      the birth instant
 * @param tzOffsetMin  local offset from UTC in minutes, for the civil date/hour
 */
export function fourPillarIndices(instant: Date, tzOffsetMin = 0): FourPillarIndices {
  const { date, time } = localParts(instant, tzOffsetMin);
  const [year, month, day, hour] = calculateFourPillars(instant, date, time, 'midnight').pillars
    .map((p) => ({ stem: p.stem.index, branch: p.branch.index }));
  return { year, month, day, hour };
}

/**
 * Da Yun start age in years: three days from birth to the neighbouring Jie
 * term make one year (one day, four months). Forward cycles count to the next
 * term, backward cycles from the previous one. Resolution: whole months, as the
 * Pro luck pillars report it.
 */
export function daYunStartAgeExact(instant: Date, direction: 'forward' | 'backward'): number {
  const { date, time } = localParts(instant, 0);
  const { startAge } = calculateFourPillars(instant, date, time, 'midnight').luck[direction];
  return startAge.years + startAge.months / 12;
}
