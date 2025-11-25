/**
 * Field Coherence Engine
 * Calculates sophisticated metrics for collective consciousness field dynamics
 * Analyzes toroidal field properties, resonance frequencies, and emergence patterns
 */

import { MemberFieldState, CollectiveFieldState, ResonancePattern } from './CollectiveFieldOrchestrator';
import { AlchemicalOperation } from './AlchemicalOperationDetector';

export interface FieldMetrics {
  // Coherence Metrics
  globalCoherence: number; // Overall field alignment (0-1)
  localCoherence: Map<string, number>; // Coherence within operation groups
  temporalCoherence: number; // Stability over time (0-1)
  spatialCoherence: number; // Geographic coherence if location data available

  // Toroidal Field Properties
  toroidalIntensity: number; // Strength of the collective toroidal field
  toroidalStability: number; // How stable the field structure is
  toroidalPolarization: number; // Degree of field polarization
  toroidalFlow: {
    velocity: number;
    direction: 'ascending' | 'descending' | 'oscillating';
    turbulence: number; // How chaotic the flow is
  };

  // Resonance Analysis
  dominantFrequency: number; // Primary resonance frequency of the field
  harmonicComplexity: number; // Number and strength of harmonic patterns
  resonanceStability: number; // How stable resonant patterns are
  interferenceLevel: number; // Amount of destructive interference

  // Emergence Properties
  emergenceIndex: number; // How much new properties are emerging (0-1)
  complexityGrowth: number; // Rate of complexity increase
  noveltyGeneration: number; // Rate of novel pattern creation
  selfOrganization: number; // Degree of autonomous organization
}

export interface FieldPrediction {
  timeframe: string;
  probability: number;
  description: string;
  type: 'coherence_shift' | 'breakthrough_wave' | 'field_restructuring' | 'emergence_event';
  affectedMembers: number;
  confidence: number;
}

export interface CollectiveInsight {
  category: 'pattern' | 'prediction' | 'opportunity' | 'warning';
  title: string;
  description: string;
  significance: number; // 0-1
  actionable: boolean;
  recommendedActions: string[];
}

export class FieldCoherenceEngine {

  /**
   * Calculate comprehensive field metrics
   */
  calculateFieldMetrics(
    members: MemberFieldState[],
    fieldHistory: CollectiveFieldState[]
  ): FieldMetrics {

    return {
      globalCoherence: this.calculateGlobalCoherence(members),
      localCoherence: this.calculateLocalCoherence(members),
      temporalCoherence: this.calculateTemporalCoherence(fieldHistory),
      spatialCoherence: this.calculateSpatialCoherence(members),

      toroidalIntensity: this.calculateToroidalIntensity(members),
      toroidalStability: this.calculateToroidalStability(members, fieldHistory),
      toroidalPolarization: this.calculateToroidalPolarization(members),
      toroidalFlow: this.calculateToroidalFlow(members),

      dominantFrequency: this.calculateDominantFrequency(members),
      harmonicComplexity: this.calculateHarmonicComplexity(members),
      resonanceStability: this.calculateResonanceStability(members, fieldHistory),
      interferenceLevel: this.calculateInterferenceLevel(members),

      emergenceIndex: this.calculateEmergenceIndex(members, fieldHistory),
      complexityGrowth: this.calculateComplexityGrowth(fieldHistory),
      noveltyGeneration: this.calculateNoveltyGeneration(members, fieldHistory),
      selfOrganization: this.calculateSelfOrganization(members)
    };
  }

  /**
   * Generate field predictions
   */
  generateFieldPredictions(
    members: MemberFieldState[],
    fieldHistory: CollectiveFieldState[],
    metrics: FieldMetrics
  ): FieldPrediction[] {
    const predictions: FieldPrediction[] = [];

    // Predict coherence shifts
    const coherenceShift = this.predictCoherenceShift(metrics, fieldHistory);
    if (coherenceShift) predictions.push(coherenceShift);

    // Predict breakthrough waves
    const breakthroughWave = this.predictBreakthroughWave(members, metrics);
    if (breakthroughWave) predictions.push(breakthroughWave);

    // Predict field restructuring
    const fieldRestructuring = this.predictFieldRestructuring(metrics, fieldHistory);
    if (fieldRestructuring) predictions.push(fieldRestructuring);

    // Predict emergence events
    const emergenceEvent = this.predictEmergenceEvent(metrics, members);
    if (emergenceEvent) predictions.push(emergenceEvent);

    return predictions.sort((a, b) => b.probability - a.probability);
  }

