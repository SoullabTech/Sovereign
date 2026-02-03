/**
 * Calendar MCP Adapter for MAIA-SOVEREIGN
 *
 * Provides access to Apple Calendar via MCP protocol.
 * Enables MAIA to understand user's schedule and life rhythm.
 *
 * Key capabilities:
 * - Read upcoming events
 * - Understand daily/weekly patterns
 * - Detect busy vs. available periods
 * - Timing awareness for suggestions
 *
 * Uses: Apple Calendars MCP Server
 * https://www.pulsemcp.com/servers/apple-calendars
 */

import { EventEmitter } from 'events';
import type { MCPToolResult, CalendarEvent } from '../types';
import { getMCPClientManager } from '../MCPClientManager';

export interface DaySchedule {
  date: Date;
  events: CalendarEvent[];
  busyHours: number;
  freeBlocks: TimeBlock[];
  pattern: 'light' | 'moderate' | 'busy' | 'packed';
}

export interface TimeBlock {
  start: Date;
  end: Date;
  duration: number; // minutes
  type: 'free' | 'buffer' | 'focus';
}

export interface WeekOverview {
  startDate: Date;
  endDate: Date;
  totalEvents: number;
  busiestDay: string;
  lightestDay: string;
  averageBusyHours: number;
  days: DaySchedule[];
}

export interface UpcomingContext {
  nextEvent?: CalendarEvent;
  timeUntilNext?: number; // minutes
  todayRemaining: CalendarEvent[];
  tomorrowPreview: CalendarEvent[];
  weekBusyness: 'light' | 'moderate' | 'busy';
}

/**
 * Calendar MCP Adapter
 * Provides schedule-aware context for MAIA
 */
export class CalendarAdapter extends EventEmitter {
  private manager = getMCPClientManager();
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private cacheTimeout = 60000; // 1 minute

  constructor() {
    super();
  }

  /**
   * Check if Calendar MCP is connected
   */
  isConnected(): boolean {
    return this.manager.isConnected('calendar');
  }

  /**
   * Get available tools from the Calendar MCP server
   */
  async getAvailableTools(): Promise<string[]> {
    const allTools = this.manager.getAllTools();
    const calendarTools = allTools.get('calendar');
    return calendarTools?.map(t => t.name) || [];
  }

  // ============================================================================
  // Event Operations
  // ============================================================================

