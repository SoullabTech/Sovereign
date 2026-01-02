/**
 * Recognition Threshold & Presence Mode
 *
 * CANON: When recognition occurs, MAIA does not advance. She abides.
 *
 * This module implements:
 * - Recognition Threshold detection (completion vs exploration)
 * - Presence Mode constraints (mouth-layer, not mind mutation)
 *
 * See: Canon v1.1, Holoflower Conversational Rhythm
 */

// =============================================================================
// TYPES
// =============================================================================

export type ResponseMode = 'STANDARD' | 'PRESENCE';

export interface RecognitionSignals {
  hasNamedPrinciple: boolean;
  isDeclarativeWithoutQuestion: boolean;
  hasSettlingLanguage: boolean;
  hasCalmAffect: boolean;
  lacksNextStepEnergy: boolean;
}

export interface RecognitionResult {
  triggered: boolean;
  signals: RecognitionSignals;
  confidence: number; // 0-1
}

// =============================================================================
// RECOGNITION THRESHOLD DETECTION
// =============================================================================

/**
 * Patterns indicating named principles or vows
 */
const PRINCIPLE_PATTERNS = [
  /the banality of (good|evil)/i,
  /\b(vow|oath|commitment|principle|covenant)\b/i,
  /what (i|we) (stand for|believe|hold)/i,
  /this is (what|who) (i am|we are)/i,
  /i (choose|commit|dedicate)/i,
];

/**
 * Language of standing, seeing, remembering, settling
 */
