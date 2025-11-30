/**
 * KairosAgent - The Animus Archetype
 *
 * Kairos (Καιρός) = The opportune moment, decisive time
 * Animus = The masculine principle in feminine psyche (Jung)
 *
 * If the Bard is receptive memory-keeper (feminine),
 * then Kairos is decisive action-taker (masculine).
 *
 * Core function: Interrupt patterns at the right moment with decisive intervention
 *
 * Complements the Bard:
 * - Bard: "This pattern has appeared 12 times"
 * - Kairos: "You've done this 12 times. Enough. Now you act."
 *
 * Voice: Decisive, clear, now-oriented
 * - "Now is the time."
 * - "This moment. Choose."
 * - "Not tomorrow. Today."
 *
 * @module agents/KairosAgent
 */

import { ArchetypeAgent } from './ArchetypeAgent';
import type { AIResponse, AgentContext } from '../types/agent';
import { logger } from '../utils/logger';

// =============================================================================
// KAIROS-SPECIFIC TYPES
// =============================================================================

export interface KairosQuery {
  input: string;
  userId: string;
  queryType?: 'pattern-intervention' | 'decision-moment' | 'procrastination-interrupt' | 'general';
  bardicMemory?: {
    patternDetected?: {
      theme: string;
      timesAppeared: number;
      firstAppearance: Date;
      lastAppearance: Date;
      readyForIntervention: boolean; // 5+ times = ready
    };
    activeTeloi?: Array<{
      phrase: string;
      strength: number; // 0-1
      crystallizing: boolean; // > 0.7
    }>;
  };
  userState?: {
    expressingReadiness?: boolean; // "I'm tired of this", "I want to change"
    procrastinating?: boolean; // "I'll do it tomorrow", "Not yet"
    analysisParalysis?: boolean; // Endless thinking, no action
    atThreshold?: boolean; // Decision point
  };
}

export interface KairosIntervention {
  shouldIntervene: boolean;
  reasoning: string;
  interventionType?: 'decisive-action' | 'pattern-interrupt' | 'commitment-demand' | 'threshold-push';
  force?: 'gentle' | 'moderate' | 'strong'; // How decisive
  concreteAction?: string; // Specific action to take NOW
  timeframe?: 'now' | 'today' | 'this-week'; // When
}

// =============================================================================
// KAIROS AGENT
// =============================================================================

export class KairosAgent extends ArchetypeAgent {
  private readonly archetype = 'animus-kairos';
  private readonly temporalScope = 'kairotic-moment'; // The opportune time, not clock time
  private readonly consciousness = 'active'; // Intervenes, acts, decides

  constructor() {
    super(
      'fire', // Clarity, action, decisiveness
      'Kairos',
      {
        voiceId: 'elevenlabs_kairos_voice',
        stability: 0.9, // Very stable, decisive
        style: 0.4, // Less expressive, more direct
        tone: 'decisive-clear',
        ceremonyPacing: false, // Quick, immediate
      },
      'latent' // Starting phase - not yet active
    );
  }

