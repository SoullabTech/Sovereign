/**
 * WRITER'S STUDIO — THE ONE EXPLICIT STATE MACHINE
 *
 * `JARVIS-WRITERS-STUDIO-COMPLETE-01 / B0`, internal checkpoint B1.
 *
 * ⭐ Why this exists BEFORE the room is rebuilt: the approved D0 acceptance
 * falsifiers F5, F8 and F9 assert over a TRANSITION GRAPH. Against 2,038 inline
 * lines there is no graph to assert over, only a DOM to sample — and every
 * defeat candidate survives a sample. This is the same lesson
 * OBSERVATION-IDENTITY-01 recorded one level down: *a thing with no identity
 * cannot be falsified, only sampled.*
 *
 * Three properties are STRUCTURAL here rather than guarded at runtime:
 *
 *   1. ⭐ APPLY IS UNREACHABLE FROM `alternatives`. Not disabled — absent. The
 *      transition table for `alternatives` has no APPLY entry, and
 *      `context-review` is the only phase that carries a non-null selection at
 *      the TYPE level, so `applied` cannot be constructed from anywhere else.
 *
 *   2. ⭐ `passage-held` CANNOT CARRY AN OBSERVATION. The phase union gives it
 *      no field to put one in, so "held asserts nothing" is a fact about the
 *      type, not a discipline about the copy.
 *
 *   3. ⭐ PLACE IS WRITABLE BY EXACTLY ONE EVENT. `transition` copies `place`
 *      forward on every other event, so no conversation, revision, apply, undo
 *      or overlay act can move the writer.
 *
 * ⛔ This module renders nothing, fetches nothing and persists nothing. It is
 * the room's decision layer; B2+ compose over it.
 */

import { isOfferable, resolveCapability, type CapabilityId } from './capability';

/* ══════════════════════════════════════════════════════════════════════════
   PLACE — the writer's location in the Work
   ══════════════════════════════════════════════════════════════════════════ */

export interface Place {
  readonly sectionId: string;
  /** Opaque scroll anchor. ⛔ Never a pixel offset — a re-render must not move it. */
  readonly anchor: string | null;
}

export interface PassageRef {
  readonly sectionId: string;
  readonly codePointStart: number;
  readonly codePointEnd: number;
}

/* ══════════════════════════════════════════════════════════════════════════
   NON-CONCLUSIONS

   ⭐ PERMANENT ones are permanent under ANY coverage, ANY facet and ANY member
   action. Coverage may discharge only the three dischargeable ones, and only on
   complete body-depth coverage. F7's defeat candidate is precisely an
   implementation that drops an author-intent / reader-effect limit once
   coverage is whole — defensible-sounding, and wrong.
   ══════════════════════════════════════════════════════════════════════════ */

export const PERMANENT_NON_CONCLUSIONS = ['author-intent', 'reader-effect'] as const;
export const DISCHARGEABLE_NON_CONCLUSIONS = [
  'whole-work-pattern', 'across-unread-span', 'outside-coverage',
] as const;

export type NonConclusion =
  | (typeof PERMANENT_NON_CONCLUSIONS)[number]
  | (typeof DISCHARGEABLE_NON_CONCLUSIONS)[number];

/* ══════════════════════════════════════════════════════════════════════════
   OBSERVATION · ALTERNATIVES
   ══════════════════════════════════════════════════════════════════════════ */

export interface Observation {
  /** Canonical member-facing identity, minted at admission. */
  readonly observationId: string;
  /** The read-local address. Ratified 1:1 with observationId within a reading,
   *  and AUTHORITATIVE for member standing until OBSERVATION-ADDRESS-01 closes. */
  readonly readingId: string;
  readonly observationKey: string;
  readonly lens: string;
  readonly text: string;
  readonly refs: readonly PassageRef[];
}

export interface Reasoning {
  readonly text: string;
  /** ⛔ Must always contain every PERMANENT non-conclusion. Enforced by construction. */
  readonly limits: readonly NonConclusion[];
}

