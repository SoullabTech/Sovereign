import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  FOCUS_CUSTOM_MINUTES_MAX,
  FOCUS_CUSTOM_MINUTES_MIN,
  FOCUS_ENTRY_MODES,
  FOCUS_FEEDBACK_OUTCOMES,
  FOCUS_FEEDBACK_TAGS,
  FOCUS_FIELD_COMBINATION_FORMAT,
  FOCUS_FIELD_SESSION_FORMAT,
  FOCUS_MUSICAL_WORLDS,
  FOCUS_NEEDS,
  FOCUS_PRESET_MINUTES,
  FOCUS_SESSION_MEDIA_AUTHORITY,
  FOCUS_STIMULATION_LEVELS,
  FOCUS_TASK_KINDS,
  advanceFocusSession,
  createFocusSession,
  focusElapsedMs,
  focusRemainingMs,
  interruptFocusSession,
  isFocusSessionTerminal,
  recordFocusFeedback,
  resumeFocusSession,
  retuneFocusSession,
  saveFocusCombination,
  startFocusSession,
  stopFocusSession,
  validateFocusDuration,
  validateFocusSessionPlan,
} from '../../lib/listening/focusFieldSession.ts';

const root = path.resolve(import.meta.dirname, '../..');
const source = fs.readFileSync(path.join(root, 'lib/listening/focusFieldSession.ts'), 'utf8');
const T0 = '2026-10-26T14:00:00.000Z';

function plan(overrides = {}) {
  return {
    task: 'writing',
    taskLabel: 'Chapter opening',
    focusNeed: 'deep',
    musicalWorld: 'classical',
    stimulation: 'medium',
    duration: { mode: 'preset', minutes: 25 },
    entryMode: 'browse',
    ...overrides,
  };
}

function session(overrides = {}) {
  return createFocusSession(plan(overrides), {
    id: 'focus-session-01',
    at: T0,
  });
}

test('founder-ratified Focus Field taxonomies remain exact and independent', () => {
  assert.deepEqual([...FOCUS_NEEDS], ['arrive', 'steady', 'deep', 'activate', 'create', 'reset']);
  assert.deepEqual([...FOCUS_MUSICAL_WORLDS], [
    'classical', 'ambient', 'cinematic', 'electronic', 'organic', 'nature', 'rhythmic',
  ]);
  assert.deepEqual([...FOCUS_TASK_KINDS], [
    'writing', 'reading', 'coding', 'studying', 'administration',
    'creative-work', 'thinking', 'open-work',
  ]);
  assert.deepEqual([...FOCUS_STIMULATION_LEVELS], ['low', 'medium', 'high']);
  assert.deepEqual([...FOCUS_ENTRY_MODES], ['guide-me', 'browse']);
  assert.deepEqual([...FOCUS_PRESET_MINUTES], [25, 50, 90]);
  assert.deepEqual([...FOCUS_FEEDBACK_OUTCOMES], ['helped', 'neutral', 'distracting']);
  assert.equal(FOCUS_CUSTOM_MINUTES_MIN, 5);
  assert.equal(FOCUS_CUSTOM_MINUTES_MAX, 240);
});

test('duration accepts the three presets, bounded custom time and genuinely untimed work', () => {
  for (const minutes of FOCUS_PRESET_MINUTES)
    assert.deepEqual(validateFocusDuration({ mode: 'preset', minutes }), { mode: 'preset', minutes });
  assert.deepEqual(validateFocusDuration({ mode: 'custom', minutes: 5 }), { mode: 'custom', minutes: 5 });
  assert.deepEqual(validateFocusDuration({ mode: 'custom', minutes: 240 }), { mode: 'custom', minutes: 240 });
  assert.deepEqual(validateFocusDuration({ mode: 'untimed', minutes: null }), { mode: 'untimed', minutes: null });
  for (const bad of [
    { mode: 'preset', minutes: 30 },
    { mode: 'custom', minutes: 4 },
    { mode: 'custom', minutes: 241 },
    { mode: 'custom', minutes: 25.5 },
    { mode: 'untimed', minutes: 0 },
  ]) assert.throws(() => validateFocusDuration(bad));
});

test('task labels are optional, normalized, bounded and never mistaken for task authority', () => {
  const checked = validateFocusSessionPlan(plan({ taskLabel: '  Draft   the   opening  ' }));
  assert.equal(checked.taskLabel, 'Draft the opening');
  assert.equal(validateFocusSessionPlan(plan({ taskLabel: null })).taskLabel, null);
  assert.throws(() => validateFocusSessionPlan(plan({ taskLabel: 'x'.repeat(121) })));
  assert.throws(() => validateFocusSessionPlan(plan({ taskLabel: 'hidden\u0000control' })));
});

