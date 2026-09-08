/**
 * WS-DELETE-01 · S4 (repaired) — the governed erasure seam.
 *
 * Founder ruling 2026-09-08, and its review of the first implementation the same
 * day. The constitutional standard was accepted; the implementation was not:
 *
 *   "absence + namespace is not evidence + locality."
 *
 * ── What the first attempt got wrong, kept here because it is instructive ──
 *
 * It minted a portable `ErasureAuthority` object on the observation that a
 * manuscript and its arrival rows were ABSENT. Five defects, all real:
 *
 *   1. Absence proves a STATE, not the TRANSITION that produced it. A
 *      nonexistent id, or an id belonging to another member, satisfied the mint
 *      without any erasure having occurred.
 *   2. The minted authority covered the whole `manuscript-sources` namespace,
 *      so a legitimate erasure of manuscript A could enqueue manuscript B's
 *      Source. Authority over one lifecycle act became authority over every
 *      Source artifact.
 *   3. The token was transferable: mint in transaction A, let it escape, roll A
 *      back, use it in transaction B.
 *   4. The private `MINTED` symbol expressed intent in the type shape, and the
 *      seam never validated it at runtime. A cast or a hand-built object was a
 *      capability.
 *   5. The namespace check was textual while destruction resolves filesystem
 *      paths, so `work-visuals/../manuscript-sources/x` passed as a Work visual
 *      and resolved into Source.
 *
 * ── The repaired shape ────────────────────────────────────────────────────
 *
 * There is no authority object. Nothing to forge, nothing to repurpose, nothing
 * to outlive its transaction.
 *
 *   Source lifecycle authority is an OPERATION, not a portable token.
 *
 * `relinquishManuscriptSource()` is that operation. Inside the CALLER'S
 * transaction it: captures the exact Source refs → performs the member-scoped
 * manuscript DELETE and requires positive `RETURNING` evidence → enqueues
 * exactly those captured refs. It returns an outcome, never destruction power.
 * The transition that relinquishes custody and the obligation it authorizes
 * commit or roll back together, because they are the same transaction and the
 * same call.
 *
 * `eraseWorkVisualBytes()` is the content-working counterpart, bounded to the
 * Work-visual namespace by construction. It cannot name a Source artifact, and
 * there is no argument by which a caller could widen it.
 *
 * The queue primitive is module-private. This module exports no generic enqueue
 * and no way to obtain one, so P8's question — can content-working code acquire
 * or counterfeit Source-erasure power — has a structural answer rather than a
 * conventional one. Locality (who may call the lifecycle operation) is pinned
 * separately by PT-3's P7.
 *
 * ── What the queue may still hold ──────────────────────────────────────────
 *
 * A vault path and nothing else. Authority is decided here, before the row is
 * written, and is never stored. The queue must never gain a reason, a member, a
 * manuscript or any other field capable of reconstructing or attributing erased
 * writing merely to make authorization convenient.
 *
 * ── The amended invariant (the migration's wording is superseded, not edited) ─
 *
 * `20260907000001_vault_erasure_queue.sql` says "exactly one producer". Three
 * runtime producers existed by 2026-09-08, one of them a content-working route.
 * Producer count was a proxy for bounded authority; the system outgrew the
 * proxy. Preserve the bounded authority, not the obsolete count:
 *
 *   Every runtime request to place a vault artifact beyond recovery passes
 *   through one governed boundary, and that boundary decides whether the
 *   requesting act may destroy that CLASS of artifact.
 */
import type { TransactionClient } from '@/lib/db/postgres';

export const SOURCE_NAMESPACE = 'manuscript-sources';
export const WORK_VISUAL_NAMESPACE = 'work-visuals';

export class ErasureRefused extends Error {
  constructor(
    readonly reason:
      | 'not_canonical'
      | 'namespace_not_governed'
      | 'transition_not_witnessed',
    detail: string,
  ) {
    super(`[erasure] ${reason}: ${detail}`);
    this.name = 'ErasureRefused';
  }
}

/**
 * The one canonical vault-reference validator, used at the authority boundary.
 *
 * The object authorized and the object eventually destroyed must be the SAME
 * canonical object, so this refuses anything whose meaning could change under
 * filesystem resolution rather than trying to normalize it into safety:
 * absolute paths, drive letters, backslashes, NUL, empty segments, `.` and `..`.
 * A reference that survives is one no `path.resolve` can relocate.
 */
