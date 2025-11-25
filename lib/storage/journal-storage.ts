/**
 * Journal Entry Storage
 * In-memory storage for journal entries (replace with database in production)
 */

import { JournalingMode, JournalingResponse } from '../journaling/JournalingPrompts';

/**
 * Voice interaction metadata for analytics
 */
export interface VoiceInteractionMetrics {
  userSpokeDurationMs: number; // How long user spoke
  maiaSpokeDurationMs: number; // How long MAIA responded
  listeningPauses: number; // Times listening was paused
  interruptions: number; // Times user interrupted MAIA
  silenceDurationMs: number; // Silence before user spoke
  transcriptionConfidence?: number; // 0-1 confidence from speech recognition
  audioQuality?: 'excellent' | 'good' | 'fair' | 'poor'; // Subjective audio quality
}

/**
 * AI model performance metadata
 */
export interface ModelPerformanceMetrics {
  model: 'gpt-4o' | 'gpt-5' | 'claude-3-5-sonnet' | string; // Model used
  provider: 'openai' | 'anthropic';
  responseTimeMs: number; // Time from request to first token
  totalTokens?: number; // Total tokens used (input + output)
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number; // Estimated cost
  retries?: number; // Number of retries if API failed
  cacheHit?: boolean; // Whether prompt caching was used
}

/**
 * Conversation quality metadata
 */
export interface ConversationQualityMetrics {
  conversationMode: 'walking' | 'classic' | 'adaptive' | 'her';
  responseWordCount: number; // Words in MAIA's response
  responseSentenceCount: number; // Sentences in MAIA's response
  userWordCount: number; // Words in user's input
  brevityScore?: number; // 0-1, how brief was response (1 = very brief)
  coherenceScore?: number; // 0-1, estimated conversation flow quality
  emotionalResonance?: 'deep' | 'moderate' | 'light' | 'disconnected';
}

/**
 * Session and context metadata
 */
export interface SessionContextMetrics {
  sessionId: string; // Unique session identifier
  exchangeNumber: number; // Position in conversation (1st, 2nd, 3rd exchange)
  timeInSessionMs: number; // Time since session started
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  browserType?: string;
  voiceEnabled: boolean; // Was this a voice conversation?
  ttsEnabled: boolean; // Was text-to-speech used?
}

export interface StoredJournalEntry {
  id: string;
  userId: string;
  mode: JournalingMode;
  entry: string;
  reflection: JournalingResponse;
  timestamp: string;
  element?: string;

  // === ANALYTICS METADATA ===
  voiceMetrics?: VoiceInteractionMetrics;
  modelMetrics?: ModelPerformanceMetrics;
  qualityMetrics?: ConversationQualityMetrics;
  sessionMetrics?: SessionContextMetrics;
}

class JournalStorage {
  private entries: Map<string, StoredJournalEntry[]>;

  constructor() {
    this.entries = new Map();
  }

  addEntry(entry: StoredJournalEntry): void {
    const userEntries = this.entries.get(entry.userId) || [];
    userEntries.push(entry);
    this.entries.set(entry.userId, userEntries);
  }

