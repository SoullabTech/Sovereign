/**
 * Threshold - Voice Fast-Path Module
 *
 * Pre-LLM routing for fragile, precategorical, and minimal inputs.
 * Designed to reduce time-to-first-audio by skipping Claude entirely
 * when a simple, present response is appropriate.
 *
 * Key principle: Threshold responses should feel like presence, not processing.
 *
 * ARCHITECTURE (Tiered):
 * - Tier 1: Ultra-fast regex patterns for minimal inputs (hmm, ..., idk)
 * - Tier 2: Crowder/McGilchrist felt-sense detection (via maia-threshold.ts)
 * If Tier 1 doesn't trigger, Tier 2 is checked before passing to LLM.
 */

import { routeThreshold } from './maia-threshold';
import { createMAIAThresholdState } from './schemas';

export type ThresholdResponseType =
  | 'THRESHOLD_HOLD'    // Pure presence - minimal sound/phrase
  | 'THRESHOLD_INVITE'  // Gentle invitation to continue
  | 'THRESHOLD_PASS';   // Pass through to full LLM

export interface ThresholdState {
  consecutiveMinimal: number;      // Count of minimal inputs in a row
  lastInputLength: number;         // Character count of last input
  emotionalIntensity: number;      // Detected emotional charge (0-1)
  silenceDuration?: number;        // If preceded by long silence (ms)
  sessionTurnCount: number;        // Turns in this session
}

export interface ThresholdConfig {
  // Trigger thresholds
  minimalInputMaxLength: number;   // Inputs shorter than this are "minimal"
  emotionalKeywords: string[];     // Words that suggest fragility
  holdPatterns: RegExp[];          // Patterns that trigger HOLD
  invitePatterns: RegExp[];        // Patterns that trigger INVITE

  // Response pools
  holdResponses: string[];         // Short presence phrases
  inviteResponses: string[];       // Gentle continuation invitations

  // Tuning
  maxConsecutiveHolds: number;     // After this many HOLDs, escalate to INVITE
  passAfterInvites: number;        // After this many INVITEs, pass to LLM
}

export interface ThresholdInput {
  text: string;
  state: ThresholdState;
  config: ThresholdConfig;
}

export interface ThresholdResult {
  response: {
    type: ThresholdResponseType;
    content: string;
  } | null;
  state: ThresholdState;
  skipLLM: boolean;
}

