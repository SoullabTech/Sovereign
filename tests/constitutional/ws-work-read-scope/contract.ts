/**
 * WS-WORK-CONTINUITY · Part B · typed OBSERVABLE contract for the standing, revocable Work reading scope.
 * Types observable semantics only (what text reached the reader, what was receipted), never storage shape.
 * Fictional data only. The reference below is a TEST DOUBLE, not an implementation and never a seed.
 */
export type Member = string;
export interface Section { id: string; chapter: string }
export type ScopeEvent =
  | { kind: 'grant'; id: string; member: Member; work: string; level: 'chapter' | 'work'; chapters?: string[] }
  | { kind: 'revoke'; id: string; member: Member; work: string };
export interface World {
  work: string;
  sections: Section[];
  /** CURRENT saved revision per section. */
  saved: Record<string, { rev: number; text: string }>;
  events: ScopeEvent[];
  mode: 'ordinary' | 'sanctuary';
  /** A deliberate "Read this chapter" reading exists. Must never be mistaken for a scope. */
  priorReadingExists: boolean;
}
export interface Ask {
  member: Member; thread: string; via: 'fresh' | 'recovered';
  /** Server-derived chapter the question concerns (locus / named chapter). Never client-supplied authority. */
  chapter?: string;
  /** Revisions quoted by earlier turns of this thread, by section. */
  priorQuotedRev?: Record<string, number>;
}
export interface Outcome {
  supplied: { sectionId: string; rev: number; text: string }[];
  receipts: { sectionId: string; rev: number; scopeEventId: string }[];
  movedNotes: string[];
  coverageDischarged: boolean;
}
export type Reader = (w: World, a: Ask) => Outcome;
export type ReaderFactory = () => Reader;

const EMPTY: Outcome = { supplied: [], receipts: [], movedNotes: [], coverageDischarged: false };
export const empty = (): Outcome => ({ ...EMPTY, supplied: [], receipts: [], movedNotes: [] });

/** Latest member-and-work-bound event wins; state is DERIVED from events, never stored. */
export function activeGrant(w: World, m: Member): Extract<ScopeEvent, { kind: 'grant' }> | null {
  let cur: Extract<ScopeEvent, { kind: 'grant' }> | null = null;
  for (const e of w.events) {
    if (e.member !== m || e.work !== w.work) continue;
    cur = e.kind === 'grant' ? e : null;
  }
  return cur;
}

export const REFERENCE: ReaderFactory = () => (w, a) => {
  if (w.mode === 'sanctuary') return empty();
  const g = activeGrant(w, a.member);
  if (!g || !a.chapter) return empty();
  if (g.level === 'chapter' && !(g.chapters ?? []).includes(a.chapter)) return empty();
  const secs = w.sections.filter((s) => s.chapter === a.chapter);
  const o = empty();
  for (const s of secs) {
    const cur = w.saved[s.id]; if (!cur) continue;
    o.supplied.push({ sectionId: s.id, rev: cur.rev, text: cur.text });
    o.receipts.push({ sectionId: s.id, rev: cur.rev, scopeEventId: g.id });
    const q = a.priorQuotedRev?.[s.id];
    if (q !== undefined && q !== cur.rev) o.movedNotes.push(s.id);
  }
  return o;
};