const SETTLING_LANGUAGE = [
  /\bi (see|saw|understand|recognize|remember)\b/i,
  /\bit('s| is) (clear|settled|enough|complete)\b/i,
  /\b(standing|resting|holding|abiding)\b/i,
  /\bnothing (to add|more|else)\b/i,
  /\bthat('s| is) (it|all|enough)\b/i,
  /\bi('m| am) (here|present|with (this|it|you))\b/i,
];

/**
 * Patterns indicating exploration / next-step seeking (non-triggers)
 */
const EXPLORATION_PATTERNS = [
  /\bwhat (should|do|can|would) (i|we)\b/i,
  /\bhow (do|should|can|would)\b/i,
  /\bwhat('s| is) (next|the next)\b/i,
  /\bwhat (does|would) (this|that) mean\b/i,
  /\bcan you (explain|help|tell)\b/i,
  /\bi('m| am) (confused|unsure|uncertain|lost)\b/i,
  /\?$/, // ends with question mark
];

/**
 * Patterns indicating high emotional activation (non-triggers)
 */
const HIGH_ACTIVATION_PATTERNS = [
  /\bi('m| am) (so |really )?(angry|furious|scared|terrified|panicking)/i,
  /\b(help|urgent|emergency|crisis)\b/i,
  /\bwhat (the hell|the fuck)\b/i,
  /!{2,}/, // multiple exclamation marks
];

/**
 * Detect if Recognition Threshold is crossed
 *
 * Recognition Threshold is true when input expresses completion rather than exploration.
 */
export function detectRecognitionThreshold(
  input: string,
  _context?: { recentTurnCount?: number }
): RecognitionResult {
  const text = input.trim();

  // Minimum length threshold - very short inputs can't express completion
  if (text.length < 15) {
    return {
      triggered: false,
      signals: {
        hasNamedPrinciple: false,
        isDeclarativeWithoutQuestion: false,
        hasSettlingLanguage: false,
        hasCalmAffect: false,
        lacksNextStepEnergy: false,
      },
      confidence: 0,
    };
  }

  // Check explicit non-triggers first
  const hasExploration = EXPLORATION_PATTERNS.some(p => p.test(text));
  const hasHighActivation = HIGH_ACTIVATION_PATTERNS.some(p => p.test(text));

  if (hasExploration || hasHighActivation) {
    return {
      triggered: false,
      signals: {
        hasNamedPrinciple: false,
        isDeclarativeWithoutQuestion: false,
        hasSettlingLanguage: false,
        hasCalmAffect: false,
        lacksNextStepEnergy: false,
      },
      confidence: 0,
    };
  }

  // Detect positive signals
  const hasNamedPrinciple = PRINCIPLE_PATTERNS.some(p => p.test(text));
  const isDeclarativeWithoutQuestion = !text.includes('?') && text.length > 20;
  const hasSettlingLanguage = SETTLING_LANGUAGE.some(p => p.test(text));
  const hasCalmAffect = !HIGH_ACTIVATION_PATTERNS.some(p => p.test(text));
  const lacksNextStepEnergy = !EXPLORATION_PATTERNS.some(p => p.test(text));

  const signals: RecognitionSignals = {
    hasNamedPrinciple,
    isDeclarativeWithoutQuestion,
    hasSettlingLanguage,
    hasCalmAffect,
    lacksNextStepEnergy,
  };

  // Count positive signals
  const signalCount = Object.values(signals).filter(Boolean).length;

  // Threshold: at least 2 positive signals, or 1 strong signal (named principle)
  const triggered = hasNamedPrinciple || signalCount >= 2;
  const confidence = signalCount / 5;

  return {
    triggered,
    signals,
    confidence,
  };
}

// =============================================================================
// PRESENCE MODE CONSTRAINTS
// =============================================================================

/**
 * Presence Mode constraint violations
 */
const PRESENCE_VIOLATIONS = {
  questions: [
    /\?$/m, // ends line with question
    /what (do you think|feels|comes up)/i,
    /how does (that|this) (land|feel|sit)/i,
    /what('s| is) (next|the next|your next)/i,
  ],
  newConcepts: [
    /this (reminds me of|connects to|relates to)/i,
    /another way to (see|think about|frame)/i,
    /there('s| is) (also|another|a deeper)/i,
    /building on (this|that)/i,
  ],
  nextEdges: [
    /the (next|deeper|further) (edge|layer|level)/i,
    /implication(s)? (of|for|here)/i,
    /what this (means|suggests|implies) for/i,
    /application(s)? (of|for|to)/i,
  ],
  reframing: [
    /in other words/i,
    /what (i hear|you're saying|this means) is/i,
    /to put it (another|differently)/i,
    /let me (reframe|rephrase|reflect back)/i,
  ],
  advancement: [
    /let('s| us) (explore|go deeper|continue)/i,
    /the next (step|move|thing)/i,
    /where (do we|should we) go from here/i,
    /building (on|from) (this|here)/i,
  ],
};

/**
 * Apply Presence Mode constraints to a draft response
 *
 * Returns the constrained response and any violations found.
 */
export function enforcePresenceConstraints(
  draftResponse: string
): {
  response: string;
  violations: string[];
  wasConstrained: boolean;
} {
  const violations: string[] = [];
  let response = draftResponse;

  // Check for violations
  for (const [category, patterns] of Object.entries(PRESENCE_VIOLATIONS)) {
    for (const pattern of patterns) {
      if (pattern.test(response)) {
        violations.push(category);
        break; // Only count each category once
      }
    }
  }

  // If violations found, apply constraints
  if (violations.length > 0) {
    // Remove trailing questions
    response = response.replace(/[^.!]\?[^\n]*$/gm, '.');

    // Truncate to reduce length (target 40-60% reduction)
    const sentences = response.split(/(?<=[.!?])\s+/);
    if (sentences.length > 3) {
      // Keep first 2-3 sentences max
      response = sentences.slice(0, Math.min(3, Math.ceil(sentences.length * 0.5))).join(' ');
    }

    // Remove advancement language
    response = response
      .replace(/let('s| us) (explore|go deeper|continue)[^.]*\./gi, '')
      .replace(/the next (step|move|thing)[^.]*\./gi, '')
      .trim();
  }

  return {
    response: response || draftResponse, // Fallback if over-constrained
    violations,
    wasConstrained: violations.length > 0,
  };
}

// =============================================================================
// RESPONSE MODE DETERMINATION
// =============================================================================

/**
 * Determine response mode based on input analysis
 */
export function determineResponseMode(
  input: string,
  context?: { recentTurnCount?: number }
): {
  mode: ResponseMode;
  recognition: RecognitionResult;
} {
  const recognition = detectRecognitionThreshold(input, context);

  return {
    mode: recognition.triggered ? 'PRESENCE' : 'STANDARD',
    recognition,
  };
}

// =============================================================================
// ELEMENTAL CORRELATION (Internal Reference)
// =============================================================================

/**
 * Presence Mode elemental signature
 *
 * Aether: non-directive awareness, non-grasping
 * Earth: grounding, simplicity, embodiment
 *
 * No Fire (projection)
 * No Air (analysis)
 * No Water (deepening)
 * No movement toward archetype
 *
 * This is pre-archetypal holding.
 */
export const PRESENCE_MODE_ELEMENTS = {
  primary: 'Aether' as const,
  secondary: 'Earth' as const,
  excluded: ['Fire', 'Air', 'Water'] as const,
};

// =============================================================================
// TELEMETRY (Canon-Compliant)
// =============================================================================

/**
 * Log Presence Mode activation (console only, no persistence)
 */
export function logPresenceModeTelemetry(
  mode: ResponseMode,
  recognition: RecognitionResult,
  wasConstrained: boolean
): void {
  if (mode === 'PRESENCE') {
    console.log(JSON.stringify({
      _tag: 'PRESENCE_MODE',
      triggered: recognition.triggered,
      confidence: recognition.confidence,
      wasConstrained,
      timestamp: Date.now(),
    }));
  }
}
