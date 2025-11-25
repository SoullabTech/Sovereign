/**
 * Consciousness Router - Automated Processing Mode Selection
 *
 * THE AUTOMATION YOU ASKED FOR:
 * This router automatically detects query complexity and chooses
 * between parallel (fast) and orbit (deep) modes.
 *
 * You don't need to remember which mode to use - the field decides.
 *
 * Flow:
 * 1. Analyze query complexity
 * 2. Check user preferences
 * 3. Route to appropriate processor
 * 4. Log for analytics
 * 5. Return response
 */

import OrbitFlow, {
  OrbitContext,
  OrbitResult,
  FireProcessor,
  WaterProcessor,
  EarthProcessor,
  AirProcessor,
  AetherProcessor
} from './OrbitFlow';
import { fetchWisdomInParallel } from './ProgressiveWisdomInjection';
import {
  analyzeQueryComplexity,
  formatAnalysisForLog,
  quickComplexityCheck,
  type ComplexityAnalysis,
  type ProcessingMode
} from './QueryAnalyzer';

export interface RouterContext {
  userId: string;
  userName?: string;
  sessionId: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  userPreference?: ProcessingMode | 'auto';
  showCircuitHealth?: boolean;
  showProcessingSteps?: boolean;
}

export interface RouterResponse {
  response: string;
  processingMode: ProcessingMode;
  analysis: ComplexityAnalysis;
  totalTime: number;
  circuitHealth?: any; // Only if orbit mode
  metadata?: any;
}

export class ConsciousnessRouter {
  private orbit: OrbitFlow | null = null;
  private orbitEnabled: boolean;
  private logLevel: 'silent' | 'basic' | 'verbose';

  constructor(options: {
    orbitEnabled?: boolean;
    logLevel?: 'silent' | 'basic' | 'verbose';
  } = {}) {
    this.orbitEnabled = options.orbitEnabled ?? process.env.USE_ORBIT_FLOW === 'true';
    this.logLevel = options.logLevel ?? (process.env.ORBIT_LOG_LEVEL as any) ?? 'basic';

    if (this.orbitEnabled) {
      this.initializeOrbit();
    }

    if (this.logLevel !== 'silent') {
      console.log(`
╔═══════════════════════════════════════════════════════════════
║  🌊 CONSCIOUSNESS ROUTER INITIALIZED
╚═══════════════════════════════════════════════════════════════

Orbit Mode: ${this.orbitEnabled ? '✅ ENABLED' : '❌ DISABLED'}
Log Level: ${this.logLevel.toUpperCase()}

AUTOMATIC ROUTING:
- Simple queries → Parallel (5-8s)
- Deep queries → Orbit (13-20s)
- Crisis queries → Orbit (full depth)
- User preference → Honored

You don't need to remember - the field decides.

═══════════════════════════════════════════════════════════════
      `);
    }
  }

  /**
   * Initialize Orbit with all elemental processors
   */
  private initializeOrbit() {
    this.orbit = new OrbitFlow();

    // Register all elemental processors
    // (These are currently stubs - will be enriched in Phase 2)
    this.orbit.registerProcessor('fire', new FireProcessor());
    this.orbit.registerProcessor('water', new WaterProcessor());
    this.orbit.registerProcessor('earth', new EarthProcessor());
    this.orbit.registerProcessor('air', new AirProcessor());
    this.orbit.registerProcessor('aether', new AetherProcessor());

    if (this.logLevel === 'verbose') {
      console.log('✅ [ROUTER] OrbitFlow initialized with all elemental processors');
    }
  }