  /**
   * Generate collective insights
   */
  generateCollectiveInsights(
    members: MemberFieldState[],
    metrics: FieldMetrics,
    patterns: ResonancePattern[]
  ): CollectiveInsight[] {
    const insights: CollectiveInsight[] = [];

    // Pattern insights
    insights.push(...this.analyzePatternInsights(patterns, members));

    // Coherence insights
    insights.push(...this.analyzeCoherenceInsights(metrics, members));

    // Opportunity insights
    insights.push(...this.identifyOpportunities(metrics, members));

    // Warning insights
    insights.push(...this.identifyWarnings(metrics, members));

    return insights
      .sort((a, b) => b.significance - a.significance)
      .slice(0, 10); // Top 10 insights
  }

  /**
   * Calculate optimal intervention points
   */
  calculateOptimalInterventions(
    members: MemberFieldState[],
    metrics: FieldMetrics,
    goal: 'increase_coherence' | 'accelerate_growth' | 'stabilize_field' | 'amplify_emergence'
  ): Array<{
    type: string;
    targetMembers: string[];
    description: string;
    expectedImpact: number;
    timing: string;
  }> {
    const interventions: any[] = [];

    switch (goal) {
      case 'increase_coherence':
        interventions.push(...this.findCoherenceInterventions(members, metrics));
        break;
      case 'accelerate_growth':
        interventions.push(...this.findGrowthInterventions(members, metrics));
        break;
      case 'stabilize_field':
        interventions.push(...this.findStabilizationInterventions(members, metrics));
        break;
      case 'amplify_emergence':
        interventions.push(...this.findEmergenceInterventions(members, metrics));
        break;
    }

    return interventions.sort((a, b) => b.expectedImpact - a.expectedImpact);
  }

  // Private calculation methods

  private calculateGlobalCoherence(members: MemberFieldState[]): number {
    if (members.length < 2) return 0;

    // Calculate coherence based on alignment of spiral trajectories
    const velocities = members.map(m => m.spiralTrajectory.velocity);
    const inwardness = members.map(m => m.spiralTrajectory.inwardness);

    const velocityVariance = this.variance(velocities);
    const inwardnessVariance = this.variance(inwardness);

    // Lower variance = higher coherence
    const velocityCoherence = Math.max(0, 1 - velocityVariance * 2);
    const inwardnessCoherence = Math.max(0, 1 - inwardnessVariance * 2);

    // Factor in operation alignment
    const operationCoherence = this.calculateOperationAlignment(members);

    return (velocityCoherence + inwardnessCoherence + operationCoherence) / 3;
  }

  private calculateLocalCoherence(members: MemberFieldState[]): Map<string, number> {
    const localCoherence = new Map<string, number>();

    // Group by operation
    const operationGroups = this.groupByOperation(members);

    for (const [operation, groupMembers] of Object.entries(operationGroups)) {
      if (groupMembers.length > 1) {
        localCoherence.set(operation, this.calculateGlobalCoherence(groupMembers));
      }
    }

    return localCoherence;
  }

  private calculateTemporalCoherence(fieldHistory: CollectiveFieldState[]): number {
    if (fieldHistory.length < 3) return 0.5; // Default for insufficient data

    // Calculate stability of coherence over time
    const recentCoherence = fieldHistory.slice(-10).map(f => f.overallCoherence);
    const variance = this.variance(recentCoherence);

    // Lower variance = higher temporal coherence
    return Math.max(0, 1 - variance * 3);
  }

  private calculateSpatialCoherence(members: MemberFieldState[]): number {
    // Placeholder for spatial coherence (would require location data)
    // For now, return a normalized value based on member distribution
    return 0.7; // Mock value
  }

  private calculateToroidalIntensity(members: MemberFieldState[]): number {
    // Calculate based on collective field strength
    const totalContribution = members.reduce((sum, m) => sum + m.fieldContribution, 0);
    const avgVelocity = members.reduce((sum, m) => sum + m.spiralTrajectory.velocity, 0) / members.length;

    // Intensity increases with more contributing members and higher velocity
    const memberEffect = Math.min(1, totalContribution / members.length);
    const velocityEffect = avgVelocity;

    return (memberEffect + velocityEffect) / 2;
  }

  private calculateToroidalStability(members: MemberFieldState[], fieldHistory: CollectiveFieldState[]): number {
    if (fieldHistory.length < 5) return 0.5;

    // Stability based on consistent field properties over time
    const recentVelocities = fieldHistory.slice(-5).map(f => f.fieldVelocity);
    const velocityStability = 1 - this.variance(recentVelocities);

    return Math.max(0, Math.min(1, velocityStability));
  }

