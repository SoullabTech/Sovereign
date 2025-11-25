/**
 * Dual Response Logger
 * Compare Sesame vs RFS outputs side-by-side
 * Track which resonates more with users over time
 */

import fs from 'fs/promises';
import path from 'path';
import type { ShadowContext } from './resonance-field-shadow-runner';

export interface DualLogEntry {
  sessionId: string;
  userId: string;
  timestamp: string;
  inputText: string;
  sesameOutput: string;
  rfsOutput: string;

  // Comparison metrics
  metrics: {
    lengthDiff: number;
    toneDivergence: number;
    complexityDelta: number;
    emotionalAlignment: number;
    preferredResponse?: 'sesame' | 'rfs' | 'equal';
  };

  // Maya breath integration
  breathContext?: {
    breathRate: number;
    coherence: number;
    phase: string;
  };
}

export class ResponseDualLogger {
  private comparisonLog: string;
  private dashboardQueue: DualLogEntry[] = [];
  private readonly FLUSH_THRESHOLD = 10;

  constructor() {
    this.comparisonLog = path.join(process.cwd(), 'logs/comparison/dual_responses.jsonl');
  }

  /**
   * Log side-by-side comparison of Sesame vs RFS
   */
  async logComparison(
    sesameOutput: string,
    rfsOutput: string,
    context: ShadowContext
  ): Promise<void> {
    const metrics = this.compareResponses(sesameOutput, rfsOutput);

    const logEntry: DualLogEntry = {
      sessionId: context.sessionId,
      userId: context.userId,
      timestamp: context.timestamp,
      inputText: context.inputText,
      sesameOutput,
      rfsOutput,
      metrics,
      breathContext: context.breathState ? {
        breathRate: context.breathState.breathRate,
        coherence: context.breathState.coherence,
        phase: context.breathState.phase
      } : undefined
    };

    // Write to JSONL file (newline-delimited JSON)
    try {
      await fs.appendFile(this.comparisonLog, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      console.error('[Dual Logger Error]', error);
    }

    // Queue for dashboard flush
    this.dashboardQueue.push(logEntry);

    // Flush to dashboard every N entries
    if (this.dashboardQueue.length >= this.FLUSH_THRESHOLD) {
      await this.flushToDashboard();
    }
  }

  /**
   * Compare two responses across multiple dimensions
   */
  private compareResponses(sesame: string, rfs: string) {
    return {
      lengthDiff: rfs.length - sesame.length,
      toneDivergence: this.calculateToneDivergence(sesame, rfs),
      complexityDelta: this.measureComplexity(rfs) - this.measureComplexity(sesame),
      emotionalAlignment: this.measureEmotionalAlignment(sesame, rfs)
    };
  }

  /**
   * Calculate tone divergence between two responses
   * 0 = identical tone, 1 = completely different
   */
  private calculateToneDivergence(a: string, b: string): number {
    // Word-level overlap analysis
    const wordsA = new Set(a.toLowerCase().split(/\s+/));
    const wordsB = new Set(b.toLowerCase().split(/\s+/));

    const intersection = new Set([...wordsA].filter(w => wordsB.has(w)));
    const union = new Set([...wordsA, ...wordsB]);

    const wordOverlap = intersection.size / union.size;

    // Punctuation density (correlates with tone)
    const punctDensityA = (a.match(/[.!?,;:]/g) || []).length / a.length;
    const punctDensityB = (b.match(/[.!?,;:]/g) || []).length / b.length;
    const punctDiff = Math.abs(punctDensityA - punctDensityB);

    // Question vs statement ratio
    const questionRatioA = (a.match(/\?/g) || []).length / (a.split(/[.!?]/).length || 1);
    const questionRatioB = (b.match(/\?/g) || []).length / (b.split(/[.!?]/).length || 1);
    const questionDiff = Math.abs(questionRatioA - questionRatioB);

    // Combine metrics
    const divergence = (
      (1 - wordOverlap) * 0.5 +
      punctDiff * 0.3 +
      questionDiff * 0.2
    );

    return Math.min(1, divergence);
  }

  /**
   * Measure text complexity
   * Based on sentence length, vocabulary diversity, structure
   */
  private measureComplexity(text: string): number {
    if (!text || text.length === 0) return 0;

    // Sentence length
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);

    if (sentences.length === 0 || words.length === 0) return 0;

    const avgWordsPerSentence = words.length / sentences.length;

    // Vocabulary diversity (lexical diversity)
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const lexicalDiversity = uniqueWords.size / words.length;

    // Complexity score: balance between length and diversity
    // Simple responses: short + low diversity (1-2 words)
    // Complex responses: longer + high diversity
    const complexity = (
      Math.min(avgWordsPerSentence / 10, 1) * 0.6 +
      lexicalDiversity * 0.4
    );

    return complexity;
  }

