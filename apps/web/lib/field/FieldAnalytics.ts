/**
 * Field Analytics - Collective Consciousness Metrics
 *
 * Aggregates data across all users to show collective patterns,
 * symbolic waves, and transformation energy in the Field.
 */

export interface SymbolicWave {
  symbol: string;
  intensity: number; // 0-1
  velocity: number; // Rate of change
  trend: 'rising' | 'falling' | 'stable';
  firstDetected: Date;
  peakTime?: Date;
}

export interface ArchetypeActivation {
  archetype: string;
  activeUsers: number;
  intensity: number; // 0-1
  trend: 'activating' | 'integrating' | 'dormant';
  emergenceDate: Date;
}

export interface CollectiveMetrics {
  totalUsers: number;
  activeToday: number;
  totalEntries: number;
  totalSymbols: number;
  avgCoherence: number;
  transformationEnergy: number; // 0-1 collective transformation velocity
}

export interface FieldState {
  timestamp: Date;
  metrics: CollectiveMetrics;
  symbolicWaves: SymbolicWave[];
  archetypeActivations: ArchetypeActivation[];
  dominantTheme: string;
  fieldCoherence: number; // 0-1
  insights: string[];
}

export class FieldAnalytics {
  /**
   * Generate current field state (simulated for beta)
   *
   * In production, this would aggregate real user data from Supabase.
   * For beta, we generate realistic simulated data based on patterns.
   */
  static generateFieldState(): FieldState {
    const now = new Date();

    // Simulated metrics (in production, query Supabase)
    const metrics: CollectiveMetrics = {
      totalUsers: this.simulateUserCount(),
      activeToday: this.simulateActiveUsers(),
      totalEntries: this.simulateTotalEntries(),
      totalSymbols: this.simulateSymbolCount(),
      avgCoherence: this.simulateAvgCoherence(),
      transformationEnergy: this.simulateTransformationEnergy()
    };

    // Generate symbolic waves
    const symbolicWaves = this.generateSymbolicWaves();

    // Generate archetype activations
    const archetypeActivations = this.generateArchetypeActivations();

    // Determine dominant theme
    const dominantTheme = this.determineDominantTheme(symbolicWaves, archetypeActivations);

    // Calculate field coherence
    const fieldCoherence = this.calculateFieldCoherence(metrics, symbolicWaves);

    // Generate insights
    const insights = this.generateFieldInsights(symbolicWaves, archetypeActivations, metrics);

    return {
      timestamp: now,
      metrics,
      symbolicWaves,
      archetypeActivations,
      dominantTheme,
      fieldCoherence,
      insights
    };
  }

  /**
   * Get historical field data (simulated)
   */
  static getFieldHistory(days: number = 7): FieldState[] {
    const history: FieldState[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Generate state for that day (simplified)
      history.push({
        ...this.generateFieldState(),
        timestamp: date
      });
    }

    return history;
  }

  // === Simulation Methods (Replace with real data in production) ===

  private static simulateUserCount(): number {
    return Math.floor(50 + Math.random() * 150); // 50-200 users
  }

  private static simulateActiveUsers(): number {
    return Math.floor(10 + Math.random() * 40); // 10-50 active today
  }

  private static simulateTotalEntries(): number {
    return Math.floor(500 + Math.random() * 1500); // 500-2000 entries
  }

  private static simulateSymbolCount(): number {
    return Math.floor(80 + Math.random() * 120); // 80-200 unique symbols
  }

  private static simulateAvgCoherence(): number {
    return 0.6 + Math.random() * 0.25; // 0.60-0.85
  }

  private static simulateTransformationEnergy(): number {
    const hour = new Date().getHours();
    // Energy peaks in evening (18:00-22:00)
    const baseEnergy = 0.4 + Math.random() * 0.3;
    const timeBoost = hour >= 18 && hour <= 22 ? 0.2 : 0;
    return Math.min(baseEnergy + timeBoost, 1);
  }

