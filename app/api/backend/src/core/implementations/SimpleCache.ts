/**
 * 🗄️ Simple In-Memory Cache Implementation
 * 
 * LRU cache with TTL support that can be easily swapped for Redis later.
 * Perfect for the immediate performance gains outlined in the plan.
 */

import type { ICache } from '../interfaces';
import { logger } from '../../utils/logger';

interface CacheEntry<T> {
  value: T;
  expires?: number;
  createdAt: number;
}

export class SimpleCache implements ICache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly maxSize: number;
  private readonly defaultTtlSeconds: number;

  constructor(options: { maxSize?: number; defaultTtlSeconds?: number } = {}) {
    this.maxSize = options.maxSize || 2000;
    this.defaultTtlSeconds = options.defaultTtlSeconds || 300; // 5 minutes

    // Cleanup expired entries every 5 minutes
    setInterval(() => {
      this.cleanupExpired();
    }, 300000);
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (entry.expires && Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (LRU behavior)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const now = Date.now();
    const ttl = ttlSeconds || this.defaultTtlSeconds;
    const expires = ttl > 0 ? now + (ttl * 1000) : undefined;

    // Implement LRU eviction if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
        logger.debug('Cache evicted entry (LRU)', { evictedKey: firstKey });
      }
    }

    this.cache.set(key, {
      value,
      expires,
      createdAt: now
    });

    logger.debug('Cache entry set', { 
      key, 
      ttlSeconds: ttl,
      cacheSize: this.cache.size 
    });
  }

  async delete(key: string): Promise<void> {
    const deleted = this.cache.delete(key);
    if (deleted) {
      logger.debug('Cache entry deleted', { key });
    }
  }

  async clear(): Promise<void> {
    const size = this.cache.size;
    this.cache.clear();
    logger.debug('Cache cleared', { entriesCleared: size });
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate?: number;
    memoryUsage?: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize
      // TODO: Add hit rate tracking and memory usage estimation
    };
  }

  /**
   * Get all cache keys (for debugging)
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Check if key exists (without affecting LRU order)
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check expiration
    if (entry.expires && Date.now() > entry.expires) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Private: Clean up expired entries
   */
  private cleanupExpired(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expires && now > entry.expires) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.debug('Cache cleanup completed', { 
        entriesCleaned: cleaned,
        remainingEntries: this.cache.size 
      });
    }
  }
}