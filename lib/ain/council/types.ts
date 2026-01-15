/**
 * Core Council Types
 *
 * Type definitions for the core council system.
 * The core council embodies the six essential psychic functions
 * that every member's system needs for wholeness.
 */

/**
 * Core agent identifiers
 * These are the six essential psychic functions
 */
export type CoreAgentId =
  | 'navigator'   // Ego/orientation
  | 'guardian'    // Protector/shadow
  | 'regulator'   // Care/safety
  | 'mythopoet'   // Meaning/symbol
  | 'skeptic'     // Reality testing
  | 'integrator'; // Self/synthesis

/**
 * Agent role in synthesis
 */
export type AgentRole = 'elder' | 'counselor' | 'critic' | 'poet' | 'trickster' | 'conductor';

/**
 * Weight policy for bounded hierarchy
 */
export interface WeightPolicy {
  min: number;  // Minimum share (never silenced)
  max: number;  // Maximum share (never monopolizes)
}

/**
 * Core agent charter
 * The constitutional definition of an agent's role and boundaries
 */
export interface CoreAgentCharter {
  id: CoreAgentId;
  name: string;
  function: string;
  primary_questions: string[];
  gifts: string[];
  failure_modes: string[];
  lead_when: string[];
  defer_when: string[];
  safety_boundaries: string[];
  weight_policy: WeightPolicy;
  growth_signals: string[];
}

/**
 * Full council charter document
 */
export interface CouncilCharters {
  version: string;
  council: string;
  agents: CoreAgentCharter[];
}

/**
 * Member-specific agent trust
 * Tracks how much authority an agent has earned with a specific member
 */
export interface MemberAgentTrust {
  memberId: string;
  agentId: CoreAgentId;
  /** Earned trust level 0-1 (starts at 0.5) */
  trustLevel: number;
  /** Positive feedback count */
  helpfulCount: number;
  /** Negative feedback count */
  unhelpfulCount: number;
  /** Last updated timestamp */
  updatedAt: Date;
}

/**
 * Context signals for agent activation
 * Used to determine which agents should lead/defer
 */
export interface ContextSignals {
  /** Detected emotional activation level 0-1 */
  activationLevel?: number;
  /** Whether trauma cues are present */
  traumaSignals?: boolean;
  /** Whether high stakes are detected */
  highStakes?: boolean;
  /** Detected topic domains */
  topicDomains?: string[];
  /** Whether meaning/existential themes are present */
  meaningThemes?: boolean;
  /** Whether practical/technical help is requested */
  practicalRequest?: boolean;
}
