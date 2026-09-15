/**
 * STEP 2 · THE EXECUTION SEAM — consuming a permission that already exists.
 *
 * ⭐⭐ THIS SEAM AUTHORIZES NOTHING. It takes an authorization id and spends it.
 * The member's act happened earlier, in `authorizeVersion()`; by the time
 * control reaches here the permission is a durable row and the only remaining
 * questions are whether the Work still fits it and whether it is still unspent.
 *
 * ⛔ THERE IS NO `execution_authority` QUESTION ANYWHERE IN THIS FILE, and no
 * step that asks "was this ever allowed to cross?". A row's EXISTENCE answers
 * it — that is what retired `mayCrossIntoTheWork()`.
 *
 * ── ⭐⭐ THE ORDER IS THE LAW ──────────────────────────────────────────────
 *
 *   1  lock the authorization   `id` + `member_id` · ⛔ BEFORE reading the Work
 *   2  refuse an already-spent permission
 *   3  read the EXACT version the authorization names · ⛔ never head
 *   4  lock the draft at `guard.baseVersion`
 *   5  read + project the exact target section, inside that lock
 *   6  the expected text occurs EXACTLY ONCE
 *   7  replace it with the VERSION's wording
 *   8  the EXISTING mutation, on THIS SAME CLIENT
 *   9  `accepted_at` + `resulting_version`, together, LAST
 *
 * ⚠️ STEP 1 IS BEFORE THE WORK READ ON PURPOSE (obligation A2). A refusal about
 * authority that depended on manuscript state would leak facts about the
 * manuscript, and would go quiet the moment the Work happened to line up.
 *
 * ── ⭐⭐ EW-12 IS THE ACCEPTANCE BAR ───────────────────────────────────────
 *
 *     If step 8 fails for ANY reason, the manuscript mutation AND step 9 both
 *     roll back, and the authorization remains UNSPENT.
 *
 * ⛔ SO NO BLANKET `catch` TURNS AN INFRASTRUCTURE EXCEPTION INTO A DOMAIN
 * REFUSAL merely to make the API tidy. The retired store did exactly that
 * (`catch { return refuse('write_failed') }`) and it is the shape of the open
 * S3 `unreachable` finding: a real failure surfacing as one word with no cause.
 * Here an infrastructure failure PROPAGATES, and the transaction's rollback is
 * what keeps the permission unspent.
 */

import { transaction, type TransactionClient } from '@/lib/db/postgres';
import { saveSectionInTransaction, splitStoredSection } from '@/lib/manuscript/sections/saveSection';
import { applyExactlyOnce } from '@/lib/manuscript/exactText';
import { evaluateExecutionFit } from './executionFit';
import { AUTH_COLUMNS, hydrateAuthorizationRow } from './store';
import type { RevisionAuthorization } from './contract';

export type ExecutionRefusal =
  /** ⛔ Unknown, or another member's. Deliberately indistinguishable. */
  | 'authorization_unknown'
  /** ⭐ A permission is single-use. */
  | 'already_spent'
  /** The version the authorization names is gone. ⚠️ Should be impossible: the
   *  composite FK and the append-only trigger both forbid it. Named anyway,
   *  because a state that "cannot happen" still needs a truthful refusal. */
  | 'version_unreadable'
  /** The Work moved past the state this permission was bound to. */
  | 'stale_base'
  | 'draft_not_found'
  | 'section_not_found'
  | 'section_not_projectable'
  /** ⭐ The characters are gone. The version alone never authorizes the write. */
  | 'expected_text_absent'
  /** ⭐⭐ More than once — the change names nothing exact. */
  | 'expected_text_ambiguous'
  /** The section writer refused. ⛔ NOT a catch-all for infrastructure. */
  | 'write_refused';

export type ExecutionOutcome =
  | { readonly outcome: 'executed'; readonly authorization: RevisionAuthorization }
  | { readonly outcome: 'refused'; readonly reason: ExecutionRefusal };

const no = (reason: ExecutionRefusal): ExecutionOutcome =>
  ({ outcome: 'refused', reason });

/**
 * Execute one authorization.
 *
 * ⛔ The caller supplies an id and nothing else. No wording, no target, no
 * version, no expected text — every fact comes from the durable row, which is
 * obligation A3: *authority is read from the record, never asserted by the
 * caller.*
 */
