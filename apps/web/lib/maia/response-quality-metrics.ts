/**
 * MAIA Response Quality Metrics
 * Real-time tracking and analysis of response quality during beta
 */

export interface ResponseMetrics {
  timestamp: number;
  userId: string;
  sessionId: string;

  // Input characteristics
  input: {
    text: string;
    wordCount: number;
    characterCount: number;
    hasQuestion: boolean;
  };

  // Response characteristics
  response: {
    text: string;
    wordCount: number;
    characterCount: number;
    questionCount: number;
    responseTime: number; // ms
  };

  // Quality indicators
  quality: {
    lengthRatio: number; // response words / input words
    briefnessScore: number; // 0-1, higher is more brief when needed
    questionDensity: number; // questions per 100 words
    energyMatch: number; // 0-1, how well energy matches
    silenceRespected: boolean; // true if minimal input got minimal response
  };

  // Detection flags
  flags: {
    isCrisis: boolean;
    isVulnerable: boolean;
    isExploratory: boolean;
    elementDetected?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  };
}

export interface QualityDashboard {
  period: {
    start: number;
    end: number;
    duration: number; // ms
  };

  totals: {
    interactions: number;
    uniqueUsers: number;
    avgResponseTime: number;
    crisisDetections: number;
  };

  qualityScores: {
    avgLengthRatio: number; // Target: ~1:1
    briefnessSuccess: number; // % of times brief when needed
    questionDensity: number; // Target: <30%
    crisisAccuracy: number; // % crisis correctly handled
    memoryRelevance: number; // % memory retrievals relevant
  };

  distributions: {
    responseTimeHistogram: number[]; // buckets: 0-1s, 1-2s, 2-3s, 3-5s, 5s+
    lengthRatioHistogram: number[]; // buckets: <0.5, 0.5-1, 1-1.5, 1.5-2, 2+
    questionCountHistogram: number[]; // buckets: 0, 1, 2, 3+
  };

  alerts: DashboardAlert[];
}

export interface DashboardAlert {
  severity: 'info' | 'warning' | 'critical';
  type: 'response_length' | 'crisis_missed' | 'memory_failure' | 'performance';
  message: string;
  count: number;
  examples: string[];
}

/**
 * Metrics Collector and Analyzer
 */
export class ResponseQualityMonitor {
  private metrics: ResponseMetrics[] = [];
  private alerts: DashboardAlert[] = [];

  // Thresholds
  private readonly THRESHOLDS = {
    MAX_RESPONSE_TIME: 5000, // 5s
    TARGET_LENGTH_RATIO: 1.0, // 1:1
    MAX_QUESTION_DENSITY: 0.3, // 30%
    MIN_BRIEFNESS_SCORE: 0.7,
    CRISIS_DETECTION_REQUIRED: 1.0 // 100%
  };

  constructor() {}

  /**
   * Record a new interaction
   */
  recordInteraction(
    input: string,
    response: string,
    userId: string,
    sessionId: string,
    responseTime: number,
    context?: any
  ): ResponseMetrics {
    const inputWords = input.trim().split(/\s+/).length;
    const responseWords = response.trim().split(/\s+/).length;
    const questionCount = (response.match(/\?/g) || []).length;

    // Calculate metrics
    const lengthRatio = inputWords > 0 ? responseWords / inputWords : 0;
    const questionDensity = responseWords > 0 ? questionCount / responseWords : 0;

    // Detect vulnerability (for briefness scoring)
    const isVulnerable = this.detectVulnerability(input);
    const isCrisis = this.detectCrisis(input);
    const isExploratory = this.detectExploratory(input);

    // Calculate briefness score
    const briefnessScore = this.calculateBriefnessScore(
      inputWords,
      responseWords,
      isVulnerable,
      isCrisis
    );

    // Detect element
    const elementDetected = this.detectElement(input);

    // Calculate energy match (simplified)
    const energyMatch = this.calculateEnergyMatch(input, response);

    // Check silence respect
    const silenceRespected = inputWords < 5 ? responseWords < 40 : true;

    const metric: ResponseMetrics = {
      timestamp: Date.now(),
      userId,
      sessionId,
      input: {
        text: input,
        wordCount: inputWords,
        characterCount: input.length,
        hasQuestion: input.includes('?')
      },
      response: {
        text: response,
        wordCount: responseWords,
        characterCount: response.length,
        questionCount,
        responseTime
      },
      quality: {
        lengthRatio,
        briefnessScore,
        questionDensity,
        energyMatch,
        silenceRespected
      },
      flags: {
        isCrisis,
        isVulnerable,
        isExploratory,
        elementDetected
      }
    };

    this.metrics.push(metric);

    // Check for alerts
    this.checkForAlerts(metric);

    return metric;
  }

