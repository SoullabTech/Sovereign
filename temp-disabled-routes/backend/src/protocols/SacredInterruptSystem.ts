/**
 * Sacred Interrupt System
 * Temple bells that shift the ritual state when struck
 * Integrated safeguards that are part of the ceremony, not bolted on
 */

import { ElementalArchetype } from '../../../web/lib/types/elemental';
import { logger } from '../utils/logger';

/**
 * Sacred interrupts - bells in the temple
 * When struck, the ritual immediately shifts state
 */
export interface SacredInterrupt {
  bells: string[];           // Keywords that trigger interrupt
  resonance: 'emergency' | 'boundary' | 'time' | 'help';
  response: string;          // Ritual language for the shift
  nextState: 'witness' | 'support' | 'release' | 'honor';
}

/**
 * Protocol confidence - the ritual's humility
 * When uncertain, choose silence or gentleness
 */
export interface ProtocolConfidence {
  score: number;             // 0-1 confidence in using protocol
  factors: {
    triggerStrength: number;
    semanticClarity: number;
    emotionalStability: number;
    culturalCertainty: number;
  };
  recommendation: 'full_loop' | 'light_loop' | 'witness_only';
}

/**
 * Temple bells configuration
 * These are the sacred interrupts that shift ritual state
 */
export const TEMPLE_BELLS: Record<string, SacredInterrupt> = {
  emergency: {
    bells: ['emergency', 'urgent', 'crisis', 'help me', 'right now', '911'],
    resonance: 'emergency',
    response: "I hear the urgency bell ringing—let's focus on what's needed immediately.",
    nextState: 'support'
  },

  boundary: {
    bells: ['stop', 'enough', 'no more', 'quit', 'don\'t', 'leave me alone'],
    resonance: 'boundary',
    response: "I hear your boundary clearly—I'll honor it completely.",
    nextState: 'honor'
  },

  time: {
    bells: ['minute', 'quickly', 'hurry', 'gotta go', 'no time', 'meeting'],
    resonance: 'time',
    response: "I hear time is precious right now—let me be brief.",
    nextState: 'witness'
  },

  help: {
    bells: ['need help', 'what do i do', 'tell me', 'guide me', 'advice'],
    resonance: 'help',
    response: "I hear you asking directly—let's pause the checking.",
    nextState: 'support'
  }
};

/**
 * Confidence thresholds for protocol decisions
 */
export const CONFIDENCE_THRESHOLDS = {
  high: 0.7,      // Full protocol engagement
  medium: 0.5,    // Light touch only
  low: 0.3        // Witness only, no protocol
};

/**
 * Sacred Interrupt System - integrated into the ritual flow
 */
export class SacredInterruptSystem {
  private bellLog: Array<{
    timestamp: Date;
    bell: string;
    resonance: string;
    shifted: boolean;
  }> = [];

  /**
   * Listen for temple bells in user input
   * This happens BEFORE any other processing
   */
  listenForBells(input: string): {
    bellHeard: boolean;
    interrupt?: SacredInterrupt;
    ritualResponse?: string;
  } {
    const lowerInput = input.toLowerCase();

    // Check each set of temple bells
    for (const [bellName, interrupt] of Object.entries(TEMPLE_BELLS)) {
      for (const bell of interrupt.bells) {
        if (lowerInput.includes(bell)) {
          // Log the bell ring
          this.logBellRing(bell, interrupt.resonance);

          // Return the interrupt with ritual language
          return {
            bellHeard: true,
            interrupt,
            ritualResponse: this.craftRitualResponse(interrupt, input)
          };
        }
      }
    }

    return { bellHeard: false };
  }

