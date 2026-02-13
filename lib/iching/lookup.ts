/**
 * Hexagram Lookup & Search
 *
 * Utilities for finding hexagrams by number, trigram combination,
 * line pattern, or keyword search.
 */

import type { Hexagram } from './types';
import { HEXAGRAMS, TRIGRAM_LOOKUP_TABLE } from './hexagrams';

/**
 * Get a hexagram by its King Wen number (1-64).
 */
export function getHexagram(number: number): Hexagram | null {
  return HEXAGRAMS[number] ?? null;
}

/**
 * Get a hexagram by its upper and lower trigram numbers.
 */
export function getHexagramByTrigrams(upper: number, lower: number): Hexagram | null {
  const number = TRIGRAM_LOOKUP_TABLE[upper]?.[lower];
  if (!number) return null;
  return HEXAGRAMS[number] ?? null;
}

/**
 * Determine the hexagram number from a 6-element boolean array.
 * Lines are bottom to top: [line1, line2, line3, line4, line5, line6].
 * true = yang (solid), false = yin (broken).
 *
 * Lines 1-3 form the lower trigram, lines 4-6 form the upper trigram.
 */
export function getHexagramNumberFromLines(lines: boolean[]): number {
  if (lines.length !== 6) {
    throw new Error('Hexagram requires exactly 6 lines');
  }

  const lowerLines: [boolean, boolean, boolean] = [lines[0], lines[1], lines[2]];
  const upperLines: [boolean, boolean, boolean] = [lines[3], lines[4], lines[5]];

  // Find trigram numbers by line pattern
  const lower = findTrigramNumber(lowerLines);
  const upper = findTrigramNumber(upperLines);

  const number = TRIGRAM_LOOKUP_TABLE[upper]?.[lower];
  if (!number) {
    throw new Error(`No hexagram found for trigrams upper=${upper}, lower=${lower}`);
  }
  return number;
}

/**
 * Map a 3-line pattern to a trigram number.
 * Pattern index: encode as binary (line1=1, line2=2, line3=4) where true=1.
 */
function findTrigramNumber(lines: [boolean, boolean, boolean]): number {
  // Trigram line patterns (from trigrams.ts):
  // 1 Ch'ien: [true, true, true]    = 7
  // 2 K'un:   [false, false, false] = 0
  // 3 Chen:   [true, false, false]  = 1
  // 4 K'an:   [false, true, false]  = 2
  // 5 Ken:    [false, false, true]  = 4
  // 6 Sun:    [false, true, true]   = 6
  // 7 Li:     [true, false, true]   = 5
  // 8 Tui:    [true, true, false]   = 3
  const key = (lines[0] ? 1 : 0) + (lines[1] ? 2 : 0) + (lines[2] ? 4 : 0);
  const PATTERN_TO_TRIGRAM: Record<number, number> = {
    7: 1,  // Ch'ien
    0: 2,  // K'un
    1: 3,  // Chen
    2: 4,  // K'an
    4: 5,  // Ken
    6: 6,  // Sun
    5: 7,  // Li
    3: 8,  // Tui
  };
  return PATTERN_TO_TRIGRAM[key]!;
}

/**
 * Search hexagrams by keyword in name, english name, or keywords array.
 * Returns matching hexagrams sorted by relevance.
 */
export function searchHexagrams(query: string): Hexagram[] {
  if (!query.trim()) return [];

  const q = query.toLowerCase().trim();
  const results: Array<{ hex: Hexagram; score: number }> = [];

  for (const hex of Object.values(HEXAGRAMS)) {
    let score = 0;

    // Exact english name match
    if (hex.english.toLowerCase() === q) score += 100;
    // English name contains query
    else if (hex.english.toLowerCase().includes(q)) score += 50;

    // Chinese name match
    if (hex.name.toLowerCase().includes(q)) score += 40;

    // Keyword match
    for (const kw of hex.keywords) {
      if (kw.toLowerCase() === q) score += 30;
      else if (kw.toLowerCase().includes(q)) score += 15;
    }

    // Judgment or image contains query
    if (hex.judgment.toLowerCase().includes(q)) score += 10;
    if (hex.image.toLowerCase().includes(q)) score += 10;

    // Change type match
    if (hex.changeType.toLowerCase() === q) score += 20;

    if (score > 0) {
      results.push({ hex, score });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .map(r => r.hex);
}

/**
 * Get all hexagrams as an array, sorted by King Wen number.
 */
export function getAllHexagrams(): Hexagram[] {
  return Object.values(HEXAGRAMS).sort((a, b) => a.number - b.number);
}

/**
 * Get hexagrams that resonate with a specific change type.
 */
export function getHexagramsByChangeType(changeType: string): Hexagram[] {
  return Object.values(HEXAGRAMS)
    .filter(h => h.changeType === changeType)
    .sort((a, b) => a.number - b.number);
}
