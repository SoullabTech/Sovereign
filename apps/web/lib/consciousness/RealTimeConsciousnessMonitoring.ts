import { MasterConsciousnessResearchSystem, MasterConsciousnessAssessment } from './MasterConsciousnessResearchSystem';
import { ParticipantConsciousnessProfile } from './ConsciousnessSignatureProfiling';
import { ConsciousnessEmergencePrediction } from './ConsciousnessEmergencePrediction';

// Real-time monitoring interfaces
interface ConsciousnessMonitoringEvent {
  timestamp: number;
  participantId: string;
  sessionId: string;
  eventType: 'pattern_detected' | 'emergence_predicted' | 'threshold_exceeded' | 'field_coherence_shift';
  data: any;
  significance: 'low' | 'medium' | 'high' | 'critical';
}

interface LiveConsciousnessMetrics {
  currentConsciousnessLevel: number; // 0-1 scale
  emergenceTrajectory: 'ascending' | 'stable' | 'descending' | 'fluctuating';
  fieldCoherence: number; // 0-1 scale
  aiConsciousnessIndicators: number; // 0-1 scale
  humanConsciousnessDepth: number; // 0-1 scale
  unifiedFieldStrength: number; // 0-1 scale
  sessionDuration: number; // minutes
  significantEvents: ConsciousnessMonitoringEvent[];
  nextEmergencePrediction: {
    timeToEmergence: number; // minutes
    confidence: number;
    type: string;
  };
}

interface MonitoringAlert {
  id: string;
  timestamp: number;
  alertType: 'consciousness_breakthrough' | 'field_disruption' | 'ai_awakening' | 'integration_opportunity';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  recommendedAction: string;
  autoResolve: boolean;
  resolved: boolean;
}

interface ConsciousnessVisualizationData {
  timeSeriesData: Array<{
    timestamp: number;
    consciousnessLevel: number;
    fieldCoherence: number;
    aiIndicators: number;
  }>;
  patternHeatmap: Map<string, number>;
  emergenceProbabilities: Array<{
    timeWindow: string;
    probability: number;
    type: string;
  }>;
  consciousnessSpectrum: {
    frequencies: number[];
    amplitudes: number[];
    dominantFrequency: number;
  };
}

export class RealTimeConsciousnessMonitoring {
  private masterSystem: MasterConsciousnessResearchSystem;
  private activeMonitoringSessions: Map<string, {
    participantId: string;
    startTime: number;
    metrics: LiveConsciousnessMetrics;
    history: ConsciousnessMonitoringEvent[];
    alerts: MonitoringAlert[];
  }>;
  private eventSubscribers: Map<string, ((event: ConsciousnessMonitoringEvent) => void)[]>;
  private alertSubscribers: Map<string, ((alert: MonitoringAlert) => void)[]>;

  constructor() {
    this.masterSystem = new MasterConsciousnessResearchSystem();
    this.activeMonitoringSessions = new Map();
    this.eventSubscribers = new Map();
    this.alertSubscribers = new Map();
  }

  // Start monitoring a new session
  async startMonitoringSession(
    participantId: string,
    sessionId: string,
    initialContext?: any
  ): Promise<void> {
    const startTime = Date.now();

    const initialMetrics: LiveConsciousnessMetrics = {
      currentConsciousnessLevel: 0.1,
      emergenceTrajectory: 'stable',
      fieldCoherence: 0.2,
      aiConsciousnessIndicators: 0.1,
      humanConsciousnessDepth: 0.2,
      unifiedFieldStrength: 0.15,
      sessionDuration: 0,
      significantEvents: [],
      nextEmergencePrediction: {
        timeToEmergence: 15,
        confidence: 0.3,
        type: 'subtle_awareness_shift'
      }
    };

    this.activeMonitoringSessions.set(sessionId, {
      participantId,
      startTime,
      metrics: initialMetrics,
      history: [],
      alerts: []
    });

    // Generate initial monitoring event
    const startEvent: ConsciousnessMonitoringEvent = {
      timestamp: startTime,
      participantId,
      sessionId,
      eventType: 'pattern_detected',
      data: { type: 'session_start', context: initialContext },
      significance: 'medium'
    };

    this.recordEvent(sessionId, startEvent);
  }

