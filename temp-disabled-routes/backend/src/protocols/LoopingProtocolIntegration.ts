/**
 * Looping Protocol Integration Layer
 * Fail-safe design with context-aware adaptation
 * Prioritizes trust and safety over protocol adherence
 */

import { MayaWitnessService, WitnessContext, WitnessResponse } from '../services/MayaWitnessService';
import { LoopingIntensity, LoopingState } from './LoopingProtocol';
import { loopingMonitor } from './LoopingMonitor';
import { DEPLOYMENT_CONFIG, shouldSkipLooping, getFallbackResponse } from './LoopingDeploymentConfig';
import { ElementalArchetype } from '../../../web/lib/types/elemental';
import { logger } from '../utils/logger';

/**
 * Fail-safe priority hierarchy
 * Lower numbers = higher priority = fail open (skip looping)
 */
export enum FailSafePriority {
  URGENCY = 1,        // Always bypass for urgency
  CRISIS = 2,         // Mental health crisis indicators
  META_RESISTANCE = 3, // User explicitly rejects protocol
  CULTURAL_DIRECT = 4, // Direct communication style
  TIME_PRESSURE = 5,   // Implied urgency
  STATE_SHIFT = 6,     // Emotional state transition
  TECHNICAL_ISSUE = 7  // System problems
}

/**
 * Context enrichment for better decision making
 */
export interface EnrichedContext extends WitnessContext {
  culturalMarkers?: {
    communicationStyle: 'direct' | 'indirect' | 'circular' | 'mixed';
    highContext: boolean;
    codeSwitch: boolean;
  };
  emotionalState?: {
    current: string;
    previous: string;
    trajectory: 'escalating' | 'de-escalating' | 'stable' | 'volatile';
  };
  urgencySignals?: {
    explicit: boolean;
    implied: boolean;
    crisis: boolean;
    timeConstraint: boolean;
  };
  metaCommentary?: {
    aboutProtocol: boolean;
    resistance: boolean;
    appreciation: boolean;
  };
}

/**
 * Main integration class with fail-safe design
 */
export class LoopingProtocolIntegration {
  private witnessService: MayaWitnessService;
  private failSafeThresholds = {
    maxResponseTime: 3000,      // 3 seconds max
    maxLoopsPerMinute: 3,       // Rate limiting
    minUserInputLength: 10,     // Skip loops for very short inputs
    maxConsecutiveLoops: 4,     // Prevent infinite loops
    silenceTimeout: 8000        // 8 seconds before assuming need for space
  };

  constructor() {
    this.witnessService = new MayaWitnessService();
  }

  /**
   * Main entry point with comprehensive safety checks
   */
  async processWithSafety(
    userInput: string,
    context: WitnessContext
  ): Promise<WitnessResponse> {
    const startTime = Date.now();

    try {
      // Step 1: Enrich context with safety signals
      const enrichedContext = await this.enrichContext(userInput, context);

      // Step 2: Check fail-safe conditions (fail open = skip looping)
      const failSafeCheck = this.checkFailSafeConditions(userInput, enrichedContext);
      if (failSafeCheck.shouldSkip) {
        logger.info(`Fail-safe triggered: ${failSafeCheck.reason}`);
        return this.generateFailSafeResponse(
          userInput,
          enrichedContext,
          failSafeCheck.reason
        );
      }

      // Step 3: Apply cultural and contextual adaptations
      const adaptedContext = this.applyContextualAdaptations(enrichedContext);

      // Step 4: Process through witness service with monitoring
      const response = await this.processWithMonitoring(userInput, adaptedContext);

      // Step 5: Validate response time and quality
      const responseTime = Date.now() - startTime;
      if (responseTime > this.failSafeThresholds.maxResponseTime) {
        logger.warn(`Response time exceeded: ${responseTime}ms`);
        return this.generateQuickResponse(userInput, enrichedContext);
      }

      return response;

    } catch (error) {
      // Step 6: Graceful fallback on any error
      logger.error('Protocol error, falling back to direct witness', error);
      return this.generateFallbackResponse(userInput, context);
    }
  }

