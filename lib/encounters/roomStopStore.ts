/**
 * R3B-A durable Stop storage. All I/O is explicitly injected; importing this
 * module never opens a database connection or starts a transport.
 *
 * Stop is participant-scoped and terminal for one agreement/consent generation,
 * including later runtimes. Adapter reports remain reports, not physical-media
 * proof. The database is not an independent R20 anti-rollback authority.
 */
import type { QueryResultRow } from 'pg';
import {
  acknowledgeRoomStop,
  beginRoomStop,
  ROOM_STOP_TARGETS,
  sameRoomStopScope,
  type RoomStopContract,
  type RoomStopEvidenceKind,
  type RoomStopScope,
  type RoomStopTarget,
  type RoomStopTargetBindings,
  type RoomStopTargetState,
} from './roomStopContract';
import {
  assertVerifiedParticipantStopAuthority,
  assertVerifiedRoomStopAcknowledgementAuthority,
  validateRoomRuntimeBinding,
  type RoomRuntimeBinding,
  type VerifiedParticipantStopAuthority,
  type VerifiedRoomStopAcknowledgementAuthority,
} from './roomStopAuthority';

/** Compatible with pg.Pool/PoolClient; no production default is supplied. */
export interface RoomStopTransactionClient {
  query<T extends QueryResultRow = any>(sql: string, params?: any[]): Promise<{ rows: T[] }>;
  release(): void;
}
export interface RoomStopDatabase {
  connect(): Promise<RoomStopTransactionClient>;
}

export class RoomStopStoreError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = 'RoomStopStoreError';
  }
}

export class RoomStopPersistenceError extends Error {
  constructor(readonly code: 'PERSISTENCE_FAILED' | 'COMMIT_OUTCOME_UNKNOWN') {
    super(code);
    this.name = 'RoomStopPersistenceError';
  }
}

interface BindingRow extends QueryResultRow {
  encounter_id: string;
  participant_id: string;
  agreement_version: string;
  consent_generation: number;
  runtime_id: string;
  admission_event_id: string;
  target_bindings: RoomStopTargetBindings;
}
interface OperationRow extends BindingRow {
  id: string;
  stop_generation: number;
  request_key: string;
  requested_by_participant_id: string;
  reason: 'participant_withdrawal';
  requested_at_ms: string | number;
}
interface AcknowledgementRow extends QueryResultRow {
  operation_id: string;
  encounter_id: string;
  participant_id: string;
  agreement_version: string;
  consent_generation: number;
  runtime_id: string;
  stop_generation: number;
  target: RoomStopTarget;
  principal_id: string;
  adapter_runtime_id: string;
  evidence_kind: RoomStopEvidenceKind;
  state: Exclude<RoomStopTargetState, 'pending'>;
  acknowledged_at_ms: string | number;
}

const OPERATION_SELECT = `SELECT o.id, o.encounter_id, o.participant_id, o.agreement_version,
  o.consent_generation, o.runtime_id, o.stop_generation, o.request_key,
  o.requested_by_participant_id, o.reason,
  EXTRACT(EPOCH FROM o.requested_at) * 1000 AS requested_at_ms,
  b.admission_event_id, b.target_bindings
  FROM encounter_room_stop_operations o
  JOIN encounter_room_stop_bindings b USING
    (encounter_id, participant_id, agreement_version, consent_generation, runtime_id)`;

function identifier(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 200 && value.trim() === value;
}
function uuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
function scopeParameters(scope: RoomStopScope): any[] {
  return [scope.encounterId, scope.participantId, scope.agreementVersion, scope.consentGeneration, scope.runtimeId];
}
function scopeFromRow(row: BindingRow | AcknowledgementRow): Readonly<RoomStopScope> {
  return Object.freeze({
    encounterId: row.encounter_id,
    participantId: row.participant_id,
    agreementVersion: row.agreement_version,
    consentGeneration: Number(row.consent_generation),
    runtimeId: row.runtime_id,
  });
}
function bindingFromRow(row: BindingRow): Readonly<RoomRuntimeBinding> {
  const binding = {
    scope: scopeFromRow(row),
    admissionEventId: row.admission_event_id,
    targetBindings: row.target_bindings,
  };
  if (!validateRoomRuntimeBinding(binding)) throw new RoomStopStoreError('INVALID_STORED_BINDING');
  const targetBindings = Object.freeze(Object.fromEntries(ROOM_STOP_TARGETS.map((target) => [
    target, Object.freeze({ ...binding.targetBindings[target] }),
  ]))) as RoomStopTargetBindings;
  return Object.freeze({ ...binding, targetBindings });
}
function sameBinding(left: RoomRuntimeBinding, right: RoomRuntimeBinding): boolean {
  return sameRoomStopScope(left.scope, right.scope) && left.admissionEventId === right.admissionEventId
    && ROOM_STOP_TARGETS.every((target) => {
      const a = left.targetBindings[target];
      const b = right.targetBindings[target];
      return a.principalId === b.principalId && a.adapterRuntimeId === b.adapterRuntimeId
        && a.evidenceKind === b.evidenceKind;
    });
}

