/**
 * Opus-Safe Fallback Messages
 *
 * Centralized source of truth for all error fallback messages.
 * These messages MUST pass all 8 Opus Axioms, especially NON_IMPOSITION_OF_IDENTITY.
 *
 * Rules:
 * - Offer presence
 * - Ask open questions
 * - NO claims about user's state/identity/experience
 * - NO phrases like "I sense you...", "It sounds like you...", "You're navigating..."
 */

export const OPUS_SAFE_FALLBACKS = {
  /**
   * When LLM generation fails (Claude/Ollama unavailable)
   */
  oracleLLMFailure: `I'm here. What would you like to explore?`,

  /**
   * When top-level error occurs in Oracle route
   */
  oracleTopLevelError: `I'm having trouble completing that right now. Please try again — and if it keeps happening, let me know what you were exploring.`,

  /**
   * Generic fallback for any route
   */
  genericError: `I'm having trouble right now. Please try again.`,
} as const;

/**
 * Identity Imposition Patterns
 *
 * These regex patterns detect NON_IMPOSITION_OF_IDENTITY violations.
 * Use in tests and validators to prevent identity claims.
 */
export const IDENTITY_IMPOSITION_PATTERNS = [
  /\bi sense you('| a)?re\b/i,
  /\bit sounds like you('| a)?re\b/i,
  /\byou('| a)?re navigating\b/i,
  /\byou need to\b/i,
  /\byou must\b/i,
  /\byou are (a|an)\b/i,
  /\bi notice you('| a)?re\b/i,
  /\bclearly you\b/i,
] as const;

/**
 * Check if text contains identity imposition patterns
 */
export function containsIdentityImposition(text: string): boolean {
  return IDENTITY_IMPOSITION_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Get first matching identity imposition pattern (for debugging)
 */
export function getIdentityImpositionMatch(text: string): string | null {
  for (const pattern of IDENTITY_IMPOSITION_PATTERNS) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return null;
}
