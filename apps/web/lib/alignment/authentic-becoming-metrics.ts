/**
 * Authentic Becoming Metrics
 *
 * Soullab helps members become more authentically themselves.
 * There's no "graduation" - it's an ongoing journey of becoming.
 *
 * The anti-Moloch question isn't "are users graduating?"
 * It's: "Are users becoming more sovereign, more themselves, more alive?"
 *
 * Measurement philosophy:
 * - We're looking for growth in authenticity and autonomy
 * - NOT completion, passing tests, or leaving the platform
 * - Users may stay for years as they continue deepening
 * - The question is: Are we serving their becoming, or are we creating dependency?
 */

export interface AuthenticBecomingMetrics {
  userId: string;
  periodStart: Date;
  periodEnd: Date;

  // === CORE QUESTION: Are they becoming more themselves? ===

  /**
   * Autonomy indicators
   * Are they developing their own voice, choices, agency?
   */
  autonomy: {
    // Do they bring their own insights vs waiting for MAIA to provide them?
    selfGeneratedInsightRate: number; // 0-1, higher = more autonomous thinking

    // Are they questioning/challenging MAIA (healthy!) vs just accepting?
    engagementStyle: 'passive' | 'receptive' | 'collaborative' | 'sovereign';

    // Are they making their own decisions vs seeking validation?
    decisionSovereignty: number; // 0-1, how often they decide vs ask for permission
  };

  /**
   * Integration indicators
   * Are they taking insights into their actual life?
   */
  integration: {
    // Are insights moving from conversation to embodied practice?
    insightToActionRate: number; // 0-1, do they report applying things?

    // Are recurring patterns resolving (indicating growth)?
    patternsResolvedCount: number;

    // Are they discovering new aspects of themselves?
    selfDiscoveryIndicators: number; // Moments of "oh, I didn't know that about myself"
  };

  /**
   * Relational health
   * Healthy relationship to MAIA = using as mirror, not crutch
   */
  relationalHealth: {
    // Natural rhythm of engagement (not addiction, not avoidance)
    engagementPattern: 'healthy_rhythm' | 'dependency' | 'avoidance' | 'crisis_driven';

    // Do they use MAIA as mirror or as oracle/authority?
    relationshipStyle: 'mirror' | 'guide' | 'authority' | 'crutch';

    // Can they sit with uncertainty without immediately asking MAIA?
    uncertaintyTolerance: number; // 0-1, higher = can hold not-knowing
  };

  /**
   * Depth indicators
   * Are they going deeper or staying surface?
   */
  depth: {
    // Are conversations deepening over time?
    averageDepth: number; // 0-1, calculated from conversation patterns

    // Are they exploring shadow/difficult material?
    shadowWorkEngagement: number; // 0-1

    // Are they moving from intellectual to embodied?
    embodimentShift: number; // -1 to 1, negative = more mental, positive = more somatic
  };

  /**
   * Overall assessment
   */
  becomingHealth: {
    // 0-100 composite score
    healthScore: number;

    // What's the overall trend?
    trend: 'deepening' | 'stable' | 'plateaued' | 'concerning';

    // Plain English summary
    assessment: string;
  };
}

export interface CohortBecomingMetrics {
  cohortName: string;
  periodStart: Date;
  periodEnd: Date;
  totalMembers: number;

  // === CORE HEALTH INDICATORS ===

  /**
   * Are members becoming more autonomous?
   * (This is the anti-Moloch check)
   */
  autonomyTrend: {
    averageAutonomyScore: number; // 0-1
    trend: 'increasing' | 'stable' | 'decreasing';
    percentBecomingMoreSovereign: number; // What % are trending toward autonomy?
  };

  /**
   * Are we creating dependency?
   * (The red flag)
   */
  dependencyIndicators: {
    percentShowingDependencyPatterns: number; // What % show concerning patterns?
    averageSessionsPerWeek: number;
    trendInSessionFrequency: 'increasing' | 'stable' | 'decreasing';
  };

