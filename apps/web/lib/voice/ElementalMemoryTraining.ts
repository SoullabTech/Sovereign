'use client';

import { JournalingMode } from '../journaling/JournalingPrompts';
import { VoiceJournalSession } from '../journaling/VoiceJournalingService';

export interface ElementalVoiceProfile {
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  userId: string;

  patterns: {
    averageCadence: number; // words per minute
    silenceFrequency: number; // pauses per minute
    averageWordLength: number;
    emotionalIntensity: number; // 0-1
    preferredModes: Record<JournalingMode, number>;
  };

  symbolMemory: {
    recurringSymbols: Map<string, number>;
    symbolProgression: Array<{
      symbol: string;
      firstSeen: Date;
      frequency: number;
    }>;
  };

  responseResonance: {
    preferredCadence: 'slow' | 'medium' | 'fast';
    preferredTone: 'reflective' | 'affirming' | 'questioning' | 'guiding';
    effectivePrompts: string[];
  };

  transformationHistory: Array<{
    date: Date;
    score: number;
    triggers: string[];
  }>;

  totalSessions: number;
  totalDuration: number;
  lastUpdated: Date;
}

export class ElementalMemoryTrainer {
  private profiles: Map<string, ElementalVoiceProfile> = new Map();
  private readonly STORAGE_KEY = 'elemental_voice_profiles';

  constructor() {
    this.loadProfiles();
  }

  async trainFromSession(session: VoiceJournalSession): Promise<void> {
    const profileKey = `${session.userId}_${session.element}`;
    let profile = this.profiles.get(profileKey);

    if (!profile) {
      profile = this.createNewProfile(session.userId, session.element);
    }

    this.updatePatterns(profile, session);

    if (session.analysis) {
      this.updateSymbolMemory(profile, session);
      this.updateTransformationHistory(profile, session);
    }

    profile.totalSessions++;
    profile.totalDuration += session.duration || 0;
    profile.lastUpdated = new Date();

    this.profiles.set(profileKey, profile);
    this.saveProfiles();
  }

  getProfile(userId: string, element: string): ElementalVoiceProfile | undefined {
    return this.profiles.get(`${userId}_${element}`);
  }

  getAdaptedPrompt(userId: string, element: string, baseMode: JournalingMode): string {
    const profile = this.getProfile(userId, element);

    if (!profile || profile.totalSessions < 3) {
      return this.getBasePrompt(baseMode);
    }

    const intensity = profile.patterns.emotionalIntensity;
    const cadence = profile.patterns.averageCadence;
    const topSymbols = this.getTopSymbols(profile, 3);

    let adaptedPrompt = this.getBasePrompt(baseMode);

    if (topSymbols.length > 0) {
      adaptedPrompt += ` Consider: ${topSymbols.join(', ')}.`;
    }

    if (intensity > 0.7) {
      adaptedPrompt += ' Honor the intensity present.';
    } else if (intensity < 0.3) {
      adaptedPrompt += ' Notice subtle movements.';
    }

    if (cadence < 100) {
      adaptedPrompt += ' Take your time.';
    } else if (cadence > 150) {
      adaptedPrompt += ' Let it flow.';
    }

    return adaptedPrompt;
  }

  getResonantResponseStyle(userId: string, element: string): {
    cadence: 'slow' | 'medium' | 'fast';
    tone: string;
    includeSymbols: boolean;
  } {
    const profile = this.getProfile(userId, element);

    if (!profile) {
      return {
        cadence: 'medium',
        tone: 'reflective',
        includeSymbols: false,
      };
    }

    return {
      cadence: profile.responseResonance.preferredCadence,
      tone: profile.responseResonance.preferredTone,
      includeSymbols: profile.symbolMemory.recurringSymbols.size > 5,
    };
  }

