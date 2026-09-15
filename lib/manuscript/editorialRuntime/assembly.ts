/**
 * WS-EDITORIAL-RUNTIME-01 · ER-R2 — EDITORIAL COGNITION ASSEMBLY. READ ONLY.
 *
 * ⭐⭐ WHAT MAIA IS GIVEN TO THINK WITH, AND NOTHING ELSE:
 *
 *     owned editorial thread → proposal_chain_id → readProposalWork()
 *       + ask_turns + Insights + Directions + TurnBindings
 *       → editorialCandidates() → EditorialCandidateBlock[]
 *
 * ⛔ THIS MODULE WRITES NOTHING. It is the read half of the turn.
 *
 * ── THREE LOAD-BEARING POINTS ─────────────────────────────────────────────
 *
 * 1 ⛔ NOT RAW `readChain()`. `readProposalWork()` is the reviewed owner of
 *     read → validateChain → lineage. Raw `readChain` returns versions
 *     deterministically BY ID for presentation and explicitly does NOT
 *     establish structural succession; feeding it to cognition would hand MAIA
 *     an order nobody authored.
 *
 * 2 ⛔⛔ THE CURRENT UTTERANCE IS NOT HISTORY. ER-R1 persists the member's turn
 *     BEFORE cognition, so a naive `loadThread()` now returns the very words
 *     that will also be `encounter.input`. History is therefore bounded
 *     STRICTLY BEFORE the current `turnIndex`, and if the current act declared a
 *     Direction, that Direction and its binding are excluded too. The current
 *     act's standing is already carried, exactly twice and no more:
 *
 *         encounter.input                the member's exact words
 *         member.writer_editorial_act    the DECLARED kind, and only that
 *
 * 3 ⛔ NO GENERIC ESCAPE HATCH. There is no `extraCandidates`, no
 *     `Record<string, unknown>` and no cast-based bypass. The output is exactly
 *     `EditorialCandidateBlock[]`, whose four producer ids are registered, so
 *     they enter MIPA as lawful candidates or not at all.
 */

import { query } from '@/lib/db/postgres';
import { readProposalWork } from '../proposalChain/proposalWork';
import {
  editorialCandidates,
  type EditorialCandidateBlock,
  type TurnRecord, type VersionRecord, type InsightRecord,
  type DirectionRecord, type TurnBinding, type MemberActKind,
} from '../editorialDiscourse/contract';

export interface EditorialAssemblyInput {
  readonly memberId: string;
  readonly threadId: string;
  /**
   * ⭐ The index of the turn being answered — the one ER-R1 just persisted.
   * ⛔ History is everything STRICTLY BEFORE it.
   */
  readonly currentTurnIndex: number;
  /** ⭐ The member-DECLARED kind of the act being performed right now. */
  readonly declaredAct: MemberActKind;
  /** The Direction this act just created, if it declared one. ⛔ Excluded from history. */
  readonly currentDirectionId: string | null;
}

export type AssemblyRefusal =
  | 'thread_not_found' | 'not_editorial'
  | 'chain_unknown' | 'chain_corrupt' | 'version_unknown';

export type EditorialAssemblyResult =
  | {
      readonly ok: true;
      readonly chainId: string;
      readonly blocks: readonly EditorialCandidateBlock[];
      /** ⭐ The predecessor MAIA is being invoked against. ER-R3 carries it forward. */
      readonly invokedAgainstVersionId: string | null;
    }
  | { readonly ok: false; readonly reason: AssemblyRefusal };

