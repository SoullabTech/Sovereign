'use client';

import { motion } from 'framer-motion';

interface TimeRangeSelectorProps {
  value: number;
  onChange: (days: number) => void;
  options?: number[];
}

const defaultOptions = [1, 7, 30, 90];

function formatLabel(days: number): string {
  if (days === 1) return '1d';
  if (days === 7) return '7d';
  if (days === 30) return '30d';
  if (days === 90) return '90d';
  return `${days}d`;
}

export function TimeRangeSelector({
  value,
  onChange,
  options = defaultOptions,
}: TimeRangeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      {options.map((days) => {
        const isActive = value === days;
        return (
          <button
            key={days}
            onClick={() => onChange(days)}
            className={`
              relative px-4 py-2 rounded-lg text-sm font-medium
              transition-colors duration-200
              ${
                isActive
                  ? 'text-gray-100 bg-amber-500/20 border border-amber-500/50'
                  : 'text-gray-400 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-gray-300'
              }
            `}
          >
            {isActive && (
              <motion.div
                layoutId="active-pill"
                className="absolute inset-0 bg-amber-500/20 rounded-lg border border-amber-500/50"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{formatLabel(days)}</span>
          </button>
        );
      })}
    </div>
  );
}
