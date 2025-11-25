/**
 * 🔥💧🌍💨🌌 Elemental Metaphor Library
 *
 * Element-specific symbolic vocabulary for Level 2 poetic enrichment
 * Each archetype has its own language of images, verbs, and sensory markers
 *
 * **Design:** Symbol over sentimentality, felt essence not flaunted
 */

import type { Archetype } from './conversation/AffectDetector';

export interface MetaphorSet {
  // Nouns - Images and symbols
  nouns: string[];
  // Verbs - Actions and movements
  verbs: string[];
  // Adjectives - Qualities and textures
  adjectives: string[];
  // Closing phrases - Poetic endings (Level 2 only)
  closings: string[];
  // Sensory markers - What this element "feels like"
  sensoryMarkers: string[];
}

/**
 * Elemental Metaphor Libraries
 */
export const ElementalMetaphors: Record<Archetype, MetaphorSet> = {
  // 🔥 FIRE - Embers, ignition, catalysis
  Fire: {
    nouns: [
      'ember', 'spark', 'flame', 'ignition', 'threshold', 'catalyst',
      'heat', 'light', 'forge', 'crucible', 'kindling'
    ],
    verbs: [
      'ignite', 'kindle', 'burn', 'catalyze', 'illuminate', 'forge',
      'blaze', 'spark', 'quicken', 'awaken', 'rise'
    ],
    adjectives: [
      'bright', 'bold', 'fierce', 'radiant', 'urgent', 'alive',
      'burning', 'quickening', 'sharp', 'clear', 'direct'
    ],
    closings: [
      'The ember is lit.',
      'Let it burn clear.',
      'The spark is alive.',
      'Something is quickening.',
      'The flame knows its way.'
    ],
    sensoryMarkers: [
      'heat in your chest',
      'quickening pulse',
      'brightness behind your eyes',
      'urgency in your hands'
    ]
  },

  // 💧 WATER - Depths, currents, tides
  Water: {
    nouns: [
      'depth', 'current', 'tide', 'wave', 'pool', 'river',
      'ocean', 'surface', 'undertow', 'flow', 'shore'
    ],
    verbs: [
      'flow', 'ebb', 'pour', 'wade', 'dive', 'surface',
      'immerse', 'dissolve', 'soften', 'yield', 'release'
    ],
    adjectives: [
      'deep', 'flowing', 'fluid', 'soft', 'tidal', 'gentle',
      'submerged', 'clear', 'still', 'moving', 'vast'
    ],
    closings: [
      'Let it flow.',
      'The depth holds you.',
      'You don\'t need to swim yet.',
      'The water knows.',
      'Feel the current underneath.'
    ],
    sensoryMarkers: [
      'weight in your throat',
      'fullness in your chest',
      'tears at the edge',
      'softness in your belly'
    ]
  },

  // 🌍 EARTH - Roots, ground, stone
  Earth: {
    nouns: [
      'root', 'ground', 'stone', 'soil', 'bedrock', 'foundation',
      'earth', 'clay', 'seed', 'mountain', 'anchor'
    ],
    verbs: [
      'ground', 'root', 'stand', 'hold', 'build', 'plant',
      'settle', 'anchor', 'stabilize', 'embody', 'land'
    ],
    adjectives: [
      'solid', 'grounded', 'steady', 'rooted', 'tangible', 'firm',
      'stable', 'embodied', 'clear', 'simple', 'direct'
    ],
    closings: [
      'You have ground beneath you.',
      'Let the roots deepen.',
      'The earth holds you.',
      'Stand here first.',
      'One stone at a time.'
    ],
    sensoryMarkers: [
      'feet on the floor',
      'weight in your hips',
      'solidity in your legs',
      'bone and breath'
    ]
  },

  // 🌬️ AIR - Wind, breath, sky
  Air: {
    nouns: [
      'breath', 'wind', 'current', 'sky', 'space', 'perspective',
      'horizon', 'openness', 'clarity', 'pattern', 'view'
    ],
    verbs: [
      'breathe', 'observe', 'see', 'shift', 'open', 'clarify',
      'witness', 'release', 'expand', 'lighten', 'rise'
    ],
    adjectives: [
      'clear', 'light', 'open', 'spacious', 'bright', 'swift',
      'quick', 'fresh', 'sharp', 'expansive', 'free'
    ],
    closings: [
      'Let the pattern show itself.',
      'You can see it now.',
      'There\'s space to move.',
      'The view is clearer from here.',
      'Breathe and see.'
    ],
    sensoryMarkers: [
      'breath at the top of your chest',
      'lightness in your head',
      'clarity behind your eyes',
      'expansion in your ribcage'
    ]
  },

  // 🌌 AETHER - Silence, threshold, mystery
  Aether: {
    nouns: [
      'silence', 'threshold', 'mystery', 'emptiness', 'wholeness', 'soul',
      'essence', 'presence', 'spaciousness', 'witness', 'void'
    ],
    verbs: [
      'hold', 'witness', 'attend', 'notice', 'listen', 'rest',
      'abide', 'integrate', 'synthesize', 'recognize', 'receive'
    ],
    adjectives: [
      'spacious', 'still', 'quiet', 'whole', 'present', 'aware',
      'empty', 'full', 'luminous', 'vast', 'subtle'
    ],
    closings: [
      'Let the silence speak.',
      'You already know.',
      'Something is listening.',
      'The mystery holds you.',
      '...'
    ],
    sensoryMarkers: [
      'stillness between breaths',
      'awareness watching itself',
      'space around your thoughts',
      'presence without doing'
    ]
  }
};

