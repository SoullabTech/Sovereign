'use client';

import { useCallback, useRef, useEffect, useState } from 'react';
import type {
  VoiceSessionState,
  VoiceSessionMethods,
  UseVoiceSessionResult,
  VoicePhase,
  VoiceCapabilities,
  TranscriptHandler,
  PhaseChangeHandler,
  ErrorHandler,
} from '@/lib/voice/VoiceSessionState';
import type { ContinuousConversationRef, MicState } from '@/components/voice/ContinuousConversation';

/**
 * useVoiceSession — Clean public interface to voice transport layer
 *
 * Wraps ContinuousConversation ref in a stable API that orchestration can consume.
 * Transport engineers can refactor internals without breaking session code.
 *
 * @param continuousConvRef - Ref to mounted ContinuousConversation component
 * @param isSpeaking - Parent-provided signal (MAIA is speaking)
 * @param isProcessing - Parent-provided signal (Oracle processing, mic suppressed)
 * @returns { state, methods, onTranscript, onPhaseChange, onError }
 */
export function useVoiceSession(
  continuousConvRef: React.RefObject<ContinuousConversationRef | null>,
  isSpeaking: boolean,
  isProcessing: boolean
): UseVoiceSessionResult {
  // Session state mirroring
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<Error | null>(null);

  // Event handler registries
  const onTranscriptCallbacks = useRef<Set<TranscriptHandler>>(new Set());
  const onPhaseChangeCallbacks = useRef<Set<PhaseChangeHandler>>(new Set());
  const onErrorCallbacks = useRef<Set<ErrorHandler>>(new Set());

  // Track previous phase to detect changes
  const prevPhaseRef = useRef<VoicePhase | null>(null);

  // Compute current VoicePhase from component state
  const getPhase = useCallback((): VoicePhase => {
    const ref = continuousConvRef.current;
    if (!ref) return 'idle';

    const micState: MicState = ref.micState;

    // Map MicState → VoicePhase
    switch (micState) {
      case 'IDLE': return 'idle';
      case 'ARMING': return 'arming';
      case 'LISTENING': return 'listening';
      case 'CAPTURING': return 'capturing';
      case 'SUBMITTING': return 'submitting';
      case 'WAITING_FOR_TTS': return 'processing';
      case 'PLAYING_TTS': return 'speaking';
      case 'INTERRUPTED': return 'interrupted';
      case 'ERROR': return 'error';
      default: return 'idle';
    }
  }, [continuousConvRef]);

  // Detect phase changes and emit events
  useEffect(() => {
    const currentPhase = getPhase();
    if (prevPhaseRef.current !== currentPhase) {
      prevPhaseRef.current = currentPhase;
      // Notify all listeners
      onPhaseChangeCallbacks.current.forEach(handler => handler(currentPhase));
    }
  }, [getPhase]);

  // Methods exposed to orchestration
  const methods: VoiceSessionMethods = {
    async startListening(reason: string) {
      const ref = continuousConvRef.current;
      if (ref?.startListening) {
        try {
          await ref.startListening();
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          onErrorCallbacks.current.forEach(handler => handler(error));
          throw error;
        }
      }
    },

    stopListening() {
      const ref = continuousConvRef.current;
      if (ref?.stopListening) {
        ref.stopListening();
      }
    },

    interrupt() {
      const ref = continuousConvRef.current;
      if (ref?.extendRecording) {
        // extendRecording is a way to extend the current input window
        // used when user needs to add more before sending
        ref.extendRecording();
      }
    },

    clearError() {
      setError(null);
    },

    cleanup() {
      const ref = continuousConvRef.current;
      if (ref?.stopListening) {
        ref.stopListening();
      }
    },
  };

  // Event subscription functions
  const onTranscript = useCallback((handler: TranscriptHandler): (() => void) => {
    onTranscriptCallbacks.current.add(handler);
    return () => onTranscriptCallbacks.current.delete(handler);
  }, []);

  const onPhaseChange = useCallback((handler: PhaseChangeHandler): (() => void) => {
    onPhaseChangeCallbacks.current.add(handler);
    return () => onPhaseChangeCallbacks.current.delete(handler);
  }, []);

  const onError = useCallback((handler: ErrorHandler): (() => void) => {
    onErrorCallbacks.current.add(handler);
    return () => onErrorCallbacks.current.delete(handler);
  }, []);

  // Utility: Is this platform iOS?
  const isIOSPlatform = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    return /iPhone|iPad|iPod/.test(navigator.userAgent);
  }, []);

  // Utility: Is this platform Android?
  const isAndroidPlatform = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    return /Android/.test(navigator.userAgent);
  }, []);

  // Compute public state
  const currentPhase = getPhase();
  const ref = continuousConvRef.current;
  const isRecording = ref?.isRecording ?? false;
  const isListening = ref?.isListening ?? false;
  const isRecovering = currentPhase === 'arming'; // TODO: wire from ContinuousConversation recovery flag

  // Derive capabilities based on phase + context
  // (These can differ for same phase under different modes)
  const capabilities: VoiceCapabilities = {
    canStartListening: currentPhase === 'idle' && !error && !isSpeaking && !isProcessing,
    canStopListening: (currentPhase === 'listening' || currentPhase === 'capturing' || currentPhase === 'arming') && !isSpeaking,
    canInterrupt: (currentPhase === 'capturing' || currentPhase === 'submitting') && !isSpeaking,
    canSubmit: currentPhase === 'capturing' && !isSpeaking && transcript.trim().length > 0,
    canClearError: error !== null,
  };

  const state: VoiceSessionState = {
    // State (what is happening)
    phase: currentPhase,
    transcript,
    interimTranscript: '', // TODO: wire from ContinuousConversation interim results
    error,

    // Context (where we are)
    isRecording,
    platform: isIOSPlatform() ? 'ios' : isAndroidPlatform() ? 'android' : 'web',
    isRecovering,

    // Capabilities (what we can do — UI should use this for action enablement)
    capabilities,

    // Metadata
    lastSpeechAt: 0, // TODO: wire from ContinuousConversation ref
    startedAt: Date.now(), // TODO: wire from ContinuousConversation ref
    conversationAlive: isListening && !isSpeaking, // Simplified: adjust if needed
  };

  return {
    state,
    methods,
    // ⛔ PLATFORM-SOVEREIGN-REENTRY-01. `getPhase` already reads the live ref;
    // it was simply never exposed, so consumers had only the render snapshot.
    getPhase,
    onTranscript,
    onPhaseChange,
    onError,
  };
}
