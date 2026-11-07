/**
 * ASTRO-PRO-FOUR-PILLARS-01 — Four Pillars (BaZi) and the ten-year luck
 * pillars (Da Yun) of a Pro chart (founder request 2026-11-06).
 *
 * Calculated facts only, from fixed traditional tables:
 *   - year and month pillars turn at the solar terms (the Sun's apparent
 *     longitude: the year at Lichun, 315°, each month at the next "jie" term
 *     30° on), found with astronomy-engine for the birth instant;
 *   - the day pillar is the 60-day count (Julian Day Number + 49, mod 60: the
 *     count that makes 1 October 1949 a jia-zi day and 1 January 2000 wu-wu);
 *   - the hour pillar is the two-hour branch of the local clock time, its stem
 *     by the Five Rats rule from the day stem;
 *   - hidden stems and the Ten Gods are the standard tables.
 * Clock time is used, not true solar time. The luck pillars run forward or
 * backward; tradition chooses by the year stem's polarity and the person's
 * sex, which a saved chart does not record, so both are returned and the
 * astrologer chooses.
 */
import * as Astronomy from 'astronomy-engine';

export const STEMS = [
  { pinyin: 'Jia', hanzi: '甲', element: 'Wood', polarity: 'yang' },
  { pinyin: 'Yi', hanzi: '乙', element: 'Wood', polarity: 'yin' },
  { pinyin: 'Bing', hanzi: '丙', element: 'Fire', polarity: 'yang' },
  { pinyin: 'Ding', hanzi: '丁', element: 'Fire', polarity: 'yin' },
  { pinyin: 'Wu', hanzi: '戊', element: 'Earth', polarity: 'yang' },
  { pinyin: 'Ji', hanzi: '己', element: 'Earth', polarity: 'yin' },
  { pinyin: 'Geng', hanzi: '庚', element: 'Metal', polarity: 'yang' },
  { pinyin: 'Xin', hanzi: '辛', element: 'Metal', polarity: 'yin' },
  { pinyin: 'Ren', hanzi: '壬', element: 'Water', polarity: 'yang' },
  { pinyin: 'Gui', hanzi: '癸', element: 'Water', polarity: 'yin' },
] as const;

export const BRANCHES = [
  { pinyin: 'Zi', hanzi: '子', animal: 'Rat', element: 'Water', polarity: 'yang', hidden: [9] },
  { pinyin: 'Chou', hanzi: '丑', animal: 'Ox', element: 'Earth', polarity: 'yin', hidden: [5, 9, 7] },
  { pinyin: 'Yin', hanzi: '寅', animal: 'Tiger', element: 'Wood', polarity: 'yang', hidden: [0, 2, 4] },
  { pinyin: 'Mao', hanzi: '卯', animal: 'Rabbit', element: 'Wood', polarity: 'yin', hidden: [1] },
  { pinyin: 'Chen', hanzi: '辰', animal: 'Dragon', element: 'Earth', polarity: 'yang', hidden: [4, 1, 9] },
  { pinyin: 'Si', hanzi: '巳', animal: 'Snake', element: 'Fire', polarity: 'yin', hidden: [2, 4, 6] },
  { pinyin: 'Wu', hanzi: '午', animal: 'Horse', element: 'Fire', polarity: 'yang', hidden: [3, 5] },
  { pinyin: 'Wei', hanzi: '未', animal: 'Goat', element: 'Earth', polarity: 'yin', hidden: [5, 3, 1] },
  { pinyin: 'Shen', hanzi: '申', animal: 'Monkey', element: 'Metal', polarity: 'yang', hidden: [6, 8, 4] },
  { pinyin: 'You', hanzi: '酉', animal: 'Rooster', element: 'Metal', polarity: 'yin', hidden: [7] },
  { pinyin: 'Xu', hanzi: '戌', animal: 'Dog', element: 'Earth', polarity: 'yang', hidden: [4, 7, 3] },
  { pinyin: 'Hai', hanzi: '亥', animal: 'Pig', element: 'Water', polarity: 'yin', hidden: [8, 0] },
] as const;

/** The Ten Gods by relation to the Day Master: [same polarity, different polarity]. */
const TEN_GODS = {
  same: [{ english: 'Friend', hanzi: '比肩' }, { english: 'Rob Wealth', hanzi: '劫财' }],
  resource: [{ english: 'Indirect Resource', hanzi: '偏印' }, { english: 'Direct Resource', hanzi: '正印' }],
  output: [{ english: 'Eating God', hanzi: '食神' }, { english: 'Hurting Officer', hanzi: '伤官' }],
  wealth: [{ english: 'Indirect Wealth', hanzi: '偏财' }, { english: 'Direct Wealth', hanzi: '正财' }],
  officer: [{ english: 'Seven Killings', hanzi: '七杀' }, { english: 'Direct Officer', hanzi: '正官' }],
} as const;

