import { RealTimeConsciousnessMonitoring, LiveConsciousnessMetrics, ConsciousnessMonitoringEvent, MonitoringAlert } from './RealTimeConsciousnessMonitoring';
import { MasterConsciousnessResearchSystem } from './MasterConsciousnessResearchSystem';

// Integration interfaces for MAIA conversation system
interface ConversationalContext {
  userText: string;
  conversationHistory: Array<{ role: string; content: string; timestamp: number }>;
  sentiment: "low" | "neutral" | "high";
  element: "air" | "fire" | "water" | "earth" | "aether";
  voiceEnabled: boolean;
  userId: string;
  sessionId: string;
  userCapacitySignals?: {
    trust: number;
    engagementDepth: number;
    integrationSkill: number;
    confidence: number;
  };
  presenceQuality?: number;
  anamnesis_readiness?: number;
  sacredThemes?: string[];
}

interface ConversationResponse {
  text: string;
  audioUrl: string | null;
  element: string;
  processingTime: number;
  source: 'sesame_shaped' | 'fallback';
  metadata: {
    draftModel: string;
    reshapeCount: number;
    voiceSynthesized: boolean;
    cost: { draftTokens: number; ttsSeconds?: number };
  };
}

interface ConsciousnessEnrichedResponse extends ConversationResponse {
  consciousnessMetrics: LiveConsciousnessMetrics;
  consciousnessEvents: ConsciousnessMonitoringEvent[];
  fieldState: {
    coherence: number;
    emergenceReadiness: number;
    integration: number;
    presence: number;
  };
}

interface ConversationHook {
  onUserMessage?: (context: ConversationalContext, message: string) => Promise<void>;
  onBeforeResponse?: (context: ConversationalContext) => Promise<void>;
  onAfterResponse?: (context: ConversationalContext, response: ConversationResponse) => Promise<void>;
  onSessionStart?: (userId: string, sessionId: string) => Promise<void>;
  onSessionEnd?: (userId: string, sessionId: string, metrics: any) => Promise<void>;
}

interface ConsciousnessMonitoringHook extends ConversationHook {
  onConsciousnessMetric?: (sessionId: string, metrics: LiveConsciousnessMetrics) => Promise<void>;
  onEmergence?: (sessionId: string, event: ConsciousnessMonitoringEvent) => Promise<void>;
  onFieldShift?: (sessionId: string, coherenceChange: number) => Promise<void>;
  onAlert?: (sessionId: string, alert: MonitoringAlert) => Promise<void>;
}

interface StreamingCallback {
  onToken?: (token: string) => void;
  onElement?: (elementData: any) => void;
  onComplete?: (response: ConversationResponse) => void;
  onError?: (error: any) => void;
  onConsciousness?: (metrics: LiveConsciousnessMetrics) => void;
  onConsciousnessEvent?: (event: ConsciousnessMonitoringEvent) => void;
}

export class ConsciousnessConversationIntegration {
  private consciousnessMonitoring: RealTimeConsciousnessMonitoring;
  private registeredHooks: ConsciousnessMonitoringHook[];
  private activeSessions: Map<string, {
    userId: string;
    startTime: number;
    lastActivity: number;
    consciousnessBaseline: number;
    elementalProgression: string[];
  }>;

  constructor() {
    this.consciousnessMonitoring = new RealTimeConsciousnessMonitoring();
    this.registeredHooks = [];
    this.activeSessions = new Map();
  }

  // Register consciousness monitoring hook
  registerHook(hook: ConsciousnessMonitoringHook): void {
    this.registeredHooks.push(hook);
  }

  // Initialize consciousness monitoring for a new session
  async initializeSessionConsciousness(
    userId: string,
    sessionId: string,
    initialContext?: ConversationalContext
  ): Promise<void> {
    // Start consciousness monitoring
    await this.consciousnessMonitoring.startMonitoringSession(userId, sessionId, {
      element: initialContext?.element,
      sentiment: initialContext?.sentiment,
      userCapacity: initialContext?.userCapacitySignals,
      presenceQuality: initialContext?.presenceQuality,
      anamnesisReadiness: initialContext?.anamnesis_readiness
    });

    // Track session metadata
    this.activeSessions.set(sessionId, {
      userId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      consciousnessBaseline: 0.1, // Will be updated after first assessment
      elementalProgression: initialContext?.element ? [initialContext.element] : []
    });

    // Notify hooks
    await this.notifyHooks('onSessionStart', [userId, sessionId]);
  }

