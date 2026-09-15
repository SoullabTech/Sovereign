/**
 * PROPOSAL-SUCCESSION-STORE-01 — the contract ⇄ database adapter.
 *
 * ⭐⭐ THE ACCEPTANCE QUESTION, AND THE ONLY ONE:
 *
 *   Can the durable database round-trip the already-proven contract without
 *   ADDING, LOSING, SYNTHESIZING or REINTERPRETING any fact?
 *
 * ⛔ SO THIS MODULE DECIDES NOTHING ABOUT SUCCESSION. It moves rows across the
 * boundary and hands them to `./succession`, which was proved on its own.
 * Anything here that re-derived lineage, order or the head would be a SECOND
 * implementation of succession — behind a database, where it is harder to see
 * and harder to falsify.
 *
 * ── ⛔ THE THREE PINNED CONSTRAINTS ────────────────────────────────────────
 *
 *   1  ⛔⛔ ORDER IS NEVER INFERRED FROM `authored_at`.
 *      There is no `ORDER BY authored_at` used as succession anywhere in this
 *      file. `supersedes` owns order. The head is `headOf()`.
 *
 *      ⚠️ AND THE TRAP ARRIVES BY INHERITANCE, not by carelessness:
 *      `editorialDecision/store.ts` defines "current" as the highest
 *      `event_index`, which is right for an event LOG. Copying that shape here
 *      means ordering by the nearest column we have — which is `authored_at` —
 *      and that is precisely the forbidden thing. Census §6.1.
 *
 *   2  ⛔ MEMBER IDENTITY IS ENFORCED AT THIS BOUNDARY.
 *      Knowing a chain UUID is not enough. `member_id` is inside the SQL
 *      predicate of every statement, never a filter applied after another
 *      member's row came back. A foreign chain reads as `null` — byte-identical
 *      to one that does not exist, which is the established convention
 *      (`readProposal`, `currentDecision`) and the point of it.
 *
 *   3  ⛔ THE `decision_chain_id` EVENT AMBIGUITY IS NOT RESOLVED HERE.
 *      The column names the governing decision LINEAGE. It does not prove which
 *      decision EVENT was current when the chain opened, and an editorial chain
 *      acquires successor events. So nothing here converts
 *
 *          decision lineage → latest event → "the ruling that governed this"
 *
 *      That is a contract-level decision if it is ever needed. Not an inference
 *      made at a persistence boundary from a timestamp.
 *
 * ── FAILURE STATES, kept apart as the project already decided ──────────────
 *
 *   database unavailable   ⭐ THROWS. `query()` propagates; this file adds no
 *                          blanket catch. ⛔ The `catch { return
 *                          refuse('write_failed') }` of
 *                          `revisionProposal/store.ts:211` is deliberately NOT
 *                          copied — it converts unavailability into a domain
 *                          refusal, which is the shape of the open S3
 *                          `unreachable` finding.
 *   absent / foreign       `null`, indistinguishable.
 *   a rule refused         a typed union, never an exception.
 */

import { query, transaction } from '@/lib/db/postgres';
import type { QueryResult, QueryResultRow } from 'pg';
import {
  appendVersion, validateChain,
} from './succession';
import type {
  EditorialRulingRef, LocusIdentity, ProposalChain, ProposalVersion,
  SuccessionRefusal, VersionAuthor,
} from './contract';

/* ══════════════════════════════════════════════════════════════════════════
   ROWS AND HYDRATION — the only place a column becomes a field.
   ══════════════════════════════════════════════════════════════════════════ */

interface ChainRow {
  id: string; member_id: string; work_id: string; draft_id: string;
  base_version: number | string; target_section_id: string; expected_text: string;
  decision_chain_id: string | null; opened_at: Date;
}

interface VersionRow {
  id: string; chain_id: string; author: VersionAuthor; formulation: string;
  rationale: string | null; supersedes: string | null; authored_at: Date;
}

const CHAIN_COLUMNS = `id, member_id, work_id, draft_id, base_version,
                       target_section_id, expected_text, decision_chain_id, opened_at`;

const VERSION_COLUMNS = `id, chain_id, author, formulation, rationale,
                         supersedes, authored_at`;

