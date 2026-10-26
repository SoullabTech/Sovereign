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
import { vaultErasureErrnoR105 } from './vaultErasureSafeLogR105';
import { r20LedgerErrorCode, sealR20DeletionLedger } from '@/lib/recovery/r20DeletionLedger';

export type EraseOutcome =
  /** Rows are gone. `sweptAll` is false while vault or recovery-ledger custody is still owed. */
  | { readonly ok: true; readonly artifactsQueued: number; readonly sweptAll: boolean; readonly recoverySealed: boolean }
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
    /* A coherent R20 backup holds the same advisory key while it seals the
       external ledger, dumps PostgreSQL and captures the paused vault. The
       deletion therefore happens wholly before or wholly after that recovery
       point, never half inside it. */
    await tx.query(
      `SELECT pg_advisory_xact_lock(hashtextextended('soullab:r20:recovery-capture', 0))`,
    );

    /* Shared material is never erased out from under a Work the member did not
       delete. Inside the transaction, so the answer cannot go stale between the
       check and the deletes. */
    const claims = await tx.query<{ living_work_id: string }>(
      `SELECT e.living_work_id
         FROM living_work_expressions e
         JOIN living_works w ON w.id = e.living_work_id
        WHERE e.expression_type = 'manuscript'
          AND e.expression_id = $1
          AND w.member_id = $2
        FOR UPDATE OF e, w`,
      [manuscriptId, memberId],
    );
    if (claims.rows.length > 1) {
      return { ok: false as const, refusal: 'declared_in_other_works' as const, works: claims.rows.length };
    }

    /* The paths, read while the rows that name them still exist. After the
       cascade nothing in the database knows these files were ever ours. */
    const arrivals = await tx.query<{ id: string; artifact_ref: string | null }>(
      `SELECT id, artifact_ref FROM manuscript_source_arrivals
        WHERE manuscript_id = $1 AND member_id = $2
        FOR UPDATE`,
      [manuscriptId, memberId],
    );
    const arrivalIds = arrivals.rows.map((row) => row.id);
    const landings = arrivalIds.length === 0
      ? { rows: [] as Array<{ id: string }> }
      : await tx.query<{ id: string }>(
          `SELECT id FROM writer_source_landing_intents
            WHERE member_id = $2::uuid AND arrival_id = ANY($1::uuid[])
            FOR UPDATE`,
          [arrivalIds, memberId],
        );

    const removed = await tx.query<{ id: string }>(
      `DELETE FROM member_manuscripts WHERE id = $1 AND member_id = $2 RETURNING id`,
      [manuscriptId, memberId],
    );
    if (removed.rows.length === 0) {
      return { ok: false as const, refusal: 'not_found' as const };
    }

    const declaration = await removeDeclaration(tx, claims.rows[0]?.living_work_id, manuscriptId, memberId);

    /* The refusal authority is part of the SAME transaction as the deletion.
       It is content-free: stable object ids and a bounded act label only. If
       any insert fails, PostgreSQL rolls the deletion and queue obligations
       back together. */
    const manifest = await tx.query<{ id: string }>(
      `INSERT INTO deletion_manifests
         (reason_class, authorized_by, executed_at, note)
       VALUES ('member_deletion', 'verified-member-self-service', now(),
               'Writer manuscript custody ended by verified member request')
       RETURNING id`,
    );
    const manifestId = manifest.rows[0]?.id;
    if (!manifestId) throw new Error('r20_manifest_not_created');
    const kinds = ['member_manuscripts'];
    const ids = [manuscriptId];
    if (declaration.workRemovedId) {
      kinds.push('living_works');
      ids.push(declaration.workRemovedId);
    }
    for (const arrivalId of arrivalIds) {
      kinds.push('manuscript_source_arrivals');
      ids.push(arrivalId);
    }
    for (const landing of landings.rows) {
      kinds.push('writer_source_landing_intents');
      ids.push(landing.id);
    }
    await tx.query(
      `INSERT INTO provenance_tombstones (manifest_id, object_kind, object_id)
       SELECT $1::uuid, item.kind, item.id
         FROM unnest($2::text[], $3::text[]) AS item(kind, id)
       ON CONFLICT (object_kind, object_id) DO NOTHING`,
      [manifestId, kinds, ids],
    );

    /* First author Save creates private proposal-chain/version text outside the
       manuscript FK cascade by design. Constitutional erasure is the separate
       authority that may remove that history, and only after this exact
       member-deletion manifest+tombstone exists inside the same transaction. */
    await tx.query(
      `SELECT r20_erase_writer_editorial_history($1::uuid, $2::uuid, $3::uuid)`,
      [manifestId, memberId, manuscriptId],
    );

    /* Written inside the transaction: if the commit fails, nothing was destroyed
       and nothing is owed. If it succeeds, every path is recoverable until it is
       actually gone. */
    const refs = arrivals.rows
      .map((row) => row.artifact_ref)
      .filter((ref): ref is string => typeof ref === 'string' && ref.length > 0);
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
  let recoverySealed = false;
  try {
    recoverySealed = (await sealR20DeletionLedger()).sealed;
  } catch (error) {
    /* The member is not given a completed-custody answer when the independent
       refusal ledger cannot be sealed. Log only a bounded structural code: key
       paths and ledger locations belong to the recovery boundary. */
    console.error('[MAIA/press] R20 recovery seal still owed', { code: r20LedgerErrorCode(error) });
  }
  return {
    ok: true,
    artifactsQueued: result.refs.length,
    sweptAll: swept.remaining === 0 && recoverySealed,
    recoverySealed,
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
): Promise<{ readonly workRemovedId?: string }> {
  if (!workId) return {};

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
  return workGone.rows[0]?.id ? { workRemovedId: workGone.rows[0].id } : {};
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
      const code = vaultErasureErrnoR105(err);
      await query(
        `UPDATE vault_erasure_queue
            SET attempts = attempts + 1, last_attempt_at = now(), last_error = $2
          WHERE id = $1`,
        [row.id, String(code).slice(0, 32)],
      );
      console.error('[MAIA/press] vault erasure still owed (errno='+code+')');
    }
  }

  const left = await query<{ n: string }>(`SELECT count(*)::int AS n FROM vault_erasure_queue`);
  return { destroyed, remaining: Number(left.rows[0]?.n ?? 0) };
}
