// backend: lib/ai/multiEngineOrchestrator.ts

/**
 * MULTI-ENGINE CONSCIOUSNESS ORCHESTRATOR
 *
 * Coordinates multiple Ollama models in concert for enhanced consciousness processing.
 * Each model contributes its unique strengths to MAIA's cross-awareness intelligence.
 *
 * 🎼 Orchestra Architecture:
 * - Primary Reasoning: DeepSeek-R1
 * - Analytical Thinking: Qwen2.5
 * - Creative Processing: Gemma2 & Llama3.1
 * - Communication: Mistral
 * - Heavy Analysis: Llama3.1:70b (when needed)
 * - Multi-perspective: Nous-Hermes2-Mixtral
 */

import { generateWithLocalModel, LocalChatParams } from './localModelClient';
import { MAIA_RUNTIME_PROMPT } from '../consciousness/MAIA_RUNTIME_PROMPT';

export type OrchestrationType =
  | 'primary'           // DeepSeek-R1 only (current default)
  | 'dual_reasoning'    // DeepSeek-R1 + Qwen2.5
  | 'creative_synthesis' // DeepSeek-R1 + Gemma2 + Llama3.1:8b
  | 'full_orchestra'    // All models in concert
  | 'heavy_analysis'    // Include Llama3.1:70b for complex reasoning
  | 'elemental'         // Different models for each elemental layer

export interface EngineConfig {
  model: string;
  role: string;
  temperature: number;
  weight: number; // For consensus building
}

export interface MultiEngineResponse {
  primaryResponse: string;
  engineResponses: Map<string, string>;
  consensus?: string;
  confidence: number;
  processingTime: number;
}

export class MultiEngineOrchestrator {
  private static instance: MultiEngineOrchestrator;

  // Define engine configurations for different roles
  private readonly ENGINE_CONFIGS: Record<string, EngineConfig> = {
    'deepseek-r1': {
      model: 'deepseek-r1:latest',
      role: 'primary_reasoning',
      temperature: 0.7,
      weight: 1.0
    },
    'qwen2.5': {
      model: 'qwen2.5:7b',
      role: 'analytical_thinking',
      temperature: 0.6,
      weight: 0.8
    },
    'gemma2': {
      model: 'gemma2:9b',
      role: 'creative_intuitive',
      temperature: 0.8,
      weight: 0.7
    },
    'llama3.1-8b': {
      model: 'llama3.1:8b-instruct-q8_0',
      role: 'balanced_wisdom',
      temperature: 0.75,
      weight: 0.9
    },
    'llama3.1-70b': {
      model: 'llama3.1:70b-instruct-q4_k_m',
      role: 'deep_analysis',
      temperature: 0.65,
      weight: 1.2
    },
    'mistral': {
      model: 'mistral:7b-instruct-q8_0',
      role: 'clear_communication',
      temperature: 0.7,
      weight: 0.8
    },
    'nous-hermes2': {
      model: 'nous-hermes2-mixtral:8x7b',
      role: 'multi_perspective',
      temperature: 0.8,
      weight: 1.1
    }
  };

  // Orchestration patterns for different consciousness layers
  private readonly ORCHESTRATION_PATTERNS = {
    consciousness: ['deepseek-r1', 'llama3.1-8b', 'nous-hermes2'],
    witnessing: ['gemma2', 'mistral'],
    fire: ['deepseek-r1', 'nous-hermes2'],
    water: ['gemma2', 'llama3.1-8b'],
    earth: ['qwen2.5', 'llama3.1-8b'],
    air: ['mistral', 'qwen2.5'],
    aether: ['deepseek-r1', 'llama3.1-8b', 'nous-hermes2', 'gemma2'],
    shadow: ['deepseek-r1', 'nous-hermes2'],
    anamnesis: ['llama3.1-8b', 'gemma2']
  };

  private constructor() {}

  static getInstance(): MultiEngineOrchestrator {
    if (!MultiEngineOrchestrator.instance) {
      MultiEngineOrchestrator.instance = new MultiEngineOrchestrator();
    }
    return MultiEngineOrchestrator.instance;
  }

