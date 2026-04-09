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
  serviceDuration,
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

  return (
    <div className="w-full">
      {/* Title + timezone */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-medium text-neutral-700 dark:text-neutral-300">
          Select an appointment time
        </h2>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {timezone}
        </span>
      </div>

      <div className="md:grid md:grid-cols-[240px_1fr] md:gap-8 flex flex-col gap-6">
        {/* Mini month calendar */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setCalMonth(new Date(calYear, calMonthIdx - 1, 1))}
              className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {MONTH_NAMES[calMonthIdx]} {calYear}
            </span>
            <button
              onClick={() => setCalMonth(new Date(calYear, calMonthIdx + 1, 1))}
              className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} className="text-center text-[10px] font-medium text-neutral-400 dark:text-neutral-500 py-1">
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
                    ${isPast ? 'text-neutral-300 dark:text-neutral-600 cursor-default' : 'hover:bg-amber-50 dark:hover:bg-amber-900/20'}
                    ${isTodayDay ? 'bg-amber-500 text-white hover:bg-amber-600' : ''}
                    ${inWeek && !isTodayDay ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300' : ''}
                    ${!isPast && !isTodayDay && !inWeek ? 'text-neutral-700 dark:text-neutral-300' : ''}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Week slot grid */}
        <div className="flex-1 min-w-0 overflow-x-auto">
          {/* Week navigation */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={goPrevWeek}
              disabled={!canGoPrev}
              className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400
                         disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={goNextWeek}
              className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day columns */}
          <div className="grid grid-cols-7 gap-2" style={{ minWidth: '480px' }}>
            {weekDays.map((day) => {
              const key = formatDateKey(day);
              const daySlots = slotsByDate[key] || [];
              const isPast = day < today;
              const isTodayCol = day.getTime() === today.getTime();

              return (
                <div key={key} className="text-center">
                  {/* Day header */}
                  <div className="mb-3">
                    <div className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 tracking-wider">
                      {DAY_ABBRS[day.getDay()]}
                    </div>
                    <div className={`
                      inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium mt-0.5
                      ${isTodayCol ? 'bg-amber-500 text-white' : 'text-neutral-700 dark:text-neutral-300'}
                    `}>
                      {day.getDate()}
                    </div>
                  </div>

                  {/* Slots */}
                  <div className="space-y-2">
                    {loading ? (
                      <div className="h-8 bg-neutral-100 dark:bg-neutral-800 rounded-full animate-pulse" />
                    ) : isPast ? (
                      <span className="text-neutral-300 dark:text-neutral-600 text-sm">&mdash;</span>
                    ) : daySlots.length === 0 ? (
                      <span className="text-neutral-300 dark:text-neutral-600 text-sm">&mdash;</span>
                    ) : (
                      daySlots.map((slot) => (
                        <button
                          key={slot.start}
                          onClick={() => onSlotSelect(key, slot.start)}
                          className="w-full py-2 rounded-full text-xs font-medium
                                     border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300
                                     hover:bg-amber-500 hover:text-white hover:border-amber-500
                                     dark:hover:bg-amber-500 dark:hover:text-white dark:hover:border-amber-500
                                     transition-colors"
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
