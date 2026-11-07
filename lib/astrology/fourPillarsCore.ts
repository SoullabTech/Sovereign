/**
 * Four Pillars (Bazi) from astronomy, not from the Gregorian calendar.
 *
 *  - YEAR pillar changes at Lichun, the instant the Sun reaches ecliptic
 *    longitude 315° (not on 1 January, not at Chinese New Year).
 *  - MONTH pillar changes at each of the twelve Jie solar terms (Sun at 315°,
 *    345°, 15° ... 285°); its branch runs Yin, Mao ... Chou, its stem follows
 *    from the year stem (Jia/Ji year -> Bing first month, and so on).
 *  - DAY pillar is the sexagenary day count: (JDN + 49) mod 60 of the local
 *    civil date. Convention: the day changes at 00:00 local time, not 23:00.
 *  - HOUR pillar: two-hour branches from 23:00; its stem follows from the DAY
 *    stem. 23:00-24:00 is the late Zi hour of the same civil day.
 *
 * Local civil time only: no true solar time or equation-of-time correction.
 *
 * Reference check (published): 2000-01-01 = 己卯 year, 丙子 month, 戊午 day.
 */
import * as Astronomy from 'astronomy-engine';
import { julianDayNumber } from './mayanTraditional';

/** Sun longitudes of the twelve Jie terms, month 1 (Yin) first. */
export const JIE_LONGITUDES = [315, 345, 15, 45, 75, 105, 135, 165, 195, 225, 255, 285] as const;
export const JIE_NAMES = [
  'Lichun', 'Jingzhe', 'Qingming', 'Lixia', 'Mangzhong', 'Xiaoshu',
  'Liqiu', 'Bailu', 'Hanlu', 'Lidong', 'Daxue', 'Xiaohan',
] as const;

const mod = (n: number, m: number) => ((n % m) + m) % m;
const DAY_MS = 86_400_000;

/** Sun's apparent ecliptic longitude at an instant. */
export function sunLongitude(instant: Date): number {
  return Astronomy.SunPosition(Astronomy.MakeTime(instant)).elon;
}

function sunReaches(longitude: number, from: Date, limitDays: number): Date {
  const hit = Astronomy.SearchSunLongitude(longitude, from, limitDays);
  if (!hit) throw new Error('SOLAR_TERM_NOT_FOUND');
  return hit.date;
}

export interface MonthTerm {
  /** 0 = Yin month (after Lichun) ... 11 = Chou month (after Xiaohan). */
  monthIndex: number;
  /** The Jie that began this month. */
  startedAt: Date;
  /** The Jie that ends this month. */
  endsAt: Date;
}

/** The solar-term month containing an instant, with exact term moments. */
export function solarTermMonth(instant: Date): MonthTerm {
  const monthIndex = Math.floor(mod(sunLongitude(instant) - 315, 360) / 30);
  const startLon = JIE_LONGITUDES[monthIndex];
  const endLon = JIE_LONGITUDES[(monthIndex + 1) % 12];
  const startedAt = sunReaches(startLon, new Date(instant.getTime() - 35 * DAY_MS), 40);
  const endsAt = sunReaches(endLon, instant, 40);
  return { monthIndex, startedAt, endsAt };
}

/** Lichun (Sun at 315°) of a Gregorian year. */
export function lichun(gregorianYear: number): Date {
  return sunReaches(315, new Date(Date.UTC(gregorianYear, 0, 20)), 60);
}

export interface PillarIndices { stem: number; branch: number }
export interface FourPillarIndices {
  year: PillarIndices; month: PillarIndices; day: PillarIndices; hour: PillarIndices;
  /** The year the YEAR pillar belongs to (previous Gregorian year before Lichun). */
  pillarYear: number;
  term: MonthTerm;
}

/**
 * @param instant      the birth instant
 * @param tzOffsetMin  local offset from UTC in minutes, for the civil date/hour
 */
export function fourPillarIndices(instant: Date, tzOffsetMin = 0): FourPillarIndices {
  const local = new Date(instant.getTime() + tzOffsetMin * 60_000);
  const y = local.getUTCFullYear();
  const m = local.getUTCMonth() + 1;
  const d = local.getUTCDate();
  const h = local.getUTCHours();

  const pillarYear = instant.getTime() >= lichun(y).getTime() ? y : y - 1;
  const yearStem = mod(pillarYear - 4, 10);
  const year = { stem: yearStem, branch: mod(pillarYear - 4, 12) };

  const term = solarTermMonth(instant);
  const month = {
    stem: mod(yearStem * 2 + 2 + term.monthIndex, 10),
    branch: mod(2 + term.monthIndex, 12),
  };

  const dayIndex = mod(julianDayNumber(y, m, d) + 49, 60);
  const day = { stem: dayIndex % 10, branch: dayIndex % 12 };

  const hourBranch = Math.floor((h + 1) / 2) % 12;
  // Late Zi (23:00-24:00) continues the day's own stem sequence.
  const hourStem = mod(day.stem * 2 + (h === 23 ? 12 : hourBranch), 10);
  const hour = { stem: hourStem, branch: hourBranch };

  return { year, month, day, hour, pillarYear, term };
}

/**
 * Da Yun start age in years from exact term moments: three days is one year.
 * Forward cycles count to the next Jie, backward cycles from the previous one.
 */
export function daYunStartAgeExact(instant: Date, direction: 'forward' | 'backward'): number {
  const { startedAt, endsAt } = solarTermMonth(instant);
  const days = direction === 'forward'
    ? (endsAt.getTime() - instant.getTime()) / DAY_MS
    : (instant.getTime() - startedAt.getTime()) / DAY_MS;
  return days / 3;
}
