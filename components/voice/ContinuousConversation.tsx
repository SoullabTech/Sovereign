"use client";

import React, { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
import { Mic, MicOff, Loader2, Activity, Wifi, WifiOff, AlertCircle } from "lucide-react";
import VoiceFeedbackPrevention from "@/lib/voice/voice-feedback-prevention";
import { getPlatformInfo, getVoiceUnavailableMessage, isAndroidWebChrome, hasSpeechRecognitionAPI, type PlatformInfo } from "@/lib/utils/platformDetection";
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition as NativeSpeechRecognition } from '@capacitor-community/speech-recognition';
import { VoiceController } from '@/lib/voice/AudioSessionManager';
import { getFeatureFlag } from '@/lib/features/flags';
import { logVoiceEvent, resetVoiceSession } from '@/lib/voice/voiceDiagnostics';
import { pushVoiceDebug } from '@/lib/voice/voiceDebugBus';
import { WebSpeechRecognitionSession, classifyRecognitionError } from '@/lib/voice/webSpeechLifecycle';
import {
  createUtteranceGuardState,
  beginUtterance,
  trySubmitUtterance,
} from '@/lib/voice/utteranceSubmissionGuard';
// import { Analytics } from "../../lib/analytics/supabaseAnalytics"; // Disabled for Vercel build

// =============================================================================
// 🎙️ VOICE STATE MACHINE — Single authority for mic lifecycle
// =============================================================================
// Rule: ONLY requestRestart() can move from IDLE → ARMING → LISTENING.
// Everything else (OracleConversation, StreamingVoice, etc.) emits events
// that ContinuousConversation processes. No external code touches mic directly.

export type ListeningMode = 'PUSH_TO_TALK' | 'HANDS_FREE' | 'OFF';

export type MicState =
  | 'IDLE'                  // Mic off, ready for user tap
  | 'ARMING'                // Permissions/setup in progress
  | 'LISTENING'             // Mic active, waiting for speech
  | 'CAPTURING'             // User speaking, accumulating transcript
  | 'SUBMITTING'            // Transcript sent, waiting for response
  | 'WAITING_FOR_TTS'       // MAIA processing, mic paused
  | 'PLAYING_TTS'           // MAIA speaking, mic off (native) or suppressed (web)
  | 'INTERRUPTED'           // iOS audio interruption (phone call, Siri, etc.)
  | 'ERROR';                // Recoverable error state

/** Conversation-alive gate: is the conversation still active? */
function isConversationAlive(ctx: {
  lastTranscriptAt: number;
  lastAudioEndAt: number;
  lastMicTapAt: number;
}): boolean {
  const now = Date.now();
  return (
    (ctx.lastTranscriptAt > 0 && now - ctx.lastTranscriptAt < 30_000) ||
    (ctx.lastAudioEndAt > 0 && now - ctx.lastAudioEndAt < 15_000) ||
    (ctx.lastMicTapAt > 0 && now - ctx.lastMicTapAt < 10_000)
  );
}

/**
 * Authority guard: log + enforce single-conductor restart policy.
 *
 * This is the ONE function that decides whether a mic restart is allowed.
 * Every restart path (listeningState:stopped, maia_stopped_speaking, user_tap,
 * interruption_end) calls this. If it returns { allowed: false }, the restart
 * does not happen. The structured log line is the single diagnostic artifact
 * for every "why didn't mic restart?" question.
 *
 * Allowed overrides:
 *   - user_tap (explicit user gesture — always allowed if mic is IDLE)
 * Blocked conditions:
 *   - restart already in flight (prevents overlapping timers)
 *   - mic not IDLE or ERROR (can't start while already listening/arming/playing)
 *   - iOS + PUSH_TO_TALK + non-user source (platform ontology)
 *   - active audio playback / responding / processing (via caller gates)
 *   - iOS permission failure (via ensureNativeSpeechReady, upstream)
 */
function authorityGuard(args: {
  source: string;
  micState: MicState;
  listeningMode: ListeningMode;
  restartInFlight: boolean;
  lastSpeechAt: number;
  backoffStep: number;
  /** Extra context for structured logging */
  isMuted?: boolean;
  isResponding?: boolean;
  isAudioPlaying?: boolean;
  isProcessing?: boolean;
}): { allowed: boolean; reason?: string } {
  // 📊 STRUCTURED LOG: One line that tells you everything
  const snapshot = {
    voice_mode: args.listeningMode === 'HANDS_FREE' ? 'hands_free' : args.listeningMode === 'OFF' ? 'off' : 'push_to_talk',
    source: args.source,
    mic: args.micState,
    inflight: args.restartInFlight,
    speech: args.lastSpeechAt > 0 ? `${Math.round((Date.now() - args.lastSpeechAt) / 1000)}s` : 'never',
    backoff: args.backoffStep,
    muted: args.isMuted ?? null,
    responding: args.isResponding ?? null,
    audioPlaying: args.isAudioPlaying ?? null,
    processing: args.isProcessing ?? null,
  };

  if (args.restartInFlight) {
    console.log('🛡️ [AUTHORITY] BLOCKED', JSON.stringify({ ...snapshot, decision: 'blocked', block_reason: 'restart_in_flight' }));
    return { allowed: false, reason: 'restart_in_flight' };
  }
  if (args.micState !== 'IDLE' && args.micState !== 'ERROR') {
    console.log('🛡️ [AUTHORITY] BLOCKED', JSON.stringify({ ...snapshot, decision: 'blocked', block_reason: `mic_state_${args.micState}` }));
    return { allowed: false, reason: `mic_state_${args.micState}` };
  }
  // On native iOS, only auto-restart in HANDS_FREE mode
  if (Capacitor.isNativePlatform() && args.listeningMode !== 'HANDS_FREE' && args.source !== 'user_tap') {
    console.log('🛡️ [AUTHORITY] BLOCKED', JSON.stringify({ ...snapshot, decision: 'blocked', block_reason: 'push_to_talk_no_auto_restart' }));
    return { allowed: false, reason: 'push_to_talk_no_auto_restart' };
  }
  console.log('🛡️ [AUTHORITY] ALLOWED', JSON.stringify({ ...snapshot, decision: 'allowed', block_reason: null }));
  return { allowed: true };
}

export interface ContinuousConversationProps {
  /**
   * A completed spoken turn. `meta.utteranceId` identifies the listening
   * episode it came from — consumers must dedupe on that id rather than on the
   * text, so iOS hypothesis revisions collapse while a member deliberately
   * repeating a sentence still produces a second turn. Optional so one-shot
   * Whisper/fallback callers can keep calling with text alone.
   */
  onTranscript: (text: string, meta?: { utteranceId?: string }) => void;
  onInterimTranscript?: (text: string) => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  onAudioLevelChange?: (amplitude: number, isSpeaking: boolean) => void; // Audio amplitude callback for visualization
  isProcessing?: boolean;
  isSpeaking?: boolean; // When Maya is speaking
  autoStart?: boolean; // Start listening immediately
  silenceThreshold?: number; // Silence detection threshold in ms (default 2000)
  vadSensitivity?: number; // Voice activity detection sensitivity 0-1
  /** Called when user voice is detected while MAIA is speaking (barge-in interrupt) */
  onInterrupt?: () => void;
  /** Enable voice-activated interrupt (default: true) */
  interruptEnabled?: boolean;
  /** Debounce for interrupt detection in ms (default: 200) */
  interruptDebounceMs?: number;
  /** Threshold multiplier for interrupt detection (default: 1.2) - higher = less sensitive */
  interruptThresholdMultiplier?: number;
  /** Keep listening active even during silence - for Care/Scribe modes (default: false) */
  persistentListening?: boolean;
  /** Called when hands-free mode auto-falls back to push-to-talk (e.g. after backoff exhaustion) */
  onHandsFreeFallback?: () => void;
  /**
   * Called when voice has been bounded-recovery-stopped because a known
   * platform failure mode was observed (e.g. Android Chrome: audio captured
   * but VAD never triggered for 2 consecutive cycles). Parent should surface
   * the userMessage and emphasize the text input path. Does NOT fire on
   * transient errors or normal end-of-speech.
   */
  onVoiceUnavailable?: (info: { reason: string; userMessage: string }) => void;
}

export interface ContinuousConversationRef {
  startListening: (options?: { forceOverride?: boolean }) => void;
  stopListening: (options?: { userExitMode?: boolean }) => void;
  toggleListening: () => void;
  extendRecording: () => void; // Reset silence timer to keep recording longer
  setHandsFree: (active: boolean) => void; // Toggle hands-free mode (auto-restart after MAIA speaks)
  /** Notify CC that an iOS audio interruption occurred (phone call, Siri, BT, etc.) */
  onInterruptionStart: () => void;
  /** Notify CC that an iOS audio interruption ended */
  onInterruptionEnd: () => void;
  isListening: boolean;
  isRecording: boolean;
  isHandsFree: boolean;
  micState: MicState;
  listeningMode: ListeningMode;
}

