'use client';

interface TimeSlot {
  start: string;
  end: string;
}

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedSlot: string | null;
  onSelect: (time: string) => void;
  loading?: boolean;
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${ampm}`;
}

export function TimeSlotGrid({ slots, selectedSlot, onSelect, loading }: TimeSlotGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-10 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400 py-4 text-center">
        No available times for this date.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map((slot) => {
        const isSelected = selectedSlot === slot.start;
        return (
          <button
            key={slot.start}
            onClick={() => onSelect(slot.start)}
            className={`
              px-3 py-2 text-sm rounded-md border transition-colors
              ${isSelected
                ? 'bg-amber-500 text-white border-amber-500'
                : 'border-neutral-200 dark:border-neutral-700 hover:border-amber-400 dark:hover:border-amber-500 text-neutral-700 dark:text-neutral-300'
              }
            `}
          >
            {formatTime(slot.start)}
          </button>
        );
      })}
    </div>
  );
}
