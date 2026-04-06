'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isBefore,
  startOfDay,
} from 'date-fns';

interface DatePickerProps {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
}

export function DatePicker({ selectedDate, onSelect }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = startOfDay(new Date());

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full max-w-sm">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isPast = isBefore(day, today);
          const isToday = isSameDay(day, today);
          const disabled = isPast || !isCurrentMonth;

          return (
            <button
              key={day.toISOString()}
              disabled={disabled}
              onClick={() => onSelect(day)}
              className={`
                p-2 text-sm rounded-md transition-colors text-center
                ${disabled
                  ? 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
                  : 'hover:bg-amber-50 dark:hover:bg-amber-900/20 cursor-pointer'
                }
                ${isSelected
                  ? 'bg-amber-500 text-white hover:bg-amber-600 dark:hover:bg-amber-600'
                  : ''
                }
                ${isToday && !isSelected
                  ? 'ring-1 ring-amber-400'
                  : ''
                }
                ${!isCurrentMonth ? 'opacity-0' : ''}
              `}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
