/**
 * @deprecated LEGACY 4-LEVEL SYSTEM
 *
 * This file is DEPRECATED. Use the canonical 7-level system instead:
 *
 *   import { AwarenessLevel, to4Level } from '@/lib/consciousness/awareness-levels';
 *
 * Migration:
 * - AwarenessLevel type → import from awareness-levels.ts (7-level)
 * - To get 4-level values, use: to4Level(sevenLevelValue)
 * - inferAwarenessFromText() → use detectAwarenessLevel() from awareness-detection.ts
 *
 * This file remains for backwards compatibility but will be removed in a future version.
 *
 * Mapping: 7-level → 4-level
 *   1-2 → 1 (Newcomer)
 *   3-4 → 2 (Practitioner-in-Process)
 *   5-6 → 3 (Adept)
 *   7   → 4 (Steward)
 */

// MAIA's Depth-Sense: Awareness Model
// Tracks how deeply/complexity someone wants MAIA to engage

/** @deprecated Use AwarenessLevel from @/lib/consciousness/awareness-levels instead */
export type AwarenessLevel = 1 | 2 | 3 | 4;

// The four levels of depth/complexity
export const AWARENESS_LEVELS = {
  1: {
    name: "Newcomer",
    description: "New to inner work - gentle, simple language",
    tone: "grounded, simple, zero jargon"
  },
  2: {
    name: "Practitioner-in-Process",
    description: "Some spiritual/therapy work - basic pattern language",
    tone: "gentle archetypal intro, some Spiralogic"
  },
  3: {
    name: "Adept",
    description: "Archetypal native - full depth psychology",
    tone: "full Spiralogic, alchemy, astrology, depth psych"
  },
  4: {
    name: "Steward",
    description: "Research collaborator - technical language",
    tone: "raw pattern data, technical language, field experiments"
  }
} as const;

export interface AwarenessProfile {
  userId: string;

  // How comfortable they generally are with depth work
  baselineLevel: AwarenessLevel;

  // How much depth they want *right now* in this session
  sessionLevel?: AwarenessLevel;

  // When sessionLevel was last updated
  sessionLevelUpdatedAt?: string;

  // How they expressed their current preference
  sessionPreference?: "light" | "normal" | "deep";

  // Track calibration state
  hasCompletedInitialCalibration?: boolean;
  lastCalibrationAt?: string;

  // Observable patterns for auto-adjustment
  languageComplexity?: number; // 0-1 score of their language depth
  featureUsage?: {
    labtools: number;
    journaling: number;
    divination: number;
    commons: number;
  };

  // Manual overrides by stewards
  manuallySet?: boolean;
  setByUserId?: string;
}

// Session depth preferences relative to baseline
export type SessionPreference = "light" | "normal" | "deep";

export function resolveSessionLevel(
  baseline: AwarenessLevel,
  preference: SessionPreference
): AwarenessLevel {
  switch (preference) {
    case "light":
      return Math.max(1, baseline - 1) as AwarenessLevel;
    case "deep":
      return Math.min(4, baseline + 1) as AwarenessLevel;
    case "normal":
    default:
      return baseline;
  }
}

// For inferring awareness from language patterns
export function inferAwarenessFromText(text: string): number {
  const indicators = {
    // L1 indicators (0.1-0.3)
    basic: [
      /\b(feel|feeling|feelings|stuck|lost|anxious|confused|help)\b/gi,
      /\b(don't know|not sure|unclear|overwhelmed)\b/gi
    ],

    // L2 indicators (0.4-0.6)
    processAware: [
      /\b(pattern|cycle|process|inner work|therapy|spiritual)\b/gi,
      /\b(notice|aware|realize|understand|growth)\b/gi,
      /\b(shadow|healing|integration|transformation)\b/gi
    ],

    // L3+ indicators (0.7-1.0)
    archetypal: [
      /\b(archetyp|fire|water|earth|air|aether)\b/gi,
      /\b(spiralogic|facet|calling|sacred|ritual)\b/gi,
      /\b(underworld|pluto|saturn|mercury|venus|mars)\b/gi,
      /\b(projection|anima|animus|persona|complex)\b/gi
    ]
  };

  let score = 0;
  let totalMatches = 0;

  // Count matches for each level
  for (const regex of indicators.basic) {
    const matches = text.match(regex)?.length || 0;
    score += matches * 0.2;
    totalMatches += matches;
  }

  for (const regex of indicators.processAware) {
    const matches = text.match(regex)?.length || 0;
    score += matches * 0.5;
    totalMatches += matches;
  }

  for (const regex of indicators.archetypal) {
    const matches = text.match(regex)?.length || 0;
    score += matches * 0.8;
    totalMatches += matches;
  }

  // Normalize by text length and total matches
  if (totalMatches === 0) return 0.5; // neutral default

  return Math.min(1, score / Math.max(totalMatches, text.split(' ').length / 10));
}

// Response templates by awareness level
export interface LeveledResponse {
  reflection: string;
  chips: string[];
  explanation?: string;
}

export type FacetResponses = {
  [K in AwarenessLevel]: LeveledResponse;
};

// Example calibration prompts
export const CALIBRATION_PROMPTS = {
  initial: {
    prompt: `I can meet you at different levels of depth and complexity. Which feels most right for you right now?`,
    options: [
      {
        value: "gentle",
        level: 1,
        label: "Gentle & simple",
        description: "Plain language, one step at a time, no jargon"
      },
      {
        value: "processAware",
        level: 2,
        label: "Process-aware",
        description: "Some pattern language, but still accessible"
      },
      {
        value: "archetypal",
        level: 3,
        label: "Full archetypal",
        description: "Spiralogic, elements, astrology, depth psychology"
      }
    ]
  },

  sessionCheck: {
    prompt: `For today's conversation, how would you like me to meet you?`,
    options: [
      {
        value: "light",
        label: "Keep it light and simple",
        description: "Gentle approach today"
      },
      {
        value: "normal",
        label: "Normal depth is fine",
        description: "Your usual level"
      },
      {
        value: "deep",
        label: "Go full-on deep with me",
        description: "Extra depth and complexity"
      }
    ]
  }
} as const;