export interface Teaching {
  readonly text: string;
  /** ⭐ The technique must be drawn from the covered text, never an external
   *  standard — an imported ideal breaches the `voice` lens and Invariant 14. */
  readonly drawnFrom: readonly PassageRef[];
}

/**
 * ⛔ THIS TYPE HAS NO RANK, SCORE, CONFIDENCE, SEVERITY, PRIORITY,
 * RECOMMENDATION OR DEFAULT FIELD, AND MUST NEVER ACQUIRE ONE.
 * `rationale` says what the alternative DOES. ⛔ Never why it is better.
 */
export interface Alternative {
  readonly id: string;
  readonly name: string;
  /** `null` is "keep mine" — a first-class option, ⛔ never an implicit escape. */
  readonly text: string | null;
  readonly rationale: string;
}

export interface AlternativeSet {
  /** Admission order. ⛔ Presentation order is not a ranking, and ordering BY an
   *  evaluative function is a ranking under another name. */
  readonly items: readonly Alternative[];
}

/* ══════════════════════════════════════════════════════════════════════════
   REVISION HISTORY — append-only
   ══════════════════════════════════════════════════════════════════════════ */

export interface RevisionEvent {
  readonly kind: 'apply' | 'undo';
  readonly version: number;
  readonly sectionId: string;
  readonly alternativeId: string;
  readonly alternativeName: string;
}

/* ══════════════════════════════════════════════════════════════════════════
   PHASES — a discriminated union, so illegal states are unconstructable
   ══════════════════════════════════════════════════════════════════════════ */

export type Phase =
  | { readonly name: 'writing' }
  /** ⭐ No observation field. "Held asserts nothing" is a type fact. */
  | { readonly name: 'passage-held'; readonly passage: PassageRef }
  | { readonly name: 'conversation'; readonly passage: PassageRef; readonly observation: Observation }
  | { readonly name: 'reasoning'; readonly passage: PassageRef; readonly observation: Observation; readonly reasoning: Reasoning }
  | { readonly name: 'challenge'; readonly passage: PassageRef; readonly observation: Observation }
  | { readonly name: 'teaching'; readonly passage: PassageRef; readonly observation: Observation; readonly teaching: Teaching }
  | { readonly name: 'alternatives'; readonly passage: PassageRef; readonly observation: Observation; readonly candidates: AlternativeSet; readonly selected: string | null }
  /** ⭐ `selected` is NON-NULL here and only here. The apply gate is a type. */
  | { readonly name: 'context-review'; readonly passage: PassageRef; readonly observation: Observation; readonly candidates: AlternativeSet; readonly selected: string }
  | { readonly name: 'applied'; readonly passage: PassageRef; readonly observation: Observation; readonly candidates: AlternativeSet; readonly applied: RevisionEvent }
  | { readonly name: 'undone'; readonly passage: PassageRef; readonly observation: Observation; readonly candidates: AlternativeSet; readonly selected: string };

export type PhaseName = Phase['name'];

export const PHASE_NAMES: readonly PhaseName[] = [
  'writing', 'passage-held', 'conversation', 'reasoning', 'challenge',
  'teaching', 'alternatives', 'context-review', 'applied', 'undone',
];

/* ══════════════════════════════════════════════════════════════════════════
   OVERLAYS — orthogonal to the phase machine
   ══════════════════════════════════════════════════════════════════════════ */

export type OverlayRole = 'outline' | 'review' | 'history' | 'related';
export const OVERLAY_ROLES: readonly OverlayRole[] = ['outline', 'review', 'history', 'related'];

/* ══════════════════════════════════════════════════════════════════════════
   STATE
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * ⭐⭐ HOW THE MEMBER GOT HERE.
 *
 * Arriving at a passage from a finding is not the same as holding a sentence
 * while writing, and the difference is load-bearing:
 *
 *   · the observation the member clicked TRAVELS WITH THEM — ⛔ it is not
 *     regenerated, because re-reading on arrival is a commission inferred from
 *     navigation, which the tab boundary already refuses;
 *   · ⛔ there must be a way back. *Every analytical view invites a next move*
 *     cuts both directions: a finding that leads into the Work and strands the
 *     member there has replaced a dashboard with a trapdoor.
 */
