/**
 * WU XING SNAPSHOT: Computes member's elemental state from BaZi + temporal Qi
 *
 * This module provides deterministic computation of:
 * 1. WuXingConstitution - from stored BaZi profile (stable baseline)
 * 2. WuXingMoment - from current time (day stem, hour branch, season)
 * 3. WuXingSnapshot - combined constitution + moment + recent divination
 *
 * Architecture principle: compute before generation, inject as prompt addendum.
 * No model inference here — pure algorithmic signal.
 */

import {
  WuXingElement,
  WuXingBalance,
  WuXingConstitution,
  WuXingMoment,
  ELEMENT_BRIDGE,
  GENERATION_CYCLE,
  MOTHER_OF,
  CONTROLLED_BY,
  analyzeBalance,
  getCurrentOrganPhase,
  getSpirit,
  type BalanceAnalysis
} from './wuxingBridge';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface BaZiPillars {
  year: { stem: string; branch: string };
  month: { stem: string; branch: string };
  day: { stem: string; branch: string };
  hour: { stem: string; branch: string };
}

export interface BaZiProfile {
  userId: string;
  birthDatetimeUtc: Date;
  birthTimezone: string;
  locationText?: string;
  pillars: BaZiPillars;
  dayMaster: string;
  dayMasterElement: WuXingElement;
  dayMasterYinYang: 'yin' | 'yang';
  elementTally: WuXingBalance;
  wuxingBalancePercentages: WuXingBalance;
  dominantElements: WuXingElement[];
  deficientElements: WuXingElement[];
  balanceScore: number;
}

export interface IChingReadingRef {
  hexagramNumber: number;
  hexagramName: string;
  changingLines: number[];
  relatingHexagramNumber?: number;
  wuxingInfluence: Partial<WuXingBalance>;
  timestamp: Date;
}

export interface WuXingSnapshot {
  /** Constitution baseline from BaZi (stable) */
  constitution: WuXingConstitution | null;

  /** Current moment from time (changes with time) */
  moment: WuXingMoment;

  /** Recent I Ching influence (optional, decays over time) */
  recentDivination?: {
    hexagram: string;
    wuxingInfluence: Partial<WuXingBalance>;
    relevanceDecay: number; // 0-1, decays over hours
  };

  /** Combined analysis */
  analysis: BalanceAnalysis;

  /** Computed at timestamp */
  computedAt: Date;

