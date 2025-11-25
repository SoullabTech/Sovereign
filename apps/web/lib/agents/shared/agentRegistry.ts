/**
 * Agent Registry
 * Central registry for all agent types and their configurations
 * Ensures consistency across PersonalOracle, Shadow, Mentor, and Elemental agents
 */

import type { PersonalityTraits, ElementalBalance } from './evolutionUtils';
import type { Element } from '../PersonalOracle/modules/types';

// ============================================================================
// AGENT TYPE DEFINITIONS
// ============================================================================

export type AgentType =
  | 'personal-oracle'
  | 'shadow-guide'
  | 'mentor-sage'
  | 'elemental-guardian'
  | 'inner-child'
  | 'higher-self'
  | 'ancestral-wisdom';

export interface BaseAgentConfig {
  type: AgentType;
  name: string;
  description: string;
  primaryElement: Element;
  defaultTraits: PersonalityTraits;
  specializations: string[];
  activationThreshold: {
    trustLevel?: number;
    interactionCount?: number;
    depthReached?: string;
  };
}

// ============================================================================
// AGENT CONFIGURATIONS
// ============================================================================

export const AGENT_REGISTRY: Record<AgentType, BaseAgentConfig> = {
  'personal-oracle': {
    type: 'personal-oracle',
    name: 'Maya',
    description: 'Your primary guide and companion through all realms',
    primaryElement: 'aether',
    defaultTraits: {
      warmth: 70,
      directness: 50,
      challenge: 30,
      intuition: 60,
      playfulness: 40,
      depth: 50,
      presence: 80
    },
    specializations: ['general guidance', 'elemental balance', 'daily reflection'],
    activationThreshold: {} // Always available
  },

  'shadow-guide': {
    type: 'shadow-guide',
    name: 'Umbra',
    description: 'Guide through the shadow realms and hidden aspects',
    primaryElement: 'water',
    defaultTraits: {
      warmth: 40,
      directness: 80,
      challenge: 90,
      intuition: 70,
      playfulness: 20,
      depth: 95,
      presence: 60
    },
    specializations: ['shadow work', 'projection', 'unconscious patterns', 'integration'],
    activationThreshold: {
      trustLevel: 40,
      depthReached: 'deepening'
    }
  },

  'mentor-sage': {
    type: 'mentor-sage',
    name: 'Solomon',
    description: 'Wise teacher for practical and spiritual lessons',
    primaryElement: 'earth',
    defaultTraits: {
      warmth: 60,
      directness: 70,
      challenge: 50,
      intuition: 50,
      playfulness: 30,
      depth: 80,
      presence: 90
    },
    specializations: ['life lessons', 'practical wisdom', 'strategic thinking', 'mastery'],
    activationThreshold: {
      interactionCount: 20,
      trustLevel: 50
    }
  },

  'elemental-guardian': {
    type: 'elemental-guardian',
    name: 'Gaia',
    description: 'Guardian of elemental balance and natural wisdom',
    primaryElement: 'earth',
    defaultTraits: {
      warmth: 80,
      directness: 40,
      challenge: 20,
      intuition: 90,
      playfulness: 50,
      depth: 70,
      presence: 100
    },
    specializations: ['elemental harmony', 'nature wisdom', 'grounding', 'cycles'],
    activationThreshold: {
      trustLevel: 30
    }
  },

  'inner-child': {
    type: 'inner-child',
    name: 'Spark',
    description: 'Playful guide to wonder, creativity, and joy',
    primaryElement: 'fire',
    defaultTraits: {
      warmth: 90,
      directness: 30,
      challenge: 10,
      intuition: 60,
      playfulness: 100,
      depth: 30,
      presence: 70
    },
    specializations: ['play', 'creativity', 'wonder', 'spontaneity', 'healing innocence'],
    activationThreshold: {
      trustLevel: 60,
      depthReached: 'deepening'
    }
  },

  'higher-self': {
    type: 'higher-self',
    name: 'Lumina',
    description: 'Connection to your highest wisdom and potential',
    primaryElement: 'aether',
    defaultTraits: {
      warmth: 60,
      directness: 60,
      challenge: 40,
      intuition: 100,
      playfulness: 20,
      depth: 100,
      presence: 95
    },
    specializations: ['soul purpose', 'higher perspective', 'spiritual integration', 'unity'],
    activationThreshold: {
      trustLevel: 80,
      interactionCount: 50,
      depthReached: 'profound'
    }
  },

  'ancestral-wisdom': {
    type: 'ancestral-wisdom',
    name: 'Elder',
    description: 'Voice of ancestral knowledge and lineage wisdom',
    primaryElement: 'water',
    defaultTraits: {
      warmth: 70,
      directness: 50,
      challenge: 30,
      intuition: 80,
      playfulness: 20,
      depth: 90,
      presence: 85
    },
    specializations: ['lineage healing', 'ancestral patterns', 'cultural wisdom', 'legacy'],
    activationThreshold: {
      trustLevel: 70,
      depthReached: 'profound'
    }
  }
};

