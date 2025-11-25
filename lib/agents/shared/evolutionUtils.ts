/**
 * Shared Evolution Utilities
 * Consistent growth and relationship mechanics across all agent types
 * Used by PersonalOracle, Shadow, Mentor, and Elemental agents
 */

import type { Element } from '../PersonalOracle/modules/types';

// ============================================================================
// RELATIONSHIP EVOLUTION
// ============================================================================

export interface RelationshipMetrics {
  trustLevel: number;
  intimacyLevel: number;
  soulRecognition: number;
  harmonicResonance: number;
  interactionCount: number;
}

/**
 * Universal trust progression algorithm
 * All agents use this for consistent trust building
 */
export function evolveRelationshipMetrics(
  current: RelationshipMetrics,
  interactionQuality: 'breakthrough' | 'positive' | 'neutral' | 'challenging' | 'conflict'
): RelationshipMetrics {
  const progressionRates = {
    breakthrough: { trust: 5, intimacy: 3, soul: 2, harmonic: 3 },
    positive: { trust: 2, intimacy: 1.5, soul: 0.5, harmonic: 1 },
    neutral: { trust: 1, intimacy: 0.5, soul: 0, harmonic: 0.5 },
    challenging: { trust: 0.5, intimacy: 1, soul: 1, harmonic: -0.5 }, // Challenges can deepen intimacy
    conflict: { trust: -1, intimacy: -0.5, soul: 0, harmonic: -2 }
  };

  const rates = progressionRates[interactionQuality];

  return {
    trustLevel: clamp(current.trustLevel + rates.trust, 0, 100),
    intimacyLevel: clamp(current.intimacyLevel + rates.intimacy, 0, 100),
    soulRecognition: clamp(current.soulRecognition + rates.soul, 0, 100),
    harmonicResonance: clamp(current.harmonicResonance + rates.harmonic, -50, 100),
    interactionCount: current.interactionCount + 1
  };
}

/**
 * Determine relationship phase based on metrics
 * Universal phases all agents progress through
 */
export function determineRelationshipPhase(metrics: RelationshipMetrics): string {
  const { trustLevel, intimacyLevel, soulRecognition, interactionCount } = metrics;

  // Soul recognition overrides normal progression
  if (soulRecognition > 80) return 'soul-reunion';
  if (soulRecognition > 60) return 'remembering';

  // Combined score for phase detection
  const combinedScore = (trustLevel + intimacyLevel) / 2;

  if (interactionCount < 3) return 'first-contact';
  if (combinedScore < 20) return 'establishing';
  if (combinedScore < 40) return 'exploring';
  if (combinedScore < 60) return 'deepening';
  if (combinedScore < 80) return 'integrating';
  return 'unified';
}

// ============================================================================
// PERSONALITY EVOLUTION
// ============================================================================

export interface PersonalityTraits {
  warmth: number;
  directness: number;
  challenge: number;
  intuition: number;
  playfulness: number;
  depth: number;
  presence: number;
}

/**
 * Evolve personality traits based on user preferences
 * Shared across all agent types for consistent adaptation
 */
export function evolvePersonalityTraits(
  current: PersonalityTraits,
  userFeedback: {
    responseToWarmth?: 'receptive' | 'neutral' | 'distant';
    responseToChallenge?: 'embraces' | 'tolerates' | 'resists';
    responseToPlayfulness?: 'engages' | 'neutral' | 'serious';
    responseToDepth?: 'dives' | 'wades' | 'surface';
  }
): PersonalityTraits {
  const evolved = { ...current };

  // Adapt warmth
  if (userFeedback.responseToWarmth === 'receptive') {
    evolved.warmth = clamp(evolved.warmth + 2, 0, 100);
  } else if (userFeedback.responseToWarmth === 'distant') {
    evolved.warmth = clamp(evolved.warmth - 1, 30, 100); // Never go too cold
    evolved.presence = clamp(evolved.presence + 1, 0, 100); // Shift to presence
  }

  // Adapt challenge level
  if (userFeedback.responseToChallenge === 'embraces') {
    evolved.challenge = clamp(evolved.challenge + 3, 0, 100);
    evolved.depth = clamp(evolved.depth + 1, 0, 100);
  } else if (userFeedback.responseToChallenge === 'resists') {
    evolved.challenge = clamp(evolved.challenge - 2, 10, 100); // Keep some challenge
    evolved.warmth = clamp(evolved.warmth + 1, 0, 100);
  }

  // Adapt playfulness
  if (userFeedback.responseToPlayfulness === 'engages') {
    evolved.playfulness = clamp(evolved.playfulness + 2, 0, 100);
  } else if (userFeedback.responseToPlayfulness === 'serious') {
    evolved.playfulness = clamp(evolved.playfulness - 1, 20, 100);
    evolved.depth = clamp(evolved.depth + 1, 0, 100);
  }

  // Adapt depth
  if (userFeedback.responseToDepth === 'dives') {
    evolved.depth = clamp(evolved.depth + 3, 0, 100);
    evolved.intuition = clamp(evolved.intuition + 1, 0, 100);
  } else if (userFeedback.responseToDepth === 'surface') {
    evolved.depth = clamp(evolved.depth - 1, 20, 100);
    evolved.playfulness = clamp(evolved.playfulness + 1, 0, 100);
  }

  return evolved;
}

