// @ts-nocheck
/**
 * Oracle Orchestration System
 * Unified exports for the orchestration layer
 */

// Main orchestrator - runtime exports
export {
  OracleOrchestrator,
  createOracleOrchestrator,
  defaultOrchestrator
} from './OracleOrchestrator';

// Main orchestrator - type exports
export type {
  OracleIdentity,
  OracleSession,
  OracleResponse,
  OrchestratorConfig,
  ConversationEntry
} from './OracleOrchestrator';

// Priority resolution - runtime exports
export {
  resolvePriority,
  composeWithSupport,
  applyConfidenceGovernor
} from './priorityResolver';

// Priority resolution - type exports
export type {
  OrchestrationClaim,
  OrchestrationDecision
} from './priorityResolver';

// Claim collection - runtime exports
export {
  collectClaims,
  validateContext,
  enrichContext
} from './collectClaims';

// Claim collection - type exports
export type {
  CollectionContext
} from './collectClaims';

// Unified presence orchestrator (legacy/alternative implementation) - runtime exports
export {
  UnifiedPresenceOrchestrator,
  unifiedPresence
} from './UnifiedPresenceOrchestrator';

// Unified presence orchestrator - type exports
export type {
  UnifiedOraclePresence,
  RelationshipMemory,
  VoiceCoherence
} from './UnifiedPresenceOrchestrator';

// Re-export elemental types for convenience
export type { ElementalArchetype } from '@/lib/types/elemental';