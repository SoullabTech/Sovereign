/**
 * PersonaPrefsStore - Persistent storage for user's Maya personality preferences
 * Handles worldview adaptation, voice settings, and formality preferences
 */

import { PersonaPrefs, DEFAULT_PREFS, validatePrefs } from '../personas/prefs';
import { logger } from '../utils/logger';

export interface IMemoryStore {
  get(userId: string, key: string): Promise<any>;
  put(userId: string, key: string, value: any): Promise<void>;
  del(userId: string, key: string): Promise<void>;
  has(userId: string, key: string): Promise<boolean>;
}

/**
 * Storage adapter for persona preferences with caching and persistence
 */
export class PersonaPrefsStore {
  private cache: Map<string, PersonaPrefs> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes
  private readonly PREFS_KEY = 'persona_prefs';

  constructor(private memory: IMemoryStore) {}

  /**
   * Get user's persona preferences (cached)
   */
  async get(userId: string): Promise<PersonaPrefs> {
    try {
      // Check cache first
      const cached = this.getCached(userId);
      if (cached) return cached;

      // Load from persistent storage
      const stored = await this.memory.get(userId, this.PREFS_KEY);
      const prefs = stored ? validatePrefs(stored) : DEFAULT_PREFS;
      
      // Cache the result
      this.setCached(userId, prefs);
      
      logger.debug('Persona preferences loaded', { 
        userId: userId.substring(0, 8) + '...',
        worldview: prefs.worldview,
        formality: prefs.formality
      });

      return prefs;
    } catch (error) {
      logger.warn('Failed to load persona preferences, using defaults', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: userId.substring(0, 8) + '...'
      });
      return DEFAULT_PREFS;
    }
  }

  /**
   * Update user's persona preferences
   */
  async set(userId: string, updates: Partial<PersonaPrefs>): Promise<PersonaPrefs> {
    try {
      const current = await this.get(userId);
      const updated = validatePrefs({ ...current, ...updates });
      
      // Store persistently
      await this.memory.put(userId, this.PREFS_KEY, updated);
      
      // Update cache
      this.setCached(userId, updated);
      
      logger.info('Persona preferences updated', {
        userId: userId.substring(0, 8) + '...',
        changes: Object.keys(updates),
        newWorldview: updated.worldview,
        newFormality: updated.formality
      });

      return updated;
    } catch (error) {
      logger.error('Failed to update persona preferences', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: userId.substring(0, 8) + '...',
        updates: Object.keys(updates)
      });
      throw error;
    }
  }

  /**
   * Adapt preferences gradually based on user language patterns
   */
  async adaptToUser(userId: string, userText: string): Promise<PersonaPrefs> {
    const current = await this.get(userId);
    
    // Import here to avoid circular dependencies
    const { detectWorldview, adaptPrefs } = await import('../personas/prefs');
    
    // Detect worldview signal from user text
    const worldviewSignal = detectWorldview(userText);
    
    if (worldviewSignal && worldviewSignal !== current.worldview) {
      logger.debug('Worldview signal detected', {
        userId: userId.substring(0, 8) + '...',
        signal: worldviewSignal,
        currentWorldview: current.worldview
      });
      
      // Gradually adapt preferences
      const adapted = adaptPrefs(current, worldviewSignal);
      
      // Only persist if there's a meaningful change
      if (adapted.worldview !== current.worldview || 
          Math.abs((adapted.metaphysics_confidence || 0) - (current.metaphysics_confidence || 0)) > 0.05) {
        return await this.set(userId, adapted);
      }
    }
    
    return current;
  }

  /**
   * Reset preferences to defaults
   */
  async reset(userId: string): Promise<PersonaPrefs> {
    logger.info('Resetting persona preferences to defaults', {
      userId: userId.substring(0, 8) + '...'
    });
    
    return await this.set(userId, DEFAULT_PREFS);
  }

  /**
   * Get preferences summary for multiple users (analytics)
   */
  async getSummary(userIds: string[]): Promise<{
    total: number;
    worldviewDistribution: Record<string, number>;
    formalityDistribution: Record<string, number>;
    averageConfidence: number;
  }> {
    const summaries = await Promise.allSettled(
      userIds.map(userId => this.get(userId))
    );
    
    const validPrefs = summaries
      .filter((result): result is PromiseFulfilledResult<PersonaPrefs> => result.status === 'fulfilled')
      .map(result => result.value);

    const worldviewDistribution: Record<string, number> = {};
    const formalityDistribution: Record<string, number> = {};
    let totalConfidence = 0;

    validPrefs.forEach(prefs => {
      worldviewDistribution[prefs.worldview] = (worldviewDistribution[prefs.worldview] || 0) + 1;
      formalityDistribution[prefs.formality || 'warm'] = (formalityDistribution[prefs.formality || 'warm'] || 0) + 1;
      totalConfidence += prefs.metaphysics_confidence || 0;
    });

    return {
      total: validPrefs.length,
      worldviewDistribution,
      formalityDistribution,
      averageConfidence: validPrefs.length > 0 ? totalConfidence / validPrefs.length : 0
    };
  }

  /**
   * Export preferences for user data portability
   */
  async export(userId: string): Promise<PersonaPrefs> {
    return await this.get(userId);
  }

  /**
   * Import preferences from user data
   */
  async import(userId: string, prefs: Partial<PersonaPrefs>): Promise<PersonaPrefs> {
    logger.info('Importing persona preferences', {
      userId: userId.substring(0, 8) + '...',
      keys: Object.keys(prefs)
    });
    
    return await this.set(userId, prefs);
  }

  /**
   * Cleanup expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    
    for (const [userId, expiry] of this.cacheExpiry.entries()) {
      if (now > expiry) {
        this.cache.delete(userId);
        this.cacheExpiry.delete(userId);
      }
    }
  }

  /**
   * Get cached preferences if still valid
   */
  private getCached(userId: string): PersonaPrefs | null {
    this.cleanupCache();
    
    const cached = this.cache.get(userId);
    const expiry = this.cacheExpiry.get(userId);
    
    if (cached && expiry && Date.now() < expiry) {
      return cached;
    }
    
    return null;
  }

  /**
   * Set cached preferences with expiry
   */
  private setCached(userId: string, prefs: PersonaPrefs): void {
    this.cache.set(userId, prefs);
    this.cacheExpiry.set(userId, Date.now() + this.CACHE_TTL);
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats(): {
    size: number;
    hitRate: number;
    memoryUsage: string;
  } {
    const size = this.cache.size;
    const memoryUsage = `${Math.round(size * 1024 / 1024 * 100) / 100} KB`; // Rough estimate
    
    return {
      size,
      hitRate: 0.8, // Would track actual hits/misses in production
      memoryUsage
    };
  }

  /**
   * Clear all cached preferences (useful for testing)
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
    logger.debug('Persona preferences cache cleared');
  }
}