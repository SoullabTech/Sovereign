// @ts-nocheck
/**
 * MAIA Spiritual Support Integration Layer
 *
 * Main integration point that connects all spiritual support systems
 * with MAIA's consciousness computing and existing conversation flow.
 */

import type { ConsciousnessMatrixV2, MatrixV2Assessment } from '../consciousness-computing/matrix-v2-implementation.js';
import { SpiritualContextDetector, type SpiritualContextSignals, type SpiritualConsentState } from './context-detection-system.js';
import { ChristianFaithMemorySystem } from '../faith-integration/christian-faith-memory-system.js';
import { ChristianPastoralCareSystem } from '../faith-integration/christian-pastoral-care-system.js';
import { ScriptureIntegrationEnhancement } from '../faith-integration/scripture-integration-enhancement.js';
import type { ChristianFaithContext, PastoralCareResponse, ScriptureContext, ScriptureEngagement } from '../faith-integration/types.js';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

export interface SpiritualSupportRequest {
  userMessage: string;
  conversationHistory?: any[];
  consciousnessContext?: MatrixV2Assessment;
  existingConsentState?: SpiritualConsentState;
  faithBackground?: string;
}

export interface SpiritualSupportResponse {
  // Core response elements
  shouldOfferSpiritual: boolean;
  responseType: 'direct_spiritual' | 'offer_spiritual' | 'check_consent' | 'secular_only' | 'pastoral_care';

  // Enhanced response content
  enhancedResponse: string;
  spiritualGuidance?: string;
  scriptureEngagement?: ScriptureEngagement;
  pastoralSupport?: PastoralCareResponse;

  // Consent and boundaries
  consentPrompt?: string;
  updatedConsentState?: SpiritualConsentState;

  // Integration metadata
  spiritualContextSignals?: SpiritualContextSignals;
  consciousnessEnhancements?: string[];
  systemsActivated?: string[];
}

export interface MAIAEnhancedContext {
  originalContext: any;
  consciousnessContext: MatrixV2Assessment;
  spiritualContext?: {
    signals: SpiritualContextSignals;
    consentState: SpiritualConsentState;
    faithContext?: ChristianFaithContext;
    scriptureContext?: ScriptureContext;
  };
  enhancedPrompt: string;
  responseGuidance: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SPIRITUAL INTEGRATION SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

export class MAIASpiritualIntegration {
  private contextDetector: SpiritualContextDetector;
  private christianMemory: ChristianFaithMemorySystem;
  private pastoralCare: ChristianPastoralCareSystem;
  private scriptureSystem: ScriptureIntegrationEnhancement;

  constructor() {
    this.contextDetector = new SpiritualContextDetector();
    this.christianMemory = new ChristianFaithMemorySystem();
    this.pastoralCare = new ChristianPastoralCareSystem();
    this.scriptureSystem = new ScriptureIntegrationEnhancement();
  }

