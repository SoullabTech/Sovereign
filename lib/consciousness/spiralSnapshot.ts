/**
 * SPIRAL SNAPSHOT COMPUTATION ENGINE
 *
 * This is the "always-on substrate" — Pass 1 of MAIA's 3-pass pipeline.
 * It produces a deterministic-ish SpiralSnapshot BEFORE response generation,
 * so every Care Mode has an anchor.
 *
 * The snapshot answers three questions:
 * 1. What phase is the member in? (+ confidence)
 * 2. What element(s) are dominant? (+ confidence)
 * 3. What state flags are present? (resource level, nervous system, integration need)
 *
 * Design principles:
 * - CHEAP: Keyword scoring + optional classifier, not a second full response
 * - STABLE: Same input should produce same snapshot (within confidence bounds)
 * - HONEST: Low confidence is valid; "uncertain" is a real answer
 */

import {
  OPERATIONAL_PHASES,
  type OperationalPhase,
  type SpiralSnapshot
} from './spiralCore';

import type { SpiralogicElement, RefinementPhase } from './spiralogic-12-phases';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export interface MemberSpiralState {
  // Phase detection
  primaryPhase: {
    phase: OperationalPhase;
    confidence: number; // 0-1
    matchedSignals: string[];
  };

  // Element detection
  dominantElement: {
    element: SpiralogicElement;
    confidence: number;
  };
  secondaryElement: {
    element: SpiralogicElement;
    confidence: number;
  } | null;

  // State flags
  nervousSystemState: 'regulated' | 'sympathetic' | 'dorsal' | 'mixed';
  resourceLevel: 'depleted' | 'low' | 'adequate' | 'resourced';
  integrationNeed: 'rest' | 'action' | 'expression' | 'meaning' | 'connection' | 'boundary';

  // Meta
  turnCount: number;
  computedAt: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIGNAL PATTERNS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Nervous system state detection patterns
 */
const NERVOUS_SYSTEM_PATTERNS = {
  sympathetic: {
    keywords: [
      'racing', 'can\'t stop', 'overwhelmed', 'panicking', 'heart pounding',
      'anxious', 'worried', 'scared', 'terrified', 'urgent', 'emergency',
      'fight', 'rage', 'furious', 'need to do something', 'can\'t sit still',
      'buzzing', 'wired', 'amped', 'on edge', 'hypervigilant'
    ],
    weight: 1.5
  },
  dorsal: {
    keywords: [
      'numb', 'frozen', 'can\'t move', 'paralyzed', 'shut down', 'collapsed',
      'hopeless', 'empty', 'dissociated', 'checked out', 'foggy', 'distant',
      'don\'t care', 'what\'s the point', 'exhausted', 'drained', 'flat',
      'disconnected', 'spacey', 'gone', 'not here'
    ],
    weight: 1.5
  },
  regulated: {
    keywords: [
      'calm', 'centered', 'grounded', 'present', 'okay', 'clear',
      'peaceful', 'balanced', 'settled', 'at ease', 'relaxed', 'open',
      'curious', 'engaged', 'connected', 'whole'
    ],
    weight: 1.0
  }
};

/**
 * Resource level detection patterns
 */
const RESOURCE_PATTERNS = {
  depleted: {
    keywords: [
      'exhausted', 'burned out', 'nothing left', 'empty', 'running on fumes',
      'can\'t anymore', 'done', 'at the end', 'falling apart', 'breaking down'
    ],
    weight: 2.0
  },
  low: {
    keywords: [
      'tired', 'drained', 'struggling', 'hard', 'difficult', 'heavy',
      'barely', 'just managing', 'hanging on', 'surviving'
    ],
    weight: 1.0
  },
  adequate: {
    keywords: [
      'okay', 'fine', 'managing', 'getting by', 'stable', 'handling it',
      'coping', 'functional'
    ],
    weight: 0.8
  },
  resourced: {
    keywords: [
      'energized', 'full', 'capable', 'strong', 'ready', 'alive',
      'thriving', 'flourishing', 'abundant', 'overflowing'
    ],
    weight: 1.0
  }
};

/**
 * Integration need detection patterns
 */
const INTEGRATION_NEED_PATTERNS = {
  rest: {
    keywords: [
      'tired', 'exhausted', 'need a break', 'overwhelmed', 'too much',
      'need to stop', 'can\'t keep', 'burned out', 'need space', 'need quiet'
    ],
    weight: 1.0
  },
  action: {
    keywords: [
      'stuck', 'need to do', 'ready to', 'want to start', 'have to move',
      'can\'t wait', 'need to act', 'time to', 'enough thinking', 'just do it'
    ],
    weight: 1.0
  },
  expression: {
    keywords: [
      'need to say', 'have to tell', 'want to share', 'need to get out',
      'bottled up', 'holding it in', 'need to express', 'want to create'
    ],
    weight: 1.0
  },
  meaning: {
    keywords: [
      'why', 'what does it mean', 'don\'t understand', 'confused', 'lost',
      'searching for', 'trying to make sense', 'need to understand', 'purpose'
    ],
    weight: 1.0
  },
  connection: {
    keywords: [
      'lonely', 'isolated', 'alone', 'disconnected', 'need someone',
      'miss', 'want to be with', 'need support', 'need to talk', 'reach out'
    ],
    weight: 1.0
  },
  boundary: {
    keywords: [
      'too much', 'need to say no', 'can\'t keep', 'being taken advantage',
      'need to protect', 'overcommitted', 'need limits', 'being pushed'
    ],
    weight: 1.0
  }
};

/**
 * Element detection patterns (extending existing inferElementFromText)
 */
const ELEMENT_PATTERNS: Record<SpiralogicElement, { keywords: string[], weight: number }> = {
  fire: {
    keywords: [
      'decide', 'will', 'courage', 'anger', 'rage', 'passion', 'ignite', 'purpose',
      'vision', 'drive', 'want', 'desire', 'goal', 'ambition', 'determination',
      'fight', 'power', 'energy', 'motivation', 'action', 'start', 'begin', 'move'
    ],
    weight: 1.0
  },
  water: {
    keywords: [
      'feel', 'feeling', 'grief', 'sad', 'cry', 'tears', 'heartbreak', 'longing',
      'love', 'shame', 'emotion', 'intuition', 'sense', 'dream', 'flow', 'deep',
      'vulnerable', 'tender', 'heart', 'hurt', 'compassion', 'empathy'
    ],
    weight: 1.0
  },
  earth: {
    keywords: [
      'body', 'health', 'money', 'home', 'work', 'schedule', 'plan', 'practical',
      'ground', 'stable', 'build', 'create', 'manifest', 'real', 'concrete',
      'physical', 'routine', 'structure', 'foundation', 'tangible', 'sensible'
    ],
    weight: 1.0
  },
  air: {
    keywords: [
      'think', 'thought', 'mind', 'analyze', 'understand', 'logic', 'words',
      'communicate', 'clarity', 'perspective', 'idea', 'insight', 'pattern',
      'meaning', 'articulate', 'express', 'learn', 'teach', 'explain', 'see'
    ],
    weight: 1.0
  },
  aether: {
    keywords: [
      'soul', 'spirit', 'meaning', 'synchron', 'dream', 'archetype', 'initiation',
      'mystery', 'sacred', 'transcend', 'whole', 'integrate', 'unity', 'divine',
      'cosmic', 'universal', 'eternal', 'essence', 'being'
    ],
    weight: 0.8 // Slightly lower weight — aether is rare and often co-occurs
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCORING ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Score text against a pattern set
 */
function scorePatterns<T extends string>(
  text: string,
  patterns: Record<T, { keywords: string[], weight: number }>
): { winner: T; confidence: number; scores: Record<T, number> } {
  const normalizedText = text.toLowerCase();
  const scores = {} as Record<T, number>;

  for (const [key, pattern] of Object.entries(patterns) as [T, { keywords: string[], weight: number }][]) {
    let score = 0;
    for (const keyword of pattern.keywords) {
      // Use word boundary matching for more accurate detection
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi');
      const matches = normalizedText.match(regex);
      if (matches) {
        score += matches.length * pattern.weight;
      }
    }
    scores[key] = score;
  }

  // Find winner
  let maxScore = 0;
  let winner = Object.keys(patterns)[0] as T;
  for (const [key, score] of Object.entries(scores) as [T, number][]) {
    if (score > maxScore) {
      maxScore = score;
      winner = key;
    }
  }

  // Calculate confidence (0-1, capped)
  const totalScore = Object.values(scores).reduce((sum: number, s) => sum + (s as number), 0);
  const confidence = (totalScore as number) > 0
    ? Math.min(1, maxScore / Math.max((totalScore as number) * 0.5, 3)) // Require meaningful signal
    : 0;

  return { winner, confidence, scores };
}

/**
 * Detect which Spiralogic phase best matches the conversation
 */
function detectPhase(
  text: string
): { phase: OperationalPhase; confidence: number; matchedSignals: string[] } {
  const normalizedText = text.toLowerCase();
  const phaseScores: { phase: OperationalPhase; score: number; matched: string[] }[] = [];

  for (const phase of OPERATIONAL_PHASES) {
    let score = 0;
    const matched: string[] = [];

    // Score each signal category
    for (const [category, signals] of Object.entries(phase.signals)) {
      for (const signal of signals) {
        const signalLower = signal.toLowerCase();
        // Check for phrase match (more flexible than word boundary)
        if (normalizedText.includes(signalLower) ||
            // Also check for partial matches on longer phrases
            signalLower.split(' ').some(word => word.length > 4 && normalizedText.includes(word))) {
          score += 1;
          matched.push(`${category}:${signal}`);
        }
      }
    }

    phaseScores.push({ phase, score, matched });
  }

  // Sort by score descending
  phaseScores.sort((a, b) => b.score - a.score);

  const best = phaseScores[0];
  const secondBest = phaseScores[1];

  // Calculate confidence based on:
  // 1. Absolute number of matches (need at least 2 for any confidence)
  // 2. Margin over second-best (clearer winner = higher confidence)
  let confidence = 0;
  if (best.score >= 2) {
    const margin = secondBest ? (best.score - secondBest.score) / best.score : 1;
    confidence = Math.min(1, (best.score / 8) * (0.5 + margin * 0.5));
  }

  return {
    phase: best.phase,
    confidence,
    matchedSignals: best.matched.slice(0, 5) // Top 5 for logging
  };
}

/**
 * Detect dominant and secondary elements
 */
function detectElements(
  text: string
): {
  dominant: { element: SpiralogicElement; confidence: number };
  secondary: { element: SpiralogicElement; confidence: number } | null;
} {
  const result = scorePatterns(text, ELEMENT_PATTERNS);

  // Find second-highest
  const sortedScores = Object.entries(result.scores)
    .sort(([, a], [, b]) => (b as number) - (a as number)) as [SpiralogicElement, number][];

  const dominant = {
    element: result.winner,
    confidence: result.confidence
  };

  // Only include secondary if it has meaningful presence
  const secondary = sortedScores[1] && sortedScores[1][1] > 1
    ? {
        element: sortedScores[1][0],
        confidence: Math.min(0.8, sortedScores[1][1] / Math.max(result.scores[result.winner], 3))
      }
    : null;

  return { dominant, secondary };
}

/**
 * Detect nervous system state
 */
function detectNervousSystemState(text: string): 'regulated' | 'sympathetic' | 'dorsal' | 'mixed' {
  const result = scorePatterns(text, NERVOUS_SYSTEM_PATTERNS);

  // Check for mixed state (high sympathetic AND dorsal)
  if (result.scores.sympathetic > 2 && result.scores.dorsal > 2) {
    return 'mixed';
  }

  // Default to regulated if no strong signals
  if (result.confidence < 0.3) {
    return 'regulated';
  }

  return result.winner;
}

/**
 * Detect resource level
 */
function detectResourceLevel(text: string): 'depleted' | 'low' | 'adequate' | 'resourced' {
  const result = scorePatterns(text, RESOURCE_PATTERNS);

  // Default to adequate if no strong signals
  if (result.confidence < 0.3) {
    return 'adequate';
  }

  return result.winner;
}

/**
 * Detect integration need
 */
function detectIntegrationNeed(
  text: string
): 'rest' | 'action' | 'expression' | 'meaning' | 'connection' | 'boundary' {
  const result = scorePatterns(text, INTEGRATION_NEED_PATTERNS);

  // Default to meaning if no strong signals (safe default for MAIA)
  if (result.confidence < 0.3) {
    return 'meaning';
  }

  return result.winner;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Compute the member's spiral state from conversation turns.
 *
 * This is the core Pass 1 function — called BEFORE response generation
 * to give every Care Mode an anchor.
 */
export function computeMemberSpiralState(
  conversationTurns: ConversationTurn[],
  currentMessage: string
): MemberSpiralState {
  // Combine recent user messages for analysis
  // Weight current message most heavily, then recent turns
  const recentUserMessages = conversationTurns
    .filter(turn => turn.role === 'user')
    .slice(-5) // Last 5 user turns
    .map(turn => turn.content);

  // Build analysis text: current message weighted 3x, recent messages 1x each
  const analysisText = [
    currentMessage,
    currentMessage, // Weight current message more
    currentMessage,
    ...recentUserMessages
  ].join(' ');

  // Detect phase
  const phaseResult = detectPhase(analysisText);

  // Detect elements
  const elementResult = detectElements(analysisText);

  // Detect state flags
  const nervousSystemState = detectNervousSystemState(analysisText);
  const resourceLevel = detectResourceLevel(analysisText);
  const integrationNeed = detectIntegrationNeed(analysisText);

  return {
    primaryPhase: {
      phase: phaseResult.phase,
      confidence: phaseResult.confidence,
      matchedSignals: phaseResult.matchedSignals
    },
    dominantElement: elementResult.dominant,
    secondaryElement: elementResult.secondary,
    nervousSystemState,
    resourceLevel,
    integrationNeed,
    turnCount: conversationTurns.length,
    computedAt: Date.now()
  };
}

/**
 * Build a full SpiralSnapshot from MemberSpiralState.
 *
 * This adds trajectory and deep need inference based on the raw state.
 */
export function buildSpiralSnapshot(
  state: MemberSpiralState,
  careMode: string
): SpiralSnapshot {
  const phase = state.primaryPhase.phase;

  // Infer trajectory based on phase and state
  const whatsShifting = inferWhatsShifting(state);
  const whatsStuck = inferWhatsStuck(state);
  const whatsRipening = inferWhatsRipening(state);

  // Infer deep need from phase + state
  const deepNeed = phase.deepNeed;

  // Infer wisest move based on state flags
  const wisestMove = inferWisestMove(state, careMode);

  return {
    primaryPhase: {
      phase: state.primaryPhase.phase,
      confidence: state.primaryPhase.confidence,
      signals: state.primaryPhase.matchedSignals
    },
    secondaryInfluences: state.secondaryElement
      ? [{
          element: state.secondaryElement.element,
          strength: state.secondaryElement.confidence,
          how: `Secondary ${state.secondaryElement.element} presence`
        }]
      : [],
    shadowElement: {
      element: inferShadowElement(state),
      indicators: []
    },
    elementalBalance: {
      fire: state.dominantElement.element === 'fire' ? 70 : state.secondaryElement?.element === 'fire' ? 50 : 30,
      water: state.dominantElement.element === 'water' ? 70 : state.secondaryElement?.element === 'water' ? 50 : 30,
      earth: state.dominantElement.element === 'earth' ? 70 : state.secondaryElement?.element === 'earth' ? 50 : 30,
      air: state.dominantElement.element === 'air' ? 70 : state.secondaryElement?.element === 'air' ? 50 : 30
    },
    state: {
      nervous_system: state.nervousSystemState,
      resource_level: state.resourceLevel,
      integration_need: state.integrationNeed
    },
    trajectory: {
      whats_shifting: whatsShifting,
      whats_stuck: whatsStuck,
      whats_ripening: whatsRipening
    },
    spiralContext: {
      is_return: false, // Would need cross-session analysis
      return_insight: null,
      depth_level: inferDepthLevel(state)
    },
    deepNeed,
    wisestMove
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// INFERENCE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function inferWhatsShifting(state: MemberSpiralState): string {
  const phase = state.primaryPhase.phase;

  if (phase.refinement === 'emergence') {
    return `${phase.element} energy is emerging — new ${phase.essence.toLowerCase()}`;
  } else if (phase.refinement === 'deepening') {
    return `Deepening into ${phase.element} — ${phase.humanCapacity.toLowerCase()}`;
  } else {
    return `Moving toward ${phase.element} mastery — ${phase.gift.toLowerCase()}`;
  }
}

function inferWhatsStuck(state: MemberSpiralState): string | null {
  // If low resources or dorsal state, something is likely stuck
  if (state.resourceLevel === 'depleted' || state.nervousSystemState === 'dorsal') {
    return state.primaryPhase.phase.challenge;
  }

  // If integration need is rest or boundary, there may be stuckness
  if (state.integrationNeed === 'rest' || state.integrationNeed === 'boundary') {
    return `Energy may be blocked around ${state.integrationNeed}`;
  }

  return null;
}

function inferWhatsRipening(state: MemberSpiralState): string | null {
  const phase = state.primaryPhase.phase;

  // If resourced and regulated, something is likely ripening
  if (state.resourceLevel === 'resourced' || state.resourceLevel === 'adequate') {
    if (state.nervousSystemState === 'regulated') {
      return phase.gift;
    }
  }

  // If in mastery phase, the gift is ripening
  if (phase.refinement === 'mastery') {
    return phase.gift;
  }

  return null;
}

function inferShadowElement(state: MemberSpiralState): SpiralogicElement | null {
  // The shadow element is often the opposite of the dominant
  const opposites: Record<SpiralogicElement, SpiralogicElement> = {
    fire: 'water',
    water: 'fire',
    earth: 'air',
    air: 'earth',
    aether: 'aether' // Aether doesn't have a simple opposite
  };

  // Only suggest shadow if there's clear dominance
  if (state.dominantElement.confidence > 0.5) {
    return opposites[state.dominantElement.element];
  }

  return null;
}

function inferDepthLevel(
  state: MemberSpiralState
): 'first_pass' | 'second_octave' | 'deep_work' | 'integration' {
  const phase = state.primaryPhase.phase;

  // This would ideally use cross-session data to detect spiral returns
  // For now, use phase refinement as a proxy
  if (phase.refinement === 'emergence') {
    return 'first_pass';
  } else if (phase.refinement === 'deepening') {
    return 'deep_work';
  } else {
    return 'integration';
  }
}

function inferWisestMove(state: MemberSpiralState, careMode: string): string {
  const phase = state.primaryPhase.phase;

  // If depleted or in dorsal, prioritize safety and grounding
  if (state.resourceLevel === 'depleted' || state.nervousSystemState === 'dorsal') {
    return 'Ground and resource first — wisdom requires presence';
  }

  // If sympathetic, help regulate before diving deep
  if (state.nervousSystemState === 'sympathetic') {
    return 'Slow down and orient — the urgency may not be real';
  }

  // Otherwise, use phase-appropriate growth edge
  if (phase.growthEdgeMoves.length > 0) {
    return phase.growthEdgeMoves[0];
  }

  return 'Meet them where they are — one wise move, not ten';
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROMPT INJECTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a compact snapshot summary for prompt injection.
 *
 * This is what gets added to the system prompt so MAIA has the computed state.
 */
export function generateSnapshotPromptAddendum(snapshot: SpiralSnapshot): string {
  const phase = snapshot.primaryPhase.phase;
  const confidenceLabel = snapshot.primaryPhase.confidence > 0.6 ? 'clear'
    : snapshot.primaryPhase.confidence > 0.3 ? 'possible'
    : 'uncertain';

  return `
## SPIRAL SNAPSHOT (Computed Pass 1)

**Phase Read:** ${phase.name} (${phase.element}-${phase.refinement}) — ${confidenceLabel} confidence
**Essence:** ${phase.essence}
**Deep Need:** ${snapshot.deepNeed}

**State Flags:**
- Nervous system: ${snapshot.state.nervous_system}
- Resources: ${snapshot.state.resource_level}
- Integration need: ${snapshot.state.integration_need}

**Trajectory:**
- Shifting: ${snapshot.trajectory.whats_shifting}
${snapshot.trajectory.whats_stuck ? `- Stuck: ${snapshot.trajectory.whats_stuck}` : ''}
${snapshot.trajectory.whats_ripening ? `- Ripening: ${snapshot.trajectory.whats_ripening}` : ''}

**Wisest Move:** ${snapshot.wisestMove}

---
Use this snapshot to anchor your response. The phase read is ${confidenceLabel} — ${
  confidenceLabel === 'uncertain' ? 'stay open to other readings' :
  confidenceLabel === 'possible' ? 'hold it lightly' :
  'trust this orientation'
}.
`.trim();
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export {
  detectPhase,
  detectElements,
  detectNervousSystemState,
  detectResourceLevel,
  detectIntegrationNeed
};
