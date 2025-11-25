/**
 * Copyright © 2025 Soullab® Inc.
 * All Rights Reserved.
 *
 * WISDOM LIBRARY
 * Stores and queries transformation patterns for MAIA's intelligence
 *
 * Human-Authored IP: Kelly Nezat, 2025
 * Implementation: Built with Claude Code assistance
 */

import { TransformationPattern } from './TranscriptAnonymizer';

/**
 * Query parameters for finding relevant patterns
 */
export interface PatternQuery {
  // Current conversation context
  currentMessage?: string;
  conversationHistory?: Array<{ role: string; content: string }>;

  // Explicit filters
  elementalFocus?: string[];        // e.g., ['fire', 'water']
  patternTypes?: string[];          // e.g., ['breakthrough', 'resistance']
  archetypeThemes?: string[];       // e.g., ['perfectionism', 'abandonment']
  somaticSignals?: string[];        // e.g., ['chest tightness', 'rapid breathing']

  // Semantic search
  semanticQuery?: string;           // Natural language query

  // Result limits
  limit?: number;                   // Max patterns to return (default: 3)
  minRelevance?: number;            // Min relevance score 0-1 (default: 0.6)
}

/**
 * Pattern with relevance score
 */
export interface ScoredPattern extends TransformationPattern {
  relevanceScore: number;           // 0-1, how relevant to current context
  matchReasons: string[];           // Why this pattern matched
}

/**
 * Wisdom Library - MAIA's learned therapeutic intelligence
 */
export class WisdomLibrary {
  private patterns: TransformationPattern[] = [];
  private patternIndex: Map<string, TransformationPattern[]> = new Map();

  constructor(initialPatterns: TransformationPattern[] = []) {
    this.patterns = initialPatterns;
    this.buildIndex();
  }

  /**
   * Add patterns to library
   */
  addPatterns(patterns: TransformationPattern[]): void {
    this.patterns.push(...patterns);
    this.buildIndex();
    console.log(`📚 Wisdom Library now contains ${this.patterns.length} patterns`);
  }

  /**
   * Build search index for fast lookups
   */
  private buildIndex(): void {
    this.patternIndex.clear();

    for (const pattern of this.patterns) {
      // Index by type
      const typeKey = `type:${pattern.type}`;
      if (!this.patternIndex.has(typeKey)) {
        this.patternIndex.set(typeKey, []);
      }
      this.patternIndex.get(typeKey)!.push(pattern);

      // Index by elements mentioned
      const elements = this.extractElements(pattern.context.elementalDynamics);
      for (const element of elements) {
        const elementKey = `element:${element}`;
        if (!this.patternIndex.has(elementKey)) {
          this.patternIndex.set(elementKey, []);
        }
        this.patternIndex.get(elementKey)!.push(pattern);
      }

      // Index by archetypal keywords
      const keywords = this.extractKeywords(pattern.context.archetypalTheme);
      for (const keyword of keywords) {
        const keywordKey = `theme:${keyword}`;
        if (!this.patternIndex.has(keywordKey)) {
          this.patternIndex.set(keywordKey, []);
        }
        this.patternIndex.get(keywordKey)!.push(pattern);
      }
    }
  }

  /**
   * Query for relevant patterns
   */
  query(params: PatternQuery): ScoredPattern[] {
    let candidates: TransformationPattern[] = [...this.patterns];

    // Filter by explicit criteria
    if (params.patternTypes && params.patternTypes.length > 0) {
      candidates = candidates.filter(p => params.patternTypes!.includes(p.type));
    }

    // Score each candidate for relevance
    const scored: ScoredPattern[] = candidates.map(pattern => {
      const score = this.calculateRelevance(pattern, params);
      const reasons = this.explainRelevance(pattern, params);

      return {
        ...pattern,
        relevanceScore: score,
        matchReasons: reasons,
      };
    });

    // Filter by minimum relevance
    const minRelevance = params.minRelevance ?? 0.6;
    const relevant = scored.filter(p => p.relevanceScore >= minRelevance);

    // Sort by relevance (highest first)
    relevant.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Limit results
    const limit = params.limit ?? 3;
    return relevant.slice(0, limit);
  }

  /**
   * Calculate relevance score (0-1) for a pattern given query context
   */
  private calculateRelevance(
    pattern: TransformationPattern,
    query: PatternQuery
  ): number {
    let score = 0;
    let factors = 0;

    // Factor 1: Elemental match
    if (query.elementalFocus && query.elementalFocus.length > 0) {
      const patternElements = this.extractElements(pattern.context.elementalDynamics);
      const overlap = query.elementalFocus.filter(e =>
        patternElements.includes(e.toLowerCase())
      );
      score += (overlap.length / query.elementalFocus.length) * 0.3;
      factors++;
    }

    // Factor 2: Pattern type match
    if (query.patternTypes && query.patternTypes.length > 0) {
      if (query.patternTypes.includes(pattern.type)) {
        score += 0.2;
      }
      factors++;
    }

    // Factor 3: Archetypal theme match
    if (query.archetypeThemes && query.archetypeThemes.length > 0) {
      const patternKeywords = this.extractKeywords(pattern.context.archetypalTheme);
      const overlap = query.archetypeThemes.filter(theme =>
        patternKeywords.some(kw => kw.includes(theme.toLowerCase()) || theme.toLowerCase().includes(kw))
      );
      score += (overlap.length / query.archetypeThemes.length) * 0.25;
      factors++;
    }

    // Factor 4: Somatic signals match
    if (query.somaticSignals && query.somaticSignals.length > 0 && pattern.context.somaticSignals) {
      const patternSomatic = pattern.context.somaticSignals.toLowerCase();
      const overlap = query.somaticSignals.filter(signal =>
        patternSomatic.includes(signal.toLowerCase())
      );
      score += (overlap.length / query.somaticSignals.length) * 0.15;
      factors++;
    }

    // Factor 5: Semantic similarity to current message
    if (query.currentMessage) {
      const similarity = this.semanticSimilarity(
        query.currentMessage,
        pattern.context.conversationalContext
      );
      score += similarity * 0.1;
      factors++;
    }

    // Normalize by number of factors considered
    return factors > 0 ? score : 0;
  }

