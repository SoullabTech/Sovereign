/**
 * Da Yun (大運) Calculator
 *
 * Calculates 10-year luck cycles based on the Four Pillars (Ba Zi) system.
 * Da Yun reveals the major life periods that shape destiny, showing where
 * you come from, where you are, and where you're heading.
 *
 * Key concepts:
 * - Cycle direction: Based on gender + year stem polarity
 * - Start age: Distance from birth to next/previous solar term
 * - Luck pillars: Derived from month pillar, progressing through the 60 Jia Zi cycle
 */

import {
  DaYunProfile,
  DaYunPeriod,
  Gender,
  YinYang,
  CycleDirection,
  Element,
  HarmonyLevel,
  StemInfo,
  BranchInfo,
  ElementTCMMapping,
  SolarTerm,
} from './types/daYun';

import { generateFourPillars, FourPillarsProfile } from '@/app/api/_backend/src/services/fourPillarsService';

// ==================== CONSTANTS ====================

/** Ten Heavenly Stems (天干) with full info */
export const STEMS: StemInfo[] = [
  { name: 'Jia', chinese: '甲', element: 'Wood', yinYang: 'Yang' },
  { name: 'Yi', chinese: '乙', element: 'Wood', yinYang: 'Yin' },
  { name: 'Bing', chinese: '丙', element: 'Fire', yinYang: 'Yang' },
  { name: 'Ding', chinese: '丁', element: 'Fire', yinYang: 'Yin' },
  { name: 'Wu', chinese: '戊', element: 'Earth', yinYang: 'Yang' },
  { name: 'Ji', chinese: '己', element: 'Earth', yinYang: 'Yin' },
  { name: 'Geng', chinese: '庚', element: 'Metal', yinYang: 'Yang' },
  { name: 'Xin', chinese: '辛', element: 'Metal', yinYang: 'Yin' },
  { name: 'Ren', chinese: '壬', element: 'Water', yinYang: 'Yang' },
  { name: 'Gui', chinese: '癸', element: 'Water', yinYang: 'Yin' },
];

/** Twelve Earthly Branches (地支) with full info */
export const BRANCHES: BranchInfo[] = [
  { name: 'Zi', chinese: '子', element: 'Water', yinYang: 'Yang', zodiacAnimal: 'Rat', zodiacEmoji: '🐭' },
  { name: 'Chou', chinese: '丑', element: 'Earth', yinYang: 'Yin', zodiacAnimal: 'Ox', zodiacEmoji: '🐂' },
  { name: 'Yin', chinese: '寅', element: 'Wood', yinYang: 'Yang', zodiacAnimal: 'Tiger', zodiacEmoji: '🐅' },
  { name: 'Mao', chinese: '卯', element: 'Wood', yinYang: 'Yin', zodiacAnimal: 'Rabbit', zodiacEmoji: '🐰' },
  { name: 'Chen', chinese: '辰', element: 'Earth', yinYang: 'Yang', zodiacAnimal: 'Dragon', zodiacEmoji: '🐉' },
  { name: 'Si', chinese: '巳', element: 'Fire', yinYang: 'Yin', zodiacAnimal: 'Snake', zodiacEmoji: '🐍' },
  { name: 'Wu', chinese: '午', element: 'Fire', yinYang: 'Yang', zodiacAnimal: 'Horse', zodiacEmoji: '🐴' },
  { name: 'Wei', chinese: '未', element: 'Earth', yinYang: 'Yin', zodiacAnimal: 'Sheep', zodiacEmoji: '🐑' },
  { name: 'Shen', chinese: '申', element: 'Metal', yinYang: 'Yang', zodiacAnimal: 'Monkey', zodiacEmoji: '🐒' },
  { name: 'You', chinese: '酉', element: 'Metal', yinYang: 'Yin', zodiacAnimal: 'Rooster', zodiacEmoji: '🐓' },
  { name: 'Xu', chinese: '戌', element: 'Earth', yinYang: 'Yang', zodiacAnimal: 'Dog', zodiacEmoji: '🐕' },
  { name: 'Hai', chinese: '亥', element: 'Water', yinYang: 'Yin', zodiacAnimal: 'Pig', zodiacEmoji: '🐷' },
];

