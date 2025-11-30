/**
 * Ethical Collective Intelligence Service
 * 
 * Backend-only pattern recognition for system improvement.
 * NEVER surfaces collective data to users to avoid social proof
 * and echo chamber effects.
 */

import { UnifiedStorageService } from '../core/UnifiedStorageService';
import { EventBus } from '../core/EventBus';

export interface CollectivePattern {
  id: string;
  patternType: 'response_improvement' | 'safety_indicator' | 'progression_insight';
  
  // Aggregated data - never individual
  frequency: number;
  contexts: string[];
  effectiveness: {
    helpfulResponses: number;
    totalResponses: number;
    userSatisfaction: number; // 0-1, from explicit feedback only
  };
  
  // For system improvement only
  suggestedResponseAdjustments: string[];
  safetyConsiderations: string[];
  
  // Never exposed to users
  lastUpdated: Date;
  confidence: number;
}

export interface UserProgressionReadiness {
  userId: string;
  currentStage: string;
  
  // Self-reported measures only
  selfReportedSatisfaction: number; // 0-1, explicit user feedback
  explicitReadinessRequests: number; // User says "I want more depth"
  explicitComfortWithComplexity: boolean; // User says "I can handle more"
  
  // Behavioral observations (descriptive, not evaluative)
  sessionConsistency: number; // Just frequency, no judgment
  integrationReports: number; // User reports trying suggestions
  questionAsking: number; // User asks follow-up questions
  
  // System recommendation (never shown to user)
  systemReadinessAssessment: 'maintain_current' | 'ready_for_invitation' | 'needs_more_time';
}

export class EthicalCollectiveIntelligence {
  private storage: UnifiedStorageService;
  private eventBus: EventBus;
  
  // Backend-only pattern storage
  private patterns: Map<string, CollectivePattern> = new Map();
  
  constructor(storage: UnifiedStorageService, eventBus: EventBus) {
    this.storage = storage;
    this.eventBus = eventBus;
    this.setupEventHandlers();
  }

  /**
   * BACKEND ONLY: Learn from response effectiveness without exposing to users
   */
  async analyzeResponseEffectiveness(
    responseType: string,
    userFeedback: 'helpful' | 'not_helpful' | 'neutral',
    context: {
      stage: string;
      userState: any;
      sessionContext: any;
    }
  ): Promise<void> {
    
    const patternId = this.generatePatternId(responseType, context);
    let pattern = this.patterns.get(patternId);
    
    if (!pattern) {
      pattern = {
        id: patternId,
        patternType: 'response_improvement',
        frequency: 0,
        contexts: [],
        effectiveness: {
          helpfulResponses: 0,
          totalResponses: 0,
          userSatisfaction: 0
        },
        suggestedResponseAdjustments: [],
        safetyConsiderations: [],
        lastUpdated: new Date(),
        confidence: 0
      };
    }
    
    // Update effectiveness metrics
    pattern.frequency++;
    pattern.effectiveness.totalResponses++;
    
    if (userFeedback === 'helpful') {
      pattern.effectiveness.helpfulResponses++;
    }
    
    pattern.effectiveness.userSatisfaction = 
      pattern.effectiveness.helpfulResponses / pattern.effectiveness.totalResponses;
    
    pattern.lastUpdated = new Date();
    pattern.confidence = Math.min(pattern.frequency / 20, 1.0); // More data = more confidence
    
    // Store updated pattern
    this.patterns.set(patternId, pattern);
    
    // IMPORTANT: Never emit this data to user-facing services
    await this.eventBus.emit('collective:pattern_updated', {
      patternId,
      internal: true, // Flag as internal-only
      effectiveness: pattern.effectiveness.userSatisfaction
    });
  }

  /**
   * BACKEND ONLY: Identify safety indicators across user base
   */
  async analyzeSafetyPatterns(
    safetySignals: any,
    context: any
  ): Promise<void> {
    
    // Aggregate safety patterns for system improvement
    // Never surface individual cases or counts to users
    
    if (safetySignals.riskLevel === 'high') {
      await this.updateSafetyPattern('high_risk_context', context, safetySignals);
    }
    
    if (safetySignals.riskLevel === 'medium') {
      await this.updateSafetyPattern('medium_risk_context', context, safetySignals);
    }
    
    // Use patterns to improve safety detection, not to show users statistics
  }

  /**
   * BACKEND ONLY: Improve response quality based on collective learning
   */
  getResponseImprovements(
    responseType: string,
    context: any
  ): {
    suggestedAdjustments: string[];
    confidenceLevel: number;
  } {
    
    const patternId = this.generatePatternId(responseType, context);
    const pattern = this.patterns.get(patternId);
    
    if (!pattern || pattern.confidence < 0.3) {
      return {
        suggestedAdjustments: [],
        confidenceLevel: 0
      };
    }
    
    return {
      suggestedAdjustments: pattern.suggestedResponseAdjustments,
      confidenceLevel: pattern.confidence
    };
  }

