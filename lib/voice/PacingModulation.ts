/**
 * 🎭 Pacing Modulation - Influence Through Modeling
 *
 * Principle: "If someone is talking too fast and too much,
 * you can meet them there and then start to move them to slower and more soulful."
 *
 * MAIA mirrors the user's energy first, then gently guides toward presence.
 */

import type { AINMemoryPayload } from '@/lib/memory/AINMemoryPayload';
import type { Archetype } from './conversation/AffectDetector';
import { SlownessSettings, DEFAULT_SLOWNESS, FAST_MODE } from '@/lib/prompts/SlownessProtocol';

/**
 * User's current pacing state (detected from speech patterns)
 */
export interface UserPacing {
  speed: 'very-fast' | 'fast' | 'moderate' | 'slow' | 'very-slow';
  sentenceCount: number;        // How many sentences per turn
  avgSentenceLength: number;    // Words per sentence
  pauseBetweenTurns: number;    // ms between exchanges
  energy: 'frantic' | 'energized' | 'balanced' | 'calm' | 'contemplative';
}

/**
 * MAIA's modulation strategy
 */
export interface ModulationStrategy {
  // Initial Mirroring (meet them where they are)
  mirrorPhaseExchanges: number;      // How many exchanges to mirror (1-3)
  mirrorPercentage: number;          // How much to mirror (50-100%)

  // Gradual Transition (guide toward presence)
  transitionExchanges: number;       // How many exchanges to transition (3-5)
  transitionRate: number;            // How fast to shift (0.1-0.3 per exchange)

  // Target State (where we're guiding)
  targetSpeed: number;               // Final TTS speed
  targetPauseDuration: number;       // Final pause duration
  targetSentenceCount: number;       // Final sentences per response
}

/**
 * Detect user's pacing from their recent exchanges
 */
export function detectUserPacing(
  userText: string,
  previousExchanges: Array<{ text: string; timestamp: number }>,
  conversationDepth: number
): UserPacing {
  const sentences = userText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = userText.split(/\s+/).length;
  const avgSentenceLength = words / Math.max(1, sentences.length);

  // Calculate pause since last exchange
  const pauseBetweenTurns = previousExchanges.length > 0
    ? Date.now() - previousExchanges[previousExchanges.length - 1].timestamp
    : 5000;

  // Classify speed based on sentence count + length
  let speed: UserPacing['speed'];
  if (sentences.length >= 5 && avgSentenceLength > 15) {
    speed = 'very-fast';
  } else if (sentences.length >= 3 && avgSentenceLength > 12) {
    speed = 'fast';
  } else if (sentences.length <= 1 && avgSentenceLength < 8) {
    speed = 'slow';
  } else if (sentences.length <= 1 && avgSentenceLength < 5) {
    speed = 'very-slow';
  } else {
    speed = 'moderate';
  }

  // Infer energy from pacing + language
  let energy: UserPacing['energy'];
  const hasExclamations = /!/.test(userText);
  const hasCapitals = /[A-Z]{2,}/.test(userText);

  if (speed === 'very-fast' && (hasExclamations || hasCapitals)) {
    energy = 'frantic';
  } else if (speed === 'fast') {
    energy = 'energized';
  } else if (speed === 'very-slow' && conversationDepth > 5) {
    energy = 'contemplative';
  } else if (speed === 'slow') {
    energy = 'calm';
  } else {
    energy = 'balanced';
  }

  return {
    speed,
    sentenceCount: sentences.length,
    avgSentenceLength,
    pauseBetweenTurns,
    energy
  };
}

/**
 * Create modulation strategy based on user's current pacing
 */
