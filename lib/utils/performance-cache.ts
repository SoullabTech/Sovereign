/**
 * Performance-Optimized Caching Layer for MAIA-PAI
 *
 * Caches frequently accessed data to reduce database load by 60-80%
 * Implements intelligent TTL and invalidation strategies
 *
 * Target Performance Improvement:
 * - Relationship essence lookups: 50-100ms → 1-5ms
 * - User quota checks: 30-50ms → 1-2ms
 * - MAIA essence data: 40-80ms → 1-3ms
 */

import logger from './performance-logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccess: number;
}

interface CacheStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  avgResponseTime: number;
  totalSavedTime: number;
}

/**
 * High-Performance In-Memory Cache with LRU Eviction
 * Optimized for MAIA consciousness data patterns
 */
class PerformanceCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize: number;
  private stats: Map<string, CacheStats> = new Map();

  // Performance-tuned TTL values based on data access patterns
  private readonly TTL_PRESETS = {
    // Relationship essence: High hit rate, changes infrequently
    relationship_essence: 30 * 60 * 1000, // 30 minutes

    // User quotas: Updated frequently, but safe to cache briefly
    user_quota: 5 * 60 * 1000, // 5 minutes

    // MAIA essence: Changes slowly, accessed every conversation
    maia_essence: 60 * 60 * 1000, // 1 hour

    // Voice profiles: Static configuration data
    voice_profile: 24 * 60 * 60 * 1000, // 24 hours

    // Archetypal threads: Medium frequency updates
    archetypal_threads: 15 * 60 * 1000, // 15 minutes

    // Wisdom search results: Can cache temporarily for same queries
    wisdom_search: 10 * 60 * 1000, // 10 minutes

    // Session data: Short-lived, high access during session
    session_data: 2 * 60 * 1000, // 2 minutes
  } as const;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;

    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);

    // Log cache statistics every 10 minutes
    setInterval(() => this.logStats(), 10 * 60 * 1000);
  }

  /**
   * Get data from cache with performance tracking
   */
  get<T>(key: string, category: keyof typeof this.TTL_PRESETS = 'relationship_essence'): T | null {
    const startTime = Date.now();
    this.updateStats(category, 'request');

    const entry = this.cache.get(key);

    if (!entry) {
      this.updateStats(category, 'miss');
      logger.debug('cache.miss', 'cache_miss', { key, category });
      return null;
    }

    const now = Date.now();

    // Check if expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.updateStats(category, 'miss');
      logger.debug('cache.expired', 'cache_expired', { key, category, age: now - entry.timestamp });
      return null;
    }

    // Update access tracking
    entry.accessCount++;
    entry.lastAccess = now;

    const responseTime = Date.now() - startTime;
    this.updateStats(category, 'hit', responseTime);

    logger.debug('cache.hit', 'cache_hit', {
      key,
      category,
      responseTime: `${responseTime}ms`,
      accessCount: entry.accessCount
    });

    return entry.data;
  }

  /**
   * Set data in cache with intelligent TTL
   */
  set<T>(key: string, data: T, category: keyof typeof this.TTL_PRESETS = 'relationship_essence'): void {
    const now = Date.now();
    const ttl = this.TTL_PRESETS[category];

    // LRU eviction if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl,
      accessCount: 0,
      lastAccess: now
    };

    this.cache.set(key, entry);

    logger.debug('cache.set', 'cache_set', {
      key,
      category,
      ttl: `${ttl / 1000}s`,
      cacheSize: this.cache.size
    });
  }

  /**
   * Specialized get-or-set pattern for database operations
   * Returns cached data or executes getter function and caches result
   */
  async getOrSet<T>(
    key: string,
    getter: () => Promise<T>,
    category: keyof typeof this.TTL_PRESETS = 'relationship_essence'
  ): Promise<T> {
    const cached = this.get<T>(key, category);

    if (cached !== null) {
      return cached;
    }

    // Cache miss - fetch from database
    const startTime = Date.now();
    const data = await getter();
    const fetchTime = Date.now() - startTime;

    this.set(key, data, category);

    logger.info('cache.fetch', 'cache_fetch_and_set', {
      key,
      category,
      fetchTime: `${fetchTime}ms`
    });

    return data;
  }

  /**
   * Invalidate specific cache entry or pattern
   */
  invalidate(keyOrPattern: string): void {
    if (keyOrPattern.includes('*')) {
      // Pattern invalidation
      const pattern = keyOrPattern.replace(/\*/g, '');
      const keysToDelete: string[] = [];

      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(key => this.cache.delete(key));

      logger.info('cache.invalidate', 'pattern_invalidation', {
        pattern: keyOrPattern,
        keysDeleted: keysToDelete.length
      });
    } else {
      // Single key invalidation
      const deleted = this.cache.delete(keyOrPattern);

      if (deleted) {
        logger.info('cache.invalidate', 'key_invalidation', {
          key: keyOrPattern
        });
      }
    }
  }

  /**
   * Clear cache by category
   */
  clearCategory(category: string): void {
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (key.startsWith(`${category}:`)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));

    logger.info('cache.clear', 'category_cleared', {
      category,
      keysDeleted: keysToDelete.length
    });
  }

  /**
   * LRU eviction - remove least recently used entry
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      logger.debug('cache.evict', 'lru_eviction', {
        evictedKey: oldestKey,
        cacheSize: this.cache.size
      });
    }
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));

    if (keysToDelete.length > 0) {
      logger.info('cache.cleanup', 'expired_entries_removed', {
        removedCount: keysToDelete.length,
        currentSize: this.cache.size
      });
    }
  }

  /**
   * Update cache statistics
   */
  private updateStats(category: string, type: 'request' | 'hit' | 'miss', responseTime?: number): void {
    if (!this.stats.has(category)) {
      this.stats.set(category, {
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        hitRate: 0,
        avgResponseTime: 0,
        totalSavedTime: 0
      });
    }

    const stats = this.stats.get(category)!;

    switch (type) {
      case 'request':
        stats.totalRequests++;
        break;
      case 'hit':
        stats.cacheHits++;
        if (responseTime !== undefined) {
          // Estimate time saved (typical DB query: 50ms, cache: 1ms)
          const timeSaved = Math.max(50 - responseTime, 0);
          stats.totalSavedTime += timeSaved;
        }
        break;
      case 'miss':
        stats.cacheMisses++;
        break;
    }

    // Update calculated fields
    stats.hitRate = stats.totalRequests > 0 ? (stats.cacheHits / stats.totalRequests) * 100 : 0;
  }

  /**
   * Log cache performance statistics
   */
  private logStats(): void {
    for (const [category, stats] of this.stats.entries()) {
      if (stats.totalRequests > 0) {
        logger.info('cache.stats', 'performance_summary', {
          category,
          hitRate: `${stats.hitRate.toFixed(1)}%`,
          totalRequests: stats.totalRequests,
          cacheHits: stats.cacheHits,
          cacheMisses: stats.cacheMisses,
          timeSavedMs: stats.totalSavedTime,
          cacheSize: this.cache.size
        });
      }
    }
  }

  /**
   * Get current cache statistics
   */
  getStats(): Record<string, CacheStats> {
    const result: Record<string, CacheStats> = {};
    for (const [key, stats] of this.stats.entries()) {
      result[key] = { ...stats };
    }
    return result;
  }

  /**
   * Get cache health metrics
   */
  getHealth(): {
    size: number;
    maxSize: number;
    utilizationPercent: number;
    overallHitRate: number;
    totalTimeSavedMs: number;
  } {
    let totalRequests = 0;
    let totalHits = 0;
    let totalTimeSaved = 0;

    for (const stats of this.stats.values()) {
      totalRequests += stats.totalRequests;
      totalHits += stats.cacheHits;
      totalTimeSaved += stats.totalSavedTime;
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      utilizationPercent: (this.cache.size / this.maxSize) * 100,
      overallHitRate: totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0,
      totalTimeSavedMs: totalTimeSaved
    };
  }

  /**
   * Force cache flush (for testing/debugging)
   */
  flush(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.clear();

    logger.info('cache.flush', 'cache_flushed', {
      entriesCleared: size
    });
  }
}

