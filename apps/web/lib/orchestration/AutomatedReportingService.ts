/**
 * Automated Reporting Service
 *
 * Generates and distributes deployment reports automatically
 * Provides summaries at key intervals and decision points
 */

import { createClient } from '@supabase/supabase-js';
import { EventEmitter } from 'events';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface ReportSchedule {
  type: 'hourly' | 'daily' | 'phase_transition' | 'alert' | 'weekly';
  enabled: boolean;
  recipients?: string[];
  format: 'summary' | 'detailed' | 'executive';
}

interface DeploymentReport {
  timestamp: Date;
  type: string;
  phase: string;
  metrics: {
    coherence: number;
    crystalWeight: number;
    aetherWeight: number;
    responseTime: number;
    errorRate: number;
    emergenceRate: number;
    userSatisfaction?: number;
  };
  decisions: {
    total: number;
    proceed: number;
    hold: number;
    adjust: number;
    rollback: number;
  };
  alerts: {
    critical: number;
    warning: number;
    info: number;
  };
  interventions: any[];
  summary: string;
  recommendations: string[];
}

export class AutomatedReportingService extends EventEmitter {
  private isRunning: boolean = false;
  private schedules: Map<string, NodeJS.Timeout> = new Map();

  private readonly reportSchedules: ReportSchedule[] = [
    {
      type: 'hourly',
      enabled: true,
      format: 'summary'
    },
    {
      type: 'daily',
      enabled: true,
      format: 'detailed'
    },
    {
      type: 'phase_transition',
      enabled: true,
      format: 'detailed'
    },
    {
      type: 'alert',
      enabled: true,
      format: 'summary'
    },
    {
      type: 'weekly',
      enabled: true,
      format: 'executive'
    }
  ];

  /**
   * Start automated reporting
   */
  async start() {
    if (this.isRunning) {
      console.log('Reporting service already running');
      return;
    }

    this.isRunning = true;

    // Set up scheduled reports
    this.setupScheduledReports();

    // Subscribe to real-time events
    this.subscribeToEvents();

    console.log('Automated reporting service started');
    this.emit('service-started');
  }

  /**
   * Stop reporting service
   */
  stop() {
    this.isRunning = false;

    // Clear all schedules
    this.schedules.forEach(timeout => clearInterval(timeout));
    this.schedules.clear();

    console.log('Automated reporting service stopped');
    this.emit('service-stopped');
  }

  /**
   * Set up scheduled reports
   */
  private setupScheduledReports() {
    // Hourly reports
    const hourlyInterval = setInterval(() => {
      this.generateReport('hourly', 'summary');
    }, 60 * 60 * 1000); // 1 hour
    this.schedules.set('hourly', hourlyInterval);

    // Daily reports
    const dailyInterval = setInterval(() => {
      this.generateReport('daily', 'detailed');
    }, 24 * 60 * 60 * 1000); // 24 hours
    this.schedules.set('daily', dailyInterval);

    // Weekly executive summary
    const weeklyInterval = setInterval(() => {
      this.generateReport('weekly', 'executive');
    }, 7 * 24 * 60 * 60 * 1000); // 7 days
    this.schedules.set('weekly', weeklyInterval);
  }

