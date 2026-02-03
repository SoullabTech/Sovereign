/**
 * Rune Casting Logic
 * Drawing, spreads, and reading generation for Elder Futhark
 */

import {
  Rune,
  RuneReading,
  RuneSpread,
  DrawnRune,
  SpreadPosition,
  ElementalSignature,
  DivinationRitual
} from '../core/types';
import { ELDER_FUTHARK, getRune, getAett } from './elder-futhark';

/**
 * Rune Spreads
 */

export const SINGLE_RUNE_SPREAD: RuneSpread = {
  name: 'Single Rune',
  description: 'A single rune for daily guidance or quick insight',
  runeCount: 1,
  positions: [
    {
      name: 'The Rune',
      description: 'Your guidance for the moment',
      index: 0
    }
  ],
  purpose: 'Daily guidance, quick answers, meditation focus',
  method: 'Draw one rune from the bag while focusing on your question.'
};

export const NORNS_SPREAD: RuneSpread = {
  name: 'The Norns',
  description: 'Three runes representing past (Urd), present (Verdandi), and future (Skuld)',
  runeCount: 3,
  positions: [
    {
      name: 'Urd (Past)',
      description: 'What has been, the foundation laid by past actions',
      index: 0
    },
    {
      name: 'Verdandi (Present)',
      description: 'What is being woven now, current energies',
      index: 1
    },
    {
      name: 'Skuld (Future)',
      description: 'What shall be, the threads being woven toward',
      index: 2
    }
  ],
  purpose: 'Timeline readings, understanding the flow of fate',
  method: 'Draw three runes from left to right, representing the Norns who weave fate.'
};

export const FOUR_DIRECTIONS_SPREAD: RuneSpread = {
  name: 'Four Directions',
  description: 'Runes for the four cardinal directions and their influences',
  runeCount: 4,
  positions: [
    {
      name: 'East - New Beginnings',
      description: 'What is dawning, new energies arriving',
      index: 0
    },
    {
      name: 'South - Power',
      description: 'Your strength and vitality in the situation',
      index: 1
    },
    {
      name: 'West - Emotions',
      description: 'Emotional undercurrents, what needs release',
      index: 2
    },
    {
      name: 'North - Wisdom',
      description: 'Ancestral guidance, deep knowing',
      index: 3
    }
  ],
  purpose: 'Directional influences, balanced perspective',
  method: 'Cast runes onto a cloth, noting which falls in each direction.'
};

export const FIVE_RUNE_CROSS: RuneSpread = {
  name: 'Five Rune Cross',
  description: 'A cross pattern exploring a situation from multiple angles',
  runeCount: 5,
  positions: [
    {
      name: 'Center - The Situation',
      description: 'The heart of the matter, what you are asking about',
      index: 0
    },
    {
      name: 'Left - Past Influences',
      description: 'What has led to this moment',
      index: 1
    },
    {
      name: 'Right - Future Influences',
      description: 'Where this is heading',
      index: 2
    },
    {
      name: 'Above - Challenge',
      description: 'The obstacle or test you face',
      index: 3
    },
    {
      name: 'Below - Foundation',
      description: 'The underlying force supporting you',
      index: 4
    }
  ],
  purpose: 'Detailed situation analysis',
  method: 'Draw five runes, placing them in a cross pattern.'
};

