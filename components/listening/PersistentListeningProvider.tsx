'use client';

import {
  createContext, useCallback, useContext, useEffect, useRef, useState,
} from 'react';
import type { ReactNode, RefObject } from 'react';
import { validateLocalAudio } from '@/lib/listening/localAudio';
import { isMaiaSpeechActive } from '@/lib/listening/maiaSpeechFocus';
import {
  SOULLAB_AUDIO_FOCUS_EVENT, SOULLAB_AUDIO_TAB_CHANNEL,
  SOULLAB_SESSION_END_EVENT, audioFocusSource, requestAudioFocus,
} from '@/lib/listening/audioFocus';

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
  mood: ListeningMood;
  frequencies: number[];
};

export type ListeningTransport = {
  snapshot: ListeningSnapshot;
  volume: number;
  setVolume: (volume: number) => void;
  playSketch: (mood: ListeningMood, frequencies: number[]) => Promise<boolean>;
  selectLocalFile: (file: File) => { accepted: boolean; message: string };
  playLocalFile: () => Promise<boolean>;
  pause: () => void;
  removeLocalFile: () => void;
};

const defaultSnapshot: ListeningSnapshot = {
  kind: 'none', playback: 'idle', mood: null, title: '',
  fileFormat: null, message: 'Choose an original sound study or a local file.',
};
const Context = createContext<ListeningTransport | null>(null);
export function usePersistentListening(): ListeningTransport | null {
  return useContext(Context);
}

function endSketch(sketch: Sketch | null): void {
  if (!sketch) return;
  try { sketch.master.gain.setValueAtTime(0, sketch.context.currentTime); } catch {}
  for (const osc of sketch.oscillators) {
    try { osc.stop(); } catch {}
  }
  void sketch.context.close().catch(() => undefined);
}

function newSketch(
  mood: ListeningMood, frequencies: number[], level: number,
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
  const oscillators = frequencies.map((frequency, index) => {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = index === 1 ? 'triangle' : 'sine';
    osc.frequency.value = frequency;
    osc.detune.value = index === 1 ? 2.4 : -1.1;
    gain.gain.value = index === 0 ? 0.24 : index === 1 ? 0.14 : 0.09;
    osc.connect(gain); gain.connect(filter);
    osc.start();
    return osc;
  });
  return { context, oscillators, master, mood, frequencies };
}

