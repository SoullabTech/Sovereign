// backend: lib/ai/claudeClient.ts
// Primary AI provider for MAIA - Claude (Anthropic)

import Anthropic from '@anthropic-ai/sdk';
import { AIN_INTEGRATIVE_ALCHEMY_SENTINEL } from './prompts/ainIntegrativeAlchemy';
import type { TextResult, ProviderMeta } from './types';

// Awareness level type (1-7 developmental scale)
type AwarenessLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

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
 * AWARENESS-LEVEL-DRIVEN MODEL ROUTING
 *
 * Philosophy: Meet members where they are with the appropriate depth.
 *
 * Levels 1-2 (Newcomer/Explorer): ALWAYS Opus
 *   - Building trust, first impressions need deepest attunement
 *   - These members need MAIA's most nuanced, careful presence
 *
 * Level 3 (Practitioner): Context-dependent
 *   - Sonnet for routine check-ins
 *   - Opus when deep patterns detected or they go deep
 *
 * Level 4 (Student): Teaching moments get Opus
 *   - Learning frameworks - Opus for pedagogical depth
 *   - Casual exchanges can use Sonnet
 *
 * Levels 5-7 (Integrator/Teacher/Master): Opus for depth work
 *   - These members are doing real consciousness work
 *   - They can handle Sonnet for quick exchanges
 *   - But any substantial inquiry deserves Opus
 */
function selectModelByAwareness(
  awarenessLevel: AwarenessLevel | undefined,
  hasDeepPattern: boolean,
  mode: string
): { tier: 'opus' | 'sonnet'; reason: string } | null {
  // No awareness level detected yet - let other heuristics handle it
  if (!awarenessLevel) return null;

  // Levels 1-2: ALWAYS Opus - trust-building phase
  if (awarenessLevel <= 2) {
    return { tier: 'opus', reason: `awareness_L${awarenessLevel}_trust` };
  }

  // Level 3 (Practitioner): Opus if deep, otherwise can use Sonnet
  if (awarenessLevel === 3) {
    if (hasDeepPattern || mode === 'care') {
      return { tier: 'opus', reason: 'awareness_L3_deep' };
    }
    return null; // Let message count / other heuristics decide
  }

  // Level 4 (Student): Learning mode - Opus for substantial exchanges
  if (awarenessLevel === 4) {
    if (hasDeepPattern || mode === 'care') {
      return { tier: 'opus', reason: 'awareness_L4_teaching' };
    }
    return null;
  }

  // Levels 5-7 (Integrator/Teacher/Master): Deep work gets Opus
  if (awarenessLevel >= 5) {
    if (hasDeepPattern || mode === 'care') {
      return { tier: 'opus', reason: `awareness_L${awarenessLevel}_depth` };
    }
    // High awareness casual exchange - Sonnet is respectful of their time
    return null;
  }

  return null;
}

/**
 * Context-driven model selection.
 *
 * Philosophy: Meet members where they are.
 * - Awareness level determines baseline depth needs
 * - Deep dive patterns always escalate to Opus
 * - New members always get Opus (first impressions)
 * - Established casual conversation can use Sonnet
 *
 * Priority order:
 * 1. Opus-tier users (always Opus)
 * 2. Deep dive patterns (always Opus)
 * 3. Awareness level routing (developmental stage)
 * 4. Care mode (always Opus)
 * 5. New conversation (Opus for first impressions)
 * 6. Established casual (Sonnet after threshold)
 */
function selectClaudeModel(meta?: Record<string, unknown>, userInput?: string): ModelSelection {
  const userId = (meta?.userId as string) || '';
  const mode = (meta?.mode as string) || 'talk';
  const messageCount = (meta?.messageCount as number) || 0;
  const input = userInput || '';

  // Extract awareness level from consciousness policy (set by maiaService)
  const consciousnessPolicy = meta?.consciousnessPolicy as { awarenessLevel?: AwarenessLevel } | undefined;
  const awarenessLevel = consciousnessPolicy?.awarenessLevel ?? (meta?.awarenessLevel as AwarenessLevel | undefined);

  // Check for deep patterns early - used by awareness routing too
  const hasDeepPattern = DEEP_DIVE_PATTERNS.test(input);

  // 1. Opus-tier users ALWAYS get deepest voice
  if (OPUS_USER_IDS.some(id => userId.toLowerCase().includes(id.toLowerCase()))) {
    return { model: OPUS_MODEL, tier: 'opus', reason: 'opus_tier_user' };
  }

  // 2. Deep dive patterns ALWAYS get Opus
  if (hasDeepPattern) {
    return { model: OPUS_MODEL, tier: 'opus', reason: 'deep_dive_detected' };
  }

  // 3. AWARENESS-LEVEL ROUTING (developmental stage)
  const awarenessSelection = selectModelByAwareness(awarenessLevel, hasDeepPattern, mode);
  if (awarenessSelection) {
    return {
      model: awarenessSelection.tier === 'opus' ? OPUS_MODEL : SONNET_MODEL,
      ...awarenessSelection
    };
  }

  // 4. Care mode ALWAYS gets Opus (counseling deserves depth)
  if (mode === 'care' || mode === 'counsel') {
    return { model: OPUS_MODEL, tier: 'opus', reason: 'care_mode' };
  }

  // 5. NEW CONVERSATIONS: Start with Opus (first impressions matter)
  if (messageCount <= 3) {
    return { model: OPUS_MODEL, tier: 'opus', reason: 'new_conversation' };
  }

  // 6. After threshold turns of shallow conversation → Sonnet
  if (messageCount >= SONNET_THRESHOLD_TURNS) {
    return { model: SONNET_MODEL, tier: 'sonnet', reason: 'established_casual' };
  }

  // 7. Default: still early enough, keep Opus
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