export const RUNIC_COMPASS: RuneSpread = {
  name: 'Runic Compass',
  description: 'Eight runes in a circle plus center for comprehensive guidance',
  runeCount: 9,
  positions: [
    {
      name: 'Center - Self',
      description: 'You at the center of the situation',
      index: 0
    },
    {
      name: 'North - Ancestors',
      description: 'Guidance from those who came before',
      index: 1
    },
    {
      name: 'Northeast - Goals',
      description: 'What you are striving toward',
      index: 2
    },
    {
      name: 'East - New Beginnings',
      description: 'Fresh energies and opportunities',
      index: 3
    },
    {
      name: 'Southeast - Relationships',
      description: 'How others influence the situation',
      index: 4
    },
    {
      name: 'South - Passion',
      description: 'Your drive and creative fire',
      index: 5
    },
    {
      name: 'Southwest - Shadow',
      description: 'Hidden aspects requiring attention',
      index: 6
    },
    {
      name: 'West - Intuition',
      description: 'What your deep knowing says',
      index: 7
    },
    {
      name: 'Northwest - Resources',
      description: 'What you have to work with',
      index: 8
    }
  ],
  purpose: 'Comprehensive life reading, major decisions',
  method: 'Draw nine runes, placing them in a compass rose pattern with one at center.'
};

export const AETT_SPREAD: RuneSpread = {
  name: 'Aett Reading',
  description: 'Three runes, one from each of the three Aettir (families)',
  runeCount: 3,
  positions: [
    {
      name: 'Freya\'s Aett - Material',
      description: 'Guidance for your material world and basic needs',
      index: 0
    },
    {
      name: 'Heimdall\'s Aett - Emotional',
      description: 'Guidance for your emotional and transformational journey',
      index: 1
    },
    {
      name: 'Tyr\'s Aett - Spiritual',
      description: 'Guidance for your spiritual path and higher purpose',
      index: 2
    }
  ],
  purpose: 'Balanced guidance across all life domains',
  method: 'Separate runes by Aett, draw one from each family.'
};

/**
 * All available spreads
 */
export const RUNE_SPREADS: Record<string, RuneSpread> = {
  'single': SINGLE_RUNE_SPREAD,
  'norns': NORNS_SPREAD,
  'four-directions': FOUR_DIRECTIONS_SPREAD,
  'five-cross': FIVE_RUNE_CROSS,
  'compass': RUNIC_COMPASS,
  'aett': AETT_SPREAD
};

/**
 * Get spread by key
 */
export function getRuneSpread(key: string): RuneSpread | undefined {
  return RUNE_SPREADS[key];
}

/**
 * Fisher-Yates shuffle
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Determine if a rune is reversed (merkstave)
 * Some runes look the same reversed (Gebo, Isa, etc.) - these return false
 */
function determineReversed(rune: Rune): boolean {
  // Runes that have no reversal (look the same upside down or have no merkstave)
  const noReversalRunes = ['Gebo', 'Hagalaz', 'Nauthiz', 'Isa', 'Jera', 'Eihwaz', 'Sowilo', 'Ingwaz', 'Dagaz'];

  if (noReversalRunes.includes(rune.name)) {
    return false;
  }

  return Math.random() < 0.5;
}

/**
 * Shuffle the rune set
 */
export function shuffleRunes(runes: Rune[] = ELDER_FUTHARK): Rune[] {
  let shuffled = shuffleArray(runes);
  shuffled = shuffleArray(shuffled);
  shuffled = shuffleArray(shuffled);
  return shuffled;
}

/**
 * Draw a single rune
 */
export function drawSingleRune(
  runes: Rune[] = ELDER_FUTHARK,
  allowReversals: boolean = true
): DrawnRune {
  const shuffled = shuffleRunes(runes);
  const rune = shuffled[0];
  const isReversed = allowReversals ? determineReversed(rune) : false;

  return {
    rune,
    position: {
      name: 'The Rune',
      description: 'Your guidance',
      index: 0
    },
    isReversed,
    interpretation: isReversed && rune.reversedMeaning ? rune.reversedMeaning : rune.uprightMeaning
  };
}

/**
 * Draw runes for a spread
 */
