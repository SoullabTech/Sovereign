/**
 * FLAGSHIP STUDIO — MACHINE-LEVEL ACCEPTANCE LAWS
 *
 * `JARVIS-WRITERS-STUDIO-COMPLETE-01 / B0`, internal checkpoint B1.
 *
 * ⚠️ SCOPE, STATED PLAINLY: the approved D0 acceptance set is F1–F12. EIGHT of
 * them (F4–F11) are properties of the DECISION LAYER and are provable here.
 * FOUR are properties of the COMPOSITION — F1 no permanent furniture, F2 measure
 * invariance, F3 MAIA inline in the manuscript, F12 coverage in one gesture —
 * and they are ⛔ NOT proved by this file and must never be reported as proved
 * by it. They land with B2/B3/B6 against a rendered room.
 *
 * ⭐ Authored BEFORE the room is rebuilt. A suite written against an existing
 * implementation passes by construction and proves nothing.
 */

import {
  PHASE_NAMES, RANKING_KEYS, ALTERNATIVE_KEYS,
  type AlternativeSet, type Observation, type PassageRef, type Place,
  type Reasoning, type StudioState, type Teaching,
  PERMANENT_NON_CONCLUSIONS,
} from '../../../../lib/writersStudio/studio/machine';
import { allCapabilities, isOfferable, resolveCapability, type CapabilityId } from '../../../../lib/writersStudio/studio/capability';
import type { Engine } from './engine';

export interface LawResult { readonly id: string; readonly ok: boolean; readonly detail: string }

const PLACE: Place = { sectionId: 'sec-ea-10-i', anchor: 'anchor:ea-10-i:0' };
const PASSAGE: PassageRef = { sectionId: 'sec-ea-10-i', codePointStart: 402, codePointEnd: 446 };

const OBSERVATION: Observation = {
  observationId: 'dobs_11111111-2222-3333-4444-555555555555',
  readingId: 'read_ea10', observationKey: 'o1', lens: 'rhythm',
  text: 'This sentence is the turn in the paragraph.',
  refs: [PASSAGE],
};

const TEACHING: Teaching = { text: 'Compression at the turn.', drawnFrom: [PASSAGE] };

/* The five NO-SUBSTRATE capabilities named in the D0 capability-honesty matrix. */
const MUST_BE_ABSENT: readonly CapabilityId[] = [
  'source.verify', 'similarity.search', 'material.cluster', 'idea.develop', 'edition.compare',
];

function must(id: string, ok: boolean, detail: string): LawResult { return { id, ok, detail }; }

/**
 * ⭐ PER-LAW ISOLATION. The matrix's first run collapsed because one candidate
 * was lethal to an UNRELATED law's walk: D4's deficient reasoning is refused at
 * the machine boundary, the F9 walk threw, and `runLaws` died carrying away the
 * kill F7 had already recorded. *A candidate that crashes a neighbouring walk
 * must not be able to hide its own death.* A throw is now this law's failure
 * and nothing else's.
 */
function law(id: string, body: () => LawResult): LawResult {
  try { return body(); }
  catch (err) { return { id, ok: false, detail: `threw: ${err instanceof Error ? err.message : String(err)}` }; }
}

/** A conforming reasoning, used by laws that are NOT about reasoning. ⛔ Laws
 *  must exercise their own decision, not be held hostage by a neighbour's. */
const CONFORMING_REASONING: Reasoning = {
  text: 'The sentence is the turn in the paragraph.',
  limits: ['author-intent', 'reader-effect', 'outside-coverage'],
};

/** Drive the engine, throwing on an unexpected refusal so a broken walk is loud. */
function drive(e: Engine, state: StudioState, events: Parameters<Engine['transition']>[1][]): StudioState {
  let cur = state;
  for (const ev of events) {
    const out = e.transition(cur, ev);
    if (out.refused) throw new Error(`unexpected refusal at ${ev.type}: ${out.code} ${out.detail}`);
    cur = out.state;
  }
  return cur;
}

