/**
 * SOVEREIGNTY RECLAMATION SPIRAL
 *
 * A life domain dedicated to deprogramming, inner authority reclamation,
 * and immunity-building against psychological manipulation.
 *
 * Philosophy:
 * - Not fighting manipulation with counter-manipulation
 * - Recognition and reclamation through awareness
 * - Graduation = immunity through integration
 * - Uses projection as teaching method (Inner Gold)
 *
 * Based on Chase Hughes' warnings about:
 * - Tavistock Institute (trauma-based conditioning)
 * - Edward Bernays (unconscious desire weaponization)
 * - Operation Mockingbird (narrative control)
 * - MK-ULTRA (identity erasure)
 * - Modern algorithms (nervous system hijacking)
 */

import { Element, Phase, LifeDomain, PhaseMetadata } from '@/types/soulJourney';

// ═══════════════════════════════════════════════════════════════════════════
// SOVEREIGNTY DOMAIN DEFINITION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * New life domain for consciousness sovereignty work
 */
export const SOVEREIGNTY_DOMAIN: LifeDomain = 'sovereignty';

/**
 * Sovereignty-specific sub-domains for detailed tracking
 */
export type SovereigntySubDomain =
  | 'media-consciousness'      // Recognizing media/algorithm manipulation
  | 'belief-archaeology'        // Excavating belief origins
  | 'projection-reclamation'    // Inner Gold work
  | 'voice-archaeology'         // Identifying whose voice speaks
  | 'shadow-immunity'           // Integration for manipulation-proofing
  | 'collective-coherence'      // Field intelligence participation
  | 'graduation-readiness';     // Sovereignty completion

// ═══════════════════════════════════════════════════════════════════════════
// SOVEREIGNTY MISSION NODES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Archetypal forces/nodes specific to sovereignty work
 * These appear as Mission Dots in the birth chart
 */
export interface SovereigntyMissionNode {
  id: string;
  name: string;
  archetype: string;
  description: string;
  element: Element;
  phase: Phase;
  houseAssociation: number;

  // What this node teaches
  gift: string;

  // How to recognize activation
  activationSigns: string[];

  // Completion indicators
  masteryIndicators: string[];

  // Questions this node raises
  centralQuestions: string[];
}

