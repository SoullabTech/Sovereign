/**
 * W5-4 — THE EDITORIAL RECORD STORE SEAM.
 *
 * ⭐⭐ THE GOVERNING SENTENCE (founder, 2026-09-14):
 *
 *     Opening an editorial relationship and recording the first thing MAIA
 *     actually saw must be ONE DURABLE ACT; failure may leave neither half
 *     pretending the other happened.
 *
 * Durable persistence for the two objects W5-1 ratified and W5-3 gave tables:
 * the MAIA-authored **Insight**, and the **Direction** either party may author.
 * ⛔ Neither is authorizable content. Only a `ProposalVersion` can ever become
 * manuscript text, and nothing in this file creates one.
 *
 * ── ⛔ WHAT THIS ACT IS NOT ────────────────────────────────────────────────
 *
 * ⛔ NO HTTP ROUTES. `POST /insights`, `POST /directions` and
 * `POST /editorial-chain` would raise questions this act has not earned: who
 * may speak as MAIA · what member gesture authors a Direction · what Work and
 * locus a request may bind · which canonical MAIA turn produced the record.
 * Those are W4 / runtime-orchestration questions. This gives them a lawful
 * persistence seam; it does not expose the seam to a browser.
 *
 * ⛔ NO `openThread()` CHANGE, no chain-bound discourse, no MAIA generation.
 * Establishing a *conversation* about a chain is a conversational act, not
 * persistence plumbing — W4, and not one act sooner.
 *
 * ⛔ NO CHRONOLOGY. There is no `latestInsight`, no `currentDirection`, no
 * `spent`, no answer state, and no cross-object editorial timeline. `authored_at`
 * is provenance and presentation metadata. W4 later EARNS relationships like
 * *Direction D answered by turn T*; ⛔ this file does not infer them from
 * timestamps. (The same trap `proposalChain/store.ts` names in its constraint 1
 * and inherits from `editorialDecision/store.ts`.)
 *
 * ── FAILURE STATES, kept apart exactly as the chain store already decided ──
 *
 *   database unavailable   ⭐ THROWS. No blanket `catch`. ⛔ A read that
 *                          answered an outage with `[]` would report *"MAIA
 *                          noticed nothing"* when the truth is *"we could not
 *                          ask"* — the shape of the open S3 `unreachable`
 *                          finding, and R3 exists to kill it.
 *   absent / foreign       the same outward answer as "nothing here".
 *   a rule refused         a typed union, never an exception.
 */

import { query, transaction } from '@/lib/db/postgres';
import {
  openChainWithExecutor, type OpenChainInput, type SqlExecutor,
} from '../proposalChain/store';
import type { ProposalChain } from '../proposalChain/contract';
import type { EditorialDirection, EditorialInsight } from './ontology';

/* ══════════════════════════════════════════════════════════════════════════
   ROWS AND HYDRATION
   ══════════════════════════════════════════════════════════════════════════ */

interface InsightRow {
  id: string; proposal_chain_id: string; author: 'maia';
  observation: string; authored_at: Date;
}
interface DirectionRow {
  id: string; proposal_chain_id: string; author: 'maia' | 'member';
  instruction: string; refers_to_version_id: string | null; authored_at: Date;
}

const INSIGHT_COLUMNS =
  'id, proposal_chain_id, author, observation, authored_at';
const DIRECTION_COLUMNS =
  'id, proposal_chain_id, author, instruction, refers_to_version_id, authored_at';

const hydrateInsight = (r: InsightRow): EditorialInsight => ({
  /* ⭐ The contract's brand. It is CONTRACT EVIDENCE that this object is not
     authorizable content — ⛔ never the authorization membrane itself, which is
     the persistence separation: there is no wording column to authorize. */
  __notAuthorizable: true,
  id: r.id,
  chainId: r.proposal_chain_id,
  author: r.author,
  observation: r.observation,
  authoredAt: r.authored_at.toISOString(),
});

