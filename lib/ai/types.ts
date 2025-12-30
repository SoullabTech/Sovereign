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
  model: string;              // e.g. deepseek-r1, claude-3-5-sonnet, etc.
  mode: 'full' | 'fallback';  // full = real model, fallback = template engine
  reason?: string;            // e.g. 'ollama_unavailable', 'key_missing', 'timeout'
  latencyMs?: number;
}

export interface TextResult {
  text: string;
  provider: ProviderMeta;
}
