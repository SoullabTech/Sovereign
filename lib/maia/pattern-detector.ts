import type { SoulprintSnapshot } from "@/lib/memory/soulprint";

export interface EmergentPattern {
  type: 'elemental_cycle' | 'phase_loop' | 'archetype_frequency' | 'synchronicity';
  pattern: string;
  strength: number;
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
  insight: string;
}

export interface PatternAnalysis {
  patterns: EmergentPattern[];
  dominantTheme: string;
  growthDirection: string;
  synchronicities: string[];
  recommendations: string[];
}

export class PatternDetector {
  private readonly MIN_PATTERN_STRENGTH = 0.3;
  private readonly MIN_OCCURRENCES = 3;

  detectElementalCycles(soulprint: SoulprintSnapshot): EmergentPattern[] {
    const history = soulprint.spiralHistory;
    if (history.length < 5) return [];

    const cycles: EmergentPattern[] = [];
    const cycleMap = new Map<string, number>();

    for (let i = 0; i < history.length - 2; i++) {
      const sequence = `${history[i]} → ${history[i + 1]} → ${history[i + 2]}`;
      cycleMap.set(sequence, (cycleMap.get(sequence) || 0) + 1);
    }

    for (const [pattern, count] of cycleMap.entries()) {
      if (count >= this.MIN_OCCURRENCES) {
        const strength = count / (history.length - 2);
        cycles.push({
          type: 'elemental_cycle',
          pattern,
          strength,
          occurrences: count,
          firstSeen: soulprint.lastUpdated,
          lastSeen: soulprint.lastUpdated,
          insight: this.generateCycleInsight(pattern, count)
        });
      }
    }

    return cycles;
  }

  detectPhaseLoops(soulprint: SoulprintSnapshot): EmergentPattern[] {
    const phases = soulprint.spiralHistory.slice(-10);
    if (phases.length < 5) return [];

    const loops: EmergentPattern[] = [];
    const phaseFrequency = new Map<string, number>();

    phases.forEach(phase => {
      phaseFrequency.set(phase, (phaseFrequency.get(phase) || 0) + 1);
    });

    for (const [phase, count] of phaseFrequency.entries()) {
      const strength = count / phases.length;
      if (strength >= this.MIN_PATTERN_STRENGTH && count >= this.MIN_OCCURRENCES) {
        loops.push({
          type: 'phase_loop',
          pattern: `Recurring ${phase} phase`,
          strength,
          occurrences: count,
          firstSeen: soulprint.lastUpdated,
          lastSeen: soulprint.lastUpdated,
          insight: this.generatePhaseLoopInsight(phase, strength)
        });
      }
    }

    return loops;
  }