  /**
   * Explain why a pattern is relevant
   */
  private explainRelevance(
    pattern: TransformationPattern,
    query: PatternQuery
  ): string[] {
    const reasons: string[] = [];

    // Elemental match
    if (query.elementalFocus && query.elementalFocus.length > 0) {
      const patternElements = this.extractElements(pattern.context.elementalDynamics);
      const overlap = query.elementalFocus.filter(e =>
        patternElements.includes(e.toLowerCase())
      );
      if (overlap.length > 0) {
        reasons.push(`Elemental match: ${overlap.join(', ')}`);
      }
    }

    // Pattern type match
    if (query.patternTypes && query.patternTypes.includes(pattern.type)) {
      reasons.push(`Pattern type: ${pattern.type}`);
    }

    // Archetypal theme match
    if (query.archetypeThemes && query.archetypeThemes.length > 0) {
      const patternKeywords = this.extractKeywords(pattern.context.archetypalTheme);
      const overlap = query.archetypeThemes.filter(theme =>
        patternKeywords.some(kw => kw.includes(theme.toLowerCase()))
      );
      if (overlap.length > 0) {
        reasons.push(`Archetypal theme: ${overlap.join(', ')}`);
      }
    }

    return reasons;
  }

  /**
   * Extract element names from text (fire, water, earth, air)
   */
  private extractElements(text: string): string[] {
    const elements = ['fire', 'water', 'earth', 'air'];
    const found: string[] = [];

    for (const element of elements) {
      if (text.toLowerCase().includes(element)) {
        found.push(element);
      }
    }

    return found;
  }

  /**
   * Extract keywords from text (simple tokenization)
   */
  private extractKeywords(text: string): string[] {
    // Remove common words
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);

    return text
      .toLowerCase()
      .split(/\s+/)
      .map(word => word.replace(/[^a-z]/g, '')) // Remove punctuation
      .filter(word => word.length > 3 && !stopWords.has(word));
  }

  /**
   * Simple semantic similarity (bag-of-words overlap)
   * In production, use embeddings (OpenAI, Anthropic, or local model)
   */
  private semanticSimilarity(text1: string, text2: string): number {
    const words1 = new Set(this.extractKeywords(text1));
    const words2 = new Set(this.extractKeywords(text2));

    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Get statistics about the library
   */
  getStats(): {
    totalPatterns: number;
    byType: Record<string, number>;
    byElement: Record<string, number>;
  } {
    const byType: Record<string, number> = {};
    const byElement: Record<string, number> = {};

    for (const pattern of this.patterns) {
      // Count by type
      byType[pattern.type] = (byType[pattern.type] || 0) + 1;

      // Count by elements
      const elements = this.extractElements(pattern.context.elementalDynamics);
      for (const element of elements) {
        byElement[element] = (byElement[element] || 0) + 1;
      }
    }

    return {
      totalPatterns: this.patterns.length,
      byType,
      byElement,
    };
  }

  /**
   * Export patterns to JSON (for backup or sharing)
   */
  exportToJSON(): string {
    return JSON.stringify(this.patterns, null, 2);
  }

  /**
   * Import patterns from JSON
   */
  static importFromJSON(json: string): WisdomLibrary {
    const patterns = JSON.parse(json) as TransformationPattern[];
    return new WisdomLibrary(patterns);
  }

  /**
   * Save to file
   */
  async saveToFile(filepath: string): Promise<void> {
    const fs = await import('fs/promises');
    await fs.writeFile(filepath, this.exportToJSON(), 'utf-8');
    console.log(`💾 Saved ${this.patterns.length} patterns to ${filepath}`);
  }

  /**
   * Load from file
   */
  static async loadFromFile(filepath: string): Promise<WisdomLibrary> {
    const fs = await import('fs/promises');
    const json = await fs.readFile(filepath, 'utf-8');
    return WisdomLibrary.importFromJSON(json);
  }
}

/**
 * Example usage:
 *
 * // Initialize library
 * const library = new WisdomLibrary();
 *
 * // Add patterns from extraction
 * library.addPatterns(extractedPatterns);
 *
 * // Query for relevant patterns during conversation
 * const relevantPatterns = library.query({
 *   currentMessage: "I just can't stop trying to be perfect...",
 *   elementalFocus: ['fire', 'water'],
 *   patternTypes: ['resistance', 'breakthrough'],
 *   limit: 3,
 * });
 *
 * // Use patterns to inform MAIA's response
 * console.log('Relevant patterns:', relevantPatterns);
 * relevantPatterns.forEach(p => {
 *   console.log(`- ${p.teaching.whenToUse}`);
 *   console.log(`  Approach: ${p.teaching.howItWorks}`);
 * });
 *
 * // Save library
 * await library.saveToFile('./wisdom-library.json');
 *
 * // Load library later
 * const loaded = await WisdomLibrary.loadFromFile('./wisdom-library.json');
 */
