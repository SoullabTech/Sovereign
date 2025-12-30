// backend: lib/ai/claudeClient.ts
// Primary AI provider for MAIA - Claude (Anthropic)

import Anthropic from '@anthropic-ai/sdk';
import { AIN_INTEGRATIVE_ALCHEMY_SENTINEL } from './prompts/ainIntegrativeAlchemy';
import type { TextResult, ProviderMeta } from './types';

// Model configuration
const OPUS_MODEL = process.env.CLAUDE_PRIMARY_MODEL || 'claude-opus-4-5-20251101';
const SONNET_MODEL = process.env.CLAUDE_SECONDARY_MODEL || 'claude-sonnet-4-5-20250929';
const CLAUDE_MAX_TOKENS = parseInt(process.env.CLAUDE_MAX_TOKENS || '2048');
const CLAUDE_TEMPERATURE = parseFloat(process.env.CLAUDE_TEMPERATURE || '0.7');

// Users who always get Opus (deepest voice)
const OPUS_USER_IDS = (process.env.MAIA_OPUS_USER_IDS || 'kelly,kelly-nezat,local-dev').split(',');

// Deep dive keywords that warrant Opus regardless of conversation stage
const DEEP_DIVE_PATTERNS = /shadow|archetype|dream|trauma|grief|initiation|spiraling|pattern across|help me see|what I can't see|breakthrough|soul|transformation|sacred|ceremony|ritual|death|rebirth|integration|wound|healing crisis/i;

// Threshold: after this many turns of shallow conversation, drop to Sonnet
const SONNET_THRESHOLD_TURNS = 5;

interface ModelSelection {
  model: string;
  tier: 'opus' | 'sonnet';
  reason: string;
}

/**
 * Context-driven model selection.
 *
 * Philosophy: Start with the best (Opus) for every new member.
 * Drop to Sonnet only if conversation stays shallow after several turns.
 * Deep work always gets Opus.
 */
function selectClaudeModel(meta?: Record<string, unknown>, userInput?: string): ModelSelection {
  const userId = (meta?.userId as string) || '';
  const mode = (meta?.mode as string) || 'talk';
  const messageCount = (meta?.messageCount as number) || 0;
  const input = userInput || '';

  // 1. Opus-tier users ALWAYS get deepest voice
  if (OPUS_USER_IDS.some(id => userId.toLowerCase().includes(id.toLowerCase()))) {
    return { model: OPUS_MODEL, tier: 'opus', reason: 'opus_tier_user' };
  }

  // 2. Deep dive patterns ALWAYS get Opus
  if (DEEP_DIVE_PATTERNS.test(input)) {
    return { model: OPUS_MODEL, tier: 'opus', reason: 'deep_dive_detected' };
  }

  // 3. Care mode ALWAYS gets Opus (counseling deserves depth)
  if (mode === 'care' || mode === 'counsel') {
    return { model: OPUS_MODEL, tier: 'opus', reason: 'care_mode' };
  }

  // 4. NEW CONVERSATIONS: Start with Opus (first impressions matter)
  if (messageCount <= 3) {
    return { model: OPUS_MODEL, tier: 'opus', reason: 'new_conversation' };
  }

  // 5. After threshold turns of shallow conversation → Sonnet
  // (They've had several exchanges, conversation isn't going deep)
  if (messageCount >= SONNET_THRESHOLD_TURNS) {
    return { model: SONNET_MODEL, tier: 'sonnet', reason: 'established_casual' };
  }

  // 6. Default: still early enough, keep Opus
  return { model: OPUS_MODEL, tier: 'opus', reason: 'default_opus' };
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
  console.log(`🎭 Voice selection: ${selection.tier} (${selection.reason})`);

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

    console.log(`✅ Claude (${selection.tier}): ${text.length} chars, ${Date.now() - t0}ms`);

    return {
      text,
      provider: {
        provider: 'anthropic',
        model: selection.model,
        mode: 'full',
        latencyMs: Date.now() - t0,
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