  /**
   * Main entry point: Enhances MAIA's response with spiritual support when appropriate
   */
  async enhanceMAIAResponse(request: SpiritualSupportRequest): Promise<SpiritualSupportResponse> {

    // 1. Detect spiritual context and signals
    const spiritualSignals = this.contextDetector.detectSpiritualContext(
      request.userMessage,
      request.conversationHistory
    );

    // 2. Determine appropriate response based on consent and signals
    const contextualResponse = this.contextDetector.generateContextualResponse(
      spiritualSignals,
      request.existingConsentState || { hasExplicitConsent: false, spiritualSupportEnabled: false },
      request.userMessage
    );

    // 3. If spiritual support is warranted, activate appropriate systems
    let spiritualGuidance: string | undefined;
    let scriptureEngagement: ScriptureEngagement | undefined;
    let pastoralSupport: PastoralCareResponse | undefined;
    const systemsActivated: string[] = [];

    if (contextualResponse.responseType === 'direct_spiritual' && request.existingConsentState?.spiritualSupportEnabled) {

      // Activate Christian spiritual support systems
      if (request.faithBackground === 'christian' || request.existingConsentState?.faithBackground === 'christian') {

        // Faith Memory System for wisdom guidance
        const faithContext: ChristianFaithContext = {
          denomination: request.existingConsentState?.faithBackground || 'general_christian',
          denominationalBackground: request.existingConsentState?.faithBackground || 'general_christian',
          spiritualMaturity: 'exploring', // Would be determined from conversation history
          currentStruggles: this.extractSpritualStruggles(request.userMessage),
          openness: { expandedWisdom: true, mysticInclusion: false } // Based on user preferences
        };

        const wisdomResponse = await this.christianMemory.getContextualGuidance(
          faithContext,
          spiritualSignals.confidenceLevel,
          request.userMessage
        );
        spiritualGuidance = typeof wisdomResponse === 'string' ? wisdomResponse : wisdomResponse.guidance;
        systemsActivated.push('ChristianFaithMemory');

        // Scripture Integration if relevant
        if (this.shouldActivateScripture(spiritualSignals, request.consciousnessContext)) {
          const scriptureContext: ScriptureContext = {
            spiritualNeed: this.mapToSpiritualNeed(spiritualSignals),
            denomination: faithContext.denomination
          };

          scriptureEngagement = await this.scriptureSystem.getContextualScriptureGuidance(
            request.consciousnessContext?.matrix || {} as any,
            scriptureContext,
            request.userMessage
          );
          systemsActivated.push('ScriptureIntegration');
        }

        // Pastoral Care if crisis indicators present
        if (this.requiresPastoralCare(spiritualSignals, request.consciousnessContext)) {
          pastoralSupport = await this.pastoralCare.providePastoralCare(
            request.userMessage,
            request.consciousnessContext,
            faithContext
          );
          systemsActivated.push('PastoralCare');
        }
      }
    }

    // 4. Generate enhanced response
    const enhancedResponse = this.generateEnhancedResponse(
      contextualResponse.suggestedResponse,
      spiritualGuidance,
      scriptureEngagement,
      pastoralSupport,
      request.consciousnessContext
    );

    return {
      shouldOfferSpiritual: contextualResponse.responseType !== 'secular_only',
      responseType: pastoralSupport ? 'pastoral_care' : contextualResponse.responseType,
      enhancedResponse,
      spiritualGuidance,
      scriptureEngagement,
      pastoralSupport,
      consentPrompt: contextualResponse.consentPrompt,
      updatedConsentState: this.updateConsentState(request.existingConsentState, contextualResponse),
      spiritualContextSignals: spiritualSignals,
      consciousnessEnhancements: this.generateConsciousnessEnhancements(request.consciousnessContext),
      systemsActivated
    };
  }

