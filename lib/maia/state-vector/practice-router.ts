/**
 * PRACTICE ROUTER
 *
 * Maps a State Vector to a practice recommendation.
 * Pure function: no side effects, no memory, no external calls.
 *
 * Design principles:
 * - Safety first: collapse-risk triggers hard constraints before any scoring.
 * - Element match is the strongest signal, but never the only one.
 * - The router offers, it does not prescribe. Alternatives are always present.
 * - Rationale is transparent: the person can see why this practice was chosen.
 * - Contraindications name what to avoid and why -- honoring consent.
 *
 * Canon alignment:
 * - No manufactured lack: the person is not framed as broken or incomplete.
 * - No engagement optimization: shorter practices when the state calls for brevity.
 * - Sovereignty: the person can always override the recommendation.
 */

import type { Practice, PracticeCategory } from '../../elemental-alchemy/practices';
import type { StateVector, KairosAssessment, ElementalReading, Element } from './types';
import type { DevelopmentalTier } from '../../youth/ageTierEngine';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type RecommendedDuration = 'micro' | 'short' | 'full';

export interface PracticeRecommendation {
  /** The single recommended practice for this state. */
  primary: Practice;
  /** 2-3 alternative practices, scored but not primary. */
  alternatives: Practice[];
  /** Human-readable explanation of why this practice was chosen. */
  rationale: string;
  /** How long the session should be, given current state. */
  duration: RecommendedDuration;
  /** What to avoid right now and why. */
  contraindications: string[];
}

// ---------------------------------------------------------------------------
// Category groupings for routing logic
// ---------------------------------------------------------------------------

const DEEPENING_CATEGORIES: PracticeCategory[] = ['meditation', 'journaling', 'creative'];
const SOMATIC_GROUNDING_CATEGORIES: PracticeCategory[] = ['movement', 'nature'];
const CONTAINED_CATEGORIES: PracticeCategory[] = ['ritual', 'shadow-work'];
const NARRATIVE_CATEGORIES: PracticeCategory[] = ['journaling', 'relational', 'creative'];
const REGULATION_CATEGORIES: PracticeCategory[] = ['movement', 'nature'];

/** Categories that are unsafe during collapse-risk. */
const COLLAPSE_RISK_FORBIDDEN: PracticeCategory[] = ['shadow-work', 'meditation', 'ritual'];
/** Categories that require settled stability (1-2). */
const REQUIRES_STABILITY: PracticeCategory[] = ['shadow-work'];
/** Categories that are cognitive and should be avoided at high intensity. */
const COGNITIVE_CATEGORIES: PracticeCategory[] = ['journaling', 'creative', 'relational'];

// ---------------------------------------------------------------------------
// Scoring weights
// ---------------------------------------------------------------------------

const WEIGHTS = {
  elementMatch: 30,
  secondaryElementMatch: 10,
  universalElement: 5,
  kairosAlignment: 25,
  polarityAlignment: 15,
  intensityAlignment: 15,
  stabilityAlignment: 10,
} as const;

// ---------------------------------------------------------------------------
// Kairos-to-category affinity map
// ---------------------------------------------------------------------------

const KAIROS_PREFERRED: Record<KairosAssessment, PracticeCategory[]> = {
  'stable': DEEPENING_CATEGORIES,
  'transition': SOMATIC_GROUNDING_CATEGORIES,
  'threshold': CONTAINED_CATEGORIES,
  'integration': NARRATIVE_CATEGORIES,
  'collapse-risk': REGULATION_CATEGORIES,
};

// ---------------------------------------------------------------------------
// Duration logic
// ---------------------------------------------------------------------------

function recommendDuration(sv: StateVector): RecommendedDuration {
  if (sv.primary.intensity === 'high' || sv.primary.stability >= 4) return 'micro';
  if (sv.kairos.assessment === 'collapse-risk') return 'micro';
  if (sv.primary.intensity === 'medium' || sv.primary.stability === 3) return 'short';
  return 'full';
}

