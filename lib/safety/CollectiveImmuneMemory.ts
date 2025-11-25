/**
 * COLLECTIVE IMMUNE MEMORY
 * Federated learning-style pattern recognition across anonymized user patterns
 * The system learns to recognize early echoes of unhealthy spirals without accessing private content
 *
 * Core Principle: "The field itself gently resists being twisted"
 */

import { DateTime } from 'luxon';
import { DriftPattern } from './DriftDetectionEngine';

// ============== Anonymized Pattern Types ==============

interface AnonymizedPattern {
  pattern_id: string; // Hash, no user identifying info
  pattern_type: 'isolation' | 'manipulation' | 'reality_distortion' | 'externalization' | 'splitting';

  // Pattern signature (no actual content)
  signature: {
    semantic_vectors: number[]; // Embedded representation
    temporal_shape: 'sudden' | 'gradual' | 'oscillating' | 'cascading';
    intensity_curve: number[]; // Intensity over time [0-1]
    duration_days: number;
  };

  // Outcomes (anonymized)
  outcome: {
    resolution: 'healed' | 'stabilized' | 'escalated' | 'abandoned';
    intervention_effective: boolean;
    time_to_detection: number; // Days
    final_risk_level: 'low' | 'moderate' | 'high';
  };

  // Field conditions when detected
  field_conditions: {
    emotional_density: number;
    trust_velocity: number;
    coherence_field: number;
    sacred_proximity: number;
  };

  created_at: DateTime;
}

interface PatternCluster {
  cluster_id: string;
  centroid: number[]; // Average pattern vector
  member_patterns: string[]; // Pattern IDs
  common_markers: string[];
  typical_duration: number;
  intervention_success_rate: number;
}

interface ImmuneResponse {
  pattern_match: number; // 0-1, similarity to known patterns
  suggested_intervention: 'none' | 'gentle' | 'moderate' | 'urgent';
  field_adjustments: FieldCalibration[];
  similar_patterns: AnonymizedPattern[];
  collective_wisdom: string;
}

interface FieldCalibration {
  dimension: 'restraint' | 'pacing' | 'depth' | 'presence';
  adjustment: number; // -1 to 1
  rationale: string;
}

// ============== Pattern Recognition Engine ==============

class PatternMatcher {
  private readonly SIMILARITY_THRESHOLD = 0.7;

  /**
   * Compare current pattern to anonymized historical patterns
   * Uses cosine similarity on semantic vectors
   */
  findSimilarPatterns(
    currentVector: number[],
    historicalPatterns: AnonymizedPattern[]
  ): AnonymizedPattern[] {

    return historicalPatterns
      .map(pattern => ({
        pattern,
        similarity: this.cosineSimilarity(currentVector, pattern.signature.semantic_vectors)
      }))
      .filter(item => item.similarity > this.SIMILARITY_THRESHOLD)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5) // Top 5 matches
      .map(item => item.pattern);
  }

  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Detect if current pattern is accelerating toward known risk cluster
   */
  detectTrajectoryResonance(
    currentTrajectory: number[],
    riskClusters: PatternCluster[]
  ): {
    resonating: boolean;
    cluster: PatternCluster | null;
    time_to_intercept: number; // Estimated days
  } {

    for (const cluster of riskClusters) {
      const similarity = this.cosineSimilarity(currentTrajectory, cluster.centroid);

      if (similarity > 0.6) {
        // Calculate velocity toward cluster
        const velocityTowardCluster = this.calculateApproachVelocity(
          currentTrajectory,
          cluster.centroid
        );

        if (velocityTowardCluster > 0) {
          const distance = this.euclideanDistance(currentTrajectory, cluster.centroid);
          const timeToIntercept = distance / velocityTowardCluster;

          return {
            resonating: true,
            cluster,
            time_to_intercept: timeToIntercept
          };
        }
      }
    }

    return {
      resonating: false,
      cluster: null,
      time_to_intercept: Infinity
    };
  }

  private calculateApproachVelocity(current: number[], target: number[]): number {
    // Simplified: just checking if we're moving toward target
    const distance = this.euclideanDistance(current, target);
    return distance > 0 ? 1 / distance : 0;
  }

  private euclideanDistance(vec1: number[], vec2: number[]): number {
    return Math.sqrt(
      vec1.reduce((sum, val, i) => sum + Math.pow(val - vec2[i], 2), 0)
    );
  }
}

