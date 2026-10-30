/**
 * Store boundary/transaction tests using scripted responses, not a SQL emulator.
 * Real PostgreSQL constraints, concurrent locks, restarts and lifecycle cascades
 * are exercised separately by the isolated R3B-A witness.
 */
import {
  acknowledgeStoredRoomStop,
  decideStoredLateRoomWork,
  loadRoomRuntimeBinding,
  readRoomStop,
  requestRoomStop,
  type RoomStopDatabase,
  type RoomStopTransactionClient,
} from '../roomStopStore';
import {
  authorizeParticipantStop,
  authorizeSubsystemAcknowledgement,
  type RoomRuntimeBinding,
  type VerifiedParticipantStopAuthority,
  type VerifiedRoomStopAcknowledgementAuthority,
} from '../roomStopAuthority';
import {
  beginRoomStop,
  ROOM_STOP_TARGETS,
  summarizeRoomStop,
  type RoomStopContract,
  type RoomStopScope,
  type RoomStopTarget,
  type RoomStopTargetBindings,
} from '../roomStopContract';

const scope: RoomStopScope = {
  encounterId: '10000000-0000-4000-8000-000000000001',
  participantId: '20000000-0000-4000-8000-000000000001',
  agreementVersion: 'exp21-r3a-v1',
  consentGeneration: 1,
  runtimeId: 'fictional-runtime-a',
};
const operationId = '30000000-0000-4000-8000-000000000001';
const otherOperationId = '30000000-0000-4000-8000-000000000002';
const admissionEventId = '40000000-0000-4000-8000-000000000001';
const receiptTime = 1793318400000;
const targetBindings = Object.fromEntries(ROOM_STOP_TARGETS.map((target) => [target, {
  principalId: `fictional-${target}-principal`,
  adapterRuntimeId: `fictional-${target}-runtime`,
  evidenceKind: 'simulated',
}])) as RoomStopTargetBindings;

function binding(overrides: Partial<RoomStopScope> = {}): RoomRuntimeBinding {
  return { scope: { ...scope, ...overrides }, admissionEventId, targetBindings };
}
function bindingRow(overrides: Partial<RoomStopScope> = {}) {
  const current = { ...scope, ...overrides };
  return {
    encounter_id: current.encounterId,
    participant_id: current.participantId,
    agreement_version: current.agreementVersion,
    consent_generation: current.consentGeneration,
    runtime_id: current.runtimeId,
    admission_event_id: admissionEventId,
    target_bindings: targetBindings,
  };
}
function operationRow(overrides: Record<string, unknown> = {}) {
  return {
    ...bindingRow(), id: operationId, stop_generation: 1, request_key: 'fictional-stop-a',
    requested_by_participant_id: scope.participantId, reason: 'participant_withdrawal',
    requested_at_ms: String(receiptTime), ...overrides,
  };
}
function acknowledgementRow(target: RoomStopTarget = 'local_media', overrides: Record<string, unknown> = {}) {
  const assigned = targetBindings[target];
  return {
    operation_id: operationId,
    encounter_id: scope.encounterId, participant_id: scope.participantId,
    agreement_version: scope.agreementVersion, consent_generation: scope.consentGeneration,
    runtime_id: scope.runtimeId, stop_generation: 1,
    target, principal_id: assigned.principalId, adapter_runtime_id: assigned.adapterRuntimeId,
    evidence_kind: assigned.evidenceKind, state: 'stopped',
    acknowledged_at_ms: String(receiptTime + 5), ...overrides,
  };
}
function operation(overrides: Partial<RoomStopContract> = {}): Readonly<RoomStopContract> {
  const result = beginRoomStop({
    operationId, requestKey: 'fictional-stop-a', scope, stopGeneration: 1,
    requestedByParticipantId: scope.participantId, reason: 'participant_withdrawal',
    requestedAt: receiptTime, targetBindings,
  });
  if (!result.ok) throw new Error('INVALID_TEST_OPERATION');
  return { ...result.contract, ...overrides };
}

