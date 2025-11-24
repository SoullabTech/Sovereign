/**
 * Looping Protocol Monitoring & Optimization Framework
 * Tracks patterns, edge cases, and optimization opportunities
 */

import { LoopingState, LoopingIntensity } from './LoopingProtocol';
import { ConvergenceMetrics } from './ConvergenceTracker';
import { ElementalArchetype } from '../../../web/lib/types/elemental';

export interface LoopingMetrics {
  sessionId: string;
  userId: string;
  timestamp: Date;

  // Core metrics
  loopsInitiated: number;
  loopsCompleted: number;
  averageLoopsPerExchange: number;
  convergenceRate: number;

  // Pattern tracking
  convergencePattern: 'improving' | 'plateaued' | 'oscillating' | 'declining';
  patternFrequency: Map<string, number>;

  // User engagement
  userRejections: number;
  silentResponses: number;
  topicShifts: number;
  explicitRequests: number;

  // Performance
  exchangeBudgetUsed: number;
  templateRepetitions: number;
  semanticSimilarity: number;
}

export interface EdgeCaseEvent {
  type: 'consistent_rejection' | 'rapid_topic_shift' | 'silent_response' | 'paradigm_mismatch';
  timestamp: Date;
  context: string;
  resolution: string;
}

export interface OptimizationSuggestion {
  type: 'threshold_adjustment' | 'intensity_change' | 'template_expansion' | 'paradigm_shift';
  current: any;
  suggested: any;
  reasoning: string;
  confidence: number;
}

/**
 * Main monitoring class for looping protocol
 */
export class LoopingMonitor {
  private metrics: Map<string, LoopingMetrics> = new Map();
  private edgeCases: EdgeCaseEvent[] = [];
  private globalPatterns: Map<string, number> = new Map();

  // Configurable thresholds
  private readonly config = {
    maxRejectionRate: 0.3,        // Alert if >30% rejections
    maxOscillationRate: 0.2,      // Alert if >20% oscillating
    minConvergenceRate: 0.6,      // Alert if <60% successful convergence
    maxExchangeBudgetUsage: 0.75, // Alert if using >75% of exchanges
    semanticRepetitionThreshold: 0.8, // Alert if similarity >80%
    silentResponseTimeout: 10000,  // 10 seconds
  };

  /**
   * Track a looping session
   */
  trackSession(
    sessionId: string,
    userId: string,
    state: LoopingState,
    convergence: ConvergenceMetrics,
    userResponse?: string
  ): void {
    let metrics = this.metrics.get(sessionId) || this.initializeMetrics(sessionId, userId);

    // Update core metrics
    metrics.loopsInitiated++;
    if (convergence.overallConvergence >= 0.85) {
      metrics.loopsCompleted++;
    }

    // Track patterns
    this.trackConvergencePattern(metrics, convergence);

    // Track user engagement
    this.trackUserEngagement(metrics, userResponse, state);

    // Track performance
    this.trackPerformance(metrics, state);

    this.metrics.set(sessionId, metrics);

    // Check for edge cases
    this.detectEdgeCases(sessionId, metrics, userResponse);
  }

  /**
   * Detect and handle edge cases
   */
  private detectEdgeCases(
    sessionId: string,
    metrics: LoopingMetrics,
    userResponse?: string
  ): void {
    // Consistent rejection pattern
    const rejectionRate = metrics.userRejections / Math.max(metrics.loopsInitiated, 1);
    if (rejectionRate > this.config.maxRejectionRate) {
      this.recordEdgeCase({
        type: 'consistent_rejection',
        timestamp: new Date(),
        context: `Session ${sessionId}: ${rejectionRate.toFixed(2)} rejection rate`,
        resolution: 'Consider paradigm mismatch or reduce looping activation'
      });
    }

    // Silent response handling
    if (!userResponse || userResponse.trim() === '') {
      this.recordEdgeCase({
        type: 'silent_response',
        timestamp: new Date(),
        context: `Session ${sessionId}: Silent response to check`,
        resolution: 'Interpret as need for space, skip to next exchange'
      });
    }

    // Rapid topic shift detection
    if (metrics.topicShifts > 2) {
      this.recordEdgeCase({
        type: 'rapid_topic_shift',
        timestamp: new Date(),
        context: `Session ${sessionId}: ${metrics.topicShifts} topic shifts`,
        resolution: 'Let go of current loop, follow user\'s lead'
      });
    }
  }