const hydrateChain = (r: ChainRow): ProposalChain => ({
  id: r.id,
  memberId: r.member_id,
  locus: {
    workId: r.work_id,
    draftId: r.draft_id,
    /* ⛔ pg returns integer/numeric as a string on some drivers. */
    baseVersion: Number(r.base_version),
    targetSectionId: r.target_section_id,
    expectedText: r.expected_text,
  },
  /* ⭐ ABSENT STAYS ABSENT. A chain no ruling governs has no `governedBy` key
     at all — not a key holding `null`, which would be a third state the
     contract has no word for. And ⛔ it hydrates as the LINEAGE REFERENCE and
     nothing else (constraint 3). */
  ...(r.decision_chain_id !== null
    ? { governedBy: { decisionChainId: r.decision_chain_id } satisfies EditorialRulingRef }
    : {}),
  openedAt: r.opened_at.toISOString(),
});

const hydrateVersion = (r: VersionRow): ProposalVersion => ({
  id: r.id,
  chainId: r.chain_id,
  supersedes: r.supersedes,
  /* ⚠️ THE ONE DELIBERATE NAME DIFFERENCE: contract `replacementText` ⇄ column
     `formulation`. This line is the only place the two are reconciled.
     ⛔ Read verbatim and never spread-guarded: `''` is a LEGITIMATE value — a
     deletion is a formulation. */
  replacementText: r.formulation,
  /* ⭐⭐ `!== null`, NOT TRUTHINESS.
     The project idiom is `...(r.x ? { x: r.x } : {})`. Here that would also
     swallow `''` into absence. The two coincide TODAY only because of the
     `rationale IS NULL OR length(btrim(rationale)) > 0` CHECK — in a different
     file. ⛔ A hydrator whose correctness depends on something it does not
     state is depending on luck. Census §6.5. */
  ...(r.rationale !== null ? { rationale: r.rationale } : {}),
  author: r.author,
  authoredAt: r.authored_at.toISOString(),
});

/* ══════════════════════════════════════════════════════════════════════════
   REFUSALS
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * ⭐ THE STORE'S OWN REFUSALS, disjoint from `SuccessionRefusal`.
 *
 * ⛔ `chain_unknown` covers BOTH "no such chain" and "someone else's chain",
 * and that collapse is the protection, not a shortcut: a distinguishable
 * response would let a caller enumerate other members' chains by their refusal
 * shapes alone.
 */
export type StoreRefusal =
  | 'chain_unknown'
  /** The rows on disk do not form a valid chain. ⛔ Never repaired silently. */
  | 'chain_corrupt'
  /** Another append landed between the read and the write. ⛔ Never retried. */
  | 'simultaneous_append';

export type AppendRefusal = SuccessionRefusal | StoreRefusal;

export type AppendResult =
  | { readonly outcome: 'appended'; readonly version: ProposalVersion }
  | { readonly outcome: 'refused'; readonly reason: AppendRefusal };

/** A chain and every formulation in it. ⛔ Never only the head. */
export interface StoredChain {
  readonly chain: ProposalChain;
  readonly versions: readonly ProposalVersion[];
}

/* ══════════════════════════════════════════════════════════════════════════
   OPEN
   ══════════════════════════════════════════════════════════════════════════ */

export interface OpenChainInput {
  readonly locus: LocusIdentity;
  /** ⛔ The lineage reference, when one is known at open. Never set later. */
  readonly governedBy?: EditorialRulingRef;
}

/**
 * ⭐⭐ W5-4 · ANYTHING THAT CAN RUN ONE PARAMETERIZED STATEMENT — the pool, or
 * a single transaction's client. Structurally identical to `TransactionClient`
 * and deliberately NOT named after it: the pool is not a transaction.
 *
 * ⛔ IT EXISTS SO THERE IS EXACTLY ONE `INSERT INTO proposal_chains`. W5-4 must
 * open a chain and record MAIA's first observation as ONE durable act, which
 * needs the insert inside a caller's transaction — and the tempting way to get
 * that is to write the INSERT again in the editorial store. Two chain-insert
 * implementations is two places for the locus, the governing-ruling reference
 * and the minted identity to drift, behind a database, where it is hardest to
 * see. Census §6 is the same lesson about `readChain`.
 */
