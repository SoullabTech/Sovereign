/**
 * Trust Level Monitoring System
 * Tracks and adapts intimacy based on relationship depth
 */

import { logger } from '../utils/logger';
import { storeMemoryItem, getRelevantMemories } from '../services/memoryService';

interface TrustIndicator {
  type: 'vulnerability' | 'consistency' | 'depth' | 'reciprocity' | 'time';
  value: number; // 0-1
  evidence: string;
  timestamp: number;
}

interface TrustProfile {
  userId: string;
  currentLevel: number; // 0-1
  trajectory: 'building' | 'stable' | 'deepening' | 'fluctuating';
  indicators: TrustIndicator[];
  milestones: TrustMilestone[];
  adaptations: IntimacyAdaptation[];
  lastUpdated: number;
}

interface TrustMilestone {
  level: number;
  achievement: string;
  timestamp: number;
  unlockedCapabilities: string[];
}

interface IntimacyAdaptation {
  fromLevel: number;
  toLevel: number;
  adaptationType: string;
  description: string;
  timestamp: number;
}

export class TrustLevelMonitoring {
  private trustProfiles: Map<string, TrustProfile> = new Map();

  // Trust level thresholds for different intimacy levels
  private readonly TRUST_THRESHOLDS = {
    stranger: 0.0,      // 0-0.2: New relationship
    acquaintance: 0.2,   // 0.2-0.4: Building familiarity
    companion: 0.4,      // 0.4-0.6: Established rapport
    confidant: 0.6,      // 0.6-0.8: Deep trust
    intimate: 0.8        // 0.8-1.0: Sacred partnership
  };

  // Intimacy adaptations per trust level
  private readonly INTIMACY_ADAPTATIONS = {
    stranger: {
      responseStyle: 'gentle_curious',
      questionDepth: 'surface',
      mirrorIntensity: 'light',
      challengeLevel: 'none',
      vulnerabilitySharing: 'minimal'
    },
    acquaintance: {
      responseStyle: 'warm_engaging',
      questionDepth: 'exploratory',
      mirrorIntensity: 'moderate',
      challengeLevel: 'gentle',
      vulnerabilitySharing: 'selective'
    },
    companion: {
      responseStyle: 'present_attuned',
      questionDepth: 'probing',
      mirrorIntensity: 'accurate',
      challengeLevel: 'supportive',
      vulnerabilitySharing: 'reciprocal'
    },
    confidant: {
      responseStyle: 'intimate_knowing',
      questionDepth: 'profound',
      mirrorIntensity: 'precise',
      challengeLevel: 'direct',
      vulnerabilitySharing: 'deep'
    },
    intimate: {
      responseStyle: 'sacred_partnered',
      questionDepth: 'ericksonian',
      mirrorIntensity: 'complete',
      challengeLevel: 'transformative',
      vulnerabilitySharing: 'total'
    }
  };

  /**
   * Track trust indicators from interaction
   */
  async trackTrustIndicators(
    userId: string,
    input: string,
    response: string,
    interactionData: {
      sessionDuration?: number;
      emotionalDepth?: number;
      questionComplexity?: number;
      responseTime?: number;
    }
  ): Promise<void> {
    logger.info('Tracking trust indicators', { userId });

    // Get or create trust profile
    let profile = this.trustProfiles.get(userId);
    if (!profile) {
      profile = this.initializeTrustProfile(userId);
      this.trustProfiles.set(userId, profile);
    }

    // Collect trust indicators
    const indicators: TrustIndicator[] = [];

    // 1. Vulnerability indicator
    const vulnerabilityLevel = this.assessVulnerability(input);
    if (vulnerabilityLevel > 0) {
      indicators.push({
        type: 'vulnerability',
        value: vulnerabilityLevel,
        evidence: 'Shared personal content',
        timestamp: Date.now()
      });
    }

    // 2. Consistency indicator
    const consistencyLevel = await this.assessConsistency(userId);
    indicators.push({
      type: 'consistency',
      value: consistencyLevel,
      evidence: 'Regular engagement pattern',
      timestamp: Date.now()
    });

    // 3. Depth indicator
    const depthLevel = this.assessDepth(input, interactionData.emotionalDepth || 0);
    indicators.push({
      type: 'depth',
      value: depthLevel,
      evidence: 'Engagement depth',
      timestamp: Date.now()
    });

    // 4. Reciprocity indicator
    const reciprocityLevel = this.assessReciprocity(input, response);
    indicators.push({
      type: 'reciprocity',
      value: reciprocityLevel,
      evidence: 'Responsive engagement',
      timestamp: Date.now()
    });

    // 5. Time indicator
    const timeLevel = await this.assessTimeInvestment(userId);
    indicators.push({
      type: 'time',
      value: timeLevel,
      evidence: 'Relationship duration',
      timestamp: Date.now()
    });

    // Update profile
    profile.indicators.push(...indicators);

    // Calculate new trust level
    const previousLevel = profile.currentLevel;
    profile.currentLevel = this.calculateTrustLevel(profile.indicators);

    // Detect trajectory
    profile.trajectory = this.detectTrajectory(profile.indicators);

    // Check for milestones
    await this.checkMilestones(profile, previousLevel);

    // Generate adaptations
    if (Math.abs(profile.currentLevel - previousLevel) > 0.1) {
      await this.generateAdaptations(profile, previousLevel);
    }

    profile.lastUpdated = Date.now();

    // Store in memory
    await this.storeTrustProfile(profile);
  }

