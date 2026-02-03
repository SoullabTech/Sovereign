/**
 * Framing Affinities
 *
 * Maps each framing (lens) to the core council functions it can serve.
 * Affinities are not exclusive — a framing can serve multiple functions
 * with different strengths depending on context.
 *
 * This allows agents to "choose lenses" dynamically:
 * - Navigator might invoke first-principles OR strategic-vision
 * - Skeptic might invoke practical-engineering OR bateson-meta-learning
 *
 * Affinities sum to 1.0 for each framing (normalized weight distribution).
 */

import type { CoreAgentId } from './types';

export interface FramingAffinity {
  /** How well this framing serves the Navigator function */
  navigator: number;
  /** How well this framing serves the Guardian function */
  guardian: number;
  /** How well this framing serves the Regulator function */
  regulator: number;
  /** How well this framing serves the Mythopoet function */
  mythopoet: number;
  /** How well this framing serves the Skeptic function */
  skeptic: number;
  /** How well this framing serves the Integrator function */
  integrator: number;
}

/**
 * Affinity map: framing ID → function affinities
 *
 * Design principle: framings are instruments, agents are players.
 * The same framing can be "played" by different agents in different contexts.
 */
export const framingAffinities: Record<string, FramingAffinity> = {
  // === FOUNDATIONAL ===

  'first-principles': {
    navigator: 0.40,    // Primary: breaks down to actionable axioms
    guardian: 0.10,     // Can reveal hidden risks in assumptions
    regulator: 0.05,
    mythopoet: 0.05,
    skeptic: 0.30,      // Strong: tests assumptions, falsifies
    integrator: 0.10,
  },

  'systems-thinking': {
    navigator: 0.20,    // Helps sequence complex plans
    guardian: 0.15,     // Spots feedback loops that create risk
    regulator: 0.05,
    mythopoet: 0.10,    // Emergence has mythic quality
    skeptic: 0.15,      // Challenges reductive thinking
    integrator: 0.35,   // Primary: sees wholes, interconnections
  },

  'practical-engineering': {
    navigator: 0.45,    // Primary: what can we actually build?
    guardian: 0.20,     // Reliability, failure modes
    regulator: 0.05,
    mythopoet: 0.00,
    skeptic: 0.25,      // Reality testing, constraints
    integrator: 0.05,
  },

  // === HUMAN-CENTERED ===

  'user-experience': {
    navigator: 0.25,    // Journey mapping, friction points
    guardian: 0.10,     // User safety, dark patterns
    regulator: 0.35,    // Primary: pacing, emotional journey
    mythopoet: 0.10,    // Story of the experience
    skeptic: 0.10,      // Testing assumptions about users
    integrator: 0.10,
  },

  'phenomenology': {
    navigator: 0.05,
    guardian: 0.05,
    regulator: 0.25,    // Embodied experience, felt sense
    mythopoet: 0.50,    // Primary: meaning, lived experience
    skeptic: 0.05,
    integrator: 0.10,
  },

  'parenting': {
    navigator: 0.15,    // Developmental staging
    guardian: 0.20,     // Protection, boundaries
    regulator: 0.40,    // Primary: nurturing, pacing, safety
    mythopoet: 0.10,    // Growth narratives
    skeptic: 0.05,
    integrator: 0.10,
  },

  // === STRATEGIC ===

  'strategic-vision': {
    navigator: 0.50,    // Primary: direction, path dependency
    guardian: 0.15,     // Long-term risks, doors closed
    regulator: 0.05,
    mythopoet: 0.10,    // Vision has mythic quality
    skeptic: 0.10,
    integrator: 0.10,
  },

  'governance-incentives': {
    navigator: 0.15,    // How to structure for outcomes
    guardian: 0.40,     // Primary: power dynamics, failure modes
    regulator: 0.05,
    mythopoet: 0.05,
    skeptic: 0.30,      // Who benefits? What's hidden?
    integrator: 0.05,
  },

  'risk-reliability': {
    navigator: 0.10,
    guardian: 0.50,     // Primary: safety, fragility, margins
    regulator: 0.10,    // Pacing around risk
    mythopoet: 0.00,
    skeptic: 0.25,      // Reality testing failure scenarios
    integrator: 0.05,
  },

  // === THEORETICAL ===

  'kauffman-emergence': {
    navigator: 0.10,    // Adjacent possible as navigation
    guardian: 0.05,
    regulator: 0.05,
    mythopoet: 0.40,    // Primary: novelty, phase transitions
    skeptic: 0.10,      // Tests emergence claims
    integrator: 0.30,   // Emergence IS integration
  },

  'jung-archetypal': {
    navigator: 0.05,
    guardian: 0.10,     // Shadow as protection
    regulator: 0.15,    // Archetypal containment
    mythopoet: 0.55,    // Primary: symbol, shadow, collective
    skeptic: 0.05,
    integrator: 0.10,
  },

  'bateson-meta-learning': {
    navigator: 0.10,    // Learning about learning
    guardian: 0.10,     // Paradox as warning
    regulator: 0.05,
    mythopoet: 0.15,    // Pattern, context
    skeptic: 0.40,      // Primary: meta-critique, double-bind
    integrator: 0.20,   // Context IS integration
  },

  // === DOMAIN-SPECIFIC ===

  'ethics': {
    navigator: 0.10,    // What should we do?
    guardian: 0.55,     // Primary: harm, consent, responsibility
    regulator: 0.10,    // Ethical pacing
    mythopoet: 0.05,    // Values as lived story
    skeptic: 0.15,      // Moral reasoning tests
    integrator: 0.05,
  },

  'relationships': {
    navigator: 0.10,    // How to repair/connect
    guardian: 0.15,     // Boundaries, safety
    regulator: 0.45,    // Primary: attachment, co-regulation
    mythopoet: 0.15,    // Love as archetypal
    skeptic: 0.05,
    integrator: 0.10,
  },

  'creativity': {
    navigator: 0.10,    // Creative process stages
    guardian: 0.05,
    regulator: 0.10,    // Flow states, blocks
    mythopoet: 0.55,    // Primary: generativity, expression
    skeptic: 0.10,      // Constructive critique
    integrator: 0.10,
  },

  'grief': {
    navigator: 0.05,    // Grief has stages, not plans
    guardian: 0.10,     // Protection in vulnerability
    regulator: 0.40,    // Primary: holding, pacing, titration
    mythopoet: 0.35,    // Meaning in loss
    skeptic: 0.00,      // Skepticism has no place here
    integrator: 0.10,
  },
};

