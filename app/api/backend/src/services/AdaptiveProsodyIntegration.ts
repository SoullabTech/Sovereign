/**
 * Adaptive Prosody Integration
 * Connects AdaptiveProsodyEngine with ConversationalPipeline and Sesame CI
 */

import { Logger } from '../types/core';
import { AdaptiveProsodyEngine, ToneAnalysis, ProsodyResponse } from './AdaptiveProsodyEngine';

export interface AdaptiveConversationRequest {
  userId: string;
  message: string;
  voiceMetrics?: {
    pitch?: number;
    volume?: number;
    rate?: number;
    pauses?: number;
  };
  sessionContext?: any;
}

export interface AdaptiveConversationResponse {
  response: string;
  toneAnalysis: ToneAnalysis;
  prosodyResponse: ProsodyResponse;
  voiceUrl?: string;
  therapeuticGuidance: string;
  shapingParams: any;
}

export class AdaptiveProsodyIntegration {
  private prosodyEngine: AdaptiveProsodyEngine;
  
  constructor(
    private logger: Logger,
    private sesameClient?: any // Sesame CI client
  ) {
    this.prosodyEngine = new AdaptiveProsodyEngine(logger);
  }

  /**
   * Process conversation with adaptive prosody
   */
  async processAdaptiveConversation(
    request: AdaptiveConversationRequest,
    aiResponse: string
  ): Promise<AdaptiveConversationResponse> {
    try {
      // Step 1: Analyze user's tone
      this.logger.info('Analyzing user tone for adaptive response...');
      const toneAnalysis = await this.prosodyEngine.analyzeUserTone(
        request.message,
        request.voiceMetrics
      );
      
      this.logger.info(`Detected: ${toneAnalysis.dominantElement} element, ${toneAnalysis.energyLevel} energy`);
      
      // Step 2: Generate prosody response pattern
      const prosodyResponse = await this.prosodyEngine.generateAdaptiveResponse(
        toneAnalysis,
        aiResponse,
        this.determineTherapeuticIntent(toneAnalysis)
      );
      
      // Step 3: Apply CI shaping if available
      let shapedResponse = aiResponse;
      let voiceUrl: string | undefined;
      
      if (this.sesameClient) {
        const shapingParams = this.prosodyEngine.generateCIShapingParams(prosodyResponse);
        
        try {
          // Shape with mirroring phase first
          const mirrorShaping = await this.sesameClient.ciShape({
            text: prosodyResponse.mirrorPhase.text,
            style: prosodyResponse.mirrorPhase.element,
            speed: prosodyResponse.voiceParameters.speed,
            pitch: prosodyResponse.voiceParameters.pitch
          });
          
          // Then shape balancing phase
          const balanceShaping = await this.sesameClient.ciShape({
            text: prosodyResponse.balancePhase.text,
            style: prosodyResponse.balancePhase.element,
            speed: prosodyResponse.voiceParameters.speed * 0.95, // Slightly slower for balance
            pitch: prosodyResponse.voiceParameters.pitch * 0.8
          });
          
          // Combine shaped responses
          shapedResponse = `${mirrorShaping.text} ${balanceShaping.text}`;
          
          // Generate voice if CI supports it
          if (mirrorShaping.voiceUrl || balanceShaping.voiceUrl) {
            voiceUrl = balanceShaping.voiceUrl || mirrorShaping.voiceUrl;
          }
          
        } catch (error) {
          this.logger.warn('CI shaping failed, using unshaped response', error);
        }
      }
      
      // Step 4: Get therapeutic guidance
      const therapeuticGuidance = this.prosodyEngine.getTherapeuticGuidance(
        toneAnalysis.dominantElement,
        toneAnalysis.suggestedBalance
      );
      
      return {
        response: shapedResponse,
        toneAnalysis,
        prosodyResponse,
        voiceUrl,
        therapeuticGuidance,
        shapingParams: this.prosodyEngine.generateCIShapingParams(prosodyResponse)
      };
      
    } catch (error) {
      this.logger.error('Adaptive prosody processing failed', error);
      
      // Fallback to standard response
      return {
        response: aiResponse,
        toneAnalysis: this.getDefaultToneAnalysis(),
        prosodyResponse: this.getDefaultProsodyResponse(),
        therapeuticGuidance: 'Standard supportive response',
        shapingParams: {}
      };
    }
  }

  /**
   * Determine therapeutic intent based on tone analysis
   */
  private determineTherapeuticIntent(tone: ToneAnalysis): string {
    // High energy needs grounding
    if (tone.energyLevel === 'very_high' || tone.energyLevel === 'high') {
      return 'ground';
    }
    
    // Low energy needs activation
    if (tone.energyLevel === 'very_low' || tone.energyLevel === 'low') {
      return 'activate';
    }
    
    // Imbalanced elements need specific work
    if (tone.dominantElement === 'fire' && tone.needsBalancing) {
      return 'cool';
    }
    
    if (tone.dominantElement === 'water' && tone.needsBalancing) {
      return 'stabilize';
    }
    
    if (tone.dominantElement === 'earth' && tone.needsBalancing) {
      return 'elevate';
    }
    
    if (tone.dominantElement === 'air' && tone.needsBalancing) {
      return 'embody';
    }
    
    if (tone.dominantElement === 'aether' && tone.needsBalancing) {
      return 'ground';
    }
    
    return 'balance';
  }

  /**
   * Get default tone analysis for fallback
   */
  private getDefaultToneAnalysis(): ToneAnalysis {
    return {
      dominantElement: 'air',
      elementalBalance: {
        fire: 0.2,
        water: 0.2,
        earth: 0.2,
        air: 0.2,
        aether: 0.2
      },
      energyLevel: 'medium' as any,
      emotionalQualities: ['neutral'],
      tempo: 'moderate',
      needsBalancing: false,
      suggestedBalance: 'earth'
    };
  }

  /**
   * Get default prosody response for fallback
   */
  private getDefaultProsodyResponse(): ProsodyResponse {
    return {
      mirrorPhase: {
        element: 'air',
        duration: 'moderate',
        text: ''
      },
      balancePhase: {
        element: 'earth',
        transition: 'gentle',
        text: ''
      },
      voiceParameters: {
        speed: 1.0,
        pitch: 0,
        emphasis: 0.5,
        warmth: 0.5
      }
    };
  }
}

// Usage example for integration
export async function createAdaptiveResponse(
  userMessage: string,
  aiResponse: string,
  sesameClient?: any,
  logger?: Logger
): Promise<AdaptiveConversationResponse> {
  const integration = new AdaptiveProsodyIntegration(
    logger || console as any,
    sesameClient
  );
  
  return integration.processAdaptiveConversation(
    { userId: 'user', message: userMessage },
    aiResponse
  );
}