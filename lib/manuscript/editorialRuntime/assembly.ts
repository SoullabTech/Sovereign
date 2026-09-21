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
import { surroundOf } from '../editorialScope/surround';
import { loadProjectedSectionBody } from '../ask/workContext';
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
      /**
       * ⭐⭐ THE AUTHOR'S EXACT WORDS UNDER THE LOCUS — the only text a proposal
       * may replace, and therefore the only text a proposal may be MEASURED
       * against (WS-EDITORIAL-SCOPE-01).
       *
       * ⛔ IT IS RETURNED, NOT RE-READ LATER. The scope law must judge the
       * proposal against the words MAIA was actually shown. A second read after
       * the answer comes back could measure against a passage she never saw —
       * the same defect class as rebasing her proposal onto a newer version,
       * arriving through the measurement instead of the write.
       */
      readonly locusText: string;
      /**
       * ⭐ The writer's own nearby prose, as a VOCABULARY SAMPLE for the voice
       * measurement (WS-EDITORIAL-SCOPE-01 · voice).
       *
       * ⛔ It is the surround, which was loaded anyway — no second read. ⚠️ And
       * it is BOUNDED: a word the writer used in chapter one and nowhere near
       * here is unknown to this sample. That limit travels with the result as
       * `sampleWords` rather than being hidden.
       */
      readonly authorSample: string;
      /**
       * ⭐ Has MAIA already answered in this thread? (sequence gate.)
       * ⛔ Not "are there any turns" — the member's own current act is not an
       * exchange, and reading it as one would release the gate on turn one.
       */
      readonly hasPriorMaiaTurn: boolean;
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

  /* ⭐⭐ THE SURROUND — the writer's section around the passage, as CONTEXT.
   *
   * ⛔ THE PROJECTED BODY, never `manuscript_draft_sections.text` directly:
   * the stored column carries the heading prefix and reading it raw shifts
   * every offset by the heading's length, silently, and only for sections that
   * have one. `loadProjectedSectionBody` is the one projection authority.
   *
   * ⭐ A failed read is an ABSENT surround, never a refused turn. Context is
   * genuinely optional — the passage is the subject and it is already in hand.
   * ⛔ But it is never SUBSTITUTED for: no fallback to the raw column, no
   * neighbouring section, no "close enough" locate. */
  const locus = work.work.chain.locus;
  const projected = await loadProjectedSectionBody(
    locus.workId, memberId, locus.targetSectionId);
  const surround = projected
    ? surroundOf(projected.body, locus.expectedText) : null;

  const participation = editorialCandidates({
    locus: { chainId, originalText: locus.expectedText },
    surround,
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
    /* ⭐ THE SAME VALUE THE LOCUS BLOCK CARRIED INTO COGNITION, from the same
       read. ⛔ Not a second lookup that could disagree with it. */
    locusText: locus.expectedText,
    authorSample: surround ? `${surround.before}\n${surround.after}` : '',
    /* ⭐ From the history already read — strictly before the current turn. */
    hasPriorMaiaTurn: turns.some((t) => t.author === 'maia'),
  };
}

/**
 * ⛔⛔ THERE IS NO `extraCandidates`, NO `Record<string, unknown>` CHANNEL AND NO
 * CAST IN THIS MODULE. A generic context parameter on the Writer path would be
 * an ungoverned producer channel — material reaching MAIA without a registered
 * producer to answer for it.
 */
