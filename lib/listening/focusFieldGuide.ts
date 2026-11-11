/**
 * LISTEN-49 · Transparent Guide Me suggestions.
 *
 * Suggestions use only the choices visible in the current, unsaved form. They
 * do not inspect work, identity, history, biometrics, behavior, time of day or
 * a supposed attention type. The member may ignore or replace every result.
 */
import {
  FOCUS_MUSICAL_WORLDS,
  FOCUS_NEEDS,
  FOCUS_STIMULATION_LEVELS,
  FOCUS_TASK_KINDS,
  type FocusMusicalWorld,
  type FocusNeed,
  type FocusStimulation,
  type FocusTaskKind,
} from './focusFieldSession';

export const FOCUS_GUIDE_FORMAT = 'SOULLAB_FOCUS_GUIDE_V1' as const;
export const FOCUS_GUIDE_INPUT_AUTHORITY = 'current-visible-choices-only' as const;

export interface FocusGuideInput {
  readonly task: FocusTaskKind;
  readonly focusNeed: FocusNeed;
  readonly stimulation: FocusStimulation;
}

export interface FocusGuideSuggestion {
  readonly format: typeof FOCUS_GUIDE_FORMAT;
  readonly inputAuthority: typeof FOCUS_GUIDE_INPUT_AUTHORITY;
  readonly primary: FocusMusicalWorld;
  readonly alternatives: readonly FocusMusicalWorld[];
  readonly explanation: string;
}

const NEED_PRIORITY: Record<FocusNeed, readonly FocusMusicalWorld[]> = {
  arrive: ['ambient', 'nature', 'organic', 'classical', 'cinematic', 'electronic', 'rhythmic'],
  steady: ['classical', 'organic', 'electronic', 'ambient', 'rhythmic', 'nature', 'cinematic'],
  deep: ['ambient', 'classical', 'cinematic', 'nature', 'organic', 'electronic', 'rhythmic'],
  activate: ['rhythmic', 'electronic', 'cinematic', 'organic', 'classical', 'nature', 'ambient'],
  create: ['cinematic', 'organic', 'ambient', 'electronic', 'classical', 'nature', 'rhythmic'],
  reset: ['nature', 'ambient', 'organic', 'classical', 'cinematic', 'electronic', 'rhythmic'],
};

const TASK_AFFINITIES: Record<FocusTaskKind, readonly FocusMusicalWorld[]> = {
  writing: ['classical', 'ambient', 'cinematic'],
  reading: ['classical', 'ambient', 'nature'],
  coding: ['electronic', 'rhythmic', 'ambient'],
  studying: ['classical', 'ambient', 'electronic'],
  administration: ['electronic', 'rhythmic', 'classical'],
  'creative-work': ['cinematic', 'organic', 'ambient'],
  thinking: ['ambient', 'classical', 'nature'],
  'open-work': ['organic', 'ambient', 'electronic'],
};

const STIMULATION_AFFINITIES: Record<FocusStimulation, readonly FocusMusicalWorld[]> = {
  low: ['ambient', 'nature', 'classical'],
  medium: ['organic', 'classical', 'cinematic'],
  high: ['rhythmic', 'electronic', 'cinematic'],
};

function assertVisibleChoice<T extends string>(
  value: unknown,
  choices: readonly T[],
  label: string,
): T {
  if (typeof value !== 'string' || !choices.includes(value as T))
    throw new Error(`${label} is not supported.`);
  return value as T;
}

/** Stable, inspectable scoring. No learned weights, profile or hidden state. */
export function suggestFocusWorlds(input: FocusGuideInput): FocusGuideSuggestion {
  const task = assertVisibleChoice(input.task, FOCUS_TASK_KINDS, 'Task');
  const focusNeed = assertVisibleChoice(input.focusNeed, FOCUS_NEEDS, 'Focus need');
  const stimulation = assertVisibleChoice(
    input.stimulation,
    FOCUS_STIMULATION_LEVELS,
    'Stimulation',
  );

  const scores = new Map<FocusMusicalWorld, number>(
    FOCUS_MUSICAL_WORLDS.map(world => [world, 0]),
  );
  const addRanked = (worlds: readonly FocusMusicalWorld[], weight: number) => {
    worlds.forEach((world, index) => {
      scores.set(world, (scores.get(world) ?? 0) + weight * (worlds.length - index));
    });
  };
  addRanked(NEED_PRIORITY[focusNeed], 4);
  addRanked(TASK_AFFINITIES[task], 3);
  addRanked(STIMULATION_AFFINITIES[stimulation], 2);

  const ranked = [...FOCUS_MUSICAL_WORLDS].sort((left, right) => {
    const difference = (scores.get(right) ?? 0) - (scores.get(left) ?? 0);
    return difference || FOCUS_MUSICAL_WORLDS.indexOf(left) - FOCUS_MUSICAL_WORLDS.indexOf(right);
  });

  return {
    format: FOCUS_GUIDE_FORMAT,
    inputAuthority: FOCUS_GUIDE_INPUT_AUTHORITY,
    primary: ranked[0],
    alternatives: ranked.slice(1, 3),
    explanation:
      'Suggested only from the task, focus need and stimulation you selected for this session. Nothing in your work or history was inspected.',
  };
}
