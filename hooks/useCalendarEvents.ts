import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  source: 'maia' | 'google' | 'studio' | 'meeting';
  teamsJoinUrl?: string;
  participants?: { id: string; name: string; email: string; responseStatus: string }[];
  allDay?: boolean;
  description?: string;
  location?: string;
  // MAIA-specific
  status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  clientName?: string;
  serviceName?: string;
  // Google-specific
  googleEventId?: string;
  calendarId?: string;
  calendarName?: string;
}

interface UseCalendarEventsOptions {
  from: Date;
  to: Date;
  /** Auto-refresh interval in ms. Default: 3 minutes. Set to 0 to disable. */
  refreshInterval?: number;
}

interface UseCalendarEventsResult {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  googleConnected: boolean;
  refetch: () => void;
  /** Time of last successful fetch */
  lastUpdated: Date | null;
}

const DEFAULT_REFRESH_INTERVAL = 3 * 60 * 1000; // 3 minutes

export function useCalendarEvents(options: UseCalendarEventsOptions): UseCalendarEventsResult {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        from: options.from.toISOString(),
        to: options.to.toISOString(),
      });

      const response = await apiFetch(`/api/studio/calendar/events?${params.toString()}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setEvents(data.events || []);
      setGoogleConnected(data.googleConnected || false);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch calendar events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [options.from, options.to]);

  // Initial fetch
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Auto-refresh polling — silently updates in the background
  useEffect(() => {
    const interval = options.refreshInterval ?? DEFAULT_REFRESH_INTERVAL;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (interval > 0) {
      intervalRef.current = setInterval(() => {
        const params = new URLSearchParams({
          from: options.from.toISOString(),
          to: options.to.toISOString(),
        });

        apiFetch(`/api/studio/calendar/events?${params.toString()}`)
          .then(res => res.json())
          .then(data => {
            if (!data.error) {
              setEvents(data.events || []);
              setGoogleConnected(data.googleConnected || false);
              setLastUpdated(new Date());
            }
          })
          .catch(() => {
            // Silent fail — don't overwrite existing data on background refresh
          });
      }, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [options.from, options.to, options.refreshInterval]);

  return {
    events,
    loading,
    error,
    googleConnected,
    refetch: fetchEvents,
    lastUpdated,
  };
}

// Helper to get events for a specific day
export function getEventsForDay(events: CalendarEvent[], date: Date): CalendarEvent[] {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  return events.filter(event => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    // Event overlaps with this day if:
    // - Event starts on this day, OR
    // - Event ends on this day, OR
    // - Event spans across this day
    return (
      (eventStart >= dayStart && eventStart <= dayEnd) ||
      (eventEnd >= dayStart && eventEnd <= dayEnd) ||
      (eventStart < dayStart && eventEnd > dayEnd)
    );
  });
}

// Helper to format event time
export function formatEventTime(dateStr: string): string {
  const date = new Date(dateStr);
  // Check if it's an all-day event (no time component)
  if (dateStr.length === 10) {
    return '';
  }
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).toLowerCase();
}
