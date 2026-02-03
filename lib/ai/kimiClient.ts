// lib/ai/kimiClient.ts
// Moonshot Kimi client for library distillation and deep synthesis
// NOT for live conversation - Claude handles MAIA's voice
//
// API Reference: https://platform.moonshot.ai/docs/api/chat
// Kimi K2.5: https://platform.moonshot.ai/docs/guide/kimi-k2-5-quickstart

import type { TextResult, ProviderMeta } from './types';

// Configuration
const MOONSHOT_BASE_URL = process.env.MOONSHOT_BASE_URL || 'https://api.moonshot.ai/v1';
const MOONSHOT_MODEL = process.env.MOONSHOT_MODEL || 'kimi-k2.5';
const MOONSHOT_MAX_TOKENS = parseInt(process.env.MOONSHOT_MAX_TOKENS || '4096');

// Kimi K2.5 recommended settings:
// - Thinking mode: temperature=1.0 (includes reasoning traces)
// - Instant mode: temperature=0.6 (direct responses)
const MOONSHOT_TEMPERATURE_THINKING = 1.0;
const MOONSHOT_TEMPERATURE_INSTANT = 0.6;

export interface KimiChatParams {
  systemPrompt: string;
  userInput: string;
  meta?: Record<string, unknown>;
  // Use thinking mode for deeper analysis (includes reasoning traces)
  thinkingMode?: boolean;
}

interface MoonshotMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface MoonshotChatRequest {
  model: string;
  messages: MoonshotMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

interface MoonshotChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
      reasoning_content?: string; // Present in thinking mode
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Check if Kimi/Moonshot is available
 */
export function isKimiAvailable(): boolean {
  return Boolean(process.env.MOONSHOT_API_KEY);
}

/**
 * Generate text with Kimi (Moonshot)
 * Used for library distillation and deep synthesis tasks.
 *
 * @example
 * ```typescript
 * const result = await generateWithKimi({
 *   systemPrompt: 'You are a wisdom distiller...',
 *   userInput: 'Analyze this text: ...',
 *   thinkingMode: true, // Enable reasoning traces
 * });
 * ```
 */
export async function generateWithKimi(
  params: KimiChatParams,
): Promise<TextResult> {
  const t0 = Date.now();
  const { systemPrompt, userInput, meta, thinkingMode = true } = params;

  const apiKey = process.env.MOONSHOT_API_KEY;
  if (!apiKey) {
    throw new Error('Kimi unavailable: MOONSHOT_API_KEY not configured');
  }

  const temperature = thinkingMode ? MOONSHOT_TEMPERATURE_THINKING : MOONSHOT_TEMPERATURE_INSTANT;
  const model = (meta?.model as string) || MOONSHOT_MODEL;

  console.log(`🌙 Calling Kimi (${model}, ${thinkingMode ? 'thinking' : 'instant'} mode)...`);

  const requestBody: MoonshotChatRequest = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userInput },
    ],
    temperature,
    max_tokens: MOONSHOT_MAX_TOKENS,
    top_p: 0.95, // Recommended by Moonshot
    stream: false,
  };

  try {
    const response = await fetch(`${MOONSHOT_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Kimi API error: ${response.status}`;

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch {
        errorMessage = `${errorMessage} - ${errorText.slice(0, 200)}`;
      }

      throw new Error(errorMessage);
    }

    const data: MoonshotChatResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error('Empty response from Kimi');
    }

    const choice = data.choices[0];
    const text = choice.message.content?.trim();
    const reasoningContent = choice.message.reasoning_content;

    if (!text) {
      throw new Error('Empty content from Kimi');
    }

    const latencyMs = Date.now() - t0;
    const tokensUsed = data.usage?.total_tokens || 0;

    console.log(`✅ Kimi (${model}): ${text.length} chars, ${tokensUsed} tokens, ${latencyMs}ms`);

    // Log reasoning if present (thinking mode)
    if (reasoningContent) {
      console.log(`🧠 Kimi reasoning: ${reasoningContent.slice(0, 200)}...`);
    }

    // Build provider metadata with Kimi-specific extensions
    const providerMeta = {
      provider: 'moonshot' as const,
      model,
      mode: 'full' as const, // Always 'full' - this is the real model, not a fallback
      latencyMs,
      // Kimi-specific extensions (not in base ProviderMeta but useful for logging)
      tokensUsed,
      reasoningContent,
      thinkingMode,
    };

    return {
      text,
      provider: providerMeta as ProviderMeta,
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Kimi API error:', errMsg);
    throw new Error(`Kimi generation failed: ${errMsg}`);
  }
}

/**
 * Health check for Kimi availability
 */
export async function checkKimiHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'offline';
  model: string | null;
  hasApiKey: boolean;
  baseUrl: string;
}> {
  const apiKey = process.env.MOONSHOT_API_KEY;

  if (!apiKey) {
    return {
      status: 'offline',
      model: null,
      hasApiKey: false,
      baseUrl: MOONSHOT_BASE_URL,
    };
  }

  // Just check if we have a key - actual API validation happens on first call
  return {
    status: 'healthy',
    model: MOONSHOT_MODEL,
    hasApiKey: true,
    baseUrl: MOONSHOT_BASE_URL,
  };
}

/**
 * Generate distillation with Kimi
 * Specialized wrapper for library distillation tasks.
 * Uses thinking mode for deeper analysis.
 */
export async function distillWithKimi(
  content: string,
  sourceTitle: string,
  sourceAuthor?: string,
): Promise<{
  distillate: string;
  reasoning?: string;
  provider: ProviderMeta;
}> {
  const systemPrompt = `You are a wisdom distiller for a consciousness companion system called MAIA.
Your task is to extract structured wisdom from source texts.

Output a JSON object with this exact structure:
{
  "summary_short": "1-2 sentence essence",
  "summary_long": "Detailed summary (2-3 paragraphs)",
  "definitions": [{"term": "...", "meaning": "...", "context": "..."}],
  "practices": [{"name": "...", "description": "...", "when_useful": "..."}],
  "warnings": [{"pattern": "...", "risk": "...", "guidance": "..."}],
  "facet_tags": ["tag1", "tag2"],
  "archetypes": ["archetype1", "archetype2"],
  "key_quotes": [{"quote": "...", "significance": "..."}]
}

Be precise. Extract genuine wisdom, not summaries. Focus on what would be useful for someone seeking guidance.`;

  const userInput = `Source: "${sourceTitle}"${sourceAuthor ? ` by ${sourceAuthor}` : ''}

Content to distill:
${content}

Generate the structured distillation JSON:`;

  const result = await generateWithKimi({
    systemPrompt,
    userInput,
    thinkingMode: true, // Use thinking mode for deeper analysis
    meta: {
      task: 'library_distillation',
      sourceTitle,
      sourceAuthor,
    },
  });

  return {
    distillate: result.text,
    reasoning: (result.provider as any).reasoningContent,
    provider: result.provider,
  };
}
