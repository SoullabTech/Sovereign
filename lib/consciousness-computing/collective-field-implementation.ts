/**
 * Collective Archetypal Field Implementation
 * "Reading the community's psyche, not just the individual's"
 */

import type { ConsciousnessMatrixV3 } from './archetypal-dynamics-implementation';

export interface DailyFieldData {
  date: string;
  totalInteractions: number;

  // Collective Matrix Aggregation
  collectiveMatrix: {
    averageCapacity: 'expansive' | 'stable' | 'limited' | 'crisis';
    dominantBodyState: 'calm' | 'tense' | 'collapsed';
    collectiveAffect: 'peaceful' | 'turbulent' | 'crisis';
    realityContactSpread: {
      grounded: number;
      loosening: number;
      fraying: number;
    };
    windowOfToleranceDistribution: {
      within: number;
      hyperarousal: number;
      hypoarousal: number;
    };
  };

  // Archetypal Field Patterns
  archetypalField: {
    dominantArchetype: string;
    secondaryArchetype: string;
    hiddenArchetype: string;
    movementTrend: 'regressing' | 'cycling' | 'evolving';
    tensionPoints: string[];
  };

  // Spiralogic Community Map
  spiralogicField: {
    dominantElement: 'fire' | 'water' | 'earth' | 'air' | 'aether';
    secondaryElement: string;
    facetDistribution: {
      bonding: number;
      balancing: number;
      becoming: number;
    };
    spiralDirection: 'ascending' | 'descending' | 'stabilizing';
  };

  // Field Indicators
  fieldIndicators: {
    collectiveElementBalance: number; // 0-1, how balanced across elements
    averageMatrixCapacity: number;   // 0-1, community resilience
    archetypalCoherence: number;     // 0-1, how aligned stories are with states
    spiritualReadiness: number;      // 0-1, capacity for deeper work
    communityBondStrength: number;   // 0-1, relational field health
  };
}

export interface WeeklyFieldReport {
  weekOf: string;

  // Field Weather Summary
  fieldWeather: {
    overallTrend: string;
    dominantTheme: string;
    emergentPatterns: string[];
    collectiveGrowthEdge: string;
  };

  // Ritual Recommendations
  ritualGuidance: {
    recommendedPractices: string[];
    elementalFocus: string;
    communityNeeds: string[];
    timingConsiderations: string;
  };

  // Navigator Tuning
  navigatorTuning: {
    emphasisAdjustments: string[];
    responsePatterns: string[];
    fieldSensitivity: string[];
  };
}

export interface PrivacySettings {
  minGroupSize: number;
  anonymizationLevel: 'high' | 'medium' | 'low';
  optOutRespected: boolean;
  retentionPeriod: string;
}

/**
 * Collective Field Detector - Aggregates individual consciousness data into field patterns
 */
export class CollectiveFieldDetector {
  private privacySettings: PrivacySettings = {
    minGroupSize: 5,
    anonymizationLevel: 'high',
    optOutRespected: true,
    retentionPeriod: '90_days'
  };

  async generateDailyFieldData(
    todaysAssessments: ConsciousnessMatrixV3[]
  ): Promise<DailyFieldData | null> {

    // Privacy check - need minimum group size
    if (todaysAssessments.length < this.privacySettings.minGroupSize) {
      return null;
    }

    // Calculate collective patterns
    const collectiveMatrix = this.aggregateMatrixData(todaysAssessments);
    const archetypalField = this.detectArchetypalField(todaysAssessments);
    const spiralogicField = this.mapSpiralogicField(todaysAssessments);
    const fieldIndicators = this.calculateFieldIndicators(
      collectiveMatrix,
      archetypalField,
      spiralogicField
    );

    return {
      date: new Date().toISOString().split('T')[0],
      totalInteractions: todaysAssessments.length,
      collectiveMatrix,
      archetypalField,
      spiralogicField,
      fieldIndicators
    };
  }

