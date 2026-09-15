/**
 * AUTHORIZATION EXECUTION STATUS — can this permission execute right now?
 *
 * ⭐⭐ ITS SUBJECT IS `RevisionAuthorization` + a current Work reading, and it
 * answers ONLY that. ⛔ It says nothing about whether the writer and MAIA may
 * keep discussing the proposal — that is `readProposalWork`, with a different
 * subject, and neither is defined in terms of the other.
 *
 * ⭐ CS-3's successor lives here: this consumes `evaluateExecutionFit`, THE SAME
 * law `executeAuthorization` consumes, so a surface cannot claim executable
 * where execution would refuse.
 *
 * ⛔ NO AUTHORITY VOCABULARY. There is no `inspection_only`, no
 * `executionAuthority`, no `mayAccept`, and no `authorizationEnabled: false`
 * under a new spelling. The absence of a row IS the unauthorized state, and an
 * absent row is reported by this module as `null`, not as a status.
 */

import { transaction, type TransactionClient } from '@/lib/db/postgres';
import { splitStoredSection } from '@/lib/manuscript/sections/sectionProjection';
import { occurrences } from '@/lib/manuscript/exactText';
import type { SpacedRange } from '@/lib/manuscript/sections/coordinateSpace';
import { evaluateExecutionFit, type ExecutionFit } from './executionFit';
import { AUTH_COLUMNS, hydrateAuthorizationRow } from './store';
import type { RevisionAuthorization } from './contract';

/**
 * ⭐⭐ F1-4 · WHAT THE CONSENT CHANNEL MAY CARRY: A PLACE, NEVER THE WORK.
 *
 * ⚠️ FOUNDER REVIEW, 2026-09-14. The first cut satisfied *no prose* and lost
 * *names a place* — it returned a state and three ids. The obligation is both:
 * **coordinates and a label, not one manuscript character.**
 *
 * ⛔ AND THE RANGE IS SERVER-DERIVED. The browser must not search the Work to
 * manufacture it; that would make the surface a second authority on where the
 * change is. ⛔ `space` is required and has no default — FOCUS-W3 cost this
 * programme two days because offsets travelled without saying what text they
 * addressed.
 */
export interface ChangeLocator {
  /** The writer's own name for the place. ⛔ Not its contents. */
  readonly sectionLabel: string;
  readonly sectionId: string;
  /** ⛔ `projected_section_body` CODE POINTS — the body as the writer edits it. */
  readonly range: SpacedRange;
  readonly operation: 'replace_exact_text';
  /** ⛔ Always 1: an authorization permits one exact change. */
  readonly changeCount: 1;
}

/**
 * ⭐ Where the change is, in the projected body, in CODE POINTS.
 *
 * ⛔ Code points, not UTF-16 units: `indexOf` returns a unit offset, and a
 * single emoji or surrogate pair ahead of the target would shift every number
 * the surface marks with.
 */
function locate(
  body: string, expected: string, sectionId: string, sectionLabel: string,
): ChangeLocator | null {
  if (occurrences(body, expected) !== 1) return null;
  const unitIndex = body.indexOf(expected);
  const start = [...body.slice(0, unitIndex)].length;
  const end = start + [...expected].length;
  return {
    sectionLabel, sectionId,
    range: { space: 'projected_section_body', start, end },
    operation: 'replace_exact_text', changeCount: 1,
  };
}

export type AuthorizationStatus =
  /**
   * ⭐ Unspent, and the Work still fits. The ONE state in which execution may be
   * offered.
   *
   * ⚠️ AND THE CLAIM IS NARROW, deliberately: **executable against the coherent
   * Work state THIS READ OBSERVED.** ⛔ Execution remains the final authority
   * and may refuse later if the Work moves after this response. No HTTP preview
   * can promise otherwise; what CS-3's successor promises is that preview and
   * execution consume the same law, and that preview never evaluates a collage.
   */
  | { readonly state: 'executable'; readonly authorization: RevisionAuthorization;
      readonly locator: ChangeLocator }
  /** ⭐ Spent. The permission did its one job. */
  | { readonly state: 'spent'; readonly authorization: RevisionAuthorization;
      readonly resultingVersion: number }
  /** Unspent, but the Work no longer fits. ⛔ NOT a statement about the proposal. */
  | { readonly state: 'no_longer_fits'; readonly authorization: RevisionAuthorization;
      readonly reason: Extract<ExecutionFit, { fits: false }>['reason'] }
  /** ⛔ The Work could not be read at all. Never reported as "does not fit". */
  | { readonly state: 'work_unreadable'; readonly authorization: RevisionAuthorization };

