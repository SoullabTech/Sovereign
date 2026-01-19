/**
 * Safe Mode - Runtime Feature Flag for Degraded Operation
 *
 * When SAFE_MODE=1, the app disables nonessential features that cause failures:
 * - Geocode lookups
 * - Heavy memory retrieval
 * - Astrology calculations
 * - Data exports
 * - Advanced voice features
 *
 * What stays enabled:
 * - Chat + Journal (core flows)
 * - Basic profile read
 * - Health endpoints
 * - Sign in/out
 *
 * Usage:
 *   import { isSafeMode, safeGuard } from '@/lib/stability/safeMode';
 *
 *   // Check mode
 *   if (isSafeMode()) {
 *     return { error: 'Feature disabled in safe mode' };
 *   }
 *
 *   // Or use guard function
 *   const result = safeGuard(
 *     () => expensiveOperation(),
 *     { fallback: defaultValue }
 *   );
 */

// Disabled features in safe mode
export const SAFE_MODE_DISABLED_FEATURES = [
  'geocode',           // Location lookups
  'astrology',         // Birth chart calculations
  'memory_deep',       // Heavy memory retrieval
  'export',            // Data exports
  'voice_advanced',    // ElevenLabs, advanced voice features
  'embedding',         // Vector embeddings
  'rlm',              // Recursive Language Models
] as const;

export type SafeModeFeature = typeof SAFE_MODE_DISABLED_FEATURES[number];

/**
 * Check if safe mode is enabled
 */
export function isSafeMode(): boolean {
  // Server-side
  if (typeof window === 'undefined') {
    return process.env.SAFE_MODE === '1' || process.env.SAFE_MODE === 'true';
  }

  // Client-side - check if server indicated safe mode
  // This would be set by a layout or provider that fetches health status
  try {
    const healthData = sessionStorage.getItem('maia_health');
    if (healthData) {
      const health = JSON.parse(healthData);
      return health.safeMode === true;
    }
  } catch {
    // Ignore errors
  }

  return false;
}

/**
 * Check if a specific feature is disabled in safe mode
 */
export function isFeatureDisabled(feature: SafeModeFeature): boolean {
  if (!isSafeMode()) return false;
  return SAFE_MODE_DISABLED_FEATURES.includes(feature);
}

interface SafeGuardOptions<T> {
  fallback: T;
  feature?: SafeModeFeature;
  logSkip?: boolean;
}

/**
 * Guard a function call with safe mode check
 *
 * If safe mode is enabled (and feature is disabled), returns fallback.
 * Otherwise executes the function.
 *
 * @example
 * const chart = await safeGuard(
 *   () => calculateBirthChart(birthData),
 *   { fallback: null, feature: 'astrology' }
 * );
 */
export async function safeGuard<T>(
  fn: () => T | Promise<T>,
  options: SafeGuardOptions<T>
): Promise<T> {
  const { fallback, feature, logSkip = true } = options;

  // If feature specified, check if it's disabled
  if (feature && isFeatureDisabled(feature)) {
    if (logSkip) {
      console.log(`[SafeMode] Skipping ${feature} (safe mode enabled)`);
    }
    return fallback;
  }

  // If no feature specified but safe mode is on, skip anyway
  if (!feature && isSafeMode()) {
    if (logSkip) {
      console.log('[SafeMode] Skipping operation (safe mode enabled)');
    }
    return fallback;
  }

  // Execute the function
  try {
    return await fn();
  } catch (error) {
    // If operation fails and we're in safe mode, return fallback
    if (isSafeMode()) {
      console.warn('[SafeMode] Operation failed, returning fallback:', error);
      return fallback;
    }
    throw error;
  }
}

/**
 * Synchronous version of safeGuard
 */
export function safeGuardSync<T>(
  fn: () => T,
  options: SafeGuardOptions<T>
): T {
  const { fallback, feature, logSkip = true } = options;

  if (feature && isFeatureDisabled(feature)) {
    if (logSkip) {
      console.log(`[SafeMode] Skipping ${feature} (safe mode enabled)`);
    }
    return fallback;
  }

  if (!feature && isSafeMode()) {
    if (logSkip) {
      console.log('[SafeMode] Skipping operation (safe mode enabled)');
    }
    return fallback;
  }

  try {
    return fn();
  } catch (error) {
    if (isSafeMode()) {
      console.warn('[SafeMode] Operation failed, returning fallback:', error);
      return fallback;
    }
    throw error;
  }
}

/**
 * Get safe mode status for client-side display
 */
export function getSafeModeStatus(): {
  enabled: boolean;
  disabledFeatures: readonly string[];
} {
  const enabled = isSafeMode();
  return {
    enabled,
    disabledFeatures: enabled ? SAFE_MODE_DISABLED_FEATURES : [],
  };
}