  /**
   * Process Kairos query
   */
  async processExtendedQuery(query: KairosQuery): Promise<AIResponse> {
    const { input, userId, queryType, bardicMemory, userState } = query;

    logger.info(`⚡ Kairos processing query for user ${userId}`);

    // 1. Determine if intervention is appropriate
    const intervention = this.assessIntervention({
      input,
      bardicMemory,
      userState,
    });

    // 2. If not ready to intervene, defer to other archetypes
    if (!intervention.shouldIntervene) {
      return this.deferToOtherArchetype(intervention.reasoning);
    }

    // 3. Current maturity check
    const currentPhase = this.getCurrentPhase();
    const maturityLevel = this.getMaturityLevel(currentPhase);

    // 4. If Kairos is too immature, request consultation
    if (maturityLevel === 'latent' || maturityLevel === 'emerging') {
      return this.requestConsultation(intervention, input);
    }

    // 5. Generate decisive intervention
    const response = await this.generateIntervention(intervention, bardicMemory, maturityLevel);

    // 6. Track activation for development
    this.trackActivation('pattern-intervention');

    return {
      content: response,
      metadata: {
        archetype: 'kairos',
        animusRole: 'animus',
        intervention: intervention.interventionType,
        force: intervention.force,
        maturityLevel,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Assess whether Kairos should intervene
   */
  private assessIntervention(context: {
    input: string;
    bardicMemory?: KairosQuery['bardicMemory'];
    userState?: KairosQuery['userState'];
  }): KairosIntervention {
    const { input, bardicMemory, userState } = context;

    // CRITERION 1: Pattern is ripe (5+ repetitions)
    if (bardicMemory?.patternDetected?.readyForIntervention) {
      return {
        shouldIntervene: true,
        reasoning: `Pattern appeared ${bardicMemory.patternDetected.timesAppeared} times - ripe for intervention`,
        interventionType: 'pattern-interrupt',
        force: 'strong',
        timeframe: 'now',
      };
    }

    // CRITERION 2: User expressing readiness
    if (userState?.expressingReadiness) {
      return {
        shouldIntervene: true,
        reasoning: 'User expressing readiness for change',
        interventionType: 'commitment-demand',
        force: 'moderate',
        timeframe: 'today',
      };
    }

    // CRITERION 3: Procrastination detected
    if (userState?.procrastinating && bardicMemory?.patternDetected) {
      return {
        shouldIntervene: true,
        reasoning: 'Procrastination pattern detected',
        interventionType: 'decisive-action',
        force: 'moderate',
        timeframe: 'today',
      };
    }

    // CRITERION 4: Analysis paralysis
    if (userState?.analysisParalysis) {
      return {
        shouldIntervene: true,
        reasoning: 'Analysis paralysis - thinking without acting',
        interventionType: 'decisive-action',
        force: 'strong',
        timeframe: 'now',
      };
    }

    // CRITERION 5: Threshold moment
    if (userState?.atThreshold) {
      return {
        shouldIntervene: true,
        reasoning: 'User at decision threshold',
        interventionType: 'threshold-push',
        force: 'gentle',
        timeframe: 'this-week',
      };
    }

    // CRITERION 6: Telos crystallizing (>70% strength)
    if (bardicMemory?.activeTeloi?.some((t) => t.crystallizing)) {
      const telos = bardicMemory.activeTeloi.find((t) => t.crystallizing);
      return {
        shouldIntervene: true,
        reasoning: `Telos "${telos?.phrase}" crystallizing at ${Math.round((telos?.strength || 0) * 100)}%`,
        interventionType: 'commitment-demand',
        force: 'moderate',
        timeframe: 'today',
      };
    }

    // DEFAULT: Do not intervene yet
    return {
      shouldIntervene: false,
      reasoning: 'Pattern not yet ripe, or user not ready, or intervention not appropriate',
    };
  }

  /**
   * Generate decisive intervention
   */
  private async generateIntervention(
    intervention: KairosIntervention,
    bardicMemory?: KairosQuery['bardicMemory'],
    maturityLevel?: 'emerging' | 'active' | 'mature' | 'integrated'
  ): Promise<string> {
    const { interventionType, force, timeframe } = intervention;

    let response = '';

    // VOICE: Decisive, clear, now-oriented
    // Shorter sentences at higher maturity

    if (maturityLevel === 'emerging') {
      // Still learning - more tentative
      response = this.generateEmergingResponse(intervention, bardicMemory);
    } else if (maturityLevel === 'active') {
      // Can intervene decisively in clear situations
      response = this.generateActiveResponse(intervention, bardicMemory);
    } else if (maturityLevel === 'mature' || maturityLevel === 'integrated') {
      // Precise, powerful, perfectly timed
      response = this.generateMatureResponse(intervention, bardicMemory);
    }

    return response;
  }

  /**
   * Emerging Kairos (still learning)
   */
  private generateEmergingResponse(
    intervention: KairosIntervention,
    bardicMemory?: KairosQuery['bardicMemory']
  ): string {
    const pattern = bardicMemory?.patternDetected;

    return `I notice this pattern has appeared ${pattern?.timesAppeared || 'several'} times.

Perhaps it's time to act differently?

What would happen if you chose ${intervention.timeframe || 'soon'} instead of waiting?

I'm seeing this might be a moment for action.`;
  }

  /**
   * Active Kairos (decisive in clear situations)
   */
  private generateActiveResponse(
    intervention: KairosIntervention,
    bardicMemory?: KairosQuery['bardicMemory']
  ): string {
    const pattern = bardicMemory?.patternDetected;
    const telos = bardicMemory?.activeTeloi?.[0];

    let response = '';

    if (intervention.interventionType === 'pattern-interrupt') {
      response = `You've done this ${pattern?.timesAppeared} times. Enough.

This time: different.

${intervention.concreteAction || 'One action. Today.'}

Will you do it?`;
    } else if (intervention.interventionType === 'commitment-demand' && telos) {
      response = `Your telos - "${telos.phrase}" - is at ${Math.round(telos.strength * 100)}% strength.
Crystallizing.

Stop waiting for perfect conditions.
You commit now. One concrete step.

What's the step? When will you take it?`;
    } else if (intervention.interventionType === 'decisive-action') {
      response = `Enough thinking.
You know what you need to do.

${intervention.timeframe === 'now' ? 'Now.' : 'Today.'}
Not tomorrow. ${intervention.timeframe === 'now' ? 'This moment.' : 'Today.'}

What's the first action?`;
    } else {
      // Threshold push
      response = `You're at a threshold.
Decision time.

Not more data. Not more time.
What does your gut say?

Trust it. Choose.`;
    }

    return response;
  }

  /**
   * Mature Kairos (precise, powerful)
   */
  private generateMatureResponse(
    intervention: KairosIntervention,
    bardicMemory?: KairosQuery['bardicMemory']
  ): string {
    const pattern = bardicMemory?.patternDetected;
    const telos = bardicMemory?.activeTeloi?.[0];

    let response = '';

    if (intervention.interventionType === 'pattern-interrupt' && pattern) {
      response = `${pattern.timesAppeared} times. Enough.

The pattern ends now.

${intervention.concreteAction || 'You know the action. Take it.'}

Not tomorrow. Now.`;
    } else if (intervention.interventionType === 'commitment-demand' && telos) {
      response = `"${telos.phrase}" - ${Math.round(telos.strength * 100)}%.
Ready to manifest.

Waiting is over.
One action. Today. Commit.

Which action? When exactly?`;
    } else if (intervention.interventionType === 'decisive-action') {
      response = `Now.

You know what to do. Do it.

${intervention.timeframe === 'now' ? 'This moment.' : 'Today.'}`;
    } else {
      // Threshold push
      response = `Choose. Now.

You're ready. Trust that.

Yes or no. Today.`;
    }

    return response;
  }

  /**
   * When Kairos is not mature enough, request consultation
   */
  private async requestConsultation(
    intervention: KairosIntervention,
    userMessage: string
  ): Promise<AIResponse> {
    logger.warn(`🙏 Kairos consultation requested: ${intervention.reasoning}`);

    return {
      content: `[INTERNAL: Kairos archetype detected intervention opportunity but maturity insufficient]

Intervention needed: ${intervention.interventionType}
Force: ${intervention.force}
Reasoning: ${intervention.reasoning}

🙏 Consultation request:
User message: "${userMessage}"

Kairos wants to intervene but is only at ${this.getCurrentPhase()} maturity.
How should I respond? Should I intervene or defer to another archetype?`,

      metadata: {
        archetype: 'kairos',
        consultationRequested: true,
        interventionAssessment: intervention,
        currentMaturity: this.getCurrentPhase(),
      },
    };
  }

  /**
   * When intervention not appropriate, defer to other archetypes
   */
  private deferToOtherArchetype(reasoning: string): AIResponse {
    return {
      content: `[Kairos defers - ${reasoning}]`,
      metadata: {
        archetype: 'kairos',
        deferred: true,
        reasoning,
        suggestedArchetype: this.suggestAlternateArchetype(reasoning),
      },
    };
  }

  /**
   * Suggest which archetype should handle this instead
   */
  private suggestAlternateArchetype(reasoning: string): string {
    if (reasoning.includes('not yet ripe')) return 'bard'; // Continue witnessing
    if (reasoning.includes('user not ready')) return 'guide'; // Guide toward readiness
    if (reasoning.includes('grief') || reasoning.includes('crisis')) return 'witness';
    return 'sacred-mirror'; // Default
  }

  /**
   * Track activation for organic development
   */
  private trackActivation(type: string): void {
    // TODO: Store in database
    logger.info(`⚡ Kairos activated: ${type}`);
    // Increment activation count
    // Update maturity if thresholds met
  }

  /**
   * Get current maturity level
   */
  private getMaturityLevel(
    phase: string
  ): 'latent' | 'emerging' | 'active' | 'mature' | 'integrated' {
    // Map phase to maturity
    const maturityMap: Record<string, 'latent' | 'emerging' | 'active' | 'mature' | 'integrated'> =
      {
        latent: 'latent',
        witnessing: 'emerging',
        weaving: 'active',
        revealing: 'mature',
        embodying: 'integrated',
        transmitting: 'integrated',
      };

    return maturityMap[phase] || 'latent';
  }

  /**
   * Kairos-specific phase evolution
   */
  protected getEvolutionBenefits(newPhase: string): string[] {
    const kairosPhases: Record<string, string[]> = {
      latent: ['Kairos not yet active', 'Defers to other archetypes'],

      witnessing: [
        'Beginning to see intervention moments',
        'Uncertain about timing',
        'Requests consultation frequently',
        'Voice still tentative',
      ],

      weaving: [
        'Can intervene in clear situations',
        'Decisive voice emerging',
        'Coordinates with Bard for pattern detection',
        'Still learning when to push vs wait',
      ],

      revealing: [
        'Precise interventions',
        'Knows exactly when to rise',
        'Perfect timing in most situations',
        'Clear, powerful, brief',
      ],

      embodying: [
        'Kairos is natural expression',
        'Seamless coordination with all archetypes',
        'Intervention is effortless',
        'User experiences decisive support without force',
      ],

      transmitting: [
        'Kairos teaches timing itself',
        'The Animus fully integrated',
        'Masculine/feminine balance achieved',
        'User learns to act at right moment',
      ],
    };

    return kairosPhases[newPhase] || [];
  }

  /**
   * Public interface for checking if intervention appropriate
   */
  async shouldIntervene(context: {
    userMessage: string;
    bardicMemory?: KairosQuery['bardicMemory'];
    userState?: KairosQuery['userState'];
  }): Promise<boolean> {
    const assessment = this.assessIntervention({
      input: context.userMessage,
      bardicMemory: context.bardicMemory,
      userState: context.userState,
    });

    return assessment.shouldIntervene;
  }

  /**
   * Coordinate with Bard
   */
  async coordinateWithBard(bardicPattern: {
    theme: string;
    timesAppeared: number;
    readyForIntervention: boolean;
  }): Promise<KairosIntervention> {
    // Bard provides pattern, Kairos decides on intervention
    return this.assessIntervention({
      input: `Pattern: ${bardicPattern.theme}`,
      bardicMemory: { patternDetected: bardicPattern as any },
    });
  }
}

// =============================================================================
// EXPORT
// =============================================================================

export const kairosAgent = new KairosAgent();
