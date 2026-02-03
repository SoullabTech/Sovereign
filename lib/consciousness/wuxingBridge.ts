/**
 * WU XING BRIDGE: Maps Chinese Five Elements to Spiralogic
 *
 * Wu Xing (五行): Wood, Fire, Earth, Metal, Water
 * Spiralogic: Fire, Water, Earth, Air, Aether
 *
 * This is a STRUCTURAL mapping, not a poetic metaphor. The bridge allows:
 * 1. BaZi constitution to inform Spiral phase work
 * 2. Wu Xing imbalances to suggest therapeutic moves
 * 3. I Ching readings to feed back into the Spiral Core
 *
 * Mapping rationale:
 * - Wood → Air (both: planning, direction, growth initiation, mental clarity)
 * - Fire → Fire (direct correspondence: will, passion, transformation)
 * - Earth → Earth (direct correspondence: stability, nourishment, integration)
 * - Metal → Air (both: discernment, form, boundaries, refinement, breath)
 * - Water → Water (direct correspondence: depth, emotion, wisdom, flow)
 * - Aether has no Wu Xing peer (it is the Spiralogic-only unifying field)
 *
 * Note: Wood and Metal both map to Air because Air in Spiralogic encompasses
 * both the expansive/initiating quality (Wood) and the refining/discerning
 * quality (Metal). When precision matters, we track the Wu Xing source.
 */

import type { SpiralogicElement } from './spiralogic-12-phases';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type WuXingElement = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

export interface WuXingBalance {
  wood: number;   // 0-100 or raw count
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

export interface WuXingConstitution {
  /** Day Master element - the "self" in BaZi */
  dayMaster: WuXingElement;
  dayMasterYinYang: 'yin' | 'yang';

  /** Raw element counts from all pillars */
  elementTally: WuXingBalance;

  /** Normalized percentages (sum to 100) */
  elementPercentages: WuXingBalance;

  /** Elements with above-average presence */
  dominant: WuXingElement[];

  /** Elements with below-average presence */
  deficient: WuXingElement[];

  /** Balance score 0-100 (higher = more balanced) */
  balanceScore: number;

  /** Key relationships in the chart */
  relationships: {
    supporting: WuXingElement[];   // Elements that generate the day master
    draining: WuXingElement[];     // Elements the day master generates
    controlling: WuXingElement[];  // Elements that control the day master
    controlled: WuXingElement[];   // Elements the day master controls
  };
}

export interface WuXingMoment {
  /** Current day's stem element */
  dayStem: WuXingElement;
  dayStemYinYang: 'yin' | 'yang';

  /** Current hour's branch element */
  hourBranch: WuXingElement;

  /** Current month's seasonal Qi */
  seasonalQi: WuXingElement;

  /** Organ clock phase (if relevant) */
  organClock?: {
    organ: string;
    element: WuXingElement;
    peakHour: string;
    currentPhase: 'peak' | 'declining' | 'low' | 'rising';
  };