async function participantAuthority(overrides: Partial<RoomStopScope> = {}): Promise<VerifiedParticipantStopAuthority> {
  const recorded = binding(overrides);
  const result = await authorizeParticipantStop({
    thresholdToken: 'fictional-test-capability', encounterId: recorded.scope.encounterId,
    runtimeId: recorded.scope.runtimeId,
  }, {
    verifyThresholdToken: () => ({ encounterId: recorded.scope.encounterId,
      participantId: recorded.scope.participantId, agreementVersion: recorded.scope.agreementVersion,
      generation: recorded.scope.consentGeneration, exp: Date.now() + 60_000 }),
    lookupRuntimeBinding: async () => recorded,
  });
  if (!result.ok) throw new Error(`TEST_AUTHORITY_FAILED:${result.reason}`);
  return result.authority;
}

async function acknowledgementAuthority(
  target: RoomStopTarget = 'local_media', expectedOperation = operation(),
): Promise<VerifiedRoomStopAcknowledgementAuthority> {
  const assigned = expectedOperation.targetBindings[target];
  const result = await authorizeSubsystemAcknowledgement({
    credential: 'fictional-adapter-proof', operation: expectedOperation, target,
  }, {
    authenticateSubsystem: async () => ({
      scope: expectedOperation.scope, operationId: expectedOperation.operationId,
      stopGeneration: expectedOperation.stopGeneration, target, ...assigned,
    }),
  });
  if (!result.ok) throw new Error(`TEST_ACK_AUTHORITY_FAILED:${result.reason}`);
  return result.authority;
}

type Response = any[] | Error;
function scriptedDatabase(responses: Response[], options: {
  commit?: () => Promise<void>;
  lock?: () => Promise<void>;
  connectError?: Error;
} = {}) {
  const pending = [...responses];
  let mutations = 0;
  let commits = 0;
  let rollbacks = 0;
  const release = jest.fn();
  const query = jest.fn(async (sql: string) => {
    if (sql.startsWith('BEGIN')) return { rows: [] };
    if (sql.includes('pg_advisory_xact_lock')) { await options.lock?.(); return { rows: [] }; }
    if (sql === 'COMMIT') {
      commits += 1;
      await options.commit?.();
      return { rows: [] };
    }
    if (sql === 'ROLLBACK') { rollbacks += 1; return { rows: [] }; }
    if (sql.startsWith('INSERT')) mutations += 1;
    const next = pending.shift();
    if (next === undefined) throw new Error('UNEXPECTED_TEST_DATABASE_READ');
    if (next instanceof Error) throw next;
    return { rows: next };
  });
  const connect = jest.fn(async () => {
    if (options.connectError) throw options.connectError;
    return { query: query as RoomStopTransactionClient['query'], release };
  });
  const database: RoomStopDatabase = { connect };
  return { database, connect, release, query, remaining: () => pending.length,
    mutations: () => mutations, commits: () => commits, rollbacks: () => rollbacks };
}

