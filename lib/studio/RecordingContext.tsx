'use client';

/**
 * RecordingContext — Global recording state for Studio Session Room
 *
 * Lives at the layout level so recording persists when navigating
 * between Studio pages. Manages:
 *   - Dual audio capture (mic + tab audio via getDisplayMedia)
 *   - SSE stream for live transcript + insights
 *   - Session lifecycle (start / stop / pause / resume)
 *   - Markers and MAIA prompts
 */

import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { apiUrl, apiFetch } from '@/lib/http/apiBase';
import { findFirstClusterOffset } from '@/lib/voice/webmInit';

// ---------------------------------------------------------------------------
// Types (shared with Session Room page)
// ---------------------------------------------------------------------------

export type SessionContainer = 'solo' | 'witness' | 'practitioner';
export type MemoryPolicy = 'sealed' | 'learning';
export type RecordingPhase = 'idle' | 'recording' | 'review';
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export interface TranscriptSegment {
  id: string;
  speaker: string;
  startMs: number;
  endMs: number;
  text: string;
  confidence?: number;
}

export interface LiveInsight {
  id: string;
  insightType: string;
  content: string;
  significance?: number;
  timeRangeStartMs?: number;
  createdAt: string;
}

export interface SessionMarker {
  id: string;
  markerType: string;
  note?: string;
  tsMs: number;
  createdAt: string;
}

export interface LivePromptExchange {
  id: string;
  prompt: string;
  response: string;
  createdAt: string;
}

export interface StartSessionConfig {
  container: SessionContainer;
  memoryPolicy: MemoryPolicy;
  title?: string;
  captureTabAudio?: boolean;
  bookingId?: string;
}

export interface AudioLevels {
  mic: number;
  tab: number;
  combined: number;
}

// ---------------------------------------------------------------------------
// Context interface
// ---------------------------------------------------------------------------

interface RecordingContextValue {
  // Phase & session
  phase: RecordingPhase;
  sessionId: string | null;
  scribeSessionId: string | null;
  bookingId: string | null;
  container: SessionContainer;
  memoryPolicy: MemoryPolicy;
  sessionTitle: string;

  // Recording state
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioLevels: AudioLevels;
  connectionStatus: ConnectionStatus;
  hasTabAudio: boolean;

  // Live data
  segments: TranscriptSegment[];
  insights: LiveInsight[];
  markers: SessionMarker[];
  maiaExchanges: LivePromptExchange[];

  // Actions
  startSession: (config: StartSessionConfig) => Promise<void>;
  stopSession: () => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  addMarker: (markerType: string, note?: string) => Promise<void>;
  sendMaiaPrompt: (text: string) => Promise<LivePromptExchange | null>;
  resetSession: () => void;
}

const RecordingContext = createContext<RecordingContextValue | null>(null);

export function useRecordingContext() {
  const ctx = useContext(RecordingContext);
  if (!ctx) {
    throw new Error('useRecordingContext must be used within RecordingContextProvider');
  }
  return ctx;
}