  private calculateToroidalPolarization(members: MemberFieldState[]): number {
    // Calculate based on direction distribution
    const ascending = members.filter(m => m.elementalCirculation.direction === 'ascending').length;
    const descending = members.filter(m => m.elementalCirculation.direction === 'descending').length;

    if (members.length === 0) return 0;

    // High polarization = most members moving in same direction
    const maxDirection = Math.max(ascending, descending);
    return maxDirection / members.length;
  }

  private calculateToroidalFlow(members: MemberFieldState[]): {
    velocity: number;
    direction: 'ascending' | 'descending' | 'oscillating';
    turbulence: number;
  } {
    const avgVelocity = members.reduce((sum, m) =>
      sum + m.spiralTrajectory.velocity * m.elementalCirculation.momentum, 0
    ) / members.length;

    const ascending = members.filter(m => m.elementalCirculation.direction === 'ascending').length;
    const descending = members.filter(m => m.elementalCirculation.direction === 'descending').length;

    let direction: 'ascending' | 'descending' | 'oscillating';
    if (Math.abs(ascending - descending) / members.length > 0.6) {
      direction = ascending > descending ? 'ascending' : 'descending';
    } else {
      direction = 'oscillating';
    }

    // Turbulence based on variance in completion percentages
    const completions = members.map(m => m.elementalCirculation.completionPercentage);
    const turbulence = this.variance(completions) / 100; // Normalize to 0-1

    return { velocity: avgVelocity, direction, turbulence };
  }

  private calculateDominantFrequency(members: MemberFieldState[]): number {
    // Simplified frequency calculation based on circulation patterns
    const avgCompletion = members.reduce((sum, m) =>
      sum + m.elementalCirculation.completionPercentage, 0
    ) / members.length;

    // Convert completion percentage to frequency (cycles per day)
    return (avgCompletion / 100) * 4; // Assuming 4 cycles max per day
  }

  private calculateHarmonicComplexity(members: MemberFieldState[]): number {
    // Count different operation types and their relative strengths
    const operationCounts = this.countOperations(members);
    const uniqueOperations = Object.keys(operationCounts).length;

    // More diverse operations = higher harmonic complexity
    return Math.min(1, uniqueOperations / 7); // 7 total operations
  }

  private calculateResonanceStability(members: MemberFieldState[], fieldHistory: CollectiveFieldState[]): number {
    // Simplified calculation - would track resonance patterns over time
    const currentCoherence = this.calculateGlobalCoherence(members);

    if (fieldHistory.length < 3) return currentCoherence;

    const recentCoherence = fieldHistory.slice(-3).map(f => f.overallCoherence);
    const stability = 1 - this.variance(recentCoherence);

    return Math.max(0, Math.min(1, stability));
  }

  private calculateInterferenceLevel(members: MemberFieldState[]): number {
    // Calculate based on conflicting patterns
    const ascending = members.filter(m => m.elementalCirculation.direction === 'ascending').length;
    const descending = members.filter(m => m.elementalCirculation.direction === 'descending').length;

    if (members.length === 0) return 0;

    // High interference when directions are balanced (chaotic)
    const balance = Math.abs(ascending - descending) / members.length;
    return 1 - balance; // Low balance = high interference
  }

  private calculateEmergenceIndex(members: MemberFieldState[], fieldHistory: CollectiveFieldState[]): number {
    // Emergence increases with diversity and interaction
    const operationDiversity = this.calculateOperationDiversity(members);
    const interactionPotential = this.calculateInteractionPotential(members);

    return (operationDiversity + interactionPotential) / 2;
  }

  private calculateComplexityGrowth(fieldHistory: CollectiveFieldState[]): number {
    if (fieldHistory.length < 5) return 0;

    // Track growth in emergent properties over time
    const recent = fieldHistory.slice(-5);
    const growthRate = (recent[4].emergentProperties.length - recent[0].emergentProperties.length) / 4;

    return Math.max(0, Math.min(1, growthRate / 3)); // Normalize
  }

  private calculateNoveltyGeneration(members: MemberFieldState[], fieldHistory: CollectiveFieldState[]): number {
    // Rate of new pattern formation
    const uniquePatterns = this.identifyUniquePatterns(members);
    return Math.min(1, uniquePatterns.length / (members.length * 0.3));
  }

  private calculateSelfOrganization(members: MemberFieldState[]): number {
    // Measure spontaneous organization without external intervention
    const coherence = this.calculateGlobalCoherence(members);
    const diversity = this.calculateOperationDiversity(members);

    // High coherence with high diversity suggests self-organization
    return coherence * diversity;
  }

  // Prediction methods