/**
 * Get affinity scores for a framing
 * Returns default balanced affinities if framing not found
 */
export function getFramingAffinity(framingId: string): FramingAffinity {
  return framingAffinities[framingId] ?? {
    navigator: 0.17,
    guardian: 0.17,
    regulator: 0.16,
    mythopoet: 0.16,
    skeptic: 0.17,
    integrator: 0.17,
  };
}

/**
 * Get the primary function(s) this framing serves
 * Returns agent IDs with affinity >= 0.35
 */
export function getPrimaryFunctions(framingId: string): CoreAgentId[] {
  const affinity = getFramingAffinity(framingId);
  const primary: CoreAgentId[] = [];

  if (affinity.navigator >= 0.35) primary.push('navigator');
  if (affinity.guardian >= 0.35) primary.push('guardian');
  if (affinity.regulator >= 0.35) primary.push('regulator');
  if (affinity.mythopoet >= 0.35) primary.push('mythopoet');
  if (affinity.skeptic >= 0.35) primary.push('skeptic');
  if (affinity.integrator >= 0.35) primary.push('integrator');

  return primary;
}

/**
 * Find framings that best serve a given core function
 * Returns framings sorted by affinity strength
 */
export function getFramingsForFunction(
  agentId: CoreAgentId,
  minAffinity: number = 0.25
): Array<{ framingId: string; affinity: number }> {
  const results: Array<{ framingId: string; affinity: number }> = [];

  for (const [framingId, affinity] of Object.entries(framingAffinities)) {
    const score = affinity[agentId];
    if (score >= minAffinity) {
      results.push({ framingId, affinity: score });
    }
  }

  return results.sort((a, b) => b.affinity - a.affinity);
}