export async function assembleEditorialCognition(
  input: EditorialAssemblyInput,
): Promise<EditorialAssemblyResult> {
  const { memberId, threadId, currentTurnIndex, declaredAct, currentDirectionId } = input;

  /* ⭐ Ownership in the SQL predicate, exactly as the write path does it. */
  const t = await query<{ proposal_chain_id: string | null }>(
    `SELECT proposal_chain_id FROM ask_threads WHERE id = $1 AND member_id = $2`,
    [threadId, memberId]);
  if (t.rows.length === 0) return { ok: false, reason: 'thread_not_found' };
  const chainId = t.rows[0]!.proposal_chain_id;
  if (chainId === null) return { ok: false, reason: 'not_editorial' };

  /* ⛔ THE REVIEWED READ, never readChain. A corrupt succession REFUSES here. */
  const work = await readProposalWork(memberId, chainId);
  if (!work.ok) return { ok: false, reason: work.reason };

  /* ⭐ STRICTLY BEFORE. `<` and not `<=` is the whole of point 2. */
  const turnRows = await query<{ turn_index: number; speaker: string; body: string }>(
    `SELECT turn_index, speaker, body FROM ask_turns
      WHERE thread_id = $1 AND turn_index < $2
      ORDER BY turn_index`,
    [threadId, currentTurnIndex]);
  const turns: TurnRecord[] = turnRows.rows.map((r) => ({
    kind: 'turn', turnIndex: Number(r.turn_index),
    author: r.speaker === 'maia' ? 'maia' : 'member', body: r.body,
  }));

  const insightRows = await query<{ id: string; observation: string }>(
    `SELECT id, observation FROM proposal_chain_insights
      WHERE proposal_chain_id = $1 AND member_id = $2 ORDER BY id`,
    [chainId, memberId]);
  const insights: InsightRecord[] = insightRows.rows.map((r) => ({
    kind: 'insight', id: r.id, author: 'maia', observation: r.observation,
  }));

  /* ⛔ The Direction this very act created is EXCLUDED — it is `now`, not history. */
  const dirRows = await query<{ id: string; author: string; instruction: string; refers_to_version_id: string | null }>(
    `SELECT id, author, instruction, refers_to_version_id
       FROM proposal_chain_directions
      WHERE proposal_chain_id = $1 AND member_id = $2 AND ($3::uuid IS NULL OR id <> $3::uuid)
      ORDER BY id`,
    [chainId, memberId, currentDirectionId]);
  const directions: DirectionRecord[] = dirRows.rows.map((r) => ({
    kind: 'direction', id: r.id,
    author: r.author === 'maia' ? 'maia' : 'member',
    instruction: r.instruction, refersTo: r.refers_to_version_id,
  }));

  /* ⭐ SUCCESSION ORDER COMES FROM THE STEP-1 READ, never resolved here. */
  const versions: VersionRecord[] = work.work.versions.map((v) => ({
    kind: 'version', id: v.id, author: v.author,
    wording: v.replacementText, supersedes: v.supersedes,
  }));

  /* ⭐ Explicit relationships, never inferred — and bounded by the same rules:
     only turns already in history, and never the current act's own binding. */
  const bindRows = await query<{ turn_index: number; direction_id: string | null; version_id: string | null }>(
    `SELECT turn_index, direction_id, version_id FROM editorial_turn_bindings
      WHERE thread_id = $1 AND turn_index < $2 ORDER BY turn_index`,
    [threadId, currentTurnIndex]);
  const bindings: TurnBinding[] = bindRows.rows.flatMap<TurnBinding>((r) => {
    const turnIndex = Number(r.turn_index);
    if (r.direction_id) {
      /* ⛔ the current act's own binding is `now`, not history */
      if (currentDirectionId && r.direction_id === currentDirectionId) return [];
      return [{ kind: 'direction', turnIndex, directionId: r.direction_id }];
    }
    if (r.version_id) return [{ kind: 'version', turnIndex, versionId: r.version_id }];
    return [];
  });

  const participation = editorialCandidates({
    locus: { chainId, originalText: work.work.chain.locus.expectedText },
    turns, versions, insights, directions, bindings, declaredAct,
  });
  /* ⛔ `versions_not_structural` cannot occur here — the order came from
     `readProposalWork`, which refuses a corrupt chain before this point. It is
     mapped rather than ignored: a refusal the caller cannot see is a refusal
     that stops being a refusal. */
  if (!participation.ok) return { ok: false, reason: 'chain_corrupt' };

  return {
    ok: true, chainId,
    blocks: participation.blocks,
    invokedAgainstVersionId: work.work.focused?.id ?? null,
  };
}

/**
 * ⛔⛔ THERE IS NO `extraCandidates`, NO `Record<string, unknown>` CHANNEL AND NO
 * CAST IN THIS MODULE. A generic context parameter on the Writer path would be
 * an ungoverned producer channel — material reaching MAIA without a registered
 * producer to answer for it.
 */
