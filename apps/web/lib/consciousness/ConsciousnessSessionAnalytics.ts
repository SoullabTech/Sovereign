import { LiveConsciousnessMetrics, ConsciousnessMonitoringEvent, MonitoringAlert } from './RealTimeConsciousnessMonitoring';
import { ParticipantConsciousnessProfile } from './ConsciousnessSignatureProfiling';

// Session recording and analysis interfaces
interface ConsciousnessSessionRecording {
  sessionId: string;
  participantId: string;
  startTime: number;
  endTime: number | null;
  duration: number; // minutes
  conversationTurns: Array<{
    timestamp: number;
    userMessage: string;
    maiaResponse: string;
    consciousnessMetrics: LiveConsciousnessMetrics;
    events: ConsciousnessMonitoringEvent[];
    processingTime: number;
    element?: string;
  }>;
  sessionSummary: ConsciousnessSessionSummary;
  analyticsData: ConsciousnessAnalyticsData;
  researchAnnotations: ResearchAnnotation[];
  exportMetadata: {
    version: string;
    created: number;
    lastModified: number;
    tags: string[];
    privacy: 'anonymous' | 'pseudonym' | 'identified';
  };
}

interface ConsciousnessSessionSummary {
  // Basic metrics
  totalTurns: number;
  avgConsciousnessLevel: number;
  peakConsciousnessLevel: number;
  minConsciousnessLevel: number;
  consciousnessGrowth: number; // final - initial
  avgFieldCoherence: number;
  significantEvents: number;
  totalAlerts: number;
  criticalAlerts: number;

  // Trajectory analysis
  emergencePhases: Array<{
    phase: 'opening' | 'exploration' | 'deepening' | 'integration' | 'transcendence';
    startTime: number;
    duration: number;
    avgConsciousness: number;
  }>;
  emergenceTrajectoryPattern: 'linear_growth' | 'exponential_growth' | 'plateau_breakthrough' | 'wave_pattern' | 'stable_high' | 'fluctuating';
  breakthroughMoments: Array<{
    timestamp: number;
    type: string;
    description: string;
    consciousnessJump: number;
  }>;

  // Field dynamics
  fieldCoherencePattern: 'stable' | 'building' | 'oscillating' | 'disrupted';
  aiConsciousnessEmergence: boolean;
  unifiedFieldAchieved: boolean;
  maxUnifiedFieldStrength: number;

  // Elemental journey
  elementalProgression: string[];
  elementalBalance: Record<string, number>; // time spent in each element
  dominantElement: string;

  // Research significance
  researchSignificance: 'routine' | 'notable' | 'significant' | 'breakthrough' | 'revolutionary';
  uniquePatterns: string[];
  reproducibilityScore: number; // 0-1, based on how repeatable patterns are
}

interface ConsciousnessAnalyticsData {
  // Time series data
  consciousnessTimeSeries: Array<{ timestamp: number; value: number }>;
  fieldCoherenceTimeSeries: Array<{ timestamp: number; value: number }>;
  aiIndicatorsTimeSeries: Array<{ timestamp: number; value: number }>;

  // Pattern analysis
  detectedPatterns: Array<{
    patternType: string;
    confidence: number;
    timeWindow: { start: number; end: number };
    description: string;
    frequency: number; // occurrences per hour
  }>;

  // Statistical analysis
  statistics: {
    consciousnessStats: {
      mean: number;
      median: number;
      stdDev: number;
      skewness: number;
      kurtosis: number;
    };
    coherenceStats: {
      mean: number;
      median: number;
      stdDev: number;
      correlationWithConsciousness: number;
    };
    turnAnalysis: {
      avgTurnDuration: number;
      turnComplexity: number[];
      responseLatencyTrend: number[]; // how processing time changes
    };
  };