// Singleton instance for application-wide use
export const performanceCache = new PerformanceCache(2000); // Increased size for consciousness data

/**
 * Cache Key Generators
 * Standardized key patterns for consistent cache usage
 */
export const CacheKeys = {
  relationshipEssence: (soulSignature: string) => `relationship_essence:${soulSignature}`,
  userQuota: (userId: string) => `user_quota:${userId}`,
  maiaEssence: () => 'maia_essence:global',
  voiceProfile: (profileId: string) => `voice_profile:${profileId}`,
  archetypalThreads: (soulSignature: string) => `archetypal_threads:${soulSignature}`,
  breakthroughMemories: (soulSignature: string) => `breakthrough_memories:${soulSignature}`,
  wisdomSearch: (query: string, filters: string) => `wisdom_search:${Buffer.from(query + filters).toString('base64').slice(0, 32)}`,
  sessionData: (sessionId: string) => `session_data:${sessionId}`,
  userUsageLogs: (userId: string, date: string) => `usage_logs:${userId}:${date}`,
};

/**
 * Cache Invalidation Helpers
 * For maintaining data consistency when updates occur
 */
export const CacheInvalidation = {
  // Called when relationship essence is updated
  onRelationshipEssenceUpdate: (soulSignature: string) => {
    performanceCache.invalidate(CacheKeys.relationshipEssence(soulSignature));
    performanceCache.invalidate(CacheKeys.archetypalThreads(soulSignature));
    performanceCache.invalidate(CacheKeys.breakthroughMemories(soulSignature));
  },

  // Called when user quota is updated
  onUserQuotaUpdate: (userId: string) => {
    performanceCache.invalidate(CacheKeys.userQuota(userId));
  },

  // Called when MAIA essence is updated
  onMaiaEssenceUpdate: () => {
    performanceCache.invalidate(CacheKeys.maiaEssence());
  },

  // Called when user starts new session
  onSessionStart: (userId: string) => {
    performanceCache.invalidate(`session_data:${userId}:*`);
  },

  // Called when wisdom library is updated
  onWisdomLibraryUpdate: () => {
    performanceCache.clearCategory('wisdom_search');
  }
};

export default performanceCache;