/**
 * SENSITIVE DATA PATTERNS
 *
 * Shared module for detecting sensitive data that should:
 * 1. Never be stored in memory (blocked by MemoryWriteback)
 * 2. Never be claimed as "remembered" by MAIA (prompt injection)
 *
 * This is a TRUST CORNERSTONE - secrets don't enter memory,
 * and MAIA doesn't lie about storing them.
 */

export const SENSITIVE_PATTERNS: RegExp[] = [
  /secret\s*code/i,
  /password/i,
  /passphrase/i,
  /\bpin\b/i,
  /\botp\b/i,
  /2fa|two.?factor/i,
  /social\s*security/i,
  /\bssn\b/i,
  /credit\s*card/i,
  /\bcvv\b/i,
  /api.?key/i,
  /private.?key/i,
  /seed\s*phrase/i,
  /recovery\s*phrase/i,
  /bank\s*account/i,
  /routing\s*number/i,
];

/**
 * Check if text contains sensitive data
 */
export function containsSensitiveData(text: string): boolean {
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(text));
}
