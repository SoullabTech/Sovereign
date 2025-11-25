/**
 * Autonomous Health Monitor
 *
 * Continuously monitors system health and makes automatic interventions
 * when metrics deviate from optimal ranges. Works in tandem with the
 * DeploymentOrchestrator but can act independently for emergency situations.
 */

import { createClient } from '@supabase/supabase-js';
import { EventEmitter } from 'events';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface HealthThresholds {
  coherence: {
    critical: number;  // Below this = immediate intervention
    warning: number;   // Below this = gradual adjustment
    optimal: number;   // Target value
  };
  aether: {
    min: number;       // Hemispheres too separated
    max: number;       // Hemispheres too merged
    optimal: number;   // Sweet spot for productive tension
  };
  emergence: {
    min: number;       // Too few emergence events (system stagnant)
    max: number;       // Too many (system chaotic)
    optimal: number;   // Healthy emergence rate
  };
  responseTime: {
    p50Warning: number;
    p50Critical: number;
    p99Warning: number;
    p99Critical: number;
  };
  errorRate: {
    warning: number;
    critical: number;
  };
  symbolicEntropy: {
    min: number;       // Low diversity (echo chamber)
    max: number;       // High chaos
    optimal: number;   // Balanced diversity
  };
}

interface Intervention {
  type: 'adjust_weight' | 'throttle' | 'circuit_break' | 'heal' | 'stimulate';
  target: string;
  value: any;
  reason: string;
  confidence: number;
}

interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'critical' | 'healing';
  coherence: number;
  aetherWeight: number;
  emergence: number;
  responseTime: { p50: number; p99: number };
  errorRate: number;
  symbolicEntropy: number;
  lastIntervention?: Intervention;
  healingMode: boolean;
}

export class AutonomousHealthMonitor extends EventEmitter {
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private healingMode: boolean = false;
  private interventionCooldown: Map<string, number> = new Map();

  private readonly thresholds: HealthThresholds = {
    coherence: {
      critical: 0.3,
      warning: 0.5,
      optimal: 0.75
    },
    aether: {
      min: 0.2,
      max: 0.6,
      optimal: 0.35
    },
    emergence: {
      min: 1,    // per hour
      max: 15,   // per hour
      optimal: 5
    },
    responseTime: {
      p50Warning: 300,
      p50Critical: 500,
      p99Warning: 700,
      p99Critical: 1000
    },
    errorRate: {
      warning: 0.01,
      critical: 0.05
    },
    symbolicEntropy: {
      min: 0.3,
      max: 0.9,
      optimal: 0.6
    }
  };

