'use client';

import { ToggleLeft, ToggleRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface RefreshToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  intervalMs?: number;
  lastRefresh?: Date;
}

function formatInterval(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m`;
}

function formatLastRefresh(date?: Date): string {
  if (!date) return 'Never';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);

  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  return date.toLocaleTimeString();
}

export function RefreshToggle({
  enabled,
  onToggle,
  intervalMs = 30000,
  lastRefresh,
}: RefreshToggleProps) {
  const ToggleIcon = enabled ? ToggleRight : ToggleLeft;

  return (
    <div className="flex items-center gap-4 bg-zinc-900 rounded-lg px-4 py-2 border border-zinc-800">
      <button
        onClick={() => onToggle(!enabled)}
        className={`
          flex items-center gap-2 text-sm font-medium transition-colors
          ${enabled ? 'text-amber-500' : 'text-gray-400 hover:text-gray-300'}
        `}
      >
        <motion.div
          initial={false}
          animate={{ scale: enabled ? 1.1 : 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <ToggleIcon size={20} />
        </motion.div>
        <span>Auto-refresh</span>
      </button>

      {enabled && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="text-xs text-gray-500"
        >
          every {formatInterval(intervalMs)}
        </motion.div>
      )}

      <div className="h-4 w-px bg-zinc-800" />

      <div className="text-xs text-gray-500">
        Last: <span className="text-gray-400">{formatLastRefresh(lastRefresh)}</span>
      </div>
    </div>
  );
}
