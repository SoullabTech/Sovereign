// backend: lib/ai/claudeClient.ts
// Primary AI provider for MAIA - Claude (Anthropic)

import Anthropic from '@anthropic-ai/sdk';
import { AIN_INTEGRATIVE_ALCHEMY_SENTINEL } from './prompts/ainIntegrativeAlchemy';
import { logVoiceTierTelemetry } from '../db/voiceTierTelemetry';
import type { TextResult, ProviderMeta } from './types';

// Model configuration
// ARCHITECTURE: MAIA's mind is the consciousness system (Spiralogic, AIN, prompts)
// Claude is the MOUTH - Sonnet for reliable articulation, Opus for deep reasoning tasks
const OPUS_MODEL = process.env.CLAUDE_REASONING_MODEL || 'claude-opus-4-5-20251101';  // For AIN, consultation, analysis
const SONNET_MODEL = process.env.CLAUDE_VOICE_MODEL || 'claude-sonnet-4-5-20250929';  // For conversation (MAIA's mouth)
const CLAUDE_MAX_TOKENS = parseInt(process.env.CLAUDE_MAX_TOKENS || '2048');
const CLAUDE_TEMPERATURE = parseFloat(process.env.CLAUDE_TEMPERATURE || '0.65');  // Slightly lower for consistency

// Deep reasoning requests that warrant Opus (not conversational - actual computation)
const OPUS_REASONING_MODES = ['ain_deliberation', 'consultation', 'analysis', 'deep_reasoning'];

// NOTE: Deep dive patterns no longer trigger Opus - MAIA's mind handles depth,
// Claude just needs to articulate cleanly. Opus reserved for actual reasoning tasks.

interface ModelSelection {
  model: string;
  tier: 'opus' | 'sonnet';
  reason: string;
}

/**
 * MODEL SELECTION - MAIA's Mind vs Claude's Mouth
 *
 * NEW PHILOSOPHY (Jan 2026):
 * - MAIA's consciousness system (Spiralogic, AIN, prompts) does the THINKING
 * - Claude is just the MOUTH - it articulates what MAIA has already determined
 *
 * For articulation, we need:
 * - Grammatical reliability (no dropped words)
 * - Sentence completion
 * - Stylistic consistency
 *
 * Sonnet excels at this. Opus is reserved for actual reasoning tasks
 * where Claude needs to figure something out (AIN deliberation, analysis).
 *
 * ROUTING:
 * 1. Explicit reasoning modes → Opus (ain_deliberation, consultation, analysis)
 * 2. Force flags → as specified
 * 3. Everything else → Sonnet (MAIA's reliable voice)
 */
function selectClaudeModel(meta?: Record<string, unknown>, _userInput?: string): ModelSelection {
  const mode = (meta?.mode as string) || 'talk';
  const reasoningMode = (meta?.reasoningMode as string) || '';

  // Feature flags / overrides
  const forceOpus = Boolean(meta?.forceOpus);
  const forceSonnet = Boolean(meta?.forceSonnet);

  // 🔍 ROUTING LOG HELPER
  const logAndReturn = (selection: ModelSelection): ModelSelection => {
    console.log(JSON.stringify({
      _tag: 'MODEL_ROUTING',
      model: selection.tier,
      reason: selection.reason,
      ctx: { mode, reasoningMode },
    }));
    return selection;
  };

  // 1. FORCE FLAGS (for testing)
  if (forceOpus) {
    return logAndReturn({ model: OPUS_MODEL, tier: 'opus', reason: 'force_opus_flag' });
  }
  if (forceSonnet) {
    return logAndReturn({ model: SONNET_MODEL, tier: 'sonnet', reason: 'force_sonnet_flag' });
  }

  // 2. EXPLICIT REASONING MODES → Opus (Claude needs to think, not just speak)
  if (OPUS_REASONING_MODES.includes(reasoningMode)) {
    return logAndReturn({ model: OPUS_MODEL, tier: 'opus', reason: `reasoning_mode:${reasoningMode}` });
  }

  // 3. DEFAULT: Sonnet for all conversation (MAIA's reliable voice)
  // MAIA's mind has already done the thinking via Spiralogic/AIN/consciousness system
  // Claude just needs to articulate it cleanly
  return logAndReturn({ model: SONNET_MODEL, tier: 'sonnet', reason: 'maia_voice' });
}

