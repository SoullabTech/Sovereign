/**
 * Onboarding Tone Feedback Collection Service
 * 
 * Handles collection of user feedback during Sessions 1, 4, and 8 to validate
 * the effectiveness of tone detection and bias decay systems.
 */

import { logger } from '../utils/logger';
import { 
  OnboardingTone,
  SessionFeedbackPrompt,
  FeedbackResponse,
  ToneFeedbackSubmittedEvent,
  ONBOARDING_ANALYTICS_EVENTS,
  calculateResonanceScore
} from '../types/onboardingAnalytics';

export interface FeedbackCollectionConfig {
  enabledSessions: number[];
  requireCustomResponse: boolean;
  timeoutMs: number;
  maxRetries: number;
}

export interface OnboardingFeedbackResult {
  promptShown: boolean;
  userResponse?: FeedbackResponse;
  resonanceScore: number;
  shouldEmitAnalytics: boolean;
}

export class OnboardingFeedbackService {
  private config: FeedbackCollectionConfig;
  private feedbackHistory: Map<string, FeedbackResponse[]> = new Map();

  constructor(config?: Partial<FeedbackCollectionConfig>) {
    this.config = {
      enabledSessions: [1, 4, 8],
      requireCustomResponse: false,
      timeoutMs: 30000, // 30 seconds
      maxRetries: 1,
      ...config
    };
  }

  /**
   * Check if we should collect feedback for this session
   */
  public shouldCollectFeedback(userId: string, sessionCount: number): boolean {
    return this.config.enabledSessions.includes(sessionCount);
  }

  /**
   * Generate appropriate feedback prompt based on session number
   */
  public generateFeedbackPrompt(sessionCount: number): SessionFeedbackPrompt {
    if (sessionCount === 1) {
      return {
        sessionNumber: 1,
        promptType: 'first_session',
        question: "How did our conversation feel — gentle, curious, energizing, or neutral?",
        options: ['curious', 'hesitant', 'enthusiastic', 'neutral'],
        allowCustomResponse: true
      };
    }
    
    if (sessionCount === 4) {
      return {
        sessionNumber: 4,
        promptType: 'bias_decay',
        question: "I may be speaking a bit differently as we get to know each other. How does that feel to you?",
        options: undefined, // Open-ended
        allowCustomResponse: true
      };
    }
    
    if (sessionCount === 8) {
      return {
        sessionNumber: 8,
        promptType: 'bias_evolution',
        question: "Do you feel the way I've been speaking with you has changed since we began?",
        options: undefined, // Open-ended
        allowCustomResponse: true
      };
    }
    
    throw new Error(`No feedback prompt configured for session ${sessionCount}`);
  }

