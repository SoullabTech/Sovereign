/**
 * EDITORIAL-DECISION-01 — the store.
 *
 * ⭐ IT MIRRORS `manuscript/standing/store.ts` DELIBERATELY. That lane already
 * paid for append-only authority, successor-carried time, single-statement
 * index allocation, the expected-current test and the 23505 loser. A second
 * shape here would be a second thing to keep true, and the first divergence
 * would be invisible until it mattered.
 *
 * ⛔ WHAT THIS MODULE MUST NEVER DO: write a standing. Recording a decision and
 * taking a standing are two member acts. `ED-7` asserts it over this file, and
 * mutation `M2` reintroduces the coupling.
 */

import { query, transaction } from '@/lib/db/postgres';
import type {
  DecisionEvent, DecisionWriteResult, GovernedObservation, RecordDecisionRequest,
} from './contract';

interface EventRow {
  id: string; decision_chain_id: string; event_index: number; work_id: string;
  statement: string; intent: string | null; principle: string | null;
  authorship: DecisionEvent['authorship'];
  working_draft_id: string | null; working_draft_version: number | null;
  recorded_at: Date;
}

const hydrate = (r: EventRow, governs: readonly GovernedObservation[]): DecisionEvent => ({
  id: r.id, decisionChainId: r.decision_chain_id, eventIndex: Number(r.event_index),
  workId: r.work_id, statement: r.statement,
  ...(r.intent ? { intent: r.intent } : {}),
  ...(r.principle ? { principle: r.principle } : {}),
  governs, authorship: r.authorship,
  workingDraftId: r.working_draft_id,
  workingDraftVersion: r.working_draft_version === null ? null : Number(r.working_draft_version),
  recordedAt: r.recorded_at.toISOString(),
});

/**
 * ⭐⭐ D4 · OWNERSHIP AND RESOLUTION IN ONE PREDICATE — the standing lane's
 * precedent, widened by `manuscript_id`.
 *
 * A foreign key proves the reading EXISTS. It does not prove the observation
 * belongs to this member's copy of THIS Work. A decision for Work A that
 * governs a reading of Work B must refuse, and another member's reading must be
 * indistinguishable from one that does not exist — so both are asked in one
 * question and answered by one row.
 */
async function addressResolves(
  memberId: string, workId: string, g: GovernedObservation,
): Promise<'ok' | 'address_unresolved' | 'observation_unknown'> {
  const r = await query<{ resolves: boolean }>(
    `SELECT EXISTS (
              SELECT 1 FROM jsonb_array_elements(r.observations) o
               WHERE o->>'key' = $4
            ) AS resolves
       FROM developmental_readings r
      WHERE r.id = $1 AND r.member_id = $2 AND r.manuscript_id = $3
      LIMIT 1`,
    [g.readingId, memberId, workId, g.observationKey]);
  const row = r.rows[0];
  if (!row) return 'address_unresolved';
  return row.resolves ? 'ok' : 'observation_unknown';
}

const GOVERNS_SQL =
  `SELECT reading_id, observation_key
     FROM editorial_decision_event_observations
    WHERE decision_chain_id = $1 AND event_index = $2
    ORDER BY reading_id, observation_key`;

async function governedBy(chainId: string, eventIndex: number): Promise<GovernedObservation[]> {
  const r = await query<{ reading_id: string; observation_key: string }>(
    GOVERNS_SQL, [chainId, eventIndex]);
  return r.rows.map((x) => ({ readingId: x.reading_id, observationKey: x.observation_key }));
}

/** The current event of one chain, or null. ⭐ current = highest event_index. */
export async function currentDecision(
  memberId: string, chainId: string,
): Promise<DecisionEvent | null> {
  const r = await query<EventRow>(
    `SELECT id, decision_chain_id, event_index, work_id, statement, intent, principle,
            authorship, working_draft_id, working_draft_version, recorded_at
       FROM editorial_decision_events
      WHERE member_id = $1 AND decision_chain_id = $2
      ORDER BY event_index DESC
      LIMIT 1`, [memberId, chainId]);
  const row = r.rows[0];
  return row ? hydrate(row, await governedBy(chainId, Number(row.event_index))) : null;
}

/** Every chain's CURRENT event for one Work. ⛔ Never the whole history. */
export async function currentDecisions(
  memberId: string, workId: string,
): Promise<DecisionEvent[]> {
  const r = await query<EventRow>(
    `SELECT DISTINCT ON (decision_chain_id)
            id, decision_chain_id, event_index, work_id, statement, intent, principle,
            authorship, working_draft_id, working_draft_version, recorded_at
       FROM editorial_decision_events
      WHERE member_id = $1 AND work_id = $2
      ORDER BY decision_chain_id, event_index DESC`, [memberId, workId]);
  return Promise.all(r.rows.map(async (row) =>
    hydrate(row, await governedBy(row.decision_chain_id, Number(row.event_index)))));
}

