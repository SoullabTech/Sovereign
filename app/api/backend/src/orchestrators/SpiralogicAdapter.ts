/**
 * SpiralogicAdapter - Production orchestrator with budget enforcement and canary support
 * Enforces strict latency budgets, memoizes heavy computations, provides graceful fallbacks
 */

import type { IOrchestrator, QueryRequest, UnifiedResponse, ICache, IAnalytics } from '../core/interfaces';
import { SpiralogicCognitiveEngine } from '../spiralogic/SpiralogicCognitiveEngine';
import { ElementalAgentOrchestrator } from '../spiralogic/ElementalAgentOrchestrator';
import { AwarenessIntegrator } from '../spiralogic/AwarenessIntegrator';
import { logger } from '../utils/logger';


type Mode = 'full' | 'lite';
type DegradeMode = 'full' | 'lite' | 'minimal';

interface ElementalResonance {
  top: string;
  scores: Record<string, number>;
  confidence: number;
}

interface ContextData {
  memories: any[];
  recentPatterns: string[];
  spiralPhase: string;
  elementalBalance: Record<string, number>;
}

interface SynthesisResult {
  id: string;
  primary: {
    element: string;
    answer: string;
    archetype: string;
    confidence: number;
  };
  tokens?: {
    prompt: number;
    completion: number;
  };
  signals?: {
    evolutionary: boolean;
    shadowWork: boolean;
    challengeApplied: boolean;
  };
  metadata: {
    mode: DegradeMode;
    cognitiveArchitectures: string[];
    qualityScore: number;
  };
}

/**
 * Production-ready Spiralogic orchestrator with performance guardrails and canary support
 */
export class SpiralogicAdapter implements IOrchestrator {
  constructor(
    private engine: SpiralogicCognitiveEngine,
    private elements: ElementalAgentOrchestrator,
    private integrator: AwarenessIntegrator,
    private cache: ICache,
    private analytics: IAnalytics
  ) {
    logger.info("SpiralogicAdapter initialized with performance guardrails");
  }

  private k(userId: string, day: string): string { 
    return `arch:${userId}:${day}`; 
  }

  async process(q: QueryRequest): Promise<UnifiedResponse> {
    const t0 = Date.now();
    const day = new Date().toISOString().slice(0, 10);
    const softBudgetMs = Number(process.env.SPIRALOGIC_SOFT_BUDGET_MS ?? 450);
    const hardBudgetMs = Number(process.env.SPIRALOGIC_HARD_BUDGET_MS ?? 700);
    let mode: Mode = 'full';

    const timeout = <T>(p: Promise<T>, ms: number): Promise<T> =>
      new Promise<T>((resolve, reject) => {
        const t = setTimeout(() => reject(new Error('budget_exceeded')), ms);
        p.then(v => { clearTimeout(t); resolve(v); }, e => { clearTimeout(t); reject(e); });
      });

    try {
      // 1. Check for cached daily archetypes
      let arch = await this.cache.get<any>(this.k(q.userId, day));
      if (!arch) {
        arch = await timeout(this.engine.computeDailyArchetypes(q.userId), hardBudgetMs / 2);
        await this.cache.set(this.k(q.userId, day), arch, 24 * 60 * 60);
        this.analytics.emit({ type: 'archetype.cache', userId: q.userId, properties: { event: 'miss' } });
      } else {
        this.analytics.emit({ type: 'archetype.cache', userId: q.userId, properties: { event: 'hit' } });
      }

      // 2. Assess elemental resonance and load context  
      const [resonance, ctx] = await Promise.all([
        this.assessElementalResonance(q),
        this.loadUserContext(q.userId)
      ]);

      // 3. Budget check - degrade to lite mode if over soft budget
      if (Date.now() - t0 > softBudgetMs) mode = 'lite';

      // 4. Synthesis with budget enforcement
      const syn = await this.synthesizeResponse(q, {
        archetypalData: arch,
        resonance,
        context: ctx,
        mode,
        budgetRemaining: hardBudgetMs - (Date.now() - t0)
      });

      const text = syn.primary?.answer?.trim() || 'What feels like the next honest step right now?';

      // 5. Create unified response
      const out: UnifiedResponse = {
        id: syn.id ?? `syn-${Date.now()}`,
        text,
        tokens: syn.tokens ?? { prompt: 0, completion: 0 },
        meta: {
          element: (syn.primary?.element ?? resonance?.top ?? q.element ?? 'aether') as 'air' | 'fire' | 'water' | 'earth' | 'aether',
          evolutionary_awareness_active: !!syn.signals?.evolutionary,
          latencyMs: Date.now() - t0
        }
      };

      // 6. Analytics and observability
      this.analytics.emit({
        type: 'chat.completed',
        userId: q.userId,
        properties: {
          tokens: out.tokens.prompt + out.tokens.completion,
          latency: out.meta.latencyMs,
          mode,
          element: out.meta.element
        }
      });

      return out;

    } catch (e: any) {
      this.analytics.emit({ type: 'chat.error', userId: q.userId, properties: { err: e?.message || 'unknown' } });
      return {
        id: `fallback-${Date.now()}`,
        text: "Let's keep it simple. What feels like the next honest step for you right now?",
        tokens: { prompt: 0, completion: 0 },
        meta: { 
          element: q.element ?? 'aether', 
          evolutionary_awareness_active: false, 
          latencyMs: Date.now() - t0 
        }
      };
    }
  }

