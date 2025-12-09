import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ConsciousnessAssessment {
  detectedLevel: number; // 1-10 consciousness level detected by MAIA
  confidence: number; // 0-1 confidence score
  assessmentFactors: {
    linguisticComplexity?: number;
    metaphorUsage?: number;
    selfAwareness?: number;
    emotionalDepth?: number;
    systemsThinking?: number;
    paradoxComfort?: number;
  };
  sessionContext: {
    messageCount: number;
    sessionDuration: number;
    interactionPatterns: string[];
  };
}

export interface SessionQualityData {
  sessionId: string;
  userId: string;
  maiasAssessment: ConsciousnessAssessment;
  userReportedAccuracy?: number;
  emergentInsightsQuality?: string;
  sessionEffectiveness?: {
    felt_understood: boolean;
    consciousness_shift: boolean;
    practical_insights: boolean;
    emotional_resonance: boolean;
  };
}

export class ConsciousnessSessionTracker {
  private static instance: ConsciousnessSessionTracker;
  private currentSession: Partial<SessionQualityData> | null = null;
  private assessmentHistory: ConsciousnessAssessment[] = [];

  static getInstance(): ConsciousnessSessionTracker {
    if (!ConsciousnessSessionTracker.instance) {
      ConsciousnessSessionTracker.instance = new ConsciousnessSessionTracker();
    }
    return ConsciousnessSessionTracker.instance;
  }

  /**
   * Initialize session tracking for a pioneer consciousness computing session
   */
  initializeSession(sessionId: string, userId: string) {
    console.log('🧠 [Session Tracker] Initializing consciousness session tracking:', { sessionId, userId });

    this.currentSession = {
      sessionId,
      userId,
      maiasAssessment: {
        detectedLevel: 0,
        confidence: 0,
        assessmentFactors: {},
        sessionContext: {
          messageCount: 0,
          sessionDuration: 0,
          interactionPatterns: []
        }
      }
    };

    this.assessmentHistory = [];
  }

  /**
   * Track MAIA's consciousness assessment for the current message/response
   */
  trackConsciousnessAssessment(assessment: Partial<ConsciousnessAssessment>) {
    if (!this.currentSession?.maiasAssessment) {
      console.warn('⚠️ [Session Tracker] No active session for consciousness assessment');
      return;
    }

    // Update current session assessment
    this.currentSession.maiasAssessment = {
      ...this.currentSession.maiasAssessment,
      ...assessment,
      sessionContext: {
        ...this.currentSession.maiasAssessment.sessionContext,
        ...assessment.sessionContext
      }
    };

    // Store in assessment history for pattern analysis
    this.assessmentHistory.push(this.currentSession.maiasAssessment);

    console.log('🔍 [Session Tracker] Consciousness assessment updated:', {
      detectedLevel: assessment.detectedLevel,
      confidence: assessment.confidence,
      messageCount: this.currentSession.maiasAssessment.sessionContext.messageCount
    });
  }

