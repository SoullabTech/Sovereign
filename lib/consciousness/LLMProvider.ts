/**
 * LLM PROVIDER - Hybrid Multi-Model Support for MAIA
 *
 * MAIA's hybrid approach: Claude (Anthropic) as primary for consciousness work,
 * with self-hosted models available as options for data sovereignty.
 *
 * Architecture:
 * - Primary: Claude Opus 4.5 (sacred attending, depth psychology, consciousness)
 * - Fallback: Ollama DeepSeek-R1 (when Claude unavailable or for specific use cases)
 * - Future: Self-hosted options for members who need full data sovereignty
 */

import Anthropic from '@anthropic-ai/sdk';
import { ConsciousnessLevel } from './ConsciousnessLevelDetector';

export type LLMProvider = 'ollama' | 'anthropic';
export type OllamaModel = 'llama3.3:70b' | 'deepseek-r1:latest' | 'deepseek-v3' | 'llama3.1:70b';

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
const LOCAL_TIER_ENABLED = process.env.LOCAL_TIER_ENABLED === 'true';

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

    // Force Ollama if explicitly requested (for data sovereignty use cases)
    if (forceOllama) {
      try {
        return await this.generateOllama(systemPrompt, userInput, config, startTime);
      } catch (error) {
        console.warn('Ollama generation failed, trying Claude fallback:', error);
        if (this.anthropic) {
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

    const response = await fetch(`${this.ollamaBaseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        prompt: `${systemPrompt}\n\nUser: ${userInput}\n\nMAIA:`,
        stream: false,
        options: {
          temperature: config.temperature,
          num_predict: config.maxTokens
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const generationTime = Date.now() - startTime;

    return {
      text: data.response.trim(),
      provider: 'ollama',
      model: config.model,
      metadata: {
        generationTime,
        tokenCount: data.eval_count
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
    const claudeMessages: Array<{ role: 'user' | 'assistant'; content: string }> =
      messages && messages.length > 0
        ? messages
        : [{ role: 'user', content: userInput }];

    const maxRetries = 3;
    const baseDelay = 1000; // 1 second
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const message = await this.anthropic.messages.create({
          model: config.model,
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
            model: config.model
          }));
        }

        return {
          text: response.text,
          provider: 'anthropic',
          model: config.model,
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
}