  /** Combined moment influence */
  momentDominant: WuXingElement[];
}

export interface ElementBridgeMapping {
  wuxing: WuXingElement;
  spiralogic: SpiralogicElement;
  quality: string;
  bodySystem: string;
  spirit: string;        // TCM Five Spirits (Shen, Hun, Po, Yi, Zhi)
  emotion: string;
  season: string;
  direction: string;
  color: string;
  taste: string;
  organ: {
    yin: string;
    yang: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ELEMENT BRIDGE MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

export const ELEMENT_BRIDGE: Record<WuXingElement, ElementBridgeMapping> = {
  wood: {
    wuxing: 'wood',
    spiralogic: 'air',
    quality: 'Growth, planning, vision, direction',
    bodySystem: 'Tendons, sinews, eyes, nails',
    spirit: 'Hun (Ethereal Soul)',
    emotion: 'Anger / Assertiveness',
    season: 'Spring',
    direction: 'East',
    color: 'Green',
    taste: 'Sour',
    organ: {
      yin: 'Liver',
      yang: 'Gallbladder'
    }
  },
  fire: {
    wuxing: 'fire',
    spiralogic: 'fire',
    quality: 'Transformation, passion, consciousness',
    bodySystem: 'Heart, blood vessels, tongue, complexion',
    spirit: 'Shen (Spirit/Mind)',
    emotion: 'Joy / Overstimulation',
    season: 'Summer',
    direction: 'South',
    color: 'Red',
    taste: 'Bitter',
    organ: {
      yin: 'Heart',
      yang: 'Small Intestine'
    }
  },
  earth: {
    wuxing: 'earth',
    spiralogic: 'earth',
    quality: 'Stability, nourishment, integration, center',
    bodySystem: 'Muscles, flesh, mouth, lips',
    spirit: 'Yi (Intellect/Intention)',
    emotion: 'Worry / Pensiveness',
    season: 'Late Summer',
    direction: 'Center',
    color: 'Yellow',
    taste: 'Sweet',
    organ: {
      yin: 'Spleen',
      yang: 'Stomach'
    }
  },
  metal: {
    wuxing: 'metal',
    spiralogic: 'air',
    quality: 'Discernment, boundaries, refinement, letting go',
    bodySystem: 'Skin, body hair, nose, lungs',
    spirit: 'Po (Corporeal Soul)',
    emotion: 'Grief / Sadness',
    season: 'Autumn',
    direction: 'West',
    color: 'White',
    taste: 'Pungent',
    organ: {
      yin: 'Lung',
      yang: 'Large Intestine'
    }
  },
  water: {
    wuxing: 'water',
    spiralogic: 'water',
    quality: 'Depth, wisdom, will, essential reserves',
    bodySystem: 'Bones, marrow, ears, hair (head)',
    spirit: 'Zhi (Will/Ambition)',
    emotion: 'Fear / Awe',
    season: 'Winter',
    direction: 'North',
    color: 'Black/Blue',
    taste: 'Salty',
    organ: {
      yin: 'Kidney',
      yang: 'Bladder'
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// GENERATION & CONTROL CYCLES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Sheng Cycle (生): Generation / Nourishment
 * Wood → Fire → Earth → Metal → Water → Wood
 * "Mother nourishes child"
 */
export const GENERATION_CYCLE: Record<WuXingElement, WuXingElement> = {
  wood: 'fire',
  fire: 'earth',
  earth: 'metal',
  metal: 'water',
  water: 'wood'
};

/**
 * Ke Cycle (克): Control / Restriction
 * Wood → Earth → Water → Fire → Metal → Wood
 * "Grandmother controls grandchild"
 */
export const CONTROL_CYCLE: Record<WuXingElement, WuXingElement> = {
  wood: 'earth',
  earth: 'water',
  water: 'fire',
  fire: 'metal',
  metal: 'wood'
};

/**
 * Reverse generation: what nourishes this element
 */
export const MOTHER_OF: Record<WuXingElement, WuXingElement> = {
  wood: 'water',
  fire: 'wood',
  earth: 'fire',
  metal: 'earth',
  water: 'metal'
};

/**
 * Reverse control: what this element is controlled by
 */
export const CONTROLLED_BY: Record<WuXingElement, WuXingElement> = {
  wood: 'metal',
  fire: 'water',
  earth: 'wood',
  metal: 'fire',
  water: 'earth'
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAPPING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Map Wu Xing element to Spiralogic element
 */
export function wuxingToSpiralogic(wuxing: WuXingElement): SpiralogicElement {
  return ELEMENT_BRIDGE[wuxing].spiralogic;
}

/**
 * Map Spiralogic element to Wu Xing element(s)
 * Note: Air maps to both Wood and Metal
 */
export function spiralogicToWuxing(spiralogic: SpiralogicElement): WuXingElement[] {
  switch (spiralogic) {
    case 'fire': return ['fire'];
    case 'water': return ['water'];
    case 'earth': return ['earth'];
    case 'air': return ['wood', 'metal'];
    case 'aether': return []; // No direct Wu Xing correspondence
    default: return [];
  }
}

/**
 * Get the Five Spirits mapping for an element
 */
export function getSpirit(wuxing: WuXingElement): { name: string; chinese: string; function: string } {
  const spirits: Record<WuXingElement, { name: string; chinese: string; function: string }> = {
    wood: { name: 'Hun', chinese: '魂', function: 'Ethereal Soul - dreams, vision, planning, creativity' },
    fire: { name: 'Shen', chinese: '神', function: 'Spirit/Mind - consciousness, awareness, joy, connection' },
    earth: { name: 'Yi', chinese: '意', function: 'Intellect - thinking, studying, concentration, intention' },
    metal: { name: 'Po', chinese: '魄', function: 'Corporeal Soul - instinct, bodily sensation, letting go' },
    water: { name: 'Zhi', chinese: '志', function: 'Will - willpower, drive, determination, memory' }
  };
  return spirits[wuxing];
}

/**
 * Calculate element relationship
 */
export function getElementRelationship(
  from: WuXingElement,
  to: WuXingElement
): 'generates' | 'controls' | 'generated_by' | 'controlled_by' | 'same' | 'neutral' {
  if (from === to) return 'same';
  if (GENERATION_CYCLE[from] === to) return 'generates';
  if (CONTROL_CYCLE[from] === to) return 'controls';
  if (MOTHER_OF[from] === to) return 'generated_by';
  if (CONTROLLED_BY[from] === to) return 'controlled_by';
  return 'neutral';
}

// ═══════════════════════════════════════════════════════════════════════════════
// BALANCE ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

export interface BalanceAnalysis {
  /** Overall balance score 0-100 */
  score: number;

  /** State classification */
  state: 'balanced' | 'slight_imbalance' | 'significant_imbalance' | 'severe_imbalance';

  /** Elements that need support (nourishment) */
  needsSupport: WuXingElement[];

  /** Elements that are excessive (need to be drained or controlled) */
  excessive: WuXingElement[];

  /** Recommended balancing moves */
  balancingMoves: {
    element: WuXingElement;
    action: 'nourish' | 'sedate' | 'regulate';
    via: WuXingElement;
    rationale: string;
  }[];

  /** Spirit-level implications */
  spiritWork?: {
    spirit: string;
    element: WuXingElement;
    state: 'depleted' | 'agitated' | 'blocked';
    guidance: string;
  };
}

/**
 * Analyze element balance and suggest corrections
 */
export function analyzeBalance(tally: WuXingBalance): BalanceAnalysis {
  const total = tally.wood + tally.fire + tally.earth + tally.metal + tally.water;
  if (total === 0) {
    return {
      score: 50,
      state: 'balanced',
      needsSupport: [],
      excessive: [],
      balancingMoves: []
    };
  }

  const average = total / 5;
  const elements: WuXingElement[] = ['wood', 'fire', 'earth', 'metal', 'water'];

  // Calculate variance for balance score
  const variance = elements.reduce((acc, el) => {
    return acc + Math.pow(tally[el] - average, 2);
  }, 0) / 5;

  const score = Math.max(0, Math.min(100, 100 - variance * 10));

  // Classify state
  let state: BalanceAnalysis['state'];
  if (score >= 80) state = 'balanced';
  else if (score >= 60) state = 'slight_imbalance';
  else if (score >= 40) state = 'significant_imbalance';
  else state = 'severe_imbalance';

  // Find deficient and excessive elements
  const threshold = average * 0.5;
  const excessThreshold = average * 1.5;

  const needsSupport = elements.filter(el => tally[el] < threshold);
  const excessive = elements.filter(el => tally[el] > excessThreshold);

  // Generate balancing moves
  const balancingMoves: BalanceAnalysis['balancingMoves'] = [];

  for (const el of needsSupport) {
    const mother = MOTHER_OF[el];
    balancingMoves.push({
      element: el,
      action: 'nourish',
      via: mother,
      rationale: `${capitalize(el)} is deficient. Nourish via ${capitalize(mother)} (${ELEMENT_BRIDGE[mother].organ.yin}/${ELEMENT_BRIDGE[mother].organ.yang})`
    });
  }

  for (const el of excessive) {
    const child = GENERATION_CYCLE[el];
    balancingMoves.push({
      element: el,
      action: 'sedate',
      via: child,
      rationale: `${capitalize(el)} is excessive. Sedate by supporting ${capitalize(child)} to draw off excess`
    });
  }

  // Spirit work for most imbalanced element
  let spiritWork: BalanceAnalysis['spiritWork'] | undefined;
  if (needsSupport.length > 0) {
    const mostDeficient = needsSupport[0];
    const spirit = getSpirit(mostDeficient);
    spiritWork = {
      spirit: spirit.name,
      element: mostDeficient,
      state: 'depleted',
      guidance: `The ${spirit.name} (${spirit.chinese}) needs restoration. ${spirit.function.split(' - ')[1]} may feel diminished.`
    };
  } else if (excessive.length > 0) {
    const mostExcessive = excessive[0];
    const spirit = getSpirit(mostExcessive);
    spiritWork = {
      spirit: spirit.name,
      element: mostExcessive,
      state: 'agitated',
      guidance: `The ${spirit.name} (${spirit.chinese}) may be overactive. ${spirit.function.split(' - ')[1]} may feel overwhelming.`
    };
  }

  return {
    score,
    state,
    needsSupport,
    excessive,
    balancingMoves,
    spiritWork
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ORGAN CLOCK
// ═══════════════════════════════════════════════════════════════════════════════

export interface OrganClockPhase {
  organ: string;
  element: WuXingElement;
  yinYang: 'yin' | 'yang';
  peakHours: string;
  spirit?: string;
  functions: string[];
}

export const ORGAN_CLOCK: OrganClockPhase[] = [
  { organ: 'Lung', element: 'metal', yinYang: 'yin', peakHours: '3-5am', spirit: 'Po', functions: ['Breath', 'Letting go', 'Grief processing'] },
  { organ: 'Large Intestine', element: 'metal', yinYang: 'yang', peakHours: '5-7am', functions: ['Elimination', 'Release', 'Morning routine'] },
  { organ: 'Stomach', element: 'earth', yinYang: 'yang', peakHours: '7-9am', functions: ['Digestion', 'Taking in', 'Nourishment'] },
  { organ: 'Spleen', element: 'earth', yinYang: 'yin', peakHours: '9-11am', spirit: 'Yi', functions: ['Transformation', 'Thinking', 'Focus'] },
  { organ: 'Heart', element: 'fire', yinYang: 'yin', peakHours: '11am-1pm', spirit: 'Shen', functions: ['Joy', 'Connection', 'Consciousness'] },
  { organ: 'Small Intestine', element: 'fire', yinYang: 'yang', peakHours: '1-3pm', functions: ['Sorting', 'Discernment', 'Assimilation'] },
  { organ: 'Bladder', element: 'water', yinYang: 'yang', peakHours: '3-5pm', functions: ['Storage', 'Reserve', 'Fluid balance'] },
  { organ: 'Kidney', element: 'water', yinYang: 'yin', peakHours: '5-7pm', spirit: 'Zhi', functions: ['Will', 'Essence', 'Foundation'] },
  { organ: 'Pericardium', element: 'fire', yinYang: 'yin', peakHours: '7-9pm', functions: ['Protection', 'Intimacy', 'Heart guard'] },
  { organ: 'Triple Warmer', element: 'fire', yinYang: 'yang', peakHours: '9-11pm', functions: ['Thermoregulation', 'Fluid passages', 'Social warmth'] },
  { organ: 'Gallbladder', element: 'wood', yinYang: 'yang', peakHours: '11pm-1am', functions: ['Decision', 'Courage', 'Judgment'] },
  { organ: 'Liver', element: 'wood', yinYang: 'yin', peakHours: '1-3am', spirit: 'Hun', functions: ['Planning', 'Dreams', 'Vision', 'Detox'] }
];

/**
 * Get current organ clock phase
 */
export function getCurrentOrganPhase(hour: number): OrganClockPhase {
  const phases = [
    { start: 3, end: 5, index: 0 },
    { start: 5, end: 7, index: 1 },
    { start: 7, end: 9, index: 2 },
    { start: 9, end: 11, index: 3 },
    { start: 11, end: 13, index: 4 },
    { start: 13, end: 15, index: 5 },
    { start: 15, end: 17, index: 6 },
    { start: 17, end: 19, index: 7 },
    { start: 19, end: 21, index: 8 },
    { start: 21, end: 23, index: 9 },
    { start: 23, end: 25, index: 10 }, // 23-1am (wraps)
    { start: 1, end: 3, index: 11 }
  ];

  // Normalize hour (handle midnight wrap)
  const normalizedHour = hour < 1 ? hour + 24 : hour;

  for (const phase of phases) {
    if (normalizedHour >= phase.start && normalizedHour < phase.end) {
      return ORGAN_CLOCK[phase.index];
    }
  }

  // Default to Lung (3-5am) if somehow we miss
  return ORGAN_CLOCK[0];
}

// ═══════════════════════════════════════════════════════════════════════════════
// THERAPEUTIC SUGGESTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export interface TherapeuticSuggestion {
  element: WuXingElement;
  spirit: string;
  suggestion: string;
  practices: string[];
  foods: string[];
  avoidances: string[];
}

/**
 * Get therapeutic suggestions for element imbalance
 */
export function getTherapeuticSuggestions(
  deficient: WuXingElement[],
  excessive: WuXingElement[]
): TherapeuticSuggestion[] {
  const suggestions: TherapeuticSuggestion[] = [];

  const therapeuticData: Record<WuXingElement, Omit<TherapeuticSuggestion, 'element'>> = {
    wood: {
      spirit: 'Hun (Ethereal Soul)',
      suggestion: 'Support the Liver and Hun through movement, creative expression, and dream work',
      practices: ['Stretching', 'Walking in nature', 'Creative projects', 'Dream journaling', 'Eye exercises'],
      foods: ['Leafy greens', 'Sprouts', 'Sour foods (lemon, vinegar)', 'Liver-supportive herbs'],
      avoidances: ['Excessive alcohol', 'Fried foods', 'Late-night eating', 'Suppressed anger']
    },
    fire: {
      spirit: 'Shen (Spirit/Mind)',
      suggestion: 'Calm and nourish the Heart and Shen through joyful connection and mindful rest',
      practices: ['Meditation', 'Laughter', 'Heart-opening yoga', 'Meaningful conversation', 'Sunset gazing'],
      foods: ['Bitter greens', 'Red foods (beets, berries)', 'Cooling herbs', 'Light meals'],
      avoidances: ['Overstimulation', 'Excessive heat', 'Scattered attention', 'Isolation']
    },
    earth: {
      spirit: 'Yi (Intellect/Intention)',
      suggestion: 'Ground and nourish the Spleen and Yi through routine, nourishment, and focused thinking',
      practices: ['Regular meals', 'Gentle routine', 'Singing', 'Grounding walks', 'Study with breaks'],
      foods: ['Yellow/orange foods', 'Root vegetables', 'Warm cooked foods', 'Sweet (natural) foods'],
      avoidances: ['Excessive worry', 'Irregular eating', 'Cold raw foods', 'Mental overwork']
    },
    metal: {
      spirit: 'Po (Corporeal Soul)',
      suggestion: 'Support the Lung and Po through breath, boundaries, and grief processing',
      practices: ['Breathwork', 'Decluttering', 'Grief rituals', 'Skin brushing', 'Cold exposure'],
      foods: ['Pungent foods (ginger, onion)', 'White foods', 'Respiratory herbs', 'Fiber-rich foods'],
      avoidances: ['Shallow breathing', 'Clutter', 'Unprocessed grief', 'Dry environments']
    },
    water: {
      spirit: 'Zhi (Will/Ambition)',
      suggestion: 'Restore the Kidney and Zhi through rest, stillness, and conservation of energy',
      practices: ['Deep rest', 'Meditation', 'Bone broth', 'Lower back warmth', 'Fear-facing practices'],
      foods: ['Salty foods (seaweed, miso)', 'Black foods (black sesame, black beans)', 'Kidney-tonics'],
      avoidances: ['Overwork', 'Excessive fear', 'Cold exposure (if depleted)', 'Burning the candle at both ends']
    }
  };

  for (const el of deficient) {
    suggestions.push({
      element: el,
      ...therapeuticData[el]
    });
  }

  return suggestions;
}

export default {
  ELEMENT_BRIDGE,
  GENERATION_CYCLE,
  CONTROL_CYCLE,
  MOTHER_OF,
  CONTROLLED_BY,
  ORGAN_CLOCK,
  wuxingToSpiralogic,
  spiralogicToWuxing,
  getSpirit,
  getElementRelationship,
  analyzeBalance,
  getCurrentOrganPhase,
  getTherapeuticSuggestions
};