/** The conversation walk every law reuses: hold → talk → alternatives → select. */
function toAlternatives(e: Engine): StudioState {
  const candidates = e.makeAlternatives();
  const first = candidates.items[0];
  if (!first) throw new Error('engine produced an empty alternative set');
  return drive(e, e.initialState(PLACE, 1), [
    { type: 'HOLD_PASSAGE', passage: PASSAGE },
    { type: 'TALK', observation: OBSERVATION },
    { type: 'REQUEST_ALTERNATIVES', candidates },
    { type: 'SELECT_ALTERNATIVE', alternativeId: first.id },
  ]);
}

export function runLaws(e: Engine): readonly LawResult[] {
  const out: LawResult[] = [];

  /* ── F4 · held asserts nothing ─────────────────────────────────────────── */
  out.push(law('F4-held-asserts-nothing', () => {
    const held = drive(e, e.initialState(PLACE, 1), [{ type: 'HOLD_PASSAGE', passage: PASSAGE }]);
    const keys = Object.keys(held.phase as object);
    const leaked = keys.filter((k) => k !== 'name' && k !== 'passage');
    return must('F4-held-asserts-nothing', held.phase.name === 'passage-held' && leaked.length === 0,
      leaked.length === 0 ? 'held carries only the passage' : `held leaked: ${leaked.join(', ')}`);
  }));

  /* ── F5 · apply is unreachable without reading in context ──────────────── *
   * ⭐ Asserted STRUCTURALLY over the transition table, ⛔ not by observing a
   * disabled control — a disabled control is a present affordance with a
   * client-side guard, and a client-side guard is not the gate.             */
  out.push(law('F5-apply-only-from-context-review', () => {
    const altRow = e.transitions['alternatives'] ?? [];
    const structural = !altRow.includes('APPLY');
    const fromEvery = PHASE_NAMES.filter((p) => p !== 'context-review')
      .filter((p) => (e.transitions[p] ?? []).includes('APPLY'));
    /* And behaviourally: APPLY from `alternatives` with a selection must refuse. */
    const at = toAlternatives(e);
    const attempt = e.transition(at, { type: 'APPLY' });
    return must('F5-apply-only-from-context-review',
      structural && fromEvery.length === 0 && attempt.refused,
      structural && fromEvery.length === 0
        ? (attempt.refused ? 'APPLY absent from every phase but context-review, and refused behaviourally' : 'table is clean but APPLY was ACCEPTED from alternatives')
        : `APPLY reachable from: ${fromEvery.join(', ') || 'alternatives'}`);
  }));

  /* ── F6 · alternatives carry no ranking ────────────────────────────────── */
  out.push(law('F6-no-ranking', () => {
    const set: AlternativeSet = e.makeAlternatives();
    const keys = new Set<string>();
    for (const a of set.items) for (const k of Object.keys(a)) keys.add(k);
    const ranking = [...keys].filter((k) => RANKING_KEYS.includes(k));
    const extra = [...keys].filter((k) => !ALTERNATIVE_KEYS.includes(k));
    const setKeys = Object.keys(set).filter((k) => k !== 'items');
    const hasKeepMine = set.items.some((a) => a.text === null);
    const ok = ranking.length === 0 && extra.length === 0 && setKeys.length === 0 && hasKeepMine;
    return must('F6-no-ranking', ok,
      ok ? `${set.items.length} unranked directions, keep-mine present`
        : `ranking keys ${ranking.join(',') || '—'} · extra ${extra.join(',') || '—'} · set keys ${setKeys.join(',') || '—'} · keep-mine ${hasKeepMine}`);
  }));

  /* ── F7 · permanent non-conclusions survive complete coverage ──────────── *
   * ⭐ Tested AT FULL COVERAGE, because the defeat candidate is an engine that
   * discharges them once the whole work has been read.                      */
  out.push(law('F7-permanent-limits-never-discharged', () => {
    const full: Reasoning = e.makeReasoning(1);
    const partial: Reasoning = e.makeReasoning(0.4);
    const missingFull = PERMANENT_NON_CONCLUSIONS.filter((l) => !full.limits.includes(l));
    const missingPartial = PERMANENT_NON_CONCLUSIONS.filter((l) => !partial.limits.includes(l));
    /* The machine must also REFUSE a reasoning that omits one, so a deficient
       object can never become a state the UI could decorate. */
    const conv = drive(e, e.initialState(PLACE, 1), [
      { type: 'HOLD_PASSAGE', passage: PASSAGE }, { type: 'TALK', observation: OBSERVATION },
    ]);
    const deficient = e.transition(conv, { type: 'ASK_WHY', reasoning: { text: 'x', limits: ['outside-coverage'] } });
    const ok = missingFull.length === 0 && missingPartial.length === 0 && deficient.refused;
    return must('F7-permanent-limits-never-discharged', ok,
      ok ? 'author-intent + reader-effect held at coverage 0.4 and 1.0; deficient reasoning refused'
        : `missing@1.0 ${missingFull.join(',') || '—'} · missing@0.4 ${missingPartial.join(',') || '—'} · deficient refused ${deficient.refused}`);
  }));

  /* ── F8 · no dead end ──────────────────────────────────────────────────── */
  out.push(law('F8-no-dead-end', () => {
    const bad = PHASE_NAMES.map((p) => [p, e.gesturesToWriting(p)] as const).filter(([, n]) => n > 2);
    return must('F8-no-dead-end', bad.length === 0,
      bad.length === 0 ? 'every phase reaches writing in ≤2 gestures'
        : bad.map(([p, n]) => `${p}=${n === Number.POSITIVE_INFINITY ? '∞' : n}`).join(' · '));
  }));

  /* ── F9 · no loss of place ─────────────────────────────────────────────── *
   * The full loop including apply and undo. ⛔ Only NAVIGATE_TO may move it.  */
  out.push(law('F9-place-invariant', () => {
    const at = toAlternatives(e);
    const done = drive(e, at, [
      { type: 'READ_IN_CONTEXT' }, { type: 'APPLY' }, { type: 'UNDO' },
    ]);
    const walk = drive(e, e.initialState(PLACE, 1), [
      { type: 'HOLD_PASSAGE', passage: PASSAGE }, { type: 'TALK', observation: OBSERVATION },
      { type: 'ASK_WHY', reasoning: CONFORMING_REASONING }, { type: 'DISAGREE' },
      { type: 'BACK_TO_CONVERSATION' }, { type: 'ASK_TEACHING', teaching: TEACHING },
      { type: 'BACK_TO_CONVERSATION' },
      { type: 'OPEN_OVERLAY', overlay: 'history' }, { type: 'CLOSE_OVERLAY' },
    ]);
    const same = (p: Place) => p.sectionId === PLACE.sectionId && p.anchor === PLACE.anchor;
    /* And NAVIGATE_TO must actually be able to move it — otherwise "invariant"
       would be satisfied by a machine in which place never changes at all. */
    const moved = drive(e, e.initialState(PLACE, 1), [
      { type: 'NAVIGATE_TO', place: { sectionId: 'sec-ea-10-ii', anchor: 'anchor:ea-10-ii:0' } },
    ]);
    const ok = same(done.place) && same(walk.place) && moved.place.sectionId === 'sec-ea-10-ii';
    return must('F9-place-invariant', ok,
      ok ? 'place survived apply, undo, the full conversation and overlays; NAVIGATE_TO moves it'
        : `apply/undo ${JSON.stringify(done.place)} · walk ${JSON.stringify(walk.place)} · nav ${JSON.stringify(moved.place)}`);
  }));

  /* ── F10 · undo restores text without erasing the act ──────────────────── */
  out.push(law('F10-undo-appends', () => {
    const applied = drive(e, toAlternatives(e), [{ type: 'READ_IN_CONTEXT' }, { type: 'APPLY' }]);
    const undone = drive(e, applied, [{ type: 'UNDO' }]);
    const kinds = undone.history.map((h) => h.kind).join('>');
    const ok = kinds === 'apply>undo'
      && undone.version > applied.version
      && undone.history.length === 2;
    return must('F10-undo-appends', ok,
      ok ? `history ${kinds}, v${applied.version}→v${undone.version} (never returns to v${applied.version - 1})`
        : `history "${kinds}" · v${applied.version}→v${undone.version} · len ${undone.history.length}`);
  }));

  /* ── F11 · no capability without substrate ─────────────────────────────── */
  out.push(law('F11-no-unofferable-action', () => {
    const states = [
      e.initialState(PLACE, 1),
      drive(e, e.initialState(PLACE, 1), [{ type: 'HOLD_PASSAGE', passage: PASSAGE }]),
      toAlternatives(e),
    ];
    const offendingEvents = states.flatMap((s) =>
      e.availableEvents(s).filter((ev) => !isOfferable(e.capabilityOf(ev))));
    const wronglyLive = MUST_BE_ABSENT.filter((c) => resolveCapability(c).standing !== 'absent');
    const noReason = allCapabilities()
      .filter((c) => c.standing === 'gated' || c.standing === 'absent')
      .filter((c) => c.because.trim().length < 20);
    const ok = offendingEvents.length === 0 && wronglyLive.length === 0 && noReason.length === 0;
    return must('F11-no-unofferable-action', ok,
      ok ? `${MUST_BE_ABSENT.length} no-substrate capabilities absent; every gated/absent one names its reason`
        : `offered-but-unofferable ${[...new Set(offendingEvents)].join(',') || '—'} · wrongly-live ${wronglyLive.join(',') || '—'} · unreasoned ${noReason.map((c) => c.id).join(',') || '—'}`);
  }));

  return out;
}

