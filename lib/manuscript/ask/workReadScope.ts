/**
 * WS-WORK-CONTINUITY · Part B — the standing, revocable Work reading scope (PURE half).
 *
 * Founder ruling 2026-11-08: a member-declared, revocable, Work-level standing read
 * scope may stand in for per-Ask single-use authorization for reads inside the Work
 * conversation, with every crossing still receipted. The store and the route live
 * elsewhere; this file is the decision, with no I/O so that it can be tested.
 *
 * ⛔ Nothing here is inferred. There is no default grant, no grant implied by an
 * earlier "Read this chapter", and no scope that survives a revoke.
 * ⛔ This is NOT Editorial Reading coverage. A conversational read never discharges
 * `DEVELOPMENTAL_NON_CONCLUSIONS` and licenses no whole-work claim (law T11).
 */
import { createHash } from 'crypto';

export type ScopeLevel = 'chapter' | 'work';

export interface ScopeEventRow {
  readonly id: string;
  readonly event: 'grant' | 'revoke';
  readonly level: ScopeLevel | null;
  readonly createdAt: string;
}

export interface ActiveGrant { readonly id: string; readonly level: ScopeLevel }

/** Latest event wins. State is DERIVED from events, never stored. Events must be in append order. */
export function activeGrant(events: readonly ScopeEventRow[]): ActiveGrant | null {
  let cur: ActiveGrant | null = null;
  for (const e of events) {
    cur = e.event === 'grant' && e.level ? { id: e.id, level: e.level } : null;
  }
  return cur;
}

export interface SectionHeadLite { readonly id: string; readonly position: number; readonly heading: string | null }

/** Host-side ceiling on how much saved text one answer may carry. */
export const READ_CHAR_BUDGET = 60_000;
/** Host-side ceiling on sections (and so receipts) per Ask. */
export const MAX_READ_SECTIONS = 40;

const WHOLE_WORK = /\b(whole|entire|full)\s+(book|manuscript|work|draft)\b|\bthroughout\b|\bacross\s+(the\s+)?(book|manuscript|work|chapters)\b|\boverall\b|\bfrom the (start|beginning)\b/i;

export interface Selection {
  readonly ids: readonly string[];
  /** Section ids that were in scope for the question but did not fit the budget. */
  readonly overBudget: readonly string[];
}

/**
 * ⭐ HOST-SELECTED, SERVER-DERIVED. The only client-supplied input is the locus id, and it is
 * checked against the member's own section list. ⛔ Nothing the browser says names a section
 * that is not already in `sections`.
 *
 *   chapter level → the locus section only (the passage the writer is at).
 *   work level    → the locus, then sections whose heading the question names, then — only when
 *                   the question is plainly about the whole Work — every section in order,
 *                   all bounded by READ_CHAR_BUDGET.
 */
export function selectSections(input: {
  level: ScopeLevel;
  question: string;
  locusId: string | null;
  sections: readonly SectionHeadLite[];
  sizes: ReadonlyMap<string, number>;
}): Selection {
  const { level, question, locusId, sections, sizes } = input;
  const known = new Set(sections.map((s) => s.id));
  const ordered: string[] = [];
  const add = (id: string) => { if (known.has(id) && !ordered.includes(id)) ordered.push(id); };

  if (locusId) add(locusId);
  if (level === 'work') {
    const q = question.toLowerCase();
    for (const s of sections) {
      const h = s.heading?.trim().toLowerCase();
      /* whole-word match: a short heading ("Air", "One") must not match "fair" or "someone" */
      if (h && h.length >= 3 && new RegExp(`(^|[^\\p{L}\\p{N}])${h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^\\p{L}\\p{N}])`, 'u').test(q)) add(s.id);
    }
    if (WHOLE_WORK.test(question)) for (const s of sections) add(s.id);
  }

  const ids: string[] = [];
  const overBudget: string[] = [];
  let used = 0;
  for (const id of ordered) {
    const size = sizes.get(id) ?? 0;
    if (used + size > READ_CHAR_BUDGET && ids.length > 0) { overBudget.push(id); continue; }
    used += size;
    ids.push(id);
  }
  return { ids, overBudget };
}

export const digestOf = (body: string): string => createHash('sha256').update(body).digest('hex');

/** Sections MAIA quoted/read on an earlier turn whose saved text differs now. */
export function movedSince(
  earlier: ReadonlyMap<string, string>,
  now: ReadonlyMap<string, string>,
): string[] {
  const moved: string[] = [];
  for (const [id, digest] of earlier) {
    const cur = now.get(id);
    if (cur !== undefined && cur !== digest) moved.push(id);
  }
  return moved;
}
