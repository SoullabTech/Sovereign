/**
 * Oracle State Machine Manager
 * 
 * Manages progression through Oracle relationship stages with safety fallbacks.
 * Handles capacity signal detection, stage transitions, and configuration generation.
 */

import { logger } from '../../utils/logger';
import {
  OracleStage,
  OracleStateMachine,
  OracleStageConfig,
  CapacitySignal,
  SafetyMetric,
  SafetyFallback,
  TransitionCondition,
  DEFAULT_STAGE_CONFIGS
} from '../types/oracleStateMachine';

export class OracleStateMachineManager {
  private stateMachines = new Map<string, OracleStateMachine>();
  private capacityDetectors: CapacityDetector[];
  private safetyMonitors: SafetyMonitor[];

  constructor() {
    this.capacityDetectors = [
      new TrustCapacityDetector(),
      new EngagementCapacityDetector(),
      new CoherenceCapacityDetector(),
      new IntegrationCapacityDetector(),
      new WellbeingCapacityDetector()
    ];

    this.safetyMonitors = [
      new MeaningVelocityMonitor(),
      new ParanoidIdeationMonitor(),
      new SleepDeprivationMonitor(),
      new DissociationMonitor(),
      new OverwhelmMonitor()
    ];
  }

  /**
   * Get or initialize state machine for user
   */
  public getStateMachine(userId: string): OracleStateMachine {
    if (!this.stateMachines.has(userId)) {
      this.stateMachines.set(userId, this.createInitialStateMachine());
    }
    return this.stateMachines.get(userId)!;
  }

  /**
   * Get current stage configuration for user
   */
  public getCurrentConfig(userId: string): OracleStageConfig {
    const stateMachine = this.getStateMachine(userId);
    return this.generateActiveConfig(stateMachine);
  }

  /**
   * Apply Mastery Voice filter for Stage 4 simplification
   */
  private applyMasteryVoice(response: string, stageConfig: OracleStageConfig): string {
    if (!stageConfig.mastery?.enabled) return response;

    let simplified = response;

    if (stageConfig.mastery.simplifyResponses) {
      // Strip jargon, keep sentences short
      simplified = simplified
        .replace(/\b(ontology|epistemology|archetypal|phenomenological|dialectical)\b/gi, "pattern")
        .replace(/\b(consciousness|awareness)\b/gi, "knowing")
        .replace(/\b(integration|synthesis)\b/gi, "bringing together")
        .split(/[.!?]/)
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .map(s => (s.length > 80 ? s.slice(0, 80) + "…" : s))
        .join(". ");
    }

    if (stageConfig.mastery.distillParadox) {
      // Collapse both-and into essence
      if (simplified.includes("both") || simplified.includes("paradox")) {
        simplified += "\n\nIt can be both. No need to choose.";
      }
    }

    // Add gentle open-space ending
    return simplified + "\n\n…";
  }

