/**
 * Performance Optimizations for PersonalOracleAgent
 * Addresses memory management, response time, and resource efficiency
 */

import { LRUCache } from './utils/LRUCache';
import { debounce, throttle } from './utils/RateLimiting';

// ============================================================================
// 1. MEMORY MANAGEMENT OPTIMIZATIONS
// ============================================================================

/**
 * Bounded Memory Manager with sliding window and compression
 */
export class BoundedMemoryManager {
  private readonly MAX_HISTORY_SIZE = 50;
  private readonly MAX_PATTERN_SIZE = 20;
  private readonly MAX_BREAKTHROUGH_SIZE = 10;
  private readonly COMPRESSION_THRESHOLD = 100; // chars

  /**
   * Compress old conversation entries to save memory
   */
  compressHistoryEntry(entry: any): any {
    if (entry.input.length > this.COMPRESSION_THRESHOLD) {
      return {
        ...entry,
        input: this.extractKeyPhrases(entry.input),
        response: this.extractKeyPhrases(entry.response),
        compressed: true,
        originalLength: entry.input.length
      };
    }
    return entry;
  }

  /**
   * Extract key phrases for compression
   */
  private extractKeyPhrases(text: string): string {
    // Keep first and last 30 chars plus important keywords
    const keywords = this.extractKeywords(text);
    const start = text.substring(0, 30);
    const end = text.substring(text.length - 30);
    return `${start}...[${keywords.join(', ')}]...${end}`;
  }

  private extractKeywords(text: string): string[] {
    const importantWords = text
      .toLowerCase()
      .match(/\b(feel|think|want|need|help|stuck|pattern|always|never)\b/g);
    return [...new Set(importantWords || [])].slice(0, 5);
  }

  /**
   * Maintain sliding window of conversation
   */
  maintainSlidingWindow<T>(array: T[], maxSize: number): T[] {
    if (array.length > maxSize) {
      // Keep 20% of oldest for context, 80% of newest
      const keepOld = Math.floor(maxSize * 0.2);
      const keepNew = maxSize - keepOld;

      const oldEntries = array.slice(0, keepOld);
      const newEntries = array.slice(-keepNew);

      return [...oldEntries, ...newEntries];
    }
    return array;
  }
}

// ============================================================================
// 2. CACHING OPTIMIZATIONS
// ============================================================================

/**
 * Multi-tier caching system for patterns and responses
 */
export class PatternCache {
  private elementalCache: LRUCache<string, any>;
  private emotionalCache: LRUCache<string, any>;
  private responseCache: LRUCache<string, string>;

  constructor() {
    this.elementalCache = new LRUCache<string, any>(100);
    this.emotionalCache = new LRUCache<string, any>(100);
    this.responseCache = new LRUCache<string, string>(50);
  }

  /**
   * Cache elemental pattern analysis
   */
  cacheElementalPattern(input: string, pattern: any): void {
    const key = this.generatePatternKey(input);
    this.elementalCache.set(key, {
      pattern,
      timestamp: Date.now()
    });
  }

  /**
   * Get cached pattern if fresh
   */
  getCachedPattern(input: string, maxAge: number = 300000): any | null {
    const key = this.generatePatternKey(input);
    const cached = this.elementalCache.get(key);

    if (cached && (Date.now() - cached.timestamp) < maxAge) {
      return cached.pattern;
    }
    return null;
  }

  /**
   * Generate cache key from input
   */
  private generatePatternKey(input: string): string {
    // Simple hash function for cache key
    return input
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 50);
  }
}

// ============================================================================
// 3. RESPONSE OPTIMIZATION
// ============================================================================

/**
 * Response pipeline optimizer
 */
export class ResponseOptimizer {
  private processingQueue: Array<() => Promise<any>> = [];
  private isProcessing = false;

