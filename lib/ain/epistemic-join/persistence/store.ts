/**
 * JARVIS-KP-01 / I3 — append-only persistence adapter.
 *
 * This adapter can custody an already-evaluable epistemic join. It does not
 * project, display, inject, route, remember, or otherwise represent a join.
 * There is deliberately no read API here.
 */
import { randomUUID } from 'node:crypto';

import { evaluateJoin } from '../evaluate';
import type {
  AdoptionAct,
  EvaluationRequest,
  JoinEvaluation,
  StandingAct,
  Warrant,
} from '../types';
import { epistemicJoinPersistenceEnabled } from './feature';

export class EpistemicJoinPersistenceDisabled extends Error {
  constructor() {
    super('epistemic join persistence is disabled');
    this.name = 'EpistemicJoinPersistenceDisabled';
  }
}
export class EpistemicJoinPersistenceConflict extends Error {
  readonly reason: string;
  constructor(reason: string) {
    super(`epistemic join persistence conflict: ${reason}`);
    this.name = 'EpistemicJoinPersistenceConflict';
    this.reason = reason;
  }
}

export interface PersistEpistemicJoinInput {
  readonly memberId: string;
  readonly request: EvaluationRequest;
  /**
   * Exact tip the caller believes is current. Null is required for the first
   * admission. A stale value fails closed instead of branching history.
   */
  readonly expectedPreviousAdmissionId: string | null;
  readonly admissionId?: string;
}

export interface PersistEpistemicJoinReceipt {
  readonly joinId: string;
  readonly memberId: string;
  readonly admissionId: string;
  readonly previousAdmissionId: string | null;
  readonly admittedStanding: JoinEvaluation['admittedStanding'];
  readonly representationAuthority: 'closed';
}
export interface PersistenceTransactionClient {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    params?: readonly unknown[],
  ): Promise<{ readonly rows: T[] }>;
}

export type PersistenceTransaction = <T>(
  callback: (client: PersistenceTransactionClient) => Promise<T>,
) => Promise<T>;

export interface EpistemicJoinPersistenceDeps {
  readonly transaction: PersistenceTransaction;
  readonly randomUUID: () => string;
  readonly env: Readonly<NodeJS.ProcessEnv>;
}

const runtimeTransaction: PersistenceTransaction = async (callback) => {
  const db = require('../../../db/postgres') as { transaction: PersistenceTransaction };
  return db.transaction(callback);
};

const defaultDeps = (): EpistemicJoinPersistenceDeps => ({
  transaction: runtimeTransaction,
  randomUUID,
  env: process.env,
});

const asJson = (value: unknown): string => JSON.stringify(value);

function sameNullable(a: unknown, b: unknown): boolean {
  return (a ?? null) === (b ?? null);
}

function wholeJoinTipActId(acts: readonly StandingAct[]): string | null {
  const whole = acts.filter((act) => act.componentId === null);
  if (whole.length === 0) return null;
  const superseded = new Set(
    whole.map((act) => act.supersedesActId).filter((id): id is string => id !== null),
  );
  const tips = whole.filter((act) => !superseded.has(act.actId));
  if (tips.length !== 1) {
    throw new EpistemicJoinPersistenceConflict('whole-join standing history has no unique tip');
  }
  return tips[0]?.actId ?? null;
}
function orderStandingActs(acts: readonly StandingAct[]): readonly StandingAct[] {
  const remaining = [...acts];
  const ordered: StandingAct[] = [];
  const known = new Set<string>();

  while (remaining.length > 0) {
    const index = remaining.findIndex(
      (act) => act.supersedesActId === null || known.has(act.supersedesActId),
    );
    if (index < 0) {
      throw new EpistemicJoinPersistenceConflict(
        'standing acts cannot be topologically ordered without inventing ancestry',
      );
    }
    const [next] = remaining.splice(index, 1);
    if (!next) throw new EpistemicJoinPersistenceConflict('standing act ordering failed');
    ordered.push(next);
    known.add(next.actId);
  }

  return ordered;
}

export function prepareEpistemicJoinPersistence(
  memberId: string,
  request: EvaluationRequest,
): { readonly evaluation: JoinEvaluation; readonly tipActId: string | null } {
  if (request.envelope.memberScope !== memberId) {
    throw new EpistemicJoinPersistenceConflict('member scope does not equal custody member');
  }
  const evaluation = evaluateJoin(request);
  if (evaluation.downstreamRepresentationAuthorized !== false
      || evaluation.representationAuthority !== 'closed') {
    throw new EpistemicJoinPersistenceConflict('I2 representation closure was not preserved');
  }

  return {
    evaluation,
    tipActId: wholeJoinTipActId(request.standingActs),
  };
}

