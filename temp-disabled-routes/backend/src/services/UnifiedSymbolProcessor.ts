/**
 * UnifiedSymbolProcessor.ts - Single Source of Truth for Symbol Processing
 * 
 * Consolidates all symbol detection, processing, and caching into one optimized service.
 * Eliminates redundancy between SpiralMapper, DynamicGreetingService, and detectSymbols.
 * 
 * Performance targets: <30ms for symbol detection, <50ms for pattern analysis
 */

import { logger } from '../utils/logger';
import { SYMBOL_DICTIONARY, SymbolEntry } from './symbolDictionary';

export interface ProcessedSymbol {
  label: string;
  element?: string;
  archetype?: string;
  meaning?: string;
  weight: number;
  frequency: number;
  context: string;
  firstSeen: string;
  lastSeen: string;
}

export interface SymbolAnalysis {
  symbols: ProcessedSymbol[];
  recurringSymbols: ProcessedSymbol[];
  dominantElement?: string;
  dominantArchetype?: string;
  elementalBalance: Record<string, number>;
  archetypeBalance: Record<string, number>;
  narrativeThread?: string;
  processingTime: number;
}

export interface CachedAnalysis {
  userId: string;
  analysis: SymbolAnalysis;
  contentHash: string;
  timestamp: number;
  expiresAt: number;
}

export class UnifiedSymbolProcessor {
  private static cache = new Map<string, CachedAnalysis>();
  private static cacheExpiry = 10 * 60 * 1000; // 10 minutes