const hydrateDirection = (r: DirectionRow): EditorialDirection => ({
  __notAuthorizable: true,
  id: r.id,
  chainId: r.proposal_chain_id,
  author: r.author,
  instruction: r.instruction,
  /* ⛔ A CONVERSATIONAL REFERENCE, READ VERBATIM. `refersTo` is NEVER renamed,
     promoted or copied into `supersedes`: a candidate carries whichever
     predecessor its AUTHOR acted against, and the chain store decides whether
     that is still lawful. */
  refersTo: r.refers_to_version_id,
  authoredAt: r.authored_at.toISOString(),
});

/* ══════════════════════════════════════════════════════════════════════════
   REFUSALS
   ══════════════════════════════════════════════════════════════════════════ */

export type EditorialRecordRefusal =
  /**
   * ⛔ Unknown OR another member's — deliberately indistinguishable, the same
   * collapse `readChain` makes and for the same reason: distinguishable
   * refusals let a caller enumerate other members' chains by their shapes.
   */
  | 'chain_unknown'
  /**
   * ⭐ The referenced version is not in this chain. ⛔ A REFUSAL, never a
   * substitution: nothing here picks a nearby version the author did not name.
   */
  | 'reference_not_in_chain';

export type InsightResult =
  | { readonly ok: true; readonly insight: EditorialInsight }
  | { readonly ok: false; readonly reason: EditorialRecordRefusal };

export type DirectionResult =
  | { readonly ok: true; readonly direction: EditorialDirection }
  | { readonly ok: false; readonly reason: EditorialRecordRefusal };

/**
 * ⭐⭐ THE FOREIGN-KEY VIOLATION IS THE AUTHORITY, NOT A PRECHECK.
 *
 * ⛔ THE CIRCLES FR-18 LESSON, APPLIED. A `SELECT … WHERE member_id = $1`
 * followed by an unconditional INSERT is two facts with a gap between them; the
 * guard has to live IN the mutation. Here the composite FK
 * `(member_id, proposal_chain_id) → proposal_chains (member_id, id)` already
 * proves ownership *at write time*, so a foreign or absent chain cannot be
 * written at all — and the refusal is read off the constraint that refused it.
 *
 * ⛔ AND ONLY `23503`. Every other error RETHROWS: unavailability is not a
 * domain refusal. The constraint NAME separates the two composite keys, so a
 * chain-ownership failure is never reported as a bad version reference or the
 * reverse.
 */
function refusalFor(e: unknown): EditorialRecordRefusal | null {
  const err = e as { code?: string; constraint?: string };
  if (err.code !== '23503') return null;
  if (err.constraint === 'proposal_chain_directions_version_fkey') {
    return 'reference_not_in_chain';
  }
  return 'chain_unknown';
}

/* ══════════════════════════════════════════════════════════════════════════
   INSIGHT — MAIA noticed something. ⛔ She did not necessarily propose a change.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * ⭐ THE ONE INSIGHT INSERT, executor-aware for the same reason the chain
 * insert is: `openChainWithInsight` needs it inside a transaction, and writing
 * it twice is two places for `author = 'maia'` to drift.
 */
async function insertInsight(
  exec: SqlExecutor, memberId: string, chainId: string, observation: string,
): Promise<EditorialInsight> {
  const r = await exec.query<InsightRow>(
    `INSERT INTO proposal_chain_insights
       (member_id, proposal_chain_id, author, observation)
     VALUES ($1, $2, 'maia', $3)
     RETURNING ${INSIGHT_COLUMNS}`,
    [memberId, chainId, observation]);
  return hydrateInsight(r.rows[0]);
}

/**
 * Record one MAIA-authored observation on a member-owned chain.
 *
 * ⭐⭐ THE CALLER SUPPLIES THE OBSERVATION AND NOTHING ELSE THAT MATTERS.
 * `author` is fixed here, not accepted: an argument a caller could set is an
 * argument a future HTTP route would faithfully forward, and
 * `POST { author: 'maia' }` is the browser speaking in MAIA's voice. Identity
 * and time are minted by the database. ⛔ There is no `version`, no
 * `replacementText` and no way to reach one — an Insight that could carry
 * wording would be a Suggestion under another name.
 */
export async function createInsight(
  memberId: string, chainId: string, observation: string,
): Promise<InsightResult> {
  try {
    return { ok: true, insight: await insertInsight({ query }, memberId, chainId, observation) };
  } catch (e) {
    const reason = refusalFor(e);
    if (reason) return { ok: false, reason };
    throw e;
  }
}

