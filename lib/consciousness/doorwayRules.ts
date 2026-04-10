// lib/consciousness/doorwayRules.ts
// Elemental doorway decision engine.
//
// Element tells you the domain.
// Stability tells you readiness.
// Doorway tells you the next coherent move.
//
// This is a navigation system for consciousness, not a feature menu.
// Each doorway is a qualitatively different kind of movement.

import type { Element } from '@/lib/types/oracle';

// ─── Types ─────────────────────────────────────────────────────────

type Level = 'low' | 'medium' | 'high';

export type Doorway =
  | 'go_deeper'
  | 'stay_here'
  | 'soften'
  | 'ground_this'
  | 'make_this_real'
  | 'name_it_clearly'
  | 'turn_toward'
  | 'zoom_out'
  | 'follow_the_thread';

export interface FieldState {
  element: Element;
  intensity: Level;
  stability: Level;
  practicalIntent?: boolean;
  explicitBoundary?: boolean;
  overwhelm?: boolean;
  dualSignal?: boolean;
}

export interface DoorwayDecision {
  primary: Doorway | null;
  secondary: Doorway | null;
  reason: string;
}

interface DoorwayRule {
  preferred: Doorway[];
  allowed: Doorway[];
  blocked: Doorway[];
}

// ─── Elemental Rules ───────────────────────────────────────────────
// Key format: "intensity:stability" with "any" as wildcard.
// Lookup tries exact match, then intensity:any, then any:stability.

const ELEMENT_RULES: Record<string, Record<string, DoorwayRule>> = {
  fire: {
    'low:any': {
      preferred: ['follow_the_thread'],
      allowed: ['go_deeper', 'zoom_out'],
      blocked: ['soften'],
    },
    'medium:high': {
      preferred: ['make_this_real'],
      allowed: ['go_deeper', 'name_it_clearly'],
      blocked: ['soften'],
    },
    'high:high': {
      preferred: ['stay_here'],
      allowed: ['make_this_real', 'go_deeper'],
      blocked: ['soften'],
    },
    'high:low': {
      preferred: ['stay_here'],
      allowed: ['soften', 'name_it_clearly'],
      blocked: ['make_this_real'],
    },
  },

  water: {
    'low:any': {
      preferred: ['turn_toward'],
      allowed: ['stay_here', 'follow_the_thread'],
      blocked: ['make_this_real'],
    },
    'medium:high': {
      preferred: ['go_deeper'],
      allowed: ['stay_here', 'turn_toward'],
      blocked: ['make_this_real'],
    },
    'high:high': {
      preferred: ['stay_here'],
      allowed: ['go_deeper', 'soften'],
      blocked: ['make_this_real'],
    },
    'high:low': {
      preferred: ['soften'],
      allowed: ['stay_here'],
      blocked: ['go_deeper', 'make_this_real'],
    },
  },

  earth: {
    'low:high': {
      preferred: ['name_it_clearly'],
      allowed: ['ground_this'],
      blocked: ['go_deeper'],
    },
    'medium:high': {
      preferred: ['ground_this'],
      allowed: ['make_this_real', 'name_it_clearly'],
      blocked: ['go_deeper'],
    },
    'high:high': {
      preferred: ['make_this_real'],
      allowed: ['ground_this'],
      blocked: ['soften'],
    },
    'any:low': {
      preferred: ['ground_this'],
      allowed: ['stay_here'],
      blocked: ['go_deeper', 'zoom_out'],
    },
  },

  air: {
    'low:any': {
      preferred: ['zoom_out'],
      allowed: ['name_it_clearly', 'follow_the_thread'],
      blocked: ['soften'],
    },
    'medium:high': {
      preferred: ['name_it_clearly'],
      allowed: ['zoom_out', 'make_this_real'],
      blocked: [],
    },
    'high:high': {
      preferred: ['ground_this'],
      allowed: ['name_it_clearly', 'make_this_real'],
      blocked: ['go_deeper'],
    },
    'high:low': {
      preferred: ['stay_here'],
      allowed: ['ground_this'],
      blocked: ['zoom_out'],
    },
  },

  aether: {
    'low:any': {
      preferred: ['follow_the_thread'],
      allowed: ['stay_here'],
      blocked: ['make_this_real'],
    },
    'medium:high': {
      preferred: ['stay_here'],
      allowed: ['go_deeper', 'follow_the_thread'],
      blocked: [],
    },
    'high:high': {
      preferred: ['stay_here'],
      allowed: ['go_deeper'],
      blocked: ['make_this_real'],
    },
    'any:low': {
      preferred: ['soften'],
      allowed: ['stay_here'],
      blocked: ['go_deeper'],
    },
  },
};

// ─── Rule Resolution ───────────────────────────────────────────────

function getRuleKeys(intensity: Level, stability: Level): string[] {
  return [
    `${intensity}:${stability}`,
    `${intensity}:any`,
    `any:${stability}`,
  ];
}

