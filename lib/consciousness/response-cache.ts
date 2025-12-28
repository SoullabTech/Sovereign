/**
 * INTELLIGENT RESPONSE CACHE
 *
 * Advanced caching system that:
 * - Caches engine responses by semantic similarity
 * - Invalidates cache intelligently based on context changes
 * - Provides partial response acceleration
 * - Maintains consciousness coherence across cached responses
 */

import { OrchestrationType } from '../ai/multiEngineOrchestrator';

export interface CacheEntry {
  id: string;
  inputHash: string;
  semanticVector: number[]; // Simplified semantic representation
  orchestrationType: OrchestrationType;
  engineResponses: Map<string, string>;
  consensus: string;
  confidence: number;
  timestamp: number;
  usage: number;
  contextHash: string;
  sessionContext: boolean;
}

export interface CacheHit {
  entry: CacheEntry;
  similarity: number;
  freshness: number; // 0-1 where 1 is very fresh
  usable: boolean;
}

export class ResponseCache {
  private cache = new Map<string, CacheEntry>();
  private maxCacheSize = 1000;
  private semanticThreshold = 0.85;
  private freshnessThreshold = 0.7;

  // Cache performance metrics
  private metrics = {
    hits: 0,
    misses: 0,
    partialHits: 0,
    totalRequests: 0,
    averageResponseTime: 0,
    cacheEffectiveness: 0
  };

  /**
   * Check cache for similar responses
   */
  async checkCache(
    input: string,
    orchestrationType: OrchestrationType,
    context?: any
  ): Promise<CacheHit | null> {
    this.metrics.totalRequests++;

    const inputVector = this.generateSemanticVector(input);
    const contextHash = this.generateContextHash(context);

    // Look for exact or similar matches
    for (const [key, entry] of this.cache) {
      // Skip if different orchestration type (unless downgrading for performance)
      if (entry.orchestrationType !== orchestrationType) {
        continue;
      }

      // Calculate semantic similarity
      const similarity = this.calculateSimilarity(inputVector, entry.semanticVector);

      if (similarity >= this.semanticThreshold) {
        // Check freshness and context compatibility
        const freshness = this.calculateFreshness(entry);
        const contextCompatible = this.isContextCompatible(contextHash, entry.contextHash, context);

        if (freshness >= this.freshnessThreshold && contextCompatible) {
          // Cache hit!
          entry.usage++;
          this.metrics.hits++;

          console.log(`🎯 Cache HIT: ${(similarity * 100).toFixed(0)}% similarity, ${(freshness * 100).toFixed(0)}% fresh`);

          return {
            entry,
            similarity,
            freshness,
            usable: true
          };
        } else if (similarity >= 0.9 && freshness >= 0.5) {
          // Partial hit - can use as starting point
          this.metrics.partialHits++;

          console.log(`⚡ Cache PARTIAL: ${(similarity * 100).toFixed(0)}% similarity, needs refresh`);

          return {
            entry,
            similarity,
            freshness,
            usable: false // Can inspire but shouldn't be used directly
          };
        }
      }
    }

    this.metrics.misses++;
    console.log(`🔍 Cache MISS: No similar cached response found`);
    return null;
  }

  /**
   * Store response in cache
   */
  async storeResponse(
    input: string,
    orchestrationType: OrchestrationType,
    engineResponses: Map<string, string>,
    consensus: string,
    confidence: number,
    context?: any,
    processingTime?: number
  ): Promise<void> {
    const id = this.generateId();
    const inputHash = this.generateInputHash(input);
    const semanticVector = this.generateSemanticVector(input);
    const contextHash = this.generateContextHash(context);

    const entry: CacheEntry = {
      id,
      inputHash,
      semanticVector,
      orchestrationType,
      engineResponses,
      consensus,
      confidence,
      timestamp: Date.now(),
      usage: 0,
      contextHash,
      sessionContext: !!context?.sessionId
    };

    // Store in cache
    this.cache.set(id, entry);

    // Update performance metrics
    if (processingTime) {
      this.updateAverageResponseTime(processingTime);
    }

    // Maintain cache size
    await this.maintainCacheSize();

    console.log(`💾 Cached response: ${input.length} chars (confidence: ${(confidence * 100).toFixed(0)}%)`); // Never log content
  }

  /**
   * Get cache analytics
   */
  getAnalytics(): typeof this.metrics & {
    hitRate: number;
    partialHitRate: number;
    cacheSize: number;
    averageEntryAge: number;
    topResponses: Array<{ input: string; usage: number }>;
  } {
    const hitRate = this.metrics.totalRequests > 0 ?
      this.metrics.hits / this.metrics.totalRequests : 0;

    const partialHitRate = this.metrics.totalRequests > 0 ?
      this.metrics.partialHits / this.metrics.totalRequests : 0;

    const averageEntryAge = this.calculateAverageAge();
    const topResponses = this.getTopResponses();

    return {
      ...this.metrics,
      hitRate,
      partialHitRate,
      cacheSize: this.cache.size,
      averageEntryAge,
      topResponses
    };
  }

