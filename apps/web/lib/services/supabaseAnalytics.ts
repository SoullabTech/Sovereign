/**
 * Supabase Analytics Service
 *
 * Analytics service for tracking events with Supabase backend
 */

export interface AnalyticsEvent {
  event: string;
  userId?: string;
  properties?: Record<string, any>;
  timestamp: Date;
}

class SupabaseAnalytics {
  private events: AnalyticsEvent[] = [];

  track(event: string, properties?: Record<string, any>, userId?: string): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      userId,
      properties,
      timestamp: new Date()
    };

    this.events.push(analyticsEvent);
    console.log('Supabase Analytics tracked:', analyticsEvent);

    // In production, send to Supabase
    // this.sendToSupabase(analyticsEvent);
  }

  trackVoiceInteraction(type: 'start' | 'stop' | 'error', userId?: string, properties?: Record<string, any>): void {
    this.track('voice_interaction', { type, ...properties }, userId);
  }

  trackJournalAction(action: string, userId?: string, properties?: Record<string, any>): void {
    this.track('journal_action', { action, ...properties }, userId);
  }

  trackOracleConsultation(type: string, userId?: string, properties?: Record<string, any>): void {
    this.track('oracle_consultation', { type, ...properties }, userId);
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  getEventsByUser(userId: string): AnalyticsEvent[] {
    return this.events.filter(event => event.userId === userId);
  }

  private async sendToSupabase(event: AnalyticsEvent): Promise<void> {
    // Mock Supabase endpoint
    // In production, send to your Supabase analytics table
  }
}

export const Analytics = new SupabaseAnalytics();

// Export individual tracking functions for convenience
export const trackVoiceInteraction = (type: 'start' | 'stop' | 'error', userId?: string, properties?: Record<string, any>) =>
  Analytics.trackVoiceInteraction(type, userId, properties);

export const trackJournalAction = (action: string, userId?: string, properties?: Record<string, any>) =>
  Analytics.trackJournalAction(action, userId, properties);

export const trackOracleConsultation = (type: string, userId?: string, properties?: Record<string, any>) =>
  Analytics.trackOracleConsultation(type, userId, properties);

export default Analytics;