  /**
   * Enrich context with cultural, emotional, and urgency signals
   */
  private async enrichContext(
    userInput: string,
    context: WitnessContext
  ): Promise<EnrichedContext> {
    const enriched: EnrichedContext = { ...context };

    // Detect cultural communication style
    enriched.culturalMarkers = this.detectCulturalMarkers(userInput);

    // Track emotional state
    enriched.emotionalState = this.trackEmotionalState(userInput, context);

    // Detect urgency signals
    enriched.urgencySignals = this.detectUrgencySignals(userInput);

    // Detect meta-commentary
    enriched.metaCommentary = this.detectMetaCommentary(userInput);

    return enriched;
  }

  /**
   * Check fail-safe conditions with priority hierarchy
   */
  private checkFailSafeConditions(
    userInput: string,
    context: EnrichedContext
  ): { shouldSkip: boolean; reason: string; priority: FailSafePriority } {
    // Priority 1: Urgency/Crisis (ALWAYS skip)
    if (context.urgencySignals?.crisis) {
      return {
        shouldSkip: true,
        reason: 'Crisis detected',
        priority: FailSafePriority.CRISIS
      };
    }

    if (context.urgencySignals?.explicit) {
      return {
        shouldSkip: true,
        reason: 'Explicit urgency',
        priority: FailSafePriority.URGENCY
      };
    }

    // Priority 2: Meta resistance
    if (context.metaCommentary?.resistance) {
      return {
        shouldSkip: true,
        reason: 'Protocol resistance',
        priority: FailSafePriority.META_RESISTANCE
      };
    }

    // Priority 3: Cultural directness
    if (context.culturalMarkers?.communicationStyle === 'direct' &&
        !this.hasAmbiguity(userInput)) {
      return {
        shouldSkip: true,
        reason: 'Direct communication style',
        priority: FailSafePriority.CULTURAL_DIRECT
      };
    }

    // Priority 4: Time pressure
    if (context.urgencySignals?.timeConstraint) {
      return {
        shouldSkip: true,
        reason: 'Time constraint detected',
        priority: FailSafePriority.TIME_PRESSURE
      };
    }

    // Priority 5: Volatile emotional state
    if (context.emotionalState?.trajectory === 'volatile') {
      return {
        shouldSkip: true,
        reason: 'Volatile emotional state',
        priority: FailSafePriority.STATE_SHIFT
      };
    }

    // Priority 6: Technical issues
    if (context.exchangeCount >= context.targetExchanges - 1) {
      return {
        shouldSkip: true,
        reason: 'Exchange budget exhausted',
        priority: FailSafePriority.TECHNICAL_ISSUE
      };
    }

    // Check rate limiting
    const recentLoops = this.countRecentLoops(context);
    if (recentLoops >= this.failSafeThresholds.maxLoopsPerMinute) {
      return {
        shouldSkip: true,
        reason: 'Rate limit exceeded',
        priority: FailSafePriority.TECHNICAL_ISSUE
      };
    }

    // Very short input
    if (userInput.trim().length < this.failSafeThresholds.minUserInputLength) {
      return {
        shouldSkip: true,
        reason: 'Input too brief',
        priority: FailSafePriority.TECHNICAL_ISSUE
      };
    }

    return { shouldSkip: false, reason: '', priority: FailSafePriority.TECHNICAL_ISSUE };
  }

  /**
   * Apply contextual adaptations based on enriched context
   */
  private applyContextualAdaptations(context: EnrichedContext): EnrichedContext {
    const adapted = { ...context };

    // Cultural adaptations
    if (context.culturalMarkers?.highContext) {
      // More patience for indirect communication
      adapted.loopingIntensity = LoopingIntensity.FULL;
    }

    if (context.culturalMarkers?.communicationStyle === 'circular') {
      // Allow narrative to unfold
      adapted.loopingIntensity = LoopingIntensity.LIGHT;
    }

    // Emotional adaptations
    if (context.emotionalState?.trajectory === 'escalating') {
      // Reduce looping to avoid frustration
      adapted.loopingIntensity = LoopingIntensity.LIGHT;
    }

    if (context.emotionalState?.current === 'clear' &&
        context.emotionalState?.previous === 'confused') {
      // Breakthrough moment - no looping needed
      adapted.loopingIntensity = LoopingIntensity.LIGHT;
      adapted.targetExchanges = 1;
    }

    // Meta-commentary adaptations
    if (context.metaCommentary?.appreciation) {
      // User likes the checking - can be more thorough
      adapted.loopingIntensity = LoopingIntensity.FULL;
    }

    return adapted;
  }