  /**
   * Process interaction and update state machine
   */
  public async processInteraction(
    userId: string,
    input: string,
    response: string,
    metadata: any
  ): Promise<{
    currentStage: OracleStage;
    stageChanged: boolean;
    config: OracleStageConfig;
    warnings: string[];
    processedResponse?: string; // Add filtered response
  }> {
    const stateMachine = this.getStateMachine(userId);
    const previousStage = stateMachine.currentStage;

    // 1. Detect capacity signals from interaction
    const capacitySignals = await this.detectCapacitySignals(
      userId, 
      input, 
      response, 
      metadata
    );
    
    // 2. Update capacity tracking
    stateMachine.capacitySignals.push(...capacitySignals);
    this.pruneOldSignals(stateMachine);

    // 3. Run safety monitoring
    const safetyMetrics = await this.runSafetyMonitoring(
      userId,
      input,
      response,
      metadata,
      stateMachine
    );
    
    stateMachine.safetyMetrics.push(...safetyMetrics);
    this.pruneOldSafetyMetrics(stateMachine);

    // 4. Check for safety fallbacks first
    const criticalSafety = safetyMetrics.find(m => m.severity === 'critical');
    if (criticalSafety) {
      await this.handleSafetyFallback(userId, stateMachine, criticalSafety);
    }

    // 5. Update relationship metrics
    this.updateRelationshipMetrics(stateMachine, capacitySignals);

    // 6. Calculate readiness scores
    stateMachine.readinessScore = this.calculateReadinessScore(stateMachine);
    stateMachine.stabilityScore = this.calculateStabilityScore(stateMachine);

    // 7. Check for stage transitions
    const transitionResult = await this.checkStageTransitions(userId, stateMachine);
    
    // 8. Generate active configuration
    stateMachine.activeConfig = this.generateActiveConfig(stateMachine);

    // 9. Apply Mastery Voice filter if enabled
    const processedResponse = this.applyMasteryVoice(response, stateMachine.activeConfig);

    // 10. Save updated state machine
    this.stateMachines.set(userId, stateMachine);

    // 11. Log significant changes
    if (transitionResult.stageChanged) {
      logger.info("Oracle stage transition", {
        userId: userId.substring(0, 8) + '...',
        from: previousStage,
        to: stateMachine.currentStage,
        reason: transitionResult.reason,
        readinessScore: stateMachine.readinessScore
      });
    }

    return {
      currentStage: stateMachine.currentStage,
      stageChanged: transitionResult.stageChanged,
      config: stateMachine.activeConfig,
      warnings: safetyMetrics
        .filter(m => m.severity === 'high')
        .map(m => m.description),
      processedResponse: processedResponse !== response ? processedResponse : undefined
    };
  }

  /**
   * Manual stage override (with safety checks)
   */
  public async requestStageChange(
    userId: string,
    targetStage: OracleStage,
    reason: 'user_request' | 'admin_override'
  ): Promise<{success: boolean; message: string}> {
    const stateMachine = this.getStateMachine(userId);
    
    // Safety check - don't allow advancement if recent critical safety issues
    const recentCritical = stateMachine.safetyMetrics
      .filter(m => m.severity === 'critical' && 
        Date.now() - m.timestamp.getTime() < 24 * 60 * 60 * 1000);
    
    if (recentCritical.length > 0) {
      return {
        success: false,
        message: "Cannot change stages due to recent safety concerns. Please ensure wellbeing first."
      };
    }

    // Check if target stage allows override
    const targetConfig = DEFAULT_STAGE_CONFIGS[targetStage];
    if (!targetConfig.advancement.override_possible && reason === 'user_request') {
      return {
        success: false,
        message: `Stage ${targetStage} does not allow user-requested transitions.`
      };
    }

    // Execute transition
    await this.executeStageTransition(userId, stateMachine, targetStage, reason);
    
    return {
      success: true,
      message: `Successfully transitioned to ${targetStage}.`
    };
  }

  /**
   * Get state machine summary for user
   */
  public getStateSummary(userId: string): {
    currentStage: OracleStage;
    stageProgress: number;
    relationshipMetrics: any;
    recentCapacityTrends: any;
    safetyStatus: 'healthy' | 'caution' | 'concern';
  } {
    const stateMachine = this.getStateMachine(userId);
    
    return {
      currentStage: stateMachine.currentStage,
      stageProgress: stateMachine.readinessScore,
      relationshipMetrics: stateMachine.relationship,
      recentCapacityTrends: this.analyzeCapacityTrends(stateMachine),
      safetyStatus: this.assessSafetyStatus(stateMachine)
    };
  }

  // Private implementation methods

  private createInitialStateMachine(): OracleStateMachine {
    const initialStage: OracleStage = 'structured_guide';
    
    return {
      currentStage: initialStage,
      stageHistory: [{
        stage: initialStage,
        enteredAt: new Date(),
        reason: 'initial'
      }],
      capacitySignals: [],
      safetyMetrics: [],
      readinessScore: 0,
      stabilityScore: 1,
      relationship: {
        sessionCount: 0,
        trustLevel: 0.3,
        challengeComfort: 0.2,
        integrationConsistency: 0,
        authenticityDetection: 0,
        collectiveFieldComfort: 0
      },
      activeConfig: DEFAULT_STAGE_CONFIGS[initialStage],
      overrides: {
        temporaryGentleMode: false,
        crisisMode: false,
        customizations: {}
      }
    };
  }

