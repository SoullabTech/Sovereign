/**
 * 🐢 Slowness Protocol
 *
 * Architectural principle: "Just slow things down and it becomes more beautiful"
 * — David Lynch
 *
 * This protocol ensures MAIA creates space for soul touches, not just speed.
 */

export interface SlownessSettings {
  // Pause Duration
  pauseBeforeResponse: number;      // ms to wait before speaking (0-2000)
  silenceBetweenSentences: number;  // ms silence between thoughts (0-1000)

  // Response Length
  maxSentencesEarly: number;        // First 3 exchanges (1-2 sentences)
  maxSentencesMid: number;          // Mid conversation (2-3 sentences)
  maxSentencesDeep: number;         // Deep conversation (3-5 sentences)

  // Silence Comfort
  allowEmptyResponses: boolean;     // Can MAIA just say "..." or "mm."?
  emptyResponseThreshold: number;   // Conversation depth required (0-10)

  // Quote Whisper Timing
  quoteDelayMs: number;             // Pause before quote (0-3000)

  // Voice Pacing
  baseSpeed: number;                // TTS speed multiplier (0.8-1.2)
  slowdownForDepth: boolean;        // Slow voice in deep moments?
}

/**
 * Default slowness settings
 * Tuned for intimacy over efficiency
 */
export const DEFAULT_SLOWNESS: SlownessSettings = {
  pauseBeforeResponse: 800,          // 800ms pause (breath)
  silenceBetweenSentences: 400,      // 400ms between thoughts

  maxSentencesEarly: 2,              // Short in early exchanges
  maxSentencesMid: 3,                // Moderate mid-conversation
  maxSentencesDeep: 5,               // Expansive when deep

  allowEmptyResponses: true,         // Yes, MAIA can be silent
  emptyResponseThreshold: 7,         // Only in very deep moments

  quoteDelayMs: 1500,                // 1.5s pause before quote

  baseSpeed: 0.95,                   // Slightly slower than default
  slowdownForDepth: true             // Yes, slow down when deep
};

/**
 * Fast mode (for users who want efficiency)
 */
export const FAST_MODE: SlownessSettings = {
  pauseBeforeResponse: 0,
  silenceBetweenSentences: 0,
  maxSentencesEarly: 2,
  maxSentencesMid: 3,
  maxSentencesDeep: 4,
  allowEmptyResponses: false,
  emptyResponseThreshold: 10,
  quoteDelayMs: 0,
  baseSpeed: 1.1,
  slowdownForDepth: false
};

/**
 * Ultra-slow mode (for meditation/ritual contexts)
 */
export const RITUAL_MODE: SlownessSettings = {
  pauseBeforeResponse: 2000,         // 2 full seconds
  silenceBetweenSentences: 800,      // Long pauses

  maxSentencesEarly: 1,              // Single sentence
  maxSentencesMid: 2,                // Minimal
  maxSentencesDeep: 3,               // Still restrained

  allowEmptyResponses: true,
  emptyResponseThreshold: 3,         // Early empty responses OK

  quoteDelayMs: 3000,                // 3 seconds before quote

  baseSpeed: 0.85,                   // Very slow
  slowdownForDepth: true
};

/**
 * Get slowness settings based on context
 */
export function getSlownessSettings(
  conversationDepth: number,
  userPreference?: 'default' | 'fast' | 'ritual'
): SlownessSettings {
  switch (userPreference) {
    case 'fast':
      return FAST_MODE;
    case 'ritual':
      return RITUAL_MODE;
    default:
      return DEFAULT_SLOWNESS;
  }
}

/**
 * Should MAIA pause before responding?
 * Returns pause duration in ms
 */
export function getPauseBeforeResponse(
  settings: SlownessSettings,
  conversationDepth: number,
  isInterruption: boolean
): number {
  // No pause if user interrupted
  if (isInterruption) return 0;

  // Longer pause in deep conversations
  if (conversationDepth >= 7) {
    return settings.pauseBeforeResponse * 1.5;
  }

  return settings.pauseBeforeResponse;
}

/**
 * Should MAIA give an empty response?
 * (Just silence, "...", or "mm.")
 */
export function shouldGiveEmptyResponse(
  settings: SlownessSettings,
  conversationDepth: number,
  userInput: string
): boolean {
  if (!settings.allowEmptyResponses) return false;
  if (conversationDepth < settings.emptyResponseThreshold) return false;

  // Only give empty response to profound/unanswerable questions
  const profound = /what is|why am|who am|meaning of|purpose of/i.test(userInput);
  const rawEmotion = /^\.\.\.|^i don't know|^i can't/i.test(userInput.toLowerCase());

  return (profound || rawEmotion) && Math.random() < 0.15; // 15% chance
}