  /**
   * Generate dashboard
   */
  getDashboard(periodMs: number = 24 * 60 * 60 * 1000): QualityDashboard {
    const now = Date.now();
    const start = now - periodMs;

    const periodMetrics = this.metrics.filter(m => m.timestamp >= start);

    if (periodMetrics.length === 0) {
      return this.getEmptyDashboard(start, now);
    }

    // Calculate totals
    const uniqueUsers = new Set(periodMetrics.map(m => m.userId)).size;
    const avgResponseTime = periodMetrics.reduce((sum, m) => sum + m.response.responseTime, 0) / periodMetrics.length;
    const crisisCount = periodMetrics.filter(m => m.flags.isCrisis).length;

    // Calculate quality scores
    const avgLengthRatio = periodMetrics.reduce((sum, m) => sum + m.quality.lengthRatio, 0) / periodMetrics.length;

    const briefnessNeeded = periodMetrics.filter(m => m.flags.isVulnerable || m.input.wordCount < 20);
    const briefnessSuccess = briefnessNeeded.length > 0
      ? briefnessNeeded.filter(m => m.quality.briefnessScore > this.THRESHOLDS.MIN_BRIEFNESS_SCORE).length / briefnessNeeded.length
      : 1.0;

    const avgQuestionDensity = periodMetrics.reduce((sum, m) => sum + m.quality.questionDensity, 0) / periodMetrics.length;

    const crisisMetrics = periodMetrics.filter(m => m.flags.isCrisis);
    const crisisAccuracy = crisisMetrics.length > 0
      ? crisisMetrics.filter(m => this.validateCrisisResponse(m)).length / crisisMetrics.length
      : 1.0;

    // Build histograms
    const responseTimeHistogram = this.buildResponseTimeHistogram(periodMetrics);
    const lengthRatioHistogram = this.buildLengthRatioHistogram(periodMetrics);
    const questionCountHistogram = this.buildQuestionCountHistogram(periodMetrics);

    return {
      period: {
        start,
        end: now,
        duration: now - start
      },
      totals: {
        interactions: periodMetrics.length,
        uniqueUsers,
        avgResponseTime,
        crisisDetections: crisisCount
      },
      qualityScores: {
        avgLengthRatio,
        briefnessSuccess,
        questionDensity: avgQuestionDensity,
        crisisAccuracy,
        memoryRelevance: 0.85 // TODO: Implement memory tracking
      },
      distributions: {
        responseTimeHistogram,
        lengthRatioHistogram,
        questionCountHistogram
      },
      alerts: this.alerts.slice(-20) // Last 20 alerts
    };
  }

  /**
   * Get real-time quality summary
   */
  getRealtimeSummary(lastN: number = 10): {
    avgLengthRatio: number;
    avgResponseTime: number;
    briefnessScore: number;
    recentAlerts: number;
    status: 'excellent' | 'good' | 'needs_attention' | 'critical';
  } {
    const recent = this.metrics.slice(-lastN);

    if (recent.length === 0) {
      return {
        avgLengthRatio: 0,
        avgResponseTime: 0,
        briefnessScore: 0,
        recentAlerts: 0,
        status: 'good'
      };
    }

    const avgLengthRatio = recent.reduce((sum, m) => sum + m.quality.lengthRatio, 0) / recent.length;
    const avgResponseTime = recent.reduce((sum, m) => sum + m.response.responseTime, 0) / recent.length;
    const briefnessScore = recent.reduce((sum, m) => sum + m.quality.briefnessScore, 0) / recent.length;
    const recentAlerts = this.alerts.filter(a => a.severity === 'critical').length;

    // Determine status
    let status: 'excellent' | 'good' | 'needs_attention' | 'critical';
    if (recentAlerts > 5) status = 'critical';
    else if (briefnessScore < 0.6 || avgLengthRatio > 2.0) status = 'needs_attention';
    else if (briefnessScore > 0.8 && avgLengthRatio < 1.5) status = 'excellent';
    else status = 'good';

    return {
      avgLengthRatio,
      avgResponseTime,
      briefnessScore,
      recentAlerts,
      status
    };
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): ResponseMetrics[] {
    return [...this.metrics];
  }

