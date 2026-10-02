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
 * ✅ `manuscript.lastMemberDraftActivityAt` — the working draft's updated_at, which moves
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
  /**
   * Other works the member has genuinely written in, most-recently-written
   * first, standing BESIDE `resume` rather than beneath it.
   *
   * WS-HOME-REDESIGN v0.2 (founder ruling 2026-09-07): a writer's process is
   * plural — they cycle among works by inspiration, not by schedule — so a
   * single hero makes recency quietly masquerade as priority. `resume` still
   * leads because it is where they last were; these are offered at the same
   * moment so returning is a CHOICE among live work, not an instruction to
   * resume the newest thing. Capped, and never presented as a ranking.
   */
  alsoWritten: LivingWork[];
  /** Works not offered under RETURN, most-recently-written first. */
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

/** Every distinct manuscript expression the member declared in this Work. */
export function manuscriptIdsOf(work: LivingWork): string[] {
  return [...new Set(
    work.expressions
      .filter((e) => e.expressionType === 'manuscript')
      .map((e) => e.expressionId),
  )];
}

/**
 * The manuscript identity is singular only when the Work actually has one.
 * A multi-manuscript Work has no implicit manuscript identity; callers must
 * surface a member choice instead of selecting the first expression.
 */
export function manuscriptIdOf(work: LivingWork): string | null {
  const ids = manuscriptIdsOf(work);
  return ids.length === 1 ? ids[0] : null;
}

/**
 * The held manuscripts named by `ids`, in the order of `ids`. ⛔ Never
 * `manuscripts.filter(m => ids.includes(m.id))`: that keeps the held list's
 * RECENCY order and silently discards the order the choice was given in.
 */
export function manuscriptsInOrder(
  ids: readonly string[],
  manuscripts: readonly CurrentManuscript[],
): CurrentManuscript[] {
  const byId = new Map(manuscripts.map((m) => [m.id, m]));
  return ids
    .map((id) => byId.get(id))
    .filter((m): m is CurrentManuscript => Boolean(m));
}

/** Resolve every manuscript a Work declares, preserving declaration order. */
export function manuscriptsForWork(
  work: LivingWork,
  manuscripts: readonly CurrentManuscript[],
): CurrentManuscript[] {
  const byId = new Map(manuscripts.map((m) => [m.id, m]));
  return manuscriptIdsOf(work)
    .map((id) => byId.get(id))
    .filter((m): m is CurrentManuscript => Boolean(m));
}

/**
 * Where an ordinary mode-bar entry (Write · Develop · Review, no Work carried)
 * may go without asking.
 *
 *   resume Work known  → its manuscripts: one opens, several are the member's choice
 *   no resume Work     → one manuscript opens; several are the member's choice
 *   nothing            → nowhere
 *
 * ⛔ Never `manuscripts[0]`: that list is ordered by recency, so taking its
 * head is a guess wearing a default's costume. House arrival is governed
 * separately by situatedWork.ts and is not routed through here.
 */
export type ModeEntryTarget =
  | { kind: 'none' }
  | { kind: 'open'; manuscriptId: string }
  | { kind: 'choose'; manuscriptIds: string[] };

export function modeEntryTarget(
  resume: LivingWork | null,
  manuscripts: readonly CurrentManuscript[],
): ModeEntryTarget {
  const pool = resume ? manuscriptsForWork(resume, manuscripts) : [...manuscripts];
  if (pool.length === 0) return { kind: 'none' };
  if (pool.length === 1) return { kind: 'open', manuscriptId: pool[0]!.id };
  return { kind: 'choose', manuscriptIds: pool.map((m) => m.id) };
}

const time = (iso: string | null | undefined): number => {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? 0 : t;
};

/**
 * STUDIO-WRITING-PRESENCE-01 — HOME WRITING EXTENT, ratified 2026-09-08.
 *
 * How much writing Studio Home should treat as presently available: the current
 * representation governs WHILE it holds substantive writing; when it holds none,
 * Source supplies the extent of the writing that still exists.
 *
 * ⛔ NEVER `max(source, draft)` — that would let abandoned Source extent
 * overrule a deliberately shortened current draft.
 * ⛔ NEVER a sum — Source and Draft are one book at two lifecycle layers.
 *
 * Lives HERE, exported, and is used by BOTH the foregrounding sort and the page
 * estimate on the card. Two call sites, one definition: a second copy of this
 * rule would drift, and the whole lane exists because one number was answering
 * a question it did not know.
 *
 * ⛔ Not called `writingCharCount`. It answers a product question about what to
 * foreground and how much to say is there — derived presentation semantics must
 * not masquerade as a property of the manuscript. `charCount` remains SOURCE
 * extent and is unchanged.
 */
