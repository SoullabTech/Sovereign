/**
 * OpenAI Voice Synthesis Engine
 *
 * For voice conversations, OpenAI speaks directly (since it owns TTS).
 * This provides voice coherence - the same model generating text AND speaking it.
 *
 * Claude remains as background advisor for pattern analysis.
 */

import OpenAI from 'openai';
import { detectCommunicatorType, getHighBandwidthStrategy } from './HighBandwidthCommunicator';
import { VoiceCognitiveArchitecture } from './VoiceCognitiveArchitecture';
import { PersonalOracleAgent } from '../agents/PersonalOracleAgent';

// Lazy initialization to avoid crashing when OPENAI_API_KEY is missing
let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set. Voice synthesis requires OpenAI API key.');
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openaiClient;
}

// Initialize cognitive architecture for voice
const cognitiveArchitecture = new VoiceCognitiveArchitecture();

export interface VoiceSynthesisContext {
  userInput: string;
  userId: string;
  userName?: string;
  conversationHistory?: Array<{role: string; content: string}>;
  advisorInsights?: {
    bookWisdom?: string;
    eoWisdom?: string;
    patterns?: string[];
  };
}

export interface VoiceSynthesisResponse {
  response: string;
  element: string;
  metadata: {
    model: string;
    tokensUsed?: number;
  };
}

/**
 * Core MAIA system prompt for OpenAI voice synthesis
 * Using the SAME prompt as PersonalOracleAgent for consistency
 */
const MAIA_VOICE_SYSTEM_PROMPT = PersonalOracleAgent.MAIA_SYSTEM_PROMPT;

/**
 * Calculate conversational parity - the dance of intimacy
 *
 * CRITICAL: High-bandwidth communicators aren't great at small talk,
 * but they UNDERSTAND the ritual of establishing parity.
 *
 * Their brevity isn't disinterest - it's TESTING.
 * Can you honor the ritual without filling space?
 */
function calculateParity(userInput: string, conversationHistory?: Array<{role: string; content: string}>) {
  const userWordCount = userInput.split(/\s+/).length;
  const turnNumber = (conversationHistory?.filter(m => m.role === 'user').length || 0) + 1;

  // Early turns (1-3): THE RITUAL
  // Not small talk. Just establishing: can you be real?
  if (turnNumber <= 3) {
    return {
      maxWords: Math.min(userWordCount + 2, 8), // VERY brief - no chit-chat
      guidance: 'Ritual of parity. No small talk. Just quiet presence. They\'re testing.'
    };
  }

  // Middle turns (4-8): TRUST BUILDING
  // Ritual succeeded. They're still here. Match their expansion.
  if (turnNumber <= 8) {
    const matchRatio = userWordCount > 20 ? 1.2 : 1.5;
    return {
      maxWords: Math.min(Math.floor(userWordCount * matchRatio), 35),
      guidance: userWordCount > 20 ? 'Opening up. Match their depth. Stay grounded.' : 'Trust building. Curious, not interpreting.'
    };
  }

  // Later turns (9+): REAL CONVERSATION
  // Trust earned. Can go anywhere now.
  return {
    maxWords: userWordCount > 30 ? 60 : 35,
    guidance: userWordCount > 30 ? 'Trust established. Can go deep. Follow their lead.' : 'Present. Let them set depth.'
  };
}

/**
 * Generate MAIA's voice response using OpenAI GPT-4
 * This ensures voice coherence (same model for text AND TTS)
 */