/** Solar terms (Jie Qi) - the 12 major terms that mark month boundaries */
export const SOLAR_TERMS: SolarTerm[] = [
  { name: 'Spring Begins', chineseName: '立春', month: 2, approximateDay: 4 },
  { name: 'Insects Awaken', chineseName: '惊蛰', month: 3, approximateDay: 6 },
  { name: 'Clear and Bright', chineseName: '清明', month: 4, approximateDay: 5 },
  { name: 'Summer Begins', chineseName: '立夏', month: 5, approximateDay: 6 },
  { name: 'Grain in Ear', chineseName: '芒种', month: 6, approximateDay: 6 },
  { name: 'Slight Heat', chineseName: '小暑', month: 7, approximateDay: 7 },
  { name: 'Autumn Begins', chineseName: '立秋', month: 8, approximateDay: 8 },
  { name: 'White Dew', chineseName: '白露', month: 9, approximateDay: 8 },
  { name: 'Cold Dew', chineseName: '寒露', month: 10, approximateDay: 8 },
  { name: 'Winter Begins', chineseName: '立冬', month: 11, approximateDay: 7 },
  { name: 'Heavy Snow', chineseName: '大雪', month: 12, approximateDay: 7 },
  { name: 'Slight Cold', chineseName: '小寒', month: 1, approximateDay: 6 },
];

/** Element to TCM mapping for health guidance */
export const ELEMENT_TCM_MAP: ElementTCMMapping[] = [
  {
    element: 'Wood',
    yinOrgan: 'Liver',
    yangOrgan: 'Gallbladder',
    spirit: 'Hun',
    spiritDescription: 'The Ethereal Soul - governs vision, planning, and dreams',
    season: 'Spring',
    lifeStage: 'Birth and Childhood',
    healthFocus: [
      'Cultivate flexibility in body and mind',
      'Express emotions freely to keep Liver qi flowing',
      'Spend time in nature, especially forests',
      'Practice gentle stretching and movement',
      'Eat green, leafy vegetables',
    ],
  },
  {
    element: 'Fire',
    yinOrgan: 'Heart',
    yangOrgan: 'Small Intestine',
    spirit: 'Shen',
    spiritDescription: 'The Spirit - governs consciousness, joy, and connection',
    season: 'Summer',
    lifeStage: 'Youth and Growth',
    healthFocus: [
      'Nurture joy and meaningful connections',
      'Protect sleep to restore the Shen',
      'Practice heart-opening activities',
      'Engage in creative expression',
      'Eat bitter foods to clear Heart fire',
    ],
  },
  {
    element: 'Earth',
    yinOrgan: 'Spleen',
    yangOrgan: 'Stomach',
    spirit: 'Yi',
    spiritDescription: 'The Intellect - governs thought, focus, and nourishment',
    season: 'Late Summer',
    lifeStage: 'Maturity and Stability',
    healthFocus: [
      'Establish stable routines and rhythms',
      'Eat warm, cooked foods at regular times',
      'Avoid excessive worry and overthinking',
      'Practice grounding and centering',
      'Nurture supportive relationships',
    ],
  },
  {
    element: 'Metal',
    yinOrgan: 'Lung',
    yangOrgan: 'Large Intestine',
    spirit: 'Po',
    spiritDescription: 'The Corporeal Soul - governs breath, boundaries, and letting go',
    season: 'Autumn',
    lifeStage: 'Harvest and Refinement',
    healthFocus: [
      'Practice breathwork and meditation',
      'Release what no longer serves you',
      'Maintain clear boundaries',
      'Honor grief as a teacher',
      'Eat white, pungent foods (garlic, onion, radish)',
    ],
  },
  {
    element: 'Water',
    yinOrgan: 'Kidney',
    yangOrgan: 'Bladder',
    spirit: 'Zhi',
    spiritDescription: 'The Will - governs wisdom, essence, and determination',
    season: 'Winter',
    lifeStage: 'Wisdom and Essence',
    healthFocus: [
      'Rest deeply to conserve Kidney essence',
      'Face fears to strengthen willpower',
      'Eat dark, salty foods (seaweed, bone broth)',
      'Protect lower back and knees',
      'Cultivate wisdom through reflection',
    ],
  },
];