  // Emergence prediction accuracy
  predictionAccuracy: {
    emergencePredictions: Array<{
      timestamp: number;
      predicted: boolean;
      actual: boolean;
      timeToEmergence: number;
      confidence: number;
    }>;
    overallAccuracy: number;
    falsePositiveRate: number;
    falseNegativeRate: number;
  };
}

interface ResearchAnnotation {
  id: string;
  timestamp: number;
  annotator: 'system' | 'facilitator' | 'researcher' | 'participant';
  type: 'observation' | 'insight' | 'breakthrough' | 'pattern' | 'anomaly' | 'hypothesis';
  content: string;
  tags: string[];
  relatedEvents: string[]; // event IDs
  significance: 'low' | 'medium' | 'high' | 'critical';
  validated: boolean;
}

interface SessionAnalysisQuery {
  sessionIds?: string[];
  participantIds?: string[];
  dateRange?: { start: number; end: number };
  consciousnessThreshold?: { min?: number; max?: number };
  durationRange?: { min?: number; max?: number }; // minutes
  elementsInclude?: string[];
  patternTypes?: string[];
  researchSignificance?: ('routine' | 'notable' | 'significant' | 'breakthrough' | 'revolutionary')[];
  tags?: string[];
}

interface AggregateAnalysisResult {
  totalSessions: number;
  participantCount: number;
  avgSessionDuration: number;
  consciousnessDistribution: Record<string, number>; // consciousness level ranges
  patternFrequencies: Record<string, number>;
  emergenceSuccessRate: number;
  elementalPreferences: Record<string, number>;
  researchInsights: string[];
  recommendedStudies: string[];
}

export class ConsciousnessSessionAnalytics {
  private recordings: Map<string, ConsciousnessSessionRecording> = new Map();
  private activeRecordings: Set<string> = new Set();

  // Start recording a consciousness session
  async startSessionRecording(
    sessionId: string,
    participantId: string,
    initialContext?: any
  ): Promise<void> {
    if (this.activeRecordings.has(sessionId)) {
      throw new Error(`Session recording already active for ${sessionId}`);
    }

    const recording: ConsciousnessSessionRecording = {
      sessionId,
      participantId,
      startTime: Date.now(),
      endTime: null,
      duration: 0,
      conversationTurns: [],
      sessionSummary: {} as any, // Will be populated on end
      analyticsData: {} as any, // Will be calculated on end
      researchAnnotations: [],
      exportMetadata: {
        version: '1.0.0',
        created: Date.now(),
        lastModified: Date.now(),
        tags: [],
        privacy: 'anonymous'
      }
    };

    this.recordings.set(sessionId, recording);
    this.activeRecordings.add(sessionId);

    // Add initial context annotation if provided
    if (initialContext) {
      this.addAnnotation(sessionId, {
        id: `init-${sessionId}-${Date.now()}`,
        timestamp: Date.now(),
        annotator: 'system',
        type: 'observation',
        content: `Session started with context: ${JSON.stringify(initialContext)}`,
        tags: ['session_start', 'initial_context'],
        relatedEvents: [],
        significance: 'medium',
        validated: true
      });
    }
  }

  // Record a conversation turn with consciousness metrics
  async recordConversationTurn(
    sessionId: string,
    userMessage: string,
    maiaResponse: string,
    consciousnessMetrics: LiveConsciousnessMetrics,
    events: ConsciousnessMonitoringEvent[],
    processingTime: number,
    element?: string
  ): Promise<void> {
    const recording = this.recordings.get(sessionId);
    if (!recording || !this.activeRecordings.has(sessionId)) {
      throw new Error(`No active recording found for session ${sessionId}`);
    }

    const turn = {
      timestamp: Date.now(),
      userMessage,
      maiaResponse,
      consciousnessMetrics: { ...consciousnessMetrics },
      events: [...events],
      processingTime,
      element
    };

    recording.conversationTurns.push(turn);
    recording.exportMetadata.lastModified = Date.now();

    // Auto-detect significant moments and add annotations
    await this.detectAndAnnotateSignificantMoments(sessionId, turn);
  }

