'use client';

import {
  createContext, useCallback, useContext, useEffect, useRef, useState,
} from 'react';
import type { ReactNode, RefObject } from 'react';
import Link from 'next/link';
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
type Kind = 'none' | 'sketch' | 'local-file';
type Playback = 'idle' | 'playing' | 'paused' | 'error';

export type ListeningSnapshot = {
  kind: Kind;
  playback: Playback;
  mood: ListeningMood | null;
  title: string;
  fileFormat: string | null;
  message: string;
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
  shape: ReceptiveControls;
  setShape: (shape: ReceptiveControls) => void;
  fields: ReceptiveFieldRecipe[];
  keepField: (recipe: ReceptiveFieldRecipe) => boolean;
  dropField: (id: string) => void;
  replaceFields: (recipes: ReceptiveFieldRecipe[]) => void;
  playSketch: (mood: ListeningMood, frequencies: number[]) => Promise<boolean>;
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
  const [shape, saveShape] = useState<ReceptiveControls>({...ORIGINAL_RECEPTIVE_CONTROLS});
  const shapeRef = useRef<ReceptiveControls>({...ORIGINAL_RECEPTIVE_CONTROLS});
  const [fields,saveFields] = useState<ReceptiveFieldRecipe[]>([]);
  const fieldsRef = useRef<ReceptiveFieldRecipe[]>([]);
  const [focusSession, setFocusSession] = useState<FocusSession | null>(null);
  const focusSessionRef = useRef<FocusSession | null>(null);
  const [focusClockMs, setFocusClockMs] = useState(() => Date.now());
  const [mediaURL, setMediaURL] = useState<string | null>(null);

  const kind = useRef<Kind>('none');
  const sketch = useRef<Sketch | null>(null);
  const media = useRef<HTMLAudioElement | null>(null);
  const blobURL = useRef<string | null>(null);
  const selected = useRef<{ title: string; format: string } | null>(null);
  const volumeRef = useRef(45);
  const epoch = useRef(0);
  // Stable within this one member-bound provider instance, never serialized or shared.
  const listeningInstance = useRef<object>({}).current;
  const focusChannel = useRef<BroadcastChannel | null>(null);
  const instanceID = useRef('');
  const lastMember = useRef(reviewMemberKey);
  const outputLease = useRef<AudioOutputLease | null>(null);
  const releaseOutput = useCallback(() => {
    outputLease.current?.release();
    outputLease.current = null;
  }, []);

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

  const pause = useCallback(() => {
    ++epoch.current;
    if (sketch.current) {
      // Pause rather than deleting the sketch so member can explicitly resume.
      void sketch.current.context.suspend().catch(() => undefined);
    }
    media.current?.pause();
    releaseOutput();
    setSnapshot(old => old.playback === 'playing'
      ? { ...old, playback: 'paused', message: 'Paused by you or another audio experience.' }
      : old);
  }, [releaseOutput]);

  const stopAll = useCallback(() => {
    ++epoch.current;
    media.current?.pause();
    releaseOutput();
    if (sketch.current) { endSketch(sketch.current); sketch.current = null; }
    if (blobURL.current) {
      URL.revokeObjectURL(blobURL.current);
      blobURL.current = null;
    }
    selected.current = null;
    kind.current = 'none';
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

  const playSketch = useCallback(async (mood: ListeningMood, frequencies: number[]): Promise<boolean> => {
    // Refuse BEFORE allocating or resuming a sound context.
    if (refuseDuringMaiaSpeech()) return false;
    if (!Array.isArray(frequencies) || frequencies.length !== 3 ||
      frequencies.some(f => !Number.isFinite(f) || f < 50 || f > 700)) {
      throw new Error('This review sketch contains invalid frequencies.');
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
      setSnapshot({
        kind: 'sketch', playback: 'playing', mood,
        title: {
          focus: 'Between the Tides', create: 'Velvet Current',
          drift: 'The Blue Hour', rest: 'Moonwater',
        }[mood],
        fileFormat: null,
        message: 'Original, locally synthesized sound study · not a commercial recording.',
      });
      return true;
    } catch {
      releaseOutput();
      if (sketch.current === active) { endSketch(active); sketch.current = null; }
      setSnapshot(old => ({ ...old, playback: 'error', message: 'Audio could not start.' }));
      return false;
    }
  }, [claimFocus, refuseDuringMaiaSpeech, releaseOutput, pause]);

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
    kind.current = 'local-file';
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

  const onLocalPlay = useCallback(() => {
    if (kind.current !== 'local-file' || !selected.current) return;
    if (isMaiaSpeechActive() || !outputLease.current) {
      media.current?.pause(); releaseOutput(); refuseDuringMaiaSpeech(); return;
    }
    claimFocus();
    setSnapshot(old => ({
      ...old, kind:'local-file', playback:'playing',
      message:'Playing only your device-local file. No upload or analysis.',
    }));
  }, [claimFocus, refuseDuringMaiaSpeech, releaseOutput]);

  const onLocalPause = useCallback(() => {
    if (kind.current !== 'local-file') return;
    releaseOutput();
    setSnapshot(old => old.playback === 'playing' ? { ...old, playback:'paused' } : old);
  }, [releaseOutput]);

  const transport: ListeningTransport = {
    snapshot, volume, setVolume, shape, setShape,
    fields, keepField, dropField, replaceFields,
    playSketch, selectLocalFile, playLocalFile,
    pause, stopMusic: stopAll, listeningInstance, removeLocalFile,
    focusSession, focusClockMs,
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
  return <Context.Provider value={transport}>
    {children}
    <div
      data-listen10-persistent-dock="true"
      role="region" aria-label="Persistent Soullab listening controls"
      style={{
        display: displayed ? 'flex' : 'none',
        position:'fixed',zIndex:90,bottom:0,left:0,right:0,
        minHeight:76,padding:'10px 22px',
        gap:16,alignItems:'center',flexWrap:'wrap',
        background:'rgba(10,23,29,0.97)',color:'#f3e6d3',
        borderTop:'1px solid #857a62',backdropFilter:'blur(16px)',
      }}>
      {focusDisplayed && focusSession && <div
        data-focus-field-dock="true" style={{flex:1,minWidth:240}}>
        <strong>Focus Field · {focusSession.plan.taskLabel || focusSession.plan.task}</strong>
        <div style={{fontSize:11,color:'#bad0cf'}}>
          {focusSession.plan.focusNeed} · {focusSession.plan.musicalWorld} · {focusSession.status} · {' '}
          {formatFocusClock(focusRemainingMs(focusSession, new Date(focusClockMs)))}
        </div>
        <Link href="/listen#focus-field" style={{fontSize:10,color:'#e7c995'}}>Open Focus Field</Link>
      </div>}
      {audioDisplayed && <div style={{flex:1,minWidth:165}}>
        <strong data-listen10-title="true">{snapshot.title}</strong>
        <div data-listen10-state="true" style={{fontSize:11,color:'#bad0cf'}}>
          {snapshot.kind === 'local-file'
            ? snapshot.fileFormat + ' file (source type; output not guaranteed lossless)'
            : 'Low-volume synthesized sound study'} · {snapshot.playback}
        </div>
      </div>}
      {focusDisplayed && focusSession?.status === 'running' && <button type="button"
        onClick={() => pauseFocusSession('member')} aria-label="Pause Focus Field session">
        Pause focus
      </button>}
      {focusDisplayed && focusSession?.status === 'paused' && <button type="button"
        onClick={resumeCurrentFocus} aria-label="Resume Focus Field session by member action">
        Resume focus
      </button>}
      {focusDisplayed && <button type="button" onClick={stopCurrentFocus}
        aria-label="Stop Focus Field session">Stop focus</button>}
      {snapshot.kind === 'sketch' && <button type="button"
        aria-label={snapshot.playback === 'playing' ? 'Pause persistent music':'Resume persistent music'}
        onClick={() => snapshot.playback === 'playing' ? pause()
          : void playSketch(snapshot.mood || 'drift', sketch.current?.frequencies || [98,146.83,196])}>
        {snapshot.playback === 'playing' ? 'Pause' : 'Resume'}
      </button>}
      {snapshot.kind === 'local-file' && <button type="button"
        aria-label={snapshot.playback === 'playing' ? 'Pause local music':'Play local music'}
        onClick={()=>snapshot.playback === 'playing' ? pause() : void playLocalFile()}>
        {snapshot.playback === 'playing' ? 'Pause' : 'Play'}
      </button>}
      {audioDisplayed && <label style={{fontSize:12}}>Volume
        <input aria-label="Persistent music volume" type="range" min="0" max="100"
          value={volume} onChange={e=>setVolume(Number(e.target.value))}/>
      </label>}
      {audioDisplayed && <button type="button" onClick={stopAll}
        aria-label="Stop and clear persistent music">Stop music</button>}
      <audio ref={media} data-listen10-audio="true"
        // Native controls bypass the output-lock check; use only controlled Play/Pause.
        style={{display:'none'}}
        src={mediaURL || undefined} preload="metadata"
        onPlay={onLocalPlay} onPause={onLocalPause}
        onEnded={releaseOutput}
        onError={()=>{releaseOutput();snapshot.kind==='local-file' && setSnapshot(old=>({
          ...old, playback:'error',message:'Local audio cannot be decoded.',
        }));}}/>
      {audioDisplayed && <span role="status" style={{fontSize:10,color:'#a9bec1'}}>
        {snapshot.message}
      </span>}
    </div>
  </Context.Provider>;
}
