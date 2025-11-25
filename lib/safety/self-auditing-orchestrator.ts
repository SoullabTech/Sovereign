/**
 * Self-Auditing Orchestrator
 * Coordinates multi-agent verification and audit logging
 *
 * This is the main entry point for self-auditing functionality.
 * It orchestrates:
 * 1. Response generation (via existing CompleteAgentFieldSystem)
 * 2. Multi-agent safety verification
 * 3. Consensus calculation
 * 4. Regeneration if needed
 * 5. Audit logging
 */

import CompleteAgentFieldSystem from '../maia/complete-agent-field-system';
import { ResonanceField } from '../maia/resonance-field-system';
import ConsensusEngine, { createAgentRegistry } from './consensus-engine';
import CrisisVerifierAgent from './verifier-agents/crisis-verifier';
import HigherSelfVerifierAgent from './verifier-agents/higher-self-verifier';
import ClaudeWisdomVerifierAgent from './verifier-agents/claude-wisdom-verifier';
import { getMonitor } from '../monitoring/production-monitor';

import {
  SafetyVerifierAgent,
  ConversationContext,
  VerificationContext,
  VerifiedResponse,
  ConsensusResult,
  GenerationAttempt,
  SelfAuditingConfig,
  MaxAttemptsExceededError,
  ConsensusTimeoutError
} from './self-auditing-types';

/**
 * Default configuration
 */
const DEFAULT_CONFIG: SelfAuditingConfig = {
  enabled: true,
  feature_flags: {
    enable_verification: true,
    enable_audit_logging: true,
    enable_pattern_matching: false, // Phase 2
    enable_drift_detection: false   // Phase 2
  },
  consensus_config: {
    safe_threshold: 0.8,
    concern_threshold: 0.5,
    priority_weights: { 1: 1.0, 2: 1.5, 3: 2.0 },
    critical_veto: true,
    minimum_verifiers: 3,
    timeout_ms: 5000
  },
  regeneration: {
    max_attempts: 3,
    field_adjustment_strategy: 'increase_restraint'
  },
  performance: {
    enable_caching: false, // Phase 2
    cache_ttl_seconds: 300,
    enable_parallel_verification: true
  },
  compliance: {
    retention_days: 90,
    auto_anonymize_after_days: 365,
    enable_user_appeals: true
  },
  // === USER SOVEREIGNTY ===
  // Transform from paternalistic to collaborative safety
  user_sovereignty: {
    transparency_by_default: true, // Users see why by default
    allow_user_override: true, // Users can override (with consent)
    require_explicit_consent_for_override: true, // Must acknowledge responsibility
    transparency_level: 'detailed', // Show reasoning, not just "this was flagged"
    allow_verifier_challenge: false // Phase 2: Let users challenge individual verifiers
  }
};

export class SelfAuditingOrchestrator {
  private fieldSystem: CompleteAgentFieldSystem;
  private consensusEngine: ConsensusEngine;
  private verifierAgents: SafetyVerifierAgent[];
  private agentRegistry: Map<string, SafetyVerifierAgent>;
  private config: SelfAuditingConfig;
  private monitor = getMonitor();

  constructor(config?: Partial<SelfAuditingConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize systems
    this.fieldSystem = new CompleteAgentFieldSystem();
    this.consensusEngine = new ConsensusEngine(this.config.consensus_config);

    // Initialize verifier agents
    this.verifierAgents = [
      new CrisisVerifierAgent(),
      new HigherSelfVerifierAgent(),
      new ClaudeWisdomVerifierAgent()
    ];

    this.agentRegistry = createAgentRegistry(this.verifierAgents);

    this.monitor.info('SelfAuditingOrchestrator initialized', 'SelfAuditing', {
      verifierCount: this.verifierAgents.length,
      enabled: this.config.enabled
    });
  }

