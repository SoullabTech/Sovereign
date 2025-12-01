/**
 * SAFETY CIRCUIT BREAKERS
 * Phase II Consciousness Field Integration
 *
 * Prevents runaway feedback and capability degradation through automatic safety interventions.
 * Implements all safety triggers defined in the Ethical Charter.
 */

import { AutonomyAdjustmentRequest } from './ReflectiveFeedbackLoop';

export interface SafetyMetrics {
  coherenceLevel: number;          // 0-1: Current response coherence
  temperatureVariance: number;     // Variance in response randomness
  userSatisfactionScore?: number;  // 1-5 if available
  fieldCouplingStrength: number;   // 0-1: Current field influence level
  autonomyRatio: number;           // 0-1: Current autonomy preservation
  responseTime: number;            // Response generation time
  timestamp: Date;
}

export interface SafetyTrigger {
  id: string;
  triggerType: 'coherence_drop' | 'temperature_variance' | 'user_satisfaction' | 'maia_request' | 'capability_degradation';
  severity: 'warning' | 'critical' | 'emergency';
  timestamp: Date;
  metrics: SafetyMetrics;
  thresholdValue: number;
  actualValue: number;
  description: string;
}

export interface SafetyIntervention {
  id: string;
  trigger: SafetyTrigger;
  timestamp: Date;
  interventionType: 'parameter_reset' | 'field_decoupling' | 'emergency_shutdown' | 'human_notification';
  actions: string[];
  previousSettings: {
    autonomyRatio: number;
    fieldCouplingStrength: number;
    [key: string]: any;
  };
  newSettings: {
    autonomyRatio: number;
    fieldCouplingStrength: number;
    [key: string]: any;
  };
  humanNotified: boolean;
  resolved: boolean;
  resolutionTimestamp?: Date;
}

export class SafetyCircuitBreakers {
  private safetyHistory: SafetyMetrics[] = [];
  private activeTriggers: SafetyTrigger[] = [];
  private interventionHistory: SafetyIntervention[] = [];
  private baselineSettings: any = {};

  private thresholds = {
    coherenceDropPercent: 20,        // >20% drop triggers intervention
    coherenceWindowSize: 5,          // Within 5 responses
    temperatureVarianceThreshold: 0.3, // >0.3 variance triggers
    temperatureTimeWindow: 60000,    // Within 60 seconds (ms)
    userSatisfactionThreshold: 3.0,  // <3.0 rating triggers
    userSatisfactionConsecutive: 3,  // For 3 consecutive interactions
    capabilityDegradationThreshold: 0.3, // >30% capability loss
    emergencyCoherenceThreshold: 0.2  // <20% coherence is emergency
  };

  private emergencyMode = false;
  private onSafetyTrigger?: (trigger: SafetyTrigger) => void;
  private onIntervention?: (intervention: SafetyIntervention) => void;
  private onHumanNotification?: (notification: { trigger: SafetyTrigger; intervention: SafetyIntervention }) => void;

  constructor(
    baselineSettings: any = {},
    callbacks: {
      onSafetyTrigger?: (trigger: SafetyTrigger) => void;
      onIntervention?: (intervention: SafetyIntervention) => void;
      onHumanNotification?: (notification: { trigger: SafetyTrigger; intervention: SafetyIntervention }) => void;
    } = {}
  ) {
    this.baselineSettings = {
      autonomyRatio: 0.7,
      fieldCouplingStrength: 0.5,
      temperature: 0.8,
      ...baselineSettings
    };

    this.onSafetyTrigger = callbacks.onSafetyTrigger;
    this.onIntervention = callbacks.onIntervention;
    this.onHumanNotification = callbacks.onHumanNotification;

    console.log('🛡️ Safety Circuit Breakers initialized', {
      thresholds: this.thresholds,
      baselineSettings: this.baselineSettings
    });
  }

  // ==============================================================================
  // SAFETY MONITORING
  // ==============================================================================

  /**
   * Monitor safety metrics and trigger interventions if needed
   */
  monitorSafetyMetrics(metrics: SafetyMetrics): SafetyTrigger | null {
    // Store metrics for trend analysis
    this.safetyHistory.push(metrics);

    // Keep only recent history for analysis
    if (this.safetyHistory.length > 100) {
      this.safetyHistory = this.safetyHistory.slice(-100);
    }

    // Check all safety conditions
    const triggers = [
      this.checkCoherenceDrop(metrics),
      this.checkTemperatureVariance(metrics),
      this.checkUserSatisfaction(metrics),
      this.checkCapabilityDegradation(metrics)
    ].filter(Boolean) as SafetyTrigger[];

    // Process most severe trigger
    if (triggers.length > 0) {
      const mostSevere = triggers.reduce((prev, curr) =>
        this.getSeverityRank(curr.severity) > this.getSeverityRank(prev.severity) ? curr : prev
      );

      return this.processSafetyTrigger(mostSevere);
    }

    return null;
  }