/**
 * Every Insight on one member-owned chain.
 *
 * ⛔ THERE IS NO "CURRENT" INSIGHT, in any spelling — no `latestInsight`, no
 * `activeInsight`, no `currentInsight`. No structural law makes one observation
 * supersede another: MAIA noticing a second thing does not withdraw the first.
 *
 * ⚠️ THE `ORDER BY` IS PRESENTATION ONLY — deterministic for tests and diffs,
 * and meaning nothing. ⛔ It is `id` and NOT `authored_at`, deliberately:
 * ordering an authored record by its timestamp is the exact inference
 * `proposalChain/store.ts` constraint 1 forbids, and the nearest column is
 * always the most tempting way to commit it.
 */
export async function readInsights(
  memberId: string, chainId: string,
): Promise<readonly EditorialInsight[]> {
  /* ⭐ member_id IN THE PREDICATE. Ownership is established before any row is
     returned — ⛔ never a filter applied after another member's rows came back. */
  const r = await query<InsightRow>(
    `SELECT ${INSIGHT_COLUMNS} FROM proposal_chain_insights
      WHERE proposal_chain_id = $1 AND member_id = $2
      ORDER BY id`, [chainId, memberId]);
  return r.rows.map(hydrateInsight);
}

/* ══════════════════════════════════════════════════════════════════════════
   DIRECTION — an instruction steering the exchange. ⛔ Never a ruling.
   ══════════════════════════════════════════════════════════════════════════ */

export interface DirectionInput {
  readonly instruction: string;
  /**
   * ⭐ An earlier formulation this instruction is ABOUT, if any.
   * ⛔⛔ A REFERENCE, NEVER A SUCCESSION. The database proves it belongs to this
   * chain; the runtime must not convert that proof into `supersedes`.
   */
  readonly refersTo: string | null;
}

/**
 * ⭐⭐ TWO FUNCTIONS, NOT ONE WITH AN `author` PARAMETER.
 *
 * ⛔ A single `createDirection(…, author)` is browser-friendly in exactly the
 * wrong way: it is one forwarding line away from `POST { author: 'maia' }`,
 * and authorship would then be whatever the request said it was. Splitting the
 * seam keeps authorship authority where it can be reasoned about — at the
 * server function a future route must CHOOSE to call, rather than in a field it
 * merely passes along.
 */
/**
 * ⭐⭐ ONE INSERT, EXECUTOR-SUPPLIED. There is no second Direction INSERT
 * anywhere, and adding one would be the defect: two statements that must agree
 * is the shape drift arrives in.
 *
 * ⛔ THE EXECUTOR SUPPLIES ATOMICITY, NEVER AUTHORITY. Authorship is still fixed
 * here by the two public seams below, never accepted as a field.
 *
 * ⚠️ ER-R1 FOUND THIS: the pool-level `query` cannot join a caller's
 * transaction, so an atomic member act built from the old signature would have
 * written the turn inside the transaction and the Direction outside it — and
 * ER-F7 would have been FALSE while reading green, because the turn alone would
 * survive a Direction refusal.
 */
async function insertDirection(
  exec: SqlExecutor, memberId: string, chainId: string,
  author: 'maia' | 'member', input: DirectionInput,
): Promise<DirectionResult> {
  try {
    const r = await exec.query<DirectionRow>(
      `INSERT INTO proposal_chain_directions
         (member_id, proposal_chain_id, author, instruction, refers_to_version_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${DIRECTION_COLUMNS}`,
      [memberId, chainId, author, input.instruction, input.refersTo]);
    return { ok: true, direction: hydrateDirection(r.rows[0]) };
  } catch (e) {
    const reason = refusalFor(e);
    if (reason) return { ok: false, reason };
    throw e;
  }
}

/**
 * The writer steers, INSIDE a caller's transaction.
 *
 * ⭐ The whole reason it exists: the member's turn, their Direction and the
 * turn↔act binding are ONE AUTHORED ACT, and the database must remember all of
 * it or none of it.
 */
export async function createMemberDirectionWithExecutor(
  exec: SqlExecutor, memberId: string, chainId: string, input: DirectionInput,
): Promise<DirectionResult> {
  return insertDirection(exec, memberId, chainId, 'member', input);
}