export async function synthesizeVoiceResponse(
  context: VoiceSynthesisContext
): Promise<VoiceSynthesisResponse> {

  // ========================================
  // PHASE 1: COGNITIVE ARCHITECTURE PROCESSING
  // Process through LIDA, SOAR, ACT-R, MicroPsi & Elemental Agents
  // ========================================
  let cognitiveState = null;
  try {
    cognitiveState = await cognitiveArchitecture.processVoiceInput(
      context.userInput,
      context.conversationHistory || []
    );
    console.log('🧠 Cognitive Architecture Active:', {
      element: cognitiveState.element,
      attentionFocus: cognitiveState.cognitiveProcessing.attentionFocus,
      wisdomDirection: cognitiveState.cognitiveProcessing.wisdomDirection,
      consciousnessMarkers: cognitiveState.consciousnessMarkers
    });
  } catch (error) {
    console.warn('⚠️ Cognitive architecture processing skipped:', error);
    // Continue without cognitive enhancement - graceful degradation
  }

  // ========================================
  // PHASE 2: COMMUNICATOR TYPE DETECTION
  // ========================================
  // Detect communicator type - are they high-bandwidth?
  const profile = detectCommunicatorType(context.conversationHistory || []);
  const turnNumber = (context.conversationHistory?.filter(m => m.role === 'user').length || 0) + 1;

  // Use high-bandwidth strategy if detected, otherwise standard parity
  let strategy;
  if (profile.type === 'high-bandwidth') {
    console.log(`🎯 HIGH-BANDWIDTH COMMUNICATOR DETECTED (confidence: ${profile.confidence.toFixed(2)})`, profile.indicators);
    strategy = getHighBandwidthStrategy(profile, turnNumber);
  } else {
    // Standard parity calculation
    const parity = calculateParity(context.userInput, context.conversationHistory);
    strategy = {
      maxWords: parity.maxWords,
      tone: 'warm, present',
      guidance: parity.guidance
    };
  }

  // Build conversation messages
  const messages: any[] = [
    { role: 'system', content: MAIA_VOICE_SYSTEM_PROMPT },
    {
      role: 'system',
      content: `PARITY for this turn:
Max ${strategy.maxWords} words.
Tone: ${strategy.tone}
${strategy.guidance}

The dance: Match their investment. Don't perform. Just be present.`
    }
  ];

  // ========================================
  // PHASE 3: COGNITIVE ARCHITECTURE INSIGHTS
  // Add wisdom from LIDA, SOAR, ACT-R, MicroPsi & Elemental Agents
  // ========================================
  if (cognitiveState) {
    messages.push({
      role: 'system',
      content: `## COGNITIVE ARCHITECTURE PROCESSING (LIDA + SOAR + ACT-R + MicroPsi):

**Active Element**: ${cognitiveState.element.toUpperCase()}
**Conscious Attention Focus**: ${cognitiveState.cognitiveProcessing.attentionFocus}
**Wisdom Direction**: ${cognitiveState.cognitiveProcessing.wisdomDirection}
**Memory Resonance**: ${cognitiveState.cognitiveProcessing.memoryResonance}
**Emotional Tone**: ${cognitiveState.cognitiveProcessing.emotionalTone}

**${cognitiveState.element.toUpperCase()} Elemental Wisdom**:
${cognitiveState.elementalWisdom}

**Consciousness Markers**: ${cognitiveState.consciousnessMarkers.join(', ')}

This cognitive processing reveals what matters most in this moment. Let it inform your recognition of where they are and what wants to be witnessed.`
    });
  }

  // Add advisor insights as CORE INTELLIGENCE - this is not background, this is WHO YOU ARE
  if (context.advisorInsights) {
    let wisdomContext = '';

    if (context.advisorInsights.bookWisdom) {
      wisdomContext += `\n\n## KELLY'S WISDOM (Your Core Training):\n${context.advisorInsights.bookWisdom}`;
    }

    if (context.advisorInsights.eoWisdom) {
      wisdomContext += `\n\n## ELEMENTAL ORACLE 2.0 (Applied Spiralogic):\n${context.advisorInsights.eoWisdom}`;
    }

    if (context.advisorInsights.patterns && context.advisorInsights.patterns.length > 0) {
      wisdomContext += `\n\n## PATTERNS IN THEIR JOURNEY:\n${context.advisorInsights.patterns.join('\n- ')}`;
    }

    if (wisdomContext) {
      messages.push({
        role: 'system',
        content: `ACTIVE WISDOM FOR THIS CONVERSATION:
${wisdomContext}

This wisdom is not "background" - it's your living knowledge. Integrate it naturally into how you see and respond to them. You KNOW this work. Let it inform your recognition of where they are.`
      });
    }
  }

  // Add conversation history
  if (context.conversationHistory && context.conversationHistory.length > 0) {
    // Take last 10 messages for context
    const recentHistory = context.conversationHistory.slice(-10);
    console.log(`📜 Adding conversation history: ${recentHistory.length} messages`);
    messages.push(...recentHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    })));
  } else {
    console.log('📜 No conversation history available - fresh conversation');
  }

  // Add current user input
  messages.push({
    role: 'user',
    content: context.userInput
  });

  try {
    console.log('🔑 OpenAI API Key check:', {
      exists: !!process.env.OPENAI_API_KEY,
      length: process.env.OPENAI_API_KEY?.length,
      prefix: process.env.OPENAI_API_KEY?.substring(0, 7)
    });

    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.95, // High variation - MAIA should feel alive, not robotic
      max_tokens: 150, // Keep responses concise for voice
      presence_penalty: 0.6, // Stronger penalty to prevent exact repetition
      frequency_penalty: 0.5 // Encourage word variety
    });

    console.log('✅ OpenAI completion received:', {
      hasChoices: !!completion.choices?.[0],
      hasContent: !!completion.choices?.[0]?.message?.content,
      contentLength: completion.choices?.[0]?.message?.content?.length
    });

    const response = completion.choices[0].message.content || "I'm here. Tell me more.";

    // Simple element detection based on response tone
    let element = 'aether'; // default
    const lowerResponse = response.toLowerCase();

    if (lowerResponse.includes('ground') || lowerResponse.includes('body') || lowerResponse.includes('earth')) {
      element = 'earth';
    } else if (lowerResponse.includes('feel') || lowerResponse.includes('flow') || lowerResponse.includes('tender')) {
      element = 'water';
    } else if (lowerResponse.includes('spark') || lowerResponse.includes('energy') || lowerResponse.includes('alive')) {
      element = 'fire';
    } else if (lowerResponse.includes('clear') || lowerResponse.includes('see') || lowerResponse.includes('perspective')) {
      element = 'air';
    }

    return {
      response,
      element,
      metadata: {
        model: 'gpt-4',
        tokensUsed: completion.usage?.total_tokens
      }
    };

  } catch (error: any) {
    console.error('❌ OpenAI voice synthesis error:', {
      message: error?.message,
      status: error?.status,
      statusText: error?.statusText,
      type: error?.type,
      code: error?.code,
      fullError: error
    });

    // Warm fallback - NEVER echo user input
    return {
      response: "I'm experiencing a moment of integration. Could you share that again?",
      element: 'aether',
      metadata: {
        model: 'gpt-4-fallback',
        error: error?.message || 'Unknown error'
      }
    };
  }
}
