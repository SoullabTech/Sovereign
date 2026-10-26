/**
 * LISTEN-48 · Focus Field session model.
 *
 * This module models a member-directed work session. It does not play audio,
 * recommend a track, inspect work, infer productivity, diagnose attention, or
 * grant media rights. Playback remains owned by the existing Sound Field
 * transport and its independent identity, rights, and output-authority gates.
 */

export const FOCUS_FIELD_SESSION_FORMAT = 'SOULLAB_FOCUS_FIELD_SESSION_V1' as const;
export const FOCUS_FIELD_COMBINATION_FORMAT = 'SOULLAB_FOCUS_FIELD_COMBINATION_V1' as const;
export const FOCUS_SESSION_MEDIA_AUTHORITY = 'none' as const;

export const FOCUS_NEEDS = [
  'arrive', 'steady', 'deep', 'activate', 'create', 'reset',
] as const;
export type FocusNeed = typeof FOCUS_NEEDS[number];

export const FOCUS_MUSICAL_WORLDS = [
  'classical', 'ambient', 'cinematic', 'electronic',
  'organic', 'nature', 'rhythmic',
] as const;
export type FocusMusicalWorld = typeof FOCUS_MUSICAL_WORLDS[number];

export const FOCUS_TASK_KINDS = [
  'writing', 'reading', 'coding', 'studying', 'administration',
  'creative-work', 'thinking', 'open-work',
] as const;
export type FocusTaskKind = typeof FOCUS_TASK_KINDS[number];

export const FOCUS_STIMULATION_LEVELS = ['low', 'medium', 'high'] as const;
export type FocusStimulation = typeof FOCUS_STIMULATION_LEVELS[number];

export const FOCUS_ENTRY_MODES = ['guide-me', 'browse'] as const;
export type FocusEntryMode = typeof FOCUS_ENTRY_MODES[number];

export const FOCUS_PRESET_MINUTES = [25, 50, 90] as const;
export type FocusPresetMinutes = typeof FOCUS_PRESET_MINUTES[number];
export const FOCUS_CUSTOM_MINUTES_MIN = 5;
export const FOCUS_CUSTOM_MINUTES_MAX = 240;

export type FocusDuration =
  | { readonly mode: 'preset'; readonly minutes: FocusPresetMinutes }
  | { readonly mode: 'custom'; readonly minutes: number }
  | { readonly mode: 'untimed'; readonly minutes: null };

export interface FocusSessionPlanInput {
  readonly task: FocusTaskKind;
  readonly taskLabel?: string | null;
  readonly focusNeed: FocusNeed;
  readonly musicalWorld: FocusMusicalWorld;
  readonly stimulation: FocusStimulation;
  readonly duration: FocusDuration;
  readonly entryMode: FocusEntryMode;
}

export interface FocusSessionPlan {
  readonly task: FocusTaskKind;
  readonly taskLabel: string | null;
  readonly focusNeed: FocusNeed;
  readonly musicalWorld: FocusMusicalWorld;
  readonly stimulation: FocusStimulation;
  readonly duration: FocusDuration;
  readonly entryMode: FocusEntryMode;
}

export type FocusSessionStatus =
  | 'ready'
  | 'running'
  | 'paused'
  | 'completed'
  | 'stopped';

export const FOCUS_INTERRUPTION_REASONS = [
  'member', 'reader', 'maia', 'protected-live', 'device', 'route', 'error',
] as const;
export type FocusInterruptionReason = typeof FOCUS_INTERRUPTION_REASONS[number];

export const FOCUS_END_REASONS = [
  'timer-complete', 'member-stop', 'session-end', 'member-switch',
  'rights-revoked', 'source-unavailable',
] as const;
export type FocusEndReason = typeof FOCUS_END_REASONS[number];

export const FOCUS_FEEDBACK_OUTCOMES = ['helped', 'neutral', 'distracting'] as const;
export type FocusFeedbackOutcome = typeof FOCUS_FEEDBACK_OUTCOMES[number];

export const FOCUS_FEEDBACK_TAGS = [
  'needed-more-energy',
  'needed-less-movement',
  'music-too-noticeable',
  'style-worked-well',
  'session-too-short',
  'session-too-long',
] as const;
export type FocusFeedbackTag = typeof FOCUS_FEEDBACK_TAGS[number];

export interface FocusSessionFeedback {
  readonly outcome: FocusFeedbackOutcome;
  readonly tags: readonly FocusFeedbackTag[];
  readonly recordedAt: string;
}

