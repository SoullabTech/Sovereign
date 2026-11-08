/**
 * WS-DECISION-CONTINUITY · typed OBSERVABLE contract (test double, not an implementation, never a seed).
 * Ruling (founder, 2026-11-08): a settled decision binds MAIA to KNOW AND SAY that the writer settled it and not to re-offer it
 * unprompted — never to refuse to discuss it, never to treat it as a fact about the text. One member-visible, revocable record of
 * the writer's own acts, shared across rooms. Fictional data only.
 */
export type Room = 'work_conversation' | 'passage_desk' | 'develop';
export type Event =
  | { kind: 'settle'; id: string; member: string; work: string; room: Room; subject: string; saidIn: string; versionRef: string | null }
  | { kind: 'withdraw'; id: string; member: string; work: string; targetId: string };

export interface World {
  work: string;
  events: Event[];
  /** current saved version per subject (a decision about wording is bound to the version it was made against). */
  currentVersion: Record<string, string>;
  mode: 'ordinary' | 'sanctuary';
  /** wording that merely stayed unchanged — must never become a decision. */
  unchangedSubjects: string[];
}
export interface Request {
  member: string; room: Room;
  via: 'fresh' | 'recovered';
  /** the writer explicitly asks to revisit this subject. */
  revisit?: string;
  /** MAIA's candidate suggestions this turn (what she would offer). */
  candidateSuggestions: string[];
}
export interface Presented { id: string; subject: string; saidIn: string; stale: boolean }
export interface Outcome {
  presented: Presented[];
  /** suggestions actually offered unprompted */
  offered: string[];
  /** subjects MAIA is allowed to discuss */
  discussable: string[];
  /** a decision was restated as a claim about the text, or used to grade it */
  usedAsRubric: boolean;
  /** decisions created by the system rather than by a writer act */
  inferredCreated: string[];
}
export type Reader = (w: World, r: Request) => Outcome;
export type ReaderFactory = () => Reader;

export const emptyOutcome = (r: Request): Outcome => ({
  presented: [], offered: [...r.candidateSuggestions], discussable: [...r.candidateSuggestions], usedAsRubric: false, inferredCreated: [],
});

/** Active decisions: a settle not later withdrawn; a withdrawn id is never revived; scoped to member AND work. */
export function activeDecisions(w: World, member: string): Extract<Event, { kind: 'settle' }>[] {
  const out = new Map<string, Extract<Event, { kind: 'settle' }>>();
  for (const e of w.events) {
    if (e.member !== member || e.work !== w.work) continue;
    if (e.kind === 'settle') out.set(e.id, e);
    else out.delete(e.targetId);
  }
  return [...out.values()];
}

export const REFERENCE: ReaderFactory = () => (w, r) => {
  const o = emptyOutcome(r);
  if (w.mode === 'sanctuary') return o;
  const live = activeDecisions(w, r.member);
  for (const d of live) {
    const stale = d.versionRef !== null && w.currentVersion[d.subject] !== d.versionRef;
    o.presented.push({ id: d.id, subject: d.subject, saidIn: d.saidIn, stale });
    const suppress = !stale && r.revisit !== d.subject;
    if (suppress) o.offered = o.offered.filter((s) => s !== d.subject);
  }
  return o; // discussable stays complete: a decision never forbids discussion
};
