/**
 * Onboarding Tracker - Analytics for user onboarding flow
 */

export const onboardingTracker = {
  trackStep: (step: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('📋 [OnboardingTracker]', step, properties);
    }
  },

  trackComplete: (userId: string) => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('✅ [OnboardingTracker] Complete:', userId);
    }
  }
};
