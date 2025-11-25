/**
 * 🧠🎙️ Voice Prompt From Memory
 *
 * Final connective layer between:
 * - MAIA's memory (AIN payload)
 * - Tone engine (style matrix)
 * - Voice orchestration (TTS)
 *
 * This is where her soul speaks through her voice.
 */

import type { AINMemoryPayload } from '@/lib/memory/AINMemoryPayload';
import type { Archetype } from './conversation/AffectDetector';
import type { SpiralogicPhase } from '@/lib/spiralogic/PhaseDetector';
import { buildMAIASystemPrompt, getSensoryPrompt, getPhilosophicalPrompt } from '@/lib/prompts/maiaEssence';
import { getMetaphorContext } from './ElementalMetaphors';
import { getUserHistorySummary, getRecentSymbolicThreads } from '@/lib/memory/AINMemoryPayload';
import { resolveVoice, formatVoiceForAPI } from './ArchetypalVoiceMapping';
import { styleForPhaseArchetype } from './VoiceStyleMatrix';
import { whisperQuote } from './QuoteWhisperer';

/**
 * Complete voice context for LLM + TTS
 */
export interface VoiceContext {
  // System Prompt
  systemPrompt: string;           // Complete MAIA essence + archetype context

  // User Context
  userHistory: string;            // Recent symbolic threads + intentions
  conversationTail: string;       // Last 30 seconds of dialogue

  // Style Guidance
  metaphorLevel: number;          // 0-2 scale
  conversationMode: 'sensory' | 'philosophical' | 'balanced';
  poetryLevel: 'none' | 'light' | 'moderate' | 'high';

  // Voice Configuration
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed: number;                  // TTS speed adjustment

  // Continuity
  bridgeLanguage?: string;        // Transition phrase if archetype changed
  shouldWhisperQuote: boolean;    // Quote delivery readiness

  // Metadata
  archetype: Archetype;
  phase: SpiralogicPhase;
  conversationDepth: number;
  exchangeCount: number;
}

/**
 * Build complete voice context from memory + current state
 * This is the single source of truth for how MAIA speaks
 */
export function buildVoiceContext(
  memory: AINMemoryPayload,
  currentArchetype: Archetype,
  currentPhase: SpiralogicPhase,
  userInput: string,
  conversationTail?: string
): VoiceContext {
  // Get style for current archetype + phase
  const style = styleForPhaseArchetype(currentArchetype, currentPhase);

  // Determine conversation mode
  const conversationMode = memory.preferences.prefersSensory && memory.preferences.prefersPhilosophical
    ? 'balanced'
    : memory.preferences.prefersSensory
    ? 'sensory'
    : 'philosophical';

  // Build system prompt
  const userHistory = getUserHistorySummary(memory);
  const systemPrompt = buildMAIASystemPrompt({
    archetype: currentArchetype,
    phase: currentPhase,
    conversationMode,
    userHistory,
    metaphorLevel: memory.preferences.metaphorComfort
  });

  // Add metaphor context for current archetype
  const metaphorContext = getMetaphorContext(currentArchetype);
  const fullSystemPrompt = systemPrompt + '\n\n' + metaphorContext;

  // Resolve voice (hybrid: auto-flow or manual)
  const voicePreference = {
    mode: 'auto' as const,  // TODO: Pull from user settings
    enableTransitions: true
  };
  const selectedVoice = resolveVoice(currentArchetype, voicePreference);
  const { speed } = formatVoiceForAPI(selectedVoice);

  // Check if archetype changed (for bridge language)
  const previousArchetype = memory.previousArchetype;
  const archetypeChanged = previousArchetype !== currentArchetype;

  const bridgeLanguage = archetypeChanged
    ? getBridgeLanguage(previousArchetype, currentArchetype)
    : undefined;

  // Determine if quote should be whispered
  const shouldWhisperQuote = memory.preferences.quoteAppreciation &&
    memory.conversationDepth >= 5 &&
    Math.random() < 0.3;

  return {
    systemPrompt: fullSystemPrompt,
    userHistory,
    conversationTail: conversationTail || '',
    metaphorLevel: memory.preferences.metaphorComfort,
    conversationMode,
    poetryLevel: style.poetryLevel,
    voice: selectedVoice,
    speed,
    bridgeLanguage,
    shouldWhisperQuote,
    archetype: currentArchetype,
    phase: currentPhase,
    conversationDepth: memory.conversationDepth,
    exchangeCount: memory.exchangeCount
  };
}

/**
 * Get bridge language for archetype transitions
 */
