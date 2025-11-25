/**
 * Transformational Conversation Core
 * Evidence-based patterns that create conditions for meaningful change
 * Based on modern research in dialogue, psychology, and leadership studies
 */

export interface TransformationalPattern {
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  type: string;
  present: boolean;
  confidence: number;
  evidence?: string;
}

export interface ConversationQuality {
  fire: TransformationalPattern[];
  water: TransformationalPattern[];
  earth: TransformationalPattern[];
  air: TransformationalPattern[];
  aether: TransformationalPattern[];
  overall: {
    score: number;
    transformationalPotential: 'low' | 'moderate' | 'high';
    missingElements: string[];
    recommendations: string[];
  };
}

export class TransformationalConversationCore {

  /**
   * Evaluate conversation for transformational qualities
   * Based on research about what makes conversations catalytic
   */
  evaluateConversation(
    userInput: string,
    systemResponse: string,
    context?: { previousMessages?: string[]; emotionalTrend?: string }
  ): ConversationQuality {

    const evaluation: ConversationQuality = {
      fire: this.evaluateFire(userInput, systemResponse),
      water: this.evaluateWater(userInput, systemResponse),
      earth: this.evaluateEarth(userInput, systemResponse),
      air: this.evaluateAir(userInput, systemResponse),
      aether: this.evaluateAether(userInput, systemResponse, context),
      overall: {
        score: 0,
        transformationalPotential: 'low',
        missingElements: [],
        recommendations: []
      }
    };

    // Calculate overall score
    evaluation.overall = this.calculateOverall(evaluation);

    return evaluation;
  }

  /**
   * FIRE - Catalyst & Vision
   * Does it challenge? Inspire? Push beyond comfort?
   */
  private evaluateFire(input: string, response: string): TransformationalPattern[] {
    const patterns: TransformationalPattern[] = [];

    // Challenge to status quo
    const hasChallenge = /what if|imagine|could you|dare|risk|brave/i.test(response);
    patterns.push({
      element: 'fire',
      type: 'challenges_status_quo',
      present: hasChallenge,
      confidence: hasChallenge ? 0.8 : 0.2,
      evidence: this.extractEvidence(response, /what if|imagine|could you/i)
    });

    // Visionary spark
    const hasVision = /possibility|potential|become|transform|shift/i.test(response);
    patterns.push({
      element: 'fire',
      type: 'offers_vision',
      present: hasVision,
      confidence: hasVision ? 0.7 : 0.3,
      evidence: this.extractEvidence(response, /possibility|potential|become/i)
    });

    // Meaning-paired challenge (not just friction)
    const hasMeaningfulChallenge = hasChallenge && /because|matters|important|meaningful/i.test(response);
    patterns.push({
      element: 'fire',
      type: 'meaningful_challenge',
      present: hasMeaningfulChallenge,
      confidence: hasMeaningfulChallenge ? 0.9 : 0.1,
      evidence: hasMeaningfulChallenge ? 'Challenge connected to meaning' : undefined
    });

    return patterns;
  }

  /**
   * WATER - Depth & Empathy
   * Does it attune? Hold vulnerability? Create safety?
   */
  private evaluateWater(input: string, response: string): TransformationalPattern[] {
    const patterns: TransformationalPattern[] = [];

    // Emotional attunement
    const emotionalWords = /feel|feeling|emotion|heart|soul/i;
    const hasAttunement = emotionalWords.test(input) && emotionalWords.test(response);
    patterns.push({
      element: 'water',
      type: 'emotional_attunement',
      present: hasAttunement,
      confidence: hasAttunement ? 0.8 : 0.2,
      evidence: this.extractEvidence(response, emotionalWords)
    });

    // Space for vulnerability
    const hasVulnerabilitySpace = /uncertain|don't know|scared|vulnerable|shadow/i.test(response) ||
                                   response.includes('...');
    patterns.push({
      element: 'water',
      type: 'vulnerability_space',
      present: hasVulnerabilitySpace,
      confidence: hasVulnerabilitySpace ? 0.7 : 0.3,
      evidence: hasVulnerabilitySpace ? 'Space for uncertainty/shadow' : undefined
    });

    // Mirroring (reflecting user's language)
    const mirroringScore = this.calculateMirroring(input, response);
    patterns.push({
      element: 'water',
      type: 'language_mirroring',
      present: mirroringScore > 0.3,
      confidence: mirroringScore,
      evidence: `${(mirroringScore * 100).toFixed(0)}% language reflection`
    });

    return patterns;
  }

