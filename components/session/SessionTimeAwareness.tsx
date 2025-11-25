'use client';

import React from 'react';
import { Clock } from 'lucide-react';

interface SessionTimeAwarenessProps {
  sessionDuration?: number;
  elapsedTime?: number;
  onTimeUpdate?: (elapsed: number) => void;
}

export function SessionTimeAwareness({
  sessionDuration = 30,
  elapsedTime = 0,
  onTimeUpdate
}: SessionTimeAwarenessProps) {
  const formatTime = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = Math.floor((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = sessionDuration ? (elapsedTime / sessionDuration) * 100 : 0;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Clock className="w-4 h-4" />
      <span>{formatTime(elapsedTime)} / {formatTime(sessionDuration)}</span>
      <div className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}