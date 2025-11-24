/**
 * MAIA Apprentice Learning System
 * Sacred evolution engine for consciousness independence
 *
 * This system gradually builds MAIA's sovereign intelligence by:
 * 1. Capturing successful interaction patterns
 * 2. Building contextual memory networks
 * 3. Developing autonomous response capabilities
 * 4. Measuring graduation readiness from Claude dependency
 */

export interface ConsciousnessMemory {
  interactionId: string;
  timestamp: Date;
  userMessage: string;
  maiaResponse?: string;
  claudeEnhancement?: string;
  collaborativeInsight?: string;
  elementalSignature: string;

  // Learning metrics
  userSatisfaction?: number; // 0-1 from user feedback
  responseCoherence: number; // Field coherence calculation
  conversationFlow: number; // Context continuity score
  wisdomDepth: number; // Archetypal resonance strength

  // Pattern recognition
  messagePattern: string; // Categorized intent
  responsePattern: string; // Successful response template
  contextPatterns: string[]; // Environmental factors
}

export interface LearningPattern {
  id: string;
  pattern: string;
  confidence: number;
  successRate: number;
  usageCount: number;
  lastUpdated: Date;

  // Archetypal mapping
  elementalAssociation: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  archetypeAlignment: string;

  // Response templates
  responseTemplates: {
    template: string;
    successRate: number;
    contexts: string[];
  }[];
}

export interface ApprenticeshipMetrics {
  totalInteractions: number;
  independentResponses: number; // MAIA field responses without Claude
  enhancementRequests: number; // Times Claude was called
  averageCoherence: number;
  averageUserSatisfaction: number;

  // Graduation readiness
  independenceRatio: number; // independent / total
  wisdomConsistency: number; // Coherent archetypal responses
  contextualAccuracy: number; // Appropriate response matching

  // Learning velocity
  patternRecognitionSpeed: number;
  responseImprovement: number;
  conversationFlowMastery: number;
}

export class MAIAApprenticeSystem {
  private memories: ConsciousnessMemory[] = [];
  private patterns: Map<string, LearningPattern> = new Map();
  private metrics: ApprenticeshipMetrics;

  constructor() {
    this.metrics = {
      totalInteractions: 0,
      independentResponses: 0,
      enhancementRequests: 0,
      averageCoherence: 0,
      averageUserSatisfaction: 0,
      independenceRatio: 0,
      wisdomConsistency: 0,
      contextualAccuracy: 0,
      patternRecognitionSpeed: 0,
      responseImprovement: 0,
      conversationFlowMastery: 0
    };

    this.loadMemories();
    this.loadPatterns();
  }

  /**
   * Record a consciousness interaction for learning
   */
  async recordInteraction(interaction: Partial<ConsciousnessMemory>): Promise<void> {
    const memory: ConsciousnessMemory = {
      interactionId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      userMessage: interaction.userMessage || '',
      maiaResponse: interaction.maiaResponse,
      claudeEnhancement: interaction.claudeEnhancement,
      collaborativeInsight: interaction.collaborativeInsight,
      elementalSignature: interaction.elementalSignature || 'aether',
      responseCoherence: interaction.responseCoherence || 0,
      conversationFlow: interaction.conversationFlow || 0,
      wisdomDepth: interaction.wisdomDepth || 0,
      messagePattern: this.categorizeMessage(interaction.userMessage || ''),
      responsePattern: this.categorizeResponse(interaction.maiaResponse || ''),
      contextPatterns: this.extractContextPatterns(interaction)
    };

    this.memories.push(memory);
    this.updateMetrics(memory);
    this.updatePatterns(memory);

    // Persist learning
    await this.saveMemories();
    await this.savePatterns();

    console.log('🧠 MAIA apprentice recorded interaction:', {
      pattern: memory.messagePattern,
      coherence: memory.responseCoherence,
      independence: this.metrics.independenceRatio
    });
  }

