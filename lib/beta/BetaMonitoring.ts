/**
 * Beta Testing Infrastructure
 * Monitoring, reporting, and support systems for 20-person beta launch
 */

export interface BetaTester {
  id: string;
  email: string;
  joinDate: Date;
  onboardingCompleted: boolean;
  currentDay: number;
  currentPhase: 'entry' | 'journal' | 'chat' | 'integration' | 'evening';
  preferences: {
    communicationStyle: 'gentle' | 'balanced' | 'direct';
    explorationDepth: 'surface' | 'moderate' | 'deep';
    practiceOpenness: boolean;
    reasonForJoining: string;
  };
  status: 'active' | 'paused' | 'dropped' | 'completed';
  lastActive: Date;
  riskFlags: string[];
  totalEngagementMinutes: number;
  averageSessionRating: number;
  breakthroughMoments: number;
}

export interface DailyEngagement {
  userId: string;
  day: number;
  element: string;
  phase: string;
  startTime: Date;
  endTime?: Date;
  engagementMinutes: number;
  chatMessages: number;
  journalWordCount: number;
  practiceCompleted: boolean;
  sessionRating?: number;
  feedback?: string;
  moodBefore?: number; // 1-10
  moodAfter?: number; // 1-10
  technicalIssues: string[];
}

export interface BetaMetrics {
  totalTesters: number;
  activeTesters: number;
  completionRates: {
    day1: number;
    day3: number;
    week1: number;
    fullProgram: number;
  };
  averageEngagement: {
    sessionLength: number;
    dailyReturn: number;
    chatVsJournal: number;
  };
  elementalPreferences: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
  safetyMetrics: {
    riskFlags: number;
    interventions: number;
    escalations: number;
  };
  technicalHealth: {
    uptime: number;
    avgResponseTime: number;
    errorRate: number;
  };
}

export class BetaMonitoring {
  private testers = new Map<string, BetaTester>();
  private dailyEngagement = new Map<string, DailyEngagement[]>();
  private metrics: BetaMetrics | null = null;

  // === TESTER MANAGEMENT ===

