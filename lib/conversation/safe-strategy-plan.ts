// backend: lib/conversation/safe-strategy-plan.ts

/**
 * SAFE STRATEGY PLANNER WRAPPER
 *
 * Safe wrapper around the Orchestration Optimizer and strategy planning systems.
 * Part of the fail-soft consciousness architecture.
 * Returns null on error instead of crashing the entire pipeline.
 */

import { OrchestrationOptimizer, QueryComplexity, SystemResources, PerformanceMetrics } from '@/lib/consciousness/orchestration-optimizer';
import { OrchestrationType } from '@/lib/ai/multiEngineOrchestrator';

// Lazy initialization to avoid constructor issues
let orchestrationOptimizer: OrchestrationOptimizer | null = null;

async function getOrchestrationOptimizer(): Promise<OrchestrationOptimizer> {
  if (!orchestrationOptimizer) {
    try {
      orchestrationOptimizer = new OrchestrationOptimizer();
    } catch (err: any) {
      console.warn('Failed to initialize orchestration optimizer:', err?.message || err);
      throw new Error('Orchestration optimizer initialization failed');
    }
  }
  return orchestrationOptimizer;
}

export interface StrategyPlanningParams {
  message: string;
  userId?: string;
  sessionId?: string;
  conversationHistory?: any[];
  systemResources?: SystemResources;
  userPreferences?: Record<string, any>;
}

export interface SafeStrategyPlan {
  complexity: QueryComplexity | null;
  orchestrationType: OrchestrationType | null;
  confidence: number;
  fallbackStrategy: 'simple' | 'standard' | 'complex';
  metadata: {
    analysisSuccessful: boolean;
    timestamp: string;
    processingTime: number;
  };
}

/**
 * Safe wrapper around query complexity analysis
 * Never throws. Returns null on error.
 */
export async function safeAnalyzeQueryComplexity(params: StrategyPlanningParams): Promise<QueryComplexity | null> {
  try {
    const { message, systemResources } = params;

    // Validate required parameters
    if (!message || typeof message !== 'string') {
      return null;
    }

    const optimizer = await getOrchestrationOptimizer();

    // Check if the analyzeComplexity method exists
    if (typeof optimizer.analyzeComplexity !== 'function') {
      // Fallback: create a simple complexity analysis
      return createFallbackComplexity(message);
    }

    const complexity = await optimizer.analyzeComplexity(message, systemResources);

    if (complexity && typeof complexity === 'object') {
      return complexity;
    }

    return createFallbackComplexity(message);
  } catch (err: any) {
    console.warn(
      'Query complexity analysis failed, using fallback:',
      err?.message || err,
    );
    return createFallbackComplexity(params.message);
  }
}

/**
 * Safe wrapper around orchestration type optimization
 * Never throws. Returns null on error.
 */
export async function safeOptimizeOrchestration(
  complexity: QueryComplexity,
  systemResources?: SystemResources,
  userPreferences?: Record<string, any>
): Promise<OrchestrationType | null> {
  try {
    if (!complexity || typeof complexity !== 'object') {
      return 'single'; // Safe default
    }

    const optimizer = await getOrchestrationOptimizer();

    // Check if the optimizeOrchestration method exists
    if (typeof optimizer.optimizeOrchestration !== 'function') {
      // Fallback: use complexity score to determine orchestration type
      return mapComplexityToOrchestration(complexity.score);
    }

    const orchestrationType = await optimizer.optimizeOrchestration(
      complexity,
      systemResources,
      userPreferences
    );

    if (orchestrationType && typeof orchestrationType === 'string') {
      return orchestrationType as OrchestrationType;
    }

    // Fallback to complexity-based determination
    return mapComplexityToOrchestration(complexity.score);
  } catch (err: any) {
    console.warn(
      'Orchestration optimization failed, using fallback:',
      err?.message || err,
    );
    return mapComplexityToOrchestration(complexity?.score || 0.5);
  }
}

/**
 * Safe combined strategy planning
 * Returns comprehensive strategy plan with fallbacks
 */
export async function safeGenerateStrategyPlan(params: StrategyPlanningParams): Promise<SafeStrategyPlan> {
  const startTime = Date.now();
  let complexity: QueryComplexity | null = null;
  let orchestrationType: OrchestrationType | null = null;
  let analysisSuccessful = false;

  try {
    // Step 1: Analyze complexity
    complexity = await safeAnalyzeQueryComplexity(params);

    if (complexity) {
      analysisSuccessful = true;

      // Step 2: Optimize orchestration type
      orchestrationType = await safeOptimizeOrchestration(
        complexity,
        params.systemResources,
        params.userPreferences
      );
    }
  } catch (err: any) {
    console.warn('Strategy plan generation failed:', err?.message || err);
    // Continue with fallback values
  }

  const processingTime = Date.now() - startTime;

  // Determine fallback strategy based on available information
  const fallbackStrategy = determineFallbackStrategy(params.message, complexity);

  return {
    complexity,
    orchestrationType: orchestrationType || 'single',
    confidence: analysisSuccessful ? (complexity?.score || 0.5) : 0.3,
    fallbackStrategy,
    metadata: {
      analysisSuccessful,
      timestamp: new Date().toISOString(),
      processingTime
    }
  };
}