/** The writer steers: *"Go back to what V1 was doing."* */
export async function createMemberDirection(
  memberId: string, chainId: string, input: DirectionInput,
): Promise<DirectionResult> {
  return insertDirection({ query }, memberId, chainId, 'member', input);
}

/**
 * MAIA steers, INSIDE a caller's transaction — ER-R3.
 *
 * ⭐ Added now that the act needing it exists, and not before: MAIA's turn, her
 * Direction and the binding are one durable act.
 */
export async function createMaiaDirectionWithExecutor(
  exec: SqlExecutor, memberId: string, chainId: string, input: DirectionInput,
): Promise<DirectionResult> {
  return insertDirection(exec, memberId, chainId, 'maia', input);
}

/** MAIA steers: *"Let me try the shorter form before we commit."* */
export async function createMaiaDirection(
  memberId: string, chainId: string, input: DirectionInput,
): Promise<DirectionResult> {
  return insertDirection({ query }, memberId, chainId, 'maia', input);
}

/**
 * Every Direction on one member-owned chain.
 *
 * ⛔ No `currentDirection`. ⛔ No `spent`, `answered` or `open` state — whether
 * an instruction was answered is a relationship between a Direction and a
 * canonical MAIA turn, and that relationship does not exist until W4 earns it.
 * ⚠️ `ORDER BY id`: presentation only, for the same reason as above.
 */
export async function readDirections(
  memberId: string, chainId: string,
): Promise<readonly EditorialDirection[]> {
  const r = await query<DirectionRow>(
    `SELECT ${DIRECTION_COLUMNS} FROM proposal_chain_directions
      WHERE proposal_chain_id = $1 AND member_id = $2
      ORDER BY id`, [chainId, memberId]);
  return r.rows.map(hydrateDirection);
}

/* ══════════════════════════════════════════════════════════════════════════
   ⭐⭐ THE ZERO-VERSION ACT — one chain, one observation, one commit.
   ══════════════════════════════════════════════════════════════════════════ */

export interface OpenedWithInsight {
  readonly chain: ProposalChain;
  readonly insight: EditorialInsight;
}

/**
 * Open an editorial relationship AND record the first thing MAIA saw, as one
 * durable act.
 *
 * ⭐⭐ THE REASON IT IS ONE ACT, stated as the failure it prevents:
 *
 *     chain INSERT succeeds
 *     Insight INSERT fails
 *             ↓
 *     the Canvas can later mount a durable "editorial relationship"
 *     for which nobody authored any editorial act
 *
 * W5-Z0 made a zero-version chain MOUNTABLE. That is exactly what makes a
 * half-written open dangerous rather than merely untidy: the room would show a
 * writer a relationship whose content nobody ever authored, and it would look
 * completely ordinary. ⛔ A plausible-looking partial truth is the thing this
 * programme keeps refusing.
 *
 * ⭐ THE CHAIN INSERT IS THE EXISTING ADAPTER'S, reached through
 * `openChainWithExecutor` with this transaction's client. ⛔ There is no second
 * `INSERT INTO proposal_chains` anywhere, and `openChain()`'s public semantics
 * are untouched.
 *
 * ⛔ AND THE INSIGHT FAILURE IS NOT CAUGHT. `transaction()` commits when the
 * callback returns and rolls back only when it throws, so a refusal returned
 * politely from here would COMMIT the orphan chain. The insert throws, the
 * transaction rolls back, and the caller sees the infrastructure failure it
 * actually is — ⛔ there is deliberately no `ok:false` path that could leave a
 * chain standing.
 *
 * ⛔ The chain is brand new, so its own composite FK cannot refuse: there is no
 * foreign-chain case to translate here, and inventing one would be a refusal
 * for a condition that cannot arise.
 */
export async function openChainWithInsight(
  memberId: string, input: OpenChainInput, observation: string,
): Promise<OpenedWithInsight> {
  return transaction(async (tx) => {
    const chain = await openChainWithExecutor(tx, memberId, input);
    const insight = await insertInsight(tx, memberId, chain.id, observation);
    return { chain, insight };
  });
}
