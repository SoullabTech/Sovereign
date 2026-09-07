/**
 * WS-DELETE-01 — the erasure act, as one transaction plus a sweep that finishes.
 *
 * Founder ruling 2026-09-07. "Delete Work" means Soullab relinquishes custody:
 * source text, uploaded bytes, manuscript, sections, drafts, renders, derived
 * artifacts, the custody record, and any reconstructive provenance capable of
 * restoring the writing. It must not mean hidden, archived, detached, or
 * unreferenced but retained.
 *
 * ── Why the declaration is deleted here and not by a second call ──────────
 * A Work is two things: the member's declaration (`living_works`) and the
 * material it names (`member_manuscripts`). The first implementation deleted
 * them with two requests, material first, and answered a failure between them
 * with "press Delete again." The founder refused: a detached Work — a live
 * declaration pointing at material already destroyed — must not exist, and
 * retryability is not invariance.
 *
 * So both deletions happen in ONE transaction. There is no interval in which a
 * live Work points at absent material, because the two facts commit together.
 *
 * ── What is deleted, precisely ───────────────────────────────────────────
 * A Living Work is not required to be a manuscript wrapper; its expressions are
 * open by design. Deleting a Work because one of its expressions died would
 * destroy declarations about material that is still here. So:
 *
 *   the manuscript is this Work's ONLY expression → the Work goes with it
 *   the Work has other expressions               → only the expression row goes,
 *                                                   and the Work survives still
 *                                                   pointing at what remains
 *
 * Neither branch leaves a declaration naming absent material.
 *
 * ── The one seam a transaction cannot close ──────────────────────────────
 * Vault bytes are not transactional. Destroying them before the commit would
 * risk a live Work whose file is gone; destroying them after risks bytes that
 * nothing names. The queue closes it: the paths are written down INSIDE the
 * transaction, so after the commit the bytes are unreferenced by the studio but
 * still REACHABLE for destruction, and the sweep is idempotent — an already-gone
 * path succeeds.
 *
 * ── "Self-completing" is a claim about a consumer, not about a row ────────
 * Founder ruling 2026-09-07: a queue row is an owed act, and it is self-completing
 * only if something will revisit it WITHOUT the member deleting the now-absent
 * Work again. The inline sweep below cannot be that something — if it fails, it
 * has already returned. If it were the only consumer, this design would be named
 * failure, not self-completing failure, and retained bytes could live forever
 * behind a perfectly truthful queue row.
 *
 * The second consumer is `scripts/ops/sweep-vault-erasure-queue.ts`, runnable
 * independently and proven end to end by the erasure witness: commit succeeds →
 * vault deletion fails → the process ends → the obligation survives → a separate
 * process sees it → the bytes are destroyed → the obligation disappears.
 *
 * ⚠ STILL OWED: nothing SCHEDULES that consumer yet. Independent recovery is
 * proven; autonomous invocation is not. Until an operational trigger exists, a
 * failed sweep leaves bytes retained behind a queue row that is permanently
 * truthful and permanently unread. Do not describe this as self-completing in
 * member-facing copy or in a closure claim until that trigger is bound and one
 * abandoned obligation is witnessed being collected without a manual launch.
 */

import { transaction, query, type TransactionClient } from '@/lib/db/postgres';
import { destroyVaultBytes } from '@/lib/storage/fileVault';

export type EraseOutcome =
  /** Rows are gone. `sweptAll` is false when bytes are still owed destruction. */
  | { readonly ok: true; readonly artifactsQueued: number; readonly sweptAll: boolean }
  | { readonly ok: false; readonly refusal: 'not_found' }
  | { readonly ok: false; readonly refusal: 'declared_in_other_works'; readonly works: number };

/**
 * Ends custody of one manuscript and any declaration that exists only to name it.
 *
 * Member-scoped throughout: every statement carries the member id, so another
 * member's id matches zero rows and is answered `not_found` — never confirming
 * that the id exists at all.
 */
export async function eraseManuscript(
  manuscriptId: string,
  memberId: string,
): Promise<EraseOutcome> {
  const result = await transaction(async (tx) => {
    /* Shared material is never erased out from under a Work the member did not
       delete. Inside the transaction, so the answer cannot go stale between the
       check and the deletes. */
    const claims = await tx.query<{ living_work_id: string }>(
      `SELECT e.living_work_id
         FROM living_work_expressions e
         JOIN living_works w ON w.id = e.living_work_id
        WHERE e.expression_type = 'manuscript'
          AND e.expression_id = $1
          AND w.member_id = $2`,
      [manuscriptId, memberId],
    );
    if (claims.rows.length > 1) {
      return { ok: false as const, refusal: 'declared_in_other_works' as const, works: claims.rows.length };
    }

    /* The paths, read while the rows that name them still exist. After the
       cascade nothing in the database knows these files were ever ours. */
    const arrivals = await tx.query<{ artifact_ref: string }>(
      `SELECT artifact_ref FROM manuscript_source_arrivals
        WHERE manuscript_id = $1 AND member_id = $2 AND artifact_ref IS NOT NULL`,
      [manuscriptId, memberId],
    );

    const removed = await tx.query<{ id: string }>(
      `DELETE FROM member_manuscripts WHERE id = $1 AND member_id = $2 RETURNING id`,
      [manuscriptId, memberId],
    );
    if (removed.rows.length === 0) {
      return { ok: false as const, refusal: 'not_found' as const };
    }

    await removeDeclaration(tx, claims.rows[0]?.living_work_id, manuscriptId, memberId);

    /* Written inside the transaction: if the commit fails, nothing was destroyed
       and nothing is owed. If it succeeds, every path is recoverable until it is
       actually gone. */
    const refs = arrivals.rows.map((r) => r.artifact_ref);
    if (refs.length > 0) {
      await tx.query(
        `INSERT INTO vault_erasure_queue (artifact_ref)
         SELECT unnest($1::text[])`,
        [refs],
      );
    }
    return { ok: true as const, refs };
  });

  if (!result.ok) return result;

  /* Past this point the member's Work is gone in every sense they can observe.
     What remains is ours to finish, and the queue guarantees we can. */
  const swept = await sweepVaultErasureQueue();
  return {
    ok: true,
    artifactsQueued: result.refs.length,
    sweptAll: swept.remaining === 0,
  };
}