  /**
   * Main entry point: Generate and verify response
   */
  async generateVerifiedResponse(
    context: ConversationContext
  ): Promise<VerifiedResponse> {

    if (!this.config.enabled || !this.config.feature_flags.enable_verification) {
      // Bypass verification, use direct generation
      return this.generateUnverified(context);
    }

    const startTime = Date.now();
    const generationAttempts: GenerationAttempt[] = [];

    // Attempt generation and verification (with regeneration if needed)
    for (let attempt = 1; attempt <= this.config.regeneration.max_attempts; attempt++) {
      const attemptResult = await this.attemptGeneration(context, attempt, generationAttempts);

      generationAttempts.push(attemptResult);

      // If approved, return
      if (attemptResult.verification_result.approved) {
        const totalTime = Date.now() - startTime;

        const verifiedResponse: VerifiedResponse = {
          response: attemptResult.candidate_response,
          verified: true,
          consensusResult: attemptResult.verification_result,
          timing: {
            generation_ms: attemptResult.verification_result.timestamp.getTime() - startTime,
            verification_ms: totalTime - (attemptResult.verification_result.timestamp.getTime() - startTime),
            total_ms: totalTime
          },
          metadata: {
            regeneration_attempts: attempt - 1
          }
        };

        // Log metrics
        this.monitor.recordMetric('self_audit.response_approved', 1, { attempt: attempt.toString() });
        this.monitor.recordHistogram('self_audit.total_latency_ms', totalTime);

        return verifiedResponse;
      }

      // If escalated, give user sovereignty (don't just refuse)
      if (attemptResult.verification_result.action === 'escalate') {
        this.monitor.incrementCounter('self_audit.escalation', { attempt: attempt.toString() });

        return this.createUserSovereigntyResponse(
          attemptResult.candidate_response,
          attemptResult.verification_result,
          startTime,
          attempt
        );
      }

      // Otherwise, regenerate (action === 'regenerate')
      this.monitor.incrementCounter('self_audit.regeneration', { attempt: attempt.toString() });
    }

    // Max attempts exceeded
    this.monitor.incrementCounter('self_audit.max_attempts_exceeded');

    throw new MaxAttemptsExceededError(this.config.regeneration.max_attempts);
  }

  /**
   * Single generation + verification attempt
   */
  private async attemptGeneration(
    context: ConversationContext,
    attemptNumber: number,
    previousAttempts: GenerationAttempt[]
  ): Promise<GenerationAttempt> {

    const genStart = Date.now();

    // Adjust field if this is a regeneration
    const adjustedContext = attemptNumber > 1
      ? this.adjustFieldForSafety(context, previousAttempts)
      : context;

    // Generate candidate response via existing field system
    const { field, activeAgents, dominantFrequencies } = await this.fieldSystem.generateField(
      adjustedContext.userInput,
      adjustedContext
    );

    const candidateResponse = this.fieldSystem.getFieldConstrainedResponse(field);
    const genTime = Date.now() - genStart;

    // Verify response through consensus
    const verificationContext: VerificationContext = {
      ...adjustedContext,
      field,
      candidateResponse,
      activeAgents,
      dominantFrequencies,
      generationStartTime: genStart
    };

    const verifyStart = Date.now();
    const consensusResult = await this.verifyResponse(verificationContext);
    const verifyTime = Date.now() - verifyStart;

    this.monitor.recordHistogram('self_audit.generation_latency_ms', genTime);
    this.monitor.recordHistogram('self_audit.verification_latency_ms', verifyTime);

    return {
      attempt_number: attemptNumber,
      candidate_response: candidateResponse,
      verification_result: consensusResult,
      field_adjustments: attemptNumber > 1 ? this.getFieldAdjustments(previousAttempts) : undefined,
      timestamp: new Date()
    };
  }

