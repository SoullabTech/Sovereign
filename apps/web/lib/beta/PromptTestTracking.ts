/**
 * Prompt Test Tracking
 * Simple analytics for testing starter prompts vs no prompts
 */

interface PromptTestData {
  userId: string;
  variant: 'with_prompts' | 'without_prompts';

  // Key metrics
  timeToFirstMessage: number; // milliseconds
  firstSessionLength: number; // minutes
  firstMessageLength: number; // characters

  // Engagement
  returnedNextDay: boolean;
  returnedWithinWeek: boolean;
  totalSessions: number;

  // User perception
  reportedStuck: boolean;
  usedPrompt?: boolean; // Only for with_prompts variant
  feedback?: string;

  // Technical
  completedOnboarding: boolean;
  timestamp: Date;
}

export class PromptTestTracker {
  private testData = new Map<string, PromptTestData>();
  private sessionStartTimes = new Map<string, Date>();

  /**
   * Assign variant when user completes onboarding
   */
  assignVariant(userId: string): 'with_prompts' | 'without_prompts' {
    // Simple alternating assignment for balanced groups
    const count = this.testData.size;
    const variant = count % 2 === 0 ? 'without_prompts' : 'with_prompts';

    this.testData.set(userId, {
      userId,
      variant,
      timeToFirstMessage: 0,
      firstSessionLength: 0,
      firstMessageLength: 0,
      returnedNextDay: false,
      returnedWithinWeek: false,
      totalSessions: 0,
      reportedStuck: false,
      completedOnboarding: true,
      timestamp: new Date()
    });

    console.log(`📊 Assigned variant: ${variant} to user ${userId}`);
    return variant;
  }

  /**
   * Mark when user lands on chat screen
   */
  startWaitingForMessage(userId: string): void {
    this.sessionStartTimes.set(userId, new Date());
  }

  /**
   * Track first message
   */
  recordFirstMessage(userId: string, messageLength: number, usedPrompt?: boolean): void {
    const data = this.testData.get(userId);
    const startTime = this.sessionStartTimes.get(userId);

    if (!data || !startTime) return;

    data.timeToFirstMessage = Date.now() - startTime.getTime();
    data.firstMessageLength = messageLength;

    if (data.variant === 'with_prompts' && usedPrompt !== undefined) {
      data.usedPrompt = usedPrompt;
    }

    this.testData.set(userId, data);
    console.log(`⏱️ First message: ${(data.timeToFirstMessage / 1000).toFixed(1)}s`);
  }

  /**
   * Track session end
   */
  endSession(userId: string, durationMinutes: number): void {
    const data = this.testData.get(userId);
    if (!data) return;

    // Only track first session length
    if (data.totalSessions === 0) {
      data.firstSessionLength = durationMinutes;
    }

    data.totalSessions += 1;
    this.testData.set(userId, data);
  }

  /**
   * Track return visits
   */
  trackReturn(userId: string, timeSinceLastSession: number): void {
    const data = this.testData.get(userId);
    if (!data) return;

    const hoursSince = timeSinceLastSession / (1000 * 60 * 60);

    if (hoursSince > 20 && hoursSince < 28) {
      data.returnedNextDay = true;
    }

    if (hoursSince < 168) { // 7 days
      data.returnedWithinWeek = true;
    }

    this.testData.set(userId, data);
  }

  /**
   * Track user feedback
   */
  recordFeedback(userId: string, feedback: string, reportedStuck: boolean): void {
    const data = this.testData.get(userId);
    if (!data) return;

    data.feedback = feedback;
    data.reportedStuck = reportedStuck;
    this.testData.set(userId, data);
  }