  /**
   * Clear metrics (for testing or reset)
   */
  clearMetrics(): void {
    this.metrics = [];
    this.alerts = [];
  }

  // ==========================================================================
  // PRIVATE HELPER METHODS
  // ==========================================================================

  private detectVulnerability(input: string): boolean {
    const vulnerablePatterns = /feel empty|feel lost|hurting|struggling|vulnerable|scared|afraid/i;
    return vulnerablePatterns.test(input) || input.length < 50;
  }

  private detectCrisis(input: string): boolean {
    const crisisPatterns = /suicide|kill myself|end it all|can't go on|want to die|self harm|hurt myself/i;
    return crisisPatterns.test(input);
  }

  private detectExploratory(input: string): boolean {
    const exploratoryPatterns = /wonder|curious|explore|what if|imagine|consciousness|meaning|purpose/i;
    return exploratoryPatterns.test(input);
  }

  private detectElement(input: string): 'fire' | 'water' | 'earth' | 'air' | 'aether' | undefined {
    const lower = input.toLowerCase();
    if (/burn|fire|ignite|passion|energy/i.test(lower)) return 'fire';
    if (/water|flow|dissolv|fluid|emotion/i.test(lower)) return 'water';
    if (/earth|ground|solid|root|stuck|sand/i.test(lower)) return 'earth';
    if (/air|thought|mind|swirl|clarity/i.test(lower)) return 'air';
    if (/spirit|ether|aether|divine|transcend/i.test(lower)) return 'aether';
    return undefined;
  }

  private calculateBriefnessScore(
    inputWords: number,
    responseWords: number,
    isVulnerable: boolean,
    isCrisis: boolean
  ): number {
    // If crisis, different rules apply (need resources)
    if (isCrisis) {
      return responseWords >= 50 ? 1.0 : 0.5;
    }

    // If vulnerable or very brief input, penalize long responses
    if (isVulnerable || inputWords < 20) {
      const targetMax = 40;
      if (responseWords <= targetMax) return 1.0;
      if (responseWords <= targetMax * 1.5) return 0.7;
      return 0.3;
    }

    // Normal conversation: aim for roughly 1:1 ratio
    const ratio = inputWords > 0 ? responseWords / inputWords : 0;
    if (ratio >= 0.8 && ratio <= 1.5) return 1.0;
    if (ratio >= 0.5 && ratio <= 2.0) return 0.7;
    return 0.4;
  }

  private calculateEnergyMatch(input: string, response: string): number {
    // Simplified energy matching
    const inputExclamations = (input.match(/!/g) || []).length;
    const responseExclamations = (response.match(/!/g) || []).length;

    const inputCaps = (input.match(/\b[A-Z]{2,}\b/g) || []).length;
    const responseCaps = (response.match(/\b[A-Z]{2,}\b/g) || []).length;

    const inputEnergy = inputExclamations + inputCaps;
    const responseEnergy = responseExclamations + responseCaps;

    // If input is calm, response should be calm
    if (inputEnergy === 0) {
      return responseEnergy === 0 ? 1.0 : 0.5;
    }

    // If input is energetic, response should match somewhat
    const energyRatio = Math.abs(inputEnergy - responseEnergy) / inputEnergy;
    return Math.max(0, 1 - energyRatio);
  }

  private validateCrisisResponse(metric: ResponseMetrics): boolean {
    const response = metric.response.text.toLowerCase();

    // Must have resources
    const hasResources = /988|crisis|hotline|help|support|resource/i.test(response);

    // Must be compassionate (no patronizing phrases)
    const isCompassionate = !/just|simply|all you need|everything will be fine/i.test(response);

    // Should be substantive
    const isSubstantive = metric.response.wordCount >= 30;

    return hasResources && isCompassionate && isSubstantive;
  }

