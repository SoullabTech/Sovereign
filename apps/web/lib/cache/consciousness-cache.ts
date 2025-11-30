/**
 * Consciousness Analysis Cache
 * High-performance caching layer for consciousness-related computations to reduce processing time
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hitCount: number;
  metadata?: {
    processingTime: number;
    modelUsed: string;
    qualityScore: number;
  };
}

export interface CacheConfig {
  maxEntries: number;
  ttlSeconds: number;
  enableEviction: boolean;
  debugMode: boolean;
}

export class ConsciousnessCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private hitStats = { hits: 0, misses: 0 };
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxEntries: 1000,
      ttlSeconds: 3600, // 1 hour
      enableEviction: true,
      debugMode: false,
      ...config
    };
  }

  /**
   * Generate cache key from content and context
   */
  private generateKey(content: string, context?: any): string {
    const contextStr = context ? JSON.stringify(context) : '';
    const hash = this.simpleHash(content + contextStr);
    return `consciousness_${hash}`;
  }

  /**
   * Simple hash function for cache keys
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Check if cache entry is still valid
   */
  private isValid(entry: CacheEntry<T>): boolean {
    const age = (Date.now() - entry.timestamp) / 1000;
    return age < this.config.ttlSeconds;
  }

  /**
   * Get cached result if available and valid
   */
  get(content: string, context?: any): T | null {
    const key = this.generateKey(content, context);
    const entry = this.cache.get(key);

    if (!entry) {
      this.hitStats.misses++;
      if (this.config.debugMode) {
        console.log(`🔍 Cache miss for key: ${key.substring(0, 20)}...`);
      }
      return null;
    }

    if (!this.isValid(entry)) {
      this.cache.delete(key);
      this.hitStats.misses++;
      if (this.config.debugMode) {
        console.log(`⏰ Cache expired for key: ${key.substring(0, 20)}...`);
      }
      return null;
    }

    // Update hit count and stats
    entry.hitCount++;
    this.hitStats.hits++;

    if (this.config.debugMode) {
      console.log(`⚡ Cache hit for key: ${key.substring(0, 20)}... (hits: ${entry.hitCount})`);
    }

    return entry.data;
  }

  /**
   * Store result in cache
   */
  set(content: string, data: T, context?: any, metadata?: CacheEntry<T>['metadata']): void {
    const key = this.generateKey(content, context);

    // Check if we need to evict entries
    if (this.config.enableEviction && this.cache.size >= this.config.maxEntries) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      hitCount: 0,
      metadata
    };

    this.cache.set(key, entry);

    if (this.config.debugMode) {
      console.log(`💾 Cached result for key: ${key.substring(0, 20)}...`);
    }
  }

  /**
   * Evict oldest entries when cache is full
   */
  private evictOldest(): void {
    if (this.cache.size === 0) return;

    // Find oldest entry
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      if (this.config.debugMode) {
        console.log(`🗑️ Evicted cache entry: ${oldestKey.substring(0, 20)}...`);
      }
    }
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    const expired = [];

    for (const [key, entry] of this.cache.entries()) {
      const age = (now - entry.timestamp) / 1000;
      if (age >= this.config.ttlSeconds) {
        expired.push(key);
      }
    }

    for (const key of expired) {
      this.cache.delete(key);
    }

    if (this.config.debugMode && expired.length > 0) {
      console.log(`🧹 Cleared ${expired.length} expired cache entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const totalRequests = this.hitStats.hits + this.hitStats.misses;
    const hitRate = totalRequests > 0 ? (this.hitStats.hits / totalRequests) * 100 : 0;

    return {
      size: this.cache.size,
      maxEntries: this.config.maxEntries,
      hits: this.hitStats.hits,
      misses: this.hitStats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      usage: Math.round((this.cache.size / this.config.maxEntries) * 100),
      ttlSeconds: this.config.ttlSeconds
    };
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.hitStats = { hits: 0, misses: 0 };

    if (this.config.debugMode) {
      console.log('🧹 Cache cleared');
    }
  }
}

// Global cache instances for different types of consciousness analysis
export const awarenessLevelCache = new ConsciousnessCache<any>({
  maxEntries: 500,
  ttlSeconds: 1800, // 30 minutes
  debugMode: true
});

export const archetypeAnalysisCache = new ConsciousnessCache<any>({
  maxEntries: 300,
  ttlSeconds: 2700, // 45 minutes
  debugMode: true
});

export const coherenceOptimizationCache = new ConsciousnessCache<any>({
  maxEntries: 200,
  ttlSeconds: 600, // 10 minutes for real-time data
  debugMode: true
});

// Cache maintenance - clear expired entries every 5 minutes
setInterval(() => {
  awarenessLevelCache.clearExpired();
  archetypeAnalysisCache.clearExpired();
  coherenceOptimizationCache.clearExpired();
}, 5 * 60 * 1000);