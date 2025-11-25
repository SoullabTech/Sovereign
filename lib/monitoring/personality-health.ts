/**
 * MAIA Personality Health Monitor
 *
 * Continuously monitors MAIA's responses to detect personality degradation
 * and automatically recover when issues are detected.
 *
 * DEGRADATION SYMPTOMS:
 * - Responses too short (< 20 words)
 * - Broken speech patterns ("REall?", "Hey ther!")
 * - Lacks philosophical depth
 * - Generic chatbot responses
 *
 * RECOVERY ACTIONS:
 * - Clear corrupted conversation state
 * - Reset conversation style to 'classic'
 * - Reload session (dev mode only)
 * - Log detailed diagnostics
 */

import { checkMAIAPersonalityHealth, recoverMAIAPersonality, DEV_MODE } from '@/lib/constants/dev-mode';

interface HealthCheckResult {
  isHealthy: boolean;
  issues: string[];
  response: string;
  timestamp: number;
}

// Track recent health checks
const healthHistory: HealthCheckResult[] = [];
const MAX_HISTORY = 10;

/**
 * Monitor a MAIA response for personality health
 * Returns the response unchanged, but triggers recovery if degraded
 */
export function monitorMAIAResponse(response: string): string {
  // Skip health checks in production (avoid false positives with valid brief responses)
  if (!DEV_MODE) {
    return response;
  }

  // Check personality health
  const health = checkMAIAPersonalityHealth(response);

  // Record in history
  const result: HealthCheckResult = {
    isHealthy: health.isHealthy,
    issues: health.issues,
    response: response.substring(0, 100), // Store preview only
    timestamp: Date.now()
  };

  healthHistory.push(result);
  if (healthHistory.length > MAX_HISTORY) {
    healthHistory.shift();
  }

  // If unhealthy, log warning
  if (!health.isHealthy) {
    console.warn('⚠️ MAIA Personality Health Check FAILED');
    console.warn('Response:', response);
    console.warn('Issues detected:', health.issues);

    // Check if this is a pattern (multiple recent failures)
    const recentFailures = healthHistory
      .slice(-3)
      .filter(h => !h.isHealthy)
      .length;

    if (recentFailures >= 2) {
      console.error('🚨 PERSISTENT personality degradation detected!');
      console.error('Recent health history:', healthHistory.slice(-5));

      // Trigger recovery
      recoverMAIAPersonality();
    } else {
      console.log('Single health check failure - monitoring...');
    }
  } else {
    console.log('✓ MAIA personality health: Good');
  }

  return response;
}

/**
 * Get recent health check history (for debugging)
 */
export function getHealthHistory(): HealthCheckResult[] {
  return [...healthHistory];
}

/**
 * Force a personality health check without automatic recovery
 * (useful for manual testing)
 */
export function checkPersonalityHealth(response: string) {
  return checkMAIAPersonalityHealth(response);
}

/**
 * Clear health history
 */
export function clearHealthHistory() {
  healthHistory.length = 0;
  console.log('🗑️ Cleared MAIA health history');
}