export interface FocusSession {
  readonly format: typeof FOCUS_FIELD_SESSION_FORMAT;
  readonly id: string;
  readonly plan: FocusSessionPlan;
  readonly status: FocusSessionStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly startedAt: string | null;
  readonly activeSince: string | null;
  readonly elapsedMs: number;
  readonly endedAt: string | null;
  readonly interruptionReason: FocusInterruptionReason | null;
  readonly endReason: FocusEndReason | null;
  readonly resumeRequiresMemberAction: boolean;
  readonly feedback: FocusSessionFeedback | null;
  readonly revision: number;
}

export interface FocusSavedCombination {
  readonly format: typeof FOCUS_FIELD_COMBINATION_FORMAT;
  readonly id: string;
  readonly name: string;
  readonly task: FocusTaskKind;
  readonly focusNeed: FocusNeed;
  readonly musicalWorld: FocusMusicalWorld;
  readonly stimulation: FocusStimulation;
  readonly duration: FocusDuration;
  readonly savedAt: string;
}

export type FocusRetune = Partial<Pick<
  FocusSessionPlan,
  'focusNeed' | 'musicalWorld' | 'stimulation'
>>;

const SESSION_ID = /^[a-z0-9][a-z0-9_-]{7,63}$/;
const TASK_LABEL_MAX = 120;
const COMBINATION_NAME_MAX = 60;
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;

function assertChoice<T extends string>(
  value: unknown,
  choices: readonly T[],
  label: string,
): T {
  if (typeof value !== 'string' || !choices.includes(value as T))
    throw new Error(`${label} is not supported.`);
  return value as T;
}

function cleanText(value: unknown, label: string, max: number): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') throw new Error(`${label} must be text.`);
  const cleaned = value.trim().replace(/\s+/g, ' ');
  if (!cleaned) return null;
  if (CONTROL_CHARACTERS.test(cleaned)) throw new Error(`${label} contains control characters.`);
  if (cleaned.length > max) throw new Error(`${label} is too long.`);
  return cleaned;
}

function exactTime(value: string | Date, label = 'time'): string {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (!Number.isFinite(date.getTime())) throw new Error(`${label} is invalid.`);
  return date.toISOString();
}

function timeMs(value: string | Date, label = 'time'): number {
  return new Date(exactTime(value, label)).getTime();
}

function assertForwardTime(session: FocusSession, at: string): void {
  if (new Date(at).getTime() < new Date(session.updatedAt).getTime())
    throw new Error('A session transition cannot precede its last accepted transition.');
}

function checkedSessionId(value: unknown, label = 'session id'): string {
  if (typeof value !== 'string' || !SESSION_ID.test(value))
    throw new Error(`${label} must be an opaque lowercase identifier.`);
  return value;
}

export function validateFocusDuration(value: unknown): FocusDuration {
  if (!value || typeof value !== 'object') throw new Error('Focus duration is required.');
  const input = value as { mode?: unknown; minutes?: unknown };
  if (input.mode === 'untimed') {
    if (input.minutes !== null) throw new Error('Untimed sessions must use null minutes.');
    return { mode: 'untimed', minutes: null };
  }
  if (input.mode === 'preset') {
    if (!FOCUS_PRESET_MINUTES.includes(input.minutes as FocusPresetMinutes))
      throw new Error('Preset duration must be 25, 50, or 90 minutes.');
    return { mode: 'preset', minutes: input.minutes as FocusPresetMinutes };
  }
  if (input.mode === 'custom') {
    if (!Number.isInteger(input.minutes) ||
        (input.minutes as number) < FOCUS_CUSTOM_MINUTES_MIN ||
        (input.minutes as number) > FOCUS_CUSTOM_MINUTES_MAX)
      throw new Error('Custom duration must be a whole number from 5 to 240 minutes.');
    return { mode: 'custom', minutes: input.minutes as number };
  }
  throw new Error('Focus duration mode is not supported.');
}

export function validateFocusSessionPlan(input: FocusSessionPlanInput): FocusSessionPlan {
  if (!input || typeof input !== 'object') throw new Error('Focus session plan is required.');
  return {
    task: assertChoice(input.task, FOCUS_TASK_KINDS, 'Task'),
    taskLabel: cleanText(input.taskLabel, 'Task label', TASK_LABEL_MAX),
    focusNeed: assertChoice(input.focusNeed, FOCUS_NEEDS, 'Focus need'),
    musicalWorld: assertChoice(input.musicalWorld, FOCUS_MUSICAL_WORLDS, 'Musical world'),
    stimulation: assertChoice(input.stimulation, FOCUS_STIMULATION_LEVELS, 'Stimulation'),
    duration: validateFocusDuration(input.duration),
    entryMode: assertChoice(input.entryMode, FOCUS_ENTRY_MODES, 'Entry mode'),
  };
}

