/**
 * W5-Z0 — THE CHAIN-LEVEL EDITORIAL SUBJECT, RESOLVED BY THE SERVER.
 *
 * ⭐⭐ THE RULING (founder, 2026-09-14):
 *
 *     The Editorial Workspace subject is the PROPOSAL CHAIN.
 *     A ProposalVersion is an OPTIONAL EXACT FOCUS within that subject.
 *
 * W3 collapsed the two because every editorial object then carried a
 * formulation. W5's ontology falsified that assumption: an Insight belongs to a
 * chain, not to a version, and *"MAIA noticed this and recommends changing
 * nothing"* has to be expressible. A room that can only be entered by naming
 * candidate wording cannot hold it.
 *
 * ── ⛔ WHAT CHAIN-ONLY MUST NEVER BECOME ───────────────────────────────────
 *
 *     chain-only  ≠  "show me the head"
 *
 * `readProposalWork()` defaults an omitted focus to the head. That default is a
 * READING convenience and the writing room must not inherit it — CUTOVER-01A
 * exists so the room always knows WHICH authored formulation it is displaying,
 * and a chain-only mount that silently seated the newest version would undo it
 * in a new vocabulary. ⛔ So this file never reads `focused`, and the source
 * gate in the W5-Z0 witness pins that absence.
 *
 * ⭐ Chain-only is therefore lawful for exactly ONE shape of chain: one that
 * holds NO versions at all, where there is nothing to default TO and nothing
 * the writer could be shown instead of what they asked for.
 *
 * ── ⭐ AND IT IS STILL BOUND TO THIS WORK ──────────────────────────────────
 *
 * The 01A.1 binding is not weakened by dropping the version. A chain authored
 * against manuscript Y must not become the editorial subject of a room showing
 * manuscript X merely because both belong to the same writer — and here there
 * is no location read to produce a plausible-looking `section_unreadable`, so
 * an unbound version of this function would be SILENTLY correct-looking. The
 * Work binding is checked explicitly, before the subject exists.
 */

import { readProposalWork, type ProposalWorkRefusal } from './proposalWork';

export type EditorialSubjectRefusal =
  | ProposalWorkRefusal
  /** ⭐ The chain is not about the Work this room is showing. */
  | 'wrong_work'
  /**
   * ⭐⭐ THE CHAIN HOLDS VERSIONS AND THE VISIT NAMED NONE.
   *
   * ⛔ A REFUSAL, NOT A DEFAULT. This is the exact point where a head would
   * otherwise be chosen on the writer's behalf. Internally named so the
   * condition is legible; ⛔ at the HTTP boundary it is indistinguishable from
   * every other refusal, because telling a browser "that chain has versions"
   * would disclose a fact about a chain it may not own.
   */
  | 'version_required';

/** ⛔ `focusedVersionId` is null because NONE WAS NAMED and none exists. */
export interface ChainOnlySubject {
  readonly kind: 'chain';
  readonly chainId: string;
  readonly focusedVersionId: null;
}

export type ChainOnlySubjectResult =
  | { readonly ok: true; readonly subject: ChainOnlySubject }
  | { readonly ok: false; readonly reason: EditorialSubjectRefusal };

/**
 * Resolve `?proposalChain=C` (no version) into an editorial subject.
 *
 * The order is the ruling's order and each step is load-bearing:
 *
 *     same authenticated member?   `readChain` collapses absent / another
 *                                  member's into one refusal
 *     valid succession?            a chain whose rows do not form a chain is
 *                                  never silently rendered
 *     same Work as this Canvas?    the 01A.1 namespace binding
 *     zero versions?               ⛔ the head-default cut
 *
 * ⛔ `readProposalWork` is called WITHOUT a focus version — passing one would
 * make this a version read wearing a chain's name — and its `focused` field is
 * never read on any path.
 */
export async function readChainOnlySubject(
  memberId: string,
  expectedWorkId: string,
  chainId: string,
): Promise<ChainOnlySubjectResult> {
  const r = await readProposalWork(memberId, chainId);
  if (!r.ok) return { ok: false, reason: r.reason };

  /* ⛔ THE NAMESPACE BINDING, BEFORE ANY SUBJECT EXISTS. */
  if (r.work.chain.locus.workId !== expectedWorkId) {
    return { ok: false, reason: 'wrong_work' };
  }

  /* ⛔⭐ THE HEAD-DEFAULT CUT. A chain with versions and no named version has
     no lawful chain-only subject: the only way to produce one would be to pick
     a version the writer did not ask for. */
  if (r.work.versions.length > 0) return { ok: false, reason: 'version_required' };

  return {
    ok: true,
    subject: { kind: 'chain', chainId: r.work.chain.id, focusedVersionId: null },
  };
}
