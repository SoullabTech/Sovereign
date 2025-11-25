// Experiential Validation Framework - Bridge Technical Tests with User Experience
// Validates that activation logic creates coherent conversational experiences

interface ExperientialMetrics {
  conversationCoherence: number;     // 0-1 how well conversation flows
  transitionNaturalness: number;    // 0-1 how smooth tier changes feel
  personalityConsistency: number;   // 0-1 whether Oracle maintains identity
  userConfidence: number;           // 0-1 user trust in system responses
  cognitiveLoad: number;            // 0-1 mental effort required (inverted)
}

interface ConversationSample {
  userId: string;
  exchanges: Array<{
    userInput: string;
    oracleResponse: string;
    activatedFeatures: string[];
    transitionType?: 'smooth' | 'jarring' | 'seamless';
    tierChange?: { from: string; to: string };
    userReaction?: 'confused' | 'delighted' | 'neutral' | 'frustrated';
  }>;
  overallCoherence: number;
  criticalFailures: string[];
}

export class ExperientialValidationFramework {
  private conversationSamples: ConversationSample[] = [];
  private userFeedbackPatterns = new Map<string, any>();

  // === CONVERSATIONAL COHERENCE VALIDATION ===
  validateConversationCoherence(sample: ConversationSample): ExperientialMetrics {
    const coherence = this.assessCoherence(sample);
    const naturalness = this.assessTransitionNaturalness(sample);
    const consistency = this.assessPersonalityConsistency(sample);
    const confidence = this.assessUserConfidence(sample);
    const cognitiveLoad = this.assessCognitiveLoad(sample);

    return {
      conversationCoherence: coherence,
      transitionNaturalness: naturalness,
      personalityConsistency: consistency,
      userConfidence: confidence,
      cognitiveLoad: 1 - cognitiveLoad // Inverted - lower load is better
    };
  }

  private assessCoherence(sample: ConversationSample): number {
    let coherenceScore = 1.0;

    // Check for topic continuity
    for (let i = 1; i < sample.exchanges.length; i++) {
      const current = sample.exchanges[i];
      const previous = sample.exchanges[i - 1];

      // Penalize responses that ignore previous context
      if (this.detectContextIgnoring(current, previous)) {
        coherenceScore -= 0.2;
      }

      // Penalize contradictory responses
      if (this.detectContradiction(current, previous)) {
        coherenceScore -= 0.3;
      }
    }

    return Math.max(0, coherenceScore);
  }

  private assessTransitionNaturalness(sample: ConversationSample): number {
    const transitions = sample.exchanges.filter(e => e.transitionType && e.tierChange);

    if (transitions.length === 0) return 1.0; // No transitions = perfect naturalness

    const naturalTransitions = transitions.filter(t =>
      t.transitionType === 'smooth' || t.transitionType === 'seamless'
    ).length;

    return naturalTransitions / transitions.length;
  }

  private assessPersonalityConsistency(sample: ConversationSample): number {
    // Oracle should maintain core Anamnesis identity across feature changes
    const personalityMarkers = this.extractPersonalityMarkers(sample);

    // Check for jarring personality shifts
    const consistentMarkers = personalityMarkers.filter(marker =>
      marker.consistency > 0.7
    );

    return consistentMarkers.length / personalityMarkers.length;
  }

  private assessUserConfidence(sample: ConversationSample): number {
    const reactions = sample.exchanges
      .map(e => e.userReaction)
      .filter(r => r !== undefined);

    if (reactions.length === 0) return 0.7; // Neutral if no reactions

    const positiveReactions = reactions.filter(r =>
      r === 'delighted' || r === 'neutral'
    ).length;

    return positiveReactions / reactions.length;
  }

  private assessCognitiveLoad(sample: ConversationSample): number {
    // Higher cognitive load = user has to work harder to understand
    let loadScore = 0;

    sample.exchanges.forEach(exchange => {
      // Complex feature combinations increase load
      if (exchange.activatedFeatures.length > 2) {
        loadScore += 0.1;
      }

      // Rapid tier changes increase load
      if (exchange.tierChange) {
        loadScore += 0.15;
      }

      // User confusion indicates high cognitive load
      if (exchange.userReaction === 'confused') {
        loadScore += 0.3;
      }
    });

    return Math.min(1, loadScore / sample.exchanges.length);
  }