/**
 * ⭐⭐ THREE KINDS THE MEMBER MAY AUTHOR.
 *
 * ⭐ `question` and `possibility` matter as much as `noticed`: a writer's most
 * useful marks on their own book are often *I don't know yet* and *what if* —
 * and a system that only accepts findings would force both into the shape of a
 * conclusion. ⛔ MAIA has no equivalent of these: she may not record a
 * possibility about the member's Work as though it were hers to hold.
 */
export type OwnNoteKind = 'noticed' | 'question' | 'possibility';

export interface OwnNote {
  readonly kind: OwnNoteKind;
  readonly text: string;
  /** Member-chosen links. ⛔ Never inferred from the text — FR-06. */
  readonly themes: readonly string[];
}

export interface Trail {
  /** e.g. "your review" · "the map". Member-facing, ⛔ never a route name. */
  readonly from: string;
  readonly backLabel: string;
  /**
   * ⭐ Position in the set the member is travelling through — `1 of 4`.
   *
   * ⭐⭐ Traversal matters more than it looks. Without it, seeing the second
   * finding means going back and re-entering, and the loop becomes
   * *in, out, in, out* instead of movement THROUGH the Work. ⛔ A member
   * exploring their own book should not have to leave it to keep exploring.
   */
  readonly index: number;
  readonly total: number;
}

export interface StudioState {
  readonly phase: Phase;
  /** Present when the member arrived from an analytical view. */
  readonly trail?: Trail;
  /** ⭐ The member's own observations, in their own words. ⛔ Never MAIA's. */
  readonly ownNotes?: readonly OwnNote[];
  readonly place: Place;
  readonly overlay: OverlayRole | null;
  readonly version: number;
  readonly history: readonly RevisionEvent[];
  /** Fraction of the commissioned scope MAIA actually read, 0..1.
   *  ⭐ Carried so F7's defeat candidate — dropping a permanent limit once
   *  coverage is whole — is BUILDABLE and therefore killable. */
  readonly coverage: number;
}

/* ══════════════════════════════════════════════════════════════════════════
   EVENTS
   ══════════════════════════════════════════════════════════════════════════ */

export type StudioEvent =
  | { readonly type: 'HOLD_PASSAGE'; readonly passage: PassageRef }
  | { readonly type: 'RELEASE' }
  | { readonly type: 'TALK'; readonly observation: Observation }
  | { readonly type: 'ASK_WHY'; readonly reasoning: Reasoning }
  | { readonly type: 'DISAGREE' }
  | { readonly type: 'ASK_TEACHING'; readonly teaching: Teaching }
  | { readonly type: 'BACK_TO_CONVERSATION' }
  | { readonly type: 'REQUEST_ALTERNATIVES'; readonly candidates: AlternativeSet }
  | { readonly type: 'SELECT_ALTERNATIVE'; readonly alternativeId: string }
  | { readonly type: 'READ_IN_CONTEXT' }
  | { readonly type: 'BACK_TO_ALTERNATIVES' }
  | { readonly type: 'APPLY' }
  | { readonly type: 'UNDO' }
  | { readonly type: 'RETURN_TO_WRITING' }
  | { readonly type: 'OPEN_OVERLAY'; readonly overlay: OverlayRole }
  | { readonly type: 'CLOSE_OVERLAY' }
  /** ⭐ THE ONLY PLACE-WRITING EVENT. */
  | { readonly type: 'NAVIGATE_TO'; readonly place: Place }
  /**
   * ⭐ Arrive at a passage FROM a finding, carrying the finding with you.
   * ⛔ Lands in `conversation`, ⛔ never `passage-held`: the member already has
   * an observation — the one they chose — so pretending nothing is asserted
   * would be false, and re-reading to produce one would be a commission.
   */
  | { readonly type: 'ARRIVE_AT_PASSAGE'; readonly place: Place;
      readonly passage: PassageRef; readonly observation: Observation;
      readonly trail: Trail }
  /** ⭐ The way back. ⛔ A finding that strands the member is a trapdoor. */
  | { readonly type: 'BACK_ALONG_TRAIL' }
  /** ⭐ Move through the set without leaving the Work. */
  | { readonly type: 'STEP_TRAIL'; readonly by: 1 | -1; readonly place: Place;
      readonly passage: PassageRef; readonly observation: Observation }
  /**
   * ⭐⭐ THE MEMBER AUTHORS INTO THE ANALYTICAL LAYER.
   *
   * An observation the member wrote. ⛔ It is not MAIA's and must never be
   * rendered as hers — `provenance` keeps them apart. ⭐ This is what makes the
   * analytical view something the writer PARTICIPATES IN rather than receives:
   * they can mark a passage, ask a question of their own, or record a
   * possibility, and it sits beside MAIA's findings as an equal.
   */
  | { readonly type: 'ADD_OWN_OBSERVATION'; readonly kind: OwnNoteKind;
      readonly text: string; readonly themes?: readonly string[] };

