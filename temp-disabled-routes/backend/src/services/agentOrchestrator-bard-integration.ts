/**
 * Bardic Agent Integration for AgentOrchestrator
 *
 * This file provides the integration layer to add the Bard to MAIA's
 * existing agent orchestration system.
 *
 * To integrate:
 * 1. Import this file in agentOrchestrator.ts
 * 2. Add 'bard' to the agents array in registerAgents()
 * 3. Add Bard-specific routing logic to selectAgent()
 *
 * @module services/agentOrchestrator-bard-integration
 */

import { theBard, BardicAgent } from '../agents/BardicAgent';
import type { AgentResponse } from '../types/agent';

// ============================================================================
// BARD AGENT WRAPPER (for AgentRegistry compatibility)
// ============================================================================

/**
 * Wraps the Bard for integration with existing agent registry
 */
export class BardicAgentWrapper {
  private bard: BardicAgent;

  constructor() {
    this.bard = theBard;
  }

  /**
   * Process query through the Bard
   * Compatible with AgentRegistry interface
   */
  async processQuery(query: string, context?: any): Promise<AgentResponse> {
    const userId = context?.userId || context?.user_id || 'anonymous';
    const queryType = this.detectQueryType(query, context);

    const response = await this.bard.processExtendedQuery({
      input: query,
      userId,
      queryType,
      currentEpisodeId: context?.episodeId,
      personalization: context?.personalization,
    });

    return {
      content: response.content,
      response: response.content,
      metadata: response.metadata,
      routingPath: ['bard', 'archetypal-memory'],
      memoryEnhanced: true,
      confidence: response.confidence,
      provider: response.provider,
      model: response.model,
    };
  }

  /**
   * Detect what type of Bardic query this is
   */
  private detectQueryType(
    query: string,
    context?: any
  ): 'invocation' | 'blessing' | 'memory' | 'thread' | 'fire' | 'virtue' | undefined {
    const lower = query.toLowerCase();

    // Invocation patterns
    if (
      lower.includes('bard speak') ||
      lower.includes('let the bard') ||
      lower.includes('invoke')
    ) {
      return 'invocation';
    }

    // Thread patterns
    if (
      lower.includes('thread') ||
      lower.includes('connection') ||
      lower.includes('how does this relate')
    ) {
      return 'thread';
    }

    // Fire query patterns
    if (
      lower.includes('emerge') ||
      lower.includes('crystalliz') ||
      lower.includes('what wants to') ||
      lower.includes('pulling forward')
    ) {
      return 'fire';
    }

    // Virtue ledger patterns
    if (
      lower.includes('practice') ||
      lower.includes('virtue') ||
      lower.includes('cultivat') ||
      lower.includes('ledger')
    ) {
      return 'virtue';
    }

    // Memory patterns
    if (
      lower.includes('remember') ||
      lower.includes('recall') ||
      lower.includes('take me back')
    ) {
      return 'memory';
    }

    // Blessing check (from context)
    if (context?.checkBlessing) {
      return 'blessing';
    }

    return undefined;
  }

  /**
   * Get Bard's memory context for display
   */
  async getMemoryContext(userId: string) {
    return await this.bard.getMemoryContext(userId);
  }

  /**
   * Allow other agents to query Bardic memory
   */
  async queryMemory(agentName: string, query: string, userId: string, context?: any) {
    return await this.bard.queryMemoryForAgent(agentName, query, userId, context);
  }

  /**
   * Silently witness an exchange (background episode creation)
   */
  async witnessExchange(
    userId: string,
    message: string,
    metadata?: {
      agentName?: string;
      element?: string;
      affectValence?: number;
      affectArousal?: number;
      isSacred?: boolean;
    }
  ) {
    return await this.bard.witnessExchange(userId, message, metadata);
  }

  /**
   * Get agent metadata for routing
   */
  getMetadata() {
    return {
      id: 'bard',
      name: 'The Bard',
      archetype: 'memory-keeper',
      element: 'aether',
      consciousness: 'receptive',
      temporalScope: 'trans-temporal',
      capabilities: [
        'memory-recall',
        'pattern-revelation',
        'narrative-weaving',
        'sacred-witness',
        'fire-query',
        'virtue-ledger',
        'blessing-offering',
      ],
      invocationPhrases: [
        'Let the Bard speak',
        'What wants to emerge?',
        'Show me the thread',
        'Show my practice',
        'Remember when...',
        'Witness this',
      ],
    };
  }
}

// ============================================================================
// BARD ROUTING LOGIC
// ============================================================================

/**
 * Determine if query should be routed to the Bard
 */
