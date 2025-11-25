// Progressive Feedback System - A/B Testing & Real-time User Adjustments
// Implements the data-driven approach for understanding user preferences

interface FeedbackMetrics {
  conversationId: string;
  userId: string;
  timestamp: number;

  // Experience Quality
  pacingFeedback: 'too-fast' | 'just-right' | 'too-slow';
  depthFeedback: 'too-shallow' | 'just-right' | 'too-deep';
  loopingFeedback: 'annoying' | 'helpful' | 'not-enough';

  // Feature Effectiveness
  featureUsed: string[];
  featureHelpfulness: Map<string, number>; // 1-5 scale

  // Overall Experience
  satisfactionScore: number; // 1-10
  wouldRecommend: boolean;

  // Behavioral Data
  sessionDuration: number;
  messageCount: number;
  prematureExit: boolean;
}

export class ProgressiveFeedbackSystem {
  private abTestGroups = new Map<string, string>();
  private userFeedbackHistory = new Map<string, FeedbackMetrics[]>();
  private realTimeAdjustments = new Map<string, any>();

  // === A/B TEST MANAGEMENT ===
  assignUserToTestGroup(userId: string, testName: string): 'A' | 'B' {
    const existingAssignment = this.abTestGroups.get(`${userId}:${testName}`);
    if (existingAssignment) return existingAssignment as 'A' | 'B';

    // Consistent hash-based assignment
    const hash = this.hashString(userId + testName);
    const group = hash % 2 === 0 ? 'A' : 'B';

    this.abTestGroups.set(`${userId}:${testName}`, group);
    console.log(`👥 User ${userId.slice(0, 8)} assigned to group ${group} for test ${testName}`);

    return group;
  }

  getTestVariantPreferences(userId: string): Partial<any> {
    // Current A/B tests
    const loopingTest = this.assignUserToTestGroup(userId, 'looping_default');
    const speedTest = this.assignUserToTestGroup(userId, 'speed_preference');

    const variants = {
      // Test: Should looping be enabled by default?
      looping_default_enabled: loopingTest === 'A',

      // Test: Default response speed
      default_speed_fast: speedTest === 'A'
    };

    return {
      features: {
        loopingProtocol: variants.looping_default_enabled ? 'auto' : 'off'
      },
      conversationStyle: {
        responseSpeed: variants.default_speed_fast ? 'fastest' : 'balanced'
      }
    };
  }

  // === REAL-TIME FEEDBACK COLLECTION ===
  collectQuickFeedback(
    userId: string,
    conversationId: string,
    feedbackType: 'pacing' | 'depth' | 'looping' | 'overall',
    value: string | number
  ): void {
    const adjustment = this.generateRealTimeAdjustment(feedbackType, value);

    if (adjustment) {
      this.realTimeAdjustments.set(userId, {
        ...this.realTimeAdjustments.get(userId) || {},
        [feedbackType]: adjustment,
        timestamp: Date.now()
      });

      console.log(`📊 Real-time adjustment for ${userId.slice(0, 8)}:`, adjustment);
    }

    // Store for analysis
    this.storeFeedbackData(userId, conversationId, feedbackType, value);
  }

  private generateRealTimeAdjustment(
    feedbackType: string,
    value: string | number
  ): any {
    switch (feedbackType) {
      case 'pacing':
        if (value === 'too-fast') {
          return { responseSpeedModifier: 0.8, addContemplativeSpace: true };
        }
        if (value === 'too-slow') {
          return { responseSpeedModifier: 1.2, reduceFeatures: true };
        }
        return null;

      case 'looping':
        if (value === 'annoying') {
          return { disableLooping: true, loopingConfidence: 0.3 };
        }
        if (value === 'not-enough') {
          return { enhanceLooping: true, loopingConfidence: 0.9 };
        }
        return null;

      case 'depth':
        if (value === 'too-shallow') {
          return { increaseDepth: true, witnessingDepth: 'deep' };
        }
        if (value === 'too-deep') {
          return { reduceDepth: true, witnessingDepth: 'surface' };
        }
        return null;

      default:
        return null;
    }
  }

