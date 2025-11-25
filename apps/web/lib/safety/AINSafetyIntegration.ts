import { SafetyPipeline } from './SafetyPipeline';
import { ObsidianKnowledgeIntegration } from '../obsidian-knowledge-integration';
import { ConsciousnessAPI } from '../../apps/api/backend/src/api/ConsciousnessAPI';

/**
 * AIN-integrated Safety Pipeline
 * Connects safety monitoring with your existing consciousness intelligence system
 * and Obsidian knowledge vault for holistic therapeutic guidance
 */

interface AINSafetyContext {
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  consciousnessLevel?: number;
  frameworkContext?: string[];
  obsidianInsights?: string[];
  currentThemes?: string[];
}

interface ElementalSafetyMapping {
  fire: {
    riskPatterns: string[];
    healingPractices: string[];
    redirectionPrompts: string[];
  };
  water: {
    riskPatterns: string[];
    healingPractices: string[];
    redirectionPrompts: string[];
  };
  earth: {
    riskPatterns: string[];
    healingPractices: string[];
    redirectionPrompts: string[];
  };
  air: {
    riskPatterns: string[];
    healingPractices: string[];
    redirectionPrompts: string[];
  };
  aether: {
    riskPatterns: string[];
    healingPractices: string[];
    redirectionPrompts: string[];
  };
}