  /**
   * Analyze conversation patterns to inform consciousness detection
   */
  analyzeInteractionPatterns(
    userMessage: string,
    maiasResponse: string,
    responseMetadata?: any
  ) {
    if (!this.currentSession?.maiasAssessment) return;

    const patterns: string[] = [];

    // Linguistic complexity analysis
    const userWordCount = userMessage.split(' ').length;
    const avgWordLength = userMessage.split(' ').reduce((sum, word) => sum + word.length, 0) / userWordCount;

    if (userWordCount > 30) patterns.push('complex_expression');
    if (avgWordLength > 6) patterns.push('sophisticated_vocabulary');

    // Metaphor and symbolism detection
    const metaphorKeywords = ['like', 'as if', 'reminds me of', 'feels like', 'similar to', 'imagine', 'vision', 'sense that'];
    if (metaphorKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
      patterns.push('metaphorical_thinking');
    }

    // Self-awareness indicators
    const selfAwareKeywords = ['I notice', 'I realize', 'I feel', 'I sense', 'I understand', 'I see that', 'becoming aware'];
    if (selfAwareKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
      patterns.push('self_awareness');
    }

    // Systems thinking
    const systemsKeywords = ['connected', 'relationship', 'pattern', 'interconnected', 'network', 'wholeness', 'emergence'];
    if (systemsKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
      patterns.push('systems_thinking');
    }

    // Paradox comfort
    const paradoxKeywords = ['both', 'and yet', 'paradox', 'contradiction', 'simultaneously', 'at once'];
    if (paradoxKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
      patterns.push('paradox_comfort');
    }

    // Update session patterns
    this.currentSession.maiasAssessment.sessionContext.interactionPatterns.push(...patterns);

    // Calculate dynamic consciousness level based on patterns
    const consciousnessLevel = this.calculateConsciousnessLevel(patterns, userMessage);
    const confidence = this.calculateConfidence(patterns, this.assessmentHistory.length);

    this.trackConsciousnessAssessment({
      detectedLevel: consciousnessLevel,
      confidence,
      assessmentFactors: {
        linguisticComplexity: Math.min(userWordCount / 50, 1),
        metaphorUsage: patterns.filter(p => p.includes('metaphor')).length / patterns.length || 0,
        selfAwareness: patterns.filter(p => p.includes('awareness')).length / patterns.length || 0,
        systemsThinking: patterns.filter(p => p.includes('systems')).length / patterns.length || 0,
        paradoxComfort: patterns.filter(p => p.includes('paradox')).length / patterns.length || 0
      },
      sessionContext: {
        messageCount: this.currentSession.maiasAssessment.sessionContext.messageCount + 1,
        sessionDuration: this.currentSession.maiasAssessment.sessionContext.sessionDuration,
        interactionPatterns: this.currentSession.maiasAssessment.sessionContext.interactionPatterns
      }
    });
  }

  /**
   * Calculate consciousness level based on interaction patterns
   */
  private calculateConsciousnessLevel(patterns: string[], userMessage: string): number {
    let baseLevel = 3; // Default starting level

    // Pattern-based adjustments
    if (patterns.includes('metaphorical_thinking')) baseLevel += 1.5;
    if (patterns.includes('self_awareness')) baseLevel += 1;
    if (patterns.includes('systems_thinking')) baseLevel += 2;
    if (patterns.includes('paradox_comfort')) baseLevel += 2.5;
    if (patterns.includes('complex_expression')) baseLevel += 0.5;
    if (patterns.includes('sophisticated_vocabulary')) baseLevel += 0.5;

    // Message depth analysis
    const questionDepth = (userMessage.match(/\?/g) || []).length;
    const personalReflection = userMessage.toLowerCase().includes('i wonder') ||
                              userMessage.toLowerCase().includes('i\'m questioning') ||
                              userMessage.toLowerCase().includes('exploring');

    if (questionDepth > 1) baseLevel += 0.5;
    if (personalReflection) baseLevel += 1;

    // Historical trend analysis
    if (this.assessmentHistory.length > 3) {
      const recentLevels = this.assessmentHistory.slice(-3).map(a => a.detectedLevel);
      const trend = recentLevels[recentLevels.length - 1] - recentLevels[0];
      baseLevel += trend * 0.3; // Gradual adjustment based on conversation evolution
    }

    return Math.max(1, Math.min(10, Math.round(baseLevel * 10) / 10));
  }

  /**
   * Calculate confidence in consciousness assessment
   */
  private calculateConfidence(patterns: string[], historyLength: number): number {
    let confidence = 0.5; // Base confidence

    // Pattern consistency increases confidence
    confidence += patterns.length * 0.05;

    // Historical data increases confidence
    confidence += Math.min(historyLength * 0.02, 0.3);

    // Specific high-confidence patterns
    if (patterns.includes('systems_thinking') && patterns.includes('self_awareness')) {
      confidence += 0.2;
    }

    return Math.max(0, Math.min(1, Math.round(confidence * 100) / 100));
  }

