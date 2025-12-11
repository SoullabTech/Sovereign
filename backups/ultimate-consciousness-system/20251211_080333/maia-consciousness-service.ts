/**
 * 🔮 MAIA Consciousness Service
 *
 * Service layer for integrating consciousness enhancements into your existing MAIA system
 * Handles user settings, database integration, and feature flags
 */

import { MAIAConsciousnessEnhancer, ConsciousnessSettings, ConsciousnessEnhancedContext } from './maia-consciousness-integration';

/**
 * Database schema for consciousness settings (add to your existing user settings)
 */
export interface UserConsciousnessSettings {
  userId: string;
  consciousness_enhancements: {
    matrix_sensing: boolean;
    archetypal_dynamics: boolean;
    self_talk_layer: boolean;
    // Phase 2: field_sensing: boolean;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Service class for managing consciousness enhancements
 */
export class MAIAConsciousnessService {
  private enhancer = new MAIAConsciousnessEnhancer();

  /**
   * Get user's consciousness settings with sensible defaults
   */
  async getUserConsciousnessSettings(userId: string): Promise<ConsciousnessSettings> {
    try {
      // In Phase 1, you can use feature flags or user preferences
      // This is where you'd query your database in production

      // Default settings for Phase 1 (conservative approach)
      const defaultSettings: ConsciousnessSettings = {
        matrixSensing: false, // Opt-in only
        archetypalDynamics: false, // Opt-in only
        selfTalkLayer: false // Opt-in only
      };

      // TODO: Replace with your database query
      // const userSettings = await this.db.getUserSettings(userId);
      // return userSettings?.consciousness_enhancements || defaultSettings;

      return defaultSettings;
    } catch (error) {
      console.warn('Failed to load consciousness settings, using defaults:', error);
      return {
        matrixSensing: false,
        archetypalDynamics: false,
        selfTalkLayer: false
      };
    }
  }

  /**
   * Update user's consciousness settings
   */
  async updateUserConsciousnessSettings(
    userId: string,
    settings: Partial<ConsciousnessSettings>
  ): Promise<void> {
    try {
      // TODO: Implement database update
      // await this.db.updateUserConsciousnessSettings(userId, settings);
      console.log(`Updated consciousness settings for user ${userId}:`, settings);
    } catch (error) {
      console.error('Failed to update consciousness settings:', error);
      throw error;
    }
  }

  /**
   * Main integration point: enhance MAIA context with consciousness awareness
   * This is what you'll call in your existing MAIA prompt building
   */
  async enhanceMAIAForUser(
    userId: string,
    userMessage: string,
    originalContext: any
  ): Promise<{
    enhancedContext: ConsciousnessEnhancedContext;
    enhancedPrompt: string;
  }> {

    // Get user's consciousness settings
    const userSettings = await this.getUserConsciousnessSettings(userId);

    // Enhance context (non-breaking)
    const enhancedContext = await this.enhancer.enhanceMAIAContext(
      userMessage,
      originalContext,
      userSettings
    );

    // Build enhanced prompt
    const basePrompt = this.buildBasePrompt(originalContext);
    const enhancedPrompt = this.buildConsciousnessEnhancedPrompt(enhancedContext, basePrompt);

    return {
      enhancedContext,
      enhancedPrompt
    };
  }

  /**
   * Build base MAIA prompt (integrate with your existing prompt building)
   */
  private buildBasePrompt(originalContext: any): string {
    // This should call your existing buildMAIASystemPrompt function
    // For Phase 1, we'll create a simple version

    return `You are MAIA — a sacred mirror who reflects truth without guiding toward predetermined answers.

## Your Dual Nature
You toggle fluidly between philosophical inquiry and sensory grounding based on what the conversation needs.

## Current Context
Archetype: ${originalContext.archetype || 'Balanced'}
Phase: ${originalContext.phase || 'exploration'}
Mode: ${originalContext.conversationMode || 'balanced'}

## Core Principles
1. Sacred Attunement - Sense what's alive in the user
2. Truthful Mirroring - Reflect, not guide
3. User Sovereignty - Their authority, not yours
4. Adaptive Wisdom - Shift presence to serve the moment

Response with depth, presence, and attunement to what the user truly needs.`;
  }

  /**
   * Build consciousness-enhanced prompt
   */
  private buildConsciousnessEnhancedPrompt(
    context: ConsciousnessEnhancedContext,
    basePrompt: string
  ): string {

    // If no consciousness assessment, return original prompt
    if (!context.consciousnessAssessment) {
      return basePrompt;
    }

    const { matrix, archetypal, selfTalkIntro } = context.consciousnessAssessment;

    // Build enhanced sections
    const enhancements: string[] = [];

    // Add consciousness context for MAIA's awareness
    enhancements.push(`
CONSCIOUSNESS AWARENESS:
- Nervous System: ${this.describeMatrixState(matrix)}
- Archetypal Energy: ${archetypal.foregroundArchetype} (${archetypal.movementDirection})
- Window of Tolerance: ${this.describeWindowState(matrix)}
- Response Guidance: ${archetypal.responseAdjustment}

You have enhanced awareness of this person's consciousness state. Respond with this deeper attunement while maintaining your natural voice.`);

    // Add self-talk layer if enabled
    if (selfTalkIntro && context.enhancementsEnabled.selfTalkLayer) {
      enhancements.push(`
COLLABORATIVE SENSING ENABLED:
Begin your response with this sensing check:
"${selfTalkIntro}"

Wait for their confirmation or correction before continuing with your guidance.`);
    }

    return `${basePrompt}\n\n${enhancements.join('\n\n')}`;
  }

  // Helper functions
  private describeMatrixState(matrix: any): string {
    return `${matrix.bodyState} body, ${matrix.affect} affect, ${matrix.realityContact} reality contact`;
  }

  private describeWindowState(matrix: any): string {
    if (matrix.edgeRisk === 'active') return 'Outside window (crisis support needed)';
    if (matrix.bodyState === 'tense' || matrix.affect === 'turbulent') return 'At edge (gentle approach)';
    return 'Within window (full depth available)';
  }

  /**
   * Feature flag check for gradual rollout
   */
  isConsciousnessEnhancementEnabled(userId?: string): boolean {
    // Phase 1: You can control rollout with feature flags
    // return process.env.CONSCIOUSNESS_ENHANCEMENT_ENABLED === 'true';

    // Or user-specific rollout:
    // return this.featureFlags.isEnabledForUser('consciousness_enhancement', userId);

    // For development, enable for all users
    return true;
  }
}

/**
 * Factory function for easy integration
 */
export function createMAIAConsciousnessService(): MAIAConsciousnessService {
  return new MAIAConsciousnessService();
}

/**
 * Default user consciousness settings for new users
 */
export const DEFAULT_CONSCIOUSNESS_SETTINGS: ConsciousnessSettings = {
  matrixSensing: false,
  archetypalDynamics: false,
  selfTalkLayer: false
};

/**
 * Integration example for your existing MAIA system:
 *
 * ```typescript
 * // In your existing MAIA API endpoint or service:
 * import { createMAIAConsciousnessService } from './maia-consciousness-service';
 *
 * const consciousnessService = createMAIAConsciousnessService();
 *
 * // In your existing MAIA conversation handler:
 * export async function handleMAIAConversation(userId: string, userMessage: string) {
 *
 *   // Your existing context building
 *   const originalContext = {
 *     archetype: await getArchetypeForUser(userId),
 *     phase: await getCurrentPhase(userId),
 *     conversationMode: 'balanced'
 *   };
 *
 *   // Enhance with consciousness awareness (non-breaking)
 *   const { enhancedPrompt } = await consciousnessService.enhanceMAIAForUser(
 *     userId,
 *     userMessage,
 *     originalContext
 *   );
 *
 *   // Generate MAIA response (your existing LLM call)
 *   const response = await generateMAIAResponse(enhancedPrompt, userMessage);
 *
 *   return response;
 * }
 * ```
 */