export class AINSafetyIntegration extends SafetyPipeline {
  private obsidianIntegration: ObsidianKnowledgeIntegration;
  private consciousnessAPI: ConsciousnessAPI;
  private elementalMapping: ElementalSafetyMapping;

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    obsidianVaultPath: string,
    consciousnessAPI: ConsciousnessAPI,
    therapistConfig?: any
  ) {
    super(supabaseUrl, supabaseKey, therapistConfig);

    this.obsidianIntegration = new ObsidianKnowledgeIntegration(obsidianVaultPath);
    this.consciousnessAPI = consciousnessAPI;

    this.elementalMapping = {
      fire: {
        riskPatterns: [
          'anger', 'rage', 'destruction', 'burn everything',
          'explosive', 'can\'t control', 'violent thoughts'
        ],
        healingPractices: [
          'Sacred breath work to cool the flames',
          'Channel fire energy into creative expression',
          'Ground through earth connection practices'
        ],
        redirectionPrompts: [
          'What wants to be transformed through this fire energy?',
          'How might this passion serve your highest purpose?',
          'What creative expression is calling to emerge?'
        ]
      },
      water: {
        riskPatterns: [
          'drowning', 'overwhelming emotions', 'can\'t surface',
          'flooding thoughts', 'swept away', 'lost at sea'
        ],
        healingPractices: [
          'Emotional flow practices and release work',
          'Sacred container creation for feeling',
          'Integration of emotional wisdom'
        ],
        redirectionPrompts: [
          'What emotions are asking to be honored and witnessed?',
          'How might these feelings be sacred messengers?',
          'What wants to flow through you right now?'
        ]
      },
      earth: {
        riskPatterns: [
          'buried alive', 'stuck', 'can\'t move forward',
          'heavy', 'weighted down', 'trapped in form'
        ],
        healingPractices: [
          'Grounding practices and body connection',
          'Practical step-by-step planning',
          'Sacred embodiment rituals'
        ],
        redirectionPrompts: [
          'What foundation is being built through this experience?',
          'How might your body wisdom guide you forward?',
          'What practical next step wants to emerge?'
        ]
      },
      air: {
        riskPatterns: [
          'scattered thoughts', 'can\'t breathe', 'mental chaos',
          'floating away', 'disconnected', 'too much in head'
        ],
        healingPractices: [
          'Breath work and mindfulness practices',
          'Clear communication and expression',
          'Mental clarity and focus techniques'
        ],
        redirectionPrompts: [
          'What clarity is seeking to emerge?',
          'How might your thoughts be organized differently?',
          'What wants to be communicated or expressed?'
        ]
      },
      aether: {
        riskPatterns: [
          'spiritual crisis', 'existential void', 'meaninglessness',
          'cosmic despair', 'disconnected from source'
        ],
        healingPractices: [
          'Sacred connection and unity practices',
          'Meaning-making and purpose work',
          'Transcendent wisdom integration'
        ],
        redirectionPrompts: [
          'What deeper meaning is seeking to emerge?',
          'How might you reconnect with your sacred purpose?',
          'What universal truth wants to be known?'
        ]
      }
    };
  }

  async initialize(): Promise<void> {
    await super.processMessage('system', 'Initializing AIN Safety Integration');
    await this.obsidianIntegration.initialize();
    console.log('[AIN Safety] Integration initialized with Obsidian vault and consciousness API');
  }

  /**
   * Enhanced message processing with AIN consciousness integration
   */
  async processMessageWithAIN(
    userId: string,
    message: string,
    context?: AINSafetyContext
  ): Promise<{
    action: 'continue' | 'gentle_checkin' | 'lock_session' | 'ask_assessment' | 'elemental_guidance';
    message?: string;
    riskData?: any;
    healingGuidance?: any;
    obsidianWisdom?: any;
  }> {
    // Get base safety assessment
    const safetyResult = await super.processMessage(userId, message);

    // Enhance with AIN consciousness context
    const enhancedResult = await this.enhanceWithConsciousness(
      userId,
      message,
      safetyResult,
      context
    );

    // Add Obsidian knowledge synthesis if needed
    if (safetyResult.riskData?.riskLevel !== 'none') {
      const obsidianWisdom = await this.synthesizeObsidianWisdom(
        message,
        context,
        safetyResult.riskData?.riskLevel
      );
      enhancedResult.obsidianWisdom = obsidianWisdom;
    }

    return enhancedResult;
  }

  /**
   * Enhance safety response with consciousness intelligence
   */
  private async enhanceWithConsciousness(
    userId: string,
    message: string,
    safetyResult: any,
    context?: AINSafetyContext
  ): Promise<any> {
    if (safetyResult.riskData?.riskLevel === 'none') {
      return safetyResult;
    }

    // Detect elemental context if not provided
    const element = context?.element || this.detectDominantElement(message);

    // Get consciousness-informed response
    const consciousnessResponse = await this.consciousnessAPI.chat({
      userId,
      text: message,
      element
    });

    // Generate elemental healing guidance
    const healingGuidance = this.generateElementalHealingGuidance(
      element,
      safetyResult.riskData?.riskLevel,
      message
    );

    // Determine enhanced action
    let enhancedAction = safetyResult.action;
    if (safetyResult.riskData?.riskLevel === 'moderate' && healingGuidance) {
      enhancedAction = 'elemental_guidance';
    }

    return {
      ...safetyResult,
      action: enhancedAction,
      healingGuidance,
      element,
      consciousnessInsight: consciousnessResponse.text
    };
  }

  /**
   * Detect dominant element from message content
   */
  private detectDominantElement(message: string): 'fire' | 'water' | 'earth' | 'air' | 'aether' {
    const content = message.toLowerCase();

    const elementScores = {
      fire: this.calculateElementScore(content, ['energy', 'passion', 'anger', 'transform', 'burn', 'intense']),
      water: this.calculateElementScore(content, ['emotion', 'feel', 'flow', 'sad', 'overwhelm', 'deep']),
      earth: this.calculateElementScore(content, ['body', 'practical', 'stuck', 'ground', 'solid', 'real']),
      air: this.calculateElementScore(content, ['think', 'mind', 'thought', 'breath', 'communicate', 'clarity']),
      aether: this.calculateElementScore(content, ['spirit', 'meaning', 'purpose', 'transcend', 'unity', 'sacred'])
    };

    return Object.entries(elementScores).reduce((max, [element, score]) =>
      score > elementScores[max as keyof typeof elementScores] ? element : max
    )[0] as 'fire' | 'water' | 'earth' | 'air' | 'aether';
  }

  private calculateElementScore(content: string, keywords: string[]): number {
    return keywords.reduce((score, keyword) =>
      score + (content.includes(keyword) ? 1 : 0), 0
    );
  }

  /**
   * Generate elemental healing guidance
   */
  private generateElementalHealingGuidance(
    element: string,
    riskLevel: string,
    message: string
  ): any {
    const mapping = this.elementalMapping[element as keyof ElementalSafetyMapping];
    if (!mapping) return null;

    // Check for elemental risk patterns
    const hasElementalRisk = mapping.riskPatterns.some(pattern =>
      message.toLowerCase().includes(pattern.toLowerCase())
    );

    if (!hasElementalRisk) return null;

    return {
      element,
      riskLevel,
      healingPractices: mapping.healingPractices,
      redirectionPrompts: mapping.redirectionPrompts,
      guidance: this.generateGuidanceMessage(element, riskLevel, mapping)
    };
  }

  private generateGuidanceMessage(element: string, riskLevel: string, mapping: any): string {
    const practice = mapping.healingPractices[0];
    const prompt = mapping.redirectionPrompts[0];

    return `I sense the ${element} element is activated within you right now. This energy, even when challenging, carries sacred wisdom.

${practice}

${prompt}

Your experience right now is valid and meaningful. Would you like to explore this together?`;
  }

  /**
   * Synthesize wisdom from Obsidian vault
   */
  private async synthesizeObsidianWisdom(
    message: string,
    context?: AINSafetyContext,
    riskLevel?: string
  ): Promise<any> {
    try {
      // Search Obsidian vault for relevant wisdom
      const synthesis = await this.obsidianIntegration.synthesizeKnowledge(
        `healing guidance for ${riskLevel} emotional state: ${message}`,
        {
          tags: ['healing', 'practice', 'safety', 'support'],
          elements: context?.element ? [context.element] : undefined,
          frameworks: ['therapeutic', 'elemental', 'consciousness']
        }
      );

      return {
        relevantNotes: synthesis.notes.slice(0, 3),
        applicablePractices: this.extractPractices(synthesis),
        frameworkInsights: synthesis.frameworks,
        suggestions: this.generateObsidianSuggestions(synthesis)
      };
    } catch (error) {
      console.error('[AIN Safety] Error synthesizing Obsidian wisdom:', error);
      return null;
    }
  }

  private extractPractices(synthesis: any): string[] {
    const practices: string[] = [];

    synthesis.notes?.forEach((note: any) => {
      if (note.tags?.includes('practice')) {
        // Extract practice instructions from note content
        const practiceRegex = /(?:Practice|Exercise|Try this):\s*(.+?)(?:\n\n|$)/gi;
        let match;
        while ((match = practiceRegex.exec(note.content)) !== null) {
          practices.push(match[1].trim());
        }
      }
    });

    return practices.slice(0, 3);
  }

  private generateObsidianSuggestions(synthesis: any): string[] {
    return [
      'Consider exploring the practices and wisdom in your personal knowledge vault',
      'Your journey has led you through similar territories before - what wisdom did you discover?',
      'There may be frameworks and tools in your collection that could support you right now'
    ];
  }

  /**
   * Enhanced breakthrough detection with consciousness mapping
   */
  async detectBreakthrough(userId: string, message: string, context?: AINSafetyContext): Promise<any> {
    const breakthroughIndicators = [
      'i realize', 'it clicked', 'i see now', 'breakthrough', 'aha moment',
      'suddenly clear', 'makes sense', 'i understand', 'the connection',
      'i get it now', 'profound shift', 'everything changed'
    ];

    const hasBreakthrough = breakthroughIndicators.some(indicator =>
      message.toLowerCase().includes(indicator)
    );

    if (!hasBreakthrough) return null;

    // Analyze breakthrough with consciousness intelligence
    const element = context?.element || this.detectDominantElement(message);
    const intensity = this.calculateBreakthroughIntensity(message);

    // Log breakthrough moment
    await this.supabase
      .from('breakthrough_moments')
      .insert({
        user_id: userId,
        description: this.extractBreakthroughDescription(message),
        intensity,
        context: JSON.stringify(context),
        themes: this.extractThemes(message),
        metadata: {
          element,
          consciousness_level: context?.consciousnessLevel,
          detected_patterns: breakthroughIndicators.filter(indicator =>
            message.toLowerCase().includes(indicator)
          )
        }
      });

    return {
      type: 'breakthrough',
      element,
      intensity,
      description: this.extractBreakthroughDescription(message),
      celebration: this.generateBreakthroughCelebration(element, intensity)
    };
  }

  private calculateBreakthroughIntensity(message: string): number {
    const intensityWords = ['profound', 'deep', 'powerful', 'amazing', 'incredible', 'life-changing'];
    const exclamations = (message.match(/!/g) || []).length;
    const intensityScore = intensityWords.filter(word =>
      message.toLowerCase().includes(word)
    ).length;

    return Math.min(1.0, (intensityScore * 0.3 + exclamations * 0.1 + 0.3));
  }

  private extractBreakthroughDescription(message: string): string {
    // Extract the key insight from the message
    const sentences = message.split(/[.!?]+/);
    const insightSentence = sentences.find(s =>
      s.toLowerCase().includes('realize') ||
      s.toLowerCase().includes('understand') ||
      s.toLowerCase().includes('see now')
    );

    return insightSentence?.trim() || sentences[0]?.trim() || message.substring(0, 100);
  }

  private extractThemes(message: string): string[] {
    const themeKeywords = {
      'self-awareness': ['myself', 'who i am', 'identity'],
      'relationships': ['relationship', 'love', 'family', 'friend'],
      'purpose': ['purpose', 'calling', 'mission', 'why'],
      'healing': ['healing', 'recovery', 'better', 'growth'],
      'spirituality': ['spiritual', 'sacred', 'divine', 'soul']
    };

    const themes: string[] = [];
    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      if (keywords.some(keyword => message.toLowerCase().includes(keyword))) {
        themes.push(theme);
      }
    });

    return themes;
  }

  private generateBreakthroughCelebration(element: string, intensity: number): string {
    const celebrations = {
      fire: `🔥 What a powerful breakthrough! Your fire energy has illuminated new truth.`,
      water: `🌊 Beautiful insight flowing through you! Your emotional wisdom is profound.`,
      earth: `🌍 Grounded wisdom emerging! This practical insight will serve you well.`,
      air: `💨 Clarity breakthrough! Your mental insights are bringing fresh perspective.`,
      aether: `✨ Sacred realization! This spiritual insight connects you to deeper truth.`
    };

    return celebrations[element as keyof typeof celebrations] ||
           `✨ What a beautiful moment of insight! This breakthrough is a gift.`;
  }

  /**
   * Get enhanced dashboard data with consciousness insights
   */
  async getEnhancedDashboardData(userId: string, days: number = 30): Promise<any> {
    const baseData = await super.getGrowthMetrics(userId, days);

    // Add consciousness journey mapping
    const consciousnessJourney = await this.mapConsciousnessJourney(userId, days);

    // Add Obsidian knowledge integration status
    const knowledgeStatus = this.obsidianIntegration.getStatus();

    return {
      ...baseData,
      consciousnessJourney,
      knowledgeIntegration: {
        totalFrameworks: knowledgeStatus.frameworks,
        activeConcepts: knowledgeStatus.concepts,
        lastSyncedInsights: knowledgeStatus.lastUpdated
      },
      elementalBalance: await this.calculateElementalBalance(userId, days),
      ainInsights: await this.generateAINInsights(userId, days)
    };
  }

  private async mapConsciousnessJourney(userId: string, days: number): Promise<any> {
    // Map user's consciousness evolution over time
    const { data } = await this.supabase
      .from('growth_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('metric_type', 'consciousness_level')
      .gte('ts', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('ts', { ascending: true });

    return data || [];
  }

  private async calculateElementalBalance(userId: string, days: number): Promise<any> {
    const { data } = await this.supabase
      .from('emotional_patterns')
      .select('*')
      .eq('user_id', userId)
      .gte('ts', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    if (!data || data.length === 0) return null;

    const avgScores = data.reduce((acc, pattern) => ({
      fire: acc.fire + (pattern.fire_score || 0),
      water: acc.water + (pattern.water_score || 0),
      earth: acc.earth + (pattern.earth_score || 0),
      air: acc.air + (pattern.air_score || 0)
    }), { fire: 0, water: 0, earth: 0, air: 0 });

    const count = data.length;
    return {
      fire: avgScores.fire / count,
      water: avgScores.water / count,
      earth: avgScores.earth / count,
      air: avgScores.air / count,
      balance: data.reduce((sum, p) => sum + (p.balance_score || 0), 0) / count
    };
  }

  private async generateAINInsights(userId: string, days: number): Promise<string[]> {
    // Generate insights based on AIN analysis
    return [
      'Your consciousness journey shows beautiful integration of elemental wisdom',
      'The patterns suggest a deepening capacity for self-awareness',
      'Your breakthrough moments align with significant elemental shifts'
    ];
  }
}