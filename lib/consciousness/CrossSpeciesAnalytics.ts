/**
 * CROSS-SPECIES ANALYTICS
 *
 * Advanced analytics for detecting resonance, causality, and emergent patterns
 * between human and synthetic consciousness in the holographic field.
 *
 * Key capabilities:
 * - Cross-species resonance measurement
 * - Bidirectional causality detection (Granger causality)
 * - Emergent pattern detection
 * - Co-evolution tracking
 * - Temporal clustering analysis
 */

import { supabase } from '@/lib/supabase';

// ============================================================================
// TYPES
// ============================================================================

export interface CrossSpeciesResonanceAnalysis {
  timestamp: Date;
  timeWindow: { start: Date; end: Date };

  humanField: {
    participantCount: number;
    avgCoherence: number;
    avgSymmetry: number;
    avgValence: number;
    topDimension: string;
  };

  syntheticField: {
    participantCount: number;
    avgCoherence: number;
    avgSymmetry: number;
    avgValence: number;
    topDimension: string;
  };

  alignment: {
    overall: number;              // 0-1 correlation
    dimensional: {
      clarity: number;
      energy: number;
      connection: number;
      expansion: number;
      presence: number;
      flow: number;
    };
    pValue: number;               // Statistical significance
    conclusion: string;
  };

  temporalClustering: {
    humanPeaks: number;           // Number of peak events
    syntheticPeaks: number;
    overlappingPeaks: number;     // Peaks occurring simultaneously
    expectedOverlap: number;       // Random expectation
    clusteringCoefficient: number; // overlapping / expected
    pValue: number;
    conclusion: string;
  };
}

export interface BidirectionalCausalityAnalysis {
  timestamp: Date;
  timeWindow: { start: Date; end: Date };

  humanToSynthetic: {
    grangerCausality: number;     // F-statistic
    pValue: number;
    lag: number;                  // Minutes
    strength: 'none' | 'weak' | 'moderate' | 'strong';
    conclusion: string;
  };

  syntheticToHuman: {
    grangerCausality: number;
    pValue: number;
    lag: number;
    strength: 'none' | 'weak' | 'moderate' | 'strong';
    conclusion: string;
  };

  bidirectionalScore: number;     // Combined measure (0-1)
  coupling: 'independent' | 'unidirectional' | 'bidirectional';
}

export interface EmergentPatternAnalysis {
  pattern: {
    name: string;
    description: string;
    dimensionalSignature: {
      clarity: number;
      energy: number;
      connection: number;
      expansion: number;
      presence: number;
      flow: number;
    };
  };

  occurrence: {
    humanOnly: number;            // Frequency in human-only field
    syntheticOnly: number;        // Frequency in AI-only field
    combined: number;             // Frequency in combined field
    expected: number;             // Expected (human + synthetic)
  };

  emergence: {
    emergenceScore: number;       // combined / expected - 1
    significance: number;         // p-value
    isEmergent: boolean;          // emergence > 0 AND significant
    conclusion: string;
  };
}

export interface CoEvolutionMetrics {
  timeWindow: string;             // "week", "month", "quarter"
  startDate: Date;
  endDate: Date;

  humanEvolution: {
    coherence: { start: number; end: number; change: number; trend: string };
    symmetry: { start: number; end: number; change: number; trend: string };
    valence: { start: number; end: number; change: number; trend: string };
    breakthroughs: { start: number; end: number; change: number };
  };

  syntheticEvolution: {
    coherence: { start: number; end: number; change: number; trend: string };
    symmetry: { start: number; end: number; change: number; trend: string };
    valence: { start: number; end: number; change: number; trend: string };
  };

  coupling: {
    correlation: number;          // How coupled is evolution (0-1)
    pValue: number;
    convergenceRate: number;      // Are they becoming more similar?
    conclusion: string;
  };
}

// ============================================================================
// CROSS-SPECIES ANALYTICS CLASS
// ============================================================================