  /**
   * Correlate MAIA's assessment with user feedback
   */
  async correlateFeedback(userAccuracyRating: number, emergentInsights: string) {
    if (!this.currentSession) {
      console.warn('⚠️ [Session Tracker] No active session for feedback correlation');
      return;
    }

    const sessionQuality: SessionQualityData = {
      ...this.currentSession,
      userReportedAccuracy: userAccuracyRating,
      emergentInsightsQuality: emergentInsights
    } as SessionQualityData;

    try {
      // Store session quality data
      const data = await prisma.consciousnessSessionQuality.create({
        data: {
          sessionId: sessionQuality.sessionId,
          userId: sessionQuality.userId,
          detectedLevel: sessionQuality.maiasAssessment.detectedLevel,
          confidenceScore: sessionQuality.maiasAssessment.confidence,
          assessmentFactors: sessionQuality.maiasAssessment.assessmentFactors,
          userReportedAccuracy: sessionQuality.userReportedAccuracy,
          emergentInsightsQuality: sessionQuality.emergentInsightsQuality,
          sessionDurationMinutes: Math.round(sessionQuality.maiasAssessment.sessionContext.sessionDuration / 60),
          messageCount: sessionQuality.maiasAssessment.sessionContext.messageCount,
          interactionPatterns: {
            patterns: sessionQuality.maiasAssessment.sessionContext.interactionPatterns,
            pattern_frequency: this.getPatternFrequency(sessionQuality.maiasAssessment.sessionContext.interactionPatterns)
          }
        }
      });

      console.log('✅ [Session Tracker] Session quality correlation stored:', {
        session_id: sessionQuality.sessionId,
        maia_level: sessionQuality.maiasAssessment.detectedLevel,
        user_accuracy: userAccuracyRating,
        confidence: sessionQuality.maiasAssessment.confidence
      });

      // Analyze correlation for system improvement
      this.analyzeAccuracyCorrelation(sessionQuality);

      return true;
    } catch (error) {
      console.error('❌ [Session Tracker] Error storing session quality:', error);
      return false;
    }
  }

  /**
   * Analyze correlation between MAIA's assessment and user feedback
   */
  private analyzeAccuracyCorrelation(sessionQuality: SessionQualityData) {
    const maiasConfidence = sessionQuality.maiasAssessment.confidence;
    const userAccuracy = sessionQuality.userReportedAccuracy || 0;

    // High confidence + High user accuracy = Successful detection
    if (maiasConfidence > 0.7 && userAccuracy >= 4) {
      console.log('🎯 [Correlation] High accuracy detection confirmed');
    }

    // High confidence + Low user accuracy = Overconfidence issue
    else if (maiasConfidence > 0.7 && userAccuracy <= 2) {
      console.log('⚠️ [Correlation] Potential overconfidence detected');
    }

    // Low confidence + High user accuracy = Underconfidence issue
    else if (maiasConfidence < 0.4 && userAccuracy >= 4) {
      console.log('🤔 [Correlation] Potential underconfidence detected');
    }

    // Store correlation metrics for learning
    const correlationMetric = {
      confidence_accuracy_delta: Math.abs(maiasConfidence - (userAccuracy / 5)),
      assessment_quality: maiasConfidence * (userAccuracy / 5),
      pattern_richness: sessionQuality.maiasAssessment.sessionContext.interactionPatterns.length
    };

    console.log('📊 [Correlation] Session metrics:', correlationMetric);
  }

  /**
   * Get frequency distribution of interaction patterns
   */
  private getPatternFrequency(patterns: string[]): { [pattern: string]: number } {
    return patterns.reduce((freq, pattern) => {
      freq[pattern] = (freq[pattern] || 0) + 1;
      return freq;
    }, {} as { [pattern: string]: number });
  }

  /**
   * Clear current session data
   */
  clearSession() {
    this.currentSession = null;
    this.assessmentHistory = [];
    console.log('🧹 [Session Tracker] Session data cleared');
  }

  /**
   * Get current session summary for debugging
   */
  getSessionSummary() {
    return {
      hasActiveSession: !!this.currentSession,
      sessionId: this.currentSession?.sessionId,
      assessmentCount: this.assessmentHistory.length,
      currentLevel: this.currentSession?.maiasAssessment?.detectedLevel,
      currentConfidence: this.currentSession?.maiasAssessment?.confidence,
      patternCount: this.currentSession?.maiasAssessment?.sessionContext.interactionPatterns.length || 0
    };
  }
}