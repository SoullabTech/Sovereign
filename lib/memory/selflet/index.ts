/**
 * SELFLET CHAIN MODULE
 *
 * Temporal identity layer based on Michael Levin's "selflet" concept.
 * Treats identity as a chain of distinct selves sending messages across time.
 *
 * Usage:
 * ```typescript
 * import { selfletChain, selfletRituals, selfletBoundaryDetector } from '@/lib/memory/selflet';
 *
 * // Get current selflet
 * const current = await selfletChain.getCurrentSelflet(userId);
 *
 * // Build context for MAIA
 * const context = await selfletChain.buildContext(userId);
 *
 * // Check for pending wisdom from past self
 * const reflection = await selfletRituals.invokeTemporalReflection(userId, currentThemes);
 *
 * // Detect if boundary has been crossed
 * const boundary = await selfletBoundaryDetector.detectBoundary(detectionInput);
 * ```
 */

// Core service
export { selfletChain, SelfletChainService } from './SelfletChain';

// Boundary detection
export { selfletBoundaryDetector, SelfletBoundaryDetector } from './SelfletBoundaryDetector';

// MAIA-facing rituals
export { selfletRituals, SelfletRitualService } from './SelfletRituals';

// Integration helpers (for chat route)
export {
  loadSelfletContext,
  processSelfletAfterResponse,
  createSelfletFromSignal,
  recordFutureSelfMessage,
  completeReflection,
  recordReinterpretation,
  ensureInitialSelflet,
} from './SelfletIntegration';
export type { SelfletLoadResult, PostResponseInput, PostResponseResult } from './SelfletIntegration';

// Types
export * from './types';