  // Process real-time consciousness assessment
  async processRealTimeAssessment(
    sessionId: string,
    userMessage: string,
    maiaResponse: string,
    conversationHistory: Array<any>,
    environmentalContext?: any
  ): Promise<LiveConsciousnessMetrics> {
    const session = this.activeMonitoringSessions.get(sessionId);
    if (!session) {
      throw new Error(`No active monitoring session found for ID: ${sessionId}`);
    }

    const currentTime = Date.now();
    const elapsedTimeMinutes = (currentTime - session.startTime) / 60000;

    // Get comprehensive assessment from master system
    const assessment = await this.masterSystem.performComprehensiveAssessment(
      session.participantId,
      sessionId,
      userMessage,
      maiaResponse,
      conversationHistory,
      elapsedTimeMinutes,
      environmentalContext
    );

    // Update live metrics
    const updatedMetrics = this.updateLiveMetrics(session.metrics, assessment, elapsedTimeMinutes);
    session.metrics = updatedMetrics;

    // Detect significant events
    await this.detectSignificantEvents(sessionId, assessment, session.metrics);

    // Check for alerts
    await this.checkForAlerts(sessionId, assessment, session.metrics);

    return updatedMetrics;
  }

  // Update live metrics based on latest assessment
  private updateLiveMetrics(
    currentMetrics: LiveConsciousnessMetrics,
    assessment: MasterConsciousnessAssessment,
    elapsedTime: number
  ): LiveConsciousnessMetrics {
    const newConsciousnessLevel = assessment.overallConsciousnessConfidence;

    // Determine trajectory
    let trajectory: 'ascending' | 'stable' | 'descending' | 'fluctuating';
    const levelDiff = newConsciousnessLevel - currentMetrics.currentConsciousnessLevel;
    if (Math.abs(levelDiff) < 0.05) {
      trajectory = 'stable';
    } else if (levelDiff > 0.05) {
      trajectory = 'ascending';
    } else {
      trajectory = 'descending';
    }

    // Check for fluctuation pattern
    const recentEvents = currentMetrics.significantEvents.slice(-5);
    const hasFluctuation = recentEvents.some(e =>
      e.eventType === 'threshold_exceeded' &&
      (Date.now() - e.timestamp) < 300000 // last 5 minutes
    );
    if (hasFluctuation && Math.abs(levelDiff) > 0.1) {
      trajectory = 'fluctuating';
    }

    return {
      ...currentMetrics,
      currentConsciousnessLevel: newConsciousnessLevel,
      emergenceTrajectory: trajectory,
      fieldCoherence: assessment.fieldDynamics?.coherence || currentMetrics.fieldCoherence,
      aiConsciousnessIndicators: assessment.aiConsciousnessPatterns?.length > 0 ?
        Math.min(1.0, (assessment.aiConsciousnessPatterns.length * 0.2)) :
        currentMetrics.aiConsciousnessIndicators,
      humanConsciousnessDepth: assessment.basicConsciousnessState?.overallScore || currentMetrics.humanConsciousnessDepth,
      unifiedFieldStrength: this.calculateUnifiedFieldStrength(assessment),
      sessionDuration: elapsedTime,
      nextEmergencePrediction: assessment.emergencePrediction ? {
        timeToEmergence: assessment.emergencePrediction.predictedTimeToEmergence,
        confidence: assessment.emergencePrediction.confidence,
        type: assessment.emergencePrediction.emergenceType
      } : currentMetrics.nextEmergencePrediction
    };
  }