async function ensureJoin(
  client: PersistenceTransactionClient,
  memberId: string,
  request: EvaluationRequest,
): Promise<void> {
  const envelope = asJson(request.envelope);
  await client.query(
    `INSERT INTO epistemic_join_records (join_id, member_id, envelope)
     VALUES ($1, $2::uuid, $3::jsonb)
     ON CONFLICT (join_id) DO NOTHING`,
    [request.envelope.joinId, memberId, envelope],
  );

  const checked = await client.query<{ same: boolean }>(
    `SELECT member_id = $2::uuid AND envelope = $3::jsonb AS same
       FROM epistemic_join_records WHERE join_id = $1`,
    [request.envelope.joinId, memberId, envelope],
  );
  if (checked.rows.length !== 1 || checked.rows[0]?.same !== true) {
    throw new EpistemicJoinPersistenceConflict('join id already names different immutable bytes');
  }
}

async function ensureWarrant(
  client: PersistenceTransactionClient,
  memberId: string,
  joinId: string,
  warrant: Warrant,
): Promise<void> {
  const payload = asJson(warrant);
  await client.query(
    `INSERT INTO epistemic_warrant_records
       (join_id, member_id, warrant_id, warrant)
     VALUES ($1, $2::uuid, $3, $4::jsonb)
     ON CONFLICT (join_id, warrant_id) DO NOTHING`,
    [joinId, memberId, warrant.warrantId, payload],
  );

  const checked = await client.query<{ same: boolean }>(
    `SELECT member_id = $2::uuid AND warrant = $4::jsonb AS same
       FROM epistemic_warrant_records
      WHERE join_id = $1 AND warrant_id = $3`,
    [joinId, memberId, warrant.warrantId, payload],
  );
  if (checked.rows.length !== 1 || checked.rows[0]?.same !== true) {
    throw new EpistemicJoinPersistenceConflict(
      `warrant ${warrant.warrantId} already names different immutable bytes`,
    );
  }
}

async function ensureDependencies(
  client: PersistenceTransactionClient,
  memberId: string,
  request: EvaluationRequest,
): Promise<void> {
  const rows = [
    ...request.envelope.provenance.reliedUponRefs.map((refId, ordinal) => ({
      refId, ordinal, mode: 'reliance' as const,
    })),
    ...request.envelope.provenance.referenceOnlyRefs.map((refId, ordinal) => ({
      refId, ordinal, mode: 'reference' as const,
    })),
  ];

  for (const row of rows) {
    await client.query(
      `INSERT INTO epistemic_join_dependencies
         (join_id, member_id, ref_id, dependence_mode, ordinal)
       VALUES ($1, $2::uuid, $3, $4, $5)
       ON CONFLICT (join_id, dependence_mode, ref_id) DO NOTHING`,
      [request.envelope.joinId, memberId, row.refId, row.mode, row.ordinal],
    );
  }
}
async function ensureStandingAct(
  client: PersistenceTransactionClient,
  memberId: string,
  act: StandingAct,
): Promise<void> {
  const checked = await client.query<{ same: boolean }>(
    `SELECT
       join_id = $2
       AND member_id = $3::uuid
       AND component_id IS NOT DISTINCT FROM $4
       AND claimed_standing = $5
       AND basis = $6
       AND warrant_ref IS NOT DISTINCT FROM $7
       AND authorship = $8::jsonb
       AND jurisdiction = $9
       AND supersedes_act_id IS NOT DISTINCT FROM $10
       AS same
     FROM epistemic_standing_acts WHERE act_id = $1`,
    [
      act.actId, act.joinId, memberId, act.componentId, act.claimedStanding,
      act.basis, act.warrantRef, asJson(act.authorship), act.jurisdiction,
      act.supersedesActId,
    ],
  );

  if (checked.rows.length === 1) {
    if (checked.rows[0]?.same !== true) {
      throw new EpistemicJoinPersistenceConflict(
        `standing act ${act.actId} already names different immutable bytes`,
      );
    }
    return;
  }
  await client.query(
    `INSERT INTO epistemic_standing_acts
       (act_id, join_id, member_id, component_id, claimed_standing, basis,
        warrant_ref, authorship, jurisdiction, supersedes_act_id)
     VALUES ($1, $2, $3::uuid, $4, $5, $6, $7, $8::jsonb, $9, $10)`,
    [
      act.actId, act.joinId, memberId, act.componentId, act.claimedStanding,
      act.basis, act.warrantRef, asJson(act.authorship), act.jurisdiction,
      act.supersedesActId,
    ],
  );
}

