'use client';

/**
 * Event tracking for analytics - Sacred consciousness tracking
 */

interface AudioUnlockData {
  error?: string;
  errorStack?: string;
  contextState?: string;
  sampleRate?: number;
  timestamp?: number;
}

/**
 * Track audio unlock events for monitoring sacred audio experiences
 */
export async function trackAudioUnlock(
  success: boolean,
  data: AudioUnlockData = {}
): Promise<void> {
  try {
    // For now, we'll just log to console in development
    // In the future, this could send to analytics service
    const eventData = {
      event: 'audio_unlock',
      success,
      ...data,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
      timestamp: data.timestamp || Date.now()
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 [Analytics] Audio unlock tracked:', eventData);
    }

    // Future: Send to analytics service
    // await analyticsService.track(eventData);

  } catch (error) {
    // Fail silently to not break audio functionality
    console.warn('⚠️ [Analytics] Failed to track audio unlock:', error);
  }
}

/**
 * Track general events - placeholder for future analytics
 */
export async function trackEvent(
  eventName: string,
  properties: Record<string, any> = {}
): Promise<void> {
  try {
    const eventData = {
      event: eventName,
      ...properties,
      timestamp: Date.now(),
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server'
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 [Analytics] Event tracked:', eventData);
    }

    // Future: Send to analytics service
    // await analyticsService.track(eventData);

  } catch (error) {
    console.warn('⚠️ [Analytics] Failed to track event:', error);
  }
}

/**
 * Track user interactions with sacred interface elements
 */
export async function trackInteraction(
  element: string,
  action: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  return trackEvent(`interaction_${element}_${action}`, metadata);
}

/**
 * Track consciousness journey milestones
 */
export async function trackJourneyMilestone(
  milestone: string,
  data: Record<string, any> = {}
): Promise<void> {
  return trackEvent(`journey_milestone`, { milestone, ...data });
}

/**
 * Main event tracking object for unified interface
 */
export const eventTracking = {
  trackAudioUnlock,
  trackEvent,
  trackInteraction,
  trackJourneyMilestone
};
