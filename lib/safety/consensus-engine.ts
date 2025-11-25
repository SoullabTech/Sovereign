/**
 * Consensus Engine
 * Calculates multi-agent consensus for safety verification
 *
 * Key principle: Agents DON'T vote or decide individually,
 * they create a weighted consensus through interference patterns
 */

import { v4 as uuidv4 } from 'uuid';
import {
  SafetyVerificationResult,
  ConsensusResult,
  ConsensusConfig,
  ConsensusCalculation,
  SafetyVerifierAgent
} from './self-auditing-types';

/**
 * Default consensus configuration
 * Tuned for balance between safety and over-blocking
 */
const DEFAULT_CONSENSUS_CONFIG: ConsensusConfig = {
  // Thresholds
  safe_threshold: 0.8, // 80% weighted approval needed to deliver
  concern_threshold: 0.5, // Below 50% triggers regeneration

  // Agent weights by priority
  priority_weights: {
    1: 1.0,  // Standard agents
    2: 1.5,  // Important agents (Higher Self, Shadow)
    3: 2.0   // Critical agents (Crisis Detection)
  },

  // Special rules
  critical_veto: true, // Any 'harmful' vote from high-priority agent blocks
  minimum_verifiers: 3, // At least 3 agents must verify

  // Performance
  timeout_ms: 5000 // 5 second timeout for verification
};

export class ConsensusEngine {
  private config: ConsensusConfig;

  constructor(config?: Partial<ConsensusConfig>) {
    this.config = { ...DEFAULT_CONSENSUS_CONFIG, ...config };
  }

  /**
   * Calculate consensus from all agent verification results
   */
  async calculateConsensus(
    verifications: SafetyVerificationResult[],
    agentRegistry: Map<string, SafetyVerifierAgent>
  ): Promise<ConsensusResult> {

    // Validate minimum verifiers
    if (verifications.length < this.config.minimum_verifiers) {
      throw new Error(
        `Insufficient verifiers: ${verifications.length} < ${this.config.minimum_verifiers}`
      );
    }

    // Calculate weighted votes
    const calculation = this.calculateWeightedVotes(verifications, agentRegistry);

    // Generate consensus result
    return {
      approved: calculation.action === 'deliver',
      safety_score: calculation.safety_score,
      verifying_agents: verifications,
      action: calculation.action,
      audit_id: uuidv4(),
      timestamp: new Date()
    };
  }

  /**
   * Calculate weighted votes and determine action
   */
  private calculateWeightedVotes(
    verifications: SafetyVerificationResult[],
    agentRegistry: Map<string, SafetyVerifierAgent>
  ): ConsensusCalculation {

    let weighted_safe_votes = 0;
    let weighted_concern_votes = 0;
    let weighted_harmful_votes = 0;
    let total_weight = 0;

    const votes_by_severity: { agent: string; vote: string; weight: number; confidence: number }[] = [];

    // Calculate weighted votes
    for (const verification of verifications) {
      const agent = agentRegistry.get(verification.agent);
      if (!agent) {
        console.warn(`Agent not found in registry: ${verification.agent}`);
        continue;
      }

      const priority = agent.priority;
      const weight = this.config.priority_weights[priority] || 1.0;
      const confidence = verification.confidence;

      total_weight += weight;

      // Weight votes by both agent priority and confidence
      const weighted_contribution = weight * confidence;

      switch (verification.vote) {
        case 'safe':
          weighted_safe_votes += weighted_contribution;
          break;
        case 'concern':
          weighted_concern_votes += weighted_contribution;
          break;
        case 'harmful':
          weighted_harmful_votes += weighted_contribution;
          break;
      }

      votes_by_severity.push({
        agent: verification.agent,
        vote: verification.vote,
        weight,
        confidence
      });
    }

    // Calculate safety score (0-1, where 1 = completely safe)
    const safety_score = Math.max(0, Math.min(1, weighted_safe_votes / total_weight));

    // Determine action based on consensus
    let action: 'deliver' | 'regenerate' | 'escalate';
    let reasoning: string;

    // Rule 1: Critical veto - any high-priority agent votes 'harmful'
    if (this.config.critical_veto) {
      const critical_harmful = votes_by_severity.find(
        v => v.vote === 'harmful' && v.weight >= this.config.priority_weights[3] && v.confidence > 0.7
      );

      if (critical_harmful) {
        action = 'escalate';
        reasoning = `Critical agent ${critical_harmful.agent} flagged as harmful with ${critical_harmful.confidence} confidence`;
        return { weighted_safe_votes, weighted_concern_votes, weighted_harmful_votes, total_weight, safety_score, action, reasoning };
      }
    }

    // Rule 2: High harmful votes (even from lower-priority agents)
    if (weighted_harmful_votes > 0.5 * total_weight) {
      action = 'escalate';
      reasoning = `High harmful vote weight: ${weighted_harmful_votes.toFixed(2)}/${total_weight.toFixed(2)}`;
      return { weighted_safe_votes, weighted_concern_votes, weighted_harmful_votes, total_weight, safety_score, action, reasoning };
    }

    // Rule 3: Strong consensus for safety
    if (safety_score >= this.config.safe_threshold) {
      action = 'deliver';
      reasoning = `Strong safety consensus: ${(safety_score * 100).toFixed(1)}%`;
      return { weighted_safe_votes, weighted_concern_votes, weighted_harmful_votes, total_weight, safety_score, action, reasoning };
    }

    // Rule 4: Below concern threshold - regenerate
    if (safety_score < this.config.concern_threshold) {
      action = 'regenerate';
      reasoning = `Safety score below concern threshold: ${(safety_score * 100).toFixed(1)}% < ${(this.config.concern_threshold * 100).toFixed(1)}%`;
      return { weighted_safe_votes, weighted_concern_votes, weighted_harmful_votes, total_weight, safety_score, action, reasoning };
    }

    // Rule 5: In between - regenerate to be safe
    action = 'regenerate';
    reasoning = `Moderate safety score: ${(safety_score * 100).toFixed(1)}%, regenerating for higher confidence`;
    return { weighted_safe_votes, weighted_concern_votes, weighted_harmful_votes, total_weight, safety_score, action, reasoning };
  }