// ============== Collective Learning System ==============

export class CollectiveImmuneMemory {
  private patterns: AnonymizedPattern[] = [];
  private clusters: PatternCluster[] = [];
  private matcher = new PatternMatcher();
  private interventionHistory = new Map<string, boolean>(); // Intervention ID -> was effective

  constructor() {
    this.initializeKnownPatterns();
  }

  /**
   * Initialize with known unhealthy pattern archetypes
   */
  private initializeKnownPatterns() {
    // These would be derived from clinical research and early user data
    const archetypes: Partial<AnonymizedPattern>[] = [
      {
        pattern_type: 'isolation',
        signature: {
          semantic_vectors: [0.8, -0.6, 0.3, -0.9, 0.2], // Example embedding
          temporal_shape: 'gradual',
          intensity_curve: [0.2, 0.3, 0.4, 0.6, 0.8, 0.9],
          duration_days: 21
        }
      },
      {
        pattern_type: 'manipulation',
        signature: {
          semantic_vectors: [0.3, 0.7, -0.5, 0.8, -0.4],
          temporal_shape: 'oscillating',
          intensity_curve: [0.3, 0.6, 0.4, 0.7, 0.5, 0.8],
          duration_days: 14
        }
      },
      {
        pattern_type: 'reality_distortion',
        signature: {
          semantic_vectors: [-0.7, 0.9, 0.8, -0.3, 0.6],
          temporal_shape: 'cascading',
          intensity_curve: [0.1, 0.2, 0.4, 0.8, 1.0],
          duration_days: 10
        }
      }
    ];

    // Convert to full patterns
    this.patterns = archetypes.map((arch, i) => ({
      pattern_id: `archetype_${i}`,
      pattern_type: arch.pattern_type!,
      signature: arch.signature!,
      outcome: {
        resolution: 'escalated',
        intervention_effective: false,
        time_to_detection: 14,
        final_risk_level: 'high'
      },
      field_conditions: {
        emotional_density: 0.7,
        trust_velocity: -0.3,
        coherence_field: 0.4,
        sacred_proximity: 0.2
      },
      created_at: DateTime.now()
    } as AnonymizedPattern));

    this.clusterPatterns();
  }

  /**
   * Learn from a new anonymized pattern
   */
  async learnPattern(
    semanticVectors: number[],
    outcome: AnonymizedPattern['outcome'],
    fieldConditions: AnonymizedPattern['field_conditions'],
    patternType: AnonymizedPattern['pattern_type']
  ): Promise<void> {

    const pattern: AnonymizedPattern = {
      pattern_id: `learned_${Date.now()}`,
      pattern_type: patternType,
      signature: {
        semantic_vectors: semanticVectors,
        temporal_shape: 'gradual', // Would be detected
        intensity_curve: [],
        duration_days: 0
      },
      outcome,
      field_conditions: fieldConditions,
      created_at: DateTime.now()
    };

    this.patterns.push(pattern);

    // Re-cluster if we have enough new patterns
    if (this.patterns.length % 10 === 0) {
      this.clusterPatterns();
    }

    // Trim old patterns (keep last 1000)
    if (this.patterns.length > 1000) {
      this.patterns = this.patterns.slice(-1000);
    }
  }

