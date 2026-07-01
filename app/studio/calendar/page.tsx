'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
  MapPin,
  Clock,
  User,
  ExternalLink,
  CloudUpload,
  Check,
  Plus,
  Trash2,
  Pencil,
  FileText,
  Video,
} from 'lucide-react';
import { MeetingCreateModal } from '@/components/studio/MeetingCreateModal';
import { apiFetch } from '@/lib/http/apiBase';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  getHours,
  getMinutes,
  differenceInMinutes,
  setHours,
} from 'date-fns';
import {
  useCalendarEvents,
  getEventsForDay,
  formatEventTime,
  CalendarEvent,
} from '@/hooks/useCalendarEvents';

type ViewType = 'month' | 'week' | 'day';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

/**
 * Calculate overlap layout for events in a day column.
 * Groups overlapping events and assigns each a column index + total columns
 * so they can be rendered side-by-side instead of stacked on top of each other.
 */
function layoutOverlappingEvents(events: CalendarEvent[]): Map<string, { column: number; totalColumns: number }> {
  const layout = new Map<string, { column: number; totalColumns: number }>();
  if (events.length === 0) return layout;

  // Sort by start time, then by duration (longer first)
  const sorted = [...events].sort((a, b) => {
    const diff = new Date(a.start).getTime() - new Date(b.start).getTime();
    if (diff !== 0) return diff;
    return differenceInMinutes(new Date(b.end), new Date(b.start)) -
           differenceInMinutes(new Date(a.end), new Date(a.start));
  });

  // Group overlapping events into clusters
  const clusters: CalendarEvent[][] = [];
  let currentCluster: CalendarEvent[] = [];
  let clusterEnd = 0;

  for (const event of sorted) {
    const eventStart = new Date(event.start).getTime();
    const eventEnd = new Date(event.end).getTime();

    if (currentCluster.length === 0 || eventStart < clusterEnd) {
      // Overlaps with current cluster
      currentCluster.push(event);
      clusterEnd = Math.max(clusterEnd, eventEnd);
    } else {
      // New cluster
      clusters.push(currentCluster);
      currentCluster = [event];
      clusterEnd = eventEnd;
    }
  }
  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  // Assign columns within each cluster
  for (const cluster of clusters) {
    const columns: CalendarEvent[][] = [];

    for (const event of cluster) {
      const eventStart = new Date(event.start).getTime();
      // Find first column where this event doesn't overlap
      let placed = false;
      for (let col = 0; col < columns.length; col++) {
        const lastInCol = columns[col][columns[col].length - 1];
        if (eventStart >= new Date(lastInCol.end).getTime()) {
          columns[col].push(event);
          layout.set(event.id, { column: col, totalColumns: 0 }); // totalColumns set after
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([event]);
        layout.set(event.id, { column: columns.length - 1, totalColumns: 0 });
      }
    }

    // Set totalColumns for all events in this cluster
    const totalColumns = columns.length;
    for (const event of cluster) {
      const entry = layout.get(event.id)!;
      entry.totalColumns = totalColumns;
    }
  }

  return layout;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [nowTime, setNowTime] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNowTime(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  const [view, setView] = useState<ViewType>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createDefaultDate, setCreateDefaultDate] = useState<Date | null>(null);
  const [createDefaultHour, setCreateDefaultHour] = useState<number | null>(null);
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);

  // Calculate date range based on view
  const { from, to } = useMemo(() => {
    if (view === 'month') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      return {
        from: startOfWeek(monthStart),
        to: endOfWeek(monthEnd),
      };
    } else if (view === 'week') {
      return {
        from: startOfWeek(currentDate),
        to: endOfWeek(currentDate),
      };
    } else {
      return {
        from: startOfDay(currentDate),
        to: endOfDay(currentDate),
      };
    }
  }, [currentDate, view]);

  const { events: calEvents, loading, error, googleConnected, refetch, lastUpdated } = useCalendarEvents({ from, to });

  // Co-Lab meetings
  const [meetings, setMeetings] = useState<CalendarEvent[]>([]);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const fetchMeetings = useCallback(async () => {
    try {
      const res = await apiFetch('/api/studio/meetings');
      if (!res.ok) return;
      const data = await res.json();
      const mapped: CalendarEvent[] = (data.meetings ?? []).map((m: any) => ({
        id: `meeting-${m.id}`,
        title: m.title,
        start: m.start,
        end: m.end,
        source: 'meeting' as const,
        description: m.description,
        location: m.location,
        teamsJoinUrl: m.teamsJoinUrl,
        participants: m.participants,
      }));
      setMeetings(mapped);
    } catch { /* non-fatal */ }
  }, []);
  useEffect(() => { fetchMeetings(); }, [fetchMeetings]);
  const events = useMemo(() => [...calEvents, ...meetings], [calEvents, meetings]);

  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSyncToGoogle = useCallback(async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await apiFetch('/api/studio/calendar/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncResult({ message: data.message, type: 'success' });
        refetch(); // Refresh calendar after sync
      } else {
        setSyncResult({ message: data.error || 'Sync failed', type: 'error' });
      }
    } catch {
      setSyncResult({ message: 'Failed to sync', type: 'error' });
    } finally {
      setSyncing(false);
      // Clear result after 4 seconds
      setTimeout(() => setSyncResult(null), 4000);
    }
  }, [refetch]);

  // Get days for current view
  const calendarDays = useMemo(() => {
    return eachDayOfInterval({ start: from, end: to });
  }, [from, to]);

  // Week days for week view
  const weekDays = useMemo(() => {
    return eachDayOfInterval({
      start: startOfWeek(currentDate),
      end: endOfWeek(currentDate),
    });
  }, [currentDate]);

  // Get events for selected day (sidebar)
  const selectedDayEvents = useMemo(() => {
    return getEventsForDay(events, selectedDay).sort((a, b) =>
      new Date(a.start).getTime() - new Date(b.start).getTime()
    );
  }, [events, selectedDay]);

  // Navigation functions
  const goToPrev = useCallback(() => {
    if (view === 'month') {
      setCurrentDate(prev => subMonths(prev, 1));
    } else if (view === 'week') {
      setCurrentDate(prev => subWeeks(prev, 1));
    } else {
      setCurrentDate(prev => subDays(prev, 1));
    }
  }, [view]);

  const goToNext = useCallback(() => {
    if (view === 'month') {
      setCurrentDate(prev => addMonths(prev, 1));
    } else if (view === 'week') {
      setCurrentDate(prev => addWeeks(prev, 1));
    } else {
      setCurrentDate(prev => addDays(prev, 1));
    }
  }, [view]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
    setSelectedDay(new Date());
  }, []);

  // Open create modal with optional pre-filled date/time
  const openCreateModal = useCallback((date?: Date, hour?: number) => {
    setCreateDefaultDate(date || selectedDay);
    setCreateDefaultHour(hour ?? null);
    setShowCreateModal(true);
  }, [selectedDay]);

  // Delete a studio event (soft delete)
  const handleDeleteEvent = useCallback(async (eventId: string) => {
    try {
      const res = await apiFetch(`/api/studio/calendar/events?id=${encodeURIComponent(eventId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.deleted) {
        setSelectedEvent(null);
        refetch();
      }
    } catch {
      // Silent — could add error toast later
    }
  }, [refetch]);

  // Click on day - select it for sidebar and optionally switch to day view
  const handleDayClick = useCallback((day: Date, switchView = false) => {
    setSelectedDay(day);
    if (switchView) {
      setCurrentDate(day);
      setView('day');
    }
  }, []);

  // Format header based on view
  const headerText = useMemo(() => {
    if (view === 'month') {
      return format(currentDate, 'MMMM yyyy');
    } else if (view === 'week') {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'd, yyyy')}`;
      }
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
    } else {
      return format(currentDate, 'EEEE, MMMM d, yyyy');
    }
  }, [currentDate, view]);

  // Count sessions this week
  const sessionsThisWeek = useMemo(() => {
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    return events.filter(e => {
      const eventDate = new Date(e.start);
      return eventDate >= weekStart && eventDate <= weekEnd && e.source === 'maia';
    }).length;
  }, [events]);

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-slate-400" />
            Calendar
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {sessionsThisWeek} session{sessionsThisWeek !== 1 ? 's' : ''} this week
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sync result toast */}
          <AnimatePresence>
            {syncResult && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
                  syncResult.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {syncResult.type === 'success' && <Check className="w-3 h-3" />}
                {syncResult.message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Last updated */}
          {lastUpdated && !loading && (
            <span className="text-xs text-slate-600 hidden sm:inline">
              {lastUpdated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </span>
          )}

          {!loading && (
            <div className={`text-xs px-2 py-1 rounded ${
              googleConnected
                ? 'bg-teal-500/20 text-teal-400'
                : 'bg-slate-700 text-slate-400'
            }`}>
              {googleConnected ? 'Google Connected' : 'Google not connected'}
            </div>
          )}

          {/* Sync to Google button — only show when connected */}
          {googleConnected && (
            <button
              onClick={handleSyncToGoogle}
              disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 rounded-lg transition-colors disabled:opacity-50"
              title="Sync unsynced sessions to Google Calendar"
            >
              <CloudUpload className={`w-3.5 h-3.5 ${syncing ? 'animate-pulse' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync to Google'}
            </button>
          )}

          <button
            onClick={() => openCreateModal()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-amber-500/20 hover:bg-amber-500/30 rounded-lg transition-colors"
            title="Create event"
          >
            <Plus className="w-3.5 h-3.5" />
            Event
          </button>

          <button
            onClick={() => refetch()}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Main Layout: Calendar + Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar Section */}
        <div className="flex-1">
          {/* View Switcher & Navigation */}
          <div className="bg-[#16162a] rounded-xl border border-slate-800/50 p-4 mb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Month/Year Display */}
              <div className="text-lg font-medium text-white">
                {headerText}
              </div>

              <div className="flex items-center gap-4">
                {/* View Tabs */}
                <div className="flex items-center gap-1 text-sm">
                  {(['month', 'week', 'day'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setView(v)}
                      className={`
                        px-3 py-1.5 font-medium rounded-md transition-all
                        ${view === v
                          ? 'text-amber-400'
                          : 'text-slate-500 hover:text-white'}
                      `}
                    >
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="h-4 w-px bg-slate-700" />

                {/* Navigation */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={goToPrev}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-amber-500/40" />
              <span>MAIA Sessions</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-slate-400/40" />
              <span>Studio Events</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded border border-teal-500/50" />
              <span>Google Calendar</span>
            </div>
          </div>

          {/* Calendar Views */}
          <AnimatePresence mode="wait">
            {loading && events.length === 0 && (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {view === 'month' && <MonthSkeleton />}
                {view === 'week' && <WeekSkeleton />}
                {view === 'day' && <DaySkeleton />}
              </motion.div>
            )}

            {/* Month View */}
            {view === 'month' && !loading && (
              <motion.div
                key="month"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#16162a] rounded-xl border border-slate-800/50 overflow-hidden"
              >
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 border-b border-slate-800/50">
                  {WEEKDAYS.map(day => (
                    <div
                      key={day}
                      className="px-2 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7">
                  {calendarDays.map((day, index) => {
                    const dayEvents = getEventsForDay(events, day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isCurrentDay = isToday(day);
                    const isSelected = isSameDay(day, selectedDay);

                    return (
                      <motion.div
                        key={day.toISOString()}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.005 }}
                        onClick={() => handleDayClick(day)}
                        onDoubleClick={() => handleDayClick(day, true)}
                        className={`
                          min-h-24 p-1.5 border-b border-r border-slate-800/30 cursor-pointer
                          hover:bg-[#252545] transition-colors
                          ${index % 7 === 6 ? 'border-r-0' : ''}
                          ${!isCurrentMonth ? 'bg-[#1a1a2e]/50' : 'bg-[#1e1e38]'}
                          ${isCurrentDay ? 'ring-1 ring-inset ring-amber-500/50' : ''}
                          ${isSelected && !isCurrentDay ? 'ring-1 ring-inset ring-slate-500/50' : ''}
                        `}
                      >
                        <div className={`
                          text-sm mb-1
                          ${isCurrentDay
                            ? 'w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-medium'
                            : isCurrentMonth
                              ? 'text-slate-300 px-1'
                              : 'text-slate-600 px-1'}
                        `}>
                          {format(day, 'd')}
                        </div>

                        <div className="space-y-0.5">
                          {dayEvents.slice(0, 3).map(event => (
                            <EventChip
                              key={event.id}
                              event={event}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(event);
                              }}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-slate-500 px-1">
                              +{dayEvents.length - 3} more
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Week View */}
            {view === 'week' && !loading && (
              <motion.div
                key="week"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <WeekView
                  days={weekDays}
                  events={events}
                  selectedDay={selectedDay}
                  onEventClick={setSelectedEvent}
                  onDayClick={(day) => handleDayClick(day)}
                />
              </motion.div>
            )}

            {/* Day View */}
            {view === 'day' && !loading && (
              <motion.div
                key="day"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <DayView
                  date={currentDate}
                  events={getEventsForDay(events, currentDate)}
                  onEventClick={setSelectedEvent}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar - Today's Events */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-[#16162a] rounded-xl border border-slate-800/50 overflow-hidden sticky top-6">
            {/* Sidebar Header */}
            <div className={`p-4 border-b border-slate-800/50 ${isToday(selectedDay) ? 'bg-amber-500/5' : ''}`}>
              <div className="text-sm text-slate-500">
                {isToday(selectedDay) ? 'Today' : format(selectedDay, 'EEEE')}
              </div>
              <div className={`text-xl font-medium ${isToday(selectedDay) ? 'text-amber-400' : 'text-white'}`}>
                {format(selectedDay, 'MMMM d')}
              </div>
              {isToday(selectedDay) && (
                <div className="text-xs text-slate-500 mt-0.5">
                  {nowTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {' · '}
                  {Intl.DateTimeFormat().resolvedOptions().timeZone.replace('_', ' ')}
                </div>
              )}
            </div>

            {/* Events List */}
            <div className="p-3 space-y-2 max-h-[500px] overflow-y-auto">
              {selectedDayEvents.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">No events</div>
                </div>
              ) : (
                selectedDayEvents.map(event => (
                  <SidebarEventCard
                    key={event.id}
                    event={event}
                    onClick={() => setSelectedEvent(event)}
                  />
                ))
              )}
            </div>

            {/* Quick Actions */}
            <div className="p-3 border-t border-slate-800/50 space-y-2">
              <button
                onClick={() => openCreateModal(selectedDay)}
                className="w-full py-2 text-sm text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Event
              </button>
              <button
                onClick={() => setShowMeetingModal(true)}
                className="w-full py-2 text-sm text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Video className="w-3.5 h-3.5" />
                Schedule Meeting
              </button>
              <button
                onClick={goToToday}
                className="w-full py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                Go to Today
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <EventDetailModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onEdit={
              selectedEvent.source === 'studio'
                ? () => {
                    setEditEvent(selectedEvent);
                    setSelectedEvent(null);
                  }
                : undefined
            }
            onDelete={selectedEvent.source === 'studio' ? handleDeleteEvent : undefined}
          />
        )}
      </AnimatePresence>

      {/* Create Event Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateEventModal
            defaultDate={createDefaultDate || new Date()}
            defaultHour={createDefaultHour}
            onClose={() => {
              setShowCreateModal(false);
              setCreateDefaultDate(null);
              setCreateDefaultHour(null);
            }}
            onCreated={() => {
              setShowCreateModal(false);
              setCreateDefaultDate(null);
              setCreateDefaultHour(null);
              refetch();
            }}
          />
        )}
      </AnimatePresence>

      {/* Edit Event Modal */}
      <AnimatePresence>
        {editEvent && (
          <CreateEventModal
            editEvent={editEvent}
            defaultDate={new Date(editEvent.start)}
            defaultHour={null}
            onClose={() => setEditEvent(null)}
            onCreated={() => {
              setEditEvent(null);
              refetch();
            }}
          />
        )}
      </AnimatePresence>

      {showMeetingModal && (
        <MeetingCreateModal
          defaultDate={selectedDay}
          defaultHour={createDefaultHour ?? 10}
          onClose={() => setShowMeetingModal(false)}
          onCreated={() => { fetchMeetings(); }}
        />
      )}
    </div>
  );
}

// Sidebar Event Card
function SidebarEventCard({
  event,
  onClick,
}: {
  event: CalendarEvent;
  onClick: () => void;
}) {
  const startTime = formatEventTime(event.start);
  const endTime = formatEventTime(event.end);
  const tzAbbr = event.start.length > 10
    ? new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' })
        .formatToParts(new Date(event.start))
        .find(p => p.type === 'timeZoneName')?.value ?? ''
    : '';

  return (
    <button
      onClick={onClick}
      className={`
        w-full p-3 rounded-lg text-left transition-all hover:scale-[1.02]
        ${event.source === 'maia'
          ? 'bg-amber-500/20 hover:bg-amber-500/30'
          : event.source === 'meeting'
            ? 'bg-violet-500/20 hover:bg-violet-500/30'
            : event.source === 'studio'
              ? 'bg-slate-700/50 hover:bg-slate-700/70'
              : 'bg-teal-500/10 hover:bg-teal-500/20'}
      `}
    >
      <div className={`font-medium ${
        event.source === 'maia' ? 'text-amber-300'
        : event.source === 'meeting' ? 'text-violet-300'
        : event.source === 'studio' ? 'text-slate-200'
        : 'text-teal-300'
      }`}>
        {event.clientName || event.title}
      </div>
      <div className="flex items-center gap-1.5 mt-1 text-sm text-stone-400">
        <Clock className="w-3 h-3" />
        <span className={
          event.source === 'maia' ? 'text-amber-400'
          : event.source === 'meeting' ? 'text-violet-400'
          : event.source === 'studio' ? 'text-slate-400'
          : 'text-teal-400'
        }>
          {startTime} - {endTime}{tzAbbr ? ` ${tzAbbr}` : ''}
        </span>
      </div>
      {event.location && (
        <div className="flex items-center gap-1.5 mt-1 text-xs text-stone-500">
          <MapPin className="w-3 h-3" />
          <span className={
            event.source === 'maia' ? 'text-amber-400'
            : event.source === 'studio' ? 'text-slate-400'
            : 'text-teal-400'
          }>
            {event.location}
          </span>
        </div>
      )}
    </button>
  );
}

// Week View Component
function WeekView({
  days,
  events,
  selectedDay,
  onEventClick,
  onDayClick,
}: {
  days: Date[];
  events: CalendarEvent[];
  selectedDay: Date;
  onEventClick: (event: CalendarEvent) => void;
  onDayClick: (day: Date) => void;
}) {
  const startHour = 6;
  const endHour = 22;
  const hours = HOURS.filter(h => h >= startHour && h <= endHour);

  return (
    <div className="bg-[#16162a] rounded-xl border border-slate-800/50 overflow-hidden">
      {/* Header with days */}
      <div className="grid grid-cols-8 border-b border-slate-800/50">
        <div className="p-2 text-xs text-slate-600" />
        {days.map(day => {
          const isSelected = isSameDay(day, selectedDay);
          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={`
                p-2 text-center hover:bg-slate-800/50 transition-colors
                ${isToday(day) ? 'bg-amber-500/10' : ''}
                ${isSelected && !isToday(day) ? 'bg-slate-800/30' : ''}
              `}
            >
              <div className="text-xs text-slate-500 uppercase">
                {format(day, 'EEE')}
              </div>
              <div className={`
                text-lg font-medium mt-0.5
                ${isToday(day) ? 'text-amber-400' : 'text-slate-300'}
              `}>
                {format(day, 'd')}
              </div>
            </button>
          );
        })}
      </div>

      {/* All-day events row */}
      {(() => {
        const hasAllDay = days.some(day =>
          getEventsForDay(events, day).some(e => e.allDay || e.start.length === 10)
        );
        if (!hasAllDay) return null;
        return (
          <div className="grid grid-cols-8 border-b border-slate-800/50">
            <div className="p-2 text-xs text-slate-600 text-right pr-2">all-day</div>
            {days.map(day => {
              const allDayEvents = getEventsForDay(events, day).filter(
                e => e.allDay || e.start.length === 10
              );
              return (
                <div key={`allday-${day.toISOString()}`} className="p-1 border-r border-slate-800/30 last:border-r-0 min-h-[32px]">
                  {allDayEvents.map(event => (
                    <button
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className={`
                        w-full px-1.5 py-0.5 rounded text-xs truncate text-left mb-0.5
                        hover:opacity-80 transition-opacity
                        ${event.source === 'maia'
                          ? 'bg-amber-500/20 text-amber-400'
                          : event.source === 'meeting'
                            ? 'bg-violet-500/20 text-violet-300'
                            : event.source === 'studio'
                              ? 'bg-slate-500/20 text-slate-300'
                              : 'border border-teal-500/30 text-teal-400'}
                      `}
                    >
                      {event.title}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Time grid */}
      <div className="max-h-[600px] overflow-y-auto">
        <div className="grid grid-cols-8">
          {/* Time labels */}
          <div className="border-r border-slate-800/30">
            {hours.map(hour => (
              <div
                key={hour}
                className="h-12 px-2 text-xs text-slate-600 text-right pr-2 -mt-2"
              >
                {format(setHours(new Date(), hour), 'h a')}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map(day => {
            const dayEvents = getEventsForDay(events, day).filter(
              e => !e.allDay && e.start.length !== 10
            );
            const overlapLayout = layoutOverlappingEvents(dayEvents);

            return (
              <div key={day.toISOString()} className="relative border-r border-slate-800/30 last:border-r-0">
                {/* Hour lines */}
                {hours.map(hour => (
                  <div
                    key={hour}
                    className="h-12 border-b border-slate-800/20"
                  />
                ))}

                {/* Events */}
                {dayEvents.map(event => {
                  const eventStart = new Date(event.start);
                  const eventEnd = new Date(event.end);
                  const startMinutes = getHours(eventStart) * 60 + getMinutes(eventStart);
                  const duration = differenceInMinutes(eventEnd, eventStart);
                  const top = ((startMinutes - startHour * 60) / 60) * 48;
                  const height = Math.max((duration / 60) * 48, 20);

                  if (getHours(eventStart) < startHour || getHours(eventStart) > endHour) {
                    return null;
                  }

                  const overlap = overlapLayout.get(event.id) || { column: 0, totalColumns: 1 };
                  // Calculate position with consistent gaps between overlapping events
                  const gapPx = 2;
                  const totalGaps = overlap.totalColumns + 1;
                  const availableWidth = `calc(100% - ${totalGaps * gapPx}px)`;
                  const eventWidth = `calc(${availableWidth} / ${overlap.totalColumns})`;
                  const eventLeft = `calc(${gapPx}px + ${overlap.column} * (${availableWidth} / ${overlap.totalColumns} + ${gapPx}px))`;

                  return (
                    <button
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        left: eventLeft,
                        width: eventWidth,
                      }}
                      className={`
                        absolute px-1 py-0.5 rounded text-xs overflow-hidden
                        hover:opacity-80 transition-opacity text-left
                        ${event.source === 'maia'
                          ? 'bg-amber-500/30 text-amber-300 border-l-2 border-amber-500'
                          : event.source === 'studio'
                            ? 'bg-slate-500/20 text-slate-200 border-l-2 border-slate-400'
                            : 'bg-teal-500/20 text-teal-300 border-l-2 border-teal-500'}
                      `}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      {height > 30 && (
                        <div className="text-[10px] opacity-70">
                          {formatEventTime(event.start)}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Day View Component
function DayView({
  date,
  events,
  onEventClick,
}: {
  date: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}) {
  const startHour = 6;
  const endHour = 22;
  const hours = HOURS.filter(h => h >= startHour && h <= endHour);

  return (
    <div className="bg-[#16162a] rounded-xl border border-slate-800/50 overflow-hidden">
      {/* Day header */}
      <div className={`p-4 border-b border-slate-800/50 ${isToday(date) ? 'bg-amber-500/10' : ''}`}>
        <div className="text-sm text-slate-500 uppercase tracking-wider">
          {format(date, 'EEEE')}
        </div>
        <div className={`text-3xl font-light ${isToday(date) ? 'text-amber-400' : 'text-white'}`}>
          {format(date, 'MMMM d')}
        </div>
      </div>

      {/* All-day events */}
      {(() => {
        const allDayEvents = events.filter(e => e.allDay || e.start.length === 10);
        if (allDayEvents.length === 0) return null;
        return (
          <div className="px-4 py-2 border-b border-slate-800/50 space-y-1">
            <div className="text-xs text-slate-600 mb-1">all-day</div>
            {allDayEvents.map(event => (
              <button
                key={event.id}
                onClick={() => onEventClick(event)}
                className={`
                  w-full px-3 py-1.5 rounded-lg text-sm text-left
                  hover:opacity-80 transition-opacity
                  ${event.source === 'maia'
                    ? 'bg-amber-500/20 text-amber-300'
                    : event.source === 'studio'
                      ? 'bg-slate-500/20 text-slate-200'
                      : 'bg-teal-500/10 text-teal-300'}
                `}
              >
                {event.title}
              </button>
            ))}
          </div>
        );
      })()}

      {/* Time grid */}
      <div className="max-h-[600px] overflow-y-auto">
        <div className="grid grid-cols-[60px_1fr]">
          {/* Time labels */}
          <div className="border-r border-slate-800/30">
            {hours.map(hour => (
              <div
                key={hour}
                className="h-16 px-2 text-xs text-slate-600 text-right pr-2 pt-1"
              >
                {format(setHours(new Date(), hour), 'h a')}
              </div>
            ))}
          </div>

          {/* Events column */}
          <div className="relative">
            {/* Hour lines */}
            {hours.map(hour => (
              <div
                key={hour}
                className="h-16 border-b border-slate-800/20"
              />
            ))}

            {/* Timed events only (skip all-day) */}
            {(() => {
              const timedEvents = events.filter(e => !e.allDay && e.start.length !== 10);
              const overlapLayout = layoutOverlappingEvents(timedEvents);
              return timedEvents.map(event => {
                const eventStart = new Date(event.start);
                const eventEnd = new Date(event.end);
                const startMinutes = getHours(eventStart) * 60 + getMinutes(eventStart);
                const duration = differenceInMinutes(eventEnd, eventStart);
                const top = ((startMinutes - startHour * 60) / 60) * 64;
                const height = Math.max((duration / 60) * 64, 32);

                if (getHours(eventStart) < startHour || getHours(eventStart) > endHour) {
                  return null;
                }

                const overlap = overlapLayout.get(event.id) || { column: 0, totalColumns: 1 };
                // Calculate position with consistent gaps between overlapping events
                const gapPx = 4;
                const totalGaps = overlap.totalColumns + 1;
                const availableWidth = `calc(100% - ${totalGaps * gapPx}px)`;
                const eventWidth = `calc(${availableWidth} / ${overlap.totalColumns})`;
                const eventLeft = `calc(${gapPx}px + ${overlap.column} * (${availableWidth} / ${overlap.totalColumns} + ${gapPx}px))`;

                return (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      left: eventLeft,
                      width: eventWidth,
                    }}
                    className={`
                      absolute px-3 py-2 rounded-lg text-left
                      hover:opacity-80 transition-opacity
                      ${event.source === 'maia'
                        ? 'bg-amber-500/30 text-amber-300 border-l-4 border-amber-500'
                        : event.source === 'studio'
                          ? 'bg-slate-500/20 text-slate-200 border-l-4 border-slate-400'
                          : 'bg-teal-500/20 text-teal-300 border-l-4 border-teal-500'}
                    `}
                  >
                    <div className="font-medium truncate">{event.title}</div>
                    <div className="text-sm text-stone-400 mt-0.5">
                      {formatEventTime(event.start)} - {formatEventTime(event.end)}
                    </div>
                    {event.clientName && (
                      <div className="text-sm text-stone-400 flex items-center gap-1 mt-1 truncate">
                        <User className="w-3 h-3 flex-shrink-0" />
                        {event.clientName}
                      </div>
                    )}
                  </button>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton Components
function MonthSkeleton() {
  return (
    <div className="bg-[#16162a] rounded-xl border border-slate-800/50 overflow-hidden animate-pulse">
      <div className="grid grid-cols-7 border-b border-slate-800/50">
        {WEEKDAYS.map(day => (
          <div key={day} className="px-2 py-3 text-center">
            <div className="h-3 bg-slate-800 rounded w-8 mx-auto" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="min-h-24 p-2 border-b border-r border-slate-800/30">
            <div className="h-4 w-4 bg-slate-800 rounded mb-2" />
            <div className="h-3 bg-slate-800/50 rounded w-full mb-1" />
            <div className="h-3 bg-slate-800/50 rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

function WeekSkeleton() {
  return (
    <div className="bg-[#16162a] rounded-xl border border-slate-800/50 overflow-hidden animate-pulse">
      <div className="grid grid-cols-8 border-b border-slate-800/50">
        <div className="p-2" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="p-2 text-center">
            <div className="h-3 bg-slate-800 rounded w-8 mx-auto mb-1" />
            <div className="h-6 bg-slate-800 rounded w-6 mx-auto" />
          </div>
        ))}
      </div>
      <div className="h-96">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 border-b border-slate-800/20" />
        ))}
      </div>
    </div>
  );
}

function DaySkeleton() {
  return (
    <div className="bg-[#16162a] rounded-xl border border-slate-800/50 overflow-hidden animate-pulse">
      <div className="p-4 border-b border-slate-800/50">
        <div className="h-3 bg-slate-800 rounded w-20 mb-2" />
        <div className="h-8 bg-slate-800 rounded w-32" />
      </div>
      <div className="h-96">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 border-b border-slate-800/20 flex">
            <div className="w-16 p-2">
              <div className="h-3 bg-slate-800 rounded w-10 ml-auto" />
            </div>
            <div className="flex-1 p-2">
              {i % 2 === 0 && <div className="h-12 bg-slate-800/50 rounded w-full" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Event Chip Component
function EventChip({
  event,
  onClick,
}: {
  event: CalendarEvent;
  onClick: (e: React.MouseEvent) => void;
}) {
  const time = formatEventTime(event.start);

  return (
    <button
      onClick={onClick}
      className={`
        w-full px-1.5 py-0.5 rounded text-xs truncate text-left transition-all
        hover:opacity-80
        ${event.source === 'maia'
          ? 'bg-amber-500/20 text-amber-400'
          : event.source === 'studio'
            ? 'bg-slate-500/20 text-slate-300'
            : 'border border-teal-500/30 text-teal-400'}
      `}
    >
      {time && <span className="font-medium">{time} </span>}
      {event.title}
    </button>
  );
}

// Event Detail Modal
function EventDetailModal({
  event,
  onClose,
  onEdit,
  onDelete,
}: {
  event: CalendarEvent;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const startDate = new Date(event.start);
  const endDate = new Date(event.end);
  const isAllDay = event.start.length === 10;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#1e1e38] rounded-xl border border-slate-700/50 p-6 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`
              w-3 h-3 rounded
              ${event.source === 'maia' ? 'bg-amber-500' : event.source === 'studio' ? 'bg-slate-400' : 'bg-teal-500'}
            `} />
            <span className={`text-xs font-medium uppercase tracking-wider ${
              event.source === 'maia' ? 'text-amber-400' : event.source === 'studio' ? 'text-slate-300' : 'text-teal-400'
            }`}>
              {event.source === 'maia' ? 'MAIA Session' : event.source === 'studio' ? 'Studio Event' : 'Google Calendar'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h2 className="text-xl font-semibold text-white mb-4">{event.title}</h2>

        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3 text-slate-300">
            <Clock className="w-4 h-4 mt-0.5 text-slate-500" />
            <div>
              <div>{format(startDate, 'EEEE, MMMM d, yyyy')}</div>
              {isAllDay ? (
                <div className="text-slate-500">All day</div>
              ) : (
                <div className="text-slate-500">
                  {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                </div>
              )}
            </div>
          </div>

          {event.clientName && (
            <div className="flex items-center gap-3 text-slate-300">
              <User className="w-4 h-4 text-slate-500" />
              <span>{event.clientName}</span>
            </div>
          )}

          {event.location && (
            <div className="flex items-start gap-3 text-slate-300">
              <MapPin className="w-4 h-4 mt-0.5 text-slate-500" />
              <span>{event.location}</span>
            </div>
          )}

          {event.calendarName && (
            <div className="flex items-center gap-3 text-slate-400 text-xs">
              <CalendarDays className="w-4 h-4 text-slate-500" />
              <span>{event.calendarName}</span>
            </div>
          )}

          {event.status && (
            <div className="mt-4">
              <span className={`
                px-2 py-1 text-xs rounded-full
                ${event.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' : ''}
                ${event.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' : ''}
                ${event.status === 'in_progress' ? 'bg-amber-500/20 text-amber-400' : ''}
                ${event.status === 'completed' ? 'bg-slate-700 text-slate-400' : ''}
                ${event.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : ''}
                ${event.status === 'no_show' ? 'bg-red-500/20 text-red-400' : ''}
              `}>
                {event.status.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>

        {event.description && (
          <div className="flex items-start gap-3 text-slate-300 mt-3">
            <FileText className="w-4 h-4 mt-0.5 text-slate-500" />
            <span className="text-sm whitespace-pre-wrap">{event.description}</span>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-700/50 flex gap-3">
          {event.source === 'maia' ? (
            <a
              href="/studio/sessions"
              className="flex-1 py-2 text-center text-sm font-medium bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors"
            >
              View in Sessions
            </a>
          ) : event.source === 'studio' && (onEdit || onDelete) ? (
            confirmDelete ? (
              <div className="flex-1 flex gap-2">
                <button
                  onClick={() => onDelete?.(event.id)}
                  className="flex-1 py-2 text-center text-sm font-medium bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex-1 flex gap-2">
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="flex-1 py-2 text-center text-sm font-medium bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex-1 py-2 text-center text-sm font-medium bg-slate-700/50 text-slate-300 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                )}
              </div>
            )
          ) : (
            <a
              href={`https://calendar.google.com/calendar/r/eventedit/${event.googleEventId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 text-center text-sm font-medium bg-teal-500/20 text-teal-400 rounded-lg hover:bg-teal-500/30 transition-colors flex items-center justify-center gap-1.5"
            >
              Open in Google
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Create Event Modal
function CreateEventModal({
  defaultDate,
  defaultHour,
  editEvent,
  onClose,
  onCreated,
}: {
  defaultDate: Date;
  defaultHour: number | null;
  editEvent?: CalendarEvent | null;
  onClose: () => void;
  onCreated: () => void;
}) {
  const isEdit = !!editEvent;
  const startHour = defaultHour ?? 9;
  // When editing, pre-fill from the event's instant rendered in local time —
  // date-fns `format` uses the viewer's timezone, matching the calendar.
  const dateStr = format(
    editEvent ? new Date(editEvent.start) : defaultDate,
    'yyyy-MM-dd'
  );

  const [title, setTitle] = useState(editEvent?.title ?? '');
  const [date, setDate] = useState(dateStr);
  const [startTime, setStartTime] = useState(
    editEvent
      ? format(new Date(editEvent.start), 'HH:mm')
      : `${String(startHour).padStart(2, '0')}:00`
  );
  const [endTime, setEndTime] = useState(
    editEvent
      ? format(new Date(editEvent.end), 'HH:mm')
      : `${String(Math.min(startHour + 1, 23)).padStart(2, '0')}:00`
  );
  const [allDay, setAllDay] = useState(editEvent?.allDay ?? false);
  const [description, setDescription] = useState(editEvent?.description ?? '');
  const [location, setLocation] = useState(editEvent?.location ?? '');
  const [showMore, setShowMore] = useState(
    !!(editEvent?.description || editEvent?.location)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      let start: string;
      let end: string;

      // Build instants from the user's local wall-clock components so their
      // timezone is captured here, at input time. Sending a naive string
      // (e.g. "2026-06-09T09:00:00") let the UTC server parse it as 09:00 UTC,
      // which then rendered back 4h earlier (9am → 5am) for EDT viewers.
      const [y, mo, d] = date.split('-').map(Number);
      if (allDay) {
        // All-day spans local midnight → next local midnight. day+1 rolls
        // month/year boundaries correctly via the Date constructor.
        start = new Date(y, mo - 1, d, 0, 0, 0, 0).toISOString();
        end = new Date(y, mo - 1, d + 1, 0, 0, 0, 0).toISOString();
      } else {
        const [sh, sm] = startTime.split(':').map(Number);
        const [eh, em] = endTime.split(':').map(Number);
        start = new Date(y, mo - 1, d, sh, sm, 0, 0).toISOString();
        end = new Date(y, mo - 1, d, eh, em, 0, 0).toISOString();
      }

      const res = await apiFetch('/api/studio/calendar/events', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isEdit ? { id: editEvent!.id } : {}),
          title: title.trim(),
          start,
          end,
          allDay,
          description: description.trim() || undefined,
          location: location.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setSaving(false);
        return;
      }

      onCreated();
    } catch {
      setError('Failed to create event');
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#1e1e38] rounded-xl border border-slate-700/50 p-6 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">{isEdit ? 'Edit Event' : 'New Event'}</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Event title"
            autoFocus
            className="w-full px-3 py-2.5 bg-[#16162a] border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 text-sm"
          />

          {/* Date */}
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#16162a] border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 text-sm [color-scheme:dark]"
          />

          {/* All-day toggle */}
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={allDay}
              onChange={e => setAllDay(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-[#16162a] text-amber-500 focus:ring-amber-500/50"
            />
            All day
          </label>

          {/* Time selectors (hidden when all-day) */}
          {!allDay && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-slate-500 mb-1 block">Start</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-[#16162a] border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 text-sm [color-scheme:dark]"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-500 mb-1 block">End</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-[#16162a] border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 text-sm [color-scheme:dark]"
                />
              </div>
            </div>
          )}

          {/* More fields toggle */}
          {!showMore && (
            <button
              type="button"
              onClick={() => setShowMore(true)}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              + Description, Location
            </button>
          )}

          {showMore && (
            <>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Location (optional)"
                className="w-full px-3 py-2.5 bg-[#16162a] border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 text-sm"
              />
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={3}
                className="w-full px-3 py-2.5 bg-[#16162a] border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 text-sm resize-none"
              />
            </>
          )}

          {/* Error */}
          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 text-sm font-medium bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors disabled:opacity-50"
            >
              {saving ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Event')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
