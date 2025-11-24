/**
 * LLM PROVIDER - Multi-Model Support for MAIA
 *
 * MAIA's sovereignty principle: Self-hosted open source models first.
 * Claude is optional fallback only. MAIA owns her infrastructure.
 *
 * Architecture:
 * - Level 1-2: Llama 3.3 70B (everyday conversation)
 * - Level 3-4: DeepSeek V3 (framework teaching + sophistication)
 * - Level 5: DeepSeek V3 (sacred prosody)
 * - Claude: Fallback only
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
  };
}

/**
 * Level-specific LLM configuration
 * MAIA uses DeepSeek-R1 for all levels (reasoning model with superior prosody)
 */
const LEVEL_LLM_CONFIG: Record<ConsciousnessLevel, LLMConfig> = {
  1: {
    provider: 'ollama',
    model: 'deepseek-r1:latest',
    temperature: 0.6,
    maxTokens: 500
  },
  2: {
    provider: 'ollama',
    model: 'deepseek-r1:latest',
    temperature: 0.65,
    maxTokens: 600
  },
  3: {
    provider: 'ollama',
    model: 'deepseek-r1:latest',
    temperature: 0.7,
    maxTokens: 700
  },
  4: {
    provider: 'ollama',
    model: 'deepseek-r1:latest',
    temperature: 0.75,
    maxTokens: 800
  },
  5: {
    provider: 'ollama',
    model: 'deepseek-r1:latest',
    temperature: 0.8,
    maxTokens: 900
  }
};

export class MultiLLMProvider {
  private anthropic?: Anthropic;
  private ollamaBaseUrl: string;
  private enableClaude: boolean;

  constructor() {
    // Ollama setup (self-hosted)
    this.ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

    // Claude as optional fallback only
    this.enableClaude = process.env.ENABLE_CLAUDE_FALLBACK === 'true';

    if (this.enableClaude && process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
    }
  }

  /**
   * Generate response using appropriate LLM for consciousness level
   */
  async generate(params: {
    systemPrompt: string;
    userInput: string;
    level: ConsciousnessLevel;
    forceClaude?: boolean;
  }): Promise<LLMResponse> {

    const { systemPrompt, userInput, level, forceClaude } = params;
    const config = LEVEL_LLM_CONFIG[level];
    const startTime = Date.now();

    // Force Claude if requested (for comparison/testing)
    if (forceClaude && this.anthropic) {
      return this.generateClaude(systemPrompt, userInput, config, startTime);
    }

    // Use configured provider for level
    try {
      if (config.provider === 'ollama') {
        return await this.generateOllama(systemPrompt, userInput, config, startTime);
      } else if (config.provider === 'anthropic' && this.anthropic) {
        return await this.generateClaude(systemPrompt, userInput, config, startTime);
      }
    } catch (error) {
      console.error(`LLM generation failed with ${config.provider}:`, error);

      // Fallback to Claude if enabled
      if (this.enableClaude && this.anthropic && config.provider !== 'anthropic') {
        console.log('Falling back to Claude...');
        return await this.generateClaude(systemPrompt, userInput, config, startTime);
      }

      throw error;
    }

    throw new Error('No LLM provider available');
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
   * Generate using Claude (fallback only)
   */
  private async generateClaude(
    systemPrompt: string,
    userInput: string,
    config: LLMConfig,
    startTime: number
  ): Promise<LLMResponse> {

    if (!this.anthropic) {
      throw new Error('Claude not configured');
    }

    const message = await this.anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userInput
        }
      ]
    });

    const response = message.content[0];
    if (response.type !== 'text') {
      throw new Error('Unexpected Claude response type');
    }

    const generationTime = Date.now() - startTime;

    return {
      text: response.text,
      provider: 'anthropic',
      model: 'claude-3-7-sonnet-20250219',
      metadata: {
        generationTime,
        tokenCount: message.usage.output_tokens
      }
    };
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