  /**
   * Assess user progression readiness - invitation only, never automatic
   */
  async assessProgressionReadiness(
    userId: string,
    userProfile: any,
    sessionHistory: any[]
  ): Promise<UserProgressionReadiness> {
    
    // Get only self-reported satisfaction
    const selfReported = await this.getUserSelfReports(userId);
    
    // Count explicit readiness requests
    const explicitRequests = this.countExplicitReadinessRequests(sessionHistory);
    
    // Simple behavioral observations (descriptive only)
    const behaviorMetrics = this.calculateBehaviorMetrics(sessionHistory);
    
    // System assessment (internal only)
    const systemAssessment = this.calculateSystemReadiness(
      selfReported,
      explicitRequests,
      behaviorMetrics
    );
    
    return {
      userId,
      currentStage: userProfile.currentStage || 'structured_guide',
      selfReportedSatisfaction: selfReported.satisfaction,
      explicitReadinessRequests: explicitRequests,
      explicitComfortWithComplexity: selfReported.comfortWithComplexity,
      sessionConsistency: behaviorMetrics.consistency,
      integrationReports: behaviorMetrics.integrationReports,
      questionAsking: behaviorMetrics.questionAsking,
      systemReadinessAssessment: systemAssessment
    };
  }

  /**
   * Generate progression invitation when appropriate
   */
  async generateProgressionInvitation(
    readiness: UserProgressionReadiness
  ): Promise<{
    shouldOffer: boolean;
    invitation?: {
      message: string;
      options: Array<{
        choice: string;
        description: string;
        nextStage?: string;
      }>;
    };
  }> {
    
    // Only offer invitation if system assesses readiness AND user has indicated interest
    if (readiness.systemReadinessAssessment !== 'ready_for_invitation' ||
        readiness.explicitReadinessRequests === 0) {
      return { shouldOffer: false };
    }
    
    const nextStage = this.getNextStage(readiness.currentStage);
    
    return {
      shouldOffer: true,
      invitation: {
        message: "Your engagement and integration suggest you might be ready to explore differently. What feels right for you?",
        options: [
          {
            choice: "Continue developing here",
            description: `Keep working at the ${this.getStageLabel(readiness.currentStage)} level`,
            nextStage: readiness.currentStage
          },
          {
            choice: "Explore with more complexity", 
            description: `Move toward ${this.getStageLabel(nextStage)} level interactions`,
            nextStage: nextStage
          },
          {
            choice: "Take a break and integrate",
            description: "Pause active exploration to consolidate insights",
            nextStage: undefined
          }
        ]
      }
    };
  }

