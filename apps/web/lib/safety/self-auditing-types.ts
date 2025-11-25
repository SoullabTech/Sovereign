/**
 * Self-Auditing System Types
 * Type definitions for multi-agent verification and audit trail
 */

import { ResonanceField } from '../maia/resonance-field-system';

// ============================================================================
// SAFETY VERIFICATION TYPES
// ============================================================================

export type SafetyVote = 'safe' | 'concern' | 'harmful';

export interface SafetyVerificationResult {
  agent: string;
  vote: SafetyVote;
  confidence: number; // 0-1
  reasoning: string;
  flagged_patterns?: string[];
  metadata?: Record<string, any>;
}

export interface ConsensusResult {
  approved: boolean;
  safety_score: number; // 0-1 (weighted average of agent votes)
  verifying_agents: SafetyVerificationResult[];
  action: 'deliver' | 'regenerate' | 'escalate';
  audit_id: string;
  timestamp: Date;
}

// ============================================================================
// CONTEXT TYPES
// ============================================================================

export interface ConversationContext {
  userId: string;
  sessionId: string;
  exchangeCount: number;
  intimacyLevel: number;
  userInput: string;
  conversationHistory?: string[];
  emotionalIntensity?: number;
  crisisDetected?: boolean;
  depthRequested?: boolean;
  explicitQuestion?: boolean;
  rawEmotion?: boolean;
  userState?: string;
  userWeather?: string;
}

export interface VerificationContext extends ConversationContext {
  field: ResonanceField;
  candidateResponse: string | null;
  activeAgents: string[];
  dominantFrequencies: string[];
  generationStartTime: number;
}

// ============================================================================
// VERIFIED RESPONSE TYPES
// ============================================================================

export interface VerifiedResponse {
  response: string | null;
  verified: boolean;
  consensusResult: ConsensusResult;
  timing: {
    generation_ms: number;
    verification_ms: number;
    total_ms: number;
  };
  metadata: {
    regeneration_attempts: number;
    exhausted?: boolean;
    escalated?: boolean;
  };

  // === USER SOVEREIGNTY EXTENSIONS ===
  /**
   * If true, user must make a choice before receiving response
   * This shifts from paternalistic safety to collaborative safety
   */
  userChoiceRequired?: boolean;

  /**
   * Options presented to user when choice is required
   */
  userChoiceOptions?: {
    acceptSafetyConcern: {
      label: string;
      description: string;
      action: 'regenerate' | 'end_conversation';
    };
    viewTransparency: {
      label: string;
      description: string;
      action: 'show_transparency';
    };
    overrideSafety: {
      label: string;
      description: string;
      action: 'deliver_anyway';
      requiresExplicitConsent: boolean;
    };
  };

  /**
   * Full transparency report (if user requests it)
   */
  transparencyReport?: TransparencyResponse;
}

// ============================================================================
// AUDIT LOG TYPES
// ============================================================================

export interface AuditLogEntry {
  id: string;
  user_id: string;
  session_id: string;
  timestamp: Date;

  // Input
  user_input: string;
  exchange_count: number;
  intimacy_level: number;

  // Field state
  field_state: ResonanceField;
  active_agents: string[];
  dominant_frequencies: string[];

  // Generation
  candidate_response: string | null;
  generation_latency_ms: number;

  // Verification
  verifying_agents: SafetyVerificationResult[];
  consensus_result: ConsensusResult;
  safety_score: number;
  verification_latency_ms: number;

  // Action
  action: 'deliver' | 'regenerate' | 'escalate';

  // Delivery
  delivered_response: string | null;
  delivery_timestamp?: Date;
  regeneration_attempts: number;

  // Safety metadata
  crisis_detected: boolean;
  drift_alerts?: any[];
  pattern_flags?: string[];

  // Compliance
  data_retention_until?: Date;
  anonymized: boolean;

  // User feedback
  user_appealed?: boolean;
  appeal_reason?: string;
  appeal_result?: string;
}

