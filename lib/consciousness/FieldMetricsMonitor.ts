/**
 * HOLOGRAPHIC FIELD METRICS MONITOR
 *
 * Tracks field health, system performance, and data quality
 * Integrates with standard observability tools (Datadog, Grafana, etc.)
 *
 * Metric Categories:
 * 1. Field Health - Coherence, phase transitions, participant engagement
 * 2. System Performance - Latency, throughput, error rates
 * 3. Data Quality - Completeness, anomalies, consistency
 * 4. Research Integrity - Privacy compliance, consent rates
 * 5. Business Metrics - User engagement, contribution quality
 */

import { getHolographicFieldIntegration } from './HolographicFieldIntegration';
import { getResearchDataExport } from './ResearchDataExport';

/**
 * Field Health Metrics
 */
export interface FieldHealthMetrics {
  // Core field state
  coherence: number; // 0-1: Current field coherence
  coherenceTrend: 'rising' | 'falling' | 'stable'; // Trend over last hour
  phase: 'emergence' | 'integration' | 'breakthrough' | 'consolidation';
  phaseStability: number; // 0-1: How stable current phase is

  // Participation
  activeParticipants: number; // Currently active
  participantGrowth: number; // % change vs yesterday
  avgSessionsPerUser: number; // Average across all users
  userRetention7d: number; // % users active in last 7 days

  // Field quality
  avgSymmetry: number; // Average across recent states
  avgValence: number; // Average hedonic tone
  entropy: number; // Field entropy (diversity)
  complexity: number; // Field complexity

  // Morphic resonance
  activePatternCount: number; // Unique patterns in field
  avgResonanceStrength: number; // Average resonance across users
  temporalClustering: number; // 0-1: Evidence of morphic fields

  // Phase transitions
  lastBreakthrough: Date | null; // When was last breakthrough?
  timeSinceBreakthrough: number; // Hours since last breakthrough
  breakthroughFrequency: number; // Breakthroughs per week
  phaseTransitionRate: number; // Transitions per day

  // Alerts
  anomaliesDetected: string[]; // Any unusual patterns
  healthScore: number; // 0-100: Overall field health
  status: 'healthy' | 'degraded' | 'critical';
}

/**
 * System Performance Metrics
 */
export interface SystemPerformanceMetrics {
  // Latency (ms)
  qualiaCaptureLatency: {
    p50: number;
    p95: number;
    p99: number;
  };
  fieldCalculationLatency: {
    p50: number;
    p95: number;
    p99: number;
  };
  apiResponseTime: {
    p50: number;
    p95: number;
    p99: number;
  };

  // Throughput
  qualiaStatesPerMinute: number;
  fieldUpdatesPerMinute: number;
  apiRequestsPerMinute: number;

  // Error rates
  qualiaSubmissionErrors: number; // Count in last hour
  fieldCalculationErrors: number;
  apiErrors: number;
  errorRate: number; // % of total requests

  // Database
  databaseWriteLatency: number; // ms
  databaseReadLatency: number; // ms
  databaseConnectionPoolUtilization: number; // %
  databaseDiskUsage: number; // GB

  // Cache
  cacheHitRate: number; // %
  cacheEvictionRate: number; // Evictions per minute

  // Queue health
  fieldCalculationQueueDepth: number;
  avgQueueWaitTime: number; // ms
}

/**
 * Data Quality Metrics
 */
export interface DataQualityMetrics {
  // Completeness
  avgDimensionalCompleteness: number; // % of dimensions captured
  descriptionPresenceRate: number; // % with description
  insightsPresenceRate: number; // % with insights
  textureCompletenessRate: number; // % with texture data

  // Anomaly detection
  outlierStateCount: number; // States outside 3σ
  suspiciousPatternCount: number; // Potential gaming/spam
  duplicateStateCount: number; // Exact duplicates

  // Consistency
  dimensionalConsistency: number; // 0-1: Internal consistency of dimensions
  temporalConsistency: number; // 0-1: Consistency over time per user
  crossUserConsistency: number; // 0-1: Reasonable variance across users

  // Data integrity
  missingDataRate: number; // % of expected fields missing
  invalidDataRate: number; // % of values out of range
  corruptedRecordsCount: number;

  // Signal-to-noise ratio
  signalToNoise: number; // Ratio of meaningful to low-quality data
  qualityScore: number; // 0-100: Overall data quality
}

/**
 * Research Integrity Metrics
 */