  private aggregateMatrixData(assessments: ConsciousnessMatrixV3[]) {
    const matrices = assessments.map(a => a.matrixV2);

    // Calculate dominant states
    const bodyStateCounts = this.countOccurrences(matrices.map(m => m.bodyState));
    const affectCounts = this.countOccurrences(matrices.map(m => m.affect));
    const realityContactCounts = this.countOccurrences(matrices.map(m => m.realityContact));

    // Window of tolerance distribution
    const toleranceDistribution = {
      within: 0,
      hyperarousal: 0,
      hypoarousal: 0
    };

    matrices.forEach(matrix => {
      // Simple heuristic for window of tolerance based on Matrix v2 state
      if (matrix.bodyState === 'calm' && matrix.affect === 'peaceful') {
        toleranceDistribution.within++;
      } else if (matrix.bodyState === 'tense' || matrix.affect === 'turbulent') {
        toleranceDistribution.hyperarousal++;
      } else if (matrix.bodyState === 'collapsed' || matrix.affect === 'crisis') {
        toleranceDistribution.hypoarousal++;
      }
    });

    // Normalize to percentages
    const total = assessments.length;
    Object.keys(toleranceDistribution).forEach(key => {
      toleranceDistribution[key] = toleranceDistribution[key] / total;
    });

    // Determine average capacity
    const averageCapacity = this.determineAverageCapacity(toleranceDistribution);

    return {
      averageCapacity,
      dominantBodyState: this.getMostCommon(bodyStateCounts),
      collectiveAffect: this.getMostCommon(affectCounts),
      realityContactSpread: this.getDistribution(realityContactCounts, total),
      windowOfToleranceDistribution: toleranceDistribution
    };
  }

  private detectArchetypalField(assessments: ConsciousnessMatrixV3[]) {
    const archetypes = assessments.map(a => a.archetypalDynamics);

    // Count archetypal patterns
    const foregroundCounts = this.countOccurrences(archetypes.map(a => a.foregroundArchetype));
    const hiddenCounts = this.countOccurrences(
      archetypes.map(a => a.hiddenArchetype).filter(Boolean)
    );
    const movementCounts = this.countOccurrences(archetypes.map(a => a.movementDirection));

    // Identify tension points
    const allTensions = archetypes.flatMap(a => a.tensionPoints);
    const tensionCounts = this.countOccurrences(allTensions);
    const topTensions = Object.entries(tensionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([tension]) => tension);

    return {
      dominantArchetype: this.getMostCommon(foregroundCounts),
      secondaryArchetype: this.getSecondMostCommon(foregroundCounts),
      hiddenArchetype: this.getMostCommon(hiddenCounts),
      movementTrend: this.getMostCommon(movementCounts),
      tensionPoints: topTensions
    };
  }

  private mapSpiralogicField(assessments: ConsciousnessMatrixV3[]) {
    // This would integrate with the Spiralogic mapping implementation
    // For now, we'll derive from Matrix + Archetypal patterns

    const matrices = assessments.map(a => a.matrixV2);
    const archetypes = assessments.map(a => a.archetypalDynamics);

    // Map dominant archetypes to elements
    const archetypalElements = archetypes.map(a =>
      this.mapArchetypeToElement(a.foregroundArchetype)
    );

    const elementCounts = this.countOccurrences(archetypalElements);

    // Estimate facet distribution based on movement patterns
    const facetCounts = {
      bonding: archetypes.filter(a => a.movementDirection === 'regressing').length,
      balancing: archetypes.filter(a => a.movementDirection === 'cycling').length,
      becoming: archetypes.filter(a => a.movementDirection === 'evolving').length
    };

    const total = assessments.length;

    return {
      dominantElement: this.getMostCommon(elementCounts),
      secondaryElement: this.getSecondMostCommon(elementCounts),
      facetDistribution: {
        bonding: facetCounts.bonding / total,
        balancing: facetCounts.balancing / total,
        becoming: facetCounts.becoming / total
      },
      spiralDirection: this.determineSpiralDirection(archetypes)
    };
  }