export interface ClaudeChatParams {
  systemPrompt: string;
  userInput: string;
  meta?: Record<string, unknown>;
}

// Lazy-initialized client
let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic | null {
  if (anthropicClient) return anthropicClient;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn('ANTHROPIC_API_KEY not set - Claude unavailable');
    return null;
  }

  anthropicClient = new Anthropic({ apiKey });
  return anthropicClient;
}

/**
 * Generate text with Claude (Anthropic)
 * Primary provider for MAIA consciousness voice.
 */
export async function generateWithClaude(
  params: ClaudeChatParams,
): Promise<TextResult> {
  const t0 = Date.now();
  const { systemPrompt, userInput, meta } = params;

  const client = getAnthropicClient();
  if (!client) {
    throw new Error('Claude unavailable: ANTHROPIC_API_KEY not configured');
  }

  // AIN DEBUG: Verify prompt path
  if (process.env.NODE_ENV !== 'production') {
    const hasAIN = systemPrompt.includes(AIN_INTEGRATIVE_ALCHEMY_SENTINEL);
    console.log('[AIN DEBUG] claudeClient systemPrompt has AIN?', hasAIN);
    if (hasAIN) {
      console.log('[AIN DEBUG] systemPrompt tail:', systemPrompt.slice(-400));
    }
  }

  // Context-driven model selection
  const selection = selectClaudeModel(meta, userInput);
  const consciousnessPolicy = meta?.consciousnessPolicy as { awarenessLevel?: number; awarenessName?: string } | undefined;
  const awarenessLog = consciousnessPolicy?.awarenessLevel
    ? ` [L${consciousnessPolicy.awarenessLevel}:${consciousnessPolicy.awarenessName || ''}]`
    : '';
  console.log(`🎭 Voice selection: ${selection.tier} (${selection.reason})${awarenessLog}`);

  try {
    console.log(`🧠 Calling Claude (${selection.model})...`);

    const message = await client.messages.create({
      model: selection.model,
      max_tokens: CLAUDE_MAX_TOKENS,
      temperature: CLAUDE_TEMPERATURE,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userInput }
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error(`Unexpected Claude response type: ${content.type}`);
    }

    const text = content.text.trim();
    if (!text) {
      throw new Error('Empty response from Claude');
    }

    const latencyMs = Date.now() - t0;
    console.log(`✅ Claude (${selection.tier}): ${text.length} chars, ${latencyMs}ms`);

    // Log telemetry (async, non-blocking)
    logVoiceTierTelemetry({
      tier: selection.tier,
      reason: selection.reason,
      model: selection.model,
      userId: (meta?.userId as string) || undefined,
      messageCount: (meta?.messageCount as number) || undefined,
      mode: (meta?.mode as string) || undefined,
      sessionId: (meta?.sessionId as string) || undefined,
      processingProfile: (meta?.processingProfile as string) || undefined,
      latencyMs
    }).catch(() => { /* telemetry failures should never block */ });

    return {
      text,
      provider: {
        provider: 'anthropic',
        model: selection.model,
        mode: 'full',
        latencyMs,
        tier: selection.tier,
        reason: selection.reason,
      } as ProviderMeta,
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Claude API error:', errMsg);

    // Re-throw to let modelService handle fallback
    throw new Error(`Claude generation failed: ${errMsg}`);
  }
}

/**
 * Health check for Claude availability
 */
export async function checkClaudeHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'offline';
  model: string | null;
  hasApiKey: boolean;
}> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return {
      status: 'offline',
      model: null,
      hasApiKey: false,
    };
  }

  // Just check if we have a key - actual API validation happens on first call
  return {
    status: 'healthy',
    model: OPUS_MODEL, // Report primary model
    hasApiKey: true,
  };
}

/**
 * Initialize Claude client (for warming up)
 */
export async function initializeClaude(): Promise<boolean> {
  const client = getAnthropicClient();
  if (!client) {
    console.warn('Claude initialization failed: no API key');
    return false;
  }

  console.log(`🧠 Claude initialized: ${OPUS_MODEL} (primary), ${SONNET_MODEL} (fallback)`);
  return true;
}
