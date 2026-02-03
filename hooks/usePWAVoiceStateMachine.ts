/**
 * PWA Voice State Machine
 *
 * A first-class voice interface for Safari PWA with confirmed transitions.
 * This is SEPARATE from iOS native voice handling.
 *
 * States:
 * - IDLE: Not in voice mode
 * - ARMING_AUDIO: User gesture happened, unlocking audio context
 * - LISTENING: Microphone confirmed active (not hopeful)
 * - THINKING: Request sent, waiting for response
 * - SPEAKING: TTS confirmed playing (not hopeful)
 * - DISPLAYING_TEXT: No audio; user reads response
 * - HANDOFF: Cooldown between speaking and listening
 * - ERROR_RECOVERY: Explicit error state
 *
 * Rules:
 * - NO optimistic state changes
 * - Transitions only happen on confirmed events
 * - muted/listening invariant: they cannot both be true
 */

import { useState, useCallback, useRef, useEffect } from 'react';

// Voice loop states
export type PWAVoiceState =
  | 'IDLE'
  | 'ARMING_AUDIO'
  | 'MIC_WAKING'        // Safari PWA mic handoff delay - "Mic waking..."
  | 'LISTENING'
  | 'THINKING'
  | 'SPEAKING'
  | 'DISPLAYING_TEXT'
  | 'HANDOFF'
  | 'NEEDS_TAP_TO_ENABLE_AUDIO'  // Safari PWA blocked audio - needs fresh gesture
  | 'ERROR_RECOVERY';

// Flight recorder event types
export type FlightEvent = {
  timestamp: number;
  event: string;
  fromState: PWAVoiceState;
  toState: PWAVoiceState;
  detail?: string;
};

export type UsePWAVoiceStateMachineOptions = {
  enabled: boolean;
  enableAudio?: () => Promise<void>;
  startMic?: () => Promise<boolean>;
  stopMic?: () => void;
  onFlightEvent?: (event: FlightEvent) => void;
  onStateChange?: (state: PWAVoiceState) => void;
};