  /**
   * NEVER expose collective statistics to users
   */
  private async getUserSelfReports(userId: string): Promise<{
    satisfaction: number;
    comfortWithComplexity: boolean;
  }> {
    
    // Only use explicit user feedback, never inferred metrics
    const feedback = await this.storage.query({
      entityType: 'UserFeedback',
      userId: userId,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    
    if (feedback.data.length === 0) {
      return {
        satisfaction: 0.5, // Neutral default
        comfortWithComplexity: false
      };
    }
    
    const avgSatisfaction = feedback.data.reduce((sum: number, fb: any) => 
      sum + (fb.satisfactionRating || 0.5), 0) / feedback.data.length;
    
    const comfortReports = feedback.data.filter((fb: any) => 
      fb.explicitFeedback?.includes('ready for more') ||
      fb.explicitFeedback?.includes('want more depth') ||
      fb.explicitFeedback?.includes('can handle more')
    );
    
    return {
      satisfaction: avgSatisfaction,
      comfortWithComplexity: comfortReports.length > 0
    };
  }

  private countExplicitReadinessRequests(sessionHistory: any[]): number {
    const readinessPatterns = [
      /ready for more/i,
      /want.*deeper/i,
      /can handle more/i,
      /more complex/i,
      /next level/i
    ];
    
    let count = 0;
    for (const session of sessionHistory) {
      for (const message of session.userMessages || []) {
        if (readinessPatterns.some(pattern => pattern.test(message))) {
          count++;
          break; // Count once per session max
        }
      }
    }
    
    return count;
  }

  private calculateBehaviorMetrics(sessionHistory: any[]): {
    consistency: number;
    integrationReports: number; 
    questionAsking: number;
  } {
    
    if (sessionHistory.length === 0) {
      return { consistency: 0, integrationReports: 0, questionAsking: 0 };
    }
    
    // Simple frequency metrics - no evaluation
    const totalSessions = sessionHistory.length;
    const daysSpan = this.calculateDaysSpan(sessionHistory);
    const consistency = totalSessions / Math.max(daysSpan, 1);
    
    const integrationReports = sessionHistory.reduce((count, session) => {
      const integrationWords = session.userMessages?.join(' ').match(/tried|did|practiced|implemented|changed/gi) || [];
      return count + integrationWords.length;
    }, 0);
    
    const questionAsking = sessionHistory.reduce((count, session) => {
      const questions = session.userMessages?.join(' ').match(/\?/g) || [];
      return count + questions.length;
    }, 0);
    
    return {
      consistency: Math.min(consistency, 1.0),
      integrationReports,
      questionAsking
    };
  }

  private calculateSystemReadiness(
    selfReported: any,
    explicitRequests: number,
    behaviorMetrics: any
  ): 'maintain_current' | 'ready_for_invitation' | 'needs_more_time' {
    
    // Conservative assessment - multiple indicators required
    const hasSelfReportedReadiness = selfReported.satisfaction > 0.7 && selfReported.comfortWithComplexity;
    const hasExplicitRequests = explicitRequests >= 2; // Multiple explicit requests
    const hasConsistentEngagement = behaviorMetrics.consistency > 0.3;
    const hasIntegrationEvidence = behaviorMetrics.integrationReports >= 3;
    
    if (hasSelfReportedReadiness && hasExplicitRequests && 
        hasConsistentEngagement && hasIntegrationEvidence) {
      return 'ready_for_invitation';
    }
    
    if (selfReported.satisfaction < 0.4 || behaviorMetrics.consistency < 0.1) {
      return 'needs_more_time';
    }
    
    return 'maintain_current';
  }

  // Utility methods
  
  private generatePatternId(responseType: string, context: any): string {
    return `${responseType}_${context.stage}_${Date.now().toString(36)}`;
  }

  private async updateSafetyPattern(
    patternType: string, 
    context: any, 
    safetySignals: any
  ): Promise<void> {
    
    // Update internal safety patterns for system improvement
    // Never expose these patterns to users
    
    const pattern = this.patterns.get(patternType) || {
      id: patternType,
      patternType: 'safety_indicator',
      frequency: 0,
      contexts: [],
      effectiveness: {
        helpfulResponses: 0,
        totalResponses: 0,
        userSatisfaction: 0
      },
      suggestedResponseAdjustments: [],
      safetyConsiderations: [],
      lastUpdated: new Date(),
      confidence: 0
    };
    
    pattern.frequency++;
    pattern.contexts.push(context.stage);
    pattern.safetyConsiderations = this.updateSafetyConsiderations(
      pattern.safetyConsiderations, 
      safetySignals
    );
    
    this.patterns.set(patternType, pattern);
  }

  private updateSafetyConsiderations(
    existing: string[], 
    signals: any
  ): string[] {
    
    const considerations = [...existing];
    
    if (signals.concerns.includes('overwhelm') && !considerations.includes('reduce_intensity')) {
      considerations.push('reduce_intensity');
    }
    
    if (signals.concerns.includes('dissociation') && !considerations.includes('increase_grounding')) {
      considerations.push('increase_grounding');
    }
    
    return considerations.slice(-10); // Keep most recent
  }

  private calculateDaysSpan(sessionHistory: any[]): number {
    if (sessionHistory.length < 2) return 1;
    
    const dates = sessionHistory.map(s => new Date(s.createdAt)).sort();
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];
    
    return Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)));
  }

  private getNextStage(currentStage: string): string {
    const progression = {
      'structured_guide': 'dialogical_companion',
      'dialogical_companion': 'co_creative_partner', 
      'co_creative_partner': 'transparent_prism',
      'transparent_prism': 'transparent_prism' // Max level
    };
    
    return progression[currentStage as keyof typeof progression] || currentStage;
  }

  private getStageLabel(stage: string): string {
    const labels = {
      'structured_guide': 'Structured Guide',
      'dialogical_companion': 'Dialogical Companion',
      'co_creative_partner': 'Co-Creative Partner',
      'transparent_prism': 'Transparent Prism'
    };
    
    return labels[stage as keyof typeof labels] || stage;
  }

  private setupEventHandlers(): void {
    // Listen for user feedback to improve patterns
    this.eventBus.subscribe('user:feedback_provided', async (event) => {
      await this.analyzeResponseEffectiveness(
        event.data.responseType,
        event.data.feedback,
        event.data.context
      );
    });
    
    // Listen for safety events to improve safety detection
    this.eventBus.subscribe('safety:event_detected', async (event) => {
      await this.analyzeSafetyPatterns(
        event.data.safetySignals,
        event.data.context
      );
    });
    
    // NEVER subscribe to events that would expose collective data to users
  }
}