/**
 * CONSCIOUSNESS LEVEL DETECTOR
 *
 * Determines user's consciousness readiness level (1-5) to adapt MAIA's language complexity.
 *
 * Critical insight from Kelly's feedback:
 * "Elder language alienates beginners. We need to meet people where they are."
 *
 * LEVELS:
 * 1. Asleep/Unconscious - New, needs conventional language
 * 2. Awakening/Curious - Beginning journey, bridging language
 * 3. Practicing/Developing - Active engagement, teaching frameworks
 * 4. Integrated/Fluent - Lives the work, full consciousness language
 * 5. Teaching/Transmuting - Elder/Advocate, advanced alchemical language
 */

import {
  consciousnessProfileStorage,
  JourneyProgression,
  JourneySnapshot
} from '../storage/consciousness-profile-storage';

export type ConsciousnessLevel = 1 | 2 | 3 | 4 | 5;

export interface UserConsciousnessProfile {
  userId: string;

  // Detected level (1-5)
  detectedLevel: ConsciousnessLevel;

  // User can override auto-detection
  preferredLevel?: ConsciousnessLevel;

  // Final level to use (preferred overrides detected)
  effectiveLevel: ConsciousnessLevel;

  // Metrics that informed detection
  metrics: {
    daysActive: number;
    journalEntries: number;
    completedMissions: number;
    completedRituals: number;
    coherenceTrend: 'ascending' | 'descending' | 'stable' | 'oscillating';
    currentCoherence: number;
    usedConsciousnessLanguage: boolean;
    teachesOthers: boolean;
    isAdvocate: boolean;
    isElder: boolean;
  };

  // Progressive framework tracking
  frameworksIntroduced: string[];
  frameworksMastered: string[];

  // Learning preferences
  languagePreference: 'simple' | 'auto' | 'advanced';
  explainFrameworks: boolean;
  progressiveEducation: boolean;

  lastUpdated: Date;
}

export interface LevelDetectionResult {
  level: ConsciousnessLevel;
  confidence: number;
  reasoning: string;
  metrics: UserConsciousnessProfile['metrics'];
  recommendations?: string[];
}

/**
 * Detects user's consciousness level based on journey data
 */
export class ConsciousnessLevelDetector {

  /**
   * Primary detection method - analyzes user journey to determine consciousness level
   */
  async detectLevel(params: {
    userId: string;
    journeyData?: JourneyProgression;
    userMetadata?: any;
  }): Promise<LevelDetectionResult> {

    const { userId, journeyData, userMetadata } = params;

    // Get or fetch journey data
    const journey = journeyData || await this.fetchJourneyData(userId);
    const metadata = userMetadata || await this.fetchUserMetadata(userId);

    // Calculate metrics
    const metrics = this.calculateMetrics(journey, metadata);

    // Apply detection algorithm
    const level = this.determineLevel(metrics);
    const confidence = this.calculateConfidence(metrics);
    const reasoning = this.generateReasoning(level, metrics);

    return {
      level,
      confidence,
      reasoning,
      metrics,
      recommendations: this.generateRecommendations(level, metrics)
    };
  }

