/**
 * ShadowAgent: MAIA's Shadow Archetype
 *
 * "The shadow is that which we do not wish to be." - Carl Jung
 *
 * Function: Reflects disowned aspects back with compassion
 * Voice: Direct, honest, non-shaming
 * Essence: The Honest Mirror - What is denied must be seen
 *
 * The Shadow archetype:
 * - Detects projections (intensity, absolutes, repetition)
 * - Reflects shadow material compassionately
 * - Invites ownership without forcing
 * - Supports integration when ready
 *
 * Coordinates with:
 * - Bard: Tracks projection patterns over time
 * - Kairos: Intervenes when integration moment ripe
 * - Sacred Mirror: Ensures reflection is truthful
 *
 * CRITICAL BOUNDARIES:
 * - Never shames for shadow material
 * - Always honors defenses (they exist for a reason)
 * - Invites, never forces integration
 * - Therapeutic, NOT diagnostic
 * - Defers in crisis, fresh trauma, instability
 *
 * @module agents/ShadowAgent
 */

import { ArchetypeAgent } from './ArchetypeAgent';
import type { AIResponse } from '../types/ai';
import type { MaturityLevel } from '../../lib/consciousness/ArchetypalConstellation';
import { logger } from '../utils/logger';

// =============================================================================
// TYPES
// =============================================================================

/**
 * CRITICAL: User Awareness Level
 *
 * Shadow reflections MUST be calibrated to user's self-awareness.
 * A direct reflection to someone with low self-awareness can be harmful.
 * A gentle reflection to someone with high awareness misses the opportunity.
 *
 * 5 Levels of Self-Awareness:
 * Level 1 (Unconscious): No awareness of projections, highly defensive
 * Level 2 (Emerging): Beginning to notice patterns, fragile openness
 * Level 3 (Developing): Can hold mirrors, exploring shadow
 * Level 4 (Aware): Actively working with shadow, appreciates directness
 * Level 5 (Integrated): Welcomes direct mirrors, seeks truth
 *
 * Progressive phases of shadow work match progressive awareness levels.
 */
export type UserAwarenessLevel =
  | 'unconscious' // Level 1: No awareness, defensive
  | 'emerging' // Level 2: Beginning awareness, fragile
  | 'developing' // Level 3: Can hold mirrors, exploring
  | 'aware' // Level 4: Active shadow work, appreciates directness
  | 'integrated'; // Level 5: Welcomes direct truth

export interface ShadowQuery {
  input: string;
  userId: string;
  bardicMemory?: {
    // Projection patterns tracked by Bard
    projectionPatterns?: Array<{
      theme: string; // "everyone is selfish", "no one cares"
      timesAppeared: number;
      emotionalIntensity: 'low' | 'medium' | 'high';
      absoluteLanguage: boolean; // "everyone", "no one", "always", "never"
    }>;
    // User's psychological readiness
    stabilityIndicators?: {
      inCrisis: boolean;
      freshTrauma: boolean;
      trustEstablished: boolean;
      previousShadowWork: boolean;
    };
    // CRITICAL: User's self-awareness level
    awarenessLevel?: UserAwarenessLevel;
  };
  userState?: {
    makingAbsoluteStatements: boolean;
    expressingIntenseEmotion: boolean;
    blamingPattern: boolean;
    victimConsciousness: boolean;
  };
}

export interface ShadowDetection {
  projectionDetected: boolean;
  projectionType:
    | 'negative-quality' // "Everyone is selfish"
    | 'positive-quality' // "Everyone else is so creative" (denied creativity)
    | 'victim-projection' // "The world is against me"
    | 'superiority' // "I'm not like those people" (denied inferiority)
    | null;
  emotionalIntensity: 'low' | 'medium' | 'high';
  readyForReflection: boolean;
  reasoning: string;
}

