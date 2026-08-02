import type { LivingWork, LivingWorksPhase } from './useLivingWorks';
import { UNTITLED_EXPRESSION } from '@/lib/manuscript/untitledExpression';

/**
 * What the Studio shell names itself.
 *
 * ── Why this exists (2026-08-01) ───────────────────────────────────────────
 *
 * The authenticated walk on #866 confirmed the main column now returns the
 * member to their work — and exposed that the room did not agree with it. The
 * persistent rail still carried the manuscript title directly under "Author
 * Studio", so the shell said *this place is your book* while the page beside
 * it said *this place is your work*. One room, two answers.
 *
 * This module holds the shell's answer, and only that. It does not decide
 * WHICH work is the arrival — that decision is `arrivalWork`, made once by
 * Studio Home and handed down. The shell is told the page's answer rather
 * than re-deriving it, so the two cannot drift apart later.
 *
 * The four states, and why each is what it is:
 *
 *   held        The works read has not settled. Say nothing yet. Naming the
 *               manuscript and then replacing it with the work would stage a
 *               small forgetting-then-remembering in the rail on every
 *               arrival — the same reason Home holds its header.
 *
 *   work        Exactly one declared work. Its name IS the shell's identity.
 *               An unnamed work keeps its absence: "Your work" is orientation,
 *               not a name, and nothing by that name is stored.
 *
 *   manuscript  No work declared. Byte-for-byte the shell that existed before
 *               declaration was possible — the manuscript title beneath the
 *               place's name. Preserved, not defended: it is right for a
 *               Studio whose only object is a book.
 *
 *   neutral     Two or more works — or a read that failed. The shell names
 *               the place and stops. "Which of your works did you come back
 *               to?" is a real question and this slice may not answer it by
 *               silently picking one, and it may not answer it by falling
 *               back to the manuscript either: that would re-assert exactly
 *               the identity this correction removes. A failed read is also
 *               not an absence of works, so it lands here rather than in
 *               `manuscript`.
 *
 * What the shell does NOT say in any state: that the manuscript is attached
 * to, contained by, or owned by the work. In the `work` state the manuscript
 * simply leaves the identity block and remains reachable where it already
 * was — the Current Book destinations in the rail. Nothing writes
 * living_work_expressions, so no containment may be drawn.
 */

export type ShellIdentity =
  | { kind: 'held' }
  | { kind: 'work'; label: string; named: boolean }
  | { kind: 'manuscript'; label: string; named: boolean }
  | { kind: 'neutral' };

export interface ShellIdentityInput {
  worksPhase: LivingWorksPhase;
  /** How many works the member has declared. Distinguishes none from several. */
  workCount: number;
  /** Studio Home's arrival decision, passed down. Never re-derived here. */
  work: LivingWork | null;
  manuscriptTitle?: string | null;
  /**
   * Whether a manuscript EXISTS — a different question from whether it has a
   * title. Since 2026-08-02 a member can begin writing without naming the
   * expression, so an untitled manuscript is a real manuscript with
   * `title = NULL`. Without this flag the shell cannot tell "no book" from "a
   * book not yet named", and would fall silent on the second.
   */
  hasManuscript?: boolean;
}

/**
 * Orientation copy for an expression the member has not named.
 *
 * Display only — nothing by this name is stored, and the database title stays
 * NULL. Sibling of "Your work" for an unnamed Living Work, and kept distinct
 * from it on purpose: the work's name answers "what am I in relationship
 * with?", the expression's title answers "what is this called?". Two
 * declarations, two absences, two different words for the absence.
 *
 * Explicitly NOT: "Untitled", "New manuscript", "Draft 1", a generated
 * filename, or the Living Work's name.
 *
 * The word itself now lives in `lib/manuscript/untitledExpression` so the
 * render/export boundary — server code, which cannot import this client
 * module — says the same thing rather than a copy of it. Re-exported here so
 * this module's consumers are unchanged.
 */
export { UNTITLED_EXPRESSION };

export function shellIdentity({
  worksPhase,
  workCount,
  work,
  manuscriptTitle,
  hasManuscript,
}: ShellIdentityInput): ShellIdentity {
  if (worksPhase === 'loading') return { kind: 'held' };

  if (work) {
    return {
      kind: 'work',
      label: work.title ?? 'Your work',
      named: work.title !== null && work.title !== undefined,
    };
  }

  // Only a settled, genuinely empty read may fall back to the book. An
  // untitled book still counts as a book — the absence of a name is not the
  // absence of the thing.
  if (worksPhase === 'ready' && workCount === 0 && (manuscriptTitle || hasManuscript)) {
    return manuscriptTitle
      ? { kind: 'manuscript', label: manuscriptTitle, named: true }
      : { kind: 'manuscript', label: UNTITLED_EXPRESSION, named: false };
  }

  return { kind: 'neutral' };
}