test('classical, ambient and cinematic remain choices within the same Deep need', () => {
  const worlds = ['classical', 'ambient', 'cinematic'].map(musicalWorld =>
    validateFocusSessionPlan(plan({ focusNeed: 'deep', musicalWorld })).musicalWorld);
  assert.deepEqual(worlds, ['classical', 'ambient', 'cinematic']);
});

test('a created session is ready, inert and grants no music or media authority', () => {
  const created = session();
  assert.equal(created.format, FOCUS_FIELD_SESSION_FORMAT);
  assert.equal(created.status, 'ready');
  assert.equal(created.elapsedMs, 0);
  assert.equal(created.activeSince, null);
  assert.equal(FOCUS_SESSION_MEDIA_AUTHORITY, 'none');
  assert.equal('channelId' in created.plan, false);
  assert.equal('trackId' in created.plan, false);
  assert.equal('mediaUrl' in created.plan, false);
});

test('start is explicit and only a ready session may begin', () => {
  const created = session();
  const started = startFocusSession(created, '2026-10-26T14:01:00.000Z');
  assert.equal(started.status, 'running');
  assert.equal(started.startedAt, '2026-10-26T14:01:00.000Z');
  assert.equal(started.activeSince, started.startedAt);
  assert.throws(() => startFocusSession(started, '2026-10-26T14:02:00.000Z'));
});

test('timed work reports elapsed and remaining time without hidden timers', () => {
  const started = startFocusSession(session(), T0);
  assert.equal(focusElapsedMs(started, '2026-10-26T14:10:00.000Z'), 10 * 60_000);
  assert.equal(focusRemainingMs(started, '2026-10-26T14:10:00.000Z'), 15 * 60_000);
  const completed = advanceFocusSession(started, '2026-10-26T14:25:00.000Z');
  assert.equal(completed.status, 'completed');
  assert.equal(completed.elapsedMs, 25 * 60_000);
  assert.equal(completed.endReason, 'timer-complete');
  assert.equal(isFocusSessionTerminal(completed), true);
});

test('untimed work never completes itself', () => {
  const created = session({ duration: { mode: 'untimed', minutes: null } });
  const started = startFocusSession(created, T0);
  const later = advanceFocusSession(started, '2026-10-27T14:00:00.000Z');
  assert.equal(later.status, 'running');
  assert.equal(focusRemainingMs(later, '2026-10-27T14:00:00.000Z'), null);
});

test('Reader and MAIA interruption pause the timer and always require a fresh member act', () => {
  const started = startFocusSession(session(), T0);
  const readerPause = interruptFocusSession(started, 'reader', '2026-10-26T14:05:00.000Z');
  assert.equal(readerPause.status, 'paused');
  assert.equal(readerPause.interruptionReason, 'reader');
  assert.equal(readerPause.elapsedMs, 5 * 60_000);
  assert.equal(readerPause.resumeRequiresMemberAction, true);
  assert.throws(() => resumeFocusSession(readerPause, '2026-10-26T14:06:00.000Z', false));
  const resumed = resumeFocusSession(readerPause, '2026-10-26T14:06:00.000Z', true);
  const maiaPause = interruptFocusSession(resumed, 'maia', '2026-10-26T14:08:00.000Z');
  assert.equal(maiaPause.status, 'paused');
  assert.equal(maiaPause.elapsedMs, 7 * 60_000);
  assert.equal(maiaPause.resumeRequiresMemberAction, true);
});

test('changing musical world or stimulation preserves task, timer and lifecycle', () => {
  const started = startFocusSession(session(), T0);
  const retuned = retuneFocusSession(started, {
    musicalWorld: 'ambient',
    stimulation: 'low',
  }, '2026-10-26T14:09:00.000Z');
  assert.equal(retuned.status, 'running');
  assert.equal(retuned.plan.task, 'writing');
  assert.equal(retuned.plan.taskLabel, 'Chapter opening');
  assert.equal(retuned.plan.duration.minutes, 25);
  assert.equal(retuned.activeSince, T0);
  assert.equal(retuned.plan.musicalWorld, 'ambient');
  assert.equal(retuned.plan.stimulation, 'low');
  assert.equal(focusElapsedMs(retuned, '2026-10-26T14:09:00.000Z'), 9 * 60_000);
});

