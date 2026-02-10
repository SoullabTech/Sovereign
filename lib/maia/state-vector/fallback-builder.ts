/**
 * STATE VECTOR FALLBACK BUILDER
 *
 * Ensures stateVector and practiceRecommendation are NEVER null.
 * When the LLM forgets to produce a STATE_VECTOR block (which happens
 * reliably on strategic/threshold questions), this module detects
 * the dominant element from the user's input and builds a coherent
 * fallback state vector + practice recommendation.
 *
 * Design principles:
 * - Fallback is better than absence. A "holding" state vector that reads
 *   the room is more useful than a blank UI.
 * - Confidence is honest: fallback vectors get confidence 0.35-0.55
 *   to signal "read lightly" without triggering the 0.5 practice gate.
 * - Strategic/threshold questions get Earth+Air framing, not random defaults.
 * - Continuity: when a previous stateVector exists, prefer stability over novelty.
 * - Every fallback is tagged with `stateVectorDerived: 'fallback'` so QA can track it.
 *
 * Canon alignment:
 * - No manufactured lack: fallback reads the person, not the system failure.
 * - No false precision: low confidence signals "hold lightly."
 */

import { generateUUID } from '../../utils/uuid';
import type {
  StateVector,
  Element,
  Intensity,
  KairosAssessment,
  ElementalReading,
  StateMovement,
  Kairos,
  EvidenceModel,
} from './types';
import type { PracticeRecommendation } from './practice-router';
import { routePractice } from './practice-router';
import { getAllPractices } from '../../elemental-alchemy/practices';

// ═══════════════════════════════════════════════════════════════════════════
// ELEMENT DETECTION — richer than detectFacetFromInput, returns Element
// ═══════════════════════════════════════════════════════════════════════════

interface ElementScore {
  element: Element;
  score: number;
  triggers: string[];
}