export async function executeAuthorization(
  memberId: string, authorizationId: string,
): Promise<ExecutionOutcome> {
  return transaction(async (tx: TransactionClient) => {
    /* 1 · ⭐ LOCK, BEFORE ANY MANUSCRIPT READ. */
    const a = await tx.query(
      `SELECT ${AUTH_COLUMNS} FROM manuscript_revision_authorizations
        WHERE id = $1 AND member_id = $2 FOR UPDATE`,
      [authorizationId, memberId]);
    if (a.rows.length === 0) return no('authorization_unknown');
    const auth = hydrateAuthorizationRow(a.rows[0] as never);

    /* 2 · ⭐ One change, once. */
    if (auth.acceptedAt !== null) return no('already_spent');

    /* 3 · ⛔⛔ THE EXACT VERSION THE AUTHORIZATION NAMES — the wording comes
           from the immutable formulation its author wrote, and from nowhere
           else. There is NO `ORDER BY`, NO `LIMIT 1` and NO head lookup here.
           ⚠️ This is the one place where "what should the Work become?" is
           answered, and the answer is a row the member selected by id. */
    const v = await tx.query<{ formulation: string }>(
      `SELECT formulation FROM proposal_versions WHERE id = $1 AND chain_id = $2`,
      [auth.proposalVersionId, auth.proposalChainId]);
    if (v.rows.length === 0) return no('version_unreadable');
    const replacement = v.rows[0].formulation;

    /* 4 · The draft, locked, still at the state the permission is bound to. */
    const d = await tx.query<{ id: string; version: string }>(
      `SELECT id, version FROM manuscript_working_drafts
        WHERE id = $1 AND manuscript_id = $2 AND member_id = $3 FOR UPDATE`,
      [auth.guard.draftId, auth.guard.workId, memberId]);
    if (d.rows.length === 0) return no('draft_not_found');

    /* 5 · The target, read inside the lock, through the SAME projection the
           writing surface uses. */
    const s = await tx.query<{ id: string; text: string; heading: string | null }>(
      `SELECT s.id, s.text, ms.heading
         FROM manuscript_draft_sections s
         LEFT JOIN manuscript_sections ms ON ms.id = s.source_section_id
        WHERE s.id = $1 AND s.draft_id = $2`,
      [auth.guard.targetSectionId, auth.guard.draftId]);
    if (s.rows.length === 0) return no('section_not_found');
    const split = splitStoredSection(s.rows[0].text, s.rows[0].heading);
    if (!split) return no('section_not_projectable');

    /* 6 · ⭐⭐ THE SAME WORK-FIT LAW THE STATUS SURFACE CONSUMES.
           CS-3's successor: a surface that claims this is executable and the
           boundary that executes it must ask ONE question, or the member
           authorizes something that does not happen — or something else. */
    const fit = evaluateExecutionFit(auth.guard, {
      workId: auth.guard.workId, draftId: auth.guard.draftId,
      version: Number(d.rows[0].version),
      sectionId: auth.guard.targetSectionId, textAtTarget: split.body,
    });
    if (!fit.fits) {
      return no(fit.reason === 'different_place' ? 'section_not_found' : fit.reason);
    }

    /* 7 · The replacement the fit permits. */
    const applied = applyExactlyOnce(split.body, auth.guard.expectedText, replacement);
    if (!applied.ok) return no(applied.reason);

    /* 8 · ⛔ THE EXISTING MUTATION, ON THIS CLIENT. Never the public
           `saveSection`, which would take a second pool connection and land the
           write OUTSIDE this transaction — where a rollback could not undo it,
           and EW-12 would be false. */
    const saved = await saveSectionInTransaction(
      tx, auth.guard.workId, memberId, auth.guard.targetSectionId,
      applied.applied, auth.guard.baseVersion);
    if (saved.status !== 'saved') return no('write_refused');

    /* 9 · ⭐ THE RECEIPT — both columns, one statement, AFTER the mutation.
           `mra_receipt_whole` makes any other order fail at its first
           statement, which is the constraint doing the work it was written for.
           ⛔ Throw rather than return: a failure here must roll the mutation
           back, never leave a written manuscript with no record of who
           authorized it. */
    const done = await tx.query(
      `UPDATE manuscript_revision_authorizations
          SET accepted_at = now(), resulting_version = $3
        WHERE id = $1 AND member_id = $2 AND accepted_at IS NULL
      RETURNING ${AUTH_COLUMNS}`,
      [authorizationId, memberId, saved.version]);
    if (done.rows.length === 0) {
      throw new Error('authorization receipt could not be recorded');
    }
    return {
      outcome: 'executed' as const,
      authorization: hydrateAuthorizationRow(done.rows[0] as never),
    };
  });
  /* ⛔ NO `catch` HERE. An infrastructure failure propagates to the caller, and
     the transaction's rollback is what leaves the Work whole and the permission
     unspent. Converting it into a refusal would tell the member a RULE said no
     when the DATABASE could not answer. */
}
