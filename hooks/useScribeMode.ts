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

// Extended interface with backward-compatible aliases for OracleConversation.tsx
export interface ScribeModeHook extends ScribeModeState, ScribeModeActions {
  // Aliases for backward compatibility
  isScribing: boolean;
  currentSession: any;
  startScribing: () => void;
  stopScribing: () => void;
  recordVoiceTranscript: (text: string) => void;
  recordConsultation: (role: string, text: string) => void;
  generateSynopsis: () => Promise<string>;
  downloadTranscript: () => void;
  getTranscriptForReview: () => string;
}

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

    // Backward-compatible aliases for OracleConversation.tsx
    isScribing: isActive,
    currentSession: null,
    startScribing: startScribe,
    stopScribing: stopScribe,
    recordVoiceTranscript: appendTranscript,
    recordConsultation: (role: string, text: string) => appendTranscript(`[${role}]: ${text}\n`),
    generateSynopsis: async () => transcript,
    downloadTranscript: () => {
      // Simple download of transcript
      const blob = new Blob([transcript], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scribe-session-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    },
    getTranscriptForReview: () => transcript,
  };
}

export default useScribeMode;