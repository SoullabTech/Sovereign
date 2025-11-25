/**
 * Voice Feature Flags
 *
 * Controls rollout of new WebRTC-based voice architecture.
 * Allows A/B testing and instant rollback if issues arise.
 *
 * Environment variables (set in .env.local or Vercel dashboard):
 * - NEXT_PUBLIC_USE_PARALLEL_VOICE: Enable new WebRTC architecture
 * - NEXT_PUBLIC_SHOW_VOICE_METRICS: Show performance metrics panel
 * - NEXT_PUBLIC_SHOW_MODE_SWITCHER: Show Scribe/Active/Full mode UI
 */

export const VOICE_FEATURE_FLAGS = {
  // Use new parallel voice architecture
  USE_PARALLEL_VOICE: process.env.NEXT_PUBLIC_USE_PARALLEL_VOICE === 'true',

  // Enable performance metrics display
  SHOW_VOICE_METRICS: process.env.NEXT_PUBLIC_SHOW_VOICE_METRICS === 'true',

  // Enable mode switching UI
  SHOW_MODE_SWITCHER: process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER === 'true',

  // Enable debug logging
  DEBUG_VOICE: process.env.NEXT_PUBLIC_DEBUG_VOICE === 'true',
};

/**
 * Helper to check if user is in beta group for new voice
 *
 * A/B testing strategy:
 * - 10% of users get new voice based on deterministic hash
 * - Specific user IDs can be allowlisted
 * - Can be overridden by feature flag
 *
 * @param userId - User ID to check
 * @returns true if user should get new voice system
 */
export function isInVoiceBeta(userId?: string): boolean {
  // Feature flag overrides everything
  if (VOICE_FEATURE_FLAGS.USE_PARALLEL_VOICE) {
    return true;
  }

  if (!userId) {
    return false;
  }

  // Allowlist specific users for testing
  const VOICE_BETA_ALLOWLIST = [
    // Add specific user IDs here for testing
    // 'user-123',
    // 'user-456',
  ];

  if (VOICE_BETA_ALLOWLIST.includes(userId)) {
    return true;
  }

  // A/B test: 10% of users based on deterministic hash
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const inBeta = hash % 10 === 0;

  if (inBeta && VOICE_FEATURE_FLAGS.DEBUG_VOICE) {
    console.log(`[VOICE_BETA] User ${userId} assigned to new voice (hash: ${hash})`);
  }

  return inBeta;
}

/**
 * Helper to get voice system version string
 */
export function getVoiceSystemVersion(): string {
  return VOICE_FEATURE_FLAGS.USE_PARALLEL_VOICE
    ? 'WebRTC (Parallel)'
    : 'Legacy (Sequential)';
}

/**
 * Log feature flag status (for debugging)
 */
export function logVoiceFeatureFlags(): void {
  if (typeof window === 'undefined') return;

  console.log('🎤 [VOICE_FEATURE_FLAGS]', {
    useParallelVoice: VOICE_FEATURE_FLAGS.USE_PARALLEL_VOICE,
    showMetrics: VOICE_FEATURE_FLAGS.SHOW_VOICE_METRICS,
    showModeSwitcher: VOICE_FEATURE_FLAGS.SHOW_MODE_SWITCHER,
    debugVoice: VOICE_FEATURE_FLAGS.DEBUG_VOICE,
    systemVersion: getVoiceSystemVersion(),
  });
}

// Auto-log on import in development
if (process.env.NODE_ENV === 'development') {
  logVoiceFeatureFlags();
}
