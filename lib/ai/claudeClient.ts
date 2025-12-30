// backend: lib/ai/claudeClient.ts
// Primary AI provider for MAIA - Claude (Anthropic)

import Anthropic from '@anthropic-ai/sdk';
import { AIN_INTEGRATIVE_ALCHEMY_SENTINEL } from './prompts/ainIntegrativeAlchemy';
import type { TextResult, ProviderMeta } from './types';

// Model configuration - Opus 4.5 for deepest consciousness work
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-opus-4-5-20251101';
const CLAUDE_MAX_TOKENS = parseInt(process.env.CLAUDE_MAX_TOKENS || '2048');
const CLAUDE_TEMPERATURE = parseFloat(process.env.CLAUDE_TEMPERATURE || '0.7');

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

  try {
    console.log(`🧠 Calling Claude (${CLAUDE_MODEL})...`);

    const message = await client.messages.create({
      model: CLAUDE_MODEL,
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

    console.log(`✅ Claude response: ${text.length} chars, ${Date.now() - t0}ms`);

    return {
      text,
      provider: {
        provider: 'anthropic',
        model: CLAUDE_MODEL,
        mode: 'full',
        latencyMs: Date.now() - t0,
      },
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
    model: CLAUDE_MODEL,
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

  console.log(`🧠 Claude initialized: ${CLAUDE_MODEL}`);
  return true;
}
