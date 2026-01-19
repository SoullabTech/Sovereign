/**
 * Stability Module
 *
 * Self-healing and graceful degradation utilities for MAIA.
 *
 * Doctrine:
 * 1. No single bad client state can take down core flows
 * 2. Identity is server-truth; client cache is expendable
 * 3. Every critical endpoint fails "soft" (never 500 for expected bad input)
 * 4. Deployment is reversible in under 2 minutes
 * 5. Observability is boring and constant (health, logs, alarms)
 */

// Safe Mode - runtime feature flag for degraded operation
export {
  isSafeMode,
  isFeatureDisabled,
  safeGuard,
  safeGuardSync,
  getSafeModeStatus,
  SAFE_MODE_DISABLED_FEATURES,
  type SafeModeFeature,
} from './safeMode';
