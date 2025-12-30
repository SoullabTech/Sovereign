'use client';

import React, { useEffect } from 'react';

interface SessionRitualClosingProps {
  onComplete?: () => void;
  sessionSummary?: string;
  // Additional props from OracleConversation
  isOpen?: boolean;
  isReturningUser?: boolean;
  onSkip?: () => void;
}

export function SessionRitualClosing({
  onComplete,
  sessionSummary,
  isOpen,
  isReturningUser,
  onSkip
}: SessionRitualClosingProps) {
  // Auto-complete immediately without showing any UI
  useEffect(() => {
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  // Return nothing - no background, no text, no elements
  return null;
}