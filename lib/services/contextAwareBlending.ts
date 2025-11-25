// Context-Aware Blend Ratio Adjustment
// Adapts scientific/mythic balance to what the moment needs

export type EmotionalState =
  | 'crisis'
  | 'vulnerable'
  | 'contemplative'
  | 'breakthrough'
  | 'integrating'
  | 'grounded'
  | 'expansive';

export type ConversationPhase =
  | 'greeting'
  | 'exploring'
  | 'deepening'
  | 'breakthrough'
  | 'integration'
  | 'closing';

export type AlchemicalPhase =
  | 'nigredo'    // Dissolution - needs grounding
  | 'albedo'     // Purification - balanced
  | 'rubedo';    // Integration - can expand

export interface BlendingContext {
  emotionalState: EmotionalState;
  conversationPhase: ConversationPhase;
  alchemicalPhase?: AlchemicalPhase;
  breakthroughDepth?: number; // 0-1
  userPreferredRatio: number; // User's base setting
  lastInteractionSuccess?: boolean;
}

export class ContextAwareBlendingService {

  /**
   * Adjusts blend ratio based on what the moment needs
   *
   * Lower ratio = more scientific (grounding, stability)
   * Higher ratio = more mythic (expansion, poetry)
   */
  adjustBlendForMoment(context: BlendingContext): number {
    let ratio = context.userPreferredRatio;
    let adjustment = 0;

    // Emotional state adjustments
    switch (context.emotionalState) {
      case 'crisis':
        // Crisis needs grounding - lean scientific
        adjustment -= 0.2;
        break;

      case 'vulnerable':
        // Vulnerability needs gentle witnessing - slight scientific lean
        adjustment -= 0.1;
        break;

      case 'breakthrough':
        // Breakthrough can handle expansion - allow more poetry
        adjustment += 0.2;
        break;

      case 'integrating':
        // Integration is balanced work - honor user preference
        adjustment += 0;
        break;

      case 'expansive':
        // Expansive states can go fully mythic
        adjustment += 0.25;
        break;

      case 'contemplative':
        // Contemplative benefits from wisdom language
        adjustment += 0.15;
        break;

      case 'grounded':
        // Already grounded, can explore mythic
        adjustment += 0.1;
        break;
    }

    // Conversation phase adjustments
    switch (context.conversationPhase) {
      case 'greeting':
        // Start slightly grounded
        adjustment -= 0.05;
        break;

      case 'exploring':
        // Exploring is neutral - use base ratio
        break;

      case 'deepening':
        // Deepening can support more poetry
        adjustment += 0.1;
        break;

      case 'breakthrough':
        // Breakthrough moments get full poetic license
        adjustment += 0.2;
        break;

      case 'integration':
        // Integration needs balance
        adjustment += 0;
        break;

      case 'closing':
        // Closing should ground the experience
        adjustment -= 0.1;
        break;
    }

    // Alchemical phase considerations
    if (context.alchemicalPhase) {
      switch (context.alchemicalPhase) {
        case 'nigredo':
          // Dissolution is scary - needs scientific grounding
          adjustment -= 0.15;
          break;

        case 'albedo':
          // Purification is balanced
          adjustment += 0.05;
          break;

        case 'rubedo':
          // Integration/manifestation can be fully mythic
          adjustment += 0.15;
          break;
      }
    }

    // Breakthrough depth multiplier
    if (context.breakthroughDepth !== undefined && context.breakthroughDepth > 0.7) {
      // Deep moments can handle more poetry
      adjustment += 0.1 * (context.breakthroughDepth - 0.7);
    }

    // If last interaction wasn't successful, adjust back toward center
    if (context.lastInteractionSuccess === false) {
      adjustment *= 0.5; // Dampen adjustment
      ratio += (0.5 - ratio) * 0.3; // Pull toward middle
    }

    // Apply adjustment and clamp to valid range
    const adjustedRatio = Math.max(0, Math.min(1, ratio + adjustment));

    return adjustedRatio;
  }