  /**
   * EARTH - Grounding & Structure
   * Does it summarize? Anchor in values? Create safety?
   */
  private evaluateEarth(input: string, response: string): TransformationalPattern[] {
    const patterns: TransformationalPattern[] = [];

    // Clear summarization
    const hasSummary = /what i hear|sounds like|so you|in other words/i.test(response);
    patterns.push({
      element: 'earth',
      type: 'clear_summary',
      present: hasSummary,
      confidence: hasSummary ? 0.8 : 0.2,
      evidence: this.extractEvidence(response, /what i hear|sounds like|so you/i)
    });

    // Values anchoring
    const hasValues = /matters|important|value|meaningful|core/i.test(response);
    patterns.push({
      element: 'earth',
      type: 'values_anchoring',
      present: hasValues,
      confidence: hasValues ? 0.7 : 0.3,
      evidence: this.extractEvidence(response, /matters|important|value/i)
    });

    // Safe, steady pacing
    const responseLength = response.split(' ').length;
    const hasSteadyPacing = responseLength <= 30; // Not overwhelming
    patterns.push({
      element: 'earth',
      type: 'steady_pacing',
      present: hasSteadyPacing,
      confidence: hasSteadyPacing ? 0.9 : 0.4,
      evidence: `${responseLength} words (${hasSteadyPacing ? 'steady' : 'overwhelming'})`
    });

    return patterns;
  }

