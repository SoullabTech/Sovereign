'use client';

import {
  createContext, useCallback, useContext, useEffect, useRef, useState,
} from 'react';
import type { ReactNode, RefObject } from 'react';
import { focusTimeLabel } from '@/lib/listening/focusTimeDisplay';
import type { FocusTimeDisplay } from '@/lib/listening/focusTimeDisplay';
import PersistentListeningDock from './PersistentListeningDock';
import { usePlatformAudioSession } from './usePlatformAudioSession';
// Compatibility contract: PersistentListeningDock renders data-focus-field-dock="true"
// from this one member-bound provider; extraction did not create a second owner.
import { validateLocalAudio } from '@/lib/listening/localAudio';
import {
  ORIGINAL_RECEPTIVE_CONTROLS, validatedReceptiveControls,
  validateReceptiveRecipe, exportReceptiveShelf,
  RECEPTIVE_SHELF_MAX_FIELDS,
} from '@/lib/listening/receptiveField';
import type { ReceptiveControls, ReceptiveFieldRecipe } from '@/lib/listening/receptiveField';
import { isMaiaSpeechActive } from '@/lib/listening/maiaSpeechFocus';
import {
  acquireAudioOutput, AUDIO_OUTPUT_TAB_NONCE, SOULLAB_AUDIO_PREFLIGHT_VERSION,
} from '@/lib/listening/audioOutputLock';
import type { AudioOutputLease } from '@/lib/listening/audioOutputLock';
import {
  SOULLAB_AUDIO_FOCUS_EVENT, SOULLAB_AUDIO_TAB_CHANNEL,
  SOULLAB_SESSION_END_EVENT, audioFocusSource, requestAudioFocus,
} from '@/lib/listening/audioFocus';
import {
  advanceFocusSession as advanceFocusSessionModel,
  createFocusSession as createFocusSessionModel,
  focusDurationMs,
  focusElapsedMs,
  focusRemainingMs,
  interruptFocusSession as interruptFocusSessionModel,
  isFocusSessionTerminal,
  recordFocusFeedback as recordFocusFeedbackModel,
  resumeFocusSession as resumeFocusSessionModel,
  retuneFocusSession as retuneFocusSessionModel,
  startFocusSession as startFocusSessionModel,
  stopFocusSession as stopFocusSessionModel,
} from '@/lib/listening/focusFieldSession';
import type {
  FocusFeedbackOutcome, FocusFeedbackTag, FocusInterruptionReason,
  FocusRetune, FocusSession, FocusSessionPlanInput,
} from '@/lib/listening/focusFieldSession';
import { reviewMediaEdition, reviewMediaSequence, soundPassageAt } from '@/lib/listening/soundStudioExperience';
import type { SoundExperienceManifest, SoundExperienceMediaEdition, SoundExperiencePlayback } from '@/lib/listening/soundStudioExperience';

/**
 * LISTEN-10 · Isolated cross-room transport candidate.
 *
 * The existing global platform owner must decide whether, and WHERE, to mount
 * this under an authenticated member-scoped shell. NEVER mount it globally
 * on a public route or infer identity from a browser string.
 *
 * This transport knows only an original low-volume synthesized sketch and
 * a device-local File selected by the member. No licensed third-party audio,
 * streaming API, server upload, implicit analytics, AI processing or provider
 * account tokens are used.
 */
export type ListeningMood = 'focus' | 'create' | 'drift' | 'rest';
type Kind = 'none' | 'sketch' | 'local-file' | 'review-media';
type Playback = 'idle' | 'playing' | 'paused' | 'error';

export type ListeningSnapshot = {
  kind: Kind;
  playback: Playback;
  mood: ListeningMood | null;
  title: string;
  fileFormat: string | null;
  message: string;
  experienceId?: string | null;
  subtitle?: string;
  durationMs?: number | null;
  elapsedMs?: number;
  passage?: string | null;
  continuation?: 'until-stop' | null;
  continuationCycle?: number;
};

type Sketch = {
  context: AudioContext;
  oscillators: OscillatorNode[];
  master: GainNode;
  voices: GainNode[];
  filter: BiquadFilterNode;
  movement: OscillatorNode;
  movementDepth: GainNode;
  mood: ListeningMood;
  frequencies: number[];
};

export type ListeningTransport = {
  snapshot: ListeningSnapshot;
  volume: number;
  setVolume: (volume: number) => void;
  looping: boolean;
  loopAvailable: boolean;
  setLooping: (enabled: boolean) => void;
  shape: ReceptiveControls;
  setShape: (shape: ReceptiveControls) => void;
  fields: ReceptiveFieldRecipe[];
  keepField: (recipe: ReceptiveFieldRecipe) => boolean;
  dropField: (id: string) => void;
  replaceFields: (recipes: ReceptiveFieldRecipe[]) => void;
  playSketch: (
    mood: ListeningMood, frequencies: number[], experience?: SoundExperiencePlayback,
  ) => Promise<boolean>;
  playExperienceMedia: (manifest: SoundExperienceManifest) => Promise<boolean>;
  selectLocalFile: (file: File) => { accepted: boolean; message: string };
  playLocalFile: () => Promise<boolean>;
  pause: () => void;
  /** Terminally clear just this member-bound music; does not stop Focus time. */
  stopMusic: () => void;
  /** Opaque, unshared lifecycle scope; changes with each verified provider remount. */
  listeningInstance: object;
  removeLocalFile: () => void;
  focusSession: FocusSession | null;
  focusClockMs: number;
  focusTimeDisplay: FocusTimeDisplay;
  /** false where the platform fixes the media level (iOS): volume, presets and fade cannot work. */
  volumeAdjustable: boolean;
  setFocusTimeDisplay: (mode: FocusTimeDisplay) => void;
  startFocusSession: (plan: FocusSessionPlanInput) => boolean;
  pauseFocusSession: (reason?: FocusInterruptionReason) => boolean;
  resumeFocusSession: () => boolean;
  retuneFocusSession: (input: FocusRetune) => boolean;
  stopFocusSession: () => boolean;
  recordFocusFeedback: (
    outcome: FocusFeedbackOutcome,
    tags?: readonly FocusFeedbackTag[],
  ) => boolean;
  clearFocusSession: () => void;
};

