/**
 * WS-DELETE-01 · S4 — the governed erasure authority seam.
 *
 * Founder ruling 2026-09-08 (PT-3 Source Custody / WS-DELETE-01 Erasure Authority).
 *
 * ── What this amends, and why the old wording is preserved ─────────────────
 *
 * `20260907000001_vault_erasure_queue.sql` constituted the queue with this
 * discipline, quoted here rather than deleted because it was right about the
 * danger and wrong only about the invariant that contains it:
 *
 *   "NOT a general lifecycle system. It has exactly one producer (the manuscript
 *    DELETE act) and one consumer (the sweep). Anything wanting a broader
 *    deletion lifecycle needs its own ruling."
 *
 * By 2026-09-08 there were THREE runtime producers — manuscript erasure, Work
 * deletion, and Work-cover replacement, the last of which is a content-working
 * route. The founder's correction is not "three producers are acceptable now":
 *
 *   Producer count was a proxy for bounded authority. The system has outgrown
 *   the proxy. Preserve the bounded authority, not the obsolete count.
 *
 * So the durable invariant is now:
 *
 *   Every runtime request to place a vault artifact beyond recovery passes
 *   through ONE governed authority boundary, and that boundary decides whether
 *   the requesting act may destroy that CLASS of artifact.
 *
 * ── The separation this enforces (PT-3) ────────────────────────────────────
 *
 *   SOURCE ARRIVAL AUTHORITY    may establish a NEW entrusted artifact,
 *                               never rewrite a historical one
 *   CONTENT-WORKING AUTHORITY   cannot create, replace, truncate, overwrite or
 *                               destroy bytes in the Source namespace
 *   SOURCE LIFECYCLE AUTHORITY  may relinquish the entrusted artifact, only
 *                               through the explicitly governed lifecycle
 *
 * Authorship work and custody lifecycle are different powers. Holding one must
 * never imply holding the other.
 *
 * ── Why Source authority is EVIDENCE, not a request ────────────────────────
 *
 * The ruling forbids satisfying it with `enqueue(path, "source_lifecycle")` when
 * any caller can supply that value. In-process JavaScript cannot stop a module
 * from importing an exported function, so a token minted on request would be a
 * claim wearing a type. This module does not pretend otherwise. Instead, Source
 * erasure authority is derived from the completed member-directed act:
 *
 *   `mintSourceErasureAuthority()` reads, INSIDE the caller's transaction,
 *   whether the manuscript and its arrival rows are already gone. It returns an
 *   authority only when they are.
 *
 * A content-working path cannot obtain it without having performed the
 * member-directed erasure — at which point it is not masquerading as the
 * lifecycle act, it IS the lifecycle act, and where that deletion may live is
 * pinned separately by the PT-3 static reachability falsifier (P7).
 *
 * This is the same shape as Circles FR-18: the authority is the mutation, not a
 * precheck. It is evidence plus locality, and it is deliberately not described
 * as an unforgeable capability, because in this runtime it is not one.
 *
 * ── What the queue may still hold ──────────────────────────────────────────
 *
 * A vault path and nothing else. Authority is decided HERE, before the row is
 * written; it is not stored. The queue must never gain a reason, a member, a
 * manuscript or any other field that could reconstruct or attribute erased
 * writing merely to make authorization convenient.
 */
import type { TransactionClient } from '@/lib/db/postgres';

/** Vault namespaces this seam governs. A path in no known namespace is refused. */
export const SOURCE_NAMESPACE = 'manuscript-sources';
export const WORK_VISUAL_NAMESPACE = 'work-visuals';

const MINTED = Symbol('vault-erasure-authority');

export type ErasureClass = 'source_lifecycle' | 'work_visual';

export interface ErasureAuthority {
  readonly [MINTED]: true;
  /** The single namespace this authority may destroy within. */
  readonly namespace: string;
  readonly erasureClass: ErasureClass;
  /** Human-readable act name, for refusal messages only. Never stored. */
  readonly actLabel: string;
}

function mint(namespace: string, erasureClass: ErasureClass, actLabel: string): ErasureAuthority {
  return { [MINTED]: true, namespace, erasureClass, actLabel } as const;
}

/** The namespace segment of a vault-relative path, or null if it has none. */
export function namespaceOf(artifactRef: string): string | null {
  const cut = artifactRef.indexOf('/');
  if (cut <= 0) return null;
  return artifactRef.slice(0, cut);
}

/**
 * Authority over a Work's own cover image, and nothing else.
 *
 * Available to ordinary content-working routes on purpose: replacing a cover is
 * content work, and it governs that artifact. It is bounded to `work-visuals`,
 * so the same route presented with a `manuscript-sources/` path is refused —
 * property D of the ruling, and half of PT-3's P8.
 */
export function workVisualErasureAuthority(actLabel: string): ErasureAuthority {
  return mint(WORK_VISUAL_NAMESPACE, 'work_visual', actLabel);
}

/**
 * Authority to relinquish a manuscript's entrusted Source artifacts.
 *
 * Granted only on evidence, inside the caller's transaction, that the
 * member-directed erasure has ALREADY removed the manuscript and its arrival
 * rows. While either still exists this returns null, so a caller that merely
 * wants the authority cannot have it, and a caller that has satisfied the
 * condition has performed the act the authority is for.
 */
export async function mintSourceErasureAuthority(
  tx: TransactionClient,
  manuscriptId: string,
  memberId: string,
  actLabel: string,
): Promise<ErasureAuthority | null> {
  const manuscript = await tx.query<{ id: string }>(
    `SELECT id FROM member_manuscripts WHERE id = $1 AND member_id = $2`,
    [manuscriptId, memberId],
  );
  if (manuscript.rows.length > 0) return null;

  const arrivals = await tx.query<{ id: string }>(
    `SELECT id FROM manuscript_source_arrivals WHERE manuscript_id = $1 AND member_id = $2`,
    [manuscriptId, memberId],
  );
  if (arrivals.rows.length > 0) return null;

  return mint(SOURCE_NAMESPACE, 'source_lifecycle', actLabel);
}

export class ErasureAuthorityRefused extends Error {
  constructor(readonly reason: 'unknown_namespace' | 'namespace_not_governed', detail: string) {
    super(`[erasure-authority] ${reason}: ${detail}`);
    this.name = 'ErasureAuthorityRefused';
  }
}

/**
 * The ONE enqueue primitive. No runtime product path may insert into
 * `vault_erasure_queue` outside this function; the PT-3 static scan asserts it.
 *
 * Refusal is loud. A path this authority does not govern is a programming error
 * at a custody boundary, and silently skipping it would leave bytes retained
 * behind a caller that believes it asked for destruction.
 */
export async function enqueueVaultErasure(
  tx: TransactionClient,
  authority: ErasureAuthority,
  artifactRefs: readonly string[],
): Promise<number> {
  const refs = artifactRefs.filter((r) => typeof r === 'string' && r.length > 0);
  if (refs.length === 0) return 0;

  for (const ref of refs) {
    const ns = namespaceOf(ref);
    if (ns === null) {
      throw new ErasureAuthorityRefused('unknown_namespace', authority.actLabel);
    }
    if (ns !== authority.namespace) {
      throw new ErasureAuthorityRefused('namespace_not_governed', authority.actLabel);
    }
  }

  await tx.query(
    `INSERT INTO vault_erasure_queue (artifact_ref) SELECT unnest($1::text[])`,
    [refs],
  );
  return refs.length;
}
