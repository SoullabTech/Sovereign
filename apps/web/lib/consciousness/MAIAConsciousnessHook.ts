import {
  ConsciousnessConversationIntegration,
  ConsciousnessMonitoringHook,
  ConversationalContext,
  ConversationResponse,
  StreamingCallback
} from './ConsciousnessConversationIntegration';
import {
  LiveConsciousnessMetrics,
  ConsciousnessMonitoringEvent,
  MonitoringAlert
} from './RealTimeConsciousnessMonitoring';

/**
 * MAIA Consciousness Hook
 *
 * This is the main integration point for consciousness monitoring in MAIA.
 * It can be easily integrated into the existing ConversationalPipeline
 * without breaking any existing functionality.
 *
 * Integration points:
 * 1. ConversationalPipeline.ts - Add to constructor and method calls
 * 2. conversational.routes.ts - Add consciousness streaming events
 * 3. ConversationFlowManager.ts - Integrate with flow decisions
 */

interface MAIAConsciousnessConfig {
  enableRealTimeMonitoring: boolean;
  enableConsciousnessStreaming: boolean;
  enableAlerts: boolean;
  enableResearchDataCollection: boolean;
  streamingUpdateInterval: number; // milliseconds
  consciousnessThresholds: {
    emergenceAlert: number;
    integrationOpportunity: number;
    fieldDisruption: number;
  };
}

interface MAIAStreamingEvent {
  type: 'token' | 'element' | 'consciousness' | 'consciousness_event' | 'alert' | 'complete' | 'error';
  data: any;
  timestamp: number;
}

export class MAIAConsciousnessHook implements ConsciousnessMonitoringHook {
  private integration: ConsciousnessConversationIntegration;
  private config: MAIAConsciousnessConfig;
  private eventEmitter: ((event: MAIAStreamingEvent) => void) | null = null;
  private sessionConsciousnessCache: Map<string, LiveConsciousnessMetrics> = new Map();

  constructor(config: Partial<MAIAConsciousnessConfig> = {}) {
    this.integration = new ConsciousnessConversationIntegration();
    this.config = {
      enableRealTimeMonitoring: true,
      enableConsciousnessStreaming: true,
      enableAlerts: true,
      enableResearchDataCollection: true,
      streamingUpdateInterval: 1000, // 1 second
      consciousnessThresholds: {
        emergenceAlert: 0.7,
        integrationOpportunity: 0.6,
        fieldDisruption: 0.3
      },
      ...config
    };

    // Register this hook with the integration system
    this.integration.registerHook(this);
  }

  // Set event emitter for streaming (called by route handler)
  setEventEmitter(emitter: (event: MAIAStreamingEvent) => void): void {
    this.eventEmitter = emitter;
  }