export type TenGod = { english: string; hanzi: string };

/** The Ten God a stem is to the Day Master. Elements: Wood 0, Fire 1, Earth 2, Metal 3, Water 4. */
export function tenGod(dayMaster: number, stem: number): TenGod {
  const dm = Math.floor(dayMaster / 2);
  const s = Math.floor(stem / 2);
  const samePolarity = dayMaster % 2 === stem % 2 ? 0 : 1;
  if (s === dm) return TEN_GODS.same[samePolarity];
  if ((s + 1) % 5 === dm) return TEN_GODS.resource[samePolarity];
  if ((dm + 1) % 5 === s) return TEN_GODS.output[samePolarity];
  if ((dm + 2) % 5 === s) return TEN_GODS.wealth[samePolarity];
  return TEN_GODS.officer[samePolarity];
}

const mod = (n: number, m: number) => ((n % m) + m) % m;

/** The 60-cycle index of a stem–branch pair (0 = jia-zi). */
export function cycleIndex(stem: number, branch: number): number {
  return mod(6 * stem - 5 * branch, 60);
}

/** Julian Day Number of a Gregorian calendar date. */
export function julianDayNumber(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

/** The day pillar's 60-cycle index for a local civil date. */
export function dayCycleIndex(year: number, month: number, day: number): number {
  return mod(julianDayNumber(year, month, day) + 49, 60);
}

export type DayStart = 'midnight' | 'zi-hour';

export interface PillarPart {
  index: number;
  pinyin: string;
  hanzi: string;
  element: string;
  polarity: 'yin' | 'yang';
}

export interface Pillar {
  name: 'Year' | 'Month' | 'Day' | 'Hour';
  stem: PillarPart & { tenGod: TenGod | null };
  branch: PillarPart & { animal: string };
  hidden: Array<PillarPart & { tenGod: TenGod }>;
}

export interface LuckPillar {
  stem: PillarPart;
  branch: PillarPart & { animal: string };
  tenGod: TenGod;
  fromAge: number;
  toAge: number;
  fromYear: number;
}

export interface LuckDirection {
  /** Age at which the first luck pillar begins, in years and months. */
  startAge: { years: number; months: number };
  pillars: LuckPillar[];
}

/** The pillar of one solar year (Liu Nian), which begins at Lichun, early February. */
export interface AnnualPillar {
  year: number;
  stem: PillarPart;
  branch: PillarPart & { animal: string };
  tenGod: TenGod;
}

export interface FourPillars {
  pillars: [Pillar, Pillar, Pillar, Pillar];
  dayMaster: PillarPart;
  /** Count of the eight stems and branches by element (main element of each branch). */
  elements: Record<'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water', number>;
  yearPolarity: 'yin' | 'yang';
  luck: { forward: LuckDirection; backward: LuckDirection };
  /** Elapsed years from birth to the moment of calculation. */
  ageNow: number;
  /** The year of the moment of calculation, and the solar year it falls in. */
  now: { calendarYear: number; solarYear: number };
  /** Annual pillars from the solar year of birth, one per year, for a century. */
  annual: AnnualPillar[];
  dayStart: DayStart;
  method: string;
}

function stemPart(index: number): PillarPart {
  const s = STEMS[index];
  return { index, pinyin: s.pinyin, hanzi: s.hanzi, element: s.element, polarity: s.polarity };
}

function branchPart(index: number): PillarPart & { animal: string } {
  const b = BRANCHES[index];
  return { index, pinyin: b.pinyin, hanzi: b.hanzi, element: b.element, polarity: b.polarity, animal: b.animal };
}

/** The Sun's apparent ecliptic longitude of date, in degrees. */
function sunLongitude(instant: Date): number {
  return Astronomy.SunPosition(instant).elon;
}

function solarTerm(longitude: number, from: Date, limitDays: number): Date {
  const found = Astronomy.SearchSunLongitude(mod(longitude, 360), from, limitDays);
  if (!found) throw new Error('SOLAR_TERM_NOT_FOUND');
  return found.date;
}

/** Lichun (the Sun at 315°) in a Gregorian year. */
export function lichun(year: number): Date {
  return solarTerm(315, new Date(Date.UTC(year, 0, 1)), 60);
}

const DAY_MS = 86_400_000;

/**
 * @param instant the birth instant (UTC)
 * @param localDate the local civil birth date, YYYY-MM-DD
 * @param localTime the local clock time, HH:MM
 */
export function calculateFourPillars(
  instant: Date, localDate: string, localTime: string, dayStart: DayStart = 'midnight', now: Date = new Date(),
): FourPillars {
  const [y, mo, d] = localDate.split('-').map(Number);
  const [hh, mm] = localTime.split(':').map(Number);

  // Year: the solar year begins at Lichun.
  const solarYear = instant.getTime() < lichun(y).getTime() ? y - 1 : y;
  const yearStem = mod(solarYear - 4, 10);
  const yearBranch = mod(solarYear - 4, 12);

  // Month: 0 = the Tiger month that begins at Lichun; each month begins 30° on.
  const monthNumber = Math.floor(mod(sunLongitude(instant) - 315, 360) / 30);
  const monthStem = mod((yearStem % 5) * 2 + 2 + monthNumber, 10);
  const monthBranch = mod(2 + monthNumber, 12);

  // Day: the 60-day count of the local date; from 23:00 the Zi hour belongs
  // to the next day's hour stems, and under 'zi-hour' the day pillar turns too.
  const lateZi = hh >= 23;
  const next = new Date(Date.UTC(y, mo - 1, d + 1));
  const nextIndex = dayCycleIndex(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate());
  const dayIndex = dayStart === 'zi-hour' && lateZi ? nextIndex : dayCycleIndex(y, mo, d);
  const dayStem = dayIndex % 10;
  const dayBranch = dayIndex % 12;

  // Hour: two-hour branches from 23:00; stems by the Five Rats rule.
  const hourBranch = Math.floor((hh * 60 + mm + 60) / 120) % 12;
  const hourDayStem = lateZi ? nextIndex % 10 : dayStem;
  const hourStem = mod((hourDayStem % 5) * 2 + hourBranch, 10);

  const pillar = (name: Pillar['name'], stem: number, branch: number): Pillar => ({
    name,
    stem: { ...stemPart(stem), tenGod: name === 'Day' ? null : tenGod(dayStem, stem) },
    branch: branchPart(branch),
    hidden: BRANCHES[branch].hidden.map((h) => ({ ...stemPart(h), tenGod: tenGod(dayStem, h) })),
  });
  const pillars: FourPillars['pillars'] = [
    pillar('Year', yearStem, yearBranch),
    pillar('Month', monthStem, monthBranch),
    pillar('Day', dayStem, dayBranch),
    pillar('Hour', hourStem, hourBranch),
  ];

  const elements = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
  for (const p of pillars) {
    elements[p.stem.element as keyof typeof elements] += 1;
    elements[p.branch.element as keyof typeof elements] += 1;
  }

  // Luck pillars: three days to the neighbouring "jie" term make one year.
  const monthStart = 315 + 30 * monthNumber;
  const nextTerm = solarTerm(monthStart + 30, instant, 40);
  const previousTerm = solarTerm(monthStart, new Date(instant.getTime() - 40 * DAY_MS), 40);
  const monthIndex = cycleIndex(monthStem, monthBranch);
  const luck = (step: 1 | -1, days: number): LuckDirection => {
    const totalMonths = Math.round(days * 4); // one day = four months
    const start = totalMonths / 12;
    return {
      startAge: { years: Math.floor(totalMonths / 12), months: totalMonths % 12 },
      pillars: Array.from({ length: 8 }, (_, k) => {
        const index = mod(monthIndex + step * (k + 1), 60);
        const fromAge = Number((start + 10 * k).toFixed(2));
        return {
          stem: stemPart(index % 10),
          branch: branchPart(index % 12),
          tenGod: tenGod(dayStem, index % 10),
          fromAge,
          toAge: Number((fromAge + 10).toFixed(2)),
          fromYear: new Date(instant.getTime() + (start + 10 * k) * 365.2425 * DAY_MS).getUTCFullYear(),
        };
      }),
    };
  };

  return {
    pillars,
    dayMaster: stemPart(dayStem),
    elements,
    yearPolarity: STEMS[yearStem].polarity,
    luck: {
      forward: luck(1, (nextTerm.getTime() - instant.getTime()) / DAY_MS),
      backward: luck(-1, (instant.getTime() - previousTerm.getTime()) / DAY_MS),
    },
    ageNow: Number(((now.getTime() - instant.getTime()) / (365.2425 * DAY_MS)).toFixed(2)),
    now: {
      calendarYear: now.getUTCFullYear(),
      solarYear: now.getTime() < lichun(now.getUTCFullYear()).getTime() ? now.getUTCFullYear() - 1 : now.getUTCFullYear(),
    },
    annual: Array.from({ length: 101 }, (_, k) => {
      const year = solarYear + k;
      return {
        year,
        stem: stemPart(mod(year - 4, 10)),
        branch: branchPart(mod(year - 4, 12)),
        tenGod: tenGod(dayStem, mod(year - 4, 10)),
      };
    }),
    dayStart,
    method: 'Year and month pillars turn at the solar terms (the year at Lichun, the Sun at 315°), calculated for the birth instant. The day pillar is the 60-day count of the local birth date; the hour pillar uses local clock time, not true solar time. Hidden stems and Ten Gods are the standard tables. Luck pillars begin after three days to the neighbouring solar term per year of age, rounded to the month; ages are elapsed years and the calendar year each begins is approximate.',
  };
}