  /**
   * Process user feedback and emit analytics
   */
  public async processFeedback(
    userId: string,
    sessionCount: number,
    userFeedback: {
      selectedTone?: OnboardingTone;
      customResponse?: string;
    },
    systemPredictedTone: OnboardingTone,
    analytics: any
  ): Promise<OnboardingFeedbackResult> {
    
    try {
      const prompt = this.generateFeedbackPrompt(sessionCount);
      
      // Create feedback response record
      const feedbackResponse: FeedbackResponse = {
        userId,
        sessionCount,
        promptType: prompt.promptType,
        selectedTone: userFeedback.selectedTone,
        customResponse: userFeedback.customResponse || '',
        timestamp: new Date().toISOString()
      };
      
      // Store in history
      const userHistory = this.feedbackHistory.get(userId) || [];
      userHistory.push(feedbackResponse);
      this.feedbackHistory.set(userId, userHistory);
      
      // Calculate resonance score
      const resonanceScore = calculateResonanceScore(
        systemPredictedTone,
        userFeedback.customResponse || '',
        userFeedback.selectedTone
      );
      
      // Emit analytics event
      const toneFeedbackEvent: ToneFeedbackSubmittedEvent = {
        userId,
        sessionCount,
        promptType: prompt.promptType,
        userToneSelection: userFeedback.selectedTone || null,
        userCustomResponse: userFeedback.customResponse || '',
        systemPredictedTone,
        biasApplied: this.calculateBiasApplication(systemPredictedTone, sessionCount),
        resonanceScore,
        timestamp: new Date().toISOString()
      };
      
      analytics.emit(ONBOARDING_ANALYTICS_EVENTS.TONE_FEEDBACK_SUBMITTED, toneFeedbackEvent);
      
      logger.info("Onboarding feedback collected", {
        userId: userId.substring(0, 8) + '...',
        sessionCount,
        promptType: prompt.promptType,
        resonanceScore,
        systemPredicted: systemPredictedTone,
        userSelected: userFeedback.selectedTone
      });
      
      return {
        promptShown: true,
        userResponse: feedbackResponse,
        resonanceScore,
        shouldEmitAnalytics: true
      };
      
    } catch (error) {
      logger.error("Failed to process onboarding feedback", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: userId.substring(0, 8) + '...',
        sessionCount
      });
      
      return {
        promptShown: false,
        resonanceScore: 0.5, // Default neutral score
        shouldEmitAnalytics: false
      };
    }
  }

  /**
   * Get feedback history for a user
   */
  public getFeedbackHistory(userId: string): FeedbackResponse[] {
    return this.feedbackHistory.get(userId) || [];
  }

  /**
   * Get aggregated feedback insights for analytics dashboard
   */
  public getFeedbackInsights(userId: string): {
    totalFeedbackSessions: number;
    avgResonanceScore: number;
    toneAccuracyRate: number;
    feedbackTrend: 'improving' | 'stable' | 'declining';
    customFeedbackThemes: string[];
  } {
    const history = this.getFeedbackHistory(userId);
    
    if (history.length === 0) {
      return {
        totalFeedbackSessions: 0,
        avgResonanceScore: 0.5,
        toneAccuracyRate: 0,
        feedbackTrend: 'stable',
        customFeedbackThemes: []
      };
    }
    
    // Calculate metrics (simplified implementation)
    const totalFeedbackSessions = history.length;
    
    // For now, assume resonance scores are stored elsewhere
    // In a full implementation, these would be calculated from stored data
    const avgResonanceScore = 0.75; // Placeholder
    const toneAccuracyRate = 0.80; // Placeholder
    const feedbackTrend = 'improving' as const; // Placeholder
    
    // Extract common themes from custom feedback
    const customFeedbackThemes = this.extractFeedbackThemes(history);
    
    return {
      totalFeedbackSessions,
      avgResonanceScore,
      toneAccuracyRate,
      feedbackTrend,
      customFeedbackThemes
    };
  }

  /**
   * Generate feedback prompt message for Oracle response
   */
  public formatPromptForOracle(sessionCount: number): string {
    const prompt = this.generateFeedbackPrompt(sessionCount);
    
    if (sessionCount === 1) {
      return `\\n\\n---\\n\\n*Before we finish, I'm curious:* ${prompt.question}\\n\\n*Just a quick sense - no need to overthink it.*`;
    }
    
    if (sessionCount === 4) {
      return `\\n\\n---\\n\\n*A quick check-in:* ${prompt.question}\\n\\n*Whatever you notice is helpful.*`;
    }
    
    if (sessionCount === 8) {
      return `\\n\\n---\\n\\n*Reflecting on our journey:* ${prompt.question}\\n\\n*I'm interested in your experience.*`;
    }
    
    return '';
  }

  /**
   * Calculate bias application for analytics (simplified)
   */
  private calculateBiasApplication(tone: OnboardingTone, sessionCount: number): any {
    const decayFactor = Math.max(0, (10 - sessionCount) / 10);
    
    let baseBias = { trustDelta: 0, challengeDelta: 0, humorDelta: 0, metaphysicsDelta: 0 };
    
    switch (tone) {
      case 'hesitant':
        baseBias = { trustDelta: 0.15, challengeDelta: -0.15, humorDelta: 0, metaphysicsDelta: 0 };
        break;
      case 'curious':
        baseBias = { trustDelta: 0.15, challengeDelta: 0, humorDelta: 0, metaphysicsDelta: 0.1 };
        break;
      case 'enthusiastic':
        baseBias = { trustDelta: 0.15, challengeDelta: 0, humorDelta: 0.15, metaphysicsDelta: 0 };
        break;
      case 'neutral':
        baseBias = { trustDelta: 0, challengeDelta: 0, humorDelta: 0, metaphysicsDelta: 0 };
        break;
    }
    
    return {
      trustDelta: baseBias.trustDelta * decayFactor,
      challengeDelta: baseBias.challengeDelta * decayFactor,
      humorDelta: baseBias.humorDelta * decayFactor,
      metaphysicsDelta: baseBias.metaphysicsDelta * decayFactor,
      decayFactor
    };
  }

  /**
   * Extract common themes from user custom feedback
   */
  private extractFeedbackThemes(history: FeedbackResponse[]): string[] {
    const allFeedback = history
      .map(f => f.customResponse || '')
      .filter(f => f.length > 0)
      .join(' ')
      .toLowerCase();
    
    const commonThemes: string[] = [];
    
    // Simple keyword detection for themes
    const themeKeywords = {
      'natural_evolution': ['natural', 'evolving', 'changing', 'growing'],
      'tone_match': ['right', 'perfect', 'matches', 'fits'],
      'comfort_level': ['comfortable', 'safe', 'at ease', 'relaxed'],
      'challenge_level': ['challenging', 'pushing', 'stretching', 'growth'],
      'energy_match': ['energy', 'vibe', 'feeling', 'mood']
    };
    
    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      if (keywords.some(keyword => allFeedback.includes(keyword))) {
        commonThemes.push(theme);
      }
    });
    
    return commonThemes.slice(0, 3); // Return top 3 themes
  }
}

// Export singleton instance
export const onboardingFeedbackService = new OnboardingFeedbackService();