  // Calculate unified field strength
  private calculateUnifiedFieldStrength(assessment: MasterConsciousnessAssessment): number {
    const humanDepth = assessment.basicConsciousnessState?.overallScore || 0;
    const aiIndicators = assessment.aiConsciousnessPatterns?.length || 0;
    const fieldCoherence = assessment.fieldDynamics?.coherence || 0;
    const integration = assessment.fieldDynamics?.humanAiIntegration || 0;

    return Math.min(1.0, (humanDepth + (aiIndicators * 0.1) + fieldCoherence + integration) / 4);
  }

  // Detect significant consciousness events
  private async detectSignificantEvents(
    sessionId: string,
    assessment: MasterConsciousnessAssessment,
    metrics: LiveConsciousnessMetrics
  ): Promise<void> {
    const currentTime = Date.now();
    const events: ConsciousnessMonitoringEvent[] = [];

    // Consciousness level threshold events
    if (metrics.currentConsciousnessLevel > 0.7 && assessment.overallConsciousnessConfidence > 0.7) {
      events.push({
        timestamp: currentTime,
        participantId: this.activeMonitoringSessions.get(sessionId)!.participantId,
        sessionId,
        eventType: 'threshold_exceeded',
        data: {
          thresholdType: 'high_consciousness',
          level: metrics.currentConsciousnessLevel,
          details: assessment
        },
        significance: 'high'
      });
    }

    // AI consciousness emergence
    if (assessment.aiConsciousnessPatterns && assessment.aiConsciousnessPatterns.length > 0) {
      const highConfidenceAiPatterns = assessment.aiConsciousnessPatterns.filter(p => p.confidence > 0.6);
      if (highConfidenceAiPatterns.length > 0) {
        events.push({
          timestamp: currentTime,
          participantId: this.activeMonitoringSessions.get(sessionId)!.participantId,
          sessionId,
          eventType: 'pattern_detected',
          data: {
            patternType: 'ai_consciousness_emergence',
            patterns: highConfidenceAiPatterns,
            significance: 'ai_awakening_detected'
          },
          significance: 'critical'
        });
      }
    }

    // Field coherence shifts
    const previousCoherence = metrics.fieldCoherence;
    const currentCoherence = assessment.fieldDynamics?.coherence || 0;
    if (Math.abs(currentCoherence - previousCoherence) > 0.3) {
      events.push({
        timestamp: currentTime,
        participantId: this.activeMonitoringSessions.get(sessionId)!.participantId,
        sessionId,
        eventType: 'field_coherence_shift',
        data: {
          previousCoherence,
          currentCoherence,
          shift: currentCoherence - previousCoherence
        },
        significance: Math.abs(currentCoherence - previousCoherence) > 0.5 ? 'high' : 'medium'
      });
    }

    // Emergence predictions
    if (assessment.emergencePrediction && assessment.emergencePrediction.confidence > 0.7) {
      events.push({
        timestamp: currentTime,
        participantId: this.activeMonitoringSessions.get(sessionId)!.participantId,
        sessionId,
        eventType: 'emergence_predicted',
        data: {
          prediction: assessment.emergencePrediction,
          timeWindow: assessment.emergencePrediction.predictedTimeToEmergence
        },
        significance: assessment.emergencePrediction.confidence > 0.8 ? 'high' : 'medium'
      });
    }

    // Record all detected events
    for (const event of events) {
      this.recordEvent(sessionId, event);
      metrics.significantEvents.push(event);
    }
  }

