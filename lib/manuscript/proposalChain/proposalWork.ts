/**
 * THE PROPOSAL-WORK READ MODEL — what the writer and MAIA are working on.
 *
 * ⭐⭐ ITS SUBJECT IS `ProposalChain` + `ProposalVersion`. NOT an authorization.
 *
 * ⛔ R6, MADE STRUCTURAL. The retired `resolveProposalWork()` defined proposal
 * work as `previewProposal(...).state === 'acceptable'` — so a writer could not
 * discuss a formulation whose executable binding had lapsed. Two questions were
 * one verdict, and the Work moving silently ended the conversation.
 *
 *     discussable  ≠  executable
 *
 * ⭐ So this read remains available when NO authorization exists, when one
 * became stale, and when an earlier one was already spent. It never consults
 * `manuscript_revision_authorizations` at all — the separation is an absence,
 * not a check.
 *
 * ⛔ AND IT CARRIES NO AUTHORITY FIELD. No `executionAuthority`, no
 * `inspection_only`, no `mayAccept`. Those have no successor in any spelling.
 *
 * ── ⛔ AND IT OWNS NO SQL ─────────────────────────────────────────────────
 *
 * ⚠️ FOUNDER REVIEW, 2026-09-14. The first cut issued its own
 * `SELECT … FROM proposal_chains` / `proposal_versions` and hydrated
 * `ProposalChain` and `ProposalVersion` itself — A SECOND IMPLEMENTATION OF A
 * PERSISTENCE BOUNDARY STEP 1 HAD ALREADY REVIEWED. It agreed with
 * `proposalChain/store.ts` on the day it was written, which is exactly what
 * this programme has learned not to accept: a later hydration correction would
 * have landed on one read path and not the other.
 *
 *     store          durable facts
 *     proposalWork   collaborative READ SEMANTICS — validate · lineage ·
 *                    focus · discussion
 *
 * ⛔ It consumes `readChain()`. A source gate pins the absence of direct table
 * access here — not because SQL is forbidden in this layer, but because these
 * two objects already have one adapter.
 */

import { readChain } from './store';
import { lineage, validateChain } from './succession';
import type { ProposalChain, ProposalVersion } from './contract';

export interface ProposalWork {
  readonly chain: ProposalChain;
  /** Root first, by `supersedes` — ⛔ never by a clock. */
  readonly versions: readonly ProposalVersion[];
  /**
   * ⭐ The version being discussed. The caller names it; absent it, the head —
   * ⚠️ and THAT default is a READING convenience, never an authorization
   * shortcut. `authorizeVersion` has no such default and must not acquire one.
   */
  readonly focused: ProposalVersion | null;
}

export type ProposalWorkRefusal =
  /** ⛔ Unknown, or another member's. Deliberately indistinguishable. */
  | 'chain_unknown'
  /** The named version is not in this chain. */
  | 'version_unknown'
  /** ⛔ The stored rows do not form a chain. Never silently repaired. */
  | 'chain_corrupt';

export type ProposalWorkResult =
  | { readonly ok: true; readonly work: ProposalWork }
  | { readonly ok: false; readonly reason: ProposalWorkRefusal };

/**
 * Read one member-owned proposal chain and everything authored in it.
 *
 * ⛔ NOTHING HERE ASKS WHETHER THE WORK STILL FITS, or whether an authorization
 * exists, or whether one could execute. A surface that needs that asks
 * `readAuthorizationStatus` — a different question with a different subject.
 */
export async function readProposalWork(
  memberId: string, chainId: string, focusVersionId?: string,
): Promise<ProposalWorkResult> {
  /* ⭐ THE STEP-1 ADAPTER, and only it. `readChain` already collapses "absent"
     and "another member's" into one `null`, which is the convention this read
     inherits rather than re-implements. */
  const stored = await readChain(memberId, chainId);
  if (!stored) return { ok: false, reason: 'chain_unknown' };
  const { chain, versions } = stored;

  /* ⛔ Corrupt succession REFUSES. A read that quietly worked around it would
     show the writer a history nobody authored. */
  const valid = validateChain(chain, versions);
  if (!valid.ok) return { ok: false, reason: 'chain_corrupt' };

  const ordered = lineage(versions);
  const focused = focusVersionId
    ? versions.find((x) => x.id === focusVersionId) ?? null
    : ordered[ordered.length - 1] ?? null;
  if (focusVersionId && !focused) return { ok: false, reason: 'version_unknown' };

  return { ok: true, work: { chain, versions: ordered, focused } };
}