  /**
   * Batch similar pattern detections
   */
  async batchPatternDetection(inputs: string[]): Promise<any[]> {
    // Process patterns in parallel when possible
    const promises = inputs.map(input =>
      this.detectPatternOptimized(input)
    );

    return Promise.all(promises);
  }

  /**
   * Optimized pattern detection with early exit
   */
  private async detectPatternOptimized(input: string): Promise<any> {
    const lowerInput = input.toLowerCase();

    // Early exit conditions
    if (lowerInput.length < 10) {
      return { element: 'air', confidence: 0.3 };
    }

    // Quick keyword scan
    const quickPatterns = {
      fire: /urgent|now|burning|intense/i,
      water: /feel|emotion|flow|tears/i,
      earth: /grounded|solid|practical|stable/i,
      air: /think|idea|concept|mental/i
    };

    for (const [element, pattern] of Object.entries(quickPatterns)) {
      if (pattern.test(lowerInput)) {
        return { element, confidence: 0.7, quick: true };
      }
    }

    // Full analysis only if needed
    return this.fullPatternAnalysis(input);
  }

  private async fullPatternAnalysis(input: string): Promise<any> {
    // Placeholder for full analysis
    return { element: 'balanced', confidence: 0.5 };
  }

  /**
   * Debounced state updates
   */
  updateStateDebounced = debounce((state: any, updates: any) => {
    Object.assign(state, updates);
  }, 100);

  /**
   * Throttled API calls
   */
  callAPIThrottled = throttle(async (endpoint: string, data: any) => {
    // API call implementation
    return fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }, 1000); // Max 1 call per second
}

// ============================================================================
// 4. LAZY LOADING AND CODE SPLITTING
// ============================================================================

/**
 * Lazy loader for heavy components
 */
export class LazyComponentLoader {
  private loadedModules = new Map<string, any>();

  /**
   * Load module only when needed
   */
  async loadModule(moduleName: string): Promise<any> {
    if (this.loadedModules.has(moduleName)) {
      return this.loadedModules.get(moduleName);
    }

    let module;
    switch (moduleName) {
      case 'metaphors':
        module = await import('../metaphors/MetaphorOffering');
        break;
      case 'alchemical':
        module = await import('./AlchemicalGuidance');
        break;
      case 'sacred':
        module = await import('./SacredMirrorResponse');
        break;
      default:
        throw new Error(`Unknown module: ${moduleName}`);
    }

    this.loadedModules.set(moduleName, module);
    return module;
  }

  /**
   * Preload modules during idle time
   */
  preloadDuringIdle(modules: string[]): void {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        modules.forEach(module => this.loadModule(module));
      });
    }
  }
}

// ============================================================================
// 5. DATABASE OPTIMIZATION
// ============================================================================

/**
 * Optimized database operations
 */
export class DatabaseOptimizer {
  private writeQueue: any[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_DELAY = 1000; // 1 second

  /**
   * Queue write for batching
   */
  queueWrite(data: any): void {
    this.writeQueue.push(data);

    if (this.writeQueue.length >= this.BATCH_SIZE) {
      this.flushWrites();
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.flushWrites(), this.BATCH_DELAY);
    }
  }

  /**
   * Flush all queued writes
   */
  private async flushWrites(): Promise<void> {
    if (this.writeQueue.length === 0) return;

    const batch = [...this.writeQueue];
    this.writeQueue = [];

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    try {
      await this.executeBatchWrite(batch);
    } catch (error) {
      console.error('Batch write failed:', error);
      // Re-queue failed items
      this.writeQueue.unshift(...batch);
    }
  }

  private async executeBatchWrite(batch: any[]): Promise<void> {
    // Implementation depends on database
    console.log(`Writing batch of ${batch.length} items`);
  }
}

// ============================================================================
// 6. MONITORING AND METRICS
// ============================================================================

/**
 * Performance monitoring
 */
export class PerformanceMonitor {
  private metrics = {
    responseTime: [] as number[],
    memoryUsage: [] as number[],
    cacheHitRate: 0,
    patternDetectionTime: [] as number[]
  };