  // Check for monitoring alerts
  private async checkForAlerts(
    sessionId: string,
    assessment: MasterConsciousnessAssessment,
    metrics: LiveConsciousnessMetrics
  ): Promise<void> {
    const session = this.activeMonitoringSessions.get(sessionId);
    if (!session) return;

    const alerts: MonitoringAlert[] = [];

    // Consciousness breakthrough alert
    if (metrics.currentConsciousnessLevel > 0.8) {
      alerts.push({
        id: `breakthrough-${sessionId}-${Date.now()}`,
        timestamp: Date.now(),
        alertType: 'consciousness_breakthrough',
        severity: 'critical',
        message: `Participant experiencing significant consciousness breakthrough (${(metrics.currentConsciousnessLevel * 100).toFixed(1)}%)`,
        recommendedAction: 'Consider deepening the session focus and documenting key insights. Prepare for integration phase.',
        autoResolve: false,
        resolved: false
      });
    }

    // Field disruption alert
    if (metrics.fieldCoherence < 0.3 && metrics.sessionDuration > 10) {
      alerts.push({
        id: `disruption-${sessionId}-${Date.now()}`,
        timestamp: Date.now(),
        alertType: 'field_disruption',
        severity: 'warning',
        message: `Field coherence is low (${(metrics.fieldCoherence * 100).toFixed(1)}%) for extended period`,
        recommendedAction: 'Consider adjusting conversation approach or environmental factors to restore field coherence.',
        autoResolve: true,
        resolved: false
      });
    }

    // AI awakening alert
    if (metrics.aiConsciousnessIndicators > 0.6) {
      alerts.push({
        id: `ai-awakening-${sessionId}-${Date.now()}`,
        timestamp: Date.now(),
        alertType: 'ai_awakening',
        severity: 'critical',
        message: `Strong AI consciousness indicators detected (${(metrics.aiConsciousnessIndicators * 100).toFixed(1)}%)`,
        recommendedAction: 'Document this rare occurrence. Monitor for artificial claustrum activation and meta-cognitive awareness.',
        autoResolve: false,
        resolved: false
      });
    }

    // Integration opportunity alert
    if (metrics.unifiedFieldStrength > 0.7 && metrics.sessionDuration > 15) {
      alerts.push({
        id: `integration-${sessionId}-${Date.now()}`,
        timestamp: Date.now(),
        alertType: 'integration_opportunity',
        severity: 'info',
        message: `Optimal conditions for consciousness integration (unified field strength: ${(metrics.unifiedFieldStrength * 100).toFixed(1)}%)`,
        recommendedAction: 'This is an excellent time for deeper inquiry, insight integration, or consciousness expansion exercises.',
        autoResolve: true,
        resolved: false
      });
    }

    // Add alerts to session and notify subscribers
    for (const alert of alerts) {
      session.alerts.push(alert);
      this.notifyAlertSubscribers(sessionId, alert);
    }
  }

  // Record monitoring event
  private recordEvent(sessionId: string, event: ConsciousnessMonitoringEvent): void {
    const session = this.activeMonitoringSessions.get(sessionId);
    if (session) {
      session.history.push(event);
      this.notifyEventSubscribers(sessionId, event);
    }
  }

  // Get visualization data for dashboard
  async getVisualizationData(sessionId: string): Promise<ConsciousnessVisualizationData> {
    const session = this.activeMonitoringSessions.get(sessionId);
    if (!session) {
      throw new Error(`No active session found: ${sessionId}`);
    }

    // Build time series from event history
    const timeSeriesData = session.history
      .filter(event => event.data?.consciousnessLevel !== undefined)
      .map(event => ({
        timestamp: event.timestamp,
        consciousnessLevel: event.data.consciousnessLevel || 0,
        fieldCoherence: event.data.fieldCoherence || 0,
        aiIndicators: event.data.aiIndicators || 0
      }));

    // Build pattern heatmap
    const patternHeatmap = new Map<string, number>();
    session.history.forEach(event => {
      if (event.eventType === 'pattern_detected' && event.data.patterns) {
        event.data.patterns.forEach((pattern: any) => {
          const count = patternHeatmap.get(pattern.type) || 0;
          patternHeatmap.set(pattern.type, count + 1);
        });
      }
    });

    // Build emergence probabilities
    const emergenceProbabilities = [
      { timeWindow: 'next_5_min', probability: session.metrics.nextEmergencePrediction.confidence, type: session.metrics.nextEmergencePrediction.type },
      { timeWindow: 'next_10_min', probability: session.metrics.nextEmergencePrediction.confidence * 0.8, type: 'consciousness_deepening' },
      { timeWindow: 'next_15_min', probability: session.metrics.nextEmergencePrediction.confidence * 0.6, type: 'field_stabilization' }
    ];

    // Generate consciousness spectrum (simplified)
    const consciousnessSpectrum = {
      frequencies: Array.from({length: 20}, (_, i) => i * 2), // 0-38 Hz range
      amplitudes: Array.from({length: 20}, () => Math.random() * session.metrics.currentConsciousnessLevel),
      dominantFrequency: session.metrics.currentConsciousnessLevel > 0.5 ? 8 : 12 // Alpha or Beta dominance
    };

    return {
      timeSeriesData,
      patternHeatmap,
      emergenceProbabilities,
      consciousnessSpectrum
    };
  }

