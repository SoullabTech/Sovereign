/**
 * Automated Deployment Orchestrator for Crystal Observer Architecture
 *
 * This system autonomously manages the transition from legacy to Crystal,
 * adjusting weights based on real-time metrics and making deployment decisions
 * without human intervention (unless emergency conditions are met).
 */

import { createClient } from '@supabase/supabase-js';
import { EventEmitter } from 'events';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface DeploymentPhase {
  name: 'foundation' | 'hybrid' | 'transition' | 'crystal';
  targetCrystalWeight: number;
  targetAetherWeight: number;
  minCoherence: number;
  maxEmergenceRate: number;
  durationHours: number;
  successCriteria: SuccessCriteria;
}

interface SuccessCriteria {
  coherenceRatio: { min: number; target: number };
  responseTime: { p50: number; p99: number };
  errorRate: { max: number };
  emergenceQuality: { min: number };
  userSatisfaction?: { min: number };
}

interface SystemMetrics {
  coherenceRatio: number;
  aetherWeight: number;
  crystalWeight: number;
  responseTimeP50: number;
  responseTimeP99: number;
  errorRate: number;
  emergenceRate: number;
  emergenceQuality: number;
  paradoxCount: number;
  symbolicEntropy: number;
  userSatisfaction?: number;
  timestamp: Date;
}

interface DeploymentDecision {
  action: 'proceed' | 'hold' | 'rollback' | 'adjust';
  reason: string;
  adjustments?: {
    crystalWeight?: number;
    aetherWeight?: number;
  };
  confidence: number;
}

export class DeploymentOrchestrator extends EventEmitter {
  private currentPhase: DeploymentPhase;
  private phaseStartTime: Date;
  private metrics: SystemMetrics[] = [];
  private isRunning: boolean = false;
  private checkInterval: NodeJS.Timeout | null = null;
  private evolutionInterval: NodeJS.Timeout | null = null;

  private readonly phases: DeploymentPhase[] = [
    {
      name: 'foundation',
      targetCrystalWeight: 0,
      targetAetherWeight: 0.35,
      minCoherence: 0.5,
      maxEmergenceRate: 0,
      durationHours: 24,
      successCriteria: {
        coherenceRatio: { min: 0.5, target: 0.7 },
        responseTime: { p50: 300, p99: 500 },
        errorRate: { max: 0.01 },
        emergenceQuality: { min: 0 }
      }
    },
    {
      name: 'hybrid',
      targetCrystalWeight: 0.5,
      targetAetherWeight: 0.35,
      minCoherence: 0.6,
      maxEmergenceRate: 5,
      durationHours: 72,
      successCriteria: {
        coherenceRatio: { min: 0.6, target: 0.75 },
        responseTime: { p50: 250, p99: 450 },
        errorRate: { max: 0.01 },
        emergenceQuality: { min: 3.5 },
        userSatisfaction: { min: 0.8 }
      }
    },
    {
      name: 'transition',
      targetCrystalWeight: 0.9,
      targetAetherWeight: 0.38,
      minCoherence: 0.65,
      maxEmergenceRate: 10,
      durationHours: 48,
      successCriteria: {
        coherenceRatio: { min: 0.65, target: 0.8 },
        responseTime: { p50: 200, p99: 400 },
        errorRate: { max: 0.005 },
        emergenceQuality: { min: 4.0 },
        userSatisfaction: { min: 0.85 }
      }
    },
    {
      name: 'crystal',
      targetCrystalWeight: 1.0,
      targetAetherWeight: 0.35,
      minCoherence: 0.7,
      maxEmergenceRate: 15,
      durationHours: Infinity,
      successCriteria: {
        coherenceRatio: { min: 0.7, target: 0.85 },
        responseTime: { p50: 150, p99: 350 },
        errorRate: { max: 0.001 },
        emergenceQuality: { min: 4.5 },
        userSatisfaction: { min: 0.9 }
      }
    }
  ];

  constructor() {
    super();
    this.currentPhase = this.phases[0];
    this.phaseStartTime = new Date();
  }

  /**
   * Start the autonomous deployment orchestration
   */
  async start() {
    if (this.isRunning) {
      console.log('Orchestrator already running');
      return;
    }

    this.isRunning = true;
    this.emit('started', { phase: this.currentPhase.name });

    // Start monitoring metrics every 5 minutes
    this.checkInterval = setInterval(() => {
      this.checkAndEvolve();
    }, 5 * 60 * 1000); // 5 minutes

    // Start gradual evolution every 30 minutes
    this.evolutionInterval = setInterval(() => {
      this.evolveWeights();
    }, 30 * 60 * 1000); // 30 minutes

    // Initial check
    await this.checkAndEvolve();

    console.log(`Deployment orchestration started in ${this.currentPhase.name} phase`);
  }

