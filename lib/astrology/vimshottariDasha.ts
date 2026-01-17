/**
 * Vimshottari Dasha Calculator
 *
 * Calculates the 120-year planetary period system used in Vedic astrology.
 * Based on the Moon's nakshatra position at birth.
 *
 * Follows the pattern of daYunCalculator.ts for consistency.
 */

import { getNakshatraFromLongitude } from './vedicAstrology';
import {
  DashaRuler,
  DashaPeriod,
  VimshottariDashaProfile,
  MAHADASHA_SEQUENCE,
  GRAHAS,
  NakshatraInfo,
} from './types/vedic';

/** Total years in the Vimshottari cycle */
const VIMSHOTTARI_TOTAL_YEARS = 120;

/** Milliseconds per year (using average year of 365.25 days) */
const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

/**
 * Add years to a date
 */
function addYears(date: Date, years: number): Date {
  return new Date(date.getTime() + years * MS_PER_YEAR);
}

/**
 * Calculate years between two dates
 */
function yearsBetween(startDate: Date, endDate: Date): number {
  return (endDate.getTime() - startDate.getTime()) / MS_PER_YEAR;
}

/**
 * Get the Mahadasha info for a given ruler
 */
function getMahadashaInfo(ruler: DashaRuler) {
  return MAHADASHA_SEQUENCE.find((m) => m.ruler === ruler)!;
}

/**
 * Calculate Vimshottari Dasha periods for a birth chart
 *
 * The Vimshottari Dasha system assigns planetary periods based on the Moon's
 * nakshatra at birth. Each nakshatra has a ruling planet, and the person's
 * first dasha is determined by this ruler.
 *
 * The balance of the first dasha depends on how far through the nakshatra
 * the Moon has progressed at birth.
 *
 * @param birthDate - Date of birth
 * @param moonSiderealLongitude - Moon's sidereal longitude at birth (0-360)
 * @returns Complete Vimshottari Dasha profile
 */
export function calculateVimshottariDasha(
  birthDate: Date,
  moonSiderealLongitude: number
): VimshottariDashaProfile {
  // Get birth nakshatra
  const { nakshatra, degreeInNakshatra } =
    getNakshatraFromLongitude(moonSiderealLongitude);

  // Calculate balance at birth
  // The proportion elapsed through the nakshatra determines how much
  // of the first dasha has already "passed" at birth
  const nakshatraSpan = 360 / 27; // 13.333...°
  const proportionElapsed = degreeInNakshatra / nakshatraSpan;

  // Get the starting dasha ruler from the nakshatra
  const startingRuler = nakshatra.ruler;
  const startingDashaYears = GRAHAS[startingRuler].vimshottariYears;

  // Balance at birth = remaining portion of first dasha
  const balanceAtBirth = startingDashaYears * (1 - proportionElapsed);

  // Build all Mahadasha periods
  const mahadashas: DashaPeriod[] = [];
  let currentDate = new Date(birthDate);

  // Find the index of the starting ruler in the sequence
  const startingIndex = MAHADASHA_SEQUENCE.findIndex(
    (m) => m.ruler === startingRuler
  );

  // First period (partial - balance at birth)
  const firstEndDate = addYears(currentDate, balanceAtBirth);
  mahadashas.push({
    ruler: startingRuler,
    startDate: new Date(birthDate),
    endDate: firstEndDate,
    durationYears: balanceAtBirth,
    isActive: false,
    isPast: false,
    isFuture: false,
  });
  currentDate = firstEndDate;

  // Remaining full periods (cycle through the sequence)
  for (let i = 1; i < 9; i++) {
    const sequenceIndex = (startingIndex + i) % 9;
    const info = MAHADASHA_SEQUENCE[sequenceIndex];
    const endDate = addYears(currentDate, info.years);

    mahadashas.push({
      ruler: info.ruler,
      startDate: new Date(currentDate),
      endDate,
      durationYears: info.years,
      isActive: false,
      isPast: false,
      isFuture: false,
    });
    currentDate = endDate;
  }

  // Mark active/past/future
  const now = new Date();
  mahadashas.forEach((period) => {
    if (now >= period.startDate && now < period.endDate) {
      period.isActive = true;
    } else if (now >= period.endDate) {
      period.isPast = true;
    } else {
      period.isFuture = true;
    }
  });

  // Find current, previous, and next mahadashas
  const currentMahadasha =
    mahadashas.find((p) => p.isActive) || mahadashas[mahadashas.length - 1];

  const currentIndex = mahadashas.findIndex((p) => p.isActive);
  const previousMahadasha =
    currentIndex > 0 ? mahadashas[currentIndex - 1] : null;
  const nextMahadasha =
    currentIndex >= 0 && currentIndex < mahadashas.length - 1
      ? mahadashas[currentIndex + 1]
      : null;

  // Calculate Antardashas (sub-periods) for the current Mahadasha
  if (currentMahadasha) {
    currentMahadasha.subPeriods = calculateAntardashas(currentMahadasha);
  }

  // Find current Antardasha
  const currentAntardasha =
    currentMahadasha.subPeriods?.find((p) => p.isActive) || null;

  return {
    birthNakshatra: nakshatra,
    moonLongitude: moonSiderealLongitude,
    balanceAtBirth,
    mahadashas,
    currentMahadasha,
    currentAntardasha,
    previousMahadasha,
    nextMahadasha,
  };
}