  registerTester(tester: Omit<BetaTester, 'id' | 'joinDate' | 'status' | 'lastActive' | 'riskFlags' | 'totalEngagementMinutes' | 'averageSessionRating' | 'breakthroughMoments'>): string {
    const id = `beta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const betaTester: BetaTester = {
      id,
      joinDate: new Date(),
      status: 'active',
      lastActive: new Date(),
      riskFlags: [],
      totalEngagementMinutes: 0,
      averageSessionRating: 0,
      breakthroughMoments: 0,
      ...tester
    };

    this.testers.set(id, betaTester);
    this.dailyEngagement.set(id, []);

    console.log(`🧪 Registered beta tester: ${id}`);
    return id;
  }

  getTester(userId: string): BetaTester | null {
    return this.testers.get(userId) || null;
  }

  updateTesterStatus(userId: string, updates: Partial<BetaTester>): void {
    const tester = this.testers.get(userId);
    if (!tester) return;

    Object.assign(tester, updates, { lastActive: new Date() });
    this.testers.set(userId, tester);
  }

  // === ENGAGEMENT TRACKING ===

  startDailySession(userId: string, day: number, element: string, phase: string): string {
    const sessionId = `session_${Date.now()}`;
    const engagement: DailyEngagement = {
      userId,
      day,
      element,
      phase,
      startTime: new Date(),
      engagementMinutes: 0,
      chatMessages: 0,
      journalWordCount: 0,
      practiceCompleted: false,
      technicalIssues: []
    };

    const sessions = this.dailyEngagement.get(userId) || [];
    sessions.push(engagement);
    this.dailyEngagement.set(userId, sessions);

    return sessionId;
  }

  updateEngagement(userId: string, updates: Partial<DailyEngagement>): void {
    const sessions = this.dailyEngagement.get(userId) || [];
    const currentSession = sessions[sessions.length - 1];

    if (currentSession) {
      Object.assign(currentSession, updates);

      // Auto-calculate engagement time
      if (currentSession.startTime && !currentSession.endTime) {
        currentSession.engagementMinutes = Math.round(
          (Date.now() - currentSession.startTime.getTime()) / 60000
        );
      }

      this.dailyEngagement.set(userId, sessions);

      // Update tester totals
      const tester = this.testers.get(userId);
      if (tester) {
        tester.totalEngagementMinutes = sessions.reduce(
          (total, session) => total + session.engagementMinutes, 0
        );
        this.testers.set(userId, tester);
      }
    }
  }

  // === SAFETY & RISK MONITORING ===

  flagRisk(userId: string, flag: string, severity: 'low' | 'medium' | 'high'): void {
    const tester = this.testers.get(userId);
    if (!tester) return;

    const flagWithSeverity = `${severity.toUpperCase()}: ${flag}`;
    tester.riskFlags.push(flagWithSeverity);

    if (severity === 'high') {
      this.escalateToTeam(userId, flag);
    }

    this.testers.set(userId, tester);
  }

  private escalateToTeam(userId: string, reason: string): void {
    // TODO: Implement real escalation (Slack webhook, email, etc.)
    console.error(`🚨 BETA ESCALATION - User ${userId}: ${reason}`);
  }

  // === FEEDBACK COLLECTION ===

  recordFeedback(userId: string, feedback: {
    type: 'daily_rating' | 'weekly_survey' | 'spontaneous';
    rating?: number;
    text?: string;
    suggestions?: string[];
    technicalIssues?: string[];
  }): void {
    const sessions = this.dailyEngagement.get(userId) || [];
    const currentSession = sessions[sessions.length - 1];

    if (currentSession && feedback.type === 'daily_rating') {
      currentSession.sessionRating = feedback.rating;
      currentSession.feedback = feedback.text;
      if (feedback.technicalIssues) {
        currentSession.technicalIssues.push(...feedback.technicalIssues);
      }
    }

    // Update average rating
    const tester = this.testers.get(userId);
    if (tester && feedback.rating) {
      const allRatings = sessions
        .map(s => s.sessionRating)
        .filter(r => r !== undefined) as number[];

      tester.averageSessionRating = allRatings.length > 0
        ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length
        : 0;

      this.testers.set(userId, tester);
    }
  }

  // === ANALYTICS & REPORTING ===

  generateDailyReport(): BetaMetrics {
    const allTesters = Array.from(this.testers.values());
    const totalTesters = allTesters.length;
    const activeTesters = allTesters.filter(t => t.status === 'active').length;

    // Calculate completion rates
    const day1Complete = allTesters.filter(t => t.currentDay >= 1).length;
    const day3Complete = allTesters.filter(t => t.currentDay >= 3).length;
    const week1Complete = allTesters.filter(t => t.currentDay >= 7).length;
    const fullComplete = allTesters.filter(t => t.status === 'completed').length;

    // Calculate engagement averages
    const allSessions = Array.from(this.dailyEngagement.values()).flat();
    const avgSessionLength = allSessions.length > 0
      ? allSessions.reduce((sum, s) => sum + s.engagementMinutes, 0) / allSessions.length
      : 0;

    const dailyReturnRate = this.calculateDailyReturnRate();
    const chatVsJournalRatio = this.calculateChatJournalRatio();

    // Element preferences
    const elementCounts = allSessions.reduce((counts, session) => {
      counts[session.element as keyof typeof counts] = (counts[session.element as keyof typeof counts] || 0) + 1;
      return counts;
    }, { fire: 0, water: 0, earth: 0, air: 0, aether: 0 });

    // Safety metrics
    const totalRiskFlags = allTesters.reduce((sum, t) => sum + t.riskFlags.length, 0);
    const highRiskFlags = allTesters.reduce((sum, t) =>
      sum + t.riskFlags.filter(f => f.startsWith('HIGH:')).length, 0
    );

    this.metrics = {
      totalTesters,
      activeTesters,
      completionRates: {
        day1: totalTesters > 0 ? day1Complete / totalTesters : 0,
        day3: totalTesters > 0 ? day3Complete / totalTesters : 0,
        week1: totalTesters > 0 ? week1Complete / totalTesters : 0,
        fullProgram: totalTesters > 0 ? fullComplete / totalTesters : 0
      },
      averageEngagement: {
        sessionLength: avgSessionLength,
        dailyReturn: dailyReturnRate,
        chatVsJournal: chatVsJournalRatio
      },
      elementalPreferences: elementCounts,
      safetyMetrics: {
        riskFlags: totalRiskFlags,
        interventions: totalRiskFlags, // Simplified for beta
        escalations: highRiskFlags
      },
      technicalHealth: {
        uptime: 0.99, // TODO: Implement real uptime monitoring
        avgResponseTime: 1.2, // TODO: Implement real response time tracking
        errorRate: 0.02 // TODO: Implement real error rate tracking
      }
    };

    return this.metrics;
  }

  private calculateDailyReturnRate(): number {
    const allTesters = Array.from(this.testers.values());
    const activeTesters = allTesters.filter(t => t.status === 'active');

    if (activeTesters.length === 0) return 0;

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const returnedYesterday = activeTesters.filter(t =>
      t.lastActive > yesterday
    ).length;

    return returnedYesterday / activeTesters.length;
  }

  private calculateChatJournalRatio(): number {
    const allSessions = Array.from(this.dailyEngagement.values()).flat();
    const totalChatMessages = allSessions.reduce((sum, s) => sum + s.chatMessages, 0);
    const totalJournalWords = allSessions.reduce((sum, s) => sum + s.journalWordCount, 0);

    if (totalJournalWords === 0) return totalChatMessages > 0 ? Infinity : 0;
    return totalChatMessages / (totalJournalWords / 100); // Normalize by ~100 words
  }

  // === DASHBOARD DATA ===

  getTesterDashboard(userId: string): any {
    const tester = this.testers.get(userId);
    const sessions = this.dailyEngagement.get(userId) || [];

    if (!tester) return null;

    const currentSession = sessions[sessions.length - 1];
    const moodTrajectory = this.calculateMoodTrajectory(sessions);

    return {
      userId: tester.id,
      day: tester.currentDay,
      phase: tester.currentPhase,
      element: currentSession?.element || 'unknown',
      engagementMinutes: currentSession?.engagementMinutes || 0,
      chatVsJournal: currentSession
        ? `chat: ${currentSession.chatMessages}, journal: ${currentSession.journalWordCount}`
        : 'no activity',
      moodTrajectory,
      riskFlags: tester.riskFlags.length > 0 ? tester.riskFlags : ['None'],
      recentFeedback: currentSession?.feedback || 'None today',
      suggestedAction: this.suggestAction(tester, currentSession),
      weekProgress: Math.min(tester.currentDay / 7, 1),
      breakthroughs: tester.breakthroughMoments
    };
  }

  private calculateMoodTrajectory(sessions: DailyEngagement[]): string {
    const recentMoods = sessions
      .filter(s => s.moodBefore && s.moodAfter)
      .slice(-3)
      .map(s => (s.moodAfter! - s.moodBefore!));

    if (recentMoods.length === 0) return 'No data';

    const avgChange = recentMoods.reduce((sum, change) => sum + change, 0) / recentMoods.length;

    if (avgChange > 1) return 'Improving ↑↑';
    if (avgChange > 0.3) return 'Improving ↑';
    if (avgChange > -0.3) return 'Stable →';
    if (avgChange > -1) return 'Declining ↓';
    return 'Declining ↓↓';
  }

  private suggestAction(tester: BetaTester, currentSession?: DailyEngagement): string {
    // High-priority safety flags
    if (tester.riskFlags.some(f => f.startsWith('HIGH:'))) {
      return 'URGENT: Review risk flags immediately';
    }

    // Engagement issues
    if (currentSession && currentSession.engagementMinutes < 5) {
      return 'Low engagement - consider shorter prompts tomorrow';
    }

    // Feedback-based suggestions
    if (currentSession?.feedback?.includes('rushed')) {
      return 'Adjust tomorrow\'s prompts to be shorter';
    }

    if (currentSession?.feedback?.includes('boring')) {
      return 'Increase archetypal depth for this user';
    }

    // Progress tracking
    const daysSinceActive = Math.floor(
      (Date.now() - tester.lastActive.getTime()) / (24 * 60 * 60 * 1000)
    );

    if (daysSinceActive > 1) {
      return `Inactive for ${daysSinceActive} days - send gentle re-engagement`;
    }

    return 'All good - monitor for patterns';
  }

  // === EXPORT METHODS ===

  exportDailyReport(): string {
    const metrics = this.generateDailyReport();
    const date = new Date().toISOString().split('T')[0];

    return `# Beta Daily Report - ${date}

## Overview
- **Total Testers**: ${metrics.totalTesters}
- **Active**: ${metrics.activeTesters}
- **Completion Rates**: Day 1: ${(metrics.completionRates.day1 * 100).toFixed(1)}%, Day 3: ${(metrics.completionRates.day3 * 100).toFixed(1)}%, Week 1: ${(metrics.completionRates.week1 * 100).toFixed(1)}%

## Engagement
- **Avg Session**: ${metrics.averageEngagement.sessionLength.toFixed(1)} minutes
- **Daily Return**: ${(metrics.averageEngagement.dailyReturn * 100).toFixed(1)}%
- **Chat/Journal Ratio**: ${metrics.averageEngagement.chatVsJournal.toFixed(2)}

## Element Preferences
- **Fire**: ${metrics.elementalPreferences.fire} sessions
- **Water**: ${metrics.elementalPreferences.water} sessions
- **Earth**: ${metrics.elementalPreferences.earth} sessions
- **Air**: ${metrics.elementalPreferences.air} sessions
- **Aether**: ${metrics.elementalPreferences.aether} sessions

## Safety
- **Risk Flags**: ${metrics.safetyMetrics.riskFlags}
- **Escalations**: ${metrics.safetyMetrics.escalations}

## Technical Health
- **Uptime**: ${(metrics.technicalHealth.uptime * 100).toFixed(2)}%
- **Response Time**: ${metrics.technicalHealth.avgResponseTime}s
- **Error Rate**: ${(metrics.technicalHealth.errorRate * 100).toFixed(2)}%

---
Generated: ${new Date().toISOString()}`;
  }
}

export const betaMonitoring = new BetaMonitoring();