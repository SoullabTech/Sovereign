// frontend
// apps/web/hooks/useScribeMode.ts

'use client';

import { useState, useCallback } from 'react';

export interface ScribeModeState {
  isActive: boolean;
  transcript: string;
  isRecording: boolean;
  lastActivity?: Date;
}

export interface ScribeModeActions {
  toggleScribeMode: () => void;
  startScribe: () => void;
  stopScribe: () => void;
  setTranscript: (text: string) => void;
  appendTranscript: (text: string) => void;
  clearTranscript: () => void;
}

export interface ScribeModeHook extends ScribeModeState, ScribeModeActions {}

/**
 * Hook for managing scribe mode functionality in OracleConversation.
 * Handles transcription state, recording state, and related actions.
 */
export function useScribeMode(): ScribeModeHook {
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscriptState] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [lastActivity, setLastActivity] = useState<Date | undefined>();

  const toggleScribeMode = useCallback(() => {
    setIsActive(prev => !prev);
    setLastActivity(new Date());
    // If turning off, stop any recording
    if (isActive) {
      setIsRecording(false);
    }
  }, [isActive]);

  const startScribe = useCallback(() => {
    setIsActive(true);
    setIsRecording(true);
    setLastActivity(new Date());
  }, []);

  const stopScribe = useCallback(() => {
    setIsRecording(false);
    setLastActivity(new Date());
  }, []);

  const setTranscript = useCallback((text: string) => {
    setTranscriptState(text);
    setLastActivity(new Date());
  }, []);

  const appendTranscript = useCallback((text: string) => {
    setTranscriptState(prev => prev + text);
    setLastActivity(new Date());
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscriptState('');
    setLastActivity(new Date());
  }, []);

  return {
    // State
    isActive,
    transcript,
    isRecording,
    lastActivity,

    // Actions
    toggleScribeMode,
    startScribe,
    stopScribe,
    setTranscript,
    appendTranscript,
    clearTranscript,
  };
}

export default useScribeMode;