export const homeWritingExtent = (
  m: Pick<CurrentManuscript, 'charCount' | 'draftCharCount' | 'hasDraftWriting'>,
): number => (m.hasDraftWriting ? (m.draftCharCount ?? 0) : m.charCount);

export function arrivalFor(works: LivingWork[], manuscripts: CurrentManuscript[]): Arrival {
  const byId = new Map(manuscripts.map((m) => [m.id, m]));
  const claimed = new Set(works.flatMap(manuscriptIdsOf));
  /* STUDIO-WRITING-PRESENCE-01 · S3 — ranked by `homeWritingExtent`. */
  const unclaimed = [...manuscripts]
    .filter((m) => !claimed.has(m.id))
    .sort((a, b) => homeWritingExtent(b) - homeWritingExtent(a));

  /**
   * Writing activity for a work — never the work row's own updatedAt, and
   * never a draft row's timestamp alone.
   *
   * ⚠️ Two ways a draft timestamp lies about authorship, both found in
   * production rather than reasoned about:
   *
   * 1. A working-draft row can exist with `updated_at` set and zero content:
   * `/manuscripts/blank` creates the draft alongside the blank manuscript, and
   * reuses untouched blanks rather than minting duplicates. So a draft
   * timestamp proves a row was touched, not that a person wrote. Requiring
   * BOTH a timestamp and actual characters is what keeps this an act rather
   * than a mutation — the same distinction that disqualified
   * `living_work.updatedAt`, one layer down.
   *
   *    Observed live: a work bound to a 0-char manuscript whose draft row was
   *    stamped hours earlier was promoted to the CONTINUE hero and rendered
   *    "No writing yet · written 6 hours ago" — two clauses contradicting each
   *    other, offering continuation of nothing.
   *
   * 2. A SEEDED IMPORT stamps `updated_at` at creation. 374,697 characters
   *    arrive with created_at == updated_at and are never touched again. The
   *    charCount guard alone cannot see this — the characters are real, they
   *    were simply never written HERE.
   *
   * (2) is now excluded at the API boundary: the timestamp is NULL unless
   * `updated_at > created_at`, so this module receives a member act or nothing.
   * The guard below still requires characters, so both failures are closed.
   */
  const writtenAt = (w: LivingWork): number => {
    const members = manuscriptIdsOf(w)
      .map((id) => byId.get(id))
      .filter((m): m is CurrentManuscript => Boolean(m));

    /*
     * A Work may contain several manuscripts. Eligibility asks whether ANY
     * declared manuscript contains substantive member-authored writing.
     * This determines whether the Work itself is continuable; it does NOT
     * select a manuscript for the member.
     */
    const eligible = members.filter(
      (m) => m.hasWriting && m.hasCurrentMemberContribution,
    );
    if (eligible.length === 0) return 0;

    /*
     * ORDERING ONLY among Works already proven continuable. If several
     * manuscripts belong to this Work, the latest eligible activity orders the
     * Work; no manuscript identity is inferred from that timestamp.
     */
    return Math.max(...eligible.map((m) => time(m.lastMemberDraftActivityAt)));
  };

  const written = works.filter((w) => writtenAt(w) > 0).sort((a, b) => writtenAt(b) - writtenAt(a));
  const unwritten = works
    .filter((w) => writtenAt(w) === 0)
    .sort((a, b) => time(b.updatedAt) - time(a.updatedAt));

  if (written.length > 0) {
    /* Three at most. Beyond that RETURN stops being a doorway and becomes a
       second listing of the shelf — and a room offering everything at once
       offers nothing. The rest are not hidden; they are on the shelf below. */
    const RETURN_WITH = 3;
    return {
      kind: 'continue',
      resume: written[0],
      alsoWritten: written.slice(1, RETURN_WITH),
      shelf: [...written.slice(RETURN_WITH), ...unwritten],
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
      alsoWritten: [],
      shelf: unwritten,
      feature: unclaimed[0] ?? null,
      imported: unclaimed.slice(1),
    };
  }

  return { kind: 'begin', resume: null, alsoWritten: [], shelf: [], feature: null, imported: [] };
}