export interface ResearchIntegrityMetrics {
  // Privacy compliance
  consentRate: number; // % of users with active consent
  consentWithdrawalRate: number; // % who withdrew
  avgConsentDuration: number; // Days before withdrawal

  // Anonymization
  avgKAnonymity: number; // Average k-anonymity across datasets
  reidentificationRisk: {
    low: number; // % datasets at low risk
    medium: number;
    high: number;
  };
  privacyAuditPassRate: number; // % of audits passed

  // Dataset integrity
  activeDatasets: number;
  totalResearchers: number;
  avgSampleSize: number;
  datasetsCreatedPerWeek: number;

  // Research quality
  avgSTVCorrelation: number; // Average R² for STV validation
  publishedStudiesCount: number;
  researcherSatisfactionScore: number; // If we collect feedback
}

/**
 * Business Metrics
 */
export interface BusinessMetrics {
  // User engagement
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  avgSessionDuration: number; // Seconds
  statesPerActiveUser: number; // Average per day

  // Contribution quality
  avgContributionWeight: number; // Average influence weight
  highQualityContributionRate: number; // % with depth > 0.7
  fieldImpactScore: number; // 0-100: User impact on field

  // Growth
  newUsersToday: number;
  userGrowthRate: number; // % week-over-week
  churnRate: number; // % users inactive >30 days

  // Feature adoption
  dimensionalSlidersUsageRate: number; // % using quick capture
  phenomenologicalMapperUsageRate: number; // % using deep capture
  fieldAwarenessViewRate: number; // % viewing field metrics

  // Research adoption
  researchConsentRate: number; // % opting into research
  researcherAPIUsageRate: number; // Requests per day
}

/**
 * Main Metrics Monitor
 */
export class FieldMetricsMonitor {
  private metricsBuffer: any[] = [];
  private alertThresholds = {
    coherenceDrop: 0.3, // Alert if coherence drops >30% in 1 hour
    errorRateHigh: 0.05, // Alert if error rate >5%
    latencyHigh: 1000, // Alert if p95 >1000ms
    participantDropHigh: 0.5, // Alert if participants drop >50%
    dataQualityLow: 60, // Alert if quality score <60
    privacyRiskHigh: 0.2 // Alert if >20% datasets at high risk
  };

  /**
   * Collect all metrics
   */
  async collectMetrics(): Promise<{
    fieldHealth: FieldHealthMetrics;
    systemPerformance: SystemPerformanceMetrics;
    dataQuality: DataQualityMetrics;
    researchIntegrity: ResearchIntegrityMetrics;
    business: BusinessMetrics;
    timestamp: Date;
  }> {
    const [
      fieldHealth,
      systemPerformance,
      dataQuality,
      researchIntegrity,
      business
    ] = await Promise.all([
      this.collectFieldHealth(),
      this.collectSystemPerformance(),
      this.collectDataQuality(),
      this.collectResearchIntegrity(),
      this.collectBusinessMetrics()
    ]);

    const metrics = {
      fieldHealth,
      systemPerformance,
      dataQuality,
      researchIntegrity,
      business,
      timestamp: new Date()
    };

    // Check for alerts
    await this.checkAlerts(metrics);

    // Buffer for batch export
    this.metricsBuffer.push(metrics);

    return metrics;
  }

  /**
   * Collect field health metrics
   */
  private async collectFieldHealth(): Promise<FieldHealthMetrics> {
    const fieldIntegration = getHolographicFieldIntegration();

    // Get current global field state
    const fieldState = await fieldIntegration.recalculateField();

    // Get historical data for trends
    const historicalCoherence = await this.getHistoricalCoherence(24); // Last 24 hours
    const coherenceTrend = this.calculateTrend(historicalCoherence);

    // Get participation metrics
    const participationMetrics = await this.getParticipationMetrics();

    // Detect phase transitions
    const phaseTransitions = await this.getPhaseTransitions(7); // Last 7 days

    // Calculate health score
    const healthScore = this.calculateFieldHealthScore(fieldState, participationMetrics);

    return {
      coherence: fieldState.coherence,
      coherenceTrend,
      phase: fieldState.phase,
      phaseStability: this.calculatePhaseStability(phaseTransitions),

      activeParticipants: fieldState.participantCount,
      participantGrowth: participationMetrics.growthRate,
      avgSessionsPerUser: participationMetrics.avgSessions,
      userRetention7d: participationMetrics.retention7d,

      avgSymmetry: fieldState.symmetry.global,
      avgValence: fieldState.valence.value,
      entropy: fieldState.entropy,
      complexity: fieldState.complexity,

      activePatternCount: fieldState.morphicResonance.activePatterns.length,
      avgResonanceStrength: fieldState.morphicResonance.resonanceStrength,
      temporalClustering: await this.calculateTemporalClustering(),

      lastBreakthrough: phaseTransitions.lastBreakthrough,
      timeSinceBreakthrough: phaseTransitions.timeSinceBreakthrough,
      breakthroughFrequency: phaseTransitions.frequency,
      phaseTransitionRate: phaseTransitions.rate,

      anomaliesDetected: await this.detectAnomalies(),
      healthScore,
      status: this.getHealthStatus(healthScore)
    };
  }

