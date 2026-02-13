/**
 * The Eight Trigrams (Ba Gua)
 *
 * The building blocks of the 64 hexagrams.
 * Each trigram consists of three lines (yin or yang)
 * and represents a fundamental force or quality.
 *
 * Element mapping follows Spiralogic resonance, not
 * traditional Chinese five-element theory directly.
 */

import type { Trigram } from './types';

export const TRIGRAMS: Record<number, Trigram> = {
  1: {
    number: 1,
    name: "Ch'ien",
    english: 'The Creative',
    attribute: 'Strong',
    image: 'Heaven',
    family: 'Father',
    element: 'fire',
    lines: [true, true, true],
  },
  2: {
    number: 2,
    name: "K'un",
    english: 'The Receptive',
    attribute: 'Devoted, Yielding',
    image: 'Earth',
    family: 'Mother',
    element: 'earth',
    lines: [false, false, false],
  },
  3: {
    number: 3,
    name: 'Chen',
    english: 'The Arousing',
    attribute: 'Inciting Movement',
    image: 'Thunder',
    family: 'First Son',
    element: 'fire',
    lines: [true, false, false],
  },
  4: {
    number: 4,
    name: "K'an",
    english: 'The Abysmal',
    attribute: 'Dangerous',
    image: 'Water',
    family: 'Second Son',
    element: 'water',
    lines: [false, true, false],
  },
  5: {
    number: 5,
    name: 'Ken',
    english: 'Keeping Still',
    attribute: 'Resting',
    image: 'Mountain',
    family: 'Third Son',
    element: 'earth',
    lines: [false, false, true],
  },
  6: {
    number: 6,
    name: 'Sun',
    english: 'The Gentle',
    attribute: 'Penetrating',
    image: 'Wind, Wood',
    family: 'First Daughter',
    element: 'air',
    lines: [false, true, true],
  },
  7: {
    number: 7,
    name: 'Li',
    english: 'The Clinging',
    attribute: 'Light-giving',
    image: 'Fire',
    family: 'Second Daughter',
    element: 'fire',
    lines: [true, false, true],
  },
  8: {
    number: 8,
    name: 'Tui',
    english: 'The Joyous',
    attribute: 'Joyful',
    image: 'Lake',
    family: 'Third Daughter',
    element: 'water',
    lines: [true, true, false],
  },
};

/**
 * Get a trigram by number. Returns undefined for invalid numbers.
 */
export function getTrigram(number: number): Trigram | undefined {
  return TRIGRAMS[number];
}

/**
 * Find a trigram by its line pattern.
 */
export function getTrigramByLines(lines: [boolean, boolean, boolean]): Trigram | undefined {
  return Object.values(TRIGRAMS).find(
    t => t.lines[0] === lines[0] && t.lines[1] === lines[1] && t.lines[2] === lines[2]
  );
}