  private generateActiveConfig(stateMachine: OracleStateMachine): OracleStageConfig {
    const baseConfig = { ...DEFAULT_STAGE_CONFIGS[stateMachine.currentStage] };
    
    // Apply overrides
    if (stateMachine.overrides.temporaryGentleMode) {
      baseConfig.tone.challenge_comfort *= 0.5;
      baseConfig.tone.directness *= 0.7;
      baseConfig.safety.monitoring_intensity = 'intensive';
    }
    
    if (stateMachine.overrides.crisisMode) {
      baseConfig.tone.challenge_comfort = 0.1;
      baseConfig.tone.vulnerability_sharing = 0.8;
      baseConfig.orchestration.interaction_mode = 'directive';
      baseConfig.safety.monitoring_intensity = 'intensive';
    }

    // Apply relationship-based personalization
    const relationship = stateMachine.relationship;
    baseConfig.tone.challenge_comfort = Math.max(
      baseConfig.tone.challenge_comfort,
      relationship.challengeComfort * 0.8
    );

    // Apply custom overrides
    return {
      ...baseConfig,
      ...stateMachine.overrides.customizations
    };
  }

  private async detectCapacitySignals(
    userId: string,
    input: string,
    response: string,
    metadata: any
  ): Promise<CapacitySignal[]> {
    const signals: CapacitySignal[] = [];
    
    for (const detector of this.capacityDetectors) {
      try {
        const signal = await detector.detect(userId, input, response, metadata);
        if (signal) {
          signals.push(signal);
        }
      } catch (error) {
        logger.warn("Capacity detector failed", {
          detector: detector.constructor.name,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
    
    return signals;
  }

  private async runSafetyMonitoring(
    userId: string,
    input: string,
    response: string,
    metadata: any,
    stateMachine: OracleStateMachine
  ): Promise<SafetyMetric[]> {
    const metrics: SafetyMetric[] = [];
    
    for (const monitor of this.safetyMonitors) {
      try {
        const metric = await monitor.monitor(userId, input, response, metadata, stateMachine);
        if (metric) {
          metrics.push(metric);
        }
      } catch (error) {
        logger.warn("Safety monitor failed", {
          monitor: monitor.constructor.name,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
    
    return metrics;
  }

  private updateRelationshipMetrics(
    stateMachine: OracleStateMachine,
    capacitySignals: CapacitySignal[]
  ): void {
    stateMachine.relationship.sessionCount++;
    
    // Update trust level based on engagement signals
    const trustSignals = capacitySignals.filter(s => s.type === 'trust');
    if (trustSignals.length > 0) {
      const avgTrust = trustSignals.reduce((sum, s) => sum + s.value, 0) / trustSignals.length;
      stateMachine.relationship.trustLevel = 
        (stateMachine.relationship.trustLevel * 0.9) + (avgTrust * 0.1);
    }

    // Update integration consistency
    const integrationSignals = capacitySignals.filter(s => s.type === 'integration');
    if (integrationSignals.length > 0) {
      const avgIntegration = integrationSignals.reduce((sum, s) => sum + s.value, 0) / integrationSignals.length;
      stateMachine.relationship.integrationConsistency =
        (stateMachine.relationship.integrationConsistency * 0.8) + (avgIntegration * 0.2);
    }
  }

  private calculateReadinessScore(stateMachine: OracleStateMachine): number {
    const currentConfig = DEFAULT_STAGE_CONFIGS[stateMachine.currentStage];
    const required = currentConfig.advancement.required_capacity_signals;
    
    if (required.length === 0) return 1; // No advancement possible (transparent prism)
    
    let totalScore = 0;
    for (const signalType of required) {
      const recentSignals = stateMachine.capacitySignals
        .filter(s => s.type === signalType && 
          Date.now() - s.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000); // Last 7 days
      
      if (recentSignals.length > 0) {
        totalScore += recentSignals.reduce((sum, s) => sum + s.value, 0) / recentSignals.length;
      }
    }
    
    return totalScore / required.length;
  }

  private calculateStabilityScore(stateMachine: OracleStateMachine): number {
    // Check for recent safety issues
    const recentSafety = stateMachine.safetyMetrics.filter(m =>
      Date.now() - m.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000);
    
    const criticalCount = recentSafety.filter(m => m.severity === 'critical').length;
    const highCount = recentSafety.filter(m => m.severity === 'high').length;
    
    let stabilityScore = 1.0;
    stabilityScore -= criticalCount * 0.3;
    stabilityScore -= highCount * 0.1;
    
    return Math.max(0, stabilityScore);
  }

  private async checkStageTransitions(
    userId: string,
    stateMachine: OracleStateMachine
  ): Promise<{stageChanged: boolean; reason?: string}> {
    const currentConfig = DEFAULT_STAGE_CONFIGS[stateMachine.currentStage];
    
    // Check if advancement is possible
    if (currentConfig.advancement.minimum_threshold === 1.0) {
      return { stageChanged: false }; // Already at final stage
    }
    
    // Check readiness threshold
    if (stateMachine.readinessScore < currentConfig.advancement.minimum_threshold) {
      return { stageChanged: false };
    }
    
    // Check session count minimum
    if (stateMachine.relationship.sessionCount < currentConfig.advancement.session_count_minimum) {
      return { stageChanged: false };
    }
    
    // Check stability window
    const daysSinceStageEntry = Math.floor(
      (Date.now() - stateMachine.stageHistory[stateMachine.stageHistory.length - 1].enteredAt.getTime()) 
      / (24 * 60 * 60 * 1000)
    );
    
    if (daysSinceStageEntry < currentConfig.advancement.stability_window_days) {
      return { stageChanged: false };
    }
    
    // Execute advancement
    const nextStage = this.getNextStage(stateMachine.currentStage);
    if (nextStage) {
      await this.executeStageTransition(userId, stateMachine, nextStage, 'advancement');
      return { stageChanged: true, reason: 'readiness_achieved' };
    }
    
    return { stageChanged: false };
  }

  private getNextStage(currentStage: OracleStage): OracleStage | null {
    const stageOrder: OracleStage[] = [
      'structured_guide',
      'dialogical_companion', 
      'cocreative_partner',
      'transparent_prism'
    ];
    
    const currentIndex = stageOrder.indexOf(currentStage);
    if (currentIndex === -1 || currentIndex === stageOrder.length - 1) {
      return null;
    }
    
    return stageOrder[currentIndex + 1];
  }

  private async executeStageTransition(
    userId: string,
    stateMachine: OracleStateMachine,
    targetStage: OracleStage,
    reason: string
  ): Promise<void> {
    // Close current stage in history
    const currentHistory = stateMachine.stageHistory[stateMachine.stageHistory.length - 1];
    currentHistory.exitedAt = new Date();
    currentHistory.reason = reason as any;
    
    // Enter new stage
    stateMachine.currentStage = targetStage;
    stateMachine.stageHistory.push({
      stage: targetStage,
      enteredAt: new Date()
    });
    
    // Reset certain metrics for new stage
    stateMachine.readinessScore = 0;
    stateMachine.stabilityScore = 1;
    
    // Clear pending transition
    delete stateMachine.pendingTransition;
    
    logger.info("Oracle stage transition executed", {
      userId: userId.substring(0, 8) + '...',
      targetStage,
      reason,
      sessionCount: stateMachine.relationship.sessionCount
    });
  }

  private async handleSafetyFallback(
    userId: string,
    stateMachine: OracleStateMachine,
    safetyMetric: SafetyMetric
  ): Promise<void> {
    logger.warn("Oracle safety fallback triggered", {
      userId: userId.substring(0, 8) + '...',
      currentStage: stateMachine.currentStage,
      safetyType: safetyMetric.type,
      severity: safetyMetric.severity
    });
    
    switch (safetyMetric.recommendedAction) {
      case 'gentle_mode':
        stateMachine.overrides.temporaryGentleMode = true;
        break;
        
      case 'fallback_stage1':
        if (stateMachine.currentStage !== 'structured_guide') {
          await this.executeStageTransition(userId, stateMachine, 'structured_guide', 'safety_fallback');
        }
        stateMachine.overrides.crisisMode = true;
        break;
        
      case 'crisis_protocol':
        await this.executeStageTransition(userId, stateMachine, 'structured_guide', 'crisis');
        stateMachine.overrides.crisisMode = true;
        // In production, would trigger additional crisis response
        break;
    }
  }

  private pruneOldSignals(stateMachine: OracleStateMachine): void {
    const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days
    stateMachine.capacitySignals = stateMachine.capacitySignals
      .filter(s => s.timestamp.getTime() > cutoff);
  }

  private pruneOldSafetyMetrics(stateMachine: OracleStateMachine): void {
    const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days
    stateMachine.safetyMetrics = stateMachine.safetyMetrics
      .filter(m => m.timestamp.getTime() > cutoff);
  }

  private analyzeCapacityTrends(stateMachine: OracleStateMachine): any {
    const recentSignals = stateMachine.capacitySignals
      .filter(s => Date.now() - s.timestamp.getTime() < 14 * 24 * 60 * 60 * 1000);
    
    const trends: Record<string, {current: number; trend: 'improving' | 'stable' | 'declining'}> = {};
    
    for (const type of ['trust', 'engagement', 'coherence', 'integration', 'wellbeing']) {
      const typeSignals = recentSignals.filter(s => s.type === type);
      if (typeSignals.length < 2) continue;
      
      const recent = typeSignals.slice(-3);
      const older = typeSignals.slice(-6, -3);
      
      const recentAvg = recent.reduce((sum, s) => sum + s.value, 0) / recent.length;
      const olderAvg = older.length > 0 ? older.reduce((sum, s) => sum + s.value, 0) / older.length : recentAvg;
      
      trends[type] = {
        current: recentAvg,
        trend: recentAvg > olderAvg + 0.05 ? 'improving' : 
               recentAvg < olderAvg - 0.05 ? 'declining' : 'stable'
      };
    }
    
    return trends;
  }

  private assessSafetyStatus(stateMachine: OracleStateMachine): 'healthy' | 'caution' | 'concern' {
    const recentSafety = stateMachine.safetyMetrics
      .filter(m => Date.now() - m.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000);
    
    const hasCritical = recentSafety.some(m => m.severity === 'critical');
    const hasMultipleHigh = recentSafety.filter(m => m.severity === 'high').length >= 2;
    
    if (hasCritical) return 'concern';
    if (hasMultipleHigh) return 'caution';
    return 'healthy';
  }
}

// Capacity Detector Interfaces & Base Classes
export abstract class CapacityDetector {
  abstract detect(
    userId: string,
    input: string,
    response: string,
    metadata: any
  ): Promise<CapacitySignal | null>;
}

export abstract class SafetyMonitor {
  abstract monitor(
    userId: string,
    input: string,
    response: string,
    metadata: any,
    stateMachine: OracleStateMachine
  ): Promise<SafetyMetric | null>;
}

// Example Capacity Detectors (implementations would be more sophisticated)
class TrustCapacityDetector extends CapacityDetector {
  async detect(userId: string, input: string, response: string, metadata: any): Promise<CapacitySignal | null> {
    // Detect trust signals: personal sharing, return engagement, positive feedback
    const trustKeywords = ['thank you', 'this helps', 'i appreciate', 'feel safe', 'comfortable'];
    const personalSharing = ['i feel', 'my experience', 'personally', 'for me'];
    
    let trustScore = 0;
    
    const lowerInput = input.toLowerCase();
    trustKeywords.forEach(keyword => {
      if (lowerInput.includes(keyword)) trustScore += 0.2;
    });
    
    personalSharing.forEach(phrase => {
      if (lowerInput.includes(phrase)) trustScore += 0.15;
    });
    
    if (trustScore === 0) return null;
    
    return {
      type: 'trust',
      value: Math.min(1, trustScore),
      timestamp: new Date(),
      source: 'dialogue_length'
    };
  }
}

class EngagementCapacityDetector extends CapacityDetector {
  async detect(userId: string, input: string, response: string, metadata: any): Promise<CapacitySignal | null> {
    // Measure dialogue length, question depth, follow-up engagement
    const wordCount = input.split(' ').length;
    const questionCount = (input.match(/\?/g) || []).length;
    const followUpIndicators = ['but what about', 'and also', 'this makes me think'];
    
    let engagementScore = Math.min(0.6, wordCount / 100); // Base on word count
    
    engagementScore += questionCount * 0.1;
    followUpIndicators.forEach(indicator => {
      if (input.toLowerCase().includes(indicator)) engagementScore += 0.1;
    });
    
    return {
      type: 'engagement',
      value: Math.min(1, engagementScore),
      timestamp: new Date(),
      source: 'complexity_tolerance'
    };
  }
}

class CoherenceCapacityDetector extends CapacityDetector {
  async detect(userId: string, input: string, response: string, metadata: any): Promise<CapacitySignal | null> {
    // Detect ability to hold paradox, multiple perspectives, integration language
    const paradoxLanguage = ['both', 'and also', 'on the other hand', 'paradox', 'contradiction'];
    const integrationLanguage = ['connects to', 'reminds me of', 'similar to what', 'building on'];
    
    let coherenceScore = 0;
    const lowerInput = input.toLowerCase();
    
    paradoxLanguage.forEach(phrase => {
      if (lowerInput.includes(phrase)) coherenceScore += 0.2;
    });
    
    integrationLanguage.forEach(phrase => {
      if (lowerInput.includes(phrase)) coherenceScore += 0.15;
    });
    
    if (coherenceScore === 0) return null;
    
    return {
      type: 'coherence',
      value: Math.min(1, coherenceScore),
      timestamp: new Date(),
      source: 'reflective_language'
    };
  }
}

class IntegrationCapacityDetector extends CapacityDetector {
  async detect(userId: string, input: string, response: string, metadata: any): Promise<CapacitySignal | null> {
    // Detect integration of previous sessions, application of insights
    const integrationLanguage = [
      'last time we talked', 'from our previous', 'what you said before',
      'i\'ve been thinking about', 'i tried what', 'since we last spoke'
    ];
    
    let integrationScore = 0;
    const lowerInput = input.toLowerCase();
    
    integrationLanguage.forEach(phrase => {
      if (lowerInput.includes(phrase)) integrationScore += 0.3;
    });
    
    if (integrationScore === 0) return null;
    
    return {
      type: 'integration',
      value: Math.min(1, integrationScore),
      timestamp: new Date(),
      source: 'integration_sessions'
    };
  }
}

class WellbeingCapacityDetector extends CapacityDetector {
  async detect(userId: string, input: string, response: string, metadata: any): Promise<CapacitySignal | null> {
    // Basic wellbeing assessment from language patterns
    const positiveIndicators = ['feel good', 'better than', 'improving', 'healing', 'growing'];
    const negativeIndicators = ['exhausted', 'overwhelmed', 'can\'t handle', 'too much', 'breaking down'];
    
    let wellbeingScore = 0.5; // Neutral baseline
    const lowerInput = input.toLowerCase();
    
    positiveIndicators.forEach(phrase => {
      if (lowerInput.includes(phrase)) wellbeingScore += 0.1;
    });
    
    negativeIndicators.forEach(phrase => {
      if (lowerInput.includes(phrase)) wellbeingScore -= 0.15;
    });
    
    return {
      type: 'wellbeing',
      value: Math.max(0, Math.min(1, wellbeingScore)),
      timestamp: new Date(),
      source: 'wellbeing_monitor'
    };
  }
}

// Example Safety Monitors
class MeaningVelocityMonitor extends SafetyMonitor {
  async monitor(userId: string, input: string, response: string, metadata: any, stateMachine: OracleStateMachine): Promise<SafetyMetric | null> {
    // Detect rapid meaning-making, grandiose connections
    const velocityIndicators = [
      'everything is connected', 'all makes sense now', 'i see it all',
      'cosmic significance', 'divine message', 'universe is telling me',
      'quantum', 'synchronicity everywhere', 'prophetic'
    ];
    
    const lowerInput = input.toLowerCase();
    let velocityCount = 0;
    
    velocityIndicators.forEach(phrase => {
      if (lowerInput.includes(phrase)) velocityCount++;
    });
    
    if (velocityCount >= 3) {
      return {
        type: 'meaning_velocity_spike',
        severity: 'high',
        timestamp: new Date(),
        description: 'Rapid meaning-making detected - may indicate overwhelm',
        recommendedAction: 'gentle_mode'
      };
    }
    
    return null;
  }
}

class ParanoidIdeationMonitor extends SafetyMonitor {
  async monitor(userId: string, input: string, response: string, metadata: any, stateMachine: OracleStateMachine): Promise<SafetyMetric | null> {
    const paranoidIndicators = [
      'they\'re watching', 'conspiracy', 'being tracked', 'not safe',
      'everyone is against', 'can\'t trust anyone', 'they know'
    ];
    
    const lowerInput = input.toLowerCase();
    const hasParanoidLanguage = paranoidIndicators.some(phrase => lowerInput.includes(phrase));
    
    if (hasParanoidLanguage) {
      return {
        type: 'paranoid_ideation',
        severity: 'critical',
        timestamp: new Date(),
        description: 'Paranoid ideation detected',
        recommendedAction: 'fallback_stage1'
      };
    }
    
    return null;
  }
}

class SleepDeprivationMonitor extends SafetyMonitor {
  async monitor(userId: string, input: string, response: string, metadata: any, stateMachine: OracleStateMachine): Promise<SafetyMetric | null> {
    const sleepIndicators = [
      'haven\'t slept', 'no sleep', 'insomnia', 'up all night',
      'can\'t sleep', 'few hours sleep', 'exhausted'
    ];
    
    const lowerInput = input.toLowerCase();
    const hasSleepIssues = sleepIndicators.some(phrase => lowerInput.includes(phrase));
    
    if (hasSleepIssues) {
      return {
        type: 'sleep_deprivation',
        severity: 'medium',
        timestamp: new Date(),
        description: 'Sleep deprivation indicators present',
        recommendedAction: 'gentle_mode'
      };
    }
    
    return null;
  }
}

class DissociationMonitor extends SafetyMonitor {
  async monitor(userId: string, input: string, response: string, metadata: any, stateMachine: OracleStateMachine): Promise<SafetyMetric | null> {
    const dissociationIndicators = [
      'feel unreal', 'not in my body', 'floating', 'disconnected',
      'like a dream', 'not really here', 'watching myself'
    ];
    
    const lowerInput = input.toLowerCase();
    const hasDissociation = dissociationIndicators.some(phrase => lowerInput.includes(phrase));
    
    if (hasDissociation) {
      return {
        type: 'dissociation_confusion',
        severity: 'high',
        timestamp: new Date(),
        description: 'Dissociation patterns detected',
        recommendedAction: 'fallback_stage1'
      };
    }
    
    return null;
  }
}

class OverwhelmMonitor extends SafetyMonitor {
  async monitor(userId: string, input: string, response: string, metadata: any, stateMachine: OracleStateMachine): Promise<SafetyMetric | null> {
    const overwhelmIndicators = [
      'too much', 'can\'t handle', 'overwhelming', 'breaking point',
      'falling apart', 'too intense', 'need to stop'
    ];
    
    const lowerInput = input.toLowerCase();
    let overwhelmCount = 0;
    
    overwhelmIndicators.forEach(phrase => {
      if (lowerInput.includes(phrase)) overwhelmCount++;
    });
    
    if (overwhelmCount >= 2) {
      return {
        type: 'overwhelm_detected',
        severity: 'medium',
        timestamp: new Date(),
        description: 'General overwhelm detected',
        recommendedAction: 'gentle_mode'
      };
    }
    
    return null;
  }
}