async function transaction<T>(
  database: RoomStopDatabase,
  readOnly: boolean,
  work: (client: RoomStopTransactionClient) => Promise<T>,
): Promise<T> {
  if (!database || typeof database.connect !== 'function') throw new RoomStopStoreError('DATABASE_REQUIRED');
  let client: RoomStopTransactionClient | undefined;
  let commitAttempted = false;
  try {
    client = await database.connect();
    await client.query(readOnly ? 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY' : 'BEGIN');
    const result = await work(client);
    commitAttempted = true;
    await client.query('COMMIT');
    return result;
  } catch (error) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch { /* Preserve the original outcome. */ }
    }
    // Never return the candidate result when COMMIT's acknowledgement was lost.
    // The caller must read back or retry the same request key on a fresh connection.
    if (commitAttempted && !readOnly) throw new RoomStopPersistenceError('COMMIT_OUTCOME_UNKNOWN');
    if (error instanceof RoomStopStoreError) throw error;
    throw new RoomStopPersistenceError('PERSISTENCE_FAILED');
  } finally {
    // A pool release problem cannot change a known successful database COMMIT.
    try { client?.release(); } catch { /* No optimistic persistence claim is added. */ }
  }
}

async function lockParticipant(client: RoomStopTransactionClient, scope: RoomStopScope): Promise<void> {
  await client.query(
    `SELECT pg_advisory_xact_lock(hashtextextended('encounter-room-stop|' || $1::text || '|' || $2::text, 0))`,
    [scope.encounterId, scope.participantId],
  );
}

async function bindingForScope(
  client: RoomStopTransactionClient, scope: RoomStopScope,
): Promise<Readonly<RoomRuntimeBinding> | null> {
  const result = await client.query<BindingRow>(
    `SELECT encounter_id, participant_id, agreement_version, consent_generation, runtime_id,
       admission_event_id, target_bindings FROM encounter_room_stop_bindings
     WHERE encounter_id = $1 AND participant_id = $2 AND agreement_version = $3
       AND consent_generation = $4 AND runtime_id = $5`,
    scopeParameters(scope),
  );
  if (result.rows.length > 1) throw new RoomStopStoreError('AMBIGUOUS_STORED_BINDING');
  return result.rows[0] ? bindingFromRow(result.rows[0]) : null;
}

async function requireParticipantBinding(
  client: RoomStopTransactionClient, authority: VerifiedParticipantStopAuthority,
): Promise<void> {
  const binding = await bindingForScope(client, authority.scope);
  reassertParticipantAuthority(authority);
  if (!binding || !sameBinding(binding, authority.binding)) throw new RoomStopStoreError('RUNTIME_BINDING_CHANGED_OR_MISSING');
}

function reassertParticipantAuthority(authority: VerifiedParticipantStopAuthority): void {
  try { assertVerifiedParticipantStopAuthority(authority); }
  catch { throw new RoomStopStoreError('PARTICIPANT_AUTHORITY_EXPIRED_OR_UNVERIFIED'); }
}

async function readOperation(
  client: RoomStopTransactionClient, row: OperationRow,
): Promise<Readonly<RoomStopContract>> {
  const binding = bindingFromRow(row);
  const begun = beginRoomStop({
    operationId: row.id,
    requestKey: row.request_key,
    scope: binding.scope,
    stopGeneration: Number(row.stop_generation),
    requestedByParticipantId: row.requested_by_participant_id,
    reason: row.reason,
    requestedAt: Number(row.requested_at_ms),
    targetBindings: binding.targetBindings,
  });
  if (!begun.ok || row.reason !== 'participant_withdrawal') throw new RoomStopStoreError('INVALID_STORED_STOP');
  let contract = begun.contract;
  const acknowledgements = await client.query<AcknowledgementRow>(
    `SELECT operation_id, encounter_id, participant_id, agreement_version, consent_generation,
       runtime_id, stop_generation, target, principal_id, adapter_runtime_id, evidence_kind, state,
       EXTRACT(EPOCH FROM acknowledged_at) * 1000 AS acknowledged_at_ms
     FROM encounter_room_stop_acknowledgements WHERE operation_id = $1 ORDER BY target`,
    [row.id],
  );
  if (acknowledgements.rows.length > ROOM_STOP_TARGETS.length) throw new RoomStopStoreError('INVALID_STORED_ACKNOWLEDGEMENT');
  const seen = new Set<RoomStopTarget>();
  for (const ack of acknowledgements.rows) {
    if (seen.has(ack.target)) throw new RoomStopStoreError('INVALID_STORED_ACKNOWLEDGEMENT');
    seen.add(ack.target);
    const applied = acknowledgeRoomStop(contract, {
      operationId: ack.operation_id,
      scope: scopeFromRow(ack),
      stopGeneration: Number(ack.stop_generation),
      target: ack.target,
      principalId: ack.principal_id,
      adapterRuntimeId: ack.adapter_runtime_id,
      evidenceKind: ack.evidence_kind,
      state: ack.state,
      acknowledgedAt: Number(ack.acknowledged_at_ms),
    });
    if (!applied.ok) throw new RoomStopStoreError('INVALID_STORED_ACKNOWLEDGEMENT');
    contract = applied.contract;
  }
  return contract;
}