export function drawRunes(
  spread: RuneSpread,
  runes: Rune[] = ELDER_FUTHARK,
  allowReversals: boolean = true
): DrawnRune[] {
  const shuffled = shuffleRunes(runes);
  const drawnRunes: DrawnRune[] = [];

  for (let i = 0; i < spread.runeCount; i++) {
    const rune = shuffled[i];
    const position = spread.positions[i];
    const isReversed = allowReversals ? determineReversed(rune) : false;

    drawnRunes.push({
      rune,
      position,
      isReversed,
      interpretation: isReversed && rune.reversedMeaning ? rune.reversedMeaning : rune.uprightMeaning
    });
  }

  return drawnRunes;
}

/**
 * Draw one rune from each Aett
 */
export function drawAettRunes(allowReversals: boolean = true): DrawnRune[] {
  const aetts: Array<'freya' | 'heimdall' | 'tyr'> = ['freya', 'heimdall', 'tyr'];
  const spread = RUNE_SPREADS['aett'];

  return aetts.map((aett, index) => {
    const aettRunes = getAett(aett);
    const shuffled = shuffleRunes(aettRunes);
    const rune = shuffled[0];
    const isReversed = allowReversals ? determineReversed(rune) : false;

    return {
      rune,
      position: spread.positions[index],
      isReversed,
      interpretation: isReversed && rune.reversedMeaning ? rune.reversedMeaning : rune.uprightMeaning
    };
  });
}

/**
 * Calculate elemental balance from drawn runes
 */
export function calculateElementalBalance(drawnRunes: DrawnRune[]): ElementalSignature {
  const balance: ElementalSignature = {
    fire: 0,
    water: 0,
    earth: 0,
    air: 0,
    aether: 0
  };

  for (const { rune, isReversed } of drawnRunes) {
    const weight = isReversed ? 0.5 : 1;

    if (rune.elementalResonance) {
      balance.fire += rune.elementalResonance.fire * weight;
      balance.water += rune.elementalResonance.water * weight;
      balance.earth += rune.elementalResonance.earth * weight;
      balance.air += rune.elementalResonance.air * weight;
      balance.aether += rune.elementalResonance.aether * weight;
    } else {
      // Fallback to primary element
      switch (rune.element) {
        case 'fire': balance.fire += weight; break;
        case 'water': balance.water += weight; break;
        case 'earth': balance.earth += weight; break;
        case 'air': balance.air += weight; break;
        case 'aether': balance.aether += weight; break;
      }
    }
  }

  // Normalize
  const total = balance.fire + balance.water + balance.earth + balance.air + balance.aether;
  if (total > 0) {
    balance.fire /= total;
    balance.water /= total;
    balance.earth /= total;
    balance.air /= total;
    balance.aether /= total;
  }

  return balance;
}

/**
 * Get dominant element
 */
export function getDominantElement(drawnRunes: DrawnRune[]): string {
  const balance = calculateElementalBalance(drawnRunes);
  const elements = Object.entries(balance) as [string, number][];
  elements.sort((a, b) => b[1] - a[1]);
  return elements[0][0];
}

/**
 * Generate soul insight from the casting
 */
function generateSoulInsight(drawnRunes: DrawnRune[], query: string): string {
  const reversedCount = drawnRunes.filter(d => d.isReversed).length;
  const dominantElement = getDominantElement(drawnRunes);

  // Check for aett dominance
  const aettCounts = { freya: 0, heimdall: 0, tyr: 0 };
  drawnRunes.forEach(d => aettCounts[d.rune.aett]++);
  const dominantAett = Object.entries(aettCounts).sort((a, b) => b[1] - a[1])[0];

  let insight = '';

  // Aett themes
  if (dominantAett[1] > drawnRunes.length / 3) {
    const aettInsights: Record<string, string> = {
      freya: 'Freya\'s Aett dominates, focusing your attention on material foundations, primal forces, and the resources you need to thrive. ',
      heimdall: 'Heimdall\'s Aett dominates, calling you to navigate emotional depths, natural cycles, and transformative forces. ',
      tyr: 'Tyr\'s Aett dominates, directing your attention to spiritual matters, social bonds, and your connection to the greater whole. '
    };
    insight += aettInsights[dominantAett[0]] || '';
  }

  // Reversal patterns
  if (reversedCount === 0) {
    insight += 'All runes stand upright, indicating clear channels and direct energy available to you. ';
  } else if (reversedCount > drawnRunes.length / 2) {
    insight += 'Many runes appear in merkstave (reversed), suggesting blocked energies or internal work required before external manifestation. ';
  }

  // Elemental theme
  const elementInsights: Record<string, string> = {
    fire: 'Fire energy burns through this casting—act with passion, courage, and creative will.',
    water: 'Water flows through this reading—trust your emotions, dreams, and intuitive depths.',
    earth: 'Earth grounds this casting—build slowly, trust material processes, stay rooted.',
    air: 'Air currents carry these runes—communicate clearly, think strategically, embrace change.',
    aether: 'Spirit pervades this casting—seek the sacred in all, trust higher guidance.'
  };

  insight += elementInsights[dominantElement] || '';

  return insight;
}