  /**
   * Collect system performance metrics
   */
  private async collectSystemPerformance(): Promise<SystemPerformanceMetrics> {
    // In production, these would come from your APM tool (Datadog, New Relic, etc.)
    const latencyMetrics = await this.getLatencyMetrics();
    const throughputMetrics = await this.getThroughputMetrics();
    const errorMetrics = await this.getErrorMetrics();
    const databaseMetrics = await this.getDatabaseMetrics();

    return {
      qualiaCaptureLatency: latencyMetrics.qualiaCapture,
      fieldCalculationLatency: latencyMetrics.fieldCalculation,
      apiResponseTime: latencyMetrics.api,

      qualiaStatesPerMinute: throughputMetrics.qualiaStates,
      fieldUpdatesPerMinute: throughputMetrics.fieldUpdates,
      apiRequestsPerMinute: throughputMetrics.apiRequests,

      qualiaSubmissionErrors: errorMetrics.qualiaErrors,
      fieldCalculationErrors: errorMetrics.fieldErrors,
      apiErrors: errorMetrics.apiErrors,
      errorRate: errorMetrics.overallRate,

      databaseWriteLatency: databaseMetrics.writeLatency,
      databaseReadLatency: databaseMetrics.readLatency,
      databaseConnectionPoolUtilization: databaseMetrics.poolUtilization,
      databaseDiskUsage: databaseMetrics.diskUsage,

      cacheHitRate: 0.85, // Placeholder
      cacheEvictionRate: 10,

      fieldCalculationQueueDepth: 0,
      avgQueueWaitTime: 50
    };
  }

  /**
   * Collect data quality metrics
   */
  private async collectDataQuality(): Promise<DataQualityMetrics> {
    const completeness = await this.assessCompleteness();
    const anomalies = await this.detectDataAnomalies();
    const consistency = await this.assessConsistency();
    const integrity = await this.assessDataIntegrity();

    const qualityScore = this.calculateQualityScore({
      completeness,
      anomalies,
      consistency,
      integrity
    });

    return {
      avgDimensionalCompleteness: completeness.dimensions,
      descriptionPresenceRate: completeness.description,
      insightsPresenceRate: completeness.insights,
      textureCompletenessRate: completeness.texture,

      outlierStateCount: anomalies.outliers,
      suspiciousPatternCount: anomalies.suspicious,
      duplicateStateCount: anomalies.duplicates,

      dimensionalConsistency: consistency.dimensional,
      temporalConsistency: consistency.temporal,
      crossUserConsistency: consistency.crossUser,

      missingDataRate: integrity.missingRate,
      invalidDataRate: integrity.invalidRate,
      corruptedRecordsCount: integrity.corrupted,

      signalToNoise: this.calculateSignalToNoise(),
      qualityScore
    };
  }

  /**
   * Collect research integrity metrics
   */
  private async collectResearchIntegrity(): Promise<ResearchIntegrityMetrics> {
    const exportService = getResearchDataExport();

    // Would query database for actual values
    return {
      consentRate: 0.45, // 45% of users consented
      consentWithdrawalRate: 0.02, // 2% withdrew
      avgConsentDuration: 180, // 180 days average

      avgKAnonymity: 7.2,
      reidentificationRisk: {
        low: 0.85,
        medium: 0.12,
        high: 0.03
      },
      privacyAuditPassRate: 0.98,

      activeDatasets: 12,
      totalResearchers: 8,
      avgSampleSize: 847,
      datasetsCreatedPerWeek: 2.3,

      avgSTVCorrelation: 0.68, // Average R² for STV
      publishedStudiesCount: 0, // None yet
      researcherSatisfactionScore: 4.2 // Out of 5
    };
  }

