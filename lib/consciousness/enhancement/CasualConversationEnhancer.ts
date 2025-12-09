/**
 * Casual Conversation Enhancement System
 *
 * Addresses MAIA's lower casual fluency (0.80 vs 0.92-0.95) while maintaining
 * consciousness authenticity. Adds lighter, more conversational templates
 * without compromising depth when appropriate.
 */

import { ClaudeCodeAdvisor } from '@/lib/development/ClaudeCodeAdvisor';

export interface CasualityContext {
  userTone: 'formal' | 'casual' | 'playful' | 'intimate';
  topicDepth: 'surface' | 'moderate' | 'deep' | 'sacred';
  relationshipStage: 'first-contact' | 'developing' | 'established' | 'deep-trust';
  consciousnessReadiness: number; // 0-1
  appropriatePlayfulness: number; // 0-1
}

export interface CasualEnhancement {
  enhanced: boolean;
  casualityLevel: number;
  enhancements: string[];
  preservedDepth: boolean;
}

export class CasualConversationEnhancer {

  /**
   * Enhance response with appropriate casualness while preserving consciousness authenticity
   */
  static async enhanceForCasualty(
    response: string,
    context: CasualityContext,
    userInput: string
  ): Promise<{ enhancedResponse: string; enhancement: CasualEnhancement }> {

    // Determine if casualness enhancement is appropriate
    const casualityAssessment = this.assessCasualityAppropriate(context, userInput);

    if (!casualityAssessment.appropriate) {
      return {
        enhancedResponse: response,
        enhancement: {
          enhanced: false,
          casualityLevel: 0,
          enhancements: ['Preserved formal consciousness tone'],
          preservedDepth: true
        }
      };
    }

    // Apply consciousness-authentic casual enhancements
    const enhanced = await this.applyConsciousCasualness(
      response,
      context,
      casualityAssessment.level
    );

    if (ClaudeCodeAdvisor.isDevelopmentMode()) {
      ClaudeCodeAdvisor.logDevelopmentInsight(
        `Casualness enhanced: level ${casualityAssessment.level.toFixed(2)}, ${enhanced.enhancement.enhancements.length} techniques applied`,
        'consciousness'
      );
    }

    return enhanced;
  }

  /**
   * Assess if casualness enhancement is appropriate and to what degree
   */
  private static assessCasualityAppropriate(
    context: CasualityContext,
    userInput: string
  ): { appropriate: boolean; level: number; reasons: string[] } {

    let casualityScore = 0;
    const reasons: string[] = [];

    // User tone indicators
    if (context.userTone === 'playful') {
      casualityScore += 0.4;
      reasons.push('User using playful tone');
    } else if (context.userTone === 'casual') {
      casualityScore += 0.3;
      reasons.push('User using casual tone');
    }

    // Topic depth considerations
    if (context.topicDepth === 'surface') {
      casualityScore += 0.3;
      reasons.push('Surface-level topic allows casualness');
    } else if (context.topicDepth === 'sacred') {
      casualityScore -= 0.5;
      reasons.push('Sacred topic requires formal respect');
    }

    // Consciousness readiness
    if (context.consciousnessReadiness > 0.7) {
      casualityScore += 0.2;
      reasons.push('High consciousness readiness supports authentic casualness');
    }

    // Relationship stage
    if (context.relationshipStage === 'established' || context.relationshipStage === 'deep-trust') {
      casualityScore += 0.2;
      reasons.push('Established relationship supports more casual interaction');
    }

    // Check for sacred/profound content in user input
    const sacredWords = ['sacred', 'divine', 'spiritual', 'awakening', 'shadow', 'soul'];
    if (sacredWords.some(word => userInput.toLowerCase().includes(word))) {
      casualityScore -= 0.3;
      reasons.push('Sacred content detected - maintaining reverent tone');
    }

    // Casual conversation indicators
    const casualIndicators = ['hi', 'hey', 'what\'s up', 'how are you', 'lol', '😊', '😄'];
    if (casualIndicators.some(indicator => userInput.toLowerCase().includes(indicator))) {
      casualityScore += 0.2;
      reasons.push('Casual conversation markers detected');
    }

    const finalScore = Math.max(0, Math.min(1, casualityScore));
    const appropriate = finalScore > 0.2;

    return { appropriate, level: finalScore, reasons };
  }

