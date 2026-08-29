/**
 * useStreamingVoice - Streaming Voice Response Hook
 *
 * Connects to the streaming conversation endpoint and plays audio chunks
 * as they arrive, creating natural conversational flow.
 *
 * Flow: User message → Stream connection → Audio chunks arrive → Queue & play seamlessly
 *
 * OFFLINE FALLBACK: When network is unavailable, provides warm presence responses
 * generated entirely on-device (no server required).
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { isProbablyOnline, generatePresenceFallback } from '@/lib/offline/presenceFallback';
import { apiFetch, getValidMemberId } from '@/lib/http/apiBase';

/** Relational stack metadata from server */
interface RelationalMetadata {
  maiaMode: 'REGULATOR' | 'NAVIGATOR' | 'MYTHOPOET';
  activation: number;
  /** Prosody speed multiplier. Undefined when MAIA chose silence. */
  prosodySpeed?: number;
  /** Number of audio chunks received. 0 means TTS failed - no speech available. */
  audioChunksReceived?: number;
  /** Idea candidate detected by heuristics (for client-side toast) */
  ideaCandidate?: { title: string; summary: string; sourceText: string; confidence: number; fingerprint: string };
  /** Suggested actions for behavioral loop inline rendering */
  suggestedActions?: Array<{ id: string; label: string; priority: number; kind?: string; route?: string }>;
}

/** Silence response from relational stack */
interface SilenceResponse {
  durationMs: number;
  intent: 'REGULATORY' | 'REFLECTIVE' | 'BOUNDARY';
  mode: string;
  activation: number;
}

/** Move outcome event from relational stack telemetry */
interface MoveOutcomeEvent {
  tsOutcome: number;
  tsMove: number;
  moveIntent: string;
  responseType: 'SPOKEN' | 'SILENCE';
  activationAtMove: number;
  activationAtOutcome?: number;
  outcome?: 'SETTLED' | 'WARM_CONTINUE' | 'ESCALATED' | 'DISENGAGED' | 'UNKNOWN';
  latencyToOutcomeMs?: number;
}

/** PWA playback signal for confirmed audio state (used by PWA voice state machine) */
export type StreamingVoicePlaybackSignal =
  | { type: 'AUDIO_PLAYING_CONFIRMED' }
  | { type: 'AUDIO_ENDED' }
  | { type: 'AUDIO_FAILED'; reason: string }
  | { type: 'AUDIO_BLOCKED'; reason: string };

/** Limits block response from API (429 + blocked: true) */
interface LimitsBlockData {
  message: string;
  tier?: string;
}

/**
 * VOICE-SOVEREIGNTY-03 — the consent gesture's payload.
 *
 * Carries WHICH VOICE was asked for and nothing about what was said. The server
 * deliberately omits transcript and conversation content: the gesture is about a
 * data boundary, so it must not itself cross one.
 */
export interface CloudVoiceConsentRequest {
  /** Internal archetype ID, e.g. 'maia_core'. Never shown to members. */
  voiceArchetype: string | null;
  /** Member-facing name, e.g. 'Maia'. This is what the prompt says. */
  voiceLabel: string | null;
  /** e.g. 'openai' */
  provider: string;
  /** e.g. 'alloy' */
  voice: string | null;
  /** The member's stored preference, verbatim — 'auto' or unset. */
  storedPreference: string;
}

interface StreamingVoiceOptions {
  onTextChunk?: (text: string, index: number) => void;
  /**
   * ⭐ CROSS-SURFACE-THREAD-ADOPTION-01. The third argument is the DURABLE
   * EXCHANGE IDENTITY of the invocation that is completing — not of whatever
   * turn happens to be current when the callback fires. It is the `exchangeId`
   * argument of the `sendMessage` call that produced this completion, closed
   * over per-invocation, so a late or aborted stream can never stamp a newer
   * turn's identity onto its response.
   *
   * ⛔ NOT `turnIdRef`. That UUID is instrumentation/correlation and lives in a
   * ref that the next turn overwrites. Both are UUIDs; they are different
   * contracts, and conflating them would put telemetry identity into the
   * conversation record.
   */
  onComplete?: (fullResponse: string, relational?: RelationalMetadata, exchangeId?: string) => void;
  onSilence?: (silence: SilenceResponse) => void;
  onMoveOutcome?: (outcome: MoveOutcomeEvent) => void;
  onError?: (error: string) => void;
  /** Called when voice is blocked due to tier limits (429 + blocked) */
  onLimitsBlock?: (data: LimitsBlockData) => void;
  /** PWA playback signal callback for confirmed audio states */
  onPlaybackSignal?: (signal: StreamingVoicePlaybackSignal) => void;
  /**
   * MAIA's selected voice is cloud-backed, the deployment permits cloud
   * synthesis, and the member has not yet said whether their words may leave the
   * machine.
   *
   * ⛔ This is a QUESTION, not an error, and not a reason to withhold anything.
   *    Local synthesis proceeds regardless; the surface must not gate the turn,
   *    replay it, or resend the member's message on the answer.
   */
  onCloudVoiceConsentRequired?: (request: CloudVoiceConsentRequest) => void;
  voice?: string;
  speed?: number;
  /** TTS quality: 'tts-1' (faster) or 'tts-1-hd' (richer) */
  model?: 'tts-1' | 'tts-1-hd';
  element?: string;
  /** Stable session ID for relational stack continuity. If not provided, one will be generated per hook instance. */
  sessionId?: string;
  /** Range of Effect (0-4): 0=Neutral, 1=Subtle, 2=Expressive, 3=Deep, 4=Ceremonial */
  prosodyRange?: 0 | 1 | 2 | 3 | 4;
  /** Member's preferred name for MAIA (passed to system prompt) */
  assistantName?: string;
  /** MAIA's archetype/presence mode */
  archetype?: string;
  /** Conversation style mode */
  conversationMode?: string;
  /** Memory depth preference */
  memoryDepth?: 'minimal' | 'moderate' | 'deep';
  /** Audio playback volume (0.0 - 1.0) */
  volume?: number;
}

