/**
 * Calendar Consciousness Integration for MAIA-SOVEREIGN
 *
 * Bridges Apple Calendar with MAIA's consciousness systems:
 * - Injects schedule context into Oracle conversations
 * - Enables timing-aware guidance
 * - Correlates busyness with consciousness states
 *
 * Usage in Oracle:
 *   const scheduleContext = await calendarIntegration.getOracleContext(userId);
 *   // MAIA can now reference user's schedule for timing advice
 */

import { EventEmitter } from 'events';
import {
  getCalendarAdapter,
  type UpcomingContext,
  type DaySchedule,
  type TimeBlock,
} from '../adapters/CalendarAdapter';
import { getMCPClientManager } from '../MCPClientManager';

export interface OracleScheduleContext {
  available: boolean;
  currentStatus?: 'free' | 'in_meeting' | 'upcoming_soon' | 'packed_day';
  timeContext?: string;
  suggestedTiming?: string;
  todaySummary?: string;
  weekOutlook?: string;
  deepWorkOpportunity?: boolean;
  lastUpdated?: Date;
}

export interface TimingGuidance {
  isGoodTime: boolean;
  reason: string;
  suggestedDuration?: number; // minutes
  alternativeWindow?: TimeBlock;
  nextFreeBlock?: TimeBlock;
}

export interface ScheduleAwarenessEvent {
  type: 'upcoming_event' | 'free_window' | 'busy_period' | 'schedule_shift';
  description: string;
  timing: Date;
  relevance: 'high' | 'medium' | 'low';
}

/**
 * Calendar Consciousness Integration
 * Connects schedule awareness with MAIA's guidance
 */
export class CalendarConsciousnessIntegration extends EventEmitter {
  private adapter = getCalendarAdapter();
  private manager = getMCPClientManager();
  private calendarConnected = false;

  constructor() {
    super();
  }