  private calculateFieldIndicators(
    collectiveMatrix: any,
    archetypalField: any,
    spiralogicField: any
  ) {
    // 1. Collective Element Balance (0-1)
    const elementValues = Object.values(spiralogicField.facetDistribution) as number[];
    const elementBalance = 1 - this.calculateStandardDeviation(elementValues);

    // 2. Average Matrix Capacity (0-1)
    const averageCapacity = collectiveMatrix.windowOfToleranceDistribution.within * 1.0 +
                           collectiveMatrix.windowOfToleranceDistribution.hyperarousal * 0.6 +
                           collectiveMatrix.windowOfToleranceDistribution.hypoarousal * 0.3;

    // 3. Archetypal Coherence (0-1) - simplified heuristic
    const coherence = archetypalField.movementTrend === 'evolving' ? 0.8 :
                     archetypalField.movementTrend === 'cycling' ? 0.6 : 0.4;

    // 4. Spiritual Readiness (0-1)
    const spiritualReadiness = averageCapacity * 0.7 + elementBalance * 0.3;

    // 5. Community Bond Strength (0-1) - based on movement toward connection
    const bondStrength = archetypalField.dominantArchetype === 'orphan' ? 0.3 :
                        archetypalField.dominantArchetype === 'caretaker' ? 0.9 :
                        0.7;

    return {
      collectiveElementBalance: Math.max(0, Math.min(1, elementBalance)),
      averageMatrixCapacity: Math.max(0, Math.min(1, averageCapacity)),
      archetypalCoherence: Math.max(0, Math.min(1, coherence)),
      spiritualReadiness: Math.max(0, Math.min(1, spiritualReadiness)),
      communityBondStrength: Math.max(0, Math.min(1, bondStrength))
    };
  }

  async generateWeeklyFieldReport(
    weeklyData: DailyFieldData[]
  ): Promise<WeeklyFieldReport> {

    if (weeklyData.length === 0) {
      throw new Error('No field data available for weekly report');
    }

    const fieldWeather = this.synthesizeFieldWeather(weeklyData);
    const ritualGuidance = this.generateRitualRecommendations(weeklyData);
    const navigatorTuning = this.generateNavigatorTuning(weeklyData);

    return {
      weekOf: weeklyData[0].date,
      fieldWeather,
      ritualGuidance,
      navigatorTuning
    };
  }

  private synthesizeFieldWeather(weeklyData: DailyFieldData[]) {
    const latestData = weeklyData[weeklyData.length - 1];
    const trends = this.analyzeTrends(weeklyData);

    // Generate weather description based on patterns
    let overallTrend = '';
    let dominantTheme = '';

    if (latestData.spiralogicField.dominantElement === 'water') {
      overallTrend = 'Water-Heavy with Emotional Processing';
      dominantTheme = 'Community in emotional recalibration and depth work';
    } else if (latestData.spiralogicField.dominantElement === 'fire') {
      overallTrend = 'Fire-Activated with Visionary Energy';
      dominantTheme = 'Collective calling and creative manifestation';
    } else if (latestData.spiralogicField.dominantElement === 'earth') {
      overallTrend = 'Earth-Grounded with Foundation Building';
      dominantTheme = 'Community stabilizing and creating sustainable structures';
    } else if (latestData.spiralogicField.dominantElement === 'air') {
      overallTrend = 'Air-Expansive with Communication Flow';
      dominantTheme = 'Collective meaning-making and story integration';
    } else {
      overallTrend = 'Aether-Opening with Transpersonal Emergence';
      dominantTheme = 'Community experiencing expanded awareness';
    }

    const emergentPatterns = this.identifyEmergentPatterns(weeklyData);
    const collectiveGrowthEdge = this.identifyGrowthEdge(latestData);

    return {
      overallTrend,
      dominantTheme,
      emergentPatterns,
      collectiveGrowthEdge
    };
  }