  /**
   * Get explanation of why blend was adjusted
   */
  getAdjustmentReason(context: BlendingContext): string {
    const reasons: string[] = [];

    if (context.emotionalState === 'crisis') {
      reasons.push('Crisis state detected - providing grounding through scientific language');
    }

    if (context.emotionalState === 'breakthrough') {
      reasons.push('Breakthrough moment - allowing expansive poetic expression');
    }

    if (context.conversationPhase === 'deepening') {
      reasons.push('Conversation deepening - increasing mythic resonance');
    }

    if (context.alchemicalPhase === 'nigredo') {
      reasons.push('Nigredo phase - grounding the dissolution experience');
    }

    if (context.breakthroughDepth && context.breakthroughDepth > 0.8) {
      reasons.push('Deep breakthrough detected - full poetic license granted');
    }

    return reasons.join(' | ');
  }

  /**
   * Recommend blend adjustment for specific situations
   */
  recommendAdjustment(situation: string): number {
    const recommendations: Record<string, number> = {
      'user_confused': 0.3,              // More scientific clarity
      'user_stuck_pattern': 0.4,         // Scientific pattern analysis
      'user_seeking_meaning': 0.7,       // More mythic wisdom
      'user_in_flow': 0.6,               // Balanced mythic
      'user_fragmented': 0.35,           // Grounding scientific
      'user_expanded': 0.75,             // Allow full mythic
      'user_shadow_work': 0.55,          // Balanced for depth
      'user_reality_testing': 0.4,       // Scientific correlation
      'user_mystical_experience': 0.8    // Honor the numinous
    };

    return recommendations[situation] ?? 0.5;
  }

  /**
   * Track blend effectiveness over time
   */
  async logBlendEffectiveness(
    userId: string,
    blendRatio: number,
    context: BlendingContext,
    wasHelpful: boolean,
    engagementMetric: number
  ): Promise<void> {
    // Store for research/learning
    const logEntry = {
      userId,
      blendRatio,
      emotionalState: context.emotionalState,
      conversationPhase: context.conversationPhase,
      alchemicalPhase: context.alchemicalPhase,
      wasHelpful,
      engagementMetric,
      timestamp: new Date()
    };

    // TODO: Store in Supabase for analysis
    console.log('[Blend Effectiveness]', logEntry);
  }

  /**
   * Get optimal blend based on user history
   */
  async getOptimalBlendForUser(userId: string): Promise<number> {
    // TODO: Query historical effectiveness data
    // Return blend ratio that worked best for this user

    // For now, return balanced default
    return 0.5;
  }

  /**
   * Adaptive learning: Adjust user's base preference over time
   */
  async adaptUserPreference(
    userId: string,
    currentPreference: number,
    recentEffectiveness: { blend: number; success: boolean }[]
  ): Promise<number> {
    // Find which blend ratios worked best
    const successful = recentEffectiveness.filter(e => e.success);

    if (successful.length === 0) return currentPreference;

    // Calculate average successful blend
    const avgSuccessfulBlend = successful.reduce((sum, e) => sum + e.blend, 0) / successful.length;

    // Gradually adjust preference toward what works
    const adjustment = (avgSuccessfulBlend - currentPreference) * 0.1; // 10% nudge

    return Math.max(0, Math.min(1, currentPreference + adjustment));
  }
}

export const contextAwareBlending = new ContextAwareBlendingService();

// Helper function for easy integration
export function getContextualBlend(
  userBasePreference: number,
  emotionalState: EmotionalState,
  phase: ConversationPhase,
  alchemicalPhase?: AlchemicalPhase
): number {
  return contextAwareBlending.adjustBlendForMoment({
    emotionalState,
    conversationPhase: phase,
    alchemicalPhase,
    userPreferredRatio: userBasePreference
  });
}