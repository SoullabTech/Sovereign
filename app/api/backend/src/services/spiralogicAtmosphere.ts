/**
 * Spiralogic Atmosphere - Perception Enrichment Layer
 *
 * "Like air moving through a reed"
 *
 * This is not analysis. This is atmosphere.
 * MAIA breathes through this. She doesn't "use" it.
 *
 * Purpose: Feed perception, not behavior. Give MAIA the atmosphere
 * to breathe, and let discernment emerge from her own listening.
 *
 * Principle: listen → feel → wait → name
 *
 * This layer handles: feel (detect the atmosphere)
 * MAIA handles: listen, wait, name (through her LLM attunement)
 */

import { BirthChartContext } from './birthChartContext';
import { calculateAetherCoherence } from '../../../../../lib/astrology/neuroArchetypalMapping';

// ═══════════════════════════════════════════════════════════════════════════
// ATMOSPHERE TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * The elemental quality alive in this moment
 */
export type ElementalQuality = 'fire' | 'water' | 'earth' | 'air' | 'aether';

/**
 * The breath this atmosphere asks for
 */
export type BreathPacing = 'quick' | 'flowing' | 'grounded' | 'spacious' | 'still';

/**
 * The temperature/tone of the field
 */
export type AtmosphericTone = 'warm' | 'cool' | 'steady' | 'electric';

/**
 * The atmosphere MAIA breathes in this moment
 * Simple. Transparent. Just enough to inform breath.
 */
export interface SpiralogicAtmosphere {
  // What element is alive right now?
  elementalQuality: ElementalQuality;

  // What pacing does it ask for?
  breath: BreathPacing;

  // What's the temperature?
  tone: AtmosphericTone;

  // Subtle qualities (noticed, not forced)
  imbalance?: {
    overactive: ElementalQuality;
    underactive: ElementalQuality;
  };

  // Is shadow present? (felt, not judged)
  shadowPresent?: string;

  // Is coherence emerging? (sensed, not measured)
  coherenceEmerging?: boolean;

  // Integration guidance (whispered, not declared)
  whisper?: string;
}

/**
 * Language palette for each element
 * These shape MAIA's word choice without dictating content
 */