  /**
   * Measure if both responses address the same emotional need
   * 1 = perfectly aligned, 0 = completely misaligned
   */
  private measureEmotionalAlignment(sesame: string, rfs: string): number {
    // Emotional keyword categories
    const emotionalCategories = {
      acknowledgment: /yeah|mm|okay|got it|i see|right/i,
      presence: /here|with you|listening|stay/i,
      validation: /i know|i feel|that's hard|heavy|rough/i,
      inquiry: /tell me|what else|how so|and\?/i,
      silence: /^\.\.\.$|^$/,
      uncertainty: /maybe|not sure|hard to say|hmm/i
    };

    // Find categories each response belongs to
    const categoriesA = Object.entries(emotionalCategories)
      .filter(([_, regex]) => regex.test(sesame))
      .map(([cat, _]) => cat);

    const categoriesB = Object.entries(emotionalCategories)
      .filter(([_, regex]) => regex.test(rfs))
      .map(([cat, _]) => cat);

    // Calculate overlap
    const overlap = categoriesA.filter(cat => categoriesB.includes(cat)).length;
    const total = Math.max(categoriesA.length, categoriesB.length, 1);

    return overlap / total;
  }

  /**
   * Flush queued entries to dashboard service
   */
  private async flushToDashboard(): Promise<void> {
    if (this.dashboardQueue.length === 0) return;

    try {
      // TODO: Send to your dashboard service (Supabase, etc.)
      // Example:
      // await supabase.from('response_comparisons').insert(this.dashboardQueue);

      // For now, write to separate dashboard file
      const dashboardLog = path.join(process.cwd(), 'logs/comparison/dashboard.jsonl');
      const entries = this.dashboardQueue.map(e => JSON.stringify(e)).join('\n') + '\n';
      await fs.appendFile(dashboardLog, entries);

      // Clear queue
      this.dashboardQueue = [];
    } catch (error) {
      console.error('[Dashboard Flush Error]', error);
      // Don't clear queue on error - will retry next flush
    }
  }

  /**
   * Get summary statistics from recent comparisons
   */
  async getComparisonStats(lastNHours: number = 24): Promise<{
    totalComparisons: number;
    avgToneDivergence: number;
    avgEmotionalAlignment: number;
    complexityBias: 'sesame' | 'rfs' | 'equal';
  }> {
    try {
      const content = await fs.readFile(this.comparisonLog, 'utf-8');
      const lines = content.trim().split('\n');

      const cutoffTime = new Date(Date.now() - lastNHours * 60 * 60 * 1000);

      const recentEntries = lines
        .map(line => {
          try {
            return JSON.parse(line) as DualLogEntry;
          } catch {
            return null;
          }
        })
        .filter((e): e is DualLogEntry =>
          e !== null && new Date(e.timestamp) > cutoffTime
        );

      if (recentEntries.length === 0) {
        return {
          totalComparisons: 0,
          avgToneDivergence: 0,
          avgEmotionalAlignment: 0,
          complexityBias: 'equal'
        };
      }

      const avgToneDivergence = recentEntries.reduce((sum, e) =>
        sum + e.metrics.toneDivergence, 0
      ) / recentEntries.length;

      const avgEmotionalAlignment = recentEntries.reduce((sum, e) =>
        sum + e.metrics.emotionalAlignment, 0
      ) / recentEntries.length;

      const avgComplexityDelta = recentEntries.reduce((sum, e) =>
        sum + e.metrics.complexityDelta, 0
      ) / recentEntries.length;

      const complexityBias =
        avgComplexityDelta > 0.1 ? 'rfs' :
        avgComplexityDelta < -0.1 ? 'sesame' :
        'equal';

      return {
        totalComparisons: recentEntries.length,
        avgToneDivergence,
        avgEmotionalAlignment,
        complexityBias
      };
    } catch (error) {
      console.error('[Stats Calculation Error]', error);
      return {
        totalComparisons: 0,
        avgToneDivergence: 0,
        avgEmotionalAlignment: 0,
        complexityBias: 'equal'
      };
    }
  }

  /**
   * Force flush remaining queued entries
   */
  async forceFlush(): Promise<void> {
    if (this.dashboardQueue.length > 0) {
      await this.flushToDashboard();
    }
  }
}

export default ResponseDualLogger;