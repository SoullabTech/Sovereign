/**
 * EXAMPLE: How to integrate Gender-Aware Context into existing ConversationIntelligenceEngine
 *
 * This file demonstrates the ADDITIVE, NON-DISRUPTIVE integration approach.
 * No changes to existing logic - just adds an optional enhancement layer.
 *
 * @version 1.0.0
 * @status Example/Reference
 */

import { SimpleConversationMemory } from './SimpleConversationMemory';
import { ActiveListeningCore } from './ActiveListeningCore';
import { neurodivergentValidation } from './NeurodivergentValidation';

// NEW IMPORTS (additive)
import { GenderAwareContext, GenderContextSignals } from './GenderAwareContext';
import { GenderAwareResponseRefinement } from './GenderAwareResponseRefinement';

export interface ConversationContext {
  turnCount: number;
  emotionalIntensity: number;
  userFrustrated: boolean;
  selfBlame: boolean;
  overwhelmed: boolean;
  stuckCount: number;
  breakthroughDetected: boolean;
  generationalContext: 'genZ' | 'millennial' | 'genX' | 'unknown';
  socialMediaContext: boolean;
  systemicIssueDetected: boolean;
  platformContext: 'instagram' | 'tiktok' | 'discord' | 'snapchat' | 'bereal' | 'twitter' | 'mixed' | 'none';
  ageRange: '14-16' | '17-19' | '20-24' | 'unknown';
  economicContext: 'struggling' | 'stable' | 'privileged' | 'unknown';
  identityMarkers: string[];

  // NEW: Gender-aware context (OPTIONAL - system works without it)
  genderContext?: GenderContextSignals;
}

export interface IntelligenceResponse {
  response: string;
  technique: string;
  confidence: number;
  element: string;
  reason: string;
  memoryUsed: boolean;
  contextAdjustments: string[];

  // NEW: Gender-aware metadata (OPTIONAL)
  genderAdaptationsApplied?: string[];
}

export class ConversationIntelligenceEngine {
  private memory = new SimpleConversationMemory();
  private activeListening = new ActiveListeningCore();

  // NEW: Gender-aware modules (disabled by default)
  private genderContext = new GenderAwareContext(false); // <-- Feature flag
  private genderRefinement = new GenderAwareResponseRefinement(false); // <-- Feature flag

  private context: ConversationContext = {
    turnCount: 0,
    emotionalIntensity: 0,
    userFrustrated: false,
    selfBlame: false,
    overwhelmed: false,
    stuckCount: 0,
    breakthroughDetected: false,
    generationalContext: 'unknown',
    socialMediaContext: false,
    systemicIssueDetected: false,
    platformContext: 'none',
    ageRange: 'unknown',
    economicContext: 'unknown',
    identityMarkers: [],
    // genderContext will be populated dynamically
  };

