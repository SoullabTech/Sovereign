/**
 * ASK-WORK-ANCHOR-01 · B2 — what MAIA receives when the subject is the Work.
 *
 * ⭐⭐ ALMOST NONE OF THIS IS NEW, AND THAT IS THE FINDING. `workSituation.ts`
 * (WS2-03C) is a complete, ratified Work-context substrate — a member-scoped
 * reader, a formatter that admits only the member's own words, and an explicit
 * doctrine of exclusions. It had **zero callers**. This module connects it and
 * adds exactly one read that did not exist.
 *
 * ── ⛔ THE EXCLUSIONS ARE INHERITED, NOT RESTATED ──────────────────────────
 *
 * `formatWorkSituationForPrompt` already refuses, by name:
 *
 *     the manuscript's text      "MAIA is adjacent to the Work, not its reader."
 *     declared materials         "Crossing is the consent event."
 *     counts, progress, activity "Context, never a report on the member."
 *
 * ⭐ This module adds ONE narrow crossing and says exactly why: **the writer is
 * presently at this passage.** ⛔ It is not a licence to read the next section,
 * the whole draft, or any declared material — and the shape below cannot express
 * those even if someone wanted them.
 *
 * ── ⭐⭐ IDENTITY IS THE WORK. THE LOCUS IS CONTEXT. ───────────────────────
 *
 *     WORK IDENTITY          the Work            ← the conversation's identity
 *     CURRENT LOCUS          Chapter 10          ← context, and only context
 *
 * Moving from Chapter 10 to Chapter 9 changes `locus` and NOTHING else. ⛔ The
 * locus is not part of the anchor, is not part of any thread's identity, and
 * must never become either — or section navigation quietly becomes a new
 * relationship every time the writer scrolls.
 *
 * ── ⚠️ CONTINUITY IS TWO FACTS, AND THE SECOND IS AN ABSENCE ──────────────
 *
 * `canonicalFingerprint` digests structure units and memberships;
 * `measureNow` hashes section topology with BODIES EMPTIED. So the movement this
 * system can measure is STRUCTURAL. A writer may add two thousand words while
 * that fingerprint stays identical.
 *
 * ⛔ Therefore `prose` is a REQUIRED field whose only value is `'unmeasured'`.
 * An absent field reads as *nothing to report*; a present one that can say only
 * *unmeasured* cannot be mistaken for a measurement. ⛔ B2 does not widen the
 * measurement — it refuses to let structure stand in for text.
 */

import { query } from '@/lib/db/postgres';
import { splitStoredSection } from '@/lib/manuscript/sections/saveSection';
import {
  resolveSituatedWork, type SituatedWork,
} from '@/lib/writersStudio/workSituation';

/**
 * ⭐ THE ONE READ THAT DID NOT EXIST: the canonical projected body of ONE
 * section of ONE owned Work.
 *
 * ⛔ IT IS NOT `loadEditableSections` NARROWED. That function returns every
 * section of the draft, and the `onlyIds` variant belongs to WS-FOCUS-DRAFT-01
 * on a commit that never reached canonical — transplanting it here would be
 * carrying unrelated work because it happened to be nearby. ⭐ This is the
 * semantic read B2 actually needs, built as itself.
 *
 * ⛔ Member-scoped IN THE SQL, through the draft to the manuscript. A section id
 * is an identifier the browser holds; nothing here takes the browser's word for
 * whose section it is.
 */
export interface ProjectedLocus {
  readonly sectionId: string;
  /** The writer's own heading, or `null`. ⛔ Never a manufactured name. */
  readonly label: string | null;
  /** ⭐ The body as the writer edits it — heading prefix removed. */
  readonly body: string;
}

export async function loadProjectedSectionBody(
  manuscriptId: string, memberId: string, sectionId: string,
): Promise<ProjectedLocus | null> {
  const r = await query<{ id: string; text: string; heading: string | null }>(
    `SELECT s.id, s.text, ms.heading
       FROM manuscript_draft_sections s
       JOIN manuscript_working_drafts d ON d.id = s.draft_id
       LEFT JOIN manuscript_sections ms ON ms.id = s.source_section_id
      WHERE s.id = $1 AND d.manuscript_id = $2 AND d.member_id = $3`,
    [sectionId, manuscriptId, memberId]);
  if (r.rows.length === 0) return null;
  /* ⛔ THE ONE PROJECTION AUTHORITY. A second implementation here would shift
     offsets by the heading prefix, silently, and only for headed sections. */
  const split = splitStoredSection(r.rows[0].text, r.rows[0].heading);
  if (!split) return null;
  return { sectionId: r.rows[0].id, label: r.rows[0].heading, body: split.body };
}

