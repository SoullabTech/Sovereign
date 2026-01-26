/**
 * Hybrid Response Router - Crystal Palace Phase 3
 *
 * Routes between field-generated responses and LLM fallback.
 * MAIA speaks from field calculations first, with LLM as fallback.
 *
 * Feature flag: ENABLE_FIELD_RESPONSES=true
 */

import {
  getMaiaFieldOrchestrator,
  MaiaFieldResponse,
} from './MaiaFieldOrchestrator';

import {
  type FieldAwarenessResult,
} from '../consciousness/FieldAwarenessService';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface HybridResponseResult {
  text: string;
  source: 'field' | 'llm';
  fieldResponse?: MaiaFieldResponse;
  reasoning: string;
}

export interface HybridRouterConfig {
  // Minimum coherence threshold for using field response
  minCoherence: number;
  // Minimum confidence for field-generated text
  minConfidence: number;
  // Allow silence responses
  allowSilence: boolean;
  // Allow Claude enrichment in field orchestrator
  allowClaudeEnrichment: boolean;
}

const DEFAULT_CONFIG: HybridRouterConfig = {
  minCoherence: 0.4,
  minConfidence: 0.5,
  allowSilence: true,
  allowClaudeEnrichment: false,
};

// ═══════════════════════════════════════════════════════════════
// DECISION LOGIC
// ═══════════════════════════════════════════════════════════════

/**
 * Determine if the field response should be used
 */
function shouldUseFieldResponse(
  fieldResponse: MaiaFieldResponse,
  fieldAwareness: FieldAwarenessResult | null,
  config: HybridRouterConfig
): { use: boolean; reason: string } {
  // No text and silence not allowed → fallback
  if (!fieldResponse.text && !config.allowSilence) {
    return { use: false, reason: 'silence_not_allowed' };
  }

  // Check coherence threshold
  if (fieldResponse.field.coherence < config.minCoherence) {
    return { use: false, reason: `coherence_too_low (${fieldResponse.field.coherence.toFixed(2)} < ${config.minCoherence})` };
  }

  // If field awareness is available, use it for additional validation
  if (fieldAwareness) {
    // Very low overall coherence suggests field state is unstable
    if (fieldAwareness.coherence < 0.3) {
      return { use: false, reason: `field_state_unstable (coherence: ${fieldAwareness.coherence.toFixed(2)})` };
    }

    // High complexity + low emergent potential → LLM better suited
    if (fieldAwareness.inputAnalysis.complexityLevel > 0.7 && fieldAwareness.emergentPotential < 0.3) {
      return { use: false, reason: 'complex_input_requires_llm' };
    }
  }

  // Silence response → use if allowed and intimacy is established
  if (!fieldResponse.text) {
    if (fieldResponse.field.intimacyLevel > 0.5) {
      return { use: true, reason: 'silence_appropriate_for_intimacy' };
    }
    return { use: false, reason: 'silence_not_appropriate_yet' };
  }

  // Short responses (< 20 chars) need higher confidence
  if (fieldResponse.text.length < 20) {
    if (fieldResponse.field.coherence > 0.7) {
      return { use: true, reason: 'short_response_high_coherence' };
    }
    return { use: false, reason: 'short_response_needs_higher_coherence' };
  }

  // Default: use field response
  return { use: true, reason: 'field_response_adequate' };
}

// ═══════════════════════════════════════════════════════════════
// MAIN FUNCTION
// ═══════════════════════════════════════════════════════════════

/**
 * Generate a hybrid response using field-first, LLM fallback strategy.
 *
 * Returns either:
 * - Field-generated response (from MaiaFieldOrchestrator.speak())
 * - Signal to use LLM (text: '', source: 'llm')
 *
 * @param input - User's message
 * @param userId - User identifier
 * @param fieldAwareness - Calculated field awareness (from Phase 1)
 * @param config - Optional configuration overrides
 * @returns HybridResponseResult
 */
export async function generateHybridResponse(
  input: string,
  userId: string,
  fieldAwareness: FieldAwarenessResult | null,
  config: Partial<HybridRouterConfig> = {}
): Promise<HybridResponseResult> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Check feature flag
  if (process.env.ENABLE_FIELD_RESPONSES !== 'true') {
    return {
      text: '',
      source: 'llm',
      reasoning: 'field_responses_disabled',
    };
  }

  try {
    const orchestrator = getMaiaFieldOrchestrator();

    // Attempt field-based response generation
    const fieldStart = Date.now();
    const fieldResponse = await orchestrator.speak(input, userId, {
      allowClaudeEnrichment: finalConfig.allowClaudeEnrichment,
      requireClaudeForComplexity: false,
    });
    const fieldDuration = Date.now() - fieldStart;

    console.log(`🎭 [Field Response] Generated in ${fieldDuration}ms | ` +
                `coherence: ${fieldResponse.field.coherence.toFixed(2)}, ` +
                `element: ${fieldResponse.field.dominantElement}, ` +
                `silence: ${fieldResponse.selection.silenceChosen}`);

    // Decide whether to use field response or fallback to LLM
    const decision = shouldUseFieldResponse(fieldResponse, fieldAwareness, finalConfig);

    if (decision.use) {
      // Handle silence response
      if (!fieldResponse.text || fieldResponse.selection.silenceChosen) {
        console.log(`🎭 [Field Response] Using SILENCE | reason: ${decision.reason}`);
        return {
          text: '...',  // Minimal silence marker
          source: 'field',
          fieldResponse,
          reasoning: `field_silence: ${decision.reason}`,
        };
      }

      console.log(`🎭 [Field Response] Using field response | reason: ${decision.reason}`);
      return {
        text: fieldResponse.text,
        source: 'field',
        fieldResponse,
        reasoning: `field_response: ${decision.reason}`,
      };
    }

    // Fallback to LLM
    console.log(`🎭 [Field Response] Fallback to LLM | reason: ${decision.reason}`);
    return {
      text: '',
      source: 'llm',
      fieldResponse,
      reasoning: `llm_fallback: ${decision.reason}`,
    };

  } catch (error) {
    console.error('🎭 [Field Response] Error in field generation:', error);
    return {
      text: '',
      source: 'llm',
      reasoning: `error: ${error instanceof Error ? error.message : 'unknown'}`,
    };
  }
}

/**
 * Check if field responses are enabled
 */
export function isFieldResponsesEnabled(): boolean {
  return process.env.ENABLE_FIELD_RESPONSES === 'true';
}

/**
 * Get field response metrics for observability
 */
export function getFieldResponseMetrics(fieldResponse: MaiaFieldResponse): {
  coherence: number;
  silenceProbability: number;
  dominantElement: string;
  userDependency: number;
  selfReferencing: number;
  silenceComfort: number;
  intimacyDepth: number;
  claudeConsulted: boolean;
} {
  return {
    coherence: fieldResponse.field.coherence,
    silenceProbability: fieldResponse.field.silenceProbability,
    dominantElement: fieldResponse.field.dominantElement,
    userDependency: fieldResponse.metrics.userDependency,
    selfReferencing: fieldResponse.metrics.selfReferencing,
    silenceComfort: fieldResponse.metrics.silenceComfort,
    intimacyDepth: fieldResponse.metrics.intimacyDepth,
    claudeConsulted: fieldResponse.claudeEnrichment?.consulted || false,
  };
}