async function operationForConsentScope(
  client: RoomStopTransactionClient, scope: RoomStopScope,
): Promise<OperationRow | null> {
  const result = await client.query<OperationRow>(`${OPERATION_SELECT}
    WHERE o.encounter_id = $1 AND o.participant_id = $2
      AND o.agreement_version = $3 AND o.consent_generation = $4`, scopeParameters(scope).slice(0, 4));
  if (result.rows.length > 1) throw new RoomStopStoreError('AMBIGUOUS_STORED_STOP');
  return result.rows[0] ?? null;
}

/** Resolver dependency only. This does not register or authenticate a runtime. */
export async function loadRoomRuntimeBinding(
  input: { encounterId: string; participantId: string; runtimeId: string },
  database: RoomStopDatabase,
): Promise<Readonly<RoomRuntimeBinding> | null> {
  if (!input || !uuid(input.encounterId) || !uuid(input.participantId) || !identifier(input.runtimeId)) {
    throw new RoomStopStoreError('INVALID_BINDING_LOOKUP');
  }
  return transaction(database, true, async (client) => {
    const result = await client.query<BindingRow>(
      `SELECT encounter_id, participant_id, agreement_version, consent_generation, runtime_id,
         admission_event_id, target_bindings FROM encounter_room_stop_bindings
       WHERE encounter_id = $1 AND participant_id = $2 AND runtime_id = $3`,
      [input.encounterId, input.participantId, input.runtimeId],
    );
    if (result.rows.length > 1) throw new RoomStopStoreError('AMBIGUOUS_STORED_BINDING');
    return result.rows[0] ? bindingFromRow(result.rows[0]) : null;
  });
}

/**
 * Returns only after COMMIT. One terminal operation is permitted per consent
 * scope. Same key + same immutable request is idempotent; a changed request is
 * refused. No current positive join check obstructs teardown after withdrawal.
 */