/** ⭐ Structural movement, and the absence beside it. ⛔ Never one without the other. */
export interface Continuity {
  readonly structure: 'moved' | 'unchanged' | 'unmeasured';
  /** ⛔ One value, and it is required. Nothing in this system measures prose. */
  readonly prose: 'unmeasured';
}

export interface WorkContextFacts {
  readonly work: SituatedWork;
  readonly manuscript: { readonly id: string; readonly draftId: string | null;
                         readonly version: number | null };
  /** ⭐ Heads only — id, position, heading. ⛔ Never bodies. */
  readonly sections: readonly { id: string; position: number; heading: string | null }[];
  /** ⛔ `null` when the writer is not at a passage. Absence is a real state. */
  readonly locus: ProjectedLocus | null;
  readonly continuity: Continuity;
}

export type WorkContextRefusal =
  /** ⛔ Not this member's Work, or no Work declared over this manuscript. */
  | 'work_unresolved';

export type WorkContextResult =
  | { readonly ok: true; readonly facts: WorkContextFacts }
  | { readonly ok: false; readonly reason: WorkContextRefusal };

/**
 * ⭐⭐ EVERY FACT IS RE-READ FROM THE MEMBER'S OWN ROWS.
 *
 * The caller supplies a manuscript id, the member, and — at most — the id of the
 * section the writer is at. ⛔ Nothing the browser says about a Work, a title, a
 * purpose or a body is carried: *"a hand-edited URL would write arbitrary prose
 * straight into MAIA's prompt — a prompt-injection channel opened by a feature
 * whose whole purpose is honest context."*
 *
 * ⛔ AND THERE IS NO TRANSCRIPT PARAMETER. The room's present conversation sends
 * its own history back up as context; this shape cannot carry one, because a
 * Work-anchored conversation's history is `ask_turns` and nothing else.
 *
 * ⭐ FAILS CLOSED AND QUIET, like the reader it wraps: an unresolvable Work is
 * not an error to alarm the member with, it is MAIA declining to claim a context
 * she cannot verify.
 */
export async function buildWorkContext(input: {
  readonly manuscriptId: string;
  readonly memberId: string;
  /** ⛔ An identifier, never a fact. The body is read from the row. */
  readonly sectionId?: string | null;
  readonly continuity: Continuity;
}): Promise<WorkContextResult> {
  const { manuscriptId, memberId, sectionId, continuity } = input;

  /* ⭐ The Work the member DECLARED over this manuscript — their own act, in
     `living_work_expressions`. ⛔ Not inferred, and not the manuscript row
     wearing a Work's clothes. */
  const decl = await query<{ living_work_id: string }>(
    `SELECT e.living_work_id
       FROM living_work_expressions e
       JOIN member_manuscripts m ON m.id = e.expression_id
      WHERE e.expression_type = 'manuscript'
        AND e.expression_id = $1
        AND m.member_id = $2
      LIMIT 1`,
    [manuscriptId, memberId]);
  if (decl.rows.length === 0) return { ok: false, reason: 'work_unresolved' };

  /* ⭐ THE RATIFIED READER, unchanged. Member-scoped in its own WHERE. */
  const work = await resolveSituatedWork(memberId, decl.rows[0].living_work_id);
  if (!work) return { ok: false, reason: 'work_unresolved' };

  const draft = await query<{ id: string; version: string }>(
    `SELECT id, version FROM manuscript_working_drafts
      WHERE manuscript_id = $1 AND member_id = $2`, [manuscriptId, memberId]);

  /* ⭐ Already a lawful Work-level context, and already given to MAIA by the
     structure lane. ⛔ Reused, not re-derived. */
  const { loadSectionHeads } = await import('./frozenReading');
  const sections = await loadSectionHeads(manuscriptId, memberId);

  const locus = sectionId
    ? await loadProjectedSectionBody(manuscriptId, memberId, sectionId)
    : null;

  return {
    ok: true,
    facts: {
      work,
      manuscript: {
        id: manuscriptId,
        draftId: draft.rows[0]?.id ?? null,
        version: draft.rows[0] ? Number(draft.rows[0].version) : null,
      },
      sections,
      locus,
      continuity,
    },
  };
}