  detectArchetypePatterns(soulprint: SoulprintSnapshot): EmergentPattern[] {
    const patterns: EmergentPattern[] = [];
    const archetypes = Object.entries(soulprint.archetypeFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (archetypes.length < 2) return [];

    const totalFrequency = archetypes.reduce((sum, [_, freq]) => sum + freq, 0);

    archetypes.forEach(([archetype, frequency]) => {
      const strength = frequency / totalFrequency;
      if (strength >= this.MIN_PATTERN_STRENGTH) {
        patterns.push({
          type: 'archetype_frequency',
          pattern: `${archetype} archetype`,
          strength,
          occurrences: frequency,
          firstSeen: soulprint.lastUpdated,
          lastSeen: soulprint.lastUpdated,
          insight: this.generateArchetypeInsight(archetype, strength)
        });
      }
    });

    return patterns;
  }

  detectSynchronicities(soulprint: SoulprintSnapshot): EmergentPattern[] {
    const synchronicities: EmergentPattern[] = [];

    const recentTransitions = soulprint.phaseTransitions.slice(-5);
    const elementalBalance = soulprint.elementalBalance;

    const balanceEntries = Object.entries(elementalBalance)
      .sort((a, b) => b[1] - a[1]);

    if (balanceEntries.length >= 2) {
      const [first, second] = balanceEntries;
      const difference = first[1] - second[1];

      if (difference < 2 && first[1] > 0) {
        synchronicities.push({
          type: 'synchronicity',
          pattern: `${first[0]}-${second[0]} balance`,
          strength: 0.8,
          occurrences: 1,
          firstSeen: soulprint.lastUpdated,
          lastSeen: soulprint.lastUpdated,
          insight: `Your ${first[0]} and ${second[0]} energies are in remarkable harmony, suggesting deep integration`
        });
      }
    }

    return synchronicities;
  }

  analyze(soulprint: SoulprintSnapshot): PatternAnalysis {
    const elementalCycles = this.detectElementalCycles(soulprint);
    const phaseLoops = this.detectPhaseLoops(soulprint);
    const archetypePatterns = this.detectArchetypePatterns(soulprint);
    const synchronicities = this.detectSynchronicities(soulprint);

    const allPatterns = [
      ...elementalCycles,
      ...phaseLoops,
      ...archetypePatterns,
      ...synchronicities
    ].sort((a, b) => b.strength - a.strength);

    return {
      patterns: allPatterns,
      dominantTheme: this.identifyDominantTheme(soulprint, allPatterns),
      growthDirection: this.identifyGrowthDirection(soulprint),
      synchronicities: synchronicities.map(s => s.insight),
      recommendations: this.generateRecommendations(soulprint, allPatterns)
    };
  }

  private generateCycleInsight(pattern: string, count: number): string {
    return `This cycle appears ${count} times in your journey, suggesting a recurring theme in your transformation`;
  }

  private generatePhaseLoopInsight(phase: string, strength: number): string {
    const percentage = Math.round(strength * 100);
    return `You spend ${percentage}% of your time in ${phase}, indicating this is a significant space for your growth`;
  }

  private generateArchetypeInsight(archetype: string, strength: number): string {
    const percentage = Math.round(strength * 100);
    return `The ${archetype} archetype represents ${percentage}% of your expression, showing strong resonance with this energy`;
  }

  private identifyDominantTheme(soulprint: SoulprintSnapshot, patterns: EmergentPattern[]): string {
    if (patterns.length === 0) return "Beginning exploration";

    const strongestPattern = patterns[0];
    const element = soulprint.dominantElement;

    return `${element.charAt(0).toUpperCase() + element.slice(1)}-centered transformation through ${strongestPattern.pattern}`;
  }

  private identifyGrowthDirection(soulprint: SoulprintSnapshot): string {
    const recentPhases = soulprint.spiralHistory.slice(-3);
    const elementalEntries = Object.entries(soulprint.elementalBalance)
      .sort((a, b) => a[1] - b[1]);

    const leastActivated = elementalEntries[0]?.[0] || 'unknown';

    return `Expanding toward ${leastActivated} while deepening ${soulprint.dominantElement}`;
  }

  private generateRecommendations(soulprint: SoulprintSnapshot, patterns: EmergentPattern[]): string[] {
    const recommendations: string[] = [];

    const elementalBalance = Object.entries(soulprint.elementalBalance)
      .sort((a, b) => b[1] - a[1]);

    if (elementalBalance.length >= 2) {
      const weakest = elementalBalance[elementalBalance.length - 1];
      if (weakest[1] < 2) {
        recommendations.push(`Consider exploring ${weakest[0]} energy to bring more balance to your journey`);
      }
    }

    const recentPhase = soulprint.spiralHistory[soulprint.spiralHistory.length - 1];
    if (recentPhase) {
      recommendations.push(`Continue deepening your work in the ${recentPhase} phase`);
    }

    if (patterns.length > 0 && patterns[0].type === 'phase_loop') {
      recommendations.push(`Notice the recurring ${patterns[0].pattern} - this may be a threshold waiting to be crossed`);
    }

    return recommendations;
  }
}

export const patternDetector = new PatternDetector();