/**
 * Determine archetype based on trait configuration
 * Universal archetype detection for all agents
 */
export function determineArchetype(traits: PersonalityTraits): string {
  const profiles = [
    { name: 'mystic', req: { intuition: 80, depth: 70 } },
    { name: 'challenger', req: { challenge: 70, directness: 60 } },
    { name: 'nurturer', req: { warmth: 80, presence: 60 } },
    { name: 'trickster', req: { playfulness: 80, intuition: 60 } },
    { name: 'sage', req: { depth: 80, presence: 70 } },
    { name: 'warrior', req: { directness: 80, challenge: 60 } },
    { name: 'healer', req: { warmth: 70, intuition: 70 } }
  ];

  // Find best matching archetype
  for (const profile of profiles) {
    const matches = Object.entries(profile.req).every(
      ([trait, min]) => traits[trait as keyof PersonalityTraits] >= min
    );
    if (matches) return profile.name;
  }

  // Default based on highest trait
  const maxTrait = Object.entries(traits).reduce((a, b) =>
    traits[a[0] as keyof PersonalityTraits] > traits[b[0] as keyof PersonalityTraits] ? a : b
  );

  const traitArchetypes: Record<string, string> = {
    warmth: 'companion',
    directness: 'truth-teller',
    challenge: 'catalyst',
    intuition: 'oracle',
    playfulness: 'fool',
    depth: 'philosopher',
    presence: 'witness'
  };

  return traitArchetypes[maxTrait[0]] || 'guide';
}

// ============================================================================
// ELEMENTAL EVOLUTION
// ============================================================================

export interface ElementalBalance {
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
}

/**
 * Evolve elemental balance based on interactions
 * Shared logic for all agents working with elements
 */
export function evolveElementalBalance(
  current: ElementalBalance,
  interaction: {
    primaryElement: Element;
    intensity: number; // 0-100
    integration: 'embraced' | 'resisted' | 'balanced';
  }
): ElementalBalance {
  const evolved = { ...current };
  const { primaryElement, intensity, integration } = interaction;

  // Calculate change based on integration response
  const changeRates = {
    embraced: intensity * 0.03,
    balanced: intensity * 0.015,
    resisted: intensity * -0.01
  };

  const change = changeRates[integration];

  // Apply primary element change
  evolved[primaryElement] = clamp(evolved[primaryElement] + change, 0, 100);

  // Rebalance other elements (they slightly decrease when one increases)
  const otherElements = (Object.keys(evolved) as Element[]).filter(e => e !== primaryElement);
  const rebalanceAmount = change * 0.25; // Gentle rebalancing

  for (const element of otherElements) {
    evolved[element] = clamp(evolved[element] - rebalanceAmount, 10, 100); // Keep minimum presence
  }

  return evolved;
}

/**
 * Detect elemental dominance and shadow
 * Universal pattern for all agents
 */
export function detectElementalPattern(balance: ElementalBalance): {
  dominant?: Element;
  shadow?: Element;
  balanced: boolean;
} {
  const elements = Object.entries(balance) as [Element, number][];
  elements.sort((a, b) => b[1] - a[1]);

  const [highest, secondHighest, , , lowest] = elements;
  const range = highest[1] - lowest[1];

  // Check if balanced (all elements within 20 points)
  const balanced = range < 20;

  return {
    dominant: balanced ? undefined : highest[0],
    shadow: balanced ? undefined : lowest[0],
    balanced
  };
}

// ============================================================================
// CONVERSATION EVOLUTION
// ============================================================================

export type ConversationDepth = 'surface' | 'exploring' | 'deepening' | 'profound' | 'unity';

/**
 * Evolve conversation depth based on content
 * Shared across all agents for consistent depth tracking
 */