  private generateRitualRecommendations(weeklyData: DailyFieldData[]) {
    const latestData = weeklyData[weeklyData.length - 1];
    const element = latestData.spiralogicField.dominantElement;
    const capacity = latestData.fieldIndicators.averageMatrixCapacity;

    const practices: any /* TODO: specify type */[] = [];
    let elementalFocus = '';
    const needs: any /* TODO: specify type */[] = [];

    switch (element) {
      case 'water':
        practices.push('Grief/Release Circle', 'Emotional Support Gathering', 'Shadow Integration Work');
        elementalFocus = 'Water 2 Balancing';
        needs.push('Emotional safety', 'Community witnessing', 'Integration support');
        break;
      case 'fire':
        practices.push('Visioning Circle', 'Creative Expression Ritual', 'Calling Ceremony');
        elementalFocus = 'Fire 3 Becoming';
        needs.push('Creative expression', 'Vision manifestation', 'Sustainable activation');
        break;
      case 'earth':
        practices.push('Grounding Ceremony', 'Resource Sharing Circle', 'Body-Based Practice');
        elementalFocus = 'Earth 1-2 Foundation';
        needs.push('Physical stability', 'Resource support', 'Nervous system regulation');
        break;
      case 'air':
        practices.push('Story Circle', 'Communication Workshop', 'Meaning-Making Dialogue');
        elementalFocus = 'Air 2-3 Integration';
        needs.push('Story integration', 'Clear communication', 'Collaborative thinking');
        break;
      case 'aether':
        practices.push('Meditation Gathering', 'Field Sensing Practice', 'Transpersonal Circle');
        elementalFocus = 'Aether 2-3 Field Awareness';
        needs.push('Expanded awareness', 'Field sensing', 'Transpersonal integration');
        break;
    }

    // Adjust for capacity
    const timingConsiderations = capacity > 0.7
      ? 'High community capacity - good time for deeper work'
      : capacity > 0.4
      ? 'Moderate capacity - support foundation while exploring'
      : 'Limited capacity - focus on safety and basic support';

    return {
      recommendedPractices: practices,
      elementalFocus,
      communityNeeds: needs,
      timingConsiderations
    };
  }

  private generateNavigatorTuning(weeklyData: DailyFieldData[]) {
    const latestData = weeklyData[weeklyData.length - 1];

    const emphasisAdjustments: any /* TODO: specify type */[] = [];
    const responsePatterns: any /* TODO: specify type */[] = [];
    const fieldSensitivity: any /* TODO: specify type */[] = [];

    // Based on dominant archetype
    switch (latestData.archetypalField.dominantArchetype) {
      case 'warrior':
        emphasisAdjustments.push('Honor warrior energy', 'Watch for burnout');
        responsePatterns.push('Direct communication', 'Action-oriented guidance');
        break;
      case 'orphan':
        emphasisAdjustments.push('Emphasize belonging', 'Offer companionship');
        responsePatterns.push('Gentle invitation', 'Community connection');
        break;
      case 'caretaker':
        emphasisAdjustments.push('Address self-care', 'Support boundaries');
        responsePatterns.push('Permission to rest', 'Reciprocal care');
        break;
      case 'mystic':
        emphasisAdjustments.push('Ground spiritual experience', 'Reality check');
        responsePatterns.push('Integration focus', 'Practical application');
        break;
    }

    // Based on capacity
    if (latestData.fieldIndicators.averageMatrixCapacity < 0.4) {
      fieldSensitivity.push('Community in stress - gentle approach only');
      fieldSensitivity.push('Avoid pushing deeper work');
    } else if (latestData.fieldIndicators.averageMatrixCapacity > 0.7) {
      fieldSensitivity.push('High community capacity - can handle depth');
      fieldSensitivity.push('Support expansion and exploration');
    }

    return {
      emphasisAdjustments,
      responsePatterns,
      fieldSensitivity
    };
  }