  /**
   * Generate optimization suggestions based on patterns
   */
  generateOptimizations(): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // Analyze global patterns
    const totalSessions = this.metrics.size;
    let avgConvergence = 0;
    let avgRejections = 0;
    let avgBudgetUsage = 0;
    let oscillationCount = 0;

    this.metrics.forEach(metrics => {
      avgConvergence += metrics.convergenceRate;
      avgRejections += metrics.userRejections / Math.max(metrics.loopsInitiated, 1);
      avgBudgetUsage += metrics.exchangeBudgetUsed;
      if (metrics.convergencePattern === 'oscillating') oscillationCount++;
    });

    avgConvergence /= totalSessions;
    avgRejections /= totalSessions;
    avgBudgetUsage /= totalSessions;
    const oscillationRate = oscillationCount / totalSessions;

    // Generate threshold adjustment suggestions
    if (avgConvergence < this.config.minConvergenceRate) {
      suggestions.push({
        type: 'threshold_adjustment',
        current: { emotional: 0.7, ambiguity: 0.6 },
        suggested: { emotional: 0.8, ambiguity: 0.7 },
        reasoning: `Low convergence rate (${(avgConvergence * 100).toFixed(1)}%). Increase activation thresholds.`,
        confidence: 0.8
      });
    }

    // Suggest intensity changes
    if (avgBudgetUsage > this.config.maxExchangeBudgetUsage) {
      suggestions.push({
        type: 'intensity_change',
        current: LoopingIntensity.FULL,
        suggested: LoopingIntensity.LIGHT,
        reasoning: `High exchange budget usage (${(avgBudgetUsage * 100).toFixed(1)}%). Default to Light mode.`,
        confidence: 0.9
      });
    }

    // Handle oscillation patterns
    if (oscillationRate > this.config.maxOscillationRate) {
      suggestions.push({
        type: 'template_expansion',
        current: 'current_templates',
        suggested: 'add_stabilizing_phrases',
        reasoning: `High oscillation rate (${(oscillationRate * 100).toFixed(1)}%). Add stabilizing check phrases.`,
        confidence: 0.7
      });
    }

