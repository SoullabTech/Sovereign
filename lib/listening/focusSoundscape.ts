// FOCUS-SOUNDSCAPE-01 · from a member's Focus choices to a synthesized soundscape (pure, deterministic).
//
// Every choice has an audible consequence, and the same choices always give the same sound:
//   musical world → the palette (pitch centre, timbres, texture layers, any rhythmic or plucked events)
//   focus need    → arc and motion (how it opens, how bright, how much it moves, how busy)
//   stimulation   → how much of that motion and brightness is present
//   task          → a small adjustment (verbal tasks keep events quieter and the tone softer)
// This is a synthesized interpretation, not recorded music, and it makes no claim about any effect on attention,
// mood or health. Nothing here plays sound: the engine does, and only after the member's own Play.
import type { FocusMusicalWorld, FocusNeed, FocusStimulation, FocusTaskKind } from './focusFieldSession';

export type SoundscapeInput = {
  need: FocusNeed;
  stimulation: FocusStimulation;
  world: FocusMusicalWorld;
  task: FocusTaskKind;
};
export type VoiceSpec = { ratio: number; type: 'sine' | 'triangle' | 'sawtooth' | 'square'; gain: number; detuneCents: number; pan: number };
export type NoiseSpec = { gain: number; bandHz: number; q: number; sweepHz: number };
export type TickSpec = { kind: 'click' | 'pluck' | 'soft'; bpm: number; gain: number };
// Real recorded nature layers (loops). Gains are 0..1.2 relative levels; the engine plays a layer only when its
// gain is above zero and its file can be loaded, so a missing recording leaves the synthesized sound alone.
export type RecordedLayerId = 'night' | 'forest' | 'wind' | 'waves' | 'rain';
export type RecordedMix = Partial<Record<RecordedLayerId, number>>;
export type SoundscapeSpec = {
  world: FocusMusicalWorld;
  recorded: RecordedMix | null;
  root: number;
  voices: VoiceSpec[];
  lowpassHz: number;
  pulseHz: number;
  pulseDepth: number;
  driftDepth: number;
  noise: NoiseSpec | null;
  tick: TickSpec | null;
  fadeInSec: number;
};

export const DEFAULT_SOUNDSCAPE_INPUT: SoundscapeInput =
  { need: 'deep', stimulation: 'medium', world: 'ambient', task: 'writing' };

type Palette = { root: number; lowpass: number; voices: VoiceSpec[]; noise?: NoiseSpec; tick?: TickSpec };
const v = (ratio: number, type: VoiceSpec['type'], gain: number, detuneCents: number, pan: number): VoiceSpec =>
  ({ ratio, type, gain, detuneCents, pan });

const PALETTE: Record<FocusMusicalWorld, Palette> = {
  ambient: { root: 110, lowpass: 900, voices: [v(1, 'sine', .24, 0, 0), v(1.5, 'sine', .12, -3, -.4), v(2, 'triangle', .08, 3, .4), v(3, 'sine', .04, 0, 0)] },
  cinematic: { root: 98, lowpass: 700, voices: [v(1, 'sawtooth', .09, -6, 0), v(1.5, 'sawtooth', .06, 6, -.5), v(2, 'sine', .14, 0, .5), v(2.378, 'triangle', .05, 0, .6), v(3, 'sine', .05, 0, -.6)] },
  classical: { root: 130.81, lowpass: 1400, voices: [v(1, 'triangle', .2, 0, 0), v(1.25, 'triangle', .12, 0, -.3), v(1.5, 'triangle', .1, 0, .3), v(2, 'sine', .06, 0, 0)] },
  electronic: { root: 82.41, lowpass: 800, voices: [v(1, 'sine', .22, 0, 0), v(2, 'sawtooth', .07, -4, -.3), v(3, 'square', .03, 4, .3)], tick: { kind: 'click', bpm: 96, gain: .24 } },
  organic: { root: 146.83, lowpass: 1800, voices: [v(1, 'triangle', .14, 0, 0), v(1.125, 'sine', .06, -4, -.4), v(1.5, 'triangle', .08, 4, .4), v(1.6667, 'sine', .05, 0, 0)], tick: { kind: 'pluck', bpm: 40, gain: .3 } },
  nature: { root: 98, lowpass: 2400, voices: [v(1, 'sine', .08, 0, 0), v(1.5, 'sine', .04, 0, 0)], noise: { gain: .05, bandHz: 1200, q: .7, sweepHz: .07 } },
  rhythmic: { root: 73.42, lowpass: 900, voices: [v(1, 'sine', .22, 0, 0), v(1.5, 'triangle', .08, 0, -.3), v(2, 'sawtooth', .04, 3, .3)], tick: { kind: 'click', bpm: 84, gain: .34 } },
};

