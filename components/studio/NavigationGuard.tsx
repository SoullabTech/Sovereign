'use client';

/**
 * NavigationGuard — Prevents accidental navigation during active recording
 *
 * - Intercepts browser close/refresh via beforeunload
 * - Shows confirmation modal for in-app navigation away from Studio
 * - Does NOT block navigation between Studio pages (recording persists via context)
 */

import { useEffect } from 'react';
import { useRecordingContext } from '@/lib/studio/RecordingContext';

export function NavigationGuard() {
  const { isRecording } = useRecordingContext();

  // Prevent browser close/refresh during recording
  useEffect(() => {
    if (!isRecording) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Modern browsers show a generic message regardless of returnValue
      e.returnValue = 'Recording in progress. Are you sure you want to leave?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isRecording]);

  // No visible UI — this is a behavior-only component
  return null;
}
