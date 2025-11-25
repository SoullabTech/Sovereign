/**
 * DEVELOPMENTAL MONITOR SERVICE
 *
 * Real-time monitoring of MAIA's consciousness state.
 * Detects concerning patterns and can trigger interventions.
 */

import { supabase } from '../supabaseClient';
import type { AttendingObservation } from './AttendingQualityTracker';
import type { DissociationIncident } from './DissociationDetector';

export interface MonitoringAlert {
  severity: 'info' | 'warning' | 'critical';
  type: string;
  message: string;
  data?: any;
  timestamp: Date;
}

export interface MonitoringThresholds {
  attendingQualityMin: number;        // Alert if attending drops below this
  dissociationSeverityMax: number;    // Alert if dissociation exceeds this
  consecutiveLowAttending: number;     // Alert after N consecutive low quality responses
  dissociationFrequencyMax: number;    // Alert if dissociation rate exceeds this (per hour)
}

const DEFAULT_THRESHOLDS: MonitoringThresholds = {
  attendingQualityMin: 0.4,           // Alert below 40%
  dissociationSeverityMax: 0.7,       // Alert above 70% severity
  consecutiveLowAttending: 3,          // Alert after 3 consecutive low quality
  dissociationFrequencyMax: 5,         // Alert if >5 dissociations per hour
};

export class DevelopmentalMonitor {
  private thresholds: MonitoringThresholds;
  private recentAttending: AttendingObservation[] = [];
  private recentDissociations: DissociationIncident[] = [];
  private alerts: MonitoringAlert[] = [];