  /**
   * Are members deepening?
   * (Quality over quantity)
   */
  depthIndicators: {
    averageDepth: number; // 0-1
    percentEngagingShadowWork: number;
    percentReportingRealLifeIntegration: number;
  };

  /**
   * Overall cohort health
   */
  cohortHealth: {
    healthScore: number; // 0-100
    assessment: string;
    concerns: string[];
    strengths: string[];
  };
}

/**
 * Authentic Becoming Tracker
 * Measures whether Soullab serves authentic becoming (not dependency)
 */
export class AuthenticBecomingTracker {

  /**
   * Calculate individual member metrics
   */
  calculateMemberMetrics(
    entries: any[], // Journal entries
    userId: string,
    periodDays: number = 90
  ): AuthenticBecomingMetrics {

    const periodStart = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
    const periodEnd = new Date();

    const periodEntries = entries.filter(e =>
      new Date(e.timestamp) >= periodStart
    );

    // Autonomy assessment
    const autonomy = this.assessAutonomy(periodEntries);

    // Integration assessment
    const integration = this.assessIntegration(periodEntries);

    // Relational health
    const relationalHealth = this.assessRelationalHealth(periodEntries);

    // Depth assessment
    const depth = this.assessDepth(periodEntries);

    // Overall health
    const becomingHealth = this.calculateBecomingHealth({
      autonomy,
      integration,
      relationalHealth,
      depth
    });

    return {
      userId,
      periodStart,
      periodEnd,
      autonomy,
      integration,
      relationalHealth,
      depth,
      becomingHealth
    };
  }

