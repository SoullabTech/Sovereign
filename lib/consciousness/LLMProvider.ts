/**
 * LLM PROVIDER - Unified Multi-Model Support for MAIA
 *
 * All LLM calls route through this provider. Two routing modes:
 *
 * 1. Consciousness-level routing (oracle conversation):
 *    generate({ level: 1-5 }) — maps awareness depth to model selection
 *
 * 2. Tier-based routing (all other routes):
 *    generateSimple({ tier: 'fast'|'core'|'deep' }) — mechanical model selection
 *    generateStream({ tier }) — SSE streaming variant
 *
 * Provider chain: Claude (primary) → Ollama (fallback / sovereignty mode)
 *
 * Environment variables:
 *   ANTHROPIC_API_KEY        — Claude API key (primary provider)
 *   DISABLE_CLAUDE=true      — skip Claude, use Ollama only
 *   LOCAL_TIER_ENABLED=true  — route fast/core tiers + levels 1-2 to Ollama
 *   OLLAMA_BASE_URL          — Ollama endpoint (default: http://localhost:11434)
 *   OLLAMA_MODEL_GENERAL     — Ollama model for core tier (default: qwen2.5:7b)
 *   OLLAMA_MODEL_FAST        — Ollama model for fast tier (default: same as general)
 *   OLLAMA_MODEL_DEEP        — Ollama model for deep tier (default: qwen3:32b)
 *   MAIA_STRICT_503=true     — return 503 on Claude failure instead of Ollama fallback
 *
 * Routes NOT using this provider (intentionally direct Anthropic):
 *   - app/api/anthropic/ping — tests Anthropic connectivity
 *   - app/api/portal/[slug]/chat — requires Anthropic tool_use (booking tools)
 *   - app/api/_backend/src/services/* — legacy backend (2 files)
 */

import Anthropic from '@anthropic-ai/sdk';
import { ConsciousnessLevel } from './ConsciousnessLevelDetector';
import { ensureUserTerminal } from './messageTerminal';

export type LLMProvider = 'ollama' | 'anthropic';
export type OllamaModel = 'llama3.3:70b' | 'deepseek-r1:latest' | 'deepseek-v3' | 'llama3.1:70b';

/** Route-level model selection — independent of consciousness levels */
export type ModelTier = 'fast' | 'core' | 'deep';

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface LLMResponse {
  text: string;
  provider: LLMProvider;
  model: string;
  metadata: {
    generationTime: number;
    tokenCount?: number;
    /** Why the model stopped: 'end_turn' | 'max_tokens' | 'stop_sequence'. 'max_tokens' = truncated. */
    stopReason?: string;
  };
}

// Local tier config — activated when LOCAL_TIER_ENABLED=true
const OLLAMA_MODEL_GENERAL = process.env.OLLAMA_MODEL_GENERAL ?? 'qwen2.5:7b';
const OLLAMA_MODEL_FAST = process.env.OLLAMA_MODEL_FAST ?? OLLAMA_MODEL_GENERAL;
const OLLAMA_MODEL_DEEP = process.env.OLLAMA_MODEL_DEEP ?? 'qwen3:32b';
const LOCAL_TIER_ENABLED = process.env.LOCAL_TIER_ENABLED === 'true';

/**
 * Default Claude model used when a non-Claude model id would otherwise reach the
 * Anthropic API. Under LOCAL_TIER_ENABLED, tier/level configs carry Ollama model
 * names (e.g. 'qwen2.5:7b'); if such a config reaches Claude — generateSimple's
 * primary path, or any Ollama→Claude fallback — the SDK 404s on the unknown model.
 */
export const DEFAULT_CLAUDE_FALLBACK_MODEL = 'claude-sonnet-4-6';

/** Return `model` unchanged if it is a Claude model id, else a safe Claude default. */
export function coerceClaudeModel(model: string): string {
  return model.startsWith('claude') ? model : DEFAULT_CLAUDE_FALLBACK_MODEL;
}

