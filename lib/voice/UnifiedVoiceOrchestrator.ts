/**
 * Unified Voice Orchestrator
 * Connects all voice systems into cohesive whole
 * Utterance → Prosody → Delivery
 */

import { MayaUtteranceEngine, prepareForSpeech, MAYA_UTTERANCE_CONFIG } from './MayaVoiceReference';
import { NaturalResponseFlow, ResponseContext } from './NaturalResponseFlow';
import { GenuineUtteranceGenerator, combineUtteranceWithResponse } from './GenuineUtteranceGenerator';
import { AutoProsodyEngine, ProsodyToTTS, utteranceWithAutoProsody } from './ProsodyLookupTable';
import { ElementalState } from '../types/elemental';

// ============================================================================
// UNIFIED VOICE CONTEXT
// ============================================================================

export interface UnifiedVoiceContext {
  userInput: string;
  mayaResponse: string;
  emotionalIntensity: number;
  complexity: number;
  elementalState?: ElementalState;
  conversationDepth: number;
  previousExchange?: string;
}

// ============================================================================
// VOICE OUTPUT
// ============================================================================

export interface VoiceOutput {
  // Final text to speak
  text: string;

  // TTS configuration
  ttsConfig: {
    voice: 'alloy';
    speed: number;
    model: 'tts-1' | 'tts-1-hd';
    prosodyHints?: any;
  };

  // Timing information
  timing: {
    pauseBefore: number;
    utteranceDuration: number;
    responseDuration: number;
    pauseAfter: number;
  };

  // Metadata
  metadata: {
    hasUtterance: boolean;
    utteranceType?: string;
    prosodyShape?: string;
    elementalInfluence?: string;
    isMythic?: boolean;
  };
}

// ============================================================================
// ORCHESTRATOR
// ============================================================================

export class UnifiedVoiceOrchestrator {
  private utteranceEngine: MayaUtteranceEngine;
  private mythicCounter = 0;
  private mythicThreshold = 50;

  constructor() {
    this.utteranceEngine = new MayaUtteranceEngine();
  }

  /**
   * Process complete voice output from user input to TTS-ready
   */
  processVoiceOutput(context: UnifiedVoiceContext): VoiceOutput {
    // Step 1: Clean response of formulaic patterns
    const naturalResponse = NaturalResponseFlow.generateNaturalResponse(
      context.mayaResponse,
      {
        userInput: context.userInput,
        previousExchange: context.previousExchange,
        hasShift: context.emotionalIntensity > 0.7
      }
    );

    // Step 2: Determine if utterance emerges
    const inputAnalysis = GenuineUtteranceGenerator.analyzeInput(context.userInput);
    const utterance = this.utteranceEngine.generateUtterance(
      {
        raw: context.userInput,
        isQuestion: inputAnalysis.type === 'question',
        complexity: context.complexity,
        emotionalWeight: context.emotionalIntensity,
        callsForResponse: true,
        hasUrgency: false,
        needsSpace: inputAnalysis.needsSpace
      },
      {
        previousExchange: context.previousExchange || null,
        emotionalShift: context.emotionalIntensity,
        significantPatternShift: inputAnalysis.hasSurprise,
        conversationDepth: context.conversationDepth,
        userState: this.determineUserState(inputAnalysis)
      },
      {
        valence: inputAnalysis.emotionalValence === 'positive' ? 'positive' :
                 inputAnalysis.emotionalValence === 'negative' ? 'negative' :
                 inputAnalysis.emotionalValence === 'mixed' ? 'mixed' : 'neutral',
        intensity: context.emotionalIntensity,
        stability: 0.5,
        trajectory: 'steady'
      }
    );

    // Step 3: Check for mythic variant opportunity
    const isMythic = this.checkMythicOpportunity(context);
    const finalUtterance = isMythic ? this.selectMythicVariant(utterance) : utterance;

    // Step 4: Get prosody shape for utterance
    let prosodyShape = null;
    let utteranceWithProsody = null;

    if (finalUtterance !== null && finalUtterance !== '') {
      utteranceWithProsody = utteranceWithAutoProsody(
        finalUtterance,
        { elemental: context.elementalState }
      );
      prosodyShape = utteranceWithProsody.prosody;
    }

    // Step 5: Combine utterance with response
    const combinedText = this.combineTextElements(
      finalUtterance,
      naturalResponse,
      prosodyShape
    );

    // Step 6: Prepare final text (remove stage directions)
    const finalText = prepareForSpeech(
      combinedText,
      context.userInput,
      {
        previousExchange: context.previousExchange || null,
        emotionalShift: context.emotionalIntensity,
        significantPatternShift: false,
        conversationDepth: context.conversationDepth,
        userState: 'exploring'
      }
    );

    // Step 7: Create TTS configuration
    const ttsConfig = this.createTTSConfig(utteranceWithProsody);

    // Step 8: Calculate timing
    const timing = this.calculateTiming(prosodyShape);

    // Step 9: Compile metadata
    const metadata = {
      hasUtterance: finalUtterance !== null && finalUtterance !== '',
      utteranceType: finalUtterance || undefined,
      prosodyShape: prosodyShape ?
        `${prosodyShape.length}-${prosodyShape.intensity}-${prosodyShape.texture}` :
        undefined,
      elementalInfluence: context.elementalState?.dominant,
      isMythic
    };

    return {
      text: finalText,
      ttsConfig,
      timing,
      metadata
    };
  }