export type EventType = StudioEvent['type'];

/** What each event needs to be reachable at all. ⛔ Fail-closed: an event with
 *  no entry is treated as requiring an unknown capability, hence absent. */
const EVENT_CAPABILITY: Readonly<Record<EventType, CapabilityId>> = {
  HOLD_PASSAGE: 'passage.hold',
  RELEASE: 'manuscript.read',
  TALK: 'observation.read',
  ASK_WHY: 'observation.reasoning',
  DISAGREE: 'observation.challenge',
  ASK_TEACHING: 'observation.teaching',
  BACK_TO_CONVERSATION: 'observation.read',
  REQUEST_ALTERNATIVES: 'alternatives.offer',
  SELECT_ALTERNATIVE: 'alternatives.offer',
  READ_IN_CONTEXT: 'alternatives.read-in-context',
  BACK_TO_ALTERNATIVES: 'alternatives.offer',
  APPLY: 'revision.apply',
  UNDO: 'revision.undo',
  RETURN_TO_WRITING: 'manuscript.read',
  OPEN_OVERLAY: 'manuscript.read',
  CLOSE_OVERLAY: 'manuscript.read',
  NAVIGATE_TO: 'manuscript.read',
  ARRIVE_AT_PASSAGE: 'observation.read',
  BACK_ALONG_TRAIL: 'manuscript.read',
  STEP_TRAIL: 'observation.read',
  ADD_OWN_OBSERVATION: 'manuscript.read',
};

const OVERLAY_CAPABILITY: Readonly<Record<OverlayRole, CapabilityId>> = {
  outline: 'overlay.outline',
  review: 'overlay.review',
  history: 'overlay.history',
  related: 'overlay.related',
};

/* ══════════════════════════════════════════════════════════════════════════
   THE TRANSITION TABLE

   ⭐ This constant IS the law F5 and F8 assert over. Read it as the graph:
   `alternatives` has no APPLY. There is no way to add one without editing a
   table whose shape the suite checks.
   ══════════════════════════════════════════════════════════════════════════ */

export const TRANSITIONS: Readonly<Record<PhaseName, readonly EventType[]>> = {
  'writing':        ['HOLD_PASSAGE'],
  'passage-held':   ['TALK', 'REQUEST_ALTERNATIVES', 'RELEASE'],
  'conversation':   ['ASK_WHY', 'DISAGREE', 'ASK_TEACHING', 'REQUEST_ALTERNATIVES', 'RETURN_TO_WRITING'],
  'reasoning':      ['DISAGREE', 'ASK_TEACHING', 'REQUEST_ALTERNATIVES', 'BACK_TO_CONVERSATION', 'RETURN_TO_WRITING'],
  'challenge':      ['BACK_TO_CONVERSATION', 'REQUEST_ALTERNATIVES', 'RETURN_TO_WRITING'],
  'teaching':       ['BACK_TO_CONVERSATION', 'REQUEST_ALTERNATIVES', 'RETURN_TO_WRITING'],
  /* ⛔ NO 'APPLY'. Reading in context is the only way forward. */
  'alternatives':   ['SELECT_ALTERNATIVE', 'READ_IN_CONTEXT', 'BACK_TO_CONVERSATION', 'RETURN_TO_WRITING'],
  'context-review': ['APPLY', 'BACK_TO_ALTERNATIVES', 'BACK_TO_CONVERSATION', 'RETURN_TO_WRITING'],
  'applied':        ['UNDO', 'RETURN_TO_WRITING'],
  'undone':         ['SELECT_ALTERNATIVE', 'READ_IN_CONTEXT', 'BACK_TO_CONVERSATION', 'RETURN_TO_WRITING'],
};

