// In-Memory Cache Service for development and testing
export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<boolean>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<boolean>;
  keys(): Promise<string[]>;
  has(key: string): Promise<boolean>;
}

export interface CacheItem<T = any> {
  value: T;
  timestamp: number;
  ttl: number; // time to live in milliseconds
}

export class InMemoryCacheService implements CacheService {
  private cache: Map<string, CacheItem> = new Map();
  private cleanupInterval: NodeJS.Timeout;
  
  constructor(cleanupIntervalMs: number = 60000) { // Default cleanup every minute
    // Periodically clean up expired items
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredItems();
    }, cleanupIntervalMs);
  }

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if item has expired
    const now = Date.now();
    if (now > item.timestamp + item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value as T;
  }

  async set<T>(key: string, value: T, ttl: number = 300000): Promise<boolean> { // Default 5 minutes
    const item: CacheItem<T> = {
      value,
      timestamp: Date.now(),
      ttl
    };
    
    this.cache.set(key, item);
    return true;
  }

  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  async clear(): Promise<boolean> {
    this.cache.clear();
    return true;
  }

  async keys(): Promise<string[]> {
    return Array.from(this.cache.keys());
  }

  async has(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }
    
    // Check if item has expired
    const now = Date.now();
    if (now > item.timestamp + item.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // Utility methods
  async size(): Promise<number> {
    await this.cleanupExpiredItems();
    return this.cache.size;
  }

  async getStats(): Promise<{
    totalKeys: number;
    expiredKeys: number;
    memoryUsage: string;
  }> {
    const totalKeys = this.cache.size;
    let expiredKeys = 0;
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.timestamp + item.ttl) {
        expiredKeys++;
      }
    }
    
    const memoryUsage = `${Math.round(JSON.stringify(Array.from(this.cache.entries())).length / 1024)}KB`;
    
    return {
      totalKeys,
      expiredKeys,
      memoryUsage
    };
  }

  private cleanupExpiredItems(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.timestamp + item.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.debug(`InMemoryCache: Cleaned up ${cleaned} expired items`);
    }
  }

  // Namespace support for logical separation
  async namespace(prefix: string) {
    return new NamespacedCache(this, prefix);
  }

  // Cleanup method to clear the interval
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

// Namespaced cache wrapper
class NamespacedCache implements CacheService {
  constructor(
    private baseCache: InMemoryCacheService,
    private prefix: string
  ) {}

  private getNamespacedKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    return this.baseCache.get<T>(this.getNamespacedKey(key));
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    return this.baseCache.set(this.getNamespacedKey(key), value, ttl);
  }

  async delete(key: string): Promise<boolean> {
    return this.baseCache.delete(this.getNamespacedKey(key));
  }

  async clear(): Promise<boolean> {
    const keys = await this.keys();
    const deletePromises = keys.map(key => this.delete(key));
    await Promise.all(deletePromises);
    return true;
  }

  async keys(): Promise<string[]> {
    const allKeys = await this.baseCache.keys();
    return allKeys
      .filter(key => key.startsWith(this.prefix + ':'))
      .map(key => key.substring(this.prefix.length + 1));
  }

  async has(key: string): Promise<boolean> {
    return this.baseCache.has(this.getNamespacedKey(key));
  }
}

// Export singleton instance
export const inMemoryCacheService = new InMemoryCacheService();

// Default export
export default InMemoryCacheService;