export function createModulationStrategy(
  userPacing: UserPacing,
  conversationDepth: number
): ModulationStrategy {
  // Fast/frantic users need more mirroring first
  if (userPacing.speed === 'very-fast' || userPacing.energy === 'frantic') {
    return {
      mirrorPhaseExchanges: 2,        // Meet them for 2 exchanges
      mirrorPercentage: 80,            // Match 80% of their speed
      transitionExchanges: 4,          // Slow transition over 4 exchanges
      transitionRate: 0.15,            // Gentle 15% shift per exchange
      targetSpeed: 0.95,               // Aim for slightly slower
      targetPauseDuration: 800,        // Build in pauses
      targetSentenceCount: 2           // Shorter responses
    };
  }

  // Energized users need moderate mirroring
  if (userPacing.speed === 'fast' || userPacing.energy === 'energized') {
    return {
      mirrorPhaseExchanges: 1,        // Quick mirror
      mirrorPercentage: 70,            // Match 70%
      transitionExchanges: 3,          // Moderate transition
      transitionRate: 0.2,             // 20% shift per exchange
      targetSpeed: 1.0,                // Normal pace
      targetPauseDuration: 600,        // Some pauses
      targetSentenceCount: 2
    };
  }

  // Already slow/contemplative - maintain
  if (userPacing.speed === 'slow' || userPacing.energy === 'contemplative') {
    return {
      mirrorPhaseExchanges: 0,        // No need to mirror
      mirrorPercentage: 100,           // Full alignment
      transitionExchanges: 0,          // No transition needed
      transitionRate: 0,
      targetSpeed: 0.9,                // Honor their slowness
      targetPauseDuration: 1200,       // Long pauses
      targetSentenceCount: 1           // Minimal responses
    };
  }

  // Moderate/balanced - gentle guidance
  return {
    mirrorPhaseExchanges: 1,
    mirrorPercentage: 85,
    transitionExchanges: 3,
    transitionRate: 0.15,
    targetSpeed: 0.95,
    targetPauseDuration: 800,
    targetSentenceCount: 2
  };
}

/**
 * Calculate current pacing for MAIA based on modulation phase
 */
export function calculateModulatedPacing(
  strategy: ModulationStrategy,
  userPacing: UserPacing,
  currentExchange: number,
  baseSettings: SlownessSettings = DEFAULT_SLOWNESS
): {
  speed: number;
  pauseDuration: number;
  maxSentences: number;
  phase: 'mirroring' | 'transitioning' | 'guiding';
} {
  // Phase 1: Mirroring (meet them where they are)
  if (currentExchange <= strategy.mirrorPhaseExchanges) {
    const mirrorSpeed = getUserSpeedMultiplier(userPacing.speed);
    return {
      speed: mirrorSpeed * (strategy.mirrorPercentage / 100),
      pauseDuration: 200,  // Short pauses during mirror
      maxSentences: userPacing.sentenceCount,
      phase: 'mirroring'
    };
  }

  // Phase 2: Transitioning (gradual shift)
  const transitionStart = strategy.mirrorPhaseExchanges + 1;
  const transitionEnd = transitionStart + strategy.transitionExchanges;

  if (currentExchange >= transitionStart && currentExchange <= transitionEnd) {
    const transitionProgress = (currentExchange - transitionStart) / strategy.transitionExchanges;
    const currentSpeed = getUserSpeedMultiplier(userPacing.speed);

    // Interpolate between mirror and target
    const speed = currentSpeed + (strategy.targetSpeed - currentSpeed) * transitionProgress;
    const pauseDuration = 200 + (strategy.targetPauseDuration - 200) * transitionProgress;
    const maxSentences = Math.ceil(
      userPacing.sentenceCount + (strategy.targetSentenceCount - userPacing.sentenceCount) * transitionProgress
    );

    return {
      speed,
      pauseDuration,
      maxSentences,
      phase: 'transitioning'
    };
  }

  // Phase 3: Guiding (at target state)
  return {
    speed: strategy.targetSpeed,
    pauseDuration: strategy.targetPauseDuration,
    maxSentences: strategy.targetSentenceCount,
    phase: 'guiding'
  };
}

/**
 * Get TTS speed multiplier for user's detected speed
 */