interface StreamingVoiceState {
  isStreaming: boolean;
  isPlaying: boolean;
  currentText: string;
  fullResponse: string;
  sentenceIndex: number;
  error: string | null;
  /** True when MAIA chose intentional silence */
  isSilence: boolean;
  /** Relational stack metadata from last response */
  relational: RelationalMetadata | null;
  /** Last silence response details */
  lastSilence: SilenceResponse | null;
  /** Last move outcome from previous turn (for telemetry/debug) */
  lastMoveOutcome: MoveOutcomeEvent | null;
  /**
   * Pending cloud-voice consent question, or null.
   *
   * Set only by the server's `cloud_voice_consent_required` event. Cleared when
   * the member answers either way — never by a new turn arriving, because an
   * unanswered question is not stale, and never re-raised after an answer,
   * because the answer is stored durably server-side.
   */
  cloudVoiceConsent: CloudVoiceConsentRequest | null;
}

interface AudioQueueItem {
  index: number;
  audio: string;
  format: string;
  text: string;
}

const VOICE_SESSION_KEY = 'maia_voice_session_id';
const CONVERSATION_ID_KEY = 'maia_conversation_id';

/**
 * Sanitize text for display/speech - removes JSON metadata fragments
 * that may leak through the streaming pipeline.
 */
function sanitizeForDisplay(input: string): string {
  if (!input) return '';

  let s = input;

  // Strip obvious JSON fragments that leak into the text stream
  // (catches chunks that start mid-object like `6}, {"name": "mild confusion"...`)
  s = s.replace(/^\s*[\]\}\),\d]*\s*/g, '');
  s = s.replace(/\{[\s\S]*?\}\s*$/g, ''); // trailing object fragment

  // Remove complete JSON-like objects/arrays embedded in text
  s = s.replace(/[\[\{][^[\]{}]*[\]\}]/g, (m) => {
    // If it looks like JSON metadata, drop it
    const looksJsony =
      m.includes('"') && (m.includes(':') || m.includes('name') || m.includes('intensity'));
    return looksJsony ? '' : m;
  });

  // Remove metadata delimiters if they leak
  s = s.replace(/---SOUL_METADATA---[\s\S]*?---END_METADATA---/g, '');
  s = s.replace(/---SOUL_METADATA---[\s\S]*/g, ''); // partial block at end
  s = s.replace(/[\s\S]*---END_METADATA---/g, ''); // partial block at start

  // Collapse whitespace
  s = s.replace(/\s+/g, ' ').trim();

  return s;
}

/**
 * Generate a stable session ID for relational stack continuity.
 * Uses crypto.randomUUID if available, otherwise falls back to timestamp + random.
 */
function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `voice-${crypto.randomUUID()}`;
  }
  return `voice-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Get or create a persistent conversation ID.
 * Uses localStorage for cross-session persistence (survives app restarts).
 * This is used for memory continuity - MAIA remembers based on this ID.
 */
function getOrCreateConversationId(): string {
  try {
    const existing = localStorage.getItem(CONVERSATION_ID_KEY);
    if (existing) return existing;
  } catch {
    // localStorage unavailable
  }

  // Generate new and persist
  const created = `conv-${crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`}`;
  try {
    localStorage.setItem(CONVERSATION_ID_KEY, created);
  } catch {
    // localStorage unavailable
  }
  return created;
}

/**
 * Get or create a persistent session ID.
 * Stores in sessionStorage for continuity across page reloads.
 * Falls back to memory-only if sessionStorage unavailable.
 */
function getOrCreateSessionId(providedId?: string): string {
  // If explicitly provided, use that (and optionally store it)
  if (providedId) {
    try {
      sessionStorage.setItem(VOICE_SESSION_KEY, providedId);
    } catch {
      // sessionStorage unavailable (SSR, private mode, etc.)
    }
    return providedId;
  }

  // Try to get existing from sessionStorage
  try {
    const existing = sessionStorage.getItem(VOICE_SESSION_KEY);
    if (existing) return existing;
  } catch {
    // sessionStorage unavailable
  }

  // Generate new and try to persist
  const created = generateSessionId();
  try {
    sessionStorage.setItem(VOICE_SESSION_KEY, created);
  } catch {
    // sessionStorage unavailable
  }
  return created;
}