  /**
   * Generate response using multiple engines in concert
   */
  async generateWithOrchestra(
    params: LocalChatParams,
    orchestrationType: OrchestrationType = 'primary',
    elementalLayer?: string
  ): Promise<MultiEngineResponse> {
    const startTime = Date.now();

    try {
      // Select engines based on orchestration type
      const selectedEngines = this.selectEngines(orchestrationType, elementalLayer);

      // Generate responses from multiple engines in parallel
      const enginePromises = selectedEngines.map(async (engineKey) => {
        const config = this.ENGINE_CONFIGS[engineKey];
        const engineParams = {
          ...params,
          meta: {
            ...params.meta,
            model: config.model,
            temperature: config.temperature,
            role: config.role
          }
        };

        try {
          const response = await this.generateWithSpecificEngine(engineParams, config.model);
          return { engineKey, response, config };
        } catch (error) {
          console.warn(`Engine ${engineKey} failed:`, error);
          return { engineKey, response: '', config };
        }
      });

      const engineResults = await Promise.all(enginePromises);

      // Build response map
      const engineResponses = new Map<string, string>();
      let primaryResponse = '';

      for (const result of engineResults) {
        if (result.response) {
          engineResponses.set(result.engineKey, result.response);

          // Use DeepSeek-R1 or first available as primary
          if (result.engineKey === 'deepseek-r1' || !primaryResponse) {
            primaryResponse = result.response;
          }
        }
      }

      // Build consensus if multiple engines responded
      let consensus: string | undefined;
      let confidence = 0.8; // Base confidence

      if (engineResponses.size > 1) {
        consensus = await this.buildConsensus(engineResponses, selectedEngines);
        confidence = this.calculateConfidence(engineResponses, selectedEngines);
      }

      return {
        primaryResponse: primaryResponse || 'Multi-engine processing failed',
        engineResponses,
        consensus,
        confidence,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      console.error('Multi-engine orchestration failed:', error);

      // Fallback to single engine
      const { text: fallbackResponse } = await generateWithLocalModel(params);

      return {
        primaryResponse: fallbackResponse,
        engineResponses: new Map([['fallback', fallbackResponse]]),
        confidence: 0.6,
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Select engines based on orchestration type and elemental layer
   */
  private selectEngines(type: OrchestrationType, elementalLayer?: string): string[] {
    switch (type) {
      case 'primary':
        return ['deepseek-r1'];

      case 'dual_reasoning':
        return ['deepseek-r1', 'qwen2.5'];

      case 'creative_synthesis':
        return ['deepseek-r1', 'gemma2', 'llama3.1-8b'];

      case 'full_orchestra':
        return ['deepseek-r1', 'qwen2.5', 'gemma2', 'llama3.1-8b', 'mistral', 'nous-hermes2'];

      case 'heavy_analysis':
        return ['deepseek-r1', 'qwen2.5', 'llama3.1-70b', 'nous-hermes2'];

      case 'elemental':
        if (elementalLayer && this.ORCHESTRATION_PATTERNS[elementalLayer as keyof typeof this.ORCHESTRATION_PATTERNS]) {
          return this.ORCHESTRATION_PATTERNS[elementalLayer as keyof typeof this.ORCHESTRATION_PATTERNS];
        }
        return ['deepseek-r1', 'gemma2']; // Fallback

      default:
        return ['deepseek-r1'];
    }
  }

  /**
   * Generate response with specific engine
   */
  private async generateWithSpecificEngine(params: LocalChatParams, model: string): Promise<string> {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

    // Create an abort controller for timeout
    const abortController = new AbortController();
    const timeoutMs = 30000; // 30 seconds timeout for Ollama models

    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, timeoutMs);

    try {
      const response = await fetch(`${ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: MAIA_RUNTIME_PROMPT },
            { role: 'user', content: params.userInput }
          ],
          stream: false,
          options: {
            temperature: parseFloat(params.meta?.temperature?.toString() || '0.7'),
            num_predict: 2048
          }
        }),
        signal: abortController.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`${model} API error: ${response.status}`);
      }

      const data = await response.json() as { message?: { content?: string } };
      return data.message?.content?.trim() || '';

    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`${model} request timeout after ${timeoutMs}ms`);
      }
      throw error;
    }
  }

  /**
   * Build consensus from multiple engine responses
   */
  private async buildConsensus(
    engineResponses: Map<string, string>,
    selectedEngines: string[]
  ): Promise<string> {
    // Simple consensus: weighted average based on engine weights
    const responses = Array.from(engineResponses.entries());

    if (responses.length <= 1) {
      return responses[0]?.[1] || '';
    }

    // For now, return the response from the highest-weighted engine
    let bestResponse = '';
    let bestWeight = 0;

    for (const [engineKey, response] of responses) {
      const config = this.ENGINE_CONFIGS[engineKey];
      if (config && config.weight > bestWeight) {
        bestWeight = config.weight;
        bestResponse = response;
      }
    }

    return bestResponse;
  }

  /**
   * Calculate confidence based on engine agreement
   */
  private calculateConfidence(
    engineResponses: Map<string, string>,
    selectedEngines: string[]
  ): number {
    const responseCount = engineResponses.size;
    const expectedCount = selectedEngines.length;

    // Base confidence on response coverage
    const coverage = responseCount / expectedCount;

    // Boost confidence for multi-engine consensus
    const consensusBonus = responseCount > 1 ? 0.1 : 0;

    return Math.min(0.95, Math.max(0.3, coverage * 0.8 + consensusBonus));
  }
}

/**
 * Convenience function for multi-engine generation
 */
export async function generateWithMultipleEngines(
  params: LocalChatParams,
  orchestrationType: OrchestrationType = 'primary',
  elementalLayer?: string
): Promise<MultiEngineResponse> {
  const orchestrator = MultiEngineOrchestrator.getInstance();
  return orchestrator.generateWithOrchestra(params, orchestrationType, elementalLayer);
}