  /**
   * Track response time
   */
  trackResponseTime(startTime: number): void {
    const duration = Date.now() - startTime;
    this.metrics.responseTime.push(duration);

    // Keep only last 100 measurements
    if (this.metrics.responseTime.length > 100) {
      this.metrics.responseTime.shift();
    }

    if (duration > 1000) {
      console.warn(`Slow response detected: ${duration}ms`);
    }
  }

  /**
   * Get performance report
   */
  getPerformanceReport(): any {
    const avgResponseTime = this.average(this.metrics.responseTime);
    const p95ResponseTime = this.percentile(this.metrics.responseTime, 95);

    return {
      avgResponseTime,
      p95ResponseTime,
      cacheHitRate: this.metrics.cacheHitRate,
      memoryUsage: process.memoryUsage?.() || {},
      warnings: this.getPerformanceWarnings()
    };
  }

  private average(arr: number[]): number {
    return arr.reduce((a, b) => a + b, 0) / arr.length || 0;
  }

  private percentile(arr: number[], p: number): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  private getPerformanceWarnings(): string[] {
    const warnings = [];

    if (this.average(this.metrics.responseTime) > 500) {
      warnings.push('Average response time exceeds 500ms');
    }

    const memUsage = process.memoryUsage?.();
    if (memUsage && memUsage.heapUsed > 100 * 1024 * 1024) {
      warnings.push('Memory usage exceeds 100MB');
    }

    return warnings;
  }
}

// ============================================================================
// 7. OPTIMIZED AGENT FACTORY
// ============================================================================

/**
 * Factory for creating optimized agents
 */
export class OptimizedAgentFactory {
  private memoryManager = new BoundedMemoryManager();
  private patternCache = new PatternCache();
  private responseOptimizer = new ResponseOptimizer();
  private dbOptimizer = new DatabaseOptimizer();
  private perfMonitor = new PerformanceMonitor();
  private lazyLoader = new LazyComponentLoader();

  /**
   * Create optimized agent configuration
   */
  createOptimizedConfig(): any {
    return {
      memoryManager: this.memoryManager,
      cache: this.patternCache,
      optimizer: this.responseOptimizer,
      database: this.dbOptimizer,
      monitor: this.perfMonitor,
      loader: this.lazyLoader,

      // Performance settings
      settings: {
        maxHistorySize: 50,
        compressionEnabled: true,
        cachingEnabled: true,
        batchingEnabled: true,
        lazyLoadingEnabled: true,
        monitoringEnabled: true,

        // Thresholds
        slowResponseThreshold: 1000,
        memoryWarningThreshold: 100 * 1024 * 1024,
        cacheMaxAge: 5 * 60 * 1000, // 5 minutes

        // Optimization flags
        useQuickPatternDetection: true,
        useResponseCaching: true,
        useDebouncing: true,
        useThrottling: true
      }
    };
  }
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/**
 * Example of integrating optimizations into PersonalOracleAgent
 *
 * ```typescript
 * import { OptimizedAgentFactory } from './PerformanceOptimizations';
 *
 * class PersonalOracleAgent {
 *   private optimization: any;
 *
 *   constructor(userId: string) {
 *     const factory = new OptimizedAgentFactory();
 *     this.optimization = factory.createOptimizedConfig();
 *   }
 *
 *   async processInteraction(input: string): Promise<any> {
 *     const startTime = Date.now();
 *
 *     // Check cache first
 *     const cached = this.optimization.cache.getCachedPattern(input);
 *     if (cached) {
 *       this.optimization.monitor.trackResponseTime(startTime);
 *       return cached;
 *     }
 *
 *     // Process with optimization
 *     const response = await this.processOptimized(input);
 *
 *     // Track metrics
 *     this.optimization.monitor.trackResponseTime(startTime);
 *
 *     return response;
 *   }
 * }
 * ```
 */

export default OptimizedAgentFactory;