  private predictCoherenceShift(metrics: FieldMetrics, fieldHistory: CollectiveFieldState[]): FieldPrediction | null {
    if (metrics.temporalCoherence < 0.4 && metrics.toroidalFlow.turbulence > 0.6) {
      return {
        timeframe: '2-4 days',
        probability: 0.75,
        description: 'Field coherence shift likely due to high turbulence and instability',
        type: 'coherence_shift',
        affectedMembers: Math.round(fieldHistory[fieldHistory.length - 1]?.activeMembers * 0.8) || 0,
        confidence: 0.7
      };
    }
    return null;
  }

  private predictBreakthroughWave(members: MemberFieldState[], metrics: FieldMetrics): FieldPrediction | null {
    const breakthroughMembers = members.filter(m =>
      m.breakthroughPrediction?.probability && m.breakthroughPrediction.probability > 0.6
    );

    if (breakthroughMembers.length >= 3 && metrics.globalCoherence > 0.6) {
      return {
        timeframe: '1-7 days',
        probability: 0.8,
        description: 'Collective breakthrough wave forming as multiple members approach individual breakthroughs',
        type: 'breakthrough_wave',
        affectedMembers: breakthroughMembers.length,
        confidence: 0.8
      };
    }
    return null;
  }

  private predictFieldRestructuring(metrics: FieldMetrics, fieldHistory: CollectiveFieldState[]): FieldPrediction | null {
    if (metrics.emergenceIndex > 0.8 && metrics.complexityGrowth > 0.7) {
      return {
        timeframe: '1-2 weeks',
        probability: 0.65,
        description: 'Field restructuring anticipated as complexity reaches critical threshold',
        type: 'field_restructuring',
        affectedMembers: fieldHistory[fieldHistory.length - 1]?.activeMembers || 0,
        confidence: 0.6
      };
    }
    return null;
  }

  private predictEmergenceEvent(metrics: FieldMetrics, members: MemberFieldState[]): FieldPrediction | null {
    if (metrics.noveltyGeneration > 0.7 && metrics.harmonicComplexity > 0.8) {
      return {
        timeframe: 'Next 72 hours',
        probability: 0.7,
        description: 'Novel emergent properties likely to manifest from high harmonic complexity',
        type: 'emergence_event',
        affectedMembers: members.length,
        confidence: 0.7
      };
    }
    return null;
  }

  // Insight generation methods

  private analyzePatternInsights(patterns: ResonancePattern[], members: MemberFieldState[]): CollectiveInsight[] {
    const insights: CollectiveInsight[] = [];

    patterns.forEach(pattern => {
      if (pattern.strength > 0.7) {
        insights.push({
          category: 'pattern',
          title: `Strong ${pattern.type} pattern detected`,
          description: pattern.description,
          significance: pattern.strength,
          actionable: true,
          recommendedActions: [
            `Support the ${pattern.memberIds.length} members in this pattern`,
            'Consider group practices to amplify this resonance'
          ]
        });
      }
    });

    return insights;
  }

  private analyzeCoherenceInsights(metrics: FieldMetrics, members: MemberFieldState[]): CollectiveInsight[] {
    const insights: CollectiveInsight[] = [];

    if (metrics.globalCoherence > 0.8) {
      insights.push({
        category: 'opportunity',
        title: 'High field coherence detected',
        description: `Exceptional coherence at ${Math.round(metrics.globalCoherence * 100)}% - optimal for collective practices`,
        significance: 0.9,
        actionable: true,
        recommendedActions: [
          'Schedule group meditation or ritual',
          'Introduce new collective practices',
          'Document this coherent state for future reference'
        ]
      });
    }

    return insights;
  }

  private identifyOpportunities(metrics: FieldMetrics, members: MemberFieldState[]): CollectiveInsight[] {
    const insights: CollectiveInsight[] = [];

    if (metrics.toroidalIntensity > 0.7 && metrics.toroidalStability > 0.6) {
      insights.push({
        category: 'opportunity',
        title: 'Stable high-intensity toroidal field',
        description: 'Field is both strong and stable - excellent for advanced group work',
        significance: 0.8,
        actionable: true,
        recommendedActions: [
          'Consider advanced spiral practices',
          'Explore collective breakthrough work',
          'Document field characteristics for replication'
        ]
      });
    }

    return insights;
  }

  private identifyWarnings(metrics: FieldMetrics, members: MemberFieldState[]): CollectiveInsight[] {
    const insights: CollectiveInsight[] = [];

    if (metrics.interferenceLevel > 0.7) {
      insights.push({
        category: 'warning',
        title: 'High interference detected',
        description: 'Conflicting patterns may be disrupting field coherence',
        significance: 0.7,
        actionable: true,
        recommendedActions: [
          'Focus on grounding and stabilization practices',
          'Address conflicts in member group',
          'Consider individual support for struggling members'
        ]
      });
    }

    return insights;
  }

