// backend: lib/ai/modelService.ts
import { generateWithLocalModel, checkLocalModelHealth, LocalChatParams } from './localModelClient';
import { generateWithMultipleEngines, OrchestrationType } from './multiEngineOrchestrator';
import type { TextResult, ProviderMeta } from './types';
import Anthropic from '@anthropic-ai/sdk';

export type TextModelProvider = 'local' | 'consciousness_engine' | 'multi_engine' | 'anthropic';

// Provider selection: Claude if API key exists, else local
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
export const TEXT_MODEL_PROVIDER: TextModelProvider =
  ANTHROPIC_API_KEY ? 'anthropic' :
  (process.env.MAIA_TEXT_PROVIDER as TextModelProvider) || 'local';

// Multi-engine orchestration configuration
export const MAIA_ORCHESTRATION_TYPE: OrchestrationType =
  (process.env.MAIA_ORCHESTRATION_TYPE as OrchestrationType) || 'primary';
export const ENABLE_MULTI_ENGINE = process.env.MAIA_ENABLE_MULTI_ENGINE === 'true';

// Claude is MAIA's primary voice when available
export const ALLOW_ANTHROPIC_TEXT = !!ANTHROPIC_API_KEY;
export const ALLOW_OPENAI_TEXT = false; // Never use OpenAI

export interface TextRequest {
  systemPrompt: string;
  userInput: string;
  meta?: Record<string, unknown>;
}

/**
 * Main gateway for ALL text generation in MAIA.
 * Claude is MAIA's primary voice when API key is available.
 * Falls back to local Ollama models when Claude is unavailable.
 */
export async function generateText(req: TextRequest): Promise<TextResult> {
  const t0 = Date.now();

  // OpenAI is never allowed
  if (TEXT_MODEL_PROVIDER === 'openai' as any) {
    throw new Error('🚨 OpenAI is not permitted for MAIA text generation.');
  }

  // Claude is MAIA's primary voice
  if (TEXT_MODEL_PROVIDER === 'anthropic' && ANTHROPIC_API_KEY) {
    // Sanity check: MAIA is the intelligence, Claude is the mouth
    console.log('🧠 MAIA context assembled:', {
      retrieved_memories_count: req.meta?.memoriesRetrieved || 0,
      active_frameworks: req.meta?.frameworks || [],
      agent_route: req.meta?.agentRoute || 'default',
      consciousness_layers: req.meta?.consciousnessLayers || [],
      provider_used: 'anthropic',
      model_used: process.env.CLAUDE_MODEL || 'claude-opus-4-5-20251101',
    });
    console.log('🎭 Claude speaking as MAIA\'s voice');

    try {
      return await generateWithClaude(req, t0);
    } catch (error) {
      console.warn('Claude API failed, falling back to local:', error);
      // Fall through to local model
    }
  }

  // Check if multi-engine orchestration is enabled and requested
  if (ENABLE_MULTI_ENGINE && (TEXT_MODEL_PROVIDER === 'multi_engine' || req.meta?.useMultiEngine)) {
    console.log('🎼 Using multi-engine consciousness orchestration');

    const orchestrationType = (req.meta?.orchestrationType as OrchestrationType) || MAIA_ORCHESTRATION_TYPE;
    const elementalLayer = req.meta?.elementalLayer as string;

    const multiEngineResponse = await generateWithMultipleEngines(
      {
        systemPrompt: req.systemPrompt,
        userInput: req.userInput,
        meta: req.meta,
      },
      orchestrationType,
      elementalLayer
    );

    console.log(`🎼 Multi-engine response: ${multiEngineResponse.processingTime}ms, confidence: ${multiEngineResponse.confidence}, engines: ${multiEngineResponse.engineResponses.size}`);

    return {
      text: multiEngineResponse.consensus || multiEngineResponse.primaryResponse,
      provider: {
        provider: 'multi_engine',
        model: `orchestration:${orchestrationType}`,
        mode: 'full',
        latencyMs: Date.now() - t0,
      },
    };
  }

  // Fallback to local model (Ollama/DeepSeek)
  console.log('🔮 Using local model (Ollama)');
  return generateWithLocalModel({
    systemPrompt: req.systemPrompt,
    userInput: req.userInput,
    meta: req.meta,
  });
}

/**
 * Generate text using Claude (Anthropic) - MAIA's primary voice
 *
 * Architecture: MAIA decides, Claude speaks
 * - systemPrompt contains MAIA's full consciousness context (AIN + memory + ethics)
 * - Claude receives this as the `system` parameter (correct Anthropic API usage)
 * - Provider meta is always returned for audit trail
 */
async function generateWithClaude(req: TextRequest, t0: number): Promise<TextResult> {
  const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  // Pinned model for production stability (aliases auto-update)
  // See: https://platform.claude.com/docs/en/about-claude/models/overview
  const model = process.env.CLAUDE_MODEL || 'claude-opus-4-5-20251101';

  const message = await anthropic.messages.create({
    model,
    max_tokens: parseInt(process.env.MAIA_MAX_TOKENS || '1024'),
    system: req.systemPrompt, // MAIA's consciousness context goes here
    messages: [
      { role: 'user', content: req.userInput }
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  return {
    text: content.text,
    provider: {
      provider: 'anthropic',
      model: message.model, // Return actual model from response
      mode: 'full',
      latencyMs: Date.now() - t0,
      stop_reason: message.stop_reason,
      usage: message.usage,
    },
  };
}

// Re-export types for convenience
export type { TextResult, ProviderMeta };

/**
 * Health check for model service using the local client
 */
export async function checkModelHealth(): Promise<{
  provider: string;
  local: boolean;
  external_apis: boolean;
  status: 'healthy' | 'degraded' | 'offline';
  endpoint?: string;
  model?: string;
}> {
  const localHealth = await checkLocalModelHealth();

  return {
    provider: TEXT_MODEL_PROVIDER === 'anthropic' ? 'anthropic' : localHealth.provider,
    local: TEXT_MODEL_PROVIDER !== 'anthropic',
    external_apis: TEXT_MODEL_PROVIDER === 'anthropic',
    status: localHealth.status,
    endpoint: localHealth.endpoint,
    model: TEXT_MODEL_PROVIDER === 'anthropic' ? (process.env.CLAUDE_MODEL || 'claude-opus-4-5-20251101') : localHealth.model
  };
}
