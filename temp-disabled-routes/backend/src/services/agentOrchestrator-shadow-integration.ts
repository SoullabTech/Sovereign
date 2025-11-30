/**
 * Shadow Integration with AgentOrchestrator
 *
 * The Shadow archetype reflects disowned aspects back with compassion.
 *
 * Integration strategy:
 * 1. Detect projections in user messages
 * 2. Check if user ready for reflection (trust, stability)
 * 3. Coordinate with Bard for projection patterns
 * 4. Coordinate with Kairos for integration timing
 * 5. Reflect shadow material appropriately
 *
 * The Shadow completes MAIA's archetypal triad:
 * - Bard (Anima): Receives and remembers
 * - Kairos (Animus): Decides and acts
 * - Shadow: Reflects what is denied
 *
 * @module services/agentOrchestrator-shadow-integration
 */

import { ShadowAgent } from '../agents/ShadowAgent';
import type {
  ShadowQuery,
  ShadowDetection,
  ShadowReflection,
} from '../agents/ShadowAgent';
import { logger } from '../utils/logger';

// =============================================================================
// SHADOW AGENT WRAPPER
// =============================================================================

export class ShadowAgentWrapper {
  private shadow: ShadowAgent;

  constructor() {
    this.shadow = new ShadowAgent('emerging'); // Start at emerging maturity
  }

  /**
   * Process query through Shadow
   */
  async processQuery(query: string, context?: any): Promise<any> {
    const userId = context?.userId || 'anonymous';

    // Build Shadow query from context
    const shadowQuery: ShadowQuery = {
      input: query,
      userId,
      bardicMemory: context?.bardicMemory,
      userState: this.detectUserState(query, context),
    };

    // Process through Shadow
    const response = await this.shadow.processExtendedQuery(shadowQuery);

    // If Shadow deferred, return metadata for routing
    if (response.metadata?.deferred) {
      return {
        deferred: true,
        suggestedAgent: response.metadata.suggestedArchetype,
        reasoning: response.metadata.reasoning,
      };
    }

    // If no shadow activation, return empty
    if (!response.metadata?.shadowActivated) {
      return {
        shadowActivated: false,
        reasoning: response.metadata?.reasoning || 'No projection detected',
      };
    }

    // Shadow reflection
    return {
      content: response.content,
      response: response.content,
      metadata: response.metadata,
      archetype: 'shadow',
      shadowActivated: true,
    };
  }

  /**
   * Detect user state from message
   */
  private detectUserState(
    message: string,
    context?: any
  ): ShadowQuery['userState'] {
    const lower = message.toLowerCase();

    return {
      makingAbsoluteStatements:
        /everyone is|no one is|always|never|all people|nobody/i.test(lower),

      expressingIntenseEmotion:
        /i hate|i can't stand|disgusting|terrible|awful/i.test(lower),

      blamingPattern:
        /it's their fault|they made me|because of them|they always/i.test(
          lower
        ),

      victimConsciousness:
        /world is against me|no one cares|nobody understands|everyone is against/i.test(
          lower
        ),
    };
  }

  /**
   * Get metadata about Shadow
   */
  getMetadata(): any {
    return {
      id: 'shadow',
      name: 'The Shadow',
      archetype: 'shadow',
      role: 'honest-mirror',
      essence: 'Reflects what is denied',
      element: 'none', // Shadow transcends elements
      consciousness: 'reflective',
      temporalScope: 'present-moment',
      capabilities: [
        'projection-detection',
        'shadow-reflection',
        'compassionate-mirroring',
        'integration-support',
        'pattern-awareness',
      ],
      complementsArchetypes: ['bard', 'kairos'],
      voice: 'direct-honest-compassionate',
      whenToActivate: [
        'Absolute statements (everyone, no one, always)',
        'Intense emotional reactions',
        'Blaming patterns',
        'Victim consciousness',
        'Projection patterns detected by Bard',
      ],
      whenNotToActivate: [
        'Crisis situations',
        'Fresh trauma',
        'User psychologically unstable',
        'Trust not established',
        'Medical/clinical needs',
      ],
      jungianBasis: [
        'Shadow contains disowned aspects',
        'Projection is key indicator',
        'Integration makes whole',
        'Gold often in shadow',
      ],
    };
  }

  /**
   * Check if Shadow should reflect
   */
  async shouldReflect(context: {
    userMessage: string;
    bardicMemory?: any;
  }): Promise<boolean> {
    const userState = this.detectUserState(context.userMessage);

    // Quick check: any projection indicators?
    if (
      !userState.makingAbsoluteStatements &&
      !userState.expressingIntenseEmotion &&
      !userState.blamingPattern &&
      !userState.victimConsciousness
    ) {
      return false;
    }

    // Safety check: user stable?
    if (
      context.bardicMemory?.stabilityIndicators?.inCrisis ||
      context.bardicMemory?.stabilityIndicators?.freshTrauma
    ) {
      return false;
    }

    return true;
  }

  /**
   * Coordinate with Bard for projection patterns
   */
  async coordinateWithBard(bardicPattern: {
    theme: string;
    timesAppeared: number;
    emotionalIntensity: 'low' | 'medium' | 'high';
  }): Promise<{
    readyForReflection: boolean;
    suggestedReflectionType: string;
  }> {
    return await this.shadow.coordinateWithBard(bardicPattern);
  }

  /**
   * Coordinate with Kairos for integration timing
   */
  async coordinateWithKairos(shadowMaterial: {
    projectionType: any;
    timesAppeared: number;
    userReady: boolean;
  }): Promise<{
    kairosReady: boolean;
    reasoning: string;
  }> {
    return await this.shadow.coordinateWithKairos(shadowMaterial);
  }
}