  // === APPLY REAL-TIME ADJUSTMENTS ===
  applyRealTimeAdjustments(userId: string, basePreferences: any): any {
    const adjustments = this.realTimeAdjustments.get(userId);
    if (!adjustments) return basePreferences;

    // Only apply recent adjustments (last 30 minutes)
    if (Date.now() - adjustments.timestamp > 30 * 60 * 1000) {
      this.realTimeAdjustments.delete(userId);
      return basePreferences;
    }

    let adjusted = { ...basePreferences };

    // Apply speed adjustments
    if (adjustments.pacing?.responseSpeedModifier) {
      const currentSpeed = adjusted.conversationStyle?.responseSpeed || 'balanced';
      const speedMap = { fastest: 0, balanced: 1, thorough: 2 };
      const reverseMap = ['fastest', 'balanced', 'thorough'];

      const currentIndex = speedMap[currentSpeed];
      const modifier = adjustments.pacing.responseSpeedModifier;

      if (modifier < 1) { // Slow down
        adjusted.conversationStyle.responseSpeed = reverseMap[Math.min(2, currentIndex + 1)];
      } else { // Speed up
        adjusted.conversationStyle.responseSpeed = reverseMap[Math.max(0, currentIndex - 1)];
      }
    }

    // Apply looping adjustments
    if (adjustments.looping?.disableLooping) {
      adjusted.features.loopingProtocol = 'off';
    }
    if (adjustments.looping?.enhanceLooping) {
      adjusted.features.loopingProtocol = 'full';
    }

    // Apply depth adjustments
    if (adjustments.depth?.witnessingDepth) {
      adjusted.conversationStyle.witnessingDepth = adjustments.depth.witnessingDepth;
    }

    return adjusted;
  }

  // === POST-CONVERSATION ANALYSIS ===
  collectDetailedFeedback(
    userId: string,
    conversationId: string,
    metrics: Partial<FeedbackMetrics>
  ): void {
    const fullMetrics: FeedbackMetrics = {
      conversationId,
      userId,
      timestamp: Date.now(),
      pacingFeedback: 'just-right',
      depthFeedback: 'just-right',
      loopingFeedback: 'helpful',
      featureUsed: [],
      featureHelpfulness: new Map(),
      satisfactionScore: 7,
      wouldRecommend: true,
      sessionDuration: 0,
      messageCount: 0,
      prematureExit: false,
      ...metrics
    };

    // Store user feedback history
    const history = this.userFeedbackHistory.get(userId) || [];
    history.push(fullMetrics);
    this.userFeedbackHistory.set(userId, history);

    // Generate insights for this user
    this.generateUserInsights(userId, history);

    console.log(`📋 Detailed feedback collected for ${userId.slice(0, 8)}:`, {
      satisfaction: fullMetrics.satisfactionScore,
      features: fullMetrics.featureUsed,
      issues: this.extractIssues(fullMetrics)
    });
  }

  private generateUserInsights(userId: string, history: FeedbackMetrics[]): void {
    if (history.length < 3) return; // Need enough data

    const patterns = {
      consistentlyTooFast: history.slice(-3).every(h => h.pacingFeedback === 'too-fast'),
      consistentlyTooSlow: history.slice(-3).every(h => h.pacingFeedback === 'too-slow'),
      loopingProblems: history.slice(-3).filter(h => h.loopingFeedback === 'annoying').length >= 2,
      highSatisfaction: history.slice(-3).every(h => h.satisfactionScore >= 8),
      prematureExits: history.slice(-5).filter(h => h.prematureExit).length >= 2
    };

    // Generate permanent preference adjustments based on patterns
    if (patterns.consistentlyTooFast) {
      this.setPermanentAdjustment(userId, 'speed', 'slower');
    }
    if (patterns.loopingProblems) {
      this.setPermanentAdjustment(userId, 'looping', 'minimal');
    }
    if (patterns.prematureExits) {
      this.setPermanentAdjustment(userId, 'complexity', 'reduced');
    }
  }

  // === ONE-CLICK ADJUSTMENTS ===
  generateOneClickAdjustments(
    userId: string,
    currentConversation: any
  ): Array<{
    label: string;
    action: string;
    preview: string;
  }> {
    const adjustments = [];

    // Based on current features active
    if (currentConversation.features?.includes('looping_protocol')) {
      adjustments.push({
        label: 'Less checking for understanding',
        action: 'reduce_looping',
        preview: 'I\'ll ask fewer clarification questions'
      });
    } else {
      adjustments.push({
        label: 'More checking for understanding',
        action: 'increase_looping',
        preview: 'I\'ll make sure I understand you better'
      });
    }

    // Based on processing time
    if (currentConversation.processingTime > 3000) {
      adjustments.push({
        label: 'Faster responses',
        action: 'speed_up',
        preview: 'I\'ll respond more quickly with simpler processing'
      });
    } else {
      adjustments.push({
        label: 'More thoughtful responses',
        action: 'slow_down',
        preview: 'I\'ll take more time to give you deeper insights'
      });
    }

    return adjustments;
  }

