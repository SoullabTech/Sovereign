// frontend
// apps/web/components/session/SessionTimeAwareness.tsx

'use client';

import React from 'react';

export interface SessionTimeAwarenessProps {
  /**
   * Whether to show the time awareness component
   */
  isVisible?: boolean;

  /**
   * Current session duration in minutes
   */
  sessionDuration?: number;

  /**
   * Remaining time in seconds (if in an active session)
   */
  remainingTime?: number;

  /**
   * Whether the session is currently active
   */
  isActive?: boolean;

  /**
   * Optional callback when time awareness state changes
   */
  onTimeAwarenessChange?: (isAware: boolean) => void;

  /**
   * Visual style variant
   */
  variant?: 'subtle' | 'prominent' | 'minimal';

  /**
   * Optional custom className
   */
  className?: string;
}

/**
 * Component that provides gentle time awareness during MAIA sessions.
 * Shows session progress and remaining time in a non-intrusive way.
 */
const SessionTimeAwareness: React.FC<SessionTimeAwarenessProps> = ({
  isVisible = true,
  sessionDuration = 0,
  remainingTime = 0,
  isActive = false,
  onTimeAwarenessChange,
  variant = 'subtle',
  className = '',
}) => {
  if (!isVisible) return null;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    if (!sessionDuration || sessionDuration === 0) return 0;
    const totalSeconds = sessionDuration * 60;
    const elapsedSeconds = totalSeconds - remainingTime;
    return Math.max(0, Math.min(100, (elapsedSeconds / totalSeconds) * 100));
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'prominent':
        return 'bg-amber-950/20 border-amber-500/30 p-3 rounded-lg';
      case 'minimal':
        return 'bg-transparent border-none p-1';
      case 'subtle':
      default:
        return 'bg-amber-950/10 border-amber-500/20 p-2 rounded-md border';
    }
  };

  const getTimeDisplay = () => {
    if (!isActive) {
      return sessionDuration > 0 ? `${sessionDuration} min session` : 'No active session';
    }
    return formatTime(remainingTime);
  };

  const progressPercentage = getProgressPercentage();

  return (
    <div className={`session-time-awareness ${getVariantStyles()} ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-amber-200/80 font-medium">
          {isActive ? 'Time Remaining' : 'Session Length'}
        </span>
        <span className="text-amber-100 font-mono">
          {getTimeDisplay()}
        </span>
      </div>

      {isActive && sessionDuration > 0 && (
        <div className="mt-2 w-full">
          <div className="w-full bg-amber-950/30 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-400 h-1.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-[10px] text-amber-300/60 mt-1 text-center">
            {Math.round(progressPercentage)}% complete
          </div>
        </div>
      )}

      {variant === 'prominent' && isActive && (
        <div className="mt-2 text-[10px] text-amber-200/60">
          Sacred time flows naturally. Allow yourself to be present.
        </div>
      )}
    </div>
  );
};

export default SessionTimeAwareness;
export { SessionTimeAwareness };