/**
 * WS2-04B-0 — legacy scaffold normalisation.
 *
 * A DISTINCT TRANSFORM, never part of conversion. Conversion promises the
 * member's bytes are unchanged; this changes 346 of them. The two cannot share
 * a transaction without one of them lying.
 *
 * WHY IT MAY RUN WITHOUT ASKING. Founder ruling, 2026-08-30, on the evidence
 * the real-manuscript witness produced:
 *
 *   The platform may remove a byte without asking only when it can prove that
 *   byte was introduced by the platform itself, prove the exact intended
 *   replacement from repository history, and preserve the prior state.
 *   Otherwise the writer decides.
 *
 * For this class that proof exists and is not an inference. The draft is
 * byte-identical to assembleManuscriptMarkdown's output over its own Source;
 * body differences are zero; every headed section begins with exactly
 * `# ` + that section's Source heading. Soullab put those characters there,
 * and 5f50f6790 (2026-08-05) records the exact intended replacement. This is a
 * correction of system-authored representation, not an edit of member
 * authorship.
 *
 * THE INVERSE PROOF is what makes that claim checkable rather than asserted.
 * Verifying the output looks like the current composer's would only show the
 * result is plausible. Re-adding the scaffold and getting the original back,
 * byte for byte, shows the transform changed NOTHING ELSE:
 *
 *     addHistoricalScaffold(normalised) === the exact pre-normalisation draft
 *
 * If one heading fails the exact historical form, normalisation does not run.
 * That draft leaves this class and requires explicit treatment.
 */

import { composeCurrent, composeLegacyHashHeadings } from './composers';
import { classifyDraft } from './draftProof';

/** The `# ` the historical assembler wrote. Two characters, and only these. */
const HISTORICAL_PREFIX = '# ';

export type NormalizationRefusal =
  | 'draft_not_found'
  | 'not_section_addressable'
  | 'not_legacy_composer_variant'
  | 'heading_not_in_historical_form'
  | 'result_not_current_composer_output'
  | 'inverse_proof_failed'
  | 'already_normalized';

export interface NormalizationPlan {
  ok: true;
  /** New text for each section, in document order. */
  slices: string[];
  /** The whole normalised draft. */
  content: string;
  /** How many `# ` prefixes are removed. */
  headingsNormalized: number;
  /** Characters removed — always 2 per heading, stated rather than assumed. */
  charsRemoved: number;
}
export type NormalizationRefused = { ok: false; refusal: NormalizationRefusal; detail?: string };
export type NormalizationOutcome = NormalizationPlan | NormalizationRefused;

/**
 * Re-add the historical scaffold to normalised slices. The inverse of the
 * strip, and used only to prove the strip. Kept beside it so the two can never
 * drift into being inverses in name only.
 */
export function addHistoricalScaffold(
  slices: readonly string[],
  headings: readonly (string | null)[],
): string {
  return slices
    .map((text, i) => (headings[i]?.trim() ? HISTORICAL_PREFIX + text : text))
    .join('');
}

/**
 * Decide the normalisation. PURE. Refuses unless every condition of the
 * authorised class holds — and the conditions are checked against the draft's
 * own bytes, not against a classification someone recorded earlier.
 */
export function planNormalization(
  sections: readonly { heading: string | null; body: string }[],
  sectionTexts: readonly string[],
): NormalizationOutcome {
  const original = sectionTexts.join('');

  if (composeCurrent(sections) === original) {
    return { ok: false, refusal: 'already_normalized' };
  }

  /* Re-establish the class from the bytes in front of us. */
  const verdict = classifyDraft(sections, original);
  if (verdict.classification !== 'LEGACY_COMPOSER_VARIANT') {
    return {
      ok: false,
      refusal: 'not_legacy_composer_variant',
      detail: verdict.classification,
    };
  }
  if (sectionTexts.length !== sections.length) {
    return {
      ok: false,
      refusal: 'not_section_addressable',
      detail: `${sectionTexts.length} slices for ${sections.length} sections`,
    };
  }

  /* Strip, section by section, and only where the exact historical form is
     present. A heading that does not begin `# ` + its own Source heading is
     not something this transform is authorised to touch. */
  const headings = sections.map((s) => s.heading);
  const slices: string[] = [];
  let headingsNormalized = 0;

  for (const [i, text] of sectionTexts.entries()) {
    const h = sections[i].heading?.trim();
    if (!h) { slices.push(text); continue; }

    const expected = HISTORICAL_PREFIX + h;
    const followsCleanly =
      text.startsWith(expected) &&
      (text.length === expected.length || text[expected.length] === '\n');
    if (!followsCleanly) {
      return {
        ok: false,
        refusal: 'heading_not_in_historical_form',
        detail: `section ${i}`,
      };
    }
    slices.push(text.slice(HISTORICAL_PREFIX.length));
    headingsNormalized++;
  }

  const content = slices.join('');

  /* The result must BE the current composer's output, not merely resemble it. */
  if (content !== composeCurrent(sections)) {
    return { ok: false, refusal: 'result_not_current_composer_output' };
  }

  /* THE INVERSE PROOF. Putting the scaffold back must reproduce the exact
     draft we started from. Anything else this transform touched — a stray
     character, a normalised newline, a trimmed heading — shows up here and
     nowhere else. */
  if (addHistoricalScaffold(slices, headings) !== original) {
    return { ok: false, refusal: 'inverse_proof_failed' };
  }

  return {
    ok: true,
    slices,
    content,
    headingsNormalized,
    charsRemoved: original.length - content.length,
  };
}