/**
 * Record performance metrics safely
 */
export async function safeRecordPerformance(metrics: PerformanceMetrics): Promise<boolean> {
  try {
    const optimizer = await getOrchestrationOptimizer();

    if (typeof optimizer.recordPerformance === 'function') {
      await optimizer.recordPerformance(metrics);
      return true;
    }

    // Fallback: just log the metrics
    console.log('Strategy performance metrics:', {
      responseTime: metrics.responseTime,
      confidence: metrics.confidence,
      timestamp: metrics.timestamp
    });

    return true;
  } catch (err: any) {
    console.warn('Performance recording failed:', err?.message || err);
    return false;
  }
}

/**
 * Health check for strategy planning system
 */
export async function strategyPlannerHealthCheck(): Promise<{
  status: 'ok' | 'degraded' | 'error';
  functions: { [key: string]: 'available' | 'missing' };
}> {
  try {
    const optimizer = await getOrchestrationOptimizer();

    const functions = {
      analyzeComplexity: typeof optimizer.analyzeComplexity === 'function' ? 'available' : 'missing',
      optimizeOrchestration: typeof optimizer.optimizeOrchestration === 'function' ? 'available' : 'missing',
      recordPerformance: typeof optimizer.recordPerformance === 'function' ? 'available' : 'missing'
    };

    const availableCount = Object.values(functions).filter(status => status === 'available').length;
    const status = availableCount >= 2 ? 'ok' : availableCount >= 1 ? 'degraded' : 'error';

    return { status, functions };
  } catch (err: any) {
    console.warn('Strategy planner health check failed:', err?.message || err);
    return {
      status: 'error',
      functions: {
        analyzeComplexity: 'missing',
        optimizeOrchestration: 'missing',
        recordPerformance: 'missing'
      }
    };
  }
}

// HELPER FUNCTIONS

/**
 * Create a fallback complexity analysis based on basic heuristics
 */
function createFallbackComplexity(message: string): QueryComplexity {
  const length = message.length;
  const words = message.split(/\s+/).length;

  // Basic complexity scoring
  const lengthScore = Math.min(length / 500, 1); // Normalize to message length
  const wordComplexity = Math.min(words / 50, 1); // Normalize to word count

  // Check for complexity patterns
  const emotionalPatterns = ['feel', 'emotion', 'heart', 'love', 'pain', 'grief'];
  const existentialPatterns = ['purpose', 'meaning', 'existence', 'death', 'consciousness'];
  const practicalPatterns = ['work', 'decision', 'plan', 'action', 'steps'];

  const emotionalDepth = countPatterns(message, emotionalPatterns) / emotionalPatterns.length;
  const abstractConcepts = countPatterns(message, existentialPatterns) / existentialPatterns.length;
  const practicalElements = countPatterns(message, practicalPatterns) / practicalPatterns.length;

  const complexityScore = (lengthScore + wordComplexity + emotionalDepth + abstractConcepts) / 4;

  return {
    score: Math.min(complexityScore, 1),
    factors: {
      length: lengthScore,
      emotionalDepth,
      abstractConcepts,
      personalContext: Math.min((emotionalDepth + abstractConcepts) / 2, 1),
      timeImportance: practicalElements
    },
    recommended: mapComplexityToOrchestration(complexityScore)
  };
}

/**
 * Map complexity score to orchestration type
 */
function mapComplexityToOrchestration(score: number): OrchestrationType {
  if (score < 0.3) return 'single';
  if (score < 0.6) return 'parallel';
  if (score < 0.8) return 'sequential';
  return 'adaptive';
}

/**
 * Count pattern occurrences in message
 */
function countPatterns(message: string, patterns: string[]): number {
  const lowerMessage = message.toLowerCase();
  return patterns.reduce((count, pattern) => {
    return count + (lowerMessage.includes(pattern.toLowerCase()) ? 1 : 0);
  }, 0);
}

/**
 * Determine fallback strategy based on message analysis
 */
function determineFallbackStrategy(message: string, complexity: QueryComplexity | null): 'simple' | 'standard' | 'complex' {
  if (!complexity) {
    // Base on message length if no complexity analysis available
    return message.length < 50 ? 'simple' : message.length < 200 ? 'standard' : 'complex';
  }

  if (complexity.score < 0.3) return 'simple';
  if (complexity.score < 0.7) return 'standard';
  return 'complex';
}

/**
 * Get current orchestration optimizer instance (for debugging/testing)
 */
export function getOrchestrationOptimizerInstance() {
  return orchestrationOptimizer;
}