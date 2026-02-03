/**
 * Beta Mode Configuration
 *
 * Controls security features during beta testing.
 * Flip BETA_MODE to false when beta ends to enable full security.
 */

// ============================================================
// FLIP THIS TO FALSE WHEN BETA TESTING ENDS
// ============================================================
export const BETA_MODE = true;
// ============================================================

/**
 * Beta mode settings - these are automatically derived from BETA_MODE
 */
export const betaConfig = {
  // During beta: simplified registration without barriers
  // After beta: full security enforcement

  /** Whether email is required for registration */
  requireEmail: !BETA_MODE,

  /** Whether email verification is enforced before access */
  requireEmailVerification: !BETA_MODE,

  /** Whether passkey must be validated against database */
  requirePasskeyValidation: !BETA_MODE,

  /** Whether password strength requirements are enforced */
  enforceStrongPassword: !BETA_MODE,

  /** Minimum password length (relaxed during beta) */
  minPasswordLength: BETA_MODE ? 4 : 8,

  /** Whether to show the sync account prompt to local users */
  showSyncPrompt: true, // Always show during beta

  /** Delay before showing sync prompt (ms) */
  syncPromptDelay: BETA_MODE ? 3000 : 10000,
} as const;

/**
 * Password validation
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < betaConfig.minPasswordLength) {
    return {
      valid: false,
      error: `Password must be at least ${betaConfig.minPasswordLength} characters`
    };
  }

  if (betaConfig.enforceStrongPassword) {
    // After beta: require complexity
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUppercase || !hasLowercase || !hasNumber) {
      return {
        valid: false,
        error: 'Password must contain uppercase, lowercase, and a number'
      };
    }
  }

  return { valid: true };
}

/**
 * Email validation
 */
export function validateEmail(email: string | undefined): { valid: boolean; error?: string } {
  if (betaConfig.requireEmail && !email) {
    return { valid: false, error: 'Email is required' };
  }

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Invalid email format' };
    }
  }

  return { valid: true };
}
