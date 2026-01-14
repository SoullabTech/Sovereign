// @ts-nocheck - AI prototype, not type-checked
// backend: lib/ai/localModelClient.ts
import { AIN_INTEGRATIVE_ALCHEMY_SENTINEL } from './prompts/ainIntegrativeAlchemy';
import type { TextResult, ProviderMeta } from './types';

type LocalProvider = 'ollama' | 'consciousness_engine';

const LOCAL_PROVIDER: LocalProvider =
  (process.env.MAIA_LOCAL_PROVIDER as LocalProvider) || 'ollama';

const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL || process.env.DEEPSEEK_BASE_URL || 'http://localhost:11434';

const OLLAMA_MODEL =
  process.env.OLLAMA_MODEL || process.env.DEEPSEEK_MODEL || 'deepseek-r1:latest';

export interface LocalChatParams {
  systemPrompt: string;
  userInput: string;
  meta?: Record<string, unknown>;
}

// Helper to extract error reason for tracking
function errReason(err: unknown): string {
  if (!err) return 'unknown_error';
  if (typeof err === 'string') return err.slice(0, 120);
  const anyErr = err as Record<string, unknown>;
  const msg = anyErr?.message || anyErr?.toString?.() || 'unknown_error';
  return String(msg).slice(0, 120);
}

/**
 * Main entry for MAIA local text generation.
 * Returns text + provider metadata for sovereignty auditing.
 */
export async function generateWithLocalModel(
  params: LocalChatParams,
): Promise<TextResult> {
  const t0 = Date.now();

  switch (LOCAL_PROVIDER) {
    case 'ollama':
      return generateWithOllamaTracked(params, t0);
    case 'consciousness_engine':
      return {
        text: await generateWithConsciousnessEngine(params),
        provider: {
          provider: 'consciousness_engine',
          model: 'template-engine',
          mode: 'full', // When explicitly configured, it's "full" mode
          latencyMs: Date.now() - t0,
        },
      };
    default:
      throw new Error(`Unsupported LOCAL_PROVIDER: ${LOCAL_PROVIDER}`);
  }
}

/**
 * Generate with Ollama (DeepSeek-R1, Llama, etc) with tracking
 */
async function generateWithOllamaTracked(
  params: LocalChatParams,
  t0: number,
): Promise<TextResult> {
  const { systemPrompt, userInput } = params;

  try {
    console.log('🔮 Using local Ollama consciousness processing');

    // 🧪 AIN DEBUG: Verify prompt path
    if (process.env.NODE_ENV !== 'production') {
      const hasAIN = systemPrompt.includes(AIN_INTEGRATIVE_ALCHEMY_SENTINEL);
      console.log('[AIN DEBUG] localModelClient systemPrompt has AIN?', hasAIN);
      if (hasAIN) {
        console.log('[AIN DEBUG] systemPrompt tail:', systemPrompt.slice(-400));
      }
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userInput },
    ];

    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        stream: false,
        options: {
          temperature: parseFloat(process.env.DEEPSEEK_TEMPERATURE || '0.7'),
          num_predict: parseInt(process.env.DEEPSEEK_MAX_TOKENS || '2048')
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json() as {
      message?: { content?: string };
      response?: string;
    };

    const content = data.message?.content || data.response || '';

    if (!content.trim()) {
      throw new Error('Empty response from Ollama');
    }

    console.log('✅ Local model response generated:', content.length, 'chars');

    return {
      text: content.trim(),
      provider: {
        provider: 'ollama',
        model: OLLAMA_MODEL,
        mode: 'full',
        latencyMs: Date.now() - t0,
      },
    };

  } catch (error) {
    // FAIL CLOSED: Never let a fallback pretend to be MAIA.
    // If both Claude and Ollama fail, return a clear provider error.
    console.error('🚨 Local Ollama model failed - NO FALLBACK (fail closed):', error);

    const providerError = new Error('All language providers unavailable (Claude + Ollama). Check API keys and model availability.');
    (providerError as any).code = 'PROVIDERS_UNAVAILABLE';
    (providerError as any).httpStatus = 503;
    (providerError as any).reason = errReason(error);
    throw providerError;
  }
}