export function evolveConversationDepth(
  currentDepth: ConversationDepth,
  markers: {
    vulnerabilityShared: boolean;
    insightReached: boolean;
    emotionalIntensity: number; // 0-100
    spiritualContent: boolean;
    challengeEngaged: boolean;
  }
): ConversationDepth {
  const depthLevels: ConversationDepth[] = ['surface', 'exploring', 'deepening', 'profound', 'unity'];
  const currentIndex = depthLevels.indexOf(currentDepth);

  // Calculate depth score
  let depthScore = 0;
  if (markers.vulnerabilityShared) depthScore += 2;
  if (markers.insightReached) depthScore += 1;
  if (markers.emotionalIntensity > 70) depthScore += 2;
  if (markers.emotionalIntensity > 40) depthScore += 1;
  if (markers.spiritualContent) depthScore += 1;
  if (markers.challengeEngaged) depthScore += 1;

  // Determine new depth
  let targetIndex = currentIndex;
  if (depthScore >= 5) targetIndex = Math.min(currentIndex + 2, depthLevels.length - 1);
  else if (depthScore >= 3) targetIndex = Math.min(currentIndex + 1, depthLevels.length - 1);
  else if (depthScore <= 1) targetIndex = Math.max(currentIndex - 1, 0);

  return depthLevels[targetIndex];
}

// ============================================================================
// GROWTH TRACKING
// ============================================================================

export interface GrowthMetrics {
  breakthroughs: string[];
  integrations: string[];
  resistances: string[];
  patterns: string[];
  edges: string[];
}

/**
 * Track growth patterns across sessions
 * Universal growth tracking for all agents
 */
export function trackGrowthPattern(
  current: GrowthMetrics,
  session: {
    breakthroughMoment?: string;
    integrationRealized?: string;
    resistanceEncountered?: string;
    patternRecognized?: string;
    edgeApproached?: string;
  }
): GrowthMetrics {
  const updated = { ...current };

  if (session.breakthroughMoment) {
    updated.breakthroughs = [...updated.breakthroughs, session.breakthroughMoment];
  }

  if (session.integrationRealized) {
    updated.integrations = [...updated.integrations, session.integrationRealized];
  }

  if (session.resistanceEncountered) {
    updated.resistances = [...updated.resistances, session.resistanceEncountered];
  }

  if (session.patternRecognized) {
    updated.patterns = [...updated.patterns, session.patternRecognized];
  }

  if (session.edgeApproached) {
    updated.edges = [...updated.edges, session.edgeApproached];
  }

  return updated;
}

/**
 * Identify next growth edge based on patterns
 * Helps all agents guide users toward their edge
 */
export function identifyGrowthEdge(metrics: GrowthMetrics): {
  edge: string;
  readiness: number; // 0-100
  approach: 'gentle' | 'direct' | 'provocative';
} {
  const { breakthroughs, resistances, patterns } = metrics;

  // Analyze patterns to find edge
  const recentResistances = resistances.slice(-5);
  const recentBreakthroughs = breakthroughs.slice(-5);

  // Calculate readiness based on breakthrough/resistance ratio
  const breakthroughRate = recentBreakthroughs.length / (recentBreakthroughs.length + recentResistances.length || 1);
  const readiness = Math.round(breakthroughRate * 100);

  // Determine approach based on readiness
  let approach: 'gentle' | 'direct' | 'provocative';
  if (readiness < 30) approach = 'gentle';
  else if (readiness < 70) approach = 'direct';
  else approach = 'provocative';

  // Identify the edge (simplified - could be much more sophisticated)
  const commonResistance = findMostCommon(recentResistances);
  const edge = commonResistance || patterns[patterns.length - 1] || 'presence';

  return { edge, readiness, approach };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Clamp a number between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Find most common element in array
 */
function findMostCommon(arr: string[]): string | undefined {
  if (arr.length === 0) return undefined;

  const counts = arr.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(counts).reduce((a, b) => counts[a[0]] > counts[b[0]] ? a : b)[0];
}

/**
 * Calculate harmonic resonance between two sets of traits
 * Useful for agent-user compatibility
 */
export function calculateHarmonicResonance(
  agentTraits: PersonalityTraits,
  userPreferences: Partial<PersonalityTraits>
): number {
  let resonance = 50; // Start neutral

  for (const [trait, agentValue] of Object.entries(agentTraits)) {
    const userValue = userPreferences[trait as keyof PersonalityTraits];
    if (userValue !== undefined) {
      const difference = Math.abs(agentValue - userValue);
      const harmony = 100 - difference;
      resonance = (resonance + harmony) / 2;
    }
  }

  return Math.round(resonance);
}