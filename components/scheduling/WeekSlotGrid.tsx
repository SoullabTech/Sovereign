'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slot {
  start: string;
  end: string;
  available: boolean;
}

interface WeekSlotGridProps {
  slug: string;
  serviceId: string;
  serviceDuration: number;
  onSlotSelect: (date: string, time: string) => void;
  timezone: string;
}

function startOfWeek(date: Date): Date {
  // Week starts on Monday. getDay(): 0=Sun, 1=Mon, ..., 6=Sat
  // Days to subtract to reach Monday: Sun→6, Mon→0, Tue→1, ...
  const d = new Date(date);
  const day = d.getDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - daysFromMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatTime12(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const ampm = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')}${ampm}`;
}

const DAY_ABBRS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function WeekSlotGrid({
  slug,
  serviceId,
  serviceDuration: _serviceDuration,
  onSlotSelect,
  timezone,
}: WeekSlotGridProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [weekStart, setWeekStart] = useState(() => startOfWeek(today));
  const [slotsByDate, setSlotsByDate] = useState<Record<string, Slot[]>>({});
  const [loading, setLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  // Mini calendar state
  const [calMonth, setCalMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  // Fetch week of availability
  const fetchWeek = useCallback(async (ws: Date) => {
    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    const from = formatDateKey(ws);
    const to = formatDateKey(addDays(ws, 6));

    try {
      const res = await fetch(
        `/api/portal/${slug}/availability?from=${from}&to=${to}&service=${serviceId}`,
        { signal: controller.signal }
      );
      if (!res.ok) {
        setSlotsByDate({});
        return;
      }
      const data = await res.json();
      setSlotsByDate(data.slotsByDate || {});
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setSlotsByDate({});
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [slug, serviceId]);

  useEffect(() => {
    fetchWeek(weekStart);
    return () => abortRef.current?.abort();
  }, [weekStart, fetchWeek]);

  // Navigation
  const goNextWeek = () => setWeekStart(prev => addDays(prev, 7));
  const goPrevWeek = () => {
    const prev = addDays(weekStart, -7);
    const weekEnd = addDays(prev, 6);
    // Don't navigate to a fully past week
    if (weekEnd >= today) setWeekStart(prev);
  };

  const canGoPrev = addDays(weekStart, -1) >= today;

  // Week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Mini calendar (Monday-first)
  const calYear = calMonth.getFullYear();
  const calMonthIdx = calMonth.getMonth();
  const firstDayRaw = new Date(calYear, calMonthIdx, 1).getDay(); // 0=Sun..6=Sat
  // Convert to Monday-first index: Mon=0, Tue=1, ..., Sun=6
  const firstDayOfMonth = firstDayRaw === 0 ? 6 : firstDayRaw - 1;
  const daysInMonth = new Date(calYear, calMonthIdx + 1, 0).getDate();

  const calDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) calDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calDays.push(i);

  const handleCalDayClick = (day: number) => {
    const clicked = new Date(calYear, calMonthIdx, day);
    if (clicked < today) return;
    setWeekStart(startOfWeek(clicked));
  };

  const isInCurrentWeek = (day: number) => {
    const d = new Date(calYear, calMonthIdx, day);
    return d >= weekStart && d < addDays(weekStart, 7);
  };

  const isToday = (day: number) => {
    const d = new Date(calYear, calMonthIdx, day);
    return d.getTime() === today.getTime();
  };

  // Explicit 7-equal-column template. We use an inline style instead of
  // `grid-cols-7` because the Tailwind shorthand combined with overflow-x-auto
  // parents was allowing the grid to stretch beyond the viewport on some
  // desktop widths, clipping the last 2 columns.
  const sevenCols = { gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' } as const;

  return (
    <div className="w-full">
      {/* Title + timezone */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-medium text-slate-200">
          Select an appointment time
        </h2>
        <span className="text-xs text-slate-400">
          {timezone}
        </span>
      </div>

      {/* Flex layout: reliable shrink-to-fit for week grid beside fixed sidebar */}
      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        {/* Mini month calendar */}
        <div className="hidden md:block md:w-60 md:flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setCalMonth(new Date(calYear, calMonthIdx - 1, 1))}
              className="p-1 rounded hover:bg-maia-navy-800 text-slate-400"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-sm font-medium text-slate-200">
              {MONTH_NAMES[calMonthIdx]} {calYear}
            </span>
            <button
              onClick={() => setCalMonth(new Date(calYear, calMonthIdx + 1, 1))}
              className="p-1 rounded hover:bg-maia-navy-800 text-slate-400"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} className="text-center text-[10px] font-medium text-slate-500 py-1">
                {d}
              </div>
            ))}
            {calDays.map((day, i) => {
              if (day === null) return <div key={i} />;
              const isPast = new Date(calYear, calMonthIdx, day) < today;
              const inWeek = isInCurrentWeek(day);
              const isTodayDay = isToday(day);

              return (
                <button
                  key={i}
                  disabled={isPast}
                  onClick={() => handleCalDayClick(day)}
                  className={`
                    w-7 h-7 mx-auto rounded-full text-xs font-medium transition-colors
                    ${isPast ? 'text-slate-600 cursor-default' : 'hover:bg-maia-navy-800'}
                    ${isTodayDay ? 'bg-maia-gold text-white hover:bg-maia-gold-hover' : ''}
                    ${inWeek && !isTodayDay ? 'bg-maia-navy-700/60 text-maia-gold' : ''}
                    ${!isPast && !isTodayDay && !inWeek ? 'text-slate-300' : ''}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Week slot grid — flex-1 + min-w-0 reliably constrains to remaining width */}
        <div className="flex-1 min-w-0">
          {/* Week navigation */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={goPrevWeek}
              disabled={!canGoPrev}
              className="p-1.5 rounded-full hover:bg-maia-navy-800 text-slate-400
                         disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={goNextWeek}
              className="p-1.5 rounded-full hover:bg-maia-navy-800 text-slate-400 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day columns — always 7 equal columns, no horizontal scroll */}
          <div className="grid gap-1.5 sm:gap-2" style={sevenCols}>
            {weekDays.map((day) => {
              const key = formatDateKey(day);
              const daySlots = slotsByDate[key] || [];
              const isPast = day < today;
              const isTodayCol = day.getTime() === today.getTime();

              return (
                <div key={key} className="min-w-0 text-center">
                  {/* Day header */}
                  <div className="mb-3">
                    <div className="text-[10px] font-medium text-slate-500 tracking-wider">
                      {DAY_ABBRS[day.getDay()]}
                    </div>
                    <div className={`
                      inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium mt-0.5
                      ${isTodayCol ? 'bg-maia-gold text-white' : 'text-slate-200'}
                    `}>
                      {day.getDate()}
                    </div>
                  </div>

                  {/* Slots */}
                  <div className="space-y-1.5 sm:space-y-2">
                    {loading ? (
                      <div className="h-8 bg-maia-navy-800 rounded-full animate-pulse" />
                    ) : isPast ? (
                      <span className="text-slate-600 text-sm">&mdash;</span>
                    ) : daySlots.length === 0 ? (
                      <span className="text-slate-600 text-sm">&mdash;</span>
                    ) : (
                      daySlots.map((slot) => (
                        <button
                          key={slot.start}
                          onClick={() => onSlotSelect(key, slot.start)}
                          className="w-full px-1 py-2 rounded-full text-[11px] sm:text-xs font-medium
                                     border border-maia-navy-600 bg-maia-navy-850 text-slate-200
                                     hover:bg-maia-gold hover:border-maia-gold hover:text-white
                                     transition-colors whitespace-nowrap overflow-hidden"
                        >
                          {formatTime12(slot.start)}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
