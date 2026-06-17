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

export interface ToolUseBlock {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface TextResult {
  text: string;
  provider: ProviderMeta;
  // Populated only when the caller passed `tools` and the model emitted tool_use
  // block(s). Used by the Proposal pipeline (docs/canon/MAIA_CONSENT_GATES.md):
  // a tool_use is a *proposal* surfaced for confirmation, never an executed action.
  toolUses?: ToolUseBlock[];
}
