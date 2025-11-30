/**
 * Intent Mapping Service
 * Maps between EnhancedDialogueStateTracker intents and ResearchLogger's 20 intents
 */

import { UserIntent } from './EnhancedDialogueStateTracker';
import { logger } from '../utils/logger';

export class IntentMappingService {
  // Map from DialogueStateTracker intents to ResearchLogger intent numbers (1-20)
  private readonly intentMapping = new Map<UserIntent, number[]>([
    // Information seeking intents
    [UserIntent.SEEKING_INFORMATION, [2, 15]], // seeking_guidance, curiosity_learning
    [UserIntent.CLARIFICATION, [2]], // seeking_guidance
    [UserIntent.EXPLORATION, [4, 6, 15, 20]], // philosophical_inquiry, spiritual_exploration, curiosity_learning, wisdom_seeking
    
    // Emotional intents
    [UserIntent.VENTING, [3]], // emotional_expression
    [UserIntent.SEEKING_SUPPORT, [2, 14]], // seeking_guidance, crisis_support
    [UserIntent.CELEBRATION, [13]], // celebration_achievement
    [UserIntent.PROCESSING_GRIEF, [3, 14]], // emotional_expression, crisis_support
    
    // Relational intents
    [UserIntent.CONNECTION, [1]], // greeting_connection
    [UserIntent.CHALLENGING, [11]], // resistance_expression
    [UserIntent.TESTING_BOUNDARIES, [16]], // boundary_setting
    [UserIntent.DEEPENING, [8, 12]], // relationship_dynamics, vulnerability_sharing
    
    // Transformational intents
    [UserIntent.SEEKING_CHANGE, [19]], // transition_navigation
    [UserIntent.INTEGRATION, [10]], // integration_request
    [UserIntent.BREAKTHROUGH, [17]], // breakthrough_moment
    [UserIntent.RESISTANCE, [11]], // resistance_expression
    
    // Practical intents
    [UserIntent.TASK_ORIENTED, [5]], // practical_help
    [UserIntent.PROBLEM_SOLVING, [5]], // practical_help
    [UserIntent.DECISION_MAKING, [2, 5]], // seeking_guidance, practical_help
    
    // Spiritual/Philosophical
    [UserIntent.MEANING_MAKING, [4, 9]], // philosophical_inquiry, shadow_work
    [UserIntent.EXISTENTIAL, [4, 6]], // philosophical_inquiry, spiritual_exploration
    [UserIntent.SPIRITUAL_INQUIRY, [6, 20]] // spiritual_exploration, wisdom_seeking
  ]);

  // Secondary mappings based on keywords and context
  private readonly keywordIntentMapping = new Map<string[], number>([
    [['creative', 'stuck', 'blocked', 'inspiration'], 7], // creative_block
    [['shadow', 'dark', 'hidden', 'unconscious'], 9], // shadow_work
    [['grateful', 'thankful', 'appreciate', 'gratitude'], 18], // gratitude_expression
  ]);

  /**
   * Get ResearchLogger intent number(s) from DialogueStateTracker intent
   */
  getResearchLoggerIntents(
    userIntent: UserIntent,
    message: string,
    confidence: number
  ): { primary: number; secondary: number[]; mappingConfidence: number } {
    const mappedIntents = this.intentMapping.get(userIntent) || [2]; // Default to seeking_guidance
    
    // Check for keyword-based intents
    const additionalIntents = this.detectKeywordIntents(message);
    
    // Combine and deduplicate
    const allIntents = [...new Set([...mappedIntents, ...additionalIntents])];
    
    // Sort by relevance (first mapped intent is usually most relevant)
    const primary = allIntents[0];
    const secondary = allIntents.slice(1);
    
    // Calculate mapping confidence
    const mappingConfidence = this.calculateMappingConfidence(userIntent, message, confidence);
    
    logger.debug('Intent mapping', {
      originalIntent: userIntent,
      mappedPrimary: primary,
      mappedSecondary: secondary,
      confidence: mappingConfidence
    });
    
    return {
      primary,
      secondary,
      mappingConfidence
    };
  }

  /**
   * Detect additional intents based on keywords
   */
  private detectKeywordIntents(message: string): number[] {
    const detectedIntents: number[] = [];
    const lowerMessage = message.toLowerCase();
    
    for (const [keywords, intentNumber] of this.keywordIntentMapping) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        detectedIntents.push(intentNumber);
      }
    }
    
    return detectedIntents;
  }

  /**
   * Calculate confidence in the intent mapping
   */
  private calculateMappingConfidence(
    userIntent: UserIntent,
    message: string,
    originalConfidence: number
  ): number {
    // Start with original confidence
    let confidence = originalConfidence;
    
    // Boost confidence if we have a direct mapping
    if (this.intentMapping.has(userIntent)) {
      confidence *= 1.2;
    }
    
    // Check for intent-specific markers
    if (this.hasStrongIntentMarkers(userIntent, message)) {
      confidence *= 1.3;
    }
    
    // Cap at 0.95
    return Math.min(0.95, confidence);
  }

  /**
   * Check for strong markers of specific intents
   */
  private hasStrongIntentMarkers(intent: UserIntent, message: string): boolean {
    const markers: Record<UserIntent, string[]> = {
      [UserIntent.BREAKTHROUGH]: ['realize', 'aha', 'now I see', 'breakthrough'],
      [UserIntent.RESISTANCE]: ['but', 'however', "don't agree", 'not sure'],
      [UserIntent.CELEBRATION]: ['amazing', 'wonderful', 'achieved', 'success'],
      [UserIntent.PROCESSING_GRIEF]: ['loss', 'grief', 'mourning', 'passed away'],
      [UserIntent.SPIRITUAL_INQUIRY]: ['soul', 'spirit', 'divine', 'sacred']
    } as Record<UserIntent, string[]>;
    
    const intentMarkers = markers[intent];
    if (!intentMarkers) return false;
    
    const lowerMessage = message.toLowerCase();
    return intentMarkers.some(marker => lowerMessage.includes(marker));
  }

  /**
   * Map dialogue stage to ResearchLogger stage number (1-8)
   */
  mapDialogueStage(stage: string): number {
    const stageMapping: Record<string, number> = {
      'opening': 1, // initial_contact
      'establishing_rapport': 2, // trust_building
      'exploring': 3, // exploration
      'deepening': 4, // deepening
      'challenging': 5, // challenge_growth
      'integrating': 6, // integration
      'breakthrough': 7, // transformation
      'closing': 8 // ongoing_companionship
    };
    
    return stageMapping[stage] || 3; // Default to exploration
  }
}

// Export singleton
export const intentMappingService = new IntentMappingService();