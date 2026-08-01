import type { LivingWork, LivingWorksPhase } from './useLivingWorks';

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
  | { kind: 'manuscript'; label: string }
  | { kind: 'neutral' };

export interface ShellIdentityInput {
  worksPhase: LivingWorksPhase;
  /** How many works the member has declared. Distinguishes none from several. */
  workCount: number;
  /** Studio Home's arrival decision, passed down. Never re-derived here. */
  work: LivingWork | null;
  manuscriptTitle?: string | null;
}

export function shellIdentity({
  worksPhase,
  workCount,
  work,
  manuscriptTitle,
}: ShellIdentityInput): ShellIdentity {
  if (worksPhase === 'loading') return { kind: 'held' };

  if (work) {
    return {
      kind: 'work',
      label: work.title ?? 'Your work',
      named: work.title !== null && work.title !== undefined,
    };
  }

  // Only a settled, genuinely empty read may fall back to the book.
  if (worksPhase === 'ready' && workCount === 0 && manuscriptTitle) {
    return { kind: 'manuscript', label: manuscriptTitle };
  }

  return { kind: 'neutral' };
}