  /**
   * Determine user's current state from input
   */
  private determineUserState(analysis: any): 'exploring' | 'processing' | 'releasing' | 'integrating' {
    if (analysis.type === 'heavyShare') return 'releasing';
    if (analysis.type === 'question' && analysis.complexity > 0.7) return 'exploring';
    if (analysis.emotionalValence === 'mixed') return 'processing';
    return 'integrating';
  }

  /**
   * Check if this is a mythic moment
   */
  private checkMythicOpportunity(context: UnifiedVoiceContext): boolean {
    this.mythicCounter++;

    // Higher probability in profound moments
    const profundity = context.emotionalIntensity * context.complexity;
    const mythicProbability = profundity > 0.8 ? 0.1 : 0.02;

    if (Math.random() < mythicProbability && this.mythicCounter > 10) {
      this.mythicCounter = 0;
      return true;
    }

    return false;
  }

  /**
   * Select mythic variant of utterance
   */
  private selectMythicVariant(utterance: string | null): string | null {
    const mythicVariants: Record<string, string> = {
      'Hmm': 'Mmm',      // Ancient knowing
      'Oh': 'yes',        // Whispered affirmation
      'Ahh': 'Ahhh',      // Extended recognition
      'Ha': 'Ha...',      // Release and amusement
      'Mm': 'Mmm...'      // Deep holding
    };

    if (!utterance) return null;
    return mythicVariants[utterance] || utterance;
  }

  /**
   * Combine utterance with response text
   */
  private combineTextElements(
    utterance: string | null,
    response: string,
    prosody: any
  ): string {
    if (!utterance) return response;

    // Check if this is silence
    if (utterance === '') {
      // Add silence marker for TTS
      return `... ${response}`;
    }

    // Add utterance with appropriate spacing
    const spacing = prosody && prosody.pauseAfter > 500 ? '... ' : ' ';
    return `${utterance}${spacing}${response}`;
  }

  /**
   * Create TTS configuration
   */
  private createTTSConfig(utteranceWithProsody: any): VoiceOutput['ttsConfig'] {
    const baseConfig = {
      voice: 'alloy' as const,
      speed: 0.95,
      model: 'tts-1-hd' as const
    };

    if (!utteranceWithProsody) {
      return baseConfig;
    }

    const ttsParams = utteranceWithProsody.ttsParams;

    return {
      ...baseConfig,
      speed: ttsParams.speed || baseConfig.speed,
      prosodyHints: ttsParams.hints
    };
  }

  /**
   * Calculate timing information
   */
  private calculateTiming(prosody: any): VoiceOutput['timing'] {
    if (!prosody) {
      return {
        pauseBefore: 0,
        utteranceDuration: 0,
        responseDuration: 3000, // Estimated
        pauseAfter: 0
      };
    }

    return {
      pauseBefore: prosody.pauseBefore || 0,
      utteranceDuration: prosody.duration || 0,
      responseDuration: 3000, // Would need actual calculation
      pauseAfter: prosody.pauseAfter || 0
    };
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Main entry point for voice processing
 */
export async function processForVoice(
  userInput: string,
  mayaResponse: string,
  options?: {
    emotionalIntensity?: number;
    complexity?: number;
    elementalState?: ElementalState;
    conversationDepth?: number;
    previousExchange?: string;
  }
): Promise<VoiceOutput> {
  const orchestrator = new UnifiedVoiceOrchestrator();

  return orchestrator.processVoiceOutput({
    userInput,
    mayaResponse,
    emotionalIntensity: options?.emotionalIntensity || 0.5,
    complexity: options?.complexity || 0.5,
    elementalState: options?.elementalState,
    conversationDepth: options?.conversationDepth || 0.5,
    previousExchange: options?.previousExchange
  });
}

/**
 * Quick check if response needs utterance
 */
export function needsUtterance(userInput: string): boolean {
  const analysis = GenuineUtteranceGenerator.analyzeInput(userInput);
  return analysis.complexity > 0.7 ||
         analysis.intensity > 0.8 ||
         analysis.type === 'heavyShare';
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  UnifiedVoiceOrchestrator,
  processForVoice,
  needsUtterance
};