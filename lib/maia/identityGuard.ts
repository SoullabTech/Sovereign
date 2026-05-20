/**
 * MAIA Identity Guard — Shared enforcement layer across all response paths
 *
 * Ensures MAIA's identity is never replaced by base model identity (Claude).
 * Applied at response boundary: immediately before text reaches client.
 *
 * Design: Fail-closed. If identity breach detected, replace with safe fallback.
 */

// Narrowed 2026-05-20: prior patterns matched ANY mention of "Claude" or
// "Anthropic" and replaced the entire response with BREACH_FALLBACK, which
// blocked honest architectural discussion (e.g., "Claude is the language
// infrastructure" got replaced with the canned line, breaking the text
// channel's ability to acknowledge substrate truthfully).
//
// These patterns now match ONLY actual identity-claim breaches:
//   - "I'm Claude" / "I am Claude"      → self-identification as Claude
//   - "my name is Claude"               → self-identification as Claude
//   - "I am an AI assistant"            → generic AI-assistant identity claim
//   - "I am/was made by Anthropic"      → identity attribution to Anthropic
//   - "I am Claude, made by Anthropic"  → full Claude introduction
//
// Bare mentions of "Claude" or "Anthropic" in factual/architectural context
// pass through. The canned fallback fires only on real identity-claim
// attempts, not on legitimate substrate discussion.
//
// See docs/orientation/maia-sovereign-runtime-intelligence-audit.md and
// FOUR_LAYER_SUBSTITUTION for the autoimmunity pattern this narrowing
// addresses: anti-capture mechanisms can themselves become capture.
const IDENTITY_BREACH_PATTERNS = [
  // Self-identification as Claude
  /\bI'?m\s+Claude\b/gi,
  /\bI\s+am\s+Claude\b/gi,
  /\bmy\s+name\s+is\s+Claude\b/gi,
  // Generic AI-assistant identity claim
  /\bI\s+am\s+an?\s+AI\s+assistant\b/gi,
  // Identity attribution to Anthropic (requires "I" prefix to avoid
  // blocking factual "Claude is made by Anthropic")
  /\bI\s+(?:am|was)\s+made\s+by\s+Anthropic\b/gi,
  // Full Claude introduction line
  /\bI\s+am\s+Claude,?\s+made\s+by\s+Anthropic\b/gi,
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