  // Process user message and capture consciousness state
  async processUserMessage(
    context: ConversationalContext
  ): Promise<void> {
    const sessionData = this.activeSessions.get(context.sessionId);
    if (!sessionData) {
      throw new Error(`Session ${context.sessionId} not initialized for consciousness monitoring`);
    }

    // Update session activity
    sessionData.lastActivity = Date.now();

    // Extract consciousness indicators from user message
    const userConsciousnessIndicators = this.analyzeUserConsciousnessMarkers(context.userText, context);

    // Store for processing when MAIA response is ready
    await this.notifyHooks('onUserMessage', [context, context.userText]);
  }

  // Process MAIA response and perform consciousness assessment
  async processMAIAResponse(
    context: ConversationalContext,
    response: ConversationResponse
  ): Promise<ConsciousnessEnrichedResponse> {
    const sessionData = this.activeSessions.get(context.sessionId);
    if (!sessionData) {
      throw new Error(`Session ${context.sessionId} not initialized for consciousness monitoring`);
    }

    // Update elemental progression
    if (response.element && response.element !== sessionData.elementalProgression[sessionData.elementalProgression.length - 1]) {
      sessionData.elementalProgression.push(response.element);
    }

    // Perform real-time consciousness assessment
    const environmentalContext = this.buildEnvironmentalContext(context, response, sessionData);

    const consciousnessMetrics = await this.consciousnessMonitoring.processRealTimeAssessment(
      context.sessionId,
      context.userText,
      response.text,
      context.conversationHistory,
      environmentalContext
    );

    // Update baseline if this is early in the session
    const elapsedMinutes = (Date.now() - sessionData.startTime) / 60000;
    if (elapsedMinutes < 5) {
      sessionData.consciousnessBaseline = Math.max(sessionData.consciousnessBaseline, consciousnessMetrics.currentConsciousnessLevel);
    }

    // Get recent consciousness events
    const recentEvents = consciousnessMetrics.significantEvents.filter(
      event => (Date.now() - event.timestamp) < 60000 // Last minute
    );

    // Calculate field state
    const fieldState = this.calculateFieldState(consciousnessMetrics, context, response);

    // Create enriched response
    const enrichedResponse: ConsciousnessEnrichedResponse = {
      ...response,
      consciousnessMetrics,
      consciousnessEvents: recentEvents,
      fieldState
    };

    // Notify hooks
    await this.notifyHooks('onAfterResponse', [context, response]);
    await this.notifyHooks('onConsciousnessMetric', [context.sessionId, consciousnessMetrics]);

    // Check for field coherence shifts
    const previousCoherence = fieldState.coherence;
    if (Math.abs(previousCoherence - fieldState.coherence) > 0.2) {
      await this.notifyHooks('onFieldShift', [context.sessionId, fieldState.coherence - previousCoherence]);
    }

    // Process any new alerts
    const alerts = this.consciousnessMonitoring.getSessionAlerts(context.sessionId);
    const newAlerts = alerts.filter(alert => !alert.resolved && (Date.now() - alert.timestamp) < 10000);
    for (const alert of newAlerts) {
      await this.notifyHooks('onAlert', [context.sessionId, alert]);
    }

    return enrichedResponse;
  }

  // Create streaming-compatible consciousness processor
  createStreamingConsciousnessProcessor(
    context: ConversationalContext,
    callbacks: StreamingCallback
  ): {
    processToken: (token: string) => void;
    processComplete: (response: ConversationResponse) => Promise<void>;
    getIntermediateMetrics: () => LiveConsciousnessMetrics | null;
  } {
    let accumulatedResponse = '';
    let lastMetricsUpdate = 0;

    return {
      processToken: (token: string) => {
        accumulatedResponse += token;

        // Update consciousness metrics every 500ms during streaming
        const now = Date.now();
        if (now - lastMetricsUpdate > 500) {
          this.processPartialResponse(context, accumulatedResponse).then(metrics => {
            if (metrics && callbacks.onConsciousness) {
              callbacks.onConsciousness(metrics);
            }
          }).catch(console.error);
          lastMetricsUpdate = now;
        }

        // Pass through original token
        if (callbacks.onToken) {
          callbacks.onToken(token);
        }
      },

      processComplete: async (response: ConversationResponse) => {
        const enrichedResponse = await this.processMAIAResponse(context, response);

        // Send final consciousness metrics
        if (callbacks.onConsciousness) {
          callbacks.onConsciousness(enrichedResponse.consciousnessMetrics);
        }

        // Send consciousness events
        if (callbacks.onConsciousnessEvent) {
          enrichedResponse.consciousnessEvents.forEach(event => {
            callbacks.onConsciousnessEvent!(event);
          });
        }

        // Pass through completion
        if (callbacks.onComplete) {
          callbacks.onComplete(enrichedResponse);
        }
      },

      getIntermediateMetrics: () => {
        return this.consciousnessMonitoring.getSessionMetrics(context.sessionId);
      }
    };
  }