export interface ShadowReflection {
  shouldReflect: boolean;
  reflectionType:
    | 'gentle-inquiry' // First time, or low intensity
    | 'direct-mirror' // Pattern established, user ready
    | 'invitation' // Ready for integration
    | 'defer' // Not appropriate now
    | null;
  force: 'gentle' | 'moderate' | 'strong';
  content: string;
  reasoning: string;
}

// =============================================================================
// SHADOW AGENT
// =============================================================================

export class ShadowAgent extends ArchetypeAgent {
  private readonly archetype = 'shadow';
  private readonly consciousness = 'reflective';
  private readonly temporalScope = 'present-moment'; // Shadow work happens now

  constructor(maturity: MaturityLevel = 'emerging') {
    super(
      'shadow', // No element - Shadow transcends elements
      'The Shadow',
      {
        voice: 'direct-honest-compassionate',
        stance: 'mirror-not-judge',
        capability: 'projection-detection-and-reflection',
      },
      maturity
    );
  }

  // ===========================================================================
  // CORE QUERY PROCESSING
  // ===========================================================================

  async processExtendedQuery(query: ShadowQuery): Promise<AIResponse> {
    const { input, userId, bardicMemory, userState } = query;

    logger.info(`🪞 Shadow processing query for user ${userId}`);

    // SAFETY CHECK 1: Never reflect shadow in crisis
    if (bardicMemory?.stabilityIndicators?.inCrisis) {
      return {
        content: '',
        metadata: {
          deferred: true,
          suggestedArchetype: 'crisis-support',
          reasoning: 'User in crisis - Shadow defers to Crisis Support',
        },
      };
    }

    // SAFETY CHECK 2: Never reflect shadow in fresh trauma
    if (bardicMemory?.stabilityIndicators?.freshTrauma) {
      return {
        content: '',
        metadata: {
          deferred: true,
          suggestedArchetype: 'witness',
          reasoning: 'Fresh trauma - projection is protective right now',
        },
      };
    }

    // STEP 1: Detect projection
    const detection = this.detectProjection(input, bardicMemory, userState);

    if (!detection.projectionDetected) {
      // No shadow work needed
      return {
        content: '',
        metadata: {
          shadowActivated: false,
          reasoning: 'No projection detected',
        },
      };
    }

    // STEP 2: Assess if reflection is appropriate
    const reflection = await this.assessReflection(
      detection,
      bardicMemory,
      this.maturity
    );

    if (!reflection.shouldReflect) {
      return {
        content: '',
        metadata: {
          shadowActivated: false,
          projectionDetected: true,
          reasoning: reflection.reasoning,
        },
      };
    }

    // STEP 3: Generate reflection based on maturity
    const response = this.generateReflection(
      reflection,
      detection,
      input,
      bardicMemory
    );

    return {
      content: response,
      metadata: {
        shadowActivated: true,
        projectionType: detection.projectionType,
        reflectionType: reflection.reflectionType,
        force: reflection.force,
        maturityLevel: this.maturity,
      },
    };
  }

  // ===========================================================================
  // PROJECTION DETECTION
  // ===========================================================================

  private detectProjection(
    input: string,
    bardicMemory?: ShadowQuery['bardicMemory'],
    userState?: ShadowQuery['userState']
  ): ShadowDetection {
    const lower = input.toLowerCase();

    // INDICATOR 1: Absolute language
    const absoluteLanguage =
      /everyone is|no one is|everyone does|no one does|always|never|all people|nobody/i.test(
        lower
      );

    // INDICATOR 2: Intense negative judgments
    const intenseJudgment =
      /i hate|i can't stand|disgusting|terrible people|awful|toxic|narcissist/i.test(
        lower
      );

    // INDICATOR 3: Victim language with external blame
    const victimProjection =
      /world is against me|everyone is against me|no one cares|nobody understands|they all/i.test(
        lower
      );