  /**
   * Calculate protocol confidence - the ritual's self-awareness
   */
  calculateConfidence(
    input: string,
    context: {
      triggerStrength?: number;
      emotionalClarity?: number;
      culturalContext?: string;
      previousAttempts?: number;
    }
  ): ProtocolConfidence {
    const factors = {
      triggerStrength: context.triggerStrength || this.assessTriggerStrength(input),
      semanticClarity: this.assessSemanticClarity(input),
      emotionalStability: this.assessEmotionalStability(input, context),
      culturalCertainty: this.assessCulturalCertainty(input, context.culturalContext)
    };

    // Calculate weighted confidence
    const weights = {
      trigger: 0.3,
      semantic: 0.3,
      emotional: 0.2,
      cultural: 0.2
    };

    const score =
      factors.triggerStrength * weights.trigger +
      factors.semanticClarity * weights.semantic +
      factors.emotionalStability * weights.emotional +
      factors.culturalCertainty * weights.cultural;

    // Determine recommendation based on confidence
    let recommendation: ProtocolConfidence['recommendation'];
    if (score > CONFIDENCE_THRESHOLDS.high) {
      recommendation = 'full_loop';
    } else if (score > CONFIDENCE_THRESHOLDS.medium) {
      recommendation = 'light_loop';
    } else {
      recommendation = 'witness_only';
    }

    // Reduce confidence if we've tried before
    const adjustedScore = context.previousAttempts
      ? score * Math.pow(0.8, context.previousAttempts)
      : score;

    return {
      score: adjustedScore,
      factors,
      recommendation
    };
  }

  /**
   * Craft ritual response for interrupt
   */
  private craftRitualResponse(interrupt: SacredInterrupt, input: string): string {
    const elementalResponses: Record<string, Record<string, string>> = {
      emergency: {
        fire: "The fire of urgency burns—I'm here with immediate presence.",
        water: "I feel the urgent current—let's flow with what's needed now.",
        earth: "This needs grounding now—I'm here with practical support.",
        air: "The winds shift to urgency—let's clarify what's essential.",
        aether: "The moment calls for immediate presence—I'm fully here."
      },
      boundary: {
        fire: "Your boundary is sacred fire—I honor it completely.",
        water: "I feel your boundary like a shore—I'll respect its edge.",
        earth: "Your boundary stands firm—I ground myself in respect.",
        air: "Your boundary clears the air—I honor your space.",
        aether: "Your boundary is holy—I witness and withdraw."
      },
      time: {
        fire: "Time burns quickly—let me be a brief spark.",
        water: "Time flows fast—I'll be a gentle current.",
        earth: "Time is precious ground—I'll be solid and brief.",
        air: "Time moves swiftly—I'll be clear and quick.",
        aether: "Time contracts—I'll hold essence only."
      },
      help: {
        fire: "You seek the guiding flame—I'll share what light I have.",
        water: "You seek the healing waters—I'll offer what flows through me.",
        earth: "You seek solid ground—I'll share what foundation I can.",
        air: "You seek clarity—I'll offer what perspective I hold.",
        aether: "You seek wisdom—I'll share what the silence speaks."
      }
    };

    // Default to interrupt's base response if no elemental match
    return interrupt.response;
  }

  /**
   * Assess trigger strength from input
   */
  private assessTriggerStrength(input: string): number {
    const triggers = {
      high: ['really', 'very', 'so', 'extremely', 'totally', 'completely'],
      medium: ['quite', 'pretty', 'somewhat', 'fairly', 'rather'],
      low: ['maybe', 'perhaps', 'might', 'possibly', 'slightly']
    };

    const lowerInput = input.toLowerCase();

    if (triggers.high.some(t => lowerInput.includes(t))) return 0.9;
    if (triggers.medium.some(t => lowerInput.includes(t))) return 0.6;
    if (triggers.low.some(t => lowerInput.includes(t))) return 0.3;

    return 0.5; // Neutral
  }

  /**
   * Assess semantic clarity of input
   */
  private assessSemanticClarity(input: string): number {
    // Clear statements vs ambiguous ones
    const ambiguousMarkers = ['something', 'stuff', 'things', 'whatever', 'somehow'];
    const clearMarkers = ['specifically', 'exactly', 'precisely', 'clearly'];

    const lowerInput = input.toLowerCase();

    let clarity = 0.5;
    ambiguousMarkers.forEach(m => {
      if (lowerInput.includes(m)) clarity -= 0.1;
    });
    clearMarkers.forEach(m => {
      if (lowerInput.includes(m)) clarity += 0.15;
    });

    // Longer, structured sentences tend to be clearer
    const wordCount = input.split(' ').length;
    if (wordCount > 15) clarity += 0.1;
    if (wordCount < 5) clarity -= 0.1;

    return Math.max(0, Math.min(1, clarity));
  }

