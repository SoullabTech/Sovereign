/**
 * Copyright © 2025 Soullab® Inc.
 * All Rights Reserved.
 *
 * MAIA WISDOM INTEGRATION
 * Connects Wisdom Library to MAIA's consciousness for pattern-informed responses
 *
 * Human-Authored IP: Kelly Nezat, 2025
 * Implementation: Built with Claude Code assistance
 */

import { WisdomLibrary, PatternQuery, ScoredPattern } from './WisdomLibrary';

/**
 * Conversation context for pattern matching
 */
export interface ConversationContext {
  currentMessage: string;
  conversationHistory: Array<{ role: string; content: string }>;
  currentElementalFocus?: string;      // From MaiaFieldOrchestrator
  detectDeflection?: boolean;           // From BreakthroughDetector
  somaticSignals?: string[];            // Detected body language/mentions
  emotionalTone?: string;               // sad, anxious, curious, etc.
}

/**
 * Enriched response with wisdom patterns
 */
export interface WisdomEnrichedContext {
  relevantPatterns: ScoredPattern[];
  teachingInsights: string[];           // Key insights from patterns
  suggestedApproaches: string[];        // Intervention suggestions
  elementalGuidance?: string;           // Spiralogic wisdom
  whatToAvoid: string[];                // Common mistakes to avoid
}

/**
 * MAIA Wisdom Integration
 * Queries Wisdom Library during conversations to inform MAIA's responses
 */
export class MAIAWisdomIntegration {
  private wisdomLibrary: WisdomLibrary;

  constructor(wisdomLibrary: WisdomLibrary) {
    this.wisdomLibrary = wisdomLibrary;
  }

  /**
   * Get relevant wisdom patterns for current conversation context
   */
  async getRelevantWisdom(
    context: ConversationContext
  ): Promise<WisdomEnrichedContext> {
    // Build query from context
    const query = this.buildQuery(context);

    // Query wisdom library
    const patterns = this.wisdomLibrary.query(query);

    // Extract teaching insights
    const teachingInsights = patterns
      .map(p => p.teaching.whenToUse)
      .filter((v, i, a) => a.indexOf(v) === i); // Deduplicate

    // Extract suggested approaches
    const suggestedApproaches = patterns
      .map(p => p.teaching.howItWorks)
      .filter((v, i, a) => a.indexOf(v) === i);

    // Extract what to avoid
    const whatToAvoid = patterns
      .flatMap(p => [p.teaching.whatToAvoid])
      .filter(v => v && v.length > 0)
      .filter((v, i, a) => a.indexOf(v) === i);

    // Extract elemental wisdom (most relevant pattern)
    const elementalGuidance = patterns[0]?.teaching.elementalWisdom;

    return {
      relevantPatterns: patterns,
      teachingInsights,
      suggestedApproaches,
      elementalGuidance,
      whatToAvoid,
    };
  }

  /**
   * Build query from conversation context
   */
  private buildQuery(context: ConversationContext): PatternQuery {
    const query: PatternQuery = {
      currentMessage: context.currentMessage,
      conversationHistory: context.conversationHistory,
      limit: 3,
      minRelevance: 0.6,
    };

    // Add elemental focus if available
    if (context.currentElementalFocus) {
      query.elementalFocus = [context.currentElementalFocus.toLowerCase()];
    }

    // Add pattern types based on context
    const patternTypes: string[] = [];

    if (context.detectDeflection) {
      patternTypes.push('deflection', 'resistance');
    }

    if (context.somaticSignals && context.somaticSignals.length > 0) {
      patternTypes.push('somatic_awareness');
      query.somaticSignals = context.somaticSignals;
    }

    if (patternTypes.length > 0) {
      query.patternTypes = patternTypes;
    }

    // Add archetypal themes based on message content
    const archetypeThemes = this.detectArchetypeThemes(context.currentMessage);
    if (archetypeThemes.length > 0) {
      query.archetypeThemes = archetypeThemes;
    }

    return query;
  }