export function createFocusSession(
  input: FocusSessionPlanInput,
  options: { readonly id: string; readonly at: string | Date },
): FocusSession {
  const at = exactTime(options.at, 'creation time');
  return {
    format: FOCUS_FIELD_SESSION_FORMAT,
    id: checkedSessionId(options.id),
    plan: validateFocusSessionPlan(input),
    status: 'ready',
    createdAt: at,
    updatedAt: at,
    startedAt: null,
    activeSince: null,
    elapsedMs: 0,
    endedAt: null,
    interruptionReason: null,
    endReason: null,
    resumeRequiresMemberAction: false,
    feedback: null,
    revision: 1,
  };
}

export function focusDurationMs(duration: FocusDuration): number | null {
  return duration.mode === 'untimed' ? null : duration.minutes * 60_000;
}

export function focusElapsedMs(session: FocusSession, at: string | Date): number {
  const now = timeMs(at);
  assertForwardTime(session, new Date(now).toISOString());
  if (session.status !== 'running' || !session.activeSince) return session.elapsedMs;
  return session.elapsedMs + Math.max(0, now - new Date(session.activeSince).getTime());
}

export function focusRemainingMs(session: FocusSession, at: string | Date): number | null {
  const duration = focusDurationMs(session.plan.duration);
  if (duration === null) return null;
  return Math.max(0, duration - focusElapsedMs(session, at));
}

export function isFocusSessionTerminal(session: FocusSession): boolean {
  return session.status === 'completed' || session.status === 'stopped';
}

export function startFocusSession(session: FocusSession, atValue: string | Date): FocusSession {
  if (session.status !== 'ready') throw new Error('Only a ready Focus Field session can start.');
  const at = exactTime(atValue, 'start time');
  assertForwardTime(session, at);
  return {
    ...session,
    status: 'running',
    updatedAt: at,
    startedAt: at,
    activeSince: at,
    interruptionReason: null,
    endReason: null,
    resumeRequiresMemberAction: false,
    revision: session.revision + 1,
  };
}

export function advanceFocusSession(session: FocusSession, atValue: string | Date): FocusSession {
  const at = exactTime(atValue);
  assertForwardTime(session, at);
  if (session.status !== 'running') return session;
  const duration = focusDurationMs(session.plan.duration);
  if (duration === null) return session;
  const elapsed = focusElapsedMs(session, at);
  if (elapsed < duration) return session;
  return {
    ...session,
    status: 'completed',
    updatedAt: at,
    activeSince: null,
    elapsedMs: duration,
    endedAt: at,
    interruptionReason: null,
    endReason: 'timer-complete',
    resumeRequiresMemberAction: false,
    revision: session.revision + 1,
  };
}

export function interruptFocusSession(
  session: FocusSession,
  reasonValue: FocusInterruptionReason,
  atValue: string | Date,
): FocusSession {
  const reason = assertChoice(reasonValue, FOCUS_INTERRUPTION_REASONS, 'Interruption reason');
  const at = exactTime(atValue);
  assertForwardTime(session, at);
  const advanced = advanceFocusSession(session, at);
  if (advanced.status === 'completed') return advanced;
  if (advanced.status === 'paused') return advanced;
  if (advanced.status !== 'running')
    throw new Error('Only a running Focus Field session can be interrupted.');
  return {
    ...advanced,
    status: 'paused',
    updatedAt: at,
    activeSince: null,
    elapsedMs: focusElapsedMs(advanced, at),
    interruptionReason: reason,
    resumeRequiresMemberAction: true,
    revision: advanced.revision + 1,
  };
}

export function resumeFocusSession(
  session: FocusSession,
  atValue: string | Date,
  memberInitiated: boolean,
): FocusSession {
  if (session.status !== 'paused') throw new Error('Only a paused Focus Field session can resume.');
  if (!memberInitiated) throw new Error('Focus Field never resumes without a fresh member action.');
  const at = exactTime(atValue, 'resume time');
  assertForwardTime(session, at);
  return {
    ...session,
    status: 'running',
    updatedAt: at,
    activeSince: at,
    interruptionReason: null,
    resumeRequiresMemberAction: false,
    revision: session.revision + 1,
  };
}