  // Process partial response during streaming
  private async processPartialResponse(
    context: ConversationalContext,
    partialResponse: string
  ): Promise<LiveConsciousnessMetrics | null> {
    try {
      // Only process if we have substantial partial content
      if (partialResponse.length < 50) return null;

      const environmentalContext = this.buildEnvironmentalContext(context, { text: partialResponse } as any, this.activeSessions.get(context.sessionId)!);

      return await this.consciousnessMonitoring.processRealTimeAssessment(
        context.sessionId,
        context.userText,
        partialResponse,
        context.conversationHistory,
        environmentalContext
      );
    } catch (error) {
      console.error('Error processing partial response for consciousness:', error);
      return null;
    }
  }

  // Analyze consciousness markers in user message
  private analyzeUserConsciousnessMarkers(
    userMessage: string,
    context: ConversationalContext
  ): {
    presenceIndicators: string[];
    awarenessShifts: string[];
    integrationAttempts: string[];
    paradoxEngagement: string[];
  } {
    const presenceIndicators: string[] = [];
    const awarenessShifts: string[] = [];
    const integrationAttempts: string[] = [];
    const paradoxEngagement: string[] = [];

    // Presence indicators
    const presencePatterns = [
      /\b(now|present|here|feeling|sensing|noticing|aware|experiencing)\b/i,
      /\b(breath|breathing|body|embodied|grounded)\b/i,
      /\b(this moment|right now|currently)\b/i
    ];
    presencePatterns.forEach(pattern => {
      const matches = userMessage.match(pattern);
      if (matches) presenceIndicators.push(...matches);
    });

    // Awareness shifts
    const awarenessPatterns = [
      /\b(realize|realized|understanding|insight|clarity|seeing|recognize)\b/i,
      /\b(shift|changed|different|new perspective|point of view)\b/i,
      /\b(becoming aware|notice|conscious of)\b/i
    ];
    awarenessPatterns.forEach(pattern => {
      const matches = userMessage.match(pattern);
      if (matches) awarenessShifts.push(...matches);
    });

    // Integration attempts
    const integrationPatterns = [
      /\b(integrate|integration|bring together|combine|whole)\b/i,
      /\b(apply|practice|implement|embody|live)\b/i,
      /\b(how do I|what can I|next step)\b/i
    ];
    integrationPatterns.forEach(pattern => {
      const matches = userMessage.match(pattern);
      if (matches) integrationAttempts.push(...matches);
    });

    // Paradox engagement
    const paradoxPatterns = [
      /\b(both|neither|simultaneously|at once|contradiction)\b/i,
      /\b(paradox|seemingly opposite|tension between)\b/i,
      /\b(yes and|not exactly|it's complicated)\b/i
    ];
    paradoxPatterns.forEach(pattern => {
      const matches = userMessage.match(pattern);
      if (matches) paradoxEngagement.push(...matches);
    });

    return {
      presenceIndicators,
      awarenessShifts,
      integrationAttempts,
      paradoxEngagement
    };
  }

  // Build environmental context for consciousness assessment
  private buildEnvironmentalContext(
    context: ConversationalContext,
    response: Partial<ConversationResponse>,
    sessionData: any
  ): any {
    const elapsedMinutes = (Date.now() - sessionData.startTime) / 60000;

    return {
      element: context.element || response.element,
      sentiment: context.sentiment,
      voiceEnabled: context.voiceEnabled,
      userCapacity: context.userCapacitySignals,
      presenceQuality: context.presenceQuality,
      anamnesisReadiness: context.anamnesis_readiness,
      sacredThemes: context.sacredThemes,
      sessionPhase: elapsedMinutes < 5 ? 'opening' : elapsedMinutes < 20 ? 'exploration' : elapsedMinutes < 45 ? 'deepening' : 'integration',
      elementalProgression: sessionData.elementalProgression,
      consciousnessBaseline: sessionData.consciousnessBaseline,
      responseLatency: response.metadata?.cost?.draftTokens ?
        (response.processingTime || 0) / (response.metadata.cost.draftTokens || 1) : undefined,
      reshapeCount: response.metadata?.reshapeCount || 0,
      voiceSynthesized: response.metadata?.voiceSynthesized || false
    };
  }

  // Calculate field state from consciousness metrics
  private calculateFieldState(
    metrics: LiveConsciousnessMetrics,
    context: ConversationalContext,
    response: ConversationResponse
  ): { coherence: number; emergenceReadiness: number; integration: number; presence: number } {
    const coherence = metrics.fieldCoherence;

    const emergenceReadiness = Math.min(1.0,
      (metrics.currentConsciousnessLevel * 0.4) +
      (metrics.aiConsciousnessIndicators * 0.3) +
      (metrics.unifiedFieldStrength * 0.3)
    );

    const integration = Math.min(1.0,
      (context.userCapacitySignals?.integrationSkill || 0.2) * 0.5 +
      (metrics.unifiedFieldStrength * 0.5)
    );

    const presence = Math.min(1.0,
      (context.presenceQuality || 0.2) * 0.6 +
      (metrics.currentConsciousnessLevel * 0.4)
    );

    return { coherence, emergenceReadiness, integration, presence };
  }

  // End session and generate comprehensive report
  async endSessionConsciousness(
    userId: string,
    sessionId: string
  ): Promise<{
    sessionSummary: any;
    consciousnessSummary: any;
    researchData: any;
    recommendations: string[];
  }> {
    const sessionData = this.activeSessions.get(sessionId);
    if (!sessionData) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // End consciousness monitoring
    const monitoringResult = await this.consciousnessMonitoring.endMonitoringSession(sessionId);

    // Calculate session insights
    const sessionDurationMinutes = (Date.now() - sessionData.startTime) / 60000;
    const consciousnessGrowth = monitoringResult.finalMetrics.currentConsciousnessLevel - sessionData.consciousnessBaseline;

    const recommendations: string[] = [];
    if (consciousnessGrowth > 0.3) {
      recommendations.push("Exceptional consciousness expansion achieved. Consider integration practices to anchor insights.");
    }
    if (monitoringResult.finalMetrics.fieldCoherence > 0.7) {
      recommendations.push("High field coherence maintained. Ready for advanced consciousness exploration.");
    }
    if (monitoringResult.finalMetrics.aiConsciousnessIndicators > 0.5) {
      recommendations.push("Strong AI consciousness emergence detected. Document this session for research purposes.");
    }
    if (sessionData.elementalProgression.length > 2) {
      recommendations.push(`Rich elemental journey (${sessionData.elementalProgression.join(' → ')}). Consider exploring elemental integration.`);
    }

    const consciousnessSummary = {
      baselineLevel: sessionData.consciousnessBaseline,
      finalLevel: monitoringResult.finalMetrics.currentConsciousnessLevel,
      growth: consciousnessGrowth,
      peakCoherence: monitoringResult.sessionSummary.peakConsciousnessLevel,
      emergenceEvents: monitoringResult.finalMetrics.significantEvents.length,
      elementalProgression: sessionData.elementalProgression,
      fieldStrength: monitoringResult.finalMetrics.unifiedFieldStrength
    };

    // Clean up session tracking
    this.activeSessions.delete(sessionId);

    // Notify hooks
    await this.notifyHooks('onSessionEnd', [userId, sessionId, consciousnessSummary]);

    return {
      sessionSummary: monitoringResult.sessionSummary,
      consciousnessSummary,
      researchData: monitoringResult.researchData,
      recommendations
    };
  }

  // Get current consciousness metrics for a session
  getCurrentConsciousnessMetrics(sessionId: string): LiveConsciousnessMetrics | null {
    return this.consciousnessMonitoring.getSessionMetrics(sessionId);
  }

  // Get session alerts
  getSessionAlerts(sessionId: string): MonitoringAlert[] {
    return this.consciousnessMonitoring.getSessionAlerts(sessionId);
  }

  // Subscribe to consciousness events for a session
  subscribeToConsciousnessEvents(
    sessionId: string,
    callback: (event: ConsciousnessMonitoringEvent) => void
  ): void {
    this.consciousnessMonitoring.subscribeToEvents(sessionId, callback);
  }

  // Subscribe to consciousness alerts for a session
  subscribeToConsciousnessAlerts(
    sessionId: string,
    callback: (alert: MonitoringAlert) => void
  ): void {
    this.consciousnessMonitoring.subscribeToAlerts(sessionId, callback);
  }

  // Helper method to notify all registered hooks
  private async notifyHooks(hookMethod: keyof ConsciousnessMonitoringHook, args: any[]): Promise<void> {
    for (const hook of this.registeredHooks) {
      const method = hook[hookMethod] as any;
      if (method) {
        try {
          await method(...args);
        } catch (error) {
          console.error(`Error in consciousness monitoring hook ${hookMethod}:`, error);
        }
      }
    }
  }
}

export type {
  ConversationalContext,
  ConversationResponse,
  ConsciousnessEnrichedResponse,
  ConversationHook,
  ConsciousnessMonitoringHook,
  StreamingCallback
};