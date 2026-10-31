import test from 'node:test';
import assert from 'node:assert/strict';
import { FOCUS_MUSICAL_WORLDS, FOCUS_NEEDS, FOCUS_STIMULATION_LEVELS, FOCUS_TASK_KINDS } from '../../lib/listening/focusFieldSession.ts';
import { focusSoundscapeSpec, soundscapeNeedsRebuild } from '../../lib/listening/focusSoundscape.ts';

const spec = (need, stimulation, world, task = 'writing') => focusSoundscapeSpec({ need, stimulation, world, task });
const key = s => JSON.stringify(s);

test('every need × stimulation × world is a different sound (no choice is decoration)', () => {
  const seen = new Map();
  for (const world of FOCUS_MUSICAL_WORLDS) for (const need of FOCUS_NEEDS) for (const stim of FOCUS_STIMULATION_LEVELS) {
    const k = key(spec(need, stim, world));
    assert.ok(!seen.has(k), `${need}/${stim}/${world} sounds the same as ${seen.get(k)}`);
    seen.set(k, `${need}/${stim}/${world}`);
  }
  assert.equal(seen.size, FOCUS_MUSICAL_WORLDS.length * FOCUS_NEEDS.length * FOCUS_STIMULATION_LEVELS.length);
});

test('the task changes the sound too, and the same choices always give the same sound', () => {
  assert.notEqual(key(spec('steady', 'medium', 'rhythmic', 'writing')), key(spec('steady', 'medium', 'rhythmic', 'coding')));
  assert.notEqual(key(spec('steady', 'medium', 'ambient', 'writing')), key(spec('steady', 'medium', 'ambient', 'creative-work')));
  for (const task of FOCUS_TASK_KINDS) assert.equal(key(spec('deep', 'low', 'nature', task)), key(spec('deep', 'low', 'nature', task)));
});

test('more stimulation is never quieter, duller or calmer — in every world and need', () => {
  for (const world of FOCUS_MUSICAL_WORLDS) for (const need of FOCUS_NEEDS) {
    const [lo, mid, hi] = FOCUS_STIMULATION_LEVELS.map(s => spec(need, s, world));
    for (const field of ['lowpassHz', 'pulseDepth', 'driftDepth'])
      assert.ok(lo[field] <= mid[field] && mid[field] <= hi[field], `${world}/${need} ${field}`);
    if (lo.tick) { assert.ok(lo.tick.gain <= mid.tick.gain && mid.tick.gain <= hi.tick.gain); assert.ok(lo.tick.bpm <= hi.tick.bpm); }
  }
});

test('the needs order as their names say: deep is the softest tone, activate the brightest and the busiest', () => {
  for (const world of FOCUS_MUSICAL_WORLDS) {
    const by = Object.fromEntries(FOCUS_NEEDS.map(n => [n, spec(n, 'medium', world)]));
    assert.equal(Math.min(...FOCUS_NEEDS.map(n => by[n].lowpassHz)), by.deep.lowpassHz, `${world}: deep softest`);
    assert.equal(Math.max(...FOCUS_NEEDS.map(n => by[n].lowpassHz)), by.activate.lowpassHz, `${world}: activate brightest`);
    assert.ok(by.activate.pulseHz > by.steady.pulseHz && by.steady.pulseHz > by.deep.pulseHz, `${world}: motion`);
    assert.ok(by.arrive.fadeInSec > by.reset.fadeInSec, `${world}: arrive opens slowest`);
    assert.ok(by.activate.tick, `${world}: activate always has events`);
  }
});

test('worlds are distinct palettes, and verbal tasks keep events quieter', () => {
  const roots = new Set(FOCUS_MUSICAL_WORLDS.map(w => spec('steady', 'medium', w).root));
  assert.ok(roots.size >= 5);
  assert.ok(spec('steady', 'medium', 'rhythmic', 'writing').tick.gain < spec('steady', 'medium', 'rhythmic', 'coding').tick.gain);
  assert.ok(spec('steady', 'medium', 'nature').noise && !spec('steady', 'medium', 'ambient').noise);
});

test('sounds stay in a safe range and carry no claim', () => {
  for (const world of FOCUS_MUSICAL_WORLDS) for (const need of FOCUS_NEEDS) for (const stim of FOCUS_STIMULATION_LEVELS) {
    const s = spec(need, stim, world);
    assert.ok(s.lowpassHz >= 300 && s.lowpassHz <= 5000);
    assert.ok(s.pulseDepth <= .3 && s.pulseHz <= 3, 'no strobing-rate modulation');
    assert.ok(s.voices.every(v => v.gain > 0 && v.gain <= .25));
    assert.ok(!s.tick || s.tick.bpm <= 140);
  }
});

test('a live change is smooth within a palette and rebuilds only across palettes', () => {
  assert.equal(soundscapeNeedsRebuild(spec('deep', 'low', 'ambient'), spec('deep', 'high', 'ambient')), false);
  assert.equal(soundscapeNeedsRebuild(spec('steady', 'low', 'ambient'), spec('steady', 'low', 'cinematic')), true);
  assert.equal(soundscapeNeedsRebuild(spec('deep', 'medium', 'ambient'), spec('activate', 'medium', 'ambient')), true); // gains a tick layer / more voices
});

import fs from 'node:fs';
const read = file => fs.readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8');
const code = text => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/([^:])\/\/.*$/gm, '$1');

test('the engine is pure synthesis: deterministic, no files, no network, no microphone, no claim', () => {
  for (const file of ['lib/listening/soundscapeEngine.ts', 'lib/listening/focusSoundscape.ts']) {
    const text = code(read(file));
    assert.doesNotMatch(text, /Math\.random|fetch\s*\(|XMLHttpRequest|getUserMedia|new Audio\(|<audio|localStorage|sessionStorage/, file);
  }
  const claims = code(read('lib/listening/focusSoundscape.ts')) + read('app/listen/FocusSoundPicker.tsx');
  assert.doesNotMatch(claims, /\b(improv|cure|treat|therap|clinical|proven|boost|enhance)\w*/i);
});

test('the soundscape plays only after the member\'s own Play, and the Focus desk stays audio-free', () => {
  const desk = code(read('components/listening/FocusFieldDesk.tsx'));
  assert.doesNotMatch(desk, /playSketch|playExperienceMedia|playLocalFile|playFocusSound|buildSoundscape|AudioContext/);
  assert.match(desk, /setFocusDraft\?\.\(/); // the desk shares its choices, nothing more
  const picker = code(read('app/listen/FocusSoundPicker.tsx'));
  assert.match(picker, /onClick=\{\(\) => void play\(\)\}/);
  assert.doesNotMatch(picker, /useEffect/);
});
