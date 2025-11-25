/**
 * Event Tracking Service
 *
 * Centralized analytics and event tracking for MAIA system
 */

export interface TrackingEvent {
  event: string;
  userId?: string;
  properties?: Record<string, any>;
  timestamp: Date;
}

class EventTrackingService {
  private events: TrackingEvent[] = [];

  track(event: string, properties?: Record<string, any>, userId?: string): void {
    const trackingEvent: TrackingEvent = {
      event,
      userId,
      properties,
      timestamp: new Date()
    };

    this.events.push(trackingEvent);
    console.log('Event tracked:', trackingEvent);

    // In production, send to analytics service
    // this.sendToAnalytics(trackingEvent);
  }

  trackAudioUnlock(userId?: string): void {
    this.track('audio_unlock', { action: 'user_gesture' }, userId);
  }

  trackVoiceRecording(userId?: string, duration?: number): void {
    this.track('voice_recording', { duration }, userId);
  }

  trackJournalEntry(mode: string, userId?: string): void {
    this.track('journal_entry', { mode }, userId);
  }

  trackElderCouncilSelection(tradition: string, userId?: string): void {
    this.track('elder_council_selection', { tradition }, userId);
  }

  getEvents(): TrackingEvent[] {
    return [...this.events];
  }

  getEventsByUser(userId: string): TrackingEvent[] {
    return this.events.filter(event => event.userId === userId);
  }

  private async sendToAnalytics(event: TrackingEvent): Promise<void> {
    // Mock analytics endpoint
    // In production, send to your analytics service
  }
}

export const eventTracking = new EventTrackingService();

// Export individual tracking functions for convenience
export const trackAudioUnlock = (userId?: string) => eventTracking.trackAudioUnlock(userId);
export const trackVoiceRecording = (userId?: string, duration?: number) => eventTracking.trackVoiceRecording(userId, duration);
export const trackJournalEntry = (mode: string, userId?: string) => eventTracking.trackJournalEntry(mode, userId);
export const trackElderCouncilSelection = (tradition: string, userId?: string) => eventTracking.trackElderCouncilSelection(tradition, userId);

export default eventTracking;