/**
 * TURN-01 — member-owned conversational turn policy.
 *
 * Silence is evidence of possible completion, never proof by itself.
 * Explicit floor ownership always outranks automatic endpointing.
 * Adaptive learning may make MAIA more patient; it may never shorten the
 * member's chosen conversational-space baseline.
 */
export type ConversationalSpace = 'responsive' | 'natural' | 'spacious' | 'contemplative';
export type FloorControlMode = 'automatic' | 'explicit';

export type TurnTakingPreferences = {
  conversationalSpace: ConversationalSpace;
  floorControlMode: FloorControlMode;
  learnRhythm: boolean;
};

export type TurnRhythmState = {
  continuedPauseEmaMs: number;
  continuedPauseSamples: number;
};

export const DEFAULT_TURN_TAKING_PREFERENCES: TurnTakingPreferences = {
  conversationalSpace: 'natural',
  floorControlMode: 'automatic',
  learnRhythm: true,
};

export const EMPTY_TURN_RHYTHM: TurnRhythmState = {
  continuedPauseEmaMs: 0,
  continuedPauseSamples: 0,
};

export const CONVERSATIONAL_SPACE_CONFIG: Record<ConversationalSpace, {
  label: string;
  description: string;
  silenceMs: number;
  adaptiveCeilingMs: number;
}> = {
  responsive: {
    label: 'Responsive',
    description: 'Quicker handoffs for fast-moving conversation.',
    silenceMs: 1800,
    adaptiveCeilingMs: 3500,
  },
  natural: {
    label: 'Natural',
    description: 'Patient everyday pacing with room to think.',
    silenceMs: 3500,
    adaptiveCeilingMs: 6000,
  },
  spacious: {
    label: 'Spacious',
    description: 'More room for word-finding, feeling, and reflection.',
    silenceMs: 6000,
    adaptiveCeilingMs: 9000,
  },
  contemplative: {
    label: 'Contemplative',
    description: 'Long pauses are expected and comfortably held.',
    silenceMs: 10000,
    adaptiveCeilingMs: 15000,
  },
};

export function isConversationalSpace(value: unknown): value is ConversationalSpace {
  return typeof value === 'string' && value in CONVERSATIONAL_SPACE_CONFIG;
}

export function isFloorControlMode(value: unknown): value is FloorControlMode {
  return value === 'automatic' || value === 'explicit';
}

export function observeContinuedPause(
  state: TurnRhythmState,
  pauseMs: number,
): TurnRhythmState {
  if (!Number.isFinite(pauseMs) || pauseMs < 250 || pauseMs > 30000) return state;
  const alpha = 0.25;
  const nextEma = state.continuedPauseSamples === 0
    ? pauseMs
    : state.continuedPauseEmaMs * (1 - alpha) + pauseMs * alpha;
  return {
    continuedPauseEmaMs: Math.round(nextEma),
    continuedPauseSamples: state.continuedPauseSamples + 1,
  };
}

/**
 * Resolve the automatic endpoint threshold for this member in this session.
 * `baselineFloorMs` lets Care/Scribe mode remain at least as patient as its own
 * existing law. Learning starts only after two demonstrated pause-continuations.
 */
export function resolveTurnSilenceMs(
  prefs: TurnTakingPreferences,
  rhythm: TurnRhythmState = EMPTY_TURN_RHYTHM,
  baselineFloorMs = 0,
): number {
  const config = CONVERSATIONAL_SPACE_CONFIG[prefs.conversationalSpace];
  const baseline = Math.max(config.silenceMs, baselineFloorMs);
  if (!prefs.learnRhythm || rhythm.continuedPauseSamples < 2) return baseline;

  // A continuation after a pause is direct evidence that the pause was not a
  // yield. Give that observed rhythm a modest safety margin, bounded by the
  // selected Space. Never reduce below baseline.
  const learned = Math.round(rhythm.continuedPauseEmaMs * 1.35 + 500);
  return Math.max(baseline, Math.min(config.adaptiveCeilingMs, learned));
}

export function automaticEndpointingAllowed(prefs: TurnTakingPreferences): boolean {
  return prefs.floorControlMode === 'automatic';
}