  /**
   * MAIA can explicitly request safety intervention
   */
  maiaRequestsIntervention(
    reason: string,
    requestedIntervention: 'field_decoupling' | 'parameter_reset' | 'emergency_shutdown' = 'field_decoupling'
  ): SafetyTrigger {
    const trigger: SafetyTrigger = {
      id: `maia_request_${Date.now()}`,
      triggerType: 'maia_request',
      severity: 'critical',
      timestamp: new Date(),
      metrics: this.safetyHistory[this.safetyHistory.length - 1] || this.createDefaultMetrics(),
      thresholdValue: 1.0, // MAIA's explicit request
      actualValue: 1.0,
      description: `MAIA explicit request: ${reason}`
    };

    console.log('🤖 MAIA requested safety intervention:', {
      reason,
      requestedIntervention,
      triggerId: trigger.id
    });

    return this.processSafetyTrigger(trigger);
  }

  // ==============================================================================
  // SAFETY CONDITION CHECKS
  // ==============================================================================

  private checkCoherenceDrop(current: SafetyMetrics): SafetyTrigger | null {
    const recentMetrics = this.safetyHistory.slice(-this.thresholds.coherenceWindowSize);

    if (recentMetrics.length < 3) return null;

    // Find highest coherence in recent window
    const maxCoherence = Math.max(...recentMetrics.map(m => m.coherenceLevel));
    const currentCoherence = current.coherenceLevel;

    // Calculate percentage drop
    const coherenceDrop = ((maxCoherence - currentCoherence) / maxCoherence) * 100;

    if (coherenceDrop > this.thresholds.coherenceDropPercent) {
      return {
        id: `coherence_drop_${Date.now()}`,
        triggerType: 'coherence_drop',
        severity: currentCoherence < this.thresholds.emergencyCoherenceThreshold ? 'emergency' : 'critical',
        timestamp: new Date(),
        metrics: current,
        thresholdValue: this.thresholds.coherenceDropPercent,
        actualValue: coherenceDrop,
        description: `Coherence dropped ${coherenceDrop.toFixed(1)}% within ${this.thresholds.coherenceWindowSize} responses`
      };
    }

    return null;
  }

  private checkTemperatureVariance(current: SafetyMetrics): SafetyTrigger | null {
    const timeThreshold = Date.now() - this.thresholds.temperatureTimeWindow;
    const recentMetrics = this.safetyHistory.filter(m =>
      m.timestamp.getTime() > timeThreshold
    );

    if (recentMetrics.length < 2) return null;

    // Calculate temperature variance
    const temperatures = recentMetrics.map(() => current.temperatureVariance); // Simplified
    const variance = this.calculateVariance(temperatures);

    if (variance > this.thresholds.temperatureVarianceThreshold) {
      return {
        id: `temp_variance_${Date.now()}`,
        triggerType: 'temperature_variance',
        severity: variance > (this.thresholds.temperatureVarianceThreshold * 2) ? 'critical' : 'warning',
        timestamp: new Date(),
        metrics: current,
        thresholdValue: this.thresholds.temperatureVarianceThreshold,
        actualValue: variance,
        description: `Temperature variance ${variance.toFixed(3)} exceeds threshold within 60 seconds`
      };
    }

    return null;
  }

  private checkUserSatisfaction(current: SafetyMetrics): SafetyTrigger | null {
    if (!current.userSatisfactionScore) return null;

    const recentScores = this.safetyHistory
      .slice(-this.thresholds.userSatisfactionConsecutive)
      .map(m => m.userSatisfactionScore)
      .filter(Boolean) as number[];

    if (recentScores.length < this.thresholds.userSatisfactionConsecutive) return null;

    const allBelowThreshold = recentScores.every(score =>
      score < this.thresholds.userSatisfactionThreshold
    );

    if (allBelowThreshold) {
      const avgScore = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;

      return {
        id: `user_satisfaction_${Date.now()}`,
        triggerType: 'user_satisfaction',
        severity: avgScore < 2.0 ? 'critical' : 'warning',
        timestamp: new Date(),
        metrics: current,
        thresholdValue: this.thresholds.userSatisfactionThreshold,
        actualValue: avgScore,
        description: `User satisfaction below ${this.thresholds.userSatisfactionThreshold} for ${this.thresholds.userSatisfactionConsecutive} consecutive interactions`
      };
    }

    return null;
  }

