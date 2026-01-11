/**
 * I Ching Casting Methods
 * Traditional yarrow stalk and coin methods for generating hexagrams
 */

import {
  Hexagram,
  LineValue,
  LineType,
  IChingReading,
  TrigramKey,
  DivinationRitual,
  ElementalSignature
} from '../core/types';
import { getHexagram, getHexagramByTrigrams } from './hexagrams';
import { TRIGRAMS, getTrigramFromLines } from './trigrams';

// Line values and their meanings:
// 6 = Old Yin (changing) - yin changing to yang
// 7 = Young Yang (stable) - yang stays yang
// 8 = Young Yin (stable) - yin stays yin
// 9 = Old Yang (changing) - yang changing to yin

/**
 * Generate a single line using the three-coin method
 * Three coins are tossed. Heads = 3, Tails = 2
 * Sum of 6, 7, 8, or 9 determines line type
 */
export function castCoinLine(): LineValue {
  const coins = [
    Math.random() < 0.5 ? 2 : 3, // Coin 1
    Math.random() < 0.5 ? 2 : 3, // Coin 2
    Math.random() < 0.5 ? 2 : 3  // Coin 3
  ];
  return (coins[0] + coins[1] + coins[2]) as LineValue;
}

/**
 * Generate a single line using the yarrow stalk method
 * More complex traditional method with different probabilities
 * Old Yin (6): 1/16, Young Yang (7): 5/16, Young Yin (8): 7/16, Old Yang (9): 3/16
 */
export function castYarrowLine(): LineValue {
  const random = Math.random();

  // Yarrow probabilities differ from coin method
  if (random < 0.0625) return 6;        // 1/16 = 0.0625 (Old Yin)
  if (random < 0.375) return 7;         // 5/16 = 0.3125 (Young Yang)
  if (random < 0.8125) return 8;        // 7/16 = 0.4375 (Young Yin)
  return 9;                              // 3/16 = 0.1875 (Old Yang)
}

/**
 * Convert line value to line type
 */
export function lineValueToType(value: LineValue): LineType {
  return (value === 7 || value === 9) ? 'yang' : 'yin';
}

/**
 * Check if a line is changing
 */
export function isChangingLine(value: LineValue): boolean {
  return value === 6 || value === 9;
}

/**
 * Get the transformed line type (after change)
 */
export function getTransformedLineType(value: LineValue): LineType {
  if (value === 6) return 'yang'; // Old Yin becomes Yang
  if (value === 9) return 'yin';  // Old Yang becomes Yin
  return lineValueToType(value);   // No change for 7 or 8
}

/**
 * Cast all 6 lines using specified method
 */
export function castAllLines(method: 'yarrow' | 'coins' = 'coins'): LineValue[] {
  const castFn = method === 'yarrow' ? castYarrowLine : castCoinLine;
  return Array.from({ length: 6 }, () => castFn());
}

/**
 * Determine trigram key from three lines
 */
function trigramFromLines(lines: [LineType, LineType, LineType]): TrigramKey {
  const binary = lines.map(l => l === 'yang' ? 1 : 0) as [number, number, number];
  const trigram = getTrigramFromLines(binary);
  return trigram?.key || 'earth';
}

/**
 * Calculate hexagram number from trigram combination using King Wen sequence
 */
