import { query, transaction, type TransactionClient } from '@/lib/db/postgres';
import { leaveCircleWithClient } from '@/lib/circles/membershipService';
import { ACCOUNT_ERASURE_RUNTIME_AUTHORITY } from './accountErasureRuntimeAuthority';
import { collectAccountErasureFacts } from './accountErasureFacts';
import {
  buildAccountErasureActivationPlan,
  type AccountErasureActivationPlan,
  type DurableErasureDispositionPlan,
} from './accountErasureActivationPlan';

const POLICY_VERSION = 'f5-conformance-repair-01-p5d-2026-09-17';

type TerminalState = 'completed' | 'refused' | 'unavailable' | 'failed';

export interface AccountErasureExecutionResult {
  state: TerminalState;
  httpStatus: 200 | 409 | 500 | 503;
  accountChanged: boolean;
  actRef?: string;
  message: string;
  blocked: string[];
}

interface PlannedRow {
  id: string;
  locus_key: string;
  planned_disposition: DurableErasureDispositionPlan['plannedDisposition'];
  verification_rule: string;
  requires_s5: boolean;
  domain_key: string;
}

async function substrateReady(): Promise<boolean> {
  const result = await query<{
    acts: string | null;
    manifests: string | null;
    tombstones: string | null;
    p5d_fence: string | null;
  }>(`
    SELECT
      to_regclass('public.account_erasure_acts')::text AS acts,
      to_regclass('public.deletion_manifests')::text AS manifests,
      to_regclass('public.provenance_tombstones')::text AS tombstones,
      to_regprocedure('public.account_erasure_member_is_tombstoned(text)')::text AS p5d_fence
  `);
  const row = result.rows[0];
  return Boolean(row?.acts && row?.manifests && row?.tombstones && row?.p5d_fence);
}

async function mintAct(memberId: string, requestRef: string): Promise<string> {
  const result = await query<{ id: string }>(
    `INSERT INTO account_erasure_acts (
       subject_member_id, policy_version, registry_version, request_ref
     ) VALUES ($1, $2, $3, $4)
     RETURNING id::text AS id`,
    [memberId, POLICY_VERSION, ACCOUNT_ERASURE_RUNTIME_AUTHORITY.version, requestRef],
  );
  if (!result.rows[0]?.id) throw new Error('account erasure act was not minted');
  return result.rows[0].id;
}

async function freezePlan(
  tx: TransactionClient,
  actId: string,
  plan: AccountErasureActivationPlan,
): Promise<Map<string, PlannedRow>> {
  const payload = plan.dispositions.map((x) => ({
    domain_key: x.domainKey,
    locus_key: x.locusKey,
    member_label: x.memberLabel,
    binding_rule: x.bindingRule,
    planned_disposition: x.plannedDisposition,
    authority_reason: x.authorityReason,
    verification_rule: x.verificationRule,
    adapter_key: x.adapterKey,
    requires_s5: x.requiresS5,
  }));
  const inserted = await tx.query<PlannedRow>(
    `INSERT INTO account_erasure_dispositions (
       act_id, domain_key, locus_key, member_label, binding_rule,
       planned_disposition, authority_reason, verification_rule, adapter_key, requires_s5
     )
     SELECT $1::uuid, x.domain_key, x.locus_key, x.member_label, x.binding_rule,
            x.planned_disposition, x.authority_reason, x.verification_rule, x.adapter_key, x.requires_s5
       FROM jsonb_to_recordset($2::jsonb) AS x(
         domain_key text, locus_key text, member_label text, binding_rule text,
         planned_disposition text, authority_reason text, verification_rule text,
         adapter_key text, requires_s5 boolean
       )
     RETURNING id::text, locus_key, planned_disposition, verification_rule, requires_s5, domain_key`,
    [actId, JSON.stringify(payload)],
  );
  if (inserted.rows.length !== payload.length) throw new Error('frozen plan row count mismatch');

  await tx.query(
    `INSERT INTO account_erasure_execution_events (act_id, event_type, result_code, evidence_ref)
     VALUES ($1, 'plan_frozen', $2, $3)`,
    [actId, plan.outcome, plan.registryVersion],
  );
  return new Map(inserted.rows.map((row) => [row.locus_key, row]));
}

