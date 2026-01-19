/**
 * Identity Module
 *
 * Server-truth identity management for MAIA.
 * Client caches are expendable; server is the source of truth.
 */

// Explorer ID - stable identity for cross-session memory
export {
  getOrCreateExplorerId,
  hasExplorerId,
  clearExplorerId,
  EXPLORER_ID_KEY,
} from './explorerId';

// Identity Healing - sync client cache with server truth
export {
  healIdentity,
  clearIdentityCache,
  needsHealing,
  type HealResult,
} from './healIdentity';