  executeOneClickAdjustment(userId: string, action: string): void {
    const adjustment = this.generateRealTimeAdjustment(
      this.mapActionToFeedbackType(action),
      this.mapActionToValue(action)
    );

    if (adjustment) {
      this.realTimeAdjustments.set(userId, {
        ...this.realTimeAdjustments.get(userId) || {},
        oneClick: adjustment,
        timestamp: Date.now()
      });
    }

    console.log(`🎯 One-click adjustment applied for ${userId.slice(0, 8)}: ${action}`);
  }

  // === AGGREGATE ANALYSIS FOR SYSTEM IMPROVEMENT ===
  generateSystemInsights(): {
    mostRequestedAdjustments: string[];
    problematicFeatureCombinations: string[];
    successfulPresets: string[];
    recommendedDefaultChanges: string[];
  } {
    const allFeedback = Array.from(this.userFeedbackHistory.values()).flat();

    return {
      mostRequestedAdjustments: this.analyzeMostRequestedAdjustments(allFeedback),
      problematicFeatureCombinations: this.analyzeProblematicFeatures(allFeedback),
      successfulPresets: this.analyzeSuccessfulPresets(allFeedback),
      recommendedDefaultChanges: this.analyzeDefaultRecommendations(allFeedback)
    };
  }

  // === UTILITY METHODS ===
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private storeFeedbackData(userId: string, conversationId: string, type: string, value: any): void {
    // Simplified storage - in production would use proper database
    console.log(`📊 Feedback stored: ${type} = ${value} for user ${userId.slice(0, 8)}`);
  }

  private setPermanentAdjustment(userId: string, type: string, value: string): void {
    console.log(`⚙️ Permanent adjustment set for ${userId.slice(0, 8)}: ${type} = ${value}`);
  }

  private extractIssues(metrics: FeedbackMetrics): string[] {
    const issues = [];
    if (metrics.pacingFeedback !== 'just-right') issues.push(`pacing-${metrics.pacingFeedback}`);
    if (metrics.depthFeedback !== 'just-right') issues.push(`depth-${metrics.depthFeedback}`);
    if (metrics.loopingFeedback === 'annoying') issues.push('looping-annoying');
    if (metrics.satisfactionScore < 6) issues.push('low-satisfaction');
    if (metrics.prematureExit) issues.push('premature-exit');
    return issues;
  }

  private mapActionToFeedbackType(action: string): string {
    const mapping = {
      reduce_looping: 'looping',
      increase_looping: 'looping',
      speed_up: 'pacing',
      slow_down: 'pacing'
    };
    return mapping[action] || 'overall';
  }

  private mapActionToValue(action: string): string {
    const mapping = {
      reduce_looping: 'annoying',
      increase_looping: 'not-enough',
      speed_up: 'too-slow',
      slow_down: 'too-fast'
    };
    return mapping[action] || 'just-right';
  }

  private analyzeMostRequestedAdjustments(feedback: FeedbackMetrics[]): string[] {
    return ['speed_up', 'reduce_looping']; // Placeholder
  }

  private analyzeProblematicFeatures(feedback: FeedbackMetrics[]): string[] {
    return ['looping + contemplative_space']; // Placeholder
  }

  private analyzeSuccessfulPresets(feedback: FeedbackMetrics[]): string[] {
    return ['quick-checkin', 'therapeutic']; // Placeholder
  }

  private analyzeDefaultRecommendations(feedback: FeedbackMetrics[]): string[] {
    return ['disable_looping_by_default', 'faster_default_speed']; // Placeholder
  }
}

let _progressiveFeedback: ProgressiveFeedbackSystem | null = null;
export const getProgressiveFeedback = (): ProgressiveFeedbackSystem => {
  if (!_progressiveFeedback) {
    _progressiveFeedback = new ProgressiveFeedbackSystem();
  }
  return _progressiveFeedback;
};