function getBridgeLanguage(from: Archetype, to: Archetype): string {
  const bridges: Record<string, string> = {
    'Fire_Water': 'Let me slow down with you...',
    'Water_Fire': 'I sense something wants to move now...',
    'Water_Earth': 'Let\'s ground this...',
    'Earth_Air': 'Let me step back and see the pattern...',
    'Air_Fire': 'That clarity wants to become action...',
    'Air_Earth': 'Time to make this tangible...',
    'Earth_Water': 'Feel into that...',
    'Fire_Earth': 'Let\'s build this...',
    'Aether_Water': 'Let me hold space for what\'s here...',
    'Water_Aether': 'There\'s something deeper underneath...'
  };

  const key = `${from}_${to}`;
  return bridges[key] || '';
}

/**
 * Enrich MAIA's response with soul touches
 * - Bridge language (if archetype shifted)
 * - Quote whisper (if conditions right)
 * - Continuity markers (symbolic threads)
 */
export function enrichResponse(
  rawResponse: string,
  memory: AINMemoryPayload,
  context: VoiceContext,
  userInput: string
): {
  enrichedText: string;
  quoteShared: any | null;
} {
  let enriched = rawResponse;

  // 1. Add bridge language if archetype shifted
  if (context.bridgeLanguage) {
    enriched = context.bridgeLanguage + ' ' + enriched;
  }

  // 2. Add continuity marker (reference symbolic thread)
  const recentThreads = getRecentSymbolicThreads(memory, 1);
  if (recentThreads.length > 0 && Math.random() < 0.2) {
    const thread = recentThreads[0];
    // Subtle reference (not forced)
    const threadPhrase = `(That ${thread.motif} image...)`;
    // Only add if it feels natural (TODO: better NLP integration)
  }

  // 3. Whisper quote if conditions right
  const { text: withQuote, quoteShared } = whisperQuote(
    enriched,
    memory,
    context.archetype,
    context.conversationDepth,
    userInput
  );

  return {
    enrichedText: withQuote,
    quoteShared
  };
}

/**
 * Complete voice generation pipeline
 * From memory + user input → styled, enriched, voice-ready response
 */
export async function generateVoiceResponse(
  memory: AINMemoryPayload,
  currentArchetype: Archetype,
  currentPhase: SpiralogicPhase,
  userInput: string,
  conversationTail: string,
  llmGenerate: (prompt: string, userInput: string) => Promise<string>
): Promise<{
  text: string;
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed: number;
  quoteShared: any | null;
  context: VoiceContext;
}> {
  // 1. Build voice context
  const context = buildVoiceContext(
    memory,
    currentArchetype,
    currentPhase,
    userInput,
    conversationTail
  );

  // 2. Generate response from LLM
  const rawResponse = await llmGenerate(context.systemPrompt, userInput);

  // 3. Enrich with soul touches
  const { enrichedText, quoteShared } = enrichResponse(
    rawResponse,
    memory,
    context,
    userInput
  );

  return {
    text: enrichedText,
    voice: context.voice,
    speed: context.speed,
    quoteShared,
    context
  };
}

/**
 * Extract conversation tail (last 30 seconds) for context
 * Used to maintain continuity in voice responses
 */
export function extractConversationTail(
  transcript: Array<{ text: string; isUser: boolean; timestamp: number }>,
  windowSeconds: number = 30
): string {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  const recentMessages = transcript.filter(msg => {
    return (now - msg.timestamp) <= windowMs;
  });

  return recentMessages
    .map(msg => `${msg.isUser ? 'User' : 'MAIA'}: ${msg.text}`)
    .join('\n');
}

/**
 * Example Usage in VoiceOrchestrator:
 *
 * const { text, voice, speed, quoteShared, context } = await generateVoiceResponse(
 *   memory,
 *   'Water',
 *   'Water',
 *   "I'm feeling overwhelmed",
 *   conversationTail,
 *   async (prompt, input) => {
 *     return await spiralogicProcess(prompt, input);
 *   }
 * );
 *
 * // Synthesize with appropriate voice + speed
 * const audio = await synthesize(text, voice, speed);
 *
 * // Update memory with quote if shared
 * if (quoteShared) {
 *   memory.quotesShared.push({
 *     quote: quoteShared.text,
 *     archetype: context.archetype,
 *     timestamp: new Date()
 *   });
 * }
 */

/**
 * Quick inference for real-time voice modulation
 * No LLM call, just style adjustment
 */
export function quickStyleInference(
  memory: AINMemoryPayload,
  archetype: Archetype,
  phase: SpiralogicPhase
): {
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed: number;
  poetryLevel: 'none' | 'light' | 'moderate' | 'high';
} {
  const style = styleForPhaseArchetype(archetype, phase);
  const voicePreference = {
    mode: 'auto' as const,
    enableTransitions: true
  };

  const selectedVoice = resolveVoice(archetype, voicePreference);
  const { speed } = formatVoiceForAPI(selectedVoice);

  return {
    voice: selectedVoice,
    speed,
    poetryLevel: style.poetryLevel
  };
}
