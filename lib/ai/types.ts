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
  model: string;              // e.g. deepseek-r1, claude-sonnet-4-5-20250929, etc.
  mode: 'full' | 'fallback';  // full = real model, fallback = template engine
  reason?: string;            // e.g. 'ollama_unavailable', 'key_missing', 'timeout'
  latencyMs?: number;
  // Claude-specific metadata for audit trail
  stop_reason?: string;       // 'end_turn', 'max_tokens', 'stop_sequence', etc.
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface TextResult {
  text: string;
  provider: ProviderMeta;
}
