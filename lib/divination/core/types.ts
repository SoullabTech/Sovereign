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

export type SpreadType =
  | 'single'
  | 'three_card'
  | 'celtic_cross'
  | 'relationship'
  | 'chakra'
  | 'year_ahead'
  | 'elemental'
  | 'shadow_work';

export interface SpreadPosition {
  id: string;
  name: string;
  description: string;
  index: number;
}

export interface TarotSpread {
  type: SpreadType;
  name: string;
  description: string;
  positions: SpreadPosition[];
  cardCount: number;
}

export interface DrawnCard {
  card: TarotCard;
  position: SpreadPosition;
  reversed: boolean;
  interpretation: string;
}

export interface TarotReading {
  query: string;
  spread: TarotSpread;
  cards: DrawnCard[];
  overallMessage: string;
  soulInsight: string;
  advice: string;
  elementalBalance: ElementalSignature;
  ritual?: DivinationRitual;
  timestamp: Date;
}

// =============================================================================
// RUNES TYPES
// =============================================================================

export type Aett = 'freya' | 'heimdall' | 'tyr';

export interface Rune {
  name: string;
  letter: string;
  symbol: string;
  unicodeSymbol: string;
  aett: Aett;
  position: number; // 1-8 within aett
  element: Element;
  meaning: string;
  reversedMeaning?: string; // Some runes can't be reversed
  keywords: string[];
  soulGuidance: string;
  magicalUse: string;
  associatedDeity?: string;
  associatedTree?: string;
  associatedHerb?: string;
  divinatoryMeaning: string;
  merkstave?: string; // Meaning when reversed/murkstave
}

export type RuneSpreadType =
  | 'single'
  | 'three_norns'
  | 'five_cross'
  | 'nine_grid'
  | 'runic_cross';

export interface RuneSpread {
  type: RuneSpreadType;
  name: string;
  description: string;
  positions: SpreadPosition[];
  runeCount: number;
}

export interface DrawnRune {
  rune: Rune;
  position: SpreadPosition;
  reversed: boolean;
  interpretation: string;
}

export interface RuneReading {
  query: string;
  spread: RuneSpread;
  runes: DrawnRune[];
  overallMessage: string;
  soulInsight: string;
  advice: string;
  elementalBalance: ElementalSignature;
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
  primaryMethod: DivinationMethod;
  iching?: IChingReading;
  tarot?: TarotReading;
  runes?: RuneReading;
  synthesis: {
    overallTheme: string;
    keyMessage: string;
    guidance: string;
    archetypalPattern: string;
    timingGuidance: string;
    elementalBalance: ElementalSignature;
  };
  ritual: DivinationRitual;
  timestamp: Date;
}

export interface DailyOracleGuidance {
  date: Date;
  iching?: {
    hexagram: Hexagram;
    message: string;
  };
  tarot?: {
    card: TarotCard;
    message: string;
  };
  rune?: {
    rune: Rune;
    message: string;
  };
  combinedGuidance: string;
  elementOfTheDay: Element;
  ritual?: DivinationRitual;
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
  return 'spread' in reading && 'cards' in reading;
}

export function isRuneReading(reading: OracleReading['result']): reading is RuneReading {
  return 'runes' in reading;
}
