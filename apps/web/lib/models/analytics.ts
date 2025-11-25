/**
 * MAIA Performance Analytics System
 * Tracks, analyzes, and optimizes model performance across consciousness levels
 */

import { ModelPerformance, ModelAnalytics, ConsciousnessLevel, ContextAnalysis } from './types';

interface AnalyticsConfig {
  retentionDays: number;
  batchSize: number;
  aggregationInterval: number; // ms
}

export class ModelAnalyticsEngine {
  private performanceData: ModelPerformance[] = [];
  private aggregatedData = new Map<string, ModelAnalytics>();
  private config: AnalyticsConfig;

  constructor(config?: Partial<AnalyticsConfig>) {
    this.config = {
      retentionDays: 30,
      batchSize: 1000,
      aggregationInterval: 60000, // 1 minute
      ...config
    };

    // Start periodic aggregation
    setInterval(() => {
      this.aggregatePerformanceData();
    }, this.config.aggregationInterval);
  }

  /**
   * Record a performance data point
   */
  recordPerformance(performance: ModelPerformance): void {
    this.performanceData.push(performance);

    // Clean old data periodically
    if (this.performanceData.length > this.config.batchSize) {
      this.cleanOldData();
    }

    // Real-time analytics updates
    this.updateRealTimeMetrics(performance);
  }

  /**
   * Get analytics for a specific model
   */
  getModelAnalytics(modelId: string, timeframeHours = 24): ModelAnalytics | null {
    const now = Date.now();
    const startTime = now - (timeframeHours * 60 * 60 * 1000);

    const modelData = this.performanceData.filter(
      p => p.modelId === modelId && p.timestamp >= startTime
    );

    if (modelData.length === 0) {
      return null;
    }

    return this.calculateAnalytics(modelId, modelData, startTime, now);
  }

  /**
   * Get comparative analytics across all models
   */
  getComparativeAnalytics(timeframeHours = 24): Record<string, ModelAnalytics> {
    const now = Date.now();
    const startTime = now - (timeframeHours * 60 * 60 * 1000);

    const recentData = this.performanceData.filter(p => p.timestamp >= startTime);
    const modelGroups = this.groupByModel(recentData);

    const analytics: Record<string, ModelAnalytics> = {};

    for (const [modelId, data] of modelGroups.entries()) {
      analytics[modelId] = this.calculateAnalytics(modelId, data, startTime, now);
    }

    return analytics;
  }

  /**
   * Get performance trends for consciousness levels
   */
  getConsciousnessLevelTrends(timeframeHours = 24): Record<ConsciousnessLevel, {
    averageResponseTime: number;
    averageQuality: number;
    requestCount: number;
    topModels: Array<{ modelId: string; performance: number }>;
  }> {
    const now = Date.now();
    const startTime = now - (timeframeHours * 60 * 60 * 1000);

    const recentData = this.performanceData.filter(p => p.timestamp >= startTime);
    const trends: any = {};

    for (let level = 1; level <= 5; level++) {
      const levelData = recentData.filter(p => p.context.consciousnessLevel === level as ConsciousnessLevel);

      if (levelData.length === 0) {
        trends[level] = {
          averageResponseTime: 0,
          averageQuality: 0,
          requestCount: 0,
          topModels: []
        };
        continue;
      }

      const avgResponseTime = levelData.reduce((sum, p) => sum + p.metrics.responseTime, 0) / levelData.length;
      const avgQuality = levelData.reduce((sum, p) => sum + (p.metrics.qualityScore || 0), 0) / levelData.length;

      // Calculate top models for this level
      const modelPerformance = new Map<string, { total: number; count: number }>();
      levelData.forEach(p => {
        const current = modelPerformance.get(p.modelId) || { total: 0, count: 0 };
        const score = (p.metrics.qualityScore || 0) * (1000 / Math.max(p.metrics.responseTime, 1)); // Quality/speed ratio
        current.total += score;
        current.count += 1;
        modelPerformance.set(p.modelId, current);
      });

      const topModels = Array.from(modelPerformance.entries())
        .map(([modelId, stats]) => ({
          modelId,
          performance: stats.total / stats.count
        }))
        .sort((a, b) => b.performance - a.performance)
        .slice(0, 3);

      trends[level] = {
        averageResponseTime: avgResponseTime,
        averageQuality: avgQuality,
        requestCount: levelData.length,
        topModels
      };
    }

    return trends;
  }