async function ensureAdoptionAct(
  client: PersistenceTransactionClient,
  memberId: string,
  act: AdoptionAct,
): Promise<void> {
  const checked = await client.query<{ same: boolean }>(
    `SELECT
       join_id = $2
       AND member_id = $3::uuid
       AND adopted_component_ids = $4::text[]
       AND adopter = $5::jsonb
       AND adopter_jurisdiction = $6
       AND proposition_as_put = $7
       AND original_proposer = $8::jsonb
       AS same
     FROM epistemic_adoption_acts WHERE act_id = $1`,
    [
      act.actId, act.joinId, memberId, [...act.adoptedComponentIds],
      asJson(act.adopter), act.adopterJurisdiction, act.propositionAsPut,
      asJson(act.originalProposer),
    ],
  );

  if (checked.rows.length === 1) {
    if (checked.rows[0]?.same !== true) {
      throw new EpistemicJoinPersistenceConflict(
        `adoption act ${act.actId} already names different immutable bytes`,
      );
    }
    return;
  }

  await client.query(
    `INSERT INTO epistemic_adoption_acts
       (act_id, join_id, member_id, adopted_component_ids, adopter,
        adopter_jurisdiction, proposition_as_put, original_proposer)
     VALUES ($1, $2, $3::uuid, $4::text[], $5::jsonb, $6, $7, $8::jsonb)`,
    [
      act.actId, act.joinId, memberId, [...act.adoptedComponentIds],
      asJson(act.adopter), act.adopterJurisdiction, act.propositionAsPut,
      asJson(act.originalProposer),
    ],
  );
}
async function currentAdmissionTip(
  client: PersistenceTransactionClient,
  joinId: string,
): Promise<string | null> {
  const result = await client.query<{ admission_id: string }>(
    `SELECT a.admission_id::text AS admission_id
       FROM epistemic_join_admissions a
      WHERE a.join_id = $1
        AND NOT EXISTS (
          SELECT 1 FROM epistemic_join_admissions successor
           WHERE successor.previous_admission_id = a.admission_id
        )
      FOR UPDATE`,
    [joinId],
  );
  if (result.rows.length > 1) {
    throw new EpistemicJoinPersistenceConflict('admission history has more than one tip');
  }
  return result.rows[0]?.admission_id ?? null;
}

export async function persistEpistemicJoinSnapshot(
  input: PersistEpistemicJoinInput,
  deps: EpistemicJoinPersistenceDeps = defaultDeps(),
): Promise<PersistEpistemicJoinReceipt> {
  if (!epistemicJoinPersistenceEnabled(deps.env)) {
    throw new EpistemicJoinPersistenceDisabled();
  }

  const prepared = prepareEpistemicJoinPersistence(input.memberId, input.request);
  const joinId = input.request.envelope.joinId;
  const admissionId = input.admissionId ?? deps.randomUUID();

  return deps.transaction(async (client) => {
    // Same-join writers serialize before observing or appending history.
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [joinId]);

    await ensureJoin(client, input.memberId, input.request);
    for (const warrant of input.request.warrants) {
      await ensureWarrant(client, input.memberId, joinId, warrant);
    }
    await ensureDependencies(client, input.memberId, input.request);

    for (const act of orderStandingActs(input.request.standingActs)) {
      await ensureStandingAct(client, input.memberId, act);
    }
    for (const act of input.request.adoptionActs) {
      await ensureAdoptionAct(client, input.memberId, act);
    }

    const actualPrevious = await currentAdmissionTip(client, joinId);
    if (!sameNullable(actualPrevious, input.expectedPreviousAdmissionId)) {
      throw new EpistemicJoinPersistenceConflict(
        `stale admission tip: expected ${input.expectedPreviousAdmissionId ?? 'null'}, `
        + `found ${actualPrevious ?? 'null'}`,
      );
    }

    await client.query(
      `INSERT INTO epistemic_join_admissions
         (admission_id, join_id, member_id, previous_admission_id, tip_act_id,
          requested_standing, admitted_standing, requested_jurisdiction,
          admitted_jurisdiction, evaluation_request, evaluation_result)
       VALUES
         ($1::uuid, $2, $3::uuid, $4::uuid, $5, $6, $7, $8, $9,
          $10::jsonb, $11::jsonb)`,
      [
        admissionId,
        joinId,
        input.memberId,
        input.expectedPreviousAdmissionId,
        prepared.tipActId,
        input.request.requestedStanding,
        prepared.evaluation.admittedStanding,
        input.request.requestedJurisdiction,
        prepared.evaluation.admittedJurisdiction,
        asJson(input.request),
        asJson(prepared.evaluation),
      ],
    );

    return {
      joinId,
      memberId: input.memberId,
      admissionId,
      previousAdmissionId: input.expectedPreviousAdmissionId,
      admittedStanding: prepared.evaluation.admittedStanding,
      representationAuthority: 'closed' as const,
    };
  });
}
