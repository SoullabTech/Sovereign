/**
 * Canon Headers - Provenance Stamps for MAIA Responses
 *
 * CANON v1.1: Every endpoint that returns assistant text MUST attach these headers.
 * This makes bypass observable and canon enforcement provable.
 *
 * Headers:
 * - X-MAIA-Canon: v1.1 (canon version)
 * - X-MAIA-Validator: socratic (validator used)
 * - X-MAIA-Mode: PRESENCE|STANDARD (response mode)
 * - X-MAIA-Repair: 0|1 (whether regeneration occurred)
 * - X-MAIA-Pipeline: sovereign.getMaiaResponse|orchestrator|direct (source pipeline)
 * - X-MAIA-Source: pfi_full|pfi_legacy|fallback|direct (PFI source)
 * - X-MAIA-Request-Id: <uuid> (correlation ID)
 *
 * TRUTHFUL PROVIDER INFO (v1.1.1):
 * - X-MAIA-Provider: anthropic|ollama|fallback (which LLM provider actually handled it)
 * - X-MAIA-Model: <model-name> (actual model that generated the response)
 * - X-MAIA-Fallback: 0|1 (whether primary provider failed and fallback was used)
 *
 * MANDATE: Observability must never lie. These headers MUST reflect the actual
 * provider/model used, even when graceful degradation occurs.
 */

import type { SocraticValidationResult } from '@/lib/validation/socraticValidator';
import type { PFISource } from '../types/mindContext';

export type CanonPipeline =
  | 'sovereign.getMaiaResponse'
  | 'orchestrator.generateMaiaTurn'
  | 'oracle.conversation'
  | 'direct'
  | 'unknown';

export type CanonMode = 'PRESENCE' | 'STANDARD' | 'SANCTUARY';

export interface CanonHeadersInput {
  /** Request ID for correlation */
  requestId: string;
  /** Pipeline that generated the response */
  pipeline: CanonPipeline;
  /** PFI source (if available) */
  source?: PFISource | 'direct';
  /** Response mode */
  mode?: CanonMode;
  /** Socratic validation result (if available) */
  validation?: SocraticValidationResult | null;
  /** Whether regeneration occurred */
  repaired?: boolean;
  /** TRUTHFUL PROVIDER INFO - which LLM provider actually handled the request */
  provider?: 'anthropic' | 'ollama' | 'fallback';
  /** TRUTHFUL MODEL INFO - which model actually generated the response */
  model?: string;
  /** Whether a fallback provider was used (anthropic failed, ollama took over) */
  usedProviderFallback?: boolean;
}

/**
 * Generate canon provenance headers for MAIA responses
 *
 * MANDATE: No endpoint may return assistant text without these headers.
 */
export function makeCanonHeaders(input: CanonHeadersInput): Record<string, string> {
  const {
    requestId,
    pipeline,
    source = 'direct',
    mode = 'STANDARD',
    validation,
    repaired = false,
    provider,
    model,
    usedProviderFallback,
  } = input;

  return {
    'X-MAIA-Canon': 'v1.1',
    'X-MAIA-Validator': validation ? 'socratic' : 'none',
    'X-MAIA-Mode': mode,
    'X-MAIA-Repair': repaired ? '1' : '0',
    'X-MAIA-Pipeline': pipeline,
    'X-MAIA-Source': source,
    'X-MAIA-Request-Id': requestId,
    // TRUTHFUL PROVIDER INFO - never lie about which model handled the request
    ...(provider && { 'X-MAIA-Provider': provider }),
    ...(model && { 'X-MAIA-Model': model }),
    ...(typeof usedProviderFallback === 'boolean' && { 'X-MAIA-Fallback': usedProviderFallback ? '1' : '0' }),
    // Validation status (for observability)
    ...(validation && {
      'X-MAIA-Validation-Decision': validation.decision,
      'X-MAIA-Validation-Gold': validation.isGold ? '1' : '0',
    }),
  };
}

/**
 * Generate canon provenance metadata for WebSocket payloads
 *
 * MANDATE: WS payloads that contain assistant text must include meta.canon.
 */
export function makeCanonMeta(input: CanonHeadersInput): {
  canon: string;
  pipeline: string;
  mode: string;
  source: string;
  repaired: boolean;
  requestId: string;
  validated: boolean;
} {
  return {
    canon: 'v1.1',
    pipeline: input.pipeline,
    mode: input.mode || 'STANDARD',
    source: input.source || 'direct',
    repaired: input.repaired || false,
    requestId: input.requestId,
    validated: !!input.validation,
  };
}
