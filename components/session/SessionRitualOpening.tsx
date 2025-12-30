'use client';

import React, { useEffect } from 'react';

interface SessionRitualOpeningProps {
  onComplete?: () => void;
  userName?: string;
  // OracleConversation-expected properties
  isOpen?: boolean;
  sessionDuration?: number;
  isReturningUser?: boolean;
  onSkip?: () => void;
}

export function SessionRitualOpening({ onComplete, userName }: SessionRitualOpeningProps) {
  // Auto-complete immediately without showing any UI
  useEffect(() => {
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  // Return nothing - no background, no text, no elements
  return null;
}