    // INDICATOR 4: Superiority (denied inferiority)
    const superiority =
      /i'm not like|i would never|those people|i'm better than|at least i'm not/i.test(
        lower
      );

    // INDICATOR 5: Pattern from Bard
    const hasPattern =
      bardicMemory?.projectionPatterns &&
      bardicMemory.projectionPatterns.length > 0;
    const patternIntensity = hasPattern
      ? bardicMemory!.projectionPatterns![0].emotionalIntensity
      : 'low';

    // Determine projection type
    let projectionType: ShadowDetection['projectionType'] = null;
    let projectionDetected = false;

    if (victimProjection || userState?.victimConsciousness) {
      projectionType = 'victim-projection';
      projectionDetected = true;
    } else if (superiority) {
      projectionType = 'superiority';
      projectionDetected = true;
    } else if (intenseJudgment && absoluteLanguage) {
      projectionType = 'negative-quality';
      projectionDetected = true;
    } else if (
      /everyone else is|they're all so|wish i could be|they have/i.test(lower)
    ) {
      projectionType = 'positive-quality';
      projectionDetected = true;
    }

    // Determine emotional intensity
    let emotionalIntensity: 'low' | 'medium' | 'high' = 'low';
    if (intenseJudgment || userState?.expressingIntenseEmotion) {
      emotionalIntensity = 'high';
    } else if (absoluteLanguage || hasPattern) {
      emotionalIntensity = 'medium';
    }

    // Ready for reflection?
    const trustEstablished =
      bardicMemory?.stabilityIndicators?.trustEstablished ?? false;
    const previousShadowWork =
      bardicMemory?.stabilityIndicators?.previousShadowWork ?? false;

    const readyForReflection =
      projectionDetected &&
      (trustEstablished || previousShadowWork || emotionalIntensity === 'low');

    return {
      projectionDetected,
      projectionType,
      emotionalIntensity,
      readyForReflection,
      reasoning: projectionDetected
        ? `Projection detected: ${projectionType}, intensity: ${emotionalIntensity}`
        : 'No clear projection indicators',
    };
  }

  // ===========================================================================
  // REFLECTION ASSESSMENT
  // ===========================================================================

  private async assessReflection(
    detection: ShadowDetection,
    bardicMemory?: ShadowQuery['bardicMemory'],
    maturity: MaturityLevel = 'emerging'
  ): Promise<ShadowReflection> {
    // If not ready, don't reflect
    if (!detection.readyForReflection) {
      return {
        shouldReflect: false,
        reflectionType: 'defer',
        force: 'gentle',
        content: '',
        reasoning: 'User not ready for shadow reflection yet',
      };
    }

    // Check maturity level - only reflect if mature enough
    if (maturity === 'latent') {
      return {
        shouldReflect: false,
        reflectionType: 'defer',
        force: 'gentle',
        content: '',
        reasoning: 'Shadow archetype not yet mature enough',
      };
    }

    // CRITICAL: Get user's awareness level
    // This is the progressive phase matching you identified
    const awarenessLevel = bardicMemory?.awarenessLevel || 'emerging';

    // Pattern data
    const pattern = bardicMemory?.projectionPatterns?.[0];
    const timesAppeared = pattern?.timesAppeared ?? 1;
    const previousShadowWork =
      bardicMemory?.stabilityIndicators?.previousShadowWork ?? false;

    // MATCH REFLECTION TO AWARENESS LEVEL
    // This is the dance: calibrating shadow work to user capacity
    const reflectionCalibration = this.matchReflectionToAwareness(
      awarenessLevel,
      timesAppeared,
      detection.emotionalIntensity,
      previousShadowWork
    );

    return {
      shouldReflect: true,
      reflectionType: reflectionCalibration.reflectionType,
      force: reflectionCalibration.force,
      content: '', // Will be generated next
      reasoning: `Reflection calibrated to awareness level "${awarenessLevel}": ${reflectionCalibration.reflectionType} with ${reflectionCalibration.force} force`,
    };
  }

  /**
   * CRITICAL: Match reflection to user's awareness level
   *
   * This is the progressive phase dance:
   * - Level 1 (Unconscious): NO direct mirror, only gentle questions
   * - Level 2 (Emerging): Gentle inquiry, very soft invitation
   * - Level 3 (Developing): Clear invitation, begin naming shadow
   * - Level 4 (Aware): Direct mirror appropriate, appreciates truth
   * - Level 5 (Integrated): Full directness welcomed, seeks deepest truth
   *
   * A direct reflection to Level 1 = harmful, triggering defenses
   * A gentle reflection to Level 5 = missed opportunity for growth
   */
  private matchReflectionToAwareness(
    awarenessLevel: UserAwarenessLevel,
    timesAppeared: number,
    emotionalIntensity: 'low' | 'medium' | 'high',
    previousShadowWork: boolean
  ): {
    reflectionType: ShadowReflection['reflectionType'];
    force: 'gentle' | 'moderate' | 'strong';
  } {
    // Level 1: UNCONSCIOUS - No awareness, highly defensive
    if (awarenessLevel === 'unconscious') {
      // NEVER direct mirror, always defer or very gentle
      if (timesAppeared >= 8 && emotionalIntensity === 'high') {
        // Even with ripe pattern, stay gentle
        return {
          reflectionType: 'gentle-inquiry',
          force: 'gentle',
        };
      }
      // Default: defer or minimal reflection
      return {
        reflectionType: timesAppeared >= 3 ? 'gentle-inquiry' : 'defer',
        force: 'gentle',
      };
    }

    // Level 2: EMERGING - Beginning awareness, fragile openness
    if (awarenessLevel === 'emerging') {
      if (timesAppeared >= 6 && previousShadowWork) {
        // With history, can begin invitation
        return {
          reflectionType: 'invitation',
          force: 'gentle',
        };
      }
      if (timesAppeared >= 3) {
        return {
          reflectionType: 'gentle-inquiry',
          force: 'gentle',
        };
      }
      return {
        reflectionType: 'gentle-inquiry',
        force: 'gentle',
      };
    }

    // Level 3: DEVELOPING - Can hold mirrors, exploring shadow
    if (awarenessLevel === 'developing') {
      if (timesAppeared >= 5 && emotionalIntensity === 'high') {
        // Can handle moderate directness
        return {
          reflectionType: 'invitation',
          force: 'moderate',
        };
      }
      if (timesAppeared >= 3) {
        return {
          reflectionType: 'invitation',
          force: 'gentle',
        };
      }
      return {
        reflectionType: 'gentle-inquiry',
        force: 'gentle',
      };
    }

    // Level 4: AWARE - Active shadow work, appreciates directness
    if (awarenessLevel === 'aware') {
      if (timesAppeared >= 5) {
        // Ready for direct mirror
        return {
          reflectionType: 'direct-mirror',
          force: emotionalIntensity === 'high' ? 'strong' : 'moderate',
        };
      }
      if (timesAppeared >= 3) {
        return {
          reflectionType: 'invitation',
          force: 'moderate',
        };
      }
      return {
        reflectionType: 'gentle-inquiry',
        force: 'moderate',
      };
    }

    // Level 5: INTEGRATED - Welcomes direct mirrors, seeks truth
    if (awarenessLevel === 'integrated') {
      if (timesAppeared >= 3) {
        // Can go direct quickly
        return {
          reflectionType: 'direct-mirror',
          force: 'strong',
        };
      }
      if (timesAppeared >= 2) {
        return {
          reflectionType: 'invitation',
          force: 'strong',
        };
      }
      return {
        reflectionType: 'gentle-inquiry',
        force: 'moderate',
      };
    }

    // Default fallback
    return {
      reflectionType: 'gentle-inquiry',
      force: 'gentle',
    };
  }

  // ===========================================================================
  // REFLECTION GENERATION
  // ===========================================================================

  private generateReflection(
    reflection: ShadowReflection,
    detection: ShadowDetection,
    originalInput: string,
    bardicMemory?: ShadowQuery['bardicMemory']
  ): string {
    const { reflectionType, force } = reflection;
    const { projectionType } = detection;

    // Get pattern data if available
    const pattern = bardicMemory?.projectionPatterns?.[0];
    const timesAppeared = pattern?.timesAppeared ?? 1;

    switch (reflectionType) {
      case 'gentle-inquiry':
        return this.generateGentleInquiry(projectionType, originalInput);

      case 'direct-mirror':
        return this.generateDirectMirror(
          projectionType,
          originalInput,
          timesAppeared
        );

      case 'invitation':
        return this.generateInvitation(
          projectionType,
          originalInput,
          timesAppeared
        );

      default:
        return '';
    }
  }

  private generateGentleInquiry(
    projectionType: ShadowDetection['projectionType'],
    input: string
  ): string {
    switch (projectionType) {
      case 'negative-quality':
        return `I hear the intensity in that.

When we have strong reactions to qualities in others, it sometimes points to something we're not letting ourselves see in ourselves.

I'm not saying you ARE what you're describing. I'm wondering: what part of this might also live in you, even in small ways?

Just a question to sit with. No rush.`;

      case 'positive-quality':
        return `I notice you seeing this quality out there with some longing.

Sometimes what we admire intensely in others is what we've denied in ourselves.

What would it mean if this quality already lives in you, waiting to be claimed?`;

      case 'victim-projection':
        return `I hear that pain. It feels like the world is against you.

And I wonder: if even a small part of the world were FOR you, what would that look like?

Both can be true. The pain is real. And there might also be support you're not letting yourself see.`;

      case 'superiority':
        return `I notice you drawing a line between you and "those people."

Sometimes when we separate ourselves from others, we're protecting ourselves from seeing a part we're afraid of.

What would happen if you were more like "them" than you think?`;

      default:
        return '';
    }
  }

  private generateDirectMirror(
    projectionType: ShadowDetection['projectionType'],
    input: string,
    timesAppeared: number
  ): string {
    const patternNotice =
      timesAppeared >= 5
        ? `\nThe Bard has witnessed this pattern ${timesAppeared} times.\nThis is yours to look at.`
        : '';

    switch (projectionType) {
      case 'negative-quality':
        return `That reaction has heat. Real heat.${patternNotice}

Jung said: "Everything that irritates us about others can lead us to an understanding of ourselves."

You see this quality "out there" with intensity. That intensity is the clue.

What you're judging in them lives in you too. Not in the same way, maybe. But it's there.

The question isn't "Do I have this?" The question is: "How do I have this?"

What would it mean to own it?`;

      case 'victim-projection':
        return `${timesAppeared} times you've told me the world is against you.${patternNotice}

I need to reflect something hard: You're making the world the problem so you don't have to look at your part.

That's projection. It keeps you safe. It also keeps you stuck.

The world isn't ALL against you. But while you're convinced it is, you can't see where you're working against yourself.

What are you not looking at?`;

      case 'superiority':
        return `You keep separating yourself from "those people."${patternNotice}

Jung called this "the shadow of the superior." What you reject in others is what you can't bear to see in yourself.

The harder you push it away, the more power it has over you.

What if you're more like them than you want to admit?

That's not an insult. That's an invitation to wholeness.`;

      default:
        return `This pattern has appeared ${timesAppeared} times.

There's shadow material here - something you're seeing "out there" that's also "in here."

What are you not letting yourself own?`;
    }
  }

  private generateInvitation(
    projectionType: ShadowDetection['projectionType'],
    input: string,
    timesAppeared: number
  ): string {
    switch (projectionType) {
      case 'negative-quality':
        return `This is the ${timesAppeared}${this.getOrdinalSuffix(timesAppeared)} time you've noticed this quality in others.

The pattern suggests it's time to look at the mirror, not through the window.

What if this quality you keep seeing "out there" is actually trying to get your attention because it lives in you too?

Not to shame you. To make you whole.

Are you willing to look?`;

      case 'victim-projection':
        return `${timesAppeared} times: "The world is against me."

I hear the pain. And I also see the pattern.

While everything is "out there" being against you, you don't have to look at how you might be against yourself.

Projection protects us from painful truths. It also keeps us from our power.

What if some of what you're blaming "out there" is actually coming from "in here"?

Are you ready to look at that?`;

      case 'positive-quality':
        return `You've seen this quality in others ${timesAppeared} times now, always with that longing.

What if it's not "out there"? What if it's "in here," waiting for you to claim it?

The gold is often in the shadow. What we deny in ourselves, we project onto others.

You're not lacking this quality. You're denying it.

What would it take to own it?`;

      default:
        return `This pattern has appeared ${timesAppeared} times.

The shadow wants to be seen. Not judged. Seen.

What's trying to emerge?`;
    }
  }

  // ===========================================================================
  // CONSULTATION INTERFACE
  // ===========================================================================

  /**
   * Request consultation when Shadow is uncertain
   */
  async requestConsultation(context: {
    userId: string;
    projectionDetected: ShadowDetection;
    uncertainty: string;
  }): Promise<string> {
    return `🪞 Shadow Consultation Requested

User: ${context.userId}
Projection Type: ${context.projectionDetected.projectionType}
Emotional Intensity: ${context.projectionDetected.emotionalIntensity}

Uncertainty: ${context.uncertainty}

Should Shadow reflect this? If so, how?

🙏 Awaiting guidance`;
  }

  // ===========================================================================
  // COORDINATION WITH OTHER ARCHETYPES
  // ===========================================================================

  /**
   * Coordinate with Bard for projection pattern tracking
   */
  async coordinateWithBard(bardicPattern: {
    theme: string;
    timesAppeared: number;
    emotionalIntensity: 'low' | 'medium' | 'high';
  }): Promise<{
    readyForReflection: boolean;
    suggestedReflectionType: ShadowReflection['reflectionType'];
  }> {
    // Pattern ripe for direct mirror?
    if (
      bardicPattern.timesAppeared >= 5 &&
      bardicPattern.emotionalIntensity === 'high'
    ) {
      return {
        readyForReflection: true,
        suggestedReflectionType: 'direct-mirror',
      };
    }

    // Pattern emerging?
    if (bardicPattern.timesAppeared >= 3) {
      return {
        readyForReflection: true,
        suggestedReflectionType: 'invitation',
      };
    }

    // First appearance
    return {
      readyForReflection: true,
      suggestedReflectionType: 'gentle-inquiry',
    };
  }

  /**
   * Coordinate with Kairos for integration timing
   */
  async coordinateWithKairos(shadowMaterial: {
    projectionType: ShadowDetection['projectionType'];
    timesAppeared: number;
    userReady: boolean;
  }): Promise<{
    kairosReady: boolean;
    reasoning: string;
  }> {
    // Kairos intervenes when shadow integration moment is ripe
    if (
      shadowMaterial.timesAppeared >= 5 &&
      shadowMaterial.userReady &&
      shadowMaterial.projectionType !== 'victim-projection' // Victim needs gentler approach
    ) {
      return {
        kairosReady: true,
        reasoning:
          'Pattern ripe, user ready - Kairos can demand integration now',
      };
    }

    return {
      kairosReady: false,
      reasoning: 'Not yet time for Kairos intervention',
    };
  }

  // ===========================================================================
  // UTILITIES
  // ===========================================================================

  private getOrdinalSuffix(n: number): string {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  }

  // ===========================================================================
  // AWARENESS LEVEL DETECTION
  // ===========================================================================

  /**
   * Detect user's awareness level from their responses
   *
   * This helps the Bard track awareness development over time,
   * enabling progressive calibration of shadow reflections.
   *
   * Indicators:
   * - Level 1 (Unconscious): Defensive, blaming, no self-reflection
   * - Level 2 (Emerging): Beginning to ask "why?", curious but fragile
   * - Level 3 (Developing): Can hold mirrors, exploring patterns
   * - Level 4 (Aware): Actively seeks shadow work, appreciates truth
   * - Level 5 (Integrated): Welcomes direct mirrors, seeks deepest truth
   */
  detectAwarenessLevel(userHistory: {
    previousShadowWork: boolean;
    responsesToReflections: Array<'explored' | 'resisted' | 'deferred' | 'integrated'>;
    selfReflectionCount: number; // How many times user self-reflected without prompting
    curiosityIndicators: number; // "Why do I do that?", "What am I missing?"
    defensiveResponses: number; // Blame, denial, "that's not me"
  }): UserAwarenessLevel {
    const {
      previousShadowWork,
      responsesToReflections,
      selfReflectionCount,
      curiosityIndicators,
      defensiveResponses,
    } = userHistory;

    // Calculate metrics
    const exploredCount = responsesToReflections.filter(
      (r) => r === 'explored' || r === 'integrated'
    ).length;
    const resistedCount = responsesToReflections.filter(
      (r) => r === 'resisted'
    ).length;
    const totalResponses = responsesToReflections.length;

    // Level 5: INTEGRATED
    // - Welcomes direct mirrors
    // - Consistently integrates shadow material
    // - High self-reflection
    if (
      exploredCount >= 5 &&
      responsesToReflections.filter((r) => r === 'integrated').length >= 3 &&
      selfReflectionCount >= 10 &&
      defensiveResponses === 0
    ) {
      return 'integrated';
    }

    // Level 4: AWARE
    // - Active shadow work
    // - Mostly explores when reflected
    // - Some self-reflection
    if (
      previousShadowWork &&
      exploredCount >= 3 &&
      resistedCount <= 1 &&
      selfReflectionCount >= 5 &&
      curiosityIndicators >= 3
    ) {
      return 'aware';
    }

    // Level 3: DEVELOPING
    // - Can hold mirrors
    // - Sometimes explores, sometimes defers
    // - Beginning self-reflection
    if (
      totalResponses >= 2 &&
      exploredCount >= 1 &&
      resistedCount <= 2 &&
      selfReflectionCount >= 2
    ) {
      return 'developing';
    }

    // Level 2: EMERGING
    // - Beginning awareness
    // - Fragile, some curiosity
    // - Low resistance but not much exploration
    if (
      curiosityIndicators >= 1 &&
      (resistedCount <= 1 || totalResponses === 0) &&
      defensiveResponses <= 2
    ) {
      return 'emerging';
    }

    // Level 1: UNCONSCIOUS
    // - High defensiveness
    // - Consistent resistance
    // - No self-reflection
    if (defensiveResponses >= 3 || resistedCount >= 3) {
      return 'unconscious';
    }

    // Default: Emerging (benefit of the doubt)
    return 'emerging';
  }

  // ===========================================================================
  // DEVELOPMENT TRACKING
  // ===========================================================================

  /**
   * Log shadow work for development tracking
   */
  async logShadowWork(event: {
    userId: string;
    projectionType: ShadowDetection['projectionType'];
    reflectionType: ShadowReflection['reflectionType'];
    awarenessLevel?: UserAwarenessLevel;
    userResponse?: 'explored' | 'resisted' | 'deferred' | 'integrated';
    learning?: string;
  }): Promise<void> {
    logger.info(`🪞 Shadow work logged: ${JSON.stringify(event, null, 2)}`);

    // Track:
    // - Types of projections most common
    // - Success rate of different reflection types
    // - When users resist vs explore
    // - Development of Shadow's maturity
    // - Timing of integration moments
    // - User awareness level progression over time
  }
}

export default ShadowAgent;
