/**
 * Oracle Orchestration System
 * Unified exports for the orchestration layer
 */

// Main orchestrator
export {
  OracleOrchestrator,
  OracleIdentity,
  OracleSession,
  OracleResponse,
  OrchestratorConfig,
  ConversationEntry,
  createOracleOrchestrator,
  defaultOrchestrator
} from './OracleOrchestrator';

// Priority resolution
export {
  OrchestrationClaim,
  OrchestrationDecision,
  resolvePriority,
  composeWithSupport,
  applyConfidenceGovernor
} from './priorityResolver';

// Claim collection
export {
  CollectionContext,
  collectClaims,
  validateContext,
  enrichContext
} from './collectClaims';

// Unified presence orchestrator (legacy/alternative implementation)
export {
  UnifiedPresenceOrchestrator,
  UnifiedOraclePresence,
  RelationshipMemory,
  VoiceCoherence,
  unifiedPresence
} from './UnifiedPresenceOrchestrator';

// Re-export elemental types for convenience
export { ElementalArchetype } from '../../../web/lib/types/elemental';