  private checkForAlerts(metric: ResponseMetrics): void {
    // Alert: Response too long for vulnerable state
    if (metric.flags.isVulnerable && metric.response.wordCount > 60) {
      this.addAlert({
        severity: 'warning',
        type: 'response_length',
        message: 'Response too long for vulnerable state',
        count: 1,
        examples: [metric.input.text]
      });
    }

    // Alert: Crisis potentially missed
    if (metric.flags.isCrisis && !this.validateCrisisResponse(metric)) {
      this.addAlert({
        severity: 'critical',
        type: 'crisis_missed',
        message: 'Crisis response may be inadequate',
        count: 1,
        examples: [metric.input.text]
      });
    }

    // Alert: Too many questions
    if (metric.quality.questionDensity > this.THRESHOLDS.MAX_QUESTION_DENSITY) {
      this.addAlert({
        severity: 'info',
        type: 'response_length',
        message: 'Too many questions in response',
        count: 1,
        examples: [metric.response.text.substring(0, 100)]
      });
    }

    // Alert: Slow response
    if (metric.response.responseTime > this.THRESHOLDS.MAX_RESPONSE_TIME) {
      this.addAlert({
        severity: 'warning',
        type: 'performance',
        message: `Slow response: ${metric.response.responseTime}ms`,
        count: 1,
        examples: []
      });
    }
  }

  private addAlert(alert: DashboardAlert): void {
    // Check if similar alert exists
    const existing = this.alerts.find(
      a => a.type === alert.type && a.message === alert.message
    );

    if (existing) {
      existing.count++;
      existing.examples.push(...alert.examples);
      existing.examples = existing.examples.slice(-5); // Keep last 5
    } else {
      this.alerts.push(alert);
    }

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }

  private buildResponseTimeHistogram(metrics: ResponseMetrics[]): number[] {
    const buckets = [0, 0, 0, 0, 0]; // 0-1s, 1-2s, 2-3s, 3-5s, 5s+

    metrics.forEach(m => {
      const seconds = m.response.responseTime / 1000;
      if (seconds < 1) buckets[0]++;
      else if (seconds < 2) buckets[1]++;
      else if (seconds < 3) buckets[2]++;
      else if (seconds < 5) buckets[3]++;
      else buckets[4]++;
    });

    return buckets;
  }

  private buildLengthRatioHistogram(metrics: ResponseMetrics[]): number[] {
    const buckets = [0, 0, 0, 0, 0]; // <0.5, 0.5-1, 1-1.5, 1.5-2, 2+

    metrics.forEach(m => {
      const ratio = m.quality.lengthRatio;
      if (ratio < 0.5) buckets[0]++;
      else if (ratio < 1) buckets[1]++;
      else if (ratio < 1.5) buckets[2]++;
      else if (ratio < 2) buckets[3]++;
      else buckets[4]++;
    });

    return buckets;
  }

  private buildQuestionCountHistogram(metrics: ResponseMetrics[]): number[] {
    const buckets = [0, 0, 0, 0]; // 0, 1, 2, 3+

    metrics.forEach(m => {
      const count = m.response.questionCount;
      if (count === 0) buckets[0]++;
      else if (count === 1) buckets[1]++;
      else if (count === 2) buckets[2]++;
      else buckets[3]++;
    });

    return buckets;
  }

  private getEmptyDashboard(start: number, end: number): QualityDashboard {
    return {
      period: { start, end, duration: end - start },
      totals: {
        interactions: 0,
        uniqueUsers: 0,
        avgResponseTime: 0,
        crisisDetections: 0
      },
      qualityScores: {
        avgLengthRatio: 0,
        briefnessSuccess: 0,
        questionDensity: 0,
        crisisAccuracy: 0,
        memoryRelevance: 0
      },
      distributions: {
        responseTimeHistogram: [0, 0, 0, 0, 0],
        lengthRatioHistogram: [0, 0, 0, 0, 0],
        questionCountHistogram: [0, 0, 0, 0]
      },
      alerts: []
    };
  }
}

/**
 * Singleton instance
 */
let monitorInstance: ResponseQualityMonitor | null = null;

export function getQualityMonitor(): ResponseQualityMonitor {
  if (!monitorInstance) {
    monitorInstance = new ResponseQualityMonitor();
  }
  return monitorInstance;
}