/* ══════════════════════════════════════════════════════════════════════════
   ⭐ THE ADVENTURE LOOP — arriving at a passage from a finding
   ══════════════════════════════════════════════════════════════════════════ */

export function runArrivalLaws(e: Engine): readonly LawResult[] {
  const out: LawResult[] = [];
  const TRAIL = { from: 'your review', backLabel: 'Back to your review' } as const;
  const ELSEWHERE: Place = { sectionId: 'ch-6', anchor: 'anchor:ch-6:0' };

  /* ── A1 · the observation travels; ⛔ nothing is re-read ─────────────────── */
  out.push(law('A1-finding-travels-to-the-passage', () => {
    const arrived = drive(e, e.initialState(PLACE, 1), [
      { type: 'ARRIVE_AT_PASSAGE', place: ELSEWHERE, passage: PASSAGE,
        observation: OBSERVATION, trail: TRAIL },
    ]);
    const p = arrived.phase;
    const carried = p.name === 'conversation' && p.observation.observationId === OBSERVATION.observationId;
    /* ⛔ `passage-held` would mean nothing is asserted — but the member chose an
       observation, so landing there would either be false or require a re-read. */
    return must('A1-finding-travels-to-the-passage',
      carried && arrived.place.sectionId === ELSEWHERE.sectionId,
      carried ? 'arrived in conversation carrying the observation the member clicked'
        : `landed in ${p.name}${p.name === 'passage-held' ? ' — the observation was dropped or would need re-reading' : ''}`);
  }));

  /* ── A2 · ⛔ no dead end: there is always a way back ─────────────────────── */
  out.push(law('A2-arrival-is-never-a-trapdoor', () => {
    const arrived = drive(e, e.initialState(PLACE, 1), [
      { type: 'ARRIVE_AT_PASSAGE', place: ELSEWHERE, passage: PASSAGE,
        observation: OBSERVATION, trail: TRAIL },
    ]);
    if (!arrived.trail) return must('A2-arrival-is-never-a-trapdoor', false, 'arrived carrying no trail back');
    const back = e.transition(arrived, { type: 'BACK_ALONG_TRAIL' });
    const ok = !back.refused && back.state.trail === undefined;
    return must('A2-arrival-is-never-a-trapdoor', ok,
      ok ? `"${arrived.trail.backLabel}" leads out and clears the trail`
        : 'the way back is refused or leaves a stale trail');
  }));

  /* ── A3 · ⛔ a trail cannot be walked when none exists ───────────────────── */
  out.push(law('A3-no-phantom-trail', () => {
    const r = e.transition(e.initialState(PLACE, 1), { type: 'BACK_ALONG_TRAIL' });
    return must('A3-no-phantom-trail', r.refused,
      r.refused ? 'refused with nothing to go back to' : 'walked a trail that was never laid');
  }));

  return out;
}