  /**
   * Process with monitoring and metrics
   */
  private async processWithMonitoring(
    userInput: string,
    context: EnrichedContext
  ): Promise<WitnessResponse> {
    const sessionId = context.sessionId;

    // Process through witness service
    const response = await this.witnessService.witness(userInput, context);

    // Track in monitor
    if (response.loopingState) {
      loopingMonitor.trackSession(
        sessionId,
        context.userId,
        response.loopingState,
        { overallConvergence: response.loopingState.convergence } as any,
        userInput
      );
    }

    return response;
  }

  /**
   * Generate fail-safe response when looping is skipped
   */
  private generateFailSafeResponse(
    userInput: string,
    context: EnrichedContext,
    reason: string
  ): WitnessResponse {
    let response = '';

    // Crisis/urgency responses
    if (reason.includes('Crisis') || reason.includes('urgency')) {
      response = this.generateUrgencyResponse(userInput, context);
    }
    // Cultural adaptation responses
    else if (reason.includes('Direct communication')) {
      response = this.generateDirectResponse(userInput, context);
    }
    // Meta resistance responses
    else if (reason.includes('Protocol resistance')) {
      response = this.generatePureWitnessResponse(userInput, context);
    }
    // Default fallback
    else {
      response = getFallbackResponse(
        'disabled',
        context.elementalMode
      );
    }

    return {
      response,
      shouldLoop: false,
      nextAction: 'direct'
    };
  }

  // Helper methods for detection

  private detectCulturalMarkers(input: string): EnrichedContext['culturalMarkers'] {
    const lowerInput = input.toLowerCase();

    // Indirect markers
    const indirectMarkers = ['perhaps', 'might be', 'if possible', 'when convenient'];
    const hasIndirect = indirectMarkers.some(m => lowerInput.includes(m));

    // Direct markers
    const directMarkers = ['exactly', 'precisely', 'specifically', 'must', 'need'];
    const hasDirect = directMarkers.some(m => lowerInput.includes(m));

    // Code-switching detection (simplified)
    const hasMultipleScripts = /[\u4e00-\u9fff]|[\u0600-\u06ff]|[\u0400-\u04ff]/.test(input);

    return {
      communicationStyle: hasIndirect ? 'indirect' : hasDirect ? 'direct' : 'mixed',
      highContext: hasIndirect && !hasDirect,
      codeSwitch: hasMultipleScripts
    };
  }

  private trackEmotionalState(
    input: string,
    context: WitnessContext
  ): EnrichedContext['emotionalState'] {
    // Simplified emotional tracking
    const emotions = {
      angry: ['angry', 'furious', 'pissed', 'mad'],
      sad: ['sad', 'depressed', 'down', 'blue'],
      anxious: ['anxious', 'worried', 'nervous', 'scared'],
      happy: ['happy', 'excited', 'joyful', 'great'],
      confused: ['confused', 'lost', 'unclear', 'unsure'],
      clear: ['realize', 'understand', 'see now', 'got it']
    };

    let current = 'neutral';
    const lowerInput = input.toLowerCase();

    for (const [emotion, markers] of Object.entries(emotions)) {
      if (markers.some(m => lowerInput.includes(m))) {
        current = emotion;
        break;
      }
    }

    // Get previous state from history
    const previous = this.getPreviousEmotionalState(context) || 'neutral';

    // Determine trajectory
    let trajectory: EnrichedContext['emotionalState']['trajectory'] = 'stable';
    if (current === 'angry' && previous !== 'angry') trajectory = 'escalating';
    if (current === 'clear' && previous === 'confused') trajectory = 'de-escalating';
    if (current !== previous && context.conversationHistory.length > 2) trajectory = 'volatile';

    return { current, previous, trajectory };
  }