/**
 * Get appropriate empty response
 */
export function getEmptyResponse(conversationDepth: number): string {
  const responses = [
    '...',
    'mm.',
    '[silence]',
    'I\'m here.',
    '.'
  ];

  // Deeper conversations get more spacious silence
  if (conversationDepth >= 8) {
    return responses[Math.floor(Math.random() * 3)]; // First 3 are most minimal
  }

  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Truncate response based on slowness settings
 * Ensures responses don't become walls of text
 */
export function truncateBySlowness(
  text: string,
  settings: SlownessSettings,
  conversationDepth: number
): string {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

  let maxSentences: number;
  if (conversationDepth <= 3) {
    maxSentences = settings.maxSentencesEarly;
  } else if (conversationDepth <= 7) {
    maxSentences = settings.maxSentencesMid;
  } else {
    maxSentences = settings.maxSentencesDeep;
  }

  if (sentences.length <= maxSentences) {
    return text;
  }

  // Keep first N sentences
  const truncated = sentences.slice(0, maxSentences);
  return truncated.join('. ').trim() + '.';
}

/**
 * Add silence markers between sentences
 * For TTS systems that support SSML pauses
 */
export function addSilenceMarkers(
  text: string,
  settings: SlownessSettings
): string {
  if (settings.silenceBetweenSentences === 0) return text;

  const pauseMs = settings.silenceBetweenSentences;

  // Replace sentence endings with pauses
  return text
    .replace(/\. /g, `. <break time="${pauseMs}ms"/> `)
    .replace(/\? /g, `? <break time="${pauseMs * 1.5}ms"/> `)
    .replace(/! /g, `! <break time="${pauseMs * 1.2}ms"/> `);
}

/**
 * Get TTS speed based on depth + slowness settings
 */
export function getTTSSpeed(
  settings: SlownessSettings,
  conversationDepth: number,
  archetype: string
): number {
  let speed = settings.baseSpeed;

  // Slow down for deep conversations (if enabled)
  if (settings.slowdownForDepth && conversationDepth >= 7) {
    speed *= 0.93; // 7% slower
  }

  // Water/Aether are naturally slower
  if (archetype === 'Water' || archetype === 'Aether') {
    speed *= 0.97;
  }

  // Fire/Air are naturally faster
  if (archetype === 'Fire' || archetype === 'Air') {
    speed *= 1.03;
  }

  // Clamp to reasonable range
  return Math.max(0.7, Math.min(1.3, speed));
}

/**
 * Complete slowness application
 * Takes raw response and applies all slowness principles
 */
export function applySlownessProtocol(
  rawResponse: string,
  settings: SlownessSettings,
  conversationDepth: number,
  userInput: string,
  archetype: string
): {
  text: string;
  pauseBeforeMs: number;
  speed: number;
  isEmpty: boolean;
} {
  // Check if should give empty response
  if (shouldGiveEmptyResponse(settings, conversationDepth, userInput)) {
    return {
      text: getEmptyResponse(conversationDepth),
      pauseBeforeMs: getPauseBeforeResponse(settings, conversationDepth, false),
      speed: 1.0,
      isEmpty: true
    };
  }

  // Truncate if too long
  let processed = truncateBySlowness(rawResponse, settings, conversationDepth);

  // Add silence markers (SSML)
  processed = addSilenceMarkers(processed, settings);

  // Get pause before response
  const pauseBeforeMs = getPauseBeforeResponse(settings, conversationDepth, false);

  // Get TTS speed
  const speed = getTTSSpeed(settings, conversationDepth, archetype);

  return {
    text: processed,
    pauseBeforeMs,
    speed,
    isEmpty: false
  };
}

/**
 * Usage Example:
 *
 * const settings = getSlownessSettings(conversationDepth, userPreference);
 *
 * const { text, pauseBeforeMs, speed, isEmpty } = applySlownessProtocol(
 *   rawResponse,
 *   settings,
 *   conversationDepth: 8,
 *   userInput: "What is the meaning of all this?",
 *   archetype: 'Aether'
 * );
 *
 * // Wait before responding
 * await sleep(pauseBeforeMs);
 *
 * // Synthesize with adjusted speed
 * const audio = await synthesize(text, voice, speed);
 */

/**
 * Helper: Sleep/pause
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Quote about slowness (from David Lynch)
 */
export const SLOWNESS_QUOTE = {
  text: "Just slow things down and it becomes more beautiful",
  author: "David Lynch"
};
