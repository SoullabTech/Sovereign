/**
 * WS-EDITORIAL-UI-02 · THE WRITER ANSWERS IN THE SAME MEDIUM — wording.
 *
 * ⭐⭐ UNTIL NOW THE WRITER COULD ONLY RECEIVE FORMULATIONS. This is where they
 * answer in kind: *"no — I'd write it this way"* — and their sentence becomes
 * part of the authored lineage rather than temporary textarea state.
 *
 * ── ⛔ WHAT THIS DELIBERATELY DOES NOT DO ─────────────────────────────────
 *
 * ⛔⛔ IT CREATES NO `ask_turn`. A formulation authored in a composer is
 * ALREADY its own semantic act. Manufacturing a chat turn so that every version
 * carries a binding would invent something the writer never said:
 *
 *     member discourse    → ask_turn
 *     member Direction    → ask_turn + Direction + binding
 *     member formulation  → ProposalVersion            ⭐ and nothing else
 *
 * Turn bindings stay what they are — an optional relationship fact for versions
 * actually authored THROUGH a turn.
 *
 * ⛔ IT TAKES NO `chainId`. The browser knows the thread; the chain is DERIVED
 * from the frozen `ask_threads ↔ proposal_chain` relationship. That is a
 * derivation of an existing durable fact, ⛔ never a second locus decision.
 *
 * ⛔ IT TAKES NO `author`. Server-fixed to `member`, because a caller able to
 * name an author could author MAIA's side of the exchange.
 *
 * ⭐⭐ AND `supersedes` CROSSES THIS BOUNDARY UNCHANGED. It is the exact
 * formulation the writer acted against, carried from their click. ⛔ No head
 * lookup, ⛔ no substitution, ⛔ no retry — `appendAuthoredVersion`'s own
 * 2026-09-14 merge blocker was precisely that lock acquisition must not invent
 * history, and a seam that resolved a stale predecessor for the writer would
 * reintroduce it one layer up.
 */

import { query } from '@/lib/db/postgres';
import { appendAuthoredVersion, type AppendRefusal } from '../proposalChain/store';
import type { ProposalVersion } from '../proposalChain/contract';
import type { VerifiedIdentity } from './turn';

export interface MemberVersionInput {
  readonly identity: VerifiedIdentity;
  /** ⭐ The thread. ⛔ Never the chain — see the header. */
  readonly threadId: string;
  /**
   * ⭐⭐ EXACTLY WHAT THE WRITER ACTED AGAINST. `null` only when they mean this
   * to be the chain's root.
   */
  readonly supersedes: string | null;
  /**
   * ⭐ EXACTLY WHAT THE WRITER WROTE. ⛔ No trim, no normalization, and ⛔ no
   * truthiness check: `''` is a lawful candidate formulation — a writer may
   * mean *this passage should not be here* — and it changes nothing until
   * adoption, which is closed.
   */
  readonly replacementText: string;
  readonly purpose?: string;
}

export type MemberVersionRefusal =
  | 'thread_not_found'
  | 'not_editorial'
  | AppendRefusal;

export type MemberVersionResult =
  | { readonly ok: true; readonly version: ProposalVersion }
  | { readonly ok: false; readonly reason: MemberVersionRefusal };

export async function appendMemberEditorialVersion(
  input: MemberVersionInput,
): Promise<MemberVersionResult> {
  const memberId = input.identity.memberId;

  /* ⭐ THE CHAIN, DERIVED FROM AN OWNED EDITORIAL THREAD — and the ownership is
     in the SQL, so an unknown thread and another member's thread are one
     answer. ⛔ The caller never names it. */
  const t = await query<{ proposal_chain_id: string | null }>(
    `SELECT proposal_chain_id FROM ask_threads WHERE id = $1 AND member_id = $2`,
    [input.threadId, memberId]);
  if (t.rows.length === 0) return { ok: false, reason: 'thread_not_found' };
  const chainId = t.rows[0]!.proposal_chain_id;
  if (chainId === null) return { ok: false, reason: 'not_editorial' };

  /* The writer may state an editorial purpose. Absent intent stays absent. */
  const appended = await appendAuthoredVersion(memberId, chainId, {
    author: 'member',
    supersedes: input.supersedes,
    replacementText: input.replacementText,
    ...(input.purpose?.trim() ? { rationale: 'Editorial purpose: ' + input.purpose.trim() } : {}),
  });

  return appended.outcome === 'appended'
    ? { ok: true, version: appended.version }
    : { ok: false, reason: appended.reason };
}
