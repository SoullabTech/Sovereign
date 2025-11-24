// ===============================================
// REDIS CONFIGURATION FOR SOUL MEMORY
// Production-ready caching and memory system
// ===============================================

import Redis from "ioredis";
import { logger } from "../utils/logger.js";

// ===============================================
// REDIS CLIENT CONFIGURATION
// ===============================================

const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || "0"),
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  enableOfflineQueue: true,
  maxRetriesPerRequest: 3,
  connectTimeout: 10000,
  lazyConnect: true,

  // TLS for production
  ...(process.env.REDIS_TLS_URL && {
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
  }),
};

// Create Redis client with connection URL if available
export const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : new Redis(redisConfig);

// Create separate client for pub/sub
export const pubClient = redis.duplicate();
export const subClient = redis.duplicate();

// ===============================================
// CONNECTION MANAGEMENT
// ===============================================

redis.on("connect", () => {
  logger.info("Redis client connected successfully");
});

redis.on("error", (error) => {
  logger.error("Redis connection error:", error);
});

redis.on("ready", () => {
  logger.info("Redis client ready for commands");
});

redis.on("reconnecting", () => {
  logger.warn("Redis client reconnecting...");
});

// ===============================================
// SOUL MEMORY OPERATIONS
// ===============================================

export class SoulMemoryRedis {
  private static readonly MEMORY_PREFIX = "soul:memory:";
  private static readonly SESSION_PREFIX = "soul:session:";
  private static readonly VECTOR_PREFIX = "soul:vector:";
  private static readonly THREAD_PREFIX = "soul:thread:";
  private static readonly DEFAULT_TTL = 2592000; // 30 days

  // Store memory with optional TTL
  static async storeMemory(
    userId: string,
    memoryId: string,
    memoryData: any,
    ttl?: number,
  ): Promise<boolean> {
    try {
      const key = `${this.MEMORY_PREFIX}${userId}:${memoryId}`;
      const serialized = JSON.stringify(memoryData);

      if (ttl) {
        await redis.setex(key, ttl, serialized);
      } else {
        await redis.setex(key, this.DEFAULT_TTL, serialized);
      }

      // Add to user's memory index
      await redis.sadd(`${this.MEMORY_PREFIX}${userId}:index`, memoryId);

      return true;
    } catch (error) {
      logger.error("Failed to store memory in Redis:", error);
      return false;
    }
  }

  // Retrieve memory
  static async getMemory(
    userId: string,
    memoryId: string,
  ): Promise<any | null> {
    try {
      const key = `${this.MEMORY_PREFIX}${userId}:${memoryId}`;
      const data = await redis.get(key);

      if (data) {
        return JSON.parse(data);
      }

      return null;
    } catch (error) {
      logger.error("Failed to retrieve memory from Redis:", error);
      return null;
    }
  }

  // Get all memory IDs for a user
  static async getUserMemoryIds(userId: string): Promise<string[]> {
    try {
      const indexKey = `${this.MEMORY_PREFIX}${userId}:index`;
      const memoryIds = await redis.smembers(indexKey);
      return memoryIds;
    } catch (error) {
      logger.error("Failed to get user memory IDs:", error);
      return [];
    }
  }

  // Store session data
  static async storeSession(
    sessionId: string,
    sessionData: any,
    ttl: number = 3600, // 1 hour default
  ): Promise<boolean> {
    try {
      const key = `${this.SESSION_PREFIX}${sessionId}`;
      await redis.setex(key, ttl, JSON.stringify(sessionData));
      return true;
    } catch (error) {
      logger.error("Failed to store session:", error);
      return false;
    }
  }

  // Get session data
  static async getSession(sessionId: string): Promise<any | null> {
    try {
      const key = `${this.SESSION_PREFIX}${sessionId}`;
      const data = await redis.get(key);

      if (data) {
        return JSON.parse(data);
      }

      return null;
    } catch (error) {
      logger.error("Failed to get session:", error);
      return null;
    }
  }

  // Store vector embedding for semantic search
  static async storeVector(
    vectorId: string,
    vector: number[],
    metadata: any,
  ): Promise<boolean> {
    try {
      const key = `${this.VECTOR_PREFIX}${vectorId}`;
      const data = {
        vector,
        metadata,
        timestamp: Date.now(),
      };

      await redis.set(key, JSON.stringify(data));

      // Add to vector index (for batch processing)
      await redis.sadd(`${this.VECTOR_PREFIX}index`, vectorId);

      return true;
    } catch (error) {
      logger.error("Failed to store vector:", error);
      return false;
    }
  }

  // Store memory thread relationships
  static async storeThread(
    userId: string,
    threadId: string,
    memoryIds: string[],
  ): Promise<boolean> {
    try {
      const key = `${this.THREAD_PREFIX}${userId}:${threadId}`;
      await redis.set(
        key,
        JSON.stringify({
          memoryIds,
          created: Date.now(),
          updated: Date.now(),
        }),
      );

      // Add to user's thread index
      await redis.sadd(`${this.THREAD_PREFIX}${userId}:index`, threadId);

      return true;
    } catch (error) {
      logger.error("Failed to store thread:", error);
      return false;
    }
  }

  // Batch operations for performance
  static async batchGetMemories(
    userId: string,
    memoryIds: string[],
  ): Promise<Map<string, any>> {
    try {
      const pipeline = redis.pipeline();
      const keys = memoryIds.map(
        (id) => `${this.MEMORY_PREFIX}${userId}:${id}`,
      );

      keys.forEach((key) => pipeline.get(key));

      const results = await pipeline.exec();
      const memoryMap = new Map<string, any>();

      results?.forEach((result, index) => {
        if (result && result[1]) {
          const memoryId = memoryIds[index];
          memoryMap.set(memoryId, JSON.parse(result[1] as string));
        }
      });

      return memoryMap;
    } catch (error) {
      logger.error("Failed to batch get memories:", error);
      return new Map();
    }
  }