export async function requestRoomStop(
  authority: VerifiedParticipantStopAuthority,
  requestKey: string,
  database: RoomStopDatabase,
): Promise<Readonly<RoomStopContract>> {
  assertVerifiedParticipantStopAuthority(authority);
  if (!identifier(requestKey)) throw new RoomStopStoreError('INVALID_REQUEST_KEY');
  return transaction(database, false, async (client) => {
    await lockParticipant(client, authority.scope);
    reassertParticipantAuthority(authority);
    await requireParticipantBinding(client, authority);
    const existing = await operationForConsentScope(client, authority.scope);
    reassertParticipantAuthority(authority);
    if (existing) {
      if (existing.request_key !== requestKey || !sameRoomStopScope(scopeFromRow(existing), authority.scope)
          || existing.requested_by_participant_id !== authority.participantId || existing.reason !== authority.reason) {
        throw new RoomStopStoreError('STOP_REQUEST_CONFLICT');
      }
      return readOperation(client, existing);
    }
    const inserted = await client.query<{ id: string }>(
      `INSERT INTO encounter_room_stop_operations
         (encounter_id, participant_id, agreement_version, consent_generation, runtime_id,
          request_key, requested_by_participant_id, reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [...scopeParameters(authority.scope), requestKey, authority.participantId, authority.reason],
    );
    if (inserted.rows.length !== 1) throw new RoomStopStoreError('STOP_INSERT_NOT_CONFIRMED');
    const row = await operationForConsentScope(client, authority.scope);
    if (!row || row.id !== inserted.rows[0].id) throw new RoomStopStoreError('STOP_INSERT_NOT_CONFIRMED');
    return readOperation(client, row);
  });
}

export async function readRoomStop(
  authority: VerifiedParticipantStopAuthority,
  operationId: string,
  database: RoomStopDatabase,
): Promise<Readonly<RoomStopContract> | null> {
  assertVerifiedParticipantStopAuthority(authority);
  if (!uuid(operationId)) throw new RoomStopStoreError('INVALID_OPERATION_ID');
  return transaction(database, true, async (client) => {
    await requireParticipantBinding(client, authority);
    const row = await operationForConsentScope(client, authority.scope);
    if (!row || row.id !== operationId || !sameRoomStopScope(scopeFromRow(row), authority.scope)) return null;
    return readOperation(client, row);
  });
}

export async function acknowledgeStoredRoomStop(
  authority: VerifiedRoomStopAcknowledgementAuthority,
  state: Exclude<RoomStopTargetState, 'pending'>,
  database: RoomStopDatabase,
): Promise<Readonly<RoomStopContract>> {
  assertVerifiedRoomStopAcknowledgementAuthority(authority);
  if (!['stopped', 'failed', 'not_started'].includes(state)) throw new RoomStopStoreError('INVALID_ACKNOWLEDGEMENT_STATE');
  return transaction(database, false, async (client) => {
    await lockParticipant(client, authority.scope);
    assertVerifiedRoomStopAcknowledgementAuthority(authority);
    const binding = await bindingForScope(client, authority.scope);
    const expected = binding?.targetBindings[authority.target];
    if (!expected || expected.principalId !== authority.principalId
        || expected.adapterRuntimeId !== authority.adapterRuntimeId || expected.evidenceKind !== authority.evidenceKind) {
      throw new RoomStopStoreError('ACKNOWLEDGEMENT_BINDING_MISMATCH');
    }
    const row = await operationForConsentScope(client, authority.scope);
    if (!row || row.id !== authority.operationId || !sameRoomStopScope(scopeFromRow(row), authority.scope)
        || Number(row.stop_generation) !== authority.stopGeneration) {
      throw new RoomStopStoreError('ACKNOWLEDGEMENT_SCOPE_MISMATCH');
    }
    const existing = await readOperation(client, row);
    if (existing.targets[authority.target] !== 'pending') {
      if (existing.targets[authority.target] !== state) throw new RoomStopStoreError('ACKNOWLEDGEMENT_CONFLICT');
      return existing;
    }
    const inserted = await client.query<{ target: RoomStopTarget }>(
      `INSERT INTO encounter_room_stop_acknowledgements
         (operation_id, encounter_id, participant_id, agreement_version, consent_generation,
          runtime_id, stop_generation, target, principal_id, adapter_runtime_id, evidence_kind, state)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING target`,
      [authority.operationId, ...scopeParameters(authority.scope), authority.stopGeneration,
        authority.target, authority.principalId, authority.adapterRuntimeId, authority.evidenceKind, state],
    );
    if (inserted.rows.length !== 1) throw new RoomStopStoreError('ACKNOWLEDGEMENT_INSERT_NOT_CONFIRMED');
    const result = await readOperation(client, row);
    if (result.targets[authority.target] !== state) throw new RoomStopStoreError('ACKNOWLEDGEMENT_INSERT_NOT_CONFIRMED');
    return result;
  });
}

export type StoredLateRoomWorkDecision = Readonly<{
  allowed: false;
  reason: 'stop_recorded';
  operationId: string;
  stopGeneration: number;
} | {
  allowed: false;
  reason: 'consent_recheck_required';
  operationId: null;
  stopGeneration: null;
}>;

/**
 * Read the durable Stop gate under the same lock as Stop creation. The lookup
 * deliberately spans runtimes: reconnecting never reopens a closed consent
 * scope. Absence of Stop is NOT work authorization, particularly after revoke.
 * This read cannot reserve permission for a later asynchronous side effect.
 */
export async function decideStoredLateRoomWork(
  authority: VerifiedParticipantStopAuthority,
  database: RoomStopDatabase,
): Promise<StoredLateRoomWorkDecision> {
  assertVerifiedParticipantStopAuthority(authority);
  return transaction(database, false, async (client) => {
    await lockParticipant(client, authority.scope);
    reassertParticipantAuthority(authority);
    await requireParticipantBinding(client, authority);
    const row = await operationForConsentScope(client, authority.scope);
    if (!row) return Object.freeze({
      allowed: false, reason: 'consent_recheck_required', operationId: null, stopGeneration: null,
    });
    const contract = await readOperation(client, row);
    return Object.freeze({
      allowed: false, reason: 'stop_recorded',
      operationId: contract.operationId, stopGeneration: contract.stopGeneration,
    });
  });
}