/**
 * Calculate Antardasha (sub-periods) within a Mahadasha
 *
 * Each Mahadasha contains 9 Antardashas, one for each planet in the sequence.
 * The Antardasha periods start with the Mahadasha ruler and proceed through
 * the Vimshottari sequence.
 *
 * Duration formula:
 * Antardasha duration = (Mahadasha years × Antardasha ruler years) / 120
 *
 * @param mahadasha - The parent Mahadasha period
 * @returns Array of Antardasha periods
 */
export function calculateAntardashas(mahadasha: DashaPeriod): DashaPeriod[] {
  const subPeriods: DashaPeriod[] = [];

  // Find starting index (Antardashas start with the Mahadasha ruler)
  const startIndex = MAHADASHA_SEQUENCE.findIndex(
    (m) => m.ruler === mahadasha.ruler
  );

  let currentDate = new Date(mahadasha.startDate);
  const now = new Date();

  for (let i = 0; i < 9; i++) {
    const sequenceIndex = (startIndex + i) % 9;
    const ruler = MAHADASHA_SEQUENCE[sequenceIndex].ruler;
    const rulerYears = GRAHAS[ruler].vimshottariYears;

    // Antardasha duration = (Mahadasha × Ruler years) / 120
    const durationYears =
      (mahadasha.durationYears * rulerYears) / VIMSHOTTARI_TOTAL_YEARS;
    const endDate = addYears(currentDate, durationYears);

    const isActive = now >= currentDate && now < endDate;
    const isPast = now >= endDate;
    const isFuture = now < currentDate;

    subPeriods.push({
      ruler,
      startDate: new Date(currentDate),
      endDate,
      durationYears,
      isActive,
      isPast,
      isFuture,
    });

    currentDate = endDate;
  }

  return subPeriods;
}

/**
 * Calculate Pratyantardasha (sub-sub-periods) within an Antardasha
 *
 * Same principle as Antardashas but one level deeper.
 *
 * @param antardasha - The parent Antardasha period
 * @returns Array of Pratyantardasha periods
 */