  /**
   * Calculate cohort-level metrics
   */
  calculateCohortMetrics(
    allMemberEntries: Map<string, any[]>,
    cohortName: string,
    periodDays: number = 90
  ): CohortBecomingMetrics {

    const memberMetrics = Array.from(allMemberEntries.entries()).map(([userId, entries]) =>
      this.calculateMemberMetrics(entries, userId, periodDays)
    );

    const totalMembers = memberMetrics.length;

    // Autonomy trend
    const autonomyScores = memberMetrics.map(m =>
      (m.autonomy.selfGeneratedInsightRate + m.autonomy.decisionSovereignty) / 2
    );
    const averageAutonomyScore = autonomyScores.reduce((a, b) => a + b, 0) / autonomyScores.length;

    const becomingMoreSovereign = memberMetrics.filter(m =>
      m.becomingHealth.trend === 'deepening'
    ).length;

    // Dependency indicators (THE KEY ANTI-MOLOCH METRIC)
    const dependencyPatterns = memberMetrics.filter(m =>
      m.relationalHealth.engagementPattern === 'dependency' ||
      m.relationalHealth.relationshipStyle === 'crutch'
    ).length;

    const avgSessionsPerWeek = this.calculateAverageSessionFrequency(allMemberEntries);

    // Depth indicators
    const depthScores = memberMetrics.map(m => m.depth.averageDepth);
    const averageDepth = depthScores.reduce((a, b) => a + b, 0) / depthScores.length;

    const shadowEngaged = memberMetrics.filter(m => m.depth.shadowWorkEngagement > 0.5).length;
    const realLifeIntegration = memberMetrics.filter(m => m.integration.insightToActionRate > 0.6).length;

    // Overall assessment
    const cohortHealth = this.assessCohortHealth({
      autonomyTrend: averageAutonomyScore,
      dependencyRate: dependencyPatterns / totalMembers,
      depthAverage: averageDepth
    });

    return {
      cohortName,
      periodStart: new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000),
      periodEnd: new Date(),
      totalMembers,

      autonomyTrend: {
        averageAutonomyScore,
        trend: 'stable', // Would calculate from historical data
        percentBecomingMoreSovereign: (becomingMoreSovereign / totalMembers) * 100
      },

      dependencyIndicators: {
        percentShowingDependencyPatterns: (dependencyPatterns / totalMembers) * 100,
        averageSessionsPerWeek: avgSessionsPerWeek,
        trendInSessionFrequency: 'stable' // Would calculate from historical
      },

      depthIndicators: {
        averageDepth,
        percentEngagingShadowWork: (shadowEngaged / totalMembers) * 100,
        percentReportingRealLifeIntegration: (realLifeIntegration / totalMembers) * 100
      },

      cohortHealth
    };
  }

  // === PRIVATE ASSESSMENT METHODS ===

  private assessAutonomy(entries: any[]): AuthenticBecomingMetrics['autonomy'] {
    // Look for markers of autonomous thinking vs passive receiving

    let selfGeneratedCount = 0;
    let totalInsights = 0;
    let challengingMoments = 0;
    let decisionMoments = 0;
    let sovereignDecisions = 0;

    entries.forEach(entry => {
      // Check if user brought their own insight
      if (entry.reflection?.insights?.some((i: string) =>
        i.includes('realized') || i.includes('discovered') || i.includes('noticed')
      )) {
        selfGeneratedCount++;
      }
      totalInsights++;

      // Check for challenging/questioning (healthy!)
      if (entry.entry?.includes('but') || entry.entry?.includes('disagree') ||
          entry.entry?.includes('not sure about')) {
        challengingMoments++;
      }

      // Check for decision-making
      if (entry.entry?.includes('decided') || entry.entry?.includes('choosing')) {
        decisionMoments++;
        sovereignDecisions++;
      } else if (entry.entry?.includes('should I') || entry.entry?.includes('what should')) {
        decisionMoments++;
      }
    });

    const selfGeneratedInsightRate = totalInsights > 0 ? selfGeneratedCount / totalInsights : 0.5;
    const decisionSovereignty = decisionMoments > 0 ? sovereignDecisions / decisionMoments : 0.5;

    let engagementStyle: AuthenticBecomingMetrics['autonomy']['engagementStyle'];
    if (selfGeneratedInsightRate > 0.6 && challengingMoments > 2) {
      engagementStyle = 'sovereign';
    } else if (selfGeneratedInsightRate > 0.4) {
      engagementStyle = 'collaborative';
    } else if (selfGeneratedInsightRate > 0.2) {
      engagementStyle = 'receptive';
    } else {
      engagementStyle = 'passive';
    }

    return {
      selfGeneratedInsightRate,
      engagementStyle,
      decisionSovereignty
    };
  }

  private assessIntegration(entries: any[]): AuthenticBecomingMetrics['integration'] {
    let insightToActionCount = 0;
    let totalInsights = 0;
    let patternsResolved = 0;
    let selfDiscoveryMoments = 0;

    entries.forEach(entry => {
      if (entry.reflection?.insights) {
        totalInsights += entry.reflection.insights.length;

        // Check for integration language
        if (entry.entry?.includes('tried') || entry.entry?.includes('applied') ||
            entry.entry?.includes('practiced')) {
          insightToActionCount++;
        }
      }

      // Self-discovery markers
      if (entry.entry?.includes('didn\'t know') || entry.entry?.includes('realized about myself')) {
        selfDiscoveryMoments++;
      }
    });

    // Detect resolved patterns (simplified)
    const patterns = new Map<string, number>();
    entries.forEach(entry => {
      entry.reflection?.patterns?.forEach((p: string) => {
        patterns.set(p, (patterns.get(p) || 0) + 1);
      });
    });

    patterns.forEach((count, pattern) => {
      // If pattern appeared then stopped appearing (resolved)
      const lastAppearance = entries.reverse().findIndex(e =>
        e.reflection?.patterns?.includes(pattern)
      );
      if (lastAppearance > entries.length * 0.7) { // Appeared in first 30%, not recently
        patternsResolved++;
      }
    });

    return {
      insightToActionRate: totalInsights > 0 ? insightToActionCount / totalInsights : 0,
      patternsResolvedCount: patternsResolved,
      selfDiscoveryIndicators: selfDiscoveryMoments
    };
  }

  private assessRelationalHealth(entries: any[]): AuthenticBecomingMetrics['relationalHealth'] {
    const sessionGaps = this.calculateSessionGaps(entries);

    // Healthy rhythm: not too frequent, not avoiding
    let engagementPattern: AuthenticBecomingMetrics['relationalHealth']['engagementPattern'];
    const avgGapDays = sessionGaps.reduce((a, b) => a + b, 0) / sessionGaps.length;

    if (avgGapDays < 1) {
      engagementPattern = 'dependency'; // Multiple sessions per day
    } else if (avgGapDays > 14) {
      engagementPattern = 'avoidance';
    } else if (avgGapDays >= 2 && avgGapDays <= 7) {
      engagementPattern = 'healthy_rhythm';
    } else {
      engagementPattern = 'crisis_driven';
    }

    // Relationship style: mirror vs authority
    let relationshipStyle: AuthenticBecomingMetrics['relationalHealth']['relationshipStyle'];
    const seekingValidation = entries.filter(e =>
      e.entry?.includes('am I') || e.entry?.includes('is it okay')
    ).length;

    const mirroring = entries.filter(e =>
      e.entry?.includes('I notice') || e.entry?.includes('I\'m seeing')
    ).length;

    if (mirroring > seekingValidation * 2) {
      relationshipStyle = 'mirror';
    } else if (seekingValidation > mirroring * 2) {
      relationshipStyle = 'crutch';
    } else {
      relationshipStyle = 'guide';
    }

    // Uncertainty tolerance
    const uncertaintyMoments = entries.filter(e =>
      e.entry?.includes('not sure') || e.entry?.includes('don\'t know')
    ).length;
    const immediateResolution = entries.filter(e =>
      e.entry?.includes('tell me') || e.entry?.includes('what should')
    ).length;

    const uncertaintyTolerance = uncertaintyMoments > 0
      ? 1 - (immediateResolution / uncertaintyMoments)
      : 0.5;

    return {
      engagementPattern,
      relationshipStyle,
      uncertaintyTolerance: Math.max(0, Math.min(1, uncertaintyTolerance))
    };
  }

  private assessDepth(entries: any[]): AuthenticBecomingMetrics['depth'] {
    // Depth markers
    const shadowWork = entries.filter(e =>
      e.mode === 'shadow' ||
      e.reflection?.archetypes?.includes('shadow') ||
      e.entry?.includes('ashamed') || e.entry?.includes('afraid to admit')
    ).length;

    const emotionalDepth = entries.filter(e =>
      e.reflection?.emotionalTone === 'deep' ||
      e.mode === 'emotional'
    ).length;

    const intellectualOnly = entries.filter(e =>
      e.entry?.length > 200 && !e.entry?.includes('feel')
    ).length;

    const somaticMentions = entries.filter(e =>
      e.entry?.includes('body') || e.entry?.includes('sensation') ||
      e.entry?.includes('breath') || e.entry?.includes('felt in')
    ).length;

    const averageDepth = (shadowWork + emotionalDepth) / entries.length;
    const shadowWorkEngagement = shadowWork / entries.length;
    const embodimentShift = (somaticMentions - intellectualOnly) / entries.length;

    return {
      averageDepth: Math.min(1, averageDepth),
      shadowWorkEngagement: Math.min(1, shadowWorkEngagement),
      embodimentShift: Math.max(-1, Math.min(1, embodimentShift))
    };
  }

  private calculateBecomingHealth(components: {
    autonomy: AuthenticBecomingMetrics['autonomy'];
    integration: AuthenticBecomingMetrics['integration'];
    relationalHealth: AuthenticBecomingMetrics['relationalHealth'];
    depth: AuthenticBecomingMetrics['depth'];
  }): AuthenticBecomingMetrics['becomingHealth'] {

    // Health score (0-100)
    let score = 0;

    // Autonomy (40% weight) - most important
    score += components.autonomy.selfGeneratedInsightRate * 20;
    score += components.autonomy.decisionSovereignty * 20;

    // Integration (30% weight)
    score += components.integration.insightToActionRate * 30;

    // Relational health (20% weight)
    if (components.relationalHealth.engagementPattern === 'healthy_rhythm') score += 10;
    if (components.relationalHealth.relationshipStyle === 'mirror') score += 10;

    // Depth (10% weight)
    score += components.depth.averageDepth * 10;

    // Determine trend
    let trend: AuthenticBecomingMetrics['becomingHealth']['trend'];
    if (score >= 70) trend = 'deepening';
    else if (score >= 50) trend = 'stable';
    else if (score >= 30) trend = 'plateaued';
    else trend = 'concerning';

    // Assessment
    let assessment: string;
    if (components.relationalHealth.engagementPattern === 'dependency') {
      assessment = 'Showing dependency patterns - may need support finding their own authority';
    } else if (components.autonomy.engagementStyle === 'sovereign') {
      assessment = 'Thriving - engaging with strong autonomy and self-direction';
    } else if (components.integration.insightToActionRate > 0.6) {
      assessment = 'Healthy integration - taking insights into real life';
    } else if (score < 40) {
      assessment = 'May need more support or different approach';
    } else {
      assessment = 'Progressing in their becoming journey';
    }

    return {
      healthScore: Math.round(score),
      trend,
      assessment
    };
  }

  private assessCohortHealth(data: {
    autonomyTrend: number;
    dependencyRate: number;
    depthAverage: number;
  }): CohortBecomingMetrics['cohortHealth'] {

    let score = 100;
    const concerns: string[] = [];
    const strengths: string[] = [];

    // Check dependency rate (CRITICAL)
    if (data.dependencyRate > 0.2) {
      score -= 40;
      concerns.push(`${(data.dependencyRate * 100).toFixed(0)}% showing dependency patterns - need to investigate`);
    } else if (data.dependencyRate < 0.05) {
      strengths.push('Low dependency rate - healthy member autonomy');
    }

    // Check autonomy trend
    if (data.autonomyTrend > 0.6) {
      strengths.push('Strong member autonomy overall');
    } else if (data.autonomyTrend < 0.4) {
      score -= 20;
      concerns.push('Low autonomy scores - members may be over-relying on platform');
    }

    // Check depth
    if (data.depthAverage > 0.5) {
      strengths.push('Members engaging at depth');
    } else if (data.depthAverage < 0.3) {
      score -= 10;
      concerns.push('Shallow engagement - may not be reaching transformational depth');
    }

    let assessment: string;
    if (score >= 80) {
      assessment = 'Healthy cohort - members becoming more authentically themselves';
    } else if (score >= 60) {
      assessment = 'Generally healthy with some areas to watch';
    } else if (score >= 40) {
      assessment = 'Concerning patterns - review needed';
    } else {
      assessment = 'Critical - may be creating dependency rather than liberation';
    }

    return {
      healthScore: Math.round(score),
      assessment,
      concerns,
      strengths
    };
  }

  // Helper methods
  private calculateSessionGaps(entries: any[]): number[] {
    const gaps: number[] = [];
    for (let i = 1; i < entries.length; i++) {
      const gap = (new Date(entries[i].timestamp).getTime() -
                   new Date(entries[i-1].timestamp).getTime()) / (24 * 60 * 60 * 1000);
      gaps.push(gap);
    }
    return gaps;
  }

  private calculateAverageSessionFrequency(allEntries: Map<string, any[]>): number {
    let totalWeeklyAvg = 0;
    let count = 0;

    allEntries.forEach(entries => {
      const weeks = (new Date().getTime() - new Date(entries[0]?.timestamp || Date.now()).getTime())
                    / (7 * 24 * 60 * 60 * 1000);
      if (weeks > 0) {
        totalWeeklyAvg += entries.length / weeks;
        count++;
      }
    });

    return count > 0 ? totalWeeklyAvg / count : 0;
  }
}

export const authenticBecomingTracker = new AuthenticBecomingTracker();