export const ContinuousConversation = forwardRef<ContinuousConversationRef, ContinuousConversationProps>((props, ref) => {
  const {
    onTranscript,
    onInterimTranscript,
    onRecordingStateChange,
    onAudioLevelChange,
    isProcessing = false,
    isSpeaking = false,
    autoStart = false, // Disabled to prevent infinite restart loops
    silenceThreshold = 12000, // 12s to capture full thoughts - extra generous for reflecting on MAIA's words
    vadSensitivity = 0.3,
    onInterrupt,
    interruptEnabled = true,
    interruptDebounceMs = 200,
    interruptThresholdMultiplier = 1.2,
    persistentListening = false,
    onHandsFreeFallback,
    onVoiceUnavailable,
  } = props;

  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]); // On-screen debug for iOS
  const [showDebugPanel, setShowDebugPanel] = useState(false); // Disabled - was interfering with mic activation

  // Helper to add debug messages (visible on screen for iOS debugging)
  const addDebug = useCallback((msg: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const fullMsg = `[${timestamp}] ${msg}`;
    console.log('🐛 [DEBUG]', msg);
    setDebugLog(prev => [...prev.slice(-14), fullMsg]); // Keep last 15 messages for better diagnosis
    // Mirror to the global voice debug bus so VoiceDebugOverlay (rendered
    // by OracleConversation) surfaces it on Capacitor native. The bus is a
    // no-op on web. PR 10 diagnostic instrumentation.
    pushVoiceDebug(msg);
  }, []);

  const recognitionRef = useRef<any>(null);
  const useNativeSpeechRef = useRef<boolean>(Capacitor.isNativePlatform()); // Use native speech on iOS/Android
  const nativeListenerRef = useRef<any>(null); // Store native listener handle
  const nativeStateListenerRef = useRef<any>(null); // Store listeningState listener handle
  const nativeAudioLevelListenerRef = useRef<any>(null); // Store audioLevel listener handle for UV visualizer
  const nativeSilenceTimerRef = useRef<NodeJS.Timeout | null>(null); // Silence detection timer for auto-submit
  const nativeStatusRef = useRef<'started' | 'stopped'>('stopped'); // 🔑 Single source of truth for native listening state
  const smoothedAudioLevelRef = useRef<number>(0); // EMA-smoothed audio level for UV visualizer
  const lastHighAudioTimeRef = useRef<number>(0); // Track when we last had speech (for silence detection)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioLevelRef = useRef<number>(0); // Use ref for animation frame updates
  const lastAudioLevelUpdate = useRef<number>(0); // Throttle UI updates
  const micStreamRef = useRef<MediaStream | null>(null);
  const lastSpeechTime = useRef<number>(0); // 0 = no speech detected yet (NOT Date.now() which causes false positives)
  const accumulatedTranscript = useRef<string>("");
  const isProcessingRef = useRef(false);
  const isSpeakingRef = useRef(false); // Track isSpeaking via ref to avoid stale closures
  const isListeningRef = useRef(false); // Track isListening via ref to avoid stale closures
  const isRecordingRef = useRef(false); // Track isRecording via ref to avoid stale closures
  const persistentListeningRef = useRef(false); // Track persistentListening for Care/Scribe modes
  const wantsContinuousConversationRef = useRef(false); // 🔥 FIX: Track if user wants continuous conversation (persists through MAIA responses)
  // ==========================================================================
  // 🎙️ STATE MACHINE — Single source of truth for mic lifecycle
  // ==========================================================================
  const micStateRef = useRef<MicState>('IDLE');
  const listeningModeRef = useRef<ListeningMode>('HANDS_FREE');
  const restartInFlightRef = useRef(false); // True while a restart setTimeout is pending
  const backoffStepRef = useRef(0); // Current exponential backoff step (0 = no backoff)
  const recognitionActiveRef = useRef(false); // True between .start() and .onend — prevents double-start InvalidStateError

  // ==========================================================================
  // 🔁 WEB SPEECH LIFECYCLE — never reuse a failed/suspended recognition object
  // ==========================================================================
  // Owns the current webkitSpeechRecognition instance, a generation counter
  // that drops stale callbacks from superseded instances, the needs-recreate
  // flag (replacing the old recognitionNeedsRefreshRef), and devicechange
  // invalidation. See lib/voice/webSpeechLifecycle.ts for the full rationale
  // (Chrome zombies an instance after abort/restart cycles: onstart keeps
  // firing but onresult never does — the "stuck mic button" defect).
  const webSessionRef = useRef<WebSpeechRecognitionSession | null>(null);
  const getWebSession = useCallback((): WebSpeechRecognitionSession => {
    if (!webSessionRef.current) {
      webSessionRef.current = new WebSpeechRecognitionSession({
        unregister: (r) => VoiceFeedbackPrevention.getInstance().unregisterRecognition(r),
      });
    }
    return webSessionRef.current;
  }, []);
  // Fn refs so recognition handlers (wired inside initializeSpeechRecognition)
  // can reach lifecycle helpers defined later without circular useCallback deps.
  const ensureFreshAndStartFnRef = useRef<(source: string) => boolean>();
  const discardRecognitionFnRef = useRef<(reason: string) => void>();
  const handleWebDeviceChangeFnRef = useRef<() => void>();

  // Convenience aliases (kept for backward compat with existing code)
  const handsFreeActiveRef = useRef(true);
  const lastSpeechHeardAtRef = useRef<number>(0);

  // 🎯 CONVERSATION-ALIVE GATE — tracks whether the conversation is still active
  const lastTranscriptSubmittedAtRef = useRef<number>(0);
  const lastAudioEndAtRef = useRef<number>(0);
  const lastMicTapAtRef = useRef<number>(0);

  // Helper: set mic state with logging
  const setMicState = useCallback((newState: MicState, source: string) => {
    const prev = micStateRef.current;
    if (prev === newState) return;
    micStateRef.current = newState;
    console.log(`🔄 [MicState] ${prev} → ${newState} (via ${source})`);
  }, []);
  const recognitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSentRef = useRef<string>("");
  const lastSentTimeRef = useRef<number>(0); // Track when we last sent a transcript
  const isCallingProcessRef = useRef(false); // CRITICAL: Prevent concurrent processAccumulatedTranscript calls

  // 🎯 THE single admission boundary for spoken turns. Five paths can submit an
  // accumulated transcript (web silence timer, two native silence timeouts,
  // native `stopped`, manual stop); before 2512 only the first consulted a
  // dedup and only the first updated it, so the other four were invisible to
  // it. Every utterance submission now goes through submitUtterance() below.
  const utteranceGuardRef = useRef(createUtteranceGuardState());

  /**
   * Submit one spoken utterance to the conversation. This is the ONLY place
   * `onTranscript` is called for an accumulated transcript — every silence
   * timer, stop handler and manual stop routes through here so the guard sees
   * all of them. Returns true if the utterance was actually sent.
   */
  const submitUtterance = useCallback((text: string, source: string): boolean => {
    const decision = trySubmitUtterance(utteranceGuardRef.current, text);
    if (!decision.admitted) {
      console.log(`🚫 [UTTERANCE] Refused (${decision.reason}) from ${source}`);
      logVoiceEvent('voice_utterance_submission_refused', {
        source,
        reason: decision.reason,
        transcriptLength: text.trim().length,
      });
      return false;
    }
    console.log(
      `📤 [UTTERANCE] Admitted from ${source} utterance=${decision.utteranceId.slice(0, 8)}`
    );
    logVoiceEvent('voice_utterance_submission_admitted', {
      source,
      utteranceId: decision.utteranceId,
      transcriptLength: text.trim().length,
    });
    // The episode id travels with the turn: it becomes the exchange id on the
    // wire, so the server's UNIQUE (exchange_id, seq) can collapse anything
    // that still slips through as one row and one inference.
    onTranscript(text, { utteranceId: decision.utteranceId });
    return true;
  }, [onTranscript]);
  const isRestartingRef = useRef(false);
  // True only while an onend auto-restart is *continuing the same utterance*.
  // iOS Safari effectively ignores `recognition.continuous`, so it fires onend
  // after each phrase; we auto-restart mid-sentence. Without this flag, the
  // restart's onstart wipes accumulatedTranscript and the user is "only heard
  // half" (PWA Safari bug, Andrea 2026-06-05). Consumed (reset) by the next
  // onstart; processAccumulatedTranscript owns the real clear after a turn.
  const continuationRestartRef = useRef(false);
  const networkErrorCount = useRef<number>(0);
  const lastNetworkErrorTime = useRef<number>(0);
  const consecutiveRestartCount = useRef<number>(0);
  const lastRestartTime = useRef<number>(0);
  const recognitionStartTime = useRef<number>(0);

  // Android Chrome bounded-recovery tracking (PR for Tara's observed failure mode).
  // Per-cycle: did audio_started fire? did speech_started fire? Set on the
  // respective handlers, evaluated in onend. Across-cycles: how many
  // consecutive cycles had audio but no speech? Reset on a successful cycle
  // (speech_started fires) or any user-driven stop. At threshold the restart
  // loop is suppressed and onVoiceUnavailable is called once.
  const audioStartedThisCycleRef = useRef<boolean>(false);
  const speechStartedThisCycleRef = useRef<boolean>(false);
  const noSpeechCycleCountRef = useRef<number>(0);
  const noSpeechFallbackFiredRef = useRef<boolean>(false);
  const NO_SPEECH_CYCLE_LIMIT = 2;
  const lastNativeStartAtRef = useRef<number>(0); // 🔥 FIX: Track when native SR started for grace period
  const nativeStartGraceMs = 1200; // Don't count "stopped" within this window as a failed attempt

  // 🎯 ADAPTIVE SILENCE DETECTION - Monitor audio levels for natural speech pauses
  const isSpeakingNowRef = useRef(false); // Track if user is actively speaking based on audio levels
  const silenceStartTimeRef = useRef<number>(0); // When silence began
  const hasSpokenRef = useRef(false); // Track if user has spoken at all (to differentiate from background noise)
  const adaptiveSilenceThreshold = 5000; // 5 seconds - generous buffer for natural pauses and thinking

  // 🛑 BARGE-IN INTERRUPT DETECTION - Detect user speech while MAIA is speaking
  // NOTE: Voice-activated interrupt works on web browsers (uses separate MediaStream for audio monitoring)
  // On native iOS, the audio level events come from the speech recognition plugin which is paused during
  // MAIA speech, so voice-activated interrupt is limited. Users can always tap-to-interrupt on all platforms.
  const interruptSpeechStartRef = useRef<number>(0); // When sustained speech began during MAIA playback
  const hasTriggeredInterruptRef = useRef(false); // Prevent multiple interrupt triggers per MAIA turn
  const onInterruptRef = useRef(onInterrupt); // Ref to avoid stale closure
  onInterruptRef.current = onInterrupt;

  // 🎤 PWA DUPLEX: Suppress transcript processing while MAIA speaks (but keep mic hot for barge-in)
  const inputSuppressedRef = useRef(false);

  // Function refs to avoid temporal dead zone in useImperativeHandle
  const startListeningFnRef = useRef<(options?: { forceOverride?: boolean }) => void>();
  const stopListeningFnRef = useRef<(options?: { userExitMode?: boolean }) => void>();
  const toggleListeningFnRef = useRef<() => void>();
  const extendRecordingFnRef = useRef<() => void>();

  // Auto-restart listening when Maya stops speaking, but with timeout to stop if no response
  const conversationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-restart listening when Maya stops speaking (WEB path only)
  // ONLY when handsFreeActive is true - default is push-to-talk
  const prevIsSpeakingRef = useRef(isSpeaking);
  useEffect(() => {
    const wasSpeak = prevIsSpeakingRef.current;
    prevIsSpeakingRef.current = isSpeaking;

    if (wasSpeak && !isSpeaking && isListening && !isRecording && !isProcessing) {
      // 🎙️ POLICY: Only auto-resume if hands-free is active
      if (!handsFreeActiveRef.current) {
        console.log('🎤 [ContinuousConversation] MAIA stopped speaking - push-to-talk mode, mic stays off');
        return;
      }

      console.log('🎤 [ContinuousConversation] MAIA stopped speaking - hands-free active, auto-resuming mic in 600ms');
      setTimeout(() => {
        if (isListeningRef.current && !isRecordingRef.current && !isSpeakingRef.current && !isProcessingRef.current && handsFreeActiveRef.current) {
          // 🔁 LIFECYCLE: recognition was SUSPENDED (discarded) for MAIA's
          // playback window, so this resume ALWAYS builds a fresh instance —
          // never restarting the pre-TTS object (the Chrome zombie defect).
          // Truthful UI: isRecording is set by onstart when the instance
          // actually confirms live, not optimistically here.
          const ok = ensureFreshAndStartFnRef.current?.('auto_resume_after_tts') ?? false;
          if (ok) {
            console.log('✅ [ContinuousConversation] Mic auto-resume initiated after MAIA speech (hands-free)');
          } else {
            console.warn('⚠️ [ContinuousConversation] Auto-resume failed — listening cleared, user can tap mic');
          }
        } else {
          console.log('⏸️ [ContinuousConversation] Auto-resume blocked - conditions changed');
        }
      }, 600);
    }
  }, [isSpeaking, isListening, isRecording, isProcessing]);

  // Safari browser detection
  const isSafari = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }, []);

  // Initialize Web Speech API
  const initializeSpeechRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null;

    // SAFARI FIX: Safari requires webkitSpeechRecognition specifically
    const SpeechRecognition = isSafari()
      ? (window as any).webkitSpeechRecognition
      : (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported - Safari needs webkitSpeechRecognition');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Enable continuous listening
    recognition.interimResults = true; // Get real-time interim results
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3; // Increased for better accuracy

    // Register with feedback prevention (bookkeeping only — VFP no longer
    // patches start() or restarts recognition; the lifecycle session owns that)
    const feedbackPrevention = VoiceFeedbackPrevention.getInstance();
    feedbackPrevention.registerRecognition(recognition);

    // 🔁 Adopt into the lifecycle session. The previous instance (if any) is
    // hard-discarded first, and `gen` stamps every handler below so a late
    // callback from a superseded instance is dropped before it can touch state.
    const session = getWebSession();
    const gen = session.adopt(recognition);
    recognitionActiveRef.current = false;
    recognitionRef.current = recognition;

    // Audio capture began. On Android Chrome, this sometimes never arrives
    // even after onstart fires — the gap between voice_listening_started and
    // voice_audio_started is the first observable signal of that failure mode.
    recognition.onaudiostart = session.guard(gen, () => {
      audioStartedThisCycleRef.current = true;
      logVoiceEvent('voice_audio_started');
    });

    // VAD detected speech onset. Distinguishes "audio capture working but no
    // speech detected" from "speech detected but no transcript returned."
    // A successful speech_started resets the no-speech cycle counter — we're
    // making forward progress.
    recognition.onspeechstart = session.guard(gen, () => {
      speechStartedThisCycleRef.current = true;
      noSpeechCycleCountRef.current = 0;
      logVoiceEvent('voice_speech_started');
    });

    recognition.onstart = session.guard(gen, () => {
      // Reset per-cycle flags before the new cycle begins. The no-speech
      // ACROSS-cycle counter is intentionally NOT reset here — it only resets
      // on a successful speech_started or on a user-driven stop.
      audioStartedThisCycleRef.current = false;
      speechStartedThisCycleRef.current = false;
      logVoiceEvent('voice_listening_started');
      recognitionStartTime.current = Date.now(); // Track when recognition actually started
      recognitionActiveRef.current = true; // Confirmed live (defensive: start paths also set this)
      setIsRecording(true);
      isRecordingRef.current = true; // Update ref immediately
      setVoiceError(null); // A confirmed live start clears any prior retryable error
      onRecordingStateChange?.(true);
      // Web speech confirmed live — exit ARMING into LISTENING
      if (micStateRef.current === 'ARMING') {
        setMicState('LISTENING', 'web_recognition_started');
        if (armingTimeoutRef.current) {
          clearTimeout(armingTimeoutRef.current);
          armingTimeoutRef.current = null;
        }
      }
      // Only clear on a genuinely new turn. On iOS Safari `continuous` is
      // effectively ignored, so recognition fires onend after each phrase and
      // we auto-restart mid-utterance — clearing here would discard the first
      // half of what the user said. The onend auto-restart path sets
      // continuationRestartRef so this start preserves the accumulated buffer;
      // processAccumulatedTranscript() owns the real clear once a turn is sent.
      if (continuationRestartRef.current) {
        continuationRestartRef.current = false;
        console.log('🔗 [onstart] Continuation restart — preserving accumulated transcript:', accumulatedTranscript.current);
      } else {
        accumulatedTranscript.current = "";
        // 🎯 A genuinely new turn (not a mid-utterance continuation restart):
        // arm the guard so identical words count as a new utterance.
        beginUtterance(utteranceGuardRef.current);
      }

      // Clear conversation timeout when user starts speaking
      if (conversationTimeoutRef.current) {
        clearTimeout(conversationTimeoutRef.current);
        conversationTimeoutRef.current = null;
      }

      // Set timeout to auto-stop recognition after 60 seconds (increased for long reflections)
      if (recognitionTimeoutRef.current) {
        clearTimeout(recognitionTimeoutRef.current);
      }
      recognitionTimeoutRef.current = setTimeout(() => {
        // Use refs, not closure state — this fires up to 60s after render
        if (recognitionRef.current && isRecordingRef.current) {
          // Only stop if no speech detected for a while
          const timeSinceLastSpeech = Date.now() - lastSpeechTime.current;
          if (timeSinceLastSpeech > 8000) {
            recognitionRef.current.stop();
          } else {
            // Reset the timeout if there was recent speech
            recognitionTimeoutRef.current = setTimeout(() => {
              if (recognitionRef.current && isRecordingRef.current) {
                recognitionRef.current.stop();
              }
            }, 20000);
          }
        }
      }, 60000);
    });

    recognition.onresult = session.guard(gen, (event: any) => {
      logVoiceEvent('voice_transcribe_result', {
        resultCount: event.results?.length ?? 0,
        isFinal: event.results?.[event.results.length - 1]?.isFinal === true,
      });
      console.log('🎤 [onresult] FIRED - event:', event.results.length, 'results');

      // 🛡️ GUARD: If transcript is suppressed (MAIA speaking on web), ignore for processing
      // but allow the audio level loop to continue for barge-in detection
      if (inputSuppressedRef.current) {
        console.log('🔇 [onresult] SUPPRESSED - MAIA is speaking, transcript ignored (barge-in still active)');
        return; // Don't process transcripts, but analyser keeps running
      }

      // 🛡️ GUARD: If MAIA is speaking (native path), also ignore
      if (isSpeakingRef.current) {
        console.log('🚫 [onresult] IGNORED - MAIA is speaking, this is likely echo/feedback');
        return; // Don't process anything while MAIA speaks
      }

      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const isFinal = event.results[i].isFinal;
        console.log(`  Result [${i}]: "${transcript}" (isFinal: ${isFinal})`);

        if (isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Update speech time on any speech
      if (interimTranscript || finalTranscript) {
        lastSpeechTime.current = Date.now();
        lastSpeechHeardAtRef.current = Date.now(); // 🎙️ Track for hands-free staleness check

        // CRITICAL FIX: Accumulate final transcripts, but only show latest interim
        if (finalTranscript) {
          console.log('✅ Got FINAL transcript:', finalTranscript);
          // ACCUMULATE final transcripts - this lets us capture across browser restarts
          if (accumulatedTranscript.current) {
            accumulatedTranscript.current += ' ' + finalTranscript.trim();
          } else {
            accumulatedTranscript.current = finalTranscript.trim();
          }
        } else if (interimTranscript) {
          console.log('📝 Got INTERIM transcript:', interimTranscript);
          // For interim, show accumulated finals + current interim
          // This gives live feedback while preserving finals
          const currentInterim = interimTranscript.trim();
          // Don't modify accumulatedTranscript for interim - just pass to callback
        }

        console.log('📊 Accumulated so far:', accumulatedTranscript.current);

        // Reset silence timer on speech
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        // Start new silence timer - use the configurable threshold
        console.log(`⏱️ Starting silence timer (${silenceThreshold}ms)`);
        silenceTimerRef.current = setTimeout(() => {
          console.log('🔕 Silence detected - processing transcript');
          console.log('   isProcessingRef:', isProcessingRef.current);
          console.log('   accumulatedTranscript:', accumulatedTranscript.current);
          // CRITICAL FIX: Don't check isRecording - onend fires before this timer
          // Just check if we have a transcript to send
          if (!isProcessingRef.current && accumulatedTranscript.current.trim()) {
            processAccumulatedTranscript();
          } else {
            console.log('⚠️ Silence timer fired but conditions not met to process');
          }
        }, silenceThreshold); // Use configurable threshold from props
      }

      // Show user the accumulated finals + current interim for live feedback
      if (interimTranscript) {
        const fullTranscript = accumulatedTranscript.current
          ? accumulatedTranscript.current + ' ' + interimTranscript
          : interimTranscript;
        onInterimTranscript?.(fullTranscript);
      } else if (finalTranscript) {
        // Also update interim display when we get finals
        onInterimTranscript?.(accumulatedTranscript.current);
      }
    });

    recognition.onerror = session.guard(gen, (event: any) => {
      const errorCode = String(event?.error || 'unknown');
      logVoiceEvent('voice_transcribe_error', { error: errorCode });
      // Only log critical errors (not no-speech or aborted, which are common)
      if (errorCode !== 'no-speech' && errorCode !== 'aborted') {
        console.error('❌ [Continuous] Speech recognition error:', errorCode);
      }

      if (errorCode === 'network') {
        networkErrorCount.current++;
        lastNetworkErrorTime.current = Date.now();
      }

      // 🔁 LIFECYCLE: classify the error into (fatal?, recreate?) actions.
      // Every recreate-class error invalidates the CURRENT instance — Chrome
      // may keep firing onstart on an errored/aborted object while silently
      // never firing onresult again (the zombie-mic defect). The next listen
      // attempt (onend auto-restart or user tap) builds a fresh object.
      const action = classifyRecognitionError(errorCode, networkErrorCount.current);
      if (action.recreate) {
        session.markForRecreate(`onerror_${errorCode}`);
      }

      if (action.fatal) {
        // TERMINAL path: clear listening state truthfully everywhere, surface
        // a retryable message, and hard-discard the instance so no late
        // callback from it can re-latch the UI. User re-arms via mic tap
        // (authorityGuard allows starts from ERROR state).
        console.error(`🚫 [onerror] Fatal recognition error (${errorCode}) — stopping; user can tap mic to retry`);
        setIsListening(false);
        isListeningRef.current = false;
        setIsRecording(false);
        isRecordingRef.current = false;
        wantsContinuousConversationRef.current = false; // Prevent auto-restart
        onRecordingStateChange?.(false);
        setVoiceError(action.userMessage || 'Voice input hit a problem. Tap the mic to try again.');
        setMicState('ERROR', `onerror_${errorCode}`);
        discardRecognitionFnRef.current?.(`fatal_${errorCode}`);
        return;
      }

      if (errorCode === 'network') {
        console.warn(`⚠️ Network error in speech recognition (${networkErrorCount.current}/2), will retry with a fresh instance`);
      } else if (errorCode === 'aborted') {
        // Aborted is normal when stopping/restarting - don't log as error
        console.log('⏹️ Recognition aborted (instance invalidated; onend decides restart)');
      }
      // no-speech is normal in continuous mode; onend owns restart policy
    });

    recognition.onend = session.guard(gen, () => {
      logVoiceEvent('voice_recognition_ended');
      console.log('🏁 [onend] Recognition stopped');
      recognitionActiveRef.current = false; // Clear double-start guard
      setIsRecording(false);
      isRecordingRef.current = false; // Update ref immediately
      onRecordingStateChange?.(false);

      // ──────────────────────────────────────────────────────────────────
      // Android Chrome bounded recovery: audio_started but no speech_started.
      // Detect → count → stop restart loop after 2 consecutive failures →
      // call onVoiceUnavailable so parent can surface text fallback.
      //
      // Why this exists: observed in Tara's trace (2026-05-14). Android Chrome
      // captures audio (onaudiostart fires) but the recognizer's VAD never
      // triggers (onspeechstart never fires), recognition ends silently,
      // auto-restart fires the same loop, producing the visible "bleeping
      // and flashing listening" pattern. The recognizer is Google's; we
      // can't fix it. Bounded recovery: stop the loop, tell the user
      // honestly, preserve continuity through text.
      // ──────────────────────────────────────────────────────────────────
      const audioWithoutSpeech =
        audioStartedThisCycleRef.current && !speechStartedThisCycleRef.current;
      if (audioWithoutSpeech) {
        noSpeechCycleCountRef.current += 1;
        logVoiceEvent('voice_audio_no_speech', {
          cycleCount: noSpeechCycleCountRef.current,
          limit: NO_SPEECH_CYCLE_LIMIT,
          androidWebChrome: isAndroidWebChrome(),
        });

        // Bounded recovery is Android-Chrome-only. Other platforms keep
        // existing behavior (event still fires above for observability).
        if (
          isAndroidWebChrome() &&
          noSpeechCycleCountRef.current >= NO_SPEECH_CYCLE_LIMIT &&
          !noSpeechFallbackFiredRef.current
        ) {
          noSpeechFallbackFiredRef.current = true;
          console.warn(
            `🛑 [onend] Android Chrome no-speech limit reached ` +
            `(${noSpeechCycleCountRef.current}/${NO_SPEECH_CYCLE_LIMIT}) — ` +
            `stopping Web Speech restart loop, attempting MediaRecorder fallback`
          );
          // Stop the Web Speech restart pathway. The remaining checks in this
          // handler will see these refs and short-circuit before any setTimeout
          // fires.
          wantsContinuousConversationRef.current = false;
          setIsListening(false);
          isListeningRef.current = false;
          setMicState('IDLE', 'android_no_speech_fallback');
          audioStartedThisCycleRef.current = false;
          speechStartedThisCycleRef.current = false;
          if (recognitionTimeoutRef.current) {
            clearTimeout(recognitionTimeoutRef.current);
            recognitionTimeoutRef.current = null;
          }

          // The user-facing message used whenever the fallback fails (any
          // reason). Same wording across reasons — from the user's POV this
          // is one situation: voice isn't working, switching to text.
          const fallbackTextMessage =
            "Your mic is connected, but MAIA isn't detecting speech clearly on Android Chrome right now. You can keep going by typing, and we'll keep improving voice.";

          // Stage 3: try MediaRecorder → /api/voice/transcribe-simple before
          // escalating to the text fallback. Sovereignty: this path keeps
          // audio first-party (local maia-whisper), while the Web Speech API
          // it's replacing would have sent audio to Google.
          const fallbackStream = micStreamRef.current;
          if (!fallbackStream) {
            // No stream to record from — skip straight to text fallback.
            onVoiceUnavailable?.({
              reason: 'android_chrome_no_speech_no_stream',
              userMessage: fallbackTextMessage,
            });
            return;
          }

          // Dynamic import keeps the fallback module out of the main bundle
          // until the failure mode actually fires. Fire-and-forget — the
          // result feeds either onTranscript (success → conversation
          // continues with voice) or onVoiceUnavailable (failure → text).
          import('@/lib/voice/androidVoiceFallback')
            .then(({ recordAndTranscribe }) => recordAndTranscribe(fallbackStream))
            .then((result) => {
              if (result.ok && result.transcript) {
                console.log(
                  `✅ [fallback] Transcript received (${result.transcript.length} chars, ` +
                  `${result.durationMs}ms, ${result.bytes} bytes) — feeding to conversation`
                );
                onTranscript(result.transcript);
                return;
              }
              console.warn(
                `❌ [fallback] Failed: reason=${result.reason} — escalating to text`
              );
              onVoiceUnavailable?.({
                reason: `android_chrome_no_speech_${result.reason ?? 'unknown'}`,
                userMessage: fallbackTextMessage,
              });
            })
            .catch((err: unknown) => {
              console.error('💥 [fallback] Module load or execution threw:', err);
              onVoiceUnavailable?.({
                reason: 'android_chrome_no_speech_fallback_threw',
                userMessage: fallbackTextMessage,
              });
            });
          return;
        }
      }

      // Clear timeout
      if (recognitionTimeoutRef.current) {
        clearTimeout(recognitionTimeoutRef.current);
        recognitionTimeoutRef.current = null;
      }

      // CRITICAL: Prevent infinite restart loop
      // Check if already restarting to prevent multiple simultaneous attempts
      if (isRestartingRef.current) {
        console.log('⚠️ [onend] Already restarting, skipping');
        return;
      }

      // CRITICAL FIX: Only restart if we're actively listening AND recognition wasn't manually stopped
      // Check if recognition still exists - if it was set to null, that means stopListening was called
      if (!recognitionRef.current) {
        console.log('🚫 [onend] Recognition object is null, this was a manual stop');
        return;
      }

      // Check if recognition ended too quickly after starting (rapid abort pattern)
      const timeSinceStart = Date.now() - recognitionStartTime.current;
      if (timeSinceStart < 500 && recognitionStartTime.current > 0) { // Ended in less than 500ms
        // Expected abort: MAIA started speaking and VFP killed recognition.
        // Preserve isListening so the auto-resume effect can restart after TTS ends.
        if (isSpeakingRef.current || inputSuppressedRef.current) {
          console.log('⏸️ [onend] Recognition aborted quickly because MAIA started speaking - preserving listening state');
          // Chrome's Web Speech API silently fails onresult when start() is
          // called on a previously-aborted object — never reuse this instance.
          session.markForRecreate('quick_abort_during_tts');
          return;
        }
        console.log('🚨 [onend] Recognition ended too quickly after start (' + timeSinceStart + 'ms) - possible infinite abort loop, stopping');
        setIsListening(false);
        isListeningRef.current = false;
        return;
      }

      // 🔥 FIX: If MAIA is currently speaking (or input is suppressed for duplex),
      // recognition timed out naturally but we're mid-conversation. Preserve isListening
      // so the auto-resume effect can restart the mic after TTS ends.
      if (isSpeakingRef.current || inputSuppressedRef.current) {
        console.log('⏸️ [onend] Recognition timed out while MAIA speaking - preserving listening state for auto-resume');
        session.markForRecreate('timeout_during_tts');
        return;
      }

      // 🔥 FIX: DON'T auto-restart on silence timeouts (prevents "blinking listening")
      // Web Speech API times out after ~5-8 seconds of silence. If there's been no speech,
      // don't restart - let the user tap to restart when ready.
      //
      // EXCEPTION: In Care/Scribe modes (persistentListening=true), always restart to stay open
      //
      // CRITICAL: lastSpeechTime.current === 0 means NO speech was ever detected in this session
      // In that case, definitely don't restart - the mic timed out without any speech
      const hasEverSpoken = lastSpeechTime.current > 0;
      const now = Date.now();
      const timeSinceLastSpeech = hasEverSpoken ? now - lastSpeechTime.current : Infinity;
      // 🔥 FIX: Also count MAIA finishing as "recent activity" — the user may be
      // reflecting on what MAIA said. 45s window allows deep contemplative pauses.
      const timeSinceLastAudioEnd = lastAudioEndAtRef.current > 0 ? now - lastAudioEndAtRef.current : Infinity;
      const hasRecentActivity = (hasEverSpoken && timeSinceLastSpeech < 45000) || timeSinceLastAudioEnd < 45000;
      const hasAccumulatedTranscript = accumulatedTranscript.current.trim().length > 0;

      // In Care/Scribe modes, ALWAYS restart to stay open for the user
      if (!hasRecentActivity && !hasAccumulatedTranscript && !persistentListeningRef.current) {
        console.log('🔕 [onend] No recent activity (' + (hasEverSpoken ? Math.round(timeSinceLastSpeech/1000) + 's since speech' : 'never spoke') + ', ' + (lastAudioEndAtRef.current > 0 ? Math.round(timeSinceLastAudioEnd/1000) + 's since MAIA' : 'no MAIA audio') + ') - stopping');
        console.log('   (User can tap mic to restart when ready to speak)');
        setIsListening(false);
        isListeningRef.current = false;
        onRecordingStateChange?.(false);
        return;
      }

      // Log if persistent mode is keeping us open
      // (was `hasRecentSpeech` — an out-of-scope name that would have thrown a
      // ReferenceError inside onend in Care/Scribe modes, killing the restart
      // path — exactly the class of silent latch this PR removes)
      if (persistentListeningRef.current && !hasRecentActivity && !hasAccumulatedTranscript) {
        console.log('🎧 [onend] Persistent listening mode - staying open for Care/Scribe');
      }

      // Only restart if we're actively listening and not processing/speaking
      // CRITICAL: Use refs instead of closure state to avoid stale values
      if (isListeningRef.current && !isProcessingRef.current && !isSpeakingRef.current) {
        // Check for too many consecutive restarts (infinite loop prevention)
        const currentTime = Date.now();
        const timeSinceLastRestart = currentTime - lastRestartTime.current;

        // Only count RAPID restarts (< 2 seconds apart) as potentially problematic
        // Normal Web Speech API behavior stops after ~8 seconds of silence - that's fine
        if (timeSinceLastRestart < 2000) { // Less than 2 seconds = rapid restart (potential loop)
          consecutiveRestartCount.current++;
        } else {
          consecutiveRestartCount.current = 0; // Reset counter for normal restarts (> 2 seconds apart)
        }

        lastRestartTime.current = currentTime;

        // Only stop if we have RAPID consecutive restarts (true infinite loop)
        if (consecutiveRestartCount.current >= 10) { // Allow 10 rapid restart attempts before blocking
          console.log('🛑 [onend] Preventing restart loop (' + consecutiveRestartCount.current + ' rapid restarts), stopping voice recognition');
          setIsListening(false);
          isListeningRef.current = false;
          return;
        }

        // Calculate backoff delay based on network error count
        const timeSinceLastError = Date.now() - lastNetworkErrorTime.current;

        // Reset error count if it's been more than 30 seconds since last error
        if (timeSinceLastError > 30000) {
          networkErrorCount.current = 0;
        }

        // Exponential backoff: 300ms, 600ms, 1200ms, 2400ms, 4800ms
        const backoffDelay = networkErrorCount.current > 0
          ? Math.min(300 * Math.pow(2, networkErrorCount.current - 1), 5000)
          : 300;

        console.log(`🔄 [onend] Will restart recognition after ${backoffDelay}ms delay (errors: ${networkErrorCount.current}, restarts: ${consecutiveRestartCount.current}, timeSinceLastRestart: ${timeSinceLastRestart}ms)...`);
        isRestartingRef.current = true;

        setTimeout(() => {
          // Triple-check conditions before restart to prevent race conditions
          // CRITICAL: Use refs to check current state, not stale closure values
          if (isListeningRef.current && !isRecordingRef.current && !isProcessingRef.current && !isSpeakingRef.current) {
            // Mark this as a continuation so the upcoming onstart preserves
            // (does not wipe) the accumulated transcript. iOS Safari fires
            // onend mid-utterance; this restart is the *same* user turn.
            continuationRestartRef.current = true;
            // 🔁 LIFECYCLE: restart through the session. If this instance was
            // invalidated (error/abort/suspend), a FRESH object is created and
            // started — the old one is never reused. On failure, listening
            // state is cleared and a retryable message surfaces (no latch).
            const ok = ensureFreshAndStartFnRef.current?.('onend_restart') ?? false;
            if (ok) {
              console.log('✅ [onend] Recognition restarted (continuation — transcript preserved)');
            } else {
              // no onstart will fire, so don't leave the continuation flag set
              continuationRestartRef.current = false;
              console.log('⚠️ [onend] Restart failed — listening cleared, user can tap mic to retry');
            }
          } else {
            console.log('🚫 [onend] Conditions changed, not restarting. State:', {
              hasRecognition: !!recognitionRef.current,
              isListening: isListeningRef.current,
              isRecording: isRecordingRef.current,
              isProcessing: isProcessingRef.current,
              isSpeaking: isSpeakingRef.current
            });
          }
          // Clear the restarting flag
          isRestartingRef.current = false;
        }, backoffDelay);
      } else {
        console.log('🚫 [onend] Not restarting - conditions not met. State:', {
          isListening: isListeningRef.current,
          isProcessing: isProcessingRef.current,
          isSpeaking: isSpeakingRef.current,
          reason: !isListeningRef.current ? 'NOT_LISTENING' :
                  isProcessingRef.current ? 'IS_PROCESSING' :
                  isSpeakingRef.current ? 'IS_SPEAKING' : 'UNKNOWN'
        });
      }
    });

    return recognition;
  }, [silenceThreshold, onInterimTranscript, onRecordingStateChange, isSafari, getWebSession, setMicState]);

  // ==========================================================================
  // 🔁 WEB SPEECH LIFECYCLE HELPERS
  // ==========================================================================

  /** Hard-discard the current web recognition instance (detach + abort + null). */
  const discardRecognition = useCallback((reason: string) => {
    getWebSession().discard(reason);
    recognitionRef.current = null;
    recognitionActiveRef.current = false;
  }, [getWebSession]);

  /**
   * The ONE web-path start gate. Consults the lifecycle session:
   *  - if the previous instance errored, aborted unexpectedly, was suspended
   *    for TTS, or a device change invalidated it → build a FRESH instance;
   *  - a healthy running instance is left running (no double-start);
   *  - a failed start() is RECOVERABLE: instance discarded, listening state
   *    cleared on every ref/state/parent surface, retryable message surfaced.
   * Returns true iff a live (or freshly started) instance is in place.
   */
  const ensureFreshAndStart = useCallback((source: string): boolean => {
    const session = getWebSession();

    const clearToRetryable = (message: string, tag: string) => {
      setIsListening(false);
      isListeningRef.current = false;
      setIsRecording(false);
      isRecordingRef.current = false;
      onRecordingStateChange?.(false);
      setVoiceError(message);
      setMicState('ERROR', tag); // authorityGuard allows user-tap starts from ERROR
    };

    if (session.shouldRecreate) {
      discardRecognition(`recreate_for_${source}`);
      const fresh = initializeSpeechRecognition(); // adopts into session, bumps generation
      if (!fresh) {
        console.warn(`⚠️ [lifecycle] Could not create recognition object (${source})`);
        clearToRetryable('Voice input is unavailable right now. Tap the mic to try again.', `create_failed_${source}`);
        return false;
      }
      console.log(`🔄 [lifecycle] Fresh recognition object (${source}, gen ${session.currentGeneration})`);
    }

    if (!recognitionRef.current) return false; // defensive; shouldRecreate covers null

    if (recognitionActiveRef.current) {
      console.log(`⏸️ [lifecycle] Recognition already running (${source})`);
      return true;
    }

    try {
      recognitionRef.current.start();
      recognitionActiveRef.current = true;
      console.log(`🎙️ [lifecycle] Recognition started (${source}, gen ${session.currentGeneration})`);
      return true;
    } catch (err: any) {
      if (err?.name === 'InvalidStateError' || err?.message?.includes('already started')) {
        recognitionActiveRef.current = true; // It IS running, just not started by us
        return true;
      }
      console.error(`❌ [lifecycle] start() failed (${source}):`, err);
      discardRecognition(`start_failed_${source}`); // never reuse a failed instance
      clearToRetryable('The microphone could not start. Tap the mic to try again.', `start_failed_${source}`);
      return false;
    }
  }, [getWebSession, discardRecognition, initializeSpeechRecognition, onRecordingStateChange, setMicState]);

  /**
   * `devicechange` recovery. By the time this runs, the session has already
   * hard-discarded + invalidated the recognition instance. Mirror that into
   * component state, tear down the audio pipeline bound to the old device, and
   * return the UI to a recoverable idle state. Reacquisition happens ONLY
   * through the normal start path (user taps the mic) — never by silently
   * spinning up a competing listener here.
   */
  const handleWebDeviceChange = useCallback(() => {
    recognitionRef.current = null;
    recognitionActiveRef.current = false;

    const wasActive = isListeningRef.current || isRecordingRef.current;
    console.log(`🔌 [devicechange] Audio devices changed (wasActive=${wasActive}) — voice session invalidated`);
    if (!wasActive) return; // idle: next start builds fresh anyway

    // The mic stream + analyser are bound to the old device — tear them down.
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch { /* already closed */ }
      audioContextRef.current = null;
    }
    analyserRef.current = null;

    setIsListening(false);
    isListeningRef.current = false;
    setIsRecording(false);
    isRecordingRef.current = false;
    wantsContinuousConversationRef.current = false;
    onRecordingStateChange?.(false);
    setAudioLevel(0);
    setVoiceError('Your audio device changed. Tap the mic to reconnect.');
    setMicState('IDLE', 'devicechange');
  }, [onRecordingStateChange, setMicState]);

  // Keep fn refs current so recognition handlers reach the latest helpers
  useEffect(() => {
    ensureFreshAndStartFnRef.current = ensureFreshAndStart;
    discardRecognitionFnRef.current = discardRecognition;
    handleWebDeviceChangeFnRef.current = handleWebDeviceChange;
  }, [ensureFreshAndStart, discardRecognition, handleWebDeviceChange]);

  // Sync props and state to refs to avoid stale closures in recognition callbacks
  // 🔥 CRITICAL: Sync isSpeaking SYNCHRONOUSLY (not in useEffect) to prevent race conditions
  // This ensures the guard in startListening() always has the latest value
  isSpeakingRef.current = isSpeaking;
  persistentListeningRef.current = persistentListening; // Sync persistentListening for Care/Scribe modes

  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // 🔇 CRITICAL: Handle MAIA speaking state
  // PWA/WEB: Soft suppress - keep mic hot for barge-in, suppress transcript processing
  // iOS NATIVE: Must stop recognition due to audio session constraints
  useEffect(() => {
    if (isSpeaking) {
      // 🛑 Reset interrupt detection for this new MAIA turn
      hasTriggeredInterruptRef.current = false;
      interruptSpeechStartRef.current = 0;

      // Clear any accumulated transcript (it could be MAIA echo starting)
      if (accumulatedTranscript.current) {
        console.log('🧹 Discarding accumulated transcript (MAIA started):',
          accumulatedTranscript.current.substring(0, 50));
        accumulatedTranscript.current = '';
      }

      // Clear timers to prevent delayed processing
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (recognitionTimeoutRef.current) {
        clearTimeout(recognitionTimeoutRef.current);
        recognitionTimeoutRef.current = null;
      }

      setMicState('PLAYING_TTS', 'maia_speaking');

      // 📱 iOS NATIVE: Must stop recognition (audio session conflict)
      if (useNativeSpeechRef.current) {
        console.log('🔇 [Native iOS] MAIA speaking - stopping recognition (audio session)');
        (async () => {
          try {
            await NativeSpeechRecognition.stop();
            console.log('🛑 [Native] Stopped for MAIA speech');
          } catch (e) {
            // May already be stopped
          }
        })();
        setIsRecording(false);
        isRecordingRef.current = false;
      } else {
        // 🌐 PWA/WEB: SUSPEND recognition for MAIA's playback window — a
        // PLANNED teardown through the lifecycle session, not a failure.
        // The mic STREAM + analyser stay hot so voice barge-in detection keeps
        // working (it reads audio levels, not transcripts), but the
        // SpeechRecognition instance is discarded: no echo transcripts, and
        // none of the abort/restart churn that used to zombie Chrome's
        // recognition objects. The post-playback resume builds a FRESH one.
        console.log('🔇 [PWA] MAIA speaking - suspending web recognition (mic stream stays hot for barge-in)');
        inputSuppressedRef.current = true; // belt-and-braces vs. in-flight results
        const session = webSessionRef.current;
        if (session?.current) {
          session.suspendForTts();
          recognitionRef.current = null;
          recognitionActiveRef.current = false;
        }
        setIsRecording(false);
        isRecordingRef.current = false;
        onRecordingStateChange?.(false);
      }

      isProcessingRef.current = false;
    } else {
      // MAIA stopped speaking - clear suppression
      if (inputSuppressedRef.current) {
        console.log('🎤 [PWA DUPLEX] MAIA stopped - clearing suppression, transcripts active');
        inputSuppressedRef.current = false;
      }
      // Track audio end for conversation-alive gate
      lastAudioEndAtRef.current = Date.now();
      if (micStateRef.current === 'PLAYING_TTS') {
        setMicState('IDLE', 'maia_stopped_speaking');
        // Reset backoff when MAIA finishes a new turn — fresh set of attempts
        backoffStepRef.current = 0;
      }
    }
  }, [isSpeaking]);

  // 🎤 Auto-restart native speech recognition when MAIA finishes speaking
  // ONLY when handsFreeActive is true AND user has spoken recently
  // Default behavior (push-to-talk): mic stays off after MAIA responds, user taps to speak again
  useEffect(() => {
    if (!isSpeaking && wantsContinuousConversationRef.current && useNativeSpeechRef.current) {
      isProcessingRef.current = false;
      consecutiveRestartCount.current = 0;

      // 🎙️ POLICY: Only auto-restart if hands-free is active AND user spoke recently
      const recentSpeechWindow = 30000; // 30 seconds
      const hasRecentSpeech = lastSpeechHeardAtRef.current > 0 && (Date.now() - lastSpeechHeardAtRef.current) < recentSpeechWindow;

      if (!handsFreeActiveRef.current) {
        console.log('🎤 [Native] MAIA stopped speaking - push-to-talk mode, mic stays off (user taps to speak)');
        return;
      }

      if (!hasRecentSpeech) {
        console.log('🎤 [Native] MAIA stopped speaking - hands-free active but no recent speech, mic stays off');
        return;
      }

      console.log('🔄 [Native] MAIA stopped speaking - hands-free + recent speech, auto-restarting in 800ms...');

      const restartTimer = setTimeout(async () => {
        if (wantsContinuousConversationRef.current && handsFreeActiveRef.current && !isSpeakingRef.current && !isProcessingRef.current && nativeStatusRef.current !== 'started') {
          try {
            console.log('🎙️ [Native] Auto-restarting after MAIA speech (hands-free)...');
            await NativeSpeechRecognition.start({
              language: 'en-US',
              maxResults: 3,
              partialResults: true,
              popup: false
            });
            console.log('✅ [Native] Auto-restart after speech successful');
          } catch (e: any) {
            console.warn('⚠️ [Native] Auto-restart failed:', e?.message || e);
          }
        } else {
          console.log('🚫 [Native] Conditions changed or already started, skipping auto-restart');
        }
      }, 800);

      return () => clearTimeout(restartTimer);
    }
  }, [isSpeaking]);

  // 🎤 DISABLED: Old auto-restart via useEffect - replaced by above
  // This was causing duplicate restart attempts and race conditions
  // The recognition.onend handler (above) is the single source of truth for restarts
  // useEffect(() => {
  //   if (!isSpeaking && !isRecording && isListening && recognitionRef.current) {
  //     isProcessingRef.current = false;
  //     const restartTimer = setTimeout(() => {
  //       if (recognitionRef.current && !isRecording && !isSpeaking && isListening) {
  //         try {
  //           recognitionRef.current.start();
  //           setIsRecording(true);
  //           console.log('✅ [effect] Recognition restarted after Maya stopped speaking');
  //         } catch (err: any) {
  //           if (!err?.message?.includes('already started')) {
  //             console.warn('⚠️ [Voice Feedback Prevention] Error restarting recognition:', err);
  //           }
  //         }
  //       }
  //     }, 2000);
  //     return () => clearTimeout(restartTimer);
  //   }
  // }, [isSpeaking, isRecording, isListening]);

  // Process accumulated transcript
  const processAccumulatedTranscript = useCallback(() => {
    // CRITICAL: Prevent concurrent calls - use a synchronous flag
    if (isCallingProcessRef.current) {
      console.log('🚫 [GUARD] Blocked concurrent processAccumulatedTranscript call');
      return;
    }
    isCallingProcessRef.current = true;

    // 🔒 STRUCTURAL: every return path AND every exception releases the latch.
    // Before 2512 the "exact duplicate" early-return below forgot to clear it,
    // which latched the guard true forever — after that, every later call bailed
    // at "Blocked concurrent processAccumulatedTranscript call" and nothing the
    // member said was ever submitted again. Silently. Manual clears are the bug
    // class; do not reintroduce one. Add returns freely — finally owns the latch.
    try {
      const transcript = accumulatedTranscript.current.trim();
      console.log('🔄 [processAccumulatedTranscript] Called with:', transcript);

      if (!transcript) {
        console.log('⚠️ [processAccumulatedTranscript] No transcript to process');
        return;
      }

      // CRITICAL FIX: If already processing, don't retry - just skip
      if (isProcessingRef.current) {
        console.log('⏳ [ContinuousConversation] Already processing, skipping');
        return;
      }

      const normalizedTranscript = transcript.toLowerCase().trim();

      // Echo/Feedback Prevention - Block MAIA's own voice patterns.
      // (Duplicate-send suppression now lives in the shared utterance guard,
      // which every submission path consults — see submitUtterance.)
      const maiaPatterns = [
        'mmm', 'yes', 'there\'s something', 'i can feel', 'what\'s alive',
        'i notice', 'i\'m curious', 'what does', 'how does that feel',
        'where do you feel', 'in your body', 'that sensation', 'pause',
        'what\'s it like', 'like...', 'suspension', 'quality of'
      ];

      const looksLikeMaiaVoice = maiaPatterns.some(pattern =>
        normalizedTranscript.includes(pattern.toLowerCase())
      );

      if (looksLikeMaiaVoice && normalizedTranscript.split(' ').length < 15) {
        console.log('🔇 [ECHO BLOCK] Transcript looks like MAIA\'s voice:', transcript);
        accumulatedTranscript.current = ""; // Clear echo
        return;
      }

      // 🔒 ORDER IS LOAD-BEARING: consult the guard BEFORE mutating any mic state.
      // The 2512 build asked the guard AFTER stopping recognition and entering
      // SUBMITTING, so a refusal returned with the mic stopped and parked in a
      // state nothing would leave — no response was coming, because nothing was
      // sent. That stranded the microphone. A refusal must be a no-op.
      if (!submitUtterance(transcript, 'processAccumulatedTranscript')) {
        accumulatedTranscript.current = ""; // drop the echo, leave the mic alone
        return;
      }

      // Past this point the turn IS being submitted, so state may change.
      accumulatedTranscript.current = "";
      continuationRestartRef.current = false; // turn submitted — next start is a fresh turn

      // Stop recognition while processing
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      setMicState('SUBMITTING', 'processAccumulatedTranscript');
      lastTranscriptSubmittedAtRef.current = Date.now();

      lastSentRef.current = transcript;
      lastSentTimeRef.current = Date.now();
      isProcessingRef.current = true;
      console.log('✅ [ContinuousConversation] onTranscript callback completed');

      // Will restart when Maya finishes speaking
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 500);
    } finally {
      isCallingProcessRef.current = false;
    }
  }, [onTranscript, submitUtterance, setMicState]);

  // 🔊 Track if audio loop is currently running to prevent duplicates
  const audioLoopRunningRef = useRef(false);

  // 🔊 Start the audio level monitoring loop (can be called multiple times safely)
  const startAudioLevelLoop = useCallback(() => {
    // Prevent multiple loops running simultaneously
    if (audioLoopRunningRef.current) {
      console.log('🔊 [AudioLoop] Already running, skipping duplicate start');
      return;
    }

    if (!analyserRef.current) {
      console.log('🔊 [AudioLoop] No analyser - cannot start');
      return;
    }

    audioLoopRunningRef.current = true;
    console.log('🔊 [AudioLoop] Starting audio level monitoring loop');
    let debugCounter = 0;

    const checkAudioLevel = () => {
      if (!analyserRef.current) {
        audioLoopRunningRef.current = false;
        return;
      }

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      // Calculate average level
      const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
      const normalizedLevel = Math.min(average / 128, 1);

      // DEBUG: Log audio level every 30 frames (~0.5 sec) - dev only
      debugCounter++;
      if (debugCounter % 30 === 0 && process.env.NODE_ENV === 'development') {
        console.log(`🎚️ [MIC DEBUG] Audio level: ${normalizedLevel.toFixed(3)} (raw avg: ${average.toFixed(1)})`);
      }

      // Store in ref for immediate use (no re-render)
      audioLevelRef.current = normalizedLevel;

      // Throttle state updates to 10fps (every 100ms) instead of 60fps
      const now = Date.now();
      if (now - lastAudioLevelUpdate.current > 100) {
        setAudioLevel(normalizedLevel);
        lastAudioLevelUpdate.current = now;
      }

      // 🌸 Call amplitude callback directly for holoflower visualization
      // Use ref instead of state to avoid triggering re-renders
      onAudioLevelChange?.(normalizedLevel, isRecordingRef.current);

      // 🛑 BARGE-IN INTERRUPT DETECTION - Detect user speech while MAIA is speaking
      // Only active when MAIA is speaking and interrupt is enabled
      if (isSpeakingRef.current && interruptEnabled && !hasTriggeredInterruptRef.current) {
        const interruptVoiceThreshold = vadSensitivity * interruptThresholdMultiplier;
        const isSpeakingAboveThreshold = normalizedLevel > interruptVoiceThreshold;

        if (isSpeakingAboveThreshold) {
          // User started/continues speaking
          if (interruptSpeechStartRef.current === 0) {
            interruptSpeechStartRef.current = now;
            console.log('🎤 [INTERRUPT] Potential barge-in detected, starting debounce timer...');
          } else {
            // Check if speech has been sustained long enough
            const speechDuration = now - interruptSpeechStartRef.current;
            if (speechDuration >= interruptDebounceMs) {
              console.log(`🛑 [INTERRUPT] Barge-in confirmed after ${speechDuration}ms - interrupting MAIA`);
              hasTriggeredInterruptRef.current = true;
              interruptSpeechStartRef.current = 0;
              // Call the interrupt handler
              onInterruptRef.current?.();
            }
          }
        } else {
          // Speech dropped below threshold - reset debounce timer
          if (interruptSpeechStartRef.current > 0) {
            console.log('🔇 [INTERRUPT] Speech dropped, resetting debounce timer');
            interruptSpeechStartRef.current = 0;
          }
        }
      }

      // 🎯 ADAPTIVE SILENCE DETECTION - Detect when user stops speaking
      // Respect thinking pauses - only send after meaningful silence
      const voiceThreshold = vadSensitivity; // Use sensitivity from props (default 0.3)
      const wasSpeaking = isSpeakingNowRef.current;
      const isSpeakingNow = normalizedLevel > voiceThreshold;

      if (isSpeakingNow && !wasSpeaking) {
        // User started speaking
        isSpeakingNowRef.current = true;
        hasSpokenRef.current = true; // Mark that we've detected real speech
        silenceStartTimeRef.current = 0;
        if (process.env.NODE_ENV === 'development') console.log('🗣️ [VAD] User speaking (level:', normalizedLevel.toFixed(2), ')');
      } else if (!isSpeakingNow && wasSpeaking) {
        // User paused - start silence timer (might be thinking, might be done)
        isSpeakingNowRef.current = false;
        silenceStartTimeRef.current = now;
        if (process.env.NODE_ENV === 'development') console.log('⏸️ [VAD] Pause detected - listening for continuation...');
      } else if (!isSpeakingNow && silenceStartTimeRef.current > 0 && hasSpokenRef.current) {
        // Check if pause has lasted long enough AND we have real content
        const silenceDuration = now - silenceStartTimeRef.current;
        if (silenceDuration >= adaptiveSilenceThreshold && accumulatedTranscript.current.trim()) {
          console.log('✅ [VAD] Natural completion detected after', silenceDuration, 'ms - sending to MAIA');
          silenceStartTimeRef.current = 0; // Reset to prevent duplicate triggers
          hasSpokenRef.current = false; // Reset for next turn
          if (!isProcessingRef.current) {
            processAccumulatedTranscript();
          }
        }
      }

      // 🔥 PWA DUPLEX: Keep analyser running even while MAIA speaks (for barge-in detection)
      // Use refs to avoid stale closure issues
      const shouldKeepRunning = isListeningRef.current || isSpeakingRef.current;
      if (shouldKeepRunning) {
        requestAnimationFrame(checkAudioLevel);
      } else {
        // Loop stopped - mark as not running
        audioLoopRunningRef.current = false;
        console.log('🔊 [AudioLoop] Stopped (isListening=false AND isSpeaking=false)');
      }
    };

    checkAudioLevel();
  }, [onAudioLevelChange, vadSensitivity, processAccumulatedTranscript]);

  // Initialize audio level monitoring
  const initializeAudioMonitoring = useCallback(async () => {
    try {
      // BUGFIX: Don't request getUserMedia if we already have a stream
      // This prevents permission re-request loops on iPad Safari
      if (micStreamRef.current && analyserRef.current) {
        console.log('✅ [Continuous] Already have microphone stream, reusing');
        // 🔥 CRITICAL FIX: Even when reusing stream, restart the audio loop!
        startAudioLevelLoop();
        return true;
      }

      // 🔍 Log available audio input devices BEFORE requesting mic
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(d => d.kind === 'audioinput');
        console.log('[voice] audioinput devices:', audioInputs.map(d => ({
          label: d.label || '(no label - permission not yet granted)',
          deviceId: d.deviceId?.slice(0, 8) + '...',
          groupId: d.groupId?.slice(0, 8) + '...'
        })));
        if (audioInputs.length === 0) {
          console.warn('[voice] ⚠️ No audio input devices found! Check OS privacy settings.');
        }
      } catch (enumErr) {
        console.warn('[voice] enumerateDevices failed:', enumErr);
      }

      // Try with standard constraints first
      let stream: MediaStream | null = null;
      const standardConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
          // IMPORTANT: do NOT set deviceId here (no exact/ideal)
        }
      };

      try {
        stream = await navigator.mediaDevices.getUserMedia(standardConstraints);
      } catch (firstErr: any) {
        console.error('[voice] getUserMedia failed first attempt:', firstErr?.name, firstErr?.message);

        // HARD FALLBACK: request default mic with simplest constraints
        if (firstErr?.name === 'NotFoundError' || firstErr?.name === 'OverconstrainedError') {
          console.warn('[voice] 🔄 Retrying with { audio: true } fallback...');
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } else {
          throw firstErr;
        }
      }

      if (!stream) {
        throw new Error('MICROPHONE_UNAVAILABLE');
      }

      micStreamRef.current = stream;
      resetVoiceSession();
      logVoiceEvent('voice_mic_granted', {
        audioTracks: stream.getAudioTracks().length,
        trackLabel: stream.getAudioTracks()[0]?.label?.slice(0, 80) ?? '',
      });

      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();

      // SAFARI FIX: Unlock audio context on Safari if needed
      if (isSafari() && audioContext.state === 'suspended') {
        console.log('🍎 [Safari] Unlocking audio context...');
        try {
          await audioContext.resume();
          console.log('✅ [Safari] Audio context unlocked successfully');
        } catch (error) {
          console.error('❌ [Safari] Failed to unlock audio context:', error);
        }
      }

      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 256;

      microphone.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // 🔥 Start the audio level monitoring loop
      startAudioLevelLoop();

      return true;
    } catch (error) {
      console.error('❌ [Continuous] Microphone access error:', error);
      return false;
    }
  }, [isSafari, startAudioLevelLoop]);

  // 🎛️ Ensure native speech recognition is ready (permissions + availability)
  const ensureNativeSpeechReady = useCallback(async (): Promise<{ ok: boolean; reason?: string }> => {
    // Feature flag gate: IOS_VOICE_NATIVE must be enabled for native speech
    if (!getFeatureFlag('IOS_VOICE_NATIVE')) {
      console.log('🔐 [ensureNativeSpeechReady] IOS_VOICE_NATIVE feature flag disabled');
      addDebug('🚫 Native voice disabled by feature flag');
      return { ok: false, reason: 'Native voice is disabled in this build' };
    }

    const platform = Capacitor.getPlatform();
    addDebug(`Platform: ${platform}`);
    console.log('🔐 [ensureNativeSpeechReady] Platform:', platform);

    try {
      // Check if speech recognition is available on device
      addDebug('Checking availability...');
      const avail = await NativeSpeechRecognition.available();
      addDebug(`Available: ${JSON.stringify(avail)}`);
      console.log('🔐 [ensureNativeSpeechReady] Available:', avail);

      if (!avail?.available) {
        console.log('🔐 [ensureNativeSpeechReady] Speech NOT available!');
        return { ok: false, reason: 'Speech not available on device' };
      }

      // Check current permission status
      addDebug('Checking permissions...');
      const perms = await NativeSpeechRecognition.checkPermissions();
      addDebug(`Perms: ${perms?.speechRecognition}`);
      console.log('🔐 [ensureNativeSpeechReady] Current perms:', perms);
      if (perms?.speechRecognition === 'granted') {
        logVoiceEvent('ios_voice_permission_granted', { source: 'already_granted' });
      }

      if (perms?.speechRecognition !== 'granted') {
        // Request permissions (this covers both speech + mic on iOS)
        addDebug('Requesting permissions...');
        console.log('🔐 [ensureNativeSpeechReady] Requesting permissions NOW...');
        logVoiceEvent('ios_voice_permission_requested');
        const req = await NativeSpeechRecognition.requestPermissions();
        logVoiceEvent(
          req?.speechRecognition === 'granted' ? 'ios_voice_permission_granted' : 'ios_voice_permission_denied',
          { state: String(req?.speechRecognition || 'unknown'), source: 'fresh_request' }
        );
        addDebug(`Req result: ${req?.speechRecognition}`);
        console.log('🔐 [ensureNativeSpeechReady] Permission result:', req);

        if (req?.speechRecognition !== 'granted') {
          console.log('🔐 [ensureNativeSpeechReady] Permission DENIED:', req?.speechRecognition);
          return { ok: false, reason: `Perm denied: ${req?.speechRecognition || 'unknown'}` };
        }
      }

      addDebug('✅ Ready!');
      console.log('🔐 [ensureNativeSpeechReady] ✅ All permissions granted!');
      return { ok: true };
    } catch (e: any) {
      logVoiceEvent('ios_voice_error', {
        where: 'ensureNativeSpeechReady',
        name: String(e?.name || 'UnknownError').slice(0, 60),
      });
      addDebug(`❌ Error: ${e?.message || e}`);
      console.error('🔐 [ensureNativeSpeechReady] ❌ ERROR:', e);
      return { ok: false, reason: e?.message || String(e) };
    }
  }, [addDebug]);

  // 🛡️ CRASH PREVENTION: Track startup state to prevent concurrent starts
  const isStartingRef = useRef(false);
  const lastStartAttemptRef = useRef(0);
  const armingTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Hard timeout to exit ARMING
  const startAttemptTokenRef = useRef(0); // Increments each attempt; stale async paths check this

  // Start listening
  const startListening = useCallback(async (options?: { forceOverride?: boolean }) => {
    console.log('🎤 [ContinuousConversation] startListening called', options?.forceOverride ? '(FORCE OVERRIDE)' : '');
    addDebug('🎤 startListening called');

    // 🛡️ AUTHORITY GUARD: Single-conductor enforcement
    // user_tap = user explicitly tapped mic (always allowed if IDLE)
    // auto_restart = system trying to restart after MAIA speaks (gated by mode)
    const source = options?.forceOverride ? 'user_tap' : 'user_tap';
    const guard = authorityGuard({
      source,
      micState: micStateRef.current,
      listeningMode: listeningModeRef.current,
      restartInFlight: restartInFlightRef.current,
      lastSpeechAt: lastSpeechHeardAtRef.current,
      backoffStep: backoffStepRef.current,
    });

    // Force override bypasses authority guard (user is interrupting MAIA)
    if (!guard.allowed && !options?.forceOverride) {
      addDebug(`🛡️ BLOCKED: ${guard.reason}`);
      return;
    }

    // Track user tap for conversation-alive gate
    lastMicTapAtRef.current = Date.now();

    // 🛡️ CRASH PREVENTION: Debounce rapid taps (500ms minimum between attempts)
    const now = Date.now();
    if (!options?.forceOverride && now - lastStartAttemptRef.current < 500) {
      console.log('⏳ [ContinuousConversation] Debounced - too soon after last attempt');
      return;
    }
    lastStartAttemptRef.current = now;

    // 🛡️ CRASH PREVENTION: Don't start if already starting or still in ARMING
    if (isStartingRef.current || micStateRef.current === 'ARMING') {
      console.log('🚫 [ContinuousConversation] Already starting / ARMING - ignoring duplicate tap');
      return;
    }
    isStartingRef.current = true;
    const attemptToken = ++startAttemptTokenRef.current; // Unique token for this attempt
    setMicState('ARMING', 'startListening');

    // 🛡️ Hard ARMING timeout: if mic hasn't confirmed within 2s, reset to IDLE.
    // Prevents any async failure from leaving state stuck in ARMING.
    if (armingTimeoutRef.current) clearTimeout(armingTimeoutRef.current);
    armingTimeoutRef.current = setTimeout(() => {
      if (startAttemptTokenRef.current === attemptToken && micStateRef.current === 'ARMING') {
        console.warn('⏱️ [ContinuousConversation] ARMING timeout — resetting to IDLE');
        // 🔁 WEB: the instance never confirmed onstart — treat it as failed and
        // never reuse it. Clear listening truthfully and surface a retryable
        // message so the button can't sit latched in a half-armed state.
        if (!useNativeSpeechRef.current) {
          discardRecognitionFnRef.current?.('arming_timeout');
          setIsListening(false);
          isListeningRef.current = false;
          setIsRecording(false);
          isRecordingRef.current = false;
          onRecordingStateChange?.(false);
          setVoiceError('The microphone did not start. Tap the mic to try again.');
        }
        setMicState('IDLE', 'arming_timeout');
        isStartingRef.current = false;
      }
      armingTimeoutRef.current = null;
    }, 2000);

    // 🔄 CRITICAL: Determine platform at START time
    const platform = Capacitor.getPlatform();
    // IMPORTANT: On iOS/Android, ALWAYS use native - never fall back to web speech
    const shouldUseNative = platform === 'ios' || platform === 'android';
    useNativeSpeechRef.current = shouldUseNative;

    console.log('📱 [ContinuousConversation] Platform:', platform, 'shouldUseNative:', shouldUseNative);
    console.log('📱 [ContinuousConversation] Capacitor.isNativePlatform():', Capacitor.isNativePlatform());
    addDebug(`Platform: ${platform}, native: ${shouldUseNative}`);
    addDebug(`📍 path: ${shouldUseNative ? 'native' : 'web'}`);

    // 🛡️ GUARD: Don't start listening if MAIA is speaking - prevents voice feedback loop
    // EXCEPTION: forceOverride allows bypassing this during user interrupt
    if (isSpeakingRef.current && !options?.forceOverride) {
      console.log('🚫 [ContinuousConversation] BLOCKED: Cannot start listening while MAIA is speaking');
      isStartingRef.current = false;
      setMicState('IDLE', 'start_blocked_maia_speaking');
      return;
    }

    // 🔥 FIX: If force override, clear speaking ref to prevent any other checks
    if (options?.forceOverride && isSpeakingRef.current) {
      console.log('⚡ [ContinuousConversation] Force override - clearing isSpeakingRef');
      isSpeakingRef.current = false;
    }

    try {
      // 🔄 Use native speech recognition on iOS/Android
      if (shouldUseNative) {
        console.log('📱 [ContinuousConversation] Using NATIVE speech recognition for platform:', platform);

        // 🛡️ CRASH PREVENTION (iOS only): Stop any existing recognition first.
        // The original comment for this block read "This prevents 'already
        // listening' crashes on iOS" — Android was running through the same
        // call by accident.
        //
        // PR 13 diagnostic markers (2026-05-18) confirmed the hypothesis:
        // Tara's Pixel 8a / Android 16 trace (round 8) showed "🛑 stop()
        // calling" fire and then nothing — no "🛑 stop() returned", no
        // catch, no error. The Capacitor 8 SpeechRecognition plugin's stop()
        // never resolves on that device when there is nothing to stop, so
        // the entire start path hangs inside the await.
        //
        // PR 14 fix (Option A, per Kelly): gate the call to iOS, where it
        // was always intended to run. Android proceeds directly to
        // ensureNativeSpeechReady(), which is the actual permissions/
        // availability path. No timeout race, no fallback wiring, no iOS
        // behavior change. Diagnostic markers retained inside the iOS
        // branch (and a new "skipped on Android" marker added) so the next
        // round-9 trace shows whether Android now reaches ready().
        if (platform === 'ios') {
          try {
            addDebug('🛑 stop() calling');
            await NativeSpeechRecognition.stop();
            addDebug('🛑 stop() returned');
            console.log('🛑 [Native] Pre-emptively stopped any existing recognition');
          } catch {
            // Ignore errors - recognition may not have been running
          }
        } else {
          addDebug('⏭️ stop() skipped on Android');
        }

        // ─── Android native-failure fallback helper ─────────────────────────
        // When the Capacitor SpeechRecognition plugin can't run on this
        // device (e.g. Samsung tablets where Google Speech Services is
        // disabled, available() returns false), or when permission/start
        // fails, route to MediaRecorder + local Whisper instead of dying
        // silently. Without this, the user taps "Tap to Speak" and nothing
        // happens — confirmed by Tara's 2026-05-14 Samsung tab test.
        // iOS native path is unaffected (helper no-ops when platform !== 'android').
        const tryAndroidFallback = async (reason: string): Promise<boolean> => {
          if (platform !== 'android') return false;
          addDebug(`🔁 fallback attempted: ${reason.slice(0, 40)}`);
          console.log('🔁 [Android] Native voice unavailable — MediaRecorder fallback', { reason });
          logVoiceEvent('ios_voice_error', { where: 'native_fallback_attempt', name: reason.slice(0, 60) });

          let stream: MediaStream;
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          } catch (err: any) {
            addDebug(`❌ fallback: getUserMedia failed (${err?.name || 'unknown'})`);
            console.warn('🚫 [Android fallback] getUserMedia failed:', err?.name);
            return false;
          }

          setIsListening(true);
          isListeningRef.current = true;
          setMicState('LISTENING', 'android_native_fallback');
          addDebug('🎙️ fallback: stream acquired, recording…');

          try {
            const { recordAndTranscribe } = await import('@/lib/voice/androidVoiceFallback');
            const result = await recordAndTranscribe(stream);
            if (result.ok && result.transcript) {
              addDebug(`✅ fallback succeeded: ${result.transcript.length} chars`);
              console.log(`✅ [Android fallback] Transcript: ${result.transcript.length} chars, ${result.durationMs}ms`);
              isProcessingRef.current = true;
              onTranscript(result.transcript);
              return true;
            }
            addDebug(`❌ fallback failed: ${result.reason || 'unknown'}`);
            console.warn(`❌ [Android fallback] Failed: ${result.reason}`);
          } catch (err: any) {
            addDebug(`💥 fallback threw: ${err?.name || 'unknown'}`);
            console.error('💥 [Android fallback] Threw:', err);
          } finally {
            stream.getTracks().forEach((t) => t.stop());
            setIsListening(false);
            isListeningRef.current = false;
            setMicState('IDLE', 'android_native_fallback_done');
            isStartingRef.current = false;
          }
          return false;
        };

        // 🎛️ CRITICAL: Ensure permissions before showing "Listening..."
        addDebug('🎛️ ready() calling');
        const ready = await ensureNativeSpeechReady();
        if (!ready.ok) {
          console.warn('🚫 [Native] Not starting recognition:', ready.reason);

          // Android: try MediaRecorder + local Whisper before giving up.
          // Covers cases (1) speech unavailable and (2) permission/setup fail.
          if (await tryAndroidFallback(ready.reason || 'native_not_ready')) {
            return;
          }

          setVoiceError(ready.reason || 'Speech recognition not available');
          // DON'T show "Listening..." if we can't actually listen
          isStartingRef.current = false;
          setMicState('IDLE', 'permissions_failed');
          return;
        }

        // Permissions OK - but don't tell parent yet! Wait for listeningState: started
        // The listeningState listener is the SOURCE OF TRUTH for when mic is actually active
        setIsListening(true);
        isListeningRef.current = true;
        wantsContinuousConversationRef.current = true; // 🔥 FIX: User started conversation, wants to continue after MAIA responds
        // NOTE: onRecordingStateChange will be called when listeningState: started fires
        console.log('📡 [Native] Permissions OK - waiting for mic to actually start...');

        setVoiceError(null);
        isProcessingRef.current = false;
        consecutiveRestartCount.current = 0;
        // NOTE: Do NOT reset lastSpeechTime here - it should only be set when actual speech is detected
        // This prevents the "blinking listening" bug where mic restarts even without speech

        // 🚫 SKIP audio monitoring on native iOS - it conflicts with native speech recognition
        // The native plugin handles mic access directly; calling getUserMedia() causes crashes
        console.log('📱 [Native] Skipping audio monitoring - native plugin handles mic access');

        // 🧹 CRITICAL: Remove any existing listeners before adding new ones
        // This prevents listener accumulation that causes crashes
        if (nativeListenerRef.current) {
          try {
            await nativeListenerRef.current.remove();
          } catch (e) {
            console.log('⚠️ [Native] Cleanup: partialResults listener already removed');
          }
          nativeListenerRef.current = null;
        }
        if (nativeStateListenerRef.current) {
          try {
            await nativeStateListenerRef.current.remove();
          } catch (e) {
            console.log('⚠️ [Native] Cleanup: listeningState listener already removed');
          }
          nativeStateListenerRef.current = null;
        }
        if (nativeAudioLevelListenerRef.current) {
          try {
            await nativeAudioLevelListenerRef.current.remove();
          } catch (e) {
            console.log('⚠️ [Native] Cleanup: audioLevel listener already removed');
          }
          nativeAudioLevelListenerRef.current = null;
        }
        // Clear any pending silence timer
        if (nativeSilenceTimerRef.current) {
          clearTimeout(nativeSilenceTimerRef.current);
          nativeSilenceTimerRef.current = null;
        }

        // Set up listener for partial results
        addDebug('📡 Setting up partialResults listener...');
        nativeListenerRef.current = await NativeSpeechRecognition.addListener('partialResults', (data: { matches: string[] }) => {
          if (data.matches && data.matches.length > 0) {
            const transcript = data.matches[0];
            logVoiceEvent('ios_voice_partial_result_received', {
              matchCount: data.matches.length,
              transcriptLength: transcript.length,
            });
            console.log('📝 [Native] Partial:', transcript);
            addDebug(`🗣️ HEARD: "${transcript.slice(0, 40)}${transcript.length > 40 ? '...' : ''}"`);
            lastSpeechTime.current = Date.now();
            lastHighAudioTimeRef.current = Date.now(); // Also update for fallback silence detection
            lastSpeechHeardAtRef.current = Date.now(); // 🎙️ Track for hands-free staleness check
            setIsRecording(true);
            isRecordingRef.current = true;
            hasSpokenRef.current = true;
            // 🔥 FIX: Reset restart counter when user actually speaks - prevents stopping during valid conversation
            consecutiveRestartCount.current = 0;

            // Send interim transcript
            if (onInterimTranscript) {
              onInterimTranscript(transcript);
            }

            // Accumulate transcript
            accumulatedTranscript.current = transcript;

            // 🔥 FALLBACK SILENCE DETECTION: Reset timer on each partial
            // If no partials for 2.5s after speech, auto-submit (audio levels may not fire on iOS)
            if (nativeSilenceTimerRef.current) {
              clearTimeout(nativeSilenceTimerRef.current);
            }
            nativeSilenceTimerRef.current = setTimeout(() => {
              const finalTranscript = accumulatedTranscript.current.trim();
              if (finalTranscript && !isProcessingRef.current && !isSpeakingRef.current) {
                logVoiceEvent('ios_voice_final_result_received', {
                  source: 'partial_silence_timeout_2500ms',
                  transcriptLength: finalTranscript.length,
                });
                console.log('⏱️ [Native] Fallback silence timeout - auto-submitting:', finalTranscript);
                addDebug('⏱️ Auto-submit (2.5s silence)');
                accumulatedTranscript.current = '';
                setIsRecording(false);
                isRecordingRef.current = false;
                if (submitUtterance(finalTranscript, 'partial_silence_timeout_2500ms')) {
                  isProcessingRef.current = true;
                }
                // Stop native recognition
                NativeSpeechRecognition.stop().catch(() => {});
              }
              nativeSilenceTimerRef.current = null;
            }, 2500); // 2.5s of no partials = end of speech
          } else {
            logVoiceEvent('ios_voice_result_empty');
            addDebug('⚠️ partialResults fired but no matches');
          }
        });
        addDebug('✅ partialResults listener ready');

        // 🎚️ Listen for audio levels from native plugin to drive UV visualizer
        // Note: 'audioLevel' is a custom event we added to the patched plugin
        nativeAudioLevelListenerRef.current = await (NativeSpeechRecognition as any).addListener('audioLevel', (data: { level: number }) => {
          const rawLevel = data.level || 0;
          const now = Date.now();

          // 🔊 AMPLIFY: iOS native mic levels are inherently quiet (0.001-0.03 range)
          // Amplify by 30x to scale into visualizer range (0-1)
          const amplifiedLevel = Math.min(1.0, rawLevel * 30);

          // 🌊 EMA SMOOTHING: Make UV visualizer feel alive, not twitchy
          // smoothed = smoothed * 0.85 + new * 0.15 (adjust to taste)
          smoothedAudioLevelRef.current = smoothedAudioLevelRef.current * 0.85 + amplifiedLevel * 0.15;

          // 🌟 FLOOR: When mic is on, always show a minimum "alive" level
          // This makes the field feel "on" without faking speech peaks
          const displayLevel = Math.max(smoothedAudioLevelRef.current, 0.03);

          // Track when we last had high audio (for silence detection)
          if (rawLevel >= 0.02) {
            lastHighAudioTimeRef.current = now;
          }

          // Update audio level for UV visualizer animation
          setAudioLevel(displayLevel);
          audioLevelRef.current = displayLevel;

          // 🔥 CRITICAL: Call onAudioLevelChange to update OracleConversation visualizer
          onAudioLevelChange?.(displayLevel, isRecordingRef.current);

          // 🛑 BARGE-IN INTERRUPT DETECTION (Native iOS) - Detect user speech while MAIA is speaking
          if (isSpeakingRef.current && interruptEnabled && !hasTriggeredInterruptRef.current) {
            // Native iOS threshold scales with multiplier (base 0.02, scaled by multiplier)
            const interruptThreshold = 0.02 * interruptThresholdMultiplier;
            const isSpeakingAboveThreshold = rawLevel > interruptThreshold;

            if (isSpeakingAboveThreshold) {
              if (interruptSpeechStartRef.current === 0) {
                interruptSpeechStartRef.current = now;
                console.log('🎤 [INTERRUPT Native] Potential barge-in detected...');
              } else {
                const speechDuration = now - interruptSpeechStartRef.current;
                if (speechDuration >= interruptDebounceMs) {
                  console.log(`🛑 [INTERRUPT Native] Barge-in confirmed after ${speechDuration}ms`);
                  hasTriggeredInterruptRef.current = true;
                  interruptSpeechStartRef.current = 0;
                  onInterruptRef.current?.();
                }
              }
            } else {
              if (interruptSpeechStartRef.current > 0) {
                interruptSpeechStartRef.current = 0;
              }
            }
          }

          // 🔇 IMPROVED SILENCE DETECTION
          // Only start timer if ALL conditions met:
          // 1. Raw level is low (< 0.01 = silence)
          // 2. We have any transcript (at least 1 char - don't gate on length, SR already handles this)
          // 3. We had recent speech (high audio within last 2s) - prevents false triggers on ambient noise
          const transcript = accumulatedTranscript.current.trim();
          const hasRecentSpeech = (now - lastHighAudioTimeRef.current) < 2000; // 2s window for natural pauses
          const hasAnyTranscript = transcript.length > 0;

          if (rawLevel < 0.01 && hasAnyTranscript && hasRecentSpeech) {
            // Start silence timer if not already running
            if (!nativeSilenceTimerRef.current) {
              console.log('🔕 [Native] Silence detected after speech, starting 1.5s timer');
              nativeSilenceTimerRef.current = setTimeout(() => {
                // Double-check we still have transcript
                if (accumulatedTranscript.current.trim() && !isProcessingRef.current) {
                  const finalTranscript = accumulatedTranscript.current.trim();
                  if (finalTranscript) {
                    logVoiceEvent('ios_voice_final_result_received', {
                      source: 'audio_level_silence_timeout_1500ms',
                      transcriptLength: finalTranscript.length,
                    });
                  }
                  console.log('⏱️ [Native] Silence timeout - auto-submitting:', finalTranscript);
                  accumulatedTranscript.current = '';
                  setIsRecording(false);
                  isRecordingRef.current = false;
                  if (submitUtterance(finalTranscript, 'audio_level_silence_timeout_1500ms')) {
                    isProcessingRef.current = true;
                  }
                }
                nativeSilenceTimerRef.current = null;
              }, 1500); // 1.5s of silence = end of speech (balanced for responsiveness)
            }
          } else if (rawLevel >= 0.02) {
            // Clear silence timer if speech detected (higher threshold than silence)
            if (nativeSilenceTimerRef.current) {
              clearTimeout(nativeSilenceTimerRef.current);
              nativeSilenceTimerRef.current = null;
            }
          }
        });

        // Handle when speech ends - store listener reference for cleanup
        addDebug('📡 Setting up listeningState listener...');
        nativeStateListenerRef.current = await NativeSpeechRecognition.addListener('listeningState', async (state: { status: string }) => {
          if (state.status === 'started') {
            logVoiceEvent('ios_voice_listening_started', { status: state.status });
          } else {
            logVoiceEvent('ios_voice_listening_stopped', { status: state.status });
          }
          console.log('🔊 [Native] State:', state.status);
          addDebug(`📻 listeningState: ${state.status}`);
          // 🔑 Update single source of truth for native status
          nativeStatusRef.current = state.status === 'started' ? 'started' : 'stopped';
          const isNowRecording = nativeStatusRef.current === 'started';
          setIsRecording(isNowRecording);
          isRecordingRef.current = isNowRecording;

          // 🔥 CRITICAL: Notify parent of ACTUAL mic state - this is the SOURCE OF TRUTH
          // This will clear isActivating and set isListening in OracleConversation
          onRecordingStateChange?.(isNowRecording);
          if (isNowRecording) {
            console.log('✅ [Native] Mic is LIVE - orange dot should be visible');
            addDebug('✅ MIC IS LIVE - orange dot visible!');
            setMicState('LISTENING', 'listeningState:started');
            // 🎯 A fresh recognition session opened: whatever is heard from here
            // is a NEW utterance. This is what lets the member repeat the same
            // sentence — the guard refuses echoes, not repetition.
            beginUtterance(utteranceGuardRef.current);
            restartInFlightRef.current = false; // Clear restart-in-flight flag
            backoffStepRef.current = 0; // Reset backoff on successful start
            lastNativeStartAtRef.current = Date.now();
            consecutiveRestartCount.current = 0;
            console.log('🔄 [Native] Restart counter reset to 0 (mic is live)');
          }

          if (state.status === 'stopped') {
            // 🔥 FIX: Check EITHER isListeningRef OR wantsContinuousConversationRef
            // isListeningRef is false when MAIA is speaking, but we still want to restart after
            // wantsContinuousConversationRef persists the user's intent to continue conversation
            const wantsToListen = isListeningRef.current || wantsContinuousConversationRef.current;

            // Process accumulated transcript (only if we were actively listening)
            if (isListeningRef.current && accumulatedTranscript.current.trim()) {
              const finalTranscript = accumulatedTranscript.current.trim();
              console.log('✅ [Native] Final transcript:', finalTranscript);
              accumulatedTranscript.current = '';
              setIsRecording(false);
              isRecordingRef.current = false;
              // The buffer can be re-populated by a trailing partial that iOS
              // emits after a silence timeout already submitted — the guard is
              // what stops that echo becoming a second send.
              submitUtterance(finalTranscript, 'listeningState:stopped');
            }

            // 🔥 FIX: Only handle restart logic if user wants continuous conversation
            if (wantsToListen) {
              // 🔥 FIX: Check if this is an "idle stop" within grace period
              // iOS speech recognition stops quickly when no speech detected - don't count as failure
              const now = Date.now();
              const msSinceStart = now - (lastNativeStartAtRef.current || 0);
              const isIdleStop = msSinceStart < nativeStartGraceMs;

              if (isIdleStop) {
                // iOS "idle stop" right after start — treat as normal cycling, not a failure
                console.log(`🔄 [Native] Idle stop within ${msSinceStart}ms grace period - not counting as failure`);
              } else {
                // Real failure - mic couldn't stay alive
                consecutiveRestartCount.current++;
                console.log(`⚠️ [Native] Restart counter incremented to ${consecutiveRestartCount.current}`);
              }

              const MAX_NATIVE_RESTARTS = 10; // Allow 10 REAL failures before stopping

              if (consecutiveRestartCount.current > MAX_NATIVE_RESTARTS) {
                console.log(`🛑 [Native] Stopping after ${consecutiveRestartCount.current} restart attempts - user must tap mic`);
                setIsListening(false);
                isListeningRef.current = false;
                wantsContinuousConversationRef.current = false;
                onRecordingStateChange?.(false);
                consecutiveRestartCount.current = 0;
                return;
              }

              // 🛡️ AUTHORITY GUARD: Only the state machine decides whether to restart
              setMicState('IDLE', 'listeningState:stopped');

              // Check conversation-alive gate for hands-free
              const conversationAlive = isConversationAlive({
                lastTranscriptAt: lastTranscriptSubmittedAtRef.current,
                lastAudioEndAt: lastAudioEndAtRef.current,
                lastMicTapAt: lastMicTapAtRef.current,
              });

              const restartGuard = authorityGuard({
                source: 'listeningState_stopped',
                micState: micStateRef.current,
                listeningMode: listeningModeRef.current,
                restartInFlight: restartInFlightRef.current,
                lastSpeechAt: lastSpeechHeardAtRef.current,
                backoffStep: backoffStepRef.current,
              });

              if (restartGuard.allowed && handsFreeActiveRef.current && conversationAlive && !isSpeakingRef.current && !isProcessingRef.current) {
                // 🔥 EXPONENTIAL BACKOFF: 800ms → 1500ms → 2500ms → stop
                const MAX_HANDS_FREE_RESTARTS = 3;
                if (backoffStepRef.current >= MAX_HANDS_FREE_RESTARTS) {
                  // 📊 SINGLE CANONICAL EVENT: Anchors all "why did hands-free stop?" queries
                  console.log('🛑 [HandsFreeFallback]', JSON.stringify({
                    event: 'handsfree_fallback',
                    reason: 'backoff_exhausted',
                    backoff_attempts: MAX_HANDS_FREE_RESTARTS,
                    backoff_schedule_ms: [800, 1500, 2500],
                    from: 'HANDS_FREE',
                    to: 'PUSH_TO_TALK',
                    mic: micStateRef.current,
                    last_speech_ago: lastSpeechHeardAtRef.current > 0
                      ? `${Math.round((Date.now() - lastSpeechHeardAtRef.current) / 1000)}s`
                      : 'never',
                  }));
                  setIsListening(false);
                  isListeningRef.current = false;
                  wantsContinuousConversationRef.current = false;
                  handsFreeActiveRef.current = false;
                  listeningModeRef.current = 'PUSH_TO_TALK';
                  setMicState('IDLE', 'backoff_exhausted');
                  onRecordingStateChange?.(false);
                  backoffStepRef.current = 0;
                  // Notify parent so it can show toast + reset UI toggle
                  onHandsFreeFallback?.();
                  return;
                }

                const backoffDelays = [800, 1500, 2500];
                const delay = backoffDelays[backoffStepRef.current];
                backoffStepRef.current++;
                restartInFlightRef.current = true;

                console.log('🔄 [Native] stopped_backoff', JSON.stringify({
                  event: 'stopped_backoff',
                  attempt: backoffStepRef.current,
                  delay_ms: delay,
                  max_attempts: MAX_HANDS_FREE_RESTARTS,
                  schedule_ms: [800, 1500, 2500],
                  conversation_alive: true,
                }));

                setTimeout(async () => {
                  restartInFlightRef.current = false;
                  // Final guard check before actually restarting
                  if (wantsContinuousConversationRef.current && handsFreeActiveRef.current && !isSpeakingRef.current && !isProcessingRef.current && micStateRef.current === 'IDLE') {
                    try {
                      setMicState('ARMING', 'hands_free_restart');
                      // 🛡️ This path had NO watchdog, and that is the whole bug.
                      // startListening() arms a 2s timeout when it enters ARMING;
                      // this one did not, so ARMING here was unbounded. The catch
                      // below only fires on a THROWN error — it cannot see the
                      // failure that actually happens, which is start() resolving
                      // while the native `listeningState: started` event never
                      // arrives. That is precisely what backgrounding does: leave
                      // MAIA for the House, or take a screenshot of the field, and
                      // the confirmation is lost. micState then sits in ARMING
                      // forever and every later tap is refused by the authority
                      // guard as `mic_state_ARMING` — the mic can never be turned
                      // back on for the rest of the session.
                      // Witnessed on device, build 2510: taps at 13:57:25 and
                      // 13:57:48 both BLOCKED, 23s after the last stop.
                      // The watchdog owns RECOVERY. It does NOT own the
                      // ARMING → LISTENING transition — the native
                      // `listeningState: started` event does, at the handler
                      // that already sets LISTENING. Declaring LISTENING here
                      // because start() resolved would replace a stuck-but-
                      // honest state with a usable-but-lying one: the field
                      // would show a live microphone that never armed. A
                      // resolved promise is not a listening microphone.
                      if (armingTimeoutRef.current) clearTimeout(armingTimeoutRef.current);
                      armingTimeoutRef.current = setTimeout(async () => {
                        armingTimeoutRef.current = null;
                        if (micStateRef.current !== 'ARMING') return;
                        console.warn('⏱️ [Native] hands-free ARMING timeout — no start confirmation; recovering');
                        // Stop defensively: the plugin may hold a half-open
                        // session we never got told about, and re-arming on top
                        // of one is how the next attempt fails silently too.
                        try { await NativeSpeechRecognition.stop(); } catch { /* already stopped */ }
                        isStartingRef.current = false;
                        restartInFlightRef.current = false;
                        setIsListening(false);
                        isListeningRef.current = false;
                        onRecordingStateChange?.(false);
                        setMicState('IDLE', 'hands_free_arming_timeout');
                      }, 3000);

                      console.log('🎙️ [Native] Restarting speech recognition (hands-free)...');
                      await NativeSpeechRecognition.start({
                        language: 'en-US',
                        maxResults: 3,
                        partialResults: true,
                        popup: false
                      });
                      // start() resolved. That means the call was accepted, not
                      // that the microphone is live. State stays ARMING until
                      // the native event confirms it; the watchdog above is what
                      // guarantees we cannot sit here forever if it never does.
                      console.log('✅ [Native] Restart call accepted — awaiting started confirmation');
                    } catch (e: any) {
                      console.warn('⚠️ [Native] Restart failed:', e?.message || e);
                      if (armingTimeoutRef.current) {
                        clearTimeout(armingTimeoutRef.current);
                        armingTimeoutRef.current = null;
                      }
                      isStartingRef.current = false;
                      setMicState('IDLE', 'restart_failed');
                    } finally {
                      // Bounded by construction: whatever happens above, this
                      // latch does not outlive the attempt. The device trace
                      // showed `BLOCKED: restart_in_flight` as well as
                      // `mic_state_ARMING`, and a latch that can only be cleared
                      // on the success path is one silent failure away from
                      // stranding the microphone on its own.
                      restartInFlightRef.current = false;
                    }
                  } else {
                    console.log('🚫 [Native] Conditions changed, not restarting');
                    backoffStepRef.current = 0;
                  }
                }, delay);
              } else if (!handsFreeActiveRef.current && !isSpeakingRef.current) {
                // Push-to-talk mode: don't restart, just go idle
                console.log('🎤 [Native] Push-to-talk mode - mic idle, user taps to speak');
                setIsListening(false);
                isListeningRef.current = false;
                onRecordingStateChange?.(false);
              } else if (!restartGuard.allowed) {
                console.log(`🛡️ [Native] Authority guard blocked restart: ${restartGuard.reason}`);
              }
            }
          }
        });

        // 🔊 NOTE: Do NOT call VoiceController.prepareForListening() here!
        // The @capacitor-community/speech-recognition plugin configures its own
        // audio session with .voiceChat mode. Calling our AudioSessionManager first
        // causes a conflict (we use .measurement mode) that makes recognition stop immediately.
        // The plugin handles audio session setup internally - just call start() directly.

        // Start native speech recognition
        console.log('🎙️ [ContinuousConversation] About to call NativeSpeechRecognition.start()...');
        addDebug('🎙️ Calling SR.start(popup:false)...');
        try {
          const startOptions = {
            language: 'en-US',
            maxResults: 3,
            prompt: 'Speak to MAIA',
            partialResults: true,
            popup: false  // Set to true if iOS requires the popup UI
          };
          addDebug(`📝 Options: ${JSON.stringify(startOptions)}`);
          await NativeSpeechRecognition.start(startOptions);
          console.log('✅ [ContinuousConversation] NativeSpeechRecognition.start() succeeded!');
          addDebug('✅ SR.start() SUCCESS! Mic should be active');
          addDebug('🎤 Speak now - watching for partialResults...');
        } catch (startError: any) {
          const errName = startError?.name || 'UnknownError';
          const errMsg = startError?.message || String(startError);
          const errCode = startError?.code || 'no-code';
          logVoiceEvent('ios_voice_error', {
            where: 'start',
            attempt: 'popup_false',
            name: errName.slice(0, 60),
            code: errCode.slice(0, 60),
          });
          console.error('❌ [ContinuousConversation] NativeSpeechRecognition.start() FAILED:', startError);
          console.error('❌ [ContinuousConversation] Error details:', JSON.stringify(startError, null, 2));
          addDebug(`❌ start() FAILED: ${errName}`);
          addDebug(`   msg: ${errMsg}`);
          addDebug(`   code: ${errCode}`);

          // Try with popup: true as fallback (iOS may require it)
          console.log('🔄 [ContinuousConversation] Retrying with popup: true...');
          addDebug('🔄 Retrying popup:true...');
          try {
            await NativeSpeechRecognition.start({
              language: 'en-US',
              maxResults: 3,
              prompt: 'Speak to MAIA',
              partialResults: true,
              popup: true  // Try with popup enabled
            });
            console.log('✅ [ContinuousConversation] Retry with popup: true succeeded!');
            addDebug('✅ Retry succeeded!');
          } catch (retryError: any) {
            logVoiceEvent('ios_voice_error', {
              where: 'start',
              attempt: 'popup_true_retry',
              name: String(retryError?.name || 'UnknownError').slice(0, 60),
              code: String(retryError?.code || 'no-code').slice(0, 60),
            });
            console.error('❌ [ContinuousConversation] Retry also FAILED:', retryError);
            addDebug(`❌ Retry failed: ${retryError?.message || retryError}`);

            // Android: native start failed even after retry — case (3) of the
            // three native-failure modes. Try MediaRecorder + local Whisper
            // before throwing. tryAndroidFallback is a no-op on iOS so the
            // iOS retry-failed behavior (rethrow) is preserved.
            if (await tryAndroidFallback(`start_retry_${retryError?.name || 'unknown'}`)) {
              return;
            }

            throw retryError;
          }
        }

        console.log('🎙️ [ContinuousConversation] Native recognition started');

        isStartingRef.current = false; // ✅ Reset after successful start
        return;
      }

      // 🌐 Web Speech API fallback for browsers
      console.log('🌐 [ContinuousConversation] Using WEB speech recognition');

      // Check platform capabilities - ALWAYS get fresh info (don't use cached value)
      // This ensures voice works even if earlier check failed before user gesture
      const info = await getPlatformInfo();
      setPlatformInfo(info);
      console.log('[voice] Platform info:', info);

      // 🦊 Firefox / Zen path: these browsers ship NO Web Speech API
      // (SpeechRecognition / webkitSpeechRecognition are absent), so the
      // continuous-recognition path below can never start. They DO support
      // getUserMedia + MediaRecorder, so route them to a one-shot capture →
      // local Whisper (/api/voice/transcribe-simple), the same first-party
      // path used for the Android native-failure fallback. Audio stays on
      // our own maia-whisper container, never Google. One utterance per
      // startListening call (continuation, if any, is driven by the parent's
      // restart orchestration — same contract as the Android fallback).
      const canRecordAudio =
        typeof MediaRecorder !== 'undefined' &&
        typeof navigator !== 'undefined' &&
        !!navigator.mediaDevices?.getUserMedia;

      if (!hasSpeechRecognitionAPI() && canRecordAudio) {
        // Clear the 2s ARMING watchdog — this path records up to ~8s and
        // would otherwise be reset to IDLE mid-utterance.
        if (armingTimeoutRef.current) {
          clearTimeout(armingTimeoutRef.current);
          armingTimeoutRef.current = null;
        }
        console.log('🦊 [ContinuousConversation] No Web Speech API — MediaRecorder + local Whisper (one-shot)');
        addDebug('🦊 web whisper fallback (no Web Speech API)');
        logVoiceEvent('voice_listening_started', { path: 'web_whisper_fallback' });

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (err: any) {
          console.warn('🚫 [web whisper] getUserMedia failed:', err?.name);
          setVoiceError('Microphone access failed. Please check permissions.');
          setMicState('IDLE', 'web_whisper_mic_denied');
          isStartingRef.current = false;
          onRecordingStateChange?.(false);
          throw new Error('MICROPHONE_UNAVAILABLE');
        }

        isProcessingRef.current = false;
        setIsListening(true);
        isListeningRef.current = true;
        setMicState('LISTENING', 'web_whisper_fallback');
        onRecordingStateChange?.(true);
        setVoiceError(null);
        addDebug('🎙️ web whisper: recording…');

        try {
          const { recordAndTranscribe } = await import('@/lib/voice/androidVoiceFallback');
          const result = await recordAndTranscribe(stream);
          if (result.ok && result.transcript) {
            console.log(`✅ [web whisper] Transcript: ${result.transcript.length} chars, ${result.durationMs}ms`);
            addDebug(`✅ web whisper: ${result.transcript.length} chars`);
            isProcessingRef.current = true;
            onTranscript(result.transcript);
          } else {
            console.warn(`❌ [web whisper] Failed: ${result.reason}`);
            addDebug(`❌ web whisper failed: ${result.reason || 'unknown'}`);
            onVoiceUnavailable?.({
              reason: `web_whisper_${result.reason ?? 'unknown'}`,
              userMessage:
                result.reason === 'transcribe_disabled'
                  ? 'Voice transcription is not enabled on the server right now. You can type to MAIA instead.'
                  : 'I could not hear that clearly. Try again, or type to MAIA instead.',
            });
          }
        } catch (err: any) {
          console.error('💥 [web whisper] Threw:', err);
          addDebug(`💥 web whisper threw: ${err?.name || 'unknown'}`);
          onVoiceUnavailable?.({
            reason: 'web_whisper_threw',
            userMessage: 'Voice input ran into a problem. You can type to MAIA instead.',
          });
        } finally {
          stream.getTracks().forEach((t) => t.stop());
          setIsListening(false);
          isListeningRef.current = false;
          setMicState('IDLE', 'web_whisper_done');
          onRecordingStateChange?.(false);
          isStartingRef.current = false;
        }
        return;
      }

      if (!info.hasVoiceSupport) {
        const errorMsg = getVoiceUnavailableMessage(info);
        console.warn('⚠️ [ContinuousConversation] Voice not supported:', errorMsg);
        setVoiceError(errorMsg);
        throw new Error('VOICE_UNAVAILABLE');
      }

      // 🔥 FIX: Set isListeningRef BEFORE initializing audio monitoring
      // This prevents the audio level loop from immediately stopping
      isListeningRef.current = true;
      wantsContinuousConversationRef.current = true; // 🔥 FIX: User started conversation, wants to continue after MAIA responds

      // Initialize audio monitoring
      const audioReady = await initializeAudioMonitoring();
      if (!audioReady) {
        isListeningRef.current = false; // Reset on failure
        console.error('❌ [ContinuousConversation] Audio monitoring failed');
        setVoiceError('Microphone access failed. Please check permissions.');
        throw new Error('MICROPHONE_UNAVAILABLE');
      }

      console.log('✅ [ContinuousConversation] Audio monitoring ready');
      setVoiceError(null); // Clear any previous errors

      // NOW we can show listening state for web
      setIsListening(true);
      onRecordingStateChange?.(true);
      console.log('📡 [Web] Permissions OK - showing listening state');

    // 🔌 Device-change resilience: if the active audio device changes, the
    // lifecycle session hard-discards the recognition instance and the handler
    // returns the UI to a recoverable idle state (reacquire via mic tap only).
    // attachDeviceChange is idempotent, so calling it on every start is safe.
    if (navigator.mediaDevices?.addEventListener) {
      getWebSession().attachDeviceChange(navigator.mediaDevices, () => handleWebDeviceChangeFnRef.current?.());
    }

    // 🔁 LIFECYCLE: single start gate. Never reuses a failed/aborted/suspended
    // instance — the session decides whether a fresh object is required
    // (replacing the old recognitionNeedsRefreshRef dance). A failed start()
    // clears listening state and surfaces a retryable message (no latch).
    isProcessingRef.current = false;
    // Reset restart counter when user manually starts listening.
    // NOTE: Do NOT reset lastSpeechTime here - it should only be set when
    // actual speech is detected (prevents the "blinking listening" bug).
    consecutiveRestartCount.current = 0;

    const started = ensureFreshAndStartFnRef.current?.('user_start') ?? false;
    if (!started) {
      throw new Error('RECOGNITION_START_FAILED');
    }
    } catch (error: any) {
      console.error('❌ [ContinuousConversation] Failed to start listening:', error);
      // Reset state on error and notify parent
      setIsListening(false);
      isListeningRef.current = false;
      isStartingRef.current = false; // ✅ Reset starting flag on error
      onRecordingStateChange?.(false); // Hide visualizer on error
      throw error; // Re-throw so parent component can handle
    } finally {
      // Ensure starting flag is always reset, even on unexpected errors
      isStartingRef.current = false;
    }
  }, [initializeSpeechRecognition, initializeAudioMonitoring, onTranscript, onInterimTranscript, onRecordingStateChange, addDebug, ensureNativeSpeechReady]);

  // Stop listening
  // 🔥 FIX: userExitMode flag indicates user explicitly tapped holoflower to stop
  // When true, we clear wantsContinuousConversationRef so auto-restart won't trigger
  // When false/undefined (internal stop for transcript processing), we keep the ref so mic auto-restarts after MAIA
  const stopListening = useCallback(async (options?: { userExitMode?: boolean }) => {
    console.log('🛑 [ContinuousConversation] stopListening called', options?.userExitMode ? '(USER EXIT MODE)' : '(internal)');

    // 🔥 FIX: Only clear wantsContinuousConversation when user explicitly exits voice mode
    if (options?.userExitMode) {
      console.log('🚪 [ContinuousConversation] User explicitly exited voice mode - clearing wantsContinuousConversationRef');
      wantsContinuousConversationRef.current = false;
      // Reset Android no-speech counters on explicit user stop so a future
      // mic tap gets a fresh budget (the failure may have been transient).
      noSpeechCycleCountRef.current = 0;
      noSpeechFallbackFiredRef.current = false;
    }

    // 🔥 CRITICAL: Process accumulated transcript BEFORE stopping
    // On iOS, the final transcript from native is often empty, so we must use accumulated partials
    if (accumulatedTranscript.current.trim()) {
      const finalTranscript = accumulatedTranscript.current.trim();
      console.log('📤 [stopListening] Processing accumulated transcript:', finalTranscript);

      // `onTranscript` is a required prop — no truthiness check needed.
      if (!isProcessingRef.current) {
        setIsRecording(false);
        onRecordingStateChange?.(false);
        if (submitUtterance(finalTranscript, 'stopListening')) {
          isProcessingRef.current = true;
        }
      }
      accumulatedTranscript.current = '';
    }
    continuationRestartRef.current = false; // manual stop ends any continuation

    setIsListening(false);
    isListeningRef.current = false; // Update ref immediately
    setIsRecording(false);
    isRecordingRef.current = false; // Update ref immediately
    recognitionActiveRef.current = false; // Clear double-start guard
    setAudioLevel(0);
    smoothedAudioLevelRef.current = 0; // Reset EMA smoothing
    nativeStatusRef.current = 'stopped'; // 🔑 Reset native status immediately

    // Stop native speech recognition on iOS/Android
    if (useNativeSpeechRef.current) {
      try {
        // Stop recognition first
        await NativeSpeechRecognition.stop();
        console.log('🛑 [Native] Recognition stopped');

        // Clean up partialResults listener
        if (nativeListenerRef.current) {
          try {
            await nativeListenerRef.current.remove();
          } catch (e) {
            // Ignore - may already be removed
          }
          nativeListenerRef.current = null;
        }

        // Clean up listeningState listener
        if (nativeStateListenerRef.current) {
          try {
            await nativeStateListenerRef.current.remove();
          } catch (e) {
            // Ignore - may already be removed
          }
          nativeStateListenerRef.current = null;
        }

        // Clean up audioLevel listener
        if (nativeAudioLevelListenerRef.current) {
          try {
            await nativeAudioLevelListenerRef.current.remove();
          } catch (e) {
            // Ignore - may already be removed
          }
          nativeAudioLevelListenerRef.current = null;
        }

        // Clear silence timer
        if (nativeSilenceTimerRef.current) {
          clearTimeout(nativeSilenceTimerRef.current);
          nativeSilenceTimerRef.current = null;
        }

        // Final cleanup - remove any remaining listeners
        await NativeSpeechRecognition.removeAllListeners();
        console.log('🧹 [Native] All listeners cleaned up');
      } catch (e) {
        console.warn('⚠️ [Native] Error stopping:', e);
      }
    }

    // Stop web speech recognition — hard discard through the lifecycle session
    // (detaches every handler, aborts, unregisters from VFP). No late callback
    // from the old instance can fire after this; the next start builds fresh.
    getWebSession().discard('stop_listening');
    recognitionRef.current = null;

    // Clear timers
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (recognitionTimeoutRef.current) {
      clearTimeout(recognitionTimeoutRef.current);
      recognitionTimeoutRef.current = null;
    }

    if (conversationTimeoutRef.current) {
      clearTimeout(conversationTimeoutRef.current);
      conversationTimeoutRef.current = null;
    }

    // Stop audio monitoring
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Track analytics (disabled for Vercel build)
    // Analytics.stopRecording({
    //   recording_duration_ms: Date.now() - lastSpeechTime.current,
    //   success: true,
    //   mode: 'continuous'
    // });
  }, [onTranscript, onRecordingStateChange, getWebSession]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    // 🔑 For native: use nativeStatusRef as single source of truth
    // For web: use isListeningRef
    const shouldStop = useNativeSpeechRef.current
      ? nativeStatusRef.current === 'started'
      : isListeningRef.current;

    console.log('🔄 [ContinuousConversation] toggleListening - native:', useNativeSpeechRef.current,
      'nativeStatus:', nativeStatusRef.current, 'isListening:', isListeningRef.current, '→', shouldStop ? 'STOP' : 'START');

    if (shouldStop) {
      console.log('⏹️ [ContinuousConversation] Stopping listening');
      stopListening();
    } else {
      console.log('▶️ [ContinuousConversation] Starting listening');
      startListening();
    }
  }, [startListening, stopListening]);

  // Extend recording - reset silence timer to keep recording longer
  const extendRecording = useCallback(() => {
    console.log('⏱️ [extendRecording] Resetting silence timer');

    // Clear existing silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    // Restart silence timer with full threshold
    silenceTimerRef.current = setTimeout(() => {
      console.log('🔕 Silence detected after extension - processing transcript');
      if (!isProcessingRef.current && accumulatedTranscript.current.trim()) {
        processAccumulatedTranscript();
      }
    }, silenceThreshold);
  }, [silenceThreshold, processAccumulatedTranscript]);

  // Assign functions to refs after they're defined
  useEffect(() => {
    startListeningFnRef.current = startListening;
    stopListeningFnRef.current = stopListening;
    toggleListeningFnRef.current = toggleListening;
    extendRecordingFnRef.current = extendRecording;
  }, [startListening, stopListening, toggleListening, extendRecording]);

  // 📱 iOS INTERRUPTION HANDLERS — phone calls, Siri, BT changes, etc.
  const handleInterruptionStart = useCallback(async () => {
    console.log('⚡ [INTERRUPT] iOS audio interruption started — stopping everything');
    setMicState('INTERRUPTED', 'ios_interruption_start');

    // Stop all recognition and playback
    if (useNativeSpeechRef.current) {
      try { await NativeSpeechRecognition.stop(); } catch {}
    }
    // Web: hard-discard so the interrupted instance is never reused
    // (an interruption mid-capture is exactly the state that zombies it)
    discardRecognitionFnRef.current?.('ios_interruption');

    setIsListening(false);
    isListeningRef.current = false;
    setIsRecording(false);
    isRecordingRef.current = false;
    onRecordingStateChange?.(false);

    // Do NOT auto-restart — wait for interruptionEnd
  }, [onRecordingStateChange]);

  const handleInterruptionEnd = useCallback(() => {
    console.log('⚡ [INTERRUPT] iOS audio interruption ended');

    // Only auto-restart if hands-free + conversation alive
    if (handsFreeActiveRef.current && isConversationAlive({
      lastTranscriptAt: lastTranscriptSubmittedAtRef.current,
      lastAudioEndAt: lastAudioEndAtRef.current,
      lastMicTapAt: lastMicTapAtRef.current,
    })) {
      console.log('🔄 [INTERRUPT] Hands-free + conversation alive — restarting in 1s');
      setMicState('IDLE', 'ios_interruption_end');
      setTimeout(() => {
        if (micStateRef.current === 'IDLE' && !isSpeakingRef.current) {
          startListeningFnRef.current?.();
        }
      }, 1000);
    } else {
      console.log('🎤 [INTERRUPT] Push-to-talk or stale conversation — staying idle');
      setMicState('IDLE', 'ios_interruption_end');
    }
  }, []);

  // 📱 FOREGROUND RESUME SAFETY NET — catch edge cases where OracleConversation relay misses
  // This is a belt-and-suspenders guard: if iOS killed SR while backgrounded and the
  // parent's onInterruptionEnd relay didn't fire (or fired too early), this catches it.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let cleanup: (() => void) | undefined;
    (async () => {
      try {
        const { App } = await import('@capacitor/app');
        const listener = await App.addListener('appStateChange', async ({ isActive }) => {
          if (!isActive) return;

          // Only auto-resume if hands-free is actually enabled
          if (listeningModeRef.current !== 'HANDS_FREE') return;
          if (!handsFreeActiveRef.current) return;

          // Don't fight the rest of the state machine
          if (isSpeakingRef.current) return;
          if (isProcessingRef.current) return;

          // restart_in_flight used to return here, which made this handler
          // unable to rescue the very case that needs rescuing: the restart
          // timer that set the latch cannot have survived the background
          // transition, so on foreground the latch is stale by definition.
          // Returning on it meant a stranded latch stayed stranded — the trace
          // showed `BLOCKED: restart_in_flight` alongside `mic_state_ARMING`.
          if (restartInFlightRef.current) {
            console.warn('🔁 [AppState] Foregrounded with stale restart_in_flight — clearing');
            restartInFlightRef.current = false;
          }

          // If iOS killed SR while backgrounding, we come back INTERRUPTED or IDLE
          // — or ARMING, which this handler used to refuse.
          //
          // ARMING is the state that actually strands the microphone. Leaving
          // MAIA for the House, or taking a screenshot of the field, backgrounds
          // the app mid-arm; the native start-confirmation never arrives, and we
          // return foregrounded still in ARMING. Bailing out here meant the one
          // mechanism that could rescue the mic declined to act on the only
          // state it needed to rescue — so voice stayed dead for the rest of the
          // session and no amount of tapping recovered it.
          //
          // A foregrounded ARMING is stale by definition: arming is a
          // sub-second operation, and anything still arming across a background
          // transition has already lost its audio session. Treat it as IDLE and
          // let the resume path re-arm honestly.
          const ms = micStateRef.current;
          if (ms === 'ARMING') {
            console.warn('🔁 [AppState] Foregrounded while stuck in ARMING — clearing stale arm');
            if (armingTimeoutRef.current) {
              clearTimeout(armingTimeoutRef.current);
              armingTimeoutRef.current = null;
            }
            // Stop before re-arming. Backgrounding may have left a half-open
            // native session that we were never told about; starting on top of
            // one reproduces the same silent non-confirmation we are recovering
            // from. Failure here is expected and ignorable — it means there was
            // nothing to stop, which is the outcome we want either way.
            try { await NativeSpeechRecognition.stop(); } catch { /* nothing live */ }
            isStartingRef.current = false;
            restartInFlightRef.current = false;
            setIsListening(false);
            isListeningRef.current = false;
            onRecordingStateChange?.(false);
            setMicState('IDLE', 'foreground_clear_stale_arming');
          } else if (ms !== 'INTERRUPTED' && ms !== 'IDLE') {
            return;
          }

          // Extra safety: conversation must still be alive
          if (!isConversationAlive({
            lastTranscriptAt: lastTranscriptSubmittedAtRef.current,
            lastAudioEndAt: lastAudioEndAtRef.current,
            lastMicTapAt: lastMicTapAtRef.current,
          })) return;

          console.log('🔁 [AppState] Foregrounded — attempting hands-free resume');
          setMicState('IDLE', 'app_foreground_resume');
          setTimeout(() => {
            if (micStateRef.current === 'IDLE' && !isSpeakingRef.current) {
              startListeningFnRef.current?.();
            }
          }, 800); // Slight delay for audio session to settle
        });
        cleanup = () => listener.remove();
      } catch {
        // Not on Capacitor — no-op
      }
    })();

    return () => { cleanup?.(); };
  }, []);

  // Expose methods to parent via refs (avoids temporal dead zone)
  useImperativeHandle(ref, () => ({
    startListening: (options?: { forceOverride?: boolean }) => startListeningFnRef.current?.(options),
    stopListening: (options?: { userExitMode?: boolean }) => stopListeningFnRef.current?.(options),
    toggleListening: () => toggleListeningFnRef.current?.(),
    extendRecording: () => extendRecordingFnRef.current?.(),
    setHandsFree: (active: boolean) => {
      const prev = listeningModeRef.current;
      handsFreeActiveRef.current = active;
      listeningModeRef.current = active ? 'HANDS_FREE' : 'PUSH_TO_TALK';
      // Reset backoff when mode changes (fresh start)
      backoffStepRef.current = 0;
      // 📊 STRUCTURED LOG: Mode transition
      console.log('🎙️ [MODE]', JSON.stringify({
        voice_mode: active ? 'hands_free' : 'push_to_talk',
        prev_mode: prev,
        reason: 'user_toggle',
        mic: micStateRef.current,
        backoff: 0,
      }));
    },
    onInterruptionStart: () => handleInterruptionStart(),
    onInterruptionEnd: () => handleInterruptionEnd(),
    isListening,
    isRecording,
    isHandsFree: handsFreeActiveRef.current,
    micState: micStateRef.current,
    listeningMode: listeningModeRef.current,
  }), [isListening, isRecording, handleInterruptionStart, handleInterruptionEnd]);

  // DISABLED: Auto-start temporarily disabled to fix initialization issues
  // TODO: Re-enable with proper initialization order
  // const hasMountedRef = useRef(false);
  // useEffect(() => {
  //   if (!hasMountedRef.current) {
  //     hasMountedRef.current = true;
  //     if (autoStart && !isListening && !isSpeaking && !isProcessing) {
  //       const timer = setTimeout(() => {
  //         if (typeof startListening === 'function') {
  //           startListening();
  //         }
  //       }, 1000);
  //       return () => clearTimeout(timer);
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // 🎤 DISABLED: All restart logic is now handled by recognition.onend
  // User-initiated restarts happen via parent component calling startListening()
  // This prevents infinite loop issues

  // DISABLED: This was causing infinite loop - onAudioLevelChange triggers setState in parent
  // which re-renders, which calls this effect again with onAudioLevelChange recreated
  // useEffect(() => {
  //   if (onAudioLevelChange) {
  //     onAudioLevelChange(audioLevel, isRecording);
  //   }
  // }, [audioLevel, isRecording, onAudioLevelChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      // Full lifecycle teardown: discards any remaining recognition instance
      // (handlers detached — no restart can fire post-unmount) and removes the
      // devicechange listener.
      webSessionRef.current?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run on mount/unmount

  // Visual states
  const isActive = isListening && !isSpeaking && !isProcessing;
  const showLoader = isTranscribing || isProcessing;

  // 🐛 Show diagnostic info on mount for native platforms
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const platform = Capacitor.getPlatform();
      addDebug(`🚀 Mount: platform=${platform}, isNative=${Capacitor.isNativePlatform()}`);
      addDebug(`📱 UserAgent: ${navigator.userAgent.slice(0, 60)}...`);

      // Check speech recognition availability immediately
      (async () => {
        try {
          const avail = await NativeSpeechRecognition.available();
          addDebug(`🎤 SR available: ${avail?.available}`);
          const perms = await NativeSpeechRecognition.checkPermissions();
          addDebug(`🔐 SR permission: ${perms?.speechRecognition}`);
        } catch (e: any) {
          addDebug(`❌ SR check error: ${e?.message || e}`);
        }
      })();
    }
  }, [addDebug]);

  return (
    <>
      {/* Debug panel removed - was interfering with mic activation */}

    <div className="flex items-center gap-3">
      {/* Main control button */}
      <button
        onClick={toggleListening}
        disabled={isProcessing || (platformInfo?.hasVoiceSupport === false)}
        className={`
          relative p-3 rounded-lg transition-all
          ${isListening
            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
            : 'bg-white/10 text-gray-400 hover:bg-white/20'
          }
          ${(isProcessing || platformInfo?.hasVoiceSupport === false) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        aria-label={isListening ? 'Stop continuous listening' : 'Start continuous listening'}
        title={platformInfo?.hasVoiceSupport === false ? voiceError || 'Voice unavailable' : undefined}
      >
        {showLoader ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : platformInfo?.hasVoiceSupport === false ? (
          <AlertCircle className="w-5 h-5" />
        ) : isListening ? (
          <Wifi className="w-5 h-5" />
        ) : (
          <WifiOff className="w-5 h-5" />
        )}

        {/* Recording indicator */}
        {isRecording && (
          <span className="absolute -top-1 -right-1 w-3 h-3">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
        )}
      </button>

      {/* Status indicator */}
      <div className="flex items-center gap-2 text-sm">
        {voiceError ? (
          <>
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 max-w-xs text-xs">
              {voiceError}
            </span>
          </>
        ) : isListening ? (
          <>
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-green-400">
              {isRecording ? 'Listening...' :
               isSpeaking ? 'Maya speaking...' :
               isProcessing ? 'Processing...' : 'Ready'}
            </span>
          </>
        ) : null}
      </div>

      {/* Audio level indicator */}
      {isListening && isRecording && !voiceError && (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-1 h-${Math.max(1, Math.floor(audioLevel * 5) - i)}
                         bg-green-400/60 rounded-full transition-all duration-100`}
              style={{ height: `${Math.max(4, audioLevel * 20 * (1 - i * 0.15))}px` }}
            />
          ))}
        </div>
      )}
    </div>
    </>
  );
});

ContinuousConversation.displayName = 'ContinuousConversation';