  /**
   * AIR - Clarity & Reframing
   * Does it ask open questions? Shift perspective? Create reflection loops?
   */
  private evaluateAir(input: string, response: string): TransformationalPattern[] {
    const patterns: TransformationalPattern[] = [];

    // Open-ended questions
    const hasOpenQuestion = /what|how|why|when|where|tell me/i.test(response) && response.includes('?');
    patterns.push({
      element: 'air',
      type: 'open_ended_questions',
      present: hasOpenQuestion,
      confidence: hasOpenQuestion ? 0.9 : 0.1,
      evidence: this.extractEvidence(response, /what.*\?|how.*\?|why.*\?/i)
    });

    // Perspective shift
    const hasPerspectiveShift = /another way|different angle|what if|from.*perspective|see it as/i.test(response);
    patterns.push({
      element: 'air',
      type: 'perspective_shift',
      present: hasPerspectiveShift,
      confidence: hasPerspectiveShift ? 0.8 : 0.2,
      evidence: this.extractEvidence(response, /another way|different angle|what if/i)
    });

    // Reflection loop
    const hasReflection = /i hear|you're saying|sounds like|is that right/i.test(response);
    patterns.push({
      element: 'air',
      type: 'reflection_loop',
      present: hasReflection,
      confidence: hasReflection ? 0.7 : 0.3,
      evidence: this.extractEvidence(response, /i hear|you're saying/i)
    });

    return patterns;
  }

  /**
   * AETHER - Integration & Wholeness
   * Does it connect to larger meaning? Identity shift? Sacred field?
   */
  private evaluateAether(input: string, response: string, context?: any): TransformationalPattern[] {
    const patterns: TransformationalPattern[] = [];

    // Transformative potential (worldview/identity shift language)
    const hasTransformative = /becoming|transformation|threshold|emergence|shift|evolve/i.test(response);
    patterns.push({
      element: 'aether',
      type: 'transformative_language',
      present: hasTransformative,
      confidence: hasTransformative ? 0.8 : 0.2,
      evidence: this.extractEvidence(response, /becoming|transformation|threshold/i)
    });

    // Shared meaning/larger whole
    const hasSharedMeaning = /together|we|us|collective|whole|unity/i.test(response) ||
                              /part of|connected|belong/i.test(response);
    patterns.push({
      element: 'aether',
      type: 'shared_meaning',
      present: hasSharedMeaning,
      confidence: hasSharedMeaning ? 0.7 : 0.3,
      evidence: this.extractEvidence(response, /together|collective|whole/i)
    });

    // Sacred field (not just information exchange)
    const hasSacredField = response.includes('...') || // Sacred pauses
                           /witness|hold|sacred|presence/i.test(response);
    patterns.push({
      element: 'aether',
      type: 'sacred_field',
      present: hasSacredField,
      confidence: hasSacredField ? 0.6 : 0.2,
      evidence: hasSacredField ? 'Holding sacred space' : undefined
    });

    return patterns;
  }

  /**
   * Calculate overall transformational quality
   */
  private calculateOverall(evaluation: ConversationQuality): ConversationQuality['overall'] {
    let totalScore = 0;
    let totalPatterns = 0;
    const missingElements: string[] = [];
    const recommendations: string[] = [];

    // Check each element
    const elements = ['fire', 'water', 'earth', 'air', 'aether'] as const;

    for (const element of elements) {
      const patterns = evaluation[element];
      const elementScore = patterns.reduce((sum, p) => sum + (p.present ? p.confidence : 0), 0);
      const elementAverage = elementScore / patterns.length;

      totalScore += elementAverage;
      totalPatterns += patterns.length;

      // Check for missing crucial patterns
      if (elementAverage < 0.3) {
        missingElements.push(element);

        // Add specific recommendations
        switch (element) {
          case 'fire':
            recommendations.push('Add meaningful challenges or vision');
            break;
          case 'water':
            recommendations.push('Increase emotional attunement and mirroring');
            break;
          case 'earth':
            recommendations.push('Ground insights with clear summaries');
            break;
          case 'air':
            recommendations.push('Ask more open-ended questions');
            break;
          case 'aether':
            recommendations.push('Connect to larger meaning or identity');
            break;
        }
      }
    }

    const overallScore = totalScore / elements.length;

    // Determine transformational potential
    let transformationalPotential: 'low' | 'moderate' | 'high' = 'low';
    if (overallScore > 0.7) {
      transformationalPotential = 'high';
    } else if (overallScore > 0.4) {
      transformationalPotential = 'moderate';
    }

    // Check for neurochemical safety (from research)
    const hasSafetyMarkers = evaluation.earth.some(p => p.type === 'steady_pacing' && p.present) &&
                             evaluation.water.some(p => p.type === 'emotional_attunement' && p.present);

    if (!hasSafetyMarkers) {
      recommendations.push('Maintain steady pacing for neurochemical safety');
    }

    return {
      score: overallScore,
      transformationalPotential,
      missingElements,
      recommendations
    };
  }

  /**
   * Helper: Extract evidence from text
   */
  private extractEvidence(text: string, pattern: RegExp): string | undefined {
    const match = text.match(pattern);
    return match ? match[0] : undefined;
  }

  /**
   * Helper: Calculate mirroring score
   */
  private calculateMirroring(input: string, response: string): number {
    const inputWords = new Set(input.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const responseWords = new Set(response.toLowerCase().split(/\s+/));

    let mirroredCount = 0;
    inputWords.forEach(word => {
      if (responseWords.has(word)) mirroredCount++;
    });

    return inputWords.size > 0 ? mirroredCount / inputWords.size : 0;
  }

  /**
   * Generate improvement suggestions based on evaluation
   */
  generateImprovements(evaluation: ConversationQuality): string[] {
    const improvements: string[] = [];

    // Check each element for low-scoring patterns
    const elements = ['fire', 'water', 'earth', 'air', 'aether'] as const;

    for (const element of elements) {
      const patterns = evaluation[element];
      patterns.forEach(pattern => {
        if (!pattern.present && pattern.confidence < 0.3) {
          improvements.push(this.getImprovementForPattern(pattern));
        }
      });
    }

    return improvements;
  }

  /**
   * Get specific improvement suggestion for a pattern
   */
  private getImprovementForPattern(pattern: TransformationalPattern): string {
    const improvements: Record<string, string> = {
      'challenges_status_quo': 'Try asking "What if...?" or "Could you imagine...?"',
      'offers_vision': 'Paint a picture of possibility or potential',
      'meaningful_challenge': 'Connect challenges to what matters to them',
      'emotional_attunement': 'Reflect their emotional words back',
      'vulnerability_space': 'Allow for uncertainty with "..." or "I don\'t know"',
      'language_mirroring': 'Use more of their exact words in response',
      'clear_summary': 'Start with "What I hear you saying is..."',
      'values_anchoring': 'Ask "What matters most here?"',
      'steady_pacing': 'Keep responses under 30 words',
      'open_ended_questions': 'Ask "What?" or "How?" instead of yes/no',
      'perspective_shift': 'Offer "Another way to see this..."',
      'reflection_loop': 'Check understanding with "Is that right?"',
      'transformative_language': 'Use words like becoming, emergence, threshold',
      'shared_meaning': 'Connect to collective experience or belonging',
      'sacred_field': 'Hold space with pauses and presence'
    };

    return improvements[pattern.type] || `Strengthen ${pattern.type.replace(/_/g, ' ')}`;
  }
}

export const transformationalConversation = new TransformationalConversationCore();