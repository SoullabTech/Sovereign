// backend: lib/ai/types.ts
// Provider tracking for sovereignty auditing

export type ProviderName =
  | 'ollama'
  | 'consciousness_engine'
  | 'anthropic'
  | 'openai'
  | 'multi_engine'
  | 'unknown';

export interface ProviderMeta {
  provider: ProviderName;
  model: string;              // e.g. deepseek-r1, claude-opus-4-5-20251101, etc.
  mode: 'full' | 'fallback';  // full = real model, fallback = template engine
  reason?: string;            // e.g. 'ollama_unavailable', 'key_missing', 'timeout'
  latencyMs?: number;
  // Claude-specific
  tier?: 'opus' | 'sonnet';   // Which Claude tier was used
  stop_reason?: string;       // 'end_turn', 'max_tokens', etc.
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface TextResult {
  text: string;
  provider: ProviderMeta;
}
