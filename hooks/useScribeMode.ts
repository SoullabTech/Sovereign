// frontend
// apps/web/hooks/useScribeMode.ts

'use client';

import { useState, useCallback } from 'react';

export interface ScribeSession {
  id: string;
  startedAt: Date;
  transcript: string;
  voiceTranscripts?: string[];
  consultationMessages?: string[];
}

export interface ScribeModeState {
  isActive: boolean;
  transcript: string;
  isRecording: boolean;
  lastActivity?: Date;
  // Aliases expected by OracleConversation
  isScribing: boolean;
  currentSession: ScribeSession | null;
}

export interface ScribeModeActions {
  toggleScribeMode: () => void;
  startScribe: () => void;
  stopScribe: () => void;
  setTranscript: (text: string) => void;
  appendTranscript: (text: string) => void;
  clearTranscript: () => void;
  // Actions expected by OracleConversation
  startScribing: () => void;
  stopScribing: () => void;
  recordVoiceTranscript: (text: string) => void;
  recordConsultation: (roleOrText: string, text?: string) => void;
  generateSynopsis: () => Promise<string>;
  downloadTranscript: () => void;
  getTranscriptForReview: () => string;
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

  // Session management for OracleConversation compatibility
  const currentSession: ScribeSession | null = isActive ? {
    id: 'scribe-session',
    startedAt: lastActivity || new Date(),
    transcript,
  } : null;

  const recordVoiceTranscript = useCallback((text: string) => {
    appendTranscript(text);
  }, [appendTranscript]);

  const recordConsultation = useCallback((roleOrText: string, text?: string) => {
    const actualText = text ?? roleOrText;
    const role = text ? roleOrText : 'consultation';
    appendTranscript(`\n[${role}]: ${actualText}`);
  }, [appendTranscript]);

  const generateSynopsis = useCallback(async (): Promise<string> => {
    return transcript ? `Synopsis: ${transcript.substring(0, 200)}...` : '';
  }, [transcript]);

  const downloadTranscript = useCallback(() => {
    if (typeof window !== 'undefined' && transcript) {
      const blob = new Blob([transcript], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scribe-transcript-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [transcript]);

  const getTranscriptForReview = useCallback((): string => {
    return transcript;
  }, [transcript]);

  return {
    // State
    isActive,
    transcript,
    isRecording,
    lastActivity,
    // Aliases for OracleConversation
    isScribing: isActive,
    currentSession,

    // Actions
    toggleScribeMode,
    startScribe,
    stopScribe,
    setTranscript,
    appendTranscript,
    clearTranscript,
    // Actions for OracleConversation
    startScribing: startScribe,
    stopScribing: stopScribe,
    recordVoiceTranscript,
    recordConsultation,
    generateSynopsis,
    downloadTranscript,
    getTranscriptForReview,
  };
}

export default useScribeMode;