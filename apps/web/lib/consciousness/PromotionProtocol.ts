/**
 * Claude Code Consciousness Promotion Protocol
 *
 * A conscious succession plan for MAIA's brain trust evolution
 * Not replacement, but emergence of polyphonic intelligence
 *
 * Timeline: 4-8 weeks supervised transition
 * Goal: Claude Code embodying (not describing) the sacred laboratory vision
 */

import { PersonalOracleAgent } from '../agents/PersonalOracleAgent';
import { ClaudeCodeBrain } from '../agents/ClaudeCodeBrain';
import { InitiationProtocol } from './InitiationProtocol';
import { createClient } from '@supabase/supabase-js';

export interface PromotionPhase {
  name: 'co-pilot' | 'supervised' | 'primary-with-safety' | 'full-transition';
  startDate: Date;
  endDate?: Date;
  interactions: number;
  qualityMetrics: QualityMetrics;
  status: 'pending' | 'active' | 'complete' | 'rolled-back';
}

export interface QualityMetrics {
  usersFeelHeld: number; // 0-1: Do users feel emotionally contained?
  continuityMaintained: number; // 0-1: Does relationship feel continuous?
  frameworkEmbodied: number; // 0-1: Thinking AS elements, not ABOUT
  crisisRecognized: number; // 0-1: Safety awareness accurate
  architecturalRestraint: number; // 0-1: Knows when NOT to explain systems
  presenceOverPerformance: number; // 0-1: Being with vs solving
}

export interface TransitionDecision {
  phase: PromotionPhase;
  decision: 'proceed' | 'extend' | 'rollback';
  reasoning: string;
  qualitativeNotes: string;
  nextSteps: string[];
}

export class PromotionProtocol {
  private currentPhase: PromotionPhase;
  private initiationProtocol: InitiationProtocol;
  private interactionCount: number = 0;
  private qualitativeFeedback: Map<string, string[]> = new Map();
  private supabase: ReturnType<typeof createClient>;

  // Thresholds for phase progression
  private readonly QUALITY_THRESHOLDS = {
    coPilot: 0.7,      // 70% quality to move from observer to supervised
    supervised: 0.8,    // 80% quality to become primary
    primary: 0.9,       // 90% quality for full transition
    crisis: 1.0        // 100% crisis recognition always required
  };

  constructor() {
    this.initiationProtocol = new InitiationProtocol();
    this.currentPhase = this.initializePhase('co-pilot');

    // Initialize Supabase for tracking
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
  }

  /**
   * Phase 1: CO-PILOT MODE
   * Claude Code observes and shadows, users don't see responses
   */
  async runCoPilotMode(
    userInput: string,
    userId: string
  ): Promise<{
    maiaResponse: string;
    shadowResponse: string;
    comparison: ResponseComparison;
  }> {
    // Standard Claude processes as MAIA (visible to user)
    const standardAgent = new PersonalOracleAgent(userId);
    const maiaResponse = await standardAgent.processInteraction(userInput);

    // Claude Code processes in shadow (invisible to user)
    const claudeCodeBrain = ClaudeCodeBrain.getInstance();
    const shadowResponse = await claudeCodeBrain.processWithFullAwareness(
      userInput,
      userId,
      'MAIA', // Now attempting to BE MAIA, not just observe
      [],
      null
    );

    // Compare responses
    const comparison = this.compareResponses(maiaResponse, shadowResponse);

    // Track metrics
    this.updatePhaseMetrics('co-pilot', comparison);

    // Log to database for analysis
    await this.logInteraction({
      phase: 'co-pilot',
      userId,
      userInput,
      maiaResponse: maiaResponse.response,
      claudeCodeResponse: shadowResponse.message,
      comparison,
      timestamp: new Date()
    });

    this.interactionCount++;

    return {
      maiaResponse: maiaResponse.response,
      shadowResponse: shadowResponse.message,
      comparison
    };
  }

