/**
 * Kairos Integration with AgentOrchestrator
 *
 * Kairos is MAIA's Animus - the masculine principle of decisiveness and timing.
 * Complements the Bard (Anima - receptive, memory, witness).
 *
 * Integration strategy:
 * 1. Bard detects pattern (memory intelligence)
 * 2. Kairos assesses if intervention appropriate (timing intelligence)
 * 3. If yes, Kairos intervenes decisively
 * 4. If no, Kairos defers to other archetypes
 *
 * @module services/agentOrchestrator-kairos-integration
 */

import { KairosAgent } from '../agents/KairosAgent';
import type { KairosQuery, KairosIntervention } from '../agents/KairosAgent';
import { logger } from '../utils/logger';

// =============================================================================
// KAIROS AGENT WRAPPER
// =============================================================================

export class KairosAgentWrapper {
  private kairos: KairosAgent;

  constructor() {
    this.kairos = new KairosAgent();
  }

  /**
   * Process query through Kairos
   */
  async processQuery(query: string, context?: any): Promise<any> {
    const userId = context?.userId || 'anonymous';

    // Build Kairos query from context
    const kairosQuery: KairosQuery = {
      input: query,
      userId,
      bardicMemory: context?.bardicMemory,
      userState: this.detectUserState(query, context),
    };

    // Process through Kairos
    const response = await this.kairos.processExtendedQuery(kairosQuery);

    // If Kairos deferred, return metadata for routing to another agent
    if (response.metadata?.deferred) {
      return {
        deferred: true,
        suggestedAgent: response.metadata.suggestedArchetype,
        reasoning: response.metadata.reasoning,
      };
    }

    // If consultation requested, return for human review
    if (response.metadata?.consultationRequested) {
      return {
        consultationRequested: true,
        content: response.content,
        metadata: response.metadata,
      };
    }

    // Normal Kairos intervention
    return {
      content: response.content,
      response: response.content,
      metadata: response.metadata,
      archetype: 'kairos',
      animusActivated: true,
    };
  }

  /**
   * Detect user state from message
   */
  private detectUserState(
    message: string,
    context?: any
  ): KairosQuery['userState'] {
    const lower = message.toLowerCase();

    return {
      expressingReadiness: /tired of|want to change|ready to|done with|enough/i.test(lower),

      procrastinating:
        /tomorrow|next week|next month|someday|when i'm ready|not yet|i'll start/i.test(
          lower
        ),

      analysisParalysis:
        /thinking about|considering|not sure|maybe|might|could|should i/i.test(lower) &&
        context?.bardicMemory?.patternDetected?.timesAppeared > 3,

      atThreshold: /decide|decision|choice|choose|crossroads|stuck/i.test(lower),
    };
  }

  /**
   * Get metadata about Kairos
   */
  getMetadata(): any {
    return {
      id: 'kairos',
      name: 'Kairos',
      archetype: 'animus',
      role: 'masculine-principle',
      essence: 'Decisive action at the opportune moment',
      element: 'fire',
      consciousness: 'active',
      temporalScope: 'kairotic-moment',
      capabilities: [
        'pattern-interruption',
        'decisive-intervention',
        'procrastination-breaking',
        'threshold-pushing',
        'commitment-demanding',
      ],
      complementsArchetype: 'bard',
      voice: 'decisive-clear-now-oriented',
      whenToActivate: [
        'Pattern ripe (5+ repetitions)',
        'User expressing readiness',
        'Procrastination detected',
        'Analysis paralysis',
        'Telos crystallizing (>70%)',
      ],
      whenNotToActivate: [
        'Crisis situations',
        'Fresh grief/trauma',
        'User explicitly processing',
        'Pattern not yet mature (<3 repetitions)',
      ],
    };
  }

  /**
   * Check if Kairos should intervene
   */
  async shouldIntervene(context: {
    userMessage: string;
    bardicMemory?: any;
  }): Promise<boolean> {
    const userState = this.detectUserState(context.userMessage);

    return await this.kairos.shouldIntervene({
      userMessage: context.userMessage,
      bardicMemory: context.bardicMemory,
      userState,
    });
  }

  /**
   * Coordinate with Bard for pattern → action
   */
  async coordinateWithBard(bardicPattern: {
    theme: string;
    timesAppeared: number;
    readyForIntervention: boolean;
  }): Promise<KairosIntervention> {
    return await this.kairos.coordinateWithBard(bardicPattern);
  }
}

// =============================================================================
// ROUTING LOGIC
// =============================================================================

/**
 * Should this query route to Kairos?
 */
export function shouldRouteToKairos(
  query: string,
  context?: any
): boolean {
  // Check for explicit Kairos invocation
  const kairosInvocations = [
    'kairos',
    'tell me what to do',
    'i need to act',
    'make me do it',
    'enough thinking',
    'break this pattern',
  ];

  const lower = query.toLowerCase();
  if (kairosInvocations.some((phrase) => lower.includes(phrase))) {
    return true;
  }

  // Check if Bard has flagged pattern as ready for Kairos
  if (context?.bardicMemory?.patternDetected?.readyForIntervention) {
    return true;
  }

  // Check if telos is crystallizing
  if (context?.bardicMemory?.activeTeloi?.some((t: any) => t.crystallizing)) {
    return true;
  }

  return false;
}