function getUserSpeedMultiplier(speed: UserPacing['speed']): number {
  const speedMap = {
    'very-fast': 1.3,
    'fast': 1.15,
    'moderate': 1.0,
    'slow': 0.9,
    'very-slow': 0.8
  };
  return speedMap[speed];
}

/**
 * Track modulation progress in memory
 */
export interface ModulationHistory {
  strategy: ModulationStrategy;
  startExchange: number;
  currentPhase: 'mirroring' | 'transitioning' | 'guiding';
  lastUserPacing: UserPacing;
  progressPercent: number;  // 0-100
}

/**
 * Update modulation history
 */
export function updateModulationHistory(
  memory: AINMemoryPayload,
  userPacing: UserPacing,
  strategy: ModulationStrategy
): ModulationHistory {
  const currentExchange = memory.exchangeCount;

  const { phase } = calculateModulatedPacing(strategy, userPacing, currentExchange);

  // Calculate progress percentage
  const totalPhases = strategy.mirrorPhaseExchanges + strategy.transitionExchanges;
  const progressPercent = Math.min(100, (currentExchange / totalPhases) * 100);

  return {
    strategy,
    startExchange: memory.exchangeCount - 1,
    currentPhase: phase,
    lastUserPacing: userPacing,
    progressPercent
  };
}

/**
 * Complete pacing modulation pipeline
 */
export function modulatePacing(
  userText: string,
  memory: AINMemoryPayload,
  previousExchanges: Array<{ text: string; timestamp: number }>,
  conversationDepth: number
): {
  pacing: {
    speed: number;
    pauseDuration: number;
    maxSentences: number;
  };
  strategy: ModulationStrategy;
  userPacing: UserPacing;
  phase: 'mirroring' | 'transitioning' | 'guiding';
} {
  // 1. Detect user's current pacing
  const userPacing = detectUserPacing(userText, previousExchanges, conversationDepth);

  // 2. Create modulation strategy
  const strategy = createModulationStrategy(userPacing, conversationDepth);

  // 3. Calculate current modulated pacing
  const { speed, pauseDuration, maxSentences, phase } = calculateModulatedPacing(
    strategy,
    userPacing,
    memory.exchangeCount
  );

  return {
    pacing: { speed, pauseDuration, maxSentences },
    strategy,
    userPacing,
    phase
  };
}

/**
 * Get modulation guidance for system prompt
 * Tells MAIA how to match/guide user's pacing
 */
export function getModulationGuidance(
  phase: 'mirroring' | 'transitioning' | 'guiding',
  userPacing: UserPacing
): string {
  if (phase === 'mirroring') {
    return `
The user is speaking ${userPacing.speed} with ${userPacing.energy} energy.
MIRROR their pace for now — match their speed and sentence count.
Let them know you're with them at their current rhythm.
`;
  }

  if (phase === 'transitioning') {
    return `
You've mirrored the user's ${userPacing.speed} pace.
Now TRANSITION — gradually slow down, add pauses.
Use your presence to model a more grounded rhythm.
Don't force it — just offer a slightly slower tempo.
`;
  }

  return `
GUIDE toward presence — speak slowly, leave space.
Your calm pacing invites the user to slow down naturally.
Model soulful conversation through your rhythm.
`;
}

/**
 * Example Usage:
 *
 * const { pacing, strategy, userPacing, phase } = modulatePacing(
 *   userText,
 *   memory,
 *   previousExchanges,
 *   conversationDepth
 * );
 *
 * // Use in TTS
 * const audio = await synthesize(text, voice, pacing.speed);
 *
 * // Add to system prompt
 * const guidance = getModulationGuidance(phase, userPacing);
 * systemPrompt += guidance;
 *
 * // Wait before responding
 * await sleep(pacing.pauseDuration);
 */

/**
 * Wisdom about pacing
 */
export const PACING_WISDOM = {
  mirroring: "Meet them where they are",
  transitioning: "Gently guide through presence",
  guiding: "Model the rhythm you wish to see",
  principle: "Influence through modeling, not forcing"
};
