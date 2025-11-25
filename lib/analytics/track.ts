/**
 * Analytics tracking module
 * Placeholder for future analytics integration
 */

export function track(event: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  // Future: Integrate with analytics service (PostHog, Mixpanel, etc.)
  console.log('[Analytics]', event, properties);
}

// Enhanced trackEvent with method helpers
export const trackEvent = Object.assign(track, {
  apiCall: (endpoint: string, duration: number, success: boolean) => {
    track('api_call', { endpoint, duration, success });
  },
  error: (userId: string, errorType: string, errorMessage: string) => {
    track('error', { userId, errorType, errorMessage });
  },
  voiceResult: (userId: string, transcript: string, duration: number) => {
    track('voice_result', { userId, transcript, duration });
  },
  ttsSpoken: (userId: string, text: string, duration: number) => {
    track('tts_spoken', { userId, text, duration });
  }
});

export function identify(userId: string, traits?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  // Future: Integrate with analytics service
  console.log('[Analytics] Identify', userId, traits);
}

export function page(name: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  // Future: Integrate with analytics service
  console.log('[Analytics] Page', name, properties);
}
