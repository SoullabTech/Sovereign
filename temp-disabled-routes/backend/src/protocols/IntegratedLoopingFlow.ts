/**
 * Integrated Looping Flow
 * Sacred interrupts and confidence woven into the ritual itself
 * Not bolted on, but part of the ceremony
 */

import { MayaWitnessService, WitnessContext, WitnessResponse } from '../services/MayaWitnessService';
import { sacredInterrupts, ProtocolConfidence } from './SacredInterruptSystem';
import { catastrophicGuard } from './CatastrophicFailureGuard';
import { loopingMonitor } from './LoopingMonitor';
import { LoopingState, LoopingTriggers } from './LoopingProtocol';
import { ElementalArchetype } from '../../../web/lib/types/elemental';
import { logger } from '../utils/logger';

/**
 * The complete ritual flow with integrated safeguards
 * Each step is part of the ceremony, not a safety check
 */
export class IntegratedLoopingFlow {
  private witnessService: MayaWitnessService;

  constructor() {
    this.witnessService = new MayaWitnessService();
  }

  /**
   * THE SACRED FLOW
   * User Input → Temple Bells → Confidence → Protocol Decision → Response
   */
  async performRitual(
    userInput: string,
    context: WitnessContext
  ): Promise<WitnessResponse> {
    const ritualLog = {
      timestamp: new Date(),
      input: userInput,
      steps: [] as string[]
    };

    try {
      // ═══════════════════════════════════════════════════════════════
      // STEP 1: LISTEN FOR TEMPLE BELLS (Sacred Interrupts)
      // ═══════════════════════════════════════════════════════════════
      const bells = sacredInterrupts.listenForBells(userInput);

      if (bells.bellHeard) {
        ritualLog.steps.push(`Temple bell struck: ${bells.interrupt.resonance}`);

        // The ritual shifts state immediately
        return {
          response: bells.ritualResponse || bells.interrupt.response,
          shouldLoop: false,
          nextAction: bells.interrupt.nextState as any
        };
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 2: CHECK CATASTROPHIC SIGNALS (Absolute Safety)
      // ═══════════════════════════════════════════════════════════════
      const catastrophic = catastrophicGuard.detectCatastrophic(userInput);

      if (catastrophic.detected) {
        ritualLog.steps.push(`Catastrophic detected: ${catastrophic.category}`);

        // Immediate bypass with crisis response
        return {
          response: catastrophic.response,
          shouldLoop: false,
          nextAction: 'complete'
        };
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 3: CALCULATE PROTOCOL CONFIDENCE (Ritual Humility)
      // ═══════════════════════════════════════════════════════════════
      const confidence = sacredInterrupts.calculateConfidence(userInput, {
        triggerStrength: this.assessTriggers(userInput),
        emotionalClarity: this.assessEmotionalClarity(context),
        culturalContext: this.detectCulturalContext(userInput),
        previousAttempts: context.currentState?.loopCount
      });

      ritualLog.steps.push(`Confidence: ${confidence.score.toFixed(2)} → ${confidence.recommendation}`);

      // ═══════════════════════════════════════════════════════════════
      // STEP 4: RITUAL DECISION BASED ON CONFIDENCE
      // ═══════════════════════════════════════════════════════════════

      // LOW CONFIDENCE → Pure Witnessing
      if (confidence.recommendation === 'witness_only') {
        const witnessResponse = sacredInterrupts.getConfidenceFallback(
          confidence,
          context.elementalMode
        );

        return {
          response: witnessResponse,
          shouldLoop: false,
          nextAction: 'deepen'
        };
      }

      // MEDIUM CONFIDENCE → Light Touch (Single Loop)
      if (confidence.recommendation === 'light_loop') {
        // Modify context for light looping
        const lightContext = {
          ...context,
          loopingIntensity: 'light' as any,
          targetExchanges: Math.min(context.targetExchanges, 2)
        };

        // Process with constraints
        const response = await this.witnessService.witness(userInput, lightContext);

        // Force single iteration
        if (response.loopingState && response.loopingState.loopCount >= 1) {
          response.shouldLoop = false;
          response.nextAction = 'transition';
        }

        return response;
      }

      // HIGH CONFIDENCE → Full Protocol
      if (confidence.recommendation === 'full_loop') {
        // ════════════════════════════════════════════════════════════
        // STEP 5: ANALYZE TRIGGERS (Normal Flow)
        // ════════════════════════════════════════════════════════════
        const triggers = this.analyzeTriggers(userInput, context);

        ritualLog.steps.push(`Triggers analyzed: emotional=${triggers.emotionalIntensity.toFixed(2)}`);

        // ════════════════════════════════════════════════════════════
        // STEP 6: PROCESS THROUGH WITNESS SERVICE
        // ════════════════════════════════════════════════════════════
        const response = await this.witnessService.witness(userInput, context);

        // ════════════════════════════════════════════════════════════
        // STEP 7: MONITOR AND LOG
        // ════════════════════════════════════════════════════════════
        if (response.loopingState) {
          loopingMonitor.trackSession(
            context.sessionId,
            context.userId,
            response.loopingState,
            { overallConvergence: response.loopingState.convergence } as any,
            userInput
          );
        }

        return response;
      }

      // Fallback (should never reach)
      return {
        response: "I witness what you're sharing.",
        shouldLoop: false,
        nextAction: 'complete'
      };

    } catch (error) {
      logger.error('Ritual error', error);
      ritualLog.steps.push('Error - falling back to pure witness');

      // Graceful fallback
      return {
        response: this.generateGracefulFallback(context.elementalMode),
        shouldLoop: false,
        nextAction: 'complete'
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // HELPER METHODS FOR ASSESSMENT
  // ═══════════════════════════════════════════════════════════════════

  private assessTriggers(input: string): number {
    // Simplified trigger assessment
    const emotionalMarkers = ['feel', 'feeling', 'emotion', 'heart'];
    const ambiguityMarkers = ['maybe', 'perhaps', 'sort of', 'kind of'];

    const lowerInput = input.toLowerCase();
    let strength = 0.5;

    emotionalMarkers.forEach(m => {
      if (lowerInput.includes(m)) strength += 0.1;
    });

    ambiguityMarkers.forEach(m => {
      if (lowerInput.includes(m)) strength += 0.05;
    });

    return Math.min(1, strength);
  }

  private assessEmotionalClarity(context: WitnessContext): number {
    // Check conversation history for emotional consistency
    if (context.conversationHistory.length < 2) return 0.5;

    // Look for emotional words in recent history
    const recentEmotions = context.conversationHistory
      .slice(-3)
      .filter(turn => turn.role === 'user')
      .map(turn => this.extractEmotionalTone(turn.content));

    // Consistent emotions = higher clarity
    const uniqueEmotions = new Set(recentEmotions).size;
    return uniqueEmotions === 1 ? 0.8 : 0.5;
  }

  private extractEmotionalTone(text: string): string {
    const tones = {
      positive: ['happy', 'excited', 'grateful', 'joy'],
      negative: ['sad', 'angry', 'frustrated', 'upset'],
      anxious: ['worried', 'anxious', 'nervous', 'scared'],
      confused: ['confused', 'lost', 'uncertain', 'unclear']
    };

    const lowerText = text.toLowerCase();

    for (const [tone, markers] of Object.entries(tones)) {
      if (markers.some(m => lowerText.includes(m))) {
        return tone;
      }
    }

    return 'neutral';
  }

  private detectCulturalContext(input: string): string {
    // Simplified cultural detection
    if (/[\u4e00-\u9fff]/.test(input)) return 'chinese';
    if (/[\u0600-\u06ff]/.test(input)) return 'arabic';
    if (/[\u0400-\u04ff]/.test(input)) return 'cyrillic';
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(input)) return 'japanese';

    // Detect indirect English patterns
    const indirectMarkers = ['perhaps', 'might', 'possibly', 'if you could'];
    if (indirectMarkers.some(m => input.toLowerCase().includes(m))) {
      return 'indirect_english';
    }

    return 'direct_english';
  }

  private analyzeTriggers(input: string, context: WitnessContext): LoopingTriggers {
    const lowerInput = input.toLowerCase();

    return {
      emotionalIntensity: this.calculateEmotionalIntensity(input),
      meaningAmbiguity: this.calculateAmbiguity(input),
      userCorrection: this.detectCorrection(input),
      essentialityGap: this.calculateEssentialityGap(input),
      explicitRequest: this.detectExplicitRequest(input)
    };
  }

  private calculateEmotionalIntensity(input: string): number {
    const markers = ['feel', 'feeling', 'emotion', 'heart', 'soul'];
    const intensifiers = ['really', 'very', 'so', 'extremely'];

    const lowerInput = input.toLowerCase();
    let intensity = 0;

    markers.forEach(m => {
      if (lowerInput.includes(m)) intensity += 0.2;
    });

    intensifiers.forEach(i => {
      if (lowerInput.includes(i)) intensity += 0.1;
    });

    return Math.min(1, intensity);
  }

  private calculateAmbiguity(input: string): number {
    const ambiguousMarkers = ['maybe', 'perhaps', 'sort of', 'kind of', 'something'];
    const lowerInput = input.toLowerCase();

    let ambiguity = 0;
    ambiguousMarkers.forEach(m => {
      if (lowerInput.includes(m)) ambiguity += 0.2;
    });

    return Math.min(1, ambiguity);
  }

  private detectCorrection(input: string): boolean {
    const correctionPhrases = ['no, it\'s', 'actually', 'more like', 'not quite'];
    return correctionPhrases.some(p => input.toLowerCase().includes(p));
  }

  private calculateEssentialityGap(input: string): number {
    // Simplified - looks for surface vs depth language
    const surfaceWords = ['stuff', 'things', 'whatever'];
    const depthWords = ['essence', 'core', 'heart', 'soul', 'truth'];

    const lowerInput = input.toLowerCase();
    let gap = 0;

    surfaceWords.forEach(w => {
      if (lowerInput.includes(w)) gap += 0.2;
    });

    depthWords.forEach(w => {
      if (lowerInput.includes(w)) gap += 0.15;
    });

    return Math.min(1, gap);
  }

  private detectExplicitRequest(input: string): boolean {
    const requests = ['help me understand', 'what do you mean', 'can you clarify'];
    return requests.some(r => input.toLowerCase().includes(r));
  }

  private generateGracefulFallback(element: ElementalArchetype): string {
    const fallbacks = {
      fire: "I witness the flame of your experience.",
      water: "I hold space for what flows through you.",
      earth: "I ground myself in your reality.",
      air: "I see the patterns you're weaving.",
      aether: "I'm present with the mystery you bring."
    };

    return fallbacks[element] || fallbacks.aether;
  }

  /**
   * Get ritual flow status for monitoring
   */
  getRitualFlowStatus(): {
    bellsActive: boolean;
    averageConfidence: number;
    protocolHealth: string;
    flowState: string;
  } {
    const ritualStatus = sacredInterrupts.getRitualStatus();
    const catastrophicStatus = catastrophicGuard.getDashboardData();

    let flowState = '🌊 Flowing';
    if (catastrophicStatus.status === 'critical') {
      flowState = '🚨 Crisis Mode';
    } else if (ritualStatus.averageConfidence < 0.5) {
      flowState = '🕊️ Witness Mode';
    } else if (ritualStatus.recentBells > 5) {
      flowState = '🔔 Many Interrupts';
    }

    return {
      bellsActive: ritualStatus.recentBells > 0,
      averageConfidence: ritualStatus.averageConfidence,
      protocolHealth: ritualStatus.protocolHealth,
      flowState
    };
  }
}

// Export singleton for consistent ritual state
export const integratedFlow = new IntegratedLoopingFlow();

/**
 * INSERTION POINTS FOR LoopingMonitor.ts
 *
 * Replace the existing trackSession method with:
 */
export const LOOPING_MONITOR_INTEGRATION = `
// In LoopingMonitor.ts, replace trackSession with:

async trackSession(
  sessionId: string,
  userId: string,
  userInput: string,
  context: WitnessContext
): void {
  // INSERTION POINT 1: Temple Bells Check
  const bells = sacredInterrupts.listenForBells(userInput);
  if (bells.bellHeard) {
    this.recordEdgeCase({
      type: 'sacred_interrupt',
      timestamp: new Date(),
      context: \`Bell: \${bells.interrupt.resonance}\`,
      resolution: 'Ritual state shifted'
    });
    return; // No further tracking needed
  }

  // INSERTION POINT 2: Confidence Assessment
  const confidence = sacredInterrupts.calculateConfidence(userInput, {
    triggerStrength: state.depthInference.elemental.intensity,
    emotionalClarity: convergence.emotionalResonance,
    culturalContext: this.detectCulturalContext(userInput)
  });

  // INSERTION POINT 3: Confidence-Based Decision
  if (confidence.score < 0.5) {
    this.recordEdgeCase({
      type: 'low_confidence_bypass',
      timestamp: new Date(),
      context: \`Confidence: \${confidence.score}\`,
      resolution: 'Defaulted to witness mode'
    });
    return; // Skip looping
  }

  // Continue with normal tracking...
}
`;