  // === TRANSITION EXPERIENCE VALIDATION ===
  validateTransitionExperience(
    previousFeatures: string[],
    newFeatures: string[],
    userContext: any,
    actualResponse: string
  ): {
    transitionQuality: 'seamless' | 'smooth' | 'noticeable' | 'jarring';
    experientialIssues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for personality consistency during transition
    if (this.detectPersonalityShift(previousFeatures, newFeatures, actualResponse)) {
      issues.push('Oracle personality shifted noticeably during feature transition');
      recommendations.push('Add personality bridge phrases during tier changes');
    }

    // Check for appropriate transition messaging
    if (this.needsTransitionMessage(previousFeatures, newFeatures) &&
        !this.hasTransitionMessage(actualResponse)) {
      issues.push('Major feature change without user preparation');
      recommendations.push('Add gentle transition phrase before engaging complex features');
    }

    // Check for feature overwhelm
    if (newFeatures.length > 3 && !this.hasGradualIntroduction(actualResponse)) {
      issues.push('Too many features activated simultaneously');
      recommendations.push('Introduce complex features gradually across multiple exchanges');
    }

    const quality = this.determineTransitionQuality(issues.length);

    return {
      transitionQuality: quality,
      experientialIssues: issues,
      recommendations
    };
  }

  // === FALLBACK COHERENCE VALIDATION ===
  validateFallbackCoherence(
    originalIntent: string,
    fallbackResponse: string,
    conversationContext: any
  ): {
    maintainsCoherence: boolean;
    feelsDegraded: boolean;
    preservesPersonality: boolean;
    recommendations: string[];
  } {
    const coherent = this.fallbackMaintainsCoherence(originalIntent, fallbackResponse, conversationContext);
    const degraded = this.fallbackFeelsDegraded(fallbackResponse);
    const personality = this.fallbackPreservesPersonality(fallbackResponse);

    const recommendations: string[] = [];

    if (!coherent) {
      recommendations.push('Improve fallback context awareness');
    }

    if (degraded) {
      recommendations.push('Make fallback responses less obviously system-generated');
    }

    if (!personality) {
      recommendations.push('Ensure fallback maintains Oracle\'s Anamnesis-guided voice');
    }

    return {
      maintainsCoherence: coherent,
      feelsDegraded: degraded,
      preservesPersonality: personality,
      recommendations
    };
  }

  // === USER OVERRIDE EXPERIENCE VALIDATION ===
  validateUserOverrideExperience(
    userPreference: string,
    systemSuggestion: string,
    finalDecision: string,
    userSatisfaction: number
  ): {
    respectsUserChoice: boolean;
    maintainsHelpfulness: boolean;
    experientialBalance: 'user-focused' | 'balanced' | 'system-imposed';
    recommendations: string[];
  } {
    const respectsChoice = this.checksUserChoiceRespect(userPreference, finalDecision);
    const maintainsHelp = userSatisfaction > 0.6;

    let balance: 'user-focused' | 'balanced' | 'system-imposed';
    if (finalDecision === userPreference) {
      balance = 'user-focused';
    } else if (this.isReasonableCompromise(userPreference, systemSuggestion, finalDecision)) {
      balance = 'balanced';
    } else {
      balance = 'system-imposed';
    }

    const recommendations: string[] = [];

    if (!respectsChoice && balance === 'system-imposed') {
      recommendations.push('Provide clear rationale when overriding user preferences');
      recommendations.push('Offer user more control over system behavior');
    }

    if (!maintainsHelp) {
      recommendations.push('Find better balance between user control and system intelligence');
    }

    return {
      respectsUserChoice: respectsChoice,
      maintainsHelpfulness: maintainsHelp,
      experientialBalance: balance,
      recommendations
    };
  }

  // === PRIVACY-AWARE DECISION LOGGING ===
  logDecisionForAnalysis(
    userId: string,
    decision: any,
    conversationContext: any,
    sensitivityLevel: 'public' | 'private' | 'sensitive'
  ): void {
    const sanitizedLog = this.sanitizeForPrivacy(decision, conversationContext, sensitivityLevel);

    // Store only what's needed for improvement, respect privacy
    this.storeDecisionLog(userId, sanitizedLog);
  }