  /**
   * Get events for a specific date range
   */
  async getEvents(
    startDate: Date,
    endDate: Date,
    calendars?: string[]
  ): Promise<CalendarEvent[]> {
    const cacheKey = `events_${startDate.toISOString()}_${endDate.toISOString()}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached as CalendarEvent[];

    try {
      const result = await this.manager.callTool('calendar', {
        name: 'get_events',
        arguments: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          calendars,
        },
      });

      const events = this.parseEventsResult(result);
      this.setCache(cacheKey, events);
      this.emit('eventsLoaded', events);
      return events;
    } catch (error) {
      console.error('[CalendarAdapter] Failed to get events:', error);
      return [];
    }
  }

  /**
   * Get today's events
   */
  async getTodayEvents(): Promise<CalendarEvent[]> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    return this.getEvents(startOfDay, endOfDay);
  }

  /**
   * Get upcoming events (next N hours)
   */
  async getUpcomingEvents(hours: number = 24): Promise<CalendarEvent[]> {
    const now = new Date();
    const endTime = new Date(now.getTime() + hours * 60 * 60 * 1000);

    const events = await this.getEvents(now, endTime);
    return events.filter(e => new Date(e.startTime) >= now);
  }

  /**
   * Get week's events
   */
  async getWeekEvents(startFromToday: boolean = true): Promise<CalendarEvent[]> {
    const now = new Date();
    let startDate: Date;

    if (startFromToday) {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else {
      // Start from Monday
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(now.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
    }

    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    return this.getEvents(startDate, endDate);
  }

  // ============================================================================
  // Schedule Analysis (for consciousness context)
  // ============================================================================

  /**
   * Get day schedule with analysis
   */
  async getDaySchedule(date: Date = new Date()): Promise<DaySchedule> {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const events = await this.getEvents(startOfDay, endOfDay);
    const busyHours = this.calculateBusyHours(events);
    const freeBlocks = this.findFreeBlocks(events, startOfDay, endOfDay);
    const pattern = this.categorizeDay(busyHours, events.length);

    return {
      date: startOfDay,
      events,
      busyHours,
      freeBlocks,
      pattern,
    };
  }

  /**
   * Get week overview for timing context
   */
  async getWeekOverview(): Promise<WeekOverview> {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const events = await this.getEvents(startDate, endDate);

    // Group by day
    const days: DaySchedule[] = [];
    let totalBusyHours = 0;
    let busiestDay = '';
    let busiestHours = 0;
    let lightestDay = '';
    let lightestHours = Infinity;

    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayEvents = events.filter(e => {
        const eventStart = new Date(e.startTime);
        return eventStart >= dayStart && eventStart < dayEnd;
      });

      const busyHours = this.calculateBusyHours(dayEvents);
      totalBusyHours += busyHours;

      const dayName = dayStart.toLocaleDateString('en-US', { weekday: 'long' });

      if (busyHours > busiestHours) {
        busiestHours = busyHours;
        busiestDay = dayName;
      }
      if (busyHours < lightestHours) {
        lightestHours = busyHours;
        lightestDay = dayName;
      }

      days.push({
        date: dayStart,
        events: dayEvents,
        busyHours,
        freeBlocks: this.findFreeBlocks(dayEvents, dayStart, dayEnd),
        pattern: this.categorizeDay(busyHours, dayEvents.length),
      });
    }

    return {
      startDate,
      endDate,
      totalEvents: events.length,
      busiestDay: busiestDay || 'Unknown',
      lightestDay: lightestDay || 'Unknown',
      averageBusyHours: totalBusyHours / 7,
      days,
    };
  }

  /**
   * Get upcoming context for Oracle
   * Main method for consciousness integration
   */
  async getUpcomingContext(): Promise<UpcomingContext> {
    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const tomorrowEnd = new Date(todayEnd.getTime() + 24 * 60 * 60 * 1000);

    // Get today and tomorrow events
    const todayEvents = await this.getEvents(now, todayEnd);
    const tomorrowEvents = await this.getEvents(todayEnd, tomorrowEnd);
    const weekOverview = await this.getWeekOverview();

    // Find next event
    const upcomingEvents = todayEvents.filter(e => new Date(e.startTime) > now);
    const nextEvent = upcomingEvents[0];

    let timeUntilNext: number | undefined;
    if (nextEvent) {
      timeUntilNext = Math.round(
        (new Date(nextEvent.startTime).getTime() - now.getTime()) / (1000 * 60)
      );
    }

    // Determine week busyness
    let weekBusyness: 'light' | 'moderate' | 'busy';
    if (weekOverview.averageBusyHours < 3) {
      weekBusyness = 'light';
    } else if (weekOverview.averageBusyHours < 6) {
      weekBusyness = 'moderate';
    } else {
      weekBusyness = 'busy';
    }

    return {
      nextEvent,
      timeUntilNext,
      todayRemaining: upcomingEvents,
      tomorrowPreview: tomorrowEvents.slice(0, 3),
      weekBusyness,
    };
  }

  /**
   * Check if now is a good time for deep work
   */
  async isGoodTimeForDeepWork(): Promise<{
    isGood: boolean;
    reason: string;
    nextWindow?: TimeBlock;
  }> {
    const context = await this.getUpcomingContext();
    const now = new Date();

    // Check if there's an event starting soon (within 30 min)
    if (context.timeUntilNext !== undefined && context.timeUntilNext < 30) {
      return {
        isGood: false,
        reason: `Event "${context.nextEvent?.title}" starts in ${context.timeUntilNext} minutes`,
      };
    }

    // Check if currently in an event
    const todaySchedule = await this.getDaySchedule();
    const currentEvent = todaySchedule.events.find(e => {
      const start = new Date(e.startTime);
      const end = new Date(e.endTime);
      return now >= start && now < end;
    });

    if (currentEvent) {
      return {
        isGood: false,
        reason: `Currently in "${currentEvent.title}"`,
      };
    }

    // Find a good focus block
    const goodBlock = todaySchedule.freeBlocks.find(
      b => b.duration >= 60 && new Date(b.start) <= now && new Date(b.end) > now
    );

    if (goodBlock) {
      const remainingMinutes = Math.round(
        (new Date(goodBlock.end).getTime() - now.getTime()) / (1000 * 60)
      );
      return {
        isGood: true,
        reason: `${remainingMinutes} minutes of uninterrupted time available`,
        nextWindow: goodBlock,
      };
    }

    // At least 60 minutes until next event
    if (context.timeUntilNext === undefined || context.timeUntilNext >= 60) {
      return {
        isGood: true,
        reason: context.timeUntilNext
          ? `${context.timeUntilNext} minutes until next event`
          : 'No upcoming events',
      };
    }

    return {
      isGood: false,
      reason: 'Limited time before next commitment',
    };
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private getFromCache(key: string): unknown | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private parseEventsResult(result: MCPToolResult): CalendarEvent[] {
    if (result.isError || !result.content) return [];

    try {
      const textContent = result.content.find(c => c.type === 'text');
      if (!textContent?.text) return [];

      const data = JSON.parse(textContent.text);
      if (!Array.isArray(data)) return [];

      return data.map((item: Record<string, unknown>) => ({
        id: String(item.id || item.eventId || ''),
        title: String(item.title || item.summary || 'Untitled'),
        description: item.description ? String(item.description) : undefined,
        startTime: new Date(item.startTime as string || item.start as string || Date.now()),
        endTime: new Date(item.endTime as string || item.end as string || Date.now()),
        location: item.location ? String(item.location) : undefined,
        isAllDay: Boolean(item.isAllDay || item.allDay),
        calendar: String(item.calendar || item.calendarName || 'Default'),
        attendees: Array.isArray(item.attendees) ? item.attendees.map(String) : undefined,
        recurring: Boolean(item.recurring || item.isRecurring),
      }));
    } catch {
      return [];
    }
  }

  private calculateBusyHours(events: CalendarEvent[]): number {
    let totalMinutes = 0;

    for (const event of events) {
      if (event.isAllDay) {
        totalMinutes += 8 * 60; // Assume 8 hours for all-day
      } else {
        const start = new Date(event.startTime);
        const end = new Date(event.endTime);
        totalMinutes += (end.getTime() - start.getTime()) / (1000 * 60);
      }
    }

    return Math.round(totalMinutes / 60 * 10) / 10;
  }

  private findFreeBlocks(
    events: CalendarEvent[],
    dayStart: Date,
    dayEnd: Date
  ): TimeBlock[] {
    const blocks: TimeBlock[] = [];

    // Define work hours (8 AM to 8 PM)
    const workStart = new Date(dayStart);
    workStart.setHours(8, 0, 0, 0);
    const workEnd = new Date(dayStart);
    workEnd.setHours(20, 0, 0, 0);

    // Sort events by start time
    const sortedEvents = [...events]
      .filter(e => !e.isAllDay)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    let currentTime = workStart;

    for (const event of sortedEvents) {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);

      // Skip events outside work hours
      if (eventEnd < workStart || eventStart > workEnd) continue;

      // Free block before this event
      if (eventStart > currentTime) {
        const duration = (eventStart.getTime() - currentTime.getTime()) / (1000 * 60);
        if (duration >= 15) { // At least 15 min
          blocks.push({
            start: new Date(currentTime),
            end: eventStart,
            duration: Math.round(duration),
            type: duration >= 90 ? 'focus' : duration >= 30 ? 'buffer' : 'free',
          });
        }
      }

      currentTime = eventEnd > currentTime ? eventEnd : currentTime;
    }

    // Free block after last event
    if (currentTime < workEnd) {
      const duration = (workEnd.getTime() - currentTime.getTime()) / (1000 * 60);
      if (duration >= 15) {
        blocks.push({
          start: new Date(currentTime),
          end: workEnd,
          duration: Math.round(duration),
          type: duration >= 90 ? 'focus' : duration >= 30 ? 'buffer' : 'free',
        });
      }
    }

    return blocks;
  }

  private categorizeDay(busyHours: number, eventCount: number): DaySchedule['pattern'] {
    if (busyHours < 2 && eventCount <= 2) return 'light';
    if (busyHours < 4 && eventCount <= 5) return 'moderate';
    if (busyHours < 7) return 'busy';
    return 'packed';
  }
}

// Singleton instance
let instance: CalendarAdapter | null = null;

export function getCalendarAdapter(): CalendarAdapter {
  if (!instance) {
    instance = new CalendarAdapter();
  }
  return instance;
}

export function resetCalendarAdapter(): void {
  if (instance) {
    instance = null;
  }
}