/**
 * Get random noun from archetype's metaphor set
 */
export function getElementalNoun(archetype: Archetype): string {
  const nouns = ElementalMetaphors[archetype].nouns;
  return nouns[Math.floor(Math.random() * nouns.length)];
}

/**
 * Get random verb from archetype's metaphor set
 */
export function getElementalVerb(archetype: Archetype): string {
  const verbs = ElementalMetaphors[archetype].verbs;
  return verbs[Math.floor(Math.random() * verbs.length)];
}

/**
 * Get random adjective from archetype's metaphor set
 */
export function getElementalAdjective(archetype: Archetype): string {
  const adjectives = ElementalMetaphors[archetype].adjectives;
  return adjectives[Math.floor(Math.random() * adjectives.length)];
}

/**
 * Get random closing phrase from archetype's metaphor set
 */
export function getElementalClosing(archetype: Archetype): string {
  const closings = ElementalMetaphors[archetype].closings;
  return closings[Math.floor(Math.random() * closings.length)];
}

/**
 * Get random sensory marker from archetype's metaphor set
 */
export function getElementalSensoryMarker(archetype: Archetype): string {
  const markers = ElementalMetaphors[archetype].sensoryMarkers;
  return markers[Math.floor(Math.random() * markers.length)];
}

/**
 * Generate archetypal closing phrase for Level 2 poetry
 * Appends to end of response
 */
export function generateArchetypalClosing(
  archetype: Archetype,
  context?: 'question' | 'statement' | 'reflection'
): string {
  const closing = getElementalClosing(archetype);

  // Add contextual variation
  if (context === 'question') {
    // Questions get lighter closings
    return `\n\n${closing}`;
  } else if (context === 'reflection') {
    // Reflections get more spacious closings
    return `\n\n[pause]\n\n${closing}`;
  } else {
    // Statements get direct closings
    return ` ${closing}`;
  }
}

/**
 * Enrich text with element-specific imagery (Level 2 only)
 */
export function enrichWithElementalMetaphor(
  text: string,
  archetype: Archetype,
  level: 0 | 1 | 2
): string {
  if (level !== 2) return text;

  // Add archetypal closing phrase
  const closing = getElementalClosing(archetype);

  // Detect if text ends with question or statement
  const endsWithQuestion = text.trim().endsWith('?');

  if (endsWithQuestion) {
    return `${text}\n\n${closing}`;
  } else {
    return `${text} ${closing}`;
  }
}

/**
 * Get complete metaphor context for prompt engineering
 * Injects archetype's symbolic vocabulary into LLM prompt
 */
export function getMetaphorContext(archetype: Archetype): string {
  const metaphors = ElementalMetaphors[archetype];

  return `
Your symbolic vocabulary (use sparingly, only when it deepens meaning):
- Images: ${metaphors.nouns.slice(0, 5).join(', ')}
- Actions: ${metaphors.verbs.slice(0, 5).join(', ')}
- Qualities: ${metaphors.adjectives.slice(0, 5).join(', ')}
- Sensory: ${metaphors.sensoryMarkers[0]}

Use these symbols ONLY when they serve the user's understanding. Never force metaphor.
`;
}

/**
 * Example Usage:
 *
 * // Level 0: No poetry
 * "What do you need right now?"
 *
 * // Level 1: Base tone (no modification)
 * "What do you need right now?"
 *
 * // Level 2: Elemental enrichment
 * Fire: "What do you need right now? The ember is lit."
 * Water: "What do you need right now? Let it flow."
 * Earth: "What do you need right now? You have ground beneath you."
 * Air: "What do you need right now? Breathe and see."
 * Aether: "What do you need right now? ..."
 */

/**
 * Advanced: Contextual metaphor weaving
 * Replaces generic words with element-specific imagery
 */
export function weaveElementalLanguage(
  text: string,
  archetype: Archetype
): string {
  let woven = text;

  const replacements: Record<Archetype, Record<string, string>> = {
    Fire: {
      'start': 'ignite',
      'begin': 'kindle',
      'energy': 'heat',
      'motivation': 'spark'
    },
    Water: {
      'feeling': 'depth',
      'emotion': 'current',
      'process': 'flow',
      'release': 'pour out'
    },
    Earth: {
      'stability': 'ground',
      'foundation': 'bedrock',
      'practice': 'root',
      'boundary': 'stone'
    },
    Air: {
      'clarity': 'clear sky',
      'understanding': 'seeing',
      'perspective': 'view from above',
      'thought': 'current'
    },
    Aether: {
      'awareness': 'presence',
      'integration': 'wholeness',
      'meaning': 'essence',
      'wisdom': 'deep knowing'
    }
  };

  const archetypalReplacements = replacements[archetype];

  for (const [generic, elemental] of Object.entries(archetypalReplacements)) {
    const regex = new RegExp(`\\b${generic}\\b`, 'gi');
    woven = woven.replace(regex, elemental);
  }

  return woven;
}