  /**
   * Initialize the integration
   */
  async initialize(): Promise<boolean> {
    try {
      await this.manager.initialize();

      if (!this.manager.isConnected('calendar')) {
        console.log('[CalendarIntegration] Calendar MCP not connected');
        return false;
      }

      this.calendarConnected = true;
      console.log('[CalendarIntegration] Calendar MCP connected');

      return true;
    } catch (error) {
      console.error('[CalendarIntegration] Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Get context for Oracle conversations
   * Main method for enriching MAIA's responses with schedule awareness
   */
  async getOracleContext(userId: string): Promise<OracleScheduleContext> {
    if (!this.manager.isConnected('calendar')) {
      return { available: false };
    }

    try {
      const upcomingContext = await this.adapter.getUpcomingContext();
      const deepWorkCheck = await this.adapter.isGoodTimeForDeepWork();

      // Determine current status
      const currentStatus = this.determineCurrentStatus(upcomingContext);

      // Generate natural language context
      const timeContext = this.generateTimeContext(upcomingContext, deepWorkCheck);
      const suggestedTiming = this.generateTimingSuggestion(upcomingContext, deepWorkCheck);
      const todaySummary = this.generateTodaySummary(upcomingContext);
      const weekOutlook = this.generateWeekOutlook(upcomingContext);

      return {
        available: true,
        currentStatus,
        timeContext,
        suggestedTiming,
        todaySummary,
        weekOutlook,
        deepWorkOpportunity: deepWorkCheck.isGood,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('[CalendarIntegration] Failed to get context:', error);
      return { available: false };
    }
  }

  /**
   * Get timing guidance for a specific activity
   * Useful for suggesting optimal times for practices
   */
  async getTimingGuidance(
    activityType: 'meditation' | 'journaling' | 'deep_work' | 'reflection' | 'conversation'
  ): Promise<TimingGuidance> {
    const deepWorkCheck = await this.adapter.isGoodTimeForDeepWork();
    const upcomingContext = await this.adapter.getUpcomingContext();
    const daySchedule = await this.adapter.getDaySchedule();

    // Duration requirements by activity
    const durationNeeds: Record<string, number> = {
      meditation: 15,
      journaling: 20,
      deep_work: 60,
      reflection: 30,
      conversation: 45,
    };

    const neededMinutes = durationNeeds[activityType] || 30;

    // Check if we have enough time now
    if (upcomingContext.timeUntilNext === undefined || upcomingContext.timeUntilNext >= neededMinutes) {
      return {
        isGoodTime: true,
        reason: deepWorkCheck.reason,
        suggestedDuration: Math.min(
          neededMinutes,
          upcomingContext.timeUntilNext || neededMinutes
        ),
        nextFreeBlock: deepWorkCheck.nextWindow,
      };
    }

    // Find next suitable window
    const suitableBlock = daySchedule.freeBlocks.find(
      b => b.duration >= neededMinutes && new Date(b.start) > new Date()
    );

    return {
      isGoodTime: false,
      reason: `Only ${upcomingContext.timeUntilNext} minutes until "${upcomingContext.nextEvent?.title}"`,
      suggestedDuration: neededMinutes,
      alternativeWindow: suitableBlock,
      nextFreeBlock: suitableBlock,
    };
  }

  /**
   * Get schedule-aware suggestions for session approach
   * Helps MAIA calibrate depth of engagement
   */
  async getSessionApproach(): Promise<{
    approach: 'brief' | 'focused' | 'deep' | 'quick_check';
    reason: string;
    timeAvailable: number;
  }> {
    const upcomingContext = await this.adapter.getUpcomingContext();
    const timeAvailable = upcomingContext.timeUntilNext || 120; // Default 2 hours if nothing scheduled

    if (timeAvailable < 10) {
      return {
        approach: 'quick_check',
        reason: 'Very limited time before next commitment',
        timeAvailable,
      };
    }

    if (timeAvailable < 30) {
      return {
        approach: 'brief',
        reason: 'Short window - good for quick reflection or check-in',
        timeAvailable,
      };
    }

    if (timeAvailable < 60) {
      return {
        approach: 'focused',
        reason: 'Moderate time available for meaningful exploration',
        timeAvailable,
      };
    }

    return {
      approach: 'deep',
      reason: 'Extended time available for deep work or exploration',
      timeAvailable,
    };
  }

  /**
   * Check if schedule supports a consciousness practice
   * For practices that benefit from uninterrupted time
   */
  async canSupportPractice(
    practiceType: string,
    requiredMinutes: number
  ): Promise<{
    supported: boolean;
    reason: string;
    optimalWindow?: TimeBlock;
  }> {
    const daySchedule = await this.adapter.getDaySchedule();
    const now = new Date();

    // Find immediate window
    const immediateBlock = daySchedule.freeBlocks.find(
      b =>
        new Date(b.start) <= now &&
        new Date(b.end) > now &&
        b.duration >= requiredMinutes
    );

    if (immediateBlock) {
      const remainingMinutes = Math.round(
        (new Date(immediateBlock.end).getTime() - now.getTime()) / (1000 * 60)
      );
      return {
        supported: true,
        reason: `${remainingMinutes} minutes available now`,
        optimalWindow: immediateBlock,
      };
    }

    // Find future window
    const futureBlock = daySchedule.freeBlocks.find(
      b => new Date(b.start) > now && b.duration >= requiredMinutes
    );

    if (futureBlock) {
      const startsIn = Math.round(
        (new Date(futureBlock.start).getTime() - now.getTime()) / (1000 * 60)
      );
      const startTime = new Date(futureBlock.start).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
      return {
        supported: false,
        reason: `Next suitable window starts in ${startsIn} minutes (${startTime})`,
        optimalWindow: futureBlock,
      };
    }

    return {
      supported: false,
      reason: `No ${requiredMinutes}+ minute blocks available today`,
    };
  }

  /**
   * Generate schedule awareness events for consciousness tracking
   */
  async generateAwarenessEvents(): Promise<ScheduleAwarenessEvent[]> {
    const events: ScheduleAwarenessEvent[] = [];
    const upcomingContext = await this.adapter.getUpcomingContext();
    const now = new Date();

    // Upcoming event alert
    if (upcomingContext.nextEvent && upcomingContext.timeUntilNext !== undefined) {
      if (upcomingContext.timeUntilNext <= 15) {
        events.push({
          type: 'upcoming_event',
          description: `"${upcomingContext.nextEvent.title}" starts in ${upcomingContext.timeUntilNext} minutes`,
          timing: new Date(upcomingContext.nextEvent.startTime),
          relevance: 'high',
        });
      } else if (upcomingContext.timeUntilNext <= 60) {
        events.push({
          type: 'upcoming_event',
          description: `"${upcomingContext.nextEvent.title}" in ${upcomingContext.timeUntilNext} minutes`,
          timing: new Date(upcomingContext.nextEvent.startTime),
          relevance: 'medium',
        });
      }
    }

    // Free window opportunities
    const deepWorkCheck = await this.adapter.isGoodTimeForDeepWork();
    if (deepWorkCheck.isGood && deepWorkCheck.nextWindow) {
      events.push({
        type: 'free_window',
        description: `Good time for focused work: ${deepWorkCheck.reason}`,
        timing: now,
        relevance: 'medium',
      });
    }

    // Busy period alerts
    if (upcomingContext.weekBusyness === 'busy') {
      events.push({
        type: 'busy_period',
        description: 'This week is quite busy - consider protecting recovery time',
        timing: now,
        relevance: 'low',
      });
    }

    return events;
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private determineCurrentStatus(context: UpcomingContext): OracleScheduleContext['currentStatus'] {
    if (!context.timeUntilNext) {
      return 'free';
    }

    if (context.timeUntilNext <= 10) {
      return 'upcoming_soon';
    }

    if (context.todayRemaining.length > 5) {
      return 'packed_day';
    }

    return 'free';
  }

  private generateTimeContext(
    context: UpcomingContext,
    deepWorkCheck: { isGood: boolean; reason: string }
  ): string {
    const parts: string[] = [];

    if (context.nextEvent && context.timeUntilNext !== undefined) {
      if (context.timeUntilNext <= 15) {
        parts.push(`User has "${context.nextEvent.title}" starting very soon (${context.timeUntilNext} min).`);
      } else if (context.timeUntilNext <= 60) {
        parts.push(`User has "${context.nextEvent.title}" coming up in ${context.timeUntilNext} minutes.`);
      } else {
        parts.push(`Next commitment is "${context.nextEvent.title}" in ${Math.round(context.timeUntilNext / 60)} hours.`);
      }
    } else {
      parts.push('User has no upcoming events scheduled.');
    }

    if (deepWorkCheck.isGood) {
      parts.push('Good time for focused work or deeper exploration.');
    }

    return parts.join(' ');
  }

  private generateTimingSuggestion(
    context: UpcomingContext,
    deepWorkCheck: { isGood: boolean; reason: string }
  ): string {
    if (!context.timeUntilNext || context.timeUntilNext > 120) {
      return 'No time pressure - can explore topics in depth.';
    }

    if (context.timeUntilNext < 15) {
      return 'Very limited time - keep responses focused and actionable.';
    }

    if (context.timeUntilNext < 45) {
      return 'Moderate time available - balance depth with efficiency.';
    }

    return 'Good window for meaningful exploration.';
  }

  private generateTodaySummary(context: UpcomingContext): string {
    const remaining = context.todayRemaining.length;

    if (remaining === 0) {
      return 'No more events today - open schedule.';
    }

    if (remaining === 1) {
      return `One more event today: "${context.todayRemaining[0].title}".`;
    }

    return `${remaining} more events today.`;
  }

  private generateWeekOutlook(context: UpcomingContext): string {
    switch (context.weekBusyness) {
      case 'light':
        return 'Light week ahead - good opportunity for deeper work.';
      case 'moderate':
        return 'Balanced week with reasonable availability.';
      case 'busy':
        return 'Busy week - may need to be intentional about downtime.';
      default:
        return '';
    }
  }

  /**
   * Check if calendar access is available
   */
  isAvailable(): boolean {
    return this.manager.isConnected('calendar') && this.calendarConnected;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.removeAllListeners();
  }
}

// Singleton instance
let instance: CalendarConsciousnessIntegration | null = null;

export function getCalendarConsciousnessIntegration(): CalendarConsciousnessIntegration {
  if (!instance) {
    instance = new CalendarConsciousnessIntegration();
  }
  return instance;
}

export function resetCalendarConsciousnessIntegration(): void {
  if (instance) {
    instance.dispose();
    instance = null;
  }
}
