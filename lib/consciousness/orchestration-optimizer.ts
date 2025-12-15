/**
 * ORCHESTRATION OPTIMIZER
 *
 * Dynamically adjusts multi-engine usage based on:
 * - Query complexity
 * - Available system resources
 * - Response time requirements
 * - User preferences
 */

import { OrchestrationType } from '../ai/multiEngineOrchestrator';

export interface QueryComplexity {
  score: number; // 0-1 where 1 is most complex
  factors: {
    length: number;
    emotionalDepth: number;
    abstractConcepts: number;
    personalContext: number;
    timeImportance: number;
  };
  recommended: OrchestrationType;
}

export interface SystemResources {
  availableRAM: number;
  cpuLoad: number;
  modelLoadTime: number;
  networkLatency: number;
}

export interface PerformanceMetrics {
  responseTime: number;
  confidence: number;
  engineUtilization: Record<string, number>;
  userSatisfaction?: number;
  timestamp: number;
}

export class OrchestrationOptimizer {
  private performanceHistory: PerformanceMetrics[] = [];
  private userPreferences: Record<string, any> = {};

  // Complexity analysis patterns
  private readonly COMPLEXITY_PATTERNS = {
    existential: ['purpose', 'meaning', 'existence', 'death', 'consciousness', 'reality'],
    emotional: ['feel', 'emotion', 'heart', 'love', 'pain', 'joy', 'grief', 'anger'],
    relational: ['relationship', 'family', 'friend', 'partner', 'conflict', 'connection'],
    spiritual: ['soul', 'spirit', 'divine', 'sacred', 'transcendent', 'awakening'],
    practical: ['work', 'money', 'career', 'decision', 'plan', 'action', 'steps'],
    urgent: ['emergency', 'crisis', 'urgent', 'immediate', 'help', 'stuck', 'lost']
  };

  /**
   * Analyze query complexity to determine optimal orchestration
   */
  analyzeComplexity(input: string, context?: any): QueryComplexity {
    const words = input.toLowerCase().split(/\s+/);
    const length = words.length;

    // Calculate complexity factors
    const factors = {
      length: Math.min(length / 100, 1), // Normalize to 0-1
      emotionalDepth: this.calculateEmotionalDepth(words),
      abstractConcepts: this.calculateAbstractConcepts(words),
      personalContext: context?.sessionHistory?.length ? 0.3 : 0,
      timeImportance: this.calculateTimeImportance(words)
    };

    // Weighted complexity score
    const score = (
      factors.length * 0.1 +
      factors.emotionalDepth * 0.3 +
      factors.abstractConcepts * 0.4 +
      factors.personalContext * 0.1 +
      factors.timeImportance * 0.1
    );

    // Recommend orchestration type based on complexity
    const recommended = this.recommendOrchestration(score, factors);

    return { score, factors, recommended };
  }

  /**
   * Get optimal orchestration considering resources and performance
   */
  optimizeOrchestration(
    baseComplexity: QueryComplexity,
    resources: SystemResources,
    userPrefs: Record<string, any> = {}
  ): {
    orchestrationType: OrchestrationType;
    reasoning: string;
    expectedPerformance: {
      estimatedTime: number;
      confidence: number;
      resourceUsage: number;
    };
  } {
    let orchestrationType = baseComplexity.recommended;
    let reasoning = `Base recommendation: ${orchestrationType}`;

    // Resource-based adjustments
    if (resources.cpuLoad > 0.8) {
      orchestrationType = this.downgradeOrchestration(orchestrationType);
      reasoning += ' → Downgraded due to high CPU load';
    }

    if (resources.availableRAM < 8000) { // Less than 8GB
      if (orchestrationType === 'heavy_analysis' || orchestrationType === 'full_orchestra') {
        orchestrationType = 'creative_synthesis';
        reasoning += ' → Reduced to creative_synthesis due to RAM constraints';
      }
    }

    // User preference adjustments
    if (userPrefs.speed === 'priority' && orchestrationType !== 'primary') {
      orchestrationType = 'dual_reasoning';
      reasoning += ' → Speed prioritized by user';
    }

    if (userPrefs.quality === 'maximum' && resources.cpuLoad < 0.5) {
      orchestrationType = this.upgradeOrchestration(orchestrationType);
      reasoning += ' → Upgraded for maximum quality';
    }

    // Performance estimation
    const expectedPerformance = this.estimatePerformance(orchestrationType, baseComplexity.score);

    return {
      orchestrationType,
      reasoning,
      expectedPerformance
    };
  }

  /**
   * Track performance and learn from results
   */
  trackPerformance(metrics: PerformanceMetrics): void {
    this.performanceHistory.push(metrics);

    // Keep last 1000 interactions
    if (this.performanceHistory.length > 1000) {
      this.performanceHistory = this.performanceHistory.slice(-1000);
    }

    // Auto-adjust thresholds based on performance trends
    this.updateOptimizationThresholds();
  }