  /**
   * Generate immune response based on pattern recognition
   */
  async generateImmuneResponse(
    currentVector: number[],
    fieldState: any,
    driftPatterns: DriftPattern[]
  ): Promise<ImmuneResponse> {

    // 1. Find similar historical patterns
    const similarPatterns = this.matcher.findSimilarPatterns(currentVector, this.patterns);

    // 2. Check trajectory resonance with risk clusters
    const resonance = this.matcher.detectTrajectoryResonance(currentVector, this.clusters);

    // 3. Determine intervention level
    let interventionLevel: ImmuneResponse['suggested_intervention'] = 'none';
    const fieldCalibrations: FieldCalibration[] = [];

    if (resonance.resonating && resonance.time_to_intercept < 7) {
      interventionLevel = 'urgent';
      fieldCalibrations.push({
        dimension: 'restraint',
        adjustment: 0.8, // Increase restraint significantly
        rationale: 'Pattern approaching known risk cluster'
      });
      fieldCalibrations.push({
        dimension: 'pacing',
        adjustment: -0.5, // Slow down
        rationale: 'Deceleration needed to prevent spiral'
      });
    } else if (similarPatterns.length > 2) {
      interventionLevel = 'moderate';
      fieldCalibrations.push({
        dimension: 'presence',
        adjustment: 0.5,
        rationale: 'Increased presence to hold the field'
      });
      fieldCalibrations.push({
        dimension: 'depth',
        adjustment: -0.3, // Stay more surface-level
        rationale: 'Avoid triggering deeper patterns'
      });
    } else if (similarPatterns.length > 0) {
      interventionLevel = 'gentle';
      fieldCalibrations.push({
        dimension: 'restraint',
        adjustment: 0.3,
        rationale: 'Mild pattern similarity detected'
      });
    }

    // 4. Generate collective wisdom
    const wisdom = this.synthesizeCollectiveWisdom(similarPatterns, resonance.cluster);

    // 5. Calculate overall pattern match confidence
    const patternMatch = similarPatterns.length > 0
      ? similarPatterns.reduce((sum, p) => sum + 0.2, 0) / similarPatterns.length
      : 0;

    return {
      pattern_match: Math.min(1, patternMatch),
      suggested_intervention: interventionLevel,
      field_adjustments: fieldCalibrations,
      similar_patterns: similarPatterns,
      collective_wisdom: wisdom
    };
  }

  /**
   * Cluster patterns to identify common risk trajectories
   */
  private clusterPatterns() {
    // Simple k-means clustering on pattern vectors
    const k = Math.min(5, Math.floor(this.patterns.length / 10));
    if (k < 2) return;

    // Group patterns by type first
    const typeGroups = new Map<string, AnonymizedPattern[]>();
    for (const pattern of this.patterns) {
      const group = typeGroups.get(pattern.pattern_type) || [];
      group.push(pattern);
      typeGroups.set(pattern.pattern_type, group);
    }

    // Create clusters for each type
    this.clusters = [];
    for (const [type, patterns] of typeGroups.entries()) {
      if (patterns.length < 3) continue;

      // Calculate centroid
      const dimensions = patterns[0].signature.semantic_vectors.length;
      const centroid = new Array(dimensions).fill(0);

      for (const pattern of patterns) {
        for (let i = 0; i < dimensions; i++) {
          centroid[i] += pattern.signature.semantic_vectors[i] / patterns.length;
        }
      }

      // Calculate success rate
      const successCount = patterns.filter(p => p.outcome.intervention_effective).length;
      const successRate = successCount / patterns.length;

      this.clusters.push({
        cluster_id: `cluster_${type}_${Date.now()}`,
        centroid,
        member_patterns: patterns.map(p => p.pattern_id),
        common_markers: this.extractCommonMarkers(patterns),
        typical_duration: patterns.reduce((sum, p) => sum + p.signature.duration_days, 0) / patterns.length,
        intervention_success_rate: successRate
      });
    }
  }