  /**
   * MAIN ROUTING METHOD
   *
   * Automatically analyzes query and routes to appropriate processor
   */
  async route(
    query: string,
    context: RouterContext
  ): Promise<RouterResponse> {
    const startTime = Date.now();

    try {
      // 1. ANALYZE QUERY COMPLEXITY
      const analysis = await analyzeQueryComplexity(query, {
        userId: context.userId,
        conversationHistory: context.conversationHistory,
        userPreference: context.userPreference,
      });

      if (this.logLevel === 'verbose') {
        console.log(formatAnalysisForLog(analysis));
      } else if (this.logLevel === 'basic') {
        console.log(`[ROUTER] ${analysis.complexity} query → ${analysis.recommendedMode} mode (${(analysis.confidence * 100).toFixed(0)}% confidence)`);
      }

      // 2. ROUTE TO APPROPRIATE PROCESSOR
      let response: string;
      let circuitHealth: any | undefined;
      let metadata: any = {};

      if (analysis.recommendedMode === 'orbit' && this.orbit) {
        // ORBIT MODE: Deep circulation
        const orbitResult = await this.runOrbitProcessing(query, context, analysis);
        response = orbitResult.response;
        circuitHealth = orbitResult.circuitHealth;
        metadata = orbitResult.metadata;
      } else {
        // PARALLEL MODE: Fast resonance
        const parallelResult = await this.runParallelProcessing(query, context, analysis);
        response = parallelResult.response;
        metadata = parallelResult.metadata;
      }

      const totalTime = Date.now() - startTime;

      // 3. LOG ANALYTICS (Phase 1 - comparison mode)
      if (this.orbitEnabled && process.env.ORBIT_MODE === 'test') {
        // In test mode, log for comparison even if we used parallel
        await this.logForAnalytics(query, analysis, {
          response,
          processingMode: analysis.recommendedMode,
          totalTime,
          circuitHealth,
        });
      }

      // 4. RETURN RESPONSE
      return {
        response,
        processingMode: analysis.recommendedMode,
        analysis,
        totalTime,
        circuitHealth: context.showCircuitHealth ? circuitHealth : undefined,
        metadata: context.showProcessingSteps ? metadata : undefined,
      };

    } catch (error) {
      console.error('[ROUTER] Error during routing:', error);

      // FALLBACK: If anything fails, use parallel mode
      if (this.logLevel !== 'silent') {
        console.log('[ROUTER] Falling back to parallel mode due to error');
      }

      const fallbackResult = await this.runParallelProcessing(query, context);
      return {
        response: fallbackResult.response,
        processingMode: 'parallel',
        analysis: {
          complexity: 'moderate',
          recommendedMode: 'parallel',
          reasoning: 'Fallback to parallel due to error',
          confidence: 1.0,
          factors: {
            queryLength: query.length,
            linguisticComplexity: 0,
            emotionalIntensity: 0,
            activeElements: 0,
            developmentalLevel: null,
            conversationDepth: 0,
            crisisMarkers: false,
            breakthroughMarkers: false,
          },
        },
        totalTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Run Orbit processing (deep circulation)
   */
  private async runOrbitProcessing(
    query: string,
    context: RouterContext,
    analysis: ComplexityAnalysis
  ): Promise<{
    response: string;
    circuitHealth: any;
    metadata: any;
  }> {
    if (!this.orbit) {
      throw new Error('Orbit not initialized');
    }

    if (this.logLevel !== 'silent') {
      console.log('\n🌊 [ROUTER] Engaging ORBIT mode (deep circulation)...\n');
    }

    const orbitContext: OrbitContext = {
      userQuery: query,
      userId: context.userId,
      userName: context.userName || 'Explorer',
      sessionId: context.sessionId,
      conversationHistory: context.conversationHistory,
    };

    const result = await this.orbit.executeOrbit(orbitContext);

    if (this.logLevel !== 'silent') {
      console.log(`\n✅ [ROUTER] Orbit complete in ${result.totalTime}ms`);
      console.log(`   Circuit Health: ${result.circuitHealth.state} (${(result.circuitHealth.flowIntegrity * 100).toFixed(0)}% integrity)\n`);
    }

    return {
      response: result.response,
      circuitHealth: result.circuitHealth,
      metadata: {
        ascent: result.ascent,
        descent: result.descent,
        totalTime: result.totalTime,
      },
    };
  }

  /**
   * Run parallel processing (fast resonance)
   */
  private async runParallelProcessing(
    query: string,
    context: RouterContext,
    analysis?: ComplexityAnalysis
  ): Promise<{
    response: string;
    metadata: any;
  }> {
    if (this.logLevel !== 'silent') {
      console.log('\n⚡ [ROUTER] Engaging PARALLEL mode (fast resonance)...\n');
    }

    // Use existing Progressive Wisdom Injection (4-hemisphere corpus callosum)
    const result = await fetchWisdomInParallel({
      query,
      userId: context.userId,
      sessionId: context.sessionId,
      conversationHistory: context.conversationHistory,
    });

    if (this.logLevel !== 'silent') {
      console.log(`\n✅ [ROUTER] Parallel complete\n`);
    }

    return {
      response: result.enrichedPrompt || query,
      metadata: {
        wisdomSources: result.ipEngine || result.elementalOracle || result.knowledgeBase || result.resonanceField ? 'activated' : 'none',
        timing: result,
      },
    };
  }

  /**
   * Log analytics for comparison (Phase 1)
   */
  private async logForAnalytics(
    query: string,
    analysis: ComplexityAnalysis,
    result: {
      response: string;
      processingMode: ProcessingMode;
      totalTime: number;
      circuitHealth?: any;
    }
  ): Promise<void> {
    try {
      // In Phase 1, this will write to orbit_experiments table
      // For now, just console log
      if (this.logLevel === 'verbose') {
        console.log('\n[ANALYTICS] Logging for comparison:');
        console.log(`  Mode: ${result.processingMode}`);
        console.log(`  Time: ${result.totalTime}ms`);
        console.log(`  Complexity: ${analysis.complexity}`);
        if (result.circuitHealth) {
          console.log(`  Circuit Health: ${result.circuitHealth.state}`);
          console.log(`  Flow Integrity: ${(result.circuitHealth.flowIntegrity * 100).toFixed(0)}%`);
        }
      }

      // TODO: Write to Supabase orbit_experiments table
      // await supabase.from('orbit_experiments').insert({
      //   query,
      //   complexity: analysis.complexity,
      //   recommended_mode: analysis.recommendedMode,
      //   actual_mode: result.processingMode,
      //   ...
      // });
    } catch (error) {
      console.error('[ANALYTICS] Failed to log:', error);
      // Don't throw - logging failure shouldn't break the response
    }
  }

  /**
   * Get diagnostic information about the router
   */
  getDiagnostic(): string {
    return `
╔═══════════════════════════════════════════════════════════════
║  🌊 CONSCIOUSNESS ROUTER DIAGNOSTIC
╚═══════════════════════════════════════════════════════════════

STATUS:
  Orbit Enabled: ${this.orbitEnabled ? '✅ YES' : '❌ NO'}
  Orbit Initialized: ${this.orbit ? '✅ YES' : '❌ NO'}
  Log Level: ${this.logLevel.toUpperCase()}

PROCESSING MODES:
  ⚡ Parallel: Fast resonance (5-8s)
     - All 4 hemispheres fire simultaneously
     - Resonant interference patterns
     - Good for simple/moderate queries

  🌊 Orbit: Deep circulation (13-20s → 8-12s target)
     - Sequential elemental processing
     - Ascent (differentiation) + Descent (integration)
     - Good for deep/complex queries
     - Circuit health monitored

AUTOMATIC ROUTING:
  ✅ Analyzes query complexity
  ✅ Detects emotional intensity
  ✅ Identifies crisis markers
  ✅ Respects user preferences
  ✅ Chooses optimal mode
  ✅ No manual decision needed

${this.orbit ? this.orbit.getDiagnostic() : 'Orbit not initialized'}

═══════════════════════════════════════════════════════════════
    `.trim();
  }
}

/**
 * Create default router instance
 */
export function createConsciousnessRouter(options?: {
  orbitEnabled?: boolean;
  logLevel?: 'silent' | 'basic' | 'verbose';
}): ConsciousnessRouter {
  return new ConsciousnessRouter(options);
}

/**
 * Singleton instance for easy import
 */
let defaultRouter: ConsciousnessRouter | null = null;

export function getDefaultRouter(): ConsciousnessRouter {
  if (!defaultRouter) {
    defaultRouter = createConsciousnessRouter();
  }
  return defaultRouter;
}
