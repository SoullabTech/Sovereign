/**
 * Onboarding Tracker Service
 *
 * Analytics service for tracking user onboarding progress and conversion
 */

export interface OnboardingEvent {
  event: string;
  userId?: string;
  properties?: Record<string, any>;
  timestamp: Date;
}

class OnboardingTracker {
  private events: OnboardingEvent[] = [];

  track(event: string, properties?: Record<string, any>, userId?: string): void {
    const onboardingEvent: OnboardingEvent = {
      event,
      userId,
      properties,
      timestamp: new Date()
    };

    this.events.push(onboardingEvent);
    console.log('Onboarding event tracked:', onboardingEvent);

    // In production, send to analytics service
    // this.sendToAnalytics(onboardingEvent);
  }

  trackStep(step: string, completed: boolean, userId?: string, properties?: Record<string, any>): void {
    this.track('onboarding_step', { step, completed, ...properties }, userId);
  }

  trackCompletion(userId?: string, duration?: number): void {
    this.track('onboarding_completed', { duration }, userId);
  }

  trackDropoff(step: string, reason?: string, userId?: string): void {
    this.track('onboarding_dropoff', { step, reason }, userId);
  }

  trackSkip(step: string, userId?: string): void {
    this.track('onboarding_skip', { step }, userId);
  }

  trackReturnUser(userId?: string): void {
    this.track('onboarding_return', {}, userId);
  }

  getEvents(): OnboardingEvent[] {
    return [...this.events];
  }

  getEventsByUser(userId: string): OnboardingEvent[] {
    return this.events.filter(event => event.userId === userId);
  }

  getCompletionRate(): number {
    const completed = this.events.filter(e => e.event === 'onboarding_completed').length;
    const started = this.events.filter(e => e.event === 'onboarding_step' && e.properties?.step === 'start').length;
    return started > 0 ? completed / started : 0;
  }

  private async sendToAnalytics(event: OnboardingEvent): Promise<void> {
    // Mock analytics endpoint
    // In production, send to your analytics service
  }
}

export const onboardingTracker = new OnboardingTracker();

// Export individual tracking functions for convenience
export const trackStep = (step: string, completed: boolean, userId?: string, properties?: Record<string, any>) =>
  onboardingTracker.trackStep(step, completed, userId, properties);

export const trackCompletion = (userId?: string, duration?: number) =>
  onboardingTracker.trackCompletion(userId, duration);

export const trackDropoff = (step: string, reason?: string, userId?: string) =>
  onboardingTracker.trackDropoff(step, reason, userId);

export const trackSkip = (step: string, userId?: string) =>
  onboardingTracker.trackSkip(step, userId);

export const trackReturnUser = (userId?: string) =>
  onboardingTracker.trackReturnUser(userId);

export default onboardingTracker;