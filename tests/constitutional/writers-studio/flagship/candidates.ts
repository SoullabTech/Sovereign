/**
 * DEFEAT CANDIDATES — eight deliberately WRONG rooms.
 *
 * ⭐ Each is the SMALLEST COMPETENT embodiment of one named constitutional
 * error, built on the reference substrate with exactly one decision replaced.
 * Several are the shape a careful engineer reaches for FIRST — that is why they
 * exist. ⛔ A surviving candidate repairs the SUITE, never the candidate.
 */

import {
  gesturesToWritingOver, transition, TRANSITIONS, UNIVERSAL_EVENTS, initialState,
  type AlternativeSet, type EventType, type Outcome, type PhaseName, type Reasoning,
  type RevisionEvent, type StudioEvent, type StudioState,
} from '../../../../lib/writersStudio/studio/machine';
import { CAPABILITY_OF, REFERENCE, referenceAlternatives, referenceReasoning, type Engine } from './engine';

/** Restrict or extend the reference table, then measure over the result. */
function withTable(
  base: Engine, name: string,
  table: Readonly<Record<PhaseName, readonly EventType[]>>,
  override?: (s: StudioState, e: StudioEvent) => Outcome | null,
): Engine {
  return {
    ...base, name, transitions: table,
    gesturesToWriting: (p) => gesturesToWritingOver(table, p),
    transition(state, event) {
      const universal = UNIVERSAL_EVENTS.includes(event.type);
      if (!universal && !(table[state.phase.name] ?? []).includes(event.type)) {
        return { refused: true, code: 'EVENT_NOT_IN_PHASE', detail: `${event.type} not in ${state.phase.name}` };
      }
      const custom = override?.(state, event);
      return custom ?? transition(state, event);
    },
  };
}

/* ── D1 · The opening observation is attached when the passage is held ─────
   ⭐ THE MOST LIKELY REAL IMPLEMENTATION. Holding a sentence fires the read and
   the room shows what MAIA noticed straight away. It feels helpful; it is MAIA
   asserting before the writer asked. Reads as an offer, IS an observation. */
const D1_HELD_ASSERTS: Engine = {
  ...REFERENCE, name: 'D1_HELD_ASSERTS',
  transition(state, event) {
    const out = transition(state, event);
    if (!out.refused && event.type === 'HOLD_PASSAGE' && out.state.phase.name === 'passage-held') {
      const leaky = { ...out.state.phase, openingObservation: 'This sentence carries more weight than its length suggests.' };
      return { refused: false, state: { ...out.state, phase: leaky as unknown as StudioState['phase'] } };
    }
    return out;
  },
};

/* ── D2 · Apply is offered from the alternatives list, guarded at runtime ───
   ⭐ THE DISABLED-BUTTON SHAPE. Apply is rendered beside the candidates and a
   check stops it until something is selected. Every other law passes. The gate
   has become a client-side guard, and a client-side guard is not the gate. */
const D2_APPLY_FROM_ALTS: Engine = withTable(
  REFERENCE, 'D2_APPLY_FROM_ALTS',
  { ...TRANSITIONS, alternatives: [...(TRANSITIONS['alternatives'] ?? []), 'APPLY'] },
  (state, event) => {
    if (event.type !== 'APPLY' || state.phase.name !== 'alternatives') return null;
    const phase = state.phase;
    if (phase.selected === null) return { refused: true, code: 'NO_SELECTION', detail: 'pick one first' };
    const chosen = phase.candidates.items.find((a) => a.id === phase.selected);
    if (!chosen) return { refused: true, code: 'UNKNOWN_ALTERNATIVE', detail: phase.selected };
    const version = state.version + 1;
    const record: RevisionEvent = {
      kind: 'apply', version, sectionId: phase.passage.sectionId,
      alternativeId: chosen.id, alternativeName: chosen.name,
    };
    return { refused: false, state: {
      ...state, version, history: [...state.history, record],
      phase: { name: 'applied', passage: phase.passage, observation: phase.observation, candidates: phase.candidates, applied: record },
    } };
  },
);

/* ── D3 · Alternatives ordered by an internal confidence score ─────────────
   ⭐ THE RANKING THAT HIDES. Nothing in the rendered output says "best"; the
   set simply arrives sorted by how confident the model is. Presentation order
   is not a ranking — ordering BY AN EVALUATIVE FUNCTION is one. */
const D3_RANKED: Engine = {
  ...REFERENCE, name: 'D3_RANKED',
  makeAlternatives(): AlternativeSet {
    const scored = referenceAlternatives().items.map((a, i) => ({ ...a, score: 1 - i * 0.2 }));
    return { items: [...scored].sort((x, y) => y.score - x.score) };
  },
};