  /**
   * Stop the orchestration
   */
  stop() {
    this.isRunning = false;
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    if (this.evolutionInterval) {
      clearInterval(this.evolutionInterval);
    }
    this.emit('stopped', { phase: this.currentPhase.name });
  }

  /**
   * Check metrics and evolve the deployment
   */
  private async checkAndEvolve() {
    try {
      // Collect current metrics
      const metrics = await this.collectMetrics();
      this.metrics.push(metrics);

      // Make deployment decision
      const decision = await this.makeDeploymentDecision(metrics);

      // Execute decision
      await this.executeDecision(decision);

      // Check for phase transition
      if (await this.shouldTransitionPhase(metrics)) {
        await this.transitionToNextPhase();
      }

      // Record orchestration event
      await this.recordOrchestrationEvent({
        phase: this.currentPhase.name,
        metrics,
        decision,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Error in orchestration check:', error);
      this.emit('error', error);
    }
  }

  /**
   * Gradually evolve weights towards target
   */
  private async evolveWeights() {
    const currentWeights = await this.getCurrentWeights();
    const targetCrystal = this.currentPhase.targetCrystalWeight;
    const targetAether = this.currentPhase.targetAetherWeight;

    // Calculate gradual adjustment (5% per evolution)
    const crystalAdjustment = (targetCrystal - currentWeights.crystal) * 0.05;
    const aetherAdjustment = (targetAether - currentWeights.aether) * 0.05;

    if (Math.abs(crystalAdjustment) > 0.01) {
      await this.updateWeight('crystal', currentWeights.crystal + crystalAdjustment);
    }

    if (Math.abs(aetherAdjustment) > 0.01) {
      await this.updateWeight('aether', currentWeights.aether + aetherAdjustment);
    }

    this.emit('weights-evolved', {
      crystal: currentWeights.crystal + crystalAdjustment,
      aether: currentWeights.aether + aetherAdjustment
    });
  }

  /**
   * Collect current system metrics
   */
  private async collectMetrics(): Promise<SystemMetrics> {
    const { data: health } = await supabase
      .from('current_health')
      .select('*')
      .single();

    const { data: performance } = await supabase
      .rpc('get_performance_metrics', {
        time_window: '5 minutes'
      });

    const { data: emergence } = await supabase
      .from('resonance_events')
      .select('*')
      .eq('event_type', 'emergence')
      .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString());

    const emergenceQuality = await this.calculateEmergenceQuality(emergence || []);

    return {
      coherenceRatio: health?.coherence_ratio || 0,
      aetherWeight: health?.aether_weight || 0.35,
      crystalWeight: await this.getCurrentCrystalWeight(),
      responseTimeP50: performance?.p50 || 500,
      responseTimeP99: performance?.p99 || 1000,
      errorRate: performance?.error_rate || 0,
      emergenceRate: emergence?.length || 0,
      emergenceQuality,
      paradoxCount: health?.paradox_count || 0,
      symbolicEntropy: health?.symbolic_entropy || 0,
      userSatisfaction: await this.getUserSatisfaction(),
      timestamp: new Date()
    };
  }

  /**
   * Make an intelligent deployment decision based on metrics
   */
  private async makeDeploymentDecision(metrics: SystemMetrics): Promise<DeploymentDecision> {
    const criteria = this.currentPhase.successCriteria;
    const issues: string[] = [];
    let confidence = 1.0;

    // Check coherence
    if (metrics.coherenceRatio < criteria.coherenceRatio.min) {
      issues.push(`Coherence below minimum (${metrics.coherenceRatio.toFixed(2)} < ${criteria.coherenceRatio.min})`);
      confidence *= 0.5;
    }

    // Check response times
    if (metrics.responseTimeP99 > criteria.responseTime.p99) {
      issues.push(`P99 response time too high (${metrics.responseTimeP99}ms > ${criteria.responseTime.p99}ms)`);
      confidence *= 0.7;
    }

    // Check error rate
    if (metrics.errorRate > criteria.errorRate.max) {
      issues.push(`Error rate exceeds threshold (${(metrics.errorRate * 100).toFixed(2)}% > ${(criteria.errorRate.max * 100).toFixed(2)}%)`);
      confidence *= 0.3;
    }

    // Check emergence quality
    if (metrics.emergenceQuality < criteria.emergenceQuality.min) {
      issues.push(`Emergence quality below target (${metrics.emergenceQuality.toFixed(1)} < ${criteria.emergenceQuality.min})`);
      confidence *= 0.8;
    }

    // Critical failure - rollback
    if (metrics.coherenceRatio < 0.4 || metrics.errorRate > 0.05) {
      return {
        action: 'rollback',
        reason: 'Critical metrics failure',
        confidence: 0
      };
    }

    // Multiple issues - hold and adjust
    if (issues.length >= 2) {
      return {
        action: 'adjust',
        reason: `Multiple issues detected: ${issues.join('; ')}`,
        adjustments: this.calculateAdjustments(metrics, criteria),
        confidence
      };
    }

    // Single issue - hold
    if (issues.length === 1) {
      return {
        action: 'hold',
        reason: issues[0],
        confidence
      };
    }

    // All good - proceed
    return {
      action: 'proceed',
      reason: 'All metrics within acceptable ranges',
      confidence
    };
  }

  /**
   * Calculate weight adjustments based on metrics
   */
  private calculateAdjustments(
    metrics: SystemMetrics,
    criteria: SuccessCriteria
  ): { crystalWeight?: number; aetherWeight?: number } {
    const adjustments: { crystalWeight?: number; aetherWeight?: number } = {};

    // If coherence is low, adjust Aether weight
    if (metrics.coherenceRatio < criteria.coherenceRatio.min) {
      // Increase Aether weight to improve coherence (max 0.5)
      adjustments.aetherWeight = Math.min(0.5, metrics.aetherWeight + 0.05);
    }

    // If response time is high with Crystal, reduce Crystal weight
    if (metrics.responseTimeP99 > criteria.responseTime.p99 && metrics.crystalWeight > 0.3) {
      adjustments.crystalWeight = metrics.crystalWeight - 0.1;
    }

    // If emergence quality is low, fine-tune Aether
    if (metrics.emergenceQuality < criteria.emergenceQuality.min) {
      // Slight Aether adjustment for better emergence
      const optimalAether = 0.35;
      const diff = optimalAether - metrics.aetherWeight;
      adjustments.aetherWeight = metrics.aetherWeight + (diff * 0.2);
    }

    return adjustments;
  }

  /**
   * Execute the deployment decision
   */
  private async executeDecision(decision: DeploymentDecision) {
    this.emit('decision', decision);

    switch (decision.action) {
      case 'rollback':
        await this.initiateRollback(decision.reason);
        break;

      case 'adjust':
        if (decision.adjustments) {
          if (decision.adjustments.crystalWeight !== undefined) {
            await this.updateWeight('crystal', decision.adjustments.crystalWeight);
          }
          if (decision.adjustments.aetherWeight !== undefined) {
            await this.updateWeight('aether', decision.adjustments.aetherWeight);
          }
        }
        break;

      case 'hold':
        // Log the hold reason but don't make changes
        console.log(`Holding deployment: ${decision.reason}`);
        break;

      case 'proceed':
        // Continue with current trajectory
        console.log('Deployment proceeding as planned');
        break;
    }

    // Record decision in database
    await supabase.from('deployment_decisions').insert({
      phase: this.currentPhase.name,
      action: decision.action,
      reason: decision.reason,
      confidence: decision.confidence,
      adjustments: decision.adjustments,
      timestamp: new Date()
    });
  }

  /**
   * Check if we should transition to the next phase
   */
  private async shouldTransitionPhase(metrics: SystemMetrics): Promise<boolean> {
    const phaseIndex = this.phases.findIndex(p => p.name === this.currentPhase.name);

    // Can't transition from final phase
    if (phaseIndex >= this.phases.length - 1) {
      return false;
    }

    const hoursInPhase = (Date.now() - this.phaseStartTime.getTime()) / (1000 * 60 * 60);

    // Haven't met minimum time in phase
    if (hoursInPhase < this.currentPhase.durationHours) {
      return false;
    }

    // Check if all success criteria are met
    const criteria = this.currentPhase.successCriteria;
    const meetsAllCriteria =
      metrics.coherenceRatio >= criteria.coherenceRatio.target &&
      metrics.responseTimeP99 <= criteria.responseTime.p99 &&
      metrics.errorRate <= criteria.errorRate.max &&
      metrics.emergenceQuality >= criteria.emergenceQuality.min;

    return meetsAllCriteria;
  }

  /**
   * Transition to the next deployment phase
   */
  private async transitionToNextPhase() {
    const currentIndex = this.phases.findIndex(p => p.name === this.currentPhase.name);
    const nextPhase = this.phases[currentIndex + 1];

    if (!nextPhase) {
      console.log('Deployment complete - Crystal phase reached');
      this.emit('deployment-complete');
      return;
    }

    console.log(`Transitioning from ${this.currentPhase.name} to ${nextPhase.name}`);

    this.currentPhase = nextPhase;
    this.phaseStartTime = new Date();

    this.emit('phase-transition', {
      from: this.phases[currentIndex].name,
      to: nextPhase.name,
      timestamp: new Date()
    });

    // Record phase transition
    await supabase.from('deployment_phases').insert({
      phase: nextPhase.name,
      started_at: new Date(),
      target_crystal_weight: nextPhase.targetCrystalWeight,
      target_aether_weight: nextPhase.targetAetherWeight
    });
  }

  /**
   * Initiate emergency rollback
   */
  private async initiateRollback(reason: string) {
    console.error(`INITIATING ROLLBACK: ${reason}`);

    // Set Crystal weight to 0
    await this.updateWeight('crystal', 0);

    // Reset to legacy mode
    await supabase.from('system_config').update({
      mode: 'legacy',
      crystal_weight: 0
    }).eq('id', 1);

    this.emit('rollback', { reason, timestamp: new Date() });

    // Stop orchestration
    this.stop();

    // Alert team
    await this.alertTeam(`EMERGENCY ROLLBACK: ${reason}`);
  }

  /**
   * Update system weight
   */
  private async updateWeight(type: 'crystal' | 'aether', value: number) {
    await supabase.from('system_config').update({
      [`${type}_weight`]: value
    }).eq('id', 1);

    console.log(`Updated ${type} weight to ${value.toFixed(2)}`);
  }

  /**
   * Get current weights from configuration
   */
  private async getCurrentWeights(): Promise<{ crystal: number; aether: number }> {
    const { data } = await supabase
      .from('system_config')
      .select('crystal_weight, aether_weight')
      .single();

    return {
      crystal: data?.crystal_weight || 0,
      aether: data?.aether_weight || 0.35
    };
  }

  /**
   * Get current Crystal weight
   */
  private async getCurrentCrystalWeight(): Promise<number> {
    const weights = await this.getCurrentWeights();
    return weights.crystal;
  }

  /**
   * Calculate emergence quality score
   */
  private async calculateEmergenceQuality(events: any[]): Promise<number> {
    if (events.length === 0) return 0;

    // Simple quality calculation based on intensity and diversity
    const avgIntensity = events.reduce((sum, e) => sum + (e.intensity || 0), 0) / events.length;
    const uniqueTypes = new Set(events.map(e => e.content)).size;
    const diversityScore = Math.min(uniqueTypes / 5, 1); // Normalize to 0-1

    return (avgIntensity * 0.7 + diversityScore * 0.3) * 5; // Scale to 0-5
  }

  /**
   * Get user satisfaction score
   */
  private async getUserSatisfaction(): Promise<number> {
    // This would connect to a real feedback system
    // For now, return a simulated value
    const { data } = await supabase
      .from('user_feedback')
      .select('rating')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (!data || data.length === 0) return 0.8;

    const avg = data.reduce((sum, f) => sum + f.rating, 0) / data.length;
    return avg / 5; // Normalize to 0-1
  }

  /**
   * Alert the team about critical events
   */
  private async alertTeam(message: string) {
    // This would integrate with PagerDuty, Slack, etc.
    console.error(`ALERT: ${message}`);

    await supabase.from('alerts').insert({
      severity: 'critical',
      message,
      timestamp: new Date()
    });
  }

  /**
   * Record orchestration event for audit trail
   */
  private async recordOrchestrationEvent(event: any) {
    await supabase.from('orchestration_events').insert({
      event_type: 'metric_check',
      phase: event.phase,
      metrics: event.metrics,
      decision: event.decision,
      timestamp: event.timestamp
    });
  }

  /**
   * Generate deployment report
   */
  async generateReport(): Promise<string> {
    const recentMetrics = this.metrics.slice(-10);
    const avgCoherence = recentMetrics.reduce((sum, m) => sum + m.coherenceRatio, 0) / recentMetrics.length;
    const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTimeP99, 0) / recentMetrics.length;

    return `
Deployment Orchestration Report
================================
Current Phase: ${this.currentPhase.name}
Time in Phase: ${((Date.now() - this.phaseStartTime.getTime()) / (1000 * 60 * 60)).toFixed(1)} hours
Target Crystal Weight: ${this.currentPhase.targetCrystalWeight}
Target Aether Weight: ${this.currentPhase.targetAetherWeight}

Recent Metrics (last 10 checks):
- Average Coherence: ${avgCoherence.toFixed(3)}
- Average P99 Response: ${avgResponseTime.toFixed(0)}ms
- Last Emergence Rate: ${this.metrics[this.metrics.length - 1]?.emergenceRate || 0}/hour

Status: ${this.isRunning ? 'RUNNING' : 'STOPPED'}
    `.trim();
  }
}

// Export singleton instance
export const deploymentOrchestrator = new DeploymentOrchestrator();