// Default configuration for MAIA
export const DEFAULT_MAIA_THRESHOLD_CONFIG: ThresholdConfig = {
  minimalInputMaxLength: 20,

  emotionalKeywords: [
    'scared', 'afraid', 'anxious', 'panic', 'help',
    'sad', 'crying', 'tears', 'hurt', 'pain',
    'angry', 'frustrated', 'mad', 'furious',
    'confused', 'lost', 'stuck', 'frozen',
    'overwhelmed', 'too much', 'can\'t',
    'i don\'t know', 'idk', 'dunno',
  ],

  // Patterns that suggest the person just needs presence
  holdPatterns: [
    /^\.+$/,                        // Just dots
    /^-+$/,                         // Just dashes
    /^(um+|uh+|hmm+|mm+|ah+)$/i,   // Filler sounds
    /^(yeah|yea|ya|yes|ok|okay|k)$/i,  // Minimal affirmatives
    /^(no|nah|nope)$/i,            // Minimal negatives
    /^\*?(sigh|sighs|exhale)\*?$/i, // Sighs
    /^\*?(pause|pauses|silence)\*?$/i, // Noted pauses
  ],

  // Patterns that suggest they need a gentle invitation
  invitePatterns: [
    /^i\s*(don'?t|dont)\s*know\.?$/i,
    /^idk\.?$/i,
    /^(nothing|nevermind|nvm)\.?$/i,
    /^(it'?s\s*)?(hard|difficult|tough)\.?$/i,
    /^(i\s*)?(can'?t|cant)\.?$/i,
    /^\?\??\??$/,                    // Just question marks
  ],

  // Short presence responses - minimal, warm
  holdResponses: [
    "I'm here.",
    "I hear you.",
    "Take your time.",
    "Mm.",
    "I'm with you.",
  ],

  // Gentle invitations - slightly more opening
  inviteResponses: [
    "What's there?",
    "What comes up?",
    "Say more?",
    "What feels true right now?",
    "Where are you?",
  ],

  maxConsecutiveHolds: 3,
  passAfterInvites: 2,
};

/**
 * Create initial threshold state for a new session
 */
export function createInitialThresholdState(): ThresholdState {
  return {
    consecutiveMinimal: 0,
    lastInputLength: 0,
    emotionalIntensity: 0,
    sessionTurnCount: 0,
  };
}

/**
 * Detect emotional intensity in input (0-1)
 */
function detectEmotionalIntensity(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  let intensity = 0;

  // Check for emotional keywords
  for (const keyword of keywords) {
    if (lower.includes(keyword)) {
      intensity += 0.2;
    }
  }

  // Check for ALL CAPS (raised voice)
  const capsRatio = (text.match(/[A-Z]/g) || []).length / Math.max(text.length, 1);
  if (capsRatio > 0.5 && text.length > 5) {
    intensity += 0.3;
  }

  // Check for repeated punctuation (emphasis)
  if (/[!?]{2,}/.test(text)) {
    intensity += 0.2;
  }

  return Math.min(intensity, 1);
}

/**
 * Check if input matches any patterns in a list
 */
function matchesAnyPattern(text: string, patterns: RegExp[]): boolean {
  const trimmed = text.trim();
  return patterns.some(pattern => pattern.test(trimmed));
}

/**
 * Pick a random response from a pool
 */
function pickResponse(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Main threshold processing function
 *
 * Returns a fast response if appropriate, or null to pass through to LLM
 */
export function processThreshold(input: ThresholdInput): ThresholdResult {
  const { text, state, config } = input;
  const trimmedText = text.trim();

  // Update state
  const newState: ThresholdState = {
    ...state,
    lastInputLength: trimmedText.length,
    emotionalIntensity: detectEmotionalIntensity(trimmedText, config.emotionalKeywords),
    sessionTurnCount: state.sessionTurnCount + 1,
  };

  // If high emotional intensity, always pass to LLM for full processing
  if (newState.emotionalIntensity > 0.5) {
    newState.consecutiveMinimal = 0;
    return {
      response: null,
      state: newState,
      skipLLM: false,
    };
  }

  // Check for HOLD patterns (pure presence)
  if (matchesAnyPattern(trimmedText, config.holdPatterns)) {
    newState.consecutiveMinimal++;

    // After too many consecutive HOLDs, escalate to INVITE
    if (newState.consecutiveMinimal > config.maxConsecutiveHolds) {
      return {
        response: {
          type: 'THRESHOLD_INVITE',
          content: pickResponse(config.inviteResponses),
        },
        state: newState,
        skipLLM: true,
      };
    }

    return {
      response: {
        type: 'THRESHOLD_HOLD',
        content: pickResponse(config.holdResponses),
      },
      state: newState,
      skipLLM: true,
    };
  }

  // Check for INVITE patterns (gentle opening)
  if (matchesAnyPattern(trimmedText, config.invitePatterns)) {
    newState.consecutiveMinimal++;

    // After repeated invites with no substantive input, pass to LLM
    if (newState.consecutiveMinimal > config.passAfterInvites + config.maxConsecutiveHolds) {
      newState.consecutiveMinimal = 0;
      return {
        response: null,
        state: newState,
        skipLLM: false,
      };
    }

    return {
      response: {
        type: 'THRESHOLD_INVITE',
        content: pickResponse(config.inviteResponses),
      },
      state: newState,
      skipLLM: true,
    };
  }

  // Greetings always go to LLM — "hi Maya" (8 chars) must not get "Mm." as response
  const greetingPattern = /^(hi|hey|hello|good\s+(morning|afternoon|evening|night)|hiya|howdy|morning|afternoon|evening)(\s+\w+)*[!.?]?$/i;
  if (greetingPattern.test(trimmedText)) {
    newState.consecutiveMinimal = 0;
    return { response: null, state: newState, skipLLM: false };
  }

  // Check for minimal input by length (but not matching specific patterns)
  if (trimmedText.length <= config.minimalInputMaxLength) {
    // Very short input that's not a pattern - could be partial thought
    // Only hold if it's really minimal (< 10 chars)
    if (trimmedText.length < 10) {
      newState.consecutiveMinimal++;
      return {
        response: {
          type: 'THRESHOLD_HOLD',
          content: pickResponse(config.holdResponses),
        },
        state: newState,
        skipLLM: true,
      };
    }
  }

  // ============ TIER 2: Crowder/McGilchrist felt-sense detection ============
  // Tier 1 didn't trigger - check for richer felt-sense patterns
  // This catches inputs like "I don't know what this is. Something is there."
  const tier2Result = routeThreshold(trimmedText, null);

  if (tier2Result.useThreshold && tier2Result.response) {
    // Map MAIAThresholdResponse to legacy ThresholdResult format
    const responseType: ThresholdResponseType =
      tier2Result.response.type === 'HOLD' ? 'THRESHOLD_HOLD' :
      tier2Result.response.type === 'INVITE' ? 'THRESHOLD_INVITE' :
      'THRESHOLD_PASS';

    newState.consecutiveMinimal++;
    return {
      response: {
        type: responseType,
        content: tier2Result.response.text,
      },
      state: newState,
      skipLLM: true,
    };
  }

  // Reset consecutive counter and pass to LLM
  newState.consecutiveMinimal = 0;
  return {
    response: null,
    state: newState,
    skipLLM: false,
  };
}

/**
 * Timing utility for voice pipeline instrumentation
 */
export function createVoiceTimer() {
  const t0 = Date.now();
  const marks: { label: string; time: number }[] = [];

  return {
    mark(label: string) {
      const elapsed = Date.now() - t0;
      marks.push({ label, time: elapsed });
      console.log(`[voice] ${label} +${elapsed}ms`);
    },

    getMarks() {
      return marks;
    },

    summary() {
      return marks.map(m => `${m.label}:${m.time}ms`).join(' | ');
    },

    /**
     * Time to specific mark
     */
    timeTo(label: string): number | null {
      const mark = marks.find(m => m.label === label);
      return mark ? mark.time : null;
    }
  };
}