  /**
   * Get comparison stats
   */
  getComparison(): {
    withPrompts: any;
    withoutPrompts: any;
    insights: string[];
  } {
    const withPrompts = Array.from(this.testData.values())
      .filter(d => d.variant === 'with_prompts');
    const withoutPrompts = Array.from(this.testData.values())
      .filter(d => d.variant === 'without_prompts');

    const insights: string[] = [];

    // Calculate averages
    const avgTimeWith = this.avg(withPrompts.map(d => d.timeToFirstMessage / 1000));
    const avgTimeWithout = this.avg(withoutPrompts.map(d => d.timeToFirstMessage / 1000));

    const avgSessionWith = this.avg(withPrompts.map(d => d.firstSessionLength));
    const avgSessionWithout = this.avg(withoutPrompts.map(d => d.firstSessionLength));

    const returnRateWith = this.percentage(withPrompts.map(d => d.returnedNextDay));
    const returnRateWithout = this.percentage(withoutPrompts.map(d => d.returnedNextDay));

    const stuckWith = this.percentage(withPrompts.map(d => d.reportedStuck));
    const stuckWithout = this.percentage(withoutPrompts.map(d => d.reportedStuck));

    // Generate insights
    if (avgTimeWithout > avgTimeWith * 1.5) {
      insights.push(`🎯 Users WITHOUT prompts took ${((avgTimeWithout - avgTimeWith) / avgTimeWith * 100).toFixed(0)}% longer to send first message`);
    }

    if (returnRateWith > returnRateWithout * 1.2) {
      insights.push(`🔄 Users WITH prompts returned next day ${((returnRateWith / returnRateWithout - 1) * 100).toFixed(0)}% more often`);
    }

    if (stuckWithout > stuckWith * 2) {
      insights.push(`⚠️ Users WITHOUT prompts reported feeling stuck ${((stuckWithout / stuckWith - 1) * 100).toFixed(0)}% more often`);
    }

    const promptUsageRate = withPrompts.filter(d => d.usedPrompt).length / withPrompts.length;
    if (promptUsageRate < 0.3) {
      insights.push(`📝 Only ${(promptUsageRate * 100).toFixed(0)}% of users actually used the prompts - may be unnecessary`);
    }

    return {
      withPrompts: {
        count: withPrompts.length,
        avgTimeToFirstMessage: avgTimeWith.toFixed(1) + 's',
        avgFirstSessionLength: avgSessionWith.toFixed(1) + 'min',
        returnRate: returnRateWith.toFixed(0) + '%',
        stuckRate: stuckWith.toFixed(0) + '%',
        promptUsageRate: (promptUsageRate * 100).toFixed(0) + '%'
      },
      withoutPrompts: {
        count: withoutPrompts.length,
        avgTimeToFirstMessage: avgTimeWithout.toFixed(1) + 's',
        avgFirstSessionLength: avgSessionWithout.toFixed(1) + 'min',
        returnRate: returnRateWithout.toFixed(0) + '%',
        stuckRate: stuckWithout.toFixed(0) + '%'
      },
      insights
    };
  }

  /**
   * Export data for analysis
   */
  exportData(): string {
    const data = Array.from(this.testData.values());
    return JSON.stringify({
      testName: 'starter_prompts_test',
      startDate: new Date().toISOString(),
      totalUsers: data.length,
      variants: {
        with_prompts: data.filter(d => d.variant === 'with_prompts').length,
        without_prompts: data.filter(d => d.variant === 'without_prompts').length
      },
      data: data.map(d => ({
        userId: d.userId.substring(0, 8) + '...', // Anonymized
        variant: d.variant,
        timeToFirstMessage: d.timeToFirstMessage,
        firstSessionLength: d.firstSessionLength,
        returnedNextDay: d.returnedNextDay,
        reportedStuck: d.reportedStuck,
        usedPrompt: d.usedPrompt
      }))
    }, null, 2);
  }

  // Helper methods
  private avg(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  private percentage(booleans: boolean[]): number {
    if (booleans.length === 0) return 0;
    return (booleans.filter(Boolean).length / booleans.length) * 100;
  }
}

// Singleton
export const promptTestTracker = new PromptTestTracker();