'use client';

import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import type { SessionTimeContext, SessionTimer } from '@/lib/session/SessionTimer';

interface SessionTimeAwarenessProps {
  sessionDuration?: number;
  elapsedTime?: number;
  onTimeUpdate?: (elapsed: number) => void;
  timer?: SessionTimer;
  onExtend?: (additionalMinutes: number) => void;
}

/**
 * One temporal source for the display and MAIA's own temporal context.
 * A session extension updates the timer instance; never display a separate
 * default 30-minute clock while the active timer says something else.
 */
export function SessionTimeAwareness({
  sessionDuration = 30,
  elapsedTime = 0,
  onTimeUpdate,
  timer,
}: SessionTimeAwarenessProps) {
  const [clock, setClock] = useState<SessionTimeContext | null>(null);

  useEffect(() => {
    if (!timer) {
      setClock(null);
      return;
    }
    const update = () => {
      const current = timer.getTimeContext();
      setClock(current);
      onTimeUpdate?.(current.elapsedMinutes);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [timer, onTimeUpdate]);

  const elapsed = clock?.elapsedMinutes ?? elapsedTime;
  const total = clock?.totalMinutes ?? sessionDuration;
  const progress = total > 0 ? Math.min(100, Math.max(0, (elapsed / total) * 100)) : 0;

  const formatTime = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = Math.floor((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 text-sm text-stone-300" role="timer" aria-live="off">
      <Clock className="h-4 w-4" aria-hidden="true" />
      <span>{formatTime(elapsed)} / {formatTime(total)}</span>
      <div
        className="h-1 w-20 overflow-hidden rounded-full bg-stone-700"
        role="progressbar"
        aria-label="Session time elapsed"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div className="h-full bg-stone-300 transition-all" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
