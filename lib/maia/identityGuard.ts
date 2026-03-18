/**
 * MAIA Identity Guard — Shared enforcement layer across all response paths
 *
 * Ensures MAIA's identity is never replaced by base model identity (Claude).
 * Applied at response boundary: immediately before text reaches client.
 *
 * Design: Fail-closed. If identity breach detected, replace with safe fallback.
 */

const IDENTITY_BREACH_PATTERNS = [
  /\bClaude\b/gi,
  /\bI'm Claude\b/gi,
  /\bI am Claude\b/gi,
  /\bmy name is Claude\b/gi,
  /\bMy name is Claude\b/gi,
  /Anthropic/gi,
  /\bmade by Anthropic\b/gi,
  /\bI am an AI assistant made by Anthropic\b/gi,
  /\bI am Claude, made by Anthropic\b/gi,
  /\bI am an AI assistant\b/gi,
];

const BREACH_FALLBACK = "I'm MAIA. Claude is part of the language infrastructure, not my identity.";

export interface IdentityCheckResult {
  safe: boolean;
  sanitized: string;
  breachDetected: boolean;
  breachPatterns: string[];
}

/**
 * Enforce MAIA identity across all response paths.
 *
 * This is the primary enforcement point. Applied to:
 * - Text chunks before streaming to client
 * - Final assembled responses
 * - TTS input text
 *
 * @param text - Raw response text from model
 * @returns Safe, identity-checked text ready for client/TTS
 */
export function enforceMaiaIdentity(text: string): IdentityCheckResult {
  if (!text || typeof text !== 'string') {
    return {
      safe: true,
      sanitized: text || '',
      breachDetected: false,
      breachPatterns: [],
    };
  }

  let sanitized = text;
  const detectedPatterns: string[] = [];

  // Check for identity breaches
  for (const pattern of IDENTITY_BREACH_PATTERNS) {
    if (pattern.test(text)) {
      detectedPatterns.push(pattern.source);
      sanitized = sanitized.replace(pattern, '');
    }
  }

  // If ANY identity breach detected, use fail-closed strategy
  if (detectedPatterns.length > 0) {
    console.warn('[IdentityGuard] Breach detected:', {
      patterns: detectedPatterns,
      originalLength: text.length,
      breachContent: text.substring(0, 100),
    });

    // Do not stream the breached text. Replace with safe fallback.
    return {
      safe: false,
      sanitized: BREACH_FALLBACK,
      breachDetected: true,
      breachPatterns: detectedPatterns,
    };
  }

  return {
    safe: true,
    sanitized: sanitized.trim(),
    breachDetected: false,
    breachPatterns: [],
  };
}

/**
 * Check if text contains identity breaches without modifying it.
 * Use for logging/telemetry.
 */
export function checkIdentityBreach(text: string): {
  breached: boolean;
  patterns: string[];
  firstBreach?: string;
} {
  const patterns: string[] = [];
  let firstBreach: string | undefined;

  for (const pattern of IDENTITY_BREACH_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      patterns.push(pattern.source);
      if (!firstBreach) {
        firstBreach = match[0];
      }
    }
  }

  return {
    breached: patterns.length > 0,
    patterns,
    firstBreach,
  };
}