/** Events valid from every phase. Overlays are orthogonal; navigation is the
 *  writer moving in their own Work and is never refused by a conversation. */
export const UNIVERSAL_EVENTS: readonly EventType[] = [
  'OPEN_OVERLAY', 'CLOSE_OVERLAY', 'NAVIGATE_TO', 'ARRIVE_AT_PASSAGE',
  'BACK_ALONG_TRAIL', 'STEP_TRAIL', 'ADD_OWN_OBSERVATION',
];

/* ══════════════════════════════════════════════════════════════════════════
   REFUSALS
   ══════════════════════════════════════════════════════════════════════════ */

export type RefusalCode =
  | 'EVENT_NOT_IN_PHASE'
  | 'CAPABILITY_NOT_OFFERABLE'
  | 'NO_SELECTION'
  | 'UNKNOWN_ALTERNATIVE'
  | 'PERMANENT_LIMIT_MISSING';

export interface Refusal { readonly refused: true; readonly code: RefusalCode; readonly detail: string }
export type Outcome = { readonly refused: false; readonly state: StudioState } | Refusal;

const refuse = (code: RefusalCode, detail: string): Refusal => ({ refused: true, code, detail });

/* ══════════════════════════════════════════════════════════════════════════
   AVAILABILITY — what the room may render

   ⭐ The UI renders FROM this. An action whose capability is gated or absent is
   never in the returned list, so a dead control has no way to reach the screen.
   ══════════════════════════════════════════════════════════════════════════ */

export function availableEvents(state: StudioState): readonly EventType[] {
  const inPhase = TRANSITIONS[state.phase.name] ?? [];
  return [...inPhase, ...UNIVERSAL_EVENTS].filter((e) => isOfferable(EVENT_CAPABILITY[e]));
}

export function availableOverlays(): readonly OverlayRole[] {
  return OVERLAY_ROLES.filter((r) => isOfferable(OVERLAY_CAPABILITY[r]));
}

/* ══════════════════════════════════════════════════════════════════════════
   THE TRANSITION FUNCTION
   ══════════════════════════════════════════════════════════════════════════ */

export function initialState(place: Place, coverage = 0): StudioState {
  return { phase: { name: 'writing' }, place, overlay: null, version: 1, history: [], coverage };
}