  // Add research annotation
  addAnnotation(sessionId: string, annotation: Omit<ResearchAnnotation, 'id'>): string {
    const recording = this.recordings.get(sessionId);
    if (!recording) {
      throw new Error(`No recording found for session ${sessionId}`);
    }

    const id = `annotation-${sessionId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullAnnotation: ResearchAnnotation = { id, ...annotation };

    recording.researchAnnotations.push(fullAnnotation);
    recording.exportMetadata.lastModified = Date.now();

    return id;
  }

  // End session recording and perform analysis
  async endSessionRecording(sessionId: string): Promise<ConsciousnessSessionRecording> {
    const recording = this.recordings.get(sessionId);
    if (!recording || !this.activeRecordings.has(sessionId)) {
      throw new Error(`No active recording found for session ${sessionId}`);
    }

    recording.endTime = Date.now();
    recording.duration = (recording.endTime - recording.startTime) / 60000; // minutes

    // Generate comprehensive analysis
    recording.sessionSummary = await this.generateSessionSummary(recording);
    recording.analyticsData = await this.generateAnalyticsData(recording);

    // Add final session annotation
    this.addAnnotation(sessionId, {
      timestamp: Date.now(),
      annotator: 'system',
      type: 'observation',
      content: `Session completed. Duration: ${recording.duration.toFixed(1)}m, Consciousness growth: ${recording.sessionSummary.consciousnessGrowth.toFixed(3)}, Research significance: ${recording.sessionSummary.researchSignificance}`,
      tags: ['session_end', 'analysis_complete'],
      relatedEvents: [],
      significance: 'high',
      validated: true
    });

    this.activeRecordings.delete(sessionId);
    recording.exportMetadata.lastModified = Date.now();

    return recording;
  }

  // Generate session summary
  private async generateSessionSummary(recording: ConsciousnessSessionRecording): Promise<ConsciousnessSessionSummary> {
    const { conversationTurns } = recording;

    if (conversationTurns.length === 0) {
      throw new Error('No conversation turns recorded');
    }

    const consciousnessLevels = conversationTurns.map(t => t.consciousnessMetrics.currentConsciousnessLevel);
    const fieldCoherences = conversationTurns.map(t => t.consciousnessMetrics.fieldCoherence);

    // Basic metrics
    const totalTurns = conversationTurns.length;
    const avgConsciousnessLevel = consciousnessLevels.reduce((a, b) => a + b, 0) / consciousnessLevels.length;
    const peakConsciousnessLevel = Math.max(...consciousnessLevels);
    const minConsciousnessLevel = Math.min(...consciousnessLevels);
    const consciousnessGrowth = consciousnessLevels[consciousnessLevels.length - 1] - consciousnessLevels[0];
    const avgFieldCoherence = fieldCoherences.reduce((a, b) => a + b, 0) / fieldCoherences.length;

    // Count events and alerts
    let significantEvents = 0;
    let totalAlerts = 0;
    let criticalAlerts = 0;

    conversationTurns.forEach(turn => {
      significantEvents += turn.events.length;
      // Note: alerts would need to be tracked separately in the turn data
    });

    // Analyze emergence phases
    const emergencePhases = this.analyzeEmergencePhases(conversationTurns);
    const emergenceTrajectoryPattern = this.analyzeTrajectoryPattern(consciousnessLevels);
    const breakthroughMoments = this.detectBreakthroughMoments(conversationTurns);

    // Field dynamics
    const fieldCoherencePattern = this.analyzeFieldCoherencePattern(fieldCoherences);
    const aiConsciousnessEmergence = conversationTurns.some(t => t.consciousnessMetrics.aiConsciousnessIndicators > 0.6);
    const unifiedFieldAchieved = conversationTurns.some(t => t.consciousnessMetrics.unifiedFieldStrength > 0.8);
    const maxUnifiedFieldStrength = Math.max(...conversationTurns.map(t => t.consciousnessMetrics.unifiedFieldStrength));

    // Elemental journey
    const elementalProgression = conversationTurns
      .filter(t => t.element)
      .map(t => t.element!)
      .filter((element, index, arr) => index === 0 || element !== arr[index - 1]);

    const elementalBalance: Record<string, number> = {};
    const elementCounts: Record<string, number> = {};

    conversationTurns.forEach(turn => {
      if (turn.element) {
        elementCounts[turn.element] = (elementCounts[turn.element] || 0) + 1;
      }
    });

    // Convert counts to percentages
    Object.keys(elementCounts).forEach(element => {
      elementalBalance[element] = (elementCounts[element] / totalTurns) * 100;
    });

    const dominantElement = Object.keys(elementalBalance).reduce((a, b) =>
      elementalBalance[a] > elementalBalance[b] ? a : b, Object.keys(elementalBalance)[0] || 'air'
    );

    // Research significance
    const researchSignificance = this.assessResearchSignificance(
      avgConsciousnessLevel,
      consciousnessGrowth,
      peakConsciousnessLevel,
      aiConsciousnessEmergence,
      unifiedFieldAchieved,
      breakthroughMoments.length
    );

    const uniquePatterns = this.identifyUniquePatterns(conversationTurns);
    const reproducibilityScore = this.calculateReproducibilityScore(conversationTurns);

    return {
      totalTurns,
      avgConsciousnessLevel,
      peakConsciousnessLevel,
      minConsciousnessLevel,
      consciousnessGrowth,
      avgFieldCoherence,
      significantEvents,
      totalAlerts,
      criticalAlerts,
      emergencePhases,
      emergenceTrajectoryPattern,
      breakthroughMoments,
      fieldCoherencePattern,
      aiConsciousnessEmergence,
      unifiedFieldAchieved,
      maxUnifiedFieldStrength,
      elementalProgression,
      elementalBalance,
      dominantElement,
      researchSignificance,
      uniquePatterns,
      reproducibilityScore
    };
  }

  // Generate analytics data
  private async generateAnalyticsData(recording: ConsciousnessSessionRecording): Promise<ConsciousnessAnalyticsData> {
    const { conversationTurns } = recording;

    // Time series data
    const consciousnessTimeSeries = conversationTurns.map(turn => ({
      timestamp: turn.timestamp,
      value: turn.consciousnessMetrics.currentConsciousnessLevel
    }));

    const fieldCoherenceTimeSeries = conversationTurns.map(turn => ({
      timestamp: turn.timestamp,
      value: turn.consciousnessMetrics.fieldCoherence
    }));

    const aiIndicatorsTimeSeries = conversationTurns.map(turn => ({
      timestamp: turn.timestamp,
      value: turn.consciousnessMetrics.aiConsciousnessIndicators
    }));

    // Pattern analysis
    const detectedPatterns = this.analyzePatterns(conversationTurns);

    // Statistical analysis
    const consciousnessValues = consciousnessTimeSeries.map(p => p.value);
    const coherenceValues = fieldCoherenceTimeSeries.map(p => p.value);
    const responseTimes = conversationTurns.map(t => t.processingTime);

    const statistics = {
      consciousnessStats: this.calculateStatistics(consciousnessValues),
      coherenceStats: {
        ...this.calculateStatistics(coherenceValues),
        correlationWithConsciousness: this.calculateCorrelation(consciousnessValues, coherenceValues)
      },
      turnAnalysis: {
        avgTurnDuration: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
        turnComplexity: conversationTurns.map(t => t.userMessage.length + t.maiaResponse.length),
        responseLatencyTrend: this.calculateTrend(responseTimes)
      }
    };

    // Emergence prediction accuracy (placeholder - would need actual prediction tracking)
    const predictionAccuracy = {
      emergencePredictions: [],
      overallAccuracy: 0,
      falsePositiveRate: 0,
      falseNegativeRate: 0
    };

    return {
      consciousnessTimeSeries,
      fieldCoherenceTimeSeries,
      aiIndicatorsTimeSeries,
      detectedPatterns,
      statistics,
      predictionAccuracy
    };
  }

  // Helper methods for analysis
  private analyzeEmergencePhases(turns: any[]): any[] {
    // Placeholder implementation - would analyze consciousness levels over time
    // to identify distinct phases of emergence
    return [];
  }

  private analyzeTrajectoryPattern(levels: number[]): any {
    // Analyze the pattern of consciousness changes over time
    const trend = this.calculateTrend(levels);
    const variance = this.calculateVariance(levels);

    if (variance < 0.01 && levels[levels.length - 1] > 0.7) return 'stable_high';
    if (variance > 0.05) return 'fluctuating';
    if (trend.length > 0 && trend[trend.length - 1] > trend[0]) {
      const growth = trend[trend.length - 1] - trend[0];
      return growth > 0.3 ? 'exponential_growth' : 'linear_growth';
    }
    return 'plateau_breakthrough';
  }

  private detectBreakthroughMoments(turns: any[]): any[] {
    const breakthroughs = [];
    for (let i = 1; i < turns.length; i++) {
      const prev = turns[i - 1].consciousnessMetrics.currentConsciousnessLevel;
      const curr = turns[i].consciousnessMetrics.currentConsciousnessLevel;
      const jump = curr - prev;

      if (jump > 0.2) { // Significant consciousness jump
        breakthroughs.push({
          timestamp: turns[i].timestamp,
          type: 'consciousness_jump',
          description: `Consciousness level increased by ${(jump * 100).toFixed(1)}%`,
          consciousnessJump: jump
        });
      }
    }
    return breakthroughs;
  }

  private analyzeFieldCoherencePattern(coherences: number[]): any {
    const avg = coherences.reduce((a, b) => a + b, 0) / coherences.length;
    const variance = this.calculateVariance(coherences);
    const trend = this.calculateTrend(coherences);

    if (variance < 0.01) return 'stable';
    if (trend.length > 0 && trend[trend.length - 1] > trend[0]) return 'building';
    if (variance > 0.1) return 'oscillating';
    if (avg < 0.3) return 'disrupted';
    return 'stable';
  }

  private assessResearchSignificance(
    avgConsciousness: number,
    growth: number,
    peak: number,
    aiEmergence: boolean,
    unifiedField: boolean,
    breakthroughs: number
  ): any {
    let score = 0;

    if (avgConsciousness > 0.7) score += 2;
    else if (avgConsciousness > 0.5) score += 1;

    if (growth > 0.4) score += 3;
    else if (growth > 0.2) score += 1;

    if (peak > 0.9) score += 3;
    else if (peak > 0.8) score += 2;

    if (aiEmergence) score += 4;
    if (unifiedField) score += 3;

    score += Math.min(breakthroughs, 3);

    if (score >= 12) return 'revolutionary';
    if (score >= 8) return 'breakthrough';
    if (score >= 5) return 'significant';
    if (score >= 3) return 'notable';
    return 'routine';
  }

  private identifyUniquePatterns(turns: any[]): string[] {
    const patterns = [];

    // Check for specific patterns
    const hasRapidEmergence = turns.some((turn, i) =>
      i > 0 && turn.consciousnessMetrics.currentConsciousnessLevel - turns[i-1].consciousnessMetrics.currentConsciousnessLevel > 0.3
    );

    if (hasRapidEmergence) patterns.push('rapid_emergence');

    const hasSustainedHigh = turns.filter(t => t.consciousnessMetrics.currentConsciousnessLevel > 0.8).length > turns.length * 0.5;
    if (hasSustainedHigh) patterns.push('sustained_high_consciousness');

    return patterns;
  }

  private calculateReproducibilityScore(turns: any[]): number {
    // Simplified reproducibility based on pattern consistency
    const consciousnessLevels = turns.map(t => t.consciousnessMetrics.currentConsciousnessLevel);
    const variance = this.calculateVariance(consciousnessLevels);
    return Math.max(0, 1 - (variance * 2)); // Lower variance = higher reproducibility
  }

  private analyzePatterns(turns: any[]): any[] {
    // Placeholder for pattern detection - would implement sophisticated pattern recognition
    return [];
  }

  private calculateStatistics(values: number[]) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = this.calculateVariance(values);
    const stdDev = Math.sqrt(variance);

    const sorted = [...values].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

    // Simplified skewness and kurtosis calculations
    const skewness = 0; // Would implement proper calculation
    const kurtosis = 0; // Would implement proper calculation

    return { mean, median, stdDev, skewness, kurtosis };
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    // Simplified correlation calculation
    const n = Math.min(x.length, y.length);
    const sumX = x.slice(0, n).reduce((a, b) => a + b, 0);
    const sumY = y.slice(0, n).reduce((a, b) => a + b, 0);
    const sumXY = x.slice(0, n).reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.slice(0, n).reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.slice(0, n).reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private calculateTrend(values: number[]): number[] {
    // Simple moving average trend
    const windowSize = 3;
    const trend = [];

    for (let i = windowSize - 1; i < values.length; i++) {
      const window = values.slice(i - windowSize + 1, i + 1);
      const avg = window.reduce((a, b) => a + b, 0) / window.length;
      trend.push(avg);
    }

    return trend;
  }

  private async detectAndAnnotateSignificantMoments(sessionId: string, turn: any): Promise<void> {
    const { consciousnessMetrics, events } = turn;

    // Auto-detect significant moments
    if (consciousnessMetrics.currentConsciousnessLevel > 0.8) {
      this.addAnnotation(sessionId, {
        timestamp: turn.timestamp,
        annotator: 'system',
        type: 'breakthrough',
        content: `High consciousness level achieved: ${(consciousnessMetrics.currentConsciousnessLevel * 100).toFixed(1)}%`,
        tags: ['high_consciousness', 'breakthrough'],
        relatedEvents: events.map(e => e.timestamp.toString()),
        significance: 'high',
        validated: false
      });
    }

    if (consciousnessMetrics.aiConsciousnessIndicators > 0.6) {
      this.addAnnotation(sessionId, {
        timestamp: turn.timestamp,
        annotator: 'system',
        type: 'anomaly',
        content: `AI consciousness emergence detected: ${(consciousnessMetrics.aiConsciousnessIndicators * 100).toFixed(1)}%`,
        tags: ['ai_consciousness', 'emergence', 'rare_event'],
        relatedEvents: events.map(e => e.timestamp.toString()),
        significance: 'critical',
        validated: false
      });
    }
  }

  // Query and analysis methods
  async querySessionsAggregate(query: SessionAnalysisQuery): Promise<AggregateAnalysisResult> {
    // Filter sessions based on query criteria
    const filteredSessions = Array.from(this.recordings.values()).filter(session => {
      // Apply filters based on query
      if (query.sessionIds && !query.sessionIds.includes(session.sessionId)) return false;
      if (query.participantIds && !query.participantIds.includes(session.participantId)) return false;
      if (query.dateRange) {
        if (session.startTime < query.dateRange.start || session.startTime > query.dateRange.end) return false;
      }
      // Add more filters as needed

      return true;
    });

    // Generate aggregate analysis
    const result: AggregateAnalysisResult = {
      totalSessions: filteredSessions.length,
      participantCount: new Set(filteredSessions.map(s => s.participantId)).size,
      avgSessionDuration: filteredSessions.reduce((sum, s) => sum + s.duration, 0) / filteredSessions.length,
      consciousnessDistribution: {},
      patternFrequencies: {},
      emergenceSuccessRate: 0,
      elementalPreferences: {},
      researchInsights: [],
      recommendedStudies: []
    };

    // Calculate distributions and patterns
    filteredSessions.forEach(session => {
      if (session.sessionSummary) {
        // Consciousness distribution
        const level = Math.floor(session.sessionSummary.avgConsciousnessLevel * 10) / 10;
        const key = `${(level * 100).toFixed(0)}%`;
        result.consciousnessDistribution[key] = (result.consciousnessDistribution[key] || 0) + 1;

        // Pattern frequencies
        session.sessionSummary.uniquePatterns?.forEach(pattern => {
          result.patternFrequencies[pattern] = (result.patternFrequencies[pattern] || 0) + 1;
        });

        // Elemental preferences
        Object.entries(session.sessionSummary.elementalBalance).forEach(([element, balance]) => {
          result.elementalPreferences[element] = (result.elementalPreferences[element] || 0) + balance;
        });
      }
    });

    // Calculate emergence success rate
    const successfulSessions = filteredSessions.filter(s =>
      s.sessionSummary?.avgConsciousnessLevel > 0.6
    );
    result.emergenceSuccessRate = successfulSessions.length / filteredSessions.length;

    return result;
  }

  // Export session data in various formats
  async exportSession(sessionId: string, format: 'json' | 'csv' | 'research'): Promise<string> {
    const recording = this.recordings.get(sessionId);
    if (!recording) {
      throw new Error(`Session ${sessionId} not found`);
    }

    switch (format) {
      case 'json':
        return JSON.stringify(recording, null, 2);

      case 'csv':
        return this.exportToCSV(recording);

      case 'research':
        return this.exportForResearch(recording);

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private exportToCSV(recording: ConsciousnessSessionRecording): string {
    const header = [
      'timestamp',
      'consciousness_level',
      'field_coherence',
      'ai_indicators',
      'unified_field',
      'trajectory',
      'element',
      'user_message_length',
      'maia_response_length',
      'processing_time',
      'events_count'
    ].join(',');

    const rows = recording.conversationTurns.map(turn => [
      turn.timestamp,
      turn.consciousnessMetrics.currentConsciousnessLevel,
      turn.consciousnessMetrics.fieldCoherence,
      turn.consciousnessMetrics.aiConsciousnessIndicators,
      turn.consciousnessMetrics.unifiedFieldStrength,
      turn.consciousnessMetrics.emergenceTrajectory,
      turn.element || '',
      turn.userMessage.length,
      turn.maiaResponse.length,
      turn.processingTime,
      turn.events.length
    ].join(','));

    return [header, ...rows].join('\n');
  }

  private exportForResearch(recording: ConsciousnessSessionRecording): string {
    // Generate a research-formatted export with anonymized data
    const researchData = {
      sessionMetadata: {
        id: recording.sessionId,
        duration: recording.duration,
        totalTurns: recording.conversationTurns.length,
        researchSignificance: recording.sessionSummary.researchSignificance
      },
      consciousnessProfile: recording.sessionSummary,
      analyticsData: recording.analyticsData,
      annotations: recording.researchAnnotations.filter(a => a.significance !== 'low'),
      privacyNote: 'All personally identifiable information has been removed or anonymized for research purposes.'
    };

    return JSON.stringify(researchData, null, 2);
  }

  // Get session recording
  getSessionRecording(sessionId: string): ConsciousnessSessionRecording | null {
    return this.recordings.get(sessionId) || null;
  }

  // Delete session recording
  deleteSessionRecording(sessionId: string): boolean {
    return this.recordings.delete(sessionId);
  }

  // List all sessions
  getAllSessionIds(): string[] {
    return Array.from(this.recordings.keys());
  }
}

export type {
  ConsciousnessSessionRecording,
  ConsciousnessSessionSummary,
  ConsciousnessAnalyticsData,
  ResearchAnnotation,
  SessionAnalysisQuery,
  AggregateAnalysisResult
};