    return suggestions;
  }

  /**
   * Get edge case handling recommendations
   */
  getEdgeCaseHandlers(): Map<string, string> {
    const handlers = new Map<string, string>();

    handlers.set('consistent_rejection', `
      if (rejectionCount >= 3) {
        // Switch to direct witness mode
        return directWitness(input, context);
      }
    `);

    handlers.set('silent_response', `
      if (isTimeout && !userResponse) {
        // Interpret as agreement or need for space
        state.convergence = 0.7; // Assume moderate convergence
        return transitionToAction(state);
      }
    `);

    handlers.set('rapid_topic_shift', `
      if (detectTopicShift(input, previousInput)) {
        // Release current loop, follow new direction
        resetLoopingState();
        return witness(input, freshContext);
      }
    `);

    handlers.set('paradigm_mismatch', `
      if (paradigmMismatchScore > 0.7) {
        // Offer alternative interaction mode
        return offerAlternativeMode(context);
      }
    `);

    return handlers;
  }

  /**
   * Generate monitoring dashboard data
   */
  generateDashboard(): {
    summary: any;
    patterns: any;
    recommendations: OptimizationSuggestion[];
    edgeCases: EdgeCaseEvent[];
  } {
    const summary = {
      totalSessions: this.metrics.size,
      avgConvergenceRate: this.calculateAvgConvergence(),
      commonPatterns: this.getMostCommonPatterns(),
      edgeCaseFrequency: this.edgeCases.length / this.metrics.size
    };

    return {
      summary,
      patterns: this.analyzePatterns(),
      recommendations: this.generateOptimizations(),
      edgeCases: this.edgeCases.slice(-10) // Last 10 edge cases
    };
  }

  // Helper methods

  private initializeMetrics(sessionId: string, userId: string): LoopingMetrics {
    return {
      sessionId,
      userId,
      timestamp: new Date(),
      loopsInitiated: 0,
      loopsCompleted: 0,
      averageLoopsPerExchange: 0,
      convergenceRate: 0,
      convergencePattern: 'improving',
      patternFrequency: new Map(),
      userRejections: 0,
      silentResponses: 0,
      topicShifts: 0,
      explicitRequests: 0,
      exchangeBudgetUsed: 0,
      templateRepetitions: 0,
      semanticSimilarity: 0
    };
  }

  private trackConvergencePattern(
    metrics: LoopingMetrics,
    convergence: ConvergenceMetrics
  ): void {
    // Simplified pattern detection
    if (convergence.overallConvergence > 0.7) {
      metrics.convergencePattern = 'improving';
    } else if (Math.abs(convergence.overallConvergence - 0.5) < 0.1) {
      metrics.convergencePattern = 'plateaued';
    } else if (convergence.overallConvergence < 0.3) {
      metrics.convergencePattern = 'declining';
    } else {
      metrics.convergencePattern = 'oscillating';
    }

    // Track pattern frequency
    const pattern = metrics.convergencePattern;
    metrics.patternFrequency.set(pattern, (metrics.patternFrequency.get(pattern) || 0) + 1);
  }

  private trackUserEngagement(
    metrics: LoopingMetrics,
    userResponse: string | undefined,
    state: LoopingState
  ): void {
    if (!userResponse || userResponse.trim() === '') {
      metrics.silentResponses++;
      return;
    }

    const lowerResponse = userResponse.toLowerCase();

    // Track rejections
    if (lowerResponse.includes('no') ||
        lowerResponse.includes('not') ||
        lowerResponse.includes('wrong')) {
      metrics.userRejections++;
    }

    // Track explicit requests
    if (lowerResponse.includes('help me understand') ||
        lowerResponse.includes('what do you mean')) {
      metrics.explicitRequests++;
    }

    // Simple topic shift detection
    if (this.detectTopicShift(userResponse, state.surfaceCapture)) {
      metrics.topicShifts++;
    }
  }

  private trackPerformance(
    metrics: LoopingMetrics,
    state: LoopingState
  ): void {
    // Track exchange budget usage
    metrics.exchangeBudgetUsed = state.loopCount / state.maxLoops;

    // Track average loops per exchange
    metrics.averageLoopsPerExchange =
      (metrics.averageLoopsPerExchange * (metrics.loopsInitiated - 1) + state.loopCount) /
      metrics.loopsInitiated;

    // Update convergence rate
    metrics.convergenceRate =
      metrics.loopsCompleted / Math.max(metrics.loopsInitiated, 1);
  }

  private detectTopicShift(current: string, previous: string): boolean {
    // Simple topic shift detection based on keyword overlap
    const currentWords = new Set(current.toLowerCase().split(/\s+/));
    const previousWords = new Set(previous.toLowerCase().split(/\s+/));

    const intersection = new Set([...currentWords].filter(x => previousWords.has(x)));
    const overlap = intersection.size / Math.max(currentWords.size, previousWords.size);

    return overlap < 0.2; // Less than 20% overlap suggests topic shift
  }

  private recordEdgeCase(event: EdgeCaseEvent): void {
    this.edgeCases.push(event);

    // Keep only last 100 edge cases
    if (this.edgeCases.length > 100) {
      this.edgeCases = this.edgeCases.slice(-100);
    }
  }

  private calculateAvgConvergence(): number {
    let total = 0;
    this.metrics.forEach(m => total += m.convergenceRate);
    return total / Math.max(this.metrics.size, 1);
  }

  private getMostCommonPatterns(): string[] {
    const patterns: Map<string, number> = new Map();

    this.metrics.forEach(m => {
      m.patternFrequency.forEach((count, pattern) => {
        patterns.set(pattern, (patterns.get(pattern) || 0) + count);
      });
    });

    return Array.from(patterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([pattern]) => pattern);
  }

  private analyzePatterns(): any {
    const analysis = {
      convergencePatterns: this.getMostCommonPatterns(),
      avgLoopsToConvergence: 0,
      successRate: 0,
      problemAreas: [] as string[]
    };

    let totalLoops = 0;
    let successCount = 0;

    this.metrics.forEach(m => {
      totalLoops += m.averageLoopsPerExchange;
      if (m.convergenceRate > 0.6) successCount++;

      // Identify problem areas
      if (m.userRejections > 3) {
        analysis.problemAreas.push(`High rejection: ${m.sessionId}`);
      }
      if (m.convergencePattern === 'oscillating') {
        analysis.problemAreas.push(`Oscillating: ${m.sessionId}`);
      }
    });

    analysis.avgLoopsToConvergence = totalLoops / Math.max(this.metrics.size, 1);
    analysis.successRate = successCount / Math.max(this.metrics.size, 1);

    return analysis;
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): string {
    const data = {
      metrics: Array.from(this.metrics.values()),
      edgeCases: this.edgeCases,
      patterns: this.analyzePatterns(),
      optimizations: this.generateOptimizations()
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Reset monitor for new period
   */
  reset(): void {
    this.metrics.clear();
    this.edgeCases = [];
    this.globalPatterns.clear();
  }
}

// Export singleton instance
export const loopingMonitor = new LoopingMonitor();