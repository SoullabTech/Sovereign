/**
 * THE CURRENT WORK, AS THE WRITER IS SEEING IT — one snapshot, one version.
 *
 * ⭐⭐ FOUNDER RULING 2026-09-12, after the Act 3 witness failure:
 *
 *   FOCUS reads the current, section-addressable WORKING DRAFT at one explicit
 *   draft version. `manuscript_sections` — the Source — is NOT the Focus body
 *   authority.
 *
 * ── WHAT WENT WRONG, and why a table-name swap would have been the wrong fix ──
 *
 * The crossing read `manuscript_sections.body` while the Focus Set carried
 * `manuscript_draft_sections.id`. Proved on the witness database: `in_source 0,
 * in_draft 2`. The canvasIdentity class — *a link is not a binding* — and every
 * test passed because both halves were injected.
 *
 * ⛔ But `manuscript_draft_sections.text` is the STORED representation, which
 * begins with the heading prefix. Swapping the table name and reading `text`
 * would have shifted every passage offset by the length of the heading —
 * silently, and only for sections that have one. So this does not read the
 * column: it calls `loadEditableSections`, which is the same function
 * `resolveDraftWriteState` uses to serve the writing surface, and therefore the
 * same `splitStoredSection` projection.
 *
 *   MAIA reads exactly the same current section body the writer is seeing.
 *   One source of truth for Canvas and Focus.
 *
 * ── ⭐⭐ ONE ACT, ONE VERSION ───────────────────────────────────────────────
 *
 *   act begins → resolve draft D at version V → read ALL authorized members
 *     from D@V → one canonical MAIA turn → record that the turn read D/V
 *
 * ⛔ NOT "whatever happened to be latest for each query". This is ONE call, so
 * a mixed-version Focus read is not refused — it is UNREPRESENTABLE. Every body
 * in an act comes from the same row read, which is what makes the later
 * RevisionProposal rule possible at all: *a proposal built against version 37
 * may not be silently applied to version 38.*
 *
 * Mutability was never the problem. Unbound mutation was.
 *
 * ── ⛔ WHAT THIS READS ─────────────────────────────────────────────────────
 *
 * Only the ids a disclosure boundary authorized. The withheld members' bodies
 * are never loaded — not filtered out afterwards, never selected. Ownership is
 * proven by the draft's own `(manuscript_id, member_id)`, inside the read, not
 * by a separate check a later edit could drop.
 */

import { codePointBoundaries } from '@/lib/manuscript/draftSections';
import { loadEditableSections, type EditableSection } from '@/lib/manuscript/sections/saveSection';
import { memberRef } from '@/lib/privacy/memberRef';

/**
 * Why a member could not be given to MAIA.
 *
 * ⭐ TYPED, because the Act 3 witness was diagnosed by hand-querying receipts.
 * `assembleFocus` returned `null` on an EMPTY RESULT SET and logged only thrown
 * exceptions, so nothing anywhere named the cause. Six distinct failures wore
 * one sentence.
 *
 *   An empty lookup is not a database error.
 *   A body unavailable is not a boundary refused.
 *
 * ⛔ These never reach the member. The surface stays calm and simple; the HOST
 * must be able to tell them apart.
 */
export type DraftReadFailure =
  /** No working draft for this Work and member. */
  | 'no_draft'
  /** The draft exists but is not section-addressable — no section bodies exist. */
  | 'draft_not_section_addressable'
  /** The draft was read; this section id is not in it. */
  | 'section_not_found'
  /** The section is present but this cut cannot project its body. */
  | 'section_not_projectable'
  /** The passage range does not fit the current body. */
  | 'range_out_of_bounds'
  /** The read itself threw. ⛔ Distinct from every case above. */
  | 'read_failed';

export interface DraftSnapshot {
  readonly draftId: string;
  readonly version: number;
  readonly sections: ReadonlyMap<string, EditableSection>;
}

export type DraftReadOutcome =
  | { ok: true; snapshot: DraftSnapshot }
  | { ok: false; failure: DraftReadFailure };

export interface CurrentDraftReader {
  (ref: {
    memberId: string;
    workRef: string;
    /** The authorized section ids, and only those. */
    sectionRefs: readonly string[];
  }): Promise<DraftReadOutcome>;
}

export const readCurrentDraft: CurrentDraftReader = async ({ memberId, workRef, sectionRefs }) => {
  try {
    const loaded = await loadEditableSections(workRef, memberId, sectionRefs);
    if (!loaded) {
      /* ⛔ `loadEditableSections` answers null for BOTH "no draft" and "not
         section-addressable", and the difference matters to whoever is
         debugging: one means the writer has not begun, the other means the
         draft has not been converted. Re-established here rather than guessed. */
      const { query } = await import('@/lib/db/postgres');
      const d = await query<{ section_addressable_at: Date | null }>(
        `SELECT section_addressable_at FROM manuscript_working_drafts
          WHERE manuscript_id = $1 AND member_id = $2`, [workRef, memberId]);
      return {
        ok: false,
        failure: d.rows.length === 0 ? 'no_draft' : 'draft_not_section_addressable',
      };
    }
    return {
      ok: true,
      snapshot: {
        draftId: loaded.draftId,
        version: loaded.version,
        sections: new Map(loaded.sections.map((s) => [s.id, s])),
      },
    };
  } catch (err) {
    /* ⭐ A thrown read and an empty one stay distinguishable — N10. */
    console.error('[FOCUS] current-draft read failed', {
      memberRef: memberRef(memberId),
      error: err instanceof Error ? err.message : 'unknown',
    });
    return { ok: false, failure: 'read_failed' };
  }
};

export type MemberBody =
  | { ok: true; body: string }
  | { ok: false; failure: DraftReadFailure };

/**
 * One member's body, out of the one snapshot.
 *
 * ⭐ The range is in Unicode CODE POINTS, relative to the section as read
 * (evidenceRef.ts). It is resolved through `codePointBoundaries` — never handed
 * to `String.slice`, which indexes UTF-16 code units and would return a lone
 * surrogate on the first emoji.
 *
 * ⛔ AN OUT-OF-BOUNDS RANGE IS A REFUSAL, NEVER A CLAMP. Clamping would hand
 * MAIA a passage the writer never framed, and would do it most confidently
 * where the text had changed most.
 */
export function bodyOfMember(
  snapshot: DraftSnapshot,
  sectionRef: string,
  range?: { start: number; end: number },
): MemberBody {
  const section = snapshot.sections.get(sectionRef);
  if (!section) return { ok: false, failure: 'section_not_found' };
  /* ⛔ A section this cut cannot split is returned WHOLE and read-only by the
     writing surface. Offering it as Focus content would mean MAIA reading the
     heading prefix as prose, and a passage range measured against the wrong
     string. The writer sees it; MAIA does not get it as a body. */
  if (!section.editable) return { ok: false, failure: 'section_not_projectable' };

  if (!range) {
    return section.body.length > 0
      ? { ok: true, body: section.body }
      : { ok: false, failure: 'range_out_of_bounds' };
  }

  const bounds = codePointBoundaries(section.body);
  // `bounds` has one entry per code point plus a final index === body.length.
  if (range.start < 0 || range.end <= range.start || range.end > bounds.length - 1) {
    return { ok: false, failure: 'range_out_of_bounds' };
  }
  const text = section.body.slice(bounds[range.start], bounds[range.end]);
  return text.length > 0 ? { ok: true, body: text } : { ok: false, failure: 'range_out_of_bounds' };
}
