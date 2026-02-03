'use client';

import { useState, useMemo, useCallback } from 'react';
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
} from 'lucide-react';
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

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());

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

  const { events, loading, error, googleConnected, refetch } = useCalendarEvents({ from, to });

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
          {!loading && (
            <div className={`text-xs px-2 py-1 rounded ${
              googleConnected
                ? 'bg-teal-500/20 text-teal-400'
                : 'bg-slate-700 text-slate-400'
            }`}>
              {googleConnected ? 'Google Connected' : 'Google not connected'}
            </div>
          )}
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
            <div className="p-3 border-t border-slate-800/50">
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
          />
        )}
      </AnimatePresence>
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

  return (
    <button
      onClick={onClick}
      className={`
        w-full p-3 rounded-lg text-left transition-all hover:scale-[1.02]
        ${event.source === 'maia'
          ? 'bg-amber-500/20 hover:bg-amber-500/30'
          : 'bg-teal-500/10 hover:bg-teal-500/20'}
      `}
    >
      <div className={`font-medium ${event.source === 'maia' ? 'text-amber-300' : 'text-teal-300'}`}>
        {event.clientName || event.title}
      </div>
      <div className="flex items-center gap-1.5 mt-1 text-sm opacity-70">
        <Clock className="w-3 h-3" />
        <span className={event.source === 'maia' ? 'text-amber-400' : 'text-teal-400'}>
          {startTime} - {endTime}
        </span>
      </div>
      {event.location && (
        <div className="flex items-center gap-1.5 mt-1 text-xs opacity-60">
          <MapPin className="w-3 h-3" />
          <span className={event.source === 'maia' ? 'text-amber-400' : 'text-teal-400'}>
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
            const dayEvents = getEventsForDay(events, day);

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

                  return (
                    <button
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      style={{ top: `${top}px`, height: `${height}px` }}
                      className={`
                        absolute left-0.5 right-0.5 px-1 py-0.5 rounded text-xs overflow-hidden
                        hover:opacity-80 transition-opacity text-left
                        ${event.source === 'maia'
                          ? 'bg-amber-500/30 text-amber-300 border-l-2 border-amber-500'
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

            {/* Events */}
            {events.map(event => {
              const eventStart = new Date(event.start);
              const eventEnd = new Date(event.end);
              const startMinutes = getHours(eventStart) * 60 + getMinutes(eventStart);
              const duration = differenceInMinutes(eventEnd, eventStart);
              const top = ((startMinutes - startHour * 60) / 60) * 64;
              const height = Math.max((duration / 60) * 64, 32);

              if (getHours(eventStart) < startHour || getHours(eventStart) > endHour) {
                return null;
              }

              return (
                <button
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  style={{ top: `${top}px`, height: `${height}px` }}
                  className={`
                    absolute left-2 right-2 px-3 py-2 rounded-lg text-left
                    hover:opacity-80 transition-opacity
                    ${event.source === 'maia'
                      ? 'bg-amber-500/30 text-amber-300 border-l-4 border-amber-500'
                      : 'bg-teal-500/20 text-teal-300 border-l-4 border-teal-500'}
                  `}
                >
                  <div className="font-medium">{event.title}</div>
                  <div className="text-sm opacity-70 mt-0.5">
                    {formatEventTime(event.start)} - {formatEventTime(event.end)}
                  </div>
                  {event.clientName && (
                    <div className="text-sm opacity-70 flex items-center gap-1 mt-1">
                      <User className="w-3 h-3" />
                      {event.clientName}
                    </div>
                  )}
                </button>
              );
            })}
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
}: {
  event: CalendarEvent;
  onClose: () => void;
}) {
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
              ${event.source === 'maia' ? 'bg-amber-500' : 'bg-teal-500'}
            `} />
            <span className={`text-xs font-medium uppercase tracking-wider ${
              event.source === 'maia' ? 'text-amber-400' : 'text-teal-400'
            }`}>
              {event.source === 'maia' ? 'MAIA Session' : 'Google Calendar'}
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

        <div className="mt-6 pt-4 border-t border-slate-700/50 flex gap-3">
          {event.source === 'maia' ? (
            <a
              href="/studio/sessions"
              className="flex-1 py-2 text-center text-sm font-medium bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors"
            >
              View in Sessions
            </a>
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