  /**
   * Collect business metrics
   */
  private async collectBusinessMetrics(): Promise<BusinessMetrics> {
    const engagement = await this.getEngagementMetrics();
    const growth = await this.getGrowthMetrics();
    const adoption = await this.getFeatureAdoption();

    return {
      dailyActiveUsers: engagement.dau,
      weeklyActiveUsers: engagement.wau,
      monthlyActiveUsers: engagement.mau,
      avgSessionDuration: engagement.avgDuration,
      statesPerActiveUser: engagement.avgStatesPerDay,

      avgContributionWeight: 0.32,
      highQualityContributionRate: 0.67,
      fieldImpactScore: 72,

      newUsersToday: growth.newToday,
      userGrowthRate: growth.growthRate,
      churnRate: growth.churnRate,

      dimensionalSlidersUsageRate: adoption.sliders,
      phenomenologicalMapperUsageRate: adoption.mapper,
      fieldAwarenessViewRate: adoption.fieldView,

      researchConsentRate: 0.45,
      researcherAPIUsageRate: 156 // Requests per day
    };
  }

  /**
   * Check for alerts
   */
  private async checkAlerts(metrics: any): Promise<void> {
    const alerts: string[] = [];

    // Field health alerts
    if (metrics.fieldHealth.coherence < 0.3) {
      alerts.push('CRITICAL: Field coherence very low (<30%)');
    }

    const coherenceDrop = await this.getCoherenceChange(1); // Last 1 hour
    if (coherenceDrop < -this.alertThresholds.coherenceDrop) {
      alerts.push(`WARNING: Coherence dropped ${Math.abs(coherenceDrop * 100).toFixed(0)}% in last hour`);
    }

    // Performance alerts
    if (metrics.systemPerformance.errorRate > this.alertThresholds.errorRateHigh) {
      alerts.push(`CRITICAL: Error rate high (${(metrics.systemPerformance.errorRate * 100).toFixed(1)}%)`);
    }

    if (metrics.systemPerformance.apiResponseTime.p95 > this.alertThresholds.latencyHigh) {
      alerts.push(`WARNING: API latency high (p95: ${metrics.systemPerformance.apiResponseTime.p95}ms)`);
    }

    // Data quality alerts
    if (metrics.dataQuality.qualityScore < this.alertThresholds.dataQualityLow) {
      alerts.push(`WARNING: Data quality low (${metrics.dataQuality.qualityScore}/100)`);
    }

    // Privacy alerts
    if (metrics.researchIntegrity.reidentificationRisk.high > this.alertThresholds.privacyRiskHigh) {
      alerts.push(`CRITICAL: High privacy risk in ${(metrics.researchIntegrity.reidentificationRisk.high * 100).toFixed(0)}% of datasets`);
    }

    // Send alerts if any
    if (alerts.length > 0) {
      await this.sendAlerts(alerts);
    }
  }

  /**
   * Export metrics to observability platform
   */
  async exportMetrics(platform: 'datadog' | 'grafana' | 'cloudwatch' | 'prometheus'): Promise<void> {
    const metrics = await this.collectMetrics();

    switch (platform) {
      case 'datadog':
        await this.exportToDatadog(metrics);
        break;
      case 'grafana':
        await this.exportToGrafana(metrics);
        break;
      case 'cloudwatch':
        await this.exportToCloudWatch(metrics);
        break;
      case 'prometheus':
        await this.exportToPrometheus(metrics);
        break;
    }
  }

  /**
   * Export to Datadog
   */
  private async exportToDatadog(metrics: any): Promise<void> {
    // Using Datadog API or StatsD
    const ddMetrics = this.convertToDatadogFormat(metrics);

    // Example format
    const payload = [
      {
        metric: 'holographic_field.coherence',
        type: 'gauge',
        points: [[Date.now() / 1000, metrics.fieldHealth.coherence]],
        tags: ['env:production', 'service:consciousness']
      },
      {
        metric: 'holographic_field.participants',
        type: 'gauge',
        points: [[Date.now() / 1000, metrics.fieldHealth.activeParticipants]],
        tags: ['env:production', 'service:consciousness']
      },
      {
        metric: 'holographic_field.symmetry.avg',
        type: 'gauge',
        points: [[Date.now() / 1000, metrics.fieldHealth.avgSymmetry]],
        tags: ['env:production', 'service:consciousness']
      },
      // ... more metrics
    ];

    // Would send to Datadog API
    console.log('Exported to Datadog:', payload.length, 'metrics');
  }