/**
 * Generate ritual suggestion
 */
function generateRitual(drawnRunes: DrawnRune[], spread: RuneSpread): DivinationRitual {
  const dominantElement = getDominantElement(drawnRunes);
  const primaryRune = drawnRunes[0].rune;

  const elementMaterials: Record<string, string[]> = {
    fire: ['Red candle', 'Matches', 'Small piece of paper for rune carving'],
    water: ['Bowl of water', 'Salt', 'Blue cloth'],
    earth: ['Stones or rune set', 'Soil or sand', 'Green candle'],
    air: ['Incense', 'Feather', 'Yellow candle'],
    aether: ['White candle', 'Clear quartz', 'Meditation cushion']
  };

  return {
    name: `${spread.name} Integration`,
    duration: spread.runeCount * 5 + 15,
    materials: [
      'Your rune set or drawn rune symbols',
      'Journal and pen',
      ...(elementMaterials[dominantElement] || elementMaterials.aether)
    ],
    steps: [
      'Create sacred space by calling to the directions or your ancestors.',
      `Draw or place the ${primaryRune.symbol} (${primaryRune.name}) rune prominently.`,
      `Chant the rune name ${primaryRune.name} three times while focusing on its symbol.`,
      'Meditate on the message each rune brings to its position.',
      'Write the runes and their positions in your journal.',
      'Record any insights, images, or feelings that arise.',
      'Thank the runes and close your sacred space.'
    ],
    intention: `Integrate the wisdom of ${primaryRune.name} and the ${spread.name} casting`,
    bestTiming: 'Dawn or dusk, when the veil is thin',
    element: dominantElement as any,
    archetype: primaryRune.name
  };
}

/**
 * Generate guidance text
 */
function generateGuidance(drawnRunes: DrawnRune[], spread: RuneSpread): string {
  const lines = drawnRunes.map(({ rune, position, isReversed }) => {
    const direction = isReversed ? '(Merkstave/Reversed)' : '';
    const meaning = isReversed && rune.reversedMeaning ? rune.reversedMeaning : rune.uprightMeaning;
    return `**${position.name}** — ${rune.symbol} ${rune.name} ${direction}\n*${rune.meaning}*\n${meaning}`;
  });

  return lines.join('\n\n');
}

/**
 * Perform a complete rune reading
 */
export function castRunes(
  query: string,
  spreadKey: string,
  allowReversals: boolean = true,
  runes: Rune[] = ELDER_FUTHARK
): RuneReading {
  const spread = getRuneSpread(spreadKey);
  if (!spread) {
    throw new Error(`Unknown spread: ${spreadKey}`);
  }

  let drawnRunes: DrawnRune[];

  if (spreadKey === 'aett') {
    drawnRunes = drawAettRunes(allowReversals);
  } else {
    drawnRunes = drawRunes(spread, runes, allowReversals);
  }

  return {
    query,
    spread,
    drawnRunes,
    insight: generateSoulInsight(drawnRunes, query),
    soulGuidance: generateGuidance(drawnRunes, spread),
    ritual: generateRitual(drawnRunes, spread),
    timestamp: new Date()
  };
}