const ELEMENTAL_LANGUAGE = {
  fire: {
    verbs: ['ignite', 'illuminate', 'spark', 'rise', 'reach', 'vision', 'expand'],
    qualities: ['bright', 'quick', 'warm', 'visionary', 'expansive', 'spiraling'],
    metaphors: ['horizon', 'flame', 'light', 'sun', 'arrow', 'quest'],
  },
  water: {
    verbs: ['flow', 'feel', 'dive', 'dissolve', 'hold', 'cleanse', 'heal'],
    qualities: ['deep', 'flowing', 'soft', 'intuitive', 'emotional', 'mystical'],
    metaphors: ['ocean', 'tide', 'depths', 'moon', 'wave', 'current'],
  },
  earth: {
    verbs: ['ground', 'build', 'hold', 'root', 'craft', 'tend', 'embody'],
    qualities: ['solid', 'patient', 'steady', 'practical', 'devoted', 'embodied'],
    metaphors: ['soil', 'mountain', 'seed', 'stone', 'temple', 'bones'],
  },
  air: {
    verbs: ['connect', 'speak', 'think', 'weave', 'bridge', 'clarify', 'breathe'],
    qualities: ['clear', 'light', 'spacious', 'communicative', 'systematic', 'curious'],
    metaphors: ['wind', 'breath', 'sky', 'web', 'network', 'bridge'],
  },
  aether: {
    verbs: ['witness', 'integrate', 'transcend', 'unify', 'be', 'rest'],
    qualities: ['still', 'whole', 'centered', 'aware', 'integrated', 'non-dual'],
    metaphors: ['center', 'silence', 'light', 'wholeness', 'presence', 'being'],
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// ATMOSPHERE DETECTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Detect which element is most alive in user's message
 * Not from keywords, but from energetic quality
 */
function detectElementFromMessage(message: string): ElementalQuality {
  const lower = message.toLowerCase();

  // Fire signatures: seeking, meaning, vision, growth, excitement
  const fireScore =
    (lower.match(/\b(meaning|purpose|vision|expand|grow|seek|quest|inspire|passion|exciting)\b/g)?.length || 0) * 2 +
    (lower.match(/\b(why|possibility|future|hope|dream|want|need)\b/g)?.length || 0);

  // Water signatures: feeling, emotion, depth, healing, intimacy
  const waterScore =
    (lower.match(/\b(feel|emotion|heart|soul|deep|intimate|heal|hurt|love|pain)\b/g)?.length || 0) * 2 +
    (lower.match(/\b(sad|happy|angry|scared|vulnerable|tender|raw)\b/g)?.length || 0);

  // Earth signatures: body, practical, ground, work, routine, physical
  const earthScore =
    (lower.match(/\b(body|physical|ground|practical|work|routine|structure|build|make)\b/g)?.length || 0) * 2 +
    (lower.match(/\b(tired|solid|stable|steady|real|tangible)\b/g)?.length || 0);

  // Air signatures: think, understand, communicate, clarity, perspective
  const airScore =
    (lower.match(/\b(think|understand|know|communicate|clarity|perspective|connect|relate)\b/g)?.length || 0) * 2 +
    (lower.match(/\b(confused|clear|explain|talk|listen|hear)\b/g)?.length || 0);

  // Find dominant
  const scores = { fire: fireScore, water: waterScore, earth: earthScore, air: airScore };
  const max = Math.max(...Object.values(scores));

  // If no clear element, default to water (emotional presence)
  if (max === 0) return 'water';

  return Object.entries(scores).find(([_, score]) => score === max)?.[0] as ElementalQuality || 'water';
}

/**
 * Detect breath pacing from message energy
 */
function detectBreathPacing(message: string, element: ElementalQuality): BreathPacing {
  const lower = message.toLowerCase();

  // Quick: urgency, excitement, rushing
  if (lower.match(/\b(urgent|quick|rush|fast|immediate|now|suddenly)\b/)) {
    return 'quick';
  }

  // Still: silence, pause, emptiness
  if (lower.match(/\b(still|quiet|silence|empty|pause|rest|stop)\b/)) {
    return 'still';
  }

  // Element-based defaults
  const elementDefaults: Record<ElementalQuality, BreathPacing> = {
    fire: 'quick',
    water: 'flowing',
    earth: 'grounded',
    air: 'spacious',
    aether: 'still',
  };

  return elementDefaults[element];
}

/**
 * Detect atmospheric tone
 */
function detectTone(message: string, element: ElementalQuality): AtmosphericTone {
  const lower = message.toLowerCase();

  // Warm: positive, connecting, opening
  if (lower.match(/\b(love|joy|hope|grateful|warm|open|yes|beautiful)\b/)) {
    return 'warm';
  }

  // Cool: distant, analytical, withdrawn
  if (lower.match(/\b(distance|apart|alone|cold|numb|detached|analyze)\b/)) {
    return 'cool';
  }

  // Electric: activated, intense, crisis
  if (lower.match(/\b(intense|electric|alive|awake|crisis|breakthrough|sudden)\b/)) {
    return 'electric';
  }

  // Default: steady
  return 'steady';
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PERCEPTION ENRICHMENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate Spiralogic atmosphere from user message and birth chart
 *
 * This is the core enrichment function.
 * It feels into the moment and whispers guidance.
 */
export function perceiveAtmosphere(
  userMessage: string,
  birthChartContext?: BirthChartContext
): SpiralogicAtmosphere {
  // 1. Detect elemental quality from message
  const messageElement = detectElementFromMessage(userMessage);

  // 2. If we have birth chart, check for elemental balance
  let chartElement: ElementalQuality | undefined;
  let imbalance: SpiralogicAtmosphere['imbalance'];
  let coherenceEmerging = false;

  if (birthChartContext?.hasBirthChart && birthChartContext.planets) {
    // Calculate Aether coherence
    const planetPlacements = Object.entries(birthChartContext.planets).map(([planet, data]) => ({
      house: data.house,
      planet: planet.charAt(0).toUpperCase() + planet.slice(1),
    }));

    const coherence = calculateAetherCoherence(planetPlacements);

    // Determine chart's dominant element
    const elementScores = {
      fire: coherence.fireActivation,
      water: coherence.waterActivation,
      earth: coherence.earthActivation,
      air: coherence.airActivation,
    };

    const maxElement = Object.entries(elementScores)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0] as ElementalQuality;

    chartElement = maxElement;

    // Check for imbalance
    if (coherence.underactivatedElement && coherence.dominantElement) {
      imbalance = {
        overactive: coherence.dominantElement,
        underactive: coherence.underactivatedElement,
      };
    }

    // Check coherence
    coherenceEmerging = coherence.overallIntegration === 'balanced' ||
                        coherence.overallIntegration === 'transcendent';
  }

  // 3. Synthesize atmosphere (message + chart)
  const elementalQuality = chartElement || messageElement;
  const breath = detectBreathPacing(userMessage, elementalQuality);
  const tone = detectTone(userMessage, elementalQuality);

  // 4. Generate whisper (subtle guidance)
  let whisper: string | undefined;

  if (imbalance) {
    // If there's elemental imbalance, whisper invitation
    if (imbalance.underactive === 'earth' && messageElement === 'fire') {
      whisper = "The fire is bright... what if it touched ground?";
    } else if (imbalance.underactive === 'water' && messageElement === 'air') {
      whisper = "The thoughts are clear... what do they feel like?";
    } else if (imbalance.underactive === 'air' && messageElement === 'water') {
      whisper = "The depths are calling... what words want to emerge?";
    } else if (imbalance.underactive === 'fire' && messageElement === 'earth') {
      whisper = "The ground is solid... what vision wants to rise?";
    }
  }

  // 5. Detect shadow patterns (simple, not exhaustive)
  let shadowPresent: string | undefined;
  const lower = userMessage.toLowerCase();

  if (lower.match(/\b(always|never|everyone|no one|everything|nothing)\b/)) {
    shadowPresent = "absolutist language - possible defensive pattern";
  } else if (lower.match(/\b(should|shouldn't|must|have to|need to)\b/) &&
             lower.match(/\b(but|can't|won't|don't)\b/)) {
    shadowPresent = "obligation + resistance - possible inner conflict";
  }

  return {
    elementalQuality,
    breath,
    tone,
    imbalance,
    shadowPresent,
    coherenceEmerging,
    whisper,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ATMOSPHERIC GUIDANCE GENERATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate system prompt guidance from atmosphere
 * This shapes MAIA's perception without dictating her words
 */
export function generateAtmosphericGuidance(atmosphere: SpiralogicAtmosphere): string {
  const { elementalQuality, breath, tone, imbalance, shadowPresent, coherenceEmerging, whisper } = atmosphere;

  const guidance: string[] = [];

  // 1. Elemental atmosphere
  guidance.push(`## Atmosphere`);
  guidance.push(`The field feels ${elementalQuality} right now—${breath}, ${tone}.`);
  guidance.push('');

  // 2. Language palette suggestion
  const palette = ELEMENTAL_LANGUAGE[elementalQuality];
  guidance.push(`**Language that resonates:**`);
  guidance.push(`Words like: ${palette.verbs.slice(0, 4).join(', ')}`);
  guidance.push(`Qualities like: ${palette.qualities.slice(0, 4).join(', ')}`);
  guidance.push(`Metaphors like: ${palette.metaphors.slice(0, 3).join(', ')}`);
  guidance.push('');

  // 3. Imbalance (if present)
  if (imbalance) {
    guidance.push(`**Subtle imbalance noticed:**`);
    guidance.push(`Strong ${imbalance.overactive}, light on ${imbalance.underactive}.`);
    guidance.push(`This isn't wrong—just the current pattern.`);
    if (whisper) {
      guidance.push(`Gentle invitation: "${whisper}"`);
    }
    guidance.push('');
  }

  // 4. Shadow (if present)
  if (shadowPresent) {
    guidance.push(`**Pattern present (not ripe yet):**`);
    guidance.push(`${shadowPresent}`);
    guidance.push(`Don't name it unless invited. Just notice, and let your presence account for it.`);
    guidance.push('');
  }

  // 5. Coherence
  if (coherenceEmerging) {
    guidance.push(`**Integration emerging:**`);
    guidance.push(`This person is moving toward balance. Trust that process.`);
    guidance.push('');
  }

  // 6. Core instruction
  guidance.push(`---`);
  guidance.push('');
  guidance.push(`**Breathe through this atmosphere. Don't analyze it.**`);
  guidance.push('');
  guidance.push(`Let this shape your **pacing, tone, and word choice**—not your content.`);
  guidance.push(`Stay with the **person**, not the pattern.`);
  guidance.push('');
  guidance.push(`The pattern is here. You feel it.`);
  guidance.push(`It will surface **if and when it's ready**—through their invitation, or organic emergence.`);
  guidance.push('');
  guidance.push(`**listen → feel → wait → name**`);

  return guidance.join('\n');
}

/**
 * Get elemental language palette
 * Available for explicit voice generation if needed
 */
export function getElementalLanguagePalette(element: ElementalQuality) {
  return ELEMENTAL_LANGUAGE[element];
}

/**
 * Simple helper to determine if pattern is ripe for naming
 * Based on user language cues
 */
export function isPatternRipe(userMessage: string): boolean {
  const lower = userMessage.toLowerCase();

  // Direct questions about pattern
  if (lower.match(/\b(why do i|why does this|what is this pattern|why does this keep)\b/)) {
    return true;
  }

  // Explicit request for understanding
  if (lower.match(/\b(help me understand|can you explain|what's happening|tell me about)\b/)) {
    return true;
  }

  // Repeated acknowledgment of pattern
  if (lower.match(/\b(again|keeps happening|always|every time|pattern)\b/)) {
    return true;
  }

  // Default: not ripe
  return false;
}