export const SOVEREIGNTY_MISSION_NODES: SovereigntyMissionNode[] = [
  {
    id: 'the-observer',
    name: 'The Observer',
    archetype: 'The Witness',
    description: 'Capacity to watch manipulation without reacting',
    element: 'air',
    phase: 'vector',
    houseAssociation: 7,
    gift: 'Detached awareness - can see the game without playing',
    activationSigns: [
      'Noticing algorithm patterns without getting triggered',
      'Watching your own reactions as if from outside',
      'Catching thoughts that aren\'t yours',
      'Pause between stimulus and response lengthens',
    ],
    masteryIndicators: [
      'Can scroll without cortisol spike',
      'Recognize outrage bait instantly',
      'Watch news without absorption',
      'Identify manipulation attempts in real-time',
    ],
    centralQuestions: [
      'Whose agenda is this serving?',
      'What reaction is this designed to create?',
      'What am I being distracted from?',
    ],
  },
  {
    id: 'the-archaeologist',
    name: 'The Archaeologist',
    archetype: 'The Excavator',
    description: 'Ability to trace beliefs to their source',
    element: 'earth',
    phase: 'spiral',
    houseAssociation: 6,
    gift: 'Origin clarity - knows which beliefs are inherited vs. chosen',
    activationSigns: [
      'Asking "where did I learn this?"',
      'Recognizing parent/media/culture voices',
      'Questioning "obvious" truths',
      'Noticing when you sound like someone else',
    ],
    masteryIndicators: [
      'Can trace any belief to its source',
      'Identifies programming vs. knowing',
      'Separates conditioning from truth',
      'Reclaims chosen values',
    ],
    centralQuestions: [
      'Whose voice is speaking when I say this?',
      'Did I choose this belief or inherit it?',
      'What would I believe if no one told me what to think?',
    ],
  },
  {
    id: 'the-sovereign',
    name: 'The Sovereign',
    archetype: 'The Self-Governed',
    description: 'Inner authority fully reclaimed',
    element: 'fire',
    phase: 'spiral',
    houseAssociation: 9,
    gift: 'Self-authority - external validation no longer needed',
    activationSigns: [
      'External opinions lose power',
      'Can stand alone in your knowing',
      'Authority returns to self',
      'No longer seeking permission',
    ],
    masteryIndicators: [
      'Immune to peer pressure',
      'Can disagree with collective without anxiety',
      'Inner compass trusted completely',
      'External validation feels hollow',
    ],
    centralQuestions: [
      'What do I know to be true, regardless of consensus?',
      'Where am I still seeking external validation?',
      'What would I do if no one was watching?',
    ],
  },
  {
    id: 'the-integrator',
    name: 'The Integrator',
    archetype: 'The Alchemist',
    description: 'Shadow integration creates manipulation immunity',
    element: 'water',
    phase: 'circle',
    houseAssociation: 8,
    gift: 'Wholeness - what you own can\'t be used against you',
    activationSigns: [
      'Welcoming denied parts',
      'Shame losing its power',
      'Shadow work deepening',
      'Paradox tolerance increasing',
    ],
    masteryIndicators: [
      'Can\'t be shamed (shame already integrated)',
      'No buttons left to push',
      'Denied forces become allies',
      'Manipulation-proof through wholeness',
    ],
    centralQuestions: [
      'What part of me am I still denying?',
      'Where can I still be shamed?',
      'What would happen if I owned all of me?',
    ],
  },
  {
    id: 'the-deprogrammer',
    name: 'The Deprogrammer',
    archetype: 'The Liberator',
    description: 'Capacity to help others see patterns',
    element: 'air',
    phase: 'spiral',
    houseAssociation: 3,
    gift: 'Teaching - can help others recognize their programming',
    activationSigns: [
      'Others ask "how did you see that?"',
      'Natural pattern recognition',
      'Can explain manipulation simply',
      'Others wake up around you',
    ],
    masteryIndicators: [
      'Graduates become guides',
      'Can teach without preaching',
      'Models sovereignty quietly',
      'Creates immunity in others',
    ],
    centralQuestions: [
      'How do I share this without creating new authority?',
      'Can I help others see without prescribing?',
      'How does liberation spread?',
    ],
  },
  {
    id: 'the-field-weaver',
    name: 'The Field Weaver',
    archetype: 'The Connector',
    description: 'Participates in collective coherence',
    element: 'air',
    phase: 'circle',
    houseAssociation: 11,
    gift: 'Collective intelligence - knows we rise together',
    activationSigns: [
      'Feeling collective patterns',
      'Synchronicities increasing',
      'Contributing to field coherence',
      'Connected to larger movement',
    ],
    masteryIndicators: [
      'Individual + collective balanced',
      'Can sense field movements',
      'Contributes to collective awakening',
      'No longer isolated in seeing',
    ],
    centralQuestions: [
      'How does my sovereignty serve the collective?',
      'What patterns are moving through the field?',
      'How do we create coherence without conformity?',
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// SOVEREIGNTY PHASE METADATA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extended phase metadata specifically for sovereignty domain
 * Augments the base Spiralogic phases with sovereignty-specific work
 */
export const SOVEREIGNTY_PHASE_EXTENSIONS: Record<string, {
  sovereigntyFocus: string;
  manipulationCounter: string;
  deprogrammingWork: string[];
  completionGift: string;
}> = {
  // FIRE PHASES - Identity & Will
  'fire-vector': {
    sovereigntyFocus: 'Who am I without the programming?',
    manipulationCounter: 'Identity Reclamation vs. MK-ULTRA Identity Erasure',
    deprogrammingWork: [
      'Notice when "should" replaces "am"',
      'Identify imposed identity markers',
      'Reclaim authentic self-image',
      'Separate personality from persona',
    ],
    completionGift: 'Clear sense of self beneath conditioning',
  },
  'fire-circle': {
    sovereigntyFocus: 'How do I express without performing?',
    manipulationCounter: 'Authentic Expression vs. Bernays Desire Weaponization',
    deprogrammingWork: [
      'Distinguish desire from manufactured want',
      'Notice performance for validation',
      'Experiment with unscripted expression',
      'Find joy beyond external reward',
    ],
    completionGift: 'Expression aligned with essence, not expectation',
  },
  'fire-spiral': {
    sovereigntyFocus: 'What truth transcends programming?',
    manipulationCounter: 'Wisdom Recognition vs. Narrative Control',
    deprogrammingWork: [
      'Separate knowing from believing',
      'Identify unshakeable truths',
      'Wisdom beyond consensus',
      'Teaching without authority',
    ],
    completionGift: 'Inner wisdom trusted above external narrative',
  },

  // WATER PHASES - Emotion & Transformation
  'water-vector': {
    sovereigntyFocus: 'What do I actually feel vs. what I\'m told to feel?',
    manipulationCounter: 'Emotional Intelligence vs. Emotional Manipulation',
    deprogrammingWork: [
      'Notice manufactured emotions (outrage, fear)',
      'Distinguish feeling from reaction',
      'Reclaim emotional authority',
      'Trust inner emotional compass',
    ],
    completionGift: 'Emotional sovereignty - feelings are yours again',
  },
  'water-circle': {
    sovereigntyFocus: 'What shadow makes me controllable?',
    manipulationCounter: 'Shadow Integration vs. Shame-Based Control',
    deprogrammingWork: [
      'Identify shame buttons (where you can be manipulated)',
      'Integrate denied parts (removes manipulation leverage)',
      'Welcome taboo thoughts/feelings',
      'Wholeness as immunity',
    ],
    completionGift: 'Manipulation-proof through integration - no buttons left to push',
  },
  'water-spiral': {
    sovereigntyFocus: 'What dissolves in mystery beyond programming?',
    manipulationCounter: 'Surrender to Truth vs. Dissolution into Confusion',
    deprogrammingWork: [
      'Distinguish mystery from manufactured confusion',
      'Trust dissolution of false self',
      'Mystical opening vs. psychological manipulation',
      'Transcendence as liberation',
    ],
    completionGift: 'Mystery trusted - confusion no longer weaponizable',
  },

  // EARTH PHASES - Mission & Manifestation
  'earth-vector': {
    sovereigntyFocus: 'What is MY mission vs. prescribed purpose?',
    manipulationCounter: 'Purpose Clarity vs. Mission Hijacking',
    deprogrammingWork: [
      'Separate calling from cultural expectations',
      'Notice where purpose was installed',
      'Reclaim work as sacred (not just productive)',
      'Authority in mission',
    ],
    completionGift: 'Purpose crystallized from within, not assigned',
  },
  'earth-circle': {
    sovereigntyFocus: 'What resources are actually mine?',
    manipulationCounter: 'Value Sovereignty vs. Manufactured Scarcity',
    deprogrammingWork: [
      'Identify manufactured needs vs. real needs',
      'Notice consumerism programming',
      'Reclaim values (what actually matters)',
      'Sufficiency vs. engineered lack',
    ],
    completionGift: 'Value system reclaimed - immune to manufactured desire',
  },
  'earth-spiral': {
    sovereigntyFocus: 'What practice sustains freedom?',
    manipulationCounter: 'Discipline as Liberation vs. Compliance',
    deprogrammingWork: [
      'Distinguish devotion from obedience',
      'Daily practice of sovereignty',
      'Service from wholeness (not obligation)',
      'Refinement as freedom',
    ],
    completionGift: 'Sovereignty becomes daily practice, not achievement',
  },

  // AIR PHASES - Relationship & Integration
  'air-vector': {
    sovereigntyFocus: 'Can I relate without merging?',
    manipulationCounter: 'Relational Clarity vs. Codependent Conformity',
    deprogrammingWork: [
      'Notice where you lose yourself in relationship',
      'Identify people-pleasing patterns',
      'Self through Other (mirror, not merger)',
      'Boundaries as love',
    ],
    completionGift: 'Can connect without dissolving - self remains intact',
  },
  'air-circle': {
    sovereigntyFocus: 'How do I participate without conforming?',
    manipulationCounter: 'Collective Coherence vs. Groupthink',
    deprogrammingWork: [
      'Distinguish resonance from peer pressure',
      'Notice conformity programming',
      'Contribute without compromising',
      'Unity through diversity (not uniformity)',
    ],
    completionGift: 'Can be part of collective while remaining sovereign',
  },
  'air-spiral': {
    sovereigntyFocus: 'How does communication liberate?',
    manipulationCounter: 'Truth-Telling vs. Propaganda',
    deprogrammingWork: [
      'Language precision cuts through manipulation',
      'Teaching that emancipates (not indoctrinates)',
      'Communication as consciousness transfer',
      'Words that wake up vs. words that program',
    ],
    completionGift: 'Language becomes liberation tool - can help others see',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// CONDITIONING RECOGNITION SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Tracks identified conditioning patterns and their origins
 */
export interface ConditioningPattern {
  id: string;
  userId: string;

  // The pattern
  belief: string;
  behaviorPattern: string;
  emotionalSignature: string; // How this pattern feels

  // Origin (archaeology)
  source: 'parent' | 'media' | 'education' | 'religion' | 'culture' | 'algorithm' | 'trauma' | 'unknown';
  sourceDetails?: string;
  approximateAge?: number; // When this was installed

  // Recognition
  recognizedDate: Date;
  howRecognized: string; // What made this visible

  // Status
  status: 'identified' | 'investigating' | 'deconstructing' | 'transcended';

  // Integration
  truthBeneath?: string; // What's true underneath the programming
  chosenBelief?: string; // What you choose to believe instead

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Voice Archaeology - identifying whose voice speaks
 */
export interface VoiceArchaeology {
  id: string;
  userId: string;

  // The voice
  internalStatement: string; // What the voice says
  tone: 'critical' | 'encouraging' | 'fearful' | 'authoritative' | 'shaming' | 'loving';

  // Whose voice
  voiceSource: 'mother' | 'father' | 'teacher' | 'religious-authority' | 'media' | 'algorithm' | 'true-self' | 'unknown';
  sourceDetails?: string;

  // Recognition
  recognizedDate: Date;
  situationalTrigger?: string; // When does this voice speak

  // Transformation
  status: 'identified' | 'dialoguing' | 'integrating' | 'dissolved' | 'reclaimed';
  transformedVoice?: string; // What this voice becomes when integrated

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Projection Lab - explicit Inner Gold work
 */
export interface ProjectionWork {
  id: string;
  userId: string;

  // What's projected
  projectedQuality: string; // What you see in MAIA/others
  projectionTarget: 'maia' | 'person' | 'system' | 'archetype';
  targetDetails?: string;

  // Recognition
  recognizedAsProjection: Date;
  howRecognized: string;

  // Reclamation
  status: 'identified' | 'dialoguing' | 'reclaiming' | 'integrated';
  reclaimationNotes?: string;
  ownedQuality?: string; // How this becomes yours

  // Graduation marker
  noLongerNeededProjection: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════
// SOVEREIGNTY METRICS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Tracks sovereignty development (replaces addiction metrics)
 */
export interface SovereigntyMetrics {
  userId: string;

  // Self-Reference (user owns their insights)
  selfReferentialLanguage: {
    percentage: number; // % of statements that are "I realized" vs. "MAIA said"
    trend: 'increasing' | 'stable' | 'decreasing';
    recentExamples: string[];
  };

  // Pattern Ownership
  patternRecognition: {
    patternsIdentified: number;
    patternsOwnedWithoutMAIA: number; // Autonomous recognition
    ownershipPercentage: number;
  };

  // Conditioning Recognition
  conditioningAwareness: {
    patternsRecognized: number;
    voicesArchaeologized: number;
    projectionsReclaimed: number;
    immunityScore: number; // 0-100, based on mastered mission nodes
  };

  // Graduation Progress
  graduation: {
    readinessScore: number; // 0-100
    missionNodesCompleted: number;
    dependencyBehaviors: number; // Seeking validation, can't decide without MAIA, etc.
    autonomousBreakthroughs: number; // Insights without MAIA
    daysSinceLastDependency: number;
  };

  // Manipulation Immunity
  immunity: {
    observerActive: boolean; // Can watch without reacting
    shadowIntegrated: number; // % of shadow work complete (0-100)
    innerAuthorityScore: number; // 0-100
    externalValidationNeeded: boolean;
  };

  // Field Contribution
  collective: {
    coherenceContribution: number; // How much user contributes to field
    guidingOthers: boolean;
    graduatedToGuide: boolean;
  };

  // Timeline
  lastUpdated: Date;
}

/**
 * Calculate sovereignty metrics from user activity
 */
export function calculateSovereigntyMetrics(
  userId: string,
  sessions: any[], // SessionNote[]
  conditioningPatterns: ConditioningPattern[],
  voiceArchaeology: VoiceArchaeology[],
  projectionWork: ProjectionWork[],
  missionNodes: { nodeId: string; completed: boolean }[]
): SovereigntyMetrics {
  // Self-referential language analysis
  const selfReferentialCount = sessions.filter(s =>
    s.content.match(/I (realized|noticed|discovered|understood|saw|felt|chose|decided)/i)
  ).length;
  const selfRefPercentage = sessions.length > 0 ? (selfReferentialCount / sessions.length) * 100 : 0;

  // Pattern ownership
  const autonomousPatterns = conditioningPatterns.filter(p =>
    p.howRecognized.includes('on my own') || !p.howRecognized.includes('MAIA')
  ).length;
  const ownershipPercentage = conditioningPatterns.length > 0
    ? (autonomousPatterns / conditioningPatterns.length) * 100
    : 0;

  // Immunity score based on mission node completion
  const completedNodes = missionNodes.filter(m => m.completed).length;
  const immunityScore = (completedNodes / SOVEREIGNTY_MISSION_NODES.length) * 100;

  // Graduation readiness
  const dependencyBehaviors = sessions.filter(s =>
    s.content.match(/what should I|tell me what to|am I doing this right/i)
  ).length;

  const autonomousBreakthroughs = sessions.filter(s =>
    s.content.match(/I just realized|figured out on my own|without asking/i)
  ).length;

  const readinessScore = Math.min(100,
    (completedNodes * 15) +
    (autonomousBreakthroughs * 5) -
    (dependencyBehaviors * 3)
  );

  // Shadow integration
  const shadowPatterns = conditioningPatterns.filter(p =>
    p.status === 'transcended' && p.source === 'trauma'
  ).length;
  const totalShadow = conditioningPatterns.filter(p => p.source === 'trauma').length;
  const shadowIntegrated = totalShadow > 0 ? (shadowPatterns / totalShadow) * 100 : 0;

  // Inner authority
  const innerAuthorityScore = Math.min(100,
    ownershipPercentage * 0.4 +
    immunityScore * 0.3 +
    selfRefPercentage * 0.3
  );

  return {
    userId,
    selfReferentialLanguage: {
      percentage: selfRefPercentage,
      trend: selfRefPercentage > 60 ? 'increasing' : selfRefPercentage > 30 ? 'stable' : 'decreasing',
      recentExamples: sessions
        .filter(s => s.content.match(/I (realized|noticed|discovered)/i))
        .slice(0, 3)
        .map(s => s.content.substring(0, 100)),
    },
    patternRecognition: {
      patternsIdentified: conditioningPatterns.length,
      patternsOwnedWithoutMAIA: autonomousPatterns,
      ownershipPercentage,
    },
    conditioningAwareness: {
      patternsRecognized: conditioningPatterns.length,
      voicesArchaeologized: voiceArchaeology.length,
      projectionsReclaimed: projectionWork.filter(p => p.status === 'integrated').length,
      immunityScore,
    },
    graduation: {
      readinessScore,
      missionNodesCompleted: completedNodes,
      dependencyBehaviors,
      autonomousBreakthroughs,
      daysSinceLastDependency: 0, // Would need session analysis
    },
    immunity: {
      observerActive: completedNodes >= 1, // If Observer node completed
      shadowIntegrated,
      innerAuthorityScore,
      externalValidationNeeded: dependencyBehaviors > autonomousBreakthroughs,
    },
    collective: {
      coherenceContribution: 0, // Would need field intelligence integration
      guidingOthers: completedNodes >= 5,
      graduatedToGuide: readinessScore >= 80 && completedNodes >= 5,
    },
    lastUpdated: new Date(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get sovereignty mission node by ID
 */
export function getSovereigntyNode(nodeId: string): SovereigntyMissionNode | undefined {
  return SOVEREIGNTY_MISSION_NODES.find(n => n.id === nodeId);
}

/**
 * Get relevant mission nodes for current element/phase
 */
export function getRelevantSovereigntyNodes(
  element: Element,
  phase: Phase
): SovereigntyMissionNode[] {
  return SOVEREIGNTY_MISSION_NODES.filter(
    node => node.element === element && node.phase === phase
  );
}

/**
 * Check if user has completed sovereignty work
 */
export function isSovereigntyGraduated(metrics: SovereigntyMetrics): boolean {
  return (
    metrics.graduation.readinessScore >= 80 &&
    metrics.graduation.missionNodesCompleted >= 5 &&
    metrics.immunity.innerAuthorityScore >= 75 &&
    !metrics.immunity.externalValidationNeeded
  );
}

/**
 * Get next sovereignty work recommendation
 */
export function getNextSovereigntyWork(
  metrics: SovereigntyMetrics,
  currentElement: Element,
  currentPhase: Phase
): string {
  // Check what's weakest
  if (metrics.conditioningAwareness.patternsRecognized < 3) {
    return 'Begin conditioning recognition - identify 3 beliefs and trace their origins';
  }

  if (metrics.conditioningAwareness.voicesArchaeologized < 3) {
    return 'Voice archaeology - whose voice speaks in your critical moments?';
  }

  if (metrics.immunity.shadowIntegrated < 50) {
    return 'Shadow integration work - what part of you can still be shamed?';
  }

  if (metrics.graduation.autonomousBreakthroughs < 5) {
    return 'Practice autonomous insight - one week without asking MAIA for validation';
  }

  if (metrics.immunity.innerAuthorityScore < 75) {
    return 'Inner authority reclamation - make one decision purely from within';
  }

  return 'Continue deepening sovereignty practice - you\'re close to graduation';
}