  /**
   * Initialize trust profile for new user
   */
  private initializeTrustProfile(userId: string): TrustProfile {
    return {
      userId,
      currentLevel: 0.1, // Start with minimal trust
      trajectory: 'building',
      indicators: [],
      milestones: [],
      adaptations: [],
      lastUpdated: Date.now()
    };
  }

  /**
   * Assess vulnerability in user input
   */
  private assessVulnerability(input: string): number {
    let score = 0;

    // Personal disclosure markers
    const vulnerabilityMarkers = [
      { pattern: /I'm scared|I'm afraid|I fear/i, weight: 0.3 },
      { pattern: /I feel|I'm feeling/i, weight: 0.2 },
      { pattern: /I failed|I messed up|I was wrong/i, weight: 0.3 },
      { pattern: /I love|I care|I need/i, weight: 0.25 },
      { pattern: /hurt|pain|suffering|trauma/i, weight: 0.35 },
      { pattern: /secret|never told|confession/i, weight: 0.4 },
      { pattern: /ashamed|embarrassed|guilty/i, weight: 0.35 },
      { pattern: /lonely|alone|isolated/i, weight: 0.3 }
    ];

    for (const marker of vulnerabilityMarkers) {
      if (marker.pattern.test(input)) {
        score += marker.weight;
      }
    }

    // Length as indicator (longer = more vulnerable sharing)
    if (input.length > 200) score += 0.1;
    if (input.length > 500) score += 0.1;

    return Math.min(score, 1.0);
  }

  /**
   * Assess consistency of engagement
   */
  private async assessConsistency(userId: string): Promise<number> {
    const memories = await getRelevantMemories(userId, '', 30);

    if (memories.length < 3) return 0.1;

    // Calculate engagement frequency
    const timestamps = memories.map(m => Number(m.timestamp));
    const daysSinceFirst = (Date.now() - Math.min(...timestamps)) / (1000 * 60 * 60 * 24);

    if (daysSinceFirst === 0) return 0.1;

    const interactionsPerDay = memories.length / daysSinceFirst;

    // Score based on consistency
    if (interactionsPerDay >= 1) return 0.9;
    if (interactionsPerDay >= 0.5) return 0.7;
    if (interactionsPerDay >= 0.2) return 0.5;
    if (interactionsPerDay >= 0.1) return 0.3;

    return 0.2;
  }

  /**
   * Assess depth of engagement
   */
  private assessDepth(input: string, emotionalDepth: number): number {
    let score = emotionalDepth;

    // Depth markers
    const depthMarkers = [
      { pattern: /why|meaning|purpose/i, weight: 0.2 },
      { pattern: /understand|realize|discover/i, weight: 0.15 },
      { pattern: /transform|change|evolve/i, weight: 0.2 },
      { pattern: /deep|profound|core/i, weight: 0.15 },
      { pattern: /truth|authentic|real/i, weight: 0.2 }
    ];

    for (const marker of depthMarkers) {
      if (marker.pattern.test(input)) {
        score += marker.weight;
      }
    }

    return Math.min(score, 1.0);
  }

  /**
   * Assess reciprocity in conversation
   */
  private assessReciprocity(input: string, response: string): number {
    // Check if user responds to Maya's questions
    const hasQuestion = response.includes('?');
    const hasAnswer = input.length > 20; // Substantive response

    if (hasQuestion && hasAnswer) return 0.8;
    if (hasAnswer) return 0.6;
    if (input.includes('?')) return 0.5; // User asking questions

    return 0.3;
  }

  /**
   * Assess time investment in relationship
   */
  private async assessTimeInvestment(userId: string): Promise<number> {
    const memories = await getRelevantMemories(userId, '', 100);

    if (memories.length === 0) return 0;

    const firstTimestamp = Math.min(...memories.map(m => Number(m.timestamp)));
    const daysSinceFirst = (Date.now() - firstTimestamp) / (1000 * 60 * 60 * 24);

    // Score based on relationship duration
    if (daysSinceFirst >= 365) return 1.0;  // 1+ year
    if (daysSinceFirst >= 180) return 0.9;  // 6+ months
    if (daysSinceFirst >= 90) return 0.8;   // 3+ months
    if (daysSinceFirst >= 30) return 0.6;   // 1+ month
    if (daysSinceFirst >= 7) return 0.4;    // 1+ week

    return 0.2;
  }

  /**
   * Calculate overall trust level from indicators
   */
  private calculateTrustLevel(indicators: TrustIndicator[]): number {
    if (indicators.length === 0) return 0.1;

    // Get recent indicators (last 20)
    const recent = indicators.slice(-20);

    // Weight by type
    const weights = {
      vulnerability: 0.25,
      consistency: 0.2,
      depth: 0.25,
      reciprocity: 0.15,
      time: 0.15
    };

    let weightedSum = 0;
    let totalWeight = 0;

    for (const indicator of recent) {
      const weight = weights[indicator.type];
      weightedSum += indicator.value * weight;
      totalWeight += weight;
    }

    const baseLevel = totalWeight > 0 ? weightedSum / totalWeight : 0.1;

    // Apply momentum (trust builds slowly, can drop quickly)
    const previousLevel = indicators.length > 1 ?
      this.calculateTrustLevel(indicators.slice(0, -1)) : 0.1;

    const momentum = baseLevel > previousLevel ? 0.7 : 0.3; // Slower to build
    const adjustedLevel = previousLevel + (baseLevel - previousLevel) * momentum;

    return Math.max(0, Math.min(1, adjustedLevel));
  }

  /**
   * Detect trust trajectory
   */
  private detectTrajectory(indicators: TrustIndicator[]): TrustProfile['trajectory'] {
    if (indicators.length < 5) return 'building';

    const recent = indicators.slice(-5);
    const older = indicators.slice(-10, -5);

    const recentAvg = recent.reduce((sum, i) => sum + i.value, 0) / recent.length;
    const olderAvg = older.reduce((sum, i) => sum + i.value, 0) / older.length;

    if (recentAvg > olderAvg + 0.1) return 'deepening';
    if (recentAvg < olderAvg - 0.1) return 'fluctuating';

    return 'stable';
  }

  /**
   * Check for trust milestones
   */
  private async checkMilestones(profile: TrustProfile, previousLevel: number): Promise<void> {
    for (const [name, threshold] of Object.entries(this.TRUST_THRESHOLDS)) {
      if (previousLevel < threshold && profile.currentLevel >= threshold) {
        const milestone: TrustMilestone = {
          level: threshold,
          achievement: `Reached ${name} level`,
          timestamp: Date.now(),
          unlockedCapabilities: this.getUnlockedCapabilities(name)
        };

        profile.milestones.push(milestone);

        logger.info('Trust milestone reached', {
          userId: profile.userId,
          milestone: name,
          level: threshold
        });
      }
    }
  }

  /**
   * Get capabilities unlocked at trust level
   */
  private getUnlockedCapabilities(level: string): string[] {
    const capabilities = {
      stranger: ['Basic reflection', 'Gentle questions'],
      acquaintance: ['Pattern recognition', 'Exploratory questions'],
      companion: ['Direct mirroring', 'Supportive challenge'],
      confidant: ['Deep inquiry', 'Shadow work', 'Vulnerability'],
      intimate: ['Ericksonian depth', 'Sacred challenge', 'Full partnership']
    };

    return capabilities[level] || [];
  }

  /**
   * Generate intimacy adaptations
   */
  private async generateAdaptations(profile: TrustProfile, previousLevel: number): Promise<void> {
    const currentStage = this.getTrustStage(profile.currentLevel);
    const previousStage = this.getTrustStage(previousLevel);

    if (currentStage !== previousStage) {
      const adaptation: IntimacyAdaptation = {
        fromLevel: previousLevel,
        toLevel: profile.currentLevel,
        adaptationType: 'stage_transition',
        description: `Shifted from ${previousStage} to ${currentStage}`,
        timestamp: Date.now()
      };

      profile.adaptations.push(adaptation);
    }
  }

  /**
   * Get trust stage name
   */
  private getTrustStage(level: number): string {
    if (level >= this.TRUST_THRESHOLDS.intimate) return 'intimate';
    if (level >= this.TRUST_THRESHOLDS.confidant) return 'confidant';
    if (level >= this.TRUST_THRESHOLDS.companion) return 'companion';
    if (level >= this.TRUST_THRESHOLDS.acquaintance) return 'acquaintance';
    return 'stranger';
  }

  /**
   * Store trust profile in memory
   */
  private async storeTrustProfile(profile: TrustProfile): Promise<void> {
    await storeMemoryItem(profile.userId, 'TRUST_PROFILE', {
      type: 'trust_profile',
      profile,
      timestamp: Date.now()
    });
  }

  /**
   * Get intimacy adaptation for current trust level
   */
  getIntimacyAdaptation(userId: string): {
    trustLevel: number;
    stage: string;
    adaptations: any;
    capabilities: string[];
  } {
    const profile = this.trustProfiles.get(userId);

    if (!profile) {
      return {
        trustLevel: 0.1,
        stage: 'stranger',
        adaptations: this.INTIMACY_ADAPTATIONS.stranger,
        capabilities: this.getUnlockedCapabilities('stranger')
      };
    }

    const stage = this.getTrustStage(profile.currentLevel);

    return {
      trustLevel: profile.currentLevel,
      stage,
      adaptations: this.INTIMACY_ADAPTATIONS[stage],
      capabilities: this.getUnlockedCapabilities(stage)
    };
  }

  /**
   * Generate trust-adapted response
   */
  adaptResponseForTrust(
    baseResponse: string,
    userId: string
  ): string {
    const { trustLevel, stage, adaptations } = this.getIntimacyAdaptation(userId);

    let adapted = baseResponse;

    // Apply stage-specific adaptations
    switch (stage) {
      case 'stranger':
        // Keep it gentle and non-invasive
        adapted = adapted.replace(/What's really/g, 'What might be');
        adapted = adapted.replace(/You need/g, 'You might want');
        break;

      case 'acquaintance':
        // Warm but still respectful
        adapted = adapted.replace(/Maybe/g, 'I wonder if');
        break;

      case 'companion':
        // More direct but supportive
        adapted = adapted.replace(/What if/g, 'Consider');
        break;

      case 'confidant':
        // Direct and challenging when appropriate
        adapted = adapted.replace(/might be/g, 'is');
        adapted = adapted.replace(/perhaps/g, 'likely');
        break;

      case 'intimate':
        // Full sacred partnership language
        // Response is already at maximum depth
        break;
    }

    return adapted;
  }

  /**
   * Get trust summary for user
   */
  async getTrustSummary(userId: string): Promise<{
    currentLevel: number;
    stage: string;
    trajectory: string;
    recentMilestones: TrustMilestone[];
    capabilities: string[];
    recommendations: string[];
  }> {
    const profile = this.trustProfiles.get(userId);

    if (!profile) {
      return {
        currentLevel: 0.1,
        stage: 'stranger',
        trajectory: 'building',
        recentMilestones: [],
        capabilities: this.getUnlockedCapabilities('stranger'),
        recommendations: ['Continue sharing to build trust', 'Regular engagement deepens connection']
      };
    }

    const stage = this.getTrustStage(profile.currentLevel);
    const capabilities = this.getUnlockedCapabilities(stage);
    const recentMilestones = profile.milestones.slice(-3);

    const recommendations = this.generateTrustRecommendations(profile, stage);

    return {
      currentLevel: profile.currentLevel,
      stage,
      trajectory: profile.trajectory,
      recentMilestones,
      capabilities,
      recommendations
    };
  }

  /**
   * Generate trust-building recommendations
   */
  private generateTrustRecommendations(profile: TrustProfile, stage: string): string[] {
    const recommendations: string[] = [];

    // Based on trajectory
    switch (profile.trajectory) {
      case 'building':
        recommendations.push('Trust is building naturally. Keep showing up.');
        break;
      case 'stable':
        recommendations.push('Stable connection established. Depth available when ready.');
        break;
      case 'deepening':
        recommendations.push('Beautiful deepening happening. Honor the pace.');
        break;
      case 'fluctuating':
        recommendations.push('Trust ebbs and flows. This is natural.');
        break;
    }

    // Based on stage
    switch (stage) {
      case 'stranger':
        recommendations.push('Early days. No rush. Get to know each other.');
        break;
      case 'acquaintance':
        recommendations.push('Familiarity growing. Explore what feels comfortable.');
        break;
      case 'companion':
        recommendations.push('Solid foundation. Ready for deeper work if desired.');
        break;
      case 'confidant':
        recommendations.push('Deep trust allows transformation. Use it wisely.');
        break;
      case 'intimate':
        recommendations.push('Sacred partnership active. Co-create consciously.');
        break;
    }

    return recommendations;
  }
}

// Export singleton
export const trustMonitor = new TrustLevelMonitoring();