function resolveDoorwayRule(state: FieldState): DoorwayRule {
  const rules = ELEMENT_RULES[state.element];
  if (!rules) {
    return { preferred: ['follow_the_thread'], allowed: ['stay_here'], blocked: [] };
  }

  for (const key of getRuleKeys(state.intensity, state.stability)) {
    if (rules[key]) return rules[key];
  }

  return { preferred: ['follow_the_thread'], allowed: ['stay_here'], blocked: [] };
}

// ─── Decision Engine ───────────────────────────────────────────────

export function chooseDoorways(state: FieldState): DoorwayDecision {
  // Hard blockers: consent and practical intent override everything
  if (state.explicitBoundary) {
    return { primary: null, secondary: null, reason: 'user boundary active' };
  }

  if (state.practicalIntent) {
    return { primary: null, secondary: null, reason: 'practical mode takes priority' };
  }

  const base = resolveDoorwayRule(state);
  const blocked = new Set<Doorway>(base.blocked);

  // Global safety gating
  if (state.overwhelm || state.stability === 'low') {
    blocked.add('go_deeper');
    blocked.add('make_this_real');
  }

  const preferred = base.preferred.filter(d => !blocked.has(d));
  const allowed = base.allowed.filter(d => !blocked.has(d));

  const primary = preferred[0] ?? allowed[0] ?? null;

  if (!primary) {
    return { primary: null, secondary: null, reason: 'no safe doorway available' };
  }

  // Show second only when real tension/richness exists
  let secondary: Doorway | null = null;
  if (state.dualSignal) {
    secondary = [...preferred.slice(1), ...allowed].find(d => d !== primary) ?? null;
  }

  return {
    primary,
    secondary,
    reason: secondary ? 'dual movement available' : 'single coherent next movement',
  };
}

// ─── Labels ────────────────────────────────────────────────────────

export const DOORWAY_LABELS: Record<Doorway, string> = {
  go_deeper: 'Go deeper',
  stay_here: 'Stay here',
  soften: 'Soften',
  ground_this: 'Ground this',
  make_this_real: 'Make this real',
  name_it_clearly: 'Name it clearly',
  turn_toward: 'Turn toward',
  zoom_out: 'Zoom out',
  follow_the_thread: 'Follow the thread',
};

// ─── Lead-ins (contextual copy that emerges from the conversation) ─

export const DOORWAY_LEAD_INS: Record<Doorway, string[]> = {
  go_deeper: [
    'There\u2019s something underneath this\u2026',
    'This feels like it has another layer.',
  ],
  stay_here: [
    'You don\u2019t have to move past this yet.',
    'This may be worth staying with.',
  ],
  soften: [
    'We can slow this down.',
    'You don\u2019t have to solve this right now.',
  ],
  ground_this: [
    'Let\u2019s bring this into the body.',
    'This may want grounding before meaning.',
  ],
  make_this_real: [
    'This wants form now.',
    'There may be a next step here.',
  ],
  name_it_clearly: [
    'This wants clearer language.',
    'There\u2019s something here that could be said more directly.',
  ],
  turn_toward: [
    'Something here may be asking not to be avoided.',
    'There may be value in staying turned toward this.',
  ],
  zoom_out: [
    'This may belong to a larger pattern.',
    'There may be a wider frame here.',
  ],
  follow_the_thread: [
    'Something is still unfolding.',
    'There\u2019s a thread here worth following.',
  ],
};

export function pickLeadIn(doorway: Doorway, seed = 0): string {
  const options = DOORWAY_LEAD_INS[doorway];
  return options[seed % options.length];
}

// ─── UI Action Converter ───────────────────────────────────────────

import type { MaiaUiAction } from '@/lib/types/ai';

/**
 * Convert a doorway into a MaiaUiAction for the conversation UI.
 * All doorways are field shifts — they stay in the conversation thread.
 */
export function doorwayToUiAction(
  doorway: Doorway,
  confidence: number,
  seed = 0,
): MaiaUiAction {
  return {
    type: doorway === 'go_deeper' ? 'enter_depth' : doorway,
    label: DOORWAY_LABELS[doorway],
    leadIn: pickLeadIn(doorway, seed),
    confidence,
    isFieldShift: true,
  };
}

/**
 * Build 0-2 doorway actions from elemental field state.
 * Returns empty array if no doorway is appropriate.
 */
export function buildDoorwayActions(
  state: FieldState,
  confidence: number,
  seed = 0,
): MaiaUiAction[] {
  const decision = chooseDoorways(state);
  if (!decision.primary) return [];

  const actions: MaiaUiAction[] = [
    doorwayToUiAction(decision.primary, confidence, seed),
  ];

  if (decision.secondary) {
    actions.push(doorwayToUiAction(decision.secondary, confidence, seed + 1));
  }

  return actions;
}
