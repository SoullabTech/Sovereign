/**
 * Uizard Metrics Component
 *
 * Analytics component for tracking UI/UX metrics and user interaction patterns
 */

'use client';

import { useState, useEffect } from 'react';
import { eventTracking } from '@/lib/services/eventTracking';

export interface UizardMetrics {
  interactionCount: number;
  sessionDuration: number;
  clickThroughRate: number;
  bounceRate: number;
  userFlowCompletion: number;
}

export interface UizardMetricsProps {
  userId?: string;
  sessionId?: string;
  trackingEnabled?: boolean;
}

export function UizardMetricsProvider({
  userId,
  sessionId,
  trackingEnabled = true,
  children
}: UizardMetricsProps & { children: React.ReactNode }) {
  const [metrics, setMetrics] = useState<UizardMetrics>({
    interactionCount: 0,
    sessionDuration: 0,
    clickThroughRate: 0,
    bounceRate: 0,
    userFlowCompletion: 0
  });

  useEffect(() => {
    if (!trackingEnabled) return;

    const startTime = Date.now();

    const trackInteraction = () => {
      setMetrics(prev => ({
        ...prev,
        interactionCount: prev.interactionCount + 1
      }));

      if (userId) {
        eventTracking.track('ui_interaction', {
          sessionId,
          timestamp: Date.now() - startTime
        }, userId);
      }
    };

    // Track clicks and interactions
    document.addEventListener('click', trackInteraction);
    document.addEventListener('keydown', trackInteraction);

    // Track session duration
    const durationInterval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        sessionDuration: Date.now() - startTime
      }));
    }, 1000);

    return () => {
      document.removeEventListener('click', trackInteraction);
      document.removeEventListener('keydown', trackInteraction);
      clearInterval(durationInterval);
    };
  }, [userId, sessionId, trackingEnabled]);

  return (
    <div data-uizard-metrics="true">
      {children}
    </div>
  );
}

export function trackUIEvent(event: string, properties?: Record<string, any>, userId?: string) {
  if (typeof window !== 'undefined') {
    eventTracking.track(`ui_${event}`, {
      url: window.location.pathname,
      timestamp: Date.now(),
      ...properties
    }, userId);
  }
}

export function trackUserFlow(flowName: string, step: string, userId?: string) {
  eventTracking.track('user_flow', {
    flowName,
    step,
    timestamp: Date.now()
  }, userId);
}

export function trackConversion(conversionType: string, value?: number, userId?: string) {
  eventTracking.track('conversion', {
    type: conversionType,
    value,
    timestamp: Date.now()
  }, userId);
}

// Hook for using metrics in components
export function useUizardMetrics() {
  const [metrics, setMetrics] = useState<UizardMetrics>({
    interactionCount: 0,
    sessionDuration: 0,
    clickThroughRate: 0,
    bounceRate: 0,
    userFlowCompletion: 0
  });

  const trackEvent = (event: string, properties?: Record<string, any>) => {
    trackUIEvent(event, properties);
  };

  const trackFlow = (flowName: string, step: string) => {
    trackUserFlow(flowName, step);
  };

  return {
    metrics,
    trackEvent,
    trackFlow,
    trackConversion
  };
}

// Legacy alias for backwards compatibility
export const useUizardTracking = useUizardMetrics;

export default UizardMetricsProvider;