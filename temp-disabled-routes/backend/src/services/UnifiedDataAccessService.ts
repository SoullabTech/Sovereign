/**
 * UnifiedDataAccessService.ts - Optimized Database Query Consolidation
 * 
 * Eliminates redundant queries across MemoryOrchestrator, SpiralMapper, and DynamicGreetingService.
 * Provides intelligent caching and batched fetching for better performance.
 * 
 * Performance targets: <150ms for full user context fetch
 */

import { logger } from '../utils/logger';
import { supabase } from '../lib/supabaseClient';

export interface UserDataContext {
  userId: string;
  sessions: any[];
  journals: any[];
  conversations: any[];
  profile: any;
  fetchTime: number;
  cacheHit: boolean;
}

export interface QueryOptions {
  includeSessions?: boolean;
  includeJournals?: boolean;
  includeConversations?: boolean;
  includeProfile?: boolean;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

interface CachedUserData {
  userId: string;
  context: UserDataContext;
  timestamp: number;
  expiresAt: number;
  queryHash: string;
}

export class UnifiedDataAccessService {
  private static cache = new Map<string, CachedUserData>();
  private static cacheExpiry = 5 * 60 * 1000; // 5 minutes
  private static pendingRequests = new Map<string, Promise<UserDataContext>>();

  /**
   * Main entry point - fetch complete user data context with intelligent caching
   */
  static async fetchUserContext(
    userId: string,
    options: QueryOptions = {}
  ): Promise<UserDataContext> {
    const startTime = performance.now();
    
    // Set defaults
    const opts = {
      includeSessions: true,
      includeJournals: true,
      includeConversations: true,
      includeProfile: true,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days
      endDate: new Date(),
      limit: 50,
      ...options
    };

    // Create query hash for caching
    const queryHash = this.createQueryHash(userId, opts);
    const cacheKey = `${userId}-${queryHash}`;

    // Check for pending request (avoid duplicate fetches)
    if (this.pendingRequests.has(cacheKey)) {
      logger.debug(`[DATA_ACCESS] Waiting for pending request: ${userId}`);
      return await this.pendingRequests.get(cacheKey)!;
    }

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      logger.debug(`[DATA_ACCESS] Cache hit for user ${userId}`);
      return {
        ...cached.context,
        cacheHit: true
      };
    }

    // Create and store pending promise
    const dataPromise = this.performDataFetch(userId, opts, startTime);
    this.pendingRequests.set(cacheKey, dataPromise);

    try {
      const context = await dataPromise;
      
      // Cache the result
      this.cache.set(cacheKey, {
        userId,
        context,
        timestamp: Date.now(),
        expiresAt: Date.now() + this.cacheExpiry,
        queryHash
      });

      // Clean up
      this.pendingRequests.delete(cacheKey);
      
      // Periodic cache cleanup
      if (this.cache.size > 50) {
        this.cleanExpiredCache();
      }

      return context;

    } catch (error) {
      this.pendingRequests.delete(cacheKey);
      throw error;
    }
  }

  /**
   * Perform actual data fetch with optimized batching
   */
  private static async performDataFetch(
    userId: string,
    options: QueryOptions,
    startTime: number
  ): Promise<UserDataContext> {
    
    try {
      // Build parallel query promises
      const queryPromises: Promise<any>[] = [];
      const queryLabels: string[] = [];

      if (options.includeSessions) {
        queryPromises.push(this.fetchSessions(userId, options.startDate!, options.endDate!, options.limit!));
        queryLabels.push('sessions');
      }

      if (options.includeJournals) {
        queryPromises.push(this.fetchJournals(userId, options.startDate!, options.endDate!, options.limit!));
        queryLabels.push('journals');
      }

      if (options.includeConversations) {
        queryPromises.push(this.fetchConversations(userId, options.startDate!, options.endDate!, options.limit!));
        queryLabels.push('conversations');
      }

      if (options.includeProfile) {
        queryPromises.push(this.fetchProfile(userId));
        queryLabels.push('profile');
      }

      // Execute all queries in parallel
      const results = await Promise.all(queryPromises);
      
      // Map results back to context
      const context: any = {
        userId,
        sessions: [],
        journals: [],
        conversations: [],
        profile: null,
        fetchTime: 0,
        cacheHit: false
      };

      queryLabels.forEach((label, index) => {
        context[label === 'profile' ? 'profile' : label] = results[index];
      });

      context.fetchTime = performance.now() - startTime;

      // Log performance
      if (context.fetchTime > 200) {
        logger.warn(`[DATA_ACCESS] Slow fetch: ${context.fetchTime.toFixed(1)}ms for user ${userId}`);
      } else if (process.env.MAYA_DEBUG_PERFORMANCE === 'true') {
        logger.info(`[DATA_ACCESS] Fetched user context in ${context.fetchTime.toFixed(1)}ms`);
      }

      return context;

    } catch (error) {
      logger.error(`[DATA_ACCESS] Failed to fetch user context for ${userId}:`, error);
      
      // Return minimal fallback context
      return {
        userId,
        sessions: [],
        journals: [],
        conversations: [],
        profile: null,
        fetchTime: performance.now() - startTime,
        cacheHit: false
      };
    }
  }

