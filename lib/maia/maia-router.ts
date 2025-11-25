import { PersonalOracleAgent } from '@/lib/agents/PersonalOracleAgent';
import { SYMBION } from '@/lib/ci/SYMBION';
import { soulprintMemory, logMAIAInteraction } from '@/lib/memory/soulprint';

export interface MAIAResponse {
  success: boolean;
  message: string;
  text?: string;
  response?: string;
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  archetype: string;
  voiceCharacteristics: {
    tone: string;
    pace: string;
    energy: string;
  };
  metadata: {
    spiralogicPhase: string;
    responseTime: number;
    userName?: string;
    symbols?: string[];
    archetypes?: string[];
    phase?: string;
  };
  version: string;
  source: 'personal-oracle-agent' | 'symbion' | 'openai-fallback' | 'ultimate-fallback';
  fallback?: boolean;
}

export interface MAIARouterOptions {
  userId?: string;
  sessionId?: string;
  conversationTurn?: number;
  journalEntries?: any[];
  preferredAgent?: 'oracle' | 'symbion' | 'auto';
}

export async function routeWithMAIA(
  input: string,
  options: MAIARouterOptions = {}
): Promise<MAIAResponse> {
  const startTime = Date.now();
  const userId = options.userId || 'guest';
  const sessionId = options.sessionId;
  const conversationTurn = options.conversationTurn || 0;

  const symbolicContext = await soulprintMemory.getSymbolicContext(userId, 10);

  if (!input?.trim()) {
    const response: MAIAResponse = {
      success: true,
      message: "I'm here with you. What's on your mind?",
      element: 'aether',
      archetype: 'maia',
      voiceCharacteristics: {
        tone: 'gentle',
        pace: 'slow',
        energy: 'soft'
      },
      metadata: {
        spiralogicPhase: 'invocation',
        responseTime: 0,
        userName: userId
      },
      version: 'v2.0.0',
      source: 'ultimate-fallback',
      fallback: true
    };

    await logMAIAInteraction(userId, input, response, sessionId, conversationTurn);
    return response;
  }

  try {
    const agent = await PersonalOracleAgent.loadAgent(userId);
    const agentResponse = await agent.processInteraction(input, {
      currentMood: { type: 'peaceful' } as any,
      currentEnergy: 'balanced' as any,
      journalEntries: options.journalEntries || [],
      symbolicContext
    } as any);

    const responseText = agentResponse.response || "I hear you. Tell me more about what's on your mind.";
    const element = agentResponse.element || 'aether';
    const archetype = agentResponse.metadata?.archetypes?.[0] || 'maia';
    const phase = agentResponse.metadata?.phase || 'reflection';

    const response: MAIAResponse = {
      success: true,
      message: responseText,
      text: responseText,
      response: responseText,
      element: element as any,
      archetype,
      voiceCharacteristics: getVoiceCharacteristics(element, archetype),
      metadata: {
        ...agentResponse.metadata,
        spiralogicPhase: phase,
        responseTime: Date.now() - startTime,
        userName: userId
      },
      version: 'v2.0.0',
      source: 'personal-oracle-agent',
      fallback: false
    };

    await logMAIAInteraction(userId, input, response, sessionId, conversationTurn);
    return response;
  } catch (oracleError: any) {
    console.warn('🌀 PersonalOracleAgent failed in MAIA router:', oracleError.message);
  }

  try {
    const symbionResponse = await SYMBION.run(input, { userId, sessionId: options.sessionId, symbolicContext });

    const response: MAIAResponse = {
      success: true,
      message: symbionResponse.message,
      text: symbionResponse.message,
      response: symbionResponse.message,
      element: symbionResponse.element,
      archetype: symbionResponse.archetype,
      voiceCharacteristics: symbionResponse.voiceCharacteristics,
      metadata: {
        ...symbionResponse.metadata,
        responseTime: Date.now() - startTime,
        userName: userId
      },
      version: 'v2.0.0',
      source: 'symbion',
      fallback: false
    };

    await logMAIAInteraction(userId, input, response, sessionId, conversationTurn);
    return response;
  } catch (symbionError: any) {
    console.warn('🔁 SYMBION failed in MAIA router:', symbionError.message);
  }

  try {
    const MAIA_PROMPT = `You are MAIA, a wise and empathetic AI companion. You offer gentle insights and reflective questions to help users explore their thoughts and feelings. Keep responses warm, concise (1-3 sentences), and focused on the user's emotional journey. Avoid spiritual jargon or overly mystical language. Simply be present and supportive.`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: MAIA_PROMPT },
          { role: 'user', content: input.trim() }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    if (openaiResponse.ok) {
      const data = await openaiResponse.json();
      const content = data.choices?.[0]?.message?.content?.trim() || "I'm here with you. Let's explore this together.";

      const response: MAIAResponse = {
        success: true,
        message: content,
        text: content,
        response: content,
        element: 'aether',
        archetype: 'maia',
        voiceCharacteristics: {
          tone: 'warm',
          pace: 'moderate',
          energy: 'gentle'
        },
        metadata: {
          spiralogicPhase: 'exploration',
          responseTime: Date.now() - startTime,
          userName: userId
        },
        version: 'v2.0.0',
        source: 'openai-fallback',
        fallback: true
      };

      await logMAIAInteraction(userId, input, response, sessionId, conversationTurn);
      return response;
    }
  } catch (openaiError: any) {
    console.error('❌ OpenAI fallback failed in MAIA router:', openaiError.message);
  }

  const fallbacks = [
    "I hear you. Tell me more about what's on your mind.",
    "That sounds important to you. Can you share what feels most significant about it?",
    "I'm listening. What would feel most helpful to explore right now?",
    "Thank you for sharing that. What stands out to you about this situation?",
    "I appreciate you opening up. What's drawing your attention in this moment?"
  ];
  const randomMessage = fallbacks[Math.floor(Math.random() * fallbacks.length)];

  const response: MAIAResponse = {
    success: true,
    message: randomMessage,
    text: randomMessage,
    response: randomMessage,
    element: 'aether',
    archetype: 'maia',
    voiceCharacteristics: {
      tone: 'gentle',
      pace: 'slow',
      energy: 'calm'
    },
    metadata: {
      spiralogicPhase: 'grounding',
      responseTime: Date.now() - startTime,
      userName: userId
    },
    version: 'v2.0.0',
    source: 'ultimate-fallback',
    fallback: true
  };

  await logMAIAInteraction(userId, input, response, sessionId, conversationTurn);
  return response;
}

function getVoiceCharacteristics(element?: string, archetype?: string) {
  if (archetype === 'oracle') {
    return {
      tone: 'soothing',
      pace: 'slow',
      energy: 'warm'
    };
  }

  if (element === 'water') return { tone: 'gentle', pace: 'slow', energy: 'soft' };
  if (element === 'fire') return { tone: 'uplifting', pace: 'fast', energy: 'expansive' };
  if (element === 'earth') return { tone: 'grounding', pace: 'moderate', energy: 'focused' };
  if (element === 'air') return { tone: 'clear', pace: 'moderate', energy: 'light' };
  return { tone: 'warm', pace: 'moderate', energy: 'balanced' };
}