  private static generateSymbolicWaves(): SymbolicWave[] {
    const symbols = [
      'River', 'Bridge', 'Shadow', 'Light', 'Fire', 'Path',
      'Mirror', 'Tree', 'Ocean', 'Mountain', 'Door', 'Circle'
    ];

    return symbols.map(symbol => {
      const intensity = Math.random();
      const velocity = (Math.random() - 0.5) * 0.2; // -0.1 to +0.1

      let trend: 'rising' | 'falling' | 'stable';
      if (velocity > 0.05) trend = 'rising';
      else if (velocity < -0.05) trend = 'falling';
      else trend = 'stable';

      return {
        symbol,
        intensity,
        velocity,
        trend,
        firstDetected: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        peakTime: intensity > 0.7 ? new Date() : undefined
      };
    }).sort((a, b) => b.intensity - a.intensity);
  }

  private static generateArchetypeActivations(): ArchetypeActivation[] {
    const archetypes = [
      'Seeker', 'Healer', 'Shadow', 'Mystic', 'Warrior', 'Lover', 'Sage'
    ];

    return archetypes.map(archetype => {
      const activeUsers = Math.floor(Math.random() * 50);
      const intensity = Math.random();

      let trend: 'activating' | 'integrating' | 'dormant';
      if (intensity > 0.7) trend = 'activating';
      else if (intensity > 0.4) trend = 'integrating';
      else trend = 'dormant';

      return {
        archetype,
        activeUsers,
        intensity,
        trend,
        emergenceDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)
      };
    }).sort((a, b) => b.intensity - a.intensity);
  }

  private static determineDominantTheme(
    waves: SymbolicWave[],
    activations: ArchetypeActivation[]
  ): string {
    const topSymbol = waves[0]?.symbol || 'Journey';
    const topArchetype = activations[0]?.archetype || 'Seeker';

    const themes: Record<string, string> = {
      'River-Seeker': 'Flow & Exploration',
      'Shadow-Shadow': 'Deep Integration',
      'Bridge-Healer': 'Connection & Healing',
      'Light-Mystic': 'Illumination & Insight',
      'Fire-Warrior': 'Transformation & Action',
      'Path-Sage': 'Wisdom & Direction'
    };

    return themes[`${topSymbol}-${topArchetype}`] || 'Collective Transformation';
  }

  private static calculateFieldCoherence(
    metrics: CollectiveMetrics,
    waves: SymbolicWave[]
  ): number {
    const coherenceScore = metrics.avgCoherence * 0.6;
    const waveCoherence = waves.filter(w => w.intensity > 0.5).length / waves.length * 0.4;

    return coherenceScore + waveCoherence;
  }

  private static generateFieldInsights(
    waves: SymbolicWave[],
    activations: ArchetypeActivation[],
    metrics: CollectiveMetrics
  ): string[] {
    const insights: string[] = [];

    // Rising symbol
    const rising = waves.find(w => w.trend === 'rising');
    if (rising) {
      insights.push(`${rising.symbol} is emerging strongly — ${Math.round(rising.intensity * 100)}% intensity across the field.`);
    }

    // Dominant archetype
    const dominant = activations[0];
    if (dominant && dominant.intensity > 0.6) {
      insights.push(`The ${dominant.archetype} archetype is highly active (${dominant.activeUsers} users engaging).`);
    }

    // Transformation energy
    if (metrics.transformationEnergy > 0.7) {
      insights.push('High transformation energy detected. The collective is in a state of active change.');
    }

    // Field coherence
    const coherence = this.calculateFieldCoherence(metrics, waves);
    if (coherence > 0.75) {
      insights.push('The field shows strong coherence. Patterns are aligning across users.');
    }

    // Activity level
    const activityRate = metrics.activeToday / metrics.totalUsers;
    if (activityRate > 0.3) {
      insights.push(`${Math.round(activityRate * 100)}% of users are actively journaling today.`);
    }

    return insights;
  }

  /**
   * Get trending symbols (rising waves)
   */
  static getTrendingSymbols(fieldState: FieldState): SymbolicWave[] {
    return fieldState.symbolicWaves
      .filter(w => w.trend === 'rising')
      .slice(0, 5);
  }

  /**
   * Get activating archetypes
   */
  static getActivatingArchetypes(fieldState: FieldState): ArchetypeActivation[] {
    return fieldState.archetypeActivations
      .filter(a => a.trend === 'activating')
      .slice(0, 3);
  }
}

export const fieldAnalytics = FieldAnalytics;