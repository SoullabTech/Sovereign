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
 */

import { query } from '@/lib/db/postgres';
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
  const c = await query<{
    id: string; member_id: string; work_id: string; draft_id: string;
    base_version: number | string; target_section_id: string;
    expected_text: string; decision_chain_id: string | null; opened_at: Date;
  }>(
    `SELECT id, member_id, work_id, draft_id, base_version, target_section_id,
            expected_text, decision_chain_id, opened_at
       FROM proposal_chains WHERE id = $1 AND member_id = $2`,
    [chainId, memberId]);
  if (c.rows.length === 0) return { ok: false, reason: 'chain_unknown' };
  const r = c.rows[0];
  const chain: ProposalChain = {
    id: r.id, memberId: r.member_id,
    locus: {
      workId: r.work_id, draftId: r.draft_id, baseVersion: Number(r.base_version),
      targetSectionId: r.target_section_id, expectedText: r.expected_text,
    },
    ...(r.decision_chain_id !== null
      ? { governedBy: { decisionChainId: r.decision_chain_id } } : {}),
    openedAt: r.opened_at.toISOString(),
  };

  const v = await query<{
    id: string; chain_id: string; author: 'maia' | 'member'; formulation: string;
    rationale: string | null; supersedes: string | null; authored_at: Date;
  }>(
    `SELECT id, chain_id, author, formulation, rationale, supersedes, authored_at
       FROM proposal_versions WHERE chain_id = $1 ORDER BY id`, [chainId]);
  const versions: ProposalVersion[] = v.rows.map((x) => ({
    id: x.id, chainId: x.chain_id, supersedes: x.supersedes,
    replacementText: x.formulation,
    ...(x.rationale !== null ? { rationale: x.rationale } : {}),
    author: x.author, authoredAt: x.authored_at.toISOString(),
  }));

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
