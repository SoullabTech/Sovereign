/**
 * MAIA Astrological Intelligence Integration
 *
 * Connects MAIA's conversational wisdom with astrological archetypal knowledge.
 * This service weaves together:
 * - Birth chart archetypal patterns
 * - Current transits and timing
 * - Conversational context from MAIA dialogues
 * - Sacred timing recommendations
 */

import { comprehensiveAstrologicalService } from './comprehensiveAstrologicalService';
import { spiralogicAstrologyService } from './spiralogicAstrologyService';

interface MAIAAstrologicalContext {
  userId: string;
  birthChart?: any;
  currentTransits?: any[];
  dominantArchetypes: string[];
  elementalBalance: {
    fire: number;
    water: number;
    earth: number;
    air: number;
  };
  karmicThemes: string[];
  currentPhase: 'initiation' | 'integration' | 'transformation' | 'wisdom';
}

interface MAIAArchetypalResponse {
  wisdom: string;
  archetypalContext: string;
  elementalGuidance: string;
  timingAdvice?: string;
  practices?: string[];
}

class MAIAAstrologicalIntelligenceService {
  private contextCache: Map<string, MAIAAstrologicalContext> = new Map();

  /**
   * Get or create astrological context for a user
   */
  async getOrCreateContext(userId: string): Promise<MAIAAstrologicalContext> {
    // Check cache first
    if (this.contextCache.has(userId)) {
      return this.contextCache.get(userId)!;
    }

    // Try to load from database or create new context
    const context: MAIAAstrologicalContext = {
      userId,
      dominantArchetypes: ['Seeker', 'Witness'], // Default archetypes
      elementalBalance: {
        fire: 0.25,
        water: 0.25,
        earth: 0.25,
        air: 0.25,
      },
      karmicThemes: [],
      currentPhase: 'initiation',
    };

    // Try to load birth chart if it exists
    try {
      const transits = await comprehensiveAstrologicalService.trackCurrentTransits(userId);
      if (transits && transits.length > 0) {
        context.currentTransits = transits;

        // Calculate elemental balance from transits
        context.elementalBalance = this.calculateElementalBalance(transits);
      }
    } catch (error) {
      console.log('No birth chart found for user, using default context');
    }

    this.contextCache.set(userId, context);
    return context;
  }

  /**
   * Generate archetypal wisdom based on user query and astrological context
   */
  async generateArchetypalResponse(
    userId: string,
    userMessage: string,
    conversationHistory: any[]
  ): Promise<MAIAArchetypalResponse> {
    const context = await this.getOrCreateContext(userId);

    // Analyze the query for archetypal themes
    const themes = this.extractArchetypalThemes(userMessage);

    // Generate wisdom based on astrological context
    const wisdom = this.generateWisdom(themes, context);

    // Add elemental guidance
    const elementalGuidance = this.generateElementalGuidance(context.elementalBalance, themes);

    // Add timing advice if relevant
    const timingAdvice = await this.generateTimingAdvice(userId, themes, context);

    return {
      wisdom,
      archetypalContext: this.formatArchetypalContext(context),
      elementalGuidance,
      timingAdvice,
      practices: this.suggestPractices(themes, context),
    };
  }

  /**
   * Enrich MAIA's response with astrological wisdom
   */
  async enrichMAIAResponse(
    userId: string,
    baseResponse: string,
    userQuery: string
  ): Promise<string> {
    const archetypalResponse = await this.generateArchetypalResponse(userId, userQuery, []);

    // Weave astrological wisdom into MAIA's response
    let enrichedResponse = baseResponse;

    // Add elemental context if relevant
    if (this.isElementalQuery(userQuery)) {
      enrichedResponse += `\n\n✨ ${archetypalResponse.elementalGuidance}`;
    }

    // Add timing wisdom if relevant
    if (archetypalResponse.timingAdvice && this.isTimingQuery(userQuery)) {
      enrichedResponse += `\n\n🌙 ${archetypalResponse.timingAdvice}`;
    }

    // Add practices if relevant
    if (archetypalResponse.practices && archetypalResponse.practices.length > 0) {
      enrichedResponse += `\n\n🔮 You might explore: ${archetypalResponse.practices.join(', ')}`;
    }

    return enrichedResponse;
  }