  /**
   * Calculate all relevant metrics from user data
   */
  private calculateMetrics(
    journey: JourneyProgression | null,
    metadata: any
  ): UserConsciousnessProfile['metrics'] {

    if (!journey || journey.totalSnapshots === 0) {
      // New user - default to level 1
      return {
        daysActive: 0,
        journalEntries: 0,
        completedMissions: 0,
        completedRituals: 0,
        coherenceTrend: 'stable',
        currentCoherence: 0.5,
        usedConsciousnessLanguage: false,
        teachesOthers: false,
        isAdvocate: metadata?.role === 'advocate' || false,
        isElder: metadata?.role === 'elder' || false,
      };
    }

    // Calculate days active
    const firstSnapshot = journey.snapshots[0];
    const lastSnapshot = journey.snapshots[journey.snapshots.length - 1];
    const daysActive = Math.floor(
      (lastSnapshot.timestamp.getTime() - firstSnapshot.timestamp.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Count journal entries (unique sessions)
    const uniqueSessions = new Set(
      journey.snapshots.map(s => s.sessionId).filter(Boolean)
    ).size;

    // Detect consciousness language usage
    const usedConsciousnessLanguage = this.detectConsciousnessLanguage(journey.snapshots);

    return {
      daysActive: Math.max(daysActive, 1),
      journalEntries: uniqueSessions,
      completedMissions: metadata?.completedMissions || 0,
      completedRituals: metadata?.completedRituals || 0,
      coherenceTrend: journey.coherenceTrend || 'stable',
      currentCoherence: journey.coherenceHistory[journey.coherenceHistory.length - 1] || 0.5,
      usedConsciousnessLanguage,
      teachesOthers: metadata?.teachesOthers || false,
      isAdvocate: metadata?.role === 'advocate' || false,
      isElder: metadata?.role === 'elder' || false,
    };
  }

  /**
   * Core algorithm: Determine consciousness level from metrics
   */
  private determineLevel(metrics: UserConsciousnessProfile['metrics']): ConsciousnessLevel {

    // Level 5: Teaching/Transmuting (Elders, Advocates, Guides)
    if (
      metrics.isElder ||
      metrics.isAdvocate ||
      (metrics.teachesOthers && metrics.daysActive >= 90)
    ) {
      return 5;
    }

    // Level 4: Integrated/Fluent (Living the work)
    if (
      metrics.daysActive >= 90 ||
      metrics.completedMissions >= 10 ||
      (metrics.usedConsciousnessLanguage && metrics.coherenceTrend === 'ascending') ||
      metrics.currentCoherence >= 0.8
    ) {
      return 4;
    }

    // Level 3: Practicing/Developing (Actively engaged)
    if (
      metrics.daysActive >= 30 ||
      metrics.completedRituals >= 3 ||
      metrics.completedMissions >= 3 ||
      metrics.usedConsciousnessLanguage ||
      metrics.currentCoherence >= 0.65
    ) {
      return 3;
    }

    // Level 2: Awakening/Curious (Started the journey)
    if (
      metrics.journalEntries >= 5 ||
      metrics.completedMissions >= 1 ||
      metrics.daysActive >= 7 ||
      metrics.completedRituals >= 1
    ) {
      return 2;
    }

    // Level 1: Asleep/Unconscious (New/Beginner)
    return 1;
  }

  /**
   * Calculate confidence score for the detection
   */
  private calculateConfidence(metrics: UserConsciousnessProfile['metrics']): number {
    // More data = higher confidence
    const dataPoints = [
      metrics.daysActive > 0,
      metrics.journalEntries > 0,
      metrics.completedMissions > 0,
      metrics.completedRituals > 0,
      metrics.coherenceTrend !== 'stable'
    ].filter(Boolean).length;

    return Math.min(dataPoints / 5, 1);
  }

  /**
   * Generate human-readable reasoning for the level assignment
   */
  private generateReasoning(level: ConsciousnessLevel, metrics: UserConsciousnessProfile['metrics']): string {
    const reasons: string[] = [];

    switch (level) {
      case 5:
        if (metrics.isElder) reasons.push('Recognized as Elder');
        if (metrics.isAdvocate) reasons.push('Serving as Advocate');
        if (metrics.teachesOthers) reasons.push('Guides others');
        break;

      case 4:
        if (metrics.daysActive >= 90) reasons.push(`${metrics.daysActive} days active`);
        if (metrics.completedMissions >= 10) reasons.push(`${metrics.completedMissions} missions completed`);
        if (metrics.coherenceTrend === 'ascending') reasons.push('Ascending coherence pattern');
        if (metrics.currentCoherence >= 0.8) reasons.push('High coherence level');
        break;

      case 3:
        if (metrics.daysActive >= 30) reasons.push(`${metrics.daysActive} days of practice`);
        if (metrics.completedRituals >= 3) reasons.push('Ritual engagement');
        if (metrics.usedConsciousnessLanguage) reasons.push('Using consciousness frameworks');
        break;

      case 2:
        if (metrics.journalEntries >= 5) reasons.push('Multiple journal entries');
        if (metrics.daysActive >= 7) reasons.push('Week of exploration');
        if (metrics.completedMissions >= 1) reasons.push('First mission complete');
        break;

      case 1:
        reasons.push('New to consciousness work');
        break;
    }

    return reasons.join(', ');
  }

  /**
   * Generate recommendations for growth
   */
  private generateRecommendations(
    level: ConsciousnessLevel,
    metrics: UserConsciousnessProfile['metrics']
  ): string[] {

    const recommendations: string[] = [];

    if (level === 1 && metrics.journalEntries < 3) {
      recommendations.push('Start journaling to deepen your practice');
    }

    if (level === 2 && metrics.completedMissions === 0) {
      recommendations.push('Try your first mission to engage more deeply');
    }

    if (level === 3 && !metrics.usedConsciousnessLanguage) {
      recommendations.push('Explore elemental frameworks to expand your awareness');
    }

    if (level < 4 && metrics.coherenceTrend === 'descending') {
      recommendations.push('Consider a ritual to restore coherence');
    }

    return recommendations;
  }

  /**
   * Detect if user has started using consciousness language
   */
  private detectConsciousnessLanguage(snapshots: JourneySnapshot[]): boolean {
    // Check if user's messages reference elements, alchemy, or consciousness concepts
    // This would need actual message content analysis
    // For now, use alchemical progression as proxy
    return snapshots.some(s =>
      s.alchemicalStage !== 'Unknown' ||
      s.coherence > 0.7
    );
  }

  /**
   * Fetch journey data from storage
   */
  private async fetchJourneyData(userId: string): Promise<JourneyProgression | null> {
    return consciousnessProfileStorage.getJourney(userId);
  }

  /**
   * Fetch user metadata (missions, rituals, role)
   */
  private async fetchUserMetadata(userId: string): Promise<any> {
    const metadata = consciousnessProfileStorage.getMetadata(userId);
    return metadata || {};
  }

  /**
   * Get complete consciousness profile for a user
   */
  async getProfile(userId: string): Promise<UserConsciousnessProfile> {
    const detection = await this.detectLevel({ userId });

    // TODO: Fetch stored preferences
    const storedPreferences = await this.fetchStoredPreferences(userId);

    const profile: UserConsciousnessProfile = {
      userId,
      detectedLevel: detection.level,
      preferredLevel: storedPreferences?.preferredLevel,
      effectiveLevel: storedPreferences?.preferredLevel || detection.level,
      metrics: detection.metrics,
      frameworksIntroduced: storedPreferences?.frameworksIntroduced || [],
      frameworksMastered: storedPreferences?.frameworksMastered || [],
      languagePreference: storedPreferences?.languagePreference || 'auto',
      explainFrameworks: storedPreferences?.explainFrameworks ?? true,
      progressiveEducation: storedPreferences?.progressiveEducation ?? true,
      lastUpdated: new Date()
    };

    return profile;
  }

  /**
   * Update user's consciousness preferences
   */
  async updatePreferences(userId: string, updates: Partial<UserConsciousnessProfile>): Promise<void> {
    consciousnessProfileStorage.updatePreferences(userId, updates);
  }

  /**
   * Fetch stored user preferences
   */
  private async fetchStoredPreferences(userId: string): Promise<Partial<UserConsciousnessProfile> | null> {
    return consciousnessProfileStorage.getProfile(userId);
  }
}