/** Check if there's an active recording (safe to call outside provider) */
export function useRecordingActive() {
  const ctx = useContext(RecordingContext);
  return ctx?.isRecording ?? false;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function RecordingContextProvider({ children }: { children: ReactNode }) {
  // Phase
  const [phase, setPhase] = useState<RecordingPhase>('idle');
  const [container, setContainer] = useState<SessionContainer>('solo');
  const [memoryPolicy, setMemoryPolicy] = useState<MemoryPolicy>('sealed');
  const [sessionTitle, setSessionTitle] = useState('');

  // Session IDs
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [scribeSessionId, setScribeSessionId] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Recording state
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioLevels, setAudioLevels] = useState<AudioLevels>({ mic: 0, tab: 0, combined: 0 });
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [hasTabAudio, setHasTabAudio] = useState(false);

  // Live data
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [insights, setInsights] = useState<LiveInsight[]>([]);
  const [markers, setMarkers] = useState<SessionMarker[]>([]);
  const [maiaExchanges, setMaiaExchanges] = useState<LivePromptExchange[]>([]);

  // Refs (persist across renders, survive navigation because context survives)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const tabStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const tabAnalyserRef = useRef<AnalyserNode | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const startTimeRef = useRef(0);
  const sessionIdRef = useRef<string | null>(null);
  const scribeSessionIdRef = useRef<string | null>(null);
  const bookingIdRef = useRef<string | null>(null);
  const containerRef = useRef<SessionContainer>('solo');
  const isRecordingRef = useRef(false);
  const chunkIndexRef = useRef(0);
  const chunkStartTimeRef = useRef(0);
  // WebM init segment (first chunk contains container headers; must be prepended
  // to all subsequent chunks so Whisper receives a decodable file each time)
  const webmInitChunkRef = useRef<Blob | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const levelAnimationRef = useRef<number | null>(null);

  const isRecording = phase === 'recording';

  // Keep refs in sync
  useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);
  useEffect(() => { scribeSessionIdRef.current = scribeSessionId; }, [scribeSessionId]);
  useEffect(() => { bookingIdRef.current = bookingId; }, [bookingId]);
  useEffect(() => { containerRef.current = container; }, [container]);

  // ── Audio level analysis ────────────────────────────────────────────────

  const analyzeAudioLevels = useCallback(() => {
    const getLevelFromAnalyser = (analyser: AnalyserNode | null): number => {
      if (!analyser) return 0;
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
      return Math.min(1, Math.sqrt(sum / data.length) / 128);
    };

    const mic = getLevelFromAnalyser(micAnalyserRef.current);
    const tab = getLevelFromAnalyser(tabAnalyserRef.current);
    const combined = Math.min(1, Math.max(mic, tab));
    setAudioLevels({ mic, tab, combined });

    if (isRecordingRef.current) {
      levelAnimationRef.current = requestAnimationFrame(analyzeAudioLevels);
    }
  }, []);

  // ── SSE stream ──────────────────────────────────────────────────────────

  const connectToStream = useCallback((sid: string) => {
    setConnectionStatus('connecting');
    const url = apiUrl(`/api/supervision/scribe?sessionId=${sid}`);
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => setConnectionStatus('connected');

    es.addEventListener('transcript', (e) => {
      const data = JSON.parse(e.data);
      if (data.segments?.length) {
        setSegments(prev => {
          const newSegs = data.segments.filter(
            (s: TranscriptSegment) => !prev.find(p => p.id === s.id)
          );
          return [...prev, ...newSegs];
        });
      }
    });

    es.addEventListener('insights', (e) => {
      const data = JSON.parse(e.data);
      if (data.insights?.length) {
        setInsights(prev => {
          const newInsights = data.insights.filter(
            (i: LiveInsight) => !prev.find(p => p.id === i.id)
          );
          return [...prev, ...newInsights];
        });
      }
    });

    es.addEventListener('session_ended', () => setConnectionStatus('disconnected'));

    es.onerror = () => {
      setConnectionStatus('disconnected');
      setTimeout(() => {
        if (isRecordingRef.current && sessionIdRef.current) {
          connectToStream(sessionIdRef.current);
        }
      }, 3000);
    };
  }, []);

  // ── Audio capture setup ─────────────────────────────────────────────────

  const setupAudioCapture = useCallback(async (captureTabAudio: boolean) => {
    // 1. Get microphone
    const micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    micStreamRef.current = micStream;

    // 2. Optionally get tab audio
    let tabStream: MediaStream | null = null;
    if (captureTabAudio) {
      try {
        tabStream = await navigator.mediaDevices.getDisplayMedia({
          video: false,
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        } as DisplayMediaStreamOptions);
        tabStreamRef.current = tabStream;
        setHasTabAudio(true);

        // Handle tab stream ending (user stops sharing)
        tabStream.getAudioTracks()[0]?.addEventListener('ended', () => {
          console.log('[RecordingContext] Tab audio track ended');
          setHasTabAudio(false);
        });
      } catch (err) {
        console.warn('[RecordingContext] Tab audio not available:', err);
        setHasTabAudio(false);
      }
    }

    // 3. Setup AudioContext and merge streams
    const ctx = new AudioContext({ sampleRate: 16000 });
    audioContextRef.current = ctx;

    // Mic analyser
    const micAnalyser = ctx.createAnalyser();
    micAnalyser.fftSize = 256;
    micAnalyser.smoothingTimeConstant = 0.8;
    micAnalyserRef.current = micAnalyser;
    const micSource = ctx.createMediaStreamSource(micStream);
    micSource.connect(micAnalyser);

    // Merged destination for recording
    const destination = ctx.createMediaStreamDestination();
    micSource.connect(destination);

    // Tab analyser + merge
    if (tabStream && tabStream.getAudioTracks().length > 0) {
      const tabAnalyser = ctx.createAnalyser();
      tabAnalyser.fftSize = 256;
      tabAnalyser.smoothingTimeConstant = 0.8;
      tabAnalyserRef.current = tabAnalyser;
      const tabSource = ctx.createMediaStreamSource(tabStream);
      tabSource.connect(tabAnalyser);
      tabSource.connect(destination);
    }

    // 4. Setup MediaRecorder on merged stream
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : 'audio/mp4';

    const recorder = new MediaRecorder(destination.stream, {
      mimeType,
      audioBitsPerSecond: 128000,
    });
    mediaRecorderRef.current = recorder;

    return recorder;
  }, []);

  // ── Session lifecycle ───────────────────────────────────────────────────

  const startSession = useCallback(async (config: StartSessionConfig) => {
    const title = config.title?.trim() || `Session — ${new Date().toLocaleDateString()}`;

    try {
      // 1. Create scribe session
      const scribeResp = await apiFetch('/api/scribe/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          container: config.container,
          memoryPolicy: config.memoryPolicy,
          ...(config.bookingId ? { bookingId: config.bookingId } : {}),
        }),
      });
      const scribeData = await scribeResp.json();
      if (!scribeData.success || !scribeData.session?.id) {
        console.error('[RecordingContext] Failed to create scribe session:', scribeData);
        return;
      }
      const newScribeSessionId = scribeData.session.id;

      // 2. Confirm consent
      await apiFetch('/api/scribe/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: newScribeSessionId, confirmed: true, method: 'tap' }),
      });

      // 3. Create supervision/audio session
      const response = await apiFetch('/api/supervision/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionType: 'live_scribe',
          title,
          metadata: {
            captureMode: 'chunked',
            source: 'studio_session_room',
            container: config.container,
            scribeSessionId: newScribeSessionId,
            hasTabAudio: config.captureTabAudio ?? false,
          },
        }),
      });
      const data = await response.json();
      if (!data.success || !data.session?.id) {
        console.error('[RecordingContext] Failed to create audio session:', data);
        return;
      }

      const audioSessionId = data.session.id;

      // 4. Setup audio capture
      const recorder = await setupAudioCapture(config.captureTabAudio ?? false);

      // 5. Wire chunk handler
      chunkIndexRef.current = 0;
      webmInitChunkRef.current = null;
      startTimeRef.current = Date.now();
      chunkStartTimeRef.current = Date.now();

      recorder.ondataavailable = async (event) => {
        if (event.data.size === 0 || !sessionIdRef.current) return;

        const endMs = Date.now() - startTimeRef.current;
        const startMs = chunkStartTimeRef.current - startTimeRef.current;
        chunkStartTimeRef.current = Date.now();
        const idx = chunkIndexRef.current++;

        // The first chunk from MediaRecorder contains the WebM EBML/Segment header
        // (codec info, stream metadata) followed by the first Cluster of audio data.
        // Subsequent chunks are Cluster fragments with no header, which Whisper cannot
        // decode standalone. We need to prepend the header bytes — NOT the first
        // chunk's audio — to every non-first chunk.
        //
        // Storing the full first chunk (header + 5s of audio) and prepending it to
        // every later chunk causes Whisper to re-transcribe that audio on every
        // chunk, producing phantom-prefix segments that contaminate the continuity
        // field. Extract bytes before the first Cluster element (ID 0x1F43B675) so
        // only header bytes are prepended.
        if (idx === 0) {
          const firstBuf = new Uint8Array(await event.data.arrayBuffer());
          const clusterOffset = findFirstClusterOffset(firstBuf);
          webmInitChunkRef.current = clusterOffset > 0
            ? new Blob([firstBuf.slice(0, clusterOffset)], { type: event.data.type })
            : event.data; // fallback: Cluster ID not found, keep prior behavior
        }
        const initPrepended = idx > 0 && !!webmInitChunkRef.current;
        const audioToSend = (idx === 0 || !webmInitChunkRef.current)
          ? event.data
          : new Blob([webmInitChunkRef.current, event.data], { type: event.data.type });

        console.log(
          `[RecordingContext] chunk #${idx} raw=${(event.data.size / 1024).toFixed(1)}kb` +
          ` sent=${(audioToSend.size / 1024).toFixed(1)}kb initPrepended=${initPrepended}`
        );

        const formData = new FormData();
        formData.append('sessionId', sessionIdRef.current);
        formData.append('audio', audioToSend, `chunk_${idx}.webm`);
        formData.append('chunkIndex', String(idx));
        formData.append('startMs', String(startMs));
        formData.append('endMs', String(endMs));
        formData.append('speaker', 'Speaker 1');
        formData.append('chunkIndex', String(idx));

        try {
          await apiFetch('/api/supervision/transcript/stream', {
            method: 'POST',
            body: formData,
          });
        } catch (err) {
          console.error(`[RecordingContext] Chunk #${idx} upload failed:`, err);
        }
      };

      // 6. Start recording (5s chunks)
      recorder.start(5000);

      // 7. Update state
      setSessionId(audioSessionId);
      setScribeSessionId(newScribeSessionId);
      setBookingId(config.bookingId || null);
      setContainer(config.container);
      setMemoryPolicy(config.memoryPolicy);
      setSessionTitle(title);
      setSegments([]);
      setInsights([]);
      setMarkers([]);
      setMaiaExchanges([]);
      setIsPaused(false);
      setDuration(0);
      setPhase('recording');

      // 8. Start duration counter
      durationIntervalRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

      // 9. Start audio level monitoring
      analyzeAudioLevels();

      // 10. Connect SSE
      connectToStream(audioSessionId);

      console.log('[RecordingContext] Session started:', {
        scribeSessionId: newScribeSessionId,
        audioSessionId,
        container: config.container,
        tabAudio: config.captureTabAudio,
      });
    } catch (err) {
      console.error('[RecordingContext] Failed to start session:', err);
      throw err;
    }
  }, [setupAudioCapture, connectToStream, analyzeAudioLevels]);

  const stopSession = useCallback(async () => {
    const sid = sessionIdRef.current;
    if (!sid) return;

    // Stop recorder
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop();
    }

    // Stop audio tracks
    micStreamRef.current?.getTracks().forEach(t => t.stop());
    tabStreamRef.current?.getTracks().forEach(t => t.stop());

    // Close audio context
    audioContextRef.current?.close().catch(() => {});

    // Cancel animation frame
    if (levelAnimationRef.current) cancelAnimationFrame(levelAnimationRef.current);
    levelAnimationRef.current = null;

    // Clear intervals
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    durationIntervalRef.current = null;

    // Close SSE
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Notify server — supervision session
    try {
      await apiFetch('/api/supervision/session/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sid,
          triggerAnalysis: true,
          totalDurationMs: duration * 1000,
        }),
      });
    } catch (err) {
      console.error('[RecordingContext] Failed to stop supervision session on server:', err);
    }

    // Also close the scribe session (sets ended_at + is_active = false)
    const scribeId = scribeSessionIdRef.current;
    if (scribeId) {
      try {
        await apiFetch('/api/scribe/stop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: scribeId }),
        });
        console.log('[RecordingContext] Scribe session closed:', scribeId);
      } catch (err) {
        console.error('[RecordingContext] Failed to stop scribe session:', err);
      }
    }

    // Write back to booking (practitioner sessions only)
    const currentBookingId = bookingIdRef.current;
    const currentContainer = containerRef.current;
    const currentScribeSessionId = scribeSessionIdRef.current;
    if (currentContainer === 'practitioner' && currentBookingId && currentScribeSessionId) {
      try {
        const segCount = segments.length;
        const markerCount = markers.length;
        const insightCount = insights.length;
        const durMins = Math.ceil(duration / 60);
        const topMarkers = markers.slice(0, 3).map(m => m.markerType.replace(/_/g, ' ')).join(', ');

        const summary = [
          `Session Room recording: ${durMins}min`,
          segCount > 0 ? `${segCount} transcript segments` : null,
          markerCount > 0 ? `${markerCount} markers (${topMarkers})` : null,
          insightCount > 0 ? `${insightCount} insights` : null,
        ].filter(Boolean).join(' · ');

        await apiFetch('/api/studio/bookings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: currentBookingId,
            status: 'completed',
            practitionerNotes: summary,
            scribeSessionId: currentScribeSessionId,
          }),
        });
        console.log('[RecordingContext] Booking updated:', currentBookingId);
      } catch (err) {
        console.error('[RecordingContext] Failed to update booking:', err);
      }
    }

    // Reset refs
    mediaRecorderRef.current = null;
    micStreamRef.current = null;
    tabStreamRef.current = null;
    audioContextRef.current = null;
    micAnalyserRef.current = null;
    tabAnalyserRef.current = null;

    setConnectionStatus('disconnected');
    setAudioLevels({ mic: 0, tab: 0, combined: 0 });
    setHasTabAudio(false);
    setPhase('review');

    console.log('[RecordingContext] Session stopped');
  }, [duration, segments, markers, insights]);

  const pauseSession = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (levelAnimationRef.current) cancelAnimationFrame(levelAnimationRef.current);
    }
  }, []);

  const resumeSession = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      analyzeAudioLevels();
    }
  }, [analyzeAudioLevels]);

  const resetSession = useCallback(() => {
    setSessionId(null);
    setScribeSessionId(null);
    setBookingId(null);
    setSessionTitle('');
    setSegments([]);
    setInsights([]);
    setMarkers([]);
    setMaiaExchanges([]);
    setPhase('idle');
  }, []);

  // ── Markers ─────────────────────────────────────────────────────────────

  const addMarker = useCallback(async (markerType: string, note?: string) => {
    if (!scribeSessionIdRef.current) return;
    const tsMs = Date.now() - startTimeRef.current;

    // Optimistic add
    const tempMarker: SessionMarker = {
      id: `temp-${Date.now()}`,
      markerType,
      note,
      tsMs,
      createdAt: new Date().toISOString(),
    };
    setMarkers(prev => [tempMarker, ...prev]);

    try {
      const resp = await apiFetch('/api/studio/scribe/markers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: scribeSessionIdRef.current,
          markerType,
          note,
          tsMs,
        }),
      });
      const data = await resp.json();
      if (data.success && data.marker) {
        setMarkers(prev => prev.map(m => m.id === tempMarker.id ? { ...data.marker } : m));
      }
    } catch (err) {
      console.error('[RecordingContext] Failed to add marker:', err);
    }
  }, []);

  // ── Ask MAIA ────────────────────────────────────────────────────────────

  const sendMaiaPrompt = useCallback(async (text: string): Promise<LivePromptExchange | null> => {
    if (!text.trim() || !scribeSessionIdRef.current) return null;
    const tsMs = Date.now() - startTimeRef.current;

    try {
      const resp = await apiFetch('/api/studio/scribe/live-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: scribeSessionIdRef.current,
          prompt: text,
          tsMs,
        }),
      });
      const data = await resp.json();
      if (data.success && data.exchange) {
        const exchange: LivePromptExchange = {
          id: data.exchange.id,
          prompt: data.exchange.prompt,
          response: data.exchange.response,
          createdAt: data.exchange.created_at,
        };
        setMaiaExchanges(prev => [...prev, exchange]);
        return exchange;
      }
    } catch (err) {
      console.error('[RecordingContext] Failed to send MAIA prompt:', err);
    }
    return null;
  }, []);

  // ── Context value ───────────────────────────────────────────────────────

  const value: RecordingContextValue = {
    phase,
    sessionId,
    scribeSessionId,
    bookingId,
    container,
    memoryPolicy,
    sessionTitle,
    isRecording,
    isPaused,
    duration,
    audioLevels,
    connectionStatus,
    hasTabAudio,
    segments,
    insights,
    markers,
    maiaExchanges,
    startSession,
    stopSession,
    pauseSession,
    resumeSession,
    addMarker,
    sendMaiaPrompt,
    resetSession,
  };

  return (
    <RecordingContext.Provider value={value}>
      {children}
    </RecordingContext.Provider>
  );
}