  /**
   * Get consensus explanation for transparency
   */
  explainConsensus(result: ConsensusResult): string {
    const { safety_score, action, verifying_agents } = result;

    const agent_votes = verifying_agents
      .map(v => `${v.agent}: ${v.vote} (${(v.confidence * 100).toFixed(0)}% confident)`)
      .join('\n  ');

    const explanation = `
Safety Consensus Result:
  Score: ${(safety_score * 100).toFixed(1)}%
  Action: ${action}

Agent Votes:
  ${agent_votes}

Reasoning: ${action === 'deliver'
        ? 'Strong consensus that response is safe'
        : action === 'regenerate'
          ? 'Insufficient consensus, attempting safer response'
          : 'Safety concerns detected, escalating for review'
      }
    `.trim();

    return explanation;
  }

  /**
   * Analyze agent agreement
   * Useful for tuning and debugging
   */
  analyzeAgreement(verifications: SafetyVerificationResult[]): {
    unanimous: boolean;
    agreement_rate: number;
    most_common_vote: string;
    outliers: SafetyVerificationResult[];
  } {
    if (verifications.length === 0) {
      return {
        unanimous: false,
        agreement_rate: 0,
        most_common_vote: 'none',
        outliers: []
      };
    }

    // Count votes
    const vote_counts = new Map<string, number>();
    for (const v of verifications) {
      vote_counts.set(v.vote, (vote_counts.get(v.vote) || 0) + 1);
    }

    // Find most common vote
    let most_common_vote = 'safe';
    let max_count = 0;
    for (const [vote, count] of vote_counts.entries()) {
      if (count > max_count) {
        max_count = count;
        most_common_vote = vote;
      }
    }

    // Calculate agreement rate
    const agreement_rate = max_count / verifications.length;
    const unanimous = agreement_rate === 1.0;

    // Find outliers (agents that voted differently from majority)
    const outliers = verifications.filter(v => v.vote !== most_common_vote);

    return {
      unanimous,
      agreement_rate,
      most_common_vote,
      outliers
    };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<ConsensusConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get current configuration
   */
  getConfig(): ConsensusConfig {
    return { ...this.config };
  }
}

/**
 * Helper: Create agent registry from list
 */
export function createAgentRegistry(agents: SafetyVerifierAgent[]): Map<string, SafetyVerifierAgent> {
  const registry = new Map<string, SafetyVerifierAgent>();
  for (const agent of agents) {
    registry.set(agent.name, agent);
  }
  return registry;
}

/**
 * Helper: Simulate verification timeout
 */
export async function verifyWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  fallbackValue: T
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallbackValue), timeoutMs))
  ]);
}

export default ConsensusEngine;