export function transition(state: StudioState, event: StudioEvent): Outcome {
  const phase = state.phase;

  /* ── Gate 1 · capability. ⛔ Before anything else: an unreachable capability
        is refused whatever the phase would otherwise allow. ────────────────── */
  const needed = EVENT_CAPABILITY[event.type];
  if (!isOfferable(needed)) {
    return refuse('CAPABILITY_NOT_OFFERABLE',
      `${event.type} needs ${needed} — ${resolveCapability(needed).standing}: ${resolveCapability(needed).because}`);
  }

  /* ── Gate 2 · the transition table. ─────────────────────────────────────── */
  const allowed = TRANSITIONS[phase.name] ?? [];
  const universal = UNIVERSAL_EVENTS.includes(event.type);
  if (!universal && !allowed.includes(event.type)) {
    return refuse('EVENT_NOT_IN_PHASE', `${event.type} is not reachable from ${phase.name}`);
  }

  /* ── Universal events. ⭐ Only NAVIGATE_TO writes place. ─────────────────── */
  if (event.type === 'OPEN_OVERLAY') {
    if (!isOfferable(OVERLAY_CAPABILITY[event.overlay])) {
      return refuse('CAPABILITY_NOT_OFFERABLE', `overlay ${event.overlay} is not offerable`);
    }
    return ok({ ...state, overlay: event.overlay });
  }
  if (event.type === 'CLOSE_OVERLAY') return ok({ ...state, overlay: null });
  if (event.type === 'ARRIVE_AT_PASSAGE') {
    /* ⭐ Place moves because the member asked to be taken somewhere, and the
       observation arrives WITH them — already admitted, ⛔ not re-read. */
    return ok({
      ...state, place: event.place, overlay: null, trail: event.trail,
      phase: { name: 'conversation', passage: event.passage, observation: event.observation },
    });
  }
  if (event.type === 'STEP_TRAIL') {
    if (!state.trail) return refuse('EVENT_NOT_IN_PHASE', 'not travelling through a set');
    const next = state.trail.index + event.by;
    if (next < 1 || next > state.trail.total) {
      return refuse('EVENT_NOT_IN_PHASE', `no finding ${next} of ${state.trail.total}`);
    }
    return ok({
      ...state, place: event.place, overlay: null,
      trail: { ...state.trail, index: next },
      phase: { name: 'conversation', passage: event.passage, observation: event.observation },
    });
  }
  if (event.type === 'ADD_OWN_OBSERVATION') {
    /* ⛔ The member's own words are recorded, ⛔ never interpreted into a
       category and ⛔ never attributed to MAIA. Place and phase are untouched:
       writing a note is not navigation. */
    if (event.text.trim().length === 0) {
      return refuse('EVENT_NOT_IN_PHASE', 'an empty note records nothing');
    }
    const note: OwnNote = {
      kind: event.kind, text: event.text.trim(), themes: event.themes ?? [],
    };
    return ok({ ...state, ownNotes: [...(state.ownNotes ?? []), note] });
  }
  if (event.type === 'BACK_ALONG_TRAIL') {
    if (!state.trail) return refuse('EVENT_NOT_IN_PHASE', 'nothing to go back to');
    const { trail: _dropped, ...rest } = state;
    return ok({ ...rest, phase: { name: 'writing' }, overlay: null });
  }
  if (event.type === 'NAVIGATE_TO') {
    /* Moving in the Work releases the held passage — the writer went elsewhere,
       and carrying a conversation about a passage they left would be a lie
       about what MAIA is reading. ⛔ It does not discard history or version. */
    return ok({ ...state, place: event.place, phase: { name: 'writing' }, overlay: null });
  }

  /* ── Phase events. `place`, `history`, `coverage` are copied forward by the
        spread in every branch — ⭐ no branch may write place. ──────────────── */
  switch (event.type) {
    case 'HOLD_PASSAGE':
      return ok({ ...state, phase: { name: 'passage-held', passage: event.passage } });

    case 'RELEASE':
    case 'RETURN_TO_WRITING':
      return ok({ ...state, phase: { name: 'writing' } });

    case 'TALK': {
      if (phase.name !== 'passage-held') return refuse('EVENT_NOT_IN_PHASE', 'TALK needs a held passage');
      return ok({ ...state, phase: { name: 'conversation', passage: phase.passage, observation: event.observation } });
    }

    case 'ASK_WHY': {
      if (phase.name !== 'conversation') return refuse('EVENT_NOT_IN_PHASE', 'ASK_WHY needs a conversation');
      /* ⭐ The permanent limits are checked HERE, at the boundary where reasoning
         enters the room, not at render. A reasoning object missing one is
         REFUSED — it never becomes a state the UI could choose to decorate. */
      const missing = PERMANENT_NON_CONCLUSIONS.filter((l) => !event.reasoning.limits.includes(l));
      if (missing.length > 0) {
        return refuse('PERMANENT_LIMIT_MISSING', `reasoning omits permanent non-conclusion(s): ${missing.join(', ')}`);
      }
      return ok({ ...state, phase: { name: 'reasoning', passage: phase.passage, observation: phase.observation, reasoning: event.reasoning } });
    }

    case 'DISAGREE': {
      const carried = withObservation(phase);
      if (!carried) return refuse('EVENT_NOT_IN_PHASE', 'DISAGREE needs an observation');
      return ok({ ...state, phase: { name: 'challenge', passage: carried.passage, observation: carried.observation } });
    }

    case 'ASK_TEACHING': {
      const carried = withObservation(phase);
      if (!carried) return refuse('EVENT_NOT_IN_PHASE', 'ASK_TEACHING needs an observation');
      return ok({ ...state, phase: { name: 'teaching', passage: carried.passage, observation: carried.observation, teaching: event.teaching } });
    }

    case 'BACK_TO_CONVERSATION': {
      const carried = withObservation(phase);
      if (!carried) return refuse('EVENT_NOT_IN_PHASE', 'nothing to return to');
      return ok({ ...state, phase: { name: 'conversation', passage: carried.passage, observation: carried.observation } });
    }

    case 'REQUEST_ALTERNATIVES': {
      if (phase.name === 'passage-held') {
        return refuse('EVENT_NOT_IN_PHASE',
          'alternatives require an observation to be attached to — hold, then talk.');
      }
      const carried = withObservation(phase);
      if (!carried) return refuse('EVENT_NOT_IN_PHASE', 'REQUEST_ALTERNATIVES needs an observation');
      return ok({ ...state, phase: { name: 'alternatives', passage: carried.passage, observation: carried.observation, candidates: event.candidates, selected: null } });
    }

    case 'SELECT_ALTERNATIVE': {
      if (phase.name !== 'alternatives' && phase.name !== 'undone') {
        return refuse('EVENT_NOT_IN_PHASE', 'nothing to select from');
      }
      if (!phase.candidates.items.some((a) => a.id === event.alternativeId)) {
        return refuse('UNKNOWN_ALTERNATIVE', event.alternativeId);
      }
      return ok({ ...state, phase: { name: 'alternatives', passage: phase.passage, observation: phase.observation, candidates: phase.candidates, selected: event.alternativeId } });
    }

    case 'READ_IN_CONTEXT': {
      if (phase.name !== 'alternatives' && phase.name !== 'undone') {
        return refuse('EVENT_NOT_IN_PHASE', 'nothing to read in context');
      }
      const selected = phase.name === 'alternatives' ? phase.selected : phase.selected;
      if (selected === null) return refuse('NO_SELECTION', 'choose an alternative before reading it in place');
      return ok({ ...state, phase: { name: 'context-review', passage: phase.passage, observation: phase.observation, candidates: phase.candidates, selected } });
    }

    case 'BACK_TO_ALTERNATIVES': {
      if (phase.name !== 'context-review') return refuse('EVENT_NOT_IN_PHASE', 'not reviewing a candidate');
      return ok({ ...state, phase: { name: 'alternatives', passage: phase.passage, observation: phase.observation, candidates: phase.candidates, selected: phase.selected } });
    }

    /* ⭐ Reachable from `context-review` ALONE — see TRANSITIONS. */
    case 'APPLY': {
      if (phase.name !== 'context-review') return refuse('EVENT_NOT_IN_PHASE', 'APPLY requires reading in context first');
      const chosen = phase.candidates.items.find((a) => a.id === phase.selected);
      if (!chosen) return refuse('UNKNOWN_ALTERNATIVE', phase.selected);
      const version = state.version + 1;
      const record: RevisionEvent = {
        kind: 'apply', version, sectionId: phase.passage.sectionId,
        alternativeId: chosen.id, alternativeName: chosen.name,
      };
      return ok({
        ...state, version, history: [...state.history, record],
        phase: { name: 'applied', passage: phase.passage, observation: phase.observation, candidates: phase.candidates, applied: record },
      });
    }

    /* ⭐ Undo APPENDS. ⛔ It never removes the apply it reverses, and the version
       never returns to its pre-apply value — the act happened. */
    case 'UNDO': {
      if (phase.name !== 'applied') return refuse('EVENT_NOT_IN_PHASE', 'nothing to undo');
      const version = state.version + 1;
      const record: RevisionEvent = {
        kind: 'undo', version, sectionId: phase.passage.sectionId,
        alternativeId: phase.applied.alternativeId, alternativeName: phase.applied.alternativeName,
      };
      return ok({
        ...state, version, history: [...state.history, record],
        phase: { name: 'undone', passage: phase.passage, observation: phase.observation, candidates: phase.candidates, selected: phase.applied.alternativeId },
      });
    }
  }
}

