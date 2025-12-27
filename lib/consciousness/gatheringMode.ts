/**
 * Gathering Mode — Aetheric Coherence Protocol
 *
 * When the system can't honestly localize, it should globalize.
 *
 * This module provides the trigger logic and house-voice script for
 * MAIA's "Gathering Mode" — a 90-second coherence protocol that
 * stabilizes presence before routing to a specific facet.
 *
 * Aether isn't a destination. It's the condition of meaningful destination.
 *
 * @see Community-Commons/09-Technical/TWELVE_FOLD_ARCHETYPAL_SYNTHESIS.md
 */

export const DEFAULT_GATHERING_CONFIDENCE_THRESHOLD = 0.6;

export type GatheringFormat = 'text' | 'voice';

export type GatheringTriggerInput = {
  triggeredFacets: string[]; // facet codes from router (e.g., ['W2', 'F1', 'A3'])
  routerConfidence: number;  // 0..1
  isMetaQuestion: boolean;   // "What's happening to me?" "What do I need?"
};

/**
 * Determines whether to suggest Gathering Mode before routing.
 *
 * Trigger conditions:
 * - Multiple facets triggered simultaneously (can't localize)
 * - Router confidence below threshold (uncertain where to go)
 * - User asked a meta-question (needs global coherence first)
 */
export function shouldSuggestGatheringMode(input: GatheringTriggerInput): boolean {
  const multipleTriggeredFacets = (input.triggeredFacets?.length ?? 0) >= 2;
  return (
    multipleTriggeredFacets ||
    input.routerConfidence < DEFAULT_GATHERING_CONFIDENCE_THRESHOLD ||
    input.isMetaQuestion
  );
}

/**
 * House-voice script for Gathering Mode.
 * Mythopoetic but tight.
 *
 * 'text' format: full markdown for chat interface
 * 'voice' format: shorter lines, cleaner cadence for TTS
 */
export function getGatheringModeScript(format: GatheringFormat = 'text'): string {
  if (format === 'voice') {
    return [
      'Gathering Mode. Ninety seconds. Then we choose a petal.',
      '',
      '1) Skull-base anchor: soften the hinge where spine meets skull.',
      '2) Three rounds: inhale—center. exhale—widen. pause—listen.',
      '3) See the Holoflower: all twelve petals evenly lit. Present, not activated.',
      '4) Elemental spiral:',
      '   Earth: "I\'m here."',
      '   Water: "I feel."',
      '   Fire: "I will."',
      '   Air: "I see."',
      '   Aether: "I belong to the whole."',
      '',
      'Now ask: "Which petal is asking first?"',
      'Tell me: (a) one sentence of what\'s most alive, and (b) the first element you feel: Earth/Water/Fire/Air/Aether.',
    ].join('\n');
  }

  return [
    '### Gathering Mode — Aetheric Coherence',
    '**Before we route, we gather the whole flower. 90 seconds.**',
    '',
    '**1) Skull-base anchor**',
    'Feel the hinge where spine meets skull. Tiny softening. Seat of witness.',
    '',
    '**2) Three-part breath (3 rounds)**',
    '- Inhale: *center*',
    '- Exhale: *widen*',
    '- Pause: *listen*',
    '',
    '**3) Holoflower coherence**',
    'Imagine all 12 petals glowing evenly — not "activated," simply **present**.',
    '',
    '**4) Elemental spiral (quick cycle)**',
    '- Earth: *"I\'m here."*',
    '- Water: *"I feel."*',
    '- Fire: *"I will."*',
    '- Air: *"I see."*',
    '- Aether: *"I belong to the whole."*',
    '',
    '**5) Return-to-center choice**',
    'Ask: *"Which petal is asking for first attention?"*',
    '',
    '**Reply with two things:**',
    '1) One sentence: what is most alive right now?',
    '2) Your first felt element: **Earth / Water / Fire / Air / Aether**',
  ].join('\n');
}

/**
 * Builds a structured response suggesting Gathering Mode.
 * Adapts to whatever response shape your system uses.
 */
export function buildGatheringSuggestion(format: GatheringFormat = 'text') {
  return {
    kind: 'suggestion' as const,
    mode: 'gathering' as const,
    script: getGatheringModeScript(format),
    next: 'route_after_gathering' as const,
  };
}

/**
 * Meta-question detection heuristics.
 * Returns true if the user's message suggests they need global coherence
 * rather than facet-specific routing.
 */
export function detectMetaQuestion(message: string): boolean {
  const metaPatterns = [
    /what('s| is) happening to me/i,
    /what do i need/i,
    /why am i like this/i,
    /what's going on/i,
    /i('m| am) (so )?(confused|lost|overwhelmed|scattered)/i,
    /everything (feels|is) (too much|overwhelming)/i,
    /i don't know (where to start|what to do)/i,
    /help me (understand|make sense)/i,
    /what should i focus on/i,
  ];

  return metaPatterns.some((pattern) => pattern.test(message));
}