  /**
   * Get orchestration performance analytics
   */
  getAnalytics(): {
    averageResponseTime: Record<OrchestrationType, number>;
    averageConfidence: Record<OrchestrationType, number>;
    recommendationAccuracy: number;
    resourceEfficiency: number;
  } {
    const analytics = {
      averageResponseTime: {} as Record<OrchestrationType, number>,
      averageConfidence: {} as Record<OrchestrationType, number>,
      recommendationAccuracy: 0,
      resourceEfficiency: 0
    };

    // Calculate averages by orchestration type
    const groupedMetrics = this.groupMetricsByType();

    for (const [type, metrics] of Object.entries(groupedMetrics)) {
      analytics.averageResponseTime[type as OrchestrationType] =
        metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length;

      analytics.averageConfidence[type as OrchestrationType] =
        metrics.reduce((sum, m) => sum + m.confidence, 0) / metrics.length;
    }

    // Calculate recommendation accuracy and efficiency
    analytics.recommendationAccuracy = this.calculateRecommendationAccuracy();
    analytics.resourceEfficiency = this.calculateResourceEfficiency();

    return analytics;
  }

  // Private helper methods
  private calculateEmotionalDepth(words: string[]): number {
    const emotionalWords = words.filter(word =>
      this.COMPLEXITY_PATTERNS.emotional.some(pattern => word.includes(pattern))
    );
    return Math.min(emotionalWords.length / 10, 1);
  }

  private calculateAbstractConcepts(words: string[]): number {
    const abstractWords = words.filter(word =>
      this.COMPLEXITY_PATTERNS.existential.some(pattern => word.includes(pattern)) ||
      this.COMPLEXITY_PATTERNS.spiritual.some(pattern => word.includes(pattern))
    );
    return Math.min(abstractWords.length / 8, 1);
  }

  private calculateTimeImportance(words: string[]): number {
    const urgentWords = words.filter(word =>
      this.COMPLEXITY_PATTERNS.urgent.some(pattern => word.includes(pattern))
    );
    return urgentWords.length > 0 ? 1 : 0;
  }

  private recommendOrchestration(score: number, factors: any): OrchestrationType {
    // High urgency = faster response
    if (factors.timeImportance > 0.5) return 'dual_reasoning';

    // Very high complexity = full orchestra
    if (score > 0.8) return 'full_orchestra';

    // High complexity = heavy analysis or creative synthesis
    if (score > 0.6) {
      return factors.abstractConcepts > factors.emotionalDepth ?
        'heavy_analysis' : 'creative_synthesis';
    }

    // Medium complexity = dual reasoning
    if (score > 0.3) return 'dual_reasoning';

    // Low complexity = primary
    return 'primary';
  }

  private downgradeOrchestration(type: OrchestrationType): OrchestrationType {
    const hierarchy: OrchestrationType[] = [
      'primary', 'dual_reasoning', 'creative_synthesis', 'heavy_analysis', 'full_orchestra'
    ];
    const currentIndex = hierarchy.indexOf(type);
    return currentIndex > 0 ? hierarchy[currentIndex - 1] : type;
  }

  private upgradeOrchestration(type: OrchestrationType): OrchestrationType {
    const hierarchy: OrchestrationType[] = [
      'primary', 'dual_reasoning', 'creative_synthesis', 'heavy_analysis', 'full_orchestra'
    ];
    const currentIndex = hierarchy.indexOf(type);
    return currentIndex < hierarchy.length - 1 ? hierarchy[currentIndex + 1] : type;
  }

  private estimatePerformance(type: OrchestrationType, complexity: number): any {
    // Base estimates (will be refined by actual performance data)
    const baseEstimates = {
      primary: { time: 2000, confidence: 0.7, resources: 0.2 },
      dual_reasoning: { time: 4000, confidence: 0.8, resources: 0.4 },
      creative_synthesis: { time: 6000, confidence: 0.85, resources: 0.6 },
      heavy_analysis: { time: 12000, confidence: 0.9, resources: 0.8 },
      full_orchestra: { time: 15000, confidence: 0.95, resources: 1.0 }
    };

    const base = baseEstimates[type] || baseEstimates.primary;

    return {
      estimatedTime: base.time * (1 + complexity * 0.5),
      confidence: base.confidence * (1 + complexity * 0.1),
      resourceUsage: base.resources
    };
  }

  private updateOptimizationThresholds(): void {
    // Auto-tune thresholds based on performance history
    // Implementation would analyze trends and adjust complexity scoring
  }

  private groupMetricsByType(): Record<string, PerformanceMetrics[]> {
    // Group performance metrics by orchestration type
    return this.performanceHistory.reduce((groups, metric) => {
      // This would need orchestration type to be stored in metrics
      // Simplified implementation
      return groups;
    }, {} as Record<string, PerformanceMetrics[]>);
  }

  private calculateRecommendationAccuracy(): number {
    // Calculate how often our recommendations led to good performance
    // Based on confidence vs response time trade-offs
    return 0.85; // Placeholder
  }

  private calculateResourceEfficiency(): number {
    // Calculate resource usage efficiency
    return 0.78; // Placeholder
  }
}

export const orchestrationOptimizer = new OrchestrationOptimizer();