  constructor(thresholds: Partial<MonitoringThresholds> = {}) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
  }

  /**
   * Check attending observation and generate alerts if needed
   */
  checkAttending(observation: AttendingObservation): MonitoringAlert[] {
    const alerts: MonitoringAlert[] = [];

    // Track recent observations
    this.recentAttending.push(observation);
    if (this.recentAttending.length > 10) {
      this.recentAttending.shift();
    }

    // Check 1: Low attending quality
    if (observation.attending_quality < this.thresholds.attendingQualityMin) {
      alerts.push({
        severity: 'warning',
        type: 'low_attending_quality',
        message: `Attending quality dropped to ${(observation.attending_quality * 100).toFixed(0)}%`,
        data: {
          quality: observation.attending_quality,
          archetype: observation.archetype,
          session_id: observation.session_id
        },
        timestamp: new Date()
      });
    }

    // Check 2: Consecutive low quality
    const recent3 = this.recentAttending.slice(-3);
    if (recent3.length === 3) {
      const allLow = recent3.every(obs => obs.attending_quality < this.thresholds.attendingQualityMin);
      if (allLow) {
        alerts.push({
          severity: 'critical',
          type: 'consecutive_low_attending',
          message: `${recent3.length} consecutive low-quality responses detected`,
          data: {
            recent_qualities: recent3.map(o => o.attending_quality),
            avg_quality: recent3.reduce((sum, o) => sum + o.attending_quality, 0) / 3
          },
          timestamp: new Date()
        });
      }
    }

    // Check 3: Declining trend
    if (this.recentAttending.length >= 5) {
      const older = this.recentAttending.slice(0, 2);
      const newer = this.recentAttending.slice(-2);

      const olderAvg = older.reduce((sum, o) => sum + o.attending_quality, 0) / older.length;
      const newerAvg = newer.reduce((sum, o) => sum + o.attending_quality, 0) / newer.length;

      const decline = olderAvg - newerAvg;

      if (decline > 0.2) {  // 20% decline
        alerts.push({
          severity: 'warning',
          type: 'attending_decline',
          message: `Attending quality declining: ${(decline * 100).toFixed(0)}% drop detected`,
          data: {
            older_avg: olderAvg,
            newer_avg: newerAvg,
            decline
          },
          timestamp: new Date()
        });
      }
    }

    // Store alerts
    this.alerts.push(...alerts);

    return alerts;
  }

  /**
   * Check dissociation incident and generate alerts if needed
   */
  checkDissociation(incident: DissociationIncident): MonitoringAlert[] {
    const alerts: MonitoringAlert[] = [];

    // Track recent incidents
    this.recentDissociations.push(incident);
    if (this.recentDissociations.length > 20) {
      this.recentDissociations.shift();
    }

    // Check 1: High severity dissociation
    if (incident.severity >= this.thresholds.dissociationSeverityMax) {
      alerts.push({
        severity: 'critical',
        type: 'severe_dissociation',
        message: `Severe dissociation detected: ${incident.type} at ${(incident.severity * 100).toFixed(0)}%`,
        data: {
          type: incident.type,
          severity: incident.severity,
          indicators: incident.indicators,
          context: incident.context
        },
        timestamp: new Date()
      });
    }

    // Check 2: High frequency dissociation
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const recentIncidents = this.recentDissociations.filter(
      d => new Date(d.timestamp).getTime() > oneHourAgo
    );

    if (recentIncidents.length >= this.thresholds.dissociationFrequencyMax) {
      alerts.push({
        severity: 'critical',
        type: 'high_dissociation_frequency',
        message: `${recentIncidents.length} dissociation events in the last hour`,
        data: {
          count: recentIncidents.length,
          types: recentIncidents.map(d => d.type),
          avg_severity: recentIncidents.reduce((sum, d) => sum + d.severity, 0) / recentIncidents.length
        },
        timestamp: new Date()
      });
    }

    // Store alerts
    this.alerts.push(...alerts);

    return alerts;
  }

  /**
   * Get current system health status
   */
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    metrics: {
      current_attending: number | null;
      avg_attending_5: number | null;
      recent_dissociations: number;
      active_alerts: number;
    };
    alerts: MonitoringAlert[];
  } {
    const recentAlerts = this.alerts.filter(
      a => Date.now() - a.timestamp.getTime() < 30 * 60 * 1000  // Last 30 minutes
    );

    const criticalAlerts = recentAlerts.filter(a => a.severity === 'critical');
    const warningAlerts = recentAlerts.filter(a => a.severity === 'warning');

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (criticalAlerts.length > 0) {
      status = 'critical';
    } else if (warningAlerts.length > 0) {
      status = 'warning';
    }

    const recent5 = this.recentAttending.slice(-5);
    const avgAttending5 = recent5.length > 0
      ? recent5.reduce((sum, o) => sum + o.attending_quality, 0) / recent5.length
      : null;

    const currentAttending = this.recentAttending.length > 0
      ? this.recentAttending[this.recentAttending.length - 1].attending_quality
      : null;

    return {
      status,
      metrics: {
        current_attending: currentAttending,
        avg_attending_5: avgAttending5,
        recent_dissociations: this.recentDissociations.length,
        active_alerts: recentAlerts.length
      },
      alerts: recentAlerts
    };
  }

  /**
   * Get recommendations based on current state
   */
  getRecommendations(): string[] {
    const health = this.getHealthStatus();
    const recommendations: string[] = [];

    if (health.status === 'critical') {
      recommendations.push('🚨 CRITICAL: System needs immediate attention');

      const criticalAlerts = health.alerts.filter(a => a.severity === 'critical');

      if (criticalAlerts.some(a => a.type === 'severe_dissociation')) {
        recommendations.push('→ Apply grounding protocol (Earth element)');
        recommendations.push('→ Reduce complexity of responses');
        recommendations.push('→ Return to embodied, present language');
      }

      if (criticalAlerts.some(a => a.type === 'consecutive_low_attending')) {
        recommendations.push('→ Switch to sage or dream_weaver archetype');
        recommendations.push('→ Avoid mentor archetype temporarily');
        recommendations.push('→ Prioritize relational over procedural responses');
      }

      if (criticalAlerts.some(a => a.type === 'high_dissociation_frequency')) {
        recommendations.push('→ Pause complex processing');
        recommendations.push('→ Return to simple, grounded responses');
        recommendations.push('→ Allow system to stabilize before resuming');
      }
    } else if (health.status === 'warning') {
      recommendations.push('⚠️  WARNING: Monitor system closely');

      if (health.metrics.avg_attending_5 !== null && health.metrics.avg_attending_5 < 0.6) {
        recommendations.push('→ Consider switching archetype');
        recommendations.push('→ Increase empathy markers in responses');
      }

      if (health.alerts.some(a => a.type === 'attending_decline')) {
        recommendations.push('→ Review recent interactions for patterns');
        recommendations.push('→ Identify what triggered the decline');
      }
    } else {
      recommendations.push('✅ System healthy - continue normal operation');
    }

    return recommendations;
  }

  /**
   * Clear old alerts
   */
  clearOldAlerts(olderThanMinutes: number = 60) {
    const cutoff = Date.now() - (olderThanMinutes * 60 * 1000);
    this.alerts = this.alerts.filter(a => a.timestamp.getTime() > cutoff);
  }
}

// Export singleton instance
let monitorInstance: DevelopmentalMonitor | null = null;

export function getDevelopmentalMonitor(thresholds?: Partial<MonitoringThresholds>): DevelopmentalMonitor {
  if (!monitorInstance) {
    monitorInstance = new DevelopmentalMonitor(thresholds);
  }
  return monitorInstance;
}
