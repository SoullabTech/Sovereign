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

/** Relational stack metadata from server */
interface RelationalMetadata {
  maiaMode: 'REGULATOR' | 'NAVIGATOR' | 'MYTHOPOET';
  activation: number;
  /** Prosody speed multiplier. Undefined when MAIA chose silence. */
  prosodySpeed?: number;
}

/** Silence response from relational stack */
interface SilenceResponse {
  durationMs: number;
  intent: 'REGULATORY' | 'REFLECTIVE' | 'BOUNDARY';
  mode: string;
  activation: number;
}

interface StreamingVoiceOptions {
  onTextChunk?: (text: string, index: number) => void;
  onComplete?: (fullResponse: string, relational?: RelationalMetadata) => void;
  onSilence?: (silence: SilenceResponse) => void;
  onError?: (error: string) => void;
  voice?: string;
  speed?: number;
  element?: string;
  /** Stable session ID for relational stack continuity. If not provided, one will be generated per hook instance. */
  sessionId?: string;
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
}

interface AudioQueueItem {
  index: number;
  audio: string;
  format: string;
  text: string;
}

const VOICE_SESSION_KEY = 'maia_voice_session_id';

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
    onError,
    voice = 'maya',
    speed = 1.0,
    element,
    sessionId: providedSessionId,
  } = options;

  // Stable session ID - persisted in sessionStorage for cross-reload continuity
  const sessionIdRef = useRef<string>(getOrCreateSessionId(providedSessionId));

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
  });

  // Audio queue and playback management
  const audioQueueRef = useRef<AudioQueueItem[]>([]);
  const isPlayingRef = useRef(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Play next audio chunk from queue
   */
  const playNextChunk = useCallback(() => {
    // If currently playing, wait for current chunk to finish
    if (isPlayingRef.current) {
      return;
    }

    // Queue empty - we're done playing
    if (audioQueueRef.current.length === 0) {
      console.log('[StreamingVoice] Queue empty, setting isPlaying=false');
      setState(prev => ({ ...prev, isPlaying: false }));
      return;
    }

    // Sort by index to ensure correct order
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

    try {
      // Create audio element from base64 data
      const audioSrc = `data:audio/${chunk.format};base64,${chunk.audio}`;
      const audio = new Audio(audioSrc);
      currentAudioRef.current = audio;

      audio.onended = () => {
        console.log('[StreamingVoice] Audio chunk ended, queue length:', audioQueueRef.current.length);
        isPlayingRef.current = false;
        currentAudioRef.current = null;
        // Play next chunk or signal completion
        setTimeout(playNextChunk, 50); // Small gap between chunks
      };

      audio.onerror = (e) => {
        console.error('[StreamingVoice] Audio playback error:', e);
        isPlayingRef.current = false;
        currentAudioRef.current = null;
        // Try next chunk anyway
        setTimeout(playNextChunk, 50);
      };

      audio.play().catch(e => {
        console.error('[StreamingVoice] Audio play failed:', e);
        isPlayingRef.current = false;
        playNextChunk();
      });
    } catch (e) {
      console.error('[StreamingVoice] Audio creation error:', e);
      isPlayingRef.current = false;
      playNextChunk();
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
      const response = await fetch('/api/voice/stream-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          voice,
          speed,
          element,
          conversationHistory,
          sessionId: sessionIdRef.current, // Stable session ID for relational stack
        }),
        signal: abortControllerRef.current.signal
      });

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
                  case 'text':
                    setState(prev => ({
                      ...prev,
                      currentText: data.text,
                      sentenceIndex: data.index
                    }));
                    onTextChunk?.(data.text, data.index);
                    break;

                  case 'audio':
                    // Add to queue and start playing if not already
                    audioQueueRef.current.push({
                      index: data.index,
                      audio: data.audio,
                      format: data.format,
                      text: data.text
                    });
                    // Start playback if not already playing
                    if (!isPlayingRef.current) {
                      playNextChunk();
                    }
                    break;

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

                  case 'complete':
                    // Extract relational metadata if present
                    const relationalMeta: RelationalMetadata | null = data.relational ? {
                      maiaMode: data.relational.maiaMode,
                      activation: data.relational.activation,
                      prosodySpeed: data.relational.prosodySpeed,
                    } : null;
                    setState(prev => ({
                      ...prev,
                      isStreaming: false,
                      fullResponse: data.fullResponse,
                      relational: relationalMeta || prev.relational,
                    }));
                    onComplete?.(data.fullResponse, relationalMeta || undefined);
                    break;

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
  }, [voice, element, onTextChunk, onComplete, onError, playNextChunk]);

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

  return {
    ...state,
    sendMessage,
    stop,
    togglePause,
    /** Stable session ID for this conversation (for relational stack continuity) */
    sessionId: sessionIdRef.current,
  };
}
