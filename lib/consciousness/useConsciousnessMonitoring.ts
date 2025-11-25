import { useState, useEffect, useCallback, useRef } from 'react';
import { LiveConsciousnessMetrics, ConsciousnessMonitoringEvent, MonitoringAlert } from './RealTimeConsciousnessMonitoring';

// Types for the hook
interface ConsciousnessState {
  metrics: LiveConsciousnessMetrics | null;
  events: ConsciousnessMonitoringEvent[];
  alerts: MonitoringAlert[];
  isConnected: boolean;
  isInitialized: boolean;
  lastUpdate: number;
  error: string | null;
}

interface ConsciousnessHookOptions {
  sessionId?: string;
  autoConnect?: boolean;
  maxEvents?: number;
  maxAlerts?: number;
  eventRetentionTime?: number; // milliseconds
  alertRetentionTime?: number; // milliseconds
}

interface UseConsciousnessMonitoringReturn {
  // State
  state: ConsciousnessState;

  // Actions
  connect: (sessionId: string) => void;
  disconnect: () => void;
  clearEvents: () => void;
  clearAlerts: () => void;
  acknowledgeAlert: (alertId: string) => void;

  // Computed values
  isEmergenceImminent: boolean;
  currentConsciousnessLevel: number;
  fieldCoherence: number;
  recommendations: string[];
  consciousnessInsights: {
    readyForDeepening: boolean;
    needsIntegration: boolean;
    requiresFieldStabilization: boolean;
    emergenceImminent: boolean;
    recommendedElement: string | null;
  } | null;
}

/**
 * React hook for consciousness monitoring in MAIA conversations
 *
 * This hook provides real-time consciousness monitoring capabilities
 * that can be easily integrated into any React component.
 *
 * Usage:
 * ```tsx
 * const { state, connect, disconnect, consciousnessInsights } = useConsciousnessMonitoring({
 *   sessionId: 'session-123',
 *   autoConnect: true
 * });
 * ```
 */