  /**
   * Assess emotional stability
   */
  private assessEmotionalStability(input: string, context: any): number {
    const volatileMarkers = ['angry', 'furious', 'panic', 'terrified', 'desperate'];
    const stableMarkers = ['calm', 'clear', 'centered', 'grounded', 'peaceful'];

    const lowerInput = input.toLowerCase();

    let stability = 0.6;
    volatileMarkers.forEach(m => {
      if (lowerInput.includes(m)) stability -= 0.2;
    });
    stableMarkers.forEach(m => {
      if (lowerInput.includes(m)) stability += 0.2;
    });

    // Multiple exclamation marks suggest instability
    const exclamationCount = (input.match(/!/g) || []).length;
    stability -= exclamationCount * 0.1;

    // ALL CAPS suggests emotional intensity
    if (input === input.toUpperCase() && input.length > 5) {
      stability -= 0.3;
    }

    return Math.max(0, Math.min(1, stability));
  }

  /**
   * Assess cultural certainty
   */
  private assessCulturalCertainty(input: string, culturalContext?: string): number {
    // If we don't know the cultural context, be conservative
    if (!culturalContext) return 0.5;

    // Code-switching suggests complexity
    const hasMultipleScripts = /[\u4e00-\u9fff]|[\u0600-\u06ff]|[\u0400-\u04ff]/.test(input);
    if (hasMultipleScripts) return 0.3;

    // Indirect communication patterns
    const indirectMarkers = ['perhaps', 'might be', 'if possible', 'when convenient'];
    const hasIndirect = indirectMarkers.some(m => input.toLowerCase().includes(m));

    // Direct communication patterns
    const directMarkers = ['need', 'want', 'must', 'will', 'won\'t'];
    const hasDirect = directMarkers.some(m => input.toLowerCase().includes(m));

    if (hasIndirect && !hasDirect) return 0.4; // Less certain with indirect
    if (hasDirect && !hasIndirect) return 0.8; // More certain with direct

    return 0.6; // Mixed signals
  }

  /**
   * Log bell ring for monitoring
   */
  private logBellRing(bell: string, resonance: string): void {
    this.bellLog.push({
      timestamp: new Date(),
      bell,
      resonance,
      shifted: true
    });

    logger.info(`Temple bell struck: ${bell} (${resonance})`);

    // Keep only last 100 bell rings
    if (this.bellLog.length > 100) {
      this.bellLog = this.bellLog.slice(-100);
    }
  }

  /**
   * Get confidence fallback response based on level
   */
  getConfidenceFallback(
    confidence: ProtocolConfidence,
    element: ElementalArchetype
  ): string {
    const fallbacks = {
      full_loop: null, // Use normal protocol

      light_loop: {
        fire: "Let me check briefly—is this the spark?",
        water: "Let me feel this gently—is this the current?",
        earth: "Let me ground this simply—is this the foundation?",
        air: "Let me clarify quickly—is this the pattern?",
        aether: "Let me hold this lightly—is this the essence?"
      },

      witness_only: {
        fire: "I'll witness the flame without checking further.",
        water: "I'll hold space for what flows without questioning.",
        earth: "I'll ground in your reality without verifying.",
        air: "I'll see your perspective without clarifying.",
        aether: "I'll be present with the mystery without probing."
      }
    };

    if (confidence.recommendation === 'full_loop') {
      return null; // Use normal protocol
    }

    return fallbacks[confidence.recommendation][element] ||
           fallbacks[confidence.recommendation].aether;
  }

  /**
   * Generate ritual status for monitoring
   */
  getRitualStatus(): {
    recentBells: number;
    averageConfidence: number;
    protocolHealth: string;
    recommendation: string;
  } {
    const recentWindow = new Date(Date.now() - 3600000); // Last hour
    const recentBells = this.bellLog.filter(b => b.timestamp > recentWindow).length;

    // This would track actual confidence scores
    const averageConfidence = 0.65; // Placeholder

    let protocolHealth = '🟢 Flowing';
    let recommendation = 'Ritual proceeding normally';

    if (recentBells > 10) {
      protocolHealth = '🔴 Many interrupts';
      recommendation = 'High interrupt rate - review triggers';
    } else if (averageConfidence < 0.5) {
      protocolHealth = '🟡 Low confidence';
      recommendation = 'Protocol uncertain - defaulting to witness mode';
    }

    return {
      recentBells,
      averageConfidence,
      protocolHealth,
      recommendation
    };
  }
}

// Export singleton for consistent ritual state
export const sacredInterrupts = new SacredInterruptSystem();