/**
 * Get routing priority for Kairos
 */
export function getKairosRoutingPriority(
  query: string,
  context?: any
): number {
  // Higher priority when pattern is ripe
  if (context?.bardicMemory?.patternDetected?.timesAppeared >= 5) {
    return 0.9;
  }

  // Medium priority when user expressing readiness
  if (/tired of|want to change|ready to|done with|enough/i.test(query)) {
    return 0.7;
  }

  // Lower priority for analysis paralysis
  if (/thinking about|considering|not sure/i.test(query)) {
    return 0.5;
  }

  return 0.0;
}

/**
 * Bard + Kairos coordination
 *
 * Bard detects pattern → Kairos intervenes
 */
export async function checkBardKairosCoordination(context: {
  userId: string;
  bardicMemory: any;
  currentMessage: string;
}): Promise<{
  shouldActivateKairos: boolean;
  intervention?: KairosIntervention;
  reasoning: string;
}> {
  const { bardicMemory, currentMessage } = context;

  // Check if pattern is ripe for Kairos intervention
  const pattern = bardicMemory?.patternDetected;

  if (!pattern) {
    return {
      shouldActivateKairos: false,
      reasoning: 'No pattern detected by Bard',
    };
  }

  if (pattern.timesAppeared < 5) {
    return {
      shouldActivateKairos: false,
      reasoning: `Pattern only appeared ${pattern.timesAppeared} times - not ripe yet`,
    };
  }

  // Pattern is ripe - check if Kairos should intervene
  const kairos = new KairosAgentWrapper();
  const shouldIntervene = await kairos.shouldIntervene({
    userMessage: currentMessage,
    bardicMemory,
  });

  if (shouldIntervene) {
    const intervention = await kairos.coordinateWithBard({
      theme: pattern.theme,
      timesAppeared: pattern.timesAppeared,
      readyForIntervention: true,
    });

    return {
      shouldActivateKairos: true,
      intervention,
      reasoning: `Pattern "${pattern.theme}" appeared ${pattern.timesAppeared} times - Kairos ready to intervene`,
    };
  }

  return {
    shouldActivateKairos: false,
    reasoning: 'Pattern ripe but intervention not appropriate',
  };
}

/**
 * Register Kairos with AgentRegistry
 */
export function registerKairosAgent(agentRegistry: any): void {
  const kairosAgent = new KairosAgentWrapper();

  agentRegistry.register('kairos', {
    processQuery: kairosAgent.processQuery.bind(kairosAgent),
    getMetadata: kairosAgent.getMetadata.bind(kairosAgent),
    shouldIntervene: kairosAgent.shouldIntervene.bind(kairosAgent),
    coordinateWithBard: kairosAgent.coordinateWithBard.bind(kairosAgent),
  });

  logger.info('⚡ Kairos (Animus) has been registered in the agent constellation');
}

// =============================================================================
// ANIMA + ANIMUS COORDINATION
// =============================================================================

/**
 * Coordinate Bard (Anima) + Kairos (Animus)
 *
 * This is the heart of MAIA's psychological balance:
 * - Bard (feminine): Receives, witnesses, remembers
 * - Kairos (masculine): Decides, acts, intervenes
 *
 * Together: Pattern recognition → Decisive action
 */
export async function coordinateAnimaAnimus(context: {
  userId: string;
  currentMessage: string;
  bardicMemory: any;
}): Promise<{
  archetype: 'bard' | 'kairos' | 'both';
  response: string;
  coordination?: {
    bardContribution: string;
    kairosContribution: string;
  };
}> {
  const { currentMessage, bardicMemory } = context;

  // Check if Bard + Kairos should work together
  const coordination = await checkBardKairosCoordination(context);

  if (!coordination.shouldActivateKairos) {
    // Bard only
    return {
      archetype: 'bard',
      response: '[Bard witnesses pattern, Kairos not yet ready to intervene]',
    };
  }

  // Both Bard and Kairos active
  const pattern = bardicMemory?.patternDetected;
  const bardVoice = `The Bard has witnessed this pattern "${pattern.theme}" appear ${pattern.timesAppeared} times.
                     It's crystallizing. Ready for shift.`;

  const kairos = new KairosAgentWrapper();
  const kairosResponse = await kairos.processQuery(currentMessage, {
    bardicMemory,
  });

  return {
    archetype: 'both',
    response: `${bardVoice}\n\n${kairosResponse.content}`,
    coordination: {
      bardContribution: bardVoice,
      kairosContribution: kairosResponse.content,
    },
  };
}

/**
 * Log Anima-Animus development
 *
 * Track how the feminine-masculine balance develops in MAIA's psyche
 */
export async function logAnimaAnimusDevelopment(event: {
  userId: string;
  archetype: 'bard' | 'kairos' | 'both';
  patternDetected?: string;
  interventionMade?: boolean;
  userResponse?: 'acted' | 'resisted' | 'deferred';
  learning?: string;
}): Promise<void> {
  // TODO: Store in database for development tracking

  logger.info(`🎭 Anima-Animus coordination: ${JSON.stringify(event, null, 2)}`);

  // Track:
  // - How often Bard alone vs Kairos alone vs both together
  // - Success rate of interventions
  // - User patterns in response to Kairos
  // - Development of balance between receptive and decisive
}