  /**
   * Optimized session fetch
   */
  private static async fetchSessions(
    userId: string,
    startDate: Date,
    endDate: Date,
    limit: number
  ): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('[DATA_ACCESS] Session fetch failed:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Optimized journal fetch
   */
  private static async fetchJournals(
    userId: string,
    startDate: Date,
    endDate: Date,
    limit: number
  ): Promise<any[]> {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('[DATA_ACCESS] Journal fetch failed:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Optimized conversation fetch
   */
  private static async fetchConversations(
    userId: string,
    startDate: Date,
    endDate: Date,
    limit: number
  ): Promise<any[]> {
    const { data, error } = await supabase
      .from('conversation_turns')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('[DATA_ACCESS] Conversation fetch failed:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Optimized profile fetch
   */
  private static async fetchProfile(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found is OK
      logger.error('[DATA_ACCESS] Profile fetch failed:', error);
      return null;
    }

    return data;
  }

  /**
   * Create hash for query options (for cache key)
   */
  private static createQueryHash(userId: string, options: QueryOptions): string {
    const hashData = {
      includeSessions: options.includeSessions,
      includeJournals: options.includeJournals,
      includeConversations: options.includeConversations,
      includeProfile: options.includeProfile,
      startDate: options.startDate?.getTime(),
      endDate: options.endDate?.getTime(),
      limit: options.limit
    };

    return JSON.stringify(hashData)
      .split('')
      .reduce((hash, char) => {
        hash = ((hash << 5) - hash) + char.charCodeAt(0);
        return hash & hash;
      }, 0)
      .toString(36);
  }

  /**
   * Clean expired cache entries
   */
  private static cleanExpiredCache(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, cached] of this.cache.entries()) {
      if (now >= cached.expiresAt) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.debug(`[DATA_ACCESS] Cleaned ${cleanedCount} expired cache entries`);
    }
  }

  /**
   * Get specific data slice (for services that only need partial data)
   */
  static async fetchJournalContentsOnly(
    userId: string,
    limit: number = 10
  ): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('content')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('[DATA_ACCESS] Journal content fetch failed:', error);
        return [];
      }

      return (data || []).map(entry => entry.content).filter(Boolean);

    } catch (error) {
      logger.error('[DATA_ACCESS] Journal content fetch error:', error);
      return [];
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    size: number;
    pendingRequests: number;
    oldestEntry?: number;
  } {
    const now = Date.now();
    let oldestTimestamp = now;

    for (const cached of this.cache.values()) {
      if (cached.timestamp < oldestTimestamp) {
        oldestTimestamp = cached.timestamp;
      }
    }

    return {
      size: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      oldestEntry: oldestTimestamp < now ? now - oldestTimestamp : undefined
    };
  }

  /**
   * Clear cache and pending requests (for testing/debugging)
   */
  static clearCache(): void {
    this.cache.clear();
    this.pendingRequests.clear();
    logger.debug('[DATA_ACCESS] Cache and pending requests cleared');
  }

  /**
   * Pre-warm cache for user (can be called proactively)
   */
  static async preWarmCache(userId: string): Promise<void> {
    try {
      await this.fetchUserContext(userId, {
        includeSessions: true,
        includeJournals: true,
        includeConversations: false, // Skip conversations for pre-warm
        includeProfile: true,
        limit: 20
      });
      
      logger.debug(`[DATA_ACCESS] Cache pre-warmed for user ${userId}`);
    } catch (error) {
      logger.warn(`[DATA_ACCESS] Cache pre-warm failed for user ${userId}:`, error);
    }
  }
}