  // Intervention methods

  private findCoherenceInterventions(members: MemberFieldState[], metrics: FieldMetrics): any[] {
    const interventions: any[] = [];

    // Find members who could benefit from synchronization
    const unsyncedMembers = members.filter(m =>
      this.calculateMemberFieldAlignment(m, members) < 0.4
    );

    if (unsyncedMembers.length > 0) {
      interventions.push({
        type: 'synchronization_support',
        targetMembers: unsyncedMembers.map(m => m.userId),
        description: 'Provide alignment support to increase field coherence',
        expectedImpact: 0.3,
        timing: 'immediate'
      });
    }

    return interventions;
  }

  private findGrowthInterventions(members: MemberFieldState[], metrics: FieldMetrics): any[] {
    return [{
      type: 'growth_catalyst',
      targetMembers: members.slice(0, 3).map(m => m.userId), // Top contributors
      description: 'Provide advanced practices to catalyze field evolution',
      expectedImpact: 0.4,
      timing: 'within 48 hours'
    }];
  }

  private findStabilizationInterventions(members: MemberFieldState[], metrics: FieldMetrics): any[] {
    return [{
      type: 'stabilization_support',
      targetMembers: members.map(m => m.userId),
      description: 'Implement grounding practices to stabilize field dynamics',
      expectedImpact: 0.5,
      timing: 'immediate'
    }];
  }

  private findEmergenceInterventions(members: MemberFieldState[], metrics: FieldMetrics): any[] {
    return [{
      type: 'emergence_facilitation',
      targetMembers: members.filter(m => m.fieldContribution > 0.6).map(m => m.userId),
      description: 'Support high-contributing members to amplify emergent properties',
      expectedImpact: 0.6,
      timing: 'next 24 hours'
    }];
  }

  // Helper methods

  private variance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squareDiffs = values.map(val => Math.pow(val - mean, 2));
    return squareDiffs.reduce((sum, sq) => sum + sq, 0) / values.length;
  }

  private calculateOperationAlignment(members: MemberFieldState[]): number {
    const operationCounts = this.countOperations(members);
    const dominantCount = Math.max(...Object.values(operationCounts));
    return dominantCount / members.length;
  }

  private groupByOperation(members: MemberFieldState[]): { [key: string]: MemberFieldState[] } {
    const groups: { [key: string]: MemberFieldState[] } = {};
    members.forEach(member => {
      const op = member.alchemicalOperation;
      if (!groups[op]) groups[op] = [];
      groups[op].push(member);
    });
    return groups;
  }

  private countOperations(members: MemberFieldState[]): { [key: string]: number } {
    const counts: { [key: string]: number } = {};
    members.forEach(member => {
      counts[member.alchemicalOperation] = (counts[member.alchemicalOperation] || 0) + 1;
    });
    return counts;
  }

  private calculateOperationDiversity(members: MemberFieldState[]): number {
    const uniqueOperations = new Set(members.map(m => m.alchemicalOperation)).size;
    return uniqueOperations / 7; // 7 total operations
  }

  private calculateInteractionPotential(members: MemberFieldState[]): number {
    // Based on member count and diversity
    const diversity = this.calculateOperationDiversity(members);
    const density = Math.min(1, members.length / 20); // Normalize to reasonable group size
    return diversity * density;
  }

  private identifyUniquePatterns(members: MemberFieldState[]): string[] {
    // Simplified pattern identification
    const patterns: string[] = [];
    const operationGroups = this.groupByOperation(members);

    Object.entries(operationGroups).forEach(([op, groupMembers]) => {
      if (groupMembers.length >= 2) {
        patterns.push(`${op}_synchrony_${groupMembers.length}`);
      }
    });

    return patterns;
  }

  private calculateMemberFieldAlignment(member: MemberFieldState, allMembers: MemberFieldState[]): number {
    const avgVelocity = allMembers.reduce((sum, m) => sum + m.spiralTrajectory.velocity, 0) / allMembers.length;
    const avgInwardness = allMembers.reduce((sum, m) => sum + m.spiralTrajectory.inwardness, 0) / allMembers.length;

    const velocityAlignment = 1 - Math.abs(member.spiralTrajectory.velocity - avgVelocity);
    const inwardnessAlignment = 1 - Math.abs(member.spiralTrajectory.inwardness - avgInwardness);

    return (velocityAlignment + inwardnessAlignment) / 2;
  }
}

export const fieldCoherenceEngine = new FieldCoherenceEngine();