  /** Spirit focus (which of the Five Spirits is most activated/depleted) */
  spiritFocus?: {
    name: string;
    element: WuXingElement;
    state: 'active' | 'depleted' | 'agitated';
    guidance: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEM & BRANCH DATA
// ═══════════════════════════════════════════════════════════════════════════════

const HEAVENLY_STEMS = ['Jia', 'Yi', 'Bing', 'Ding', 'Wu', 'Ji', 'Geng', 'Xin', 'Ren', 'Gui'];
const EARTHLY_BRANCHES = ['Zi', 'Chou', 'Yin', 'Mao', 'Chen', 'Si', 'Wu', 'Wei', 'Shen', 'You', 'Xu', 'Hai'];

const STEM_ELEMENTS: WuXingElement[] = ['wood', 'wood', 'fire', 'fire', 'earth', 'earth', 'metal', 'metal', 'water', 'water'];
const STEM_YINYANG: ('yang' | 'yin')[] = ['yang', 'yin', 'yang', 'yin', 'yang', 'yin', 'yang', 'yin', 'yang', 'yin'];

const BRANCH_ELEMENTS: WuXingElement[] = ['water', 'earth', 'wood', 'wood', 'earth', 'fire', 'fire', 'earth', 'metal', 'metal', 'earth', 'water'];

// Seasonal Qi by month (approximate solar terms)
const SEASONAL_QI: Record<number, WuXingElement> = {
  1: 'water',   // Jan - deep winter
  2: 'wood',    // Feb - early spring
  3: 'wood',    // Mar - spring
  4: 'wood',    // Apr - late spring
  5: 'fire',    // May - early summer
  6: 'fire',    // Jun - summer
  7: 'fire',    // Jul - peak summer
  8: 'earth',   // Aug - late summer (transition)
  9: 'metal',   // Sep - early autumn
  10: 'metal',  // Oct - autumn
  11: 'water',  // Nov - late autumn
  12: 'water'   // Dec - winter
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPUTATION: CONSTITUTION FROM BAZI
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Compute Wu Xing constitution from stored BaZi profile
 */
export function computeWuXingConstitution(profile: BaZiProfile): WuXingConstitution {
  const dayMasterIndex = HEAVENLY_STEMS.indexOf(profile.dayMaster);
  const dayMasterElement = dayMasterIndex >= 0 ? STEM_ELEMENTS[dayMasterIndex] : profile.dayMasterElement;
  const dayMasterYinYang = dayMasterIndex >= 0 ? STEM_YINYANG[dayMasterIndex] : profile.dayMasterYinYang;

  // Calculate relationships relative to day master
  const supporting = MOTHER_OF[dayMasterElement];
  const draining = GENERATION_CYCLE[dayMasterElement];
  const controlling = CONTROLLED_BY[dayMasterElement];
  const controlled = GENERATION_CYCLE[GENERATION_CYCLE[dayMasterElement]]; // Grandchild

  return {
    dayMaster: dayMasterElement,
    dayMasterYinYang,
    elementTally: profile.elementTally,
    elementPercentages: profile.wuxingBalancePercentages,
    dominant: profile.dominantElements,
    deficient: profile.deficientElements,
    balanceScore: profile.balanceScore,
    relationships: {
      supporting: [supporting],
      draining: [draining],
      controlling: [controlling],
      controlled: [controlled]
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPUTATION: MOMENT FROM TIME
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Reference date for calculating stem/branch cycles
 * Feb 4, 1984 is Jia Zi (Wood Rat) year, Bing Yin month, Jia Zi day
 */
const REFERENCE_DATE = new Date('1984-02-04T00:00:00Z');

/**
 * Calculate day stem and branch for a given date
 * Uses simplified Julian Day calculation
 */
function getDayStemBranch(date: Date): { stem: string; branch: string; element: WuXingElement; yinYang: 'yin' | 'yang' } {
  // Days since reference
  const daysDiff = Math.floor((date.getTime() - REFERENCE_DATE.getTime()) / 86400000);

  // Stem cycles every 10 days, branch cycles every 12 days
  // Reference day is Jia Zi (stem index 0, branch index 0)
  const stemIndex = ((daysDiff % 10) + 10) % 10;
  const branchIndex = ((daysDiff % 12) + 12) % 12;

  return {
    stem: HEAVENLY_STEMS[stemIndex],
    branch: EARTHLY_BRANCHES[branchIndex],
    element: STEM_ELEMENTS[stemIndex],
    yinYang: STEM_YINYANG[stemIndex]
  };
}

/**
 * Calculate hour branch (Chinese double-hour system)
 * Hour branches cycle through 12 branches, each spanning 2 hours
 */
function getHourBranch(hour: number): { branch: string; element: WuXingElement } {
  // Zi hour (Rat) = 23:00-00:59
  // Each subsequent branch is 2 hours
  const branchIndex = Math.floor(((hour + 1) % 24) / 2);
  return {
    branch: EARTHLY_BRANCHES[branchIndex],
    element: BRANCH_ELEMENTS[branchIndex]
  };
}

/**
 * Compute current Wu Xing moment from time
 */
export function computeWuXingMoment(now: Date, timezone?: string): WuXingMoment {
  // Get local time (simplified - in production use proper timezone library)
  const localHour = now.getHours();
  const localMonth = now.getMonth() + 1;

  const dayStem = getDayStemBranch(now);
  const hourBranch = getHourBranch(localHour);
  const seasonalQi = SEASONAL_QI[localMonth];

  // Get organ clock phase
  const organPhase = getCurrentOrganPhase(localHour);

  // Determine moment dominant elements
  const momentElements: WuXingElement[] = [
    dayStem.element,
    hourBranch.element,
    seasonalQi
  ];

  // Count which elements dominate the moment
  const momentCounts: Record<WuXingElement, number> = {
    wood: 0, fire: 0, earth: 0, metal: 0, water: 0
  };
  momentElements.forEach(el => momentCounts[el]++);

  const maxCount = Math.max(...Object.values(momentCounts));
  const momentDominant = (Object.keys(momentCounts) as WuXingElement[])
    .filter(el => momentCounts[el] === maxCount);

  return {
    dayStem: dayStem.element,
    dayStemYinYang: dayStem.yinYang,
    hourBranch: hourBranch.element,
    seasonalQi,
    organClock: {
      organ: organPhase.organ,
      element: organPhase.element,
      peakHour: organPhase.peakHours,
      currentPhase: 'peak' // Simplified - could calculate actual phase position
    },
    momentDominant
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPUTATION: FULL SNAPSHOT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Build complete Wu Xing snapshot from constitution + moment + optional divination
 */
export function buildWuXingSnapshot(args: {
  constitution: WuXingConstitution | null;
  moment: WuXingMoment;
  recentIching?: IChingReadingRef;
}): WuXingSnapshot {
  const { constitution, moment, recentIching } = args;
  const now = new Date();

  // Combine element tallies for analysis
  let combinedTally: WuXingBalance;

  if (constitution) {
    // Weight: 60% constitution, 30% moment, 10% divination (if present)
    const baseWeight = recentIching ? 0.6 : 0.7;
    const momentWeight = recentIching ? 0.3 : 0.3;
    const divinationWeight = recentIching ? 0.1 : 0;

    combinedTally = {
      wood: constitution.elementTally.wood * baseWeight +
            (moment.momentDominant.includes('wood') ? 2 : 0) * momentWeight +
            (recentIching?.wuxingInfluence.wood || 0) * divinationWeight,
      fire: constitution.elementTally.fire * baseWeight +
            (moment.momentDominant.includes('fire') ? 2 : 0) * momentWeight +
            (recentIching?.wuxingInfluence.fire || 0) * divinationWeight,
      earth: constitution.elementTally.earth * baseWeight +
             (moment.momentDominant.includes('earth') ? 2 : 0) * momentWeight +
             (recentIching?.wuxingInfluence.earth || 0) * divinationWeight,
      metal: constitution.elementTally.metal * baseWeight +
             (moment.momentDominant.includes('metal') ? 2 : 0) * momentWeight +
             (recentIching?.wuxingInfluence.metal || 0) * divinationWeight,
      water: constitution.elementTally.water * baseWeight +
             (moment.momentDominant.includes('water') ? 2 : 0) * momentWeight +
             (recentIching?.wuxingInfluence.water || 0) * divinationWeight
    };
  } else {
    // No constitution - use moment only
    combinedTally = {
      wood: moment.momentDominant.includes('wood') ? 2 : 1,
      fire: moment.momentDominant.includes('fire') ? 2 : 1,
      earth: moment.momentDominant.includes('earth') ? 2 : 1,
      metal: moment.momentDominant.includes('metal') ? 2 : 1,
      water: moment.momentDominant.includes('water') ? 2 : 1
    };
  }

  const analysis = analyzeBalance(combinedTally);

  // Determine spirit focus
  let spiritFocus: WuXingSnapshot['spiritFocus'];
  if (analysis.spiritWork) {
    spiritFocus = {
      name: analysis.spiritWork.spirit,
      element: analysis.spiritWork.element,
      state: analysis.spiritWork.state === 'depleted' ? 'depleted' :
             analysis.spiritWork.state === 'agitated' ? 'agitated' : 'active',
      guidance: analysis.spiritWork.guidance
    };
  }

  // Build divination reference if present
  let recentDivination: WuXingSnapshot['recentDivination'];
  if (recentIching) {
    // Decay relevance over 24 hours
    const hoursSince = (now.getTime() - recentIching.timestamp.getTime()) / 3600000;
    const relevanceDecay = Math.max(0, 1 - hoursSince / 24);

    recentDivination = {
      hexagram: `${recentIching.hexagramNumber} - ${recentIching.hexagramName}`,
      wuxingInfluence: recentIching.wuxingInfluence,
      relevanceDecay
    };
  }

  return {
    constitution,
    moment,
    recentDivination,
    analysis,
    computedAt: now,
    spiritFocus
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROMPT ADDENDUM GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate prompt addendum for Wu Xing awareness
 * Format: deterministic, structured, non-poetic
 */
export function generateWuXingPromptAddendum(snapshot: WuXingSnapshot): string {
  const lines: string[] = [];

  lines.push('## WU XING SNAPSHOT (Five Element Read)');
  lines.push('');

  // Moment
  lines.push(`**Temporal Qi:** ${capitalize(snapshot.moment.dayStem)} day (${snapshot.moment.dayStemYinYang}) | ${capitalize(snapshot.moment.hourBranch)} hour | ${capitalize(snapshot.moment.seasonalQi)} season`);

  if (snapshot.moment.organClock) {
    lines.push(`**Organ Clock:** ${snapshot.moment.organClock.organ} (${capitalize(snapshot.moment.organClock.element)}) — ${snapshot.moment.organClock.peakHour}`);
  }

  // Constitution (if available)
  if (snapshot.constitution) {
    lines.push('');
    lines.push(`**Day Master:** ${capitalize(snapshot.constitution.dayMaster)} (${snapshot.constitution.dayMasterYinYang})`);
    lines.push(`**Dominant:** ${snapshot.constitution.dominant.map(capitalize).join(', ') || 'Balanced'}`);
    lines.push(`**Deficient:** ${snapshot.constitution.deficient.map(capitalize).join(', ') || 'None'}`);
    lines.push(`**Balance Score:** ${snapshot.constitution.balanceScore.toFixed(0)}/100`);
  }

  // Analysis
  lines.push('');
  lines.push(`**Current State:** ${formatState(snapshot.analysis.state)}`);

  if (snapshot.analysis.needsSupport.length > 0) {
    lines.push(`**Needs Support:** ${snapshot.analysis.needsSupport.map(capitalize).join(', ')}`);
  }

  if (snapshot.analysis.excessive.length > 0) {
    lines.push(`**Excessive:** ${snapshot.analysis.excessive.map(capitalize).join(', ')}`);
  }

  // Spirit focus
  if (snapshot.spiritFocus) {
    const spirit = getSpirit(snapshot.spiritFocus.element);
    lines.push('');
    lines.push(`**Spirit Focus:** ${snapshot.spiritFocus.name} (${spirit.chinese}) — ${snapshot.spiritFocus.state}`);
    lines.push(`  ${snapshot.spiritFocus.guidance}`);
  }

  // Balancing moves (top 2)
  if (snapshot.analysis.balancingMoves.length > 0) {
    lines.push('');
    lines.push('**Balancing Moves:**');
    snapshot.analysis.balancingMoves.slice(0, 2).forEach(move => {
      lines.push(`  - ${move.rationale}`);
    });
  }

  // Recent divination
  if (snapshot.recentDivination && snapshot.recentDivination.relevanceDecay > 0.3) {
    lines.push('');
    lines.push(`**Recent I Ching:** ${snapshot.recentDivination.hexagram} (relevance: ${(snapshot.recentDivination.relevanceDecay * 100).toFixed(0)}%)`);
  }

  lines.push('');

  return lines.join('\n');
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatState(state: BalanceAnalysis['state']): string {
  switch (state) {
    case 'balanced': return 'Balanced — elements in harmony';
    case 'slight_imbalance': return 'Slight imbalance — minor adjustments helpful';
    case 'significant_imbalance': return 'Significant imbalance — active balancing recommended';
    case 'severe_imbalance': return 'Severe imbalance — restoration work needed';
    default: return state;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  computeWuXingConstitution,
  computeWuXingMoment,
  buildWuXingSnapshot,
  generateWuXingPromptAddendum
};