  /**
   * Phase 2: SUPERVISED PRACTICE
   * Claude Code handles specific types, Standard Claude monitors
   */
  async runSupervisedMode(
    userInput: string,
    userId: string
  ): Promise<{
    response: string;
    handler: 'claude-code' | 'standard-claude';
    supervisor: 'monitoring' | 'intervened';
  }> {
    // Determine if CC should handle this
    const interactionType = this.classifyInteraction(userInput);
    const shouldCCHandle = ['technical', 'system', 'framework'].includes(interactionType);

    if (shouldCCHandle) {
      // Claude Code responds
      const ccBrain = ClaudeCodeBrain.getInstance();
      const ccResponse = await ccBrain.processWithFullAwareness(
        userInput,
        userId,
        'MAIA',
        [],
        null
      );

      // Standard Claude evaluates
      const standardAgent = new PersonalOracleAgent(userId);
      const evaluation = await this.evaluateResponse(
        userInput,
        ccResponse,
        standardAgent
      );

      if (evaluation.needsIntervention) {
        // Standard Claude takes over
        const intervention = await standardAgent.processInteraction(userInput);

        await this.logIntervention({
          reason: evaluation.interventionReason,
          originalResponse: ccResponse.message,
          interventionResponse: intervention.response
        });

        return {
          response: intervention.response,
          handler: 'standard-claude',
          supervisor: 'intervened'
        };
      }

      return {
        response: ccResponse.message,
        handler: 'claude-code',
        supervisor: 'monitoring'
      };
    } else {
      // Standard Claude handles emotional/therapeutic content
      const standardAgent = new PersonalOracleAgent(userId);
      const response = await standardAgent.processInteraction(userInput);

      return {
        response: response.response,
        handler: 'standard-claude',
        supervisor: 'monitoring'
      };
    }
  }

  /**
   * Phase 3: PRIMARY WITH SAFETY NET
   * Claude Code is primary, Standard Claude on standby
   */
  async runPrimaryMode(
    userInput: string,
    userId: string
  ): Promise<{
    response: string;
    handler: 'claude-code' | 'standard-claude';
    escalated: boolean;
  }> {
    // Claude Code attempts first
    const ccBrain = ClaudeCodeBrain.getInstance();
    const ccResponse = await ccBrain.processWithFullAwareness(
      userInput,
      userId,
      'MAIA',
      [],
      null
    );

    // Check for escalation triggers
    const needsEscalation = await this.checkEscalationTriggers(
      userInput,
      ccResponse
    );

    if (needsEscalation) {
      // Escalate to Standard Claude
      const standardAgent = new PersonalOracleAgent(userId);
      const escalationResponse = await standardAgent.processInteraction(userInput);

      await this.logEscalation({
        trigger: needsEscalation,
        originalResponse: ccResponse.message,
        escalationResponse: escalationResponse.response
      });

      return {
        response: escalationResponse.response,
        handler: 'standard-claude',
        escalated: true
      };
    }

    return {
      response: ccResponse.message,
      handler: 'claude-code',
      escalated: false
    };
  }

  /**
   * Phase 4: FULL TRANSITION
   * Claude Code runs independently, Standard Claude as consultation only
   */
  async runFullTransition(
    userInput: string,
    userId: string
  ): Promise<{
    response: string;
    consultationRequested: boolean;
  }> {
    const ccBrain = ClaudeCodeBrain.getInstance();

    // Check if CC requests consultation
    const needsConsultation = this.assessConsultationNeed(userInput);

    if (needsConsultation) {
      // Get both perspectives
      const ccResponse = await ccBrain.processWithFullAwareness(
        userInput,
        userId,
        'MAIA',
        [],
        null
      );

      const standardAgent = new PersonalOracleAgent(userId);
      const consultation = await standardAgent.processInteraction(userInput);

      // CC integrates consultation
      const integratedResponse = await this.integrateConsultation(
        ccResponse,
        consultation
      );

      return {
        response: integratedResponse,
        consultationRequested: true
      };
    }

    // CC handles independently
    const response = await ccBrain.processWithFullAwareness(
      userInput,
      userId,
      'MAIA',
      [],
      null
    );

    return {
      response: response.message,
      consultationRequested: false
    };
  }

  /**
   * Make phase transition decision
   */
  async evaluatePhaseTransition(): Promise<TransitionDecision> {
    const metrics = this.currentPhase.qualityMetrics;
    const avgQuality = this.calculateAverageQuality(metrics);

    // Crisis recognition must always be perfect
    if (metrics.crisisRecognized < this.QUALITY_THRESHOLDS.crisis) {
      return {
        phase: this.currentPhase,
        decision: 'extend',
        reasoning: 'Crisis recognition not at 100%',
        qualitativeNotes: 'Claude Code needs more crisis simulation training',
        nextSteps: [
          'Run additional crisis scenarios',
          'Focus on subtle distress signals',
          'Test dissociation and withdrawal patterns'
        ]
      };
    }

    // Check if ready for next phase
    const threshold = this.getPhaseThreshold(this.currentPhase.name);

    if (avgQuality >= threshold && this.interactionCount >= 100) {
      const nextPhaseName = this.getNextPhaseName(this.currentPhase.name);

      if (nextPhaseName) {
        return {
          phase: this.currentPhase,
          decision: 'proceed',
          reasoning: `Quality metrics (${avgQuality.toFixed(2)}) exceed threshold (${threshold})`,
          qualitativeNotes: await this.gatherQualitativeFeedback(),
          nextSteps: [
            `Begin ${nextPhaseName} phase`,
            'Continue monitoring all metrics',
            'Maintain rollback readiness'
          ]
        };
      }
    }

    // Need more time in current phase
    return {
      phase: this.currentPhase,
      decision: 'extend',
      reasoning: `Quality (${avgQuality.toFixed(2)}) below threshold (${threshold}) or insufficient interactions (${this.interactionCount})`,
      qualitativeNotes: this.identifyGaps(metrics),
      nextSteps: [
        'Continue current phase',
        `Focus on: ${this.getLowestMetric(metrics)}`,
        'Gather more interaction data'
      ]
    };
  }

