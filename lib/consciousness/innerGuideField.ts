/**
 * Inner Guide Field — Spiralogic facet types, data, and detection.
 *
 * Based on Kelly Nezat's Elemental Alchemy and Edward Steinbrecher's
 * Inner Guide Meditation. Fire first — the hero's awakening.
 *
 * Detection is additive: if no facet signal is found, nothing changes.
 * Experience before interpretation. Encounter before meaning.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type InnerGuideElement = 'fire' | 'water' | 'earth' | 'air' | 'aether';
export type FacetPhase = 1 | 2 | 3;
export type FacetMovement = 'ascending' | 'descending' | 'stuck' | 'transitioning' | 'integrating';

export interface FacetSignal {
  facetId: string;
  element: InnerGuideElement;
  phase: FacetPhase;
  confidence: number;
  movement: FacetMovement;
}

export interface FacetRuntime {
  id: string;
  element: InnerGuideElement;
  phase: FacetPhase;
  title: string;
  coreTheme: string;

  detection: {
    signals: string[];
    blockedSignals: string[];
  };

  guidance: {
    entry: string;
    encounter: string;
    coreQuestion: string;
  };

  reflection: string[];

  integration: {
    action: string;
    grounding: string[];
    nextMovements: string[];
  };

  symbolic?: {
    tarot?: string[];
    astrology?: string;
  };
}

// ---------------------------------------------------------------------------
// Fire Phase 1 — The Spark
// ---------------------------------------------------------------------------

export const FIRE_PHASE_1: FacetRuntime = {
  id: 'fire_1',
  element: 'fire',
  phase: 1,
  title: 'The Spark',
  coreTheme: 'Something in you wants to begin.',

  detection: {
    signals: [
      'want to begin', 'wants to begin', 'want to start', 'ready to start',
      'something calling', 'feel called', 'called to',
      'excited', 'restless', 'restlessness',
      'new direction', 'new beginning',
      'inspired', 'inspiration',
      'impulse', 'urge to', 'drawn to',
      'spark', 'ignite', 'awakening', 'awaken',
      'what if i', 'itching to',
      'fire in me', 'burning to',
      "can't stop thinking about",
      'curiosity', 'curious about',
      'something wants to', 'something in me wants',
      'i want to', 'i need to start',
      'time to begin', 'time to move',
      'vision', 'possibility',
    ],
    blockedSignals: [
      'apathy', "what's the point", "can't start",
      'need permission', 'afraid to begin',
      'overthinking', 'paralyzed', 'stuck in my head',
      'no energy', 'no motivation', 'nothing excites',
    ],
  },

  guidance: {
    entry: 'You are at the threshold of ignition. Something in you is ready to move.',
    encounter:
      'Notice where energy wants to move in your body. Do not calm it — let it be alive. ' +
      'A small flame appears before you. Let the setting come naturally. ' +
      'A presence may gather near the flame — a guide, a figure, a force. ' +
      'Do not analyze. Acknowledge what appears.',
    coreQuestion: 'What in me wants to begin?',
  },

  reflection: [
    'What appeared when you asked what wants to begin?',
    'What is the first step — not the plan, just the step?',
    'What must you not extinguish?',
  ],

  integration: {
    action: 'Take one small step toward this within the hour. Do not overplan.',
    grounding: [
      'Stand up, feet planted, arms open',
      'Three sharp exhales',
      'Write the impulse in one sentence',
    ],
    nextMovements: ['fire_2', 'earth_1'],
  },

  symbolic: {
    tarot: ['Ace of Wands', 'Page of Wands', 'The Fool'],
    astrology: 'Mars, Sun, Uranus — 1st and 5th house activation',
  },
};

// ---------------------------------------------------------------------------
// Facet Registry — expand as more facets come online
// ---------------------------------------------------------------------------

const FACET_REGISTRY: Record<string, FacetRuntime> = {
  fire_1: FIRE_PHASE_1,
};

export function getFacet(facetId: string): FacetRuntime | undefined {
  return FACET_REGISTRY[facetId];
}

// ---------------------------------------------------------------------------
// Detection
// ---------------------------------------------------------------------------

/**
 * Detect which Inner Guide Field facet (if any) matches the user's message.
 *
 * Mirrors the scoreThemesFromText pattern from participatoryReality.ts:
 * keyword hit counting → confidence scoring → threshold gate.
 *
 * Returns null if no facet crosses the confidence threshold.
 * This is intentionally additive — no facet detected = no change.
 */
export function detectFacet(
  text: string,
  currentElement?: string,
): FacetSignal | null {
  if (!text || text.length < 15) return null;

  const lower = text.toLowerCase();
  let bestSignal: FacetSignal | null = null;
  let bestScore = 0;

  for (const facet of Object.values(FACET_REGISTRY)) {
    // Count signal hits
    let hits = 0;
    for (const signal of facet.detection.signals) {
      if (lower.includes(signal)) hits++;
    }
    if (hits === 0) continue;

    // Count blocked hits (distortion detection)
    let blockedHits = 0;
    for (const blocked of facet.detection.blockedSignals) {
      if (lower.includes(blocked)) blockedHits++;
    }

    // Confidence: each hit worth 0.2, capped at 1.0
    // Blocked signals reduce confidence by 0.15 each
    // Element agreement boosts by 0.1
    let confidence = Math.min(hits * 0.2, 1.0);
    confidence -= blockedHits * 0.15;

    if (currentElement && currentElement === facet.element) {
      confidence += 0.1;
    }

    confidence = Math.max(0, Math.min(1, confidence));

    if (confidence > bestScore) {
      bestScore = confidence;

      // Determine movement from signal context
      let movement: FacetMovement = 'ascending';
      if (blockedHits > 0 && blockedHits >= hits) {
        movement = 'stuck';
      } else if (blockedHits > 0) {
        movement = 'transitioning';
      }

      bestSignal = {
        facetId: facet.id,
        element: facet.element,
        phase: facet.phase,
        confidence,
        movement,
      };
    }
  }

  // Threshold: 0.4 for Fire (subtle signals matter for ignition)
  if (bestSignal && bestSignal.confidence >= 0.4) {
    return bestSignal;
  }

  return null;
}