/**
 * Daily rune draw
 */
export function dailyRuneDraw(allowReversals: boolean = true): RuneReading {
  return castRunes(
    'What guidance does the day hold?',
    'single',
    allowReversals
  );
}

/**
 * Norns reading (past/present/future)
 */
export function nornsReading(
  query: string,
  allowReversals: boolean = true
): RuneReading {
  return castRunes(query, 'norns', allowReversals);
}

/**
 * Get daily rune based on date (consistent per day)
 */
export function getDailyRune(date: Date = new Date()): Rune {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const runeIndex = dayOfYear % ELDER_FUTHARK.length;
  return ELDER_FUTHARK[runeIndex];
}

/**
 * Get rune for birth date (runic astrology)
 */
export function getBirthRune(birthDate: Date): Rune {
  const month = birthDate.getMonth();
  const day = birthDate.getDate();

  // Runic half-months (approximate)
  const runicCalendar = [
    { start: [5, 29], end: [6, 13], rune: 'Fehu' },
    { start: [6, 14], end: [6, 28], rune: 'Uruz' },
    { start: [6, 29], end: [7, 13], rune: 'Thurisaz' },
    { start: [7, 14], end: [7, 28], rune: 'Ansuz' },
    { start: [7, 29], end: [8, 12], rune: 'Raidho' },
    { start: [8, 13], end: [8, 28], rune: 'Kenaz' },
    { start: [8, 29], end: [9, 12], rune: 'Gebo' },
    { start: [9, 13], end: [9, 27], rune: 'Wunjo' },
    { start: [9, 28], end: [10, 12], rune: 'Hagalaz' },
    { start: [10, 13], end: [10, 27], rune: 'Nauthiz' },
    { start: [10, 28], end: [11, 11], rune: 'Isa' },
    { start: [11, 12], end: [11, 27], rune: 'Jera' },
    { start: [11, 28], end: [12, 12], rune: 'Eihwaz' },
    { start: [12, 13], end: [12, 27], rune: 'Perthro' },
    { start: [12, 28], end: [0, 12], rune: 'Algiz' },
    { start: [0, 13], end: [0, 27], rune: 'Sowilo' },
    { start: [0, 28], end: [1, 12], rune: 'Tiwaz' },
    { start: [1, 13], end: [1, 26], rune: 'Berkano' },
    { start: [1, 27], end: [2, 13], rune: 'Ehwaz' },
    { start: [2, 14], end: [2, 29], rune: 'Mannaz' },
    { start: [2, 30], end: [3, 13], rune: 'Laguz' },
    { start: [3, 14], end: [3, 28], rune: 'Ingwaz' },
    { start: [3, 29], end: [4, 13], rune: 'Dagaz' },
    { start: [4, 14], end: [5, 28], rune: 'Othala' }
  ];

  for (const period of runicCalendar) {
    const [startMonth, startDay] = period.start;
    const [endMonth, endDay] = period.end;

    // Handle year wraparound (December to January)
    if (startMonth > endMonth) {
      if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
        return getRune(period.rune)!;
      }
    } else {
      if ((month === startMonth && day >= startDay) ||
          (month > startMonth && month < endMonth) ||
          (month === endMonth && day <= endDay)) {
        return getRune(period.rune)!;
      }
    }
  }

  // Fallback to first rune
  return ELDER_FUTHARK[0];
}

export default {
  castRunes,
  dailyRuneDraw,
  nornsReading,
  drawSingleRune,
  drawRunes,
  drawAettRunes,
  shuffleRunes,
  getDailyRune,
  getBirthRune,
  getRuneSpread,
  calculateElementalBalance,
  getDominantElement,
  RUNE_SPREADS
};
