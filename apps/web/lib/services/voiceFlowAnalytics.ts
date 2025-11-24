/**
 * Voice Flow Analytics Service
 *
 * Analytics service for tracking voice interaction flows and conversion funnels
 */

export interface VoiceFlowEvent {
  event: string;
  userId?: string;
  properties?: Record<string, any>;
  timestamp: Date;
}

export interface VoiceFlowStep {
  step: string;
  timestamp: Date;
  duration?: number;
  success: boolean;
}

class VoiceFlowAnalytics {
  private events: VoiceFlowEvent[] = [];
  private flows: Map<string, VoiceFlowStep[]> = new Map();

  track(event: string, properties?: Record<string, any>, userId?: string): void {
    const voiceFlowEvent: VoiceFlowEvent = {
      event,
      userId,
      properties,
      timestamp: new Date()
    };

    this.events.push(voiceFlowEvent);
    console.log('Voice flow event tracked:', voiceFlowEvent);

    // In production, send to analytics service
    // this.sendToAnalytics(voiceFlowEvent);
  }

  startFlow(flowId: string, userId?: string): void {
    this.flows.set(flowId, []);
    this.track('voice_flow_start', { flowId }, userId);
  }

  trackStep(flowId: string, step: string, success: boolean, duration?: number, userId?: string): void {
    const flowSteps = this.flows.get(flowId) || [];
    flowSteps.push({
      step,
      timestamp: new Date(),
      duration,
      success
    });
    this.flows.set(flowId, flowSteps);

    this.track('voice_flow_step', { flowId, step, success, duration }, userId);
  }

  completeFlow(flowId: string, success: boolean, userId?: string): void {
    const flowSteps = this.flows.get(flowId) || [];
    const totalDuration = flowSteps.reduce((sum, step) => sum + (step.duration || 0), 0);

    this.track('voice_flow_complete', {
      flowId,
      success,
      totalDuration,
      stepCount: flowSteps.length
    }, userId);

    // Clean up flow data
    this.flows.delete(flowId);
  }

  trackVoicePermission(granted: boolean, userId?: string): void {
    this.track('voice_permission', { granted }, userId);
  }

  trackRecordingStart(provider: string, userId?: string): void {
    this.track('voice_recording_start', { provider }, userId);
  }

  trackRecordingEnd(duration: number, success: boolean, userId?: string, error?: string): void {
    this.track('voice_recording_end', { duration, success, error }, userId);
  }

  trackPlaybackStart(provider: string, userId?: string): void {
    this.track('voice_playback_start', { provider }, userId);
  }

  trackPlaybackEnd(duration: number, completed: boolean, userId?: string): void {
    this.track('voice_playback_end', { duration, completed }, userId);
  }

  getEvents(): VoiceFlowEvent[] {
    return [...this.events];
  }

  getEventsByUser(userId: string): VoiceFlowEvent[] {
    return this.events.filter(event => event.userId === userId);
  }

  getFlowAnalytics(flowId: string): {
    completionRate: number;
    averageDuration: number;
    dropoffPoints: Array<{ step: string; count: number }>;
  } {
    const flowEvents = this.events.filter(e => e.properties?.flowId === flowId);
    const started = flowEvents.filter(e => e.event === 'voice_flow_start').length;
    const completed = flowEvents.filter(e => e.event === 'voice_flow_complete' && e.properties?.success).length;

    const completions = flowEvents.filter(e => e.event === 'voice_flow_complete');
    const averageDuration = completions.length > 0
      ? completions.reduce((sum, e) => sum + (e.properties?.totalDuration || 0), 0) / completions.length
      : 0;

    // Calculate dropoff points
    const stepEvents = flowEvents.filter(e => e.event === 'voice_flow_step' && !e.properties?.success);
    const dropoffCounts = new Map<string, number>();

    stepEvents.forEach(e => {
      const step = e.properties?.step;
      if (step) {
        dropoffCounts.set(step, (dropoffCounts.get(step) || 0) + 1);
      }
    });

    const dropoffPoints = Array.from(dropoffCounts.entries())
      .map(([step, count]) => ({ step, count }))
      .sort((a, b) => b.count - a.count);

    return {
      completionRate: started > 0 ? completed / started : 0,
      averageDuration,
      dropoffPoints
    };
  }

  private async sendToAnalytics(event: VoiceFlowEvent): Promise<void> {
    // Mock analytics endpoint
    // In production, send to your analytics service
  }
}

export const voiceFlowAnalytics = new VoiceFlowAnalytics();

// Export individual tracking functions for convenience
export const startFlow = (flowId: string, userId?: string) =>
  voiceFlowAnalytics.startFlow(flowId, userId);

export const trackStep = (flowId: string, step: string, success: boolean, duration?: number, userId?: string) =>
  voiceFlowAnalytics.trackStep(flowId, step, success, duration, userId);

export const completeFlow = (flowId: string, success: boolean, userId?: string) =>
  voiceFlowAnalytics.completeFlow(flowId, success, userId);

export const trackVoicePermission = (granted: boolean, userId?: string) =>
  voiceFlowAnalytics.trackVoicePermission(granted, userId);

export const trackRecordingStart = (provider: string, userId?: string) =>
  voiceFlowAnalytics.trackRecordingStart(provider, userId);

export const trackRecordingEnd = (duration: number, success: boolean, userId?: string, error?: string) =>
  voiceFlowAnalytics.trackRecordingEnd(duration, success, userId, error);

export const trackPlaybackStart = (provider: string, userId?: string) =>
  voiceFlowAnalytics.trackPlaybackStart(provider, userId);

export const trackPlaybackEnd = (duration: number, completed: boolean, userId?: string) =>
  voiceFlowAnalytics.trackPlaybackEnd(duration, completed, userId);

export default voiceFlowAnalytics;