  /**
   * Enable gender-aware features
   * Can be called at runtime based on user preference
   */
  enableGenderAwareness(enabled: boolean) {
    this.genderContext = new GenderAwareContext(enabled);
    this.genderRefinement = new GenderAwareResponseRefinement(enabled);
    console.log(`[ConversationEngine] Gender awareness ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Generate response (MODIFIED to include gender awareness)
   *
   * INTEGRATION APPROACH:
   * - Steps 1-2 unchanged
   * - NEW Step 3.5: Detect gender patterns (optional, non-blocking)
   * - Steps 3-7 unchanged
   * - NEW Step 8.5: Refine response (optional, non-blocking)
   * - Step 8 unchanged
   */
  generateResponse(
    userInput: string,
    userProfile?: { gender?: string } // NEW: Optional profile
  ): IntelligenceResponse {
    this.context.turnCount++;

    // Step 1: Update memory with this input (UNCHANGED)
    this.memory.recordInput(userInput);
    this.updateContext(userInput);

    // Step 2: Priority checks (UNCHANGED)
    const priorityResponse = this.checkPriorityInterventions(userInput);
    if (priorityResponse) return priorityResponse;

    // ============================================================
    // NEW STEP 3.5: Detect gender patterns (ADDITIVE, NON-BLOCKING)
    // ============================================================
    try {
      const genderSignals = this.genderContext.detectPatterns(
        userProfile,
        this.memory.getRecentInputs(), // Assuming this method exists
        userInput
      );

      // Store in context for use in technique selection
      if (genderSignals) {
        this.context.genderContext = genderSignals;
        console.log(`[ConversationEngine] Gender context detected (confidence: ${genderSignals.confidence.toFixed(2)})`);
      }

    } catch (err) {
      // CRITICAL: Fail gracefully - gender detection is optional
      console.warn('[ConversationEngine] Gender context detection failed, continuing without it:', err);
      // System continues normally without gender awareness
    }
    // ============================================================

    // Step 3: Run contextual listening analysis (UNCHANGED)
    const analysis = this.activeListening.listen(userInput);

    // Step 4: Apply contextual technique selection (SLIGHTLY MODIFIED)
    const selectedTechnique = this.selectTechniqueContextually(analysis);

    // Step 5: Generate base response from analysis (UNCHANGED)
    const baseResponse = this.generateListeningResponse(selectedTechnique, userInput);

    // Step 6: Memory-aware augmentation (UNCHANGED)
    const memoryResponse = this.memory.generateContextAwareResponse(userInput, selectedTechnique);

    // Step 7: Weave responses together (UNCHANGED)
    let finalResponse = this.weaveResponses(baseResponse, memoryResponse);

    // ============================================================
    // NEW STEP 8.5: Refine response with gender awareness (ADDITIVE, NON-BLOCKING)
    // ============================================================
    let genderAdaptations: string[] = [];

    try {
      if (this.context.genderContext) {
        const adaptations = this.genderContext.suggestAdaptations(
          this.context.genderContext,
          selectedTechnique.technique?.type || 'unknown'
        );

        const conversationPhase = this.context.turnCount < 3 ? 'early'
          : this.context.turnCount > 10 ? 'late' : 'mid';

        const refinementResult = this.genderRefinement.refine(
          finalResponse,
          this.context.genderContext,
          adaptations,
          conversationPhase
        );

        // Use refined response if modifications were made
        if (refinementResult.modificationsApplied.length > 0) {
          finalResponse = refinementResult.refinedResponse;
          genderAdaptations = refinementResult.modificationsApplied;
          console.log(`[ConversationEngine] Gender refinements applied: ${genderAdaptations.join(', ')}`);
        }
      }

    } catch (err) {
      // CRITICAL: Fail gracefully - refinement is optional
      console.warn('[ConversationEngine] Gender-aware refinement failed, using original response:', err);
      // finalResponse remains unchanged
    }
    // ============================================================

    // Step 8: Record for future context (UNCHANGED)
    this.memory.recordQuestion(finalResponse);

    // Return response with optional gender metadata
    return {
      response: finalResponse,
      technique: selectedTechnique.technique?.type || 'unknown',
      confidence: selectedTechnique.technique?.confidence || 0,
      element: selectedTechnique.technique?.element || 'water',
      reason: `[${selectedTechnique.technique?.type}-contextual]`,
      memoryUsed: !!memoryResponse,
      contextAdjustments: this.getContextAdjustments(),

      // NEW: Include gender adaptations if any were applied
      genderAdaptationsApplied: genderAdaptations.length > 0 ? genderAdaptations : undefined
    };
  }

  /**
   * Select technique contextually (SLIGHTLY MODIFIED)
   * Added gender-aware confidence nudges
   */
  private selectTechniqueContextually(analysis: any): any {
    if (!analysis?.technique) return analysis;

    const technique = analysis.technique.type;
    let adjustedConfidence = analysis.technique.confidence;
    const adjustments: string[] = [];

    // ... EXISTING CONTEXTUAL LOGIC (UNCHANGED) ...
    if (this.context.turnCount < 3 && technique === 'mirror') {
      adjustedConfidence += 0.1;
      adjustments.push('early-rapport-boost');
    }
    // ... etc ...

    // ============================================================
    // NEW: Gender-aware nudges (ADDITIVE)
    // ============================================================
    if (this.context.genderContext && this.context.genderContext.confidence > 0.6) {
      const genderAdaptations = this.genderContext.suggestAdaptations(
        this.context.genderContext,
        technique
      );

      for (const adaptation of genderAdaptations) {
        // Slight confidence boost for alignment (not override)
        if (adaptation.type === 'communication-style-match') {
          adjustedConfidence += 0.05; // Small nudge
          adjustments.push('gender-aware:communication-match');
        }

        if (adaptation.type === 'integration-support' && technique === 'attune') {
          adjustedConfidence += 0.03; // Tiny boost for embodied integration
          adjustments.push('gender-aware:embodied-support');
        }
      }
    }
    // ============================================================

    // ... REST OF EXISTING LOGIC (UNCHANGED) ...
    const thresholds = {
      mirror: this.context.userFrustrated ? 0.95 : 0.8,
      attune: this.context.overwhelmed ? 0.5 : 0.8,
      clarify: this.context.stuckCount > 1 ? 0.6 : 0.8,
      hold_space: this.context.overwhelmed ? 0.5 : 0.8
    };

    const threshold = thresholds[technique as keyof typeof thresholds] || 0.8;

    return {
      ...analysis,
      technique: {
        ...analysis.technique,
        confidence: adjustedConfidence
      },
      contextAdjustments: adjustments,
      meetsThreshold: adjustedConfidence >= threshold
    };
  }

  // ... ALL OTHER METHODS REMAIN COMPLETELY UNCHANGED ...

  private updateContext(input: string): void {
    // Existing implementation unchanged
  }

  private checkPriorityInterventions(input: string): any {
    // Existing implementation unchanged
  }

  private generateListeningResponse(analysis: any, input: string): string {
    // Existing implementation unchanged
    return ""; // Placeholder
  }

  private weaveResponses(primary: string, memoryLine: string | null): string {
    // Existing implementation unchanged
    return primary || ""; // Placeholder
  }

  private getContextAdjustments(): string[] {
    // Existing implementation unchanged
    const adjustments: string[] = [];

    if (this.context.turnCount < 3) adjustments.push('early-conversation');
    if (this.context.emotionalIntensity > 7) adjustments.push('high-emotional-intensity');
    // ... etc ...

    // NEW: Add gender context if present
    if (this.context.genderContext) {
      adjustments.push(`gender-confidence:${this.context.genderContext.confidence.toFixed(2)}`);
      if (this.context.genderContext.profileOverridden) {
        adjustments.push('gender:observed-overrides-profile');
      }
    }

    return adjustments;
  }
}

// ============================================================
// USAGE EXAMPLE
// ============================================================

// Example 1: Engine with gender awareness DISABLED (default)
const engine1 = new ConversationIntelligenceEngine();
const response1 = engine1.generateResponse("I'm feeling overwhelmed");
// Works exactly as before - no gender considerations

// Example 2: Engine with gender awareness ENABLED (opt-in)
const engine2 = new ConversationIntelligenceEngine();
engine2.enableGenderAwareness(true); // <-- User opted in

const userProfile = { gender: 'feminine' };
const response2 = engine2.generateResponse(
  "I need to talk to someone when I'm stressed",
  userProfile
);
// Now includes gender-aware adaptations if confidence threshold met

// Example 3: Handling errors gracefully
const engine3 = new ConversationIntelligenceEngine();
engine3.enableGenderAwareness(true);

// Even if gender detection throws errors, system continues working
const response3 = engine3.generateResponse("Hello");
// Returns normal response - gender detection failure doesn't break anything