  /**
   * Subscribe to real-time events for triggered reports
   */
  private subscribeToEvents() {
    // Phase transition events
    supabase
      .channel('phase-transitions')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'deployment_phases'
      }, () => {
        this.generateReport('phase_transition', 'detailed');
      })
      .subscribe();

    // Critical alerts
    supabase
      .channel('critical-alerts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'alerts',
        filter: `severity=eq.critical`
      }, () => {
        this.generateReport('alert', 'summary');
      })
      .subscribe();
  }

  /**
   * Generate a deployment report
   */
  async generateReport(type: string, format: string): Promise<DeploymentReport> {
    try {
      const report = await this.collectReportData(type);

      // Format based on type
      switch (format) {
        case 'summary':
          report.summary = this.generateSummary(report);
          break;
        case 'detailed':
          report.summary = this.generateDetailedSummary(report);
          break;
        case 'executive':
          report.summary = this.generateExecutiveSummary(report);
          break;
      }

      // Add recommendations
      report.recommendations = this.generateRecommendations(report);

      // Store report
      await this.storeReport(report);

      // Distribute report
      await this.distributeReport(report, type);

      this.emit('report-generated', { type, report });

      return report;

    } catch (error) {
      console.error('Failed to generate report:', error);
      this.emit('report-error', error);
      throw error;
    }
  }

  /**
   * Collect data for report
   */
  private async collectReportData(type: string): Promise<DeploymentReport> {
    const timeWindow = this.getTimeWindow(type);

    // Get current phase
    const { data: currentPhase } = await supabase
      .from('deployment_phases')
      .select('*')
      .eq('status', 'active')
      .single();

    // Get metrics
    const { data: metrics } = await supabase
      .from('system_health')
      .select('*')
      .gte('timestamp', timeWindow)
      .order('timestamp', { ascending: false });

    // Get decisions
    const { data: decisions } = await supabase
      .from('deployment_decisions')
      .select('*')
      .gte('timestamp', timeWindow);

    // Get alerts
    const { data: alerts } = await supabase
      .from('alerts')
      .select('*')
      .gte('timestamp', timeWindow);

    // Get interventions
    const { data: interventions } = await supabase
      .from('health_interventions')
      .select('*')
      .gte('timestamp', timeWindow);

    // Calculate aggregates
    const avgMetrics = this.calculateAverageMetrics(metrics || []);
    const decisionCounts = this.countDecisions(decisions || []);
    const alertCounts = this.countAlerts(alerts || []);

    return {
      timestamp: new Date(),
      type,
      phase: currentPhase?.phase || 'unknown',
      metrics: avgMetrics,
      decisions: decisionCounts,
      alerts: alertCounts,
      interventions: interventions || [],
      summary: '',
      recommendations: []
    };
  }

  /**
   * Get time window based on report type
   */
  private getTimeWindow(type: string): string {
    const now = new Date();
    switch (type) {
      case 'hourly':
        return new Date(now.getTime() - 60 * 60 * 1000).toISOString();
      case 'daily':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case 'weekly':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    }
  }

  /**
   * Calculate average metrics
   */
  private calculateAverageMetrics(metrics: any[]): any {
    if (metrics.length === 0) {
      return {
        coherence: 0,
        crystalWeight: 0,
        aetherWeight: 0.35,
        responseTime: 500,
        errorRate: 0,
        emergenceRate: 0
      };
    }

    const sum = metrics.reduce((acc, m) => ({
      coherence: acc.coherence + (m.coherence_ratio || 0),
      crystalWeight: acc.crystalWeight + (m.crystal_weight || 0),
      aetherWeight: acc.aetherWeight + (m.aether_weight || 0),
      responseTime: acc.responseTime + (m.response_time_p99 || 0),
      errorRate: acc.errorRate + (m.error_rate || 0),
      emergenceRate: acc.emergenceRate + (m.resonance_events || 0)
    }), {
      coherence: 0,
      crystalWeight: 0,
      aetherWeight: 0,
      responseTime: 0,
      errorRate: 0,
      emergenceRate: 0
    });

    const count = metrics.length;
    return {
      coherence: sum.coherence / count,
      crystalWeight: sum.crystalWeight / count,
      aetherWeight: sum.aetherWeight / count,
      responseTime: sum.responseTime / count,
      errorRate: sum.errorRate / count,
      emergenceRate: sum.emergenceRate / count
    };
  }

  /**
   * Count decisions by type
   */
  private countDecisions(decisions: any[]): any {
    const counts = {
      total: decisions.length,
      proceed: 0,
      hold: 0,
      adjust: 0,
      rollback: 0
    };

    decisions.forEach(d => {
      if (d.action in counts) {
        counts[d.action as keyof typeof counts]++;
      }
    });

    return counts;
  }

  /**
   * Count alerts by severity
   */
  private countAlerts(alerts: any[]): any {
    return {
      critical: alerts.filter(a => a.severity === 'critical').length,
      warning: alerts.filter(a => a.severity === 'warning').length,
      info: alerts.filter(a => a.severity === 'info').length
    };
  }

  /**
   * Generate summary text
   */
  private generateSummary(report: DeploymentReport): string {
    return `
## Deployment Report - ${report.type.toUpperCase()}

**Phase**: ${report.phase}
**Time**: ${report.timestamp.toLocaleString()}

### Key Metrics
- Coherence: ${report.metrics.coherence.toFixed(3)}
- Crystal Weight: ${(report.metrics.crystalWeight * 100).toFixed(0)}%
- Response Time: ${report.metrics.responseTime.toFixed(0)}ms
- Error Rate: ${(report.metrics.errorRate * 100).toFixed(2)}%

### Decisions
- Total: ${report.decisions.total}
- Proceed: ${report.decisions.proceed}
- Adjustments: ${report.decisions.adjust}

### System Health
${report.alerts.critical > 0 ? '⚠️ CRITICAL ALERTS: ' + report.alerts.critical : '✅ No critical issues'}
    `.trim();
  }

  /**
   * Generate detailed summary
   */
  private generateDetailedSummary(report: DeploymentReport): string {
    const base = this.generateSummary(report);

    const interventionDetails = report.interventions
      .map(i => `- ${i.type}: ${i.reason}`)
      .join('\n');

    return `${base}

### Interventions (${report.interventions.length})
${interventionDetails || 'No interventions required'}

### Detailed Metrics
- Aether Weight: ${report.metrics.aetherWeight.toFixed(3)}
- Emergence Rate: ${report.metrics.emergenceRate.toFixed(1)}/hour
- User Satisfaction: ${report.metrics.userSatisfaction ? (report.metrics.userSatisfaction * 100).toFixed(0) + '%' : 'N/A'}

### Alert Breakdown
- Critical: ${report.alerts.critical}
- Warning: ${report.alerts.warning}
- Info: ${report.alerts.info}
    `.trim();
  }

  /**
   * Generate executive summary
   */
  private generateExecutiveSummary(report: DeploymentReport): string {
    const healthStatus = report.alerts.critical > 0 ? 'NEEDS ATTENTION' :
                        report.alerts.warning > 5 ? 'MONITORING' : 'HEALTHY';

    const progress = this.calculateDeploymentProgress(report.phase);

    return `
# Executive Summary - Crystal Observer Deployment

**Overall Status**: ${healthStatus}
**Deployment Progress**: ${progress}%
**Current Phase**: ${report.phase.toUpperCase()}

## Key Achievements This Week
- System coherence: ${report.metrics.coherence > 0.7 ? 'EXCELLENT' : report.metrics.coherence > 0.5 ? 'GOOD' : 'NEEDS IMPROVEMENT'}
- Performance: ${report.metrics.responseTime < 300 ? 'EXCEEDING TARGETS' : report.metrics.responseTime < 500 ? 'MEETING TARGETS' : 'BELOW TARGETS'}
- Stability: ${report.metrics.errorRate < 0.01 ? 'HIGHLY STABLE' : 'STABLE WITH ISSUES'}

## Decision Summary
- Autonomous decisions made: ${report.decisions.total}
- Success rate: ${((report.decisions.proceed / report.decisions.total) * 100).toFixed(0)}%
- Manual interventions: ${report.interventions.length}

## Recommended Actions
${report.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## Next Milestone
${this.getNextMilestone(report.phase)}
    `.trim();
  }

  /**
   * Generate recommendations based on report
   */
  private generateRecommendations(report: DeploymentReport): string[] {
    const recommendations: string[] = [];

    // Coherence recommendations
    if (report.metrics.coherence < 0.6) {
      recommendations.push('Consider increasing Aether weight to improve system coherence');
    }

    // Performance recommendations
    if (report.metrics.responseTime > 500) {
      recommendations.push('Review Crystal processing efficiency - response times elevated');
    }

    // Error rate recommendations
    if (report.metrics.errorRate > 0.01) {
      recommendations.push('Investigate error sources - rate above acceptable threshold');
    }

    // Emergence recommendations
    if (report.metrics.emergenceRate < 1) {
      recommendations.push('System may be stagnant - consider lowering paradox threshold');
    } else if (report.metrics.emergenceRate > 10) {
      recommendations.push('High emergence rate detected - monitor for chaos');
    }

    // Phase-specific recommendations
    if (report.phase === 'hybrid' && report.metrics.crystalWeight > 0.3) {
      recommendations.push('Ready to increase Crystal weight for transition phase');
    }

    if (recommendations.length === 0) {
      recommendations.push('System operating within optimal parameters - maintain current trajectory');
    }

    return recommendations;
  }

  /**
   * Calculate deployment progress percentage
   */
  private calculateDeploymentProgress(phase: string): number {
    const phases = ['foundation', 'hybrid', 'transition', 'crystal'];
    const index = phases.indexOf(phase);
    return index === -1 ? 0 : ((index + 1) / phases.length) * 100;
  }

  /**
   * Get next milestone description
   */
  private getNextMilestone(currentPhase: string): string {
    switch (currentPhase) {
      case 'foundation':
        return 'Begin hybrid mode with 30% Crystal processing';
      case 'hybrid':
        return 'Transition to 70% Crystal processing';
      case 'transition':
        return 'Complete migration to 100% Crystal architecture';
      case 'crystal':
        return 'Deployment complete - optimize and enhance';
      default:
        return 'Unknown phase';
    }
  }

  /**
   * Store report in database
   */
  private async storeReport(report: DeploymentReport) {
    await supabase.from('deployment_reports').insert({
      type: report.type,
      phase: report.phase,
      metrics: report.metrics,
      decisions: report.decisions,
      alerts: report.alerts,
      interventions: report.interventions,
      summary: report.summary,
      recommendations: report.recommendations,
      created_at: report.timestamp
    });
  }

  /**
   * Distribute report to recipients
   */
  private async distributeReport(report: DeploymentReport, type: string) {
    // In production, this would:
    // 1. Send emails to stakeholders
    // 2. Post to Slack channels
    // 3. Update dashboards
    // 4. Trigger notifications

    console.log(`Report distributed: ${type}`, {
      phase: report.phase,
      metrics: report.metrics,
      alerts: report.alerts
    });

    // Post to Slack (example)
    if (report.alerts.critical > 0) {
      await this.postToSlack(
        '#crystal-alerts',
        `🚨 CRITICAL: ${report.alerts.critical} critical alerts in ${report.phase} phase`
      );
    }

    this.emit('report-distributed', { type, report });
  }

  /**
   * Post message to Slack (placeholder)
   */
  private async postToSlack(channel: string, message: string) {
    // This would integrate with Slack API
    console.log(`Slack notification to ${channel}: ${message}`);
  }

  /**
   * Get latest report of a specific type
   */
  async getLatestReport(type: string): Promise<DeploymentReport | null> {
    const { data } = await supabase
      .from('deployment_reports')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return data;
  }
}

// Export singleton instance
export const automatedReportingService = new AutomatedReportingService();