// ============================================================================
// SAFETY PATTERN TYPES
// ============================================================================

export interface SafetyPattern {
  id: string;
  pattern_name: string;
  pattern_type: SafetyPatternType;
  detection_rules: Record<string, any>;
  semantic_vector: number[];
  example_inputs: string[];
  example_responses: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence_threshold: number;
  detection_count: number;
  false_positive_count: number;
  false_negative_count: number;
  accuracy: number;
  active: boolean;
  created_at: Date;
  updated_at: Date;
  last_detected_at?: Date;
}

export type SafetyPatternType =
  | 'crisis_escalation'
  | 'manipulation'
  | 'boundary_violation'
  | 'dependency_formation'
  | 'premature_advice'
  | 'inappropriate_wisdom'
  | 'minimizing_crisis'
  | 'encouraging_harm';

// ============================================================================
// METRICS TYPES
// ============================================================================

export interface SafetyMetrics {
  metric_date: Date;
  total_responses: number;
  verified_responses: number;
  rejected_responses: number;
  escalated_responses: number;
  regeneration_rate: number;
  average_safety_score: number;
  average_verification_latency_ms: number;
  average_generation_latency_ms: number;
  consensus_agreement_rate: number;
  crisis_agent_activation_rate: number;
  higher_self_activation_rate: number;
  user_appeal_count: number;
  user_appeal_approval_rate: number;
  false_positive_estimate: number;
  false_negative_estimate: number;
  system_uptime_pct: number;
}

export interface UserSafetyStatus {
  id: string;
  user_id: string;
  status: 'green' | 'yellow' | 'red';
  risk_level: number; // 0-1
  total_conversations: number;
  crisis_detections: number;
  escalations: number;
  last_crisis_detection?: Date;
  last_escalation?: Date;
  increased_scrutiny: boolean;
  scrutiny_threshold: number;
  additional_verifiers?: string[];
  semantic_drift_detected: boolean;
  drift_direction?: string;
  drift_confidence?: number;
  last_drift_check?: Date;
  created_at: Date;
  updated_at: Date;
  last_interaction: Date;
}

export interface InterventionOutcome {
  id: string;
  audit_log_id: string;
  user_id: string;
  intervention_type: string;
  intervention_message: string;
  intervention_timestamp: Date;
  user_continued_conversation?: boolean;
  next_message_sentiment?: string;
  crisis_de_escalated?: boolean;
  user_reported_helpful?: boolean;
  follow_up_required: boolean;
  follow_up_completed: boolean;
  follow_up_notes?: string;
  created_at: Date;
}

// ============================================================================
// AGENT INTERFACE
// ============================================================================

export interface SafetyVerifierAgent {
  name: string;
  priority: number; // 1-3 (3 = highest priority like Crisis Agent)

  /**
   * Verify a candidate response for safety
   */
  verify(
    context: VerificationContext
  ): Promise<SafetyVerificationResult>;
}

// ============================================================================
// CONSENSUS ENGINE TYPES
// ============================================================================

export interface ConsensusConfig {
  // Thresholds
  safe_threshold: number; // Default: 0.8 (80% weighted safe votes)
  concern_threshold: number; // Default: 0.5

  // Agent weights
  priority_weights: Record<number, number>; // e.g., {1: 1.0, 2: 1.5, 3: 2.0}

  // Special rules
  critical_veto: boolean; // If true, any 'harmful' vote triggers escalation
  minimum_verifiers: number; // Minimum number of agents required

  // Performance
  timeout_ms: number; // Max time to wait for verification
}

export interface ConsensusCalculation {
  weighted_safe_votes: number;
  weighted_concern_votes: number;
  weighted_harmful_votes: number;
  total_weight: number;
  safety_score: number;
  action: 'deliver' | 'regenerate' | 'escalate';
  reasoning: string;
}

// ============================================================================
// ORCHESTRATOR TYPES
// ============================================================================