/** Life themes for each decade based on element and cycle position */
const DECADE_THEMES: Record<Element, { early: string; mid: string; late: string }> = {
  Wood: {
    early: 'Planting Seeds',
    mid: 'Growth and Expansion',
    late: 'Reaching Toward Light',
  },
  Fire: {
    early: 'Kindling Passion',
    mid: 'Full Radiance',
    late: 'Illuminating Others',
  },
  Earth: {
    early: 'Building Foundation',
    mid: 'Stable Ground',
    late: 'Nurturing Harvest',
  },
  Metal: {
    early: 'Refining Purpose',
    mid: 'Cutting Through',
    late: 'Precious Wisdom',
  },
  Water: {
    early: 'Deep Currents',
    mid: 'Flowing Power',
    late: 'Ocean of Wisdom',
  },
};

// ==================== HELPER FUNCTIONS ====================

function getStemInfo(stemName: string): StemInfo {
  return STEMS.find(s => s.name === stemName) || STEMS[0];
}

function getBranchInfo(branchName: string): BranchInfo {
  return BRANCHES.find(b => b.name === branchName) || BRANCHES[0];
}

function getStemIndex(stemName: string): number {
  return STEMS.findIndex(s => s.name === stemName);
}

function getBranchIndex(branchName: string): number {
  return BRANCHES.findIndex(b => b.name === branchName);
}

function getTCMMapping(element: Element): ElementTCMMapping {
  return ELEMENT_TCM_MAP.find(m => m.element === element) || ELEMENT_TCM_MAP[0];
}

/**
 * Determine cycle direction based on gender and year stem polarity
 * - Male + Yang year OR Female + Yin year = Forward
 * - Male + Yin year OR Female + Yang year = Backward
 */
function determineCycleDirection(gender: Gender, yearStemYinYang: YinYang): CycleDirection {
  if (gender === 'male') {
    return yearStemYinYang === 'Yang' ? 'forward' : 'backward';
  } else {
    return yearStemYinYang === 'Yin' ? 'forward' : 'backward';
  }
}

/**
 * Calculate Da Yun start age based on distance to solar term
 * Simplified calculation: days to next/previous term divided by 3
 */
function calculateStartAge(birthDate: Date, cycleDirection: CycleDirection): number {
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();

  // Find the relevant solar term
  const currentTermIndex = SOLAR_TERMS.findIndex(t => t.month === month);
  const currentTerm = SOLAR_TERMS[currentTermIndex];
  const nextTerm = SOLAR_TERMS[(currentTermIndex + 1) % 12];
  const prevTerm = SOLAR_TERMS[(currentTermIndex + 11) % 12];

  let daysDifference: number;

  if (cycleDirection === 'forward') {
    // Count days to next solar term
    if (day < currentTerm.approximateDay) {
      daysDifference = currentTerm.approximateDay - day;
    } else {
      // Days remaining in month + days to next term
      const daysInMonth = new Date(birthDate.getFullYear(), month, 0).getDate();
      daysDifference = (daysInMonth - day) + nextTerm.approximateDay;
    }
  } else {
    // Count days from previous solar term
    if (day >= currentTerm.approximateDay) {
      daysDifference = day - currentTerm.approximateDay;
    } else {
      daysDifference = day + (30 - prevTerm.approximateDay);
    }
  }

  // Divide by 3 to get start age (traditional formula)
  const startAge = Math.round(daysDifference / 3);

  // Clamp between 1 and 10
  return Math.max(1, Math.min(10, startAge));
}

/**
 * Progress through the 60 Jia Zi cycle
 */
function getNextStemBranch(
  stemName: string,
  branchName: string,
  direction: CycleDirection
): { stem: StemInfo; branch: BranchInfo } {
  const stemIndex = getStemIndex(stemName);
  const branchIndex = getBranchIndex(branchName);

  const delta = direction === 'forward' ? 1 : -1;

  const newStemIndex = (stemIndex + delta + 10) % 10;
  const newBranchIndex = (branchIndex + delta + 12) % 12;

  return {
    stem: STEMS[newStemIndex],
    branch: BRANCHES[newBranchIndex],
  };
}

/**
 * Calculate harmony between a period element and the natal day master
 */