/**
 * ⭐ THE HISTORY OF ONE RULING, oldest first. Continuity includes correction:
 * a revised ruling does not erase the one it supersedes.
 */
export async function decisionHistory(
  memberId: string, chainId: string,
): Promise<DecisionEvent[]> {
  const r = await query<EventRow>(
    `SELECT id, decision_chain_id, event_index, work_id, statement, intent, principle,
            authorship, working_draft_id, working_draft_version, recorded_at
       FROM editorial_decision_events
      WHERE member_id = $1 AND decision_chain_id = $2
      ORDER BY event_index ASC`, [memberId, chainId]);
  return Promise.all(r.rows.map(async (row) =>
    hydrate(row, await governedBy(chainId, Number(row.event_index)))));
}

/** Identical ruling AND identical scope ⇒ nothing new was decided. */
function sameAs(current: DecisionEvent, req: RecordDecisionRequest): boolean {
  if (current.statement !== req.body.statement) return false;
  if ((current.intent ?? null) !== (req.body.intent ?? null)) return false;
  if ((current.principle ?? null) !== (req.body.principle ?? null)) return false;
  const key = (g: GovernedObservation) => `${g.readingId}:${g.observationKey}`;
  const a = [...current.governs].map(key).sort();
  const b = [...req.governs].map(key).sort();
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

/**
 * Record an editorial decision.
 *
 * ⭐ THE EVENT AND ITS GOVERNED SET COMMIT TOGETHER OR NOT AT ALL. A torn write
 * would leave a ruling governing fewer places than the member said — the single
 * most misleading state this record could reach, and the same reasoning the
 * Focus act record already applies to its members.
 */
export async function recordEditorialDecision(
  memberId: string, workId: string, req: RecordDecisionRequest,
): Promise<DecisionWriteResult> {
  /* ⛔ D4 · every governed observation qualifies BEFORE anything is written. */
  for (const g of req.governs) {
    const address = await addressResolves(memberId, workId, g);
    if (address !== 'ok') return { outcome: 'refused', reason: address };
  }

  const existing = req.decisionChainId
    ? await currentDecision(memberId, req.decisionChainId)
    : null;
  if (req.decisionChainId && !existing) return { outcome: 'refused', reason: 'chain_unknown' };

  /* ⭐ STALENESS IS TESTED BEFORE SAMENESS, as the standing lane does: a caller
     holding a stale token must not be told "unchanged" and conclude their view
     was current. */
  if ((existing?.id ?? null) !== req.expectedCurrentEventId) {
    return { outcome: 'refused', reason: 'stale_expectation' };
  }
  if (existing && sameAs(existing, req)) return { outcome: 'unchanged', current: existing };

  /* ⛔ THE SERVER MINTS A NEW CHAIN'S IDENTITY. The member authors the decision;
     the server names the record. A client that could manufacture a stable id
     could also collide with one. */
  const chainId = req.decisionChainId ?? null;
  const nextIndex = existing ? existing.eventIndex + 1 : 0;

  try {
    const inserted = await transaction(async (tx) => {
      const ins = await tx.query<EventRow>(
        `INSERT INTO editorial_decision_events
           (decision_chain_id, event_index, member_id, work_id, statement, intent,
            principle, working_draft_id, working_draft_version, authorship)
         VALUES (coalesce($1::uuid, gen_random_uuid()), $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id, decision_chain_id, event_index, work_id, statement, intent,
                   principle, authorship, working_draft_id, working_draft_version, recorded_at`,
        [chainId, nextIndex, memberId, workId, req.body.statement,
          req.body.intent ?? null, req.body.principle ?? null,
          req.workingDraftId, req.workingDraftVersion, req.authorship]);
      const row = ins.rows[0];
      for (const g of req.governs) {
        await tx.query(
          `INSERT INTO editorial_decision_event_observations
             (decision_chain_id, event_index, reading_id, observation_key)
           VALUES ($1, $2, $3, $4)`,
          [row.decision_chain_id, nextIndex, g.readingId, g.observationKey]);
      }
      return row;
    });
    return { outcome: 'appended', event: hydrate(inserted, req.governs) };
  } catch (e) {
    /* 23505 — another act took this index between the snapshot and the write.
       The unique constraint refused the loser; it did not overwrite anyone. */
    if ((e as { code?: string }).code === '23505') {
      return { outcome: 'refused', reason: 'simultaneous_write' };
    }
    throw e;
  }
}