describe('R3B-A durable Stop store boundary', () => {
  test('forged participant authorities are refused before any database connection', async () => {
    const real = await participantAuthority();
    const forged = { ...real };
    const db = scriptedDatabase([]);
    await expect(requestRoomStop(forged, 'fictional-stop-a', db.database)).rejects.toThrow('UNVERIFIED_PARTICIPANT_STOP_AUTHORITY');
    await expect(readRoomStop(forged, operationId, db.database)).rejects.toThrow('UNVERIFIED_PARTICIPANT_STOP_AUTHORITY');
    await expect(decideStoredLateRoomWork(forged, db.database)).rejects.toThrow('UNVERIFIED_PARTICIPANT_STOP_AUTHORITY');
    expect(db.connect).not.toHaveBeenCalled();
  });

  test('forged subsystem authority is refused before any database connection', async () => {
    const real = await acknowledgementAuthority();
    const db = scriptedDatabase([]);
    await expect(acknowledgeStoredRoomStop({ ...real }, 'stopped', db.database))
      .rejects.toThrow('UNVERIFIED_ROOM_STOP_ACKNOWLEDGEMENT_AUTHORITY');
    expect(db.connect).not.toHaveBeenCalled();
  });

  test('malformed request keys and pending acknowledgements cannot reach storage', async () => {
    const participant = await participantAuthority();
    const adapter = await acknowledgementAuthority();
    const db = scriptedDatabase([]);
    await expect(requestRoomStop(participant, ' padded ', db.database)).rejects.toMatchObject({ code: 'INVALID_REQUEST_KEY' });
    await expect(acknowledgeStoredRoomStop(adapter, 'pending' as any, db.database))
      .rejects.toMatchObject({ code: 'INVALID_ACKNOWLEDGEMENT_STATE' });
    expect(db.connect).not.toHaveBeenCalled();
  });

  test('binding lookup returns an immutable copied complete roster', async () => {
    const db = scriptedDatabase([[bindingRow()]]);
    const result = await loadRoomRuntimeBinding(scope, db.database);
    expect(result).toEqual(binding());
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result?.scope)).toBe(true);
    expect(Object.isFrozen(result?.targetBindings.local_media)).toBe(true);
    expect(result?.targetBindings.local_media).not.toBe(targetBindings.local_media);
    expect(db.release).toHaveBeenCalledTimes(1);
  });

  test('missing binding and changed target ownership refuse an otherwise real authority', async () => {
    const authority = await participantAuthority();
    const missing = scriptedDatabase([[]]);
    await expect(requestRoomStop(authority, 'fictional-stop-a', missing.database))
      .rejects.toMatchObject({ code: 'RUNTIME_BINDING_CHANGED_OR_MISSING' });
    const changed = scriptedDatabase([[{ ...bindingRow(), target_bindings: {
      ...targetBindings, local_media: { ...targetBindings.local_media, principalId: 'peer-principal' },
    } }]]);
    await expect(requestRoomStop(authority, 'fictional-stop-a', changed.database))
      .rejects.toMatchObject({ code: 'RUNTIME_BINDING_CHANGED_OR_MISSING' });
    expect(missing.mutations() + changed.mutations()).toBe(0);
  });

  test('a malformed persisted roster fails closed instead of dropping required targets', async () => {
    const incomplete: Record<string, unknown> = { ...targetBindings };
    delete incomplete.late_work;
    const db = scriptedDatabase([[{ ...bindingRow(), target_bindings: incomplete }]]);
    await expect(loadRoomRuntimeBinding(scope, db.database)).rejects.toMatchObject({ code: 'INVALID_STORED_BINDING' });
    expect(db.rollbacks()).toBe(1);
  });

  test('a capability that expires while waiting for custody cannot create a Stop', async () => {
    const now = Date.now();
    const clock = jest.spyOn(Date, 'now').mockReturnValue(now);
    try {
      const authority = await participantAuthority();
      const db = scriptedDatabase([], {
        lock: async () => { clock.mockReturnValue(now + 60_001); },
      });
      await expect(requestRoomStop(authority, 'fictional-stop-a', db.database))
        .rejects.toMatchObject({ code: 'PARTICIPANT_AUTHORITY_EXPIRED_OR_UNVERIFIED' });
      expect(db.mutations()).toBe(0);
      expect(db.rollbacks()).toBe(1);
    } finally {
      clock.mockRestore();
    }
  });

  test('a new request remains unconfirmed until COMMIT succeeds', async () => {
    const authority = await participantAuthority();
    let releaseCommit!: () => void;
    let observeCommit!: () => void;
    const enteredCommit = new Promise<void>((resolve) => { observeCommit = resolve; });
    const commitGate = new Promise<void>((resolve) => { releaseCommit = resolve; });
    const db = scriptedDatabase([[bindingRow()], [], [{ id: operationId }], [operationRow()], []], {
      commit: async () => { observeCommit(); await commitGate; },
    });
    let resolved = false;
    const request = requestRoomStop(authority, 'fictional-stop-a', db.database).then((result) => {
      resolved = true; return result;
    });
    await enteredCommit;
    expect(resolved).toBe(false);
    expect(db.release).not.toHaveBeenCalled();
    releaseCommit();
    const result = await request;
    expect(result.operationId).toBe(operationId);
    expect(result.requestedAt).toBe(receiptTime);
    expect(result.stopGeneration).toBe(1);
    expect(result.lateWorkAdmission).toBe('closed');
    expect(summarizeRoomStop(result)).toMatchObject({ status: 'pending', physicalMediaVerified: false,
      pending: [...ROOM_STOP_TARGETS] });
    expect(db.mutations()).toBe(1);
    expect(db.remaining()).toBe(0);
    expect(db.release).toHaveBeenCalledTimes(1);
  });

  test('an identical committed request key returns the original operation without growth', async () => {
    const authority = await participantAuthority();
    const db = scriptedDatabase([[bindingRow()], [operationRow()], []]);
    const result = await requestRoomStop(authority, 'fictional-stop-a', db.database);
    expect(result.operationId).toBe(operationId);
    expect(result.requestedAt).toBe(receiptTime);
    expect(db.mutations()).toBe(0);
    expect(db.commits()).toBe(1);
  });

  test('a conflicting duplicate key cannot create a second terminal Stop', async () => {
    const authority = await participantAuthority();
    const db = scriptedDatabase([[bindingRow()], [operationRow()]]);
    await expect(requestRoomStop(authority, 'different-request', db.database))
      .rejects.toMatchObject({ code: 'STOP_REQUEST_CONFLICT' });
    expect(db.mutations()).toBe(0);
    expect(db.commits()).toBe(0);
    expect(db.rollbacks()).toBe(1);
  });

  test('a prebound reconnect cannot reopen a Stop from the prior runtime', async () => {
    const authority = await participantAuthority({ runtimeId: 'fictional-runtime-b' });
    const requestDb = scriptedDatabase([[bindingRow({ runtimeId: 'fictional-runtime-b' })], [operationRow()]]);
    await expect(requestRoomStop(authority, 'fictional-stop-a', requestDb.database))
      .rejects.toMatchObject({ code: 'STOP_REQUEST_CONFLICT' });
    const gateDb = scriptedDatabase([[bindingRow({ runtimeId: 'fictional-runtime-b' })], [operationRow()], []]);
    await expect(decideStoredLateRoomWork(authority, gateDb.database)).resolves.toEqual({
      allowed: false, reason: 'stop_recorded', operationId, stopGeneration: 1,
    });
  });

  test('a connection failure produces no durability receipt', async () => {
    const authority = await participantAuthority();
    const db = scriptedDatabase([], { connectError: new Error('fictional database unavailable') });
    await expect(requestRoomStop(authority, 'fictional-stop-a', db.database))
      .rejects.toMatchObject({ code: 'PERSISTENCE_FAILED' });
    expect(db.commits()).toBe(0);
    expect(db.mutations()).toBe(0);
  });

  test('a precommit write failure rolls back and does not claim durable Stop', async () => {
    const authority = await participantAuthority();
    const db = scriptedDatabase([[bindingRow()], [], new Error('fictional disk failure')]);
    await expect(requestRoomStop(authority, 'fictional-stop-a', db.database))
      .rejects.toMatchObject({ code: 'PERSISTENCE_FAILED' });
    expect(db.commits()).toBe(0);
    expect(db.rollbacks()).toBe(1);
    expect(db.release).toHaveBeenCalledTimes(1);
  });

  test('a lost COMMIT acknowledgement is unknown until a fresh read confirms the record', async () => {
    const authority = await participantAuthority();
    const uncertain = scriptedDatabase([[bindingRow()], [], [{ id: operationId }], [operationRow()], []], {
      commit: async () => { throw new Error('fictional lost commit response'); },
    });
    await expect(requestRoomStop(authority, 'fictional-stop-a', uncertain.database))
      .rejects.toMatchObject({ code: 'COMMIT_OUTCOME_UNKNOWN' });
    const recovery = scriptedDatabase([[bindingRow()], [operationRow()], []]);
    const recovered = await readRoomStop(authority, operationId, recovery.database);
    expect(recovered?.operationId).toBe(operationId);
    expect(summarizeRoomStop(recovered!)).toMatchObject({ status: 'pending', physicalMediaVerified: false });
  });

  test('unknown operation IDs cannot reveal a different operation', async () => {
    const authority = await participantAuthority();
    const db = scriptedDatabase([[bindingRow()], [operationRow()]]);
    await expect(readRoomStop(authority, otherOperationId, db.database)).resolves.toBeNull();
  });

  test('a runtime or participant scope mismatch is never accepted as the requested record', async () => {
    const authority = await participantAuthority();
    for (const changed of [
      { runtime_id: 'fictional-other-runtime' },
      { participant_id: '20000000-0000-4000-8000-000000000002' },
      { consent_generation: 2 },
      { agreement_version: 'different-agreement' },
    ]) {
      const db = scriptedDatabase([[bindingRow()], [operationRow(changed)]]);
      await expect(readRoomStop(authority, operationId, db.database)).resolves.toBeNull();
    }
  });

  test('partial acknowledgement remains pending and uses the stored receipt time', async () => {
    const authority = await acknowledgementAuthority();
    const db = scriptedDatabase([[bindingRow()], [operationRow()], [], [{ target: 'local_media' }], [acknowledgementRow()]]);
    const result = await acknowledgeStoredRoomStop(authority, 'stopped', db.database);
    expect(result.targets.local_media).toBe('stopped');
    expect(result.acknowledgedAt.local_media).toBe(receiptTime + 5);
    expect(result.targets.remote_media).toBe('pending');
    expect(summarizeRoomStop(result)).toMatchObject({ status: 'pending', physicalMediaVerified: false,
      acknowledged: ['local_media'], pending: ROOM_STOP_TARGETS.filter((target) => target !== 'local_media') });
  });

  test('same acknowledgement outcome is idempotent, a conflicting outcome is refused', async () => {
    const authority = await acknowledgementAuthority();
    const duplicate = scriptedDatabase([[bindingRow()], [operationRow()], [acknowledgementRow()]]);
    const result = await acknowledgeStoredRoomStop(authority, 'stopped', duplicate.database);
    expect(result.acknowledgedAt.local_media).toBe(receiptTime + 5);
    expect(duplicate.mutations()).toBe(0);
    const conflict = scriptedDatabase([[bindingRow()], [operationRow()], [acknowledgementRow()]]);
    await expect(acknowledgeStoredRoomStop(authority, 'failed', conflict.database))
      .rejects.toMatchObject({ code: 'ACKNOWLEDGEMENT_CONFLICT' });
    expect(conflict.mutations()).toBe(0);
  });

  test('failed and not-started reports remain distinct and neither claims physical silence', async () => {
    const authority = await participantAuthority();
    const acknowledgements = ROOM_STOP_TARGETS.map((target) => acknowledgementRow(target, {
      state: target === 'recorder' ? 'failed' : target === 'captions' ? 'not_started' : 'stopped',
    }));
    const db = scriptedDatabase([[bindingRow()], [operationRow()], acknowledgements]);
    const result = await readRoomStop(authority, operationId, db.database);
    expect(summarizeRoomStop(result!)).toMatchObject({ status: 'failed', failed: ['recorder'],
      notStarted: ['captions'], physicalMediaVerified: false, pending: [] });
  });

  test('a stale but authentic subsystem capability cannot acknowledge a newer Stop generation', async () => {
    const stale = await acknowledgementAuthority();
    const db = scriptedDatabase([[bindingRow()], [operationRow({ stop_generation: 2 })]]);
    await expect(acknowledgeStoredRoomStop(stale, 'stopped', db.database))
      .rejects.toMatchObject({ code: 'ACKNOWLEDGEMENT_SCOPE_MISMATCH' });
    expect(db.mutations()).toBe(0);
  });

  test('a persisted principal mismatch cannot be bypassed by a previously authentic acknowledgement', async () => {
    const authority = await acknowledgementAuthority();
    const db = scriptedDatabase([[{ ...bindingRow(), target_bindings: {
      ...targetBindings, local_media: { ...targetBindings.local_media, principalId: 'different-principal' },
    } }]]);
    await expect(acknowledgeStoredRoomStop(authority, 'stopped', db.database))
      .rejects.toMatchObject({ code: 'ACKNOWLEDGEMENT_BINDING_MISMATCH' });
    expect(db.mutations()).toBe(0);
  });

  test('corrupt stored acknowledgement scope fails closed on readback', async () => {
    const authority = await participantAuthority();
    const db = scriptedDatabase([[bindingRow()], [operationRow()], [acknowledgementRow('local_media', {
      participant_id: '20000000-0000-4000-8000-000000000002',
    })]]);
    await expect(readRoomStop(authority, operationId, db.database))
      .rejects.toMatchObject({ code: 'INVALID_STORED_ACKNOWLEDGEMENT' });
  });

  test('no Stop is an explicit consent recheck requirement, never workload authorization', async () => {
    const authority = await participantAuthority();
    const db = scriptedDatabase([[bindingRow()], []]);
    await expect(decideStoredLateRoomWork(authority, db.database)).resolves.toEqual({
      allowed: false, reason: 'consent_recheck_required', operationId: null, stopGeneration: null,
    });
  });

  test('the durable late-work gate closes while every adapter report is still missing', async () => {
    const authority = await participantAuthority();
    const db = scriptedDatabase([[bindingRow()], [operationRow()], []]);
    await expect(decideStoredLateRoomWork(authority, db.database)).resolves.toEqual({
      allowed: false, reason: 'stop_recorded', operationId, stopGeneration: 1,
    });
  });
});