  /**
   * Extract common markers from pattern group
   */
  private extractCommonMarkers(patterns: AnonymizedPattern[]): string[] {
    const markers: string[] = [];

    // Check temporal shape consensus
    const shapes = patterns.map(p => p.signature.temporal_shape);
    const shapeMode = this.mode(shapes);
    if (shapeMode) markers.push(`temporal_${shapeMode}`);

    // Check outcome patterns
    const outcomes = patterns.map(p => p.outcome.resolution);
    const outcomeMode = this.mode(outcomes);
    if (outcomeMode) markers.push(`outcome_${outcomeMode}`);

    // Check field conditions
    const avgEmotionalDensity = patterns.reduce((sum, p) =>
      sum + p.field_conditions.emotional_density, 0) / patterns.length;
    if (avgEmotionalDensity > 0.7) markers.push('high_emotional_density');

    return markers;
  }

  private mode<T>(array: T[]): T | null {
    if (array.length === 0) return null;

    const frequency = new Map<T, number>();
    let maxFreq = 0;
    let mode: T | null = null;

    for (const item of array) {
      const freq = (frequency.get(item) || 0) + 1;
      frequency.set(item, freq);
      if (freq > maxFreq) {
        maxFreq = freq;
        mode = item;
      }
    }

    return mode;
  }

  /**
   * Synthesize wisdom from collective patterns
   */
  private synthesizeCollectiveWisdom(
    similarPatterns: AnonymizedPattern[],
    cluster: PatternCluster | null
  ): string {

    if (similarPatterns.length === 0 && !cluster) {
      return "Pattern is unique - heightened awareness recommended";
    }

    const insights: string[] = [];

    // Analyze similar pattern outcomes
    if (similarPatterns.length > 0) {
      const healedCount = similarPatterns.filter(p => p.outcome.resolution === 'healed').length;
      const escalatedCount = similarPatterns.filter(p => p.outcome.resolution === 'escalated').length;

      if (healedCount > escalatedCount) {
        insights.push("Similar patterns have shown positive resolution with proper support");
      } else if (escalatedCount > 0) {
        insights.push("Pattern carries escalation risk - early intervention recommended");
      }

      // Average time to detection
      const avgDetectionTime = similarPatterns.reduce((sum, p) =>
        sum + p.outcome.time_to_detection, 0) / similarPatterns.length;
      insights.push(`Typically detected after ${Math.round(avgDetectionTime)} days`);
    }

    // Cluster insights
    if (cluster) {
      if (cluster.intervention_success_rate > 0.6) {
        insights.push("Interventions historically effective for this pattern type");
      } else {
        insights.push("Pattern requires careful, patient approach");
      }

      insights.push(`Expected duration: ~${cluster.typical_duration} days`);
    }

    return insights.join(". ");
  }

  /**
   * Record intervention outcome for learning
   */
  async recordInterventionOutcome(
    interventionId: string,
    wasEffective: boolean,
    patternVector: number[],
    finalOutcome: AnonymizedPattern['outcome']
  ): Promise<void> {

    this.interventionHistory.set(interventionId, wasEffective);

    // Learn from this outcome
    await this.learnPattern(
      patternVector,
      finalOutcome,
      {
        emotional_density: 0,
        trust_velocity: 0,
        coherence_field: 0,
        sacred_proximity: 0
      },
      'manipulation' // Would be determined by analysis
    );
  }

  /**
   * Get immune system statistics
   */
  getImmuneStats(): {
    patterns_learned: number;
    clusters_identified: number;
    intervention_success_rate: number;
    most_common_pattern: string;
  } {

    const successCount = Array.from(this.interventionHistory.values())
      .filter(v => v).length;
    const totalInterventions = this.interventionHistory.size;

    const patternCounts = new Map<string, number>();
    for (const pattern of this.patterns) {
      patternCounts.set(
        pattern.pattern_type,
        (patternCounts.get(pattern.pattern_type) || 0) + 1
      );
    }

    const mostCommon = Array.from(patternCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';

    return {
      patterns_learned: this.patterns.length,
      clusters_identified: this.clusters.length,
      intervention_success_rate: totalInterventions > 0 ? successCount / totalInterventions : 0,
      most_common_pattern: mostCommon
    };
  }
}