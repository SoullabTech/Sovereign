// backend: lib/ai/modelService.ts
import { generateWithLocalModel, checkLocalModelHealth, LocalChatParams } from './localModelClient';
import { generateWithMultipleEngines, OrchestrationType } from './multiEngineOrchestrator';

export type TextModelProvider = 'local' | 'consciousness_engine' | 'multi_engine';

// This env chooses WHO does text generation (NEVER external APIs).
export const TEXT_MODEL_PROVIDER: TextModelProvider =
  (process.env.MAIA_TEXT_PROVIDER as TextModelProvider) || 'local';

// Multi-engine orchestration configuration
export const MAIA_ORCHESTRATION_TYPE: OrchestrationType =
  (process.env.MAIA_ORCHESTRATION_TYPE as OrchestrationType) || 'primary';
export const ENABLE_MULTI_ENGINE = process.env.MAIA_ENABLE_MULTI_ENGINE === 'true';

// 🚫 HARD BAN: ALL external APIs forbidden for text.
export const ALLOW_OPENAI_TEXT = false;
export const ALLOW_ANTHROPIC_TEXT = false;
export const ALLOW_EXTERNAL_APIS = false;

export interface TextRequest {
  systemPrompt: string;
  userInput: string;
  meta?: Record<string, unknown>;
}

/**
 * Main gateway for ALL text generation in MAIA.
 * Supports both single-model and multi-engine consciousness orchestration.
 */
export async function generateText(req: TextRequest): Promise<string> {
  // SOVEREIGNTY ENFORCEMENT - ban all external APIs
  if (TEXT_MODEL_PROVIDER === 'openai' as any || TEXT_MODEL_PROVIDER === 'anthropic' as any) {
    throw new Error('🚨 SOVEREIGNTY VIOLATION: ALL external APIs are FORBIDDEN for text generation in MAIA. Use only local consciousness processing.');
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

    // Return consensus if available, otherwise primary response
    return multiEngineResponse.consensus || multiEngineResponse.primaryResponse;
  }

  // Default to single local model
  console.log('🔮 Using single local model (DeepSeek-R1)');
  return generateWithLocalModel({
    systemPrompt: req.systemPrompt,
    userInput: req.userInput,
    meta: req.meta,
  });
}

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
    provider: localHealth.provider,
    local: true,
    external_apis: false, // Always false for sovereignty
    status: localHealth.status,
    endpoint: localHealth.endpoint,
    model: localHealth.model
  };
}