function calculateHexagramNumber(upper: TrigramKey, lower: TrigramKey): number {
  // King Wen sequence lookup table
  const kingWenSequence: Record<string, number> = {
    'heaven-heaven': 1,
    'earth-earth': 2,
    'water-thunder': 3,
    'mountain-water': 4,
    'water-heaven': 5,
    'heaven-water': 6,
    'earth-water': 7,
    'water-earth': 8,
    'wind-heaven': 9,
    'heaven-lake': 10,
    'earth-heaven': 11,
    'heaven-earth': 12,
    'heaven-fire': 13,
    'fire-heaven': 14,
    'earth-mountain': 15,
    'thunder-earth': 16,
    'lake-thunder': 17,
    'mountain-wind': 18,
    'earth-lake': 19,
    'wind-earth': 20,
    'fire-thunder': 21,
    'mountain-fire': 22,
    'mountain-earth': 23,
    'earth-thunder': 24,
    'heaven-thunder': 25,
    'mountain-heaven': 26,
    'mountain-thunder': 27,
    'lake-wind': 28,
    'water-water': 29,
    'fire-fire': 30,
    'lake-mountain': 31,
    'thunder-wind': 32,
    'heaven-mountain': 33,
    'thunder-heaven': 34,
    'fire-earth': 35,
    'earth-fire': 36,
    'wind-fire': 37,
    'fire-lake': 38,
    'water-mountain': 39,
    'thunder-water': 40,
    'mountain-lake': 41,
    'wind-thunder': 42,
    'lake-heaven': 43,
    'heaven-wind': 44,
    'lake-earth': 45,
    'earth-wind': 46,
    'lake-water': 47,
    'water-wind': 48,
    'lake-fire': 49,
    'fire-wind': 50,
    'thunder-thunder': 51,
    'mountain-mountain': 52,
    'wind-mountain': 53,
    'thunder-lake': 54,
    'thunder-fire': 55,
    'fire-mountain': 56,
    'wind-wind': 57,
    'lake-lake': 58,
    'wind-water': 59,
    'water-lake': 60,
    'wind-lake': 61,
    'thunder-mountain': 62,
    'water-fire': 63,
    'fire-water': 64
  };

  const key = `${upper}-${lower}`;
  return kingWenSequence[key] || 1;
}

/**
 * Find hexagram from cast lines
 */
export function findHexagramFromLines(lineValues: LineValue[]): {
  hexagram: Hexagram;
  changingLines: number[];
  transformedHexagram?: Hexagram;
} {
  // Convert to line types (bottom to top, positions 1-6)
  const lineTypes = lineValues.map(lineValueToType) as [LineType, LineType, LineType, LineType, LineType, LineType];

  // Find changing lines (1-indexed positions)
  const changingLines = lineValues
    .map((value, index) => isChangingLine(value) ? index + 1 : 0)
    .filter(pos => pos > 0);

  // Determine trigrams (lower = lines 1-3, upper = lines 4-6)
  const lowerTrigram = trigramFromLines([lineTypes[0], lineTypes[1], lineTypes[2]]);
  const upperTrigram = trigramFromLines([lineTypes[3], lineTypes[4], lineTypes[5]]);

  // Get primary hexagram
  let hexagram = getHexagramByTrigrams(upperTrigram, lowerTrigram);

  if (!hexagram) {
    // Fallback: calculate by number
    const hexNumber = calculateHexagramNumber(upperTrigram, lowerTrigram);
    hexagram = getHexagram(hexNumber);
  }

  if (!hexagram) {
    throw new Error('Could not find hexagram for the cast lines');
  }

  // Calculate transformed hexagram if there are changing lines
  let transformedHexagram: Hexagram | undefined;
  if (changingLines.length > 0) {
    const transformedTypes = lineValues.map(getTransformedLineType) as [LineType, LineType, LineType, LineType, LineType, LineType];
    const transformedLower = trigramFromLines([transformedTypes[0], transformedTypes[1], transformedTypes[2]]);
    const transformedUpper = trigramFromLines([transformedTypes[3], transformedTypes[4], transformedTypes[5]]);
    transformedHexagram = getHexagramByTrigrams(transformedUpper, transformedLower) ||
                          getHexagram(calculateHexagramNumber(transformedUpper, transformedLower));
  }

  return { hexagram, changingLines, transformedHexagram };
}

/**
 * Generate changing lines interpretation
 */
function getChangingLinesInterpretation(hexagram: Hexagram, changingLines: number[]): string {
  if (changingLines.length === 0) {
    return 'No changing lines. The hexagram\'s message is stable and clear.';
  }

  const interpretations = changingLines.map(lineNum => {
    const meaning = hexagram.changingLinesMeanings[lineNum - 1];
    return meaning || `Line ${lineNum} is changing.`;
  });

  return `Changing lines bring additional guidance:\n${interpretations.join('\n')}`;
}

/**
 * Generate ritual suggestion for the reading
 */