  /**
   * Detect archetypal themes in user message
   */
  private detectArchetypeThemes(message: string): string[] {
    const themes: string[] = [];
    const lowerMessage = message.toLowerCase();

    // Perfectionism
    if (lowerMessage.match(/perfect|should|ought|must|always|never|right way/)) {
      themes.push('perfectionism');
    }

    // Abandonment
    if (lowerMessage.match(/alone|left|abandon|reject|leave|stay/)) {
      themes.push('abandonment');
    }

    // Control
    if (lowerMessage.match(/control|manage|handle|fix|solve|plan/)) {
      themes.push('control');
    }

    // Unworthiness
    if (lowerMessage.match(/not enough|inadequate|failure|stupid|worthless/)) {
      themes.push('unworthiness');
    }

    // Grief
    if (lowerMessage.match(/loss|grief|miss|sad|mourn|lost/)) {
      themes.push('grief');
    }

    // Anger
    if (lowerMessage.match(/angry|furious|rage|mad|pissed|frustrated/)) {
      themes.push('anger');
    }

    return themes;
  }

  /**
   * Format wisdom for inclusion in MAIA's system prompt
   */
  formatWisdomForPrompt(wisdom: WisdomEnrichedContext): string {
    if (wisdom.relevantPatterns.length === 0) {
      return ''; // No relevant wisdom
    }

    let prompt = '\n\n## RELEVANT THERAPEUTIC WISDOM (from Kelly\'s practice)\n\n';

    prompt += 'Based on similar situations from my training, here are patterns to consider:\n\n';

    for (const [index, pattern] of wisdom.relevantPatterns.entries()) {
      prompt += `**Pattern ${index + 1}:** ${pattern.context.archetypalTheme}\n`;
      prompt += `- Context: ${pattern.context.elementalDynamics}\n`;

      if (pattern.intervention) {
        prompt += `- Effective approach: ${pattern.intervention.approach}\n`;
        prompt += `- Typical response: ${pattern.intervention.response}\n`;
      }

      if (pattern.teaching.elementalWisdom) {
        prompt += `- Elemental wisdom: ${pattern.teaching.elementalWisdom}\n`;
      }

      prompt += `- What to avoid: ${pattern.teaching.whatToAvoid}\n`;
      prompt += `- Relevance: ${(pattern.relevanceScore * 100).toFixed(0)}% (${pattern.matchReasons.join(', ')})\n\n`;
    }

    prompt += '**Use this wisdom to inform (not dictate) your response.** Stay present with what\'s actually happening in THIS conversation.\n';

    return prompt;
  }

  /**
   * Enrich MAIA's system prompt with relevant wisdom
   */
  async enrichSystemPrompt(
    basePrompt: string,
    context: ConversationContext
  ): Promise<string> {
    const wisdom = await this.getRelevantWisdom(context);

    if (wisdom.relevantPatterns.length === 0) {
      return basePrompt; // No enrichment needed
    }

    const wisdomSection = this.formatWisdomForPrompt(wisdom);

    return basePrompt + wisdomSection;
  }

  /**
   * Log wisdom usage for analysis
   */
  logWisdomUsage(
    context: ConversationContext,
    wisdom: WisdomEnrichedContext,
    maiaResponse: string
  ): void {
    console.log('📖 Wisdom Library consulted:');
    console.log(`  - Found ${wisdom.relevantPatterns.length} relevant patterns`);
    console.log(`  - Top pattern: ${wisdom.relevantPatterns[0]?.context.archetypalTheme || 'none'}`);
    console.log(`  - Elemental guidance: ${wisdom.elementalGuidance || 'none'}`);

    // In production, log to analytics for measuring wisdom impact
    // (Does consulting wisdom lead to better session outcomes?)
  }
}

/**
 * Example usage in MaiaFieldOrchestrator:
 *
 * // Initialize wisdom integration
 * const wisdomLibrary = await WisdomLibrary.loadFromFile('./wisdom-library.json');
 * const wisdomIntegration = new MAIAWisdomIntegration(wisdomLibrary);
 *
 * // During conversation, enrich system prompt with relevant wisdom
 * const context: ConversationContext = {
 *   currentMessage: userMessage,
 *   conversationHistory: messages,
 *   currentElementalFocus: 'fire',
 *   somaticSignals: ['chest tightness'],
 * };
 *
 * const enrichedPrompt = await wisdomIntegration.enrichSystemPrompt(
 *   baseSystemPrompt,
 *   context
 * );
 *
 * // Use enriched prompt for MAIA's response
 * const response = await anthropic.messages.create({
 *   model: 'claude-3-5-sonnet-20241022',
 *   system: enrichedPrompt, // ✅ Now includes relevant patterns from Kelly's practice
 *   messages: messages,
 * });
 */