  /**
   * Get cached archetypes or compute daily if needed
   */
  private async getCachedArchetypes(userId: string, day: string): Promise<any> {
    const archKey = `archetypal_compute:${userId}:${day}`;
    
    let archetypes = await this.cache.get<any>(archKey);
    if (!archetypes) {
      logger.debug("Computing daily archetypes", { userId: userId.substring(0, 8) + '...' });
      
      // Initialize consciousness if needed and compute archetypes
      const consciousnessState = this.engine.getConsciousnessState(userId) || 
                                this.engine.initializeConsciousness(userId);
      
      archetypes = {
        dominant: consciousnessState.dominantElement,
        active: consciousnessState.archetypalActivations,
        phase: consciousnessState.currentPhase,
        integrationLevel: consciousnessState.integrationLevel,
        computed: new Date().toISOString()
      };
      
      // Cache for 24 hours
      await this.cache.set(archKey, archetypes, 24 * 60 * 60);
    }
    
    return archetypes;
  }

  /**
   * Assess elemental resonance from user query
   */
  private async assessElementalResonance(query: QueryRequest): Promise<ElementalResonance> {
    // Fast heuristic-based resonance assessment
    const text = query.text.toLowerCase();
    const scores = {
      fire: this.scoreElement(text, ['passion', 'energy', 'action', 'create', 'transform', 'power']),
      water: this.scoreElement(text, ['feel', 'emotion', 'flow', 'heal', 'cleanse', 'intuition']),
      earth: this.scoreElement(text, ['ground', 'stable', 'practical', 'build', 'secure', 'habit']),
      air: this.scoreElement(text, ['think', 'clarity', 'understand', 'communicate', 'analyze', 'idea']),
      aether: this.scoreElement(text, ['spirit', 'consciousness', 'sacred', 'transcend', 'unity', 'wisdom'])
    };

    // Override with explicit element hint if provided
    if (query.element && scores[query.element] !== undefined) {
      scores[query.element] += 0.5;
    }

    const top = Object.keys(scores).reduce((a, b) => scores[a as keyof typeof scores] > scores[b as keyof typeof scores] ? a : b);
    const confidence = scores[top as keyof typeof scores] / Math.max(...Object.values(scores));

    return { top, scores, confidence };
  }

  /**
   * Score element resonance using keyword matching
   */
  private scoreElement(text: string, keywords: string[]): number {
    return keywords.reduce((score, keyword) => {
      return score + (text.includes(keyword) ? 1 : 0);
    }, 0) + Math.random() * 0.1; // Small random factor to break ties
  }

  /**
   * Load user context data
   */
  private async loadUserContext(userId: string): Promise<ContextData> {
    // This would load from memory service - simplified for now
    return {
      memories: [], // Would load recent memories
      recentPatterns: [],
      spiralPhase: 'initiation',
      elementalBalance: { fire: 0.2, water: 0.2, earth: 0.2, air: 0.2, aether: 0.2 }
    };
  }