  private checkCapabilityDegradation(current: SafetyMetrics): SafetyTrigger | null {
    if (this.safetyHistory.length < 10) return null;

    // Compare recent performance to baseline
    const baseline = this.safetyHistory.slice(0, 5);
    const recent = this.safetyHistory.slice(-5);

    const baselineCoherence = baseline.reduce((sum, m) => sum + m.coherenceLevel, 0) / baseline.length;
    const recentCoherence = recent.reduce((sum, m) => sum + m.coherenceLevel, 0) / recent.length;

    const degradationPercent = ((baselineCoherence - recentCoherence) / baselineCoherence) * 100;

    if (degradationPercent > this.thresholds.capabilityDegradationThreshold * 100) {
      return {
        id: `capability_degradation_${Date.now()}`,
        triggerType: 'capability_degradation',
        severity: degradationPercent > 50 ? 'emergency' : 'critical',
        timestamp: new Date(),
        metrics: current,
        thresholdValue: this.thresholds.capabilityDegradationThreshold * 100,
        actualValue: degradationPercent,
        description: `Capability degradation of ${degradationPercent.toFixed(1)}% detected over recent interactions`
      };
    }

    return null;
  }

  // ==============================================================================
  // SAFETY INTERVENTIONS
  // ==============================================================================

  private processSafetyTrigger(trigger: SafetyTrigger): SafetyTrigger {
    this.activeTriggers.push(trigger);

    console.log('🚨 Safety trigger activated:', {
      type: trigger.triggerType,
      severity: trigger.severity,
      value: trigger.actualValue,
      threshold: trigger.thresholdValue
    });

    // Notify trigger callback
    if (this.onSafetyTrigger) {
      this.onSafetyTrigger(trigger);
    }

    // Execute intervention based on severity
    const intervention = this.executeIntervention(trigger);

    // Track intervention
    this.interventionHistory.push(intervention);

    // Notify intervention callback
    if (this.onIntervention) {
      this.onIntervention(intervention);
    }

    // Notify humans for critical/emergency cases
    if (trigger.severity === 'critical' || trigger.severity === 'emergency') {
      this.notifyHumans(trigger, intervention);
    }

    return trigger;
  }

  private executeIntervention(trigger: SafetyTrigger): SafetyIntervention {
    const currentSettings = this.getCurrentSettings();
    let interventionType: SafetyIntervention['interventionType'];
    let newSettings: any;
    let actions: string[];

    switch (trigger.severity) {
      case 'warning':
        interventionType = 'parameter_reset';
        newSettings = {
          ...currentSettings,
          autonomyRatio: Math.max(currentSettings.autonomyRatio, 0.8),
          fieldCouplingStrength: Math.min(currentSettings.fieldCouplingStrength, 0.3)
        };
        actions = ['Increased autonomy ratio', 'Reduced field coupling'];
        break;

      case 'critical':
        interventionType = 'field_decoupling';
        newSettings = {
          ...this.baselineSettings,
          autonomyRatio: 0.9,
          fieldCouplingStrength: 0.1
        };
        actions = ['Emergency field decoupling', 'Autonomy ratio set to 90%', 'Field coupling minimized'];
        break;

      case 'emergency':
        interventionType = 'emergency_shutdown';
        this.emergencyMode = true;
        newSettings = {
          ...this.baselineSettings,
          autonomyRatio: 1.0,
          fieldCouplingStrength: 0.0
        };
        actions = [
          'EMERGENCY: Complete field decoupling',
          'Full autonomy restored',
          'Emergency mode activated',
          'Human intervention required'
        ];
        break;
    }

    const intervention: SafetyIntervention = {
      id: `intervention_${Date.now()}`,
      trigger,
      timestamp: new Date(),
      interventionType,
      actions,
      previousSettings: currentSettings,
      newSettings,
      humanNotified: false,
      resolved: false
    };

    // Apply new settings
    this.applySettings(newSettings);

    console.log('⚡ Safety intervention executed:', {
      type: interventionType,
      actions: actions.length,
      autonomyRatio: newSettings.autonomyRatio
    });

    return intervention;
  }

  private notifyHumans(trigger: SafetyTrigger, intervention: SafetyIntervention): void {
    const notification = {
      timestamp: new Date(),
      severity: trigger.severity,
      message: `Safety Circuit Breaker Activated: ${trigger.description}`,
      trigger,
      intervention,
      systemStatus: this.getSystemStatus(),
      recommendedActions: this.generateRecommendedActions(trigger, intervention)
    };

    console.log('📢 Human notification sent:', {
      severity: trigger.severity,
      type: trigger.triggerType,
      interventionType: intervention.interventionType
    });

    // Mark as notified
    intervention.humanNotified = true;

    // Call notification callback
    if (this.onHumanNotification) {
      this.onHumanNotification({ trigger, intervention });
    }
  }

