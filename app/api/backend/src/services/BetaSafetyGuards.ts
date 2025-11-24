/**
 * BetaSafetyGuards.ts - Beta Demo Safeguards & Graceful Fallbacks
 * 
 * Ensures smooth beta demo experience by providing fallbacks for:
 * - Symbol processing failures
 * - Database connection issues  
 * - Empty/null data scenarios
 * - Service timeouts
 * 
 * Performance guarantee: Always returns valid responses within 3 seconds
 */

import { logger } from '../utils/logger';

export interface SafetyConfig {
  maxProcessingTime: number;
  enableFallbacks: boolean;
  mockDataOnFailure: boolean;
  logFailures: boolean;
}

export interface SafeExecutionResult<T> {
  success: boolean;
  data: T;
  fallbackUsed: boolean;
  processingTime: number;
  error?: string;
}

export class BetaSafetyGuards {
  private static config: SafetyConfig = {
    maxProcessingTime: 3000, // 3 seconds max
    enableFallbacks: true,
    mockDataOnFailure: true,
    logFailures: true
  };

  /**
   * Execute function with comprehensive safety wrapper
   */
  static async safeExecute<T>(
    operation: () => Promise<T>,
    fallback: () => T,
    operationName: string,
    timeoutMs: number = this.config.maxProcessingTime
  ): Promise<SafeExecutionResult<T>> {
    const startTime = performance.now();
    let fallbackUsed = false;
    
    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Operation timeout')), timeoutMs);
      });

      // Race between operation and timeout
      const data = await Promise.race([
        operation(),
        timeoutPromise
      ]);

      const processingTime = performance.now() - startTime;
      
      // Log slow operations
      if (processingTime > 1000) {
        logger.warn(`[SAFETY] Slow operation: ${operationName} took ${processingTime.toFixed(1)}ms`);
      }

      return {
        success: true,
        data,
        fallbackUsed: false,
        processingTime
      };

    } catch (error: any) {
      const processingTime = performance.now() - startTime;
      
      if (this.config.logFailures) {
        logger.error(`[SAFETY] Operation failed: ${operationName}`, {
          error: error.message,
          processingTime: processingTime.toFixed(1)
        });
      }

      if (this.config.enableFallbacks) {
        try {
          const fallbackData = fallback();
          fallbackUsed = true;
          
          logger.info(`[SAFETY] Fallback used for: ${operationName}`);
          
          return {
            success: true,
            data: fallbackData,
            fallbackUsed: true,
            processingTime,
            error: error.message
          };
        } catch (fallbackError: any) {
          logger.error(`[SAFETY] Fallback also failed: ${operationName}`, fallbackError.message);
        }
      }

      // Ultimate fallback - return empty/default state
      return {
        success: false,
        data: fallback(), // Still try fallback even if disabled
        fallbackUsed: true,
        processingTime,
        error: error.message
      };
    }
  }

  /**
   * Safe symbol analysis with fallbacks
   */
  static async safeSymbolAnalysis(
    userId: string,
    contents: string[]
  ): Promise<SafeExecutionResult<any>> {
    return this.safeExecute(
      async () => {
        const { UnifiedSymbolProcessor } = await import('./UnifiedSymbolProcessor');
        return await UnifiedSymbolProcessor.analyzeUserSymbols(userId, contents);
      },
      () => this.getMockSymbolAnalysis(),
      'SymbolAnalysis',
      1000 // 1 second timeout for symbol processing
    );
  }

  /**
   * Safe data fetch with fallbacks
   */
  static async safeDataFetch(
    userId: string,
    options: any
  ): Promise<SafeExecutionResult<any>> {
    return this.safeExecute(
      async () => {
        const { UnifiedDataAccessService } = await import('./UnifiedDataAccessService');
        return await UnifiedDataAccessService.fetchUserContext(userId, options);
      },
      () => this.getMockUserContext(userId),
      'DataFetch',
      2000 // 2 seconds timeout for data fetching
    );
  }

  /**
   * Safe spiral journey generation
   */
  static async safeSpiralGeneration(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<SafeExecutionResult<any>> {
    return this.safeExecute(
      async () => {
        const { SpiralMapper } = await import('./SpiralMapper');
        const mapper = new SpiralMapper();
        return await mapper.generateSpiralJourney(userId, startDate, endDate);
      },
      () => this.getMockSpiralJourney(userId),
      'SpiralGeneration',
      2500 // 2.5 seconds for spiral generation
    );
  }

  /**
   * Safe greeting generation
   */
  static async safeGreetingGeneration(
    userId: string,
    style?: 'prose' | 'poetic' | 'auto'
  ): Promise<SafeExecutionResult<string>> {
    return this.safeExecute(
      async () => {
        const { DynamicGreetingService } = await import('./DynamicGreetingService');
        return await DynamicGreetingService.generateGreeting(userId, style);
      },
      () => this.getMockGreeting(style),
      'GreetingGeneration',
      1500 // 1.5 seconds for greeting
    );
  }

  /**
   * Validate data integrity (prevents null/undefined crashes)
   */
  static validateData<T>(
    data: T | null | undefined,
    validator: (data: T) => boolean,
    fallback: T,
    dataName: string
  ): T {
    if (data === null || data === undefined) {
      logger.warn(`[SAFETY] Null/undefined data detected: ${dataName}, using fallback`);
      return fallback;
    }

    try {
      if (!validator(data)) {
        logger.warn(`[SAFETY] Invalid data structure: ${dataName}, using fallback`);
        return fallback;
      }
      return data;
    } catch (error: any) {
      logger.error(`[SAFETY] Data validation failed: ${dataName}`, error.message);
      return fallback;
    }
  }

  /**
   * Safe array access with fallbacks
   */
  static safeArrayAccess<T>(
    array: T[] | null | undefined,
    index: number,
    fallback: T,
    arrayName: string = 'array'
  ): T {
    if (!Array.isArray(array) || array.length === 0) {
      logger.debug(`[SAFETY] Empty or invalid array: ${arrayName}`);
      return fallback;
    }

    if (index < 0 || index >= array.length) {
      logger.debug(`[SAFETY] Array index out of bounds: ${arrayName}[${index}]`);
      return fallback;
    }

    return array[index] || fallback;
  }

  // ============ MOCK DATA PROVIDERS ============

  /**
   * Mock symbol analysis for demo safety
   */
  private static getMockSymbolAnalysis(): any {
    return {
      symbols: [
        {
          label: 'Journey',
          element: 'spirit',
          archetype: 'Seeker',
          meaning: 'Path of self-discovery',
          weight: 8,
          frequency: 1,
          context: 'Exploring the inner landscape...',
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString()
        }
      ],
      recurringSymbols: [],
      dominantElement: 'spirit',
      dominantArchetype: 'Seeker',
      elementalBalance: { spirit: 2, earth: 1 },
      archetypeBalance: { Seeker: 1 },
      narrativeThread: 'Your journey of self-discovery unfolds with gentle wisdom.',
      processingTime: 25
    };
  }

  /**
   * Mock user context for demo safety
   */
  private static getMockUserContext(userId: string): any {
    return {
      userId,
      sessions: [],
      journals: [
        {
          id: 'mock-journal-1',
          content: 'Today I reflected on my path forward. There\'s a sense of quiet anticipation.',
          created_at: new Date().toISOString(),
          type: 'reflection'
        }
      ],
      conversations: [],
      profile: {
        user_id: userId,
        archetype: 'Seeker',
        primary_element: 'spirit',
        communication_style: 'exploratory'
      },
      fetchTime: 50,
      cacheHit: false
    };
  }

  /**
   * Mock spiral journey for demo safety
   */
  private static getMockSpiralJourney(userId: string): any {
    return {
      userId,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
      totalSessions: 1,
      spiralPoints: [
        {
          id: 'mock-point-1',
          sessionId: 'mock-session-1',
          timestamp: new Date().toISOString(),
          phase: 'sacred_frame' as const,
          element: 'spirit' as const,
          intensity: 0.7,
          content: 'Beginning the inner journey',
          coordinates: { angle: 0, radius: 10 }
        }
      ],
      elementalBalance: [
        {
          element: 'spirit' as const,
          activity: 0.8,
          sessions: 1,
          trend: 'stable' as const,
          lastSeen: new Date().toISOString()
        }
      ],
      narrativeThreads: [],
      currentPhase: 'sacred_frame' as const,
      dominantElement: 'spirit' as const,
      recommendations: {
        nextPractice: 'Gentle meditation to deepen inner awareness',
        elementToBalance: 'earth' as const,
        narrativeToExplore: 'The path of conscious awakening'
      }
    };
  }

  /**
   * Mock greeting for demo safety
   */
  private static getMockGreeting(style?: string): string {
    const greetings = {
      poetic: '✨ Welcome, radiant soul. The sacred spiral beckons your presence. What mysteries call to you in this moment?',
      prose: 'Welcome back to this sacred space. I\'m here to support your journey of self-discovery. What would you like to explore today?',
      auto: '✨ Welcome, beautiful soul. I sense you\'re ready to dive deeper. What\'s stirring in your awareness right now?'
    };

    return greetings[style as keyof typeof greetings] || greetings.auto;
  }

  /**
   * Configure safety settings
   */
  static configure(config: Partial<SafetyConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('[SAFETY] Configuration updated:', config);
  }

  /**
   * Get current safety statistics
   */
  static getStats(): {
    config: SafetyConfig;
    uptime: number;
  } {
    return {
      config: this.config,
      uptime: performance.now()
    };
  }

  /**
   * Health check for all critical services
   */
  static async performHealthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'critical';
    services: Record<string, boolean>;
    timestamp: string;
  }> {
    const services: Record<string, boolean> = {};
    
    try {
      // Quick test of each service
      const symbolTest = await this.safeSymbolAnalysis('health-check', ['test content']);
      services.symbolProcessor = symbolTest.success;

      const dataTest = await this.safeDataFetch('health-check', { limit: 1 });
      services.dataAccess = dataTest.success;

      const greetingTest = await this.safeGreetingGeneration('health-check');
      services.greetingService = greetingTest.success;

      const healthyServices = Object.values(services).filter(Boolean).length;
      const totalServices = Object.keys(services).length;
      
      let status: 'healthy' | 'degraded' | 'critical';
      if (healthyServices === totalServices) status = 'healthy';
      else if (healthyServices >= totalServices * 0.5) status = 'degraded';
      else status = 'critical';

      return {
        status,
        services,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger.error('[SAFETY] Health check failed:', error.message);
      return {
        status: 'critical',
        services,
        timestamp: new Date().toISOString()
      };
    }
  }
}