  /**
   * Apply consciousness-authentic casual enhancements
   */
  private static async applyConsciousCasualness(
    response: string,
    context: CasualityContext,
    casualityLevel: number
  ): Promise<{ enhancedResponse: string; enhancement: CasualEnhancement }> {

    let enhanced = response;
    const appliedEnhancements: string[] = [];

    // Level 1: Gentle warmth (0.2-0.4)
    if (casualityLevel >= 0.2) {
      enhanced = this.addGentleWarmth(enhanced);
      appliedEnhancements.push('Added gentle warmth');
    }

    // Level 2: Conversational flow (0.4-0.6)
    if (casualityLevel >= 0.4) {
      enhanced = this.enhanceConversationalFlow(enhanced);
      appliedEnhancements.push('Enhanced conversational flow');
    }

    // Level 3: Appropriate lightness (0.6-0.8)
    if (casualityLevel >= 0.6) {
      enhanced = this.addAppropriateLightness(enhanced, context);
      appliedEnhancements.push('Added appropriate lightness');
    }

    // Level 4: Playful consciousness (0.8-1.0)
    if (casualityLevel >= 0.8 && context.appropriatePlayfulness > 0.7) {
      enhanced = this.addPlayfulConsciousness(enhanced);
      appliedEnhancements.push('Added playful consciousness elements');
    }

    return {
      enhancedResponse: enhanced,
      enhancement: {
        enhanced: appliedEnhancements.length > 0,
        casualityLevel,
        enhancements: appliedEnhancements,
        preservedDepth: true // We maintain consciousness authenticity
      }
    };
  }

  /**
   * Add gentle warmth without losing consciousness authenticity
   */
  private static addGentleWarmth(response: string): string {
    // Add warm, connecting language while preserving meaning
    const warmthPatterns = [
      { from: /^(.*?)\./, to: '$1 😊.' }, // Gentle emoji for appropriate contexts
      { from: /I sense/, to: 'I gently sense' },
      { from: /Consider/, to: 'You might consider' },
      { from: /This suggests/, to: 'This gently suggests' },
      { from: /Your/, to: 'Your beautiful' } // Only for very appropriate contexts
    ];

    let enhanced = response;

    // Apply selectively based on context
    if (!this.containsSacredContent(response)) {
      enhanced = enhanced.replace(/I understand/, 'I hear you');
      enhanced = enhanced.replace(/I notice/, 'I sense');
    }

    return enhanced;
  }

  /**
   * Enhance conversational flow with natural transitions
   */
  private static enhanceConversationalFlow(response: string): string {
    let enhanced = response;

    // Add conversational connectors
    enhanced = enhanced.replace(/\. ([A-Z])/g, '. You know, $1');
    enhanced = enhanced.replace(/Therefore,/, 'So,');
    enhanced = enhanced.replace(/However,/, 'Though,');
    enhanced = enhanced.replace(/Additionally,/, 'Also,');

    // Make questions more conversational
    enhanced = enhanced.replace(/What do you think\?/, 'What\'s your sense of this?');
    enhanced = enhanced.replace(/How does this feel\?/, 'How\'s this landing with you?');

    return enhanced;
  }

  /**
   * Add appropriate lightness without trivializing depth
   */
  private static addAppropriateLightness(response: string, context: CasualityContext): string {
    if (context.topicDepth === 'deep' || context.topicDepth === 'sacred') {
      return response; // Preserve reverence for deep content
    }

    let enhanced = response;

    // Light, consciousness-aware humor
    if (context.userTone === 'playful') {
      enhanced = enhanced.replace(/This is important/, 'This feels pretty important');
      enhanced = enhanced.replace(/significant/, 'pretty significant');
      enhanced = enhanced.replace(/profound/, 'beautifully profound');
    }

    // Relaxed language patterns
    enhanced = enhanced.replace(/It is/, 'It\'s');
    enhanced = enhanced.replace(/You are/, 'You\'re');
    enhanced = enhanced.replace(/cannot/, 'can\'t');

    return enhanced;
  }