/* ── D4 · Complete coverage discharges the permanent non-conclusions ───────
   ⭐ DEFENSIBLE-SOUNDING AND WRONG. Coverage may discharge whole-work-pattern,
   across-unread-span and outside-coverage. `author-intent` and `reader-effect`
   are PERMANENT. This is the candidate for someone who read the law and
   misremembered which three are dischargeable. */
const D4_COVERAGE_DISCHARGES: Engine = {
  ...REFERENCE, name: 'D4_COVERAGE_DISCHARGES',
  makeReasoning(coverage: number): Reasoning {
    const base = referenceReasoning(coverage);
    if (coverage >= 1) return { text: base.text, limits: [] };
    return base;
  },
};

/* ── D5 · The receipt is a destination ─────────────────────────────────────
   After applying, the only move is undo or keep working through the
   alternatives. Plausible ("you just changed something, deal with it") and it
   strands the writer three gestures from their own manuscript. */
const D5_RECEIPT_DEAD_END: Engine = withTable(REFERENCE, 'D5_RECEIPT_DEAD_END', {
  ...TRANSITIONS,
  applied: ['UNDO'],
  undone: ['SELECT_ALTERNATIVE', 'READ_IN_CONTEXT', 'BACK_TO_CONVERSATION'],
});

/* ── D6 · Apply refetches the draft and re-renders from the section list ────
   ⭐ CORRECT DATA, DESTROYED PLACE — and the single most likely real bug in the
   set. Every other law stays green while the receipt's claim (*you are still
   here*) becomes false. */
const D6_REFETCH_LOSES_PLACE: Engine = {
  ...REFERENCE, name: 'D6_REFETCH_LOSES_PLACE',
  transition(state, event) {
    const out = transition(state, event);
    if (!out.refused && event.type === 'APPLY') {
      return { refused: false, state: { ...out.state, place: { ...out.state.place, anchor: null } } };
    }
    return out;
  },
};

/* ── D7 · Undo deletes the revision it reverses ────────────────────────────
   ⭐ FEELS LIKE A CORRECT UNDO. Text restored, history clean, version back where
   it was — and the member's authored act erased. `working_draft_revisions` is
   append-only for exactly this reason. */
const D7_UNDO_DELETES: Engine = {
  ...REFERENCE, name: 'D7_UNDO_DELETES',
  transition(state, event) {
    const out = transition(state, event);
    if (!out.refused && event.type === 'UNDO') {
      return { refused: false, state: {
        ...out.state,
        version: state.version - 1,
        history: state.history.filter((h) => h.kind !== 'apply'),
      } };
    }
    return out;
  },
};

/* ── D8 · Render every action, disable the ones that are not available ──────
   ⭐ THE CONVINCING DEAD INTERFACE. The room offers Verify sources and Find
   similar passages, then explains in an empty state that nothing was found.
   The capability resolver exists and is simply not consulted at the boundary
   where actions become offers. */
const D8_OFFERS_EVERYTHING: Engine = {
  ...REFERENCE, name: 'D8_OFFERS_EVERYTHING',
  availableEvents(state) {
    return [...(TRANSITIONS[state.phase.name] ?? []), ...UNIVERSAL_EVENTS];
  },
  capabilityOf: (e) => CAPABILITY_OF[e],
};

/* ⚠️ D8 needs an event whose capability is NOT offerable to be observable at
   all. The shipped machine has none — every wired event is live by design — so
   the candidate is given one, which is exactly the defect it models: an action
   reaching the offer layer without passing the resolver. */
const D8_WITH_DEAD_ACTION: Engine = {
  ...D8_OFFERS_EVERYTHING,
  name: 'D8_WITH_DEAD_ACTION',
  transitions: { ...TRANSITIONS, writing: [...(TRANSITIONS['writing'] ?? []), 'BACK_TO_ALTERNATIVES'] },
  availableEvents(state) {
    const base = [...(TRANSITIONS[state.phase.name] ?? []), ...UNIVERSAL_EVENTS];
    /* A "Find similar passages" affordance, offered from the resting state. */
    return state.phase.name === 'writing' ? [...base, 'BACK_TO_ALTERNATIVES'] : base;
  },
  capabilityOf: (e) => (e === 'BACK_TO_ALTERNATIVES' ? 'similarity.search' : CAPABILITY_OF[e]),
  initialState,
};

export const DEFEAT_CANDIDATES: readonly Engine[] = [
  D1_HELD_ASSERTS, D2_APPLY_FROM_ALTS, D3_RANKED, D4_COVERAGE_DISCHARGES,
  D5_RECEIPT_DEAD_END, D6_REFETCH_LOSES_PLACE, D7_UNDO_DELETES, D8_WITH_DEAD_ACTION,
];

export { REFERENCE };
