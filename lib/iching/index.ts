/**
 * I Ching — The Book of Changes
 *
 * Public API for the I Ching oracle system.
 * Provides hexagram data, casting methods, and lookup utilities.
 */

// Types
export type {
  Trigram,
  Hexagram,
  HexagramLine,
  CastResult,
  CastingMethod,
  LineValue,
} from './types';

// Trigrams
export { TRIGRAMS, getTrigram, getTrigramByLines } from './trigrams';

// Hexagram data
export { HEXAGRAMS, TRIGRAM_LOOKUP_TABLE } from './hexagrams';

// Casting
export { cast, castYarrow, castCoins } from './casting';

// Lookup & search
export {
  getHexagram,
  getHexagramByTrigrams,
  getHexagramNumberFromLines,
  searchHexagrams,
  getAllHexagrams,
  getHexagramsByChangeType,
} from './lookup';