export function retuneFocusSession(
  session: FocusSession,
  input: FocusRetune,
  atValue: string | Date,
): FocusSession {
  if (isFocusSessionTerminal(session)) throw new Error('A finished Focus Field session cannot be retuned.');
  const at = exactTime(atValue, 'retune time');
  assertForwardTime(session, at);
  const plan: FocusSessionPlan = {
    ...session.plan,
    focusNeed: input.focusNeed === undefined
      ? session.plan.focusNeed
      : assertChoice(input.focusNeed, FOCUS_NEEDS, 'Focus need'),
    musicalWorld: input.musicalWorld === undefined
      ? session.plan.musicalWorld
      : assertChoice(input.musicalWorld, FOCUS_MUSICAL_WORLDS, 'Musical world'),
    stimulation: input.stimulation === undefined
      ? session.plan.stimulation
      : assertChoice(input.stimulation, FOCUS_STIMULATION_LEVELS, 'Stimulation'),
  };
  return {
    ...session,
    updatedAt: at,
    plan,
    revision: session.revision + 1,
  };
}

export function stopFocusSession(
  session: FocusSession,
  atValue: string | Date,
  reasonValue: Exclude<FocusEndReason, 'timer-complete'> = 'member-stop',
): FocusSession {
  if (isFocusSessionTerminal(session)) return session;
  const reason = assertChoice(reasonValue, FOCUS_END_REASONS, 'End reason');
  if (reason === 'timer-complete') throw new Error('Timer completion is produced by advancing the session.');
  const at = exactTime(atValue, 'stop time');
  assertForwardTime(session, at);
  const elapsed = session.status === 'running' ? focusElapsedMs(session, at) : session.elapsedMs;
  return {
    ...session,
    status: 'stopped',
    updatedAt: at,
    activeSince: null,
    elapsedMs: elapsed,
    endedAt: at,
    interruptionReason: null,
    endReason: reason,
    resumeRequiresMemberAction: false,
    revision: session.revision + 1,
  };
}

function validateFocusFeedback(
  outcomeValue: FocusFeedbackOutcome,
  tagsValue: readonly FocusFeedbackTag[],
  atValue: string | Date,
): FocusSessionFeedback {
  const outcome = assertChoice(outcomeValue, FOCUS_FEEDBACK_OUTCOMES, 'Feedback outcome');
  if (!Array.isArray(tagsValue)) throw new Error('Feedback tags must be a list.');
  if (tagsValue.length > 4) throw new Error('Choose no more than four feedback tags.');
  const tags = tagsValue.map(tag => assertChoice(tag, FOCUS_FEEDBACK_TAGS, 'Feedback tag'));
  if (new Set(tags).size !== tags.length) throw new Error('Feedback tags must be unique.');
  return { outcome, tags, recordedAt: exactTime(atValue, 'feedback time') };
}

export function recordFocusFeedback(
  session: FocusSession,
  input: {
    readonly outcome: FocusFeedbackOutcome;
    readonly tags?: readonly FocusFeedbackTag[];
    readonly at: string | Date;
  },
): FocusSession {
  if (!isFocusSessionTerminal(session))
    throw new Error('Feedback is accepted only after a completed or stopped session.');
  const feedback = validateFocusFeedback(input.outcome, input.tags ?? [], input.at);
  assertForwardTime(session, feedback.recordedAt);
  if (new Date(feedback.recordedAt).getTime() < new Date(session.endedAt ?? session.createdAt).getTime())
    throw new Error('Feedback cannot precede the end of the session.');
  return {
    ...session,
    updatedAt: feedback.recordedAt,
    feedback,
    revision: session.revision + 1,
  };
}

export function saveFocusCombination(
  session: FocusSession,
  options: { readonly id: string; readonly name: string; readonly at: string | Date },
): FocusSavedCombination {
  const name = cleanText(options.name, 'Combination name', COMBINATION_NAME_MAX);
  if (!name) throw new Error('Combination name is required.');
  const savedAt = exactTime(options.at, 'save time');
  assertForwardTime(session, savedAt);
  return {
    format: FOCUS_FIELD_COMBINATION_FORMAT,
    id: checkedSessionId(options.id, 'combination id'),
    name,
    task: session.plan.task,
    focusNeed: session.plan.focusNeed,
    musicalWorld: session.plan.musicalWorld,
    stimulation: session.plan.stimulation,
    duration: { ...session.plan.duration },
    savedAt,
  };
}