test('authority loss stops rather than pauses or silently preserving a resumable session', () => {
  const started = startFocusSession(session(), T0);
  for (const reason of ['session-end', 'member-switch', 'rights-revoked', 'source-unavailable']) {
    const stopped = stopFocusSession(started, '2026-10-26T14:04:00.000Z', reason);
    assert.equal(stopped.status, 'stopped', reason);
    assert.equal(stopped.endReason, reason);
    assert.equal(stopped.activeSince, null);
    assert.equal(stopped.resumeRequiresMemberAction, false);
    assert.throws(() => resumeFocusSession(stopped, '2026-10-26T14:05:00.000Z', true));
  }
});

test('member Stop is final and preserves truthful elapsed time', () => {
  const started = startFocusSession(session(), T0);
  const stopped = stopFocusSession(started, '2026-10-26T14:03:30.000Z');
  assert.equal(stopped.status, 'stopped');
  assert.equal(stopped.endReason, 'member-stop');
  assert.equal(stopped.elapsedMs, 210_000);
  assert.equal(stopFocusSession(stopped, '2026-10-26T14:04:00.000Z'), stopped);
});

test('feedback is private, bounded and accepted only after the session ends', () => {
  const started = startFocusSession(session(), T0);
  assert.throws(() => recordFocusFeedback(started, {
    outcome: 'helped', at: '2026-10-26T14:02:00.000Z',
  }));
  const stopped = stopFocusSession(started, '2026-10-26T14:05:00.000Z');
  const withFeedback = recordFocusFeedback(stopped, {
    outcome: 'helped',
    tags: ['style-worked-well', 'needed-more-energy'],
    at: '2026-10-26T14:06:00.000Z',
  });
  assert.deepEqual(withFeedback.feedback?.tags, ['style-worked-well', 'needed-more-energy']);
  assert.throws(() => recordFocusFeedback(stopped, {
    outcome: 'neutral',
    tags: ['style-worked-well', 'style-worked-well'],
    at: '2026-10-26T14:06:00.000Z',
  }));
  assert.throws(() => recordFocusFeedback(stopped, {
    outcome: 'distracting',
    tags: FOCUS_FEEDBACK_TAGS.slice(0, 5),
    at: '2026-10-26T14:06:00.000Z',
  }));
});

test('saved combinations preserve broad choices but exclude task text and session history', () => {
  const started = startFocusSession(session(), T0);
  const paused = interruptFocusSession(started, 'reader', '2026-10-26T14:04:00.000Z');
  const saved = saveFocusCombination(paused, {
    id: 'focus-combo-01',
    name: 'Deep classical writing',
    at: '2026-10-26T14:05:00.000Z',
  });
  assert.equal(saved.format, FOCUS_FIELD_COMBINATION_FORMAT);
  assert.equal(saved.task, 'writing');
  assert.equal(saved.focusNeed, 'deep');
  assert.equal(saved.musicalWorld, 'classical');
  assert.equal('taskLabel' in saved, false);
  assert.equal('elapsedMs' in saved, false);
  assert.equal('interruptionReason' in saved, false);
  assert.equal('feedback' in saved, false);
  assert.equal('memberId' in saved, false);
});

test('terminal sessions cannot be retuned and transition time is monotonic', () => {
  const created = session();
  assert.equal(created.updatedAt, T0);
  assert.throws(() => startFocusSession(created, '2026-10-26T13:59:59.000Z'));
  const started = startFocusSession(created, T0);
  const paused = interruptFocusSession(started, 'reader', '2026-10-26T14:05:00.000Z');
  assert.equal(paused.updatedAt, '2026-10-26T14:05:00.000Z');
  assert.throws(() => resumeFocusSession(paused, '2026-10-26T14:04:59.000Z', true));
  assert.throws(() => saveFocusCombination(paused, {
    id: 'focus-combo-02',
    name: 'Impossible earlier save',
    at: '2026-10-26T14:04:59.000Z',
  }));
  const stopped = stopFocusSession(paused, '2026-10-26T14:06:00.000Z');
  assert.throws(() => retuneFocusSession(
    stopped,
    { musicalWorld: 'nature' },
    '2026-10-26T14:07:00.000Z',
  ));
});

test('model source contains no playback, network, storage, identity or biometric mechanism', () => {
  for (const forbidden of [
    /\bfetch\s*\(/,
    /AudioContext|HTMLAudioElement|navigator\.locks|BroadcastChannel/,
    /localStorage|sessionStorage|indexedDB/,
    /memberId|sessionToken|x-member-id|x-session-token/,
    /heartRate|keystroke|facial|transcript|pageContent/,
    /setInterval|setTimeout/,
  ]) assert.doesNotMatch(source, forbidden);
  assert.match(source, /FOCUS_SESSION_MEDIA_AUTHORITY = 'none'/);
});
