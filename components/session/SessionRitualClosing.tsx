'use client';

import React, { useEffect } from 'react';

interface SessionRitualClosingProps {
  onComplete?: () => void;
  sessionSummary?: string;
}

export function SessionRitualClosing({ onComplete, sessionSummary }: SessionRitualClosingProps) {
  // Auto-complete immediately without showing any UI
  useEffect(() => {
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  // Return nothing - no background, no text, no elements
  return null;
}