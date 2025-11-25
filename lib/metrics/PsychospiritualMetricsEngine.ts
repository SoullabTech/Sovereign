/**
 * Psychospiritual Metrics Engine
 * Computes high-level symbolic, archetypal, and narrative metrics
 * Privacy-conscious: no PII, aggregated patterns only
 */

import { Soulprint, soulprintTracker } from '../beta/SoulprintTracking';

export interface ArchetypeCoherenceScore {
  score: number; // 0-1
  activeArchetypes: string[];
  tensions: Array<{ from: string; to: string; tensionLevel: number }>;
  recommendations: string[];
}

export interface EmotionalCoherenceMetrics {
  volatilityIndex: number; // 0-1, lower is more stable
  trendDirection: 'rising' | 'falling' | 'stable' | 'volatile';
  dominantEmotions: Array<{ emotion: string; frequency: number }>;
  repressedEmotions: string[]; // Low-expression states
  emotionalDrift: number; // Distance from baseline
}

export interface NarrativeProgressionMetrics {
  activeThreads: number;
  completedThreads: number;
  stagnantThreads: number;
  averageThreadStrength: number;
  narrativeCoherence: number; // How well threads relate
  breakthroughFrequency: number; // Per month
  driftAlerts: string[]; // When threads stagnate
}

export interface ShadowIntegrationMetrics {
  integrationScore: number; // 0-1
  shadowWorkFrequency: number; // Times per month
  suppressedArchetypes: string[];
  integrationVelocity: number; // Rate of change
  lastShadowEncounter?: Date;
}

export interface RitualIntegrationMetrics {
  completionRate: number; // % completed
  averageDepth: number; // 0-1
  averageIntegration: number; // 0-1
  totalRituals: number;
  mostRecentRitual?: Date;
  elementalDistribution: Record<string, number>;
}

export interface PsychospiritualGrowthIndex {
  overallScore: number; // 0-1 composite
  components: {
    shadowIntegration: number;
    phaseCompletion: number;
    emotionalCoherence: number;
    archetypeAlignment: number;
    ritualDepth: number;
  };
  trend: 'ascending' | 'descending' | 'stable';
  growthVelocity: number; // Rate of change
}

export interface SymbolicEvolutionMetrics {
  activeSymbolCount: number;
  archivedSymbolCount: number;
  symbolTurnoverRate: number; // How often symbols change
  topSymbols: Array<{ symbol: string; frequency: number; elementalResonance?: string }>;
  symbolDiversity: number; // 0-1, higher = more varied
  stagnationRisk: boolean;
}

export interface SpiralogicPhaseMetrics {
  currentPhase: string;
  phaseDuration: number; // Days in current phase
  averagePhaseDuration: number;
  phaseCompletionQuality: number; // 0-1
  totalPhases: number;
  phaseProgression: Array<{ phase: string; duration: number; quality: number }>;
}

export interface ComprehensiveMetricsSnapshot {
  userId: string;
  timestamp: Date;
  journeyDuration: number; // Days since creation

  archetypeCoherence: ArchetypeCoherenceScore;
  emotionalLandscape: EmotionalCoherenceMetrics;
  narrativeProgression: NarrativeProgressionMetrics;
  shadowIntegration: ShadowIntegrationMetrics;
  ritualIntegration: RitualIntegrationMetrics;
  growthIndex: PsychospiritualGrowthIndex;
  symbolicEvolution: SymbolicEvolutionMetrics;
  spiralogicPhase: SpiralogicPhaseMetrics;

  alerts: string[];
  recommendations: string[];
}

export class PsychospiritualMetricsEngine {

