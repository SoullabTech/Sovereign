"use client";

import React, { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
import { Mic, MicOff, Loader2, Activity, Wifi, WifiOff, AlertCircle } from "lucide-react";
import VoiceFeedbackPrevention from "@/lib/voice/voice-feedback-prevention";
import { getPlatformInfo, getVoiceUnavailableMessage, isAndroidWebChrome, hasSpeechRecognitionAPI, isDesktopShell, selectVoiceTransport, type PlatformInfo } from "@/lib/utils/platformDetection";
import { DESKTOP_MAX_UTTERANCE_MS } from "@/lib/voice/desktopUtteranceLimits";
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition as NativeSpeechRecognition } from '@capacitor-community/speech-recognition';
import { VoiceController } from '@/lib/voice/AudioSessionManager';
import { getFeatureFlag } from '@/lib/features/flags';
import { logVoiceEvent, resetVoiceSession } from '@/lib/voice/voiceDiagnostics';
import { pushVoiceDebug } from '@/lib/voice/voiceDebugBus';
import { WebSpeechRecognitionSession, classifyRecognitionError } from '@/lib/voice/webSpeechLifecycle';
import {
  assessCaptureLiveness,
  describeCaptureLoss,
  isCaptureLossUnexpected,
  TRACK_MUTE_GRACE_MS,
  CAPTURE_HEARTBEAT_MS,
  ANALYSER_ONSET_QUIET_MS,
  CAPTURE_REASON_CODES,
  type CaptureLossCause,
} from '@/lib/voice/micLiveness';
import {
  buildCaptureForensics,
  ANALYSER_PEAK_WINDOW_MS,
} from '@/lib/voice/captureForensics';
import { getContinuityBuffer } from '@/lib/voice/conversationContinuityBuffer';
import {
  recordDispatch,
  resetDispatchProvenance,
  type TranscriptDispatchSource,
  type TranscriptDispatchTrigger,
} from '@/lib/voice/dispatchProvenance';
import { VOICE_TIMING } from '@/lib/voice/voiceTiming';
import { classifyRecognitionEnd, RAPID_END_LOOP_THRESHOLD } from '@/lib/voice/rapidEndPolicy';
import {
  TURN_COMPLETE_RECOVERABLE,
  shouldNormalizeToIdle,
  restartPolicy,
  staleLatchesToClearForTap,
  type RestartSourceName,
} from '@/lib/voice/restartAuthority';
import {
  readTailSnapshot,
  measureTailOverlap,
  shouldEmitThrottled,
  type UtteranceSendTrigger,
} from '@/lib/voice/utteranceTail';
// import { Analytics } from "../../lib/analytics/supabaseAnalytics"; // Disabled for Vercel build

// =============================================================================
// 🎙️ VOICE STATE MACHINE — Single authority for mic lifecycle
// =============================================================================
// Rule: ONLY requestRestart() may INITIATE a new listening cycle. Every re-arm
// path — user tap, maia_stopped_speaking, recognition_stopped, interruption_end,
// foreground_resume — routes through it; it normalizes stale turn-complete state,
// applies the HANDS_FREE/PUSH_TO_TALK policy once, and delegates to the
// startListening lifecycle. Direct NativeSpeechRecognition.start() /
// recognition.start() calls are permitted ONLY inside that lifecycle
// (ensureFreshAndStart, startListening), never in orchestration or effects.
//
// This rule was false from the first commit until the P0 of 2026-08-26: the name
// `requestRestart` appeared exactly once — in this comment — while five call
// sites started recognition directly. It is now enforced by the code below and
// by __tests__/restartAuthority.test.ts.

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
    (ctx.lastTranscriptAt > 0 && now - ctx.lastTranscriptAt < VOICE_TIMING.CONVERSATION_ALIVE_MS) ||
    (ctx.lastAudioEndAt > 0 && now - ctx.lastAudioEndAt < VOICE_TIMING.POST_RESPONSE_ALIVE_MS) ||
    (ctx.lastMicTapAt > 0 && now - ctx.lastMicTapAt < VOICE_TIMING.MIC_TAP_ALIVE_MS)
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

/**
 * States a turn can legitimately END in, from which the mic must be recoverable.
 *
 * THE P0 THIS ENCODES. `authorityGuard` refuses every restart unless micState is
 * IDLE or ERROR. Before this fix the post-TTS handler returned the mic to IDLE
 * only from PLAYING_TTS:
 *
 *     if (micStateRef.current === 'PLAYING_TTS') setMicState('IDLE', ...)
 *
 * So a turn that ended in SUBMITTING or WAITING_FOR_TTS — MAIA answered from a
 * path that never passed through PLAYING_TTS, or the TTS state was cleared by
 * another handler first — left micState pinned at a value the guard rejects.
 * Every subsequent restart was then blocked with `mic_state_SUBMITTING`,
 * including an explicit user tap. That is "MAIA is dead after one round", on
 * both PWA and iOS, and no amount of tapping recovers it.
 *
 * Normalization is therefore keyed on the SET of turn-complete states, not on
 * one privileged predecessor. LISTENING and CAPTURING are deliberately absent:
 * those mean capture is live and must never be stomped.
 */
// (the set itself now lives in lib/voice/restartAuthority.ts so it is testable)

/** Sources permitted to request a new listening cycle. */
export type RestartSource = RestartSourceName;

