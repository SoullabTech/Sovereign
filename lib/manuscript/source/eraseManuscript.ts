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
import { holdManuscriptDeclarationExclusive } from './manuscriptDeclarationLock';
import { r20LedgerErrorCode, sealR20DeletionLedger } from '@/lib/recovery/r20DeletionLedger';
import { writeWorkDeletionRecord } from './workDeletionRecord';

export type EraseOutcome =
  /** Rows are gone. `sweptAll` is false while THIS deletion's vault bytes or its recovery-ledger seal are still owed (other members'
   *  queue rows never make it false). */
  | {
      readonly ok: true;
      readonly artifactsQueued: number;
      readonly sweptAll: boolean;
      /** True when no WRITING-deletion seal is owed by this call: the seal succeeded, or this call erased no writing (the X8 cleanup of a
       *  declaration whose writing was already gone) and none was attempted. It does NOT mean the independent ledger holds every
       *  record this call wrote: an X8 call that removed a Work wrote a Work record (manifest + `living_works` tombstone) that is
       *  database-only until a later successful seal mirrors it (workDeletionRecord.ts; register line C4). `sweptAll` inherits this. */
      readonly recoverySealed: boolean;
      /** Which of THIS deletion's own byte obligations are still owed: the member's original file, and the Work's image. */
      readonly owed: { readonly originalFile: boolean; readonly image: boolean };
      /** The Work the card named went too (it declared nothing else). False for loose writing and for a Work that stays. */
      readonly workRemoved: boolean;
    }
  | { readonly ok: false; readonly refusal: 'not_found' }
  | { readonly ok: false; readonly refusal: 'declared_in_other_works'; readonly works: number }
  /** The caller named the Work it was acting from, and that Work no longer holds this writing (removed on another device, or earlier
   *  in this one). Refused before anything is touched, so a stale card can never reach the writing of a Work the member did not pick. */
  | { readonly ok: false; readonly refusal: 'work_no_longer_holds_it' };

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
  options: { readonly viaWorkId?: string } = {},
): Promise<EraseOutcome> {
  const result = await transaction(async (tx) => {
    /* A coherent R20 backup holds the same advisory key while it seals the
       external ledger, dumps PostgreSQL and captures the paused vault. The
       deletion therefore happens wholly before or wholly after that recovery
       point, never half inside it. */
    await tx.query(
      `SELECT pg_advisory_xact_lock(hashtextextended('soullab:r20:recovery-capture', 0))`,
    );

    /* A declaration of this writing into a Work (POST …/expressions) holds the
       same key shared for its whole transaction. Taking it exclusively HERE —
       before `claims` is read, and before any row lock — means every declaration
       that committed is visible to the read below, and every later one waits and
       then finds the writing gone. Without it, a declaration committing between
       `claims` and the DELETE below leaves a Work naming an erased writing, and
       slips past the shared-writing refusal that `claims` exists to enforce.

       Deliberately an advisory lock and not a lock on the manuscript row: the
       row order everywhere else is Work → manuscript (this function's claims →
       DELETE, and threadOrigin's FOR SHARE walk), and locking the manuscript
       first would cycle with a transaction holding a Work and asking for it. */
    await holdManuscriptDeclarationExclusive(tx, memberId, manuscriptId);

    /* Shared material is never erased out from under a Work the member did not
       delete. Inside the transaction, so the answer cannot go stale between the
       check and the deletes.

       LOCK ORDER. Removing a Work (DELETE FROM living_works) locks the Work row and then cascades into its expression rows. This
       reads the same rows, so it takes them in the SAME order: the Work rows first, then the expression rows. Locking the expression
       row first (one combined FOR UPDATE OF e, w) formed a real cycle with a concurrent removal, which PostgreSQL broke by aborting
       one of the two with a 500 (about 1 in 80 simultaneous attempts, measured). The marker comment below is what the probes wait on. */
    await tx.query(
      `/* ws-delete:lock-works-first */
       SELECT w.id
         FROM living_works w
        WHERE w.member_id = $2
          AND w.id IN (
            SELECT e.living_work_id FROM living_work_expressions e
             WHERE e.expression_type = 'manuscript' AND e.expression_id = $1
          )
        ORDER BY w.id
        FOR UPDATE`,
      [manuscriptId, memberId],
    );
    const claims = await tx.query<{ living_work_id: string }>(
      `SELECT e.living_work_id
         FROM living_work_expressions e
         JOIN living_works w ON w.id = e.living_work_id
        WHERE e.expression_type = 'manuscript'
          AND e.expression_id = $1
          AND w.member_id = $2
        FOR UPDATE OF e`,
      [manuscriptId, memberId],
    );
    /* THE WRITING ITSELF, first. If it is already gone (the member deleted it a moment ago from another tab, or this is a repeat of a
       request whose answer was lost) there is nothing left to protect and nothing to refuse: the ruling's retry "finds the manuscript
       already gone (404) and continues". "Continues" is done HERE, in the same transaction, so no client has to guess what to remove
       next:
         - the Work the card named still declares the gone writing (a declaration that outlived its writing: the detached state the
           ruling forbids by name) -> that declaration goes, and the Work goes with it if it declared nothing else. A Work that holds
           something else stays. Exactly what a Delete from that card means when the writing was alive.
         - otherwise (the named Work no longer declares it, or no Work was named) -> not found, which the caller reads as done. */
    const held = await tx.query<{ id: string }>(
      `SELECT id FROM member_manuscripts WHERE id = $1 AND member_id = $2`,
      [manuscriptId, memberId],
    );
    if (held.rows.length === 0) {
      if (options.viaWorkId !== undefined && claims.rows.some((row) => row.living_work_id === options.viaWorkId)) {
        const cleaned = await removeDeclaration(tx, options.viaWorkId, manuscriptId, memberId);
        /* A Work that really went here is recorded like any other deleted Work, in this same transaction (the recovery-capture lock is
           already held, and the Work row was locked above, so the order is the one Remove takes too). A Work that stays wrote no
           deletion and gets no record. The writing is not tombstoned and no editorial history is erased: no writing was erased here.
           The independent ledger is not sealed on this path; see lib/manuscript/source/workDeletionRecord.ts for why. */
        if (cleaned.workRemovedId !== undefined) {
          await writeWorkDeletionRecord(tx, cleaned.workRemovedId, 'Writer Work ended after its writing was already gone, by verified member request');
        }
        return { ok: true as const, refs: [] as string[], originalQueueIds: [] as string[], imageQueueIds: [...cleaned.queueIds], declarationOnly: true, workRemoved: cleaned.workRemovedId !== undefined };
      }
      return { ok: false as const, refusal: 'not_found' as const };
    }
    /* The member pressed Delete on a particular Work's card. If that Work no longer holds this writing, the card is stale: the
       count below would now see only some OTHER Work as the sole claimant and erase its writing and the Work itself. The act the
       member confirmed was about the Work on their screen, so it is refused here, inside the same transaction, before anything
       is deleted. Callers that name no Work (loose writing, the History page) are unchanged. */
    if (options.viaWorkId !== undefined && !claims.rows.some((row) => row.living_work_id === options.viaWorkId)) {
      return { ok: false as const, refusal: 'work_no_longer_holds_it' as const };
    }
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
    const originalQueueIds: string[] = [];
    if (refs.length > 0) {
      const queued = await tx.query<{ id: string }>(
        `INSERT INTO vault_erasure_queue (artifact_ref)
         SELECT unnest($1::text[])
         RETURNING id`,
        [refs],
      );
      originalQueueIds.push(...queued.rows.map((row) => row.id));
    }
    return { ok: true as const, refs, originalQueueIds, imageQueueIds: [...declaration.queueIds], declarationOnly: false, workRemoved: declaration.workRemovedId !== undefined };
  });

  if (!result.ok) return result;

  /* Past this point the member's Work is gone in every sense they can observe.
     What remains is ours to finish, and the queue guarantees we can. */
  const ownIds = [...result.originalQueueIds, ...result.imageQueueIds];
  await sweepVaultErasureQueue(100, ownIds);
  /* Custody is about THIS deletion's own obligations. The queue is shared by every member, so a row that someone else left behind,
     or one a concurrent deletion has just written, is an operator's concern and must not make this member's deletion read as
     unconfirmed. (The sweep above still works through the whole queue, this deletion's rows first.) The two kinds are kept apart
     because the member is told which one is owed: the original file, or the Work's image. */
  const stillQueued = new Set<string>(ownIds.length === 0
    ? []
    : (await query<{ id: string }>(`SELECT id FROM vault_erasure_queue WHERE id = ANY($1::uuid[])`, [ownIds])).rows.map((row) => row.id));
  const owed = {
    originalFile: result.originalQueueIds.some((id) => stillQueued.has(id)),
    image: result.imageQueueIds.some((id) => stillQueued.has(id)),
  };
  /* A cleanup of a dangling declaration deleted no writing, so there is no writing-deletion record to seal. (If it removed a Work
     it wrote a Work record in the transaction above; sealing that is deliberately not done here, and is the open decision recorded in
     workDeletionRecord.ts.) */
  let recoverySealed = result.declarationOnly;
  if (!result.declarationOnly) {
    try {
      recoverySealed = (await sealR20DeletionLedger()).sealed;
    } catch (error) {
      /* The member is not given a completed-custody answer when the independent
         refusal ledger cannot be sealed. Log only a bounded structural code: key
         paths and ledger locations belong to the recovery boundary. */
      console.error('[MAIA/press] R20 recovery seal still owed', { code: r20LedgerErrorCode(error) });
    }
  }
  return {
    ok: true,
    artifactsQueued: result.refs.length,
    sweptAll: !owed.originalFile && !owed.image && recoverySealed,
    recoverySealed,
    owed,
    workRemoved: result.workRemoved,
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
): Promise<{ readonly workRemovedId?: string; readonly queueIds: readonly string[] }> {
  if (!workId) return { queueIds: [] };

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
    `SELECT storage_path FROM living_work_visuals WHERE living_work_id = $1 AND member_id = $2 FOR UPDATE`,
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
  const queueIds: string[] = [];
  if (workGone.rows.length > 0 && path) {
    const queued = await tx.query<{ id: string }>(`INSERT INTO vault_erasure_queue (artifact_ref) VALUES ($1) RETURNING id`, [path]);
    queueIds.push(...queued.rows.map((row) => row.id));
  }
  return workGone.rows[0]?.id ? { workRemovedId: workGone.rows[0].id, queueIds } : { queueIds };
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
  /** Rows to work through before the rest (the caller's own obligations), so a large backlog cannot starve them. */
  first: readonly string[] = [],
): Promise<{ destroyed: number; remaining: number }> {
  const owed = await query<{ id: string; artifact_ref: string }>(
    `SELECT id, artifact_ref FROM vault_erasure_queue
      ORDER BY (id = ANY($2::uuid[])) DESC, queued_at ASC LIMIT $1`,
    [limit, first],
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