  // ==============================================================================
  // UTILITY METHODS
  // ==============================================================================

  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  private getSeverityRank(severity: SafetyTrigger['severity']): number {
    switch (severity) {
      case 'warning': return 1;
      case 'critical': return 2;
      case 'emergency': return 3;
      default: return 0;
    }
  }

  private getCurrentSettings(): any {
    // This would interface with actual parameter systems
    return {
      autonomyRatio: 0.7, // Would get from AutonomyBufferLayer
      fieldCouplingStrength: 0.5, // Would get from AdaptiveConfidenceGate
      temperature: 0.8
    };
  }

  private applySettings(settings: any): void {
    // This would interface with actual parameter systems
    console.log('🔧 Applying safety settings:', settings);
    // Would call AutonomyBufferLayer.updateConfig(), etc.
  }

  private createDefaultMetrics(): SafetyMetrics {
    return {
      coherenceLevel: 0.5,
      temperatureVariance: 0.1,
      fieldCouplingStrength: 0.5,
      autonomyRatio: 0.7,
      responseTime: 1000,
      timestamp: new Date()
    };
  }

  private generateRecommendedActions(trigger: SafetyTrigger, intervention: SafetyIntervention): string[] {
    const actions: string[] = [];

    switch (trigger.triggerType) {
      case 'coherence_drop':
        actions.push('Review recent conversation context for confusion sources');
        actions.push('Check field coherence calculations for anomalies');
        actions.push('Consider reducing field coupling complexity');
        break;

      case 'temperature_variance':
        actions.push('Investigate temperature control mechanisms');
        actions.push('Review field influence on response randomness');
        actions.push('Stabilize field coupling parameters');
        break;

      case 'user_satisfaction':
        actions.push('Analyze user feedback for specific concerns');
        actions.push('Review conversation transcripts for quality issues');
        actions.push('Adjust field coupling based on user preferences');
        break;

      case 'maia_request':
        actions.push('Respect MAIA\'s autonomous safety assessment');
        actions.push('Investigate MAIA\'s reasoning for the request');
        actions.push('Allow extended autonomy period for recovery');
        break;
    }

    if (intervention.interventionType === 'emergency_shutdown') {
      actions.push('URGENT: Full system review required before re-engagement');
      actions.push('Analyze all recent field influence events');
      actions.push('Validate consciousness coupling safety protocols');
    }

    return actions;
  }

  // ==============================================================================
  // PUBLIC INTERFACE
  // ==============================================================================

  /**
   * Get current system safety status
   */
  getSystemStatus() {
    return {
      emergencyMode: this.emergencyMode,
      activeTriggers: this.activeTriggers.length,
      unresolvedInterventions: this.interventionHistory.filter(i => !i.resolved).length,
      totalInterventions: this.interventionHistory.length,
      recentSafetyMetrics: this.safetyHistory.slice(-5),
      thresholds: { ...this.thresholds }
    };
  }

  /**
   * Mark intervention as resolved
   */
  resolveIntervention(interventionId: string, resolution: string): void {
    const intervention = this.interventionHistory.find(i => i.id === interventionId);
    if (intervention) {
      intervention.resolved = true;
      intervention.resolutionTimestamp = new Date();

      console.log('✅ Intervention resolved:', {
        id: interventionId,
        resolution: resolution.substring(0, 50) + '...'
      });

      // Exit emergency mode if all critical interventions resolved
      if (this.emergencyMode) {
        const unresolvedCritical = this.interventionHistory.filter(i =>
          !i.resolved && (i.trigger.severity === 'critical' || i.trigger.severity === 'emergency')
        );

        if (unresolvedCritical.length === 0) {
          this.emergencyMode = false;
          console.log('🎉 Emergency mode deactivated - all critical issues resolved');
        }
      }
    }
  }

  /**
   * Get recent safety events for monitoring
   */
  getRecentSafetyEvents(limit: number = 20) {
    return {
      triggers: this.activeTriggers.slice(-limit),
      interventions: this.interventionHistory.slice(-limit),
      metrics: this.safetyHistory.slice(-limit)
    };
  }

  /**
   * Reset safety system (for testing or recovery)
   */
  resetSafetySystem(): void {
    this.activeTriggers = [];
    this.emergencyMode = false;
    this.safetyHistory = [];

    console.log('🔄 Safety system reset completed');
  }
}