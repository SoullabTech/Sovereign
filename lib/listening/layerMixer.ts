/** Layered listening: a few extra private-review recordings beside the main source.
 *
 * A layer is only ever an already-admitted single-edition review recording that the
 * member explicitly adds. The mixer owns no output lease, never starts by itself and
 * never resumes by itself: the provider pauses or stops every layer whenever the one
 * exclusive audio-output lease ends (MAIA speech, Reader narration, another tab, the
 * member's Pause or Stop, session end). No layer persists beyond the provider.
 */
import { reviewMediaSequence, type SoundExperienceManifest } from './soundStudioExperience';

export const MAX_LAYERS = 3;

export type LayerAudio = {
  src: string;
  volume: number;
  loop: boolean;
  preload: string;
  readonly paused: boolean;
  onended: ((event: Event) => unknown) | null;
  onerror: OnErrorEventHandler;
  play: () => Promise<void>;
  pause: () => void;
  load: () => void;
  removeAttribute: (name: string) => void;
};

export type MixerLayer = {
  id: string;
  title: string;
  manifestId: string;
  /** 0–100, relative to the master level. */
  level: number;
  muted: boolean;
  loop: boolean;
  loopAvailable: boolean;
  playback: 'playing' | 'paused' | 'error';
};

type Entry = { layer: MixerLayer; audio: LayerAudio };

export type AddLayerResult =
  | { ok: true; id: string }
  | { ok: false; reason: 'no-edition' | 'sequence' | 'duplicate' | 'full' };

export type LayerMixer = {
  list: () => MixerLayer[];
  add: (manifest: SoundExperienceManifest) => AddLayerResult;
  /** Starts a layer. Caller holds the output lease. */
  start: (id: string) => Promise<boolean>;
  setLevel: (id: string, level: number) => void;
  setMuted: (id: string, muted: boolean) => void;
  setLoop: (id: string, loop: boolean) => void;
  setMaster: (master: number) => void;
  remove: (id: string) => void;
  pauseAll: () => void;
  stopAll: () => void;
  size: () => number;
};

/** The only place a layer's audio element is made: the main player stays the one persistent element. */
export const browserLayerAudio = (): LayerAudio => new Audio();

const clamp = (value: number): number =>
  Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;

export function createLayerMixer(
  createAudio: () => LayerAudio,
  onChange: (layers: MixerLayer[]) => void,
  initialMaster = 45,
): LayerMixer {
  const entries = new Map<string, Entry>();
  let master = clamp(initialMaster);
  let counter = 0;

  const snapshot = (): MixerLayer[] => [...entries.values()].map(entry => ({ ...entry.layer }));
  const emit = () => onChange(snapshot());
  const apply = (entry: Entry) => {
    entry.audio.volume = entry.layer.muted ? 0 : (entry.layer.level / 100) * (master / 100);
  };
  const dispose = (entry: Entry) => {
    try { entry.audio.pause(); } catch { /* already stopped */ }
    entry.audio.loop = false;
    entry.audio.onended = null;
    entry.audio.onerror = null;
    try { entry.audio.removeAttribute('src'); entry.audio.load(); } catch { /* detached */ }
  };

  return {
    list: snapshot,
    size: () => entries.size,
    add(manifest) {
      const sequence = reviewMediaSequence(manifest);
      if (!sequence?.length || !sequence[0]?.path) return { ok: false, reason: 'no-edition' };
      if (sequence.length !== 1) return { ok: false, reason: 'sequence' };
      for (const entry of entries.values()) {
        if (entry.layer.manifestId === manifest.manifestId) return { ok: false, reason: 'duplicate' };
      }
      if (entries.size >= MAX_LAYERS) return { ok: false, reason: 'full' };
      const audio = createAudio();
      audio.preload = 'auto';
      audio.loop = false;
      audio.src = sequence[0].path;
      audio.load();
      const id = `layer-${++counter}`;
      audio.onended = () => {
        const current = entries.get(id);
        if (!current || current.layer.loop) return;
        current.layer.playback = 'paused';
        emit();
      };
      audio.onerror = () => {
        const current = entries.get(id);
        if (!current) return;
        current.layer.playback = 'error';
        emit();
      };
      const entry: Entry = {
        audio,
        layer: {
          id, title: manifest.title, manifestId: manifest.manifestId,
          level: 100, muted: false, loop: false,
          loopAvailable: manifest.permissions.looping === true,
          playback: 'paused',
        },
      };
      apply(entry);
      entries.set(id, entry);
      emit();
      return { ok: true, id };
    },
    async start(id) {
      const entry = entries.get(id);
      if (!entry) return false;
      apply(entry);
      try {
        await entry.audio.play();
        entry.layer.playback = 'playing';
        emit();
        return true;
      } catch {
        entry.layer.playback = 'error';
        emit();
        return false;
      }
    },
    setLevel(id, level) {
      const entry = entries.get(id);
      if (!entry) return;
      entry.layer.level = clamp(level);
      apply(entry);
      emit();
    },
    setMuted(id, muted) {
      const entry = entries.get(id);
      if (!entry) return;
      entry.layer.muted = muted;
      apply(entry);
      emit();
    },
    setLoop(id, loop) {
      const entry = entries.get(id);
      if (!entry) return;
      // Looping only where the manifest permits it, exactly as for the main source.
      const next = Boolean(loop && entry.layer.loopAvailable);
      entry.layer.loop = next;
      entry.audio.loop = next;
      emit();
    },
    setMaster(next) {
      master = clamp(next);
      for (const entry of entries.values()) apply(entry);
    },
    remove(id) {
      const entry = entries.get(id);
      if (!entry) return;
      dispose(entry);
      entries.delete(id);
      emit();
    },
    pauseAll() {
      let changed = false;
      for (const entry of entries.values()) {
        try { entry.audio.pause(); } catch { /* ignore */ }
        if (entry.layer.playback === 'playing') { entry.layer.playback = 'paused'; changed = true; }
      }
      if (changed) emit();
    },
    stopAll() {
      if (!entries.size) return;
      for (const entry of entries.values()) dispose(entry);
      entries.clear();
      emit();
    },
  };
}
