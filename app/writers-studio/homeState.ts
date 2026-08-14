import type { CurrentManuscript } from './useCurrentManuscript';
import type { LivingWork } from './useLivingWorks';

/**
 * The three arrival states of Studio Home — ruled by the founder 2026-08-14.
 *
 * There are three, not two. The middle one is not an edge case; it is
 * essential to the Studio's honesty:
 *
 *   1. CONTINUE  — a work is genuinely continuable → resume it prominently
 *   2. ORIENT    — work or writing exists, but continuation is NOT trustworthy
 *                  → orient around what genuinely exists, manufacture nothing
 *   3. BEGIN     — nothing exists → begin or import
 *
 * ── What may decide a hero ────────────────────────────────────────────────
 * ⛔ NOT `living_work.updatedAt`. A Work row changing does not establish that
 * the writer last worked there — renaming it, declaring a form, or attaching
 * a material all move that timestamp without a word being written.
 * ✅ `manuscript.lastWrittenAt` — the working draft's updated_at, which moves
 * when the member actually writes. NULL means no writing has happened.
 *
 * If no work has writing activity, there is no trustworthy continuation
 * signal and this module returns ORIENT rather than inventing one.
 */

export type ArrivalKind = 'continue' | 'orient' | 'begin';

export interface Arrival {
  kind: ArrivalKind;
  /** The work to resume. Only ever set when kind === 'continue'. */
  resume: LivingWork | null;
  /** Works other than the resumed one, most-recently-written first. */
  shelf: LivingWork[];
  /**
   * The most substantial piece of unclaimed writing, when it is the most
   * significant thing present. Only set for 'orient', where it becomes the
   * arrival — real writing outranks an empty work.
   */
  feature: CurrentManuscript | null;
  /** Unclaimed writing, largest first, excluding `feature`. */
  imported: CurrentManuscript[];
}

export function manuscriptIdOf(work: LivingWork): string | null {
  return work.expressions.find((e) => e.expressionType === 'manuscript')?.expressionId ?? null;
}

const time = (iso: string | null | undefined): number => {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? 0 : t;
};

export function arrivalFor(works: LivingWork[], manuscripts: CurrentManuscript[]): Arrival {
  const byId = new Map(manuscripts.map((m) => [m.id, m]));
  const claimed = new Set(works.map(manuscriptIdOf).filter(Boolean) as string[]);
  const unclaimed = [...manuscripts]
    .filter((m) => !claimed.has(m.id))
    .sort((a, b) => b.charCount - a.charCount);

  /**
   * Writing activity for a work — never the work row's own updatedAt, and
   * never a draft row's timestamp alone.
   *
   * ⚠️ A working-draft row can exist with `updated_at` set and zero content:
   * `/manuscripts/blank` creates the draft alongside the blank manuscript, and
   * reuses untouched blanks rather than minting duplicates. So a draft
   * timestamp proves a row was touched, not that a person wrote. Requiring
   * BOTH a timestamp and actual characters is what keeps this an act rather
   * than a mutation — the same distinction that disqualified
   * `living_work.updatedAt`, one layer down.
   *
   * Observed live 2026-08-14: a work bound to a 0-char manuscript whose draft
   * row was stamped hours earlier was promoted to the CONTINUE hero and
   * rendered "No writing yet · written 6 hours ago" — two clauses that
   * contradict each other, offering continuation of nothing.
   */
  const writtenAt = (w: LivingWork): number => {
    const id = manuscriptIdOf(w);
    if (!id) return 0;
    const m = byId.get(id);
    if (!m || m.charCount <= 0) return 0;
    return time(m.lastWrittenAt);
  };

  const written = works.filter((w) => writtenAt(w) > 0).sort((a, b) => writtenAt(b) - writtenAt(a));
  const unwritten = works
    .filter((w) => writtenAt(w) === 0)
    .sort((a, b) => time(b.updatedAt) - time(a.updatedAt));

  if (written.length > 0) {
    return {
      kind: 'continue',
      resume: written[0],
      shelf: [...written.slice(1), ...unwritten],
      feature: null,
      imported: unclaimed,
    };
  }

  if (works.length > 0 || unclaimed.length > 0) {
    /* Nothing is continuable. If real writing is sitting unclaimed, IT is the
       arrival — 84 pages of the member's own words outrank an empty work. */
    return {
      kind: 'orient',
      resume: null,
      shelf: unwritten,
      feature: unclaimed[0] ?? null,
      imported: unclaimed.slice(1),
    };
  }

  return { kind: 'begin', resume: null, shelf: [], feature: null, imported: [] };
}
