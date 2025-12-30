// frontend
// apps/web/hooks/useScribeMode.ts

'use client';

import { useState, useCallback } from 'react';

export interface ScribeSession {
  id: string;
  startTime: Date;
  transcript: string;
  consultations: string[];
  // OracleConversation-expected properties
  voiceTranscripts?: Array<{ content: string; timestamp: Date; speaker: string }>;
  consultationMessages?: string[];
}

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

// Extended interface for OracleConversation compatibility
export interface ScribeModeHook extends ScribeModeState, ScribeModeActions {
  // OracleConversation-expected aliases
  isScribing: boolean;
  currentSession: ScribeSession | null;
  startScribing: () => void;
  stopScribing: () => void;
  recordVoiceTranscript: (text: string | { content: string; timestamp: Date; speaker: string; metadata?: Record<string, unknown> }) => void;
  recordConsultation: (speaker: string, text?: string) => void;
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
  const [currentSession, setCurrentSession] = useState<ScribeSession | null>(null);

  const toggleScribeMode = useCallback(() => {
    setIsActive(prev => !prev);
    setLastActivity(new Date());
    // If turning off, stop any recording
    if (isActive) {
      setIsRecording(false);
      setCurrentSession(null);
    }
  }, [isActive]);

  const startScribe = useCallback(() => {
    setIsActive(true);
    setIsRecording(true);
    setLastActivity(new Date());
    setCurrentSession({
      id: `scribe-${Date.now()}`,
      startTime: new Date(),
      transcript: '',
      consultations: [],
    });
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

  // OracleConversation-expected functions (stubs/aliases)
  const recordVoiceTranscript = useCallback((text: string | { content: string; timestamp: Date; speaker: string; metadata?: Record<string, unknown> }) => {
    const textContent = typeof text === 'string' ? text : text.content;
    appendTranscript(textContent);
  }, [appendTranscript]);

  const recordConsultation = useCallback((speaker: string, text?: string) => {
    const consultationText = text ?? speaker;
    setCurrentSession(prev => prev ? {
      ...prev,
      consultations: [...prev.consultations, consultationText]
    } : null);
  }, []);

  const generateSynopsis = useCallback(async (): Promise<string> => {
    return transcript || 'No transcript recorded.';
  }, [transcript]);

  const downloadTranscript = useCallback(() => {
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scribe-transcript-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transcript]);

  const getTranscriptForReview = useCallback(() => {
    return transcript;
  }, [transcript]);

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

    // OracleConversation aliases
    isScribing: isActive,
    currentSession,
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
