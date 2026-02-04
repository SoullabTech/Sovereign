/**
 * SHADOW MODE RUNNER
 *
 * Runs local sovereign models in parallel with Claude (primary)
 * to collect comparison data for graduation training.
 *
 * Key principles:
 * - Never affects user experience (Claude response goes to user)
 * - Shadow responses logged for offline comparison
 * - Timeouts prevent shadow from blocking primary
 * - Graceful degradation if local models unavailable
 */

import { generateWithLocalModel, checkLocalModelHealth } from '../ai/localModelClient';
import { EngineComparisonService } from './engineComparisonService';

// Shadow mode configuration
const SHADOW_MODE_ENABLED = process.env.MAIA_SHADOW_MODE !== '0';
const SHADOW_TIMEOUT_MS = parseInt(process.env.MAIA_SHADOW_TIMEOUT_MS || '8000');
const SHADOW_ENGINES = (process.env.MAIA_SHADOW_ENGINES || 'deepseek-r1:8b').split(',');

export interface ShadowModeResult {
  enabled: boolean;
  engineResults: Array<{
    engineName: string;
    responseText: string;
    responseTimeMs: number;
    success: boolean;
    error?: string;
  }>;
  totalTimeMs: number;
}

/**
 * Run shadow engines in parallel (non-blocking)
 * Returns immediately, logs results to database asynchronously
 */
export async function runShadowEngines(params: {
  turnId: number;
  systemPrompt: string;
  userInput: string;
  processingProfile: 'FAST' | 'CORE' | 'DEEP';
}): Promise<void> {
  if (!SHADOW_MODE_ENABLED) {
    return;
  }

  const { turnId, systemPrompt, userInput, processingProfile } = params;

  // Fire and forget - don't await in caller
  runShadowEnginesAsync(turnId, systemPrompt, userInput, processingProfile)
    .catch(err => console.warn(`⚠️ [SHADOW] Background execution failed:`, err));
}

/**
 * Internal async runner - executes shadow engines and logs results
 */
async function runShadowEnginesAsync(
  turnId: number,
  systemPrompt: string,
  userInput: string,
  processingProfile: 'FAST' | 'CORE' | 'DEEP'
): Promise<ShadowModeResult> {
  const startTime = Date.now();
  const results: ShadowModeResult['engineResults'] = [];

  console.log(`🔮 [SHADOW] Starting shadow mode for turn ${turnId} | Engines: ${SHADOW_ENGINES.join(', ')}`);

  // Check local model health first
  const health = await checkLocalModelHealth();
  if (health.status === 'offline') {
    console.log(`⚠️ [SHADOW] Local models offline, skipping shadow mode`);
    return {
      enabled: SHADOW_MODE_ENABLED,
      engineResults: [],
      totalTimeMs: Date.now() - startTime
    };
  }

  // Run each shadow engine with timeout
  const shadowPromises = SHADOW_ENGINES.map(async (engineName) => {
    const engineStart = Date.now();

    try {
      // Use AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), SHADOW_TIMEOUT_MS);

      const result = await generateWithLocalModel({
        systemPrompt,
        userInput,
        meta: { shadowEngine: engineName }
      });

      clearTimeout(timeoutId);

      const responseTimeMs = Date.now() - engineStart;

      return {
        engineName,
        responseText: result.text,
        responseTimeMs,
        success: true
      };
    } catch (error) {
      const responseTimeMs = Date.now() - engineStart;
      const errorMessage = error instanceof Error ? error.message : String(error);

      console.warn(`⚠️ [SHADOW] Engine ${engineName} failed:`, errorMessage);

      return {
        engineName,
        responseText: '',
        responseTimeMs,
        success: false,
        error: errorMessage
      };
    }
  });

  // Wait for all shadow engines (with overall timeout)
  const settledResults = await Promise.allSettled(shadowPromises);

  for (const result of settledResults) {
    if (result.status === 'fulfilled') {
      results.push(result.value);
    } else {
      results.push({
        engineName: 'unknown',
        responseText: '',
        responseTimeMs: 0,
        success: false,
        error: result.reason?.message || 'Promise rejected'
      });
    }
  }

  // Log successful shadow responses to database
  const successfulResponses = results
    .filter(r => r.success && r.responseText)
    .map(r => ({
      engineName: r.engineName,
      responseText: r.responseText,
      responseTimeMs: r.responseTimeMs
    }));

  if (successfulResponses.length > 0) {
    try {
      await EngineComparisonService.logShadowResponses(
        turnId,
        successfulResponses,
        processingProfile
      );
      console.log(`✅ [SHADOW] Logged ${successfulResponses.length} shadow responses for turn ${turnId}`);
    } catch (err) {
      console.error(`❌ [SHADOW] Failed to log shadow responses:`, err);
    }
  }

  const totalTimeMs = Date.now() - startTime;
  console.log(`🔮 [SHADOW] Complete | Turn: ${turnId} | Success: ${successfulResponses.length}/${SHADOW_ENGINES.length} | Time: ${totalTimeMs}ms`);

  return {
    enabled: SHADOW_MODE_ENABLED,
    engineResults: results,
    totalTimeMs
  };
}

/**
 * Run shadow engines synchronously (for testing/debugging)
 * Returns full results - use only when you need to inspect shadow output
 */
export async function runShadowEnginesSync(params: {
  turnId: number;
  systemPrompt: string;
  userInput: string;
  processingProfile: 'FAST' | 'CORE' | 'DEEP';
}): Promise<ShadowModeResult> {
  if (!SHADOW_MODE_ENABLED) {
    return {
      enabled: false,
      engineResults: [],
      totalTimeMs: 0
    };
  }

  return runShadowEnginesAsync(
    params.turnId,
    params.systemPrompt,
    params.userInput,
    params.processingProfile
  );
}

/**
 * Check if shadow mode is enabled and healthy
 */
export async function getShadowModeStatus(): Promise<{
  enabled: boolean;
  healthy: boolean;
  engines: string[];
  localModelStatus: string;
}> {
  const health = await checkLocalModelHealth();

  return {
    enabled: SHADOW_MODE_ENABLED,
    healthy: health.status !== 'offline',
    engines: SHADOW_ENGINES,
    localModelStatus: health.status
  };
}
