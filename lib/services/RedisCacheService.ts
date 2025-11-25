/**
 * Redis Cache Service Implementation
 * Provides Redis-based caching with fallback to in-memory cache
 */

import { ICacheService, CacheStats } from '../core/ServiceTokens';

export interface RedisCacheConfig {
  url: string;
  defaultTTL: number;
  maxRetries: number;
  retryDelay: number;
}

export class RedisCacheService implements ICacheService {
  private redis: any = null; // Redis client placeholder
  private fallbackCache = new Map<string, { value: any; expires: number }>();
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0
  };

  constructor(private config: RedisCacheConfig) {
    this.initializeRedis();
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // Try Redis first
      if (this.redis) {
        const value = await this.redis.get(key);
        if (value) {
          this.stats.hits++;
          return JSON.parse(value);
        }
      }

      // Fallback to in-memory cache
      const cached = this.fallbackCache.get(key);
      if (cached) {
        if (Date.now() < cached.expires) {
          this.stats.hits++;
          return cached.value;
        } else {
          this.fallbackCache.delete(key);
        }
      }

      this.stats.misses++;
      return null;

    } catch (error) {
      console.warn('Cache get error:', error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttl: number = this.config.defaultTTL): Promise<void> {
    try {
      const serialized = JSON.stringify(value);

      // Try Redis first
      if (this.redis) {
        await this.redis.setex(key, ttl, serialized);
      } else {
        // Fallback to in-memory cache
        this.fallbackCache.set(key, {
          value,
          expires: Date.now() + (ttl * 1000)
        });
      }

      this.stats.sets++;
    } catch (error) {
      console.warn('Cache set error:', error);
      // Silent fail - cache is non-critical
    }
  }

  /**
   * Invalidate cache keys matching pattern
   */
  async invalidate(pattern: string): Promise<void> {
    try {
      if (this.redis) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
          this.stats.deletes += keys.length;
        }
      } else {
        // Pattern matching for in-memory cache
        const regex = new RegExp(pattern.replace('*', '.*'));
        for (const key of this.fallbackCache.keys()) {
          if (regex.test(key)) {
            this.fallbackCache.delete(key);
            this.stats.deletes++;
          }
        }
      }
    } catch (error) {
      console.warn('Cache invalidate error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async stats(): Promise<CacheStats> {
    const memoryUsage = this.redis ? 0 : this.calculateMemoryUsage();
    
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.fallbackCache.size,
      memoryUsage
    };
  }

  /**
   * Health check for Redis connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (this.redis) {
        await this.redis.ping();
        return true;
      }
      return true; // Fallback cache is always available
    } catch (error) {
      return false;
    }
  }

  /**
   * Initialize Redis connection (placeholder - would use actual Redis client)
   */
  private async initializeRedis(): Promise<void> {
    try {
      // In a real implementation, would initialize Redis client here
      // For now, we&apos;ll use fallback cache
      console.log('Redis cache falling back to in-memory cache');
    } catch (error) {
      console.warn('Redis connection failed, using in-memory cache:', error);
    }
  }

  /**
   * Calculate memory usage of in-memory cache
   */
  private calculateMemoryUsage(): number {
    let size = 0;
    for (const [key, value] of this.fallbackCache) {
      size += key.length * 2; // UTF-16 characters
      size += JSON.stringify(value.value).length * 2;
      size += 16; // Overhead for expires timestamp and object
    }
    return size;
  }

  /**
   * Dispose of the cache service
   */
  async dispose(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }
    this.fallbackCache.clear();
    console.log('Redis cache service disposed');
  }
}

/**
 * In-Memory Cache Service (simpler alternative)
 */
export class InMemoryCacheService implements ICacheService {
  private cache = new Map<string, { value: any; expires: number }>();
  private stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
  private maxSize: number;

  constructor(config: { maxSize: number } = { maxSize: 1000 }) {
    this.maxSize = config.maxSize;
  }

  async get<T>(key: string): Promise<T | null> {
    const cached = this.cache.get(key);
    if (cached) {
      if (Date.now() < cached.expires) {
        this.stats.hits++;
        return cached.value;
      } else {
        this.cache.delete(key);
      }
    }
    this.stats.misses++;
    return null;
  }

  async set<T>(key: string, value: T, ttl: number = 300): Promise<void> {
    // Simple LRU eviction
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expires: Date.now() + (ttl * 1000)
    });
    this.stats.sets++;
  }

  async invalidate(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        this.stats.deletes++;
      }
    }
  }

  async stats(): Promise<CacheStats> {
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      memoryUsage: this.calculateMemoryUsage()
    };
  }

  private calculateMemoryUsage(): number {
    let size = 0;
    for (const [key, value] of this.cache) {
      size += key.length * 2;
      size += JSON.stringify(value.value).length * 2;
      size += 16;
    }
    return size;
  }

  async dispose(): Promise<void> {
    this.cache.clear();
    console.log('In-memory cache service disposed');
  }
}