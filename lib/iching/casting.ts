/**
 * I Ching Casting — Authentic Probabilistic Methods
 *
 * Two traditional methods with different probability distributions:
 *
 * Yarrow Stalk Method (more nuanced):
 *   6 (old yin, changing):    1/16  =  6.25%
 *   7 (young yang, stable):   5/16  = 31.25%
 *   8 (young yin, stable):    7/16  = 43.75%
 *   9 (old yang, changing):   3/16  = 18.75%
 *
 * Coin Method (simpler, equal weighting):
 *   6 (old yin, changing):    1/8   = 12.5%
 *   7 (young yang, stable):   3/8   = 37.5%
 *   8 (young yin, stable):    3/8   = 37.5%
 *   9 (old yang, changing):   1/8   = 12.5%
 *
 * Old lines (6, 9) are "changing" — they transform into their
 * opposite in the relating hexagram.
 *
 * The yarrow method is traditionally preferred because it gives
 * greater weight to yin (receptive) and makes changing yang
 * more common than changing yin, reflecting the I Ching's
 * teaching that yang is naturally more active and transformative.
 */

import type { CastResult, CastingMethod, LineValue } from './types';
import { getHexagramNumberFromLines } from './lookup';

// ─── Yarrow Stalk Probabilities ─────────────────────────────────

/**
 * Simulate one line using the yarrow stalk probability distribution.
 * Uses weighted random selection matching traditional probabilities.
 */
function castYarrowLine(): LineValue {
  // Total weight: 16
  // 6 (old yin):    weight 1
  // 7 (young yang): weight 5
  // 8 (young yin):  weight 7
  // 9 (old yang):   weight 3
  const r = Math.random() * 16;
  if (r < 1) return 6;       // old yin (changing)
  if (r < 6) return 7;       // young yang (stable)
  if (r < 13) return 8;      // young yin (stable)
  return 9;                   // old yang (changing)
}

// ─── Coin Method ────────────────────────────────────────────────

/**
 * Simulate one line using three coins.
 * Heads = 3, Tails = 2. Sum of three coins:
 *   6 = 2+2+2 (all tails)     → old yin
 *   7 = 2+2+3 (two tails)     → young yang
 *   8 = 2+3+3 (two heads)     → young yin
 *   9 = 3+3+3 (all heads)     → old yang
 */
function castCoinLine(): LineValue {
  const coins = Array.from({ length: 3 }, () => (Math.random() < 0.5 ? 2 : 3));
  const sum = coins[0] + coins[1] + coins[2];
  return sum as LineValue;
}

// ─── Line Interpretation ────────────────────────────────────────

/**
 * Whether a line value represents yang (solid).
 * 7 and 9 are yang; 6 and 8 are yin.
 */
function isYang(value: LineValue): boolean {
  return value === 7 || value === 9;
}

/**
 * Whether a line is changing (old line).
 * 6 (old yin) and 9 (old yang) are changing.
 */
function isChanging(value: LineValue): boolean {
  return value === 6 || value === 9;
}

// ─── Full Cast ──────────────────────────────────────────────────

/**
 * Cast all 6 lines using the specified method.
 * Lines are cast bottom to top (position 1 first).
 */
export function cast(method: CastingMethod = 'yarrow'): CastResult {
  const castLine = method === 'yarrow' ? castYarrowLine : castCoinLine;

  // Cast 6 lines (bottom to top)
  const lineValues: LineValue[] = Array.from({ length: 6 }, () => castLine());

  // Determine primary hexagram from the cast lines
  const primaryLines = lineValues.map(isYang);
  const hexagramNumber = getHexagramNumberFromLines(primaryLines);

  // Find changing lines (positions 1-6, bottom to top)
  const changingLines = lineValues
    .map((v, i) => isChanging(v) ? i + 1 : 0)
    .filter(pos => pos > 0);

  // Compute relating hexagram by flipping changing lines
  let relatingHexagramNumber: number | null = null;
  if (changingLines.length > 0) {
    const relatingLines = lineValues.map(v => {
      if (v === 6) return true;    // old yin → yang
      if (v === 9) return false;   // old yang → yin
      return isYang(v);            // stable lines stay
    });
    relatingHexagramNumber = getHexagramNumberFromLines(relatingLines);
  }

  return {
    hexagramNumber,
    changingLines,
    relatingHexagramNumber,
    method,
    lineValues,
  };
}

/**
 * Cast using yarrow stalk method.
 */
export function castYarrow(): CastResult {
  return cast('yarrow');
}

/**
 * Cast using coin method.
 */
export function castCoins(): CastResult {
  return cast('coin');
}