  computeArchetypeCoherence(soulprint: Soulprint): ArchetypeCoherenceScore {
    const recentShifts = soulprint.archetypeHistory.slice(-5);
    const activeArchetypes = [...new Set(recentShifts.map(s => s.toArchetype))];

    const knownTensions: Record<string, string[]> = {
      'Warrior': ['Lover', 'Healer'],
      'Shadow': ['Innocent', 'Hero'],
      'Seeker': ['Ruler', 'Caregiver'],
      'Sage': ['Fool', 'Rebel']
    };

    const tensions: Array<{ from: string; to: string; tensionLevel: number }> = [];

    for (let i = 0; i < activeArchetypes.length; i++) {
      for (let j = i + 1; j < activeArchetypes.length; j++) {
        const arch1 = activeArchetypes[i];
        const arch2 = activeArchetypes[j];
        if (knownTensions[arch1]?.includes(arch2) || knownTensions[arch2]?.includes(arch1)) {
          tensions.push({
            from: arch1,
            to: arch2,
            tensionLevel: 0.7
          });
        }
      }
    }

    const score = tensions.length === 0 ? 1.0 : Math.max(0.3, 1.0 - (tensions.length * 0.2));

    const recommendations: string[] = [];
    if (tensions.length > 0) {
      recommendations.push(`Active tension between ${tensions[0].from} and ${tensions[0].to} - consider integration ritual`);
    }
    if (activeArchetypes.length < 2) {
      recommendations.push('Low archetypal diversity - explore new aspects');
    }

    return {
      score,
      activeArchetypes,
      tensions,
      recommendations
    };
  }

