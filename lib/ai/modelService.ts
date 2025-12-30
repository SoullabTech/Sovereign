// backend: lib/ai/modelService.ts
import { generateWithLocalModel, checkLocalModelHealth, LocalChatParams } from './localModelClient';
import { generateWithClaude, checkClaudeHealth } from './claudeClient';
import { generateWithMultipleEngines, OrchestrationType } from './multiEngineOrchestrator';
import type { TextResult, ProviderMeta } from './types';

export type TextModelProvider = 'anthropic' | 'local' | 'consciousness_engine' | 'multi_engine';

// Primary provider: Claude (Anthropic). Fallback: local Ollama.
export const TEXT_MODEL_PROVIDER: TextModelProvider =
  (process.env.MAIA_TEXT_PROVIDER as TextModelProvider) || 'anthropic';

// Multi-engine orchestration configuration
export const MAIA_ORCHESTRATION_TYPE: OrchestrationType =
  (process.env.MAIA_ORCHESTRATION_TYPE as OrchestrationType) || 'primary';
export const ENABLE_MULTI_ENGINE = process.env.MAIA_ENABLE_MULTI_ENGINE === 'true';

// Provider permissions - Claude is the one concession
export const ALLOW_OPENAI_TEXT = false;
export const ALLOW_ANTHROPIC_TEXT = true;
export const ALLOW_EXTERNAL_APIS = ALLOW_ANTHROPIC_TEXT;

export interface TextRequest {
  systemPrompt: string;
  userInput: string;
  meta?: Record<string, unknown>;
}

/**
 * Main gateway for ALL text generation in MAIA.
 * Primary: Claude (Anthropic). Fallback: local Ollama.
 * Returns TextResult with provider metadata for sovereignty auditing.
 */
export async function generateText(req: TextRequest): Promise<TextResult> {
  const t0 = Date.now();

  // SOVEREIGNTY ENFORCEMENT - only Claude and local allowed
  if (TEXT_MODEL_PROVIDER === 'openai' as any) {
    throw new Error('🚨 SOVEREIGNTY VIOLATION: OpenAI is FORBIDDEN. Use Claude or local models only.');
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

  // Primary: Claude (Anthropic)
  if (TEXT_MODEL_PROVIDER === 'anthropic') {
    console.log('🧠 Using Claude (Anthropic) as primary');
    try {
      return await generateWithClaude({
        systemPrompt: req.systemPrompt,
        userInput: req.userInput,
        meta: req.meta,
      });
    } catch (error) {
      console.warn('Claude unavailable, falling back to local:', error);
      // Fall through to local
    }
  }

  // Fallback: local Ollama/DeepSeek
  console.log('🔮 Using local model (Ollama/DeepSeek)');
  return generateWithLocalModel({
    systemPrompt: req.systemPrompt,
    userInput: req.userInput,
    meta: req.meta,
  });
}

// Re-export types for convenience
export type { TextResult, ProviderMeta };

/**
 * Health check for model service - checks both Claude and local
 */
export async function checkModelHealth(): Promise<{
  provider: string;
  primary: 'anthropic' | 'local';
  claude_available: boolean;
  local_available: boolean;
  status: 'healthy' | 'degraded' | 'offline';
  model?: string;
}> {
  const [claudeHealth, localHealth] = await Promise.all([
    checkClaudeHealth().catch(() => ({ status: 'offline' as const, model: null, hasApiKey: false })),
    checkLocalModelHealth().catch(() => ({ status: 'offline' as const, model: '', provider: 'consciousness_engine', endpoint: '' })),
  ]);

  const claudeAvailable = claudeHealth.status === 'healthy';
  const localAvailable = localHealth.status === 'healthy';

  let status: 'healthy' | 'degraded' | 'offline';
  if (claudeAvailable) {
    status = 'healthy';
  } else if (localAvailable) {
    status = 'degraded'; // Claude unavailable but local works
  } else {
    status = 'offline';
  }

  return {
    provider: claudeAvailable ? 'anthropic' : localHealth.provider,
    primary: 'anthropic',
    claude_available: claudeAvailable,
    local_available: localAvailable,
    status,
    model: claudeAvailable ? (claudeHealth.model || undefined) : (localHealth.model || undefined),
  };
}