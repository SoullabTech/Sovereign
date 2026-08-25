import { useState, useCallback, useRef, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { getFeatureFlag } from '@/lib/features/flags';
import { logVoiceEvent, type VoiceDiagEvent } from '@/lib/voice/voiceDiagnostics';

/** Matches the telemetry sink's own metadata shape exactly. */
type V5Meta = Record<string, string | number | boolean | null>;

/**
 * V5 witness emitter — structurally unable to become the defect.
 *
 * `logVoiceEvent` is already throw-safe internally, but this hook sits directly
 * in the recognition and turn-finalization path: if telemetry could throw HERE,
 * an instrument added to explain lost speech would itself destroy a turn. That
 * is the bffa557a lesson — a repair that made field behavior worse. So every
 * emit is wrapped, and the negative-control test mocks logVoiceEvent to throw on
 * every call and asserts recognition and finalization behave identically.
 *
 * Nothing downstream reads the return value; there is no branch on telemetry.
 */
function emitV5(event: VoiceDiagEvent, metadata: V5Meta): void {
  try {
    logVoiceEvent(event, metadata);
  } catch {
    // Never. An instrument that can break the thing it observes is not an
    // instrument.
  }
}
// Native recorder for iOS (bypasses WKWebView audio issues)
import {
  isNativeApp,
  startNativeRecording,
  stopNativeRecording,
  ensureNativeMicPermission,
  canRecordNative,
  getPermissionErrorMessage
} from '@/lib/voice/capacitorRecorder';

/**
 * Get the API base URL for transcription requests.
 * In Capacitor, window.location.origin is capacitor://localhost which doesn't work.
 * We need to use the actual server URL.
 */
function getApiBaseUrl(): string {
  // Server-side: return empty (relative URLs work)
  if (typeof window === 'undefined') return '';

  const origin = window.location.origin || '';

  // Check if we're in Capacitor (capacitor://, file://, or localhost without port)
  const isCapacitorOrigin =
    origin.startsWith('capacitor://') ||
    origin.startsWith('file://') ||
    origin === 'http://localhost' ||
    origin === 'https://localhost';

  if (isCapacitorOrigin) {
    // Use explicit production URL for Capacitor builds
    // This is set at build time via NEXT_PUBLIC_API_BASE_URL or NEXT_PUBLIC_SITE_URL
    const envBase =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'https://soullab.life'; // Fallback to production

    console.log('🎤 [VOICE-DIAG] Using Capacitor API base:', envBase);
    return envBase;
  }

  // Web: use same-origin (relative URLs work)
  return '';
}

interface UseVoiceInputOptions {
  onResult: (transcript: string, isFinal: boolean) => void;
  onAutoStop?: (finalTranscript: string) => void;
  onError?: (error: string) => void;
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  silenceTimeoutMs?: number;
  minSpeechLengthChars?: number;
}

interface UseVoiceInputReturn {
  isRecording: boolean;
  isSupported: boolean;
  isTranscribing: boolean; // NEW: indicates audio is being transcribed
  transcript: string;
  confidence: number;
  error: string | null;
  permissionStatus: 'unknown' | 'granted' | 'denied' | 'prompt';
  startRecording: () => void;
  stopRecording: () => void;
  resetTranscript: () => void;
  requestPermission: () => Promise<boolean>;
}

export function useVoiceInput({
  onResult,
  onAutoStop,
  onError,
  continuous = true,
  interimResults = true,
  language = 'en-US',
  silenceTimeoutMs = 1200,
  minSpeechLengthChars = 3
}: UseVoiceInputOptions): UseVoiceInputReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const finalTranscriptRef = useRef<string>('');
  const lastSpeechTimeRef = useRef<number>(0);
  const isNativeRef = useRef<boolean>(false);
  const recordingStartTimeRef = useRef<number>(0);

  // ── V5 witness state ──────────────────────────────────────────────────
  // Observation only. NOTHING in the recognition or commit path branches on
  // any of these; they are written and read exclusively by emitV5 call sites.
  const lastResultAtRef = useRef<number>(0);
  const lastInterimAtRef = useRef<number>(0);
  const lastFinalAtRef = useRef<number>(0);
  // The timer closure cannot see `interimTranscript` — it is a local `let`
  // inside onresult. This ref is how the FIRED event can report whether fresh
  // interim speech existed at the moment the turn committed, which is the
  // difference between ordering C/D and ordering E/F.
  const lastInterimCharsRef = useRef<number>(0);
  const timerArmedAtRef = useRef<number>(0);
  const timerDeadlineAtRef = useRef<number>(0);
  const turnCommitIdRef = useRef<number>(0);
  const committedRef = useRef<boolean>(false);

  // The recognition handlers are built ONCE at setup, so reading `isRecording`
  // or `isTranscribing` inside them would report the values captured at build
  // time — permanently false, and misleading telemetry is worse than none.
  // Mirrored at render, matching the callback-ref convention already used below.
  const isRecordingRef = useRef<boolean>(false);
  const isTranscribingRef = useRef<boolean>(false);
  isRecordingRef.current = isRecording;
  isTranscribingRef.current = isTranscribing;

  // ──────────────────────────────────────────────────────────────────────
  // Callback identity stability.
  //
  // Every consumer passes these as inline arrow literals, so they are a NEW
  // function on every render. They used to sit in the setup effect's dependency
  // array, which meant the effect re-ran on EVERY RENDER and its cleanup called
  // `recognition.abort()` on the live instance.
  //
  // While dictating, interim results update state, which re-renders, which
  // aborted the very recognition object producing them — destroying voice input
  // mid-sentence and surfacing "Voice recognition error: aborted" as if the
  // member had done something wrong. The abort was real, and we caused it.
  //
  // Holding them in refs lets the effect depend only on actual CONFIGURATION,
  // so the recognition object is built once and survives rendering.
  // ──────────────────────────────────────────────────────────────────────
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const onAutoStopRef = useRef(onAutoStop);
  onAutoStopRef.current = onAutoStop;

  useEffect(() => {
    const isNative = Capacitor.isNativePlatform();
    isNativeRef.current = isNative;

    // Native iOS/Android: Use native voice recorder (bypasses WKWebView issues)
    if (isNative) {
      console.log('🎤 Using native voice recorder (capacitor-voice-recorder)');

      const initNative = async () => {
        try {
          // Check if native recording is available and get permission status
          const { available, status } = await canRecordNative();
          console.log('🎤 Native recorder available:', available, 'status:', status);

          // Native recorder is always "supported" on iOS/Android
          setIsSupported(true);

          if (status === 'GRANTED') {
            setPermissionStatus('granted');
          } else if (status === 'DENIED' || status === 'DISABLED_BY_USER') {
            setPermissionStatus('denied');
          } else {
            setPermissionStatus('prompt');
          }

          console.log('🎤 Native voice recorder init complete');
        } catch (err) {
          console.error('🎤 Native init error:', err);
          // Assume supported, let startRecording handle permission request
          setIsSupported(true);
          setPermissionStatus('prompt');
        }
      };

      initNative();
      return;
    }

    // Web: Use browser Speech Recognition API
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.lang = language;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsRecording(true);
          setError(null);
          console.log('Voice recognition started');
          // Witness state resets with the session so `resultAfterCommit` cannot
          // leak across turns. Observation only.
          committedRef.current = false;
          lastInterimCharsRef.current = 0;
          timerArmedAtRef.current = 0;
          timerDeadlineAtRef.current = 0;
        };

        recognition.onresult = (event) => {
          let interimTranscript = '';
          let currentConfidence = 0;
          let hasFinalResult = false;

          // Process all results
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result[0]) {
              const resultText = result[0].transcript;
              currentConfidence = Math.max(currentConfidence, result[0].confidence || 0);

              if (result.isFinal) {
                finalTranscriptRef.current += resultText + ' ';
                hasFinalResult = true;
                lastSpeechTimeRef.current = Date.now();
              } else {
                interimTranscript += resultText;
                lastSpeechTimeRef.current = Date.now();
              }
            }
          }

          // Combine final and interim text for display
          const fullTranscript = (finalTranscriptRef.current + interimTranscript).trim();
          setTranscript(fullTranscript);
          setConfidence(currentConfidence);
          onResultRef.current(fullTranscript, hasFinalResult);

          // ── V5 witness ──────────────────────────────────────────────────
          // Emitted AFTER the existing handling so nothing above can be delayed
          // by telemetry. Pure reads and ref writes; no branch below depends on
          // any of it.
          {
            const now = Date.now();
            const base: V5Meta = {
              resultIndex: event.resultIndex,
              resultCount: event.results.length,
              interimCharCount: interimTranscript.length,
              finalCharCount: finalTranscriptRef.current.length,
              msSinceLastResult: lastResultAtRef.current ? now - lastResultAtRef.current : -1,
              msSinceLastInterim: lastInterimAtRef.current ? now - lastInterimAtRef.current : -1,
              msSinceLastFinal: lastFinalAtRef.current ? now - lastFinalAtRef.current : -1,
              timerAgeMs: timerArmedAtRef.current ? now - timerArmedAtRef.current : -1,
              timerDeadlineMs: timerDeadlineAtRef.current ? timerDeadlineAtRef.current - now : -1,
              recognitionActive: recognitionRef.current !== null,
              speechActive: interimTranscript.length > 0,
              isListening: isRecordingRef.current,
              isProcessing: isTranscribingRef.current,
              turnCommitId: turnCommitIdRef.current,
              resultAfterCommit: committedRef.current,
            };

            // Ordering F: the browser handed us a result AFTER we submitted the
            // turn. Observed, never inferred from words a member reports missing.
            if (committedRef.current) emitV5('voice_result_after_commit', base);

            if (hasFinalResult) emitV5('voice_result_final', base);
            if (interimTranscript.length > 0) emitV5('voice_result_interim', base);

            lastResultAtRef.current = now;
            if (hasFinalResult) lastFinalAtRef.current = now;
            if (interimTranscript.length > 0) lastInterimAtRef.current = now;
            lastInterimCharsRef.current = interimTranscript.length;
          }

          // Clear existing silence timeout
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
          }

          // Set new silence timeout for auto-stop
          if (continuous && (hasFinalResult || interimTranscript)) {
            // ── V5 witness: ARMED ────────────────────────────────────────
            // Note what arms this and what commits it: the condition includes
            // `interimTranscript`, but the callback below submits
            // `finalTranscriptRef` ALONE. Interim speech can therefore arm a
            // timer that will not carry it. Whether that actually costs a
            // member their words is what the FIRED event is here to establish
            // — this unit observes it, it does not change it.
            timerArmedAtRef.current = Date.now();
            timerDeadlineAtRef.current = timerArmedAtRef.current + silenceTimeoutMs;
            emitV5('voice_silence_timer_armed', {
              armedByFinal: hasFinalResult,
              armedByInterim: interimTranscript.length > 0,
              interimCharCount: interimTranscript.length,
              finalCharCount: finalTranscriptRef.current.length,
              silenceTimeoutMs,
              timerDeadlineMs: silenceTimeoutMs,
              turnCommitId: turnCommitIdRef.current,
            });

            silenceTimeoutRef.current = setTimeout(() => {
              const finalText = finalTranscriptRef.current.trim();

              // ── V5 witness: FIRED ──────────────────────────────────────
              // `interimCharCountAtFire` is the whole point. The timer closure
              // cannot see `interimTranscript` (a local `let` in onresult), so
              // without this ref there is no way to tell ordering D — timer
              // fired while fresh interim speech existed — from a clean commit.
              const firedAt = Date.now();
              emitV5('voice_silence_timer_fired', {
                timerAgeMs: timerArmedAtRef.current ? firedAt - timerArmedAtRef.current : -1,
                interimCharCountAtFire: lastInterimCharsRef.current,
                finalCharCount: finalTranscriptRef.current.length,
                committableCharCount: finalText.length,
                minSpeechLengthChars,
                willCommit: finalText.length >= minSpeechLengthChars,
                msSinceLastInterim: lastInterimAtRef.current ? firedAt - lastInterimAtRef.current : -1,
                msSinceLastFinal: lastFinalAtRef.current ? firedAt - lastFinalAtRef.current : -1,
                turnCommitId: turnCommitIdRef.current,
              });

              if (finalText.length >= minSpeechLengthChars) {
                emitV5('voice_turn_commit_requested', {
                  turnCommitId: turnCommitIdRef.current + 1,
                  finalCharCount: finalText.length,
                  interimCharCountAtCommit: lastInterimCharsRef.current,
                  recognitionActive: recognitionRef.current !== null,
                  isListening: isRecordingRef.current,
                });

                console.log(`🎤 Auto-stopping after ${silenceTimeoutMs}ms silence`);
                recognition.stop();
                onAutoStopRef.current?.(finalText);

                // Set AFTER the real work, so a throw in telemetry could never
                // sit between stop() and the submit callback.
                turnCommitIdRef.current += 1;
                committedRef.current = true;
                emitV5('voice_turn_committed', {
                  turnCommitId: turnCommitIdRef.current,
                  finalCharCount: finalText.length,
                  interimCharCountAtCommit: lastInterimCharsRef.current,
                  commitLatencyMs: Date.now() - firedAt,
                });
              }
            }, silenceTimeoutMs);
          }

          // Auto-stop after getting final result (for non-continuous mode)
          if (hasFinalResult && !continuous) {
            recognition.stop();
          }
        };

        recognition.onerror = (event) => {
          // ──────────────────────────────────────────────────────────────
          // Routine lifecycle events are NOT errors and must never be shown.
          //
          // `aborted` fires every single turn: we abort recognition while MAIA
          // speaks, to stop her voice feeding back into the mic. Surfacing it
          // put a red "Voice recognition error: aborted" under the message box
          // during normal, healthy operation (reported repeatedly from macOS
          // Safari). Crying wolf on an expected event is worse than silence —
          // it teaches members that the error line means nothing, so the one
          // message that DOES matter gets ignored too.
          //
          // `no-speech` is likewise routine in continuous mode: it is what the
          // browser says after any ordinary pause for thought.
          // ──────────────────────────────────────────────────────────────
          const benign =
            event.error === 'aborted' || (event.error === 'no-speech' && continuous);
          if (benign) {
            console.log(`[voice] Routine recognition event (${event.error}) — not surfaced`);
            setIsRecording(false);
            return;
          }

          let errorMessage = 'Voice recognition error';

          switch (event.error) {
            case 'no-speech':
              errorMessage = 'No speech detected. Please try again.';
              break;
            case 'audio-capture':
              errorMessage = 'Microphone not accessible. Please check permissions.';
              break;
            case 'not-allowed':
              errorMessage = 'Microphone permission denied.';
              break;
            case 'network':
              errorMessage = 'Network error during voice recognition.';
              break;
            case 'service-not-allowed':
              errorMessage = 'Voice recognition service not available.';
              break;
            case 'bad-grammar':
              errorMessage = 'Grammar error in voice recognition.';
              break;
            case 'language-not-supported':
              errorMessage = `Language "${language}" not supported.`;
              break;
            default:
              // Never show a raw API error code to a member — it names an
              // internal state they cannot act on. Say what it means for them.
              errorMessage = 'Voice input stopped unexpectedly. Tap the mic to try again.';
          }

          console.error('Speech recognition error:', event.error);
          setError(errorMessage);
          setIsRecording(false);
          onErrorRef.current?.(errorMessage);
        };

        recognition.onend = () => {
          setIsRecording(false);
          console.log('Voice recognition ended');
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  // Configuration only. Callbacks are reached through refs above — including
  // them here rebuilt the recognition object on every render (see note above).
  }, [continuous, interimResults, language]);

  // Request permission explicitly (for UI to call)
  const requestPermission = useCallback(async (): Promise<boolean> => {
    // Feature flag gate: VOICE_V2 must be enabled
    if (!getFeatureFlag('VOICE_V2')) {
      console.log('🎤 [VOICE_V2] Feature flag disabled, skipping permission request');
      return false;
    }

    if (!isNativeRef.current) {
      // Web: permission is requested when starting recognition
      return true;
    }

    try {
      console.log('🎤 Requesting microphone permission...');
      await ensureNativeMicPermission();
      console.log('🎤 Permission granted!');
      setPermissionStatus('granted');
      setError(null);
      return true;
    } catch (err: any) {
      console.error('🎤 Permission request error:', err);
      const status = err?.message?.replace('MIC_PERMISSION_', '') || 'DENIED';
      setPermissionStatus('denied');
      setError(getPermissionErrorMessage(status as any));
      return false;
    }
  }, []);

  // Helper to stop native recording and transcribe the audio
  // Defined before startRecording because startRecording references it in setTimeout
  const stopRecordingAndTranscribe = useCallback(async () => {
    if (!isNativeRef.current) return;

    console.log('🎤 [VOICE-DIAG] stopRecordingAndTranscribe called. isNative:', isNativeRef.current);

    try {
      // Stop recording and get audio blob
      const { blob, mimeType, durationMs } = await stopNativeRecording();
      setIsRecording(false);

      // Show transcribing state
      setIsTranscribing(true);
      console.log('🎤 Recording stopped. Duration:', durationMs, 'ms. Sending for transcription...');

      // Skip transcription for very short recordings (< 300ms)
      if (durationMs && durationMs < 300) {
        console.log('🎤 Recording too short, skipping transcription');
        setIsTranscribing(false);
        return;
      }

      // Send to transcription endpoint
      const formData = new FormData();
      const fileName = `recording.${mimeType === 'audio/wav' ? 'wav' : 'webm'}`;
      formData.append('file', blob, fileName);

      // Build absolute endpoint URL (required for Capacitor where origin is capacitor://localhost)
      const apiBase = getApiBaseUrl();
      const endpoint = `${apiBase}/api/voice/transcribe-simple`;

      console.log('🎤 [VOICE-DIAG] Sending to transcription endpoint:', {
        endpoint,
        apiBase: apiBase || '(same-origin)',
        fileName,
        blobSize: blob.size,
        blobType: blob.type
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      console.log('🎤 [VOICE-DIAG] Transcription response status:', response.status, response.statusText);

      setIsTranscribing(false);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error('🎤 [VOICE-DIAG] Transcription failed:', errData);
        throw new Error(errData.error || 'Transcription failed');
      }

      const data = await response.json();
      console.log('🎤 [VOICE-DIAG] Transcription result:', {
        hasTranscription: !!data.transcription,
        transcriptionLength: data.transcription?.length || 0,
        success: data.success,
        source: data.source
      });
      const transcribedText = data.transcription?.trim() || '';

      if (transcribedText) {
        console.log('🎤 Transcription received:', transcribedText.length, 'chars');
        setTranscript(transcribedText);
        setConfidence(data.confidence || 0.9);
        finalTranscriptRef.current = transcribedText;

        // Notify callbacks with final result
        onResult(transcribedText, true);
        onAutoStop?.(transcribedText);
      } else {
        console.log('🎤 No transcription returned');
        setError('No speech detected. Please try again.');
      }

    } catch (error: any) {
      console.error('🎤 Stop/transcribe error:', error);
      setIsRecording(false);
      setIsTranscribing(false);
      setError(error?.message || 'Failed to process voice recording');
      onError?.(error?.message || 'VOICE_TRANSCRIBE_FAILED');
    }
  }, [onResult, onAutoStop, onError]);

  const startRecording = useCallback(async () => {
    // Feature flag gate: VOICE_V2 must be enabled
    if (!getFeatureFlag('VOICE_V2')) {
      const errorMsg = 'Voice is disabled in this build';
      console.log('🎤 [VOICE_V2] Feature flag disabled, blocking startRecording');
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    if (!isSupported) {
      const errorMsg = 'Voice recording not supported on this device';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    // Native iOS/Android: Use native voice recorder
    // This bypasses WKWebView audio issues on iOS
    if (isNativeRef.current) {
      console.log('🎤 [VOICE-DIAG] Starting NATIVE voice recorder (not WKWebView). Platform:',
        typeof window !== 'undefined' ? (window as any).Capacitor?.getPlatform() : 'unknown');

      try {
        // Clear previous state
        setTranscript('');
        setConfidence(0);
        setError(null);
        finalTranscriptRef.current = '';

        // Start native recording (handles permission internally)
        await startNativeRecording();

        // Only set recording state AFTER successful start
        recordingStartTimeRef.current = Date.now();
        setIsRecording(true);
        setPermissionStatus('granted');
        console.log('🎤 Native recording started successfully!');

        // Set max recording timeout (30 seconds)
        timeoutRef.current = setTimeout(async () => {
          console.log('🎤 Max timeout (30s) reached, auto-stopping...');
          // Will trigger stopRecording which handles transcription
          await stopRecordingAndTranscribe();
        }, 30000);

      } catch (error: any) {
        console.error('🎤 Failed to start native recording:', error);
        setIsRecording(false);

        // Parse permission errors
        if (error?.message?.startsWith('MIC_PERMISSION_')) {
          const status = error.message.replace('MIC_PERMISSION_', '');
          setPermissionStatus('denied');
          setError(getPermissionErrorMessage(status as any));
        } else {
          setError(error?.message || 'Failed to start voice recording');
        }
        onError?.(error?.message || 'VOICE_START_FAILED');
      }
      return;
    }

    // Web: Use browser API
    if (!recognitionRef.current || isRecording) return;

    try {
      setTranscript('');
      setConfidence(0);
      setError(null);
      finalTranscriptRef.current = '';
      lastSpeechTimeRef.current = Date.now();
      recognitionRef.current.start();

      // Set a timeout to automatically stop recording after 30 seconds
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current && isRecording) {
          recognitionRef.current.stop();
        }
      }, 30000);

    } catch (error) {
      console.error('Failed to start recognition:', error);
      setError('Failed to start voice recording');
      onError?.('Failed to start voice recording');
    }
  }, [isSupported, isRecording, onError, stopRecordingAndTranscribe]);

  const stopRecording = useCallback(async () => {
    // Clear any pending timeouts first
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    // Native: Stop recording and transcribe
    if (isNativeRef.current) {
      await stopRecordingAndTranscribe();
      return;
    }

    // Web: Use browser API
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  }, [isRecording, stopRecordingAndTranscribe]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setConfidence(0);
    setError(null);
    finalTranscriptRef.current = '';
    lastSpeechTimeRef.current = 0;
  }, []);

  return {
    isRecording,
    isSupported,
    isTranscribing,
    transcript,
    confidence,
    error,
    permissionStatus,
    startRecording,
    stopRecording,
    resetTranscript,
    requestPermission
  };
}