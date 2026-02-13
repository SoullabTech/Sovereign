/**
 * I Ching Data Types
 *
 * The Book of Changes -- 64 hexagrams built from 8 trigrams.
 * Each hexagram has 6 lines (yin or yang), a judgment, an image,
 * and 6 line texts for when that line is "changing."
 */

// ─── Trigrams ──────────────────────────────────────────────────

export interface Trigram {
  number: number;                           // 1-8 (traditional ordering)
  name: string;                             // Chinese name romanized (e.g. "Ch'ien")
  english: string;                          // English name (e.g. "The Creative")
  attribute: string;                        // Quality (e.g. "Strong")
  image: string;                            // Natural image (e.g. "Heaven")
  family: string;                           // Family role (e.g. "Father")
  element: string;                          // Spiralogic element mapping
  lines: [boolean, boolean, boolean];       // bottom to top, true = yang (solid)
}

// ─── Hexagram Lines ────────────────────────────────────────────

export interface HexagramLine {
  position: number;                         // 1-6 (bottom to top)
  isYang: boolean;                          // true = yang (solid), false = yin (broken)
  text: string;                             // Line text (e.g. "Nine at the beginning...")
  meaning: string;                          // Brief interpretation
}

// ─── Hexagrams ─────────────────────────────────────────────────

export interface Hexagram {
  number: number;                           // 1-64 (King Wen sequence)
  name: string;                             // Chinese name romanized
  english: string;                          // English name
  character: string;                        // Unicode hexagram character (U+4DC0-4DFF)
  upperTrigram: number;                     // Trigram number (1-8)
  lowerTrigram: number;                     // Trigram number (1-8)
  judgment: string;                         // The Judgment text
  image: string;                            // The Image text
  lines: HexagramLine[];                    // 6 lines, bottom to top
  element: string;                          // Primary Spiralogic element resonance
  changeType: string;                       // Which change type this most resonates with
  keywords: string[];                       // For search/browse
}

// ─── Casting ───────────────────────────────────────────────────

export type CastingMethod = 'yarrow' | 'coin';

/**
 * Line values from casting:
 *   6 = old yin (changing, yin → yang)
 *   7 = young yang (stable)
 *   8 = young yin (stable)
 *   9 = old yang (changing, yang → yin)
 */
export type LineValue = 6 | 7 | 8 | 9;

export interface CastResult {
  hexagramNumber: number;                   // Primary hexagram (1-64)
  changingLines: number[];                  // Positions with changing lines (1-6)
  relatingHexagramNumber: number | null;    // Relating hexagram (null if no changing lines)
  method: CastingMethod;
  lineValues: LineValue[];                  // Raw values for each line (bottom to top)
}
