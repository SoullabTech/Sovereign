/**
 * Provider Router - Channel-based LLM Selection
 *
 * ARCHITECTURE:
 * - channel="chat" → Claude allowed (MAIA's "mouth")
 * - channel="consciousness" → Local only (MAIA's "mind")
 *
 * Claude NEVER decides:
 * - consciousness level
 * - sacred gating
 * - memory writes/linking/embedding
 * - meta-level meaning
 */

import 'server-only';
import Anthropic from '@anthropic-ai/sdk';

// Hard runtime guard (belt + suspenders)
if (typeof window !== 'undefined') {
  throw new Error('🚨 providerRouter must NEVER run in the browser');
}

export type LLMChannel = 'chat' | 'consciousness';

export interface LLMClient {
  providerName: string;
  generateText(prompt: string, options?: { system?: string; temperature?: number; maxTokens?: number }): Promise<string>;
}

function envTrue(name: string): boolean {
  return (process.env[name] || '').toLowerCase() === 'true';
}

function envFalse(name: string): boolean {
  return (process.env[name] || '').toLowerCase() === 'false';
}

/**
 * Ollama client (local sovereignty)
 */
function getOllamaClient(): LLMClient {
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

  return {
    providerName: 'ollama',
    async generateText(prompt: string, options = {}) {
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-r1:latest',
          prompt: options.system ? `${options.system}\n\n${prompt}` : prompt,
          stream: false,
          options: {
            temperature: options.temperature || 0.8,
            num_predict: options.maxTokens || 1000
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response.trim();
    }
  };
}

/**
 * Anthropic client (Claude - chat only)
 */
function getAnthropicClient(): LLMClient {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const anthropic = new Anthropic({ apiKey });

  return {
    providerName: 'anthropic',
    async generateText(prompt: string, options = {}) {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: options.maxTokens || 1200,
        temperature: options.temperature || 0.8,
        system: options.system || '',
        messages: [
          { role: 'user', content: prompt }
        ]
      });

      const response = message.content[0];
      if (response.type !== 'text') {
        throw new Error('Unexpected Claude response type');
      }

      return response.text;
    }
  };
}

/**
 * Get LLM client based on channel
 *
 * SOVEREIGNTY ENFORCEMENT:
 * - consciousness channel MUST be local in SOVEREIGN_MODE
 * - chat channel CAN use Claude if allowed
 */
export function getLLM(channel: LLMChannel): LLMClient {
  // Global kill switch
  if (envTrue('DISABLE_CLAUDE')) {
    console.log(`[providerRouter] channel=${channel} → ollama (DISABLE_CLAUDE=true)`);
    return getOllamaClient();
  }

  const sovereign = envTrue('SOVEREIGN_MODE');
  const allowAnthropicChat = envTrue('ALLOW_ANTHROPIC_CHAT');
  const allowAnthropicConsciousness = envTrue('ALLOW_ANTHROPIC_CONSCIOUSNESS');

  // HARD LAW: consciousness is local-only in sovereignty mode
  if (channel === 'consciousness') {
    if (sovereign && allowAnthropicConsciousness) {
      throw new Error(
        '🚨 SOVEREIGNTY VIOLATION: ALLOW_ANTHROPIC_CONSCIOUSNESS must be false when SOVEREIGN_MODE=true'
      );
    }

    if (!sovereign && allowAnthropicConsciousness && process.env.ANTHROPIC_API_KEY) {
      console.log(`[providerRouter] channel=consciousness → anthropic (sovereignty disabled)`);
      return getAnthropicClient();
    }

    console.log(`[providerRouter] channel=consciousness → ollama (sovereignty enforced)`);
    return getOllamaClient();
  }

  // chat channel
  if (allowAnthropicChat && process.env.ANTHROPIC_API_KEY) {
    console.log(`[providerRouter] channel=chat → anthropic (Claude as mouth)`);
    return getAnthropicClient();
  }

  console.log(`[providerRouter] channel=chat → ollama (Claude not configured)`);
  return getOllamaClient();
}
