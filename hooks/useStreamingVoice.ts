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
import { apiFetch } from '@/lib/http/apiBase';

/** Relational stack metadata from server */
interface RelationalMetadata {
  maiaMode: 'REGULATOR' | 'NAVIGATOR' | 'MYTHOPOET';
  activation: number;
  /** Prosody speed multiplier. Undefined when MAIA chose silence. */
  prosodySpeed?: number;
  /** Number of audio chunks received. 0 means TTS failed - no speech available. */
  audioChunksReceived?: number;
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

interface StreamingVoiceOptions {
  onTextChunk?: (text: string, index: number) => void;
  onComplete?: (fullResponse: string, relational?: RelationalMetadata) => void;
  onSilence?: (silence: SilenceResponse) => void;
  onMoveOutcome?: (outcome: MoveOutcomeEvent) => void;
  onError?: (error: string) => void;
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
}

interface AudioQueueItem {
  index: number;
  audio: string;
  format: string;
  text: string;
}

const VOICE_SESSION_KEY = 'maia_voice_session_id';

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
  });

  // Audio queue and playback management
  const audioQueueRef = useRef<AudioQueueItem[]>([]);
  const isPlayingRef = useRef(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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
   * Hardened: MIME validation, no sync recursion on play rejection
   */
  const playNextChunk = useCallback(() => {
    if (isPlayingRef.current) return;

    if (audioQueueRef.current.length === 0) {
      console.log('[StreamingVoice] Queue empty, setting isPlaying=false');
      setState(prev => ({ ...prev, isPlaying: false }));
      return;
    }

    audioQueueRef.current.sort((a, b) => a.index - b.index);

    const chunk = audioQueueRef.current.shift();
    if (!chunk) return;

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
    const advance = (delayMs = 50) => {
      isPlayingRef.current = false;
      currentAudioRef.current = null;
      setTimeout(playNextChunk, delayMs);
    };

    try {
      if (!mime) {
        console.warn('[StreamingVoice] Unsupported audio format:', chunk.format);
        advance(0);
        return;
      }

      const audioSrc = `data:${mime};base64,${chunk.audio}`;
      const audio = new Audio(audioSrc);
      audio.preload = 'auto';
      currentAudioRef.current = audio;

      audio.onended = () => {
        console.log(
          '[StreamingVoice] Audio chunk ended, queue length:',
          audioQueueRef.current.length
        );
        advance(50);
      };

      audio.onerror = (e) => {
        console.error('[StreamingVoice] Audio playback error:', e);
        advance(50);
      };

      audio.play().catch(e => {
        // Never recurse synchronously; always schedule
        console.error('[StreamingVoice] Audio play failed:', e);
        advance(0);
      });
    } catch (e) {
      console.error('[StreamingVoice] Audio creation error:', e);
      // Schedule instead of direct recursion
      advance(0);
    }
  }, []);

  /**
   * Send a message and stream the response
   */
  const sendMessage = useCallback(async (
    message: string,
    conversationHistory?: Array<{ role: string; content: string }>
  ) => {
    // Clear previous state
    audioQueueRef.current = [];
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    isPlayingRef.current = false;

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
      onComplete?.(fallbackText);
      return;
    }

    try {
      // Use apiFetch for iOS/Safari compatibility (adds x-session-token header)
      console.log('[StreamingVoice] Starting request to /api/voice/stream-conversation');
      const response = await apiFetch('/api/voice/stream-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Belt + suspenders: cookies AND token header
        body: JSON.stringify({
          message,
          voice,
          speed,
          model,  // TTS quality: tts-1 (faster) or tts-1-hd (richer)
          element,
          conversationHistory,
          sessionId: sessionIdRef.current, // Stable session ID for relational stack
          prosodyRange,  // MAIA's prosody policy range (0=Neutral, 1=Subtle, 2=Expressive, 3=Ceremonial)
          assistantName, // Member's preferred name for MAIA
          archetype,     // MAIA's presence/archetype mode
          conversationMode, // Conversation style
          memoryDepth,   // Memory retrieval depth
        }),
        signal: abortControllerRef.current.signal,
      });
      console.log('[StreamingVoice] Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Stream request failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events from buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        let eventType = '';
        let eventData = '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            eventType = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            eventData = line.slice(5).trim();

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
                    // Sanitize the display text for audio chunks too
                    const cleanAudioText = sanitizeForDisplay(data.text);
                    // Only queue audio if we have valid text (skip metadata-only audio)
                    if (!cleanAudioText) {
                      console.log('[StreamingVoice] Skipping audio chunk with no speakable text');
                      break;
                    }
                    // Debug: log first audio chunk
                    if (audioQueueRef.current.length === 0) {
                      console.log('[StreamingVoice] First audio chunk received, index:', data.index);
                    }
                    audioQueueRef.current.push({
                      index: data.index,
                      audio: data.audio,
                      format: data.format,
                      text: cleanAudioText
                    });
                    // Start playback if not already playing
                    if (!isPlayingRef.current) {
                      console.log('[StreamingVoice] Starting audio playback');
                      playNextChunk();
                    }
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
                    };
                    setState(prev => ({
                      ...prev,
                      isStreaming: false,
                      fullResponse: data.fullResponse,
                      relational: relationalMeta,
                    }));
                    onComplete?.(data.fullResponse, relationalMeta);

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
                // Ignore parse errors for incomplete data
              }

              eventType = '';
              eventData = '';
            }
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
      onComplete?.(fallbackText);
    }
  }, [voice, speed, model, element, assistantName, archetype, conversationMode, memoryDepth, prosodyRange, onTextChunk, onComplete, onSilence, onMoveOutcome, onError, playNextChunk]);

  /**
   * Stop streaming and playback
   */
  const stop = useCallback(() => {
    // Cancel stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Stop current audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    // Clear queue
    audioQueueRef.current = [];
    isPlayingRef.current = false;

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
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

  return {
    ...state,
    sendMessage,
    stop,
    togglePause,
    /** Stable session ID for this conversation (for relational stack continuity) */
    sessionId: sessionIdRef.current,
  };
}
