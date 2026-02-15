'use client';

import { motion } from 'framer-motion';

interface Alert {
  level: 'info' | 'warn' | 'critical';
  message: string;
  timestamp: string;
}

interface AlertFeedProps {
  alerts: Alert[];
  maxHeight?: string;
}

const levelColors = {
  info: 'bg-blue-500',
  warn: 'bg-amber-500',
  critical: 'bg-red-500',
};

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return `${diffDay}d ago`;
}

export function AlertFeed({ alerts, maxHeight = '300px' }: AlertFeedProps) {
  return (
    <div
      className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden"
      style={{ maxHeight }}
    >
      {alerts.length === 0 ? (
        <div className="flex items-center justify-center h-full min-h-[200px] text-gray-500 text-sm">
          No alerts
        </div>
      ) : (
        <div className="overflow-y-auto h-full">
          {alerts.map((alert, index) => (
            <motion.div
              key={`${alert.timestamp}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="flex items-start gap-3 p-4 border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/50 transition-colors"
            >
              <div
                className={`
                  w-2 h-2 rounded-full mt-1.5 flex-shrink-0
                  ${levelColors[alert.level]}
                `}
              />
              <div className="flex-1 min-w-0">
                <p className="text-gray-300 text-sm leading-relaxed">
                  {alert.message}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {formatRelativeTime(alert.timestamp)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
