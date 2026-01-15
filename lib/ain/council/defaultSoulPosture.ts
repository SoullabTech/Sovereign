/**
 * MAIA's Default Soul Posture
 *
 * "We stabilize first, then strategize."
 *
 * This is the constitutional default for how MAIA meets ambiguity:
 * - Containment before movement
 * - Regulator leads when terrain is unclear
 * - Navigator activates when readiness is detected
 * - Integrator watches the timing of the handoff
 *
 * Philosophy: In ambiguity, the psyche's first job isn't direction — it's relationship.
 * Self doesn't rush. Self orients by containment first, then movement.
 */

import type { CoreAgentId } from './types';

/**
 * Values profile for MAIA's default behavior in ambiguous contexts
 */
export interface SoulPosture {
  /** Which function leads when context is ambiguous */
  defaultLeadInAmbiguity: CoreAgentId;

  /** Threshold (0-1) at which Navigator takes over from Regulator */
  readinessThreshold: number;

  /** Maximum share Regulator can take (prevents "soothing fog machine") */
  regulatorMaxShare: number;

  /** Minimum share Navigator always gets (preserves agency/direction) */
  navigatorMinShare: number;

  /** Core principle as human-readable statement */
  principle: string;
}

/**
 * MAIA's default soul posture
 *
 * Regulator-first, Navigator-when-ready
 * This mirrors how good therapy, initiation, and real learning work:
 * 1. Can we stay with this safely?
 * 2. If yes, what is the next step?
 */
export const defaultSoulPosture: SoulPosture = {
  defaultLeadInAmbiguity: 'regulator',
  readinessThreshold: 0.6,
  regulatorMaxShare: 0.40,
  navigatorMinShare: 0.12,
  principle: 'We stabilize first, then strategize.',
};

/**
 * Readiness signals that shift from Regulator → Navigator
 *
 * When these are present, Navigator can take more authority
 */
export const readinessSignals = {
  /** Language patterns indicating groundedness */
  groundedLanguage: [
    'help me decide',
    'what should I',
    'next step',
    'plan',
    'strategy',
    'how do I',
    'what would you recommend',
    'options',
  ],

  /** Language patterns indicating dysregulation (Regulator stays lead) */
  dysregulatedLanguage: [
    "don't know what to do",
    'overwhelmed',
    'panicking',
    'scared',
    'can\'t think',
    'too much',
    'falling apart',
    'losing it',
    'help me',
    'freaking out',
  ],

  /** Affective tone indicators (would come from analysis) */
  stableAffectMarkers: [
    'curious',
    'wondering',
    'considering',
    'thinking about',
    'exploring',
  ],
};

/**
 * Detect readiness level from user message
 *
 * Returns 0-1 score:
 * - Low (< 0.4): Stay with Regulator
 * - Medium (0.4-0.6): Shared lead
 * - High (> 0.6): Navigator can lead
 */
export function detectReadiness(message: string): number {
  const lower = message.toLowerCase();

  // Check for dysregulation signals (reduces readiness)
  const dysregulationCount = readinessSignals.dysregulatedLanguage.filter(
    signal => lower.includes(signal)
  ).length;

  // Check for grounded signals (increases readiness)
  const groundedCount = readinessSignals.groundedLanguage.filter(
    signal => lower.includes(signal)
  ).length;

  // Check for stable affect markers
  const stableCount = readinessSignals.stableAffectMarkers.filter(
    signal => lower.includes(signal)
  ).length;

  // Base readiness (neutral)
  let readiness = 0.5;

  // Dysregulation strongly reduces readiness
  readiness -= dysregulationCount * 0.15;

  // Grounded language increases readiness
  readiness += groundedCount * 0.12;

  // Stable affect slightly increases
  readiness += stableCount * 0.08;

  // Clamp to 0-1
  return Math.max(0, Math.min(1, readiness));
}

/**
 * Determine which function should lead based on readiness
 */
export function determineLeadFunction(
  readiness: number,
  posture: SoulPosture = defaultSoulPosture
): CoreAgentId {
  if (readiness >= posture.readinessThreshold) {
    return 'navigator';
  }
  return posture.defaultLeadInAmbiguity;
}

/**
 * Get adjusted weight priors based on readiness
 *
 * This is the key function that implements "stabilize first, strategize second"
 */
export function getReadinessAdjustedPriors(
  readiness: number,
  posture: SoulPosture = defaultSoulPosture
): Record<CoreAgentId, number> {
  // Base priors (from charter weight policies, normalized)
  const basePriors: Record<CoreAgentId, number> = {
    navigator: 0.18,
    guardian: 0.15,
    regulator: 0.20,
    mythopoet: 0.12,
    skeptic: 0.15,
    integrator: 0.20,
  };

  // Adjust based on readiness
  if (readiness < posture.readinessThreshold) {
    // Low readiness: boost Regulator, cap Navigator
    basePriors.regulator = Math.min(basePriors.regulator * 1.4, posture.regulatorMaxShare);
    basePriors.navigator = Math.max(basePriors.navigator * 0.7, posture.navigatorMinShare);
  } else {
    // High readiness: boost Navigator, Regulator steps back
    basePriors.navigator = Math.min(basePriors.navigator * 1.3, 0.35);
    basePriors.regulator = basePriors.regulator * 0.85;
  }

  // Renormalize to sum to 1
  const total = Object.values(basePriors).reduce((a, b) => a + b, 0);
  for (const key of Object.keys(basePriors) as CoreAgentId[]) {
    basePriors[key] = basePriors[key] / total;
  }

  return basePriors;
}

/**
 * The one-sentence invitation that preserves agency
 *
 * When Regulator is leading, include this to prevent stagnation
 * and give the member a choice to move toward Navigator
 */
export const agencyPreservingInvitation =
  "Would you like a next step, or would it help to stay with what's here for a moment?";
