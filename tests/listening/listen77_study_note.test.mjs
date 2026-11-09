import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const src = readFileSync(new URL('../../app/listen/SoundStudioField.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../app/listen/listen.module.css', import.meta.url), 'utf8');

test('choosing View study on a study without sound shows a visible note on that card', () => {
  assert.match(src, /selectedWork && !work\.manifest && \(/);
  assert.match(src, /data-sound-studio-study-note=\{work\.id\}/);
  assert.match(css, /\.studioWorkNote\{/);
});

test('the note is honest: it says there is no playable sound, and appears only for studies without a manifest', () => {
  assert.match(src, /does not have playable sound in this build/);
  assert.ok(!/studioWorkNote[^]{0,200}work\.manifest \?/.test(src));
});