export function calculatePratyantardashas(
  antardasha: DashaPeriod
): DashaPeriod[] {
  const subPeriods: DashaPeriod[] = [];

  const startIndex = MAHADASHA_SEQUENCE.findIndex(
    (m) => m.ruler === antardasha.ruler
  );

  let currentDate = new Date(antardasha.startDate);
  const now = new Date();

  for (let i = 0; i < 9; i++) {
    const sequenceIndex = (startIndex + i) % 9;
    const ruler = MAHADASHA_SEQUENCE[sequenceIndex].ruler;
    const rulerYears = GRAHAS[ruler].vimshottariYears;

    // Pratyantardasha duration = (Antardasha × Ruler years) / 120
    const durationYears =
      (antardasha.durationYears * rulerYears) / VIMSHOTTARI_TOTAL_YEARS;
    const endDate = addYears(currentDate, durationYears);

    const isActive = now >= currentDate && now < endDate;
    const isPast = now >= endDate;
    const isFuture = now < currentDate;

    subPeriods.push({
      ruler,
      startDate: new Date(currentDate),
      endDate,
      durationYears,
      isActive,
      isPast,
      isFuture,
    });

    currentDate = endDate;
  }

  return subPeriods;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get the remaining time in current dasha period
 */
export function getRemainingTime(period: DashaPeriod): {
  years: number;
  months: number;
  days: number;
} {
  const now = new Date();
  if (now >= period.endDate) {
    return { years: 0, months: 0, days: 0 };
  }

  const remainingMs = period.endDate.getTime() - now.getTime();
  const totalDays = remainingMs / (24 * 60 * 60 * 1000);

  const years = Math.floor(totalDays / 365.25);
  const remainingDaysAfterYears = totalDays - years * 365.25;
  const months = Math.floor(remainingDaysAfterYears / 30.44);
  const days = Math.floor(remainingDaysAfterYears - months * 30.44);

  return { years, months, days };
}

/**
 * Get progress through current dasha period (0-1)
 */
export function getDashaProgress(period: DashaPeriod): number {
  const now = new Date();
  if (now <= period.startDate) return 0;
  if (now >= period.endDate) return 1;

  const total = period.endDate.getTime() - period.startDate.getTime();
  const elapsed = now.getTime() - period.startDate.getTime();

  return elapsed / total;
}

/**
 * Get the age at which a dasha period starts
 */
export function getAgeAtDashaStart(
  birthDate: Date,
  period: DashaPeriod
): number {
  return yearsBetween(birthDate, period.startDate);
}

/**
 * Get the age range for a dasha period
 */
export function getAgeRangeForDasha(
  birthDate: Date,
  period: DashaPeriod
): { start: number; end: number } {
  return {
    start: yearsBetween(birthDate, period.startDate),
    end: yearsBetween(birthDate, period.endDate),
  };
}

/**
 * Format dasha period as string
 */
export function formatDashaPeriod(period: DashaPeriod): string {
  const startYear = period.startDate.getFullYear();
  const endYear = period.endDate.getFullYear();
  const graha = GRAHAS[period.ruler];

  return `${graha.westernName} (${graha.name}) Dasha: ${startYear} - ${endYear}`;
}

/**
 * Format remaining time as string
 */
export function formatRemainingTime(remaining: {
  years: number;
  months: number;
  days: number;
}): string {
  const parts: string[] = [];

  if (remaining.years > 0) {
    parts.push(`${remaining.years} year${remaining.years !== 1 ? 's' : ''}`);
  }
  if (remaining.months > 0) {
    parts.push(`${remaining.months} month${remaining.months !== 1 ? 's' : ''}`);
  }
  if (remaining.days > 0 && remaining.years === 0) {
    parts.push(`${remaining.days} day${remaining.days !== 1 ? 's' : ''}`);
  }

  return parts.join(', ') || 'Complete';
}

/**
 * Get dasha summary for quick display
 */
export function getDashaSummary(profile: VimshottariDashaProfile): {
  currentMahadasha: string;
  currentAntardasha: string;
  remainingInMahadasha: string;
  progress: number;
} {
  const mahadashaInfo = getMahadashaInfo(profile.currentMahadasha.ruler);
  const remaining = getRemainingTime(profile.currentMahadasha);
  const progress = getDashaProgress(profile.currentMahadasha);

  return {
    currentMahadasha: `${GRAHAS[profile.currentMahadasha.ruler].westernName} Mahadasha`,
    currentAntardasha: profile.currentAntardasha
      ? `${GRAHAS[profile.currentAntardasha.ruler].westernName} Antardasha`
      : 'N/A',
    remainingInMahadasha: formatRemainingTime(remaining),
    progress,
  };
}

/**
 * Get themes and guidance for current dasha period
 */
export function getDashaGuidance(ruler: DashaRuler): {
  themes: string[];
  opportunities: string[];
  challenges: string[];
  healthFocus: string[];
  spiralogicConnection: string;
} {
  const info = getMahadashaInfo(ruler);
  return {
    themes: info.themes,
    opportunities: info.opportunities,
    challenges: info.challenges,
    healthFocus: info.healthFocus,
    spiralogicConnection: info.spiralogicConnection,
  };
}

/**
 * Get dasha timeline for visualization
 * Returns a simplified array suitable for timeline rendering
 */
export function getDashaTimelineData(
  profile: VimshottariDashaProfile,
  birthDate: Date
): Array<{
  ruler: DashaRuler;
  rulerName: string;
  westernName: string;
  startAge: number;
  endAge: number;
  years: number;
  isActive: boolean;
  isPast: boolean;
  isFuture: boolean;
  color: string;
}> {
  // Colors for each planet (matching traditional Jyotish associations)
  const colors: Record<DashaRuler, string> = {
    Ketu: '#9333ea', // Purple (spiritual)
    Shukra: '#ec4899', // Pink (love/beauty)
    Surya: '#f59e0b', // Amber (vitality)
    Chandra: '#f5f5f5', // White (mind)
    Mangala: '#dc2626', // Red (energy)
    Rahu: '#1e3a5f', // Dark blue (shadow)
    Guru: '#eab308', // Gold (wisdom)
    Shani: '#374151', // Gray (karma)
    Budha: '#22c55e', // Green (intelligence)
  };

  return profile.mahadashas.map((period) => {
    const ages = getAgeRangeForDasha(birthDate, period);
    return {
      ruler: period.ruler,
      rulerName: GRAHAS[period.ruler].name,
      westernName: GRAHAS[period.ruler].westernName,
      startAge: Math.max(0, Math.round(ages.start)),
      endAge: Math.round(ages.end),
      years: period.durationYears,
      isActive: period.isActive,
      isPast: period.isPast,
      isFuture: period.isFuture,
      color: colors[period.ruler],
    };
  });
}
