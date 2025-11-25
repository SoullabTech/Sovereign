/**
 * Journal-to-Soulprint Integration
 * Updates user's soulprint based on journal entries
 */

import { JournalingResponse, JournalingMode } from '../journaling/JournalingPrompts';

export interface SoulprintUpdate {
  userId: string;
  symbols: string[];
  archetypes: string[];
  emotions: string[];
  mode: JournalingMode;
  context: 'journal';
  intensity?: number;
  timestamp: string;
}

export interface GrowthMetricsUpdate {
  userId: string;
  journalFrequency: number;
  shadowWorkDepth: number;
  emotionalCoherence: number;
  symbolicDiversity: number;
  timestamp: string;
}

export class JournalSoulprintIntegration {
  private static calculateIntensity(reflection: JournalingResponse): number {
    const baseIntensity = 0.5;

    const symbolCount = reflection.symbols.length;
    const archetypeCount = reflection.archetypes.length;

    const intensity = baseIntensity + (symbolCount * 0.05) + (archetypeCount * 0.1);

    return Math.min(intensity, 1.0);
  }

  static async updateSoulprintFromJournal(
    userId: string,
    mode: JournalingMode,
    reflection: JournalingResponse
  ): Promise<{ success: boolean; updates: SoulprintUpdate }> {
    const intensity = this.calculateIntensity(reflection);

    const soulprintUpdate: SoulprintUpdate = {
      userId,
      symbols: reflection.symbols,
      archetypes: reflection.archetypes,
      emotions: [reflection.emotionalTone],
      mode,
      context: 'journal',
      intensity,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch('/api/soulprint/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(soulprintUpdate)
      });

      if (!response.ok) {
        throw new Error('Soulprint update failed');
      }

      return { success: true, updates: soulprintUpdate };
    } catch (error) {
      console.error('Soulprint integration error:', error);
      return { success: false, updates: soulprintUpdate };
    }
  }

  static async updateGrowthMetrics(
    userId: string,
    journalEntries: Array<{ mode: JournalingMode; timestamp: string; reflection: JournalingResponse }>
  ): Promise<{ success: boolean; metrics: GrowthMetricsUpdate }> {
    const last30Days = journalEntries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - entryDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    });

    const journalFrequency = last30Days.length;

    const shadowWorkEntries = last30Days.filter(e => e.mode === 'shadow');
    const shadowWorkDepth = shadowWorkEntries.length / Math.max(journalFrequency, 1);

    const uniqueEmotions = new Set(last30Days.map(e => e.reflection.emotionalTone));
    const emotionalCoherence = uniqueEmotions.size > 3 ? 0.8 : 0.5;

    const allSymbols = new Set(last30Days.flatMap(e => e.reflection.symbols));
    const symbolicDiversity = Math.min(allSymbols.size / 20, 1.0);

    const metrics: GrowthMetricsUpdate = {
      userId,
      journalFrequency,
      shadowWorkDepth,
      emotionalCoherence,
      symbolicDiversity,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch('/api/soulprint/growth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics)
      });

      if (!response.ok) {
        throw new Error('Growth metrics update failed');
      }

      return { success: true, metrics };
    } catch (error) {
      console.error('Growth metrics update error:', error);
      return { success: false, metrics };
    }
  }

  static getModeWeights(mode: JournalingMode): {
    shadowWeight: number;
    emotionalWeight: number;
    symbolicWeight: number;
  } {
    const weights = {
      free: { shadowWeight: 0.3, emotionalWeight: 0.5, symbolicWeight: 0.7 },
      dream: { shadowWeight: 0.5, emotionalWeight: 0.4, symbolicWeight: 0.9 },
      emotional: { shadowWeight: 0.4, emotionalWeight: 0.9, symbolicWeight: 0.5 },
      shadow: { shadowWeight: 0.95, emotionalWeight: 0.6, symbolicWeight: 0.7 },
      direction: { shadowWeight: 0.4, emotionalWeight: 0.5, symbolicWeight: 0.6 }
    };

    return weights[mode];
  }

  static generateJournalingSummary(
    entries: Array<{ mode: JournalingMode; reflection: JournalingResponse }>
  ): {
    topSymbols: Array<{ symbol: string; count: number }>;
    dominantArchetypes: Array<{ archetype: string; count: number }>;
    emotionalSpectrum: Array<{ emotion: string; count: number }>;
    modeDistribution: Record<JournalingMode, number>;
  } {
    const symbolCounts = new Map<string, number>();
    const archetypeCounts = new Map<string, number>();
    const emotionCounts = new Map<string, number>();
    const modeCounts: Record<JournalingMode, number> = {
      free: 0,
      dream: 0,
      emotional: 0,
      shadow: 0,
      direction: 0
    };

    entries.forEach(entry => {
      entry.reflection.symbols.forEach(symbol => {
        symbolCounts.set(symbol, (symbolCounts.get(symbol) || 0) + 1);
      });

      entry.reflection.archetypes.forEach(archetype => {
        archetypeCounts.set(archetype, (archetypeCounts.get(archetype) || 0) + 1);
      });

      emotionCounts.set(
        entry.reflection.emotionalTone,
        (emotionCounts.get(entry.reflection.emotionalTone) || 0) + 1
      );

      modeCounts[entry.mode]++;
    });

    return {
      topSymbols: Array.from(symbolCounts.entries())
        .map(([symbol, count]) => ({ symbol, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      dominantArchetypes: Array.from(archetypeCounts.entries())
        .map(([archetype, count]) => ({ archetype, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      emotionalSpectrum: Array.from(emotionCounts.entries())
        .map(([emotion, count]) => ({ emotion, count }))
        .sort((a, b) => b.count - a.count),
      modeDistribution: modeCounts
    };
  }
}

export const journalSoulprintIntegration = JournalSoulprintIntegration;