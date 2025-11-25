/**
 * 🎨 Language Stylizer
 *
 * Auto-adjusts language complexity based on:
 * - Poetry level (none/light/moderate/high)
 * - Archetype + Phase context
 * - Sentence length preferences
 *
 * **Design:** Symbol over sentimentality, precision over poetry (unless contextually appropriate)
 */

import { styleForPhaseArchetype, allowPoetry, getSilenceComfort } from './VoiceStyleMatrix';
import {
  enrichWithElementalMetaphor,
  weaveElementalLanguage,
  getMetaphorContext
} from './ElementalMetaphors';
import type { Archetype } from './conversation/AffectDetector';
import type { SpiralogicPhase } from '@/lib/spiralogic/PhaseDetector';

export interface StylizationOptions {
  archetype: Archetype;
  phase: SpiralogicPhase;
  userContext?: {
    isEarlyExchange?: boolean;  // First 3 exchanges = shorter
    userPaused?: boolean;       // User paused = more space
  };
}

/**
 * Stylize response text based on archetype + phase
 * Strips or adds poetic language as appropriate
 */
export function stylizeResponse(
  responseText: string,
  options: StylizationOptions
): string {
  const { archetype, phase, userContext } = options;
  const style = styleForPhaseArchetype(archetype, phase);
  const metaphorLevel = getMetaphorLevel(archetype, phase);

  let stylized = responseText;

  // 1. Poetry Level Adjustment
  if (style.poetryLevel === 'none') {
    stylized = stripPoetry(stylized);
  } else if (style.poetryLevel === 'high' && allowPoetry(archetype, phase)) {
    stylized = enrichWithPoetry(stylized, archetype, metaphorLevel);
  } else if (style.poetryLevel === 'moderate') {
    // Weave elemental language subtly
    stylized = weaveElementalLanguage(stylized, archetype);
  }

  // 2. Sentence Length Adjustment
  if (style.sentenceLength === 'short') {
    stylized = shortenSentences(stylized);
  } else if (style.sentenceLength === 'expansive' && !userContext?.isEarlyExchange) {
    stylized = allowExpansion(stylized);
  }

  // 3. Silence Comfort Adjustment
  const silenceComfort = getSilenceComfort(archetype, phase);
  if (silenceComfort > 70) {
    stylized = addSpaceMarkers(stylized);
  }

  // 4. Early Exchange Simplification
  if (userContext?.isEarlyExchange) {
    stylized = simplifyEarlyExchange(stylized);
  }

  return stylized;
}

/**
 * Strip poetic/metaphoric language
 * For Fire-Earth, Air-Earth, Earth-Earth contexts
 */
function stripPoetry(text: string): string {
  let stripped = text;

  // Remove overly metaphoric phrases
  const poeticPhrases: Record<string, string> = {
    'like a river flowing': 'flowing',
    'the depths of your soul': 'deep within you',
    'the sacred space': 'the space',
    'your inner wisdom': 'your knowing',
    'the universe is showing you': 'you\'re noticing',
    'a tapestry of': '',
    'weaving together': 'connecting',
    'dancing with': 'moving with',
    'the landscape of': ''
  };

  for (const [poetic, plain] of Object.entries(poeticPhrases)) {
    const regex = new RegExp(poetic, 'gi');
    stripped = stripped.replace(regex, plain);
  }

  // Remove ellipses (use periods instead)
  stripped = stripped.replace(/\.\.\.+/g, '.');

  // Remove extra commas (keep pacing tighter)
  stripped = stripped.replace(/, and, /g, ' and ');

  return stripped.trim();
}

/**
 * Enrich with elemental metaphors
 * For Water-Aether, Aether-Aether contexts
 * Uses archetype-specific symbolic vocabulary
 */
function enrichWithPoetry(text: string, archetype: Archetype, metaphorLevel: number): string {
  if (metaphorLevel < 2) return text;

  // Use elemental metaphor enrichment
  return enrichWithElementalMetaphor(text, archetype, 2);
}

/**
 * Shorten sentences (Fire, Air, Earth contexts)
 */
function shortenSentences(text: string): string {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

  const shortened = sentences.map(sentence => {
    // If sentence has multiple clauses, keep only first two
    const clauses = sentence.split(/,\s+/);
    if (clauses.length > 2) {
      return clauses.slice(0, 2).join(', ');
    }
    return sentence;
  });

  return shortened.join('. ').trim() + '.';
}

/**
 * Allow expansive language (Aether contexts, not early exchange)
 */
function allowExpansion(text: string): string {
  // Don't modify - just return as-is
  // This allows longer, more contemplative responses
  return text;
}

/**
 * Add space/pause markers for high silence comfort
 */
function addSpaceMarkers(text: string): string {
  // Add ellipses for natural pauses (only for high silence comfort)
  let spaced = text;

  // After questions or reflections, add pause
  spaced = spaced.replace(/(\?)\s+/g, '$1... ');

  // After emotional acknowledgments
  spaced = spaced.replace(/(I hear you|I'm here|Take your time)\./gi, '$1... ');

  return spaced;
}

/**
 * Simplify for first 3 exchanges
 * Keep responses minimal and grounded
 */
function simplifyEarlyExchange(text: string): string {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

  // Keep only first 1-2 sentences
  const simplified = sentences.slice(0, Math.min(2, sentences.length));

  return simplified.join('. ').trim() + '.';
}

/**
 * Get metaphor level as number (0-3)
 */
export function getMetaphorLevel(archetype: Archetype, phase: SpiralogicPhase): number {
  const style = styleForPhaseArchetype(archetype, phase);

  const levels = {
    'none': 0,
    'light': 1,
    'moderate': 2,
    'high': 3
  };

  return levels[style.poetryLevel];
}

/**
 * Adjust response pacing (for TTS)
 */
export function getResponsePacing(
  archetype: Archetype,
  phase: SpiralogicPhase
): { speed: number; pauseMultiplier: number } {
  const style = styleForPhaseArchetype(archetype, phase);

  const pacingMap = {
    fast: { speed: 1.1, pauseMultiplier: 0.8 },
    moderate: { speed: 1.0, pauseMultiplier: 1.0 },
    slow: { speed: 0.9, pauseMultiplier: 1.3 },
    thoughtful: { speed: 0.85, pauseMultiplier: 1.5 }
  };

  return pacingMap[style.pacing];
}

/**
 * Complete stylization pipeline
 * Takes raw LLM response and returns phase-appropriate styled text
 */
export function applyFullStylization(
  rawResponse: string,
  options: StylizationOptions
): {
  styledText: string;
  voiceTag: string;
  pacing: { speed: number; pauseMultiplier: number };
  metaphorLevel: number;
} {
  const { archetype, phase } = options;
  const style = styleForPhaseArchetype(archetype, phase);

  return {
    styledText: stylizeResponse(rawResponse, options),
    voiceTag: style.voiceTag,
    pacing: getResponsePacing(archetype, phase),
    metaphorLevel: getMetaphorLevel(archetype, phase)
  };
}

/**
 * Example usage:
 *
 * const { styledText, voiceTag, pacing, metaphorLevel } = applyFullStylization(
 *   llmResponse,
 *   {
 *     archetype: 'Water',
 *     phase: 'Earth',
 *     userContext: { isEarlyExchange: false }
 *   }
 * );
 *
 * // styledText: "Let's ground this feeling. What does your body need right now?"
 * // voiceTag: "(style:calm)"
 * // pacing: { speed: 0.9, pauseMultiplier: 1.3 }
 * // metaphorLevel: 0
 */