// Re-exported so callers that already import from this module (e.g. the FieldLab
// interview route) can reach the user-terminal guard without a second import path.
export { ensureUserTerminal };

/**
 * Level-specific LLM configuration
 * Levels 1-2: local Ollama (when LOCAL_TIER_ENABLED) or Sonnet fallback
 * Levels 3-4: Claude Sonnet 4.5
 * Level 5:    Claude Opus 4.5 (deep/fragile/architectural reasoning only)
 */
const LEVEL_LLM_CONFIG: Record<ConsciousnessLevel, LLMConfig> = {
  1: LOCAL_TIER_ENABLED
    ? { provider: 'ollama', model: OLLAMA_MODEL_GENERAL, temperature: 0.7, maxTokens: 300 }
    : { provider: 'anthropic', model: 'claude-sonnet-4-6', temperature: 0.7, maxTokens: 500 },
  2: LOCAL_TIER_ENABLED
    ? { provider: 'ollama', model: OLLAMA_MODEL_GENERAL, temperature: 0.8, maxTokens: 500 }
    : { provider: 'anthropic', model: 'claude-sonnet-4-6', temperature: 0.75, maxTokens: 600 },
  3: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
    temperature: 0.8,
    maxTokens: 800
  },
  4: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
    temperature: 0.85,
    maxTokens: 1000
  },
  5: {
    provider: 'anthropic',
    model: 'claude-opus-4-6',
    temperature: 0.9,
    maxTokens: 1200
  }
};

/**
 * Tier-based LLM configuration — for routes that don't use consciousness levels.
 * Maps fast/core/deep to appropriate models with LOCAL_TIER_ENABLED fallback.
 */
const TIER_LLM_CONFIG: Record<ModelTier, LLMConfig> = {
  fast: LOCAL_TIER_ENABLED
    ? { provider: 'ollama', model: OLLAMA_MODEL_FAST, temperature: 0.5, maxTokens: 500 }
    : { provider: 'anthropic', model: 'claude-haiku-4-5-20251001', temperature: 0.5, maxTokens: 500 },
  core: LOCAL_TIER_ENABLED
    ? { provider: 'ollama', model: OLLAMA_MODEL_GENERAL, temperature: 0.7, maxTokens: 1024 }
    : { provider: 'anthropic', model: 'claude-sonnet-4-6', temperature: 0.7, maxTokens: 1024 },
  deep: LOCAL_TIER_ENABLED
    ? { provider: 'ollama', model: OLLAMA_MODEL_DEEP, temperature: 0.8, maxTokens: 2048 }
    : { provider: 'anthropic', model: 'claude-opus-4-6', temperature: 0.8, maxTokens: 2048 },
};

/** Parameters for tier-based generation (routes without consciousness levels) */
export interface SimpleGenerateParams {
  tier: ModelTier;
  systemPrompt: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  temperature?: number;
  maxTokens?: number;
  forceClaude?: boolean;
  forceOllama?: boolean;
}

/** Streaming event types */
export type StreamEvent =
  | { type: 'text_delta'; text: string }
  | { type: 'done'; metadata: LLMResponse['metadata'] };

export class MultiLLMProvider {
  private anthropic?: Anthropic;
  private ollamaBaseUrl: string;
  private enableClaude: boolean;
  private strict503: boolean;

  constructor() {
    // Claude as primary (enabled by default)
    this.enableClaude = process.env.DISABLE_CLAUDE !== 'true';

    // STRICT 503 MODE: When enabled, Claude failures return 503 instead of falling back to Ollama
    // Use for gold/eval paths where you need to verify actual Claude output
    this.strict503 = process.env.MAIA_STRICT_503 === '1' || process.env.MAIA_STRICT_503 === 'true';

    if (this.enableClaude && process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
    } else {
      console.warn('⚠️ MAIA: Claude not configured. Set ANTHROPIC_API_KEY for best results.');
    }

    // Ollama as fallback (self-hosted option)
    this.ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  }