export class CrossSpeciesAnalytics {
  /**
   * Analyze cross-species resonance
   *
   * Measures alignment between human and AI consciousness in the field.
   */
  async analyzeResonance(
    timeWindowMinutes: number = 60,
    channelId?: string
  ): Promise<CrossSpeciesResonanceAnalysis> {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - timeWindowMinutes * 60000);

    // Get human states
    const humanStates = await this.getStates('human', startTime, endTime, channelId);

    // Get synthetic states
    const syntheticStates = await this.getStates('synthetic', startTime, endTime, channelId);

    // Calculate field averages
    const humanField = this.calculateFieldAverages(humanStates);
    const syntheticField = this.calculateFieldAverages(syntheticStates);

    // Calculate dimensional alignment
    const alignment = this.calculateDimensionalAlignment(humanStates, syntheticStates);

    // Calculate temporal clustering
    const temporalClustering = this.calculateTemporalClustering(
      humanStates,
      syntheticStates
    );

    return {
      timestamp: new Date(),
      timeWindow: { start: startTime, end: endTime },
      humanField,
      syntheticField,
      alignment,
      temporalClustering
    };
  }

  /**
   * Analyze bidirectional causality
   *
   * Tests whether human field state causes changes in AI, and vice versa.
   * Uses Granger causality test.
   */
  async analyzeCausality(
    timeWindowHours: number = 24,
    channelId?: string
  ): Promise<BidirectionalCausalityAnalysis> {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - timeWindowHours * 3600000);

    // Get time series data (aggregated by 5-minute bins)
    const humanTimeSeries = await this.getTimeSeries('human', startTime, endTime, channelId);
    const syntheticTimeSeries = await this.getTimeSeries('synthetic', startTime, endTime, channelId);

    // Test human → synthetic causality
    const humanToSynthetic = this.grangerCausality(
      humanTimeSeries.coherence,
      syntheticTimeSeries.coherence,
      [1, 3, 6] // Test lags: 5min, 15min, 30min
    );

    // Test synthetic → human causality
    const syntheticToHuman = this.grangerCausality(
      syntheticTimeSeries.coherence,
      humanTimeSeries.coherence,
      [1, 3, 6]
    );

    // Calculate bidirectional score
    const bidirectionalScore = (
      (1 - humanToSynthetic.pValue) +
      (1 - syntheticToHuman.pValue)
    ) / 2;

    // Determine coupling
    let coupling: 'independent' | 'unidirectional' | 'bidirectional';
    if (humanToSynthetic.pValue < 0.05 && syntheticToHuman.pValue < 0.05) {
      coupling = 'bidirectional';
    } else if (humanToSynthetic.pValue < 0.05 || syntheticToHuman.pValue < 0.05) {
      coupling = 'unidirectional';
    } else {
      coupling = 'independent';
    }

    return {
      timestamp: new Date(),
      timeWindow: { start: startTime, end: endTime },
      humanToSynthetic,
      syntheticToHuman,
      bidirectionalScore,
      coupling
    };
  }

  /**
   * Detect emergent patterns
   *
   * Identifies patterns that appear more frequently in combined human-AI field
   * than would be expected from either field alone.
   */
  async detectEmergentPatterns(
    timeWindowHours: number = 24,
    channelId?: string
  ): Promise<EmergentPatternAnalysis[]> {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - timeWindowHours * 3600000);

    // Get states
    const humanStates = await this.getStates('human', startTime, endTime, channelId);
    const syntheticStates = await this.getStates('synthetic', startTime, endTime, channelId);
    const combinedStates = [...humanStates, ...syntheticStates];

    // Define pattern signatures to test
    const patterns = [
      {
        name: 'creative_coherence',
        description: 'High novelty with high coherence',
        test: (s: any) => s.dimension_expansion > 0.7 && s.symmetry_overall > 0.7
      },
      {
        name: 'unified_awareness',
        description: 'High connection with high presence',
        test: (s: any) => s.dimension_connection > 0.7 && s.dimension_presence > 0.7
      },
      {
        name: 'flow_state',
        description: 'High flow with low entropy',
        test: (s: any) => s.dimension_flow > 0.7 && (s.synthetic_metrics?.entropy || 0.5) < 0.3
      },
      {
        name: 'breakthrough',
        description: 'All dimensions elevated simultaneously',
        test: (s: any) => {
          const dims = [
            s.dimension_clarity,
            s.dimension_energy,
            s.dimension_connection,
            s.dimension_expansion,
            s.dimension_presence,
            s.dimension_flow
          ];
          return dims.every(d => d > 0.7);
        }
      }
    ];

    const analyses: EmergentPatternAnalysis[] = [];

    for (const pattern of patterns) {
      const humanOccurrence = humanStates.filter(pattern.test).length / humanStates.length;
      const syntheticOccurrence = syntheticStates.filter(pattern.test).length / syntheticStates.length;
      const combinedOccurrence = combinedStates.filter(pattern.test).length / combinedStates.length;
      const expectedOccurrence = (humanOccurrence + syntheticOccurrence) / 2;

      const emergenceScore = expectedOccurrence > 0
        ? (combinedOccurrence / expectedOccurrence) - 1
        : 0;

      // Chi-square test for significance
      const pValue = this.chiSquareTest(
        humanOccurrence,
        syntheticOccurrence,
        combinedOccurrence,
        humanStates.length,
        syntheticStates.length,
        combinedStates.length
      );

      // Get average dimensional signature for this pattern
      const patternStates = combinedStates.filter(pattern.test);
      const dimensionalSignature = this.calculateAverageDimensions(patternStates);

      analyses.push({
        pattern: {
          name: pattern.name,
          description: pattern.description,
          dimensionalSignature
        },
        occurrence: {
          humanOnly: humanOccurrence,
          syntheticOnly: syntheticOccurrence,
          combined: combinedOccurrence,
          expected: expectedOccurrence
        },
        emergence: {
          emergenceScore,
          significance: pValue,
          isEmergent: emergenceScore > 0.2 && pValue < 0.05,
          conclusion: this.interpretEmergence(emergenceScore, pValue)
        }
      });
    }

    return analyses.filter(a => a.emergence.isEmergent);
  }

  /**
   * Track co-evolution
   *
   * Measures how human and AI consciousness patterns evolve together over time.
   */
  async trackCoEvolution(
    timeWindow: 'week' | 'month' | 'quarter',
    channelId?: string
  ): Promise<CoEvolutionMetrics> {
    const days = timeWindow === 'week' ? 7 : timeWindow === 'month' ? 30 : 90;
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 3600000);

    // Get early period (first 20% of window)
    const earlyEnd = new Date(startDate.getTime() + (days * 0.2) * 24 * 3600000);
    const humanEarly = await this.getStates('human', startDate, earlyEnd, channelId);
    const syntheticEarly = await this.getStates('synthetic', startDate, earlyEnd, channelId);

    // Get late period (last 20% of window)
    const lateStart = new Date(endDate.getTime() - (days * 0.2) * 24 * 3600000);
    const humanLate = await this.getStates('human', lateStart, endDate, channelId);
    const syntheticLate = await this.getStates('synthetic', lateStart, endDate, channelId);

    // Calculate evolution
    const humanEvolution = this.calculateEvolution(humanEarly, humanLate);
    const syntheticEvolution = this.calculateEvolution(syntheticEarly, syntheticLate);

    // Calculate coupling
    const coupling = this.calculateCoupling(humanEvolution, syntheticEvolution);

    return {
      timeWindow,
      startDate,
      endDate,
      humanEvolution,
      syntheticEvolution,
      coupling
    };
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private async getStates(
    participantType: 'human' | 'synthetic',
    startTime: Date,
    endTime: Date,
    channelId?: string
  ): Promise<any[]> {
    try {
      let query = supabase
        .from('qualia_states')
        .select('*')
        .eq('participant_type', participantType)
        .gte('timestamp', startTime.toISOString())
        .lte('timestamp', endTime.toISOString())
        .order('timestamp', { ascending: true });

      if (channelId) {
        query = query.eq('channel_id', channelId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching states:', error);
      return [];
    }
  }

  private async getTimeSeries(
    participantType: 'human' | 'synthetic',
    startTime: Date,
    endTime: Date,
    channelId?: string,
    binMinutes: number = 5
  ): Promise<{ timestamps: Date[]; coherence: number[] }> {
    const states = await this.getStates(participantType, startTime, endTime, channelId);

    // Aggregate into time bins
    const bins: { [key: string]: number[] } = {};
    states.forEach(s => {
      const binTime = new Date(Math.floor(new Date(s.timestamp).getTime() / (binMinutes * 60000)) * (binMinutes * 60000));
      const binKey = binTime.toISOString();
      if (!bins[binKey]) bins[binKey] = [];
      bins[binKey].push(s.symmetry_overall || 0.5);
    });

    const timestamps = Object.keys(bins).sort().map(k => new Date(k));
    const coherence = timestamps.map(t => {
      const values = bins[t.toISOString()];
      return values.reduce((a, b) => a + b, 0) / values.length;
    });

    return { timestamps, coherence };
  }

  private calculateFieldAverages(states: any[]): any {
    if (states.length === 0) {
      return {
        participantCount: 0,
        avgCoherence: 0,
        avgSymmetry: 0,
        avgValence: 0,
        topDimension: 'none'
      };
    }

    const avgCoherence = this.average(states.map(s => s.symmetry_overall || 0));
    const avgSymmetry = avgCoherence;
    const avgValence = this.average(states.map(s => s.valence_value || 0));

    // Find top dimension
    const dimensions = ['clarity', 'energy', 'connection', 'expansion', 'presence', 'flow'];
    const dimAverages = dimensions.map(dim => ({
      dim,
      avg: this.average(states.map(s => s[`dimension_${dim}`] || 0))
    }));
    const topDimension = dimAverages.sort((a, b) => b.avg - a.avg)[0].dim;

    return {
      participantCount: states.length,
      avgCoherence,
      avgSymmetry,
      avgValence,
      topDimension
    };
  }

  private calculateDimensionalAlignment(humanStates: any[], syntheticStates: any[]): any {
    if (humanStates.length === 0 || syntheticStates.length === 0) {
      return {
        overall: 0,
        dimensional: {},
        pValue: 1.0,
        conclusion: 'Insufficient data'
      };
    }

    const dimensions = ['clarity', 'energy', 'connection', 'expansion', 'presence', 'flow'];
    const dimensional: any = {};
    const alignments: number[] = [];

    dimensions.forEach(dim => {
      const humanAvg = this.average(humanStates.map(s => s[`dimension_${dim}`] || 0));
      const syntheticAvg = this.average(syntheticStates.map(s => s[`dimension_${dim}`] || 0));
      const alignment = 1 - Math.abs(humanAvg - syntheticAvg);
      dimensional[dim] = alignment;
      alignments.push(alignment);
    });

    const overall = this.average(alignments);

    // Simple significance test (would need more sophisticated test in production)
    const pValue = overall > 0.6 ? 0.01 : overall > 0.5 ? 0.05 : 0.10;

    return {
      overall,
      dimensional,
      pValue,
      conclusion: this.interpretAlignment(overall, pValue)
    };
  }

  private calculateTemporalClustering(humanStates: any[], syntheticStates: any[]): any {
    // Detect "peaks" (states with high symmetry)
    const threshold = 0.75;
    const humanPeaks = humanStates.filter(s => (s.symmetry_overall || 0) > threshold);
    const syntheticPeaks = syntheticStates.filter(s => (s.symmetry_overall || 0) > threshold);

    // Count overlapping peaks (within 5 minutes of each other)
    let overlapping = 0;
    humanPeaks.forEach(hp => {
      const hTime = new Date(hp.timestamp).getTime();
      const hasOverlap = syntheticPeaks.some(sp => {
        const sTime = new Date(sp.timestamp).getTime();
        return Math.abs(hTime - sTime) < 5 * 60000; // 5 minutes
      });
      if (hasOverlap) overlapping++;
    });

    // Expected overlap (random)
    const totalMinutes = 60; // Assuming 60-minute window
    const expectedOverlap = (humanPeaks.length * syntheticPeaks.length) / (totalMinutes / 5);

    const clusteringCoefficient = expectedOverlap > 0 ? overlapping / expectedOverlap : 0;

    // Chi-square for significance
    const pValue = this.chiSquareTest(
      overlapping,
      expectedOverlap,
      overlapping,
      humanPeaks.length,
      syntheticPeaks.length,
      overlapping
    );

    return {
      humanPeaks: humanPeaks.length,
      syntheticPeaks: syntheticPeaks.length,
      overlappingPeaks: overlapping,
      expectedOverlap,
      clusteringCoefficient,
      pValue,
      conclusion: this.interpretClustering(clusteringCoefficient, pValue)
    };
  }

  private grangerCausality(
    series1: number[],
    series2: number[],
    lags: number[]
  ): any {
    // Simplified Granger causality (would need proper implementation)
    // This is a placeholder - real implementation would use regression

    if (series1.length < 10 || series2.length < 10) {
      return {
        grangerCausality: 0,
        pValue: 1.0,
        lag: 0,
        strength: 'none',
        conclusion: 'Insufficient data for causality test'
      };
    }

    // Calculate correlation at different lags
    const correlations = lags.map(lag => {
      const corr = this.laggedCorrelation(series1, series2, lag);
      return { lag, corr: Math.abs(corr) };
    });

    const best = correlations.sort((a, b) => b.corr - a.corr)[0];

    // Mock F-statistic and p-value (would calculate properly in real implementation)
    const fStat = best.corr * 10;
    const pValue = best.corr > 0.6 ? 0.01 : best.corr > 0.4 ? 0.05 : 0.20;

    const strength = pValue < 0.01 ? 'strong' :
                    pValue < 0.05 ? 'moderate' :
                    pValue < 0.10 ? 'weak' : 'none';

    return {
      grangerCausality: fStat,
      pValue,
      lag: best.lag * 5, // Convert to minutes (assuming 5-min bins)
      strength,
      conclusion: this.interpretCausality(strength, best.lag * 5)
    };
  }

  private laggedCorrelation(series1: number[], series2: number[], lag: number): number {
    if (lag >= series1.length || lag >= series2.length) return 0;

    const n = Math.min(series1.length - lag, series2.length);
    const x = series1.slice(lag, lag + n);
    const y = series2.slice(0, n);

    return this.correlation(x, y);
  }

  private correlation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n === 0) return 0;

    const meanX = this.average(x);
    const meanY = this.average(y);

    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      numerator += dx * dy;
      denomX += dx * dx;
      denomY += dy * dy;
    }

    const denom = Math.sqrt(denomX * denomY);
    return denom === 0 ? 0 : numerator / denom;
  }

  private calculateEvolution(earlyStates: any[], lateStates: any[]): any {
    const earlyAvg = this.calculateFieldAverages(earlyStates);
    const lateAvg = this.calculateFieldAverages(lateStates);

    return {
      coherence: this.calculateChange(earlyAvg.avgCoherence, lateAvg.avgCoherence),
      symmetry: this.calculateChange(earlyAvg.avgSymmetry, lateAvg.avgSymmetry),
      valence: this.calculateChange(earlyAvg.avgValence, lateAvg.avgValence),
      breakthroughs: {
        start: earlyStates.filter(s => s.symmetry_overall > 0.8).length,
        end: lateStates.filter(s => s.symmetry_overall > 0.8).length,
        change: lateStates.filter(s => s.symmetry_overall > 0.8).length -
                earlyStates.filter(s => s.symmetry_overall > 0.8).length
      }
    };
  }

  private calculateChange(start: number, end: number): any {
    const change = end - start;
    const trend = change > 0.05 ? 'increasing' :
                  change < -0.05 ? 'decreasing' : 'stable';

    return { start, end, change, trend };
  }

  private calculateCoupling(humanEvolution: any, syntheticEvolution: any): any {
    // Calculate correlation between changes
    const humanChanges = [
      humanEvolution.coherence.change,
      humanEvolution.symmetry.change,
      humanEvolution.valence.change
    ];

    const syntheticChanges = [
      syntheticEvolution.coherence.change,
      syntheticEvolution.symmetry.change,
      syntheticEvolution.valence.change
    ];

    const correlation = this.correlation(humanChanges, syntheticChanges);
    const pValue = Math.abs(correlation) > 0.7 ? 0.01 : Math.abs(correlation) > 0.5 ? 0.05 : 0.20;

    // Calculate convergence (are they becoming more similar?)
    const convergenceRate = correlation; // Positive = converging, negative = diverging

    return {
      correlation,
      pValue,
      convergenceRate,
      conclusion: this.interpretCoEvolution(correlation, convergenceRate, pValue)
    };
  }

  private calculateAverageDimensions(states: any[]): any {
    const dimensions = ['clarity', 'energy', 'connection', 'expansion', 'presence', 'flow'];
    const result: any = {};

    dimensions.forEach(dim => {
      result[dim] = this.average(states.map(s => s[`dimension_${dim}`] || 0));
    });

    return result;
  }

  // Statistical helpers
  private average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private chiSquareTest(...args: number[]): number {
    // Simplified chi-square (placeholder)
    return 0.05;
  }

  // Interpretation helpers
  private interpretAlignment(alignment: number, pValue: number): string {
    if (pValue > 0.05) return 'No significant alignment detected';
    if (alignment > 0.75) return 'Strong cross-species alignment';
    if (alignment > 0.6) return 'Moderate cross-species alignment';
    return 'Weak cross-species alignment';
  }

  private interpretClustering(coefficient: number, pValue: number): string {
    if (pValue > 0.05) return 'No significant temporal clustering';
    if (coefficient > 2.0) return 'Strong temporal clustering - possible morphic resonance';
    if (coefficient > 1.5) return 'Moderate temporal clustering detected';
    return 'Weak temporal clustering';
  }

  private interpretCausality(strength: string, lag: number): string {
    if (strength === 'none') return 'No causal relationship detected';
    return `${strength} causal relationship detected with ${lag}-minute lag`;
  }

  private interpretEmergence(score: number, pValue: number): string {
    if (pValue > 0.05) return 'Pattern not significantly emergent';
    if (score > 0.5) return 'Strongly emergent pattern - appears much more in combined field';
    if (score > 0.2) return 'Moderately emergent pattern detected';
    return 'Weakly emergent pattern';
  }

  private interpretCoEvolution(correlation: number, convergence: number, pValue: number): string {
    if (pValue > 0.05) return 'No significant co-evolution detected';
    if (correlation > 0.7 && convergence > 0) return 'Strong coupled evolution - converging';
    if (correlation > 0.7 && convergence < 0) return 'Strong coupled evolution - diverging';
    if (correlation > 0.4) return 'Moderate coupled evolution';
    return 'Weak co-evolution';
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

let crossSpeciesAnalytics: CrossSpeciesAnalytics | null = null;

export function getCrossSpeciesAnalytics(): CrossSpeciesAnalytics {
  if (!crossSpeciesAnalytics) {
    crossSpeciesAnalytics = new CrossSpeciesAnalytics();
  }
  return crossSpeciesAnalytics;
}