  getElementalInsights(userId: string): {
    mostDeveloped: string;
    needsAttention: string;
    recommendations: string[];
  } {
    const userProfiles: ElementalVoiceProfile[] = [];

    ['fire', 'water', 'earth', 'air', 'aether'].forEach(element => {
      const profile = this.getProfile(userId, element);
      if (profile) userProfiles.push(profile);
    });

    if (userProfiles.length === 0) {
      return {
        mostDeveloped: 'none',
        needsAttention: 'all',
        recommendations: ['Begin exploring each element through voice journaling'],
      };
    }

    userProfiles.sort((a, b) => b.totalSessions - a.totalSessions);

    const mostDeveloped = userProfiles[0].element;
    const leastDeveloped = userProfiles[userProfiles.length - 1];
    const needsAttention = leastDeveloped.totalSessions < userProfiles[0].totalSessions * 0.3
      ? leastDeveloped.element
      : 'balanced';

    const recommendations: string[] = [];

    if (needsAttention !== 'balanced') {
      recommendations.push(`Explore ${needsAttention} energy to bring balance`);
    }

    userProfiles.forEach(profile => {
      if (profile.patterns.emotionalIntensity > 0.8) {
        recommendations.push(`Channel ${profile.element}'s intensity with grounding practices`);
      }

      if (profile.transformationHistory.length > 0) {
        const avgScore = profile.transformationHistory.reduce((sum, t) => sum + t.score, 0) / profile.transformationHistory.length;
        if (avgScore > 75) {
          recommendations.push(`${profile.element} is a powerful transformation channel for you`);
        }
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('Continue your balanced exploration across all elements');
    }

    return {
      mostDeveloped,
      needsAttention,
      recommendations: recommendations.slice(0, 3),
    };
  }

  private createNewProfile(userId: string, element: 'fire' | 'water' | 'earth' | 'air' | 'aether'): ElementalVoiceProfile {
    return {
      element,
      userId,
      patterns: {
        averageCadence: 120,
        silenceFrequency: 5,
        averageWordLength: 5,
        emotionalIntensity: 0.5,
        preferredModes: {
          freewrite: 0,
          dream: 0,
          emotional: 0,
          shadow: 0,
          direction: 0,
        },
      },
      symbolMemory: {
        recurringSymbols: new Map(),
        symbolProgression: [],
      },
      responseResonance: {
        preferredCadence: 'medium',
        preferredTone: 'reflective',
        effectivePrompts: [],
      },
      transformationHistory: [],
      totalSessions: 0,
      totalDuration: 0,
      lastUpdated: new Date(),
    };
  }

  private updatePatterns(profile: ElementalVoiceProfile, session: VoiceJournalSession): void {
    const wordCount = session.wordCount;
    const duration = (session.duration || 0) / 60; // minutes
    const cadence = duration > 0 ? wordCount / duration : 120;

    profile.patterns.averageCadence = this.weightedAverage(
      profile.patterns.averageCadence,
      cadence,
      profile.totalSessions
    );

    const words = session.transcript.split(/\s+/);
    const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;

    profile.patterns.averageWordLength = this.weightedAverage(
      profile.patterns.averageWordLength,
      avgWordLength,
      profile.totalSessions
    );

    profile.patterns.preferredModes[session.mode]++;

    if (session.analysis?.emotionalTone) {
      const intensity = this.estimateEmotionalIntensity(session.analysis.emotionalTone);
      profile.patterns.emotionalIntensity = this.weightedAverage(
        profile.patterns.emotionalIntensity,
        intensity,
        profile.totalSessions
      );
    }
  }

  private updateSymbolMemory(profile: ElementalVoiceProfile, session: VoiceJournalSession): void {
    if (!session.analysis?.symbols) return;

    session.analysis.symbols.forEach(symbol => {
      const count = profile.symbolMemory.recurringSymbols.get(symbol) || 0;
      profile.symbolMemory.recurringSymbols.set(symbol, count + 1);

      if (count === 0) {
        profile.symbolMemory.symbolProgression.push({
          symbol,
          firstSeen: session.startTime,
          frequency: 1,
        });
      } else {
        const existing = profile.symbolMemory.symbolProgression.find(s => s.symbol === symbol);
        if (existing) {
          existing.frequency++;
        }
      }
    });
  }

  private updateTransformationHistory(profile: ElementalVoiceProfile, session: VoiceJournalSession): void {
    if (!session.analysis?.transformationScore) return;

    const triggers: string[] = [];
    if (session.analysis.symbols) triggers.push(...session.analysis.symbols);
    if (session.analysis.archetypes) triggers.push(...session.analysis.archetypes);

    profile.transformationHistory.push({
      date: session.startTime,
      score: session.analysis.transformationScore,
      triggers,
    });

    if (profile.transformationHistory.length > 20) {
      profile.transformationHistory.shift();
    }
  }

  private weightedAverage(current: number, newValue: number, sessionCount: number): number {
    const weight = Math.min(sessionCount / 10, 0.8);
    return current * weight + newValue * (1 - weight);
  }

  private estimateEmotionalIntensity(tone: string): number {
    const intensityKeywords = [
      { words: ['intense', 'powerful', 'strong', 'overwhelming'], score: 0.9 },
      { words: ['deep', 'profound', 'significant'], score: 0.7 },
      { words: ['moderate', 'balanced', 'steady'], score: 0.5 },
      { words: ['gentle', 'subtle', 'quiet'], score: 0.3 },
      { words: ['minimal', 'neutral', 'flat'], score: 0.1 },
    ];

    const lowerTone = tone.toLowerCase();

    for (const { words, score } of intensityKeywords) {
      if (words.some(word => lowerTone.includes(word))) {
        return score;
      }
    }

    return 0.5;
  }

  private getTopSymbols(profile: ElementalVoiceProfile, limit: number): string[] {
    return Array.from(profile.symbolMemory.recurringSymbols.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([symbol]) => symbol);
  }

  private getBasePrompt(mode: JournalingMode): string {
    const prompts: Record<JournalingMode, string> = {
      freewrite: 'Speak freely about whatever is present for you right now.',
      dream: 'Share your dreams, visions, or inner imagery.',
      emotional: 'Express what you\'re feeling without holding back.',
      shadow: 'Explore what you usually keep hidden or avoid.',
      direction: 'Reflect on where you\'re heading and what you\'re becoming.',
    };

    return prompts[mode] || prompts.freewrite;
  }

  private loadProfiles(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([key, value]: [string, any]) => {
          const profile = {
            ...value,
            symbolMemory: {
              recurringSymbols: new Map(Object.entries(value.symbolMemory.recurringSymbols)),
              symbolProgression: value.symbolMemory.symbolProgression.map((s: any) => ({
                ...s,
                firstSeen: new Date(s.firstSeen),
              })),
            },
            transformationHistory: value.transformationHistory.map((t: any) => ({
              ...t,
              date: new Date(t.date),
            })),
            lastUpdated: new Date(value.lastUpdated),
          };
          this.profiles.set(key, profile);
        });
      }
    } catch (error) {
      console.error('Failed to load elemental profiles:', error);
    }
  }

  private saveProfiles(): void {
    if (typeof window === 'undefined') return;

    try {
      const data: any = {};
      this.profiles.forEach((profile, key) => {
        data[key] = {
          ...profile,
          symbolMemory: {
            recurringSymbols: Object.fromEntries(profile.symbolMemory.recurringSymbols),
            symbolProgression: profile.symbolMemory.symbolProgression,
          },
        };
      });

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save elemental profiles:', error);
    }
  }
}

export const elementalMemoryTrainer = new ElementalMemoryTrainer();