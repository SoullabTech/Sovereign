'use client';

import React, { useEffect, useRef } from 'react';

interface SessionRitualOpeningProps {
  onComplete?: () => void;
  userName?: string;
  isOpen?: boolean;
  sessionDuration?: number;
  isReturningUser?: boolean;
  onSkip?: () => void;
}

/**
 * The duration selector supplies the deliberate opening gesture. The current
 * lightweight opening surface then advances exactly once per actual open.
 *
 * Mounting the component with isOpen=false, a new callback on rerender, or
 * React StrictMode's repeated effect setup must never start a conversation.
 */
export function SessionRitualOpening({
  isOpen,
  onComplete,
}: SessionRitualOpeningProps) {
  const lastCompletion = useRef(onComplete);
  const startedForThisOpen = useRef(false);

  useEffect(() => {
    lastCompletion.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (isOpen !== true) {
      startedForThisOpen.current = false;
      return;
    }
    if (startedForThisOpen.current) return;
    startedForThisOpen.current = true;
    lastCompletion.current?.();
  }, [isOpen]);

  return null;
}