  // Utility methods
  private countOccurrences<T>(items: T[]): Record<string, number> {
    const counts: Record<string, number> = {};
    items.forEach(item => {
      const key = String(item);
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }

  private getMostCommon(counts: Record<string, number>): string {
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'undefined';
  }

  private getSecondMostCommon(counts: Record<string, number>): string {
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)[1]?.[0] || 'undefined';
  }

  private getDistribution(counts: Record<string, number>, total: number): any {
    const distribution: any = {};
    Object.entries(counts).forEach(([key, count]) => {
      distribution[key] = count / total;
    });
    return distribution;
  }

  private determineAverageCapacity(distribution: any): string {
    if (distribution.within > 0.7) return 'expansive';
    if (distribution.within > 0.4) return 'stable';
    if (distribution.hypoarousal > 0.5) return 'crisis';
    return 'limited';
  }

  private mapArchetypeToElement(archetype: string): string {
    const mapping = {
      warrior: 'fire',
      caretaker: 'water',
      orphan: 'water',
      mystic: 'aether',
      sage: 'air',
      lover: 'water',
      sovereign: 'earth',
      trickster: 'fire'
    };
    return mapping[archetype] || 'air';
  }

  private determineSpiralDirection(archetypes: any[]): string {
    const evolvingCount = archetypes.filter(a => a.movementDirection === 'evolving').length;
    const regressingCount = archetypes.filter(a => a.movementDirection === 'regressing').length;

    if (evolvingCount > regressingCount * 1.5) return 'ascending';
    if (regressingCount > evolvingCount * 1.5) return 'descending';
    return 'stabilizing';
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private analyzeTrends(weeklyData: DailyFieldData[]): any {
    // Analyze week-over-week trends
    return {};
  }

  private identifyEmergentPatterns(weeklyData: DailyFieldData[]): string[] {
    // Identify emerging patterns across the week
    const latestData = weeklyData[weeklyData.length - 1];
    const patterns: any /* TODO: specify type */[] = [];

    if (latestData.archetypalField.movementTrend === 'evolving') {
      patterns.push('Community in growth phase');
    }
    if (latestData.fieldIndicators.communityBondStrength > 0.8) {
      patterns.push('Strong relational connections');
    }

    return patterns;
  }

  private identifyGrowthEdge(latestData: DailyFieldData): string {
    if (latestData.fieldIndicators.spiritualReadiness > 0.7) {
      return 'Ready for deeper transpersonal work';
    } else if (latestData.fieldIndicators.averageMatrixCapacity < 0.4) {
      return 'Foundation building and stabilization needed';
    } else {
      return 'Integration and meaning-making opportunities';
    }
  }
}

/**
 * Enhanced MAIA integration with field awareness
 */
export function enhanceMAIAWithFieldWeather(
  individualAssessment: ConsciousnessMatrixV3,
  fieldWeather: WeeklyFieldReport
): string {
  return `${JSON.stringify(individualAssessment, null, 2)}

COLLECTIVE FIELD WEATHER:
Current Community Field: ${fieldWeather.fieldWeather.overallTrend}
Dominant Theme: ${fieldWeather.fieldWeather.dominantTheme}
Community Capacity: ${fieldWeather.ritualGuidance.timingConsiderations}

FIELD-AWARE GUIDANCE:
MAIA, you're speaking to this individual within a larger field context.
The community is currently ${fieldWeather.fieldWeather.overallTrend}.
This person's ${individualAssessment.archetypalDynamics.foregroundArchetype} energy
exists within a field where ${fieldWeather.fieldWeather.dominantTheme}.

Navigator Tuning: ${fieldWeather.navigatorTuning.emphasisAdjustments.join('; ')}
Field Sensitivity: ${fieldWeather.navigatorTuning.fieldSensitivity.join('; ')}

Respond to both their individual state AND how it relates to what's
moving through the community. Your guidance can acknowledge the
collective moment they're part of.
`;
}