// Each need has its own character, not only a brightness: arrive adds a high airy voice and a slow breath,
// deep adds a sub-octave, keeps few voices and darkens, create adds a wide upper voice and drifts most,
// activate adds a high sparkle voice and moves quickly.
const NEED = {
  arrive:   { lp: .85, pulseHz: .06, depth: .09, drift: .25, fade: 20, voices: 3, tickBpm: .8,  tickGain: .6, extra: v(4, 'sine', .035, 0, 0) },
  steady:   { lp: 1,   pulseHz: .12, depth: .05, drift: .35, fade: 10, voices: 4, tickBpm: 1,   tickGain: 1,  extra: null },
  deep:     { lp: .55, pulseHz: 0,   depth: 0,   drift: .12, fade: 14, voices: 2, tickBpm: .5,  tickGain: .2, extra: v(.5, 'sine', .12, 0, 0) },
  activate: { lp: 1.5, pulseHz: 2.2, depth: .22, drift: .5,  fade: 6,  voices: 5, tickBpm: 1.4, tickGain: 1.3, extra: v(8, 'triangle', .06, 0, .4) },
  create:   { lp: 1.15, pulseHz: .07, depth: .1, drift: .9,  fade: 8,  voices: 4, tickBpm: 1,   tickGain: .8, extra: v(2.5, 'triangle', .05, 0, .7) },
  reset:    { lp: 1.1, pulseHz: .2,  depth: .15, drift: .5,  fade: 4,  voices: 4, tickBpm: 1,   tickGain: 1,  extra: null },
} as const;
// Stimulation also scales a high shimmer voice: a lowpass alone changes nothing audible in a palette of pure
// sine tones, which a measurement of the real audio showed. The shimmer makes it audible in every world.
const NEED_SHIMMER: Record<FocusNeed, number> = { arrive: 1, steady: 1, deep: .35, activate: 1.3, create: 1, reset: 1 };
const STIM = {
  low:    { lp: .75, depth: .5,  tick: .5,  drift: .7,  bpm: .85, shimmer: .004 },
  medium: { lp: 1,   depth: 1,   tick: 1,   drift: 1,   bpm: 1,   shimmer: .03 },
  high:   { lp: 1.35, depth: 1.5, tick: 1.4, drift: 1.2, bpm: 1.2, shimmer: .075 },
} as const;
// Which recordings each need leans on (nature world). Stimulation scales the whole mix; verbal tasks keep the
// louder, changing layers (wind, waves) down so they do not compete with reading or writing.
const NATURE_MIX: Record<FocusNeed, RecordedMix> = {
  arrive:   { night: .7, forest: .5 },
  steady:   { forest: .8, wind: .25 },
  deep:     { rain: .8, night: .4 },
  activate: { wind: .6, waves: .5, forest: .3 },
  create:   { forest: .6, waves: .5 },
  reset:    { waves: .8, wind: .3 },
};
const NATURE_STIM: Record<FocusStimulation, number> = { low: .7, medium: 1, high: 1.3 };
const VERBAL: ReadonlySet<FocusTaskKind> = new Set<FocusTaskKind>(['reading', 'writing', 'studying', 'thinking']);

const round = (n: number, d = 3) => Math.round(n * 10 ** d) / 10 ** d;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

function natureMix(input: SoundscapeInput, verbal: boolean): RecordedMix {
  const mix: RecordedMix = {};
  for (const [id, gain] of Object.entries(NATURE_MIX[input.need]) as [RecordedLayerId, number][]) {
    const quiet = verbal && (id === 'wind' || id === 'waves') ? .7 : 1;
    mix[id] = round(clamp(gain * NATURE_STIM[input.stimulation] * quiet, 0, 1.2));
  }
  return mix;
}

export function focusSoundscapeSpec(input: SoundscapeInput): SoundscapeSpec {
  const palette = PALETTE[input.world];
  const need = NEED[input.need];
  const stim = STIM[input.stimulation];
  const verbal = VERBAL.has(input.task);
  const taskLp = verbal ? .9 : 1;
  const taskTick = verbal ? .5 : 1;
  const taskDrift = input.task === 'creative-work' ? 1.2 : 1;
  // A world with no events of its own still gets a faint one when the need is to activate, so that need
  // is audible in every world.
  const baseTick: TickSpec | null = palette.tick ?? (input.need === 'activate' ? { kind: 'soft', bpm: 54, gain: .14 } : null);
  const tick = baseTick && {
    kind: baseTick.kind,
    bpm: round(clamp(baseTick.bpm * need.tickBpm * stim.bpm, 20, 140), 2),
    gain: round(baseTick.gain * need.tickGain * stim.tick * taskTick),
  };
  return {
    world: input.world,
    recorded: input.world === 'nature' ? natureMix(input, verbal) : null,
    root: palette.root,
    voices: [...palette.voices.slice(0, need.voices), ...(need.extra ? [need.extra] : []), v(6, 'sine', round(stim.shimmer * NEED_SHIMMER[input.need], 4), 0, 0)].map(voice => ({ ...voice })),
    lowpassHz: round(clamp(palette.lowpass * need.lp * stim.lp * taskLp, 300, 5000), 1),
    pulseHz: need.pulseHz,
    pulseDepth: round(clamp(need.depth * stim.depth, 0, .3)),
    driftDepth: round(clamp(need.drift * stim.drift * taskDrift, 0, 1.5)),
    noise: palette.noise ? { ...palette.noise, gain: round(palette.noise.gain * (input.need === 'activate' ? 1.4 : input.need === 'deep' ? .7 : 1) * stim.tick) } : null,
    tick,
    fadeInSec: need.fade,
  };
}

/** Whether a live change can be applied smoothly to the running sound, or needs a new one (a different palette). */
export function soundscapeNeedsRebuild(a: SoundscapeSpec, b: SoundscapeSpec): boolean {
  return a.world !== b.world || a.voices.length !== b.voices.length ||
    (a.noise === null) !== (b.noise === null) ||
    (a.tick?.kind ?? null) !== (b.tick?.kind ?? null) ||
    a.voices.some((voice, index) => voice.type !== b.voices[index]?.type);
}