function generateRitual(hexagram: Hexagram, changingLines: number[]): DivinationRitual {
  const hasChangingLines = changingLines.length > 0;

  return {
    name: `Hexagram ${hexagram.number} Integration`,
    duration: hasChangingLines ? 30 : 20,
    materials: [
      'Journal or paper',
      'Quiet space',
      changingLines.length > 0 ? 'Two candles (for transformation)' : 'One candle'
    ],
    steps: [
      'Create sacred space with a lit candle.',
      `Contemplate the image of ${hexagram.englishName} (${hexagram.name}).`,
      'Write the hexagram in your journal with its lines.',
      hasChangingLines
        ? `Meditate on the transformation from ${hexagram.name} to the relating hexagram.`
        : 'Sit with the stable energy of this hexagram.',
      'Record any insights that arise.',
      'Close with gratitude for the oracle\'s wisdom.'
    ],
    intention: `Integrate the wisdom of ${hexagram.keyword}`,
    bestTiming: hexagram.timing,
    element: TRIGRAMS[hexagram.trigrams.upper].element as any,
    archetype: hexagram.archetypeCorrespondence
  };
}

/**
 * Calculate elemental balance from hexagram
 */
function calculateElementalBalance(hexagram: Hexagram, transformed?: Hexagram): ElementalSignature {
  const base = hexagram.elementalResonance;

  if (!transformed) {
    return base;
  }

  // Average with transformed hexagram for transitional state
  const trans = transformed.elementalResonance;
  return {
    fire: (base.fire + trans.fire) / 2,
    water: (base.water + trans.water) / 2,
    earth: (base.earth + trans.earth) / 2,
    air: (base.air + trans.air) / 2,
    aether: (base.aether + trans.aether) / 2
  };
}

/**
 * Cast a complete I Ching reading
 */
export function castIChing(
  query: string,
  method: 'yarrow' | 'coins' = 'coins'
): IChingReading {
  // Cast the lines
  const castLines = castAllLines(method);

  // Find the hexagram(s)
  const { hexagram, changingLines, transformedHexagram } = findHexagramFromLines(castLines);

  // Generate interpretation
  const changingLinesText = getChangingLinesInterpretation(hexagram, changingLines);

  let insight = hexagram.soulInterpretation;
  if (transformedHexagram) {
    insight += `\n\nThe situation is transforming toward ${transformedHexagram.englishName} (${transformedHexagram.name}): ${transformedHexagram.soulInterpretation}`;
  }

  // Soul guidance combines hexagram guidance with changing lines
  let soulGuidance = hexagram.guidance;
  if (changingLines.length > 0) {
    soulGuidance += '\n\n' + changingLinesText;
  }

  return {
    query,
    method,
    castLines,
    primaryHexagram: hexagram,
    changingLines,
    transformedHexagram,
    insight,
    soulGuidance,
    ritual: generateRitual(hexagram, changingLines),
    timestamp: new Date()
  };
}

/**
 * Get daily hexagram based on date
 */
export function getDailyHexagram(date: Date = new Date()): Hexagram {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const hexagramNumber = (dayOfYear % 64) + 1;
  return getHexagram(hexagramNumber) || getHexagram(1)!;
}

/**
 * Get hexagram for specific life question categories
 */
export function getHexagramForCategory(category: 'relationship' | 'career' | 'health' | 'spiritual' | 'decision'): {
  suggestedHexagrams: Hexagram[];
  guidance: string;
} {
  const categoryHexagrams: Record<string, number[]> = {
    relationship: [31, 32, 38, 53, 54, 58, 8, 13],
    career: [1, 7, 14, 35, 42, 46, 50, 55],
    health: [27, 32, 48, 52, 57, 60, 61, 24],
    spiritual: [1, 2, 20, 29, 33, 52, 57, 61],
    decision: [4, 5, 6, 21, 43, 47, 49, 64]
  };

  const numbers = categoryHexagrams[category] || categoryHexagrams.decision;
  const hexagrams = numbers.map(n => getHexagram(n)).filter(Boolean) as Hexagram[];

  const guidances: Record<string, string> = {
    relationship: 'These hexagrams speak to the dynamics of connection, attraction, and lasting bonds.',
    career: 'These hexagrams address initiative, leadership, growth, and worldly success.',
    health: 'These hexagrams speak to nourishment, balance, restoration, and vital energy.',
    spiritual: 'These hexagrams illuminate the path of inner development and awakening.',
    decision: 'These hexagrams help navigate crossroads and moments of choice.'
  };

  return {
    suggestedHexagrams: hexagrams,
    guidance: guidances[category]
  };
}

export default {
  castIChing,
  castCoinLine,
  castYarrowLine,
  castAllLines,
  findHexagramFromLines,
  getDailyHexagram,
  getHexagramForCategory
};