  /**
   * Enhanced MAIA context generation for spiritual conversations
   */
  async generateEnhancedMAIAContext(
    originalContext: any,
    request: SpiritualSupportRequest
  ): Promise<MAIAEnhancedContext> {

    // Get spiritual support response
    const spiritualResponse = await this.enhanceMAIAResponse(request);

    // Create enhanced context
    const enhancedContext: MAIAEnhancedContext = {
      originalContext,
      consciousnessContext: request.consciousnessContext!,
      spiritualContext: spiritualResponse.shouldOfferSpiritual ? {
        signals: spiritualResponse.spiritualContextSignals!,
        consentState: spiritualResponse.updatedConsentState!,
        faithContext: this.extractFaithContext(request),
        scriptureContext: this.extractScriptureContext(request)
      } : undefined,
      enhancedPrompt: this.generateEnhancedPrompt(originalContext, spiritualResponse, request.consciousnessContext),
      responseGuidance: this.generateResponseGuidance(spiritualResponse, request.consciousnessContext)
    };

    return enhancedContext;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  private extractSpritualStruggles(message: string): string[] {
    const struggles: string[] = [];

    // Pattern matching for common spiritual struggles
    const patterns = {
      'prayer_dryness': /prayer.*(?:dry|empty|distant)/i,
      'faith_doubt': /doubt.*faith|questioning.*God/i,
      'spiritual_warfare': /attack|spiritual.*warfare|evil/i,
      'purpose_meaning': /purpose|meaning|calling/i,
      'sin_guilt': /guilt|shame|sin|forgiveness/i
    };

    for (const [struggle, pattern] of Object.entries(patterns)) {
      if (pattern.test(message)) {
        struggles.push(struggle);
      }
    }

    return struggles;
  }

  private shouldActivateScripture(
    signals: SpiritualContextSignals,
    consciousness?: MatrixV2Assessment
  ): boolean {
    // Activate Scripture integration for explicit spiritual requests
    if (signals.confidenceLevel === 'explicit') return true;

    // Or when consciousness state suggests spiritual receptivity
    if (consciousness?.overallCapacity === 'expansive' && signals.confidenceLevel === 'likely') {
      return true;
    }

    return false;
  }

  private requiresPastoralCare(
    signals: SpiritualContextSignals,
    consciousness?: MatrixV2Assessment
  ): boolean {
    // Activate pastoral care for crisis situations
    if (consciousness?.windowOfTolerance === 'hypoarousal' || consciousness?.overallCapacity === 'shutdown') {
      return true;
    }

    // Or explicit spiritual crisis language
    return signals.existentialQuestions.length > 0 || signals.lifeSituationCues.length > 0;
  }

  private mapToSpiritualNeed(signals: SpiritualContextSignals): string {
    if (signals.lifeSituationCues.length > 0) return 'comfort_strength';
    if (signals.existentialQuestions.length > 0) return 'meaning_purpose';
    if (signals.explicitRequests.some(req => req.includes('prayer'))) return 'prayer_support';
    return 'general_guidance';
  }

  private generateEnhancedResponse(
    baseResponse: string,
    spiritualGuidance?: string,
    scriptureEngagement?: ScriptureEngagement,
    pastoralSupport?: PastoralCareResponse,
    consciousness?: MatrixV2Assessment
  ): string {

    let enhanced = baseResponse;

    // Add pastoral care first if present (highest priority)
    if (pastoralSupport) {
      enhanced += `\n\n${pastoralSupport.response}`;

      if (pastoralSupport.scriptureForComfort) {
        enhanced += `\n\n**Scripture for comfort**: ${pastoralSupport.scriptureForComfort}`;
      }
    }

    // Add spiritual guidance
    if (spiritualGuidance) {
      enhanced += `\n\n**Spiritual reflection**: ${spiritualGuidance}`;
    }

    // Add Scripture engagement if appropriate
    if (scriptureEngagement && consciousness?.overallCapacity !== 'shutdown') {
      enhanced += `\n\n**Scripture for reflection**: ${scriptureEngagement.passage} (${scriptureEngagement.reference})`;
      enhanced += `\n\n${scriptureEngagement.contextualReflection}`;

      if (scriptureEngagement.contemplativePrompts.length > 0) {
        enhanced += `\n\n**For contemplation**: ${scriptureEngagement.contemplativePrompts[0]}`;
      }
    }

    return enhanced;
  }

  private updateConsentState(
    existing?: SpiritualConsentState,
    response?: any
  ): SpiritualConsentState {
    return {
      hasExplicitConsent: existing?.hasExplicitConsent || false,
      spiritualSupportEnabled: existing?.spiritualSupportEnabled || false,
      faithBackground: existing?.faithBackground,
      boundariesSet: existing?.boundariesSet || [],
      lastConsentCheck: new Date()
    };
  }

  private generateConsciousnessEnhancements(consciousness?: MatrixV2Assessment): string[] {
    if (!consciousness) return [];

    const enhancements: string[] = [];

    // Window of tolerance awareness
    if (consciousness.windowOfTolerance !== 'within') {
      enhancements.push(`Nervous system is ${consciousness.windowOfTolerance} - adjust spiritual practices accordingly`);
    }

    // Capacity awareness
    if (consciousness.overallCapacity === 'limited') {
      enhancements.push('Limited capacity - offer simple, supportive spiritual practices');
    } else if (consciousness.overallCapacity === 'expansive') {
      enhancements.push('Expansive capacity - deeper spiritual exploration available');
    }

    return enhancements;
  }

  private extractFaithContext(request: SpiritualSupportRequest): ChristianFaithContext | undefined {
    if (request.faithBackground !== 'christian') return undefined;

    return {
      denomination: 'general_christian',
      denominationalBackground: 'general_christian',
      spiritualMaturity: 'exploring',
      currentStruggles: this.extractSpritualStruggles(request.userMessage),
      openness: { expandedWisdom: true, mysticInclusion: false }
    };
  }

  private extractScriptureContext(request: SpiritualSupportRequest): ScriptureContext | undefined {
    if (request.faithBackground !== 'christian') return undefined;

    return {
      spiritualNeed: 'general_guidance',
      denomination: 'general_christian'
    };
  }

  private generateEnhancedPrompt(
    originalContext: any,
    spiritualResponse: SpiritualSupportResponse,
    consciousness?: MatrixV2Assessment
  ): string {

    let prompt = originalContext.prompt || '';

    if (spiritualResponse.shouldOfferSpiritual) {
      prompt += `\n\nSPIRITUAL CONTEXT ENHANCEMENT:
- Spiritual support systems activated: ${spiritualResponse.systemsActivated?.join(', ') || 'none'}
- Response type: ${spiritualResponse.responseType}
- Consciousness capacity: ${consciousness?.overallCapacity || 'unknown'}`;

      if (consciousness?.windowOfTolerance !== 'within') {
        prompt += `\n- Nervous system state: ${consciousness?.windowOfTolerance} (adjust spiritual practices accordingly)`;
      }
    }

    return prompt;
  }

  private generateResponseGuidance(
    spiritualResponse: SpiritualSupportResponse,
    consciousness?: MatrixV2Assessment
  ): string[] {
    const guidance: string[] = [];

    if (spiritualResponse.responseType === 'pastoral_care') {
      guidance.push('Priority: pastoral care and crisis support');
      guidance.push('Limit to essential spiritual comfort, avoid deep exploration');
    }

    if (consciousness?.windowOfTolerance === 'hyperarousal') {
      guidance.push('Nervous system activated - offer grounding spiritual practices');
    } else if (consciousness?.windowOfTolerance === 'hypoarousal') {
      guidance.push('Nervous system shutdown - gentle spiritual comfort only');
    }

    if (spiritualResponse.systemsActivated?.includes('ScriptureIntegration')) {
      guidance.push('Scripture engagement available - match to consciousness capacity');
    }

    return guidance;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SIMPLE INTEGRATION FUNCTIONS FOR EXISTING MAIA SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Simple function to check if spiritual support should be offered
 */
export async function checkForSpiritualSupport(
  userMessage: string,
  existingConsentState?: SpiritualConsentState
): Promise<{
  shouldOffer: boolean;
  consentPrompt?: string;
}> {
  const integration = new MAIASpiritualIntegration();
  const response = await integration.enhanceMAIAResponse({
    userMessage,
    existingConsentState
  });

  return {
    shouldOffer: response.shouldOfferSpiritual,
    consentPrompt: response.consentPrompt
  };
}

/**
 * Simple function to enhance MAIA response with spiritual support
 */
export async function enhanceWithSpiritualSupport(
  userMessage: string,
  originalResponse: string,
  consentState: SpiritualConsentState,
  consciousnessContext?: MatrixV2Assessment
): Promise<string> {
  const integration = new MAIASpiritualIntegration();
  const response = await integration.enhanceMAIAResponse({
    userMessage,
    existingConsentState: consentState,
    consciousnessContext,
    faithBackground: consentState.faithBackground
  });

  return response.enhancedResponse;
}