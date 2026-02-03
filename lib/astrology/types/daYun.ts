/**
 * Da Yun (大運) - 10-Year Luck Cycle Types
 *
 * The Da Yun system reveals the major life periods that shape destiny.
 * Each decade brings its own elemental theme, opportunities, and challenges.
 */

import { Element, StemBranch, FourPillarsProfile } from '@/app/api/_backend/src/services/fourPillarsService';

export type { Element, StemBranch, FourPillarsProfile };

export type Gender = 'male' | 'female';
export type YinYang = 'Yin' | 'Yang';
export type CycleDirection = 'forward' | 'backward';
export type HarmonyLevel = 'supportive' | 'neutral' | 'challenging';

/**
 * TCM organ pair focus for each element
 */
export interface OrganFocus {
  yin: string;   // Yin organ (e.g., Liver)
  yang: string;  // Yang organ (e.g., Gallbladder)
}

/**
 * Individual 10-year luck period
 */
export interface DaYunPeriod {
  /** Cycle number (1st, 2nd, 3rd decade, etc.) */
  cycleNumber: number;

  /** Age range for this period */
  ageRange: { start: number; end: number };

  /** Heavenly Stem for this decade */
  heavenlyStem: string;

  /** Chinese character for stem */
  stemChinese: string;

  /** Earthly Branch for this decade */
  earthlyBranch: string;

  /** Chinese character for branch */
  branchChinese: string;

  /** Associated zodiac animal for the branch */
  zodiacAnimal: string;

  /** Primary element of this period */
  element: Element;

  /** Yin or Yang polarity */
  yinYang: YinYang;

  /** Overall life theme for this decade */
  lifeTheme: string;

  /** Description of this decade's energy */
  description: string;

  // TCM Integration
  /** Primary organ system focus based on element */
  organFocus: OrganFocus;

  /** Five Spirit (Wu Shen) emphasis */
  spiritFocus: string;

  /** Spirit description */
  spiritDescription: string;

  /** Health cultivation guidance for this decade */
  healthGuidance: string[];

  // Relationship to natal chart
  /** How this decade relates to natal day master */
  natalHarmony: HarmonyLevel;

  /** Key opportunities during this period */
  opportunities: string[];

  /** Potential challenges to navigate */
  challenges: string[];

  /** This is the current active period */
  isActive: boolean;

  /** This period is in the past */
  isPast: boolean;

  /** This period is in the future */
  isFuture: boolean;
}

/**
 * The complete Da Yun profile for a person
 */
export interface DaYunProfile {
  /** Birth date used for calculation */
  birthDate: Date;

  /** Birth time (optional, affects hour pillar) */
  birthTime?: string;

  /** Gender affects cycle direction */
  gender: Gender;

  /** Complete Four Pillars profile */
  fourPillars: FourPillarsProfile;

  /** Direction of luck cycle progression */
  cycleDirection: CycleDirection;

  /** Age when first Da Yun begins (typically 1-10) */
  daYunStartAge: number;

  /** All calculated luck periods (typically 8-12 decades) */
  periods: DaYunPeriod[];

  /** Currently active 10-year period */
  currentPeriod: DaYunPeriod;

  /** Previous 10-year period (null if in first period) */
  previousPeriod: DaYunPeriod | null;

  /** Next 10-year period (null if at end) */
  nextPeriod: DaYunPeriod | null;

  /** Current age based on birth date */
  currentAge: number;

  /** Years remaining in current period */
  yearsInCurrentPeriod: number;

  /** Progress through current period (0-1) */
  periodProgress: number;
}

/**
 * Solar terms (Jie Qi) for calculating Da Yun start age
 */
export interface SolarTerm {
  name: string;
  chineseName: string;
  month: number;
  approximateDay: number;
}

/**
 * Element to TCM mapping
 */
export interface ElementTCMMapping {
  element: Element;
  yinOrgan: string;
  yangOrgan: string;
  spirit: string;
  spiritDescription: string;
  season: string;
  lifeStage: string;
  healthFocus: string[];
}

/**
 * Stem information with Chinese characters
 */
export interface StemInfo {
  name: string;
  chinese: string;
  element: Element;
  yinYang: YinYang;
}

/**
 * Branch information with Chinese characters and zodiac
 */
export interface BranchInfo {
  name: string;
  chinese: string;
  element: Element;
  yinYang: YinYang;
  zodiacAnimal: string;
  zodiacEmoji: string;
}