export interface SqlExecutor {
  query<T extends QueryResultRow = any>(
    sql: string, params?: any[]): Promise<QueryResult<T>>;
}

/**
 * The one chain INSERT. ⛔ Do not call this to "open a chain" — call
 * `openChain`, or `openChainWithInsight` when the chain and its first authored
 * editorial act must stand or fall together.
 */
export async function openChainWithExecutor(
  exec: SqlExecutor, memberId: string, input: OpenChainInput,
): Promise<ProposalChain> {
  const r = await exec.query<ChainRow>(
    `INSERT INTO proposal_chains
       (member_id, work_id, draft_id, base_version, target_section_id,
        expected_text, decision_chain_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING ${CHAIN_COLUMNS}`,
    [memberId, input.locus.workId, input.locus.draftId, input.locus.baseVersion,
      input.locus.targetSectionId, input.locus.expectedText,
      input.governedBy?.decisionChainId ?? null]);
  return hydrateChain(r.rows[0]);
}

/**
 * Open a chain against one locus.
 *
 * ⛔ THIS AUTHORIZES NOTHING AND CHANGES NO WORK. It records the exact
 * characters a future authorization would be permitted to replace, and the
 * state of the Work that claim was made against.
 *
 * ⭐ The server mints the identity, following the decision store: a client that
 * could manufacture a stable id could also collide with one.
 *
 * ⭐ W5-4 · ITS PUBLIC SEMANTICS ARE UNCHANGED — same arguments, same statement,
 * same hydration, same autocommit-per-call behaviour. Only the executor moved
 * behind a parameter so a transaction can supply its own.
 */
export async function openChain(
  memberId: string, input: OpenChainInput,
): Promise<ProposalChain> {
  return openChainWithExecutor({ query }, memberId, input);
}

/* ══════════════════════════════════════════════════════════════════════════
   READ
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * One member-owned chain and ALL of its versions.
 *
 * ⛔ NOT "the current version". `currentDecision`'s shape would return the head
 * and discard the intermediate formulations — which is the one thing this
 * substrate exists to preserve. Census §6.2.
 *
 * ⚠️ THE `ORDER BY` BELOW IS PRESENTATION ONLY, AND MUST STAY THAT WAY. It
 * makes the returned array deterministic for tests and diffs; it does NOT mean
 * anything about succession, and nothing downstream may read it as order.
 * `validateChain` and `headOf` work from `supersedes` on an unordered set — the
 * falsifier `timestamps do not determine lineage` proves exactly this by
 * storing contradictory timestamps.
 */
export async function readChain(
  memberId: string, chainId: string,
): Promise<StoredChain | null> {
  /* ⭐ member_id IN THE PREDICATE. A foreign chain returns zero rows here and
     is therefore reported as absent — the same `null` a missing chain gets. */
  const c = await query<ChainRow>(
    `SELECT ${CHAIN_COLUMNS} FROM proposal_chains
      WHERE id = $1 AND member_id = $2`, [chainId, memberId]);
  if (c.rows.length === 0) return null;

  const v = await query<VersionRow>(
    `SELECT ${VERSION_COLUMNS} FROM proposal_versions
      WHERE chain_id = $1
      ORDER BY id`, [chainId]);

  return {
    chain: hydrateChain(c.rows[0]),
    versions: v.rows.map(hydrateVersion),
  };
}