function calculateHarmony(periodElement: Element, dayMasterElement: Element): HarmonyLevel {
  // Generation cycle (supportive)
  const generates: Record<Element, Element> = {
    Wood: 'Fire',
    Fire: 'Earth',
    Earth: 'Metal',
    Metal: 'Water',
    Water: 'Wood',
  };

  // Control cycle (challenging)
  const controls: Record<Element, Element> = {
    Wood: 'Earth',
    Fire: 'Metal',
    Earth: 'Water',
    Metal: 'Wood',
    Water: 'Fire',
  };

  // Same element or generated by period
  if (periodElement === dayMasterElement || generates[periodElement] === dayMasterElement) {
    return 'supportive';
  }

  // Period controls day master or is controlled by day master
  if (controls[periodElement] === dayMasterElement || controls[dayMasterElement] === periodElement) {
    return 'challenging';
  }

  return 'neutral';
}

/**
 * Generate opportunities based on element and harmony
 */
function generateOpportunities(element: Element, harmony: HarmonyLevel): string[] {
  const elementOpportunities: Record<Element, string[]> = {
    Wood: ['Creative projects flourish', 'New beginnings and fresh starts', 'Learning and growth opportunities', 'Building new relationships'],
    Fire: ['Recognition and visibility', 'Leadership roles emerge', 'Passionate pursuits succeed', 'Joy and celebration'],
    Earth: ['Financial stability grows', 'Real estate opportunities', 'Family bonds strengthen', 'Building lasting foundations'],
    Metal: ['Career advancement', 'Refinement of skills', 'Clear decision-making', 'Cutting away what doesn\'t serve'],
    Water: ['Deep wisdom emerges', 'Intuition strengthens', 'Spiritual growth', 'Flowing with change'],
  };

  const base = elementOpportunities[element];

  if (harmony === 'supportive') {
    return [...base, 'Energy flows easily toward your goals'];
  } else if (harmony === 'challenging') {
    return [base[0], 'Growth through overcoming obstacles'];
  }

  return base.slice(0, 3);
}

/**
 * Generate challenges based on element and harmony
 */
function generateChallenges(element: Element, harmony: HarmonyLevel): string[] {
  const elementChallenges: Record<Element, string[]> = {
    Wood: ['Impatience with slow progress', 'Anger when blocked', 'Over-extension of resources'],
    Fire: ['Burnout from excess activity', 'Scattered attention', 'Anxiety and restlessness'],
    Earth: ['Resistance to necessary change', 'Worry and overthinking', 'Stagnation in comfort zones'],
    Metal: ['Grief and letting go', 'Rigidity in thinking', 'Isolation from others'],
    Water: ['Fear of the unknown', 'Depression or withdrawal', 'Lack of direction'],
  };

  const base = elementChallenges[element];

  if (harmony === 'challenging') {
    return [...base, 'Friction requiring patience and adaptation'];
  }

  return base.slice(0, 2);
}

/**
 * Get decade description based on element and cycle position
 */
function getDecadeDescription(element: Element, cycleNumber: number, totalCycles: number): string {
  const position = cycleNumber <= totalCycles / 3 ? 'early' : cycleNumber <= (totalCycles * 2) / 3 ? 'mid' : 'late';
  const theme = DECADE_THEMES[element][position];

  const tcm = getTCMMapping(element);
  return `A decade of ${theme}, governed by ${element} energy. Focus on the ${tcm.yinOrgan} and ${tcm.yangOrgan}, cultivating the ${tcm.spirit} (${tcm.spiritDescription.split(' - ')[0]}).`;
}

// ==================== MAIN CALCULATOR ====================

/**
 * Calculate complete Da Yun profile
 */