  /**
   * Get real-time performance metrics
   */
  getRealTimeMetrics(): {
    activeModels: string[];
    currentLoad: Record<string, number>;
    averageResponseTimes: Record<string, number>;
    errorRates: Record<string, number>;
    totalRequests: number;
  } {
    const lastHour = Date.now() - (60 * 60 * 1000);
    const recentData = this.performanceData.filter(p => p.timestamp >= lastHour);

    const metrics = {
      activeModels: Array.from(new Set(recentData.map(p => p.modelId))),
      currentLoad: new Map<string, number>(),
      averageResponseTimes: new Map<string, number>(),
      errorRates: new Map<string, number>(),
      totalRequests: recentData.length
    };

    // Calculate per-model metrics
    const modelGroups = this.groupByModel(recentData);

    for (const [modelId, data] of modelGroups.entries()) {
      // Load (requests per minute)
      const load = data.length / 60;
      metrics.currentLoad.set(modelId, load);

      // Average response time
      const avgResponseTime = data.reduce((sum, p) => sum + p.metrics.responseTime, 0) / data.length;
      metrics.averageResponseTimes.set(modelId, avgResponseTime);

      // Error rate
      const errors = data.filter(p => p.metrics.responseTime === 0 || p.metrics.responseTime > 30000).length;
      const errorRate = errors / data.length;
      metrics.errorRates.set(modelId, errorRate);
    }

    return {
      activeModels: metrics.activeModels,
      currentLoad: Object.fromEntries(metrics.currentLoad),
      averageResponseTimes: Object.fromEntries(metrics.averageResponseTimes),
      errorRates: Object.fromEntries(metrics.errorRates),
      totalRequests: metrics.totalRequests
    };
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations(): Array<{
    type: 'model_selection' | 'temperature_tuning' | 'token_limit' | 'fallback_strategy';
    priority: 'high' | 'medium' | 'low';
    recommendation: string;
    data: any;
  }> {
    const analytics = this.getComparativeAnalytics(24);
    const levelTrends = this.getConsciousnessLevelTrends(24);
    const recommendations: Array<any> = [];

    // Analyze response time patterns
    const slowModels = Object.entries(analytics)
      .filter(([_, data]) => data.usage.averageResponseTime > 5000)
      .map(([modelId]) => modelId);

    if (slowModels.length > 0) {
      recommendations.push({
        type: 'model_selection',
        priority: 'high',
        recommendation: `Consider replacing slow models: ${slowModels.join(', ')}. Average response time > 5s`,
        data: { slowModels, averageTimes: slowModels.map(id => analytics[id]?.usage.averageResponseTime) }
      });
    }

    // Analyze consciousness level efficiency
    for (const [level, data] of Object.entries(levelTrends)) {
      if (data.averageResponseTime > 3000 && data.requestCount > 10) {
        const topModel = data.topModels[0];
        recommendations.push({
          type: 'model_selection',
          priority: 'medium',
          recommendation: `Consciousness level ${level} could benefit from using ${topModel?.modelId} more often`,
          data: { level, currentAverage: data.averageResponseTime, topModel }
        });
      }
    }

    // Analyze quality vs speed trade-offs
    const qualitySpeedAnalysis = Object.entries(analytics).map(([modelId, data]) => ({
      modelId,
      qualitySpeedRatio: data.performance.qualityScoreAverage / (data.usage.averageResponseTime / 1000)
    })).sort((a, b) => b.qualitySpeedRatio - a.qualitySpeedRatio);

    if (qualitySpeedAnalysis.length > 1) {
      const bestRatio = qualitySpeedAnalysis[0];
      recommendations.push({
        type: 'model_selection',
        priority: 'medium',
        recommendation: `${bestRatio.modelId} has the best quality/speed ratio. Consider using it for more consciousness levels.`,
        data: { rankings: qualitySpeedAnalysis }
      });
    }

    return recommendations;
  }

  /**
   * Calculate analytics for a model
   */
  private calculateAnalytics(modelId: string, data: ModelPerformance[], startTime: number, endTime: number): ModelAnalytics {
    const successfulRequests = data.filter(p => p.metrics.responseTime > 0);
    const totalRequests = data.length;

    // Basic usage metrics
    const totalTokens = data.reduce((sum, p) => sum + p.metrics.outputTokens, 0);
    const totalTime = data.reduce((sum, p) => sum + p.metrics.responseTime, 0);
    const avgResponseTime = totalTime / Math.max(successfulRequests.length, 1);
    const avgTokensPerSecond = totalTokens / Math.max(totalTime / 1000, 1);

    // Quality metrics
    const qualityScores = data.filter(p => p.metrics.qualityScore).map(p => p.metrics.qualityScore!);
    const appropriatenessScores = data.filter(p => p.metrics.appropriatenessScore).map(p => p.metrics.appropriatenessScore!);

    const qualityAvg = qualityScores.length > 0 ?
      qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length : 0;
    const appropriatenessAvg = appropriatenessScores.length > 0 ?
      appropriatenessScores.reduce((sum, score) => sum + score, 0) / appropriatenessScores.length : 0;

    // Consciousness level breakdown
    const levelBreakdown: Record<ConsciousnessLevel, any> = {} as any;
    for (let level = 1; level <= 5; level++) {
      const levelData = data.filter(p => p.context.consciousnessLevel === level as ConsciousnessLevel);
      const levelQuality = levelData.filter(p => p.metrics.qualityScore).map(p => p.metrics.qualityScore!);
      const levelSpeed = levelData.map(p => p.metrics.responseTime);

      levelBreakdown[level as ConsciousnessLevel] = {
        requests: levelData.length,
        averageQuality: levelQuality.length > 0 ? levelQuality.reduce((a, b) => a + b, 0) / levelQuality.length : 0,
        averageSpeed: levelSpeed.length > 0 ? levelSpeed.reduce((a, b) => a + b, 0) / levelSpeed.length : 0
      };
    }

    // Calculate trends (compare with previous period)
    const previousPeriodStart = startTime - (endTime - startTime);
    const previousData = this.performanceData.filter(
      p => p.modelId === modelId && p.timestamp >= previousPeriodStart && p.timestamp < startTime
    );

    const previousAvgResponseTime = previousData.length > 0 ?
      previousData.reduce((sum, p) => sum + p.metrics.responseTime, 0) / previousData.length : avgResponseTime;
    const previousAvgQuality = previousData.filter(p => p.metrics.qualityScore).length > 0 ?
      previousData.filter(p => p.metrics.qualityScore).reduce((sum, p) => sum + p.metrics.qualityScore!, 0) / previousData.filter(p => p.metrics.qualityScore).length : qualityAvg;

    const responseTimeChange = previousAvgResponseTime > 0 ?
      ((avgResponseTime - previousAvgResponseTime) / previousAvgResponseTime) * 100 : 0;
    const qualityChange = previousAvgQuality > 0 ?
      ((qualityAvg - previousAvgQuality) / previousAvgQuality) * 100 : 0;
    const usageChange = previousData.length > 0 ?
      ((totalRequests - previousData.length) / previousData.length) * 100 : 0;

    return {
      modelId,
      timeframe: { start: startTime, end: endTime },
      usage: {
        totalRequests,
        successfulRequests: successfulRequests.length,
        averageResponseTime: avgResponseTime,
        totalTokensGenerated: totalTokens,
        averageTokensPerSecond: avgTokensPerSecond
      },
      performance: {
        qualityScoreAverage: qualityAvg,
        appropriatenessScoreAverage: appropriatenessAvg
      },
      consciousnessLevelBreakdown: levelBreakdown,
      trends: {
        responseTimeChange,
        qualityChange,
        usageChange
      }
    };
  }

  /**
   * Group performance data by model
   */
  private groupByModel(data: ModelPerformance[]): Map<string, ModelPerformance[]> {
    const groups = new Map<string, ModelPerformance[]>();

    data.forEach(performance => {
      const existing = groups.get(performance.modelId) || [];
      existing.push(performance);
      groups.set(performance.modelId, existing);
    });

    return groups;
  }

  /**
   * Update real-time metrics cache
   */
  private updateRealTimeMetrics(performance: ModelPerformance): void {
    // Update cached metrics for dashboard
    const cached = this.aggregatedData.get(performance.modelId);
    if (cached) {
      // Update running averages
      cached.usage.totalRequests += 1;
      cached.usage.totalTokensGenerated += performance.metrics.outputTokens;
      // Update other real-time metrics...
    }
  }

  /**
   * Clean old performance data
   */
  private cleanOldData(): void {
    const cutoff = Date.now() - (this.config.retentionDays * 24 * 60 * 60 * 1000);
    this.performanceData = this.performanceData.filter(p => p.timestamp > cutoff);
  }

  /**
   * Aggregate performance data for storage/caching
   */
  private aggregatePerformanceData(): void {
    // Aggregate recent data for faster queries
    const now = Date.now();
    const lastHour = now - (60 * 60 * 1000);
    const recentData = this.performanceData.filter(p => p.timestamp >= lastHour);

    const modelGroups = this.groupByModel(recentData);

    for (const [modelId, data] of modelGroups.entries()) {
      const analytics = this.calculateAnalytics(modelId, data, lastHour, now);
      this.aggregatedData.set(modelId, analytics);
    }
  }
}

// Singleton instance
export const modelAnalytics = new ModelAnalyticsEngine();