function parseDurationMinutes(durationStr?: string): number {
  if (!durationStr) return 15;
  const rangeMatch = durationStr.match(/(\d+)\s*-\s*(\d+)/);
  if (rangeMatch) return (parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2;
  const plusMatch = durationStr.match(/(\d+)\+/);
  if (plusMatch) return parseInt(plusMatch[1]);
  const singleMatch = durationStr.match(/(\d+)/);
  if (singleMatch) return parseInt(singleMatch[1]);
  return 15;
}

function durationFits(practice: Practice, recommended: RecommendedDuration): boolean {
  const minutes = parseDurationMinutes(practice.duration);
  switch (recommended) {
    case 'micro': return minutes <= 15;
    case 'short': return minutes <= 25;
    case 'full': return true;
  }
}

// ---------------------------------------------------------------------------
// Contraindication generator
// ---------------------------------------------------------------------------

function buildContraindications(sv: StateVector): string[] {
  const warnings: string[] = [];

  if (sv.kairos.assessment === 'collapse-risk') {
    warnings.push('No shadow-work: the system is too activated to safely hold unconscious material.');
    warnings.push('No deep meditation: open-ended stillness can amplify destabilization. Grounding movement only.');
    warnings.push('No existential exploration: containment and regulation come first.');
  }

  if (sv.primary.stability >= 4) {
    warnings.push('Avoid long or unstructured practices: volatility needs short, contained forms.');
    if (sv.kairos.assessment !== 'collapse-risk') {
      warnings.push('Shadow-work is not recommended while stability is volatile. Ground first.');
    }
  }

  if (sv.primary.intensity === 'high') {
    warnings.push('Avoid cognitive practices (journaling, analysis): the nervous system needs somatic discharge, not more thinking.');
  }

  if (sv.primary.polarity <= 2) {
    warnings.push('Avoid additional contractive practices: the system is already contracted. Expansive movement or creative expression is more fitting.');
  }

  if (sv.primary.polarity >= 4) {
    warnings.push('Avoid additional expansive practices that may scatter energy. Grounding and embodiment are more fitting.');
  }

  return warnings;
}

// ---------------------------------------------------------------------------
// Scoring engine
// ---------------------------------------------------------------------------

interface ScoredPractice {
  practice: Practice;
  score: number;
  reasons: string[];
}

function scorePractice(
  practice: Practice,
  sv: StateVector,
  duration: RecommendedDuration,
  tier?: DevelopmentalTier
): ScoredPractice {
  const reasons: string[] = [];
  let score = 0;
  const primaryElement = sv.primary.element;
  const secondaryElement = sv.secondary?.element;
  const kairos = sv.kairos.assessment;
  const polarity = sv.primary.polarity;
  const intensity = sv.primary.intensity;
  const stability = sv.primary.stability;

  // ═══ SAFETY GATE: collapse-risk hard block ═══
  if (kairos === 'collapse-risk') {
    if (COLLAPSE_RISK_FORBIDDEN.includes(practice.category)) {
      return { practice, score: -1, reasons: ['Blocked: unsafe during collapse-risk'] };
    }
    if (practice.element !== 'earth' && practice.element !== 'all' &&
        !REGULATION_CATEGORIES.includes(practice.category)) {
      return { practice, score: -1, reasons: ['Blocked: non-grounding practice during collapse-risk'] };
    }
  }

  // ═══ STABILITY GATE ═══
  if (stability >= 4 && REQUIRES_STABILITY.includes(practice.category)) {
    return { practice, score: -1, reasons: ['Blocked: shadow-work requires more settled ground'] };
  }

  // ═══ DEVELOPMENTAL GATE ═══
  if (tier === 'under13') {
    if (!['movement', 'nature', 'creative'].includes(practice.category)) {
      return { practice, score: -1, reasons: ['Blocked: only movement/nature/creative for guided exploration'] };
    }
  }
  if (tier === 'tier2' && REQUIRES_STABILITY.includes(practice.category)) {
    return { practice, score: -1, reasons: ['Blocked: shadow-work requires readiness assessment for supported sovereignty'] };
  }
  if ((tier === 'tier2' || tier === 'under13') && practice.category === 'ritual') {
    return { practice, score: -1, reasons: ['Blocked: ritual practices require more developmental grounding'] };
  }

  // ═══ INTENSITY GATE ═══
  if (intensity === 'high' && COGNITIVE_CATEGORIES.includes(practice.category)) {
    score -= 20;
    reasons.push('Penalized: cognitive practice during high intensity');
  }

  // ═══ ELEMENT MATCH ═══
  if (practice.element === primaryElement) {
    score += WEIGHTS.elementMatch;
    reasons.push(`Primary element match: ${primaryElement}`);
  } else if (secondaryElement && practice.element === secondaryElement) {
    score += WEIGHTS.secondaryElementMatch;
    reasons.push(`Secondary element match: ${secondaryElement}`);
  } else if (practice.element === 'all') {
    score += WEIGHTS.universalElement;
    reasons.push('Universal practice');
  }

  // ═══ KAIROS ALIGNMENT ═══
  if (KAIROS_PREFERRED[kairos].includes(practice.category)) {
    score += WEIGHTS.kairosAlignment;
    reasons.push(`Kairos-aligned: ${practice.category} fits ${kairos}`);
  }

  // ═══ POLARITY ALIGNMENT ═══
  if (polarity <= 2) {
    const expansive: PracticeCategory[] = ['movement', 'creative', 'nature'];
    if (expansive.includes(practice.category)) {
      score += WEIGHTS.polarityAlignment;
      reasons.push('Polarity-aligned: expansive practice for contractive state');
    }
    if (['meditation', 'shadow-work'].includes(practice.category)) {
      score -= 5;
    }
  } else if (polarity >= 4) {
    if (practice.element === 'earth' || ['meditation', 'nature', 'movement'].includes(practice.category)) {
      score += WEIGHTS.polarityAlignment;
      reasons.push('Polarity-aligned: grounding practice for expansive state');
    }
    if (['creative', 'relational'].includes(practice.category)) {
      score -= 5;
    }
  }

  // ═══ INTENSITY ALIGNMENT ═══
  if (intensity === 'high') {
    if (['movement', 'nature'].includes(practice.category)) {
      score += WEIGHTS.intensityAlignment;
      reasons.push('Intensity-aligned: somatic for high activation');
    }
  } else if (intensity === 'low') {
    if (DEEPENING_CATEGORIES.includes(practice.category)) {
      score += WEIGHTS.intensityAlignment;
      reasons.push('Intensity-aligned: deepening for low activation');
    }
  } else {
    score += 3; // medium: everything gets small baseline
  }

  // ═══ STABILITY ALIGNMENT ═══
  if (stability >= 4) {
    if (REGULATION_CATEGORIES.includes(practice.category)) {
      score += WEIGHTS.stabilityAlignment;
      reasons.push('Stability-aligned: regulation for volatile state');
    }
    if (parseDurationMinutes(practice.duration) > 20) score -= 5;
  } else if (stability <= 2) {
    if (practice.category === 'shadow-work' && practice.shadowAwareness) {
      score += WEIGHTS.stabilityAlignment;
      reasons.push('Stability-aligned: settled enough for shadow-work');
    }
    if (parseDurationMinutes(practice.duration) >= 20) score += 5;
  }

  // ═══ DURATION FIT ═══
  if (durationFits(practice, duration)) {
    score += 5;
  } else {
    score -= 10;
    reasons.push('Duration mismatch');
  }

  return { practice, score, reasons };
}

// ---------------------------------------------------------------------------
// Rationale builder
// ---------------------------------------------------------------------------

function buildRationale(
  scored: ScoredPractice,
  sv: StateVector,
  duration: RecommendedDuration
): string {
  const parts: string[] = [];
  const el = sv.primary.element;
  const sec = sv.secondary?.element;

  parts.push(`Your primary element is ${el}${sec ? ` with ${sec} secondary` : ''}.`);

  const kairosDesc: Record<KairosAssessment, string> = {
    'stable': 'You are in a stable period -- a good time for deepening.',
    'transition': 'You are in transition -- grounding and somatic practices support this movement.',
    'threshold': 'You are at a threshold -- contained, careful practices honor the liminal space.',
    'integration': 'You are integrating -- narrative and relational practices help weave meaning.',
    'collapse-risk': 'Your system is under significant strain -- regulation and grounding come first.',
  };
  parts.push(kairosDesc[sv.kairos.assessment]);

  if (sv.primary.polarity <= 2) {
    parts.push('Your energy is contracted, so expansive practices help open space.');
  } else if (sv.primary.polarity >= 4) {
    parts.push('Your energy is expansive, so grounding practices help you land.');
  }

  if (sv.primary.intensity === 'high') {
    parts.push('Intensity is high -- the body needs to move before the mind can settle.');
  }

  const durationLabels: Record<RecommendedDuration, string> = {
    'micro': 'A brief practice (under 15 minutes) is recommended.',
    'short': 'A short practice (15-25 minutes) fits this state.',
    'full': 'Full-length practice is available to you.',
  };
  parts.push(durationLabels[duration]);

  return parts.join(' ');
}

// ---------------------------------------------------------------------------
// Main routing function
// ---------------------------------------------------------------------------

/**
 * Route a State Vector to a practice recommendation.
 *
 * Pure function: no side effects, no memory, no external calls.
 * Sanctuary-safe: can be called without any risk of leaking state.
 */
export function routePractice(
  stateVector: StateVector,
  practices: Practice[],
  tier?: DevelopmentalTier
): PracticeRecommendation {
  const duration = recommendDuration(stateVector);
  const contraindications = buildContraindications(stateVector);

  const scored: ScoredPractice[] = practices
    .map(p => scorePractice(p, stateVector, duration, tier))
    .filter(sp => sp.score > -1)
    .sort((a, b) => b.score - a.score);

  // Fallback if safety gates block everything
  if (scored.length === 0) {
    return buildFallback(stateVector, practices, duration, contraindications);
  }

  const primary = scored[0];
  const alternatives = scored
    .slice(1)
    .filter(sp => sp.score > 0)
    .slice(0, 3)
    .map(sp => sp.practice);

  return {
    primary: primary.practice,
    alternatives,
    rationale: buildRationale(primary, stateVector, duration),
    duration,
    contraindications,
  };
}

function buildFallback(
  sv: StateVector,
  practices: Practice[],
  duration: RecommendedDuration,
  contraindications: string[]
): PracticeRecommendation {
  const earthPractices = practices.filter(p => p.element === 'earth' || p.element === 'all');
  const grounding = earthPractices.find(p => p.category === 'nature' || p.category === 'movement');

  if (grounding) {
    return {
      primary: grounding,
      alternatives: earthPractices.filter(p => p.id !== grounding.id).slice(0, 2),
      rationale: 'Your current state requires basic grounding before any other practice. This is a regulation-first recommendation. When you feel more settled, a wider range of practices will become available.',
      duration: 'micro',
      contraindications,
    };
  }

  // Absolute fallback
  return {
    primary: practices[0],
    alternatives: practices.slice(1, 4),
    rationale: 'No practice in the current pool closely matches your state. This is offered as a starting point. Trust your own sense of what feels right.',
    duration: 'micro',
    contraindications: [
      ...contraindications,
      'This is a fallback. If nothing feels right, the most sovereign choice may be to simply rest.',
    ],
  };
}
