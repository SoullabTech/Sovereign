/**
 * MAIA Divination System
 * Complete oracle framework integrating I Ching, Tarot, and Runes
 *
 * @module divination
 */

// Core types
export * from './core/types';

// Unified Oracle Engine
export {
  DivinationOracle,
  oracle,
  consultIChing,
  consultTarot,
  consultRunes,
  getUnifiedOracleReading,
  getDailyOracleGuidance,
  getQuickReading,
  getElementalRecommendation
} from './core/oracle-engine';

// I Ching System
export {
  TRIGRAMS,
  getTrigram,
  getTrigramFromLines,
  HEXAGRAMS,
  getHexagram,
  getHexagramByTrigrams,
  castIChing,
  castCoinLine,
  castYarrowLine,
  castAllLines,
  findHexagramFromLines,
  getDailyHexagram,
  getHexagramForCategory
} from './iching';

// Tarot System
export {
  MAJOR_ARCANA,
  getMajorArcana,
  getMajorArcanaByName,
  MINOR_ARCANA,
  getMinorArcana,
  getCardsBySuit,
  SPREADS,
  getSpread,
  getSpreadsByDifficulty,
  getSpreadsByCardCount,
  FULL_DECK,
  performReading,
  dailyDraw,
  threeCardReading,
  celticCrossReading,
  drawSingleCard,
  drawCards,
  shuffleDeck,
  getDailyCard,
  getCardById,
  searchCards,
  getCardsByElement,
  getMajorArcanaOnlyDeck,
  getMinorArcanaOnlyDeck,
  calculateElementalBalance as calculateTarotElementalBalance,
  getDominantElement as getTarotDominantElement
} from './tarot';

// Runes System
export {
  ELDER_FUTHARK,
  getRune,
  getRuneBySymbol,
  getRuneByPosition,
  getAett,
  getRunesByElement,
  searchRunes,
  RUNE_SPREADS,
  getRuneSpread,
  castRunes,
  dailyRuneDraw,
  nornsReading,
  drawSingleRune,
  drawRunes,
  drawAettRunes,
  shuffleRunes,
  getDailyRune,
  getBirthRune,
  calculateElementalBalance as calculateRuneElementalBalance,
  getDominantElement as getRuneDominantElement
} from './runes';

// Re-export commonly used types for convenience
export type {
  Element,
  ElementalSignature,
  Hexagram,
  Trigram,
  TrigramKey,
  LineValue,
  LineType,
  IChingReading,
  TarotCard,
  TarotSuit,
  TarotSpread,
  DrawnCard,
  TarotReading,
  Rune,
  RuneAett,
  RuneSpread,
  DrawnRune,
  RuneReading,
  DivinationRitual,
  DailyOracleGuidance,
  UnifiedReading,
  OracleReading
} from './core/types';

/**
 * Default export: the unified Oracle instance
 */
export { oracle as default } from './core/oracle-engine';
