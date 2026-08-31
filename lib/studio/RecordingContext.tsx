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
import { logMeetingAudioEvent } from '@/lib/studio/meetingAudioTelemetry';
import { type CaptureChannel, stripedChunkIndex } from '@/lib/studio/audioChannels';
import {
  buildIntegrityRecord,
  formatClockTime,
  integrityWarnings,
  type CaptureIntegrityEvent,
} from '@/lib/studio/captureIntegrity';

/** Independent chunk-sequencing state for one capture lane. */
interface LaneState {
  sequence: number;
  webmInit: Blob | null;
  chunkStartTime: number;
}

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
  // Relationship Memory v1 — Phase 1: attach to an existing practitioner_clients person.
  clientId?: string;
  // Stricter-sanctuary opt-out: store no client link for this session (spec §4).
  keepLinkPrivate?: boolean;
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
  tabAudioError: string | null;

  // Capture integrity — losses that make the recording less than it claims.
  // Deliberately has no clear/dismiss action: the session cannot become
  // whole again, so the warning must not be dismissible.
  integrityEvents: CaptureIntegrityEvent[];
  integrityWarnings: string[];

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
  clearTabAudioError: () => void;
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
  const [tabAudioError, setTabAudioError] = useState<string | null>(null);
  const [integrityEvents, setIntegrityEvents] = useState<CaptureIntegrityEvent[]>([]);
  // Mirrored in a ref because the chunk handlers and track listeners are
  // installed once and would otherwise close over a stale array.
  const integrityEventsRef = useRef<CaptureIntegrityEvent[]>([]);
  // Whether this session ever had two live lanes. A mic-only session is not
  // "interrupted" — it never claimed a second source.
  const hadTwoSourcesRef = useRef(false);

  // Unique handle so we can detect if the user accidentally selects the Session Room
  // tab itself (which would create a recursive feedback loop). Exposed via
  // navigator.mediaDevices.setCaptureHandleConfig when supported. Stable per provider
  // mount so the comparison inside getDisplayMedia is reliable.
  const captureHandleRef = useRef(`session-room-${Math.random().toString(36).slice(2)}`);

  // Live data
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [insights, setInsights] = useState<LiveInsight[]>([]);
  const [markers, setMarkers] = useState<SessionMarker[]>([]);
  const [maiaExchanges, setMaiaExchanges] = useState<LivePromptExchange[]>([]);

  // Refs (persist across renders, survive navigation because context survives)
  // One recorder per capture lane. Both must be driven together (start, pause,
  // resume, stop) or the transcript loses one side of the conversation.
  const micRecorderRef = useRef<MediaRecorder | null>(null);
  const tabRecorderRef = useRef<MediaRecorder | null>(null);
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
  // Chunk sequencing and WebM init state are PER LANE. Each MediaRecorder
  // emits its own independent stream: its own header in its own first chunk,
  // its own chunk cadence. Sharing either across lanes would prepend one
  // lane's container header to the other lane's Opus data and produce garbage.
  //
  // WebM init segment: the first chunk contains container headers, which must
  // be prepended to all subsequent chunks so Whisper receives a decodable file
  // each time.
  const laneStateRef = useRef<Record<CaptureChannel, LaneState>>({
    practitioner: { sequence: 0, webmInit: null, chunkStartTime: 0 },
    participants: { sequence: 0, webmInit: null, chunkStartTime: 0 },
  });
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const levelAnimationRef = useRef<number | null>(null);

  const isRecording = phase === 'recording';

  /**
   * Record a capture-integrity loss.
   *
   * Appends to both the ref (so listeners installed once see the current log)
   * and state (so the banner re-renders). Lane losses are recorded once per
   * lane — a track can fire `ended` and the recorder can fault for the same
   * underlying loss, and reporting it twice would misrepresent one failure as
   * two.
   */
  const recordIntegrityEvent = useCallback(
    (event: Omit<CaptureIntegrityEvent, 'atMs' | 'atIso' | 'atClock'>) => {
      const now = new Date();
      const priorLane = integrityEventsRef.current.find(
        (e) => e.kind === 'lane_lost' && e.channel === event.channel,
      );
      if (event.kind === 'lane_lost' && priorLane) return;

      const full: CaptureIntegrityEvent = {
        ...event,
        atMs: startTimeRef.current ? Date.now() - startTimeRef.current : 0,
        atIso: now.toISOString(),
        atClock: formatClockTime(now),
      };
      integrityEventsRef.current = [...integrityEventsRef.current, full];
      setIntegrityEvents(integrityEventsRef.current);
      console.warn(
        `[RecordingContext] capture integrity: ${full.kind} on ${full.channel} at ${full.atClock}` +
        (full.reason ? ` (${full.reason})` : ''),
      );
    },
    [],
  );

  // Keep refs in sync
  useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);
  useEffect(() => { scribeSessionIdRef.current = scribeSessionId; }, [scribeSessionId]);
  useEffect(() => { bookingIdRef.current = bookingId; }, [bookingId]);
  useEffect(() => { containerRef.current = container; }, [container]);

  // Register capture handle so we can identify the Session Room tab inside the
  // getDisplayMedia picker result. Experimental API — feature-detect and silently
  // skip when unavailable. Self-capture detection is defense-in-depth, not the
  // only guard; user-visible UI also warns against selecting this tab.
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) return;
    const md = navigator.mediaDevices as MediaDevices & {
      setCaptureHandleConfig?: (config: object | null) => void;
    };
    if (typeof md.setCaptureHandleConfig !== 'function') return;
    try {
      md.setCaptureHandleConfig({
        handle: captureHandleRef.current,
        exposeOrigin: true,
        permittedOrigins: ['*'],
      });
    } catch {
      // Some browsers throw if called from a non-top-level frame — non-fatal.
    }
    return () => {
      try { md.setCaptureHandleConfig?.(null); } catch { /* no-op */ }
    };
  }, []);

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

    // The microphone can end mid-session too — device unplugged, OS revoking
    // access, another app seizing it. Previously only the tab lane was watched,
    // so a dead mic produced a transcript of the far end alone with nothing
    // saying so.
    micStream.getAudioTracks()[0]?.addEventListener('ended', () => {
      recordIntegrityEvent({ channel: 'practitioner', kind: 'lane_lost', reason: 'track ended' });
    });

    // 2. Optionally get tab audio
    let tabStream: MediaStream | null = null;
    if (captureTabAudio) {
      setTabAudioError(null);
      if (typeof navigator.mediaDevices.getDisplayMedia !== 'function') {
        setTabAudioError(
          'Meeting-audio capture is not supported in this browser. Continuing with mic only.',
        );
        setHasTabAudio(false);
      } else {
        try {
          // We request video so the picker works reliably across browsers and so
          // we can read getCaptureHandle() on the video track to detect self-
          // capture. The video track is stopped immediately after the guards
          // pass — only audio is kept.
          const candidate = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false,
            },
          });

          // Self-capture guard: if the user selected the Session Room tab itself
          // we would create a recursive feedback loop (mic → tab playback → mic).
          const videoTrack = candidate.getVideoTracks()[0];
          const trackWithHandle = videoTrack as MediaStreamTrack & {
            getCaptureHandle?: () => { handle?: string } | null;
          };
          const handle =
            typeof trackWithHandle?.getCaptureHandle === 'function'
              ? trackWithHandle.getCaptureHandle()
              : null;

          if (handle?.handle === captureHandleRef.current) {
            candidate.getTracks().forEach((t) => t.stop());
            setTabAudioError(
              'You selected the Session Room tab. Please choose your meeting tab instead.',
            );
            setHasTabAudio(false);
            logMeetingAudioEvent('meeting_audio_self_capture_blocked');
          } else if (candidate.getAudioTracks().length === 0) {
            // No-audio-track guard: user forgot the "Share tab audio" checkbox,
            // or the chosen source has no audio output.
            candidate.getTracks().forEach((t) => t.stop());
            setTabAudioError(
              'No audio was shared from that tab. Re-pick a tab and enable "Share tab audio".',
            );
            setHasTabAudio(false);
            logMeetingAudioEvent('meeting_audio_no_track');
          } else {
            // Drop video tracks immediately — we only need audio for transcription.
            // Reduces privacy footprint (no incidental screen contents observed).
            candidate.getVideoTracks().forEach((t) => t.stop());

            tabStream = candidate;
            tabStreamRef.current = candidate;
            setHasTabAudio(true);

            // Handle tab stream ending (user stops sharing mid-session).
            // setHasTabAudio(false) drops the "connected" claim; the integrity
            // event is what makes the loss timestamped, undismissable, and
            // carried into the finished record. tabAudioError alone was a
            // dismissible banner — one click and the session looked whole again.
            candidate.getAudioTracks()[0]?.addEventListener('ended', () => {
              console.log('[RecordingContext] Tab audio track ended');
              setHasTabAudio(false);
              setTabAudioError('Meeting audio stopped. Mic capture continues.');
              recordIntegrityEvent({
                channel: 'participants',
                kind: 'lane_lost',
                reason: 'track ended',
              });
            });
          }
        } catch (err) {
          const errName = (err as Error | undefined)?.name;
          // NotAllowedError / AbortError → user cancelled picker. Silent fallback.
          if (errName === 'NotAllowedError' || errName === 'AbortError') {
            logMeetingAudioEvent('meeting_audio_picker_cancelled', {
              reason: errName,
            });
          } else {
            console.warn('[RecordingContext] Tab audio not available:', err);
            setTabAudioError('Meeting audio unavailable. Continuing with mic only.');
          }
          setHasTabAudio(false);
        }
      }
    }

    // 3. Setup AudioContext.
    //
    // The two sources are kept on SEPARATE recording destinations. They used to
    // be summed into one destination, which made speaker attribution
    // impossible downstream — by the time audio left the browser both people
    // were one waveform, and the transcript could only ever label everything
    // as a single speaker. Keeping the lanes apart means attribution comes
    // from the capture source itself and needs no inference.
    const ctx = new AudioContext({ sampleRate: 16000 });
    audioContextRef.current = ctx;

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : 'audio/mp4';

    const buildRecorder = (
      source: MediaStreamAudioSourceNode,
      channel: CaptureChannel,
    ): MediaRecorder => {
      const destination = ctx.createMediaStreamDestination();
      source.connect(destination);
      const recorder = new MediaRecorder(destination.stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });
      // A recorder can fault while its track stays live — the lane goes silent
      // with no `ended` event to catch it. Treated as loss of that lane.
      recorder.onerror = (event) => {
        recordIntegrityEvent({
          channel,
          kind: 'lane_lost',
          reason: (event as unknown as { error?: Error })?.error?.name ?? 'recorder error',
        });
      };
      return recorder;
    };

    // Mic lane — the practitioner.
    const micAnalyser = ctx.createAnalyser();
    micAnalyser.fftSize = 256;
    micAnalyser.smoothingTimeConstant = 0.8;
    micAnalyserRef.current = micAnalyser;
    const micSource = ctx.createMediaStreamSource(micStream);
    micSource.connect(micAnalyser);
    const micRecorder = buildRecorder(micSource, 'practitioner');
    micRecorderRef.current = micRecorder;

    // Tab lane — whoever is on the far end of the meeting.
    let tabRecorder: MediaRecorder | null = null;
    if (tabStream && tabStream.getAudioTracks().length > 0) {
      const tabAnalyser = ctx.createAnalyser();
      tabAnalyser.fftSize = 256;
      tabAnalyser.smoothingTimeConstant = 0.8;
      tabAnalyserRef.current = tabAnalyser;
      const tabSource = ctx.createMediaStreamSource(tabStream);
      tabSource.connect(tabAnalyser);
      tabRecorder = buildRecorder(tabSource, 'participants');
      tabRecorderRef.current = tabRecorder;
    }

    // Two live lanes at start. Only such a session can later be "interrupted";
    // a mic-only session never claimed a second source to lose.
    hadTwoSourcesRef.current = tabRecorder !== null;

    // Whether this session can attribute at all. With no tab lane the mic
    // carries every voice in the room and honest attribution is impossible —
    // the server is told so explicitly rather than being allowed to default.
    return { micRecorder, tabRecorder, canAttribute: tabRecorder !== null };
  }, [recordIntegrityEvent]);

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
          ...(config.clientId ? { clientId: config.clientId } : {}),
          ...(config.keepLinkPrivate ? { keepLinkPrivate: true } : {}),
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

      // Clear integrity history before capture starts — losses belong to the
      // session that suffered them, never carried forward into the next one.
      integrityEventsRef.current = [];
      setIntegrityEvents([]);
      hadTwoSourcesRef.current = false;

      // 4. Setup audio capture
      const { micRecorder, tabRecorder, canAttribute } = await setupAudioCapture(
        config.captureTabAudio ?? false,
      );

      // 5. Wire chunk handlers — one per lane, each with independent state.
      startTimeRef.current = Date.now();
      laneStateRef.current = {
        practitioner: { sequence: 0, webmInit: null, chunkStartTime: Date.now() },
        participants: { sequence: 0, webmInit: null, chunkStartTime: Date.now() },
      };

      const handleChunk = (channel: CaptureChannel) => async (event: BlobEvent) => {
        if (event.data.size === 0 || !sessionIdRef.current) return;

        const lane = laneStateRef.current[channel];
        const endMs = Date.now() - startTimeRef.current;
        const startMs = lane.chunkStartTime - startTimeRef.current;
        lane.chunkStartTime = Date.now();

        const seq = lane.sequence++;
        // Striped so the two lanes never collide on the (session_id,
        // chunk_index) uniqueness constraint — a collision would be silently
        // swallowed by ON CONFLICT DO NOTHING, losing a real utterance.
        const idx = stripedChunkIndex(channel, seq);

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
        if (seq === 0) {
          const firstBuf = new Uint8Array(await event.data.arrayBuffer());
          const clusterOffset = findFirstClusterOffset(firstBuf);
          lane.webmInit = clusterOffset > 0
            ? new Blob([firstBuf.slice(0, clusterOffset)], { type: event.data.type })
            : event.data; // fallback: Cluster ID not found, keep prior behavior
        }
        const initPrepended = seq > 0 && !!lane.webmInit;
        const audioToSend = (seq === 0 || !lane.webmInit)
          ? event.data
          : new Blob([lane.webmInit, event.data], { type: event.data.type });

        console.log(
          `[RecordingContext] ${channel} chunk #${idx} (seq ${seq})` +
          ` raw=${(event.data.size / 1024).toFixed(1)}kb` +
          ` sent=${(audioToSend.size / 1024).toFixed(1)}kb initPrepended=${initPrepended}`
        );

        const formData = new FormData();
        formData.append('sessionId', sessionIdRef.current);
        formData.append('audio', audioToSend, `chunk_${idx}.webm`);
        formData.append('chunkIndex', String(idx));
        formData.append('startMs', String(startMs));
        formData.append('endMs', String(endMs));
        // Attribution travels as the capture channel, never as a speaker name.
        // When there is no tab lane the mic carries everyone, so we send no
        // channel at all and the server records the audio as Unattributed
        // rather than assigning it to a person.
        if (canAttribute) {
          formData.append('channel', channel);
        }

        try {
          await apiFetch('/api/supervision/transcript/stream', {
            method: 'POST',
            body: formData,
          });
        } catch (err) {
          console.error(`[RecordingContext] ${channel} chunk #${idx} upload failed:`, err);
          // There is no retry. This audio is gone, so the transcript now has a
          // hole in it. Logging alone left the practitioner with a record that
          // read as continuous — the loss has to reach them and the session.
          recordIntegrityEvent({
            channel,
            kind: 'upload_failed',
            chunkIndex: idx,
            reason: err instanceof Error ? err.message : String(err),
          });
        }
      };

      micRecorder.ondataavailable = handleChunk('practitioner');
      if (tabRecorder) tabRecorder.ondataavailable = handleChunk('participants');

      // 6. Start recording (5s chunks)
      micRecorder.start(5000);
      tabRecorder?.start(5000);

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

    // Stop both lanes
    for (const recorder of [micRecorderRef.current, tabRecorderRef.current]) {
      if (recorder && recorder.state !== 'inactive') recorder.stop();
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
          // Travels with the stop so the finished session carries what was
          // lost. Without this the warning dies with the browser tab and the
          // transcript reads, forever after, as an uninterrupted recording.
          captureIntegrity: buildIntegrityRecord(
            integrityEventsRef.current,
            hadTwoSourcesRef.current,
          ),
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
    micRecorderRef.current = null;
    tabRecorderRef.current = null;
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

  // Pause/resume drive both lanes together. Pausing only one would keep
  // recording half the conversation while the practitioner believes the
  // session is paused — a consent problem, not just a bug.
  const pauseSession = useCallback(() => {
    const recorders = [micRecorderRef.current, tabRecorderRef.current];
    if (!recorders.some(r => r?.state === 'recording')) return;
    for (const recorder of recorders) {
      if (recorder?.state === 'recording') recorder.pause();
    }
    setIsPaused(true);
    if (levelAnimationRef.current) cancelAnimationFrame(levelAnimationRef.current);
  }, []);

  const resumeSession = useCallback(() => {
    const recorders = [micRecorderRef.current, tabRecorderRef.current];
    if (!recorders.some(r => r?.state === 'paused')) return;
    for (const recorder of recorders) {
      if (recorder?.state === 'paused') recorder.resume();
    }
    setIsPaused(false);
    analyzeAudioLevels();
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
    setTabAudioError(null);
    // Cleared only here, on an explicit reset to a new session. Never during
    // or after a recording — the warning must outlive the loss it describes.
    integrityEventsRef.current = [];
    setIntegrityEvents([]);
    hadTwoSourcesRef.current = false;
    setPhase('idle');
  }, []);

  const clearTabAudioError = useCallback(() => setTabAudioError(null), []);

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
    tabAudioError,
    integrityEvents,
    integrityWarnings: integrityWarnings(integrityEvents),
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
    clearTabAudioError,
  };

  return (
    <RecordingContext.Provider value={value}>
      {children}
    </RecordingContext.Provider>
  );
}
