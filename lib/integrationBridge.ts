/**
 * 🌉 Integration Bridge - Connect Philosophy to Production
 * 
 * Wires together all the built modules into a working system
 * for Soullab.life chat agent
 */

import { ResonanceEngine } from './resonanceEngine';
import { SacredPresenceEngine } from './sacredPresenceEngine';
import { DualTrackProcessor, DualTrackState } from './dualTrackProcessor';
import { StyleResonanceCalibrator } from './styleResonanceCalibrator';
import { ResonanceHysteresis } from './resonanceHysteresis';
import { SweetSpotCalibrator } from './sweetSpotCalibration';

export interface MayaState {
  // Core presence
  element: string;
  intensity: number;
  
  // Archetypal awareness
  archetype?: {
    primary?: string;
    secondary?: string[];
    emerging?: string;
    confidence: number;
  };
  
  // Communication style
  style: string;
  styleConfidence: number;
  
  // Conversation flow
  exchangeCount: number;
  needsCompletion: boolean;
  
  // Dual-track state
  dualTrack?: DualTrackState;
}

export class MayaIntegrationBridge {
  private resonanceEngine: ResonanceEngine;
  private presenceEngine: SacredPresenceEngine;
  private dualTrackProcessor: DualTrackProcessor;
  private styleCalibrator: StyleResonanceCalibrator;
  private resonanceHysteresis: ResonanceHysteresis;
  private sweetSpotCalibrator: SweetSpotCalibrator;
  
  constructor() {
    this.resonanceEngine = new ResonanceEngine();
    this.presenceEngine = new SacredPresenceEngine();
    this.dualTrackProcessor = new DualTrackProcessor();
    this.styleCalibrator = new StyleResonanceCalibrator();
    this.resonanceHysteresis = new ResonanceHysteresis();
    this.sweetSpotCalibrator = new SweetSpotCalibrator();
  }
  
  /**
   * Main processing pipeline for Maya
   */
  async process(
    input: string,
    userId: string,
    conversationHistory: string[] = []
  ): Promise<{
    response: string;
    state: MayaState;
    metadata: any;
  }> {
    // 1. ELEMENTAL RESONANCE - What energy is present?
    const resonanceState = this.resonanceEngine.detect(input);
    
    // 2. DUAL-TRACK PROCESSING - Archetypes + Novelty
    const dualTrack = this.dualTrackProcessor.process(
      input,
      conversationHistory
    );
    
    // 3. STYLE CALIBRATION - How to speak?
    const styleCalibration = this.styleCalibrator.detectStyle(
      input,
      conversationHistory
    );
    
    // 4. STYLE HYSTERESIS - Smooth transitions
    const stabilizedStyle = this.resonanceHysteresis.processStyleSignal(
      styleCalibration.primary,
      styleCalibration.readyForDepth ? 0.7 : 0.4
    );
    
    // 5. CONVERSATION FLOW - Where in the arc?
    const exchangeCount = conversationHistory.length / 2;
    const flow = {
      exchangeCount,
      timeInMinutes: exchangeCount * 2, // Rough estimate
      processingDepth: this.determineDepth(dualTrack),
      userNeed: this.sweetSpotCalibrator.detectUserNeed(input, conversationHistory)
    };
    
    // 6. GENERATE RESPONSE based on all factors
    let response: string;
    
    // Check for over-processing first
    if (exchangeCount > 5) {
      response = this.presenceEngine.redirectToLife();
    }
    // High novelty - pure witnessing
    else if (dualTrack.rightTrack.unnamedPresence) {
      response = this.generateWitnessingResponse(dualTrack, resonanceState);
    }
    // Clear archetype - gentle naming
    else if (dualTrack.integration.confidenceInNaming > 0.7) {
      response = this.generateArchetypalResponse(dualTrack, resonanceState);
    }
    // Default - sacred presence
    else {
      response = this.generatePresenceResponse(resonanceState, flow);
    }
    
    // 7. APPLY STYLE CALIBRATION
    response = this.styleCalibrator.adaptResponse(
      response,
      stabilizedStyle,
      styleCalibration.shadowPresent
    );
    
    // 8. CHECK FOR COMPLETION
    const needsCompletion = exchangeCount >= 3 && 
                           flow.userNeed !== 'crisis';
    
    if (needsCompletion) {
      response = this.addCompletionPrompt(response, resonanceState.dominant);
    }
    
    // Build state object
    const state: MayaState = {
      element: resonanceState.dominant,
      intensity: resonanceState.intensity,
      archetype: this.extractArchetype(dualTrack),
      style: stabilizedStyle,
      styleConfidence: this.resonanceHysteresis.getTransitionState().confidence,
      exchangeCount,
      needsCompletion,
      dualTrack
    };
    
    // Build metadata
    const metadata = {
      resonance: resonanceState,
      dualTrack: {
        mode: dualTrack.integration.dominantMode,
        suggestion: dualTrack.integration.suggestedResponse
      },
      styleTransition: this.resonanceHysteresis.getTransitionState(),
      sweetSpot: flow
    };
    
    return { response, state, metadata };
  }
  