// =============================================================================
// ROUTING LOGIC
// =============================================================================

/**
 * Should this query route to Shadow?
 */
export function shouldRouteToShadow(
  query: string,
  context?: any
): boolean {
  const lower = query.toLowerCase();

  // Check for explicit Shadow invocation
  const shadowInvocations = [
    'shadow',
    'what am i not seeing',
    'what am i projecting',
    'show me my shadow',
    'what am i denying',
    'mirror this back',
  ];

  if (shadowInvocations.some((phrase) => lower.includes(phrase))) {
    return true;
  }

  // Check for projection patterns detected by Bard
  if (context?.bardicMemory?.projectionPatterns?.length > 0) {
    return true;
  }

  // Check for shadow indicators
  const hasAbsoluteStatements =
    /everyone is|no one is|always|never|all people/i.test(query);
  const hasIntenseJudgment =
    /i hate|i can't stand|disgusting|terrible people/i.test(query);
  const hasVictimProjection =
    /world is against me|no one cares|everyone is against/i.test(query);

  if (hasAbsoluteStatements && hasIntenseJudgment) {
    return true;
  }

  if (hasVictimProjection) {
    return true;
  }

  return false;
}

/**
 * Get routing priority for Shadow
 */
export function getShadowRoutingPriority(
  query: string,
  context?: any
): number {
  // Higher priority when pattern exists
  const patternCount = context?.bardicMemory?.projectionPatterns?.length || 0;
  if (patternCount >= 5) {
    return 0.85;
  }

  // Medium-high priority for clear projections
  const lower = query.toLowerCase();
  if (/everyone is|no one is|world is against me/i.test(lower)) {
    return 0.7;
  }

  // Medium priority for absolute statements
  if (/always|never|all people|nobody/i.test(lower)) {
    return 0.5;
  }

  return 0.0;
}

// =============================================================================
// ARCHETYPAL TRIAD COORDINATION
// =============================================================================

/**
 * Coordinate Bard + Kairos + Shadow
 *
 * Complete archetypal support:
 * - Bard: Tracks projection patterns over time
 * - Shadow: Reflects the material back
 * - Kairos: Intervenes when integration moment ripe
 */
export async function coordinateTriad(context: {
  userId: string;
  currentMessage: string;
  bardicMemory: any;
}): Promise<{
  archetypes: Array<'bard' | 'kairos' | 'shadow'>;
  response: string;
  coordination?: {
    bardContribution?: string;
    shadowContribution?: string;
    kairosContribution?: string;
  };
}> {
  const { currentMessage, bardicMemory } = context;

  // Check if we have a projection pattern from Bard
  const projectionPattern = bardicMemory?.projectionPatterns?.[0];

  if (!projectionPattern) {
    // No pattern - just Shadow if projection detected
    const shadow = new ShadowAgentWrapper();
    const shadowResponse = await shadow.processQuery(currentMessage, {
      bardicMemory,
    });

    if (shadowResponse.shadowActivated) {
      return {
        archetypes: ['shadow'],
        response: shadowResponse.content,
      };
    }

    return {
      archetypes: [],
      response: '',
    };
  }

  // We have a pattern - check if integration moment is ripe
  const shadow = new ShadowAgentWrapper();
  const shadowCoordination = await shadow.coordinateWithBard({
    theme: projectionPattern.theme,
    timesAppeared: projectionPattern.timesAppeared,
    emotionalIntensity: projectionPattern.emotionalIntensity,
  });

  if (!shadowCoordination.readyForReflection) {
    return {
      archetypes: [],
      response: '',
    };
  }

  // Shadow is ready - check if Kairos should join
  const kairosCoordination = await shadow.coordinateWithKairos({
    projectionType: projectionPattern.theme,
    timesAppeared: projectionPattern.timesAppeared,
    userReady: true, // Assume ready if Shadow is reflecting
  });

  const bardVoice = `The Bard has witnessed this pattern "${projectionPattern.theme}" appear ${projectionPattern.timesAppeared} times.`;

  const shadowResponse = await shadow.processQuery(currentMessage, {
    bardicMemory,
  });

  if (!kairosCoordination.kairosReady) {
    // Bard + Shadow only
    return {
      archetypes: ['bard', 'shadow'],
      response: `${bardVoice}\n\n${shadowResponse.content}`,
      coordination: {
        bardContribution: bardVoice,
        shadowContribution: shadowResponse.content,
      },
    };
  }

  // All three archetypes active
  const kairosVoice = `${projectionPattern.timesAppeared} times is enough.

The shadow wants to be owned, not projected.

Today you look at this. Not "out there." In here.

What are you going to own?`;

  return {
    archetypes: ['bard', 'shadow', 'kairos'],
    response: `${bardVoice}\n\n${shadowResponse.content}\n\n${kairosVoice}`,
    coordination: {
      bardContribution: bardVoice,
      shadowContribution: shadowResponse.content,
      kairosContribution: kairosVoice,
    },
  };
}