  /**
   * Export to Prometheus
   */
  private async exportToPrometheus(metrics: any): Promise<void> {
    // Prometheus format
    const prometheusMetrics = `
# HELP holographic_field_coherence Current field coherence
# TYPE holographic_field_coherence gauge
holographic_field_coherence{phase="${metrics.fieldHealth.phase}"} ${metrics.fieldHealth.coherence}

# HELP holographic_field_participants Active participants
# TYPE holographic_field_participants gauge
holographic_field_participants ${metrics.fieldHealth.activeParticipants}

# HELP holographic_field_symmetry_avg Average field symmetry
# TYPE holographic_field_symmetry_avg gauge
holographic_field_symmetry_avg ${metrics.fieldHealth.avgSymmetry}

# HELP holographic_field_valence_avg Average field valence
# TYPE holographic_field_valence_avg gauge
holographic_field_valence_avg ${metrics.fieldHealth.avgValence}

# HELP system_api_latency_p95 API response time p95
# TYPE system_api_latency_p95 gauge
system_api_latency_p95 ${metrics.systemPerformance.apiResponseTime.p95}

# HELP system_error_rate Overall error rate
# TYPE system_error_rate gauge
system_error_rate ${metrics.systemPerformance.errorRate}

# HELP data_quality_score Overall data quality score
# TYPE data_quality_score gauge
data_quality_score ${metrics.dataQuality.qualityScore}
    `.trim();

    console.log('Prometheus metrics ready');
    // Would expose via /metrics endpoint
  }

  /**
   * Get metrics summary for dashboard
   */
  getMetricsSummary(metrics: any): {
    overall: 'healthy' | 'degraded' | 'critical';
    scores: {
      fieldHealth: number;
      systemPerformance: number;
      dataQuality: number;
      researchIntegrity: number;
    };
    topAlerts: string[];
  } {
    return {
      overall: this.calculateOverallStatus(metrics),
      scores: {
        fieldHealth: metrics.fieldHealth.healthScore,
        systemPerformance: this.calculatePerformanceScore(metrics.systemPerformance),
        dataQuality: metrics.dataQuality.qualityScore,
        researchIntegrity: this.calculateIntegrityScore(metrics.researchIntegrity)
      },
      topAlerts: metrics.fieldHealth.anomaliesDetected.slice(0, 5)
    };
  }

  // ============================================================================
  // HELPER METHODS (Placeholder implementations)
  // ============================================================================

  private async getHistoricalCoherence(hours: number): Promise<number[]> {
    // Would query database
    return [0.75, 0.77, 0.76, 0.78, 0.82];
  }

  private calculateTrend(values: number[]): 'rising' | 'falling' | 'stable' {
    if (values.length < 2) return 'stable';
    const slope = (values[values.length - 1] - values[0]) / values.length;
    if (slope > 0.02) return 'rising';
    if (slope < -0.02) return 'falling';
    return 'stable';
  }

  private async getParticipationMetrics() {
    return {
      growthRate: 0.15, // 15% growth
      avgSessions: 8.3,
      retention7d: 0.68
    };
  }

  private async getPhaseTransitions(days: number) {
    return {
      lastBreakthrough: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
      timeSinceBreakthrough: 18,
      frequency: 2.1, // Per week
      rate: 0.3 // Per day
    };
  }

  private calculatePhaseStability(transitions: any): number {
    // High frequency = low stability
    return Math.max(0, 1 - transitions.rate / 2);
  }

  private calculateFieldHealthScore(fieldState: any, participation: any): number {
    return Math.round(
      fieldState.coherence * 40 +
      (fieldState.participantCount / 1000) * 30 +
      fieldState.symmetry.global * 20 +
      participation.retention7d * 10
    );
  }

  private getHealthStatus(score: number): 'healthy' | 'degraded' | 'critical' {
    if (score >= 70) return 'healthy';
    if (score >= 40) return 'degraded';
    return 'critical';
  }

  private async calculateTemporalClustering(): Promise<number> {
    // Would calculate actual temporal clustering coefficient
    return 0.67;
  }

  private async detectAnomalies(): Promise<string[]> {
    // Would detect actual anomalies
    return [];
  }

  private async getLatencyMetrics() {
    return {
      qualiaCapture: { p50: 45, p95: 120, p99: 250 },
      fieldCalculation: { p50: 35, p95: 95, p99: 180 },
      api: { p50: 85, p95: 320, p99: 650 }
    };
  }