  getEntries(userId: string, filters?: {
    mode?: JournalingMode;
    symbol?: string;
    archetype?: string;
    emotion?: string;
    startDate?: Date;
    endDate?: Date;
  }): StoredJournalEntry[] {
    let userEntries = this.entries.get(userId) || [];

    if (filters) {
      if (filters.mode) {
        userEntries = userEntries.filter(e => e.mode === filters.mode);
      }
      if (filters.symbol) {
        userEntries = userEntries.filter(e =>
          e.reflection.symbols.includes(filters.symbol!)
        );
      }
      if (filters.archetype) {
        userEntries = userEntries.filter(e =>
          e.reflection.archetypes.includes(filters.archetype!)
        );
      }
      if (filters.emotion) {
        userEntries = userEntries.filter(e =>
          e.reflection.emotionalTone === filters.emotion
        );
      }
      if (filters.startDate) {
        userEntries = userEntries.filter(e =>
          new Date(e.timestamp) >= filters.startDate!
        );
      }
      if (filters.endDate) {
        userEntries = userEntries.filter(e =>
          new Date(e.timestamp) <= filters.endDate!
        );
      }
    }

    return userEntries.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  getEntry(userId: string, entryId: string): StoredJournalEntry | undefined {
    const userEntries = this.entries.get(userId) || [];
    return userEntries.find(e => e.id === entryId);
  }

  deleteEntry(userId: string, entryId: string): boolean {
    const userEntries = this.entries.get(userId) || [];
    const index = userEntries.findIndex(e => e.id === entryId);
    if (index !== -1) {
      userEntries.splice(index, 1);
      this.entries.set(userId, userEntries);
      return true;
    }
    return false;
  }

  getUserStats(userId: string): {
    totalEntries: number;
    modeDistribution: Record<JournalingMode, number>;
    last7Days: number;
    last30Days: number;
  } {
    const userEntries = this.entries.get(userId) || [];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const modeDistribution: Record<JournalingMode, number> = {
      free: 0,
      dream: 0,
      emotional: 0,
      shadow: 0,
      direction: 0
    };

    let last7Days = 0;
    let last30Days = 0;

    userEntries.forEach(entry => {
      modeDistribution[entry.mode]++;
      const entryDate = new Date(entry.timestamp);
      if (entryDate >= sevenDaysAgo) last7Days++;
      if (entryDate >= thirtyDaysAgo) last30Days++;
    });

    return {
      totalEntries: userEntries.length,
      modeDistribution,
      last7Days,
      last30Days
    };
  }

  /**
   * === ANALYTICS QUERIES ===
   * These methods enable data-driven decision making about MAIA's performance
   */

  /**
   * Compare model performance across different AI models
   */
  getModelComparison(userId: string, timeRangeMs?: number): {
    [model: string]: {
      totalUses: number;
      avgResponseTime: number;
      avgWordCount: number;
      avgBrevityScore: number;
      avgCost: number;
      errorRate: number;
    };
  } {
    let entries = this.entries.get(userId) || [];

    if (timeRangeMs) {
      const cutoff = new Date(Date.now() - timeRangeMs);
      entries = entries.filter(e => new Date(e.timestamp) >= cutoff);
    }

    const modelStats: Record<string, any> = {};

    entries.forEach(entry => {
      if (!entry.modelMetrics) return;

      const model = entry.modelMetrics.model;
      if (!modelStats[model]) {
        modelStats[model] = {
          totalUses: 0,
          totalResponseTime: 0,
          totalWordCount: 0,
          totalBrevityScore: 0,
          totalCost: 0,
          errors: 0,
          count: 0
        };
      }

      const stats = modelStats[model];
      stats.totalUses++;
      stats.totalResponseTime += entry.modelMetrics.responseTimeMs;
      stats.totalWordCount += entry.qualityMetrics?.responseWordCount || 0;
      stats.totalBrevityScore += entry.qualityMetrics?.brevityScore || 0;
      stats.totalCost += entry.modelMetrics.costUsd || 0;
      if (entry.modelMetrics.retries && entry.modelMetrics.retries > 0) stats.errors++;
      stats.count++;
    });

    // Calculate averages
    Object.keys(modelStats).forEach(model => {
      const stats = modelStats[model];
      modelStats[model] = {
        totalUses: stats.totalUses,
        avgResponseTime: stats.count > 0 ? stats.totalResponseTime / stats.count : 0,
        avgWordCount: stats.count > 0 ? stats.totalWordCount / stats.count : 0,
        avgBrevityScore: stats.count > 0 ? stats.totalBrevityScore / stats.count : 0,
        avgCost: stats.count > 0 ? stats.totalCost / stats.count : 0,
        errorRate: stats.totalUses > 0 ? stats.errors / stats.totalUses : 0
      };
    });

    return modelStats;
  }

  /**
   * Get conversation mode effectiveness (how well each mode performs)
   */
  getModeEffectiveness(userId: string): {
    [mode: string]: {
      totalUses: number;
      avgBrevity: number;
      avgUserEngagement: number; // Based on user word count
      avgSessionLength: number;
      deepResonanceRate: number; // % of "deep" emotional resonance
    };
  } {
    const entries = this.entries.get(userId) || [];
    const modeStats: Record<string, any> = {};

    entries.forEach(entry => {
      if (!entry.qualityMetrics) return;

      const mode = entry.qualityMetrics.conversationMode;
      if (!modeStats[mode]) {
        modeStats[mode] = {
          totalUses: 0,
          totalBrevity: 0,
          totalUserWords: 0,
          totalSessionLength: 0,
          deepResonanceCount: 0,
          count: 0
        };
      }

      const stats = modeStats[mode];
      stats.totalUses++;
      stats.totalBrevity += entry.qualityMetrics.brevityScore || 0;
      stats.totalUserWords += entry.qualityMetrics.userWordCount || 0;
      stats.totalSessionLength += entry.sessionMetrics?.timeInSessionMs || 0;
      if (entry.qualityMetrics.emotionalResonance === 'deep') stats.deepResonanceCount++;
      stats.count++;
    });

    Object.keys(modeStats).forEach(mode => {
      const stats = modeStats[mode];
      modeStats[mode] = {
        totalUses: stats.totalUses,
        avgBrevity: stats.count > 0 ? stats.totalBrevity / stats.count : 0,
        avgUserEngagement: stats.count > 0 ? stats.totalUserWords / stats.count : 0,
        avgSessionLength: stats.count > 0 ? stats.totalSessionLength / stats.count : 0,
        deepResonanceRate: stats.totalUses > 0 ? stats.deepResonanceCount / stats.totalUses : 0
      };
    });

    return modeStats;
  }

  /**
   * Get voice interaction quality metrics
   */
  getVoiceQualityStats(userId: string): {
    avgSpeechDuration: number;
    avgMaiaResponseDuration: number;
    avgInterruptions: number;
    avgListeningPauses: number;
    avgTranscriptionConfidence: number;
    poorAudioRate: number;
  } {
    const entries = this.entries.get(userId) || [];
    const voiceEntries = entries.filter(e => e.voiceMetrics);

    if (voiceEntries.length === 0) {
      return {
        avgSpeechDuration: 0,
        avgMaiaResponseDuration: 0,
        avgInterruptions: 0,
        avgListeningPauses: 0,
        avgTranscriptionConfidence: 0,
        poorAudioRate: 0
      };
    }

    let totalUserDuration = 0;
    let totalMaiaDuration = 0;
    let totalInterruptions = 0;
    let totalPauses = 0;
    let totalConfidence = 0;
    let poorAudioCount = 0;

    voiceEntries.forEach(entry => {
      const vm = entry.voiceMetrics!;
      totalUserDuration += vm.userSpokeDurationMs;
      totalMaiaDuration += vm.maiaSpokeDurationMs;
      totalInterruptions += vm.interruptions;
      totalPauses += vm.listeningPauses;
      totalConfidence += vm.transcriptionConfidence || 0;
      if (vm.audioQuality === 'poor') poorAudioCount++;
    });

    return {
      avgSpeechDuration: totalUserDuration / voiceEntries.length,
      avgMaiaResponseDuration: totalMaiaDuration / voiceEntries.length,
      avgInterruptions: totalInterruptions / voiceEntries.length,
      avgListeningPauses: totalPauses / voiceEntries.length,
      avgTranscriptionConfidence: totalConfidence / voiceEntries.length,
      poorAudioRate: poorAudioCount / voiceEntries.length
    };
  }

  /**
   * Get time-series data for trend analysis
   */
  getTimeSeriesData(userId: string, metric: 'brevity' | 'engagement' | 'cost' | 'responseTime', bucketSizeDays: number = 7): Array<{
    startDate: Date;
    endDate: Date;
    value: number;
    count: number;
  }> {
    const entries = this.entries.get(userId) || [];
    if (entries.length === 0) return [];

    // Sort entries by date
    const sorted = entries.sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const firstDate = new Date(sorted[0].timestamp);
    const lastDate = new Date(sorted[sorted.length - 1].timestamp);
    const bucketSizeMs = bucketSizeDays * 24 * 60 * 60 * 1000;

    const buckets: Array<{ startDate: Date; endDate: Date; values: number[]; count: number }> = [];
    let currentBucketStart = new Date(firstDate);

    while (currentBucketStart <= lastDate) {
      const bucketEnd = new Date(currentBucketStart.getTime() + bucketSizeMs);
      buckets.push({
        startDate: new Date(currentBucketStart),
        endDate: bucketEnd,
        values: [],
        count: 0
      });
      currentBucketStart = bucketEnd;
    }

    // Populate buckets
    entries.forEach(entry => {
      const entryDate = new Date(entry.timestamp);
      const bucket = buckets.find(b => entryDate >= b.startDate && entryDate < b.endDate);

      if (bucket) {
        let value = 0;
        switch (metric) {
          case 'brevity':
            value = entry.qualityMetrics?.brevityScore || 0;
            break;
          case 'engagement':
            value = entry.qualityMetrics?.userWordCount || 0;
            break;
          case 'cost':
            value = entry.modelMetrics?.costUsd || 0;
            break;
          case 'responseTime':
            value = entry.modelMetrics?.responseTimeMs || 0;
            break;
        }
        bucket.values.push(value);
        bucket.count++;
      }
    });

    // Calculate averages
    return buckets.map(bucket => ({
      startDate: bucket.startDate,
      endDate: bucket.endDate,
      value: bucket.values.length > 0
        ? bucket.values.reduce((sum, v) => sum + v, 0) / bucket.values.length
        : 0,
      count: bucket.count
    }));
  }
}

export const journalStorage = new JournalStorage();