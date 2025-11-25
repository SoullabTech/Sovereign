/**
 * Gender-Aware Response Refinement
 * Subtly adjusts MAIA's responses based on detected gender patterns
 *
 * DESIGN PRINCIPLES:
 * 1. Changes are minimal and research-backed
 * 2. Never stereotype or limit based on gender
 * 3. All refinements respect individual variance
 * 4. High confidence threshold for any changes
 * 5. Graceful degradation if detection uncertain
 *
 * @version 1.0.0
 * @status Experimental
 */

import { GenderContextSignals, GenderAdaptation } from './GenderAwareContext';

export interface RefinementResult {
  originalResponse: string;
  refinedResponse: string;
  modificationsApplied: string[];
  confidenceRequired: number;
}

export class GenderAwareResponseRefinement {
  private enabled: boolean = false;

  constructor(enabled: boolean = false) {
    this.enabled = enabled;
  }

  /**
   * Refine response based on gender context
   * Returns original response if confidence too low or disabled
   *
   * @param response - Original MAIA response
   * @param genderContext - Detected gender patterns
   * @param adaptations - Suggested adaptations
   * @param conversationPhase - Early/mid/late conversation
   * @returns RefinementResult with original and refined versions
   */
  refine(
    response: string,
    genderContext: GenderContextSignals | null,
    adaptations: GenderAdaptation[],
    conversationPhase: 'early' | 'mid' | 'late' = 'mid'
  ): RefinementResult {
    const result: RefinementResult = {
      originalResponse: response,
      refinedResponse: response,
      modificationsApplied: [],
      confidenceRequired: 0.6
    };

    // If disabled or no context, return original
    if (!this.enabled || !genderContext || genderContext.confidence < result.confidenceRequired) {
      return result;
    }

    try {
      let refined = response;

      // Apply adaptations in priority order
      for (const adaptation of adaptations) {
        if (genderContext.confidence >= adaptation.confidenceThreshold) {
          refined = this.applyAdaptation(refined, adaptation, genderContext, conversationPhase);
          if (refined !== response) {
            result.modificationsApplied.push(adaptation.type);
          }
        }
      }

      result.refinedResponse = refined;

      // Log if modifications were made (for accountability)
      if (result.modificationsApplied.length > 0) {
        console.log('[GenderAwareRefinement] Applied:', result.modificationsApplied);
      }

      return result;

    } catch (err) {
      console.warn('[GenderAwareRefinement] Refinement failed:', err);
      return result; // Return original on error
    }
  }

  /**
   * Apply specific adaptation to response
   */
  private applyAdaptation(
    response: string,
    adaptation: GenderAdaptation,
    context: GenderContextSignals,
    phase: 'early' | 'mid' | 'late'
  ): string {
    switch (adaptation.type) {
      case 'communication-style-match':
        return this.addContextualConnection(response, context, phase);

      case 'disclosure-pacing':
        return this.adjustDisclosurePacing(response, context, phase);

      case 'integration-support':
        return this.addIntegrationSupport(response, context);

      case 'stress-validation':
        return this.addStressValidation(response, context);

      default:
        return response;
    }
  }

  /**
   * Add contextual connections for relational communication style
   * Research: Tannen (1990) - Rapport-talk preferences
   */
  private addContextualConnection(
    response: string,
    context: GenderContextSignals,
    phase: 'early' | 'mid' | 'late'
  ): string {
    if (context.communicationStyle !== 'relational') return response;

    // Only add connection if it doesn't already exist
    if (response.includes('same') || response.includes('like') || response.includes('last time')) {
      return response; // Already has contextual connection
    }

    // Add subtle contextual references
    // "That pattern again..." → "That pattern again... same one from last week?"
    if (phase !== 'early' && /pattern|feeling|experience/i.test(response)) {
      if (response.endsWith('...') || response.endsWith('.')) {
        return response.replace(/\.\.\.$/, ' - feels familiar?').replace(/\.$/, '. Sound familiar?');
      }
    }

    return response;
  }

  /**
   * Adjust pacing for gradual disclosure preference
   * Research: Gilligan (1982) - Relational development patterns
   */
  private adjustDisclosurePacing(
    response: string,
    context: GenderContextSignals,
    phase: 'early' | 'mid' | 'late'
  ): string {
    if (context.emotionalDisclosure !== 'gradual') return response;

    // Early phase: Soften direct questions
    if (phase === 'early') {
      // "What are you afraid of?" → "What's the edge here?"
      response = response
        .replace(/What are you afraid of\?/gi, "What's the edge here?")
        .replace(/What scares you\?/gi, "What feels challenging about this?")
        .replace(/Why does that scare you\?/gi, "What makes that difficult?");
    }

    // Replace therapeutic language with conversational
    response = response
      .replace(/How does that make you feel\?/gi, "What's that like for you?")
      .replace(/Tell me about your feelings/gi, "What's going on for you");

    return response;
  }

  /**
   * Add somatic/embodiment prompts for embodied integration style
   * Research: Belenky et al. (1986) - Embodied ways of knowing
   */
  private addIntegrationSupport(
    response: string,
    context: GenderContextSignals
  ): string {
    if (context.integrationStyle !== 'embodied') return response;

    // Add body awareness prompts to abstract questions
    // "What does that mean to you?" → "What does that feel like in your body?"
    // "How do you understand that?" → "Where do you feel that understanding?"

    // Only add if response doesn't already mention body
    if (!/body|feel|chest|stomach|breath|sensation/i.test(response)) {
      if (response.includes('What does that mean')) {
        response = response.replace(
          /What does that mean to you\?/gi,
          "What does that feel like in your body?"
        );
      } else if (response.includes('How do you')) {
        response = response.replace(
          /How do you (understand|see|know) that\?/gi,
          "Where do you feel that in your body?"
        );
      } else if (response.endsWith('?') && /what|how/i.test(response)) {
        // Add a follow-up somatic prompt
        response += " Where do you notice that physically?";
      }
    }

    return response;
  }

  /**
   * Validate connection-seeking stress response
   * Research: Taylor et al. (2000) - Tend-and-befriend theory
   */
  private addStressValidation(
    response: string,
    context: GenderContextSignals
  ): string {
    if (context.stressResponse !== 'tend-befriend') return response;

    // If user mentions reaching out or needing support, validate it
    // Don't pathologize connection-seeking as "dependency"

    // Replace potential invalidation with validation
    response = response
      .replace(/You don't need to rely on others/gi, "Reaching out when stressed is healthy")
      .replace(/Try to handle it yourself/gi, "Connection is a valid coping strategy")
      .replace(/You're being too dependent/gi, "You're resourcefully seeking support");

    return response;
  }
}

// Export singleton instance (disabled by default)
export const genderAwareResponseRefinement = new GenderAwareResponseRefinement(false);