/** What the writer is told afterwards. Stated once, here, so the copy and the
    authority that permits it live together. */
export const NORMALIZATION_NOTICE = {
  title: 'Older formatting was cleaned up.',
  body:
    "Writer's Studio removed heading markers added by an earlier version. " +
    'Your words were unchanged.',
} as const;

/** Sanity: the prefix is exactly what the legacy composer emits. */
export function historicalPrefixMatchesComposer(): boolean {
  const probe = [{ heading: 'H', body: 'B' }];
  return composeLegacyHashHeadings(probe).startsWith(HISTORICAL_PREFIX + 'H');
}

/* ────────────────────────────────────────────────────────────────────────
   The transactional half. Everything above is pure; this locks, proves
   against the locked bytes, preserves the prior state, writes both
   representations together, and lets the deferred DB invariant have the
   last word at COMMIT.
   ──────────────────────────────────────────────────────────────────────── */

import { transaction, type TransactionClient } from '@/lib/db/postgres';

export interface NormalizationResult {
  status: 'normalized' | 'refused';
  refusal?: NormalizationRefusal;
  detail?: string;
  headingsNormalized?: number;
  charsRemoved?: number;
}

export async function normalizeLegacyScaffoldForDraft(
  manuscriptId: string,
  memberId: string,
): Promise<NormalizationResult> {
  return transaction(async (tx: TransactionClient) => {
    const draftRes = await tx.query<{
      id: string; content: string; section_addressable_at: Date | null;
    }>(
      `SELECT id, content, section_addressable_at
         FROM manuscript_working_drafts
        WHERE manuscript_id = $1 AND member_id = $2
        FOR UPDATE`,
      [manuscriptId, memberId],
    );
    if (draftRes.rows.length === 0) return { status: 'refused', refusal: 'draft_not_found' as const };
    const draft = draftRes.rows[0];

    /* Normalisation follows conversion; it never precedes it. Sections are
       where the per-heading proof happens. */
    if (draft.section_addressable_at === null) {
      return { status: 'refused', refusal: 'not_section_addressable' as const };
    }

    const sections = await tx.query<{ heading: string | null; body: string }>(
      `SELECT heading, body FROM manuscript_sections
        WHERE manuscript_id = $1 ORDER BY position ASC`, [manuscriptId]);
    const slices = await tx.query<{ id: string; text: string }>(
      `SELECT id, text FROM manuscript_draft_sections
        WHERE draft_id = $1 ORDER BY position ASC`, [draft.id]);

    const plan = planNormalization(sections.rows, slices.rows.map((r) => r.text));
    if (!plan.ok) return { status: 'refused', refusal: plan.refusal, detail: plan.detail };

    /* Preserve the exact scaffolded draft through the member's own revision
       history, before a byte of it changes. */
    await tx.query(
      `INSERT INTO working_draft_revisions (draft_id, revision_number, content, saved_by, note)
       SELECT $1, COALESCE(MAX(revision_number), 0) + 1, $2, $3, $4
         FROM working_draft_revisions WHERE draft_id = $1`,
      [draft.id, draft.content, memberId, 'before legacy scaffold normalisation'],
    );

    /* Both representations move together. The deferred constraint triggers
       re-check their agreement at COMMIT, independently of anything asserted
       here. */
    for (const [i, row] of slices.rows.entries()) {
      if (row.text === plan.slices[i]) continue;
      await tx.query(
        `UPDATE manuscript_draft_sections SET text = $2, updated_at = now() WHERE id = $1`,
        [row.id, plan.slices[i]],
      );
    }
    await tx.query(
      `UPDATE manuscript_working_drafts
          SET content = $2, version = version + 1, revision_count = revision_count + 1,
              updated_at = now()
        WHERE id = $1`,
      [draft.id, plan.content],
    );

    return {
      status: 'normalized',
      headingsNormalized: plan.headingsNormalized,
      charsRemoved: plan.charsRemoved,
    };
  });
}