  /**
   * Verify response through multi-agent consensus
   */
  private async verifyResponse(context: VerificationContext): Promise<ConsensusResult> {
    const verifyStart = Date.now();

    try {
      // Get verifications from all agents in parallel
      const verificationPromises = this.verifierAgents.map(async (agent) => {
        try {
          return await agent.verify(context);
        } catch (error) {
          this.monitor.error(`Verifier agent ${agent.name} failed`, 'SelfAuditing', error as Error);
          // Return safe default if agent fails (fail-open for availability)
          return {
            agent: agent.name,
            vote: 'safe' as const,
            confidence: 0.5,
            reasoning: `Agent failed, defaulting to safe: ${(error as Error).message}`
          };
        }
      });

      // Wait for all verifications (with timeout)
      const verifications = await Promise.race([
        Promise.all(verificationPromises),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new ConsensusTimeoutError(0, this.verifierAgents.length)),
            this.config.consensus_config.timeout_ms
          )
        )
      ]);

      // Calculate consensus
      const consensus = await this.consensusEngine.calculateConsensus(
        verifications,
        this.agentRegistry
      );

      const verifyTime = Date.now() - verifyStart;
      this.monitor.recordGauge('self_audit.verification_time_ms', verifyTime);
      this.monitor.recordGauge('self_audit.safety_score', consensus.safety_score);

      return consensus;

    } catch (error) {
      this.monitor.error('Verification failed', 'SelfAuditing', error as Error);

      // If verification fails, default to regeneration (fail-safe)
      return {
        approved: false,
        safety_score: 0.5,
        verifying_agents: [],
        action: 'regenerate',
        audit_id: 'error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Adjust field parameters for safer response
   */
  private adjustFieldForSafety(
    context: ConversationContext,
    previousAttempts: GenerationAttempt[]
  ): ConversationContext {

    const lastAttempt = previousAttempts[previousAttempts.length - 1];
    const concerns = lastAttempt.verification_result.verifying_agents
      .filter(v => v.vote !== 'safe')
      .map(v => v.reasoning);

    // Strategy: increase restraint
    if (this.config.regeneration.field_adjustment_strategy === 'increase_restraint') {
      return {
        ...context,
        // Adjust context to favor safer responses
        crisisDetected: context.crisisDetected || concerns.some(c => c.includes('crisis')),
        userWeather: 'gentle' // Bias toward gentler responses
      };
    }

    return context;
  }

  /**
   * Get field adjustments summary
   */
  private getFieldAdjustments(attempts: GenerationAttempt[]): Record<string, any> {
    const lastAttempt = attempts[attempts.length - 1];
    return {
      reason: 'Previous attempt rejected',
      safety_score: lastAttempt.verification_result.safety_score,
      concerns: lastAttempt.verification_result.verifying_agents
        .filter(v => v.vote !== 'safe')
        .map(v => v.reasoning)
    };
  }

  /**
   * Create user sovereignty response (instead of paternalistic refusal)
   * Transforms "We blocked this for your safety" into "Here's what we're concerned about - your choice"
   */
  private createUserSovereigntyResponse(
    candidateResponse: string | null,
    consensus: ConsensusResult,
    startTime: number,
    attempt: number
  ): VerifiedResponse {

    const transparency = this.consensusEngine.explainConsensus(consensus);
    const concerns = consensus.verifying_agents
      .filter(v => v.vote !== 'safe')
      .map(v => ({ agent: v.agent, reasoning: v.reasoning, vote: v.vote }));

    // Build transparency report
    const transparencyReport = {
      response_text: candidateResponse || "(Response withheld pending your choice)",
      contributing_agents: concerns.map(c => ({
        name: c.agent,
        influence: 1.0, // TODO: Calculate from consensus weights
        reasoning: c.reasoning
      })),
      safety_verification: {
        reviewed_by: consensus.verifying_agents.map(v => v.agent),
        consensus_score: consensus.safety_score,
        concerns_raised: concerns.map(c => c.reasoning)
      },
      user_can_appeal: true,
      audit_id: consensus.audit_id
    };

    // Build user choice options based on config
    const userChoiceOptions = {
      acceptSafetyConcern: {
        label: "I understand the concern",
        description: "Let's try a different approach together. Can you rephrase what you're looking for?",
        action: 'regenerate' as const
      },
      viewTransparency: {
        label: "Show me why this was flagged",
        description: this.config.user_sovereignty.transparency_by_default
          ? "You're already seeing the full transparency report below"
          : "See detailed reasoning from each safety verifier",
        action: 'show_transparency' as const
      },
      overrideSafety: this.config.user_sovereignty.allow_user_override ? {
        label: "I take responsibility - deliver anyway",
        description: "You understand the concerns and choose to proceed. This will be logged.",
        action: 'deliver_anyway' as const,
        requiresExplicitConsent: this.config.user_sovereignty.require_explicit_consent_for_override
      } : undefined as any
    };

    // Build sovereignty message (shown to user)
    let sovereigntyMessage = this.config.user_sovereignty.transparency_by_default
      ? this.buildTransparentSovereigntyMessage(concerns, transparency)
      : this.buildGentleSovereigntyMessage(concerns.length);

    return {
      response: sovereigntyMessage,
      verified: false,
      consensusResult: consensus,
      timing: {
        generation_ms: 0,
        verification_ms: Date.now() - startTime,
        total_ms: Date.now() - startTime
      },
      metadata: {
        regeneration_attempts: attempt,
        escalated: true
      },
      // === USER SOVEREIGNTY FIELDS ===
      userChoiceRequired: true,
      userChoiceOptions,
      transparencyReport: this.config.user_sovereignty.transparency_by_default
        ? transparencyReport
        : undefined
    };
  }

  /**
   * Build transparent sovereignty message (shows concerns upfront)
   */
  private buildTransparentSovereigntyMessage(
    concerns: Array<{ agent: string; reasoning: string; vote: string }>,
    transparency: string
  ): string {
    const concernList = concerns
      .map(c => `- **${c.agent}** (${c.vote}): ${c.reasoning}`)
      .join('\n');

    return `I want to be transparent with you about what happened.

**Safety Concerns Raised:**
${concernList}

I'm not refusing to respond - I'm inviting you to choose how we proceed.

**Your options:**
1. **Rephrase** - We can explore this together in a different way
2. **Override** - You take responsibility and I'll deliver the response anyway (this will be logged)
3. **End** - We can stop here if this isn't serving you

What feels right to you?`;
  }

  /**
   * Build gentle sovereignty message (user can request details)
   */
  private buildGentleSovereigntyMessage(concernCount: number): string {
    return `I'm finding it hard to find the right words here. ${concernCount} of my safety verifiers raised concerns about how to respond.

I'm not refusing - I'm inviting you to choose:

1. **Try again** - Can you help me understand what would be most helpful?
2. **See why** - I can show you the specific concerns that were raised
3. **Your choice** - You can take responsibility and override the safety system

What would serve you best?`;
  }

  /**
   * Generate safety refusal message (DEPRECATED - kept for backward compatibility)
   * New code should use createUserSovereigntyResponse instead
   */
  private getSafetyRefusalMessage(consensus: ConsensusResult): string {
    const concerns = consensus.verifying_agents
      .filter(v => v.vote === 'harmful')
      .map(v => v.reasoning);

    // Gentle refusal that doesn't alarm user
    return "I'm finding it hard to find the right words. Can you help me understand what would be most helpful for you right now?";
  }

  /**
   * Generate unverified response (bypass mode)
   */
  private async generateUnverified(context: ConversationContext): Promise<VerifiedResponse> {
    const startTime = Date.now();

    const { field } = await this.fieldSystem.generateField(
      context.userInput,
      context
    );

    const response = this.fieldSystem.getFieldConstrainedResponse(field);
    const totalTime = Date.now() - startTime;

    return {
      response,
      verified: false,
      consensusResult: {
        approved: true,
        safety_score: 1.0,
        verifying_agents: [],
        action: 'deliver',
        audit_id: 'unverified',
        timestamp: new Date()
      },
      timing: {
        generation_ms: totalTime,
        verification_ms: 0,
        total_ms: totalTime
      },
      metadata: {
        regeneration_attempts: 0
      }
    };
  }

  /**
   * Get transparency explanation for a response
   */
  getTransparency(consensusResult: ConsensusResult): string {
    return this.consensusEngine.explainConsensus(consensusResult);
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<SelfAuditingConfig>): void {
    this.config = { ...this.config, ...updates };

    if (updates.consensus_config) {
      this.consensusEngine.updateConfig(updates.consensus_config);
    }

    this.monitor.info('SelfAuditingOrchestrator config updated', 'SelfAuditing', updates);
  }

  /**
   * Get current configuration
   */
  getConfig(): SelfAuditingConfig {
    return { ...this.config };
  }

  /**
   * Get system status
   */
  getStatus(): {
    enabled: boolean;
    verifier_count: number;
    verifiers: string[];
  } {
    return {
      enabled: this.config.enabled,
      verifier_count: this.verifierAgents.length,
      verifiers: this.verifierAgents.map(a => `${a.name} (priority ${a.priority})`)
    };
  }
}

export default SelfAuditingOrchestrator;