  computeEmotionalCoherence(soulprint: Soulprint): EmotionalCoherenceMetrics {
    const recentHistory = soulprint.emotionalHistory.slice(-10);

    const volatilities = recentHistory.map(h => h.volatility);
    const avgVolatility = volatilities.reduce((a, b) => a + b, 0) / volatilities.length || 0;

    const emotionFrequency = new Map<string, number>();
    recentHistory.forEach(state => {
      state.dominantEmotions.forEach(emotion => {
        emotionFrequency.set(emotion, (emotionFrequency.get(emotion) || 0) + 1);
      });
    });

    const allEmotions = ['joy', 'grief', 'anger', 'fear', 'love', 'confusion', 'clarity', 'peace'];
    const repressedEmotions = allEmotions.filter(e => !emotionFrequency.has(e));

    const currentState = soulprint.emotionalState;
    const emotionalDrift = Math.abs(currentState.current - currentState.baseline);

    return {
      volatilityIndex: avgVolatility,
      trendDirection: currentState.trend,
      dominantEmotions: Array.from(emotionFrequency.entries())
        .map(([emotion, frequency]) => ({ emotion, frequency }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5),
      repressedEmotions: repressedEmotions.slice(0, 3),
      emotionalDrift
    };
  }

  computeNarrativeProgression(soulprint: Soulprint): NarrativeProgressionMetrics {
    const activeThreads = soulprint.narrativeThreads.filter(t => t.status === 'active').length;
    const completedThreads = soulprint.narrativeThreads.filter(t => t.status === 'integrated').length;
    const stagnantThreads = soulprint.narrativeThreads.filter(t => {
      const daysSinceStart = (Date.now() - t.startedAt.getTime()) / (1000 * 60 * 60 * 24);
      return t.status === 'active' && daysSinceStart > 14;
    }).length;

    const avgStrength = soulprint.narrativeThreads.length > 0
      ? soulprint.narrativeThreads.reduce((sum, t) => sum + t.strength, 0) / soulprint.narrativeThreads.length
      : 0;

    const symbolOverlap = this.calculateSymbolOverlap(soulprint.narrativeThreads);
    const narrativeCoherence = symbolOverlap;

    const breakthroughsLastMonth = soulprint.breakthroughMoments.filter(b => {
      const daysAgo = (Date.now() - b.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    }).length;

    const driftAlerts: string[] = [];
    if (stagnantThreads > 0) {
      driftAlerts.push(`${stagnantThreads} thread(s) stagnant for >14 days`);
    }
    if (activeThreads === 0 && soulprint.narrativeThreads.length > 0) {
      driftAlerts.push('No active narrative threads - possible disconnection');
    }

    return {
      activeThreads,
      completedThreads,
      stagnantThreads,
      averageThreadStrength: avgStrength,
      narrativeCoherence,
      breakthroughFrequency: breakthroughsLastMonth,
      driftAlerts
    };
  }

  private calculateSymbolOverlap(threads: Soulprint['narrativeThreads']): number {
    if (threads.length < 2) return 1.0;

    const allSymbols = new Set<string>();
    threads.forEach(t => t.relatedSymbols.forEach(s => allSymbols.add(s)));

    let totalOverlap = 0;
    for (let i = 0; i < threads.length; i++) {
      for (let j = i + 1; j < threads.length; j++) {
        const symbols1 = new Set(threads[i].relatedSymbols);
        const symbols2 = new Set(threads[j].relatedSymbols);
        const intersection = new Set([...symbols1].filter(x => symbols2.has(x)));
        const union = new Set([...symbols1, ...symbols2]);
        if (union.size > 0) {
          totalOverlap += intersection.size / union.size;
        }
      }
    }

    const maxPairs = (threads.length * (threads.length - 1)) / 2;
    return maxPairs > 0 ? totalOverlap / maxPairs : 0;
  }

  computeShadowIntegration(soulprint: Soulprint): ShadowIntegrationMetrics {
    const shadowShifts = soulprint.archetypeHistory.filter(s => s.shadowWork);
    const shadowWorkLastMonth = shadowShifts.filter(s => {
      const daysAgo = (Date.now() - s.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    }).length;

    const allArchetypes = ['Warrior', 'Lover', 'Sage', 'Seeker', 'Shadow', 'Healer', 'Creator', 'Ruler'];
    const expressedArchetypes = new Set(soulprint.archetypeHistory.map(s => s.toArchetype));
    const suppressedArchetypes = allArchetypes.filter(a => !expressedArchetypes.has(a));

    const lastShadowShift = shadowShifts[shadowShifts.length - 1];
    const previousScore = shadowShifts.length >= 2
      ? shadowShifts[shadowShifts.length - 2].integrationLevel
      : 0;
    const integrationVelocity = soulprint.shadowIntegrationScore - previousScore;

    return {
      integrationScore: soulprint.shadowIntegrationScore,
      shadowWorkFrequency: shadowWorkLastMonth,
      suppressedArchetypes: suppressedArchetypes.slice(0, 3),
      integrationVelocity,
      lastShadowEncounter: lastShadowShift?.timestamp
    };
  }

  computeRitualIntegration(soulprint: Soulprint): RitualIntegrationMetrics {
    const rituals = soulprint.ritualsCompleted;

    const completionRate = rituals.length > 0 ? 1.0 : 0;

    const avgDepth = rituals.length > 0
      ? rituals.reduce((sum, r) => sum + r.depth, 0) / rituals.length
      : 0;

    const avgIntegration = rituals.length > 0
      ? rituals.reduce((sum, r) => sum + r.integration, 0) / rituals.length
      : 0;

    const elementalDistribution: Record<string, number> = {};
    rituals.forEach(r => {
      elementalDistribution[r.element] = (elementalDistribution[r.element] || 0) + 1;
    });

    const mostRecent = rituals.length > 0 ? rituals[rituals.length - 1].completedAt : undefined;

    return {
      completionRate,
      averageDepth: avgDepth,
      averageIntegration: avgIntegration,
      totalRituals: rituals.length,
      mostRecentRitual: mostRecent,
      elementalDistribution
    };
  }

  computeGrowthIndex(
    shadowMetrics: ShadowIntegrationMetrics,
    ritualMetrics: RitualIntegrationMetrics,
    emotionalMetrics: EmotionalCoherenceMetrics,
    archetypeMetrics: ArchetypeCoherenceScore,
    soulprint: Soulprint
  ): PsychospiritualGrowthIndex {
    const currentPhase = soulprint.phaseHistory[soulprint.phaseHistory.length - 1];
    const phaseCompletion = currentPhase?.completionQuality || 0;

    const emotionalCoherence = 1.0 - emotionalMetrics.volatilityIndex;

    const components = {
      shadowIntegration: shadowMetrics.integrationScore,
      phaseCompletion: phaseCompletion,
      emotionalCoherence: emotionalCoherence,
      archetypeAlignment: archetypeMetrics.score,
      ritualDepth: ritualMetrics.averageDepth
    };

    const overallScore = (
      components.shadowIntegration * 0.2 +
      components.phaseCompletion * 0.2 +
      components.emotionalCoherence * 0.2 +
      components.archetypeAlignment * 0.2 +
      components.ritualDepth * 0.2
    );

    const historicalScores = soulprint.phaseHistory
      .filter(p => p.completionQuality)
      .map(p => p.completionQuality);

    let trend: 'ascending' | 'descending' | 'stable' = 'stable';
    if (historicalScores.length >= 2) {
      const recent = historicalScores.slice(-3);
      const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
      if (avg > phaseCompletion + 0.1) trend = 'descending';
      else if (avg < phaseCompletion - 0.1) trend = 'ascending';
    }

    const growthVelocity = shadowMetrics.integrationVelocity;

    return {
      overallScore,
      components,
      trend,
      growthVelocity
    };
  }

  computeSymbolicEvolution(soulprint: Soulprint): SymbolicEvolutionMetrics {
    const activeCount = soulprint.activeSymbols.length;
    const archivedCount = soulprint.archivedSymbols.length;

    const totalSymbols = activeCount + archivedCount;
    const symbolTurnoverRate = totalSymbols > 0 ? archivedCount / totalSymbols : 0;

    const topSymbols = soulprint.activeSymbols
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5)
      .map(s => ({
        symbol: s.symbol,
        frequency: s.frequency,
        elementalResonance: s.elementalResonance
      }));

    const uniqueSymbols = new Set(soulprint.activeSymbols.map(s => s.symbol));
    const totalOccurrences = soulprint.activeSymbols.reduce((sum, s) => sum + s.frequency, 0);
    const symbolDiversity = totalOccurrences > 0 ? uniqueSymbols.size / Math.sqrt(totalOccurrences) : 0;

    const recentSymbols = soulprint.activeSymbols.filter(s => {
      const daysAgo = (Date.now() - s.lastMentioned.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7;
    });
    const stagnationRisk = recentSymbols.length === 0 && activeCount > 0;

    return {
      activeSymbolCount: activeCount,
      archivedSymbolCount: archivedCount,
      symbolTurnoverRate,
      topSymbols,
      symbolDiversity: Math.min(symbolDiversity, 1.0),
      stagnationRisk
    };
  }

  computeSpiralogicPhase(soulprint: Soulprint): SpiralogicPhaseMetrics {
    const currentPhase = soulprint.phaseHistory[soulprint.phaseHistory.length - 1];
    const phaseDuration = currentPhase.endedAt
      ? (currentPhase.endedAt.getTime() - currentPhase.startedAt.getTime()) / (1000 * 60 * 60 * 24)
      : (Date.now() - currentPhase.startedAt.getTime()) / (1000 * 60 * 60 * 24);

    const completedPhases = soulprint.phaseHistory.filter(p => p.endedAt && p.duration);
    const avgDuration = completedPhases.length > 0
      ? completedPhases.reduce((sum, p) => sum + (p.duration || 0), 0) / completedPhases.length
      : 0;

    const phaseProgression = soulprint.phaseHistory.map(p => ({
      phase: p.phase,
      duration: p.duration || 0,
      quality: p.completionQuality
    }));

    return {
      currentPhase: currentPhase.phase,
      phaseDuration,
      averagePhaseDuration: avgDuration,
      phaseCompletionQuality: currentPhase.completionQuality,
      totalPhases: soulprint.phaseHistory.length,
      phaseProgression
    };
  }

  generateComprehensiveSnapshot(userId: string): ComprehensiveMetricsSnapshot | null {
    const soulprint = soulprintTracker.getSoulprint(userId);
    if (!soulprint) return null;

    const archetypeCoherence = this.computeArchetypeCoherence(soulprint);
    const emotionalLandscape = this.computeEmotionalCoherence(soulprint);
    const narrativeProgression = this.computeNarrativeProgression(soulprint);
    const shadowIntegration = this.computeShadowIntegration(soulprint);
    const ritualIntegration = this.computeRitualIntegration(soulprint);
    const symbolicEvolution = this.computeSymbolicEvolution(soulprint);
    const spiralogicPhase = this.computeSpiralogicPhase(soulprint);

    const growthIndex = this.computeGrowthIndex(
      shadowIntegration,
      ritualIntegration,
      emotionalLandscape,
      archetypeCoherence,
      soulprint
    );

    const alerts = [
      ...soulprintTracker.checkThresholds(userId),
      ...narrativeProgression.driftAlerts
    ];

    const recommendations = [
      ...archetypeCoherence.recommendations
    ];

    if (emotionalLandscape.repressedEmotions.length > 0) {
      recommendations.push(`Explore repressed emotions: ${emotionalLandscape.repressedEmotions.join(', ')}`);
    }

    if (shadowIntegration.suppressedArchetypes.length > 0) {
      recommendations.push(`Engage suppressed archetypes: ${shadowIntegration.suppressedArchetypes.join(', ')}`);
    }

    const journeyDuration = Math.floor(
      (Date.now() - soulprint.created.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      userId,
      timestamp: new Date(),
      journeyDuration,
      archetypeCoherence,
      emotionalLandscape,
      narrativeProgression,
      shadowIntegration,
      ritualIntegration,
      growthIndex,
      symbolicEvolution,
      spiralogicPhase,
      alerts,
      recommendations
    };
  }

  generateAggregatedMetrics(userIds?: string[]): any {
    const soulprints = userIds
      ? userIds.map(id => soulprintTracker.getSoulprint(id)).filter(Boolean) as Soulprint[]
      : soulprintTracker.getAllSoulprints();

    if (soulprints.length === 0) {
      return { error: 'No soulprints found' };
    }

    const snapshots = soulprints.map(sp =>
      this.generateComprehensiveSnapshot(sp.userId)
    ).filter(Boolean) as ComprehensiveMetricsSnapshot[];

    const avgGrowthIndex = snapshots.reduce((sum, s) => sum + s.growthIndex.overallScore, 0) / snapshots.length;

    const phaseDistribution: Record<string, number> = {};
    snapshots.forEach(s => {
      phaseDistribution[s.spiralogicPhase.currentPhase] =
        (phaseDistribution[s.spiralogicPhase.currentPhase] || 0) + 1;
    });

    const archetypeFrequency: Record<string, number> = {};
    snapshots.forEach(s => {
      s.archetypeCoherence.activeArchetypes.forEach(arch => {
        archetypeFrequency[arch] = (archetypeFrequency[arch] || 0) + 1;
      });
    });

    const avgShadowIntegration = snapshots.reduce((sum, s) =>
      sum + s.shadowIntegration.integrationScore, 0
    ) / snapshots.length;

    const totalBreakthroughs = snapshots.reduce((sum, s) =>
      sum + s.narrativeProgression.breakthroughFrequency, 0
    );

    return {
      totalUsers: snapshots.length,
      averageGrowthIndex: avgGrowthIndex,
      averageShadowIntegration: avgShadowIntegration,
      totalBreakthroughs,
      phaseDistribution,
      archetypeFrequency,
      generatedAt: new Date()
    };
  }
}

export const metricsEngine = new PsychospiritualMetricsEngine();