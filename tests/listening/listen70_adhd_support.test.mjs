import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { focusTimeLabel, gentlePosition } from '../../lib/listening/focusTimeDisplay.ts';

const read = file => fs.readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8');
const code = text => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

test('gentle position never shows a number, a negative state or a countdown', () => {
  assert.equal(gentlePosition(0, 600_000), 'Early');
  assert.equal(gentlePosition(300_000, 600_000), 'Middle');
  assert.equal(gentlePosition(590_000, 600_000), 'Nearly there');
  assert.equal(gentlePosition(900_000, 600_000), 'Nearly there'); // overrun is still gentle, never "over"
  assert.equal(gentlePosition(5, null), 'Here');
  for (const e of [0, 1, 299_999, 600_000, 9_999_999]) {
    assert.doesNotMatch(gentlePosition(e, 600_000), /[0-9:]|late|over|behind|left/i);
  }
});

test('time display modes: countdown is the default text, none shows nothing', () => {
  const input = { elapsedMs: 120_000, totalMs: 600_000, countdownLabel: '8:00' };
  assert.equal(focusTimeLabel('countdown', input), '8:00');
  assert.equal(focusTimeLabel('gentle', input), 'Early');
  assert.equal(focusTimeLabel('none', input), '');
});

test('the ADHD section makes no clinical or effect claim and never infers or stores', () => {
  const full = code(read('app/listen/FocusAdhdSupport.tsx'));
  // The one sentence allowed to name diagnosis, treatment and scoring — in order to deny them.
  const DISCLAIMER = 'This is not a diagnosis, a screening or a treatment, and nothing here is scored or remembered beyond this session.';
  assert.ok(full.includes(DISCLAIMER), 'the exact not-a-diagnosis statement is present');
  const text = full.replace(DISCLAIMER, '');
  assert.doesNotMatch(text, /\b(cure[sd]?|treat(s|ed|ment)?\b|therap|clinical|proven|improv(e|es|ed|ing)|symptom|disorder|medicat|neuro|diagnos|screening)/i);
  assert.doesNotMatch(text, /localStorage|sessionStorage|indexedDB|fetch\s*\(|apiFetch|score|streak|reward|badge/i);
  const occurrences = (text.match(/ADHD/g) || []).length;
  assert.ok(occurrences <= 1, `the word appears only in the section's own heading (found ${occurrences})`);
});

test('every action is a member tap and starts no sound; the section never touches the player', () => {
  const text = code(read('app/listen/FocusAdhdSupport.tsx'));
  assert.doesNotMatch(text, /playSketch|playExperienceMedia|playLocalFile|new AudioContext|new Audio\(|<audio/);
  assert.match(text, /disabled=\{!transport \|\| running \|\| paused\}/);
  assert.match(text, /transport\.startFocusSession/);
  assert.match(text, /transport\?\.resumeFocusSession\(\)/);
  assert.match(text, /completed/);
  const desk = code(read('components/listening/FocusFieldDesk.tsx'));
  assert.doesNotMatch(desk, /playSketch|playExperienceMedia|playLocalFile|new AudioContext/); // LISTEN-49 guard intact
});

test('Five more minutes needs a completed session and extends nothing automatically', () => {
  const text = code(read('app/listen/FocusAdhdSupport.tsx'));
  assert.match(text, /if \(!transport \|\| !session \|\| !completed\) return/);
  assert.match(text, /duration: \{ mode: 'custom', minutes: 5 \}/);
});

test('the player never claims a level change the device will not make', () => {
  const provider = code(read('components/listening/PersistentListeningProvider.tsx'));
  const dock = code(read('components/listening/PersistentListeningDock.tsx'));
  assert.match(provider, /element\.volume = 0\.5/);
  assert.match(provider, /volumeAdjustable/);
  assert.match(dock, /volumeAdjustable \? \(/);
  assert.match(dock, /data-listen-volume-fixed/);
  assert.match(dock, /volumeAdjustable \? sleepAction : 'stop'/);
});
