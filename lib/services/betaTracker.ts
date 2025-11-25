/**
 * Beta Tracker Service
 *
 * Analytics service for tracking beta user behavior and feedback
 */

export interface BetaEvent {
  event: string;
  userId?: string;
  properties?: Record<string, any>;
  timestamp: Date;
}

class BetaTracker {
  private events: BetaEvent[] = [];

  track(event: string, properties?: Record<string, any>, userId?: string): void {
    const betaEvent: BetaEvent = {
      event,
      userId,
      properties,
      timestamp: new Date()
    };

    this.events.push(betaEvent);
    console.log('Beta event tracked:', betaEvent);

    // In production, send to analytics service
    // this.sendToAnalytics(betaEvent);
  }

  trackFeatureUsage(feature: string, userId?: string, properties?: Record<string, any>): void {
    this.track('beta_feature_usage', { feature, ...properties }, userId);
  }

  trackFeedback(type: string, content: string, userId?: string): void {
    this.track('beta_feedback', { type, content }, userId);
  }

  trackError(error: string, context?: string, userId?: string): void {
    this.track('beta_error', { error, context }, userId);
  }

  trackOnboarding(step: string, completed: boolean, userId?: string): void {
    this.track('beta_onboarding', { step, completed }, userId);
  }

  getEvents(): BetaEvent[] {
    return [...this.events];
  }

  getEventsByUser(userId: string): BetaEvent[] {
    return this.events.filter(event => event.userId === userId);
  }

  private async sendToAnalytics(event: BetaEvent): Promise<void> {
    // Mock analytics endpoint
    // In production, send to your analytics service
  }
}

export const betaTracker = new BetaTracker();

// Export individual tracking functions for convenience
export const trackFeatureUsage = (feature: string, userId?: string, properties?: Record<string, any>) =>
  betaTracker.trackFeatureUsage(feature, userId, properties);

export const trackFeedback = (type: string, content: string, userId?: string) =>
  betaTracker.trackFeedback(type, content, userId);

export const trackError = (error: string, context?: string, userId?: string) =>
  betaTracker.trackError(error, context, userId);

export const trackOnboarding = (step: string, completed: boolean, userId?: string) =>
  betaTracker.trackOnboarding(step, completed, userId);

export default betaTracker;