export function canonicalVaultRef(ref: unknown): { ref: string; namespace: string } | null {
  if (typeof ref !== 'string' || ref.length === 0) return null;
  if (ref.includes('\0') || ref.includes('\\')) return null;
  if (ref.startsWith('/') || /^[A-Za-z]:/.test(ref)) return null;

  const segments = ref.split('/');
  if (segments.length < 2) return null;
  for (const segment of segments) {
    if (segment === '' || segment === '.' || segment === '..') return null;
  }
  return { ref: segments.join('/'), namespace: segments[0] };
}

/** Module-private. The only writer of the queue; never exported in any form. */
async function enqueue(
  tx: TransactionClient,
  namespace: string,
  refs: readonly string[],
  actLabel: string,
): Promise<number> {
  const canonical: string[] = [];
  for (const raw of refs) {
    const c = canonicalVaultRef(raw);
    /* Loud, and the WHOLE batch fails. A refusal that half-succeeds is not a
       refusal: it would destroy the governed half and silently drop the rest,
       leaving bytes retained behind a caller that believes it asked. */
    if (!c) throw new ErasureRefused('not_canonical', actLabel);
    if (c.namespace !== namespace) throw new ErasureRefused('namespace_not_governed', actLabel);
    canonical.push(c.ref);
  }
  if (canonical.length === 0) return 0;

  await tx.query(
    `INSERT INTO vault_erasure_queue (artifact_ref) SELECT unnest($1::text[])`,
    [canonical],
  );
  return canonical.length;
}

/**
 * Content-working authority over a Work's own cover image, and nothing else.
 *
 * An operation rather than a token, for the same reason as below: there is no
 * object a caller could widen, cast or carry into another transaction. Handed a
 * Source path — canonical or disguised — it refuses.
 */
export async function eraseWorkVisualBytes(
  tx: TransactionClient,
  refs: readonly string[],
  actLabel: string,
): Promise<number> {
  return enqueue(tx, WORK_VISUAL_NAMESPACE, refs, actLabel);
}

export interface RelinquishOutcome {
  /** True only when this call's DELETE actually removed the manuscript row. */
  readonly deleted: boolean;
  /** The exact Source refs this act relinquished. Data, never authority. */
  readonly refs: readonly string[];
  readonly queued: number;
}

/**
 * THE governed Source lifecycle operation. Runs inside the caller's transaction.
 *
 *   capture the exact Source refs
 *     → member-scoped DELETE ... RETURNING   ← positive evidence of the transition
 *       → enqueue exactly those captured refs
 *
 * Ordering is load-bearing in both directions. The refs are read while the rows
 * naming them still exist, because after the cascade nothing in the database
 * knows the files were ever ours. The enqueue happens only after the DELETE
 * returns a row, because a state observed is not a transition performed — the
 * defect this repair exists to close.
 *
 * Nothing here can reach another manuscript's Source: the refs enqueued are the
 * ones this call captured, from this manuscript, under this member. There is no
 * parameter, and no returned object, by which that binding could be widened.
 *
 * A caller that does not want to erase cannot use this to obtain erasure power,
 * because there is no power to obtain — only an act with consequences.
 */
export async function relinquishManuscriptSource(
  tx: TransactionClient,
  manuscriptId: string,
  memberId: string,
  actLabel: string,
): Promise<RelinquishOutcome> {
  const arrivals = await tx.query<{ artifact_ref: string }>(
    `SELECT artifact_ref FROM manuscript_source_arrivals
      WHERE manuscript_id = $1 AND member_id = $2 AND artifact_ref IS NOT NULL`,
    [manuscriptId, memberId],
  );
  const refs = arrivals.rows.map((r) => r.artifact_ref).filter(Boolean);

  const removed = await tx.query<{ id: string }>(
    `DELETE FROM member_manuscripts WHERE id = $1 AND member_id = $2 RETURNING id`,
    [manuscriptId, memberId],
  );
  if (removed.rows.length === 0) {
    /* No transition, therefore no authority, therefore nothing enqueued — even
       though the manuscript is now demonstrably absent. Absence is not
       evidence. */
    return { deleted: false, refs: [], queued: 0 };
  }

  const queued = await enqueue(tx, SOURCE_NAMESPACE, refs, actLabel);
  return { deleted: true, refs, queued };
}