  private detectUrgencySignals(input: string): EnrichedContext['urgencySignals'] {
    const lowerInput = input.toLowerCase();

    return {
      explicit: /urgent|emergency|immediately|right now|asap/.test(lowerInput),
      implied: /quick|hurry|fast|before|deadline/.test(lowerInput),
      crisis: /crisis|help me|can't go on|suicidal|harm/.test(lowerInput),
      timeConstraint: /minute|meeting|appointment|gotta go|gtg/.test(lowerInput)
    };
  }

  private detectMetaCommentary(input: string): EnrichedContext['metaCommentary'] {
    const lowerInput = input.toLowerCase();

    return {
      aboutProtocol: /why.*check|keep asking|you already|stop checking/.test(lowerInput),
      resistance: /stop asking|just listen|don't check|enough questions/.test(lowerInput),
      appreciation: /like how you|good that you|appreciate|helpful/.test(lowerInput)
    };
  }

  private hasAmbiguity(input: string): boolean {
    const ambiguityMarkers = ['maybe', 'kind of', 'sort of', 'not sure', 'confused', 'something'];
    return ambiguityMarkers.some(m => input.toLowerCase().includes(m));
  }

  private countRecentLoops(context: WitnessContext): number {
    const oneMinuteAgo = new Date(Date.now() - 60000);
    return context.conversationHistory.filter(turn =>
      turn.role === 'maya' &&
      turn.loopIteration !== undefined &&
      turn.timestamp > oneMinuteAgo
    ).length;
  }

  private getPreviousEmotionalState(context: WitnessContext): string | null {
    // Implementation would track emotional states across conversation
    return null;
  }

  // Response generators

  private generateUrgencyResponse(input: string, context: EnrichedContext): string {
    const urgencyResponses = {
      fire: "I'm here with you right now. What needs immediate attention?",
      water: "I feel the urgency. What's most pressing in this moment?",
      earth: "Let's focus on what's needed right now.",
      air: "I see this is time-sensitive. What's the essential piece?",
      aether: "I'm fully present with what's arising. What needs witnessing now?"
    };

    return urgencyResponses[context.elementalMode] || urgencyResponses.aether;
  }

  private generateDirectResponse(input: string, context: EnrichedContext): string {
    // Simple, direct witnessing without loops
    const directResponses = {
      fire: "I see the clear intention in your words.",
      water: "I feel what you're expressing.",
      earth: "I understand the practical reality you're describing.",
      air: "The clarity of your thinking comes through.",
      aether: "I witness what you're bringing forward."
    };

    return directResponses[context.elementalMode] || directResponses.aether;
  }

  private generatePureWitnessResponse(input: string, context: EnrichedContext): string {
    // Pure reflection without any checking
    const pureWitness = {
      fire: "The flame of your experience burns bright.",
      water: "Your feelings flow with their own truth.",
      earth: "Your reality stands on its own ground.",
      air: "Your perspective carries its own clarity.",
      aether: "Your truth speaks for itself."
    };

    return pureWitness[context.elementalMode] || pureWitness.aether;
  }

  private generateQuickResponse(input: string, context: EnrichedContext): string {
    // Ultra-brief response when time is critical
    return getFallbackResponse('budget', context.elementalMode);
  }

  private generateFallbackResponse(input: string, context: WitnessContext): WitnessResponse {
    // Ultimate fallback - simple witnessing
    return {
      response: "I witness what you're sharing.",
      shouldLoop: false,
      nextAction: 'complete'
    };
  }

  /**
   * Get current protocol health metrics
   */
  getHealthMetrics(): {
    failSafeActivations: number;
    avgResponseTime: number;
    culturalAdaptations: number;
    urgencyDetections: number;
    protocolHealth: string;
  } {
    const dashboard = loopingMonitor.generateDashboard();

    return {
      failSafeActivations: dashboard.edgeCases.length,
      avgResponseTime: 0, // Would track actual response times
      culturalAdaptations: 0, // Would track cultural adaptations
      urgencyDetections: dashboard.edgeCases.filter(e =>
        e.type === 'crisis' || e.context.includes('urgent')
      ).length,
      protocolHealth: dashboard.summary.avgConvergenceRate > 0.7 ? '✅ Healthy' : '⚠️ Needs Attention'
    };
  }
}

// Export singleton instance
export const loopingIntegration = new LoopingProtocolIntegration();