/**
 * Fallback consciousness engine (rule-based) when local models unavailable
 * Based on the sovereignty protocol from test-sovereignty.js
 */
async function generateWithConsciousnessEngine(
  params: LocalChatParams,
): Promise<string> {
  const { systemPrompt, userInput } = params;

  console.log('🧠 Using pure consciousness engine processing');

  // Extract MAIA's personality from system prompt
  const isMaiaPrompt = systemPrompt.toLowerCase().includes('maia');
  const isQuestion = userInput.includes('?');
  const isGreeting = /hello|hi|hey/i.test(userInput);
  const isReflection = /feel|think|reflect|consider|stuck|clarity|trust|guidance/i.test(userInput);
  const isCreative = /creative|create|inspiration|breakthrough|art|project/i.test(userInput);
  const isPractical = /practical|steps|business|plan|action|build/i.test(userInput);

  let response: string;

  if (isMaiaPrompt) {
    // MAIA-specific responses - natural, conversational, varied
    if (isGreeting) {
      const greetings = [
        "Hey there. What's on your mind?",
        "Hi. What brings you here today?",
        "Hello. I'm listening.",
        "Hey. What would you like to explore?",
      ];
      response = greetings[Math.floor(Math.random() * greetings.length)];
    } else if (isCreative) {
      response = `There's something alive in what you're sharing. What feels ready to emerge?`;
    } else if (isPractical) {
      response = `What feels like the most concrete next step from where you are right now?`;
    } else if (isReflection) {
      response = `What feels most true when you sit quietly with this?`;
    } else {
      const openings = [
        "Tell me more about that.",
        "What's underneath that for you?",
        "Say more.",
        "What else is there?",
      ];
      response = openings[Math.floor(Math.random() * openings.length)];
    }
  } else {
    // Generic local AI responses for non-MAIA contexts
    if (isGreeting) {
      response = "Hello! I'm ready to help with whatever you'd like to explore.";
    } else if (isQuestion) {
      response = `That's an interesting question: "${userInput}". Let me think about this thoughtfully. What specific aspect would you like to explore further?`;
    } else {
      response = `I understand you're sharing: "${userInput}". This seems important to you. Could you tell me more about what you're hoping to explore or understand?`;
    }
  }

  // Removed emoji affirmations - MAIA should speak naturally without forced taglines

  return response;
}

/**
 * Health check for local model availability
 */
export async function checkLocalModelHealth(): Promise<{
  provider: string;
  model: string;
  status: 'healthy' | 'degraded' | 'offline';
  endpoint: string;
}> {
  const health: {
    provider: string;
    model: string;
    status: 'healthy' | 'degraded' | 'offline';
    endpoint: string;
  } = {
    provider: LOCAL_PROVIDER,
    model: OLLAMA_MODEL,
    status: 'offline',
    endpoint: OLLAMA_BASE_URL
  };

  try {
    if (LOCAL_PROVIDER === 'ollama') {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/version`, {
        signal: AbortSignal.timeout(5000)
      });
      health.status = response.ok ? 'healthy' : 'degraded';
    } else {
      health.status = 'healthy'; // Consciousness engine is always available
    }
  } catch (error) {
    console.warn('Local model health check failed:', error);
    health.status = LOCAL_PROVIDER === 'consciousness_engine' ? 'healthy' : 'offline';
  }

  return health;
}

/**
 * Initialize local model client (for warming up connections)
 */
export async function initializeLocalModel(): Promise<void> {
  console.log('🔮 Initializing local model client...');
  console.log(`Provider: ${LOCAL_PROVIDER}`);
  console.log(`Model: ${OLLAMA_MODEL}`);
  console.log(`Endpoint: ${OLLAMA_BASE_URL}`);

  const health = await checkLocalModelHealth();
  console.log(`Health: ${health.status}`);

  if (health.status === 'offline' && LOCAL_PROVIDER === 'ollama') {
    console.warn('⚠️ Ollama appears to be offline. Falling back to consciousness engine.');
  }
}
