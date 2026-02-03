/**
 * I Ching Module
 * Complete I Ching divination system with 64 hexagrams
 */

// Backend exports
export * from './trigrams';
export * from './hexagrams';
export * from './casting';
export * from './wuxing-enhanced-casting';

// Type re-exports
export type {
  Trigram,
  TrigramKey,
  Hexagram,
  LineValue,
  LineType,
  IChingReading
} from '../core/types';
