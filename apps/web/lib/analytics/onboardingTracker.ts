// Onboarding tracking analytics
export const onboardingTracker = {
  trackStep: (step: string, data?: any) => {
    console.log('Onboarding Step:', step, data);
  },
  trackCompletion: (userId: string) => {
    console.log('Onboarding Complete:', userId);
  }
};