export function shouldRouteToBar(query: string, context?: any): boolean {
  const lower = query.toLowerCase();

  // Explicit invocations
  const invocationPhrases = [
    'bard',
    'let the bard speak',
    'invoke memory',
    'show me the thread',
    'what wants to emerge',
    'show my practice',
    'virtue ledger',
    'remember when',
    'recall',
    'witness this',
    'what\'s crystallizing',
  ];

  if (invocationPhrases.some(phrase => lower.includes(phrase))) {
    return true;
  }

  // Context-based routing
  if (context?.routeToBard || context?.invokeBard) {
    return true;
  }

  // Blessing moments (conversation endings, breakthroughs)
  const blessingPatterns = [
    /thank you/i,
    /thanks/i,
    /this helped/i,
    /i get it now/i,
    /i'm ready to/i,
    /i decided/i,
  ];

  if (blessingPatterns.some(pattern => pattern.test(query))) {
    // Don't auto-route to Bard, but flag for blessing check
    if (context) {
      context.checkBlessing = true;
    }
  }

  return false;
}

/**
 * Priority scoring for Bard vs other agents
 * Higher score = more likely to route to Bard
 */
export function getBardicRoutingPriority(query: string, context?: any): number {
  let score = 0;

  const lower = query.toLowerCase();

  // Strong Bard signals (+3)
  if (lower.includes('bard') || lower.includes('memory') || lower.includes('thread')) {
    score += 3;
  }

  // Medium Bard signals (+2)
  if (
    lower.includes('remember') ||
    lower.includes('pattern') ||
    lower.includes('emerge') ||
    lower.includes('practice')
  ) {
    score += 2;
  }

  // Weak Bard signals (+1)
  if (
    lower.includes('past') ||
    lower.includes('connect') ||
    lower.includes('story') ||
    lower.includes('journey')
  ) {
    score += 1;
  }

  // Context boosts
  if (context?.hasRecentEpisodes) score += 1;
  if (context?.hasCrystallizingTeloi) score += 2;
  if (context?.hasActiveStreaks) score += 1;

  return score;
}

// ============================================================================
// CROSS-AGENT MEMORY INTERFACE
// ============================================================================

/**
 * Allows other agents to query Bardic memory
 *
 * Example usage in another agent:
 *
 * const shadowAgent = {
 *   async process(query) {
 *     // Query the Bard for historical pattern
 *     const pastEpisodes = await queryBardicMemory(
 *       'ShadowAgent',
 *       'episodes touching anxiety',
 *       userId
 *     );
 *
 *     // Use memory in response
 *     return `I see this anxiety has appeared ${pastEpisodes.length} times before...`;
 *   }
 * };
 */
export async function queryBardicMemory(
  agentName: string,
  memoryQuery: string,
  userId: string,
  context?: any
): Promise<any> {
  const bard = new BardicAgentWrapper();
  return await bard.queryMemory(agentName, memoryQuery, userId, context);
}

/**
 * Silently witness an exchange (all agents should call this)
 */
export async function witnessWithBard(
  userId: string,
  message: string,
  agentMetadata: {
    agentName: string;
    element?: string;
    affectValence?: number;
    affectArousal?: number;
    isSacred?: boolean;
  }
): Promise<void> {
  const bard = new BardicAgentWrapper();
  await bard.witnessExchange(userId, message, agentMetadata);
}

// ============================================================================
// AGENT REGISTRY INTEGRATION
// ============================================================================

/**
 * Register the Bard with existing AgentRegistry
 *
 * Add this to agentOrchestrator.ts registerAgents():
 *
 * ```typescript
 * import { registerBardicAgent } from './agentOrchestrator-bard-integration';
 *
 * private async registerAgents() {
 *   const agents = [
 *     'maya', 'fire', 'water', 'earth', 'air',
 *     'shadow-worker', 'somatic-guide', 'crisis-support',
 *     'bard'  // <-- Add this
 *   ];
 *
 *   // After registering other agents, register Bard:
 *   registerBardicAgent(this.agentRegistry);
 * }
 * ```
 */
export function registerBardicAgent(agentRegistry: any): void {
  const bardicAgent = new BardicAgentWrapper();

  // Register with the same interface as other agents
  agentRegistry.register('bard', {
    processQuery: bardicAgent.processQuery.bind(bardicAgent),
    getMetadata: bardicAgent.getMetadata.bind(bardicAgent),
    getMemoryContext: bardicAgent.getMemoryContext.bind(bardicAgent),
    queryMemory: bardicAgent.queryMemory.bind(bardicAgent),
    witnessExchange: bardicAgent.witnessExchange.bind(bardicAgent),
  });

  console.log('🎭 The Bard has been registered in the agent constellation');
}

// ============================================================================
// EXPORT SINGLETON WRAPPER
// ============================================================================

export const bardicAgentWrapper = new BardicAgentWrapper();