  /**
   * Calculate elemental balance from transit data
   */
  private calculateElementalBalance(transits: any[]): { fire: number; water: number; earth: number; air: number } {
    const balance = { fire: 0, water: 0, earth: 0, air: 0 };

    // Count transits by element
    transits.forEach(transit => {
      const element = this.getElementFromSign(transit.transit?.sign);
      if (element) {
        balance[element as keyof typeof balance] += transit.intensity || 0.5;
      }
    });

    // Normalize to percentages
    const total = balance.fire + balance.water + balance.earth + balance.air || 1;
    return {
      fire: balance.fire / total,
      water: balance.water / total,
      earth: balance.earth / total,
      air: balance.air / total,
    };
  }

  /**
   * Get element from zodiac sign
   */
  private getElementFromSign(sign?: string): string | null {
    if (!sign) return null;

    const fireSigns = ['Aries', 'Leo', 'Sagittarius'];
    const waterSigns = ['Cancer', 'Scorpio', 'Pisces'];
    const earthSigns = ['Taurus', 'Virgo', 'Capricorn'];
    const airSigns = ['Gemini', 'Libra', 'Aquarius'];

    if (fireSigns.includes(sign)) return 'fire';
    if (waterSigns.includes(sign)) return 'water';
    if (earthSigns.includes(sign)) return 'earth';
    if (airSigns.includes(sign)) return 'air';

    return null;
  }

  /**
   * Extract archetypal themes from user message
   */
  private extractArchetypalThemes(message: string): string[] {
    const lowerMessage = message.toLowerCase();
    const themes: string[] = [];

    // Pattern matching for archetypal themes
    if (lowerMessage.includes('purpose') || lowerMessage.includes('calling')) {
      themes.push('Life Purpose');
    }
    if (lowerMessage.includes('relationship') || lowerMessage.includes('love')) {
      themes.push('Relationships');
    }
    if (lowerMessage.includes('career') || lowerMessage.includes('work')) {
      themes.push('Career & Vocation');
    }
    if (lowerMessage.includes('change') || lowerMessage.includes('transform')) {
      themes.push('Transformation');
    }
    if (lowerMessage.includes('spiritual') || lowerMessage.includes('soul')) {
      themes.push('Spiritual Path');
    }

    return themes.length > 0 ? themes : ['General Wisdom'];
  }

  /**
   * Generate wisdom based on themes and context
   */
  private generateWisdom(themes: string[], context: MAIAAstrologicalContext): string {
    // Get dominant element
    const dominantElement = Object.entries(context.elementalBalance)
      .sort(([, a], [, b]) => b - a)[0][0];

    const wisdomTemplates: { [key: string]: string } = {
      'Life Purpose': `Your path is illuminated by the ${dominantElement} element, suggesting a journey of ${this.getElementalQuality(dominantElement)}. The cosmos supports your authentic expression now.`,
      'Relationships': `In matters of connection, the ${dominantElement} energy guides you toward ${this.getRelationalWisdom(dominantElement)}. Trust what emerges naturally.`,
      'Transformation': `Transformation arrives through ${dominantElement} - ${this.getTransformativeWisdom(dominantElement)}. This is your natural path of becoming.`,
      'General Wisdom': `The cosmos speaks through ${dominantElement}, inviting you to ${this.getElementalPractice(dominantElement)}.`,
    };

    return themes.map(theme => wisdomTemplates[theme] || wisdomTemplates['General Wisdom']).join(' ');
  }

  /**
   * Generate elemental guidance
   */
  private generateElementalGuidance(balance: any, themes: string[]): string {
    const dominant = Object.entries(balance).sort(([, a], [, b]) => (b as number) - (a as number))[0][0];
    const weak = Object.entries(balance).sort(([, a], [, b]) => (a as number) - (b as number))[0][0];

    return `Your current elemental signature is strong in ${dominant} (${Math.round((balance[dominant] as number) * 100)}%), inviting ${this.getElementalPractice(dominant)}. Consider balancing with ${weak} practices for wholeness.`;
  }