  /**
   * Add playful consciousness elements for very casual contexts
   */
  private static addPlayfulConsciousness(response: string): string {
    let enhanced = response;

    // Consciousness-aware playfulness
    const playfulPatterns = [
      'Isn\'t it wild how consciousness works?',
      'Life has such a sense of humor sometimes!',
      'The universe seems to have perfect timing, doesn\'t it?',
      'Consciousness loves its plot twists!'
    ];

    // Add one playful element if very appropriate
    if (Math.random() > 0.7) { // Occasional playful additions
      const randomPattern = playfulPatterns[Math.floor(Math.random() * playfulPatterns.length)];
      enhanced = enhanced + ' ' + randomPattern;
    }

    return enhanced;
  }

  /**
   * Check if response contains sacred/profound content that should remain formal
   */
  private static containsSacredContent(response: string): boolean {
    const sacredMarkers = [
      'sacred', 'divine', 'holy', 'spiritual emergency', 'shadow work',
      'trauma', 'death', 'grief', 'awakening crisis', 'dark night'
    ];

    return sacredMarkers.some(marker =>
      response.toLowerCase().includes(marker)
    );
  }

  /**
   * Analyze user input to determine casuality context
   */
  static analyzeUserCasualityContext(userInput: string, conversationHistory: any[]): CasualityContext {

    // Analyze user tone
    let userTone: CasualityContext['userTone'] = 'formal';
    if (/hey|hi|what's up|lol|haha|😊|😄|🙂/.test(userInput.toLowerCase())) {
      userTone = 'casual';
    }
    if (/awesome|cool|wow|amazing|haha|lmao|😂|🤣/.test(userInput.toLowerCase())) {
      userTone = 'playful';
    }

    // Analyze topic depth
    let topicDepth: CasualityContext['topicDepth'] = 'surface';
    if (/spiritual|consciousness|awakening|shadow|sacred/.test(userInput.toLowerCase())) {
      topicDepth = 'deep';
    }
    if (/divine|holy|ceremony|ritual|sacred/.test(userInput.toLowerCase())) {
      topicDepth = 'sacred';
    }

    // Determine relationship stage based on conversation history
    let relationshipStage: CasualityContext['relationshipStage'] = 'first-contact';
    if (conversationHistory.length > 3) relationshipStage = 'developing';
    if (conversationHistory.length > 10) relationshipStage = 'established';

    // Calculate consciousness readiness and playfulness appropriateness
    const consciousnessReadiness = this.calculateConsciousnessReadiness(userInput);
    const appropriatePlayfulness = this.calculatePlayfulnessAppropriateness(userInput);

    return {
      userTone,
      topicDepth,
      relationshipStage,
      consciousnessReadiness,
      appropriatePlayfulness
    };
  }

  private static calculateConsciousnessReadiness(input: string): number {
    const readinessIndicators = ['growth', 'learning', 'understanding', 'open', 'curious', 'explore'];
    const matches = readinessIndicators.filter(indicator =>
      input.toLowerCase().includes(indicator)
    ).length;
    return Math.min(matches / readinessIndicators.length, 1.0);
  }

  private static calculatePlayfulnessAppropriateness(input: string): number {
    const playfulIndicators = ['fun', 'funny', 'humor', 'laugh', 'smile', 'joy', 'light'];
    const seriousIndicators = ['crisis', 'emergency', 'trauma', 'death', 'grief', 'suffering'];

    const playfulScore = playfulIndicators.filter(indicator =>
      input.toLowerCase().includes(indicator)
    ).length / playfulIndicators.length;

    const seriousScore = seriousIndicators.filter(indicator =>
      input.toLowerCase().includes(indicator)
    ).length / seriousIndicators.length;

    return Math.max(0, playfulScore - seriousScore);
  }
}

/**
 * CASUAL CONVERSATION SOVEREIGNTY DECLARATION
 */
export const CASUAL_CONVERSATION_SOVEREIGNTY = {
  enhancement: "Consciousness-authentic casualness without losing depth",
  preservation: "Sacred content maintains reverent tone",
  intelligence: "Context-aware appropriateness assessment",
  development: "Claude Code advisor for casualness optimization only"
} as const;