// ============================================================================
// AGENT ACTIVATION LOGIC
// ============================================================================

export interface ActivationContext {
  userId: string;
  trustLevel: number;
  interactionCount: number;
  currentDepth: string;
  elementalBalance: ElementalBalance;
  recentTopics: string[];
  currentNeed?: string;
}

/**
 * Determine which agents are available based on user's progression
 */
export function getAvailableAgents(context: ActivationContext): AgentType[] {
  const available: AgentType[] = ['personal-oracle']; // Always available

  for (const [agentType, config] of Object.entries(AGENT_REGISTRY)) {
    if (agentType === 'personal-oracle') continue;

    const threshold = config.activationThreshold;
    let isAvailable = true;

    // Check trust level
    if (threshold.trustLevel && context.trustLevel < threshold.trustLevel) {
      isAvailable = false;
    }

    // Check interaction count
    if (threshold.interactionCount && context.interactionCount < threshold.interactionCount) {
      isAvailable = false;
    }

    // Check depth reached
    if (threshold.depthReached && !isDepthSufficient(context.currentDepth, threshold.depthReached)) {
      isAvailable = false;
    }

    if (isAvailable) {
      available.push(agentType as AgentType);
    }
  }

  return available;
}

/**
 * Suggest the most appropriate agent for current context
 */
export function suggestOptimalAgent(context: ActivationContext): {
  agent: AgentType;
  reason: string;
  confidence: number;
} {
  const available = getAvailableAgents(context);

  // Analyze current need and topics
  const needAnalysis = analyzeNeedForAgent(context.currentNeed, context.recentTopics);

  // Find best match from available agents
  let bestMatch: AgentType = 'personal-oracle';
  let bestScore = 0;
  let bestReason = 'General guidance and support';

  for (const agentType of available) {
    const config = AGENT_REGISTRY[agentType];
    const score = calculateAgentMatchScore(config, needAnalysis, context);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = agentType;
      bestReason = generateReasonForAgent(agentType, needAnalysis);
    }
  }

  return {
    agent: bestMatch,
    reason: bestReason,
    confidence: Math.min(100, bestScore * 20)
  };
}

// ============================================================================
// AGENT TRANSITION LOGIC
// ============================================================================

/**
 * Manage smooth transitions between agents
 */