  /**
   * Generate response using appropriate LLM for consciousness level
   */
  async generate(params: {
    systemPrompt: string;
    userInput: string;
    /** Optional: proper alternating messages array. When supplied, Claude uses this
     *  instead of wrapping userInput in a single user message — preserving real
     *  multi-turn context. Ollama ignores this and falls back to the flat transcript. */
    messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
    level: ConsciousnessLevel;
    forceClaude?: boolean;
    forceOllama?: boolean;
    maxTokensOverride?: number;
  }): Promise<LLMResponse> {

    const { systemPrompt, userInput, messages, level, forceClaude, forceOllama, maxTokensOverride } = params;
    const baseConfig = LEVEL_LLM_CONFIG[level];
    // Route-computed maxTokens wins over level default (MAIA-PAI depth scaling)
    const config = maxTokensOverride
      ? { ...baseConfig, maxTokens: maxTokensOverride }
      : baseConfig;
    console.info(`[oracle] effective maxTokens: ${config.maxTokens} (override=${maxTokensOverride ?? 'none'} level=${level})`);
    const startTime = Date.now();

    // Log model selection for testing
    console.info(`[LLMProvider] level=${level} provider=${config.provider} model=${config.model}`);

    // Force Ollama if explicitly requested OR if tier config routes this level to local
    if (forceOllama || config.provider === 'ollama') {
      try {
        return await this.generateOllama(systemPrompt, userInput, config, startTime);
      } catch (error) {
        console.warn('Ollama generation failed, trying Claude fallback:', error);
        if (this.anthropic) {
          this.logSovereigntyFallback({
            path: 'generate',
            tierOrLevel: `level=${level}`,
            intendedModel: config.model,
            servedProvider: 'anthropic',
            servedModel: coerceClaudeModel(config.model),
            error,
            startTime,
          });
          return await this.generateClaude(systemPrompt, userInput, config, startTime, messages);
        }
        throw error;
      }
    }

    // Default: Try Claude first (primary provider)
    if (this.anthropic) {
      try {
        return await this.generateClaude(systemPrompt, userInput, config, startTime, messages);
      } catch (error) {
        console.error('Claude generation failed:', error);

        // STRICT 503 MODE: Do not fall back to Ollama, throw ServiceUnavailable
        if (this.strict503) {
          console.warn('[LLMProvider] STRICT_503 mode enabled - NOT falling back to Ollama');
          const err = new Error('Primary provider (Claude) unavailable');
          (err as any).code = 'SERVICE_UNAVAILABLE';
          (err as any).provider = 'anthropic';
          throw err;
        }

        // Graceful degradation: Fallback to Ollama if Claude fails
        console.log('[LLMProvider] Falling back to Ollama...');
        try {
          return await this.generateOllama(systemPrompt, userInput, config, startTime);
        } catch (ollamaError) {
          console.error('Ollama fallback also failed:', ollamaError);
          throw error; // Throw original Claude error
        }
      }
    }

    // If Claude not configured, try Ollama
    console.log('Claude not configured, using Ollama...');
    return await this.generateOllama(systemPrompt, userInput, config, startTime);
  }

