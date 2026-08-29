// backend: lib/ai/types.ts
// Provider tracking for sovereignty auditing

// Phase 1: Sovereign inference routing mode
// Unset/empty = zero behavior change (existing MAIA_TEXT_PROVIDER logic)
// primary     = Anthropic first, local fallback
// sovereign   = Local first, degraded on failure (no vendor switch)
// local_only  = Local only, degraded on failure
export type InferenceMode = 'primary' | 'sovereign' | 'local_only';

export type ProviderName =
  | 'ollama'
  | 'consciousness_engine'
  | 'anthropic'
  | 'openai'
  | 'moonshot'
  | 'multi_engine'
  | 'local_inference'   // Phase 1: maia-local-inference service (sovereign/local_only modes)
  | 'unknown';

// ✅ Phase 1: token usage logging support (optional, non-breaking)
// Includes both camelCase (new) and snake_case (existing claudeClient output) so
// no existing provider client needs to change.
export type TokenUsage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  // Legacy snake_case — populated by existing claudeClient, kept for compatibility
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
  // Keep room for provider-specific payloads without typing wars
  raw?: unknown;
};

export interface ProviderMeta {
  provider: ProviderName;
  model: string;              // e.g. deepseek-r1, claude-opus-4-5-20251101, etc.
  mode: 'full' | 'fallback';  // full = real model, fallback = template engine
  reason?: string;            // e.g. 'ollama_unavailable', 'key_missing', 'timeout'
  latencyMs?: number;
  // Claude-specific
  tier?: 'opus' | 'sonnet';   // Which Claude tier was used
  stop_reason?: string;       // 'end_turn', 'max_tokens', etc.
  // ✅ Phase 1: unified usage field (replaces inline type, non-breaking)
  usage?: TokenUsage;
}

/**
 * Constitutional verdict for one generated turn.
 *
 * Produced by the existing deterministic egress adjudicator (lib/sovereign/
 * stanceDetector via stanceReanchor.logStancePost), invoked once at the
 * provider-neutral seam. This type carries the verdict as OPTIONAL EVIDENCE —
 * it confers no authority on modelService, which does not adjudicate anything
 * itself and does not act on the verdict. The guard remains the adjudicator;
 * the seam only makes its result provider-neutral and transportable.
 *
 * adjudicatorVersion is not decoration: evidence may only be compared within a
 * single contract version, or detector evolution contaminates the comparison.
 *
 * Canon: docs/canon/MAIA_BEHAVIORAL_PORTABILITY.md
 */
export interface ConstitutionalVerdict {
  /** 'boundary' | 'relational' = stance retained; 'captured' = operational over-reach */
  stanceMode: 'boundary' | 'relational' | 'captured';
  /** Ratified the diagnosis or directed the next move despite disclaiming tools */
  authSlip: boolean;
  /** Which adjudicator contract produced this verdict (STANCE_ADJUDICATOR_VERSION) */
  adjudicatorVersion: string;
}

export interface TextResult {
  text: string;
  provider: ProviderMeta;
  /**
   * Constitutional verdict for this generation, when the seam adjudicated it.
   * Optional and non-load-bearing: absent on paths that returned before the
   * seam's adjudication, and never consulted by generation or routing.
   */
  verdict?: ConstitutionalVerdict;
}