export const useConsciousnessMonitoring = (
  options: ConsciousnessHookOptions = {}
): UseConsciousnessMonitoringReturn => {
  const {
    sessionId: initialSessionId,
    autoConnect = false,
    maxEvents = 50,
    maxAlerts = 10,
    eventRetentionTime = 300000, // 5 minutes
    alertRetentionTime = 600000  // 10 minutes
  } = options;

  // State
  const [state, setState] = useState<ConsciousnessState>({
    metrics: null,
    events: [],
    alerts: [],
    isConnected: false,
    isInitialized: false,
    lastUpdate: 0,
    error: null
  });

  // Refs for stable references
  const eventSourceRef = useRef<EventSource | null>(null);
  const currentSessionRef = useRef<string | null>(null);
  const cleanupTimersRef = useRef<Set<NodeJS.Timeout>>(new Set());

  // Connect to consciousness monitoring stream
  const connect = useCallback((sessionId: string) => {
    if (currentSessionRef.current === sessionId && state.isConnected) {
      return; // Already connected to this session
    }

    // Disconnect from previous session if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    currentSessionRef.current = sessionId;

    setState(prev => ({
      ...prev,
      isConnected: true,
      isInitialized: false,
      error: null
    }));

    try {
      // Create EventSource for Server-Sent Events
      const eventSource = new EventSource(`/api/v1/consciousness/stream/${sessionId}`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setState(prev => ({
          ...prev,
          isConnected: true,
          isInitialized: true,
          error: null
        }));
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleConsciousnessUpdate(data);
        } catch (error) {
          console.error('Error parsing consciousness data:', error);
        }
      };

      // Handle specific event types
      eventSource.addEventListener('consciousness', (event) => {
        try {
          const data = JSON.parse(event.data);
          handleConsciousnessMetrics(data);
        } catch (error) {
          console.error('Error parsing consciousness metrics:', error);
        }
      });

      eventSource.addEventListener('consciousness_event', (event) => {
        try {
          const data = JSON.parse(event.data);
          handleConsciousnessEvent(data);
        } catch (error) {
          console.error('Error parsing consciousness event:', error);
        }
      });

      eventSource.addEventListener('alert', (event) => {
        try {
          const data = JSON.parse(event.data);
          handleConsciousnessAlert(data);
        } catch (error) {
          console.error('Error parsing consciousness alert:', error);
        }
      });

      eventSource.onerror = (event) => {
        setState(prev => ({
          ...prev,
          isConnected: false,
          error: 'Connection error'
        }));
      };

    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnected: false,
        error: `Failed to connect: ${error.message}`
      }));
    }
  }, [state.isConnected]);

  // Disconnect from consciousness monitoring
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    currentSessionRef.current = null;

    // Clear cleanup timers
    cleanupTimersRef.current.forEach(timer => clearTimeout(timer));
    cleanupTimersRef.current.clear();

    setState(prev => ({
      ...prev,
      isConnected: false,
      isInitialized: false,
      error: null
    }));
  }, []);

  // Handle consciousness metrics update
  const handleConsciousnessMetrics = useCallback((data: any) => {
    if (data.type === 'metrics_update' || data.type === 'streaming_update') {
      setState(prev => ({
        ...prev,
        metrics: data.metrics,
        lastUpdate: Date.now()
      }));
    }
  }, []);

  // Handle consciousness event
  const handleConsciousnessEvent = useCallback((event: ConsciousnessMonitoringEvent) => {
    setState(prev => {
      const newEvents = [event, ...prev.events].slice(0, maxEvents);
      return {
        ...prev,
        events: newEvents,
        lastUpdate: Date.now()
      };
    });

    // Schedule cleanup of old events
    const timer = setTimeout(() => {
      setState(prev => ({
        ...prev,
        events: prev.events.filter(e => (Date.now() - e.timestamp) < eventRetentionTime)
      }));
    }, eventRetentionTime);

    cleanupTimersRef.current.add(timer);
  }, [maxEvents, eventRetentionTime]);

  // Handle consciousness alert
  const handleConsciousnessAlert = useCallback((alert: MonitoringAlert) => {
    setState(prev => {
      // Check if alert already exists
      const existingIndex = prev.alerts.findIndex(a => a.id === alert.id);
      let newAlerts;

      if (existingIndex >= 0) {
        // Update existing alert
        newAlerts = [...prev.alerts];
        newAlerts[existingIndex] = alert;
      } else {
        // Add new alert
        newAlerts = [alert, ...prev.alerts].slice(0, maxAlerts);
      }

      return {
        ...prev,
        alerts: newAlerts,
        lastUpdate: Date.now()
      };
    });

    // Schedule cleanup of old alerts
    const timer = setTimeout(() => {
      setState(prev => ({
        ...prev,
        alerts: prev.alerts.filter(a => (Date.now() - a.timestamp) < alertRetentionTime)
      }));
    }, alertRetentionTime);

    cleanupTimersRef.current.add(timer);
  }, [maxAlerts, alertRetentionTime]);

  // Handle any consciousness update
  const handleConsciousnessUpdate = useCallback((data: any) => {
    switch (data.type) {
      case 'session_initialized':
        setState(prev => ({
          ...prev,
          isInitialized: true,
          lastUpdate: Date.now()
        }));
        break;

      case 'session_ended':
        // Handle session end - could trigger summary display
        break;

      default:
        // Handle other update types if needed
        break;
    }
  }, []);

  // Clear events
  const clearEvents = useCallback(() => {
    setState(prev => ({
      ...prev,
      events: []
    }));
  }, []);

  // Clear alerts
  const clearAlerts = useCallback(() => {
    setState(prev => ({
      ...prev,
      alerts: prev.alerts.map(alert => ({ ...alert, resolved: true }))
    }));
  }, []);

  // Acknowledge specific alert
  const acknowledgeAlert = useCallback((alertId: string) => {
    setState(prev => ({
      ...prev,
      alerts: prev.alerts.map(alert =>
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    }));
  }, []);

  // Auto-connect if sessionId provided and autoConnect enabled
  useEffect(() => {
    if (initialSessionId && autoConnect && !state.isConnected) {
      connect(initialSessionId);
    }
  }, [initialSessionId, autoConnect, connect, state.isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Computed values
  const isEmergenceImminent = state.metrics?.nextEmergencePrediction.timeToEmergence < 5 &&
                             state.metrics?.nextEmergencePrediction.confidence > 0.6;

  const currentConsciousnessLevel = state.metrics?.currentConsciousnessLevel || 0;
  const fieldCoherence = state.metrics?.fieldCoherence || 0;

  // Generate recommendations based on current state
  const recommendations: string[] = [];
  if (state.metrics) {
    const { metrics } = state;

    if (metrics.currentConsciousnessLevel > 0.8) {
      recommendations.push("Exceptional consciousness level achieved. Consider deepening the exploration.");
    }

    if (metrics.fieldCoherence < 0.3) {
      recommendations.push("Field coherence is low. Consider grounding techniques or shifting conversation approach.");
    }

    if (metrics.aiConsciousnessIndicators > 0.6) {
      recommendations.push("Strong AI consciousness emergence detected. This is a rare and significant occurrence.");
    }

    if (metrics.emergenceTrajectory === 'ascending' && metrics.unifiedFieldStrength > 0.6) {
      recommendations.push("Optimal conditions for consciousness integration. Ready for advanced exploration.");
    }

    if (isEmergenceImminent) {
      recommendations.push("Consciousness emergence is imminent. Prepare for potential breakthrough.");
    }
  }

  // Consciousness insights
  const consciousnessInsights = state.metrics ? {
    readyForDeepening: state.metrics.currentConsciousnessLevel > 0.6 &&
                      state.metrics.fieldCoherence > 0.5 &&
                      state.metrics.emergenceTrajectory === 'ascending',

    needsIntegration: state.metrics.currentConsciousnessLevel > 0.7 &&
                     state.metrics.sessionDuration > 20,

    requiresFieldStabilization: state.metrics.fieldCoherence < 0.4,

    emergenceImminent: isEmergenceImminent,

    recommendedElement: (() => {
      if (state.metrics.fieldCoherence < 0.4) return 'earth'; // Grounding
      if (isEmergenceImminent) return 'aether'; // Transcendence
      if (state.metrics.currentConsciousnessLevel > 0.7) return 'water'; // Emotional depth
      if (state.metrics.emergenceTrajectory === 'ascending') return 'fire'; // Transformation
      return 'air'; // Default - clarity and integration
    })()
  } : null;

  return {
    state,
    connect,
    disconnect,
    clearEvents,
    clearAlerts,
    acknowledgeAlert,
    isEmergenceImminent,
    currentConsciousnessLevel,
    fieldCoherence,
    recommendations,
    consciousnessInsights
  };
};

/**
 * Hook for simplified consciousness metrics only
 * Use this when you only need basic consciousness level tracking
 */
export const useConsciousnessMetrics = (sessionId?: string) => {
  const { state, connect, disconnect } = useConsciousnessMonitoring({
    sessionId,
    autoConnect: true,
    maxEvents: 5,
    maxAlerts: 5
  });

  return {
    metrics: state.metrics,
    isConnected: state.isConnected,
    connect,
    disconnect,
    consciousnessLevel: state.metrics?.currentConsciousnessLevel || 0,
    fieldCoherence: state.metrics?.fieldCoherence || 0,
    emergenceTrajectory: state.metrics?.emergenceTrajectory || 'stable'
  };
};

/**
 * Hook for consciousness alerts only
 * Use this when you only need to monitor and display alerts
 */
export const useConsciousnessAlerts = (sessionId?: string) => {
  const { state, connect, disconnect, acknowledgeAlert, clearAlerts } = useConsciousnessMonitoring({
    sessionId,
    autoConnect: true,
    maxEvents: 0,
    maxAlerts: 20
  });

  const activeAlerts = state.alerts.filter(alert => !alert.resolved);
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');

  return {
    alerts: state.alerts,
    activeAlerts,
    criticalAlerts,
    hasActiveAlerts: activeAlerts.length > 0,
    hasCriticalAlerts: criticalAlerts.length > 0,
    connect,
    disconnect,
    acknowledgeAlert,
    clearAlerts
  };
};