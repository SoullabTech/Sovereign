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

import { query } from '@/lib/db/postgres';
import { splitStoredSection } from '@/lib/manuscript/sections/saveSection';
import { evaluateExecutionFit, type ExecutionFit } from './executionFit';
import { AUTH_COLUMNS, hydrateAuthorizationRow } from './store';
import type { RevisionAuthorization } from './contract';

export type AuthorizationStatus =
  /** ⭐ Unspent, and the Work still fits. The ONE state in which execution may be offered. */
  | { readonly state: 'executable'; readonly authorization: RevisionAuthorization }
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
  const a = await query(
    `SELECT ${AUTH_COLUMNS} FROM manuscript_revision_authorizations
      WHERE id = $1 AND member_id = $2`, [authorizationId, memberId]);
  if (a.rows.length === 0) return null;
  const authorization = hydrateAuthorizationRow(a.rows[0] as never);

  /* ⭐ Spent is answered from the record alone — no Work read is needed, and
     performing one would let manuscript state colour a settled fact. */
  if (authorization.acceptedAt !== null) {
    return { state: 'spent', authorization,
      resultingVersion: authorization.resultingVersion };
  }

  const g = authorization.guard;
  const d = await query<{ version: string }>(
    `SELECT version FROM manuscript_working_drafts
      WHERE id = $1 AND manuscript_id = $2 AND member_id = $3`,
    [g.draftId, g.workId, memberId]);
  if (d.rows.length === 0) return { state: 'work_unreadable', authorization };

  const s = await query<{ text: string; heading: string | null }>(
    `SELECT s.text, ms.heading
       FROM manuscript_draft_sections s
       LEFT JOIN manuscript_sections ms ON ms.id = s.source_section_id
      WHERE s.id = $1 AND s.draft_id = $2`, [g.targetSectionId, g.draftId]);
  if (s.rows.length === 0) return { state: 'work_unreadable', authorization };
  const split = splitStoredSection(s.rows[0].text, s.rows[0].heading);
  if (!split) return { state: 'work_unreadable', authorization };

  /* ⭐⭐ THE SAME LAW THE EXECUTION SEAM CONSUMES. */
  const fit = evaluateExecutionFit(g, {
    workId: g.workId, draftId: g.draftId, version: Number(d.rows[0].version),
    sectionId: g.targetSectionId, textAtTarget: split.body,
  });
  return fit.fits
    ? { state: 'executable', authorization }
    : { state: 'no_longer_fits', authorization, reason: fit.reason };
}