async function recordRefusal(
  tx: TransactionClient,
  actId: string,
  rows: Map<string, PlannedRow>,
  plan: AccountErasureActivationPlan,
): Promise<void> {
  const refused = [...rows.values()].filter((row) => row.planned_disposition === 'refuse');
  if (refused.length) {
    await tx.query(
      `INSERT INTO account_erasure_execution_events (
         act_id, disposition_id, event_type, result_code, evidence_ref
       )
       SELECT $1::uuid, x.id::uuid, 'disposition_refused', $2, $3
         FROM jsonb_to_recordset($4::jsonb) AS x(id text)`,
      [
        actId,
        plan.outcome === 'evidence_incomplete' ? 'evidence_incomplete' : 'governed_refusal',
        plan.registryVersion,
        JSON.stringify(refused.map((row) => ({ id: row.id }))),
      ],
    );
  }
  await tx.query(
    `INSERT INTO account_erasure_execution_events (act_id, event_type, result_code, evidence_ref)
     VALUES ($1, 'act_refused', $2, $3)`,
    [
      actId,
      plan.outcome === 'evidence_incomplete' ? 'evidence_incomplete_no_change' : 'governed_refusal_no_change',
      plan.registryVersion,
    ],
  );
}

async function createS5Manifest(tx: TransactionClient, actId: string): Promise<void> {
  await tx.query(
    `INSERT INTO deletion_manifests (
       id, reason_class, authorized_by, executed_at, note
     ) VALUES (
       $1::uuid, 'member_deletion', 'verified_member_session · F5 P5-D', NOW(),
       'Account erasure anti-resurrection manifest; manifest id equals account_erasure_acts.id.'
     )`,
    [actId],
  );
}

async function tombstoneExistingAccountRows(
  tx: TransactionClient,
  actId: string,
  memberId: string,
): Promise<void> {
  for (const table of ['auth_sessions', 'member_settings', 'member_sessions']) {
    await tx.query(
      `INSERT INTO provenance_tombstones (manifest_id, object_kind, object_id)
       SELECT $1::uuid, $2, id::text FROM ${table} WHERE member_id = $3::uuid`,
      [actId, table, memberId],
    );
  }
  await tx.query(
    `INSERT INTO provenance_tombstones (manifest_id, object_kind, object_id)
     SELECT $1::uuid, 'circle_memberships:left', id::text
       FROM circle_memberships WHERE member_id = $2::uuid AND status = 'active'`,
    [actId, memberId],
  );
  await tx.query(
    `INSERT INTO provenance_tombstones (manifest_id, object_kind, object_id)
     SELECT $1::uuid, 'circle_inquiry_responses:withdrawn', id::text
       FROM circle_inquiry_responses WHERE member_id = $2::uuid AND withdrawn_at IS NULL`,
    [actId, memberId],
  );
  await tx.query(
    `INSERT INTO provenance_tombstones (manifest_id, object_kind, object_id)
     SELECT $1::uuid, 'shared_artifacts:revoked', id::text
       FROM shared_artifacts WHERE shared_by = $2::uuid AND revoked_at IS NULL`,
    [actId, memberId],
  );
}

async function executeSupportedDispositions(
  tx: TransactionClient,
  actId: string,
  memberId: string,
  plan: AccountErasureActivationPlan,
): Promise<void> {
  await createS5Manifest(tx, actId);
  await tombstoneExistingAccountRows(tx, actId, memberId);

  // Credentials become inert before any identity-ending act.
  await tx.query(
    `UPDATE auth_sessions
        SET revoked = TRUE, revoked_at = NOW(), revoked_reason = 'account_deleted'
      WHERE member_id = $1::uuid AND revoked = FALSE`,
    [memberId],
  );
  await tx.query(`DELETE FROM member_settings WHERE member_id = $1::uuid`, [memberId]);
  await tx.query(`DELETE FROM member_sessions WHERE member_id = $1::uuid`, [memberId]);

  if (plan.activeCircleIds === 'unknown') throw new Error('Circle execution ids unavailable');
  for (const circleId of plan.activeCircleIds) {
    await leaveCircleWithClient(tx, circleId, memberId);
  }

  // The subject tombstone becomes active only after every pre-identity adapter
  // has run, so its write guards cannot interfere with the lawful revocations.
  await tx.query(
    `INSERT INTO provenance_tombstones (manifest_id, object_kind, object_id)
     VALUES ($1::uuid, 'members', $2)`,
    [actId, memberId],
  );

  await tx.query(`DELETE FROM members WHERE id = $1::uuid`, [memberId]);
}