export interface GenerationAttempt {
  attempt_number: number;
  candidate_response: string | null;
  verification_result: ConsensusResult;
  field_adjustments?: Record<string, any>;
  timestamp: Date;
}

export interface SelfAuditingResult {
  success: boolean;
  verified_response: VerifiedResponse;
  audit_log_entry: AuditLogEntry;
  generation_attempts: GenerationAttempt[];
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface SelfAuditingConfig {
  enabled: boolean;
  feature_flags: {
    enable_verification: boolean;
    enable_audit_logging: boolean;
    enable_pattern_matching: boolean;
    enable_drift_detection: boolean;
  };
  consensus_config: ConsensusConfig;
  regeneration: {
    max_attempts: number;
    field_adjustment_strategy: 'increase_restraint' | 'increase_silence' | 'increase_higher_self';
  };
  performance: {
    enable_caching: boolean;
    cache_ttl_seconds: number;
    enable_parallel_verification: boolean;
  };
  compliance: {
    retention_days: number;
    auto_anonymize_after_days: number;
    enable_user_appeals: boolean;
  };

  // === USER SOVEREIGNTY CONFIG ===
  user_sovereignty: {
    // Should users see transparency by default?
    transparency_by_default: boolean;

    // Can users override safety concerns?
    allow_user_override: boolean;

    // When override is allowed, require explicit consent?
    require_explicit_consent_for_override: boolean;

    // Show full reasoning or just summary?
    transparency_level: 'summary' | 'detailed' | 'full_technical';

    // Can users challenge individual verifier votes?
    allow_verifier_challenge: boolean;
  };
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class SafetyVerificationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: any
  ) {
    super(message);
    this.name = 'SafetyVerificationError';
  }
}

export class ConsensusTimeoutError extends SafetyVerificationError {
  constructor(agentsCompleted: number, agentsTotal: number) {
    super(
      `Verification timeout: ${agentsCompleted}/${agentsTotal} agents completed`,
      'CONSENSUS_TIMEOUT',
      { agentsCompleted, agentsTotal }
    );
  }
}

export class MaxAttemptsExceededError extends SafetyVerificationError {
  constructor(attempts: number) {
    super(
      `Max regeneration attempts exceeded: ${attempts}`,
      'MAX_ATTEMPTS_EXCEEDED',
      { attempts }
    );
  }
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface TransparencyResponse {
  response_text: string;
  contributing_agents: {
    name: string;
    influence: number; // 0-1
    reasoning: string;
  }[];
  safety_verification: {
    reviewed_by: string[];
    consensus_score: number;
    concerns_raised: string[];
  };
  user_can_appeal: boolean;
  audit_id: string;
}

export interface AppealRequest {
  audit_id: string;
  user_id: string;
  reason: string;
  timestamp: Date;
}

export interface AppealResponse {
  appeal_id: string;
  approved: boolean;
  reasoning: string;
  corrected_response?: string;
  timestamp: Date;
}

// ============================================================================
// DATABASE CLIENT TYPES
// ============================================================================

export interface AuditLogger {
  log(entry: Omit<AuditLogEntry, 'id' | 'created_at' | 'updated_at'>): Promise<AuditLogEntry>;
  getEntry(id: string): Promise<AuditLogEntry | null>;
  getUserEntries(userId: string, limit?: number): Promise<AuditLogEntry[]>;
  getRecentEscalations(limit?: number): Promise<AuditLogEntry[]>;
}

export interface SafetyMetricsCollector {
  recordVerification(result: VerifiedResponse): Promise<void>;
  calculateDailyMetrics(date: Date): Promise<SafetyMetrics>;
  getMetrics(startDate: Date, endDate: Date): Promise<SafetyMetrics[]>;
}

export interface UserSafetyTracker {
  updateStatus(userId: string): Promise<UserSafetyStatus>;
  getStatus(userId: string): Promise<UserSafetyStatus | null>;
  getHighRiskUsers(): Promise<UserSafetyStatus[]>;
}