/* ══════════════════════════════════════════════════════════════════════════
   APPEND
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * ⛔⛔ THIS FILE DOES NOT COMPUTE THE HEAD. IT DOES NOT EVEN ASK FOR IT.
 *
 * ⚠️ TWO FOUNDER REVIEWS ON 2026-09-14 CLOSED THIS IN TWO STEPS, and the second
 * went further than the first:
 *
 *   1  A local head-id helper here reproduced the pure head algorithm inside
 *      the persistence layer, under a comment asserting it "duplicates no
 *      logic". It quite literally did. ⭐ The proof was in the falsifier —
 *      mutation `M2` could mutate that helper ALONE, which is only possible
 *      when there are TWO INDEPENDENTLY FALSIFIABLE ANSWERS to "what is the
 *      head?". Two implementations that happened to agree. Repaired by
 *      importing the pure one.
 *
 *   2  ⭐⭐ BUT IMPORTING IT WAS STILL WRONG, because the QUESTION did not
 *      belong here. A store that asks "what is the head?" in order to fill in
 *      `supersedes` is SYNTHESIZING a succession fact the author never stated.
 *      See `AppendInput.supersedes`.
 *
 * ⭐ SO THE STRONGEST FORM OF THE LANE'S LAW IS THE ABSENCE OF THE QUESTION:
 *
 *    authored act ── supersedes = v4 ──▶ adapter ──▶ appendVersion()
 *                                                       │
 *                              durable head still v4 ───┤ lawful
 *                              durable head now  v5 ────┘ not_successor_of_head
 *
 * The database may determine whether a successor relationship is still lawful.
 * ⛔ It must never determine what relationship the author meant.
 */

/** ⛔ Never persisted. The database mints the real id. */
const PROVISIONAL_ID = '00000000-0000-0000-0000-000000000000';

const refuse = (reason: AppendRefusal) => ({ outcome: 'refused' as const, reason });

export interface AppendInput {
  /**
   * ⭐⭐ WHAT THIS FORMULATION SUCCEEDS — STATED BY THE AUTHOR, never searched
   * for here. `null` only when the author means this to be the chain's root.
   *
   * ⛔ FOUNDER REVIEW, 2026-09-14, MERGE BLOCKER. An earlier cut had the store
   * synthesize this from the current head after taking the row lock, and that
   * let LOCK ACQUISITION INVENT HISTORY. Two acts both authored against `v4`:
   *
   *     A takes the lock · reads v4 · store writes A.supersedes = v4 · commit
   *     B takes the lock · reads v5 · store writes B.supersedes = A   · commit
   *
   * The durable record then says `v4 → A → B` — but B never revised A. B was
   * authored against v4, and the machine's scheduling decided otherwise.
   *
   * ⚠️ And `23505` never fired, because `FOR UPDATE` had already serialized the
   * two calls before they could compete for the successor slot. This file's own
   * comment said retrying would make machine scheduling the ordering authority
   * over two authored acts — while the synthesized predecessor made it so
   * anyway, on the ordinary path.
   *
   * ⭐ THE EXISTING SUCCESSION FACT IS THE CONCURRENCY TOKEN. No CAS object is
   * added — census §6.4 stands on that; what changes is that `supersedes`
   * CROSSES THIS BOUNDARY rather than being discovered behind it. A stale
   * authored successor is then refused by the pure `appendVersion` as
   * `not_successor_of_head`, a refusal that already existed.
   */
  readonly supersedes: string | null;
  readonly author: VersionAuthor;
  readonly replacementText: string;
  readonly rationale?: string;
}

/**
 * Append one authored formulation.
 *
 * ⭐⭐ THE PURE FUNCTION IS THE FIRST AUTHORITY AND THE DATABASE IS THE SECOND,
 * and neither is decorative:
 *
 *   1  lock the chain           FOR UPDATE · member_id in the predicate
 *   2  read every version       inside that lock
 *   3  validateChain            ⛔ corrupt rows REFUSE; they are never repaired
 *   4  appendVersion            ⭐ is the AUTHORED predecessor still the head?
 *   5  INSERT                   the one-successor index refuses a race loser
 *
 * ⛔ Step 4 is where a lesser adapter would ask the database "what is the
 * latest row". ⭐⭐ THIS ONE NEVER ASKS: the candidate's predecessor ARRIVES
 * from the author (`AppendInput.supersedes`), and `appendVersion` decides only
 * whether that stated relationship is still lawful — `not_successor_of_head`
 * when the chain moved underneath it.
 *
 * ⛔ AND THERE IS NO `unchanged` OUTCOME. Re-recording an identical ruling is
 * not a new decision in the editorial-decision lane; here, two identical
 * formulations by different authors are TWO FORMULATIONS. Census §6.3.
 */
