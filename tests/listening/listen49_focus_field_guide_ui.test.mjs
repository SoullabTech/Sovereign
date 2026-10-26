import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  FOCUS_GUIDE_FORMAT,
  FOCUS_GUIDE_INPUT_AUTHORITY,
  suggestFocusWorlds,
} from '../../lib/listening/focusFieldGuide.ts';

const root = path.resolve(import.meta.dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const desk = read('components/listening/FocusFieldDesk.tsx');
const provider = read('components/listening/PersistentListeningProvider.tsx');
const room = read('app/listen/ListenRoom.tsx');
const guide = read('lib/listening/focusFieldGuide.ts');

test('Guide Me is deterministic and uses current visible choices only', () => {
  const first = suggestFocusWorlds({ task:'writing', focusNeed:'deep', stimulation:'low' });
  const second = suggestFocusWorlds({ task:'writing', focusNeed:'deep', stimulation:'low' });
  assert.deepEqual(first, second);
  assert.equal(first.format, FOCUS_GUIDE_FORMAT);
  assert.equal(first.inputAuthority, FOCUS_GUIDE_INPUT_AUTHORITY);
  assert.equal(first.primary, 'ambient');
  assert.equal(first.alternatives.length, 2);
  assert.match(first.explanation, /Nothing in your work or history was inspected/);
});

test('different visible needs can produce genuinely different musical worlds', () => {
  assert.equal(suggestFocusWorlds({
    task:'administration', focusNeed:'activate', stimulation:'high',
  }).primary, 'rhythmic');
  assert.equal(suggestFocusWorlds({
    task:'creative-work', focusNeed:'create', stimulation:'medium',
  }).primary, 'cinematic');
  const reset = suggestFocusWorlds({
    task:'reading', focusNeed:'reset', stimulation:'low',
  }).primary;
  assert.ok(['nature', 'ambient'].includes(reset));
  assert.notEqual(reset, 'rhythmic');
});

test('unsupported choices are refused rather than silently classified', () => {
  assert.throws(() => suggestFocusWorlds({
    task:'writing', focusNeed:'hyperfocus', stimulation:'medium',
  }), /Focus need is not supported/);
});

test('Guide Me implementation has no profile, history, model or network mechanism', () => {
  assert.doesNotMatch(guide, /fetch\s*\(|apiFetch|localStorage|sessionStorage|indexedDB|cookie|memberId|userId/i);
  assert.doesNotMatch(guide, /OpenAI|Anthropic|Ollama|embedding/i);
  assert.doesNotMatch(guide, /input\.(member|identity|history|biometric|keystroke|productivity)/i);
  assert.match(guide, /current-visible-choices-only/);
});

test('Focus Field UI exposes Guide Me and Browse without starting audio', () => {
  assert.match(desk, />Guide me</);
  assert.match(desk, />Browse</);
  assert.match(desk, /Start focus session/);
  assert.match(desk, /No work inspection · no productivity score/);
  assert.match(desk, /Music never starts automatically/);
  assert.doesNotMatch(desk, /playSketch|playLocalFile|new AudioContext|requestAudioFocus|acquireAudioOutput/);
  assert.doesNotMatch(desk, /localStorage|sessionStorage|indexedDB|fetch\s*\(|apiFetch/);
});

test('UI keeps focus need and musical world as independent member choices', () => {
  assert.match(desk, /FOCUS_NEEDS\.map/);
  assert.match(desk, /FOCUS_MUSICAL_WORLDS\.map/);
  assert.match(desk, /retuneFocusSession\(next\)/);
  assert.match(desk, /without resetting its clock or task/);
});

test('persistent provider owns the in-memory session across approved rooms', () => {
  assert.match(provider, /focusSession:\s*FocusSession \| null/);
  assert.match(provider, /startFocusSession:\s*\(plan: FocusSessionPlanInput\)/);
  assert.match(provider, /pauseFocusSession/);
  assert.match(provider, /resumeFocusSession/);
  assert.match(provider, /retuneFocusSession/);
  assert.match(provider, /data-focus-field-dock="true"/);
  assert.match(provider, /reader-narration-preflight[\s\S]*interruptCurrentFocus\('reader'\)/);
  assert.match(provider, /maia-speech-preflight[\s\S]*interruptCurrentFocus\('maia'\)/);
  assert.match(provider, /SOULLAB_SESSION_END_EVENT[\s\S]*commitFocusSession\(null\)/);
});

test('no interruption or completion can automatically restart sound', () => {
  assert.match(provider, /resumeCurrentFocus/);
  assert.match(provider, /resumeFocusSessionModel\(current, new Date\(\), true\)/);
  const completionPath = provider.match(/const next = advanceFocusSessionModel\(current, now\);[\s\S]*?commitFocusSession\(next\);/)?.[0] ?? '';
  assert.match(completionPath, /next\.status === 'completed'[\s\S]*pause\(\)/);
  assert.doesNotMatch(completionPath, /playSketch|playLocalFile|resumeCurrentFocus/);
});

test('Listen Room includes Focus Field inside the existing product surface', () => {
  assert.match(room, /import FocusFieldDesk/);
  assert.match(room, /<FocusFieldDesk \/>/);
  assert.match(room, /href:'#focus-field'/);
  assert.doesNotMatch(room, /focusatwill|focus\.music/i);
});