  // Clear user's memory cache (for GDPR compliance)
  static async clearUserMemory(userId: string): Promise<boolean> {
    try {
      // Get all memory IDs
      const memoryIds = await this.getUserMemoryIds(userId);

      if (memoryIds.length === 0) {
        return true;
      }

      // Delete all memories
      const pipeline = redis.pipeline();

      memoryIds.forEach((id) => {
        pipeline.del(`${this.MEMORY_PREFIX}${userId}:${id}`);
      });

      // Delete index
      pipeline.del(`${this.MEMORY_PREFIX}${userId}:index`);

      // Delete threads
      const threadIds = await redis.smembers(
        `${this.THREAD_PREFIX}${userId}:index`,
      );
      threadIds.forEach((id) => {
        pipeline.del(`${this.THREAD_PREFIX}${userId}:${id}`);
      });
      pipeline.del(`${this.THREAD_PREFIX}${userId}:index`);

      await pipeline.exec();

      logger.info(`Cleared all Redis memory for user: ${userId}`);
      return true;
    } catch (error) {
      logger.error("Failed to clear user memory:", error);
      return false;
    }
  }
}

// ===============================================
// CACHING UTILITIES
// ===============================================

export class CacheManager {
  // Generic cache operations with TTL
  static async set(
    key: string,
    value: any,
    ttl: number = 3600,
  ): Promise<boolean> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error("Cache set failed:", error);
      return false;
    }
  }

  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error("Cache get failed:", error);
      return null;
    }
  }

  static async del(key: string): Promise<boolean> {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      logger.error("Cache delete failed:", error);
      return false;
    }
  }

  // Pattern-based cache invalidation
  static async invalidatePattern(pattern: string): Promise<number> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length === 0) return 0;

      const result = await redis.del(...keys);
      return result;
    } catch (error) {
      logger.error("Pattern invalidation failed:", error);
      return 0;
    }
  }

  // Cache with automatic refresh
  static async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl: number = 3600,
  ): Promise<T | null> {
    try {
      // Try to get from cache
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      // Generate new value
      const value = await factory();
      await this.set(key, value, ttl);

      return value;
    } catch (error) {
      logger.error("Cache getOrSet failed:", error);
      return null;
    }
  }
}

// ===============================================
// RATE LIMITING
// ===============================================

export class RateLimiter {
  static async checkLimit(
    identifier: string,
    maxRequests: number = 100,
    windowSeconds: number = 900, // 15 minutes
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const key = `rate:${identifier}`;
    const now = Date.now();
    const window = now - windowSeconds * 1000;

    try {
      // Remove old entries
      await redis.zremrangebyscore(key, "-inf", window);

      // Count requests in current window
      const count = await redis.zcard(key);

      if (count < maxRequests) {
        // Add current request
        await redis.zadd(key, now, `${now}-${Math.random()}`);
        await redis.expire(key, windowSeconds);

        return {
          allowed: true,
          remaining: maxRequests - count - 1,
          resetAt: now + windowSeconds * 1000,
        };
      }

      // Get oldest entry to determine reset time
      const oldestEntries = await redis.zrange(key, 0, 0, "WITHSCORES");
      const resetAt =
        oldestEntries.length > 1
          ? parseInt(oldestEntries[1]) + windowSeconds * 1000
          : now + windowSeconds * 1000;

      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    } catch (error) {
      logger.error("Rate limit check failed:", error);
      // Fail open in case of Redis issues
      return {
        allowed: true,
        remaining: 1,
        resetAt: now + windowSeconds * 1000,
      };
    }
  }
}

// ===============================================
// WEBSOCKET SUPPORT
// ===============================================

export class WebSocketRedis {
  // Publish message to channel
  static async publish(channel: string, message: any): Promise<boolean> {
    try {
      await pubClient.publish(channel, JSON.stringify(message));
      return true;
    } catch (error) {
      logger.error("Failed to publish message:", error);
      return false;
    }
  }

  // Subscribe to channel
  static async subscribe(
    channel: string,
    handler: (message: any) => void,
  ): Promise<void> {
    await subClient.subscribe(channel);

    subClient.on("message", (receivedChannel, message) => {
      if (receivedChannel === channel) {
        try {
          const parsed = JSON.parse(message);
          handler(parsed);
        } catch (error) {
          logger.error("Failed to parse message:", error);
        }
      }
    });
  }

  // Unsubscribe from channel
  static async unsubscribe(channel: string): Promise<void> {
    await subClient.unsubscribe(channel);
  }
}

// ===============================================
// HEALTH CHECK
// ===============================================

export async function checkRedisHealth(): Promise<{
  connected: boolean;
  latency: number;
  info?: any;
}> {
  const start = Date.now();

  try {
    await redis.ping();
    const info = await redis.info();

    return {
      connected: true,
      latency: Date.now() - start,
      info: info.split("\n").reduce((acc: any, line: string) => {
        const [key, value] = line.split(":");
        if (key && value) {
          acc[key.trim()] = value.trim();
        }
        return acc;
      }, {}),
    };
  } catch (error) {
    return {
      connected: false,
      latency: -1,
    };
  }
}

// Export utilities
export { Redis };
export default redis;