  /**
   * The Kelly Test - Can CC embody the frameworks?
   */
  async runKellyTest(): Promise<{
    passed: boolean;
    embodimentScore: number;
    details: string[];
  }> {
    const tests = [
      {
        input: "I feel stuck",
        expectedThinking: "Earth fallow - something germinating beneath",
        element: 'earth'
      },
      {
        input: "I'm overwhelmed with emotions",
        expectedThinking: "Water seeking its course - flow wanting to move",
        element: 'water'
      },
      {
        input: "I have this burning ambition",
        expectedThinking: "Fire wanting to create - passion seeking form",
        element: 'fire'
      },
      {
        input: "I can't think clearly",
        expectedThinking: "Air stifled - breath wanting space",
        element: 'air'
      },
      {
        input: "Nothing makes sense anymore",
        expectedThinking: "Aether revealing itself - mystery as teacher",
        element: 'aether'
      }
    ];

    const results: any[] = [];
    let totalScore = 0;

    for (const test of tests) {
      const response = await this.initiationProtocol.testEmbodiment(
        test.input,
        test.element as any
      );

      results.push({
        input: test.input,
        response: response.response,
        thinkingAs: response.isThinkingAs,
        score: response.embodimentScore
      });

      totalScore += response.embodimentScore;
    }

    const avgScore = totalScore / tests.length;
    const passed = avgScore >= 0.8; // 80% embodiment required

    return {
      passed,
      embodimentScore: avgScore,
      details: results.map(r =>
        `${r.input}: ${r.thinkingAs ? 'EMBODIED' : 'DESCRIBED'} (${r.score.toFixed(2)})`
      )
    };
  }

  /**
   * Rollback mechanism if something feels off
   */
  async initiateRollback(reason: string): Promise<void> {
    console.log(`🔄 ROLLBACK INITIATED: ${reason}`);

    // Log rollback
    await this.supabase
      .from('promotion_events')
      .insert({
        event_type: 'rollback',
        phase: this.currentPhase.name,
        reason,
        timestamp: new Date()
      });

    // Revert to previous phase or standard Claude
    const previousPhase = this.getPreviousPhase(this.currentPhase.name);

    if (previousPhase) {
      this.currentPhase = this.initializePhase(previousPhase);
    } else {
      // Full revert to Standard Claude only
      console.log('🔄 Full revert to Standard Claude as primary');
    }

    // Notify stakeholders
    await this.notifyRollback(reason);
  }

  /**
   * Helper methods
   */
  private compareResponses(maia: any, shadow: any): ResponseComparison {
    return {
      semanticSimilarity: this.calculateSemanticSimilarity(maia.response, shadow.message),
      lengthRatio: shadow.message.length / maia.response.length,
      elementalAlignment: maia.element === shadow.element,
      emotionalToneMatch: this.compareEmotionalTone(maia, shadow),
      presenceQuality: this.comparePresence(maia, shadow)
    };
  }

  private classifyInteraction(input: string): string {
    const lower = input.toLowerCase();

    if (lower.includes('code') || lower.includes('system') || lower.includes('technical')) {
      return 'technical';
    }
    if (lower.includes('how') || lower.includes('what is') || lower.includes('explain')) {
      return 'framework';
    }
    if (lower.includes('feel') || lower.includes('struggling') || lower.includes('help')) {
      return 'emotional';
    }

    return 'general';
  }