/**
 * ⭐⭐ THE SAME APPEND, ON A CALLER-SUPPLIED EXECUTOR — ER-R3.
 *
 * It exists so MAIA's turn, her ProposalVersion and the turn↔act binding are
 * ONE durable act. ⛔ There is still exactly ONE implementation of the append;
 * the public seam below opens a transaction and calls this.
 *
 * ⛔⛔ THE EXECUTOR CHANGES ATOMICITY, NEVER AUTHORITY. Every step below is
 * untouched: the chain is locked `FOR UPDATE` with `member_id` in the
 * predicate, every version is read inside that lock, `validateChain` refuses
 * corrupt rows, and ⭐ `appendVersion` still decides ONLY whether the
 * AUTHOR-STATED predecessor is still the head. The reread judges the stated
 * predecessor; ⛔ it never chooses a different one.
 */
export async function appendAuthoredVersionWithExecutor(
  tx: SqlExecutor, memberId: string, chainId: string, input: AppendInput,
): Promise<AppendResult> {
  return (async () => {
    /* 1 · The chain, locked, proven to be this member's in the same statement. */
    const c = await tx.query<ChainRow>(
      `SELECT ${CHAIN_COLUMNS} FROM proposal_chains
        WHERE id = $1 AND member_id = $2 FOR UPDATE`, [chainId, memberId]);
    if (c.rows.length === 0) return refuse('chain_unknown');
    const chain = hydrateChain(c.rows[0]);

    /* 2 · Every version, inside the lock. */
    const v = await tx.query<VersionRow>(
      `SELECT ${VERSION_COLUMNS} FROM proposal_versions
        WHERE chain_id = $1 ORDER BY id`, [chainId]);
    const versions = v.rows.map(hydrateVersion);

    /* 3 · ⛔ WHAT IS ON DISK MUST BE A CHAIN. If it is not, refuse and say so —
       an adapter that quietly worked around corrupt succession would be
       manufacturing a history nobody authored. */
    const valid = validateChain(chain, versions);
    if (!valid.ok) return refuse('chain_corrupt');

    /* 4 · ⭐ SUCCESSION DECIDED BY THE PURE FUNCTION. The candidate carries a
       provisional id; the row's real id is minted by the database and the
       returned version is hydrated from what was actually written. */
    const provisional: ProposalVersion = {
      id: PROVISIONAL_ID,
      chainId: chain.id,
      supersedes: input.supersedes,
      replacementText: input.replacementText,
      ...(input.rationale !== undefined ? { rationale: input.rationale } : {}),
      author: input.author,
      authoredAt: new Date(0).toISOString(),
    };
    const lawful = appendVersion(chain, versions, provisional);
    if (!lawful.ok) return refuse(lawful.reason);

    /* 5 · The write. The composite FK, the one-successor index, the one-root
       index and the rationale CHECK are all still in front of it. */
    try {
      const ins = await tx.query<VersionRow>(
        `INSERT INTO proposal_versions (chain_id, author, formulation, rationale, supersedes)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING ${VERSION_COLUMNS}`,
        [chainId, input.author, input.replacementText,
          input.rationale ?? null, provisional.supersedes]);
      return { outcome: 'appended' as const, version: hydrateVersion(ins.rows[0]) };
    } catch (e) {
      /* ⛔ 23505 ONLY. Another append took this successor slot between the read
         and the write; the unique index refused the loser rather than letting
         one formulation overwrite another. ⛔ NO AUTOMATIC RETRY — retrying
         would make machine scheduling the ordering authority over two authored
         acts. Every other error RETHROWS: database unavailability is not a
         domain refusal. Census §6.6. */
      if ((e as { code?: string }).code === '23505') {
        return refuse('simultaneous_append');
      }
      throw e;
    }
  })();
}

/** The ordinary append, which opens its own transaction. Identical steps. */
export async function appendAuthoredVersion(
  memberId: string, chainId: string, input: AppendInput,
): Promise<AppendResult> {
  return transaction((tx) => appendAuthoredVersionWithExecutor(tx, memberId, chainId, input));
}