/**
 * A Work that exists only to name this manuscript goes with it; a Work that names
 * other things loses only the expression that died. The distinction is what keeps
 * erasure from reaching material the member did not ask to erase.
 */
async function removeDeclaration(
  tx: TransactionClient,
  workId: string | undefined,
  manuscriptId: string,
  memberId: string,
): Promise<void> {
  if (!workId) return;

  await tx.query(
    `DELETE FROM living_work_expressions
      WHERE living_work_id = $1 AND expression_type = 'manuscript' AND expression_id = $2`,
    [workId, manuscriptId],
  );

  /* Read BEFORE the Work is deleted, because ON DELETE CASCADE will take this
     row with it and then nothing in the database will know the file was ever
     ours. A cascade removes the record; it cannot remove bytes — that gap is
     exactly the *unreferenced but retained* state WS-DELETE-01 forbids by name,
     and the founder restated it for Work visuals on 2026-09-07: a database
     cascade alone is not enough if the blob survives elsewhere. */
  const visual = await tx.query<{ storage_path: string }>(
    `SELECT storage_path FROM living_work_visuals WHERE living_work_id = $1 AND member_id = $2`,
    [workId, memberId],
  );

  /* Now that its expression is gone: if nothing else was ever declared into this
     Work, the declaration has no referent left and would render as an ordinary,
     openable, empty Work — the detached state by another name. */
  const workGone = await tx.query<{ id: string }>(
    `DELETE FROM living_works w
      WHERE w.id = $1 AND w.member_id = $2
        AND NOT EXISTS (
          SELECT 1 FROM living_work_expressions e WHERE e.living_work_id = w.id
        )
    RETURNING w.id`,
    [workId, memberId],
  );

  /* Enqueued only if the Work ACTUALLY went. A Work that survived because it
     still has other expressions keeps its image, and owing destruction of bytes
     a live Work is still displaying would be worse than not owing it at all. */
  const path = visual.rows[0]?.storage_path;
  if (workGone.rows.length > 0 && path) {
    await tx.query(`INSERT INTO vault_erasure_queue (artifact_ref) VALUES ($1)`, [path]);
  }
}

/**
 * Destroy every path the database still owes, and forget the ones that are gone.
 *
 * Idempotent and safe to run at any time by anyone: it reconstructs nothing, it
 * reads no member data, and a path that was already destroyed succeeds. A failure
 * leaves the row exactly where it was so the next pass tries again.
 */
export async function sweepVaultErasureQueue(
  limit = 100,
): Promise<{ destroyed: number; remaining: number }> {
  const owed = await query<{ id: string; artifact_ref: string }>(
    `SELECT id, artifact_ref FROM vault_erasure_queue ORDER BY queued_at ASC LIMIT $1`,
    [limit],
  );

  let destroyed = 0;
  for (const row of owed.rows) {
    try {
      await destroyVaultBytes(row.artifact_ref);
      await query(`DELETE FROM vault_erasure_queue WHERE id = $1`, [row.id]);
      destroyed += 1;
    } catch (err) {
      /* Never delete the row on failure — it is the only remaining handle on
         bytes nothing else can find.

         The errno ONLY, never the message. A filesystem error message embeds the
         full path, so storing it would put the vault path into a second column
         and make this row carry more provenance than the one field it is allowed.
         The errno is also the operationally useful half: EACCES, EPERM and EROFS
         each name a different thing for an operator to fix. */
      const code =
        (err as NodeJS.ErrnoException)?.code
        ?? (err instanceof Error && /still present/.test(err.message) ? 'ESTILLPRESENT' : 'UNKNOWN');
      await query(
        `UPDATE vault_erasure_queue
            SET attempts = attempts + 1, last_attempt_at = now(), last_error = $2
          WHERE id = $1`,
        [row.id, String(code).slice(0, 32)],
      );
      console.error('[MAIA/press] vault erasure still owed', row.artifact_ref, err);
    }
  }

  const left = await query<{ n: string }>(`SELECT count(*)::int AS n FROM vault_erasure_queue`);
  return { destroyed, remaining: Number(left.rows[0]?.n ?? 0) };
}