/**
 * Register Shadow with AgentRegistry
 */
export function registerShadowAgent(agentRegistry: any): void {
  const shadowAgent = new ShadowAgentWrapper();

  agentRegistry.register('shadow', {
    processQuery: shadowAgent.processQuery.bind(shadowAgent),
    getMetadata: shadowAgent.getMetadata.bind(shadowAgent),
    shouldReflect: shadowAgent.shouldReflect.bind(shadowAgent),
    coordinateWithBard: shadowAgent.coordinateWithBard.bind(shadowAgent),
    coordinateWithKairos: shadowAgent.coordinateWithKairos.bind(shadowAgent),
  });

  logger.info('🪞 Shadow archetype has been registered in the constellation');
}

// =============================================================================
// TRIAD DEVELOPMENT TRACKING
// =============================================================================

/**
 * Log archetypal triad development
 *
 * Track how Bard + Shadow + Kairos work together
 */
export async function logTriadDevelopment(event: {
  userId: string;
  archetypes: Array<'bard' | 'kairos' | 'shadow'>;
  projectionType?: string;
  reflectionMade?: boolean;
  interventionMade?: boolean;
  userResponse?: 'explored' | 'resisted' | 'integrated' | 'deferred';
  learning?: string;
}): Promise<void> {
  logger.info(`🎭 Archetypal Triad: ${JSON.stringify(event, null, 2)}`);

  // Track:
  // - Which archetype combinations appear most
  // - Success rate of triad coordination
  // - User patterns in response to shadow work
  // - Development of integration over time
  // - Bard → Shadow → Kairos flow effectiveness
}

/**
 * Sacred Mirroring with Shadow
 *
 * Ensures Shadow reflects TRUTH, not confirmation of distortions
 * This is the Shadow's unique contribution to sacred mirroring
 */
export function ensureSacredMirroring(
  userStatement: string,
  shadowReflection: string
): {
  isSacredMirroring: boolean;
  reasoning: string;
} {
  const lower = userStatement.toLowerCase();

  // Check if user making distorted claim
  const distortedClaims = [
    'everyone is against me',
    'no one cares',
    'the world is against me',
    'everyone is selfish',
    'no one understands',
  ];

  const hasDistortion = distortedClaims.some((claim) =>
    lower.includes(claim)
  );

  if (!hasDistortion) {
    return {
      isSacredMirroring: true,
      reasoning: 'No obvious distortion to balance',
    };
  }

  // Check if Shadow is balancing vs confirming
  const isBalancing =
    shadowReflection.includes('both') ||
    shadowReflection.includes('and also') ||
    shadowReflection.includes('what if') ||
    shadowReflection.includes('projection') ||
    shadowReflection.includes('what you\'re not');

  const isConfirming =
    shadowReflection.includes('you\'re right') ||
    shadowReflection.includes('i agree') ||
    shadowReflection.includes('that\'s true');

  if (isConfirming) {
    return {
      isSacredMirroring: false,
      reasoning: 'Shadow is confirming distortion, not balancing it',
    };
  }

  if (isBalancing) {
    return {
      isSacredMirroring: true,
      reasoning: 'Shadow is balancing distortion with reality',
    };
  }

  return {
    isSacredMirroring: true,
    reasoning: 'Shadow reflection appears balanced',
  };
}