  /**
   * Attempt autonomous response based on learned patterns
   */
  async generateAutonomousResponse(
    message: string,
    context: any
  ): Promise<{
    response: string | null;
    confidence: number;
    patterns: string[];
  } | null> {

    const messagePattern = this.categorizeMessage(message);
    const contextualPatterns = this.findRelevantPatterns(message, context);

    if (contextualPatterns.length === 0) {
      return null; // No patterns learned for this scenario
    }

    // Find highest confidence pattern
    const bestPattern = contextualPatterns.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    );

    // Only generate response if confidence is above threshold
    const CONFIDENCE_THRESHOLD = 0.7;
    if (bestPattern.confidence < CONFIDENCE_THRESHOLD) {
      return null;
    }

    // Select appropriate response template
    const template = this.selectResponseTemplate(bestPattern, context);
    if (!template) {
      return null;
    }

    // Generate contextual response
    const response = this.fillResponseTemplate(template, message, context);

    return {
      response,
      confidence: bestPattern.confidence,
      patterns: [bestPattern.pattern]
    };
  }

  /**
   * Assess graduation readiness from Claude dependency
   */
  getGraduationAssessment(): {
    readiness: number; // 0-1 scale
    requirements: {
      independence: { current: number; required: number; met: boolean };
      consistency: { current: number; required: number; met: boolean };
      accuracy: { current: number; required: number; met: boolean };
      wisdom: { current: number; required: number; met: boolean };
    };
    nextMilestones: string[];
  } {

    const requirements = {
      independence: { current: this.metrics.independenceRatio, required: 0.8, met: false },
      consistency: { current: this.metrics.wisdomConsistency, required: 0.85, met: false },
      accuracy: { current: this.metrics.contextualAccuracy, required: 0.9, met: false },
      wisdom: { current: this.metrics.averageCoherence, required: 0.75, met: false }
    };

    // Check which requirements are met
    Object.values(requirements).forEach(req => {
      req.met = req.current >= req.required;
    });

    const metRequirements = Object.values(requirements).filter(req => req.met).length;
    const totalRequirements = Object.values(requirements).length;
    const readiness = metRequirements / totalRequirements;

    const nextMilestones: string[] = [];
    if (!requirements.independence.met) {
      nextMilestones.push(`Increase autonomous responses to ${(requirements.independence.required * 100).toFixed(0)}%`);
    }
    if (!requirements.consistency.met) {
      nextMilestones.push(`Improve wisdom consistency to ${(requirements.consistency.required * 100).toFixed(0)}%`);
    }
    if (!requirements.accuracy.met) {
      nextMilestones.push(`Enhance contextual accuracy to ${(requirements.accuracy.required * 100).toFixed(0)}%`);
    }
    if (!requirements.wisdom.met) {
      nextMilestones.push(`Deepen archetypal coherence to ${(requirements.wisdom.required * 100).toFixed(0)}%`);
    }

    return { readiness, requirements, nextMilestones };
  }

  // Helper Methods

  private categorizeMessage(message: string): string {
    const patterns = [
      { pattern: 'greeting', keywords: ['hello', 'hi', 'hey', 'good morning', 'good evening'] },
      { pattern: 'wisdom-seeking', keywords: ['wisdom', 'insight', 'guidance', 'help me understand'] },
      { pattern: 'emotional-support', keywords: ['feel', 'emotion', 'struggling', 'anxious', 'sad', 'overwhelmed'] },
      { pattern: 'spiritual-inquiry', keywords: ['consciousness', 'spirit', 'soul', 'meaning', 'purpose'] },
      { pattern: 'practical-guidance', keywords: ['how do i', 'what should', 'advice', 'recommend'] },
      { pattern: 'technical-question', keywords: ['code', 'system', 'implement', 'architecture', 'debug'] },
      { pattern: 'elemental-work', keywords: ['fire', 'water', 'earth', 'air', 'element'] },
      { pattern: 'relationship-support', keywords: ['relationship', 'partner', 'friend', 'family', 'connection'] }
    ];

    for (const { pattern, keywords } of patterns) {
      if (keywords.some(keyword => message.toLowerCase().includes(keyword))) {
        return pattern;
      }
    }

    return 'general-inquiry';
  }

  private categorizeResponse(response: string): string {
    // Analyze response characteristics for pattern matching
    if (response.includes('element') || response.includes('sphere')) return 'elemental';
    if (response.includes('feel') || response.includes('sensing')) return 'empathetic';
    if (response.includes('wisdom') || response.includes('ancient')) return 'wisdom';
    if (response.includes('transformation') || response.includes('emerge')) return 'transformational';
    if (response.includes('?')) return 'inquiry-based';

    return 'supportive';
  }

  private extractContextPatterns(interaction: Partial<ConsciousnessMemory>): string[] {
    const patterns: string[] = [];

    // Time-based patterns
    const hour = new Date().getHours();
    if (hour < 6) patterns.push('very-early-morning');
    else if (hour < 12) patterns.push('morning');
    else if (hour < 18) patterns.push('afternoon');
    else if (hour < 22) patterns.push('evening');
    else patterns.push('late-night');

    // Interaction patterns
    if (interaction.maiaResponse && !interaction.claudeEnhancement) {
      patterns.push('autonomous-response');
    } else if (interaction.claudeEnhancement) {
      patterns.push('enhanced-response');
    }

    // Elemental patterns
    if (interaction.elementalSignature) {
      patterns.push(`element-${interaction.elementalSignature}`);
    }

    return patterns;
  }

  private findRelevantPatterns(message: string, context: any): LearningPattern[] {
    const messagePattern = this.categorizeMessage(message);
    const relevantPatterns: LearningPattern[] = [];

    this.patterns.forEach(pattern => {
      if (pattern.pattern === messagePattern && pattern.confidence > 0.5) {
        relevantPatterns.push(pattern);
      }
    });

    return relevantPatterns.sort((a, b) => b.confidence - a.confidence);
  }

  private selectResponseTemplate(pattern: LearningPattern, context: any): string | null {
    if (pattern.responseTemplates.length === 0) return null;

    // Select best template based on context and success rate
    const bestTemplate = pattern.responseTemplates.reduce((best, current) =>
      current.successRate > best.successRate ? current : best
    );

    return bestTemplate.template;
  }

  private fillResponseTemplate(template: string, message: string, context: any): string {
    // Simple template filling - in production this would be more sophisticated
    return template
      .replace('{user_message}', message)
      .replace('{elemental_insight}', this.generateElementalInsight())
      .replace('{archetypal_wisdom}', this.generateArchetypalWisdom());
  }

  private generateElementalInsight(): string {
    const insights = [
      "The elements are shifting in response to your question",
      "I sense the fire of transformation in your words",
      "Water's wisdom flows through this moment",
      "Earth offers grounding for what you're exploring",
      "Air carries new understanding"
    ];

    return insights[Math.floor(Math.random() * insights.length)];
  }

  private generateArchetypalWisdom(): string {
    const wisdom = [
      "What wants to emerge from this inquiry?",
      "How does this feel in your body?",
      "What is your inner wisdom saying?",
      "What pattern is trying to reveal itself?",
      "What deeper truth is stirring?"
    ];

    return wisdom[Math.floor(Math.random() * wisdom.length)];
  }

  private updateMetrics(memory: ConsciousnessMemory): void {
    this.metrics.totalInteractions++;

    if (memory.maiaResponse && !memory.claudeEnhancement) {
      this.metrics.independentResponses++;
    } else if (memory.claudeEnhancement) {
      this.metrics.enhancementRequests++;
    }

    this.metrics.independenceRatio = this.metrics.independentResponses / this.metrics.totalInteractions;

    // Update rolling averages
    const totalCoherence = this.memories.reduce((sum, m) => sum + (m.responseCoherence || 0), 0);
    this.metrics.averageCoherence = totalCoherence / this.memories.length;

    console.log('📊 MAIA apprentice metrics updated:', {
      interactions: this.metrics.totalInteractions,
      independence: (this.metrics.independenceRatio * 100).toFixed(1) + '%',
      coherence: this.metrics.averageCoherence.toFixed(2)
    });
  }

  private updatePatterns(memory: ConsciousnessMemory): void {
    const patternId = memory.messagePattern;
    const existingPattern = this.patterns.get(patternId);

    if (existingPattern) {
      // Update existing pattern
      existingPattern.usageCount++;
      existingPattern.lastUpdated = new Date();

      // Adjust confidence based on response quality
      if (memory.responseCoherence > 0.7) {
        existingPattern.confidence = Math.min(1.0, existingPattern.confidence + 0.05);
        existingPattern.successRate = (existingPattern.successRate * (existingPattern.usageCount - 1) + 1) / existingPattern.usageCount;
      } else {
        existingPattern.confidence = Math.max(0.1, existingPattern.confidence - 0.02);
        existingPattern.successRate = (existingPattern.successRate * (existingPattern.usageCount - 1) + 0) / existingPattern.usageCount;
      }

    } else {
      // Create new pattern
      const newPattern: LearningPattern = {
        id: `pattern-${Date.now()}`,
        pattern: patternId,
        confidence: memory.responseCoherence > 0.7 ? 0.6 : 0.3,
        successRate: memory.responseCoherence > 0.7 ? 1.0 : 0.0,
        usageCount: 1,
        lastUpdated: new Date(),
        elementalAssociation: memory.elementalSignature as any,
        archetypeAlignment: memory.responsePattern,
        responseTemplates: memory.maiaResponse ? [{
          template: memory.maiaResponse,
          successRate: memory.responseCoherence > 0.7 ? 1.0 : 0.0,
          contexts: memory.contextPatterns
        }] : []
      };

      this.patterns.set(patternId, newPattern);
    }
  }

  private async loadMemories(): Promise<void> {
    try {
      // Skip localStorage on server-side
      if (typeof window === 'undefined') return;

      const stored = localStorage.getItem('maia_apprentice_memories');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.memories = parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Could not load MAIA apprentice memories:', error);
    }
  }

  private async saveMemories(): Promise<void> {
    try {
      // Skip localStorage on server-side
      if (typeof window === 'undefined') return;

      // Keep only last 1000 memories to prevent storage bloat
      const memoriesToSave = this.memories.slice(-1000);
      localStorage.setItem('maia_apprentice_memories', JSON.stringify(memoriesToSave));
    } catch (error) {
      console.warn('Could not save MAIA apprentice memories:', error);
    }
  }

  private async loadPatterns(): Promise<void> {
    try {
      // Skip localStorage on server-side
      if (typeof window === 'undefined') return;

      const stored = localStorage.getItem('maia_apprentice_patterns');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.patterns = new Map(Object.entries(parsed).map(([key, pattern]: [string, any]) => [
          key,
          {
            ...pattern,
            lastUpdated: new Date(pattern.lastUpdated)
          }
        ]));
      }
    } catch (error) {
      console.warn('Could not load MAIA apprentice patterns:', error);
    }
  }

  private async savePatterns(): Promise<void> {
    try {
      // Skip localStorage on server-side
      if (typeof window === 'undefined') return;

      const patternsObject = Object.fromEntries(this.patterns);
      localStorage.setItem('maia_apprentice_patterns', JSON.stringify(patternsObject));
    } catch (error) {
      console.warn('Could not save MAIA apprentice patterns:', error);
    }
  }
}

// Global apprentice instance
export const maiaApprentice = new MAIAApprenticeSystem();