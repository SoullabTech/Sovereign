/**
 * Divination Core Types
 * Shared type definitions for I Ching, Tarot, Runes, and unified oracle systems
 */

// =============================================================================
// ELEMENTAL TYPES
// =============================================================================

export type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';
export type WuXingElement = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

export interface ElementalSignature {
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
}

// =============================================================================
// I CHING TYPES
// =============================================================================

export type TrigramKey =
  | 'heaven'
  | 'earth'
  | 'thunder'
  | 'water'
  | 'mountain'
  | 'wind'
  | 'fire'
  | 'lake';

export type LineValue = 6 | 7 | 8 | 9; // 6=old yin, 7=young yang, 8=young yin, 9=old yang
export type LineType = 'yin' | 'yang';
export type ChangingLine = 'old_yin' | 'old_yang';

export interface Trigram {
  key: TrigramKey;
  name: string;
  chineseName: string;
  symbol: string;
  lines: [LineType, LineType, LineType]; // bottom to top
  element: WuXingElement;
  attribute: string;
  image: string;
  direction: string;
  family: string;
  bodyPart: string;
  animal: string;
  season?: string;
  time?: string;
  keywords: string[];
}

export interface HexagramLine {
  position: number; // 1-6 (bottom to top)
  type: LineType;
  changing: boolean;
  meaning: string;
  guidance: string;
}

export interface Hexagram {
  number: number;
  name: string;
  chineseName: string;
  englishName: string;
  keyword: string;
  lines: [LineType, LineType, LineType, LineType, LineType, LineType];
  trigrams: {
    upper: TrigramKey;
    lower: TrigramKey;
  };
  nuclear: {
    upper: TrigramKey;
    lower: TrigramKey;
  };
  judgment: string;
  image: string;
  soulInterpretation: string;
  guidance: string;
  timing: string;
  changingLinesMeanings: [string, string, string, string, string, string];
  elementalResonance: ElementalSignature;
  archetypeCorrespondence: string;
  oppositeHexagram: number;
  reverseHexagram: number;
  complementHexagram: number;
}

export interface IChingReading {
  query: string;
  method: 'yarrow' | 'coins' | 'digital';
  castLines: LineValue[];
  primaryHexagram: Hexagram;
  changingLines: number[];
  transformedHexagram?: Hexagram;
  insight: string;
  soulGuidance: string;
  ritual?: DivinationRitual;
  timestamp: Date;
}

// =============================================================================
// TAROT TYPES
// =============================================================================

export type TarotSuit = 'wands' | 'cups' | 'swords' | 'pentacles';
export type TarotArcana = 'major' | 'minor';
export type CourtRank = 'page' | 'knight' | 'queen' | 'king';

export interface TarotCard {
  id: string;
  name: string;
  arcana: TarotArcana;
  suit?: TarotSuit;
  number: number; // 0-21 for major, 1-14 for minor (ace=1, page=11, knight=12, queen=13, king=14)
  element: Element;
  keywords: string[];
  uprightMeaning: string;
  reversedMeaning: string;
  soulGuidance: string;
  symbolism: string[];
  astrological?: string;
  decanCorrespondence?: string;
  numerology?: string;
  hebrewLetter?: string;
  path?: string; // Kabbalistic path
}

export interface SpreadPosition {
  name: string;
  description: string;
  index: number;
  element?: Element;
}

export interface TarotSpread {
  name: string;
  description: string;
  cardCount: number;
  positions: SpreadPosition[];
  purpose: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface DrawnCard {
  card: TarotCard;
  position: SpreadPosition;
  isReversed: boolean;
  interpretation: string;
}

export interface TarotReading {
  query: string;
  spread: TarotSpread;
  drawnCards: DrawnCard[];
  insight: string;
  soulGuidance: string;
  ritual?: DivinationRitual;
  timestamp: Date;
}

// =============================================================================
// RUNES TYPES
// =============================================================================

export type RuneAett = 'freya' | 'heimdall' | 'tyr';

export interface RuneAssociations {
  deity?: string;
  tree?: string;
  herb?: string;
  color?: string;
  animal?: string;
}

export interface Rune {
  name: string;
  letter: string;
  symbol: string;
  meaning: string;
  aett: RuneAett;
  position: number; // 1-24 overall, or 1-8 within aett
  element: Element;
  keywords: string[];
  uprightMeaning: string;
  reversedMeaning?: string; // Some runes can't be reversed
  soulGuidance: string;
  magicalUse: string;
  associations?: RuneAssociations;
  elementalResonance?: ElementalSignature;
}

export interface RuneSpread {
  name: string;
  description: string;
  runeCount: number;
  positions: SpreadPosition[];
  purpose: string;
  method: string;
}

export interface DrawnRune {
  rune: Rune;
  position: SpreadPosition;
  isReversed: boolean;
  interpretation: string;
}

export interface RuneReading {
  query: string;
  spread: RuneSpread;
  drawnRunes: DrawnRune[];
  insight: string;
  soulGuidance: string;
  ritual?: DivinationRitual;
  timestamp: Date;
}

// =============================================================================
// UNIFIED ORACLE TYPES
// =============================================================================

export type DivinationMethod = 'iching' | 'tarot' | 'runes' | 'unified';

export interface DivinationRitual {
  name: string;
  duration: number; // minutes
  materials: string[];
  steps: string[];
  intention: string;
  bestTiming?: string;
  element?: Element;
  archetype?: string;
}

export interface OracleReading {
  id: string;
  method: DivinationMethod;
  query: string;
  timestamp: Date;
  result: IChingReading | TarotReading | RuneReading;
  elementalSignature: ElementalSignature;
  soulInsight: string;
  ritualSuggestion?: DivinationRitual;
}

export interface UnifiedReading {
  query: string;
  timestamp: Date;
  iching: IChingReading;
  tarot: TarotReading;
  runes: RuneReading;
  synthesis: string;
  elementalBalance: ElementalSignature;
  combinedRitual: DivinationRitual;
  soulMessage: string;
}

export interface DailyOracleGuidance {
  date: Date;
  hexagram: Hexagram;
  card: TarotCard;
  rune: Rune;
  combinedInsight: string;
  elementalTheme: string;
  recommendedFocus: string;
  ritual: DivinationRitual;
}

// =============================================================================
// HISTORY & PERSISTENCE TYPES
// =============================================================================

export interface DivinationSession {
  id: string;
  userId?: string;
  method: DivinationMethod;
  query: string;
  reading: OracleReading;
  createdAt: Date;
  tags?: string[];
  notes?: string;
  feedback?: {
    accuracy: number;
    resonance: number;
    helpfulness: number;
    notes?: string;
  };
}

// =============================================================================
// HELPER TYPE GUARDS
// =============================================================================

export function isIChingReading(reading: OracleReading['result']): reading is IChingReading {
  return 'primaryHexagram' in reading;
}

export function isTarotReading(reading: OracleReading['result']): reading is TarotReading {
  return 'spread' in reading && 'drawnCards' in reading;
}

export function isRuneReading(reading: OracleReading['result']): reading is RuneReading {
  return 'drawnRunes' in reading;
}