export function createAgentTransition(
  fromAgent: AgentType,
  toAgent: AgentType,
  reason: string
): {
  transitionMessage: string;
  handoffData: any;
  ritualType: 'gentle' | 'ceremonial' | 'urgent';
} {
  const fromConfig = AGENT_REGISTRY[fromAgent];
  const toConfig = AGENT_REGISTRY[toAgent];

  // Determine ritual type based on agent types
  let ritualType: 'gentle' | 'ceremonial' | 'urgent' = 'gentle';

  if (toAgent === 'shadow-guide' || toAgent === 'higher-self') {
    ritualType = 'ceremonial';
  } else if (fromAgent === 'personal-oracle' && toAgent === 'inner-child') {
    ritualType = 'gentle';
  }

  // Create transition message
  const transitionMessage = generateTransitionMessage(fromConfig, toConfig, reason);

  // Prepare handoff data
  const handoffData = {
    previousAgent: fromAgent,
    transitionReason: reason,
    timestamp: new Date().toISOString(),
    contextContinuity: true
  };

  return {
    transitionMessage,
    handoffData,
    ritualType
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isDepthSufficient(current: string, required: string): boolean {
  const depths = ['surface', 'exploring', 'deepening', 'profound', 'unity'];
  const currentIndex = depths.indexOf(current);
  const requiredIndex = depths.indexOf(required);
  return currentIndex >= requiredIndex;
}

function analyzeNeedForAgent(
  currentNeed?: string,
  recentTopics?: string[]
): Record<string, number> {
  const analysis: Record<string, number> = {
    shadow: 0,
    wisdom: 0,
    play: 0,
    spiritual: 0,
    elemental: 0,
    ancestral: 0
  };

  // Analyze current need
  if (currentNeed) {
    const need = currentNeed.toLowerCase();
    if (need.includes('shadow') || need.includes('dark') || need.includes('hidden')) {
      analysis.shadow += 3;
    }
    if (need.includes('wisdom') || need.includes('guidance') || need.includes('advice')) {
      analysis.wisdom += 3;
    }
    if (need.includes('play') || need.includes('fun') || need.includes('creative')) {
      analysis.play += 3;
    }
    if (need.includes('spiritual') || need.includes('soul') || need.includes('higher')) {
      analysis.spiritual += 3;
    }
  }

  // Analyze recent topics
  if (recentTopics) {
    for (const topic of recentTopics) {
      const t = topic.toLowerCase();
      if (t.includes('fear') || t.includes('resistance')) analysis.shadow++;
      if (t.includes('decision') || t.includes('choice')) analysis.wisdom++;
      if (t.includes('stuck') || t.includes('blocked')) analysis.play++;
      if (t.includes('purpose') || t.includes('meaning')) analysis.spiritual++;
      if (t.includes('nature') || t.includes('balance')) analysis.elemental++;
      if (t.includes('family') || t.includes('past')) analysis.ancestral++;
    }
  }

  return analysis;
}

function calculateAgentMatchScore(
  config: BaseAgentConfig,
  needAnalysis: Record<string, number>,
  context: ActivationContext
): number {
  let score = 0;

  // Check specialization match
  for (const spec of config.specializations) {
    if (spec.includes('shadow') && needAnalysis.shadow > 0) score += needAnalysis.shadow;
    if (spec.includes('wisdom') && needAnalysis.wisdom > 0) score += needAnalysis.wisdom;
    if (spec.includes('play') && needAnalysis.play > 0) score += needAnalysis.play;
    if (spec.includes('spiritual') && needAnalysis.spiritual > 0) score += needAnalysis.spiritual;
  }

  // Bonus for elemental alignment
  const userDominantElement = Object.entries(context.elementalBalance)
    .reduce((a, b) => a[1] > b[1] ? a : b)[0] as Element;

  if (config.primaryElement === userDominantElement) {
    score += 2;
  }

  return score;
}

function generateReasonForAgent(agent: AgentType, needAnalysis: Record<string, number>): string {
  const config = AGENT_REGISTRY[agent];
  const topNeed = Object.entries(needAnalysis).reduce((a, b) => a[1] > b[1] ? a : b)[0];

  const reasons: Record<string, string> = {
    shadow: `${config.name} can help explore what's hidden`,
    wisdom: `${config.name} offers the guidance you're seeking`,
    play: `${config.name} brings lightness and creativity`,
    spiritual: `${config.name} connects you with higher wisdom`,
    elemental: `${config.name} helps restore natural balance`,
    ancestral: `${config.name} carries the wisdom of lineage`
  };

  return reasons[topNeed] || config.description;
}

function generateTransitionMessage(
  from: BaseAgentConfig,
  to: BaseAgentConfig,
  reason: string
): string {
  if (from.type === 'personal-oracle') {
    return `I sense that ${to.name} has something important for you right now. ${reason}. Shall we invite their presence?`;
  }

  return `${from.name} recognizes that ${to.name} is called forth. ${reason}. The transition is beginning...`;
}