const defaultSnapshot: ListeningSnapshot = {
  kind: 'none', playback: 'idle', mood: null, title: '',
  fileFormat: null, message: 'Choose an original sound study or a local file.',
};
function formatFocusClock(milliseconds: number | null): string {
  if (milliseconds === null) return 'Untimed';
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`;
}

function newFocusSessionID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
    return crypto.randomUUID().toLowerCase();
  return `focus_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

const Context = createContext<ListeningTransport | null>(null);
export function usePersistentListening(): ListeningTransport | null {
  return useContext(Context);
}

export type ListeningBoundaryStatus =
  | 'standalone'
  | 'not-applicable'
  | 'checking'
  | 'ready'
  | 'denied'
  | 'unavailable';

const BoundaryStatusContext = createContext<ListeningBoundaryStatus>('standalone');
export function ListeningBoundaryStatusProvider({
  children,
  status,
}: { children: ReactNode; status: ListeningBoundaryStatus }) {
  return <BoundaryStatusContext.Provider value={status}>{children}</BoundaryStatusContext.Provider>;
}
export function useListeningBoundaryStatus(): ListeningBoundaryStatus {
  return useContext(BoundaryStatusContext);
}

function endSketch(sketch: Sketch | null): void {
  if (!sketch) return;
  try { sketch.master.gain.setValueAtTime(0, sketch.context.currentTime); } catch {}
  for (const osc of [...sketch.oscillators,sketch.movement]) {
    try { osc.stop(); } catch {}
  }
  void sketch.context.close().catch(() => undefined);
}

/** Smooth controls apply ONLY to Soullab's low-volume synthetic sound sketch.
 * They never process the member's local File or a commercial/provider master.
 * All 50/50/50 restores the original review-study oscillator/filter mix.
 */
function applyReceptiveShape(sketch: Sketch, shape: ReceptiveControls) {
  const t=sketch.context.currentTime;
  const gently=(parameter:AudioParam,value:number)=>parameter.setTargetAtTime(value,t,0.13);
  gently(sketch.voices[0].gain,0.24*(0.5+shape.pulse/100));
  gently(sketch.voices[1].gain,0.14*(0.5+shape.density/100));
  gently(sketch.voices[2].gain,0.09*(0.5+shape.space/100));
  gently(sketch.filter.frequency,660+(shape.space-50)*5);
  // Only AFTER the artist-sketch neutral 50 does a gentle periodic pulse enter.
  // It stays comfortably below the oscillator's always-positive baseline gain.
  gently(sketch.movementDepth.gain,Math.max(0,shape.pulse-50)/50*0.032);
  gently(sketch.movement.frequency,0.55+shape.pulse/100*0.55);
}

function newSketch(
  mood: ListeningMood, frequencies: number[], level: number,
  shape: ReceptiveControls,
): Sketch {
  const AudioCtor: typeof AudioContext =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!;
  if (!AudioCtor) throw new Error('This browser cannot open an AudioContext.');
  const context = new AudioCtor();
  const master = context.createGain();
  master.gain.setValueAtTime(0.0001, context.currentTime);
  master.gain.exponentialRampToValueAtTime(
    Math.max(0.0001, level * 0.027), context.currentTime + 1.8,
  );
  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 660;
  filter.connect(master); master.connect(context.destination);
  const voices:GainNode[]=[];
  const oscillators = frequencies.map((frequency, index) => {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = index === 1 ? 'triangle' : 'sine';
    osc.frequency.value = frequency;
    osc.detune.value = index === 1 ? 2.4 : -1.1;
    gain.gain.value = index === 0 ? 0.24 : index === 1 ? 0.14 : 0.09;
    osc.connect(gain); gain.connect(filter);
    voices.push(gain);
    osc.start();
    return osc;
  });
  const movement=context.createOscillator();
  const movementDepth=context.createGain();
  movement.type='sine';
  movement.frequency.value=0.8;
  movementDepth.gain.value=0;
  movement.connect(movementDepth);
  movementDepth.connect(voices[0].gain); // modulation, NOT extra direct audio output
  movement.start();
  const sketch={context,oscillators,master,voices,filter,movement,movementDepth,mood,frequencies};
  applyReceptiveShape(sketch,shape);
  return sketch;
}

export function PersistentListeningProvider({
  children,
  reviewMemberKey,
}: { children: ReactNode; reviewMemberKey: string }) {
  const [snapshot, setSnapshot] = useState(defaultSnapshot);
  const [volume, saveVolume] = useState(45);
  const [looping, saveLooping] = useState(false);
  const [loopAvailable, saveLoopAvailable] = useState(false);
  const [shape, saveShape] = useState<ReceptiveControls>({...ORIGINAL_RECEPTIVE_CONTROLS});
  const shapeRef = useRef<ReceptiveControls>({...ORIGINAL_RECEPTIVE_CONTROLS});
  const [fields,saveFields] = useState<ReceptiveFieldRecipe[]>([]);
  const fieldsRef = useRef<ReceptiveFieldRecipe[]>([]);
  const [focusSession, setFocusSession] = useState<FocusSession | null>(null);
  const focusSessionRef = useRef<FocusSession | null>(null);
  const [focusClockMs, setFocusClockMs] = useState(() => Date.now());
  const [focusTimeDisplay, setFocusTimeDisplay] = useState<FocusTimeDisplay>('countdown');
  // iOS ignores a page's HTMLMediaElement.volume (only the hardware buttons change it). Detect it
  // rather than assume, so no control claims a level change the device will not make.
  const [volumeAdjustable, setVolumeAdjustable] = useState(true);
  useEffect(() => {
    const element = media.current;
    if (!element) return;
    const before = element.volume;
    try {
      element.volume = 0.5;
      setVolumeAdjustable(Math.abs(element.volume - 0.5) < 0.01);
    } catch { setVolumeAdjustable(false); }
    try { element.volume = before; } catch { /* read-only on this platform */ }
  }, []);
  const [mediaURL, setMediaURL] = useState<string | null>(null);

  const kind = useRef<Kind>('none');
  const sketch = useRef<Sketch | null>(null);
  const media = useRef<HTMLAudioElement | null>(null);
  const blobURL = useRef<string | null>(null);
  const selected = useRef<{ title: string; format: string } | null>(null);
  const reviewManifest = useRef<SoundExperienceManifest | null>(null);
  const reviewSequence = useRef<readonly SoundExperienceMediaEdition[]>([]);
  const reviewSegmentIndex = useRef(0);
  const reviewContinuationCycles = useRef(0);
  const segmentTransitioning = useRef(false);
  const volumeRef = useRef(45);
  const epoch = useRef(0);
  // Stable within this one member-bound provider instance, never serialized or shared.
  const listeningInstance = useRef<object>({}).current;
  const focusChannel = useRef<BroadcastChannel | null>(null);
  const instanceID = useRef('');
  const lastMember = useRef(reviewMemberKey);
  const outputLease = useRef<AudioOutputLease | null>(null);
  const experience = useRef<{
    definition: SoundExperiencePlayback;
    elapsedMs: number;
    startedAt: number | null;
  } | null>(null);
  const releaseOutput = useCallback(() => {
    outputLease.current?.release();
    outputLease.current = null;
  }, []);
  const experienceElapsed = useCallback((at = Date.now()): number => {
    const current = experience.current;
    if (!current) return 0;
    const running = current.startedAt === null ? 0 : Math.max(0, at - current.startedAt);
    return Math.min(current.definition.durationMs, current.elapsedMs + running);
  }, []);
  const pauseExperienceClock = useCallback((): number => {
    const current = experience.current;
    if (!current) return 0;
    current.elapsedMs = experienceElapsed();
    current.startedAt = null;
    return current.elapsedMs;
  }, [experienceElapsed]);

  const clearPrivateFields = useCallback(() => {
    fieldsRef.current=[];
    saveFields([]);
  }, []);
  const keepField = useCallback((recipe:ReceptiveFieldRecipe):boolean => {
    const checked=validateReceptiveRecipe(recipe);
    const previous=fieldsRef.current;
    if(previous.length>=RECEPTIVE_SHELF_MAX_FIELDS ||
       previous.some(v=>v.id===checked.id)) return false;
    const next=[checked,...previous];
    fieldsRef.current=next;
    saveFields(next);
    return true;
  }, []);
  const dropField = useCallback((id:string) => {
    const next=fieldsRef.current.filter(v=>v.id!==id);
    fieldsRef.current=next;
    saveFields(next);
  }, []);
  const replaceFields = useCallback((entries:ReceptiveFieldRecipe[]) => {
    const serialized=exportReceptiveShelf(entries);
    const restored=JSON.parse(serialized).fields as ReceptiveFieldRecipe[];
    fieldsRef.current=restored;
    saveFields(restored);
  }, []);

  const reviewOffsetMs = useCallback((): number => {
    const base = reviewSequence.current.slice(0, reviewSegmentIndex.current)
      .reduce((sum, item) => sum + item.durationMs, 0);
    const manifest = reviewManifest.current;
    const continuation = manifest?.continuation;
    const current = reviewSequence.current[reviewSegmentIndex.current];
    if (continuation?.mode === 'loop_final_segment' && current &&
        reviewSegmentIndex.current === continuation.repeatSegmentIndex) {
      return base + reviewContinuationCycles.current * current.durationMs;
    }
    return base;
  }, []);
  const reviewElapsedMs = useCallback((): number => {
    const manifest = reviewManifest.current;
    const audio = media.current;
    if (!manifest || !audio) return 0;
    const elapsed = reviewOffsetMs() + audio.currentTime * 1000;
    return manifest.continuation ? elapsed : Math.min(manifest.durationMs, elapsed);
  }, [reviewOffsetMs]);

  const pause = useCallback(() => {
    ++epoch.current;
    const elapsedMs = kind.current === 'review-media' && media.current
      ? reviewElapsedMs()
      : pauseExperienceClock();
    if (kind.current === 'review-media' && experience.current) {
      experience.current.elapsedMs = elapsedMs;
      experience.current.startedAt = null;
    }
    if (sketch.current) {
      // Pause rather than deleting the sketch so member can explicitly resume.
      void sketch.current.context.suspend().catch(() => undefined);
    }
    media.current?.pause();
    releaseOutput();
    setSnapshot(old => old.playback === 'playing'
      ? {
          ...old, playback: 'paused',
          message: 'Paused by you or another audio experience.',
          elapsedMs: experience.current ? elapsedMs : old.elapsedMs,
          passage: experience.current
            ? soundPassageAt(experience.current.definition.passages, elapsedMs)?.label ?? null
            : old.passage,
        }
      : old);
  }, [pauseExperienceClock, releaseOutput, reviewElapsedMs]);

  const stopAll = useCallback(() => {
    ++epoch.current;
    media.current?.pause();
    if (media.current) {
      media.current.loop = false;
      media.current.removeAttribute('src');
      media.current.load();
    }
    saveLooping(false);
    saveLoopAvailable(false);
    releaseOutput();
    if (sketch.current) { endSketch(sketch.current); sketch.current = null; }
    if (blobURL.current) {
      URL.revokeObjectURL(blobURL.current);
      blobURL.current = null;
    }
    selected.current = null;
    reviewManifest.current = null;
    reviewSequence.current = [];
    reviewSegmentIndex.current = 0;
    reviewContinuationCycles.current = 0;
    segmentTransitioning.current = false;
    kind.current = 'none';
    experience.current = null;
    setMediaURL(null);
    shapeRef.current={...ORIGINAL_RECEPTIVE_CONTROLS};
    saveShape(shapeRef.current);
    setSnapshot(defaultSnapshot);
  }, [releaseOutput]);

  const commitFocusSession = useCallback((next: FocusSession | null) => {
    focusSessionRef.current = next;
    setFocusSession(next);
    setFocusClockMs(Date.now());
  }, []);

  const interruptCurrentFocus = useCallback((reason: FocusInterruptionReason): boolean => {
    const current = focusSessionRef.current;
    if (!current || current.status !== 'running') return false;
    try {
      commitFocusSession(interruptFocusSessionModel(current, reason, new Date()));
      return true;
    } catch { return false; }
  }, [commitFocusSession]);

  const beginFocusSession = useCallback((plan: FocusSessionPlanInput): boolean => {
    const current = focusSessionRef.current;
    if (current && !isFocusSessionTerminal(current)) return false;
    try {
      const now = new Date();
      const ready = createFocusSessionModel(plan, { id: newFocusSessionID(), at: now });
      commitFocusSession(startFocusSessionModel(ready, now));
      return true;
    } catch { return false; }
  }, [commitFocusSession]);

  const pauseFocusSession = useCallback((reason: FocusInterruptionReason = 'member'): boolean => {
    const interrupted = interruptCurrentFocus(reason);
    if (interrupted) pause();
    return interrupted;
  }, [interruptCurrentFocus, pause]);

  const resumeCurrentFocus = useCallback((): boolean => {
    const current = focusSessionRef.current;
    if (!current || current.status !== 'paused') return false;
    try {
      commitFocusSession(resumeFocusSessionModel(current, new Date(), true));
      return true;
    } catch { return false; }
  }, [commitFocusSession]);

  const retuneCurrentFocus = useCallback((input: FocusRetune): boolean => {
    const current = focusSessionRef.current;
    if (!current || isFocusSessionTerminal(current)) return false;
    try {
      commitFocusSession(retuneFocusSessionModel(current, input, new Date()));
      return true;
    } catch { return false; }
  }, [commitFocusSession]);

  const stopCurrentFocus = useCallback((): boolean => {
    const current = focusSessionRef.current;
    if (!current || isFocusSessionTerminal(current)) return false;
    try {
      commitFocusSession(stopFocusSessionModel(current, new Date(), 'member-stop'));
      pause();
      return true;
    } catch { return false; }
  }, [commitFocusSession, pause]);

  const recordCurrentFocusFeedback = useCallback((
    outcome: FocusFeedbackOutcome,
    tags: readonly FocusFeedbackTag[] = [],
  ): boolean => {
    const current = focusSessionRef.current;
    if (!current || !isFocusSessionTerminal(current)) return false;
    try {
      commitFocusSession(recordFocusFeedbackModel(current, { outcome, tags, at: new Date() }));
      return true;
    } catch { return false; }
  }, [commitFocusSession]);

  const clearCurrentFocus = useCallback(() => commitFocusSession(null), [commitFocusSession]);

  const claimFocus = useCallback(() => {
    // This merely requests cooperation; it never asserts identity or rights.
    requestAudioFocus('listening-room');
    try {
      focusChannel.current?.postMessage({
        type: 'focus-claimed', version: 1, owner: instanceID.current,
      });
    } catch { /* Browser lacks cross-tab focus support. */ }
  }, []);

  useEffect(() => {
    instanceID.current = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    if (typeof BroadcastChannel === 'function') {
      try {
      const channel = new BroadcastChannel(SOULLAB_AUDIO_TAB_CHANNEL);
      focusChannel.current = channel;
      channel.onmessage = event => {
        const message = event.data;
        if (!message || typeof message !== 'object') return;
        if (message.version === SOULLAB_AUDIO_PREFLIGHT_VERSION) {
          if (message.tab === AUDIO_OUTPUT_TAB_NONCE) return;
          if (message.type === 'maia-speech-preflight') {
            pause(); interruptCurrentFocus('maia');
          } else if (message.type === 'reader-narration-preflight') {
            pause(); interruptCurrentFocus('reader');
          } else if (message.type === 'music-preflight') {
            pause(); interruptCurrentFocus('device');
          }
          return;
        }
        if (message.type === 'focus-claimed' && message.version === 1 &&
            message.owner !== instanceID.current) {
          pause();
          interruptCurrentFocus('device');
        }
      };
      } catch { focusChannel.current = null; /* Missing channel => all new audio refuses to start. */ }
    }
    const onFocus = (event: Event) => {
      const source = audioFocusSource(event);
      if (!source || source === 'listening-room') return;
      pause();
      interruptCurrentFocus(source === 'maia-voice'
        ? 'maia'
        : source === 'reader-narration'
          ? 'reader'
          : 'device');
    };
    const onSessionEnd = () => {
      stopAll(); clearPrivateFields(); commitFocusSession(null);
    };
    window.addEventListener(SOULLAB_AUDIO_FOCUS_EVENT, onFocus);
    window.addEventListener(SOULLAB_SESSION_END_EVENT, onSessionEnd);
    const mountedMedia = media.current;
    return () => {
      window.removeEventListener(SOULLAB_AUDIO_FOCUS_EVENT, onFocus);
      window.removeEventListener(SOULLAB_SESSION_END_EVENT, onSessionEnd);
      if (focusChannel.current) {
        focusChannel.current.close();
        focusChannel.current = null;
      }
      mountedMedia?.pause();
      releaseOutput();
      if (sketch.current) { endSketch(sketch.current); sketch.current = null; }
      if (blobURL.current) { URL.revokeObjectURL(blobURL.current); blobURL.current = null; }
    };
  }, [
    pause, stopAll, releaseOutput, clearPrivateFields,
    interruptCurrentFocus, commitFocusSession,
  ]);

  useEffect(() => {
    if (lastMember.current !== reviewMemberKey) {
      // An authenticated member switch must never inherit the prior File.
      lastMember.current = reviewMemberKey;
      stopAll();
      clearPrivateFields();
      commitFocusSession(null);
    }
  }, [reviewMemberKey, stopAll, clearPrivateFields, commitFocusSession]);

  useEffect(() => {
    if (focusSession?.status !== 'running') return;
    const tick = () => {
      const current = focusSessionRef.current;
      const now = new Date();
      setFocusClockMs(now.getTime());
      if (!current || current.status !== 'running') return;
      try {
        const next = advanceFocusSessionModel(current, now);
        if (next !== current) {
          if (next.status === 'completed') pause();
          commitFocusSession(next);
        }
      } catch { /* A rejected clock movement never mutates the accepted session. */ }
    };
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [focusSession?.status, commitFocusSession, pause]);

  useEffect(() => {
    if (snapshot.kind !== 'sketch' || snapshot.playback !== 'playing' || !experience.current) return;
    const tick = () => {
      const current = experience.current;
      if (!current || current.startedAt === null) return;
      const elapsedMs = experienceElapsed();
      const passage = soundPassageAt(current.definition.passages, elapsedMs)?.label ?? null;
      if (elapsedMs >= current.definition.durationMs) {
        current.elapsedMs = current.definition.durationMs;
        current.startedAt = null;
        void sketch.current?.context.suspend().catch(() => undefined);
        releaseOutput();
        setSnapshot(old => old.experienceId === current.definition.id ? {
          ...old, playback: 'paused', elapsedMs, passage,
          message: `${current.definition.title} is complete. It will not restart automatically.`,
        } : old);
        return;
      }
      setSnapshot(old => old.experienceId === current.definition.id
        ? { ...old, elapsedMs, passage } : old);
    };
    tick();
    const interval = window.setInterval(tick, 500);
    return () => window.clearInterval(interval);
  }, [snapshot.kind, snapshot.playback, experienceElapsed, releaseOutput]);

  const setVolume = useCallback((value: number) => {
    const next = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
    volumeRef.current = next;
    saveVolume(next);
    if (sketch.current) {
      const { context, master } = sketch.current;
      master.gain.setTargetAtTime(Math.max(0.0001, next / 100 * 0.027),
        context.currentTime, 0.06);
    }
    if (media.current) media.current.volume = next / 100;
  }, []);

  const setLooping = useCallback((enabled: boolean) => {
    const permitted = kind.current === 'local-file' ||
      (kind.current === 'review-media' && reviewManifest.current?.permissions.looping === true &&
        reviewSequence.current.length === 1);
    const next = Boolean(enabled && permitted);
    if (media.current) media.current.loop = next;
    saveLooping(next);
  }, []);

  const refuseDuringMaiaSpeech = useCallback((): boolean => {
    if (!isMaiaSpeechActive()) return false;
    setSnapshot(old => ({
      ...old,
      playback: old.playback === 'playing' ? 'paused' : old.playback,
      message: 'MAIA is speaking. Stop or finish MAIA before playing music.',
    }));
    return true;
  }, []);

  const setShape = useCallback((input: ReceptiveControls) => {
    const next=validatedReceptiveControls(input);
    shapeRef.current=next;
    saveShape(next);
    if(sketch.current && kind.current==='sketch')
      applyReceptiveShape(sketch.current,next);
    // Changes do NOT start an AudioContext or request audio focus.
  }, []);

  const playSketch = useCallback(async (
    mood: ListeningMood, frequencies: number[], requestedExperience?: SoundExperiencePlayback,
  ): Promise<boolean> => {
    // Refuse BEFORE allocating or resuming a sound context.
    if (refuseDuringMaiaSpeech()) return false;
    if (!Array.isArray(frequencies) || frequencies.length !== 3 ||
      frequencies.some(f => !Number.isFinite(f) || f < 50 || f > 700)) {
      throw new Error('This review sketch contains invalid frequencies.');
    }
    if (requestedExperience) {
      const current = experience.current;
      if (!current || current.definition.id !== requestedExperience.id) {
        experience.current = { definition: requestedExperience, elapsedMs: 0, startedAt: null };
      }
    } else {
      experience.current = null;
    }
    if (outputLease.current) pause();
    const generation = ++epoch.current;
    const lease = await acquireAudioOutput('listening-music');
    if (!lease || generation !== epoch.current || isMaiaSpeechActive()) {
      lease?.release();
      if (generation === epoch.current) {
        if (isMaiaSpeechActive()) refuseDuringMaiaSpeech();
        else setSnapshot(old => ({...old, playback:'paused',
          message:'Another Soullab tab is playing audio, or coordination is unavailable. Please try again.'}));
      }
      return false;
    }
    outputLease.current = lease;
    media.current?.pause();
    if (media.current) media.current.loop = false;
    saveLooping(false);
    saveLoopAvailable(false);
    kind.current = 'sketch';
    let active = sketch.current;
    if (!active || active.mood !== mood ||
      JSON.stringify(active.frequencies) !== JSON.stringify(frequencies)) {
      if (active) endSketch(active);
      active = newSketch(mood, frequencies, volumeRef.current / 100,shapeRef.current);
      sketch.current = active;
    } else {
      applyReceptiveShape(active,shapeRef.current);
    }
    try {
      await active.context.resume();
      if (generation !== epoch.current || kind.current !== 'sketch' || isMaiaSpeechActive()) {
        void active.context.suspend().catch(() => undefined);
        releaseOutput();
        if (isMaiaSpeechActive()) refuseDuringMaiaSpeech();
        return false;
      }
      claimFocus();
      const activeExperience = experience.current;
      if (activeExperience) activeExperience.startedAt = Date.now();
      const elapsedMs = activeExperience ? experienceElapsed() : 0;
      setSnapshot({
        kind: 'sketch', playback: 'playing', mood,
        title: activeExperience?.definition.title ?? {
          focus: 'Between the Tides', create: 'Velvet Current',
          drift: 'The Blue Hour', rest: 'Moonwater',
        }[mood],
        subtitle: activeExperience?.definition.subtitle ?? '',
        experienceId: activeExperience?.definition.id ?? null,
        durationMs: activeExperience?.definition.durationMs ?? null,
        elapsedMs,
        passage: activeExperience
          ? soundPassageAt(activeExperience.definition.passages, elapsedMs)?.label ?? null
          : null,
        fileFormat: null,
        message: activeExperience
          ? `${activeExperience.definition.title} · procedural review edition.`
          : 'Original, locally synthesized sound study · not a commercial recording.',
      });
      return true;
    } catch {
      releaseOutput();
      if (sketch.current === active) { endSketch(active); sketch.current = null; }
      setSnapshot(old => ({ ...old, playback: 'error', message: 'Audio could not start.' }));
      return false;
    }
  }, [claimFocus, refuseDuringMaiaSpeech, releaseOutput, pause, experienceElapsed]);

  const playExperienceMedia = useCallback(async (
    manifest: SoundExperienceManifest,
  ): Promise<boolean> => {
    const sequence = reviewMediaSequence(manifest);
    const edition = sequence?.[0] ?? reviewMediaEdition(manifest);
    if (!edition?.path || !sequence?.length) {
      setSnapshot(old => ({ ...old, playback: 'error',
        message: 'This experience has no accepted private-review media edition.' }));
      return false;
    }
    if (refuseDuringMaiaSpeech()) return false;
    const audio = media.current;
    if (!audio) return false;
    if (outputLease.current) pause();
    const generation = ++epoch.current;
    const lease = await acquireAudioOutput('listening-music');
    if (!lease || generation !== epoch.current || isMaiaSpeechActive()) {
      lease?.release();
      if (generation === epoch.current) {
        if (isMaiaSpeechActive()) refuseDuringMaiaSpeech();
        else setSnapshot(old => ({ ...old, playback: 'paused',
          message: 'Another Soullab tab is playing audio, or coordination is unavailable. Please try again.' }));
      }
      return false;
    }
    outputLease.current = lease;
    if (sketch.current) { endSketch(sketch.current); sketch.current = null; }
    const currentSegment = reviewSequence.current[reviewSegmentIndex.current];
    const continuing = kind.current === 'review-media' &&
      reviewManifest.current?.manifestId === manifest.manifestId &&
      Boolean(currentSegment?.path) && audio.getAttribute('src') === currentSegment?.path;
    if (!continuing) {
      audio.pause();
      audio.loop = false;
      saveLooping(false);
      saveLoopAvailable(manifest.permissions.looping === true && sequence.length === 1);
      reviewSequence.current = sequence;
      reviewSegmentIndex.current = 0;
      reviewContinuationCycles.current = 0;
      segmentTransitioning.current = false;
      audio.src = edition.path;
      audio.preload = 'auto';
      audio.load();
      kind.current = 'review-media';
      reviewManifest.current = manifest;
      selected.current = { title: manifest.title, format: edition.codecLabel };
      experience.current = {
        definition: {
          id: manifest.experienceId, title: manifest.title, subtitle: manifest.subtitle,
          durationMs: manifest.durationMs, passages: manifest.passages,
        },
        elapsedMs: 0, startedAt: null,
      };
      // Keep admitted review media on the existing imperative element. The
      // local-file URL remains React-owned; assigning both here would cause a
      // post-play src reconciliation that reloads and pauses this same media.
      setSnapshot({
        kind: 'review-media', playback: 'paused', mood: null,
        title: manifest.title, subtitle: manifest.subtitle,
        experienceId: manifest.experienceId, durationMs: manifest.durationMs,
        elapsedMs: 0, passage: manifest.passages[0]?.label ?? null,
        fileFormat: edition.codecLabel,
        continuation: manifest.continuation ? 'until-stop' : null,
        continuationCycle: 0,
        message: manifest.continuation
          ? `${edition.codecLabel} · Nicole once, then the continuous core repeats until Stop.`
          : `${edition.codecLabel} · exact private-review media.`,
      });
    }
    try {
      audio.volume = volumeRef.current / 100;
      await audio.play();
      if (generation !== epoch.current || kind.current !== 'review-media' ||
          reviewManifest.current?.manifestId !== manifest.manifestId || isMaiaSpeechActive()) {
        audio.pause();
        releaseOutput();
        if (isMaiaSpeechActive()) refuseDuringMaiaSpeech();
        return false;
      }
      claimFocus();
      const elapsedMs = reviewElapsedMs();
      if (experience.current) {
        experience.current.elapsedMs = elapsedMs;
        experience.current.startedAt = null;
      }
      setSnapshot({
        kind: 'review-media', playback: 'playing', mood: null,
        title: manifest.title, subtitle: manifest.subtitle,
        experienceId: manifest.experienceId, durationMs: manifest.durationMs,
        elapsedMs, passage: soundPassageAt(manifest.passages, elapsedMs)?.label ?? null,
        fileFormat: edition.codecLabel,
        continuation: manifest.continuation ? 'until-stop' : null,
        continuationCycle: reviewContinuationCycles.current,
        message: manifest.continuation
          ? 'Extended Night is playing. Nicole will not return; only the continuous core repeats.'
          : `${edition.codecLabel} · exact private-review media.`,
      });
      return true;
    } catch {
      releaseOutput();
      setSnapshot(old => ({ ...old, playback: 'error',
        message: 'This browser could not decode or play the accepted review recording.' }));
      return false;
    }
  }, [claimFocus, pause, refuseDuringMaiaSpeech, releaseOutput, reviewElapsedMs]);

  const selectLocalFile = useCallback((file: File) => {
    const result = validateLocalAudio(file);
    if (result.allowed === false) return { accepted: false, message: result.reason };
    ++epoch.current;
    media.current?.pause();
    releaseOutput();
    if (sketch.current) { endSketch(sketch.current); sketch.current = null; }
    if (blobURL.current) URL.revokeObjectURL(blobURL.current);
    blobURL.current = URL.createObjectURL(file);
    selected.current = { title: result.name, format: result.label };
    experience.current = null;
    kind.current = 'local-file';
    if (media.current) media.current.loop = false;
    saveLooping(false);
    saveLoopAvailable(true);
    setMediaURL(blobURL.current);
    setSnapshot({
      kind: 'local-file', playback: 'paused', mood: null,
      title: result.name, fileFormat: result.label,
      message: 'Your file stays on this device. Browser output fidelity varies.',
    });
    return { accepted: true, message: 'File selected locally; use the persistent player.' };
  }, [releaseOutput]);

  const playLocalFile = useCallback(async (): Promise<boolean> => {
    if (!selected.current || !media.current) return false;
    if (refuseDuringMaiaSpeech()) return false;
    if (outputLease.current) pause();
    const generation = ++epoch.current;
    const lease = await acquireAudioOutput('listening-music');
    if (!lease || generation !== epoch.current || isMaiaSpeechActive()) {
      lease?.release();
      if (generation === epoch.current) {
        if (isMaiaSpeechActive()) refuseDuringMaiaSpeech();
        else setSnapshot(old => ({...old, playback:'paused',
          message:'Another Soullab tab is playing audio, or coordination is unavailable. Please try again.'}));
      }
      return false;
    }
    outputLease.current = lease;
    kind.current = 'local-file';
    if (sketch.current) { endSketch(sketch.current); sketch.current = null; }
    try {
      await media.current.play();
      // A MAIA queue might become audible while HTMLMediaElement.play awaits.
      if (isMaiaSpeechActive() || generation !== epoch.current) {
        media.current?.pause();
        releaseOutput();
        if (isMaiaSpeechActive()) refuseDuringMaiaSpeech();
        return false;
      }
      return true;
    } catch {
      releaseOutput();
      setSnapshot(old => ({ ...old, playback:'error',
        message:'This browser could not decode or play the selected recording.' }));
      return false;
    }
  }, [refuseDuringMaiaSpeech, pause, releaseOutput]);

  const removeLocalFile = useCallback(() => {
    if (kind.current !== 'local-file') return;
    stopAll();
  }, [stopAll]);

  const onMediaPlay = useCallback(() => {
    if ((kind.current !== 'local-file' && kind.current !== 'review-media') || !selected.current) return;
    if (isMaiaSpeechActive() || !outputLease.current) {
      media.current?.pause(); releaseOutput(); refuseDuringMaiaSpeech(); return;
    }
    claimFocus();
    setSnapshot(old => ({
      ...old, playback:'playing',
      message: kind.current === 'review-media'
        ? reviewManifest.current?.continuation && reviewContinuationCycles.current > 0
          ? `${reviewManifest.current.continuation.label} · voice and descent will not repeat.`
          : `${selected.current?.format} · exact private-review media.`
        : 'Playing only your device-local file. No upload or analysis.',
    }));
  }, [claimFocus, refuseDuringMaiaSpeech, releaseOutput]);

  const onMediaPause = useCallback(() => {
    if (segmentTransitioning.current) return;
    if (kind.current === 'review-media' && media.current?.ended && (
        reviewSequence.current[reviewSegmentIndex.current + 1] ||
        reviewManifest.current?.continuation?.repeatSegmentIndex === reviewSegmentIndex.current
      )) return;
    if (kind.current !== 'local-file' && kind.current !== 'review-media') return;
    const elapsedMs = kind.current === 'review-media' && media.current
      ? reviewElapsedMs()
      : snapshot.elapsedMs;
    if (kind.current === 'review-media' && experience.current && typeof elapsedMs === 'number') {
      experience.current.elapsedMs = elapsedMs;
      experience.current.startedAt = null;
    }
    releaseOutput();
    setSnapshot(old => old.playback === 'playing' ? {
      ...old, playback:'paused',
      elapsedMs: typeof elapsedMs === 'number' ? elapsedMs : old.elapsedMs,
      passage: kind.current === 'review-media' && reviewManifest.current && typeof elapsedMs === 'number'
        ? soundPassageAt(reviewManifest.current.passages, elapsedMs)?.label ?? null
        : old.passage,
    } : old);
  }, [releaseOutput, reviewElapsedMs, snapshot.elapsedMs]);

  const onMediaTimeUpdate = useCallback(() => {
    if (kind.current !== 'review-media' || !media.current || !reviewManifest.current) return;
    const manifest = reviewManifest.current;
    const elapsedMs = reviewElapsedMs();
    if (experience.current) {
      experience.current.elapsedMs = elapsedMs;
      experience.current.startedAt = null;
    }
    setSnapshot(old => old.experienceId === manifest.experienceId ? {
      ...old, elapsedMs,
      continuation: manifest.continuation ? 'until-stop' : old.continuation,
      continuationCycle: reviewContinuationCycles.current,
      passage: soundPassageAt(manifest.passages, elapsedMs)?.label ?? null,
    } : old);
  }, [reviewElapsedMs]);

  const onMediaEnded = useCallback(() => {
    if (kind.current !== 'review-media' || !reviewManifest.current || !media.current) {
      releaseOutput(); return;
    }
    const manifest = reviewManifest.current;
    const nextIndex = reviewSegmentIndex.current + 1;
    const next = reviewSequence.current[nextIndex];
    if (next?.path) {
      const audio = media.current;
      const offsetMs = reviewSequence.current.slice(0, nextIndex)
        .reduce((sum, item) => sum + item.durationMs, 0);
      reviewSegmentIndex.current = nextIndex;
      segmentTransitioning.current = true;
      audio.loop = false;
      selected.current = { title: manifest.title, format: next.codecLabel };
      audio.src = next.path;
      audio.preload = 'auto';
      audio.load();
      if (experience.current) {
        experience.current.elapsedMs = Math.min(manifest.durationMs, offsetMs);
        experience.current.startedAt = null;
      }
      setSnapshot(old => old.experienceId === manifest.experienceId ? {
        ...old, playback: isMaiaSpeechActive() ? 'paused' : 'playing',
        elapsedMs: Math.min(manifest.durationMs, offsetMs),
        passage: soundPassageAt(manifest.passages, offsetMs)?.label ?? null,
        fileFormat: next.codecLabel,
        continuation: manifest.continuation ? 'until-stop' : old.continuation,
        continuationCycle: reviewContinuationCycles.current,
        message: isMaiaSpeechActive()
          ? 'The next part is ready. MAIA is speaking; resume only when you choose.'
          : manifest.continuation
            ? 'Nicole has left. The continuous music core is now playing and will repeat until Stop.'
            : `${manifest.title} continues without returning to guidance.`,
      } : old);
      if (isMaiaSpeechActive()) {
        segmentTransitioning.current = false;
        releaseOutput();
        return;
      }
      void audio.play().then(() => {
        segmentTransitioning.current = false;
        claimFocus();
      }).catch(() => {
        segmentTransitioning.current = false;
        releaseOutput();
        setSnapshot(old => ({ ...old, playback: 'error',
          message: 'The next part of this private-review experience could not begin.' }));
      });
      return;
    }
    const continuation = manifest.continuation;
    if (continuation?.mode === 'loop_final_segment' &&
        reviewSegmentIndex.current === continuation.repeatSegmentIndex) {
      const audio = media.current;
      const current = reviewSequence.current[reviewSegmentIndex.current];
      if (!current) { releaseOutput(); return; }
      reviewContinuationCycles.current += 1;
      const elapsedMs = reviewOffsetMs();
      segmentTransitioning.current = true;
      audio.loop = false;
      audio.currentTime = 0;
      if (experience.current) {
        experience.current.elapsedMs = elapsedMs;
        experience.current.startedAt = null;
      }
      setSnapshot(old => old.experienceId === manifest.experienceId ? {
        ...old,
        playback: isMaiaSpeechActive() ? 'paused' : 'playing',
        elapsedMs,
        passage: continuation.label,
        continuation: 'until-stop',
        continuationCycle: reviewContinuationCycles.current,
        fileFormat: current.codecLabel,
        message: isMaiaSpeechActive()
          ? 'The continuous core is ready. MAIA is speaking; resume only when you choose.'
          : `${continuation.label} · guidance will not repeat.`,
      } : old);
      if (isMaiaSpeechActive()) {
        segmentTransitioning.current = false;
        releaseOutput();
        return;
      }
      void audio.play().then(() => {
        segmentTransitioning.current = false;
        claimFocus();
      }).catch(() => {
        segmentTransitioning.current = false;
        releaseOutput();
        setSnapshot(old => ({ ...old, playback: 'error',
          message: 'The continuous night core could not repeat.' }));
      });
      return;
    }
    releaseOutput();
    if (experience.current) {
      experience.current.elapsedMs = manifest.durationMs;
      experience.current.startedAt = null;
    }
    setSnapshot(old => old.experienceId === manifest.experienceId ? {
      ...old, playback: 'paused', elapsedMs: manifest.durationMs,
      passage: manifest.passages[manifest.passages.length - 1]?.label ?? null,
      message: `${manifest.title} is complete. It will not restart automatically.`,
    } : old);
  }, [claimFocus, releaseOutput, reviewOffsetMs]);

  const transport: ListeningTransport = {
    snapshot, volume, setVolume, looping, loopAvailable, setLooping, shape, setShape,
    fields, keepField, dropField, replaceFields,
    playSketch, playExperienceMedia, selectLocalFile, playLocalFile,
    pause, stopMusic: stopAll, listeningInstance, removeLocalFile,
    focusSession, focusClockMs,
    focusTimeDisplay, setFocusTimeDisplay,
    volumeAdjustable,
    startFocusSession: beginFocusSession,
    pauseFocusSession,
    resumeFocusSession: resumeCurrentFocus,
    retuneFocusSession: retuneCurrentFocus,
    stopFocusSession: stopCurrentFocus,
    recordFocusFeedback: recordCurrentFocusFeedback,
    clearFocusSession: clearCurrentFocus,
  };
  const audioDisplayed = snapshot.kind !== 'none' || snapshot.message.startsWith('MAIA is speaking.');
  const focusDisplayed = Boolean(focusSession && !isFocusSessionTerminal(focusSession));
  const displayed = audioDisplayed || focusDisplayed;
  const resumeMusic = () => {
    if (snapshot.kind === 'local-file') { void playLocalFile(); return; }
    if (snapshot.kind === 'review-media' && reviewManifest.current) {
      void playExperienceMedia(reviewManifest.current); return;
    }
    if (snapshot.kind === 'sketch') {
      void playSketch(
        snapshot.mood || 'drift',
        sketch.current?.frequencies || [98,146.83,196],
        experience.current?.definition,
      );
    }
  };
  const [companionMode, setCompanionMode] = useState(false);
  usePlatformAudioSession(snapshot, companionMode, {
    onPause: pause,
    onResume: resumeMusic,
    onStop: stopAll,
  });
  return <Context.Provider value={transport}>
    {children}
    <PersistentListeningDock
      snapshot={snapshot}
      volume={volume}
      looping={looping}
      loopAvailable={loopAvailable}
      displayed={displayed}
      focusSession={focusDisplayed ? focusSession : null}
      focusRemainingLabel={focusSession
        ? focusTimeLabel(focusTimeDisplay, {
            elapsedMs: focusElapsedMs(focusSession, new Date(focusClockMs)),
            totalMs: focusDurationMs(focusSession.plan.duration),
            countdownLabel: formatFocusClock(focusRemainingMs(focusSession, new Date(focusClockMs))),
          })
        : 'Untimed'}
      onPauseMusic={pause}
      onResumeMusic={resumeMusic}
      onStopMusic={stopAll}
      onVolume={setVolume}
      onLooping={setLooping}
      onCompanionMode={setCompanionMode}
      volumeAdjustable={volumeAdjustable}
      onPauseFocus={() => { pauseFocusSession('member'); }}
      onResumeFocus={() => { resumeCurrentFocus(); }}
      onStopFocus={() => { stopCurrentFocus(); }}
    />
    <audio ref={media} data-listen10-audio="true"
      style={{display:'none'}}
      src={mediaURL || undefined} preload="metadata" loop={looping}
      onPlay={onMediaPlay} onPause={onMediaPause}
      onTimeUpdate={onMediaTimeUpdate} onEnded={onMediaEnded}
      onError={()=>{
        releaseOutput();
        if (snapshot.kind === 'local-file') setSnapshot(old=>({
          ...old, playback:'error',message:'Local audio cannot be decoded.',
        }));
        if (snapshot.kind === 'review-media') setSnapshot(old=>({
          ...old, playback:'error',message:'Accepted review media cannot be decoded on this device.',
        }));
      }}/>
  </Context.Provider>;
}