  /**
   * Intelligent cache warming for common patterns
   */
  async warmCache(commonQueries: string[]): Promise<void> {
    console.log(`🔥 Warming cache with ${commonQueries.length} common queries...`);

    // This would pre-generate responses for common patterns
    // Implementation would involve running these through the orchestrator
    // For now, just log the intent

    for (const query of commonQueries) {
      console.log(`  - Preparing to cache: ${query.length} chars`); // Never log content
    }
  }

  /**
   * Clear cache entries that are no longer relevant
   */
  async invalidateStaleEntries(): Promise<number> {
    const staleThreshold = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    let removed = 0;

    for (const [key, entry] of this.cache) {
      if (entry.timestamp < staleThreshold && entry.usage < 2) {
        this.cache.delete(key);
        removed++;
      }
    }

    console.log(`🧹 Removed ${removed} stale cache entries`);
    return removed;
  }

  // Private helper methods
  private generateSemanticVector(input: string): number[] {
    // Simplified semantic vector generation
    // In production, would use actual embedding model
    const words = input.toLowerCase().split(/\s+/);
    const vector = new Array(50).fill(0);

    // Simple word-based features
    const concepts = {
      existential: ['purpose', 'meaning', 'existence', 'life', 'death'],
      emotional: ['feel', 'emotion', 'love', 'pain', 'joy', 'fear'],
      practical: ['work', 'money', 'decision', 'help', 'action'],
      spiritual: ['soul', 'spirit', 'divine', 'sacred', 'meditation'],
      relational: ['relationship', 'family', 'friend', 'connection']
    };

    Object.entries(concepts).forEach(([concept, keywords], index) => {
      const matches = words.filter(word =>
        keywords.some(keyword => word.includes(keyword))
      ).length;
      vector[index] = matches / words.length;
    });

    // Add input length and complexity features
    vector[10] = Math.min(words.length / 100, 1);
    vector[11] = words.filter(word => word.length > 7).length / words.length;

    return vector;
  }

  private calculateSimilarity(vec1: number[], vec2: number[]): number {
    // Cosine similarity
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      magnitude1 += vec1[i] * vec1[i];
      magnitude2 += vec2[i] * vec2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) return 0;

    return dotProduct / (magnitude1 * magnitude2);
  }

  private calculateFreshness(entry: CacheEntry): number {
    const age = Date.now() - entry.timestamp;
    const maxAge = 6 * 60 * 60 * 1000; // 6 hours for full freshness

    return Math.max(0, 1 - (age / maxAge));
  }

  private isContextCompatible(
    currentContextHash: string,
    cachedContextHash: string,
    context?: any
  ): boolean {
    // Session-specific responses should only be used in same session
    if (context?.sessionId && cachedContextHash !== currentContextHash) {
      return false;
    }

    // General responses can be used across contexts
    return true;
  }

  private generateInputHash(input: string): string {
    // Simple hash for exact input matching
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  private generateContextHash(context?: any): string {
    if (!context) return 'no-context';

    // Hash relevant context elements
    const relevantContext = {
      sessionId: context.sessionId,
      userId: context.userId,
      // Don't include full history to allow some reuse
    };

    return JSON.stringify(relevantContext);
  }

  private generateId(): string {
    return `cache-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private updateAverageResponseTime(processingTime: number): void {
    const alpha = 0.1; // Smoothing factor
    this.metrics.averageResponseTime =
      this.metrics.averageResponseTime * (1 - alpha) + processingTime * alpha;
  }

  private async maintainCacheSize(): Promise<void> {
    if (this.cache.size <= this.maxCacheSize) return;

    // Remove least used entries
    const entries = Array.from(this.cache.entries());
    entries.sort(([,a], [,b]) => {
      // Sort by usage and freshness
      const scoreA = a.usage + this.calculateFreshness(a);
      const scoreB = b.usage + this.calculateFreshness(b);
      return scoreA - scoreB;
    });

    const toRemove = entries.slice(0, this.cache.size - this.maxCacheSize);
    toRemove.forEach(([key]) => this.cache.delete(key));

    console.log(`🗑️ Removed ${toRemove.length} cache entries to maintain size limit`);
  }

  private calculateAverageAge(): number {
    const now = Date.now();
    const ages = Array.from(this.cache.values()).map(entry => now - entry.timestamp);
    return ages.reduce((sum, age) => sum + age, 0) / ages.length / (60 * 60 * 1000); // Hours
  }

  private getTopResponses(): Array<{ input: string; usage: number }> {
    return Array.from(this.cache.values())
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 10)
      .map(entry => ({
        input: `Hash: ${entry.inputHash.substring(0, 8)}...`,
        usage: entry.usage
      }));
  }
}

// Singleton instance
export const responseCache = new ResponseCache();