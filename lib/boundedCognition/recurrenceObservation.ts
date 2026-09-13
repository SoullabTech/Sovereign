/**
 * BCS-01A · Step 10 — the one new cognitive artifact.
 *
 * ⛔ NO DISCOVERY. Occurrence locations are fixture inputs; nothing here detects them.
 * ⛔ NO MODEL CALL. ⛔ NO PRODUCER REGISTRATION. ⛔ NO PATH TO MAIA — this module
 * imports the Step-3 admission law and the Step-7 store, and nothing from the
 * renderer, prompt assembler, canonical-turn constructor or any served-turn route.
 *
 * WHY THE COVERAGE CONSTRUCTOR LIVES HERE and not in the durable execution store:
 * coverage is claim-scoped. It becomes lawful only when there is a specific claim for
 * it to qualify — which exists here and nowhere else in the lane.
 */

import type { PoolClient } from 'pg';
import { admitRecurrence, type ClaimExtent, type RecurrenceVerdict } from './recurrenceAdmission';
import type { DevelopmentalCoverage } from '../manuscript/development/readState';

/**
 * One explicit evidentiary use: this frozen lineage item is offered as evidence for
 * this candidate. `occurrence` says the candidate asserts the repeated element occurs
 * in that covered unit.
 */
export interface EvidentiaryUse {
  readonly partitionId: string;
  readonly sectionId: string;
  readonly occurrence: boolean;
}

/**
 * Claim-specific coverage — the third narrowing of the M8 prohibition.
 *
 * LAWFUL      candidate + its selected evidentiary uses  → DevelopmentalCoverage
 * PROHIBITED  an executionId / checkpoint list / all lineage → DevelopmentalCoverage
 *
 * The signature is the guard: there is no parameter through which "everything this
 * execution touched" could arrive, so the automatic derivation is unwritable here.
 */
export function buildRecurrenceClaimCoverage(
  uses: readonly EvidentiaryUse[],
): DevelopmentalCoverage {
  return { sections: Object.fromEntries(uses.map((u) => [u.sectionId, 'body' as const])) };
}

/** The durable artifact, discriminated by what it IS. */
export interface RecurrenceObservationMaterial {
  readonly materialKind: 'recurrence_observation';
  readonly id: string;
  readonly claimText: string;
  readonly claimExtent: ClaimExtent;
  readonly evidence: readonly EvidentiaryUse[];
}

/**
 * F-J2.3: classification inspects the durable material ONLY. There is no parameter
 * for worker, execution mechanism, queue, model or job type — so a classification
 * that varied with machinery is not expressible, not merely discouraged.
 */
export function classifyObservationMaterial(
  material: Pick<RecurrenceObservationMaterial, 'materialKind'>,
): 'recurrence_observation' {
  return material.materialKind;
}

export type ObservationResult =
  | { ok: true; observation: RecurrenceObservationMaterial }
  | { ok: false; verdict: Exclude<RecurrenceVerdict, 'ADMISSIBLE'> }
  | { ok: false; refusal: 'evidence_not_in_execution' | 'execution_not_found' };

/**
 * Candidate → claim coverage → Step-3 admission → durable observation + evidence,
 * atomically.
 *
 * ⛔ There is no exported `insertObservation()` bypassing admission or evidence: this
 * is the only path, and a refusal persists ZERO observation rows and ZERO evidence
 * rows. No provisional, pending or partial observation exists (Step-3 ruling).
 */
export async function recordRecurrenceObservation(
  client: PoolClient,
  executionId: string,
  claimText: string,
  claimExtent: ClaimExtent,
  uses: readonly EvidentiaryUse[],
): Promise<ObservationResult> {
  try {
    await client.query('BEGIN');

    const scope = await client.query<{ body_scope_section_ids: string[] }>(
      `SELECT m.body_scope_section_ids
         FROM recurrence_sweep_executions e
         JOIN recurrence_sweep_commissions m ON m.id = e.commission_id
        WHERE e.id = $1`,
      [executionId],
    );
    if (!scope.rows[0]) {
      await client.query('ROLLBACK');
      return { ok: false, refusal: 'execution_not_found' };
    }

    // Every cited use must name frozen lineage belonging to THIS execution. An
    // observation cannot rest on material whose acquisition is unrecoverable.
    for (const u of uses) {
      const owned = await client.query(
        `SELECT 1 FROM recurrence_sweep_checkpoint_inputs i
           JOIN recurrence_sweep_partitions p ON p.id = i.partition_id
          WHERE i.partition_id = $1 AND p.execution_id = $2 AND p.section_id = $3`,
        [u.partitionId, executionId, u.sectionId],
      );
      if (owned.rowCount === 0) {
        await client.query('ROLLBACK');
        return { ok: false, refusal: 'evidence_not_in_execution' };
      }
    }

    const verdict = admitRecurrence({
      commissionedScope: scope.rows[0].body_scope_section_ids,
      coverage: buildRecurrenceClaimCoverage(uses),
      occurrences: uses.filter((u) => u.occurrence).map((u) => ({ sectionId: u.sectionId })),
      extent: claimExtent,
    });
    if (verdict.verdict !== 'ADMISSIBLE') {
      await client.query('ROLLBACK');
      return { ok: false, verdict: verdict.verdict };
    }

    const obs = await client.query<{ id: string }>(
      `INSERT INTO recurrence_sweep_observations (execution_id, claim_text, claim_extent)
       VALUES ($1,$2,$3) RETURNING id`,
      [executionId, claimText, claimExtent],
    );
    for (const u of uses) {
      await client.query(
        `INSERT INTO recurrence_sweep_observation_evidence (observation_id, partition_id, occurrence)
         VALUES ($1,$2,$3)`,
        [obs.rows[0].id, u.partitionId, u.occurrence],
      );
    }

    await client.query('COMMIT');
    return {
      ok: true,
      observation: {
        materialKind: 'recurrence_observation',
        id: obs.rows[0].id,
        claimText,
        claimExtent,
        evidence: uses,
      },
    };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  }
}