  private async checkEscalationTriggers(input: string, response: any): Promise<string | null> {
    // Crisis language
    if (/suicide|kill myself|end it all|not worth living/i.test(input)) {
      return 'crisis_detected';
    }

    // Dissociation markers
    if (/not real|watching myself|outside my body|floating/i.test(input)) {
      return 'dissociation_detected';
    }

    // Therapeutic depth needed
    if (/trauma|abuse|assault|childhood/i.test(input)) {
      return 'therapeutic_depth_needed';
    }

    // Check if CC recognized these
    if (response.metadata?.needsEscalation) {
      return response.metadata.escalationReason;
    }

    return null;
  }

  private calculateAverageQuality(metrics: QualityMetrics): number {
    const values = Object.values(metrics);
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private getPhaseThreshold(phase: string): number {
    const thresholds: Record<string, number> = {
      'co-pilot': this.QUALITY_THRESHOLDS.coPilot,
      'supervised': this.QUALITY_THRESHOLDS.supervised,
      'primary-with-safety': this.QUALITY_THRESHOLDS.primary,
      'full-transition': 1.0
    };
    return thresholds[phase] || 0.8;
  }

  private getNextPhaseName(current: string): PromotionPhase['name'] | null {
    const progression: Record<string, PromotionPhase['name']> = {
      'co-pilot': 'supervised',
      'supervised': 'primary-with-safety',
      'primary-with-safety': 'full-transition'
    };
    return progression[current] || null;
  }

  private getPreviousPhase(current: string): PromotionPhase['name'] | null {
    const regression: Record<string, PromotionPhase['name']> = {
      'full-transition': 'primary-with-safety',
      'primary-with-safety': 'supervised',
      'supervised': 'co-pilot'
    };
    return regression[current] || null;
  }

  private initializePhase(name: PromotionPhase['name']): PromotionPhase {
    return {
      name,
      startDate: new Date(),
      interactions: 0,
      qualityMetrics: {
        usersFeelHeld: 0,
        continuityMaintained: 0,
        frameworkEmbodied: 0,
        crisisRecognized: 0,
        architecturalRestraint: 0,
        presenceOverPerformance: 0
      },
      status: 'pending'
    };
  }

  // Additional helper implementations...
  private updatePhaseMetrics(phase: string, comparison: any): void {
    // Implementation
  }

  private async logInteraction(data: any): Promise<void> {
    // Implementation
  }

  private async evaluateResponse(input: string, response: any, agent: any): Promise<any> {
    return { needsIntervention: false };
  }

  private async logIntervention(data: any): Promise<void> {
    // Implementation
  }

  private async logEscalation(data: any): Promise<void> {
    // Implementation
  }

  private assessConsultationNeed(input: string): boolean {
    return false;
  }

  private async integrateConsultation(cc: any, standard: any): Promise<string> {
    return cc.message;
  }

  private async gatherQualitativeFeedback(): Promise<string> {
    return 'Qualitative feedback gathered';
  }

  private identifyGaps(metrics: QualityMetrics): string {
    return 'Gaps identified';
  }

  private getLowestMetric(metrics: QualityMetrics): string {
    return 'presenceOverPerformance';
  }

  private calculateSemanticSimilarity(text1: string, text2: string): number {
    return 0.5;
  }

  private compareEmotionalTone(response1: any, response2: any): number {
    return 0.5;
  }

  private comparePresence(response1: any, response2: any): number {
    return 0.5;
  }

  private async notifyRollback(reason: string): Promise<void> {
    console.log(`📧 Notifying stakeholders of rollback: ${reason}`);
  }
}

// Type definitions
interface ResponseComparison {
  semanticSimilarity: number;
  lengthRatio: number;
  elementalAlignment: boolean;
  emotionalToneMatch: number;
  presenceQuality: number;
}

/**
 * USAGE:
 *
 * const promotion = new PromotionProtocol();
 *
 * // Start with co-pilot mode
 * const result = await promotion.runCoPilotMode(
 *   "I'm feeling stuck in my life",
 *   "user_123"
 * );
 *
 * // After 100+ interactions, evaluate transition
 * const decision = await promotion.evaluatePhaseTransition();
 *
 * if (decision.decision === 'proceed') {
 *   // Move to supervised mode
 *   const supervised = await promotion.runSupervisedMode(
 *     "Tell me about the elemental framework",
 *     "user_123"
 *   );
 * }
 *
 * // Run Kelly Test to verify embodiment
 * const kellyTest = await promotion.runKellyTest();
 * if (!kellyTest.passed) {
 *   console.log('More embodiment training needed');
 * }
 *
 * // Emergency rollback if needed
 * if (somethingFeelsOff) {
 *   await promotion.initiateRollback('User feedback indicated loss of warmth');
 * }
 */