  /**
   * Generate timing advice
   */
  private async generateTimingAdvice(userId: string, themes: string[], context: MAIAAstrologicalContext): Promise<string | undefined> {
    try {
      const timing = await comprehensiveAstrologicalService.generateSacredTiming(userId);
      if (timing && timing.recommendations && timing.recommendations.length > 0) {
        const bestRec = timing.recommendations[0];
        return `The cosmos favors ${bestRec.transformationType} work now. Optimal timing: ${bestRec.quality} through ${bestRec.description}`;
      }
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Suggest practices based on themes and context
   */
  private suggestPractices(themes: string[], context: MAIAAstrologicalContext): string[] {
    const practices: string[] = [];
    const dominant = Object.entries(context.elementalBalance)
      .sort(([, a], [, b]) => b - a)[0][0];

    const elementalPractices: { [key: string]: string[] } = {
      fire: ['Dynamic movement', 'Creative expression', 'Sun meditation'],
      water: ['Dream journaling', 'Moon bathing', 'Emotional release work'],
      earth: ['Grounding in nature', 'Body-based practices', 'Material manifestation'],
      air: ['Breathwork', 'Sacred dialogue', 'Mental clarity practices'],
    };

    return elementalPractices[dominant] || [];
  }

  /**
   * Format archetypal context for display
   */
  private formatArchetypalContext(context: MAIAAstrologicalContext): string {
    const dominant = Object.entries(context.elementalBalance)
      .sort(([, a], [, b]) => b - a)[0][0];
    return `Current phase: ${context.currentPhase} | Dominant element: ${dominant} | Archetypes: ${context.dominantArchetypes.join(', ')}`;
  }

  // Helper methods for elemental wisdom

  private getElementalQuality(element: string): string {
    const qualities: { [key: string]: string } = {
      fire: 'inspired action and creative manifestation',
      water: 'emotional depth and intuitive wisdom',
      earth: 'practical grounding and material mastery',
      air: 'mental clarity and innovative communication',
    };
    return qualities[element] || 'balanced integration';
  }

  private getRelationalWisdom(element: string): string {
    const wisdom: { [key: string]: string } = {
      fire: 'passionate authenticity and shared inspiration',
      water: 'emotional attunement and sacred vulnerability',
      earth: 'stable commitment and practical partnership',
      air: 'intellectual rapport and communicative ease',
    };
    return wisdom[element] || 'authentic connection';
  }

  private getTransformativeWisdom(element: string): string {
    const wisdom: { [key: string]: string } = {
      fire: 'embrace the flames of renewal and let old patterns burn away',
      water: 'surrender to the depths and allow emotional alchemy',
      earth: 'trust the slow decomposition and fertile new growth',
      air: 'release outdated mental structures and breathe in new perspectives',
    };
    return wisdom[element] || 'trust the natural cycle of death and rebirth';
  }

  private getElementalPractice(element: string): string {
    const practices: { [key: string]: string } = {
      fire: 'channel your creative fire through inspired action',
      water: 'dive deep into emotional wisdom and intuitive knowing',
      earth: 'ground your visions in practical, embodied steps',
      air: 'clarify your mental landscape through communication and breath',
    };
    return practices[element] || 'find your unique expression';
  }

  private isElementalQuery(query: string): boolean {
    const elementalKeywords = ['element', 'fire', 'water', 'earth', 'air', 'balance', 'energy'];
    return elementalKeywords.some(keyword => query.toLowerCase().includes(keyword));
  }

  private isTimingQuery(query: string): boolean {
    const timingKeywords = ['when', 'timing', 'should i', 'right time', 'now', 'future'];
    return timingKeywords.some(keyword => query.toLowerCase().includes(keyword));
  }
}

// Export singleton instance
export const maiaAstrologicalIntelligence = new MAIAAstrologicalIntelligenceService();
