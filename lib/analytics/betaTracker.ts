/**
 * Beta Tracker - Analytics stub for beta testing
 */

export const betaTracker = {
  trackEvent: (eventName: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('📊 [BetaTracker]', eventName, properties);
    }
  },

  trackPageView: (pageName: string) => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('📄 [BetaTracker] Page view:', pageName);
    }
  },

  trackUser: (userId: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('👤 [BetaTracker] User:', userId, properties);
    }
  }
};