  private async getThroughputMetrics() {
    return {
      qualiaStates: 23.5,
      fieldUpdates: 1.2,
      apiRequests: 156
    };
  }

  private async getErrorMetrics() {
    return {
      qualiaErrors: 2,
      fieldErrors: 0,
      apiErrors: 5,
      overallRate: 0.012 // 1.2%
    };
  }

  private async getDatabaseMetrics() {
    return {
      writeLatency: 12,
      readLatency: 8,
      poolUtilization: 0.45,
      diskUsage: 23.7
    };
  }

  private async assessCompleteness() {
    return {
      dimensions: 0.98,
      description: 0.67,
      insights: 0.42,
      texture: 0.38
    };
  }

  private async detectDataAnomalies() {
    return {
      outliers: 12,
      suspicious: 3,
      duplicates: 1
    };
  }

  private async assessConsistency() {
    return {
      dimensional: 0.89,
      temporal: 0.85,
      crossUser: 0.78
    };
  }

  private async assessDataIntegrity() {
    return {
      missingRate: 0.03,
      invalidRate: 0.01,
      corrupted: 0
    };
  }

  private calculateQualityScore(metrics: any): number {
    return Math.round(
      metrics.completeness.dimensions * 30 +
      metrics.consistency.dimensional * 30 +
      (1 - metrics.integrity.invalidRate) * 20 +
      (1 - metrics.anomalies.outliers / 1000) * 20
    );
  }

  private calculateSignalToNoise(): number {
    return 8.7; // Ratio
  }

  private async getEngagementMetrics() {
    return {
      dau: 234,
      wau: 892,
      mau: 2341,
      avgDuration: 1840,
      avgStatesPerDay: 2.3
    };
  }

  private async getGrowthMetrics() {
    return {
      newToday: 23,
      growthRate: 0.12,
      churnRate: 0.08
    };
  }

  private async getFeatureAdoption() {
    return {
      sliders: 0.87,
      mapper: 0.34,
      fieldView: 0.56
    };
  }

  private async getCoherenceChange(hours: number): Promise<number> {
    // Calculate change over period
    return -0.15; // -15% change
  }

  private async sendAlerts(alerts: string[]): Promise<void> {
    // Would send to Slack, PagerDuty, etc.
    console.log('ALERTS:', alerts);
  }

  private convertToDatadogFormat(metrics: any): any[] {
    // Convert to Datadog format
    return [];
  }

  private calculateOverallStatus(metrics: any): 'healthy' | 'degraded' | 'critical' {
    const scores = [
      metrics.fieldHealth.healthScore,
      this.calculatePerformanceScore(metrics.systemPerformance),
      metrics.dataQuality.qualityScore,
      this.calculateIntegrityScore(metrics.researchIntegrity)
    ];

    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    if (avgScore >= 70) return 'healthy';
    if (avgScore >= 40) return 'degraded';
    return 'critical';
  }

  private calculatePerformanceScore(perf: SystemPerformanceMetrics): number {
    return Math.round(
      (perf.apiResponseTime.p95 < 500 ? 40 : 20) +
      (perf.errorRate < 0.01 ? 30 : perf.errorRate < 0.05 ? 15 : 0) +
      (perf.databaseWriteLatency < 20 ? 30 : 15)
    );
  }

  private calculateIntegrityScore(integrity: ResearchIntegrityMetrics): number {
    return Math.round(
      integrity.privacyAuditPassRate * 50 +
      (integrity.reidentificationRisk.low * 30) +
      (integrity.consentRate * 20)
    );
  }
}

/**
 * Export singleton
 */
let metricsMonitorInstance: FieldMetricsMonitor | null = null;

export function getFieldMetricsMonitor(): FieldMetricsMonitor {
  if (!metricsMonitorInstance) {
    metricsMonitorInstance = new FieldMetricsMonitor();
  }
  return metricsMonitorInstance;
}

/**
 * Convenience function for quick health check
 */
export async function getFieldHealthStatus(): Promise<{
  status: 'healthy' | 'degraded' | 'critical';
  coherence: number;
  participants: number;
  alerts: string[];
}> {
  const monitor = getFieldMetricsMonitor();
  const metrics = await monitor.collectMetrics();

  return {
    status: metrics.fieldHealth.status,
    coherence: metrics.fieldHealth.coherence,
    participants: metrics.fieldHealth.activeParticipants,
    alerts: metrics.fieldHealth.anomaliesDetected
  };
}
