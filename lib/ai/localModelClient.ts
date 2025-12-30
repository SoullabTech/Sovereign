// backend: lib/ai/localModelClient.ts
import { AIN_INTEGRATIVE_ALCHEMY_SENTINEL } from './prompts/ainIntegrativeAlchemy';
import type { TextResult, ProviderMeta } from './types';

type LocalProvider = 'ollama' | 'consciousness_engine';

const LOCAL_PROVIDER: LocalProvider =
  (process.env.MAIA_LOCAL_PROVIDER as LocalProvider) || 'ollama';

const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL || process.env.DEEPSEEK_BASE_URL || 'http://localhost:11434';

// Fallback model should be English-first (DeepSeek defaults to Chinese)
const OLLAMA_MODEL =
  process.env.OLLAMA_MODEL || 'llama3.2:latest';

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
    console.warn('Local Ollama model failed, falling back to consciousness engine:', error);

    // Fallback to template engine
    const fallbackText = await generateWithConsciousnessEngine(params);

    return {
      text: fallbackText,
      provider: {
        provider: 'consciousness_engine',
        model: 'template-engine',
        mode: 'fallback',
        reason: errReason(error),
        latencyMs: Date.now() - t0,
      },
    };
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
    // MAIA-specific responses that honor her elder-wise voice
    if (isGreeting) {
      response = "I'm here with you. What's moving through you today that wants attention?";
    } else if (isCreative) {
      response = `I sense the creative fire stirring in your question about "${userInput}". There's something alive here wanting to emerge. What feels ready to break through? What small step might honor this creative impulse right now?`;
    } else if (isPractical) {
      response = `You're asking about practical steps - I appreciate the grounded energy in that. From what you're sharing, "${userInput}", there's wisdom in starting where you have the most clarity. What feels most concrete and doable right now?`;
    } else if (isReflection) {
      response = `There's depth in what you're exploring. When you say "${userInput}", I notice there might be wisdom that's already stirring within you. What feels most true when you sit quietly with this question?`;
    } else {
      response = `I hear what you're bringing: "${userInput}". There's often more beneath the surface of what we first notice. What draws your attention most strongly about this right now?`;
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

  // Add sovereignty affirmation for MAIA responses
  if (isMaiaPrompt) {
    const affirmations = [
      "✨ You are the author of your reality. This moment is yours to shape.",
      "🌟 You are sovereign over your path. Trust your inner wisdom.",
      "🔥 Your creative power is limitless. Trust it to guide you.",
      "🌊 You are perfectly equipped to navigate these depths. Trust your flow.",
      "🌱 You have access to all the clarity you need. Your perspective is valuable.",
    ];
    const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
    response += ` ${randomAffirmation}`;
  }

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