  /**
   * Start autonomous monitoring
   */
  async start(intervalMs: number = 60000) {
    if (this.isMonitoring) {
      console.log('Health monitor already running');
      return;
    }

    this.isMonitoring = true;
    this.emit('monitoring-started');

    // Initial check
    await this.performHealthCheck();

    // Regular monitoring
    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck();
    }, intervalMs);

    console.log(`Autonomous health monitoring started (interval: ${intervalMs}ms)`);
  }

  /**
   * Stop monitoring
   */
  stop() {
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    this.emit('monitoring-stopped');
    console.log('Autonomous health monitoring stopped');
  }

  /**
   * Perform comprehensive health check
   */
  private async performHealthCheck() {
    try {
      const status = await this.collectHealthStatus();
      const diagnosis = this.diagnoseHealth(status);

      // Emit current status
      this.emit('health-check', { status, diagnosis });

      // Determine if intervention needed
      if (diagnosis.requiresIntervention) {
        const intervention = await this.determineIntervention(status, diagnosis);
        if (intervention && this.canIntervene(intervention.type)) {
          await this.executeIntervention(intervention);
        }
      }

      // Check if we can exit healing mode
      if (this.healingMode && diagnosis.severity === 'healthy') {
        await this.exitHealingMode();
      }

      // Record health check
      await this.recordHealthCheck(status, diagnosis);

    } catch (error) {
      console.error('Health check failed:', error);
      this.emit('error', error);
    }
  }

  /**
   * Collect current health metrics
   */
  private async collectHealthStatus(): Promise<HealthStatus> {
    const { data: health } = await supabase
      .from('current_health')
      .select('*')
      .single();

    const { data: performance } = await supabase
      .rpc('get_performance_metrics', {
        time_window: '5 minutes'
      });

    const { data: emergenceCount } = await supabase
      .from('resonance_events')
      .select('id')
      .eq('event_type', 'emergence')
      .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString());

    return {
      overall: 'healthy', // Will be updated by diagnosis
      coherence: health?.coherence_ratio || 0,
      aetherWeight: health?.aether_weight || 0.35,
      emergence: emergenceCount?.length || 0,
      responseTime: {
        p50: performance?.p50 || 500,
        p99: performance?.p99 || 1000
      },
      errorRate: performance?.error_rate || 0,
      symbolicEntropy: health?.symbolic_entropy || 0.5,
      healingMode: this.healingMode
    };
  }

  /**
   * Diagnose health status and determine severity
   */
  private diagnoseHealth(status: HealthStatus): {
    severity: 'healthy' | 'degraded' | 'critical';
    issues: string[];
    requiresIntervention: boolean;
  } {
    const issues: string[] = [];
    let severity: 'healthy' | 'degraded' | 'critical' = 'healthy';

    // Check coherence
    if (status.coherence < this.thresholds.coherence.critical) {
      issues.push('Critical coherence collapse');
      severity = 'critical';
    } else if (status.coherence < this.thresholds.coherence.warning) {
      issues.push('Low coherence detected');
      severity = 'degraded';
    }

    // Check response times
    if (status.responseTime.p99 > this.thresholds.responseTime.p99Critical) {
      issues.push('Critical response time degradation');
      severity = 'critical';
    } else if (status.responseTime.p99 > this.thresholds.responseTime.p99Warning) {
      issues.push('High response times');
      if (severity === 'healthy') severity = 'degraded';
    }

    // Check error rate
    if (status.errorRate > this.thresholds.errorRate.critical) {
      issues.push('Critical error rate');
      severity = 'critical';
    } else if (status.errorRate > this.thresholds.errorRate.warning) {
      issues.push('Elevated error rate');
      if (severity === 'healthy') severity = 'degraded';
    }

    // Check Aether balance
    if (status.aetherWeight < this.thresholds.aether.min) {
      issues.push('Hemispheres too separated');
      if (severity === 'healthy') severity = 'degraded';
    } else if (status.aetherWeight > this.thresholds.aether.max) {
      issues.push('Hemispheres over-merged');
      if (severity === 'healthy') severity = 'degraded';
    }

    // Check emergence
    if (status.emergence < this.thresholds.emergence.min) {
      issues.push('Insufficient emergence (system stagnant)');
      if (severity === 'healthy') severity = 'degraded';
    } else if (status.emergence > this.thresholds.emergence.max) {
      issues.push('Excessive emergence (system chaotic)');
      if (severity === 'healthy') severity = 'degraded';
    }

    // Check symbolic entropy
    if (status.symbolicEntropy < this.thresholds.symbolicEntropy.min) {
      issues.push('Low symbolic diversity');
    } else if (status.symbolicEntropy > this.thresholds.symbolicEntropy.max) {
      issues.push('Symbolic chaos detected');
    }

    return {
      severity,
      issues,
      requiresIntervention: severity !== 'healthy' || issues.length > 0
    };
  }

  /**
   * Determine appropriate intervention based on diagnosis
   */
  private async determineIntervention(
    status: HealthStatus,
    diagnosis: { severity: string; issues: string[] }
  ): Promise<Intervention | null> {
    // Critical interventions (immediate)
    if (diagnosis.severity === 'critical') {
      if (status.coherence < this.thresholds.coherence.critical) {
        return {
          type: 'heal',
          target: 'coherence',
          value: {
            aetherAdjust: 0.1,  // Increase Aether significantly
            enterHealingMode: true
          },
          reason: 'Critical coherence collapse - entering healing mode',
          confidence: 0.95
        };
      }

      if (status.errorRate > this.thresholds.errorRate.critical) {
        return {
          type: 'circuit_break',
          target: 'crystal_processing',
          value: { crystalWeight: 0 },  // Revert to legacy
          reason: 'Critical error rate - circuit breaking to legacy',
          confidence: 1.0
        };
      }
    }

    // Degraded interventions (gradual)
    if (diagnosis.severity === 'degraded') {
      // Low coherence - adjust Aether
      if (status.coherence < this.thresholds.coherence.warning) {
        const adjustment = this.calculateAetherAdjustment(status);
        return {
          type: 'adjust_weight',
          target: 'aether',
          value: adjustment,
          reason: 'Adjusting Aether to improve coherence',
          confidence: 0.8
        };
      }

      // Response time issues - throttle
      if (status.responseTime.p99 > this.thresholds.responseTime.p99Warning) {
        return {
          type: 'throttle',
          target: 'request_rate',
          value: { reduction: 0.2 },  // Reduce by 20%
          reason: 'High response times - throttling requests',
          confidence: 0.7
        };
      }

      // Stagnant system - stimulate
      if (status.emergence < this.thresholds.emergence.min) {
        return {
          type: 'stimulate',
          target: 'paradox_threshold',
          value: { reduction: 1 },  // Lower threshold to encourage emergence
          reason: 'System stagnant - stimulating emergence',
          confidence: 0.6
        };
      }
    }

    return null;
  }

  /**
   * Calculate optimal Aether adjustment
   */
  private calculateAetherAdjustment(status: HealthStatus): number {
    const currentAether = status.aetherWeight;
    const targetAether = this.thresholds.aether.optimal;

    // Use a PID-like controller for smooth adjustment
    const error = targetAether - currentAether;
    const adjustment = error * 0.3;  // Conservative 30% correction

    // Constrain adjustment
    const newAether = currentAether + adjustment;
    return Math.max(
      this.thresholds.aether.min,
      Math.min(this.thresholds.aether.max, newAether)
    );
  }

  /**
   * Execute the intervention
   */
  private async executeIntervention(intervention: Intervention) {
    console.log(`Executing intervention: ${intervention.type} on ${intervention.target}`);
    this.emit('intervention', intervention);

    try {
      switch (intervention.type) {
        case 'adjust_weight':
          await this.adjustWeight(intervention.target, intervention.value);
          break;

        case 'throttle':
          await this.setThrottle(intervention.value.reduction);
          break;

        case 'circuit_break':
          await this.circuitBreak(intervention.value);
          break;

        case 'heal':
          await this.enterHealingMode(intervention.value);
          break;

        case 'stimulate':
          await this.stimulateSystem(intervention.value);
          break;
      }

      // Record intervention
      await supabase.from('health_interventions').insert({
        type: intervention.type,
        target: intervention.target,
        value: intervention.value,
        reason: intervention.reason,
        confidence: intervention.confidence,
        timestamp: new Date()
      });

      // Set cooldown
      this.interventionCooldown.set(intervention.type, Date.now() + 5 * 60 * 1000); // 5 min cooldown

    } catch (error) {
      console.error('Intervention failed:', error);
      this.emit('intervention-failed', { intervention, error });
    }
  }

  /**
   * Check if intervention is allowed (cooldown)
   */
  private canIntervene(type: string): boolean {
    const cooldownEnd = this.interventionCooldown.get(type);
    if (!cooldownEnd) return true;
    return Date.now() > cooldownEnd;
  }

  /**
   * Adjust system weight
   */
  private async adjustWeight(target: string, value: number) {
    await supabase.from('system_config').update({
      [`${target}_weight`]: value
    }).eq('id', 1);
  }

  /**
   * Set request throttling
   */
  private async setThrottle(reduction: number) {
    await supabase.from('system_config').update({
      throttle_rate: 1 - reduction
    }).eq('id', 1);
  }

  /**
   * Circuit break to legacy mode
   */
  private async circuitBreak(config: any) {
    await supabase.from('system_config').update({
      mode: 'legacy',
      crystal_weight: 0,
      circuit_breaker_active: true
    }).eq('id', 1);

    // Alert team
    await this.alertTeam('CIRCUIT BREAKER ACTIVATED - System reverted to legacy mode');
  }

  /**
   * Enter healing mode
   */
  private async enterHealingMode(config: any) {
    this.healingMode = true;

    // Adjust Aether for healing
    if (config.aetherAdjust) {
      const current = await this.getCurrentAetherWeight();
      await this.adjustWeight('aether', current + config.aetherAdjust);
    }

    // Reduce system load
    await supabase.from('system_config').update({
      healing_mode: true,
      max_concurrent_requests: 10,  // Reduce load
      paradox_accumulation_enabled: false  // Temporarily disable
    }).eq('id', 1);

    this.emit('healing-mode-entered');
  }

  /**
   * Exit healing mode
   */
  private async exitHealingMode() {
    this.healingMode = false;

    await supabase.from('system_config').update({
      healing_mode: false,
      max_concurrent_requests: 100,  // Restore normal load
      paradox_accumulation_enabled: true  // Re-enable
    }).eq('id', 1);

    this.emit('healing-mode-exited');
  }

  /**
   * Stimulate the system to encourage emergence
   */
  private async stimulateSystem(config: any) {
    if (config.reduction) {
      await supabase.from('system_config').update({
        paradox_threshold: Math.max(1, 3 - config.reduction)
      }).eq('id', 1);
    }
  }

  /**
   * Get current Aether weight
   */
  private async getCurrentAetherWeight(): Promise<number> {
    const { data } = await supabase
      .from('system_config')
      .select('aether_weight')
      .single();
    return data?.aether_weight || 0.35;
  }

  /**
   * Alert the team
   */
  private async alertTeam(message: string) {
    console.error(`ALERT: ${message}`);

    await supabase.from('alerts').insert({
      severity: 'critical',
      message,
      source: 'health_monitor',
      timestamp: new Date()
    });

    this.emit('team-alert', message);
  }

  /**
   * Record health check for history
   */
  private async recordHealthCheck(status: HealthStatus, diagnosis: any) {
    await supabase.from('health_checks').insert({
      status: status.overall,
      metrics: status,
      diagnosis,
      timestamp: new Date()
    });
  }

  /**
   * Generate health report
   */
  async generateHealthReport(): Promise<string> {
    const { data: recentChecks } = await supabase
      .from('health_checks')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10);

    const { data: recentInterventions } = await supabase
      .from('health_interventions')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(5);

    return `
Autonomous Health Monitor Report
=================================
Status: ${this.isMonitoring ? 'MONITORING' : 'STOPPED'}
Healing Mode: ${this.healingMode ? 'ACTIVE' : 'INACTIVE'}

Recent Health Checks (last 10):
${recentChecks?.map(c => `- ${new Date(c.timestamp).toLocaleString()}: ${c.status}`).join('\n') || 'No checks'}

Recent Interventions (last 5):
${recentInterventions?.map(i => `- ${i.type}: ${i.reason} (confidence: ${i.confidence})`).join('\n') || 'No interventions'}

Thresholds:
- Coherence: ${this.thresholds.coherence.critical} / ${this.thresholds.coherence.warning} / ${this.thresholds.coherence.optimal}
- Aether: ${this.thresholds.aether.min} - ${this.thresholds.aether.max} (optimal: ${this.thresholds.aether.optimal})
- Emergence: ${this.thresholds.emergence.min} - ${this.thresholds.emergence.max}/hour
    `.trim();
  }
}

// Export singleton instance
export const autonomousHealthMonitor = new AutonomousHealthMonitor();