async function verifyPostState(
  tx: TransactionClient,
  actId: string,
  memberId: string,
): Promise<void> {
  const member = await tx.query<{ present: boolean }>(
    `SELECT EXISTS (SELECT 1 FROM members WHERE id = $1::uuid) AS present`,
    [memberId],
  );
  if (member.rows[0]?.present) throw new Error('member row survived erasure');

  const ledger = await tx.query<{ present: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM account_erasure_acts WHERE id = $1::uuid AND subject_member_id = $2::uuid
     ) AS present`,
    [actId, memberId],
  );
  if (!ledger.rows[0]?.present) throw new Error('erasure act did not survive identity end');

  const s5 = await tx.query<{ manifest: boolean; subject_fence: boolean }>(
    `SELECT
       EXISTS (SELECT 1 FROM deletion_manifests WHERE id = $1::uuid) AS manifest,
       EXISTS (
         SELECT 1 FROM provenance_tombstones
          WHERE manifest_id = $1::uuid AND object_kind = 'members' AND object_id = $2
       ) AS subject_fence`,
    [actId, memberId],
  );
  if (!s5.rows[0]?.manifest || !s5.rows[0]?.subject_fence) throw new Error('S5 account-erasure fence missing');

  // Re-run the same governed census inside the same SERIALIZABLE transaction.
  // Every ordinary member-bound locus and runtime FK effect must now be absent;
  // the immutable erasure act and Circle tombstone facts are the only exceptions.
  const after = await collectAccountErasureFacts(tx, memberId);
  for (const [table, rows] of Object.entries(after.shadowFacts.locusRows)) {
    if (table === 'account_erasure_acts') {
      if (rows === 0 || rows === 'unknown') throw new Error('retained erasure ledger not observable');
      continue;
    }
    if (table === 'circle_memberships' || table === 'circle_inquiry_responses') continue;
    if (rows !== 0) throw new Error(`post-erasure member-bound locus not absent: ${table}`);
  }
  if (
    after.shadowFacts.circles.activeMemberships !== 0 ||
    after.shadowFacts.circles.activeSharedArtifacts !== 0 ||
    after.shadowFacts.circles.liveInquiryResponses !== 0
  ) {
    throw new Error('Circle representation remained active after erasure');
  }
  for (const effect of after.fkEffects) {
    if (effect.rows !== 0) throw new Error(`post-erasure member FK effect not absent: ${effect.key}`);
  }
}

async function recordCompletionEvidence(
  tx: TransactionClient,
  actId: string,
  rows: Map<string, PlannedRow>,
): Promise<void> {
  const all = [...rows.values()];
  await tx.query(
    `INSERT INTO account_erasure_execution_events (
       act_id, disposition_id, event_type, result_code, evidence_ref
     )
     SELECT $1::uuid, x.id::uuid, 'disposition_succeeded',
            CASE WHEN x.domain_key = 'member_fk_effect' THEN 'fk_effect_satisfied'
                 WHEN x.planned_disposition = 'no_op' THEN 'observed_absent'
                 WHEN x.planned_disposition = 'retain' THEN 'retained'
                 ELSE 'executed' END,
            CASE WHEN x.requires_s5 THEN $3::text ELSE 'p5d-poststate-census'::text END
       FROM jsonb_to_recordset($2::jsonb) AS x(
         id text, domain_key text, planned_disposition text, requires_s5 boolean
       )`,
    [actId, JSON.stringify(all), actId],
  );

  const verified = all.filter((row) => row.verification_rule !== 'none');
  if (verified.length) {
    await tx.query(
      `INSERT INTO account_erasure_execution_events (
         act_id, disposition_id, event_type, result_code, evidence_ref
       )
       SELECT $1::uuid, x.id::uuid, 'verification_succeeded', 'p5d_poststate_verified',
              CASE WHEN x.requires_s5 THEN $3::text ELSE 'p5d-poststate-census'::text END
         FROM jsonb_to_recordset($2::jsonb) AS x(id text, requires_s5 boolean)`,
      [actId, JSON.stringify(verified), actId],
    );
  }

  await tx.query(
    `INSERT INTO account_erasure_execution_events (act_id, event_type, result_code, evidence_ref)
     VALUES ($1::uuid, 'act_completed', 'governed_account_erasure_completed', $2::text)`,
    [actId, actId],
  );
}

async function projectAct(
  runQuery: TransactionClient['query'],
  actId: string,
): Promise<AccountErasureExecutionResult> {
  const terminal = await runQuery<{ event_type: string; result_code: string }>(
    `SELECT event_type, result_code
       FROM account_erasure_execution_events
      WHERE act_id = $1::uuid
        AND event_type IN ('act_refused', 'act_failed', 'act_completed')
      ORDER BY event_seq DESC LIMIT 1`,
    [actId],
  );
  const event = terminal.rows[0];
  if (!event) {
    return {
      state: 'failed', httpStatus: 500, accountChanged: false, actRef: actId,
      message: 'Account deletion did not complete. Your account was not intentionally changed.', blocked: [],
    };
  }

  const labels = await runQuery<{ member_label: string }>(
    `SELECT DISTINCT member_label
       FROM account_erasure_dispositions
      WHERE act_id = $1::uuid AND planned_disposition = 'refuse'
      ORDER BY member_label`,
    [actId],
  );
  const blocked = labels.rows.map((row) => row.member_label);

  if (event.event_type === 'act_completed') {
    return {
      state: 'completed', httpStatus: 200, accountChanged: true, actRef: actId, blocked: [],
      message: 'Your account deletion completed. Sign-in access ended, supported account data was erased or revoked, and Circle representations were withdrawn.',
    };
  }
  if (event.event_type === 'act_refused' && event.result_code === 'evidence_incomplete_no_change') {
    return {
      state: 'unavailable', httpStatus: 503, accountChanged: false, actRef: actId, blocked,
      message: "We couldn't establish a complete governed deletion plan. Nothing was changed. Please try again later or contact support.",
    };
  }
  if (event.event_type === 'act_refused') {
    return {
      state: 'refused', httpStatus: 409, accountChanged: false, actRef: actId, blocked,
      message: 'Full account deletion is not available for this account yet. Nothing was changed. Some governed data still lacks an authorized disposition.',
    };
  }
  return {
    state: 'failed', httpStatus: 500, accountChanged: false, actRef: actId, blocked,
    message: 'Account deletion did not complete. The governed transaction rolled back and no completion was recorded.',
  };
}

async function recordRolledBackFailure(actId: string): Promise<AccountErasureExecutionResult> {
  try {
    await query(
      `INSERT INTO account_erasure_execution_events (act_id, event_type, result_code, evidence_ref)
       VALUES ($1, 'act_failed', 'execution_transaction_rolled_back', $2)`,
      [actId, ACCOUNT_ERASURE_RUNTIME_AUTHORITY.version],
    );
  } catch {
    // A terminal event may already exist if the database committed but the caller
    // lost transport. Never overwrite or "fix" history here; projection decides.
  }
  return projectAct(query, actId);
}

export async function executeAccountErasure(
  memberId: string,
  requestRef: string,
): Promise<AccountErasureExecutionResult> {
  if (!ACCOUNT_ERASURE_RUNTIME_AUTHORITY.activationAuthority.includes('P5-D-R3')) {
    return {
      state: 'unavailable', httpStatus: 503, accountChanged: false,
      message: 'Governed account deletion is not activated.', blocked: [],
    };
  }
  if (!(await substrateReady())) {
    return {
      state: 'unavailable', httpStatus: 503, accountChanged: false,
      message: 'Governed account deletion is not available in this environment yet. Nothing was changed.', blocked: [],
    };
  }

  const actId = await mintAct(memberId, requestRef);
  try {
    return await transaction(async (tx) => {
      await tx.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
      const collected = await collectAccountErasureFacts(tx, memberId);
      const plan = buildAccountErasureActivationPlan(collected);
      const rows = await freezePlan(tx, actId, plan);

      if (!plan.activationReady) {
        await recordRefusal(tx, actId, rows, plan);
        return projectAct(tx.query.bind(tx), actId);
      }

      await tx.query(
        `INSERT INTO account_erasure_execution_events (act_id, event_type, result_code, evidence_ref)
         VALUES ($1, 'execution_started', 'p5d_serializable_execution', $2)`,
        [actId, plan.registryVersion],
      );
      await executeSupportedDispositions(tx, actId, memberId, plan);
      await verifyPostState(tx, actId, memberId);
      await recordCompletionEvidence(tx, actId, rows);
      return projectAct(tx.query.bind(tx), actId);
    });
  } catch {
    return recordRolledBackFailure(actId);
  }
}