export interface ContinuousConversationProps {
  onTranscript: (text: string) => void;
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
  /**
   * Called whenever voice capture changes in a way the member must SEE.
   *
   * This component is mounted inside an `sr-only` wrapper by OracleConversation,
   * so its own status line and error banner are visually hidden. Before this
   * callback existed, every voice failure message it produced was rendered to
   * nobody — which is the mechanical reason a dead mic looked like a live one.
   * The parent is the only surface that can actually show the member anything.
   *
   * `recoverable` means tapping the mic is expected to work. `cause` is the
   * machine-readable reason for telemetry; `userMessage` is the wording to show.
   */
  onVoiceStatus?: (info: {
    level: 'info' | 'warning' | 'error';
    cause: string;
    userMessage: string;
    recoverable: boolean;
  }) => void;
  /**
   * Called with speech that was transcribed but never submitted, when voice
   * capture is lost mid-utterance.
   *
   * Sovereignty: what the member said is the member's. A failure in our capture
   * layer is not a licence to discard it. The parent puts this back in the
   * message box as an editable draft, so the member decides whether to send,
   * edit, or drop it — MAIA never auto-submits words the member did not choose
   * to send, and never silently loses them either.
   */
  onTranscriptSalvage?: (info: { text: string; cause: string }) => void;
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

/**
 * VOICE-CAPTURE-01B-OBS — emit a provenance witness for one transcript
 * dispatch. MUST be called immediately before the `onTranscript(...)` it
 * describes, never after: if the callback throws, the evidence that a
 * dispatch was attempted has to survive.
 *
 * Module-level rather than a `useCallback` on purpose — it closes over
 * nothing, so it cannot go stale, cannot churn a dependency array, and cannot
 * be accidentally reordered into a temporal dead zone by a later edit.
 *
 * Purely observational: it returns void and no caller branches on it.
 */
function witnessDispatch(
  source: TranscriptDispatchSource,
  trigger: TranscriptDispatchTrigger,
  transcript: string,
  epoch: number,
  turnCommitId: number,
): void {
  const provenance = recordDispatch(transcript, Date.now());
  logVoiceEvent('voice_transcript_dispatched', {
    ...provenance,
    source,
    trigger,
    epoch,
    turnCommitId,
  });
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
    onVoiceStatus,
    onTranscriptSalvage,
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
  const restartRequestInFlightRef = useRef(false); // True while requestRestart() is deciding/starting
  // Forward refs: the post-TTS effects run above where these are defined.
  const normalizeTurnCompleteStateFnRef = useRef<(source: string) => void>();
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

  // ==========================================================================
  // 🩺 CAPTURE LIVENESS — detect the mic dying without saying anything
  // ==========================================================================
  // The lifecycle session above handles failures recognition REPORTS. These
  // refs handle the failure it does not: the instance stays nominally alive
  // while audio silently stops arriving (zombie recognition), or another
  // application takes the input track (the Zoom case — no `devicechange`
  // fires, because the device list never changed). Both look identical from
  // the outside: a lit mic button and an absence of events. Only a watchdog
  // measuring that absence can see them. See lib/voice/micLiveness.ts.
  /** Timestamp of the last event of any kind from the live recognition object. */
  const lastCaptureActivityAtRef = useRef<number>(0);
  /** Timestamp of the last `onstart`. 0 when no instance is armed. */
  const captureArmedAtRef = useRef<number>(0);
  /** Has `onaudiostart` fired for the currently armed instance? */
  const captureAudioOpenedRef = useRef<boolean>(false);
  const livenessTimerRef = useRef<NodeJS.Timeout | null>(null);
  /** Pending confirmation that a track `mute` is sustained, not transient. */
  const trackMuteTimerRef = useRef<NodeJS.Timeout | null>(null);
  /** Audio track listeners, kept so they can be detached with the stream. */
  const trackListenerCleanupRef = useRef<(() => void) | null>(null);
  /**
   * One silent self-heal per loss, then we stop and tell the member.
   * Retrying forever is how a dead mic keeps looking alive — the opposite of
   * what this whole path is for. Reset on any successful capture activity.
   */
  const selfHealAttemptedRef = useRef<boolean>(false);
  const handleCaptureLossFnRef = useRef<(cause: CaptureLossCause) => void>();
  const attachTrackLossListenersFnRef = useRef<(stream: MediaStream) => void>();
  const reportVoiceStatusFnRef = useRef<(info: {
    level: 'info' | 'warning' | 'error'; cause: string; userMessage: string; recoverable: boolean;
  }) => void>();
  const salvageTranscriptFnRef = useRef<(cause: string) => boolean>();

  /** Stamp capture activity: the pipeline is demonstrably alive right now. */
  const markCaptureActivity = useCallback((audioOpened?: boolean) => {
    lastCaptureActivityAtRef.current = Date.now();
    if (audioOpened) captureAudioOpenedRef.current = true;
    selfHealAttemptedRef.current = false;
  }, []);

  // ==========================================================================
  // 🔬 CAPTURE FORENSICS — VOICE-CAPTURE-NO-AUDIO-01A (observation only)
  // ==========================================================================
  // The watchdog above can say capture died. It cannot say why, and the
  // production trace is the same every time: onstart/onaudiostart/onspeechstart
  // fire, then nothing — no result, no error (and onerror IS wired to
  // telemetry, so that absence is evidence), no end — until silent_death.
  //
  // Every surviving hypothesis fits that trace equally well. The refs below
  // exist so the NEXT occurrence discriminates between them by itself, using
  // the witness that was already running and never read: this component's own
  // AnalyserNode, bound to the same MediaStream the recognizer holds. Analyser
  // still seeing voice while recognition is quiet ⇒ the audio arrived and the
  // recognition pipeline is the corpse. Analyser equally silent ⇒ the failure
  // is upstream of both. See lib/voice/captureForensics.ts.
  //
  // NOTHING BRANCHES ON ANY OF THIS. These refs are written by the existing
  // handlers and read once, at the moment of loss, into telemetry. No
  // threshold here can alter restart policy, recovery, or member-facing state.
  /** Per-boundary lifecycle stamps. `captureArmedAtRef` is zeroed on loss; these are not. */
  const lastOnStartAtRef = useRef<number>(0);
  const lastAudioStartAtRef = useRef<number>(0);
  const lastSpeechStartAtRef = useRef<number>(0);
  const lastErrorAtRef = useRef<number>(0);
  const lastEndAtRef = useRef<number>(0);
  /** When the rAF level loop last completed a tick — separates "stalled" from "silent". */
  const analyserLastTickAtRef = useRef<number>(0);
  /** When the analysed level last crossed the VAD threshold. */
  const analyserLastVoiceAtRef = useRef<number>(0);
  /**
   * When the member last STARTED a speech episode — a voice sample that
   * followed at least ANALYSER_ONSET_QUIET_MS of quiet.
   *
   * This is the liveness watchdog's challenge to recognition (see
   * lib/voice/micLiveness.ts). It is an onset, not a presence: continuous
   * speech produces exactly one, so a member talking at length is never timed
   * out, and a member sitting quietly never produces one at all.
   */
  const analyserVoiceOnsetAtRef = useRef<number>(0);
  /** Ticks since the loop started. Distinguishes "never ran" from "ran then stopped". */
  const analyserTicksRef = useRef<number>(0);
  /**
   * Rolling peak. Two windows, not one: a loss landing just after a window
   * boundary would otherwise report a peak of zero for a mic that was working
   * a second earlier, which is precisely the wrong answer.
   */
  const analyserPeakRef = useRef<{ startedAt: number; peak: number; prevPeak: number }>({
    startedAt: 0, peak: 0, prevPeak: 0,
  });
  /** Last observed visibility transition — a backgrounded tab throttles rAF. */
  const lastVisibilityChangeAtRef = useRef<number>(0);

  // Convenience aliases (kept for backward compat with existing code)
  /**
   * DESKTOP-SOVEREIGN-STT-LIFECYCLE-01 — the sovereign capture, owned by the
   * component rather than by one async function's local scope.
   *
   * ⛔ THE DEFECT. The Desktop branch held its MediaStream in `let stream`, and
   * `stopListening()` only ever knew about `micStreamRef.current`. So component
   * teardown could not reach an in-flight sovereign capture: a member who left
   * `/maia` mid-sentence left a recorder running behind another screen, which
   * then POSTed their audio to `/api/voice/transcribe-simple` and dispatched a
   * transcript into a conversation they had walked away from.
   *
   * ⛔ THE GENERATION TOKEN is the half that a stream reference alone does not
   * solve. Aborting stops the work; it does not un-schedule a promise that has
   * already resolved. Every result is checked against the generation it was
   * started under, so a completion that arrives after revocation is dropped
   * rather than dispatched — and a NEWER capture's teardown cannot be undone by
   * an older one's `finally`.
   */
  const sovereignCaptureRef = useRef<{
    generation: number;
    stream: MediaStream | null;
    controller: AbortController;
  } | null>(null);
  const sovereignGenerationRef = useRef(0);

  /**
   * Revoke the active sovereign capture. Idempotent, synchronous, safe to call
   * when there is none.
   */
  const revokeSovereignCapture = useCallback((reason: string) => {
    const active = sovereignCaptureRef.current;
    // Bumping FIRST means any in-flight completion is already stale by the time
    // it returns, even if abort/stop below throws.
    sovereignGenerationRef.current += 1;
    if (!active) return;
    sovereignCaptureRef.current = null;
    try { active.controller.abort(); } catch { /* already aborted */ }
    try { active.stream?.getTracks().forEach((t) => t.stop()); } catch { /* already stopped */ }
    console.log(`🛡️ [sovereign capture] revoked (${reason})`);
  }, []);

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
  // ── V5 utterance-tail witness, continuous path — observation only ───────
  // Same events and field names as the composer-mic witness (PR #1099), so one
  // parser reads both capture paths. This path is the one that produced the
  // r03jxcim trace: `voice_transcribe_result` is emitted only from here.
  // Nothing below is branched on; these refs feed telemetry and nothing else.
  const lastInterimAtRef = useRef<number>(0);
  const lastFinalAtRef = useRef<number>(0);
  const lastInterimCharsRef = useRef<number>(0);
  const lastResultAtRef = useRef<number>(0);
  const timerArmedAtRef = useRef<number>(0);
  const interimTelemetryAtRef = useRef<number>(0);
  const armTelemetryAtRef = useRef<number>(0);
  // Correlates every event of one turn. Incremented at commit.
  const turnCommitIdRef = useRef<number>(0);
  // True between a commit and the next recognition start — the window in which
  // a further result is ordering F (a trailing result arriving after commit).
  const committedRef = useRef<boolean>(false);
  const committedAtRef = useRef<number>(0);
  // Set immediately before each processAccumulatedTranscript() call so the
  // commit event can name its own cause without changing the function signature.
  const sendTriggerRef = useRef<UtteranceSendTrigger>('other');
  // ── VOICE-02A: recognition-epoch boundary ──────────────────────────────
  // Safari terminates recognition while a nonempty interim tail is still
  // outstanding (production trace 2026-08-25: ends 0.47s / 0.70s / 1.0s after
  // the last interim, auto-restart ~306ms later). Finals survive the restart;
  // the unfinalized tail is in no buffer. The 12s silence timer is NOT the
  // immediate cause at these boundaries, so the timer-boundary witness alone
  // would have been silent on this mechanism.
  //
  // `epoch` numbers each recognition instance so an analyst can ask the one
  // question the raw trace cannot answer: was the tail LOST, or did Safari
  // re-deliver overlapping words in the next epoch? That distinction decides
  // whether salvage is needed and whether salvage would double-count.
  const recognitionEpochRef = useRef<number>(0);
  const epochFirstResultSeenRef = useRef<boolean>(false);
  // Separate from firstResult: Safari commonly restarts as interim → interim →
  // final. A single shared flag is consumed by the first INTERIM, so the final
  // that actually carries the comparison would report firstResult=false and
  // precedingEpochTailChars=0 — the comparison would silently never happen.
  const epochFirstFinalSeenRef = useRef<boolean>(false);
  // The tail TEXT the previous epoch ended holding. In memory only, for the
  // duration of one restart seam — same class of holding as
  // accumulatedTranscript. Never logged, never persisted; only the overlap
  // COUNTS derived from it are emitted.
  const lastInterimTextRef = useRef<string>('');
  const epochEndedWithTailTextRef = useRef<string>('');
  // The tail the PREVIOUS epoch ended holding, carried across the restart so
  // the next epoch's first final can be compared against it.
  const epochEndedWithTailCharsRef = useRef<number>(0);
  const epochEndedAtRef = useRef<number>(0);
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
  // VOICE-ABORT-01. Counts CONSECUTIVE sub-500ms recognition ends. A single
  // rapid abort is not a loop — it is the ordinary cost of restarting the mic
  // the instant MAIA stops speaking, and Chrome invalidates such an instance
  // routinely. Only a run of them is a loop. Reset whenever an epoch survives
  // the rapid window.
  const consecutiveRapidEndCount = useRef<number>(0);

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

  // Parent callbacks reached from watchdog timers and recognition handlers.
  // Held in refs for the same reason as onInterruptRef: these fire from
  // closures created once per instance and must never see a stale prop.
  const onVoiceStatusRef = useRef(onVoiceStatus);
  onVoiceStatusRef.current = onVoiceStatus;
  const onTranscriptSalvageRef = useRef(onTranscriptSalvage);
  onTranscriptSalvageRef.current = onTranscriptSalvage;

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

    // ⛔ DESKTOP-SOVEREIGN-STT-01 · S2 — Desktop may NEVER construct or start
    // browser speech recognition.
    //
    // This is the single construction site, so refusing here makes the rule
    // structural rather than a property of one call path. Every caller —
    // startListening, the onend restart, the adoption path at ~1791 — receives
    // null and cannot proceed to `.start()`.
    //
    // ⛔ It is deliberately NOT phrased as "when Web Speech is unavailable".
    // Chromium ships SpeechRecognition, so an availability test would let
    // Desktop straight back onto the browser service. The question is which
    // platform this is, not what the platform can do.
    if (isDesktopShell()) {
      console.warn('[voice] SpeechRecognition refused on Desktop — sovereign Whisper transport only (D01 §XII)');
      return null;
    }

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
      lastAudioStartAtRef.current = Date.now(); // 🔬 forensics
      markCaptureActivity(true); // 🩺 audio is actually open — the watchdog's strongest proof of life
      logVoiceEvent('voice_audio_started');
    });

    // VAD detected speech onset. Distinguishes "audio capture working but no
    // speech detected" from "speech detected but no transcript returned."
    // A successful speech_started resets the no-speech cycle counter — we're
    // making forward progress.
    recognition.onspeechstart = session.guard(gen, () => {
      speechStartedThisCycleRef.current = true;
      noSpeechCycleCountRef.current = 0;
      lastSpeechStartAtRef.current = Date.now(); // 🔬 forensics
      markCaptureActivity(true); // 🩺
      logVoiceEvent('voice_speech_started');
    });

    recognition.onstart = session.guard(gen, () => {
      // 👁️ Close the ordering-F window: recognition has restarted, so any
      // further result belongs to the next turn rather than trailing the
      // committed one. Bounds the window so it cannot mislabel new speech.
      committedRef.current = false;
      // 👁️ Open a new recognition epoch. Carried refs from the previous epoch
      // are deliberately NOT cleared here — the next result must be able to
      // report what the last epoch ended holding.
      recognitionEpochRef.current += 1;
      epochFirstResultSeenRef.current = false;
      epochFirstFinalSeenRef.current = false;
      // Reset per-cycle flags before the new cycle begins. The no-speech
      // ACROSS-cycle counter is intentionally NOT reset here — it only resets
      // on a successful speech_started or on a user-driven stop.
      audioStartedThisCycleRef.current = false;
      speechStartedThisCycleRef.current = false;
      logVoiceEvent('voice_listening_started');
      recognitionStartTime.current = Date.now(); // Track when recognition actually started
      // 🩺 A new instance is armed. Audio has NOT opened yet — that is what
      // onaudiostart proves — so the watchdog starts measuring from here and
      // will fire `never_armed` if audio never follows.
      captureArmedAtRef.current = Date.now();
      lastOnStartAtRef.current = captureArmedAtRef.current; // 🔬 forensics
      captureAudioOpenedRef.current = false;
      markCaptureActivity();
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
      markCaptureActivity(true); // 🩺 results are arriving — capture is unambiguously alive
      logVoiceEvent('voice_transcribe_result', {
        resultCount: event.results?.length ?? 0,
        isFinal: event.results?.[event.results.length - 1]?.isFinal === true,
      });
      console.log('🎤 [onresult] FIRED - event:', event.results.length, 'results');

      // 👁️ Ordering F: a result arrived after this turn was already committed.
      // Emitted BEFORE the echo-suppression guards, because a trailing tail
      // swallowed by suppression is exactly the case that would otherwise leave
      // no trace at all. `inputSuppressed`/`maiaSpeaking` are reported rather
      // than judged — echo and a genuine trailing tail are separated by the
      // analyst reading msSinceCommit, not pre-filtered here.
      if (committedRef.current) {
        logVoiceEvent('voice_result_after_commit', {
          turnCommitId: turnCommitIdRef.current,
          msSinceCommit: committedAtRef.current ? Date.now() - committedAtRef.current : -1,
          resultCount: event.results?.length ?? 0,
          isFinal: event.results?.[event.results.length - 1]?.isFinal === true,
          inputSuppressed: inputSuppressedRef.current,
          maiaSpeaking: isSpeakingRef.current,
        });
      }

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
          // 👁️ A final landed — the outstanding tail is resolved (NOT ordering C).
          // `subsumedInterimCharCount` > 0 here is NORMAL: the final ordinarily
          // commits the interim that previewed it. Only material outstanding at
          // a COMMIT boundary indicates loss.
          {
            const finalAt = Date.now();
            const subsumed = lastInterimCharsRef.current;
            const sinceInterim = lastInterimAtRef.current > 0
              ? Math.max(0, finalAt - lastInterimAtRef.current) : -1;
            lastFinalAtRef.current = finalAt;
            lastResultAtRef.current = finalAt;
            lastInterimCharsRef.current = 0;
            lastInterimTextRef.current = '';
            const firstInEpoch = !epochFirstResultSeenRef.current;
            epochFirstResultSeenRef.current = true;
            // 👁️ The lost-vs-redelivered test, keyed on the first FINAL of the
            // epoch — NOT the first result. Safari commonly restarts as
            // interim → interim → final; keying on the first result would let
            // an interim consume the flag and the comparison would never run.
            //
            // Length alone cannot decide this: two unrelated utterances of
            // similar length would read as re-delivered and suppress a repair
            // that is actually needed. So we measure the real suffix→prefix
            // overlap between the carried tail and this final. Counts only —
            // the tail text never leaves memory.
            const firstFinalInEpoch = !epochFirstFinalSeenRef.current;
            epochFirstFinalSeenRef.current = true;
            const carriedTail = firstFinalInEpoch ? epochEndedWithTailTextRef.current : '';
            const overlap = firstFinalInEpoch
              ? measureTailOverlap(carriedTail, finalTranscript.trim())
              : { overlapChars: 0, overlapRatio: -1 };
            const carriedTailChars = firstFinalInEpoch ? epochEndedWithTailCharsRef.current : 0;
            const seamMs = firstFinalInEpoch && epochEndedAtRef.current
              ? Date.now() - epochEndedAtRef.current : -1;
            if (firstFinalInEpoch) {
              // Compared — release the carry so a later epoch cannot reuse it.
              epochEndedWithTailCharsRef.current = 0;
              epochEndedWithTailTextRef.current = '';
              epochEndedAtRef.current = 0;
            }
            logVoiceEvent('voice_result_final', {
              epoch: recognitionEpochRef.current,
              firstResultInEpoch: firstInEpoch,
              firstFinalInEpoch,
              precedingEpochTailChars: carriedTailChars,
              overlapChars: overlap.overlapChars,
              overlapRatio: overlap.overlapRatio,
              msSinceEpochEnd: seamMs,
              turnCommitId: turnCommitIdRef.current,
              finalCharCount: accumulatedTranscript.current.length,
              deltaCharCount: finalTranscript.trim().length,
              subsumedInterimCharCount: subsumed,
              msSinceLastInterim: sinceInterim,
              resultIndex: event.resultIndex,
              resultCount: event.results.length,
            });
          }
        } else if (interimTranscript) {
          console.log('📝 Got INTERIM transcript:', interimTranscript);
          // For interim, show accumulated finals + current interim
          // This gives live feedback while preserving finals
          const currentInterim = interimTranscript.trim();
          // 👁️ The outstanding tail. Timestamps and counts update on EVERY
          // interim; only the log line is throttled, so the snapshot read at a
          // commit boundary is exact rather than throttle-quantized.
          {
            const interimAt = Date.now();
            lastInterimAtRef.current = interimAt;
            lastResultAtRef.current = interimAt;
            lastInterimCharsRef.current = currentInterim.length;
            lastInterimTextRef.current = currentInterim;
            if (shouldEmitThrottled(interimAt, interimTelemetryAtRef.current)) {
              interimTelemetryAtRef.current = interimAt;
              const firstInEpoch = !epochFirstResultSeenRef.current;
              epochFirstResultSeenRef.current = true;
              logVoiceEvent('voice_result_interim', {
                epoch: recognitionEpochRef.current,
                firstResultInEpoch: firstInEpoch,
                // NOT the comparison — that runs on the first FINAL. This is
                // the carry still awaiting it, named apart so a parser cannot
                // mistake an interim for the adjudicated result.
                pendingEpochTailChars: epochEndedWithTailCharsRef.current,
                msSinceEpochEnd: firstInEpoch && epochEndedAtRef.current
                  ? Date.now() - epochEndedAtRef.current : -1,
                turnCommitId: turnCommitIdRef.current,
                interimCharCount: currentInterim.length,
                finalCharCount: accumulatedTranscript.current.length,
                msSinceLastFinal: lastFinalAtRef.current > 0
                  ? Math.max(0, interimAt - lastFinalAtRef.current) : -1,
                resultIndex: event.resultIndex,
                resultCount: event.results.length,
              });
            }
          }
          // Don't modify accumulatedTranscript for interim - just pass to callback
        }

        console.log('📊 Accumulated so far:', accumulatedTranscript.current);
        // 🧵 Mirror into the continuity buffer as we go, so the buffer is
        // already current when capture dies. The failure path then does no
        // work that could itself fail.
        try { getContinuityBuffer().recordPending(accumulatedTranscript.current); } catch { /* best-effort */ }

        // Reset silence timer on speech
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        // 👁️ Timer armed. On THIS path the timer is armed by a result of
        // either kind but its callback commits accumulated FINALS alone — so
        // armedByInterim=true with armedByFinal=false is the arming that
        // cannot carry what armed it. Throttled: arming happens per result.
        {
          const armedAt = Date.now();
          timerArmedAtRef.current = armedAt;
          if (shouldEmitThrottled(armedAt, armTelemetryAtRef.current)) {
            armTelemetryAtRef.current = armedAt;
            logVoiceEvent('voice_silence_timer_armed', {
              turnCommitId: turnCommitIdRef.current,
              armedByFinal: finalTranscript.length > 0,
              armedByInterim: finalTranscript.length === 0 && interimTranscript.length > 0,
              interimCharCount: lastInterimCharsRef.current,
              finalCharCount: accumulatedTranscript.current.length,
              timerDeadlineMs: silenceThreshold,
            });
          }
        }

        // Start new silence timer - use the configurable threshold
        console.log(`⏱️ Starting silence timer (${silenceThreshold}ms)`);
        silenceTimerRef.current = setTimeout(() => {
          // 👁️ Witness FIRST — the state that PRODUCED the decision, before the
          // decision consumes or clears anything. tailAtRisk=true here is
          // ordering D in mechanical form.
          {
            const firedAt = Date.now();
            const committable = accumulatedTranscript.current.trim();
            logVoiceEvent('voice_silence_timer_fired', {
              turnCommitId: turnCommitIdRef.current,
              timerAgeMs: timerArmedAtRef.current ? firedAt - timerArmedAtRef.current : -1,
              timerDeadlineMs: silenceThreshold,
              committableCharCount: committable.length,
              willCommit: !isProcessingRef.current && committable.length > 0,
              ...readTailSnapshot({
                now: firedAt,
                lastInterimAt: lastInterimAtRef.current,
                lastFinalAt: lastFinalAtRef.current,
                lastInterimChars: lastInterimCharsRef.current,
                finalChars: committable.length,
              }),
            });
            sendTriggerRef.current = 'silence_timer';
          }
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
      lastErrorAtRef.current = Date.now(); // 🔬 forensics
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
      // 👁️ VOICE-02A — the recognition-epoch boundary, previously emitted with
      // NO metadata at all. tailAtRisk=true here is Safari ending an epoch on
      // an unfinalized tail: the demonstrated mechanism, not a hypothesis.
      {
        const endedAt = Date.now();
        lastEndAtRef.current = endedAt; // 🔬 forensics
        const tail = readTailSnapshot({
          now: endedAt,
          lastInterimAt: lastInterimAtRef.current,
          lastFinalAt: lastFinalAtRef.current,
          lastInterimChars: lastInterimCharsRef.current,
          finalChars: accumulatedTranscript.current.trim().length,
        });
        epochEndedWithTailCharsRef.current = tail.tailAtRisk ? tail.interimCharCount : 0;
        epochEndedWithTailTextRef.current = tail.tailAtRisk ? lastInterimTextRef.current : '';
        epochEndedAtRef.current = endedAt;
        logVoiceEvent('voice_recognition_ended', {
          epoch: recognitionEpochRef.current,
          turnCommitId: turnCommitIdRef.current,
          epochAgeMs: recognitionStartTime.current ? endedAt - recognitionStartTime.current : -1,
          ...tail,
        });
      }
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
                witnessDispatch('fallback', 'fallback', result.transcript, recognitionEpochRef.current, turnCommitIdRef.current);
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
        // VOICE-ABORT-01. This used to call handleCaptureLoss('abort_loop') on
        // the FIRST sub-500ms end, killing the microphone permanently and
        // ending the conversation. Production on 2026-08-27 showed the chain:
        // MAIA stops speaking → mic restarts → the instance is invalidated
        // ~302ms later → onend → "possible infinite abort loop" → MicState
        // ERROR. One abort, and the member is talking to a dead mic.
        //
        // A loop is a RUN of rapid ends, not one. The restart guard 80 lines
        // below already knew this — it allows ten rapid restarts before
        // blocking. This path simply never counted, and the asymmetry was the
        // defect. Below threshold we fall THROUGH to that restart path, which
        // creates a fresh instance (the aborted one is unusable) and carries
        // its own loop protection and backoff, so nothing here needs to
        // duplicate either.
        const rapid = classifyRecognitionEnd({
          epochAgeMs: timeSinceStart,
          consecutiveRapidEnds: consecutiveRapidEndCount.current,
        });
        consecutiveRapidEndCount.current = rapid.nextCount;
        if (rapid.decision === 'abort_loop') {
          console.log('🚨 [onend] ' + rapid.nextCount + ' consecutive rapid ends (' + timeSinceStart + 'ms) - abort loop, stopping');
          // Still never a silent stop: the member is told and unsent audio is salvaged.
          handleCaptureLossFnRef.current?.('abort_loop');
          return;
        }
        console.log('↻ [onend] Rapid end ' + rapid.nextCount + '/' + RAPID_END_LOOP_THRESHOLD + ' (' + timeSinceStart + 'ms) - recreating and continuing');
        // Chrome silently fails onresult if a previously-aborted object is
        // restarted, so the next start must build a new one.
        session.markForRecreate('rapid_end_recovery');
        // deliberate fall-through to the restart path below
      } else if (recognitionStartTime.current > 0) {
        // The epoch survived the rapid window, so whatever caused the previous
        // rapid end did not persist. Anything else would let unrelated aborts
        // minutes apart accumulate into a false loop.
        consecutiveRapidEndCount.current = 0;
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
      // reflecting on what MAIA said.
      const timeSinceLastAudioEnd = lastAudioEndAtRef.current > 0 ? now - lastAudioEndAtRef.current : Infinity;
      // Session-scoped liveness, not a silence timeout. Chrome ends an epoch
      // after ~5-8s of quiet; this decides whether we re-arm. It used to be a
      // 45s window, and in practice a member who paused to think lost the mic
      // after ~20s of real time (a couple of epochs, then a stand-down) —
      // Kelly, 2026-08-31, PWA on Chrome. A pause is part of the conversation.
      // Both windows now run for the whole session (VOICE_TIMING.*_ALIVE_MS).
      // Genuine failure modes are unaffected: the rapid-restart loop guard, the
      // abort-loop classifier and every fatal onerror path below still stand
      // the mic down, and each of those reports itself instead of going quiet.
      const hasRecentActivity =
        (hasEverSpoken && timeSinceLastSpeech < VOICE_TIMING.CONVERSATION_ALIVE_MS) ||
        timeSinceLastAudioEnd < VOICE_TIMING.POST_RESPONSE_ALIVE_MS;
      const hasAccumulatedTranscript = accumulatedTranscript.current.trim().length > 0;

      // In Care/Scribe modes, ALWAYS restart to stay open for the user
      if (!hasRecentActivity && !hasAccumulatedTranscript && !persistentListeningRef.current) {
        console.log('🔕 [onend] No recent activity (' + (hasEverSpoken ? Math.round(timeSinceLastSpeech/1000) + 's since speech' : 'never spoke') + ', ' + (lastAudioEndAtRef.current > 0 ? Math.round(timeSinceLastAudioEnd/1000) + 's since MAIA' : 'no MAIA audio') + ') - stopping');
        console.log('   (User can tap mic to restart when ready to speak)');
        // Expected stand-down, but it was still silent — the mic simply stopped
        // being live with nothing said about it. Report it (quietly: this cause
        // is classified as expected) and salvage anything unsent.
        handleCaptureLossFnRef.current?.('inactivity');
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
          // Was a SILENT stop. The loop guard is correct; hiding it was not.
          handleCaptureLossFnRef.current?.('restart_loop');
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

  // ==========================================================================
  // 🗣️ TELLING THE MEMBER — the surface that is actually visible
  // ==========================================================================

  /**
   * Surface a voice condition. Sets the local banner AND pushes it to the
   * parent, because this component is mounted `sr-only` and its own banner is
   * invisible on the web path. Local-only reporting is how a broken mic stayed
   * silent; every message must leave this component to count as delivered.
   */
  const reportVoiceStatus = useCallback((info: {
    level: 'info' | 'warning' | 'error';
    cause: string;
    userMessage: string;
    recoverable: boolean;
  }) => {
    setVoiceError(info.userMessage);
    logVoiceEvent('voice_status_surfaced', {
      level: info.level,
      cause: info.cause,
      recoverable: info.recoverable,
    });
    onVoiceStatusRef.current?.(info);
  }, []);

  /**
   * Hand back speech that was transcribed but never submitted.
   *
   * Called on every path where capture is lost mid-utterance. Clears the
   * accumulator so the same words cannot also be replayed into a later turn —
   * salvaged text belongs to the member's draft now, not to MAIA's next input.
   * Returns whether anything was actually salvaged, so the message shown can
   * truthfully say so.
   */
  const salvageTranscript = useCallback((cause: string): boolean => {
    // Prefer the live accumulator; fall back to the continuity buffer, which
    // survives the restarts and remounts that clear the accumulator. Without
    // the fallback, a loss detected just after a restart would salvage nothing.
    let text = accumulatedTranscript.current.trim();
    if (!text) {
      try { text = getContinuityBuffer().getPending()?.text?.trim() ?? ''; } catch { text = ''; }
    }
    if (!text) return false;
    accumulatedTranscript.current = '';
    try { getContinuityBuffer().clearPending(); } catch { /* best-effort */ }
    logVoiceEvent('voice_transcript_salvaged', { cause, chars: text.length });
    console.log(`💾 [salvage] Preserving ${text.length} chars lost to ${cause}`);
    onTranscriptSalvageRef.current?.({ text, cause });
    return true;
  }, []);

  /**
   * A capture loss was detected. Stop cleanly, preserve, and say so.
   *
   * Order matters: salvage BEFORE teardown, because teardown paths clear
   * component state and a later restart's `onstart` would wipe the accumulator.
   * The member's words are rescued first; everything else is bookkeeping.
   *
   * Recovery is deliberately member-initiated. We attempt no silent retry here:
   * the entire defect being fixed is a mic that kept *looking* alive while
   * failing, and an invisible auto-retry would recreate exactly that. The
   * member taps to resume, and knows what state they are in.
   */
  /**
   * 🔬 Read every structural witness at the moment of loss.
   *
   * Called once per capture loss, immediately before the teardown below zeroes
   * the liveness refs — order matters, and is the reason this is a function
   * rather than something assembled inside the telemetry call.
   *
   * Refs only, so it is stable and cannot go stale. No transcript, no device
   * label (labels carry people's names); device identity is a truncated id.
   */
  const snapshotCaptureForensics = useCallback((silentForMs: number) => {
    const now = Date.now();
    const session = webSessionRef.current;
    const track = micStreamRef.current?.getAudioTracks?.()[0] ?? null;
    const settings = (() => {
      try { return track?.getSettings?.() ?? null; } catch { return null; }
    })();
    const peak = analyserPeakRef.current;

    return buildCaptureForensics({
      now,

      generation: session?.currentGeneration ?? -1,
      sessionState: session?.state ?? 'none',
      shouldRecreate: session?.shouldRecreate ?? false,
      recognitionActive: recognitionActiveRef.current,
      audioOpened: captureAudioOpenedRef.current,
      onStartAt: lastOnStartAtRef.current,
      onAudioStartAt: lastAudioStartAtRef.current,
      onSpeechStartAt: lastSpeechStartAtRef.current,
      onResultAt: lastResultAtRef.current,
      onErrorAt: lastErrorAtRef.current,
      onEndAt: lastEndAtRef.current,

      trackCount: micStreamRef.current?.getAudioTracks?.().length ?? 0,
      trackReadyState: track ? String(track.readyState) : null,
      trackEnabled: track ? !!track.enabled : null,
      trackMuted: track ? !!track.muted : null,
      trackDeviceIdPrefix: settings?.deviceId ? String(settings.deviceId).slice(0, 8) : null,

      analyserPresent: !!analyserRef.current,
      audioContextState: audioContextRef.current ? String(audioContextRef.current.state) : null,
      analyserLoopRunning: audioLoopRunningRef.current,
      analyserLevel: audioLevelRef.current,
      analyserLastTickAt: analyserLastTickAtRef.current,
      analyserLastVoiceAt: analyserLastVoiceAtRef.current,
      analyserPeakCurrent: peak.peak,
      analyserPeakPrevious: peak.prevPeak,
      analyserTicks: analyserTicksRef.current,

      silentForMs,
      micState: micStateRef.current,
      listeningMode: listeningModeRef.current,
      isListening: isListeningRef.current,
      isRecording: isRecordingRef.current,
      isSpeaking: isSpeakingRef.current,
      isProcessing: isProcessingRef.current,
      restartInFlight: restartInFlightRef.current || isRestartingRef.current,
      pageHidden: typeof document !== 'undefined' && document.visibilityState === 'hidden',
      lastVisibilityChangeAt: lastVisibilityChangeAtRef.current,
    });
  }, []);

  const handleCaptureLoss = useCallback((cause: CaptureLossCause) => {
    // Idempotent: the watchdog, a track event, and onend can all observe the
    // same death within milliseconds of each other.
    if (!isListeningRef.current && !isRecordingRef.current && micStateRef.current !== 'LISTENING') {
      return;
    }

    const reasonCode = CAPTURE_REASON_CODES[cause] ?? 'UNKNOWN_VOICE_STALL';
    console.warn(`🩺 [liveness] Capture loss detected: ${cause} (${reasonCode})`);
    // 🔬 VOICE-CAPTURE-NO-AUDIO-01A — snapshot BEFORE the teardown below zeroes
    // the liveness refs. Attached to the existing event rather than emitted as
    // a second one so the forensics can never arrive without the loss, or the
    // loss without its forensics.
    const lastProofOfLife = Math.max(lastCaptureActivityAtRef.current, captureArmedAtRef.current);
    const forensics = snapshotCaptureForensics(
      // 0 when nothing was ever armed — reporting `Date.now()` there would read
      // as a 57-year silence rather than "no session to be silent in".
      lastProofOfLife > 0 ? Math.max(0, Date.now() - lastProofOfLife) : 0,
    );
    console.warn('🔬 [forensics]', forensics);
    logVoiceEvent('voice_capture_lost', { cause, reasonCode, ...forensics });

    const preserved = salvageTranscript(cause);

    // Stop the watchdog and any pending mute confirmation.
    if (livenessTimerRef.current) { clearInterval(livenessTimerRef.current); livenessTimerRef.current = null; }
    if (trackMuteTimerRef.current) { clearTimeout(trackMuteTimerRef.current); trackMuteTimerRef.current = null; }
    if (recognitionTimeoutRef.current) { clearTimeout(recognitionTimeoutRef.current); recognitionTimeoutRef.current = null; }
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }

    // Tear the dead instance down. It is never reused.
    discardRecognitionFnRef.current?.(`capture_loss_${cause}`);

    captureArmedAtRef.current = 0;
    captureAudioOpenedRef.current = false;
    lastCaptureActivityAtRef.current = 0;
    isRestartingRef.current = false;
    restartInFlightRef.current = false;

    // Truthful UI: listening is OFF, and it says so.
    setIsListening(false);
    isListeningRef.current = false;
    setIsRecording(false);
    isRecordingRef.current = false;
    wantsContinuousConversationRef.current = false;
    onRecordingStateChange?.(false);
    setAudioLevel(0);
    // ERROR (not IDLE) so authorityGuard still admits an explicit user tap,
    // while no automatic path can quietly re-arm behind the member's back.
    setMicState('ERROR', `capture_loss_${cause}`);

    reportVoiceStatus({
      level: isCaptureLossUnexpected(cause) ? 'error' : 'info',
      cause: reasonCode,
      userMessage: describeCaptureLoss(cause, { transcriptPreserved: preserved }),
      recoverable: true,
    });
  }, [salvageTranscript, reportVoiceStatus, onRecordingStateChange, setMicState, snapshotCaptureForensics]);

  /**
   * Attach loss listeners to the live microphone track.
   *
   * This is the ONLY way to see another application taking the input. A
   * `MediaStreamTrack` going `muted` or `ended` fires no `devicechange` (the
   * device list did not change) and produces no recognition error (the object
   * never learns about it). Without these two listeners, an app-level mic
   * seizure is completely invisible to us — which is exactly how a member ends
   * up talking to a dead mic for ten minutes.
   */
  const attachTrackLossListeners = useCallback((stream: MediaStream) => {
    trackListenerCleanupRef.current?.();
    trackListenerCleanupRef.current = null;

    const track = stream.getAudioTracks()[0];
    if (!track) return;

    const onEnded = () => {
      console.warn('🔌 [track] Audio track ended — input device gone');
      handleCaptureLossFnRef.current?.('track_ended');
    };

    const onMute = () => {
      // Browsers emit brief, self-correcting mutes around device negotiation.
      // Only a mute that PERSISTS means another process holds the input, so we
      // confirm before interrupting the member over a transient blip.
      if (trackMuteTimerRef.current) clearTimeout(trackMuteTimerRef.current);
      trackMuteTimerRef.current = setTimeout(() => {
        trackMuteTimerRef.current = null;
        if (track.muted && (isListeningRef.current || isRecordingRef.current)) {
          console.warn('🔇 [track] Audio track muted and stayed muted — another app holds the mic');
          handleCaptureLossFnRef.current?.('track_muted');
        }
      }, TRACK_MUTE_GRACE_MS);
    };

    const onUnmute = () => {
      // Recovered before the grace window elapsed: cancel, say nothing.
      if (trackMuteTimerRef.current) {
        clearTimeout(trackMuteTimerRef.current);
        trackMuteTimerRef.current = null;
      }
    };

    track.addEventListener('ended', onEnded);
    track.addEventListener('mute', onMute);
    track.addEventListener('unmute', onUnmute);
    logVoiceEvent('voice_track_listeners_attached');

    trackListenerCleanupRef.current = () => {
      try {
        track.removeEventListener('ended', onEnded);
        track.removeEventListener('mute', onMute);
        track.removeEventListener('unmute', onUnmute);
      } catch { /* track already torn down */ }
      if (trackMuteTimerRef.current) {
        clearTimeout(trackMuteTimerRef.current);
        trackMuteTimerRef.current = null;
      }
    };
  }, []);

  /**
   * The watchdog: the only observer that can see recognition go quiet.
   *
   * Runs on a 2s tick while the web path claims to be listening. It measures
   * ABSENCE — no onstart, onaudiostart, onspeechstart, or onresult — because a
   * zombie recognition object emits nothing to react to. Deliberately inert
   * while MAIA speaks, while a turn is processing, and while a restart is in
   * flight: recognition is legitimately torn down in those windows, and a false
   * positive there would interrupt a working conversation.
   */
  useEffect(() => {
    if (useNativeSpeechRef.current) return;   // native path has its own ARMING watchdog
    if (!isListening) return;

    const tick = () => {
      const applicable =
        isListeningRef.current &&
        !isSpeakingRef.current &&
        !isProcessingRef.current &&
        !inputSuppressedRef.current &&
        !isRestartingRef.current &&
        recognitionActiveRef.current;

      const verdict = assessCaptureLiveness({
        now: Date.now(),
        lastActivityAt: lastCaptureActivityAtRef.current,
        armedAt: captureArmedAtRef.current,
        audioOpened: captureAudioOpenedRef.current,
        applicable,
        analyserVoiceOnsetAt: analyserVoiceOnsetAtRef.current,
      });

      if (!verdict.dead || !verdict.cause) return;

      console.warn(
        `🩺 [liveness] ${verdict.cause} after ${Math.round(verdict.silentForMs / 1000)}s ` +
        'without a recognition event — the member spoke and recognition did not answer.'
      );
      handleCaptureLossFnRef.current?.(verdict.cause);
    };

    // Failure boundaries that produce no recognition error and no track event.
    // Safari can put an AudioContext into `interrupted` — a state neither
    // `running` nor `suspended` — and a backgrounded tab can have capture
    // throttled out from under it. Both are checked against the same verdict
    // path so every route ends in one honest, reported stop.
    const inspectAudioContext = () => {
      const ctx = audioContextRef.current;
      if (!ctx || !isListeningRef.current) return;
      const state = ctx.state as string;
      if (state === 'interrupted' || state === 'closed') {
        console.warn(`🎛️ [audioContext] state=${state} while listening`);
        handleCaptureLossFnRef.current?.('audio_context_interrupted');
      }
    };
    const inspectOnVisible = () => {
      // 🔬 Stamp every transition, not just the visible one: a backgrounded tab
      // throttles requestAnimationFrame, which would make the analyser witness
      // read `analyser_stalled` for a reason that has nothing to do with the
      // microphone. Forensics must be able to say so.
      lastVisibilityChangeAtRef.current = Date.now();
      // Returning to a foregrounded tab is the moment a member looks at the
      // screen. If capture died while hidden, say so now rather than letting
      // them start talking into it.
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') tick();
    };

    const ctx = audioContextRef.current;
    ctx?.addEventListener?.('statechange', inspectAudioContext);
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', inspectOnVisible);
    }

    livenessTimerRef.current = setInterval(tick, CAPTURE_HEARTBEAT_MS);
    return () => {
      ctx?.removeEventListener?.('statechange', inspectAudioContext);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', inspectOnVisible);
      }
      if (livenessTimerRef.current) {
        clearInterval(livenessTimerRef.current);
        livenessTimerRef.current = null;
      }
    };
  }, [isListening]);

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
      // Was setVoiceError only — invisible, because this component renders
      // inside an sr-only wrapper. Route it to the parent so it is actually seen.
      reportVoiceStatusFnRef.current?.({
        level: 'error', cause: tag, userMessage: message, recoverable: true,
      });
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
    trackListenerCleanupRef.current?.();
    trackListenerCleanupRef.current = null;
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
    salvageTranscriptFnRef.current?.('devicechange');
    reportVoiceStatusFnRef.current?.({
      level: 'warning',
      cause: 'devicechange',
      userMessage: 'Your audio device changed, so MAIA stopped hearing you. Tap the mic to reconnect.',
      recoverable: true,
    });
    setMicState('IDLE', 'devicechange');
  }, [onRecordingStateChange, setMicState]);

  // Keep fn refs current so recognition handlers reach the latest helpers
  useEffect(() => {
    ensureFreshAndStartFnRef.current = ensureFreshAndStart;
    discardRecognitionFnRef.current = discardRecognition;
    handleWebDeviceChangeFnRef.current = handleWebDeviceChange;
    handleCaptureLossFnRef.current = handleCaptureLoss;
    attachTrackLossListenersFnRef.current = attachTrackLossListeners;
    reportVoiceStatusFnRef.current = reportVoiceStatus;
    salvageTranscriptFnRef.current = salvageTranscript;
  }, [ensureFreshAndStart, discardRecognition, handleWebDeviceChange, handleCaptureLoss, attachTrackLossListeners, reportVoiceStatus, salvageTranscript]);

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
      // P0: normalize ANY recoverable turn-complete state, not only PLAYING_TTS.
      // Keying this on one privileged predecessor is what pinned micState at
      // SUBMITTING/WAITING_FOR_TTS and made every later restart — including a
      // user tap — fail the authority guard for the rest of the session.
      normalizeTurnCompleteStateFnRef.current?.('maia_stopped_speaking');
      // Reset backoff when MAIA finishes a new turn — fresh set of attempts
      backoffStepRef.current = 0;
      // Continuation is decided in ONE place. In PUSH_TO_TALK requestRestart
      // declines and waits for the tap; in HANDS_FREE it re-arms.
      void requestRestartFnRef.current?.('maia_stopped_speaking');
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

      const restartTimer = setTimeout(() => {
        // P0: was a direct NativeSpeechRecognition.start() with its own private
        // five-condition predicate — one of two re-arm gates that disagreed with
        // each other and with the guard. It now asks the single authority, which
        // re-reads state at call time and logs one canonical allowed/blocked line.
        if (nativeStatusRef.current === 'started') {
          console.log('🚫 [Native] Native recognition already started, skipping restart request');
          return;
        }
        void requestRestartFnRef.current?.('maia_stopped_speaking');
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

    const transcript = accumulatedTranscript.current.trim();
    console.log('🔄 [processAccumulatedTranscript] Called with:', transcript);

    if (!transcript) {
      console.log('⚠️ [processAccumulatedTranscript] No transcript to process');
      isCallingProcessRef.current = false;
      return;
    }

    // CRITICAL FIX: If already processing, don't retry - just skip
    if (isProcessingRef.current) {
      console.log('⏳ [ContinuousConversation] Already processing, skipping');
      isCallingProcessRef.current = false;
      return;
    }
    
    // ✅ CRITICAL: Prevent duplicate sends with multiple checks
    const now = Date.now();
    const normalizedTranscript = transcript.toLowerCase().trim();
    const lastSentNormalized = lastSentRef.current.toLowerCase().trim();

    // Check 1: Exact match within last 2 seconds
    if (normalizedTranscript === lastSentNormalized && (now - lastSentTimeRef.current) < 2000) {
      console.log('🚫 [DEDUP] Blocked duplicate transcript:', transcript);
      // VOICE-CAPTURE-01B-OBS: make the suppression server-visible. Until this
      // event existed, a working dedup and a dedup that never ran produced the
      // same (empty) log, so "the guard fired" could only be witnessed by a
      // human watching a browser console on the device.
      logVoiceEvent('voice_dedup_blocked', {
        dedupKind: 'exact',
        charCount: transcript.length,
        msSinceLastSend: now - lastSentTimeRef.current,
        epoch: recognitionEpochRef.current,
        turnCommitId: turnCommitIdRef.current,
      });
      accumulatedTranscript.current = ""; // Clear duplicate
      // Release the concurrency latch taken at the top of this function. Every
      // other early return does; this one did not, so the FIRST time this guard
      // fired, `isCallingProcessRef` stayed true and the guard at the top
      // silently blocked every later turn for the life of the session.
      isCallingProcessRef.current = false;
      return;
    }

    // Check 2: Very similar transcript (>90% match) within last 1 second
    if (lastSentNormalized && (now - lastSentTimeRef.current) < 1000) {
      const similarity = normalizedTranscript.length > 0
        ? normalizedTranscript.split(' ').filter(word => lastSentNormalized.includes(word)).length / normalizedTranscript.split(' ').length
        : 0;
      if (similarity > 0.9) {
        console.log('🚫 [DEDUP] Blocked similar transcript (similarity:', similarity, '):', transcript);
        // VOICE-CAPTURE-01B-OBS. `similarity` is carried only for the fuzzy
        // kind — it is the number that decided this branch, and without it a
        // near-miss at 0.91 is indistinguishable in the log from an exact hit.
        logVoiceEvent('voice_dedup_blocked', {
          dedupKind: 'fuzzy',
          charCount: transcript.length,
          msSinceLastSend: now - lastSentTimeRef.current,
          similarity: Number(similarity.toFixed(3)),
          epoch: recognitionEpochRef.current,
          turnCommitId: turnCommitIdRef.current,
        });
        accumulatedTranscript.current = ""; // Clear duplicate
        isCallingProcessRef.current = false;
        return;
      }
    }

    // Check 3: Echo/Feedback Prevention - Block MAIA's own voice patterns
    // Common MAIA response patterns that indicate echo/feedback loop
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
      isCallingProcessRef.current = false;
      return;
    }

    lastSentRef.current = transcript;
    lastSentTimeRef.current = now;

    isProcessingRef.current = true;

    // CRITICAL: Clear accumulated transcript IMMEDIATELY to prevent double-send
    accumulatedTranscript.current = "";
    continuationRestartRef.current = false; // turn submitted — next start is a fresh turn
    // 🧵 The turn is genuinely sent: move it out of pending into the continuity
    // log, so a later loss cannot hand it back as an unsent draft and cause the
    // member to send the same thing twice.
    try { getContinuityBuffer().recordSubmitted(transcript); } catch { /* best-effort */ }

    // Stop recognition while processing
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Send transcript
    console.log('📤 [ContinuousConversation] Sending transcript to parent:', transcript);
    // Captured BEFORE the commit block below, which resets sendTriggerRef to
    // 'other' so a stale label cannot be inherited by an unrelated call site.
    const dispatchTrigger: TranscriptDispatchTrigger = sendTriggerRef.current;
    // 👁️ Commit: what actually left the client, past every dedup and echo guard,
    // and what was still outstanding when it did. tailAtRisk=true on this row is
    // observed speech left behind by this exact commit. Opens the ordering-F
    // window: further results until the next recognition start are trailing.
    {
      const committedAt = Date.now();
      turnCommitIdRef.current += 1;
      committedRef.current = true;
      committedAtRef.current = committedAt;
      logVoiceEvent('voice_turn_committed', {
        turnCommitId: turnCommitIdRef.current,
        trigger: sendTriggerRef.current,
        committedCharCount: transcript.length,
        ...readTailSnapshot({
          now: committedAt,
          lastInterimAt: lastInterimAtRef.current,
          lastFinalAt: lastFinalAtRef.current,
          lastInterimChars: lastInterimCharsRef.current,
          finalChars: transcript.length,
        }),
      });
      // Don't let a stale label be inherited by an unrelated later call site.
      sendTriggerRef.current = 'other';
    }
    setMicState('SUBMITTING', 'processAccumulatedTranscript');
    lastTranscriptSubmittedAtRef.current = Date.now();
    witnessDispatch('process_accumulated', dispatchTrigger, transcript, recognitionEpochRef.current, turnCommitIdRef.current);
    onTranscript(transcript);
    console.log('✅ [ContinuousConversation] onTranscript callback completed');

    // Track analytics (disabled for Vercel build)
    // Analytics.transcriptionSuccess({
    //   transcription_duration_ms: Date.now() - lastSpeechTime.current,
    //   transcription_length: transcript.length,
    //   mode: 'continuous'
    // });

    // Reset the guard flag immediately
    isCallingProcessRef.current = false;

    // Will restart when Maya finishes speaking
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 500);
  }, [onTranscript]);

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
    // 🔬 Forensic counters are per-loop-run: `analyserTicks: 0` at a loss then
    // means "this run never ticked", which is a different failure from a run
    // that ticked and stopped. Level history is deliberately NOT cleared.
    analyserTicksRef.current = 0;
    analyserPeakRef.current = { startedAt: 0, peak: 0, prevPeak: 0 };
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

      // 🔬 VOICE-CAPTURE-NO-AUDIO-01A — local audio witness (observation only).
      // This loop is the ONLY thing in the component that can say whether audio
      // was still arriving while recognition went quiet. Recording that here
      // costs three assignments per frame and turns the next silent death from
      // "no result, no error, no end" into an answerable question. Nothing
      // below reads these — see lib/voice/captureForensics.ts.
      analyserLastTickAtRef.current = now;
      analyserTicksRef.current++;
      if (normalizedLevel > vadSensitivity) {
        // An onset is voice that BROKE a quiet gap — the start of a speech
        // episode. Recorded before the "last voice" stamp is advanced, since
        // the gap is measured against the previous voice sample.
        const previousVoiceAt = analyserLastVoiceAtRef.current;
        if (previousVoiceAt === 0 || now - previousVoiceAt >= ANALYSER_ONSET_QUIET_MS) {
          analyserVoiceOnsetAtRef.current = now;
        }
        analyserLastVoiceAtRef.current = now;
      }
      {
        const w = analyserPeakRef.current;
        if (w.startedAt === 0) w.startedAt = now;
        else if (now - w.startedAt >= ANALYSER_PEAK_WINDOW_MS) {
          // Keep the closing window's peak: a loss landing just after a
          // boundary would otherwise report zero for a mic that worked a
          // second ago.
          w.prevPeak = w.peak;
          w.peak = 0;
          w.startedAt = now;
        }
        if (normalizedLevel > w.peak) w.peak = normalizedLevel;
      }

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
          // 👁️ The other commit boundary. Recorded so a dropped tail can be
          // attributed to VAD completion vs. the silence timer rather than guessed.
          logVoiceEvent('voice_turn_commit_requested', {
            turnCommitId: turnCommitIdRef.current,
            trigger: 'vad',
            timerDeadlineMs: adaptiveSilenceThreshold,
            ...readTailSnapshot({
              now,
              lastInterimAt: lastInterimAtRef.current,
              lastFinalAt: lastFinalAtRef.current,
              lastInterimChars: lastInterimCharsRef.current,
              finalChars: accumulatedTranscript.current.trim().length,
            }),
          });
          sendTriggerRef.current = 'vad';
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
      // 🩺 Watch the track itself. This is the only signal that another app
      // (or the OS) has taken the input — it produces no devicechange and no
      // recognition error.
      attachTrackLossListenersFnRef.current?.(stream);
      resetVoiceSession();
      // Dispatch provenance is deliberately NOT reset here. getUserMedia is
      // re-acquired on every hands-free turn: production at 92bc2a9df showed
      // six consecutive turns each reporting dispatchId=1, msSincePrevious=-1
      // and six distinct session ids (2026-08-27). Resetting on mic
      // acquisition gave the witness a SHORTER lifetime than the duplicate it
      // exists to catch — any repeat reappearing across the re-acquisition
      // boundary was structurally invisible, and its absence read as "no
      // duplicate". The comparator is scoped to one deliberate voice
      // engagement instead: see the mount/unmount effect and the
      // `userExitMode` branch of `stopListening`.
      // ⛔ The raw MediaStreamTrack.label is NOT reported.
      //
      // Device labels are member-authored strings. Production carried
      // "Scarlett 2i2 USB (1235:8210)" — harmless — but the same field on a
      // different member reads "Kelly's AirPods Pro". The name is the
      // member's, and this event ships to the server on every mic grant.
      //
      // The privacy boundary here is ABSENCE, not treatment: no hash, no
      // redaction, no truncation, no replacement identifier. A shortened or
      // hashed device name is still a per-member handle, and once a field
      // exists something eventually fills it. The count below is what this
      // event actually needs — it distinguishes "no audio track" from "a
      // track was granted" without describing whose device it is.
      logVoiceEvent('voice_mic_granted', {
        audioTracks: stream.getAudioTracks().length,
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
              witnessDispatch('android_fallback', 'fallback', result.transcript, recognitionEpochRef.current, turnCommitIdRef.current);
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
                isProcessingRef.current = true;
                setIsRecording(false);
                isRecordingRef.current = false;
                witnessDispatch('native_silence', 'silence_timer', finalTranscript, recognitionEpochRef.current, turnCommitIdRef.current);
                onTranscript(finalTranscript);
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
                  isProcessingRef.current = true;
                  setIsRecording(false);
                  isRecordingRef.current = false;
                  witnessDispatch('native_audio_silence', 'silence_timer', finalTranscript, recognitionEpochRef.current, turnCommitIdRef.current);
                  onTranscript(finalTranscript);
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
              witnessDispatch('native_stop', 'native_stop', finalTranscript, recognitionEpochRef.current, turnCommitIdRef.current);
              onTranscript(finalTranscript);
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
                      // P0: the second of the two competing re-arm paths. The
                      // backoff, watchdog and restartGuard above have already made
                      // the policy decision, so this delegates the START itself to
                      // the single authority rather than reaching for the plugin —
                      // forceOverride because re-running the guard here would now
                      // see the restartInFlight this very block just set.
                      await requestRestartFnRef.current?.('recognition_stopped', { forceOverride: true });
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

      // ⛔ DESKTOP-SOVEREIGN-STT-01 · S1/S4 — Desktop joins this branch.
      //
      // Strictly ADDITIVE (S11): the original condition is preserved verbatim
      // as the second disjunct, so Firefox/Zen, ordinary Chrome, Safari,
      // Android-Chrome recovery and every Capacitor build behave exactly as
      // before. Only the Desktop shell is newly admitted, and it is admitted
      // by CLASSIFICATION, never by capability — Chromium has Web Speech, so
      // asking "is Web Speech missing?" would never route Desktop here.
      //
      // The transport is logged rather than dispatched on, so the decision is
      // legible in a device walk without changing who reaches this code.
      const voiceTransport = selectVoiceTransport({
        isNative: info.isNative,
        isDesktop: info.isDesktop,
        hasSpeechRecognition: hasSpeechRecognitionAPI(),
        canRecordAudio,
      });
      console.log('[voice] transport:', voiceTransport, { platform: info.platform });

      if ((info.isDesktop || !hasSpeechRecognitionAPI()) && canRecordAudio) {
        // Clear the 2s ARMING watchdog — this path records up to ~8s and
        // would otherwise be reset to IDLE mid-utterance.
        if (armingTimeoutRef.current) {
          clearTimeout(armingTimeoutRef.current);
          armingTimeoutRef.current = null;
        }
        // Same transport, two reasons for being here: Desktop by policy, other
        // browsers by absence of Web Speech. Named separately so a log never
        // reports Desktop as a fallback — on Desktop this IS the design.
        const sovereignReason = info.isDesktop ? 'desktop_sovereign' : 'web_whisper_fallback';
        console.log(info.isDesktop
          ? '🛡️ [ContinuousConversation] Desktop — MediaRecorder + local Whisper (sovereign transport)'
          : '🦊 [ContinuousConversation] No Web Speech API — MediaRecorder + local Whisper (one-shot)');
        addDebug(info.isDesktop ? '🛡️ desktop sovereign whisper' : '🦊 web whisper fallback (no Web Speech API)');
        logVoiceEvent('voice_listening_started', { path: sovereignReason });

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

        // ⛔ REGISTERED BEFORE ANY AWAIT. Between getUserMedia resolving and this
        // line there must be nothing that can suspend — otherwise a teardown
        // landing in that window would find no capture to revoke and the stream
        // would outlive the component that opened it.
        revokeSovereignCapture('superseded');
        const captureGeneration = sovereignGenerationRef.current;
        const captureController = new AbortController();
        sovereignCaptureRef.current = {
          generation: captureGeneration,
          stream,
          controller: captureController,
        };

        isProcessingRef.current = false;
        setVoiceError(null);

        // ⛔ PLATFORM-D02A-01 — THE CLAIM MOVED, AND THIS IS THE WHOLE UNIT.
        //
        // LISTENING used to be declared HERE, the instant `getUserMedia`
        // resolved: before MediaRecorder existed, before the analyser existed,
        // before one sample was admitted. It was therefore true through a
        // suspended AudioContext, a muted or ended track, a 410 from the
        // transcribe route and a recording that never stopped — one word for
        // every failure, distinguishing none of them.
        //
        // This is MAIA-D02A's rule, on the surface D02A never covered: frame
        // receipt is the authority for listening, never graph acquisition.
        //
        // ⭐ The claim now waits for `audio_admitted` — the audio graph RUNNING
        // with nothing saying the track is dead — reported by the recorder
        // itself. Until then the surface stays in ARMING and says it is opening
        // the microphone, which is what is actually happening.
        setMicState('ARMING', 'sovereign_awaiting_admission');
        addDebug('🎙️ opening the microphone…');

        const admit = () => {
          if (sovereignGenerationRef.current !== captureGeneration) return;
          setIsListening(true);
          isListeningRef.current = true;
          setMicState('LISTENING', 'sovereign_audio_admitted');
          onRecordingStateChange?.(true);
          addDebug('🎙️ web whisper: recording…');
        };

        /**
         * ⛔ Observations, never instructions — the only stage acted on is
         * `audio_admitted`, and the only action is permission to say the word.
         * Every stage is logged so a device walk can name where a capture
         * stopped instead of showing one label for all of it:
         *
         *   recorder_created → audio_admitted → speech_detected → capture_stopped
         *
         * ⛔ Declared here rather than inline in the `recordAndTranscribe`
         * arguments: `desktopUtteranceLimit` reads that call's argument list as
         * source text to prove the raised ceiling stays behind `info.isDesktop`,
         * and a callback body inside it truncates that read.
         */
        const handleMilestone = (stage: string, detail?: Record<string, unknown>) => {
          if (sovereignGenerationRef.current !== captureGeneration) return;
          console.log(`🎚️ [capture] ${stage}`, detail ?? {});
          addDebug(`🎚️ ${stage}`);
          if (stage === 'audio_admitted') admit();
        };

        // DESKTOP-CONVERSATIONAL-SILENCE-01 — set when this capture heard no
        // speech. Read in `finally`, AFTER the mic has been returned to IDLE,
        // so the re-arm goes through the same door as every other one.
        let idleCapture = false;
        try {
          const { recordAndTranscribe } = await import('@/lib/voice/androidVoiceFallback');
          const result = await recordAndTranscribe(stream, {
            signal: captureController.signal,
            onMilestone: handleMilestone,
            // ⛔ DESKTOP-SOVEREIGN-STT-UTTERANCE-LIMIT-01 — Desktop turns end in
            // SILENCE, not on a timer. The module default (8 s) is a bound on a
            // one-shot Android recovery attempt; inheriting it here cut members
            // off mid-breath at second eight (device: 8704 ms, 8652 ms). Desktop
            // gets a safety ceiling instead — exceptional, not conversational.
            //
            // ⛔ Desktop ONLY. Firefox/Zen reach this same branch by absence of
            // Web Speech and keep the module's own 8 s bound, unchanged.
            ...(info.isDesktop ? { maxMs: DESKTOP_MAX_UTTERANCE_MS } : {}),
            // ⛔ DESKTOP-CONVERSATIONAL-SILENCE-01 — Desktop only, same reason.
            // A capture that has not yet heard speech is the member THINKING;
            // it may not close on silence, and if it reaches the ceiling having
            // heard nothing it is an idle capture rather than a turn. Firefox/
            // Zen keep the module's one-shot semantics unchanged.
            ...(info.isDesktop ? { requireSpeechBeforeSilenceStop: true } : {}),
          });

          // ⛔ THE STALE-RESULT GATE. Abort stops the work; it cannot un-resolve
          // a promise already in flight. If this capture's authority was revoked
          // while we were awaiting — the member left `/maia`, or a newer capture
          // superseded this one — the result is dropped here. Nothing reaches
          // witnessDispatch, onTranscript, or the member's conversation.
          if (sovereignGenerationRef.current !== captureGeneration) {
            console.log('🛡️ [sovereign capture] stale result discarded');
            return;
          }

          if (result.ok && result.transcript) {
            console.log(`✅ [web whisper] Transcript: ${result.transcript.length} chars, ${result.durationMs}ms`);
            addDebug(`✅ web whisper: ${result.transcript.length} chars`);
            isProcessingRef.current = true;
            witnessDispatch('web_whisper', 'fallback', result.transcript, recognitionEpochRef.current, turnCommitIdRef.current);
            onTranscript(result.transcript);
          } else if (result.reason === 'no_speech_detected') {
            // ⛔ NOT A FAILURE, AND NOT THE END OF ANYTHING. The member's
            // microphone was open and healthy; they had simply not started
            // speaking. Treating this as a failed turn is what set the mic IDLE
            // and ended the conversation on 2026-08-31. No error surfaces, no
            // phantom message is created, and the lease decides what happens
            // next — the capture is simply over, and the parent re-arms exactly
            // as it does after any completed one.
            console.log('🌙 [web whisper] Idle capture — member had not begun speaking; no upload');
            addDebug('🌙 idle capture (no speech) — still listening');
            idleCapture = true;
          } else {
            console.warn(`❌ [web whisper] Failed: ${result.reason}`);
            addDebug(`❌ web whisper failed: ${result.reason || 'unknown'}`);
            onVoiceUnavailable?.({
              reason: `web_whisper_${result.reason ?? 'unknown'}`,
              userMessage:
                result.reason === 'transcribe_disabled'
                  ? 'Voice transcription is not enabled on the server right now. You can type to MAIA instead.'
                  // ⛔ PLATFORM-D02A-01. The apparatus never heard. Saying "I
                  // could not hear that clearly" here blames the member for
                  // speaking unclearly into a microphone that was never
                  // delivering audio — the same lie as the LISTENING label, one
                  // layer down. Named as ours, with the one thing that helps.
                  : result.reason === 'no_audio_admitted'
                  ? 'No audio reached MAIA — the microphone opened but never delivered any sound. Check that the right input device is selected and not muted, then try again. You can type to MAIA meanwhile.'
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
          // Always release THIS capture's tracks.
          stream.getTracks().forEach((t) => t.stop());
          // ⛔ Only clear the registration if it is still ours. A newer capture
          // may already have taken the slot, and this teardown must not undo it.
          if (sovereignCaptureRef.current?.generation === captureGeneration) {
            sovereignCaptureRef.current = null;
          }
          // ⛔ Likewise the UI state: a superseded capture must not drag a live
          // one back to IDLE.
          if (sovereignGenerationRef.current === captureGeneration) {
            setIsListening(false);
            isListeningRef.current = false;
            setMicState('IDLE', 'web_whisper_done');
            onRecordingStateChange?.(false);
            isStartingRef.current = false;

            // ⛔ THE CONVERSATION DID NOT END — THE CAPTURE DID.
            //
            // Desktop is one utterance per capture, so the block above returns
            // the mic to IDLE after every one. For a capture that heard actual
            // speech that is correct: the turn is in flight. For an IDLE
            // capture it is the whole defect — the member paused to think, the
            // capture closed, and nothing re-armed.
            //
            // ⛔ THROUGH THE AUTHORITY, NEVER `startListening` DIRECTLY. That
            // is the single-conductor rule at the top of this file, and it is
            // also what makes explicit Stop dominate here for free: Stop clears
            // handsFreeActiveRef and wantsContinuousConversationRef
            // unconditionally, so authorityGuard refuses this restart and a
            // stopped conversation stays stopped through any number of idle
            // recycles.
            if (idleCapture) {
              const stillActive =
                isListeningRef.current || wantsContinuousConversationRef.current;
              logVoiceEvent('desktop_idle_capture_recycled', { rearmed: stillActive });
              if (stillActive) void requestRestartFnRef.current?.('desktop_idle_recycle');
            }
          }
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

  // ═══════════════════════════════════════════════════════════════════════
  // 🎙️ requestRestart — THE single authority for TURN_COMPLETE → NEXT_LISTEN
  // ═══════════════════════════════════════════════════════════════════════
  // The file has declared since its first commit that "ONLY requestRestart()
  // can move from IDLE → ARMING → LISTENING". That function did not exist: the
  // name appeared exactly once, in the comment asserting the rule. Meanwhile
  // five call sites started recognition directly, and two re-arm paths each
  // decided "continue" from a DIFFERENT five-condition predicate. The invariant
  // was documentation, enforced by nothing.
  //
  // This is that function. It does not talk to any recognition API itself —
  // it decides, then delegates to the existing startListening lifecycle, so
  // there remains exactly one place that touches the browser/native objects.

  /**
   * Return a stale turn-complete state to IDLE so the authority guard can admit
   * a restart. Never disturbs live capture.
   */
  const normalizeTurnCompleteState = useCallback((source: string): void => {
    const current = micStateRef.current;
    if (!shouldNormalizeToIdle(current, isStartingRef.current)) return;
    setMicState('IDLE', `normalize:${source}:from_${current}`);
  }, [setMicState]);

  const requestRestart = useCallback(async (
    source: RestartSource,
    opts?: { forceOverride?: boolean },
  ): Promise<void> => {
    const isUserTap = source === 'user_tap';

    // Re-entrancy. One restart at a time, whatever asked for it.
    if (restartRequestInFlightRef.current) {
      console.log('🎙️ [RESTART] BLOCKED', JSON.stringify({ source, reason: 'request_in_flight' }));
      return;
    }

    // An explicit gesture outranks continuation bookkeeping. Latches that
    // survived a previous turn must not silently swallow a tap — that is the
    // difference between "push-to-talk by design" and "the button is dead".
    if (isUserTap) {
      for (const latch of staleLatchesToClearForTap({
        restartInFlight: restartInFlightRef.current,
        isStarting: isStartingRef.current,
        micState: micStateRef.current,
      })) {
        console.log(`🎙️ [RESTART] clearing stale ${latch} for user_tap`);
        if (latch === 'restartInFlight') restartInFlightRef.current = false;
        else isStartingRef.current = false;
      }
    }

    // THE FIX. Normalize before the guard reads micState, so a turn that ended
    // in SUBMITTING/WAITING_FOR_TTS is recoverable instead of permanently
    // rejected as `mic_state_SUBMITTING`.
    normalizeTurnCompleteState(source);

    const policy = restartPolicy({
      source,
      handsFree: handsFreeActiveRef.current,
      isSpeaking: isSpeakingRef.current,
      isProcessing: isProcessingRef.current,
      requestInFlight: false, // re-entrancy already handled above
      forceOverride: opts?.forceOverride,
    });
    if (!policy.allowed) {
      console.log('🎙️ [RESTART] BLOCKED', JSON.stringify({ source, reason: policy.reason }));
      return;
    }

    const guard = authorityGuard({
      source,
      micState: micStateRef.current,
      listeningMode: listeningModeRef.current,
      restartInFlight: restartInFlightRef.current,
      lastSpeechAt: lastSpeechHeardAtRef.current,
      backoffStep: backoffStepRef.current,
      isProcessing: isProcessingRef.current,
    });
    if (!guard.allowed && !opts?.forceOverride) {
      console.log('🎙️ [RESTART] BLOCKED', JSON.stringify({ source, reason: guard.reason }));
      return;
    }

    restartRequestInFlightRef.current = true;
    console.log('🎙️ [RESTART] ALLOWED', JSON.stringify({ source, mic: micStateRef.current }));
    try {
      // The authority decision was made HERE, so the lifecycle is invoked with
      // forceOverride: re-running the same guard inside startListening would
      // now see restartInFlight and refuse the restart this function authorized.
      await startListeningFnRef.current?.({ forceOverride: true });
    } catch (e: any) {
      console.warn('🎙️ [RESTART] startListening threw:', e?.message || e);
    } finally {
      restartRequestInFlightRef.current = false;
    }
  }, [normalizeTurnCompleteState]);

  const requestRestartFnRef = useRef<(s: RestartSource, o?: { forceOverride?: boolean }) => void>();
  requestRestartFnRef.current = requestRestart;
  normalizeTurnCompleteStateFnRef.current = normalizeTurnCompleteState;

  // Stop listening
  // 🔥 FIX: userExitMode flag indicates user explicitly tapped holoflower to stop
  // When true, we clear wantsContinuousConversationRef so auto-restart won't trigger
  // When false/undefined (internal stop for transcript processing), we keep the ref so mic auto-restarts after MAIA
  const stopListening = useCallback(async (options?: { userExitMode?: boolean }) => {
    console.log('🛑 [ContinuousConversation] stopListening called', options?.userExitMode ? '(USER EXIT MODE)' : '(internal)');

    // ⛔ DESKTOP-SOVEREIGN-STT-LIFECYCLE-01 — FIRST, and UNCONDITIONALLY.
    // The sovereign capture is the one this function used not to own: it lived
    // in a local `let stream` that `micStreamRef` never saw. Revoking it only
    // on an explicit user exit would leave every other stop path — navigation,
    // supersession, error recovery — unable to reach it.
    revokeSovereignCapture('stopListening');

    // 🛑 STOP DOMINATES LIVENESS — it does not merely outlast it.
    //
    // Revoking session authority is UNCONDITIONAL, on every stop path. It used
    // to happen only under `userExitMode`, and no caller in the app passes that
    // flag — not the bar's stop button, not the emergency stop, not the two
    // call sites whose own comments read "User-initiated exit". So a stopped
    // hands-free session kept both of these refs set, and the two native
    // re-arm paths (iOS interruption-end, app foreground-resume) gate on
    // `handsFreeActiveRef` + `isConversationAlive` WITHOUT consulting
    // `isListeningRef`. A stop followed by background→foreground could
    // therefore resurrect the mic.
    //
    // That seam predates this change, but this change is what made it matter:
    // while the liveness lease was 15-45s the stale session expired on its own
    // within seconds. At a one-hour lease it does not. Restoring stop
    // semantics is part of this repair's non-degradation obligation, not
    // separate cleanup — a longer lease is only safe if stop revokes it
    // outright rather than waiting it out.
    //
    // Safe to do unconditionally: no caller uses stopListening() as a mid-turn
    // pause. The mic is suppressed during MAIA's speech by the lifecycle
    // session (discard / inputSuppressed), never by this function. Its callers
    // are the stop control, the mic-tap toggle's stop branch, the exits, and
    // unmount — every one of them an end of engagement.
    //
    // `userExitMode` is left exactly as it was and is NOT redesigned here; it
    // still owns the counter reset and the comparator close below.
    wantsContinuousConversationRef.current = false;
    handsFreeActiveRef.current = false;

    if (options?.userExitMode) {
      console.log('🚪 [ContinuousConversation] User explicitly exited voice mode');
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

      if (onTranscript && !isProcessingRef.current) {
        isProcessingRef.current = true;
        setIsRecording(false);
        onRecordingStateChange?.(false);
        witnessDispatch('manual_stop', 'manual', finalTranscript, recognitionEpochRef.current, turnCommitIdRef.current);
        onTranscript(finalTranscript);
      }
      accumulatedTranscript.current = '';
    }
    if (options?.userExitMode) {
      // Explicit exit closes the engagement the comparator is scoped to.
      // Ordering is load-bearing: this runs AFTER the accumulated flush above,
      // so that final `manual_stop` dispatch is still compared against the
      // engagement it belongs to rather than being reported as a first.
      resetDispatchProvenance();
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
    trackListenerCleanupRef.current?.();
    trackListenerCleanupRef.current = null;
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
  }, [onTranscript, onRecordingStateChange, getWebSession, revokeSovereignCapture]);

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
      // P0: an explicit gesture goes through the authority, which clears stale
      // latches first. Previously a tap called startListening() directly and was
      // silently refused by authorityGuard whenever micState was still pinned at
      // a turn-complete value — the "tapping does nothing" half of the incident.
      void requestRestartFnRef.current?.('user_tap');
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
          void requestRestartFnRef.current?.('interruption_end');
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
              void requestRestartFnRef.current?.('foreground_resume');
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
    // P0: the parent-facing handle is an external re-arm request, so it goes
    // through the authority like every other one. Parents (OracleConversation,
    // StreamingVoice) never reach the mic directly — that is the rule at the top
    // of this file, and this was one of the seams that made it false.
    startListening: (options?: { forceOverride?: boolean }) =>
      void requestRestartFnRef.current?.('user_tap', options),
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
    // A fresh engagement starts with no previous utterance to be the same as.
    resetDispatchProvenance();
    return () => {
      // ⛔ Revoked explicitly as well as via stopListening(), so the guarantee
      // does not depend on that function's internals staying as they are. Both
      // calls are idempotent.
      revokeSovereignCapture('unmount');
      stopListening();
      // Full lifecycle teardown: discards any remaining recognition instance
      // (handlers detached — no restart can fire post-unmount) and removes the
      // devicechange listener.
      webSessionRef.current?.dispose();
      // Module-local comparison state outlives this component. Clearing it
      // stops a LATER engagement from comparing its first utterance against
      // the last of this one and manufacturing a duplicate across a boundary
      // that has none.
      resetDispatchProvenance();
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