/**
 * ⛔ `null` for unknown AND for another member's — indistinguishable, so a
 * caller cannot enumerate other members' authorizations by refusal shape.
 */
export async function readAuthorizationStatus(
  memberId: string, authorizationId: string,
): Promise<AuthorizationStatus | null> {
  /* ⛔⛔ ONE COHERENT READ, IN THE EXECUTION SEAM'S LOCK ORDER.
     ⚠️ FOUNDER REVIEW, 2026-09-14. The first cut issued separate pool reads —
     authorization, then draft version, then section text — so a writer
     committing between the last two produced

         evaluateExecutionFit({ version: 41, textAtTarget: <state from 42> })

     a Work state that never existed. ⭐ That a status read is ADVISORY rather
     than authoritative does not license it to describe a state that never was,
     and it matters more now: a surface will offer the execution gesture on
     `executable`.

     ⭐ `FOR SHARE`, not `FOR UPDATE`: this blocks the writer paths without a
     read model pretending it is mutating. */
  return transaction(async (tx: TransactionClient) => {
    const a = await tx.query(
      `SELECT ${AUTH_COLUMNS} FROM manuscript_revision_authorizations
        WHERE id = $1 AND member_id = $2 FOR SHARE`, [authorizationId, memberId]);
    if (a.rows.length === 0) return null;
    const authorization = hydrateAuthorizationRow(a.rows[0] as never);

    /* ⭐ Spent is answered from the record alone — no Work read is needed, and
       performing one would let manuscript state colour a settled fact. */
    if (authorization.acceptedAt !== null) {
      return { state: 'spent' as const, authorization,
        resultingVersion: authorization.resultingVersion };
    }

    const g = authorization.guard;
    const d = await tx.query<{ version: string }>(
      `SELECT version FROM manuscript_working_drafts
        WHERE id = $1 AND manuscript_id = $2 AND member_id = $3 FOR SHARE`,
      [g.draftId, g.workId, memberId]);
    if (d.rows.length === 0) return { state: 'work_unreadable' as const, authorization };

    const s = await tx.query<{ id: string; text: string; heading: string | null }>(
      `SELECT s.id, s.text, ms.heading
         FROM manuscript_draft_sections s
         LEFT JOIN manuscript_sections ms ON ms.id = s.source_section_id
        WHERE s.id = $1 AND s.draft_id = $2`, [g.targetSectionId, g.draftId]);
    if (s.rows.length === 0) return { state: 'work_unreadable' as const, authorization };
    const split = splitStoredSection(s.rows[0].text, s.rows[0].heading);
    if (!split) return { state: 'work_unreadable' as const, authorization };

    /* ⭐⭐ THE SAME LAW THE EXECUTION SEAM CONSUMES. */
    const fit = evaluateExecutionFit(g, {
      workId: g.workId, draftId: g.draftId, version: Number(d.rows[0].version),
      sectionId: g.targetSectionId, textAtTarget: split.body,
    });
    if (!fit.fits) {
      return { state: 'no_longer_fits' as const, authorization, reason: fit.reason };
    }

    /* ⭐ The locator is derived HERE, from the same body the fit was judged on. */
    const locator = locate(
      split.body, g.expectedText, g.targetSectionId,
      s.rows[0].heading ?? `Section ${g.targetSectionId.slice(0, 8)}`);
    if (!locator) return { state: 'work_unreadable' as const, authorization };
    return { state: 'executable' as const, authorization, locator };
  });
}
