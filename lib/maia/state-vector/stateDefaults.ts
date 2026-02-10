/**
 * STATE VECTOR DEFAULTS & INFERENCE
 *
 * Ensures every MAIA response carries a stateVector and practiceRecommendation.
 * When the LLM / orchestrator doesn't produce one (common for non-checkin messages),
 * this module provides a lightweight local inference from user text.
 *
 * Design:
 *   - Uses keyword-to-element mapping (same lineage as facetUtil.ts)
 *   - Never claims high confidence — these are gentle readings, not diagnoses
 *   - Produces a "lite" stateVector (enough for UI + practice routing)
 *   - Falls back to Earth grounding baseline when no signal detected
 *
 * Canon alignment:
 *   - No manufactured lack: defaults are neutral, not deficit-framing
 *   - No engagement optimization: practice recommendations honor brevity
 *   - Sovereignty: the member can always override or dismiss
 */

import type {
  Element,
  BaseElement,
  FacetCode,
  Intensity,
  CyclePhase,
  KairosAssessment,
  StateVector,
  ElementalReading,
  StateMovement,
  Kairos,
  EvidenceModel,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════
// KEYWORD → ELEMENT DETECTION
// ═══════════════════════════════════════════════════════════════════════════

interface ElementSignal {
  element: BaseElement;
  facet: FacetCode;
  keywords: string[];
}

const ELEMENT_SIGNALS: ElementSignal[] = [
  // Earth — grounding, structure, stability, body, finances
  { element: 'earth', facet: 'CHEN', keywords: ['build', 'work', 'job', 'career', 'body', 'physical', 'routine', 'grounding', 'ground', 'stable', 'stabiliz'] },
  { element: 'earth', facet: 'ALVE', keywords: ['plan', 'structure', 'finances', 'financial', 'money', 'resource', 'organiz', 'budget', 'practical'] },
  { element: 'earth', facet: 'ZWOIF', keywords: ['health', 'medicine', 'healing', 'resilience', 'daily', 'rhythm', 'discipline', 'embod'] },

  // Water — emotion, feeling, depth, shadow
  { element: 'water', facet: 'IEVE', keywords: ['feel', 'feeling', 'emotion', 'sad', 'grief', 'cry', 'hurt', 'sensitive', 'tender'] },
  { element: 'water', facet: 'AGHT', keywords: ['shadow', 'transform', 'heal', 'wound', 'trauma', 'pain', 'deep', 'inner'] },
  { element: 'water', facet: 'NEINE', keywords: ['dream', 'unconscious', 'mystic', 'soul', 'depth', 'subconscious', 'intuit'] },

  // Fire — purpose, passion, vision, action
  { element: 'fire', facet: 'FEU', keywords: ['purpose', 'identity', 'who am i', 'self', 'aware', 'awaken', 'ignite', 'spark'] },
  { element: 'fire', facet: 'VUNV', keywords: ['passion', 'creative', 'play', 'express', 'excite', 'energy', 'alive', 'fire'] },
  { element: 'fire', facet: 'ZECH', keywords: ['vision', 'expand', 'transcend', 'higher', 'meaning', 'cosmic', 'spiritual'] },

  // Air — thinking, communication, relationships, clarity
  { element: 'air', facet: 'AIN', keywords: ['think', 'clarity', 'clear', 'focus', 'decide', 'choice', 'question', 'wondering', 'curious'] },
  { element: 'air', facet: 'ZWEI', keywords: ['relationship', 'relational', 'connect', 'between', 'partner', 'friend', 'social', 'communit'] },
  { element: 'air', facet: 'AIRE', keywords: ['system', 'pattern', 'logic', 'mental', 'framework', 'codif', 'strateg', 'architect'] },
];

/** Intensity signals from language */
const HIGH_INTENSITY_WORDS = ['overwhelm', 'desperate', 'urgent', 'crisis', 'panic', 'screaming', 'breaking', 'explod', 'furious', 'terrif'];
const LOW_INTENSITY_WORDS = ['gentle', 'quiet', 'soft', 'slow', 'calm', 'peace', 'settle', 'still', 'ease', 'light'];

/** Kairos signals */
const THRESHOLD_WORDS = ['decision', 'crossroads', 'turning point', 'threshold', 'choice', 'edge', 'precipice', 'about to'];
const COLLAPSE_WORDS = ['overwhelm', 'can\'t', 'too much', 'falling apart', 'breaking', 'shutting down', 'drowning'];
const INTEGRATION_WORDS = ['making sense', 'coming together', 'seeing how', 'connecting', 'weaving', 'understand now', 'realize'];

// ═══════════════════════════════════════════════════════════════════════════
// DETECT ELEMENT FROM TEXT
// ═══════════════════════════════════════════════════════════════════════════

interface DetectedState {
  element: BaseElement;
  facet: FacetCode;
  confidence: number;
  intensity: Intensity;
  kairos: KairosAssessment;
  matchedKeywords: string[];
}

export function detectStateFromText(text: string): DetectedState {
  const lower = text.toLowerCase();

  // Score each element signal
  const scores: Array<{ signal: ElementSignal; matches: string[] }> = [];
  for (const signal of ELEMENT_SIGNALS) {
    const matches = signal.keywords.filter(kw => lower.includes(kw));
    if (matches.length > 0) {
      scores.push({ signal, matches });
    }
  }

  // Sort by match count, pick best
  scores.sort((a, b) => b.matches.length - a.matches.length);

  const best = scores[0];
  const element: BaseElement = best?.signal.element ?? 'earth';
  const facet: FacetCode = best?.signal.facet ?? 'CHEN';
  const matchedKeywords = best?.matches ?? [];
  const confidence = best ? Math.min(0.3 + matchedKeywords.length * 0.1, 0.7) : 0.2;

  // Intensity
  let intensity: Intensity = 'medium';
  if (HIGH_INTENSITY_WORDS.some(w => lower.includes(w))) intensity = 'high';
  else if (LOW_INTENSITY_WORDS.some(w => lower.includes(w))) intensity = 'low';

  // Kairos
  let kairos: KairosAssessment = 'stable';
  if (COLLAPSE_WORDS.some(w => lower.includes(w))) kairos = 'collapse-risk';
  else if (THRESHOLD_WORDS.some(w => lower.includes(w))) kairos = 'threshold';
  else if (INTEGRATION_WORDS.some(w => lower.includes(w))) kairos = 'integration';
  else if (scores.length >= 2) kairos = 'transition'; // Multiple elements = movement

  return { element, facet, confidence, intensity, kairos, matchedKeywords };
}

// ═══════════════════════════════════════════════════════════════════════════
// BUILD LITE STATE VECTOR FROM DETECTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Build a lightweight StateVector from text detection.
 * Marked as 'auto-detected' source with low confidence.
 * Good enough for UI rendering + practice routing, not for clinical use.
 */
export function inferStateVector(
  text: string,
  memberId: string,
  sessionId?: string,
): StateVector {
  const detected = detectStateFromText(text);

  const primary: ElementalReading = {
    element: detected.element,
    facet: { type: 'spiralogic', code: detected.facet },
    phase: 'in' as CyclePhase,
    intensity: detected.intensity,
    polarity: 3, // Neutral — we don't have enough signal
    stability: detected.kairos === 'collapse-risk' ? 4 : 2,
  };

  const movement: StateMovement = {
    entering: [detected.element],
    exiting: [],
    trajectory: 'still',
    velocity: 0.3,
  };

  const kairos: Kairos = {
    assessment: detected.kairos,
    confidence: detected.confidence,
    description: detected.matchedKeywords.length > 0
      ? `Inferred from: ${detected.matchedKeywords.join(', ')}`
      : 'Default baseline — no strong signals detected',
  };

  const evidence: EvidenceModel = {
    observations: detected.matchedKeywords.map(kw => ({
      category: 'linguistic' as const,
      signal: kw,
      strength: 1 as const,
      informs: ['element' as const],
    })),
    contradictions: [],
    gaps: ['somatic', 'behavioral', 'affective'] as const as any,
  };

  return {
    id: `sv-inferred-${Date.now()}`,
    memberId,
    timestamp: new Date(),
    source: 'auto-detected',
    sessionId,
    primary,
    confidence: detected.confidence,
    movement,
    kairos,
    evidence,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT STATE VECTOR (absolute fallback)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Returns a safe Earth-grounding baseline when no text analysis is possible.
 */
export function getDefaultStateVector(memberId: string, sessionId?: string): StateVector {
  return {
    id: `sv-default-${Date.now()}`,
    memberId,
    timestamp: new Date(),
    source: 'auto-detected',
    sessionId,
    primary: {
      element: 'earth',
      facet: { type: 'spiralogic', code: 'CHEN' },
      phase: 'in',
      intensity: 'medium',
      polarity: 3,
      stability: 2,
    },
    confidence: 0.15,
    movement: {
      entering: ['earth'],
      exiting: [],
      trajectory: 'still',
      velocity: 0.1,
    },
    kairos: {
      assessment: 'stable',
      confidence: 0.15,
      description: 'Baseline presence — no strong state signals detected.',
    },
    evidence: {
      observations: [],
      contradictions: [],
      gaps: ['linguistic', 'somatic', 'behavioral', 'affective', 'cognitive'] as any,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT PRACTICE RECOMMENDATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Lightweight practice recommendation when the full practice router
 * can't run (no Practice[] catalog loaded). Element-aware but simple.
 */
export interface LitePracticeRecommendation {
  title: string;
  steps: string[];
  duration: string;
  mode: string;
  element: string;
  rationale: string;
}

export function getDefaultPracticeRecommendation(
  element?: string | null
): LitePracticeRecommendation {
  const el = element?.toLowerCase() ?? 'earth';

  if (el === 'air') {
    return {
      title: 'Contain the mind',
      steps: [
        'Write 3 bullets: what is true, what is uncertain, what is next.',
        'Set a 12-minute timer: solve one concrete next action only.',
      ],
      duration: '12 minutes',
      mode: 'cognitive + grounding',
      element: 'air',
      rationale: 'Air is active — the mind needs containment before it can clarify.',
    };
  }

  if (el === 'water') {
    return {
      title: 'Soothe the nervous system first',
      steps: [
        'One hand on chest, one on belly — slow exhale x 6.',
        'Name the feeling and the need in one sentence.',
      ],
      duration: '3 minutes',
      mode: 'somatic',
      element: 'water',
      rationale: 'Water is moving — the body needs to settle before meaning can form.',
    };
  }

  if (el === 'fire') {
    return {
      title: 'Channel the activation',
      steps: [
        'Stand up. Shake your hands vigorously for 30 seconds.',
        'Write one sentence: what you most want to create or destroy right now.',
      ],
      duration: '5 minutes',
      mode: 'activation + direction',
      element: 'fire',
      rationale: 'Fire wants to move — give it a contained direction before it scatters.',
    };
  }

  // Earth default (also catches aether + unknown)
  return {
    title: 'Return to ground',
    steps: [
      'Feet on floor, press down gently for 10 seconds x 3.',
      'Choose the smallest stabilizing action you can do in 5 minutes.',
    ],
    duration: '5 minutes',
    mode: 'grounding',
    element: 'earth',
    rationale: 'When in doubt, ground. The body knows what the mind is still sorting.',
  };
}
