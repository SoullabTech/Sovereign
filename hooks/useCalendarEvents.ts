import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  source: 'maia' | 'google';
  // MAIA-specific
  status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  clientName?: string;
  serviceName?: string;
  // Google-specific
  googleEventId?: string;
  location?: string;
  calendarId?: string;
  calendarName?: string;
}

interface UseCalendarEventsOptions {
  from: Date;
  to: Date;
}

interface UseCalendarEventsResult {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  googleConnected: boolean;
  refetch: () => void;
}

export function useCalendarEvents(options: UseCalendarEventsOptions): UseCalendarEventsResult {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [googleConnected, setGoogleConnected] = useState(false);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch calendar events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [options.from, options.to]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    googleConnected,
    refetch: fetchEvents,
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
