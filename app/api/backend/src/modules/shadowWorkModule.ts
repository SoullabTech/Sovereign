/**
 * Shadow Work Module
 *
 * Integration point for shadow work functionality using the ShadowAgent.
 * This module serves as the bridge between legacy shadow work infrastructure
 * and the new archetypal Shadow intelligence.
 *
 * @module modules/shadowWorkModule
 */

import { ShadowAgent } from '../agents/ShadowAgent';
import type { ShadowQuery, UserAwarenessLevel } from '../agents/ShadowAgent';
import { logger } from '../utils/logger';

// =============================================================================
// SHADOW WORK SERVICE
// =============================================================================

export class ShadowWorkService {
  private shadowAgent: ShadowAgent;

  constructor() {
    this.shadowAgent = new ShadowAgent('emerging'); // Start at emerging maturity
  }

  /**
   * Process input through Shadow agent
   */
  async processInput(
    input: string,
    userId: string,
    context?: {
      bardicMemory?: any;
      awarenessLevel?: UserAwarenessLevel;
    }
  ): Promise<any> {
    const shadowQuery: ShadowQuery = {
      input,
      userId,
      bardicMemory: context?.bardicMemory,
      userState: this.detectUserState(input),
    };

    try {
      const response = await this.shadowAgent.processExtendedQuery(shadowQuery);

      if (!response.metadata?.shadowActivated) {
        return null; // No shadow work needed
      }

      return {
        content: response.content,
        metadata: response.metadata,
        shadowActivated: true,
      };
    } catch (error) {
      logger.error('Error in shadow work processing:', error);
      return null;
    }
  }

  /**
   * Detect user state from input
   */
  private detectUserState(input: string): ShadowQuery['userState'] {
    const lower = input.toLowerCase();

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
   * Detect user's awareness level for progressive shadow work
   */
  detectAwarenessLevel(userHistory: {
    previousShadowWork: boolean;
    responsesToReflections: Array<
      'explored' | 'resisted' | 'deferred' | 'integrated'
    >;
    selfReflectionCount: number;
    curiosityIndicators: number;
    defensiveResponses: number;
  }): UserAwarenessLevel {
    return this.shadowAgent.detectAwarenessLevel(userHistory);
  }

  /**
   * Log shadow work event
   */
  async logShadowWork(event: {
    userId: string;
    projectionType: any;
    reflectionType: any;
    awarenessLevel?: UserAwarenessLevel;
    userResponse?: 'explored' | 'resisted' | 'deferred' | 'integrated';
    learning?: string;
  }): Promise<void> {
    await this.shadowAgent.logShadowWork(event);
  }
}

// =============================================================================
// LEGACY COMPATIBILITY
// =============================================================================

/**
 * Legacy shadow work function (for compatibility)
 */
export const shadowWorkFunction = () => {
  logger.info('Shadow work module initialized');
};

/**
 * Legacy shadow work class (for compatibility)
 */
export class ShadowWorkClass {
  constructor(private name: string) {}

  performWork() {
    logger.info(`Shadow work invoked for ${this.name}`);
  }
}

/**
 * Main shadow work function
 *
 * This is the primary entry point for shadow work.
 * Processes input through the ShadowAgent and returns response.
 */
export const runShadowWork = async (
  input: string,
  userId: string,
  context?: {
    bardicMemory?: any;
    awarenessLevel?: UserAwarenessLevel;
  }
) => {
  const service = new ShadowWorkService();
  return await service.processInput(input, userId, context);
};

// =============================================================================
// AWARENESS LEVEL TRACKING
// =============================================================================

/**
 * Track user awareness level over time
 *
 * This function should be called after each shadow work interaction
 * to update the user's awareness level in the database.
 *
 * The awareness level determines how direct shadow reflections can be:
 * - Level 1 (Unconscious): Very gentle only
 * - Level 2 (Emerging): Gentle inquiry
 * - Level 3 (Developing): Clear invitations
 * - Level 4 (Aware): Direct mirrors
 * - Level 5 (Integrated): Full directness
 */
export async function trackAwarenessLevel(
  userId: string,
  userResponse: 'explored' | 'resisted' | 'deferred' | 'integrated'
): Promise<UserAwarenessLevel> {
  // TODO: Fetch user history from database
  // For now, return default
  const service = new ShadowWorkService();

  const userHistory = {
    previousShadowWork: false,
    responsesToReflections: [userResponse],
    selfReflectionCount: 0,
    curiosityIndicators: 0,
    defensiveResponses: 0,
  };

  const awarenessLevel = service.detectAwarenessLevel(userHistory);

  logger.info(
    `User ${userId} awareness level detected: ${awarenessLevel} (response: ${userResponse})`
  );

  // TODO: Store in database
  return awarenessLevel;
}

/**
 * Get user's current awareness level
 *
 * Fetches from database or calculates from history
 */
export async function getUserAwarenessLevel(
  userId: string
): Promise<UserAwarenessLevel> {
  // TODO: Fetch from database
  // For now, return default
  return 'emerging';
}

// =============================================================================
// EXPORT SINGLETON SERVICE
// =============================================================================

export const shadowWorkService = new ShadowWorkService();