// Strategic/threshold patterns — "what should I build next?" type questions
const STRATEGIC_PATTERNS = [
  /\bwhat should (i|we) (build|do|focus|prioritize|work on|tackle)\b/i,
  /\bwhat('| i)?s (the )?next( step)?\b/i,
  /\bhow (do|should|can) (i|we) (decide|choose|prioritize)\b/i,
  /\b(roadmap|strategy|plan|direction|priority|priorities)\b/i,
  /\bwhich (one|thing|direction|path)\b/i,
  /\bi('| a)?m (stuck|overwhelmed|confused).*\b(decision|choose|decide|next)\b/i,
  /\bwhat (matters|counts) (most|now)\b/i,
];

const ELEMENT_PATTERNS: Record<Element, RegExp[]> = {
  fire: [
    /\b(purpose|passion|vision|identity|creativity|expansion|excited|spark|ignite|fire|breakthrough|bold)\b/i,
    /\b(build|ship|launch|create|start|begin|drive|ambition|hungry|alive)\b/i,
  ],
  water: [
    /\b(feel|feeling|emotion|emotions|grief|sad|cry|tears|healing|shadow|hurt|shame|fear|anxious|overwhelm|dissociat)\b/i,
    /\b(heavy|drowning|flood|numb|panic|lonely|vulnerable|dream|subconscious)\b/i,
  ],
  earth: [
    /\b(structure|body|health|stability|work|finances|money|debt|budget|routine|grounding|practical|plan|step)\b/i,
    /\b(organize|schedule|resource|foundation|secure|steady|land|concrete|tangible|real)\b/i,
  ],
  air: [
    /\b(communicate|relationship|insight|thinking|clarity|analyze|logic|explain|understand|concept)\b/i,
    /\b(idea|mental|perspective|framework|model|pattern|connection|dialogue|listen)\b/i,
  ],
  aether: [
    /\b(integration|soul|transcend|wholeness|sacred|mystery|ritual|ceremony|witness|paradox)\b/i,
    /\b(consciousness|awareness|presence|being|field|resonance|mythic|archetype)\b/i,
  ],
};

function detectElementFromInput(text: string): ElementScore[] {
  const lower = text.toLowerCase();
  const scores: ElementScore[] = [];

  for (const [element, patterns] of Object.entries(ELEMENT_PATTERNS)) {
    let score = 0;
    const triggers: string[] = [];

    for (const pattern of patterns) {
      const matches = lower.match(pattern);
      if (matches) {
        score += matches.length;
        triggers.push(...matches);
      }
    }

    if (score > 0) {
      scores.push({ element: element as Element, score, triggers });
    }
  }

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);
  return scores;
}

function isStrategicQuestion(text: string): boolean {
  return STRATEGIC_PATTERNS.some(p => p.test(text));
}

// ═══════════════════════════════════════════════════════════════════════════
// KAIROS DETECTION — lightweight assessment from text
// ═══════════════════════════════════════════════════════════════════════════

function detectKairos(text: string, elementScores: ElementScore[]): { assessment: KairosAssessment; confidence: number } {
  const lower = text.toLowerCase();

  // Collapse-risk: overwhelm + activation markers
  if (/\b(can'?t (breathe|cope|handle|think|stop)|spiraling|losing it|falling apart|too much|breaking)\b/i.test(lower)) {
    return { assessment: 'collapse-risk', confidence: 0.6 };
  }

  // Threshold: liminal, charged, between states
  if (/\b(threshold|between|liminal|edge|precipice|about to|on the verge|crossroads|at a turning)\b/i.test(lower)) {
    return { assessment: 'threshold', confidence: 0.5 };
  }

  // Strategic questions are threshold by nature
  if (isStrategicQuestion(text)) {
    return { assessment: 'threshold', confidence: 0.45 };
  }

  // Transition: movement language
  if (/\b(shifting|changing|moving|transition|becoming|emerging|leaving|entering|turning)\b/i.test(lower)) {
    return { assessment: 'transition', confidence: 0.5 };
  }

  // Integration: weaving, connecting
  if (/\b(integrat|connect|weave|synthesiz|coming together|making sense|putting.*together)\b/i.test(lower)) {
    return { assessment: 'integration', confidence: 0.5 };
  }

  // Multiple elements active → transition
  if (elementScores.length >= 2 && elementScores[0].score > 0 && elementScores[1].score > 0) {
    return { assessment: 'transition', confidence: 0.4 };
  }

  // Default: stable
  return { assessment: 'stable', confidence: 0.35 };
}

// ═══════════════════════════════════════════════════════════════════════════
// INTENSITY + POLARITY DETECTION
// ═══════════════════════════════════════════════════════════════════════════

function detectIntensity(text: string): Intensity {
  const lower = text.toLowerCase();
  const highMarkers = /\b(very|extremely|so much|deeply|incredibly|intensely|overwhelm|can'?t|panic|desperate|urgent)\b/i;
  const lowMarkers = /\b(maybe|slightly|a bit|wondering|curious|just|gentle|soft|quiet)\b/i;

  const highCount = (lower.match(highMarkers) || []).length;
  const lowCount = (lower.match(lowMarkers) || []).length;

  if (highCount >= 2) return 'high';
  if (lowCount >= 2 && highCount === 0) return 'low';
  return 'medium';
}

function detectPolarity(text: string): 1 | 2 | 3 | 4 | 5 {
  const lower = text.toLowerCase();
  // Contractive: withdrawal, shutting down, pulling inward
  const contractive = /\b(withdraw|shutdown|shut down|collapse|retreat|hide|numb|frozen|stuck|can'?t move|paralyz)\b/i;
  // Expansive: reaching out, opening, growing
  const expansive = /\b(expand|open|grow|reach|explore|ready|excited|alive|breakthrough|possibilities|vision)\b/i;

  const cCount = (lower.match(contractive) || []).length;
  const eCount = (lower.match(expansive) || []).length;

  if (cCount >= 2) return 1;
  if (cCount > eCount) return 2;
  if (eCount >= 2) return 5;
  if (eCount > cCount) return 4;
  return 3;
}

function detectStability(text: string, kairos: KairosAssessment): 1 | 2 | 3 | 4 | 5 {
  if (kairos === 'collapse-risk') return 5;
  if (kairos === 'threshold') return 4;

  const lower = text.toLowerCase();
  const volatile = /\b(back and forth|one minute.*next|keep changing|can'?t decide|all over the place|spinning)\b/i;
  if (volatile.test(lower)) return 4;

  if (kairos === 'stable') return 2;
  return 3;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN FALLBACK BUILDERS
// ═══════════════════════════════════════════════════════════════════════════

export interface FallbackOptions {
  text: string;
  memberId?: string;
  sessionId?: string;
  lastStateVector?: StateVector | null;
}

/**
 * Build a fallback StateVector from user input text.
 *
 * This is the "always-on" safety net. When the LLM forgets to produce
 * a STATE_VECTOR block, this function reads the user's input and builds
 * a coherent (but low-confidence) state vector that:
 *
 * 1. Detects the dominant element from keyword patterns
 * 2. Respects strategic/threshold questions with Earth+Air framing
 * 3. Prefers continuity with the last known stateVector when signals are weak
 * 4. Always returns a valid vector — never null
 */
export function buildFallbackStateVector(opts: FallbackOptions): StateVector {
  const { text, memberId = 'anonymous', sessionId } = opts;
  const elementScores = detectElementFromInput(text);
  const strategic = isStrategicQuestion(text);

  // Determine primary element
  let primaryElement: Element;
  let secondaryElement: Element | undefined;

  if (strategic) {
    // Strategic questions → Earth (grounding + sequencing) with Air secondary (cognitive spin)
    primaryElement = 'earth';
    secondaryElement = 'air';
  } else if (elementScores.length >= 1) {
    primaryElement = elementScores[0].element;
    secondaryElement = elementScores.length >= 2 ? elementScores[1].element : undefined;
    // Don't duplicate
    if (secondaryElement === primaryElement) {
      secondaryElement = elementScores.length >= 3 ? elementScores[2].element : undefined;
    }
  } else if (opts.lastStateVector) {
    // No signal → prefer continuity
    primaryElement = opts.lastStateVector.primary.element;
    secondaryElement = opts.lastStateVector.secondary?.element;
  } else {
    // Absolute fallback: aether (integration/seeking)
    primaryElement = 'aether';
  }

  // Detect kairos, intensity, polarity, stability
  const kairosDetection = detectKairos(text, elementScores);
  const intensity = detectIntensity(text);
  const polarity = detectPolarity(text);
  const stability = detectStability(text, kairosDetection.assessment);

  // Build primary reading
  const primary: ElementalReading = {
    element: primaryElement,
    intensity,
    polarity,
    stability,
    phase: strategic ? 'entering' : undefined,
  };

  // Build secondary reading (if detected)
  const secondary: ElementalReading | undefined = secondaryElement ? {
    element: secondaryElement,
    intensity: intensity === 'high' ? 'medium' : intensity,
    polarity: 3, // neutral for secondary
    stability: Math.min(stability + 1, 5) as 1 | 2 | 3 | 4 | 5,
  } : undefined;

  // Movement: derive from element detection + strategic context
  const entering: Element[] = [];
  const exiting: Element[] = [];

  if (strategic) {
    entering.push('earth');
    exiting.push('air');
  } else if (elementScores.length >= 2) {
    entering.push(elementScores[0].element);
    exiting.push(elementScores[elementScores.length - 1].element);
  }

  const movement: StateMovement = {
    entering,
    exiting,
    trajectory: kairosDetection.assessment === 'collapse-risk' ? 'descending'
      : strategic ? 'spiraling'
      : kairosDetection.assessment === 'integration' ? 'ascending'
      : 'still',
    velocity: kairosDetection.assessment === 'collapse-risk' ? 0.8
      : strategic ? 0.4
      : 0.3,
  };

  // Kairos with description
  const kairos: Kairos = {
    assessment: kairosDetection.assessment,
    confidence: kairosDetection.confidence,
    description: strategic
      ? 'Strategic threshold: multiple directions present. Grounding before choosing.'
      : kairosDetection.assessment === 'collapse-risk'
      ? 'System under pressure. Regulation and grounding come first.'
      : kairosDetection.assessment === 'threshold'
      ? 'At a threshold. Hold the space before moving.'
      : kairosDetection.assessment === 'transition'
      ? 'Something is shifting. Stay present to the movement.'
      : kairosDetection.assessment === 'integration'
      ? 'Threads are coming together. Let them weave.'
      : 'Holding steady. Space for deepening.',
  };

  // Evidence: minimal but honest about being a fallback
  const evidence: EvidenceModel = {
    observations: elementScores.slice(0, 3).map(es => ({
      category: 'linguistic' as const,
      signal: `Keywords: ${es.triggers.slice(0, 3).join(', ')}`,
      strength: (es.score >= 3 ? 3 : es.score >= 2 ? 2 : 1) as 1 | 2 | 3,
      informs: ['element' as const],
    })),
    contradictions: [],
    gaps: ['somatic', 'behavioral', 'relational'] as const as any,
  };

  // Confidence: honest about fallback quality
  // Strategic questions get slightly higher because the detection is reliable
  const confidence = strategic ? 0.55
    : elementScores.length >= 2 ? 0.45
    : elementScores.length === 1 ? 0.4
    : 0.35;

  return {
    id: generateUUID(),
    memberId,
    timestamp: new Date(),
    source: 'conversation',
    sessionId,
    primary,
    secondary,
    confidence,
    movement,
    kairos,
    evidence,
  };
}

/**
 * Build a fallback PracticeRecommendation from a StateVector.
 *
 * Uses the same routePractice() engine as model-derived vectors,
 * but forces practice generation even at low confidence (bypassing
 * the 0.5 gate that normally blocks practice routing).
 *
 * For strategic/threshold states, always produces a 2-track practice:
 * 1. Settle (breath/orientation/body) — 30-90 seconds
 * 2. Clarify (list pressures, pick 1 next action) — 3 minutes
 */
export function buildFallbackPractice(stateVector: StateVector): PracticeRecommendation {
  try {
    const practices = getAllPractices();
    return routePractice(stateVector, practices);
  } catch (err) {
    console.warn('⚠️ [Fallback Practice] routePractice failed, using minimal fallback:', err);
    // Absolute minimal fallback
    return {
      primary: {
        id: 'fallback-grounding',
        title: 'Ground & Orient',
        element: 'earth',
        category: 'movement',
        duration: '5-10 minutes',
        instructions: [
          'Feel your feet on the ground. Press them down.',
          'Name 3 things you can see, 2 you can hear, 1 you can touch.',
          'Take 3 slow breaths. On each exhale, let your shoulders drop.',
        ],
        reflectionPrompt: 'What feels clearer now?',
      } as any,
      alternatives: [],
      rationale: 'Your system needs grounding before any other practice. This is a regulation-first recommendation.',
      duration: 'micro',
      contraindications: [],
    };
  }
}

/**
 * Enforce non-null stateVector and practiceRecommendation.
 *
 * Call this right before returning the response. If the model produced
 * valid values, they pass through unchanged. If either is null, the
 * fallback builder fills in.
 *
 * Returns the final values plus derivation flags for QA tracking.
 */
export function enforceStateVectorPresence(opts: {
  parsedStateVector: StateVector | null;
  practiceRec: PracticeRecommendation | null;
  userInput: string;
  memberId?: string;
  sessionId?: string;
  lastStateVector?: StateVector | null;
}): {
  stateVector: StateVector;
  practiceRecommendation: PracticeRecommendation;
  stateVectorDerived: 'model' | 'fallback';
  practiceDerived: 'model' | 'fallback';
} {
  let stateVector: StateVector;
  let stateVectorDerived: 'model' | 'fallback';

  if (opts.parsedStateVector) {
    stateVector = opts.parsedStateVector;
    stateVectorDerived = 'model';
  } else {
    stateVector = buildFallbackStateVector({
      text: opts.userInput,
      memberId: opts.memberId,
      sessionId: opts.sessionId,
      lastStateVector: opts.lastStateVector,
    });
    stateVectorDerived = 'fallback';
    console.log(
      `🌀 [State Vector Fallback] Built: ${stateVector.primary.element}` +
      `${stateVector.secondary ? ' + ' + stateVector.secondary.element : ''}` +
      ` | kairos=${stateVector.kairos.assessment}` +
      ` | confidence=${stateVector.confidence}` +
      ` | strategic=${isStrategicQuestion(opts.userInput)}`
    );
  }

  let practiceRecommendation: PracticeRecommendation;
  let practiceDerived: 'model' | 'fallback';

  if (opts.practiceRec) {
    practiceRecommendation = opts.practiceRec;
    practiceDerived = 'model';
  } else {
    practiceRecommendation = buildFallbackPractice(stateVector);
    practiceDerived = 'fallback';
    console.log(
      `🌿 [Practice Fallback] Built: ${practiceRecommendation.primary.title}` +
      ` (${practiceRecommendation.duration})`
    );
  }

  return {
    stateVector,
    practiceRecommendation,
    stateVectorDerived,
    practiceDerived,
  };
}