export function usePWAVoiceStateMachine(opts: UsePWAVoiceStateMachineOptions) {
  const [state, setState] = useState<PWAVoiceState>('IDLE');
  const flightLog = useRef<FlightEvent[]>([]);
  const handoffTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Stable refs for callbacks
  const optsRef = useRef(opts);
  optsRef.current = opts;

  // Flight recorder
  const recordTransition = useCallback((event: string, toState: PWAVoiceState, detail?: string) => {
    const fromState = state;
    const entry: FlightEvent = {
      timestamp: Date.now(),
      event,
      fromState,
      toState,
      detail,
    };
    flightLog.current.push(entry);

    // Keep last 50 events
    if (flightLog.current.length > 50) {
      flightLog.current = flightLog.current.slice(-50);
    }

    optsRef.current.onFlightEvent?.(entry);
    console.log(`[PWA Voice] ${event}: ${fromState} → ${toState}${detail ? ` (${detail})` : ''}`);
  }, [state]);

  // State transition with logging
  const transition = useCallback((event: string, toState: PWAVoiceState, detail?: string) => {
    setState(prev => {
      if (prev === toState) return prev; // No change
      recordTransition(event, toState, detail);
      optsRef.current.onStateChange?.(toState);
      return toState;
    });
  }, [recordTransition]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (handoffTimeoutRef.current) {
        clearTimeout(handoffTimeoutRef.current);
      }
    };
  }, []);

  // === USER INTENTS ===

  const userWantsToStart = useCallback(async () => {
    if (!optsRef.current.enabled) return;

    // Allow start from IDLE, DISPLAYING_TEXT, ERROR_RECOVERY, or NEEDS_TAP_TO_ENABLE_AUDIO
    const validStates = ['IDLE', 'DISPLAYING_TEXT', 'ERROR_RECOVERY', 'NEEDS_TAP_TO_ENABLE_AUDIO'];
    if (!validStates.includes(state)) {
      console.log('[PWA Voice] userWantsToStart ignored - invalid state:', state);
      return;
    }

    // Step 1: Arm audio context (requires user gesture)
    transition('USER_TAP_START', 'ARMING_AUDIO');

    try {
      if (optsRef.current.enableAudio) {
        await optsRef.current.enableAudio();
      }
      // Transition to MIC_WAKING - shows "Mic waking..." in UI
      transition('AUDIO_UNLOCKED', 'MIC_WAKING', 'audio context ready, starting mic...');
    } catch (err) {
      transition('AUDIO_UNLOCK_FAILED', 'ERROR_RECOVERY', String(err));
      return;
    }

    // Step 2: Start microphone
    try {
      if (optsRef.current.startMic) {
        const started = await optsRef.current.startMic();
        if (started) {
          // Stay in MIC_WAKING - micConfirmed() will transition to LISTENING
          console.log('[PWA Voice] Mic start requested, waiting for confirmation...');
        } else {
          transition('MIC_START_FAILED', 'ERROR_RECOVERY', 'startMic returned false');
        }
      } else {
        // No startMic provided - transition anyway (component will handle)
        // Wait for micConfirmed() call
        console.log('[PWA Voice] No startMic callback, waiting for micConfirmed()');
      }
    } catch (err) {
      transition('MIC_START_ERROR', 'ERROR_RECOVERY', String(err));
    }
  }, [state, transition]);

  const userWantsToStop = useCallback(() => {
    if (!optsRef.current.enabled) return;

    // Clear any pending handoff
    if (handoffTimeoutRef.current) {
      clearTimeout(handoffTimeoutRef.current);
      handoffTimeoutRef.current = null;
    }

    optsRef.current.stopMic?.();
    transition('USER_TAP_STOP', 'IDLE');
  }, [transition]);

  // === MIC SIGNALS (from component) ===

  const micConfirmed = useCallback(() => {
    if (!optsRef.current.enabled) return;

    // Accept mic confirmation from ARMING_AUDIO, MIC_WAKING, or HANDOFF
    if (state === 'ARMING_AUDIO' || state === 'MIC_WAKING' || state === 'HANDOFF') {
      transition('MIC_LISTENING_CONFIRMED', 'LISTENING');
    }
  }, [state, transition]);

  const micStopped = useCallback(() => {
    if (!optsRef.current.enabled) return;

    if (state === 'LISTENING') {
      // Mic stopped unexpectedly while listening
      transition('MIC_STOPPED_UNEXPECTED', 'ERROR_RECOVERY', 'mic stopped while listening');
    }
  }, [state, transition]);

  // === TRANSCRIPT SIGNALS ===

  const transcriptReceived = useCallback((transcript: string) => {
    if (!optsRef.current.enabled) return;

    if (state === 'LISTENING') {
      transition('FINAL_TRANSCRIPT_RECEIVED', 'THINKING', transcript.slice(0, 50));
    }
  }, [state, transition]);

  // === RESPONSE SIGNALS ===

  const responseTextReady = useCallback(() => {
    if (!optsRef.current.enabled) return;

    if (state === 'THINKING') {
      // Response text is ready, but we stay in THINKING until audio confirms
      // (or goes to DISPLAYING_TEXT if no audio)
      console.log('[PWA Voice] Response text ready, waiting for audio signal...');
    }
  }, [state]);

  // === PLAYBACK SIGNALS ===

  const audioPlayingConfirmed = useCallback(() => {
    if (!optsRef.current.enabled) return;

    // Only transition to SPEAKING when audio is CONFIRMED playing
    if (state === 'THINKING' || state === 'ARMING_AUDIO') {
      transition('AUDIO_PLAYING_CONFIRMED', 'SPEAKING');
    }
  }, [state, transition]);

  const audioEnded = useCallback(() => {
    if (!optsRef.current.enabled) return;

    if (state === 'SPEAKING') {
      transition('SPEAKING_END', 'HANDOFF');

      // Start handoff timeout to restart mic
      handoffTimeoutRef.current = setTimeout(() => {
        if (optsRef.current.startMic) {
          console.log('[PWA Voice] Handoff complete, restarting mic...');
          optsRef.current.startMic().catch(err => {
            console.error('[PWA Voice] Mic restart failed:', err);
            transition('MIC_RESTART_FAILED', 'ERROR_RECOVERY', String(err));
          });
        }
      }, 300); // Small delay for audio session handoff
    }
  }, [state, transition]);

  const ttsFailedOrSkipped = useCallback((reason?: string) => {
    if (!optsRef.current.enabled) return;

    if (state === 'THINKING' || state === 'SPEAKING') {
      // Check if this is a Safari PWA autoplay block (needs fresh user gesture)
      const isAutoplayBlock = reason?.includes('NotAllowed') || reason?.includes('autoplay');

      if (isAutoplayBlock) {
        // Safari PWA needs a fresh tap to enable audio
        transition('AUDIO_AUTOPLAY_BLOCKED', 'NEEDS_TAP_TO_ENABLE_AUDIO', reason);
      } else {
        // Other audio failure - show text instead
        transition('AUDIO_BLOCKED_OR_FAILED', 'DISPLAYING_TEXT', reason);
      }
    }
  }, [state, transition]);

  // === TEXT DISPLAY SIGNALS ===

  const textReadComplete = useCallback(() => {
    if (!optsRef.current.enabled) return;

    if (state === 'DISPLAYING_TEXT') {
      // User has had time to read, transition to handoff
      transition('TEXT_READ_TIMEOUT', 'HANDOFF');

      // Restart mic after short delay
      handoffTimeoutRef.current = setTimeout(() => {
        if (optsRef.current.startMic) {
          console.log('[PWA Voice] Text read complete, restarting mic...');
          optsRef.current.startMic().catch(err => {
            console.error('[PWA Voice] Mic restart failed:', err);
          });
        }
      }, 300);
    }
  }, [state, transition]);

  // === DERIVED FLAGS ===

  const isListening = state === 'LISTENING';
  const isMuted = state === 'IDLE' || state === 'DISPLAYING_TEXT' || state === 'ERROR_RECOVERY' || state === 'NEEDS_TAP_TO_ENABLE_AUDIO';
  const isThinkingOrSpeaking = state === 'THINKING' || state === 'SPEAKING';
  const isArming = state === 'ARMING_AUDIO';
  const isMicWaking = state === 'MIC_WAKING';  // Show "Mic waking..." in UI
  const isHandoff = state === 'HANDOFF';
  const isError = state === 'ERROR_RECOVERY';
  const isDisplayingText = state === 'DISPLAYING_TEXT';
  const needsTapToEnableAudio = state === 'NEEDS_TAP_TO_ENABLE_AUDIO';  // Show "Tap to enable voice"

  // Invariant check (for debugging)
  if (isListening && isMuted) {
    console.error('[PWA Voice] INVARIANT VIOLATION: isListening && isMuted both true!');
  }

  return {
    // State
    state,
    flightLog: flightLog.current,

    // Derived flags (use these in UI)
    isListening,
    isMuted,
    isThinkingOrSpeaking,
    isArming,
    isMicWaking,
    isHandoff,
    isError,
    isDisplayingText,
    needsTapToEnableAudio,

    // User intents
    userWantsToStart,
    userWantsToStop,

    // Mic signals
    micConfirmed,
    micStopped,

    // Transcript signals
    transcriptReceived,

    // Response signals
    responseTextReady,

    // Playback signals
    audioPlayingConfirmed,
    audioEnded,
    ttsFailedOrSkipped,

    // Text display signals
    textReadComplete,
  };
}
