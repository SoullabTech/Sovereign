/**
 * I Ching Trigrams (Ba Gua)
 * The 8 fundamental trigrams that combine to form 64 hexagrams
 */

import { Trigram, TrigramKey, WuXingElement } from '../core/types';

export const TRIGRAMS: Record<TrigramKey, Trigram> = {
  heaven: {
    key: 'heaven',
    name: 'Heaven',
    chineseName: 'Qian',
    symbol: '☰',
    lines: ['yang', 'yang', 'yang'],
    element: 'metal',
    attribute: 'Creative',
    image: 'Heaven, the sky',
    direction: 'Northwest',
    family: 'Father',
    bodyPart: 'Head',
    animal: 'Horse',
    season: 'Late autumn',
    time: 'Evening',
    keywords: ['Creativity', 'Strength', 'Leadership', 'Initiative', 'Masculinity', 'Power']
  },
  earth: {
    key: 'earth',
    name: 'Earth',
    chineseName: 'Kun',
    symbol: '☷',
    lines: ['yin', 'yin', 'yin'],
    element: 'earth',
    attribute: 'Receptive',
    image: 'Earth, the ground',
    direction: 'Southwest',
    family: 'Mother',
    bodyPart: 'Belly',
    animal: 'Cow',
    season: 'Late summer',
    time: 'Afternoon',
    keywords: ['Receptivity', 'Nurturing', 'Devotion', 'Support', 'Femininity', 'Yielding']
  },
  thunder: {
    key: 'thunder',
    name: 'Thunder',
    chineseName: 'Zhen',
    symbol: '☳',
    lines: ['yang', 'yin', 'yin'],
    element: 'wood',
    attribute: 'Arousing',
    image: 'Thunder, lightning',
    direction: 'East',
    family: 'Eldest Son',
    bodyPart: 'Foot',
    animal: 'Dragon',
    season: 'Spring',
    time: 'Morning',
    keywords: ['Shock', 'Movement', 'Initiative', 'Arousal', 'Action', 'Awakening']
  },
  water: {
    key: 'water',
    name: 'Water',
    chineseName: 'Kan',
    symbol: '☵',
    lines: ['yin', 'yang', 'yin'],
    element: 'water',
    attribute: 'Abysmal',
    image: 'Water, rain, moon',
    direction: 'North',
    family: 'Middle Son',
    bodyPart: 'Ear',
    animal: 'Pig',
    season: 'Winter',
    time: 'Midnight',
    keywords: ['Danger', 'Depth', 'Flow', 'Mystery', 'Wisdom', 'Emotion']
  },
  mountain: {
    key: 'mountain',
    name: 'Mountain',
    chineseName: 'Gen',
    symbol: '☶',
    lines: ['yin', 'yin', 'yang'],
    element: 'earth',
    attribute: 'Stillness',
    image: 'Mountain, gate',
    direction: 'Northeast',
    family: 'Youngest Son',
    bodyPart: 'Hand',
    animal: 'Dog',
    season: 'Late winter',
    time: 'Early morning',
    keywords: ['Stillness', 'Meditation', 'Boundaries', 'Rest', 'Stopping', 'Contemplation']
  },
  wind: {
    key: 'wind',
    name: 'Wind',
    chineseName: 'Xun',
    symbol: '☴',
    lines: ['yin', 'yang', 'yang'],
    element: 'wood',
    attribute: 'Gentle',
    image: 'Wind, wood',
    direction: 'Southeast',
    family: 'Eldest Daughter',
    bodyPart: 'Thigh',
    animal: 'Rooster',
    season: 'Late spring',
    time: 'Late morning',
    keywords: ['Penetration', 'Gentleness', 'Flexibility', 'Influence', 'Persistence', 'Growth']
  },
  fire: {
    key: 'fire',
    name: 'Fire',
    chineseName: 'Li',
    symbol: '☲',
    lines: ['yang', 'yin', 'yang'],
    element: 'fire',
    attribute: 'Clinging',
    image: 'Fire, sun, lightning',
    direction: 'South',
    family: 'Middle Daughter',
    bodyPart: 'Eye',
    animal: 'Pheasant',
    season: 'Summer',
    time: 'Noon',
    keywords: ['Clarity', 'Intelligence', 'Beauty', 'Illumination', 'Awareness', 'Radiance']
  },
  lake: {
    key: 'lake',
    name: 'Lake',
    chineseName: 'Dui',
    symbol: '☱',
    lines: ['yang', 'yang', 'yin'],
    element: 'metal',
    attribute: 'Joyous',
    image: 'Lake, marsh',
    direction: 'West',
    family: 'Youngest Daughter',
    bodyPart: 'Mouth',
    animal: 'Sheep',
    season: 'Autumn',
    time: 'Evening',
    keywords: ['Joy', 'Communication', 'Pleasure', 'Expression', 'Openness', 'Exchange']
  }
};

