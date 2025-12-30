'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { SessionTimer } from '@/lib/session/SessionTimer';

interface SessionTimeAwarenessProps {
  sessionDuration?: number;
  elapsedTime?: number;
  onTimeUpdate?: (elapsed: number) => void;
  // Additional props from OracleConversation
  timer?: SessionTimer;
  onExtend?: (additionalMinutes: number) => void;
}

export function SessionTimeAwareness({
  sessionDuration = 30,
  elapsedTime = 0,
  onTimeUpdate,
  timer,
  onExtend
}: SessionTimeAwarenessProps) {
  // Use timer values if provided, fallback to direct props
  // Cast to any for resilience - SessionTimer.getContext() shape may vary
  const timerContext = timer?.getContext?.() as any;

  const duration =
    timerContext?.totalMinutes ??
    timerContext?.durationMinutes ??
    timerContext?.total ??
    sessionDuration;

  const elapsed =
    timerContext?.elapsedMinutes ??
    timerContext?.elapsed ??
    elapsedTime;
  const formatTime = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = Math.floor((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration ? (elapsed / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Clock className="w-4 h-4" />
      <span>{formatTime(elapsed)} / {formatTime(duration)}</span>
      <div className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}