  /**
   * Main entry point - analyze symbols across user content with caching
   */
  static async analyzeUserSymbols(
    userId: string,
    contents: string[],
    forceRefresh = false
  ): Promise<SymbolAnalysis> {
    const startTime = performance.now();
    
    // Create content hash for cache key
    const contentText = contents.join('|');
    const contentHash = this.hashString(contentText);
    const cacheKey = `${userId}-${contentHash}`;

    // Check cache first
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() < cached.expiresAt) {
        logger.debug(`[SYMBOL_PROCESSOR] Cache hit for user ${userId}`);
        return cached.analysis;
      } else {
        this.cache.delete(cacheKey);
      }
    }

    try {
      // Process all content
      const analysis = await this.processSymbols(contents, startTime);
      
      // Cache the result
      this.cache.set(cacheKey, {
        userId,
        analysis,
        contentHash,
        timestamp: Date.now(),
        expiresAt: Date.now() + this.cacheExpiry
      });

      // Clean old cache entries periodically
      if (this.cache.size > 100) {
        this.cleanCache();
      }

      logger.debug(`[SYMBOL_PROCESSOR] Analyzed ${contents.length} pieces in ${analysis.processingTime.toFixed(1)}ms`);
      return analysis;

    } catch (error) {
      logger.error('[SYMBOL_PROCESSOR] Analysis failed:', error);
      
      // Return minimal fallback
      return {
        symbols: [],
        recurringSymbols: [],
        elementalBalance: {},
        archetypeBalance: {},
        processingTime: performance.now() - startTime
      };
    }
  }

  /**
   * Process symbols from content array
   */
  private static async processSymbols(
    contents: string[],
    startTime: number
  ): Promise<SymbolAnalysis> {
    const symbolMap = new Map<string, ProcessedSymbol>();
    const elementCounts = new Map<string, number>();
    const archetypeCounts = new Map<string, number>();

    // Process each content piece
    contents.forEach((content, index) => {
      const timestamp = new Date(Date.now() - (contents.length - index) * 24 * 60 * 60 * 1000).toISOString();
      const detected = this.detectSymbolsInContent(content);
      
      detected.forEach(symbol => {
        const key = symbol.label;
        
        if (symbolMap.has(key)) {
          // Update existing symbol
          const existing = symbolMap.get(key)!;
          existing.frequency += 1;
          existing.lastSeen = timestamp;
          existing.weight = Math.max(existing.weight, symbol.weight);
        } else {
          // Add new symbol
          symbolMap.set(key, {
            ...symbol,
            frequency: 1,
            firstSeen: timestamp,
            lastSeen: timestamp
          });
        }

        // Track element and archetype counts
        if (symbol.element) {
          elementCounts.set(symbol.element, (elementCounts.get(symbol.element) || 0) + 1);
        }
        if (symbol.archetype) {
          archetypeCounts.set(symbol.archetype, (archetypeCounts.get(symbol.archetype) || 0) + 1);
        }
      });
    });

    // Convert to arrays and sort
    const allSymbols = Array.from(symbolMap.values())
      .sort((a, b) => {
        // Sort by frequency first, then weight
        if (a.frequency !== b.frequency) return b.frequency - a.frequency;
        return b.weight - a.weight;
      });

    const recurringSymbols = allSymbols.filter(s => s.frequency >= 2);

    // Calculate dominant patterns
    const dominantElement = this.findDominant(elementCounts);
    const dominantArchetype = this.findDominant(archetypeCounts);

    // Generate narrative thread
    const narrativeThread = this.generateNarrative(recurringSymbols, dominantElement, dominantArchetype);

    const processingTime = performance.now() - startTime;

    // Performance warning
    if (processingTime > 50) {
      logger.warn(`[SYMBOL_PROCESSOR] Slow processing: ${processingTime.toFixed(1)}ms for ${contents.length} pieces`);
    }

    return {
      symbols: allSymbols,
      recurringSymbols,
      dominantElement,
      dominantArchetype,
      elementalBalance: Object.fromEntries(elementCounts),
      archetypeBalance: Object.fromEntries(archetypeCounts),
      narrativeThread,
      processingTime
    };
  }

  /**
   * Detect symbols in single content piece (optimized)
   */
  private static detectSymbolsInContent(content: string): ProcessedSymbol[] {
    const matches: ProcessedSymbol[] = [];
    const foundLabels = new Set<string>();
    const lowerContent = content.toLowerCase();

    // Optimized: pre-filter relevant symbols
    const relevantSymbols = SYMBOL_DICTIONARY.filter(entry => {
      // Quick string check before regex
      const pattern = entry.regex.source.toLowerCase()
        .replace(/\\b/g, '')
        .replace(/\|/g, ' ')
        .replace(/[^\w\s]/g, '');
      
      return pattern.split(' ').some(word => 
        word.length > 2 && lowerContent.includes(word)
      );
    });

    relevantSymbols.forEach(entry => {
      const match = content.match(entry.regex);
      if (match && !foundLabels.has(entry.label)) {
        foundLabels.add(entry.label);
        
        // Extract context snippet
        const matchIndex = content.search(entry.regex);
        const contextStart = Math.max(0, matchIndex - 20);
        const contextEnd = Math.min(content.length, matchIndex + match[0].length + 20);
        const context = content.substring(contextStart, contextEnd).trim();
        
        matches.push({
          label: entry.label,
          element: entry.element,
          archetype: entry.archetype,
          meaning: entry.meaning,
          weight: entry.weight || 5,
          frequency: 1,
          context: contextStart > 0 ? '...' + context : context,
          firstSeen: '',  // Will be set by caller
          lastSeen: ''    // Will be set by caller
        });
      }
    });

    return matches;
  }

  /**
   * Find dominant item from count map
   */
  private static findDominant(countMap: Map<string, number>): string | undefined {
    if (countMap.size === 0) return undefined;
    
    return Array.from(countMap.entries())
      .sort((a, b) => b[1] - a[1])[0][0];
  }

  /**
   * Generate narrative thread from symbols
   */
  private static generateNarrative(
    recurringSymbols: ProcessedSymbol[],
    dominantElement?: string,
    dominantArchetype?: string
  ): string | undefined {
    if (recurringSymbols.length === 0) return undefined;

    const top = recurringSymbols[0];
    
    if (recurringSymbols.length === 1) {
      return `The ${top.label} appears ${top.frequency} times across your journey${top.meaning ? `, weaving themes of ${top.meaning.toLowerCase()}` : ''}.`;
    }

    // Multiple recurring symbols
    const symbolNames = recurringSymbols.slice(0, 2).map(s => s.label).join(' and ');
    const totalAppearances = recurringSymbols.slice(0, 2).reduce((sum, s) => sum + s.frequency, 0);
    
    return `${symbolNames} dance through your narrative (${totalAppearances} appearances)${dominantElement ? `, anchored in ${dominantElement} energy` : ''}.`;
  }

  /**
   * Simple string hashing for cache keys
   */
  private static hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Clean expired cache entries
   */
  private static cleanCache(): void {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, cached] of this.cache.entries()) {
      if (now >= cached.expiresAt) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      logger.debug(`[SYMBOL_PROCESSOR] Cleaned ${cleanedCount} expired cache entries`);
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    size: number;
    hitRate?: number;
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
      oldestEntry: oldestTimestamp < now ? now - oldestTimestamp : undefined
    };
  }

  /**
   * Clear cache (for testing/debugging)
   */
  static clearCache(): void {
    this.cache.clear();
    logger.debug('[SYMBOL_PROCESSOR] Cache cleared');
  }

  /**
   * Quick symbol check for single piece of content (for greeting service)
   */
  static quickSymbolCheck(content: string): {
    hasSymbols: boolean;
    topSymbol?: ProcessedSymbol;
    element?: string;
    archetype?: string;
  } {
    const symbols = this.detectSymbolsInContent(content);
    
    if (symbols.length === 0) {
      return { hasSymbols: false };
    }
    
    const topSymbol = symbols[0];
    return {
      hasSymbols: true,
      topSymbol,
      element: topSymbol.element,
      archetype: topSymbol.archetype
    };
  }
}