export function PersistentListeningProvider({
  children,
  reviewMemberKey,
}: { children: ReactNode; reviewMemberKey: string }) {
  const [snapshot, setSnapshot] = useState(defaultSnapshot);
  const [volume, saveVolume] = useState(45);
  const [mediaURL, setMediaURL] = useState<string | null>(null);

  const kind = useRef<Kind>('none');
  const sketch = useRef<Sketch | null>(null);
  const media = useRef<HTMLAudioElement | null>(null);
  const blobURL = useRef<string | null>(null);
  const selected = useRef<{ title: string; format: string } | null>(null);
  const volumeRef = useRef(45);
  const epoch = useRef(0);
  const focusChannel = useRef<BroadcastChannel | null>(null);
  const instanceID = useRef('');
  const lastMember = useRef(reviewMemberKey);

  const pause = useCallback(() => {
    ++epoch.current;
    if (sketch.current) {
      // Pause rather than deleting the sketch so member can explicitly resume.
      void sketch.current.context.suspend().catch(() => undefined);
    }
    media.current?.pause();
    setSnapshot(old => old.playback === 'playing'
      ? { ...old, playback: 'paused', message: 'Paused by you or another audio experience.' }
      : old);
  }, []);

  const stopAll = useCallback(() => {
    ++epoch.current;
    media.current?.pause();
    if (sketch.current) { endSketch(sketch.current); sketch.current = null; }
    if (blobURL.current) {
      URL.revokeObjectURL(blobURL.current);
      blobURL.current = null;
    }
    selected.current = null;
    kind.current = 'none';
    setMediaURL(null);
    setSnapshot(defaultSnapshot);
  }, []);

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
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel(SOULLAB_AUDIO_TAB_CHANNEL);
      focusChannel.current = channel;
      channel.onmessage = event => {
        const message = event.data;
        if (message && message.type === 'focus-claimed' && message.version === 1 &&
            message.owner !== instanceID.current) pause();
      };
    }
    const onFocus = (event: Event) => {
      const source = audioFocusSource(event);
      if (source && source !== 'listening-room') pause();
    };
    const onSessionEnd = () => stopAll();
    window.addEventListener(SOULLAB_AUDIO_FOCUS_EVENT, onFocus);
    window.addEventListener(SOULLAB_SESSION_END_EVENT, onSessionEnd);
    return () => {
      window.removeEventListener(SOULLAB_AUDIO_FOCUS_EVENT, onFocus);
      window.removeEventListener(SOULLAB_SESSION_END_EVENT, onSessionEnd);
      if (focusChannel.current) {
        focusChannel.current.close();
        focusChannel.current = null;
      }
      media.current?.pause();
      if (sketch.current) { endSketch(sketch.current); sketch.current = null; }
      if (blobURL.current) { URL.revokeObjectURL(blobURL.current); blobURL.current = null; }
    };
  }, [pause, stopAll]);

  useEffect(() => {
    if (lastMember.current !== reviewMemberKey) {
      // An authenticated member switch must never inherit the prior File.
      lastMember.current = reviewMemberKey;
      stopAll();
    }
  }, [reviewMemberKey, stopAll]);

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

  const playSketch = useCallback(async (mood: ListeningMood, frequencies: number[]): Promise<boolean> => {
    // Refuse BEFORE allocating or resuming a sound context.
    if (refuseDuringMaiaSpeech()) return false;
    if (!Array.isArray(frequencies) || frequencies.length !== 3 ||
      frequencies.some(f => !Number.isFinite(f) || f < 50 || f > 700)) {
      throw new Error('This review sketch contains invalid frequencies.');
    }
    const generation = ++epoch.current;
    media.current?.pause();
    kind.current = 'sketch';
    let active = sketch.current;
    if (!active || active.mood !== mood ||
      JSON.stringify(active.frequencies) !== JSON.stringify(frequencies)) {
      if (active) endSketch(active);
      active = newSketch(mood, frequencies, volumeRef.current / 100);
      sketch.current = active;
    }
    try {
      await active.context.resume();
      if (generation !== epoch.current || kind.current !== 'sketch' || isMaiaSpeechActive()) {
        void active.context.suspend().catch(() => undefined);
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
      if (sketch.current === active) { endSketch(active); sketch.current = null; }
      setSnapshot(old => ({ ...old, playback: 'error', message: 'Audio could not start.' }));
      return false;
    }
  }, [claimFocus, refuseDuringMaiaSpeech]);

  const selectLocalFile = useCallback((file: File) => {
    const result = validateLocalAudio(file);
    if (result.allowed === false) return { accepted: false, message: result.reason };
    ++epoch.current;
    media.current?.pause();
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
  }, []);

  const playLocalFile = useCallback(async (): Promise<boolean> => {
    if (!selected.current || !media.current) return false;
    if (refuseDuringMaiaSpeech()) return false;
    ++epoch.current;
    kind.current = 'local-file';
    if (sketch.current) { endSketch(sketch.current); sketch.current = null; }
    try {
      await media.current.play();
      // A MAIA queue might become audible while HTMLMediaElement.play awaits.
      if (isMaiaSpeechActive()) {
        media.current?.pause();
        refuseDuringMaiaSpeech();
        return false;
      }
      return true;
    } catch {
      setSnapshot(old => ({ ...old, playback:'error',
        message:'This browser could not decode or play the selected recording.' }));
      return false;
    }
  }, [refuseDuringMaiaSpeech]);

  const removeLocalFile = useCallback(() => {
    if (kind.current !== 'local-file') return;
    stopAll();
  }, [stopAll]);

  const onLocalPlay = useCallback(() => {
    if (kind.current !== 'local-file' || !selected.current) return;
    if (isMaiaSpeechActive()) { media.current?.pause(); refuseDuringMaiaSpeech(); return; }
    claimFocus();
    setSnapshot(old => ({
      ...old, kind:'local-file', playback:'playing',
      message:'Playing only your device-local file. No upload or analysis.',
    }));
  }, [claimFocus, refuseDuringMaiaSpeech]);

  const onLocalPause = useCallback(() => {
    if (kind.current !== 'local-file') return;
    setSnapshot(old => old.playback === 'playing' ? { ...old, playback:'paused' } : old);
  }, []);

  const transport: ListeningTransport = {
    snapshot, volume, setVolume, playSketch, selectLocalFile, playLocalFile,
    pause, removeLocalFile,
  };
  const displayed = snapshot.kind !== 'none' || snapshot.message.startsWith('MAIA is speaking.');
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
      <div style={{flex:1,minWidth:165}}>
        <strong data-listen10-title="true">{snapshot.title}</strong>
        <div data-listen10-state="true" style={{fontSize:11,color:'#bad0cf'}}>
          {snapshot.kind === 'local-file'
            ? snapshot.fileFormat + ' file (source type; output not guaranteed lossless)'
            : 'Low-volume synthesized sound study'} · {snapshot.playback}
        </div>
      </div>
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
      <label style={{fontSize:12}}>Volume
        <input aria-label="Persistent music volume" type="range" min="0" max="100"
          value={volume} onChange={e=>setVolume(Number(e.target.value))}/>
      </label>
      <button type="button" onClick={stopAll} aria-label="Stop and clear persistent music">
        Stop
      </button>
      <audio ref={media} data-listen10-audio="true" controls
        style={{maxWidth:200,display:snapshot.kind === 'local-file' ? 'block':'none'}}
        src={mediaURL || undefined} preload="metadata"
        onPlay={onLocalPlay} onPause={onLocalPause}
        onError={()=>snapshot.kind==='local-file' && setSnapshot(old=>({
          ...old, playback:'error',message:'Local audio cannot be decoded.',
        }))}/>
      <span role="status" style={{fontSize:10,color:'#a9bec1'}}>
        {snapshot.message}
      </span>
    </div>
  </Context.Provider>;
}