export function useStreamingVoice(options: StreamingVoiceOptions = {}) {
  const {
    onTextChunk,
    onComplete,
    onSilence,
    onMoveOutcome,
    onError,
    onLimitsBlock,  // 🛑 Tier limits callback
    onPlaybackSignal,  // 🎤 PWA playback signals
    onCloudVoiceConsentRequired,  // 🔐 VOICE-SOVEREIGNTY-03
    voice = 'maya',
    speed = 1.0,
    model = 'tts-1',
    element,
    sessionId: providedSessionId,
    prosodyRange = 1,  // Default: Subtle
    assistantName,
    archetype,
    conversationMode,
    memoryDepth,
    volume = 1.0,
  } = options;

  // Stable session ID - persisted in sessionStorage for cross-reload continuity
  const sessionIdRef = useRef<string>(getOrCreateSessionId(providedSessionId));

  // If providedSessionId changes (e.g., joining existing thread), update the ref
  useEffect(() => {
    if (providedSessionId && providedSessionId !== sessionIdRef.current) {
      sessionIdRef.current = getOrCreateSessionId(providedSessionId);
    }
  }, [providedSessionId]);

  const [state, setState] = useState<StreamingVoiceState>({
    isStreaming: false,
    isPlaying: false,
    currentText: '',
    fullResponse: '',
    sentenceIndex: 0,
    error: null,
    isSilence: false,
    relational: null,
    lastSilence: null,
    lastMoveOutcome: null,
    cloudVoiceConsent: null,
  });

  // Audio queue and playback management
  const audioQueueRef = useRef<AudioQueueItem[]>([]);
  const isPlayingRef = useRef(false);
  const nextExpectedIndexRef = useRef(0); // Enforce strict playback order
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 🎤 PWA PLAYBACK SIGNALS: Stable ref to callback for confirmed audio states
  const onPlaybackSignalRef = useRef(onPlaybackSignal);
  onPlaybackSignalRef.current = onPlaybackSignal;

  // 🔥 AUDIO WATCHDOG: Track if audio actually plays (not just received)
  const audioEventsSeenRef = useRef(0);
  const audioPlayedCountRef = useRef(0);
  const audioWatchdogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // Browser-safe type

  // ─── TURN INSTRUMENTATION REFS ───
  // One UUID per voice turn — correlates client logs with server logs.
  // Both refs are stable (no re-render) so safe to read in any callback.
  const turnIdRef = useRef<string>('');
  const turnStartRef = useRef<number>(0);
  const AUDIO_WATCHDOG_MS = 6000; // 6s after first audio event, if nothing played, force recovery

  // 🔥 FORCE RECOVERY: Called when audio pipeline is broken (watchdog or play failure)
  // This must clear ALL state that says "MAIA is speaking" - both in this hook AND externally
  const forceRecoverFromFalseSpeaking = useCallback((errorMessage: string) => {
    console.error('[StreamingVoice] 🚨 FORCE RECOVERY:', errorMessage);

    // Clear this hook's state
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    if (currentAudioRef.current) {
      // Clear handlers before clearing src to prevent stale error callbacks
      currentAudioRef.current.onerror = null;
      currentAudioRef.current.onended = null;
      currentAudioRef.current.pause();
      currentAudioRef.current.src = '';
      // 🔥 iOS FIX: Don't null out - keep the element for reuse (maintains unlock state)
      // currentAudioRef.current = null;
    }

    // Clear watchdog
    if (audioWatchdogTimerRef.current) {
      clearTimeout(audioWatchdogTimerRef.current);
      audioWatchdogTimerRef.current = null;
    }

    // Reset state - this triggers onComplete with error info
    setState(prev => ({
      ...prev,
      isStreaming: false,
      isPlaying: false,
      error: errorMessage,
    }));

    // Call onError so parent components (OracleConversation) can clear their speaking state too
    onError?.(errorMessage);

    // 🔇 FEEDBACK PREVENTION: Signal MAIA stopped speaking (even in error case)
    if (typeof window !== 'undefined') {
      console.log('🎤 [StreamingVoice] Dispatching maya-voice-end (recovery)');
      window.dispatchEvent(new Event('maya-voice-end'));
    }
  }, [onError]);

  // ── POSTURE LOG (tuning trace) ──
  // Ring buffer of last 20 posture events for diagnostic snapshots
  const postureLogRef = useRef<Array<{
    ts: number;
    sessionId?: string;
    mode?: string;
    posture?: string;
    brevity?: string;
    reason?: string;
    silenceIntent?: string;
    totalMs?: number;
  }>>([]);

  const pushPostureLog = useCallback((entry: {
    sessionId?: string;
    mode?: string;
    posture?: string;
    brevity?: string;
    reason?: string;
    silenceIntent?: string;
    totalMs?: number;
  }) => {
    postureLogRef.current.push({ ts: Date.now(), ...entry });
    if (postureLogRef.current.length > 20) postureLogRef.current.shift();
  }, []);

  /**
   * Play next audio chunk from queue
   * 🔥 HARDENED for iOS: Proper play() rejection handling with retry
   */
  const playNextChunk = useCallback(() => {
    if (isPlayingRef.current) return;

    if (audioQueueRef.current.length === 0) {
      console.log('[StreamingVoice] Queue empty, setting isPlaying=false');
      setState(prev => ({ ...prev, isPlaying: false }));
      return;
    }

    // Sort by index and enforce strict order — only play the next expected index.
    // If chunks arrive out of order (e.g. index 1 before 0), wait for the earlier
    // one to arrive. This preserves prosodic arcs across sentence boundaries.
    audioQueueRef.current.sort((a, b) => a.index - b.index);

    const nextChunk = audioQueueRef.current[0];
    if (!nextChunk) return;

    // Wait for the expected index — don't play out of order
    if (nextChunk.index > nextExpectedIndexRef.current) {
      console.log(`[StreamingVoice] ⏳ Waiting for index ${nextExpectedIndexRef.current}, have ${nextChunk.index}`);
      return; // Will be retried when the missing chunk arrives
    }

    const chunk = audioQueueRef.current.shift();
    if (!chunk) return;
    nextExpectedIndexRef.current = chunk.index + 1;

    isPlayingRef.current = true;
    setState(prev => ({
      ...prev,
      isPlaying: true,
      currentText: chunk.text,
      sentenceIndex: chunk.index
    }));

    // Format hardening: validate MIME before creating Audio element
    const safeFormat = (chunk.format || '').toLowerCase();
    const mime =
      safeFormat === 'wav' ? 'audio/wav'
      : safeFormat === 'mp3' ? 'audio/mpeg'
      : safeFormat === 'mpeg' ? 'audio/mpeg'
      : safeFormat === 'ogg' ? 'audio/ogg'
      : null;

    // Safe advance helper: always schedule, never sync recurse
    // 🔥 iOS FIX: Do NOT null out currentAudioRef - we need to reuse the unlocked element
    const advance = (delayMs = 50) => {
      isPlayingRef.current = false;
      // currentAudioRef.current = null; // REMOVED - breaks iOS audio unlock
      setTimeout(playNextChunk, delayMs);
    };

    try {
      if (!mime) {
        console.warn('[StreamingVoice] Unsupported audio format:', chunk.format);
        advance(0);
        return;
      }

      const audioSrc = `data:${mime};base64,${chunk.audio}`;

      // 🔥 iOS Safari FIX: Reuse a single Audio element
      // Safari only allows playback from Audio elements created during a user gesture.
      // By reusing the same element, we maintain the "unlocked" state.
      let audio = currentAudioRef.current;
      if (!audio) {
        // Try to use the globally unlocked audio element first (from layout.tsx)
        if (typeof window !== 'undefined' && (window as any).__maiaGlobalAudio) {
          audio = (window as any).__maiaGlobalAudio;
          console.log('[StreamingVoice] 🎧 Using globally unlocked Audio element');
        } else {
          audio = new Audio();
          audio.setAttribute('playsinline', '');
          audio.setAttribute('webkit-playsinline', '');
          (audio as any).playsInline = true;
          console.log('[StreamingVoice] 🎧 Created new Audio element (no global available)');
        }
        currentAudioRef.current = audio;
        console.log('[StreamingVoice] 🎧 Created reusable Audio element for iOS compatibility');
      }

      // 🔥 FIX: Clear stale handlers BEFORE setting new source
      // When reusing an audio element, old onerror handlers can fire for the
      // previous empty/cleared src. This prevents spurious error logs.
      audio.onerror = null;
      audio.onended = null;

      // Update source and volume (reusing element)
      audio.src = audioSrc;
      audio.volume = volume;
      console.log('[StreamingVoice] 🔊 Audio volume set to:', volume);
      audio.preload = 'auto';

      audio.onended = () => {
        console.log(
          '[StreamingVoice] ✅ Audio chunk ended, queue length:',
          audioQueueRef.current.length
        );
        // 🎤 PWA SIGNAL: If this is the LAST chunk, emit AUDIO_ENDED
        if (audioQueueRef.current.length === 0) {
          console.log(`[voice:playback_end:${turnIdRef.current.slice(0,8)}] elapsed=${Date.now() - turnStartRef.current}ms`);
          onPlaybackSignalRef.current?.({ type: 'AUDIO_ENDED' });
          // 🔇 FEEDBACK PREVENTION: Signal MAIA finished speaking to re-enable mic
          if (typeof window !== 'undefined') {
            console.log(`[voice:mic_resume_requested:${turnIdRef.current.slice(0,8)}] elapsed=${Date.now() - turnStartRef.current}ms`);
            console.log('🎤 [StreamingVoice] Dispatching maya-voice-end for feedback prevention');
            setTimeout(() => {
              window.dispatchEvent(new Event('maya-voice-end'));
            }, 500); // Small delay to ensure audio has fully finished
          }
        }
        advance(0);
      };

      audio.onerror = (e) => {
        console.error('[StreamingVoice] Audio playback error:', e);
        // 🎤 PWA SIGNAL: Audio element error
        onPlaybackSignalRef.current?.({ type: 'AUDIO_FAILED', reason: 'audio element error' });
        advance(0);
      };

      // 🔥 iOS FIX: Proper play() with retry and failure recovery
      const attemptPlay = async (retryCount = 0): Promise<void> => {
        try {
          await audio.play();
          // ✅ Audio actually started playing!
          audioPlayedCountRef.current++;
          console.log('[StreamingVoice] ✅ Audio play STARTED, played count:', audioPlayedCountRef.current);

          // 🎤 PWA SIGNAL: First successful play = CONFIRMED audio is working
          if (audioPlayedCountRef.current === 1) {
            console.log(`[voice:playback_start:${turnIdRef.current.slice(0,8)}] elapsed=${Date.now() - turnStartRef.current}ms`);
            onPlaybackSignalRef.current?.({ type: 'AUDIO_PLAYING_CONFIRMED' });
            // 🔇 FEEDBACK PREVENTION: Signal MAIA is speaking to stop mic
            if (typeof window !== 'undefined') {
              console.log('🔇 [StreamingVoice] Dispatching maya-voice-start for feedback prevention');
              window.dispatchEvent(new Event('maya-voice-start'));
            }
          }

          // Clear watchdog on first successful play - we're not stuck
          if (audioPlayedCountRef.current === 1 && audioWatchdogTimerRef.current) {
            clearTimeout(audioWatchdogTimerRef.current);
            audioWatchdogTimerRef.current = null;
            console.log('[StreamingVoice] 🐕 Watchdog cleared - audio is playing');
          }
        } catch (err: any) {
          const errName = err?.name || 'UnknownError';
          console.warn(`[StreamingVoice] audio.play() failed (attempt ${retryCount + 1}):`, errName, err?.message);

          // iOS often fails first attempt after interruption - retry once
          if (retryCount === 0 && (errName === 'NotAllowedError' || errName === 'AbortError')) {
            console.log('[StreamingVoice] Retrying play on next animation frame...');
            await new Promise(r => requestAnimationFrame(() => r(null)));
            return attemptPlay(1);
          }

          // 🎤 PWA SIGNAL: Audio blocked (Safari autoplay / interrupted session)
          onPlaybackSignalRef.current?.({ type: 'AUDIO_BLOCKED', reason: errName });

          // 🔥 Retry failed - FORCE RECOVERY, don't just "advance"
          // If iOS is blocking playback, every chunk will fail - we need to bail completely
          forceRecoverFromFalseSpeaking(`Audio playback blocked (${errName}). Tap to re-enable.`);
        }
      };

      attemptPlay();
    } catch (e) {
      console.error('[StreamingVoice] Audio creation error:', e);
      advance(0);
    }
  }, [forceRecoverFromFalseSpeaking, volume]);

  /**
   * Send a message and stream the response
   */
  const sendMessage = useCallback(async (
    message: string,
    conversationHistory: Array<{ role: string; content: string }> | undefined,
    // F10-SANCTUARY-WIRE-01. REQUIRED, and an argument rather than a hook option.
    //
    // This hook omitted `sanctuary` entirely. The route destructures it from the
    // body as `sanctuary = false` (stream-conversation/route.ts:621), so a
    // Sanctuary turn arrived indistinguishable from an ordinary one: retrieval
    // ran, memory reached the prompt, and the turn was persisted. Witnessed in
    // production on turn 4fde4e90-4f09-4ff7-8021-d30cc94887d8.
    //
    // Why an argument and not an option: `sendMessage` is a useCallback with a
    // 17-entry dependency array. A hook option would make this boundary depend
    // on that array staying correct, and a missed entry would ship a stale
    // `false` — the same defect again, silently. As an argument it is read at
    // dispatch, from the caller's live state, with nothing memoized in between.
    //
    // Why required and not optional: a caller that forgets it must fail to
    // compile, not quietly send `false`. There is no safe default here — the
    // absent value is what caused the breach.
    sanctuary: boolean,
    /**
     * ⭐ The durable exchange identity for THIS turn, minted by the caller when
     * the member's message was authored and already stamped on that message.
     *
     * An argument for the same reason `sanctuary` is one: `sendMessage` is a
     * useCallback with a large dependency array, and identity read through a
     * hook option or a ref would be identity read at the wrong moment. As a
     * parameter it is bound per invocation, which is exactly the guarantee the
     * completion needs — the response is stamped with the identity of the turn
     * that produced it, even if a newer turn started meanwhile.
     *
     * Required, not optional: a caller that forgets it must fail to compile
     * rather than silently produce a pair whose halves cannot be matched.
     */
    exchangeId: string,
  ) => {
    // ─── TURN START ───
    turnIdRef.current = crypto.randomUUID();
    turnStartRef.current = Date.now();
    console.log(`[voice:turn_start:${turnIdRef.current.slice(0,8)}] chars=${message.length} ts=${turnStartRef.current}`);

    // Clear previous state
    // 🔥 iOS FIX: Keep the audio element but clear its source - don't null it out
    audioQueueRef.current = [];
    nextExpectedIndexRef.current = 0; // Reset ordering for new message
    if (currentAudioRef.current) {
      // Clear handlers before clearing src to prevent stale error callbacks
      currentAudioRef.current.onerror = null;
      currentAudioRef.current.onended = null;
      currentAudioRef.current.pause();
      currentAudioRef.current.src = ''; // Clear source but keep element
      // currentAudioRef.current = null; // REMOVED - breaks iOS audio unlock
    }
    isPlayingRef.current = false;

    // 🔥 Reset audio watchdog counters
    audioEventsSeenRef.current = 0;
    audioPlayedCountRef.current = 0;
    if (audioWatchdogTimerRef.current) {
      clearTimeout(audioWatchdogTimerRef.current);
      audioWatchdogTimerRef.current = null;
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setState(prev => ({
      isStreaming: true,
      isPlaying: false,
      currentText: '',
      fullResponse: '',
      sentenceIndex: 0,
      error: null,
      isSilence: false,
      relational: prev.relational, // Preserve relational state across turns
      lastSilence: null,
      lastMoveOutcome: prev.lastMoveOutcome, // Preserve for telemetry
      // VOICE-SOVEREIGNTY-03. PRESERVED across turns, deliberately. An
      // unanswered question is not stale — the member has not declined, they
      // have not yet chosen. Clearing here would also make the prompt vanish and
      // reappear on every turn as the server re-emits it, which reads as a
      // glitch and pressures an answer through repetition. It is cleared only by
      // the member answering.
      cloudVoiceConsent: prev.cloudVoiceConsent,
    }));

    // OFFLINE FALLBACK: Check if we're probably offline before attempting server call
    if (!isProbablyOnline()) {
      console.log('[StreamingVoice] Offline detected - using presence fallback');
      const fallbackText = generatePresenceFallback({
        userText: message,
        mode: 'support',
      });

      // Simulate a complete response (no audio in fallback mode)
      setState(prev => ({
        ...prev,
        isStreaming: false,
        currentText: fallbackText,
        fullResponse: fallbackText,
      }));
      onComplete?.(fallbackText, undefined, exchangeId);
      return;
    }

    try {
      // Use apiFetch for iOS/Safari compatibility (adds x-session-token header)
      // 🔧 FIX: Include stable conversationId for memory continuity
      const conversationId = getOrCreateConversationId();
      console.log('[StreamingVoice] Starting request to /api/voice/stream-conversation, conversationId:', conversationId.slice(0, 12) + '...');
      console.log(`[voice:submission_fired:${turnIdRef.current.slice(0,8)}] elapsed=0ms`);
      const response = await apiFetch('/api/voice/stream-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-voice-turn-id': turnIdRef.current,
        },
        credentials: 'include', // Belt + suspenders: cookies AND token header
        body: JSON.stringify({
          message,
          userId: getValidMemberId(),  // Member ID for voice prefs + archetype resolution
          voice,
          speed,
          model,  // TTS quality: tts-1 (faster) or tts-1-hd (richer)
          element,
          conversationHistory,
          sessionId: sessionIdRef.current, // Stable session ID for relational stack
          conversationId, // 🧠 Stable conversation ID for memory continuity
          prosodyRange,  // MAIA's prosody policy range (0=Neutral, 1=Subtle, 2=Expressive, 3=Ceremonial)
          assistantName, // Member's preferred name for MAIA
          archetype,     // MAIA's presence/archetype mode
          conversationMode, // Conversation style
          memoryDepth,   // Memory retrieval depth
          // F10-SANCTUARY-WIRE-01: the Sanctuary boundary must cross the wire.
          // Its absence here is what let a Sanctuary turn retrieve memory and be
          // persisted. Never make this conditional or omit it when false — the
          // route's `sanctuary = false` default cannot distinguish "not in
          // Sanctuary" from "the client forgot to say".
          sanctuary,
        }),
        signal: abortControllerRef.current.signal,
      });
      console.log('[StreamingVoice] Response status:', response.status);

      if (!response.ok) {
        // 🛑 LIMITS ENFORCEMENT: Check for tier-based voice limit (429)
        if (response.status === 429) {
          const errData = await response.json().catch(() => null);
          if (errData?.blocked) {
            console.log('[StreamingVoice] Voice limit reached:', errData.error || errData.message);
            setState(prev => ({ ...prev, isStreaming: false, error: 'Voice limit reached' }));
            onLimitsBlock?.({
              message: errData.error ?? errData.message ?? "You've reached your voice limit for this tier.",
              tier: errData.tier,
            });
            return; // Don't throw - handled gracefully
          }
        }
        throw new Error(`Stream request failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }
      console.log(`[voice:response_received:${turnIdRef.current.slice(0,8)}] elapsed=${Date.now() - turnStartRef.current}ms`);

      const decoder = new TextDecoder();
      let buffer = '';
      // CRITICAL: Keep BOTH eventType and eventData outside the loop
      // Large audio payloads (30KB+ base64) span multiple reader.read() calls
      let eventType = '';
      let eventData = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events from buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const rawLine of lines) {
          const line = rawLine.replace(/\r$/, ''); // Handle CRLF

          // SSE event boundary: blank line means event is complete
          if (line === '') {
            if (eventType && eventData) {
              try {
                const data = JSON.parse(eventData);

                switch (eventType) {
                  case 'text': {
                    // Sanitize text to remove any leaked JSON metadata
                    const cleanText = sanitizeForDisplay(data.text);
                    if (!cleanText) break; // Skip empty/metadata-only chunks
                    setState(prev => ({
                      ...prev,
                      currentText: cleanText,
                      sentenceIndex: data.index
                    }));
                    onTextChunk?.(cleanText, data.index);
                    break;
                  }

                  case 'audio': {
                    // Validate audio data exists
                    if (!data.audio) {
                      console.warn('[StreamingVoice] Audio event missing audio data');
                      break;
                    }
                    // 🔊 DEBUG: Log that we received audio from server
                    console.log('🔊 [AUDIO DEBUG] Received audio chunk from server!', {
                      index: data.index,
                      format: data.format,
                      audioLen: data.audio?.length,
                      timestamp: new Date().toISOString()
                    });

                    // 🔥 WATCHDOG: Track audio events seen and start timer on first event
                    audioEventsSeenRef.current++;
                    if (audioEventsSeenRef.current === 1) {
                      console.log(`[voice:first_audio:${turnIdRef.current.slice(0,8)}] elapsed=${Date.now() - turnStartRef.current}ms`);
                      console.log('[StreamingVoice] 🐕 Starting audio watchdog timer');
                      // Start watchdog: if no audio played within N seconds, force recovery
                      if (audioWatchdogTimerRef.current) clearTimeout(audioWatchdogTimerRef.current);
                      audioWatchdogTimerRef.current = setTimeout(() => {
                        if (audioEventsSeenRef.current > 0 && audioPlayedCountRef.current === 0) {
                          // 🎤 PWA SIGNAL: Audio blocked (Safari autoplay failure - got chunks but none played)
                          onPlaybackSignalRef.current?.({
                            type: 'AUDIO_BLOCKED',
                            reason: `watchdog: ${audioEventsSeenRef.current} chunks received but nothing played`
                          });
                          // 🔥 Use shared recovery - clears ALL state including parent components
                          forceRecoverFromFalseSpeaking(
                            `Audio watchdog: ${audioEventsSeenRef.current} chunks received but nothing played`
                          );
                        }
                      }, AUDIO_WATCHDOG_MS);
                    }

                    // Sanitize the display text (but don't skip audio if text is empty)
                    const cleanAudioText = sanitizeForDisplay(data.text || '');
                    // Debug: log audio chunk
                    console.log(`[StreamingVoice] 📥 Audio event #${audioEventsSeenRef.current}, index:`, data.index, 'format:', data.format, 'dataLen:', data.audio?.length);
                    audioQueueRef.current.push({
                      index: data.index,
                      audio: data.audio,
                      format: data.format,
                      text: cleanAudioText || '...'
                    });
                    // Start playback if not already playing
                    if (!isPlayingRef.current) {
                      console.log('[StreamingVoice] 🎵 Starting audio playback');
                      playNextChunk();
                    }
                    break;
                  }

                  case 'cloud_voice_consent_required': {
                    // ── VOICE-SOVEREIGNTY-03 ──
                    // MAIA's selected voice is cloud-backed and the member has
                    // not said whether their words may leave the machine.
                    //
                    // ⛔ Nothing is blocked here and nothing is replayed. The
                    //    turn continues; local synthesis is already underway
                    //    with the af_kore mapping. A member who never answers
                    //    keeps MAIA's voice — the ask is additive, never a toll.
                    const consentRequest: CloudVoiceConsentRequest = {
                      voiceArchetype: data.voiceArchetype ?? null,
                      voiceLabel: data.voiceLabel ?? null,
                      provider: data.provider,
                      voice: data.voice ?? null,
                      storedPreference: data.storedPreference,
                    };
                    setState(prev => ({ ...prev, cloudVoiceConsent: consentRequest }));
                    onCloudVoiceConsentRequired?.(consentRequest);
                    break;
                  }

                  case 'silence':
                    // MAIA chose intentional silence - this is NOT an error
                    const silenceResponse: SilenceResponse = {
                      durationMs: data.durationMs,
                      intent: data.intent,
                      mode: data.mode,
                      activation: data.activation,
                    };
                    setState(prev => ({
                      ...prev,
                      isStreaming: false,
                      isSilence: true,
                      lastSilence: silenceResponse,
                      relational: {
                        maiaMode: data.mode,
                        activation: data.activation,
                        // prosodySpeed intentionally omitted for silence
                      },
                    }));
                    onSilence?.(silenceResponse);
                    console.log(`[StreamingVoice] Silence response: ${data.intent} for ${data.durationMs}ms`);
                    break;

                  case 'move_outcome':
                    // Telemetry: what happened from MAIA's last move
                    const moveOutcome: MoveOutcomeEvent = {
                      tsOutcome: data.tsOutcome,
                      tsMove: data.tsMove,
                      moveIntent: data.moveIntent,
                      responseType: data.responseType,
                      activationAtMove: data.activationAtMove,
                      activationAtOutcome: data.activationAtOutcome,
                      outcome: data.outcome,
                      latencyToOutcomeMs: data.latencyToOutcomeMs,
                    };
                    setState(prev => ({
                      ...prev,
                      lastMoveOutcome: moveOutcome,
                    }));
                    onMoveOutcome?.(moveOutcome);
                    // Dev log: one-liner summary
                    const delta = moveOutcome.activationAtOutcome !== undefined
                      ? (moveOutcome.activationAtOutcome - moveOutcome.activationAtMove).toFixed(2)
                      : '?';
                    console.log(
                      `[StreamingVoice] Move outcome: ${moveOutcome.moveIntent} → ${moveOutcome.outcome} ` +
                      `(Δ${delta}, ${moveOutcome.latencyToOutcomeMs}ms)`
                    );
                    break;

                  case 'complete': {
                    const audioChunksReceived = audioQueueRef.current.length + (isPlayingRef.current ? 1 : 0);
                    console.log(`[StreamingVoice] ✅ Complete event received (${audioChunksReceived} audio chunks)`);

                    // CRITICAL: If no audio chunks received, TTS completely failed
                    if (audioChunksReceived === 0 && !state.isSilence) {
                      console.warn('[StreamingVoice] ⚠️ TTS FAILED - no audio chunks received. Text response only.');
                    }

                    // Extract relational metadata if present, always include audio chunk count
                    const relationalMeta: RelationalMetadata = {
                      maiaMode: data.relational?.maiaMode ?? 'NAVIGATOR',
                      activation: data.relational?.activation ?? 0.5,
                      prosodySpeed: data.relational?.prosodySpeed,
                      audioChunksReceived, // Always include so parent knows if TTS worked
                      ideaCandidate: data.ideaCandidate ?? undefined,
                      suggestedActions: data.suggestedActions ?? undefined,
                    };
                    setState(prev => ({
                      ...prev,
                      isStreaming: false,
                      fullResponse: data.fullResponse,
                      relational: relationalMeta,
                    }));
                    onComplete?.(data.fullResponse, relationalMeta, exchangeId);

                    // ─── SERVER TIMING SUMMARY ───
                    // Log turn ID + host + server-side mark breakdown for comparison
                    if (data.turnId || data.timing) {
                      console.log(`[voice:server_timing:${(data.turnId ?? turnIdRef.current).slice(0,8)}] host=${data.host ?? 'unknown'} client_elapsed=${Date.now() - turnStartRef.current}ms ${data.timing ?? ''}`);
                    }

                    // ── POSTURE TRACE (tuning log) ──
                    const g = data.guidance;
                    if (g) {
                      pushPostureLog({
                        sessionId: sessionIdRef.current,
                        mode: data.mode,
                        posture: g.posture,
                        brevity: g.brevity,
                        reason: g.reason,
                        silenceIntent: data.silenceIntent,
                        totalMs: data.timing?.totalMs,
                      });

                      console.log(
                        `[MAIA][${sessionIdRef.current?.slice(-8) ?? '—'}] complete ` +
                        `mode=${data.mode ?? '—'} posture=${g.posture} brevity=${g.brevity} ` +
                        `reason=${g.reason ?? '—'} intent=${data.silenceIntent ?? '—'} ` +
                        `t=${data.timing?.totalMs ?? '—'}ms`
                      );
                    }
                    break;
                  }

                  case 'error':
                    setState(prev => ({
                      ...prev,
                      isStreaming: false,
                      error: data.message
                    }));
                    onError?.(data.message);
                    break;
                }
              } catch (e) {
                console.warn('[StreamingVoice] SSE parse error:', e, 'eventType:', eventType, 'dataLen:', eventData.length);
              }

              // Reset ONLY after successfully processing the complete event
              eventType = '';
              eventData = '';
            }
            continue; // Move to next line after blank line
          }

          // Accumulate event type
          if (line.startsWith('event:')) {
            eventType = line.slice(6).trim();
            continue;
          }

          // Accumulate data (can be multi-line in SSE)
          if (line.startsWith('data:')) {
            const chunk = line.slice(5).trimStart();
            eventData = eventData ? `${eventData}\n${chunk}` : chunk;
            continue;
          }
        }
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        // Intentional cancellation
        return;
      }

      // NETWORK ERROR FALLBACK: Server unreachable, use presence mode
      console.log('[StreamingVoice] Network error - using presence fallback:', e);
      const fallbackText = generatePresenceFallback({
        userText: message,
        mode: 'support',
      });

      setState(prev => ({
        ...prev,
        isStreaming: false,
        currentText: fallbackText,
        fullResponse: fallbackText,
        error: null, // Don't show error - we have a graceful fallback
      }));
      onComplete?.(fallbackText, undefined, exchangeId);
    }
  }, [voice, speed, model, element, assistantName, archetype, conversationMode, memoryDepth, prosodyRange, onTextChunk, onComplete, onSilence, onMoveOutcome, onError, onLimitsBlock, playNextChunk, forceRecoverFromFalseSpeaking]);

  /**
   * Stop streaming and playback
   */
  const stop = useCallback(() => {
    // Cancel stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Stop current audio (but keep element for iOS reuse)
    if (currentAudioRef.current) {
      // Clear handlers before clearing src to prevent stale error callbacks
      currentAudioRef.current.onerror = null;
      currentAudioRef.current.onended = null;
      currentAudioRef.current.pause();
      currentAudioRef.current.src = '';
      // Keep the element for iOS - don't null it out
    }

    // Clear queue
    audioQueueRef.current = [];
    isPlayingRef.current = false;

    // 🔥 Clear watchdog on manual stop
    if (audioWatchdogTimerRef.current) {
      clearTimeout(audioWatchdogTimerRef.current);
      audioWatchdogTimerRef.current = null;
    }

    setState(prev => ({
      isStreaming: false,
      isPlaying: false,
      currentText: '',
      fullResponse: '',
      sentenceIndex: 0,
      error: null,
      isSilence: false,
      relational: prev.relational, // Preserve relational state
      lastSilence: null,
    }));
  }, []);

  /**
   * Pause/resume playback
   */
  const togglePause = useCallback(() => {
    if (currentAudioRef.current) {
      if (currentAudioRef.current.paused) {
        currentAudioRef.current.play();
        setState(prev => ({ ...prev, isPlaying: true }));
      } else {
        currentAudioRef.current.pause();
        setState(prev => ({ ...prev, isPlaying: false }));
      }
    }
  }, []);

  /**
   * 🔥 iOS Safari Audio Unlock - MUST be called from a user gesture (click/touch)
   * Creates and warms the reusable Audio element so TTS playback works.
   * Returns true if successful.
   */
  const unlockAudio = useCallback(async (): Promise<boolean> => {
    console.log('[StreamingVoice] 🔓 Attempting iOS audio unlock...');
    try {
      // Create or get the reusable audio element
      let audio = currentAudioRef.current;
      if (!audio) {
        audio = new Audio();
        audio.setAttribute('playsinline', '');
        audio.setAttribute('webkit-playsinline', '');
        (audio as any).playsInline = true;
        currentAudioRef.current = audio;
      }

      // Play a tiny silent audio to "unlock" this element
      audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAADhAAzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMz//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjUyAAAAAAAAAAAAAAAAJAAAAAAAAAAAA4SQg5C0AAAAAAD/+9DEAAPH1sVGABGuEvKorHAiNbAAAAA0LS0tLS0tLVVVVVVVVVVVVVVVVVVVVQAAAAAVFRUVFRUVFRUVFRUVFRUVFRUAAAAAAAAlJSUlJSUlJSUlJSUlJSUlJSUlJQAAAAAAIiIiIiIiIiIiIiIiIiIiIiIAAAAAAAAAAAAA';
      audio.volume = 0.01; // Very quiet
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 1.0; // Restore volume for actual playback

      console.log('[StreamingVoice] ✅ iOS audio unlocked successfully');
      return true;
    } catch (err) {
      console.warn('[StreamingVoice] ❌ iOS audio unlock failed:', err);
      return false;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      // 🔥 Clear watchdog on unmount
      if (audioWatchdogTimerRef.current) {
        clearTimeout(audioWatchdogTimerRef.current);
      }
    };
  }, []);

  // ── DEVTOOLS DEBUG HELPER ──
  // Call __maia_posture_log() in console to get last 20 posture events
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__maia_posture_log = () => postureLogRef.current.slice();
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__maia_posture_log;
      }
    };
  }, []);

  /**
   * VOICE-SOVEREIGNTY-03 — record the member's answer.
   *
   * ⛔ This is the ONLY place the client may act on the consent question, and it
   *    does exactly one thing: POST the answer. It does NOT resend the member's
   *    message, regenerate the current turn, re-request audio, or touch the
   *    voice archetype, voice ID, speed, or any other setting. The server's
   *    narrow endpoint writes one column for the same reason — identity and
   *    egress are separate axes and a consent act must not be able to reach
   *    across them.
   *
   * The answer takes effect on the NEXT turn. Applying it retroactively would
   * mean re-synthesising words the member already heard, which is not what they
   * agreed to.
   *
   * The pending question is cleared optimistically: the member has answered, and
   * leaving the prompt up while the POST is in flight would invite a second
   * answer to a question already settled. A failed write leaves the stored
   * preference untouched, so the server simply asks again next turn — the
   * failure mode is a repeated question, never an unrecorded consent.
   */
  const answerCloudVoiceConsent = useCallback(async (allow: boolean) => {
    setState(prev => ({ ...prev, cloudVoiceConsent: null }));
    try {
      const res = await apiFetch('/api/voice/cloud-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allow }),
      });
      if (!res.ok) {
        console.warn('[StreamingVoice] cloud voice consent not recorded:', res.status);
        return;
      }
      const result = await res.json().catch(() => null);
      console.log('[StreamingVoice] cloud voice consent recorded:', result?.storedPreference);
    } catch (e) {
      console.warn('[StreamingVoice] cloud voice consent failed:', e instanceof Error ? e.message : e);
    }
  }, []);

  return {
    ...state,
    sendMessage,
    stop,
    togglePause,
    /**
     * Answer the cloud-voice consent question. `true` stores 'cloud', `false`
     * stores 'local'. Both preserve the member's chosen voice identity.
     */
    answerCloudVoiceConsent,
    /** 🔥 iOS Safari: Call this from a user gesture to enable TTS playback */
    unlockAudio,
    /** Stable session ID for this conversation (for relational stack continuity) */
    sessionId: sessionIdRef.current,
  };
}