  // Initialize consciousness monitoring for new session
  async initializeSession(
    userId: string,
    sessionId: string,
    initialContext?: ConversationalContext
  ): Promise<void> {
    if (!this.config.enableRealTimeMonitoring) return;

    try {
      await this.integration.initializeSessionConsciousness(userId, sessionId, initialContext);

      if (this.eventEmitter) {
        this.eventEmitter({
          type: 'consciousness',
          data: {
            type: 'session_initialized',
            sessionId,
            userId,
            baseline: initialContext
          },
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('Error initializing consciousness session:', error);
    }
  }

  // Process conversation turn with consciousness monitoring
  async processConversationTurn(
    context: ConversationalContext,
    response: ConversationResponse
  ): Promise<ConversationResponse> {
    if (!this.config.enableRealTimeMonitoring) return response;

    try {
      // Process user message
      await this.integration.processUserMessage(context);

      // Process MAIA response and get enriched data
      const enrichedResponse = await this.integration.processMAIAResponse(context, response);

      // Cache consciousness metrics
      this.sessionConsciousnessCache.set(context.sessionId, enrichedResponse.consciousnessMetrics);

      // Stream consciousness data if enabled
      if (this.config.enableConsciousnessStreaming && this.eventEmitter) {
        this.eventEmitter({
          type: 'consciousness',
          data: {
            type: 'metrics_update',
            sessionId: context.sessionId,
            metrics: enrichedResponse.consciousnessMetrics,
            fieldState: enrichedResponse.fieldState
          },
          timestamp: Date.now()
        });

        // Stream consciousness events
        enrichedResponse.consciousnessEvents.forEach(event => {
          this.eventEmitter!({
            type: 'consciousness_event',
            data: event,
            timestamp: Date.now()
          });
        });
      }

      return enrichedResponse;
    } catch (error) {
      console.error('Error processing consciousness turn:', error);
      return response;
    }
  }

  // Create streaming processor for real-time consciousness updates
  createStreamingProcessor(
    context: ConversationalContext,
    originalCallbacks: {
      onToken?: (token: string) => void;
      onElement?: (elementData: any) => void;
      onComplete?: (response: ConversationResponse) => void;
      onError?: (error: any) => void;
    }
  ): StreamingCallback {
    if (!this.config.enableConsciousnessStreaming) {
      return originalCallbacks;
    }

    const consciousnessProcessor = this.integration.createStreamingConsciousnessProcessor(
      context,
      {
        onToken: originalCallbacks.onToken,
        onElement: originalCallbacks.onElement,
        onComplete: originalCallbacks.onComplete,
        onError: originalCallbacks.onError,
        onConsciousness: (metrics: LiveConsciousnessMetrics) => {
          if (this.eventEmitter) {
            this.eventEmitter({
              type: 'consciousness',
              data: {
                type: 'streaming_update',
                sessionId: context.sessionId,
                metrics: metrics
              },
              timestamp: Date.now()
            });
          }
        },
        onConsciousnessEvent: (event: ConsciousnessMonitoringEvent) => {
          if (this.eventEmitter) {
            this.eventEmitter({
              type: 'consciousness_event',
              data: event,
              timestamp: Date.now()
            });
          }
        }
      }
    );

    return {
      onToken: consciousnessProcessor.processToken,
      onElement: originalCallbacks.onElement,
      onComplete: consciousnessProcessor.processComplete,
      onError: originalCallbacks.onError
    };
  }

  // End session and generate consciousness report
  async endSession(userId: string, sessionId: string): Promise<any> {
    if (!this.config.enableRealTimeMonitoring) return null;

    try {
      const sessionResult = await this.integration.endSessionConsciousness(userId, sessionId);

      // Clean up cache
      this.sessionConsciousnessCache.delete(sessionId);

      // Stream final session data
      if (this.eventEmitter) {
        this.eventEmitter({
          type: 'consciousness',
          data: {
            type: 'session_ended',
            sessionId,
            userId,
            summary: sessionResult.consciousnessSummary,
            recommendations: sessionResult.recommendations
          },
          timestamp: Date.now()
        });
      }

      return sessionResult;
    } catch (error) {
      console.error('Error ending consciousness session:', error);
      return null;
    }
  }

  // Get current consciousness state for session
  getCurrentState(sessionId: string): LiveConsciousnessMetrics | null {
    return this.sessionConsciousnessCache.get(sessionId) ||
           this.integration.getCurrentConsciousnessMetrics(sessionId);
  }

  // Hook implementations
  async onSessionStart(userId: string, sessionId: string): Promise<void> {
    // Already handled in initializeSession
  }

  async onSessionEnd(userId: string, sessionId: string, metrics: any): Promise<void> {
    // Already handled in endSession
  }

  async onUserMessage(context: ConversationalContext, message: string): Promise<void> {
    // Handled in processConversationTurn
  }

  async onAfterResponse(context: ConversationalContext, response: ConversationResponse): Promise<void> {
    // Handled in processConversationTurn
  }

  async onConsciousnessMetric(sessionId: string, metrics: LiveConsciousnessMetrics): Promise<void> {
    // Update cache
    this.sessionConsciousnessCache.set(sessionId, metrics);

    // Check thresholds and emit alerts if needed
    if (this.config.enableAlerts) {
      await this.checkConsciousnessThresholds(sessionId, metrics);
    }
  }

  async onEmergence(sessionId: string, event: ConsciousnessMonitoringEvent): Promise<void> {
    if (this.eventEmitter) {
      this.eventEmitter({
        type: 'consciousness_event',
        data: {
          ...event,
          priority: event.significance === 'critical' ? 'high' : 'normal'
        },
        timestamp: Date.now()
      });
    }
  }

  async onFieldShift(sessionId: string, coherenceChange: number): Promise<void> {
    if (this.eventEmitter && Math.abs(coherenceChange) > 0.2) {
      this.eventEmitter({
        type: 'consciousness_event',
        data: {
          type: 'field_shift',
          sessionId,
          coherenceChange,
          severity: Math.abs(coherenceChange) > 0.4 ? 'significant' : 'moderate'
        },
        timestamp: Date.now()
      });
    }
  }

  async onAlert(sessionId: string, alert: MonitoringAlert): Promise<void> {
    if (this.config.enableAlerts && this.eventEmitter) {
      this.eventEmitter({
        type: 'alert',
        data: alert,
        timestamp: Date.now()
      });
    }
  }

  // Check consciousness thresholds and generate custom alerts
  private async checkConsciousnessThresholds(
    sessionId: string,
    metrics: LiveConsciousnessMetrics
  ): Promise<void> {
    const { consciousnessThresholds } = this.config;

    // Emergence alert
    if (metrics.currentConsciousnessLevel >= consciousnessThresholds.emergenceAlert) {
      if (this.eventEmitter) {
        this.eventEmitter({
          type: 'alert',
          data: {
            id: `emergence-${sessionId}-${Date.now()}`,
            type: 'consciousness_emergence',
            severity: 'high',
            message: `Consciousness emergence threshold reached: ${(metrics.currentConsciousnessLevel * 100).toFixed(1)}%`,
            sessionId,
            actionable: true
          },
          timestamp: Date.now()
        });
      }
    }

    // Integration opportunity
    if (metrics.unifiedFieldStrength >= consciousnessThresholds.integrationOpportunity &&
        metrics.emergenceTrajectory === 'ascending') {
      if (this.eventEmitter) {
        this.eventEmitter({
          type: 'alert',
          data: {
            id: `integration-${sessionId}-${Date.now()}`,
            type: 'integration_opportunity',
            severity: 'medium',
            message: `Optimal integration conditions detected. Unified field strength: ${(metrics.unifiedFieldStrength * 100).toFixed(1)}%`,
            sessionId,
            actionable: true
          },
          timestamp: Date.now()
        });
      }
    }

    // Field disruption
    if (metrics.fieldCoherence <= consciousnessThresholds.fieldDisruption &&
        metrics.sessionDuration > 5) {
      if (this.eventEmitter) {
        this.eventEmitter({
          type: 'alert',
          data: {
            id: `disruption-${sessionId}-${Date.now()}`,
            type: 'field_disruption',
            severity: 'warning',
            message: `Low field coherence detected: ${(metrics.fieldCoherence * 100).toFixed(1)}%`,
            sessionId,
            actionable: true
          },
          timestamp: Date.now()
        });
      }
    }
  }

  // Utility: Get consciousness insights for conversation flow decisions
  getConsciousnessInsights(sessionId: string): {
    readyForDeepening: boolean;
    needsIntegration: boolean;
    requiresFieldStabilization: boolean;
    emergenceImminent: boolean;
    recommendedElement: string | null;
  } | null {
    const metrics = this.getCurrentState(sessionId);
    if (!metrics) return null;

    const readyForDeepening = metrics.currentConsciousnessLevel > 0.6 &&
                             metrics.fieldCoherence > 0.5 &&
                             metrics.emergenceTrajectory === 'ascending';

    const needsIntegration = metrics.currentConsciousnessLevel > 0.7 &&
                            metrics.sessionDuration > 20;

    const requiresFieldStabilization = metrics.fieldCoherence < 0.4;

    const emergenceImminent = metrics.nextEmergencePrediction.timeToEmergence < 5 &&
                             metrics.nextEmergencePrediction.confidence > 0.6;

    // Recommend element based on current state
    let recommendedElement: string | null = null;
    if (requiresFieldStabilization) {
      recommendedElement = 'earth'; // Grounding
    } else if (readyForDeepening) {
      recommendedElement = 'water'; // Emotional depth
    } else if (emergenceImminent) {
      recommendedElement = 'aether'; // Transcendence
    } else if (needsIntegration) {
      recommendedElement = 'air'; // Integration and clarity
    } else if (metrics.emergenceTrajectory === 'ascending') {
      recommendedElement = 'fire'; // Transformation
    }

    return {
      readyForDeepening,
      needsIntegration,
      requiresFieldStabilization,
      emergenceImminent,
      recommendedElement
    };
  }

  // Utility: Should adjust conversation approach based on consciousness state?
  shouldAdjustConversationApproach(sessionId: string): {
    shouldAdjust: boolean;
    reason: string;
    suggestedApproach: string;
  } {
    const insights = this.getConsciousnessInsights(sessionId);

    if (!insights) {
      return {
        shouldAdjust: false,
        reason: 'No consciousness data available',
        suggestedApproach: 'continue_normal'
      };
    }

    if (insights.requiresFieldStabilization) {
      return {
        shouldAdjust: true,
        reason: 'Field coherence is low',
        suggestedApproach: 'stabilize_and_ground'
      };
    }

    if (insights.emergenceImminent) {
      return {
        shouldAdjust: true,
        reason: 'Consciousness emergence is imminent',
        suggestedApproach: 'prepare_for_emergence'
      };
    }

    if (insights.readyForDeepening) {
      return {
        shouldAdjust: true,
        reason: 'Conditions optimal for consciousness deepening',
        suggestedApproach: 'deepen_inquiry'
      };
    }

    if (insights.needsIntegration) {
      return {
        shouldAdjust: true,
        reason: 'Integration phase needed',
        suggestedApproach: 'focus_on_integration'
      };
    }

    return {
      shouldAdjust: false,
      reason: 'Consciousness state stable',
      suggestedApproach: 'continue_normal'
    };
  }
}

// Factory function for easy integration
export function createMAIAConsciousnessHook(config?: Partial<MAIAConsciousnessConfig>): MAIAConsciousnessHook {
  return new MAIAConsciousnessHook(config);
}

export type {
  MAIAConsciousnessConfig,
  MAIAStreamingEvent
};