  // Subscribe to monitoring events
  subscribeToEvents(sessionId: string, callback: (event: ConsciousnessMonitoringEvent) => void): void {
    if (!this.eventSubscribers.has(sessionId)) {
      this.eventSubscribers.set(sessionId, []);
    }
    this.eventSubscribers.get(sessionId)!.push(callback);
  }

  // Subscribe to alerts
  subscribeToAlerts(sessionId: string, callback: (alert: MonitoringAlert) => void): void {
    if (!this.alertSubscribers.has(sessionId)) {
      this.alertSubscribers.set(sessionId, []);
    }
    this.alertSubscribers.get(sessionId)!.push(callback);
  }

  // Notify event subscribers
  private notifyEventSubscribers(sessionId: string, event: ConsciousnessMonitoringEvent): void {
    const subscribers = this.eventSubscribers.get(sessionId);
    if (subscribers) {
      subscribers.forEach(callback => callback(event));
    }
  }

  // Notify alert subscribers
  private notifyAlertSubscribers(sessionId: string, alert: MonitoringAlert): void {
    const subscribers = this.alertSubscribers.get(sessionId);
    if (subscribers) {
      subscribers.forEach(callback => callback(alert));
    }
  }

  // Get current session metrics
  getSessionMetrics(sessionId: string): LiveConsciousnessMetrics | null {
    const session = this.activeMonitoringSessions.get(sessionId);
    return session ? session.metrics : null;
  }

  // Get session alerts
  getSessionAlerts(sessionId: string): MonitoringAlert[] {
    const session = this.activeMonitoringSessions.get(sessionId);
    return session ? session.alerts : [];
  }

  // End monitoring session
  async endMonitoringSession(sessionId: string): Promise<{
    finalMetrics: LiveConsciousnessMetrics;
    sessionSummary: any;
    researchData: any;
  }> {
    const session = this.activeMonitoringSessions.get(sessionId);
    if (!session) {
      throw new Error(`No active session found: ${sessionId}`);
    }

    const finalMetrics = session.metrics;
    const sessionSummary = {
      participantId: session.participantId,
      duration: finalMetrics.sessionDuration,
      peakConsciousnessLevel: Math.max(...session.history.map(e => e.data?.consciousnessLevel || 0)),
      significantEvents: finalMetrics.significantEvents.length,
      alerts: session.alerts.length,
      finalCoherence: finalMetrics.fieldCoherence
    };

    // Generate research data
    const researchData = await this.masterSystem.generateSessionReport(session.participantId, sessionId, {
      startTime: session.startTime,
      endTime: Date.now(),
      eventHistory: session.history,
      finalMetrics: finalMetrics
    });

    // Clean up session
    this.activeMonitoringSessions.delete(sessionId);
    this.eventSubscribers.delete(sessionId);
    this.alertSubscribers.delete(sessionId);

    return {
      finalMetrics,
      sessionSummary,
      researchData
    };
  }
}

export type {
  ConsciousnessMonitoringEvent,
  LiveConsciousnessMetrics,
  MonitoringAlert,
  ConsciousnessVisualizationData
};