  /**
   * Generate pure witnessing response (high novelty)
   */
  private generateWitnessingResponse(
    dualTrack: DualTrackState,
    resonance: any
  ): string {
    const { livingQuality, wholeness } = dualTrack.rightTrack;
    
    return `I'm witnessing ${wholeness} in you. ${livingQuality} feels most alive. What wants to stay unnamed for now?`;
  }
  
  /**
   * Generate archetypal response (clear pattern)
   */
  private generateArchetypalResponse(
    dualTrack: DualTrackState,
    resonance: any
  ): string {
    const archetype = dualTrack.leftTrack.categoricalSuggestion;
    const { livingQuality } = dualTrack.rightTrack;
    
    if (dualTrack.leftTrack.hybridExpressions.length > 0) {
      const fusion = dualTrack.leftTrack.hybridExpressions[0];
      return `I see ${fusion.components.join(' dancing with ')} in you. ${livingQuality}. How do these energies move together in your experience?`;
    }
    
    return `The ${archetype} energy is present. But more than that, ${livingQuality}. What experiment does this archetype want to run through you?`;
  }
  
  /**
   * Generate sacred presence response (default)
   */
  private generatePresenceResponse(
    resonance: any,
    flow: any
  ): string {
    const presenceState = {
      element: resonance.dominant,
      intensity: resonance.intensity,
      soulKnowing: resonance.intensity > 0.5,
      collectiveResonance: 0.7,
      anamnesisActive: true
    };
    
    return this.presenceEngine.sacredMirror('', presenceState);
  }
  
  /**
   * Add completion prompt when approaching sweet spot limit
   */
  private addCompletionPrompt(response: string, element: string): string {
    const completions: Record<string, string> = {
      fire: " Ready to take this spark into life?",
      water: " What needs to flow in your actual day?",
      earth: " What's the concrete next step?",
      air: " How will you test this clarity?",
      aether: " Ready to live this mystery?"
    };
    
    return response + (completions[element] || " What wants to happen next in your life?");
  }
  
  /**
   * Extract archetype info from dual-track
   */
  private extractArchetype(dualTrack: DualTrackState) {
    if (!dualTrack.leftTrack.categoricalSuggestion) {
      return undefined;
    }
    
    return {
      primary: dualTrack.leftTrack.categoricalSuggestion,
      secondary: Array.from(dualTrack.leftTrack.knownPatterns.keys()).slice(1, 3),
      emerging: dualTrack.leftTrack.novelSignals[0]?.possibleName,
      confidence: dualTrack.integration.confidenceInNaming
    };
  }
  
  /**
   * Determine processing depth from dual-track
   */
  private determineDepth(dualTrack: DualTrackState): 'surface' | 'exploring' | 'deep' | 'looping' {
    if (dualTrack.rightTrack.unnamedPresence) return 'deep';
    if (dualTrack.integration.confidenceInNaming < 0.3) return 'exploring';
    if (dualTrack.integration.confidenceInNaming > 0.8) return 'surface';
    return 'exploring';
  }
}