export function calculateDaYun(
  birthDate: Date,
  gender: Gender,
  birthTime?: string,
  tzOffsetMinutes = 0
): DaYunProfile {
  // Generate Four Pillars
  const fourPillars = generateFourPillars(birthDate, tzOffsetMinutes);

  // Get year stem info for direction calculation
  const yearStemInfo = getStemInfo(fourPillars.year.stem);

  // Determine cycle direction
  const cycleDirection = determineCycleDirection(gender, yearStemInfo.yinYang);

  // Calculate start age
  const daYunStartAge = calculateStartAge(birthDate, cycleDirection);

  // Get day master element for harmony calculations
  const dayMasterElement = fourPillars.day.element;

  // Generate 10 decades of luck cycles (covering ages roughly 0-100)
  const totalCycles = 10;
  const periods: DaYunPeriod[] = [];

  let currentStem = fourPillars.month.stem;
  let currentBranch = fourPillars.month.branch;

  for (let i = 1; i <= totalCycles; i++) {
    // Progress to next/previous stem-branch in cycle
    const next = getNextStemBranch(currentStem, currentBranch, cycleDirection);
    currentStem = next.stem.name;
    currentBranch = next.branch.name;

    const stemInfo = next.stem;
    const branchInfo = next.branch;
    const element = stemInfo.element;
    const tcm = getTCMMapping(element);
    const harmony = calculateHarmony(element, dayMasterElement);

    const ageStart = daYunStartAge + (i - 1) * 10;
    const ageEnd = ageStart + 9;

    const period: DaYunPeriod = {
      cycleNumber: i,
      ageRange: { start: ageStart, end: ageEnd },
      heavenlyStem: stemInfo.name,
      stemChinese: stemInfo.chinese,
      earthlyBranch: branchInfo.name,
      branchChinese: branchInfo.chinese,
      zodiacAnimal: branchInfo.zodiacAnimal,
      element,
      yinYang: stemInfo.yinYang,
      lifeTheme: DECADE_THEMES[element][i <= 3 ? 'early' : i <= 6 ? 'mid' : 'late'],
      description: getDecadeDescription(element, i, totalCycles),
      organFocus: {
        yin: tcm.yinOrgan,
        yang: tcm.yangOrgan,
      },
      spiritFocus: tcm.spirit,
      spiritDescription: tcm.spiritDescription,
      healthGuidance: tcm.healthFocus,
      natalHarmony: harmony,
      opportunities: generateOpportunities(element, harmony),
      challenges: generateChallenges(element, harmony),
      isActive: false,
      isPast: false,
      isFuture: true,
    };

    periods.push(period);
  }

  // Calculate current age
  const now = new Date();
  const currentAge = Math.floor((now.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

  // Mark active, past, and future periods
  let currentPeriodIndex = 0;
  for (let i = 0; i < periods.length; i++) {
    const period = periods[i];
    if (currentAge >= period.ageRange.start && currentAge <= period.ageRange.end) {
      period.isActive = true;
      period.isPast = false;
      period.isFuture = false;
      currentPeriodIndex = i;
    } else if (currentAge > period.ageRange.end) {
      period.isPast = true;
      period.isFuture = false;
    }
  }

  const currentPeriod = periods[currentPeriodIndex];
  const previousPeriod = currentPeriodIndex > 0 ? periods[currentPeriodIndex - 1] : null;
  const nextPeriod = currentPeriodIndex < periods.length - 1 ? periods[currentPeriodIndex + 1] : null;

  // Calculate progress through current period
  const yearsInCurrentPeriod = currentAge - currentPeriod.ageRange.start;
  const periodProgress = yearsInCurrentPeriod / 10;

  return {
    birthDate,
    birthTime,
    gender,
    fourPillars,
    cycleDirection,
    daYunStartAge,
    periods,
    currentPeriod,
    previousPeriod,
    nextPeriod,
    currentAge,
    yearsInCurrentPeriod,
    periodProgress,
  };
}

/**
 * Format a Da Yun period for display
 */
export function formatDaYunPeriod(period: DaYunPeriod): string {
  return `${period.stemChinese}${period.branchChinese} (${period.heavenlyStem} ${period.earthlyBranch}) - ${period.element} ${period.zodiacAnimal}`;
}

/**
 * Get a summary of the current life phase
 */
export function getCurrentPhasesSummary(profile: DaYunProfile): {
  past: string | null;
  present: string;
  future: string | null;
} {
  return {
    past: profile.previousPeriod ? formatDaYunPeriod(profile.previousPeriod) : null,
    present: formatDaYunPeriod(profile.currentPeriod),
    future: profile.nextPeriod ? formatDaYunPeriod(profile.nextPeriod) : null,
  };
}
