/**
 * Work-wide "MAIA asks, never rewrites" (founder authorization 2026-11-13, ledger #1938).
 *
 * Answers one question for an editorial turn: has the writer paused MAIA's revisions
 * on ANY of their Works that holds this manuscript (or this chain's recorded origin)?
 *
 * ⭐ Member-declared only (living_works.maia_revisions_paused, written solely by the
 *   member's PATCH). Never inferred from the Work's free-text form.
 * ⭐ A manuscript may belong to more than one Work (living_work_expressions is not
 *   unique on the expression). If any of the writer's Works holding it is paused,
 *   the writer's stated limit wins.
 * ⛔ Member-scoped in every predicate: another member's Work can never affect this.
 */
import { query } from '@/lib/db/postgres';

export const WORK_REVISION_PAUSE_SQL = `SELECT EXISTS (
    SELECT 1
      FROM living_work_expressions e
      JOIN living_works lw ON lw.id = e.living_work_id
     WHERE e.expression_type = 'manuscript'
       AND e.expression_id = $3
       AND lw.member_id = $2
       AND lw.maia_revisions_paused
  ) OR EXISTS (
    SELECT 1
      FROM writer_editorial_chain_origins o
      JOIN living_works lw ON lw.id = o.living_work_id AND lw.member_id = o.member_id
     WHERE o.proposal_chain_id = $1
       AND o.member_id = $2
       AND lw.maia_revisions_paused
  ) AS paused`;

export async function workPausesRevisions(
  memberId: string, chainId: string, manuscriptId: string,
): Promise<boolean> {
  try {
    const r = await query<{ paused: boolean }>(WORK_REVISION_PAUSE_SQL, [chainId, memberId, manuscriptId]);
    return r.rows[0]?.paused === true;
  } catch (error) {
    /* ⛔ Fail closed: if the writer's setting cannot be read, MAIA may still talk
       but may not propose wording. Never assume a pause was lifted. */
    console.error('[editorial] work revision pause unreadable; holding reply_only', error);
    return true;
  }
}