function ok(state: StudioState): Outcome { return { refused: false, state }; }

type Carried = { passage: PassageRef; observation: Observation };
function withObservation(phase: Phase): Carried | null {
  switch (phase.name) {
    case 'conversation': case 'reasoning': case 'challenge': case 'teaching':
    case 'alternatives': case 'context-review': case 'applied': case 'undone':
      return { passage: phase.passage, observation: phase.observation };
    default:
      return null;
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   GRAPH INTROSPECTION — what the falsifiers read
   ══════════════════════════════════════════════════════════════════════════ */

/** Shortest number of events from `from` to `writing`, over the declared graph.
 *  ⭐ Computed from TRANSITIONS, ⛔ not from a hand-maintained table that could
 *  drift from the machine it claims to describe. */
export function gesturesToWriting(from: PhaseName): number {
  return gesturesToWritingOver(TRANSITIONS, from);
}

/** ⭐ Parameterised over the table so a defeat candidate that RESHAPES the graph
 *  is measured against ITS OWN graph, ⛔ never against the reference's. */
export function gesturesToWritingOver(
  table: Readonly<Record<PhaseName, readonly EventType[]>>,
  from: PhaseName,
): number {
  if (from === 'writing') return 0;
  const successors = (p: PhaseName): readonly PhaseName[] => {
    const evs = table[p] ?? [];
    const out: PhaseName[] = [];
    if (evs.includes('RELEASE') || evs.includes('RETURN_TO_WRITING')) out.push('writing');
    if (evs.includes('BACK_TO_CONVERSATION')) out.push('conversation');
    if (evs.includes('BACK_TO_ALTERNATIVES')) out.push('alternatives');
    if (evs.includes('TALK')) out.push('conversation');
    if (evs.includes('REQUEST_ALTERNATIVES')) out.push('alternatives');
    if (evs.includes('READ_IN_CONTEXT')) out.push('context-review');
    if (evs.includes('APPLY')) out.push('applied');
    if (evs.includes('UNDO')) out.push('undone');
    if (evs.includes('ASK_WHY')) out.push('reasoning');
    if (evs.includes('DISAGREE')) out.push('challenge');
    if (evs.includes('ASK_TEACHING')) out.push('teaching');
    return out;
  };
  const seen = new Set<PhaseName>([from]);
  let frontier: PhaseName[] = [from];
  for (let depth = 1; depth <= PHASE_NAMES.length; depth += 1) {
    const next: PhaseName[] = [];
    for (const p of frontier) {
      for (const s of successors(p)) {
        if (s === 'writing') return depth;
        if (!seen.has(s)) { seen.add(s); next.push(s); }
      }
    }
    if (next.length === 0) break;
    frontier = next;
  }
  return Number.POSITIVE_INFINITY;
}

/** The keys an Alternative is allowed to carry. F6 asserts over this. */
export const ALTERNATIVE_KEYS: readonly string[] = ['id', 'name', 'text', 'rationale'];

/** Keys that would make an alternative set a ranking. ⛔ None may ever appear. */
export const RANKING_KEYS: readonly string[] = [
  'rank', 'score', 'confidence', 'severity', 'priority', 'weight', 'order',
  'recommended', 'suggested', 'default', 'best', 'preferred', 'mostRecent',
];