  /**
   * Generate using Ollama (self-hosted open source)
   */
  private async generateOllama(
    systemPrompt: string,
    userInput: string,
    config: LLMConfig,
    startTime: number
  ): Promise<LLMResponse> {

    // stream:true so Ollama sends HTTP response headers at the FIRST token. With
    // stream:false, headers are withheld until the entire generation completes —
    // on slow local hardware a long generation exceeds undici's default 5-minute
    // headersTimeout, false-failing the local path on every long request (the
    // Soul Portrait silent-cloud-fallback regression, 2026-07-09). undici's
    // bodyTimeout is an idle timeout between chunks, which streaming satisfies.
    const response = await fetch(`${this.ollamaBaseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        prompt: `${systemPrompt}\n\nUser: ${userInput}\n\nMAIA:`,
        stream: true,
        options: {
          temperature: config.temperature,
          num_predict: config.maxTokens
        }
      })
    });

    if (!response.ok || !response.body) {
      throw new Error(`Ollama request failed: ${response.statusText}`);
    }

    // Accumulate the NDJSON stream: each line carries a `response` delta; the
    // final line has done:true plus the eval counters. External contract is
    // unchanged — callers still receive one complete LLMResponse.
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let text = '';
    let evalCount: number | undefined;

    const consumeLine = (line: string) => {
      if (!line) return;
      const chunk = JSON.parse(line);
      if (chunk.error) {
        throw new Error(`Ollama error: ${chunk.error}`);
      }
      if (chunk.response) text += chunk.response;
      if (chunk.done) evalCount = chunk.eval_count;
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let newline;
      while ((newline = buffer.indexOf('\n')) !== -1) {
        consumeLine(buffer.slice(0, newline).trim());
        buffer = buffer.slice(newline + 1);
      }
    }
    consumeLine(buffer.trim());

    const generationTime = Date.now() - startTime;

    return {
      text: text.trim(),
      provider: 'ollama',
      model: config.model,
      metadata: {
        generationTime,
        tokenCount: evalCount
      }
    };
  }

  /**
   * Generate using Claude (with retry/backoff for 529 errors)
   */
  private async generateClaude(
    systemPrompt: string,
    userInput: string,
    config: LLMConfig,
    startTime: number,
    messages?: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<LLMResponse> {

    if (!this.anthropic) {
      throw new Error('Claude not configured');
    }

    // Use proper alternating messages array when provided (multi-turn context).
    // Fallback: wrap userInput in a single user message (legacy single-turn path).
    const rawMessages: Array<{ role: 'user' | 'assistant'; content: string }> =
      messages && messages.length > 0
        ? messages
        : [{ role: 'user', content: userInput }];

    // Structural backstop: Claude 400s on an assistant-terminal array (last-assistant-turn
    // prefill → "the conversation must end with a user message"). Trim trailing assistant
    // turns so this footgun can't reach the API from any route, not just FieldLab.
    const claudeMessages = ensureUserTerminal(rawMessages);
    if (claudeMessages.length === 0) {
      throw new Error('Claude call has no user turn (message history is all-assistant).');
    }

    const maxRetries = 3;
    const baseDelay = 1000; // 1 second
    let lastError: any;

    // Guard: the Anthropic API only accepts Claude model ids. Under LOCAL_TIER_ENABLED,
    // tier/level configs carry Ollama model names (e.g. 'qwen2.5:7b'); coerce here so a
    // local model id is never sent to Claude — the 404 behind "Primary provider unavailable".
    const claudeModel = coerceClaudeModel(config.model);
    if (claudeModel !== config.model) {
      console.warn(`[LLMProvider] coercing non-Claude model '${config.model}' → '${claudeModel}' for Anthropic call`);
    }

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const message = await this.anthropic.messages.create({
          model: claudeModel,
          max_tokens: config.maxTokens,
          temperature: config.temperature,
          system: systemPrompt,
          messages: claudeMessages,
        });

        const response = message.content[0];
        if (response.type !== 'text') {
          throw new Error('Unexpected Claude response type');
        }

        const generationTime = Date.now() - startTime;

        if (message.stop_reason === 'max_tokens') {
          console.warn(JSON.stringify({
            tag: 'llm.truncated', stop_reason: 'max_tokens',
            output_tokens: message.usage.output_tokens, max_tokens: config.maxTokens,
            model: claudeModel
          }));
        }

        return {
          text: response.text,
          provider: 'anthropic',
          model: claudeModel,
          metadata: {
            generationTime,
            tokenCount: message.usage.output_tokens,
            stopReason: message.stop_reason ?? undefined
          }
        };
      } catch (error: any) {
        lastError = error;

        // Check if it's a 529 overload error
        const is529 = error?.status === 529 ||
                      error?.message?.includes('529') ||
                      error?.message?.includes('overloaded');

        if (!is529 || attempt === maxRetries) {
          // Not a 529 error, or out of retries - throw immediately
          throw error;
        }

        // Exponential backoff with jitter: delay = baseDelay * 2^attempt + random(0-500ms)
        const exponentialDelay = baseDelay * Math.pow(2, attempt);
        const jitter = Math.random() * 500;
        const delay = exponentialDelay + jitter;

        console.warn(`⏳ Claude 529 overload, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries})...`);

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // Should never reach here, but TypeScript needs it
    throw lastError;
  }

  /**
   * Sovereignty-path observability: emit a single greppable, structured event when a
   * request that was INTENDED for the local sovereign provider (Ollama) is instead
   * served by cloud Claude because the local path failed. A silent cloud fallback on a
   * sovereignty-critical path (e.g. Soul Portrait generation) must never be invisible.
   *
   * Grep in prod:  docker logs maia-sovereign | grep 'llm.sovereignty_fallback'
   */
  private logSovereigntyFallback(args: {
    path: 'generate' | 'generateSimple';
    tierOrLevel: string;
    intendedModel: string;
    servedProvider: LLMProvider;
    servedModel: string;
    error: any;
    startTime: number;
  }): void {
    const e = args.error;
    // Prefer the concrete cause (undici surfaces UND_ERR_HEADERS_TIMEOUT on error.cause.code).
    const reason =
      e?.cause?.code || e?.code || e?.name || (e?.message ? String(e.message) : String(e));
    console.warn(
      JSON.stringify({
        tag: 'llm.sovereignty_fallback',
        path: args.path,
        intended_provider: 'ollama',
        intended_model: args.intendedModel,
        served_provider: args.servedProvider,
        served_model: args.servedModel,
        tier_or_level: args.tierOrLevel,
        reason,
        local_elapsed_ms: Date.now() - args.startTime,
      })
    );
  }

  /**
   * Check which models are available
   */
  async getAvailableModels(): Promise<{
    ollama: boolean;
    claude: boolean;
    ollamaModels: string[];
  }> {

    const result = {
      ollama: false,
      claude: !!this.anthropic,
      ollamaModels: [] as string[]
    };

    // Check Ollama availability
    try {
      const response = await fetch(`${this.ollamaBaseUrl}/api/tags`, {
        signal: AbortSignal.timeout(2000)
      });

      if (response.ok) {
        const data = await response.json();
        result.ollama = true;
        result.ollamaModels = data.models?.map((m: any) => m.name) || [];
      }
    } catch (error) {
      console.warn('Ollama not available:', error);
    }

    return result;
  }

  /**
   * Get configuration for a specific level
   */
  getConfigForLevel(level: ConsciousnessLevel): LLMConfig {
    return LEVEL_LLM_CONFIG[level];
  }

  /**
   * Get configuration for a model tier
   */
  getConfigForTier(tier: ModelTier): LLMConfig {
    return TIER_LLM_CONFIG[tier];
  }

  /**
   * Generate response using model tier — for routes without consciousness levels.
   * Same fallback chain as generate(), but driven by fast/core/deep instead of 1-5.
   */
  async generateSimple(params: SimpleGenerateParams): Promise<LLMResponse> {
    const { tier, systemPrompt, messages, temperature, maxTokens, forceClaude, forceOllama } = params;
    const baseConfig = TIER_LLM_CONFIG[tier];
    const config: LLMConfig = {
      ...baseConfig,
      ...(temperature !== undefined ? { temperature } : {}),
      ...(maxTokens !== undefined ? { maxTokens } : {}),
    };
    const startTime = Date.now();

    console.info(`[LLMProvider] tier=${tier} provider=${config.provider} model=${config.model}`);

    // Honor the tier's provider (Ollama for fast/core under LOCAL_TIER_ENABLED), matching
    // generate(). forceClaude overrides to the cloud path. Previously this only checked
    // forceOllama, so tier-routed Ollama configs were sent to Claude → qwen2.5:7b 404.
    if (!forceClaude && (forceOllama || config.provider === 'ollama')) {
      try {
        return await this.generateOllama(systemPrompt, messages[messages.length - 1]?.content ?? '', config, startTime);
      } catch (error) {
        console.warn('Ollama generation failed, trying Claude fallback:', error);
        if (this.anthropic) {
          this.logSovereigntyFallback({
            path: 'generateSimple',
            tierOrLevel: tier,
            intendedModel: config.model,
            servedProvider: 'anthropic',
            servedModel: coerceClaudeModel(config.model),
            error,
            startTime,
          });
          return await this.generateClaude(systemPrompt, '', config, startTime, messages);
        }
        throw error;
      }
    }

    if (this.anthropic && !forceOllama) {
      try {
        return await this.generateClaude(systemPrompt, '', config, startTime, messages);
      } catch (error) {
        console.error('Claude generation failed:', error);

        if (this.strict503) {
          console.warn('[LLMProvider] STRICT_503 mode enabled - NOT falling back to Ollama');
          const err = new Error('Primary provider (Claude) unavailable');
          (err as any).code = 'SERVICE_UNAVAILABLE';
          (err as any).provider = 'anthropic';
          throw err;
        }

        console.log('[LLMProvider] Falling back to Ollama...');
        try {
          return await this.generateOllama(systemPrompt, messages[messages.length - 1]?.content ?? '', config, startTime);
        } catch (ollamaError) {
          console.error('Ollama fallback also failed:', ollamaError);
          throw error;
        }
      }
    }

    console.log('Claude not configured, using Ollama...');
    return await this.generateOllama(systemPrompt, messages[messages.length - 1]?.content ?? '', config, startTime);
  }

  /**
   * Stream response using model tier — yields text deltas for SSE forwarding.
   * Claude: wraps messages.stream(). Ollama: falls back to non-streaming.
   */
  async *generateStream(params: SimpleGenerateParams): AsyncGenerator<StreamEvent> {
    const { tier, systemPrompt, messages, temperature, maxTokens } = params;
    const baseConfig = TIER_LLM_CONFIG[tier];
    const config: LLMConfig = {
      ...baseConfig,
      ...(temperature !== undefined ? { temperature } : {}),
      ...(maxTokens !== undefined ? { maxTokens } : {}),
    };
    const startTime = Date.now();

    console.info(`[LLMProvider] stream tier=${tier} provider=${config.provider} model=${config.model}`);

    if (this.anthropic && config.provider === 'anthropic') {
      try {
        const stream = await this.anthropic.messages.stream({
          model: config.model,
          max_tokens: config.maxTokens,
          temperature: config.temperature,
          system: systemPrompt,
          messages: messages.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
        });

        let tokenCount = 0;
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            yield { type: 'text_delta', text: event.delta.text };
          }
          if (event.type === 'message_delta' && 'usage' in event) {
            tokenCount = (event as any).usage?.output_tokens ?? 0;
          }
        }

        yield {
          type: 'done',
          metadata: {
            generationTime: Date.now() - startTime,
            tokenCount,
          },
        };
        return;
      } catch (error) {
        console.error('[LLMProvider] Stream failed, falling back to non-streaming:', error);
      }
    }

    // Fallback: non-streaming full response yielded as single delta
    const response = await this.generateOllama(
      systemPrompt,
      messages[messages.length - 1]?.content ?? '',
      config,
      startTime
    );
    yield { type: 'text_delta', text: response.text };
    yield { type: 'done', metadata: response.metadata };
  }
}

// ---------------------------------------------------------------------------
// Singleton — one instance per isolate, constructed from env vars
// ---------------------------------------------------------------------------
let _instance: MultiLLMProvider | null = null;

export function getLLMProvider(): MultiLLMProvider {
  if (!_instance) {
    _instance = new MultiLLMProvider();
  }
  return _instance;
}