/**
 * Get trigram by key
 */
export function getTrigram(key: TrigramKey): Trigram {
  return TRIGRAMS[key];
}

/**
 * Get trigram from binary lines (0=yin, 1=yang)
 */
export function getTrigramFromLines(lines: [number, number, number]): Trigram | null {
  const key = `${lines[0]}${lines[1]}${lines[2]}`;
  const mapping: Record<string, TrigramKey> = {
    '111': 'heaven',
    '000': 'earth',
    '100': 'thunder',
    '010': 'water',
    '001': 'mountain',
    '011': 'wind',
    '101': 'fire',
    '110': 'lake'
  };
  const trigramKey = mapping[key];
  return trigramKey ? TRIGRAMS[trigramKey] : null;
}

/**
 * Get lines as binary array from trigram
 */
export function getTrigramBinary(key: TrigramKey): [number, number, number] {
  const trigram = TRIGRAMS[key];
  return trigram.lines.map(l => l === 'yang' ? 1 : 0) as [number, number, number];
}

/**
 * Calculate relationship between two trigrams based on Wu Xing
 */
export function getTrigramRelationship(
  trigram1: TrigramKey,
  trigram2: TrigramKey
): { type: 'generating' | 'controlling' | 'same' | 'neutral'; description: string } {
  const t1 = TRIGRAMS[trigram1];
  const t2 = TRIGRAMS[trigram2];

  if (t1.element === t2.element) {
    return { type: 'same', description: 'Same element - mutual understanding and reinforcement' };
  }

  // Wu Xing generating cycle: Wood -> Fire -> Earth -> Metal -> Water -> Wood
  const generatingCycle: Record<WuXingElement, WuXingElement> = {
    wood: 'fire',
    fire: 'earth',
    earth: 'metal',
    metal: 'water',
    water: 'wood'
  };

  // Wu Xing controlling cycle: Wood -> Earth -> Water -> Fire -> Metal -> Wood
  const controllingCycle: Record<WuXingElement, WuXingElement> = {
    wood: 'earth',
    earth: 'water',
    water: 'fire',
    fire: 'metal',
    metal: 'wood'
  };

  if (generatingCycle[t1.element] === t2.element) {
    return { type: 'generating', description: `${t1.element} generates ${t2.element} - supportive and nourishing` };
  }

  if (controllingCycle[t1.element] === t2.element) {
    return { type: 'controlling', description: `${t1.element} controls ${t2.element} - challenging but growth-oriented` };
  }

  return { type: 'neutral', description: 'Neutral relationship - independent energies' };
}

/**
 * Get all trigrams as array
 */
export function getAllTrigrams(): Trigram[] {
  return Object.values(TRIGRAMS);
}

/**
 * Get trigrams by element
 */
export function getTrigramsByElement(element: WuXingElement): Trigram[] {
  return Object.values(TRIGRAMS).filter(t => t.element === element);
}

export default TRIGRAMS;