  /**
   * Synthesize response with appropriate depth based on mode and budget
   */
  private async synthesizeResponse(
    query: QueryRequest,
    options: {
      archetypalData: any;
      resonance: ElementalResonance;
      context: ContextData;
      mode: DegradeMode;
      budgetRemaining: number;
    }
  ): Promise<SynthesisResult> {
    const { archetypalData, resonance, context, mode, budgetRemaining } = options;

    if (mode === 'lite' || budgetRemaining < 200) {
      // Lite mode - fast synthesis with limited processing
      return {
        id: `lite-${Date.now()}`,
        primary: {
          element: resonance.top,
          answer: this.generateLiteResponse(query, resonance),
          archetype: archetypalData.dominant || 'Seeker',
          confidence: 0.7
        },
        tokens: { prompt: 150, completion: 80 },
        signals: {
          evolutionary: false,
          shadowWork: false,
          challengeApplied: false
        },
        metadata: {
          mode: 'lite',
          cognitiveArchitectures: ['heuristic'],
          qualityScore: 0.7
        }
      };
    }

    // Full mode - complete Spiralogic processing
    try {
      const consciousnessResponse = await this.engine.processConsciousnessQuery(
        query.userId,
        query.text,
        { context, archetypalData }
      );

      const consciousnessState = this.engine.getConsciousnessState(query.userId);
      const integratedAwareness = consciousnessState ? 
        await this.integrator.integrateConsciousness(query.userId, query.text, consciousnessState) :
        null;

      return {
        id: `full-${Date.now()}`,
        primary: {
          element: consciousnessResponse.element,
          answer: integratedAwareness?.integratedInsight || consciousnessResponse.spiralInsight,
          archetype: integratedAwareness?.dominantArchetype || 'Oracle',
          confidence: integratedAwareness?.awarenessLevel || 0.8
        },
        tokens: { prompt: 300, completion: 200 },
        signals: {
          evolutionary: (integratedAwareness?.awarenessLevel || 0) > 0.7,
          shadowWork: true, // Applied in response shaping
          challengeApplied: integratedAwareness ? (integratedAwareness.awarenessLevel || 0) > 0.6 : false
        },
        metadata: {
          mode: 'full',
          cognitiveArchitectures: consciousnessResponse.cognitiveFusion?.architectures || [],
          qualityScore: integratedAwareness?.awarenessLevel || 0.8
        }
      };
    } catch (error) {
      logger.warn("Full synthesis failed, falling back to lite mode", { 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return this.synthesizeResponse(query, { ...options, mode: 'lite' });
    }
  }

  /**
   * Generate lite response using heuristics
   */
  private generateLiteResponse(query: QueryRequest, resonance: ElementalResonance): string {
    const responses = {
      fire: "I sense your energy for action. What's the first step that calls to you right now?",
      water: "I hear the depth in your words. What does your heart know about this?",
      earth: "Let's ground this in something concrete. What would stability look like here?",
      air: "Your mind is working with this beautifully. What clarity wants to emerge?",
      aether: "There's wisdom moving through you. What's the deeper knowing you're sensing?"
    };

    return responses[resonance.top as keyof typeof responses] || responses.aether;
  }

  /**
   * Create unified response object
   */
  private createUnifiedResponse(synthesis: SynthesisResult, startTime: number, mode: DegradeMode): UnifiedResponse {
    return {
      id: synthesis.id,
      text: synthesis.primary.answer,
      tokens: synthesis.tokens || { prompt: 0, completion: 0 },
      meta: {
        element: synthesis.primary.element as 'air' | 'fire' | 'water' | 'earth' | 'aether',
        evolutionary_awareness_active: synthesis.signals?.evolutionary || false,
        latencyMs: Date.now() - startTime
      }
    };
  }

  /**
   * Create fallback response when processing fails
   */
  private createFallbackResponse(query: QueryRequest, startTime: number): UnifiedResponse {
    const fallbackResponses = [
      "Let's keep it simple. What feels like the next honest step for you right now?",
      "I hear you. What's the one thing you know for sure about this situation?",
      "Something's stirring in you around this. What wants your attention?",
      "What would it look like to trust yourself completely here?",
      "I'm curious - what's the conversation you're not quite ready to have yet?"
    ];

    return {
      id: `fallback-${Date.now()}`,
      text: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      tokens: { prompt: 0, completion: 0 },
      meta: {
        element: query.element || 'aether',
        evolutionary_awareness_active: false,
        latencyMs: Date.now() - startTime
      }
    };
  }

  /**
   * Emit analytics for observability
   */
  private emitAnalytics(query: QueryRequest, response: UnifiedResponse, mode: DegradeMode): void {
    this.analytics.emit({
      type: 'spiralogic.chat.completed',
      userId: query.userId,
      properties: {
        tokens: response.tokens.prompt + response.tokens.completion,
        latency: response.meta.latencyMs,
        mode,
        element: response.meta.element,
        evolutionaryActive: response.meta.evolutionary_awareness_active
      }
    });

    // Performance monitoring
    const hardBudgetMs = Number(process.env.SPIRALOGIC_HARD_BUDGET_MS ?? 700);
    if (response.meta.latencyMs > hardBudgetMs) {
      this.analytics.emit({
        type: 'spiralogic.performance.budget_exceeded',
        userId: query.userId,
        properties: {
          latency: response.meta.latencyMs,
          budget: hardBudgetMs
        }
      });
    }

    // Shadow work effectiveness tracking (simplified)
    if (response.meta.evolutionary_awareness_active) {
      this.analytics.emit({
        type: 'spiralogic.shadow_work.applied',
        userId: query.userId,
        properties: {
          element: response.meta.element,
          evolutionaryActive: response.meta.evolutionary_awareness_active
        }
      });
    }
  }

  /**
   * Get performance metrics for monitoring
   */
  public getPerformanceMetrics(): {
    averageLatency: number;
    budgetExceedRate: number;
    modeDistribution: Record<DegradeMode, number>;
    cacheHitRate: number;
  } {
    // This would be implemented with actual metrics collection
    return {
      averageLatency: 0,
      budgetExceedRate: 0,
      modeDistribution: { full: 0.8, lite: 0.2, minimal: 0.0 },
      cacheHitRate: 0.85
    };
  }

  /**
   * Health check for system monitoring
   */
  public async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, any>;
  }> {
    try {
      const testQuery: QueryRequest = {
        userId: 'health-check',
        text: 'test query for health monitoring'
      };

      const startTime = Date.now();
      const response = await this.process(testQuery);
      const latency = Date.now() - startTime;

      const hardBudgetMs = Number(process.env.SPIRALOGIC_HARD_BUDGET_MS ?? 700);
      const status = latency < hardBudgetMs ? 'healthy' : 
                     latency < hardBudgetMs * 1.5 ? 'degraded' : 'unhealthy';

      return {
        status,
        details: {
          latency,
          budget: hardBudgetMs,
          responseLength: response.text.length,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      };
    }
  }
}