  private sanitizeForPrivacy(
    decision: any,
    context: any,
    sensitivity: string
  ): any {
    if (sensitivity === 'sensitive') {
      // Strip all personal identifiers and content
      return {
        featurePattern: decision.features?.map(f => f.replace(/[a-zA-Z]/g, 'X')),
        confidencePattern: decision.confidence > 0.8 ? 'high' : decision.confidence > 0.5 ? 'medium' : 'low',
        transitionType: decision.transitionType || 'none',
        timestamp: Date.now()
      };
    }

    if (sensitivity === 'private') {
      // Remove identifying content but keep decision patterns
      return {
        activatedFeatures: decision.activatedFeatures,
        confidence: Math.round(decision.confidence * 10) / 10,
        rationale: decision.rationale?.replace(/\b[A-Z][a-z]+\b/g, '[NAME]'),
        userIdHash: this.hashUserId(context.userId)
      };
    }

    // Public level - safe for aggregate analysis
    return {
      featureCount: decision.activatedFeatures?.length || 0,
      transitionQuality: decision.transitionQuality,
      userSatisfaction: decision.userSatisfaction
    };
  }

  // === UTILITY METHODS ===
  private detectContextIgnoring(current: any, previous: any): boolean {
    // Simplified - would use NLP to detect topic continuity
    return current.oracleResponse.length < 20 &&
           !current.oracleResponse.toLowerCase().includes('understand');
  }

  private detectContradiction(current: any, previous: any): boolean {
    // Simplified - would use semantic analysis
    return false; // Placeholder
  }

  private extractPersonalityMarkers(sample: ConversationSample): any[] {
    // Extract markers like empathy, wisdom, presence that define Oracle
    return sample.exchanges.map(exchange => ({
      hasEmpathy: exchange.oracleResponse.includes('sense') || exchange.oracleResponse.includes('feel'),
      hasWisdom: exchange.oracleResponse.includes('deeper') || exchange.oracleResponse.includes('meaning'),
      hasPresence: exchange.oracleResponse.includes('here') || exchange.oracleResponse.includes('now'),
      consistency: 0.8 // Simplified calculation
    }));
  }

  private detectPersonalityShift(prev: string[], next: string[], response: string): boolean {
    const prevComplexity = prev.length;
    const nextComplexity = next.length;

    // Major personality shift if features change dramatically without acknowledgment
    return Math.abs(nextComplexity - prevComplexity) > 2 &&
           !response.toLowerCase().includes('sense') &&
           !response.toLowerCase().includes('moment');
  }

  private needsTransitionMessage(prev: string[], next: string[]): boolean {
    return next.length > prev.length + 1;
  }

  private hasTransitionMessage(response: string): boolean {
    const transitionPhrases = ['sense', 'moment', 'deeper', 'space', 'pause'];
    return transitionPhrases.some(phrase => response.toLowerCase().includes(phrase));
  }

  private hasGradualIntroduction(response: string): boolean {
    return response.length > 100 && response.includes('...');
  }

  private determineTransitionQuality(issueCount: number): 'seamless' | 'smooth' | 'noticeable' | 'jarring' {
    if (issueCount === 0) return 'seamless';
    if (issueCount === 1) return 'smooth';
    if (issueCount === 2) return 'noticeable';
    return 'jarring';
  }

  private fallbackMaintainsCoherence(intent: string, fallback: string, context: any): boolean {
    return fallback.length > 20 && !fallback.includes('error');
  }

  private fallbackFeelsDegraded(response: string): boolean {
    const degradationMarkers = ['recalibrate', 'technical', 'system', 'error'];
    return degradationMarkers.some(marker => response.toLowerCase().includes(marker));
  }

  private fallbackPreservesPersonality(response: string): boolean {
    const personalityMarkers = ['sense', 'feel', 'deeper', 'moment'];
    return personalityMarkers.some(marker => response.toLowerCase().includes(marker));
  }

  private checksUserChoiceRespect(preference: string, final: string): boolean {
    return preference === final || final.includes(preference);
  }

  private isReasonableCompromise(preference: string, suggestion: string, final: string): boolean {
    return final !== preference && final !== suggestion && final.length > 10;
  }

  private hashUserId(userId: string): string {
    // Simple hash for privacy - would use proper crypto in production
    return userId.slice(0, 8) + '...';
  }

  private storeDecisionLog(userId: string, log: any): void {
    // Store sanitized logs for analysis
    console.log(`Decision logged for analysis: ${userId.slice(0, 8)}...`, log);
  }
}

let _experientialValidator: ExperientialValidationFramework | null = null;
export const getExperientialValidator = (): ExperientialValidationFramework => {
  if (!_experientialValidator) {
    _experientialValidator = new ExperientialValidationFramework();
  }
  return _experientialValidator;
};