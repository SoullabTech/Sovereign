import { createRoomRuntimeService } from '../roomRuntime';
import * as store from '../roomStopStore';
import { isVerifiedParticipantStopAuthority, isVerifiedRoomStopAcknowledgementAuthority,
  type RoomRuntimeBinding } from '../roomStopAuthority';
import { acknowledgeRoomStop, beginRoomStop, sameRoomStopScope, type RoomStopContract } from '../roomStopContract';

const encounterId = '10000000-0000-4000-8000-000000000001';
const participantId = '20000000-0000-4000-8000-000000000001';
const admissionEventId = '30000000-0000-4000-8000-000000000001';
const operationId = '40000000-0000-4000-8000-000000000001';
const originalNow = Date.now;

function fixture() {
  const bindingRows = new Map<string, RoomRuntimeBinding>();
  let operation: Readonly<RoomStopContract> | null = null;
  const state = { action: 'grant', generation: 1, status: 'active', eventId: admissionEventId,
    failedCommit: false, confirmedBinding: true, afterQuery: null as null | ((sql: string) => void) };
  const queries: string[] = [];
  const release = jest.fn();
  const client = { release, query: jest.fn(async (sql: string, values: any[] = []) => {
    queries.push(sql);
    state.afterQuery?.(sql);
    if (sql === 'COMMIT' && state.failedCommit) throw new Error('lost response');
    if (sql.includes('SELECT e.consent_agreement_version')) return { rows: [{ consent_agreement_version: 'agreement-v1',
      consent_generation: state.generation, role: 'guest', display_name: 'Fictional participant', status: state.status }] };
    if (sql.includes('FROM encounter_consent_events')) return { rows: [{ event_id: state.eventId, encounter_id: encounterId,
      participant_id: participantId, actor_participant_id: participantId, purpose: values[2], action: state.action,
      agreement_version: 'agreement-v1', generation: 1, decided_at_ms: 1 }] };
    if (sql.includes('FROM encounter_room_stop_operations')) return { rows: operation ? [{ id: operation.operationId,
      runtime_id: operation.scope.runtimeId, stop_generation: operation.stopGeneration }] : [] };
    if (sql.includes('INSERT INTO encounter_room_stop_bindings')) {
      bindingRows.set(values[4], { scope: { encounterId: values[0], participantId: values[1], agreementVersion: values[2],
        consentGeneration: values[3], runtimeId: values[4] }, admissionEventId: values[5], targetBindings: JSON.parse(values[6]) });
      return { rows: state.confirmedBinding ? [{ runtime_id: values[4] }] : [] };
    }
    return { rows: [] };
  }) };
  const database: store.RoomStopDatabase = { connect: jest.fn(async () => client as store.RoomStopTransactionClient) };
  const key = new Uint8Array(32).fill(7);
  const service = createRoomRuntimeService({ database, credentialKey: key, profile: 'isolated-simulated',
    verifyThresholdToken: token => token === 'fictional-threshold' ? { encounterId, participantId,
      agreementVersion: 'agreement-v1', generation: 1, exp: originalNow() + 60_000 } : null });

  jest.spyOn(store, 'loadRoomRuntimeBinding').mockImplementation(async input => bindingRows.get(input.runtimeId) ?? null);
  jest.spyOn(store, 'requestRoomStop').mockImplementation(async (authority, requestKey) => {
    if (!isVerifiedParticipantStopAuthority(authority)) throw new Error('unverified');
    if (operation) {
      if (operation.requestKey !== requestKey || !sameRoomStopScope(operation.scope, authority.scope))
        throw new store.RoomStopStoreError('STOP_REQUEST_CONFLICT');
      return operation;
    }
    const begun = beginRoomStop({ operationId, requestKey, scope: authority.scope, stopGeneration: 1,
      requestedByParticipantId: participantId, requestedAt: originalNow(), reason: 'participant_withdrawal',
      targetBindings: authority.binding.targetBindings });
    if (!begun.ok) throw new Error('bad fixture');
    operation = begun.contract;
    return operation;
  });
  jest.spyOn(store, 'readRoomStop').mockImplementation(async (authority, id) =>
    operation && operation.operationId === id && sameRoomStopScope(operation.scope, authority.scope) ? operation : null);
  jest.spyOn(store, 'acknowledgeStoredRoomStop').mockImplementation(async (authority, value) => {
    if (!isVerifiedRoomStopAcknowledgementAuthority(authority) || !operation) throw new Error('unverified');
    const result = acknowledgeRoomStop(operation, { ...authority, state: value, acknowledgedAt: originalNow() });
    if (!result.ok) throw new store.RoomStopStoreError('ACKNOWLEDGEMENT_CONFLICT');
    operation = result.contract;
    return operation;
  });
  const admit = () => service.admit({ encounterId, thresholdToken: 'fictional-threshold' });
  return { service, admit, state, database, client, queries, release, bindingRows, key };
}

afterEach(() => { jest.restoreAllMocks(); });

describe('R3B-B injected runtime and identity boundary', () => {
  it.each(['admit', 'current', 'participantAuthority', 'stop', 'status', 'report', 'reportOwned', 'reportNeverStarted'] as const)
  ('keeps the default %s composition closed', async method => {
    await expect((createRoomRuntimeService()[method] as any)({ profile: 'isolated-simulated' })).rejects
      .toMatchObject({ code: 'ROOM_INTEGRATION_HELD', status: 503 });
  });

  it('requires a trusted profile and substantial explicitly injected key', () => {
    const f = fixture();
    expect(() => createRoomRuntimeService({ database: f.database, credentialKey: new Uint8Array(4), profile: 'isolated-simulated' }))
      .toThrow('INVALID_RUNTIME_COMPOSITION');
    expect(() => createRoomRuntimeService({ database: f.database, credentialKey: new Uint8Array(32), profile: 'production' as any }))
      .toThrow('INVALID_RUNTIME_COMPOSITION');
  });

  it.each(['participantId', 'runtimeId', 'role', 'targetBindings', 'profile'])('refuses request-selected %s before database activity', async key => {
    const f = fixture();
    await expect(f.service.admit({ encounterId, thresholdToken: 'fictional-threshold', [key]: 'spoof' } as any))
      .rejects.toMatchObject({ code: 'INVALID_REQUEST' });
    expect(f.database.connect).not.toHaveBeenCalled();
  });

  it('issues server identity and a complete simulated roster only after confirmed persistence', async () => {
    const f = fixture(), admitted = await f.admit();
    expect(admitted.runtimeId).toMatch(/^[0-9a-f-]{36}$/);
    expect(admitted.peerId).toBe('p_' + admitted.runtimeId);
    expect(admitted.role).toBe('guest');
    expect(admitted.scope.participantId).toBe(participantId);
    expect(Object.keys(f.bindingRows.get(admitted.runtimeId)!.targetBindings)).toHaveLength(8);
    expect(Object.values(f.bindingRows.get(admitted.runtimeId)!.targetBindings).every(b => b.evidenceKind === 'simulated')).toBe(true);
    expect(f.queries[f.queries.length - 1]).toBe('COMMIT');
    expect(f.release).toHaveBeenCalled();
  });

  it('copies the credential key instead of retaining caller-mutable key bytes', async () => {
    const f = fixture(), admitted = await f.admit();
    f.key.fill(9);
    await expect(f.service.current({ encounterId, runtimeCredential: admitted.runtimeCredential })).resolves.toMatchObject({ runtimeId: admitted.runtimeId });
  });

  it('refuses a forged signed payload and a wrong room before binding lookup', async () => {
    const f = fixture(), admitted = await f.admit();
    const [payload, signature] = admitted.runtimeCredential.split('.');
    const tampered = JSON.parse(Buffer.from(payload, 'base64url').toString());
    tampered.scope.participantId = '20000000-0000-4000-8000-000000000002';
    await expect(f.service.current({ encounterId, runtimeCredential: Buffer.from(JSON.stringify(tampered)).toString('base64url') + '.' + signature }))
      .rejects.toMatchObject({ code: 'INVALID_RUNTIME_CREDENTIAL' });
    await expect(f.service.current({ encounterId: '10000000-0000-4000-8000-000000000002', runtimeCredential: admitted.runtimeCredential }))
      .rejects.toMatchObject({ code: 'INVALID_RUNTIME_CREDENTIAL' });
  });

  it('refuses an unbound or substituted persisted adapter roster', async () => {
    const f = fixture(), admitted = await f.admit();
    const b = f.bindingRows.get(admitted.runtimeId)!;
    f.bindingRows.set(admitted.runtimeId, { ...b, targetBindings: { ...b.targetBindings,
      local_media: { ...b.targetBindings.local_media, principalId: 'other-owner' } } });
    await expect(f.service.current({ encounterId, runtimeCredential: admitted.runtimeCredential })).rejects.toMatchObject({ code: 'UNBOUND_RUNTIME' });
  });

  it.each(['revoke', 'refuse'])('denies %s before runtime insertion', async action => {
    const f = fixture(); f.state.action = action;
    await expect(f.admit()).rejects.toMatchObject({ code: 'CONSENT_REFUSED' });
    expect(f.bindingRows.size).toBe(0);
    expect(f.queries).toContain('ROLLBACK');
  });

  it('checks expiry again after an awaited database lock', async () => {
    const f = fixture(); let now = originalNow();
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    f.state.afterQuery = sql => { if (sql.includes('pg_advisory')) now += 120_000; };
    await expect(f.admit()).rejects.toMatchObject({ code: 'EXPIRED_RUNTIME' });
    expect(f.bindingRows.size).toBe(0);
  });

  it('does not return admission when COMMIT acknowledgement is lost', async () => {
    const f = fixture(); f.state.failedCommit = true;
    await expect(f.admit()).rejects.toMatchObject({ code: 'COMMIT_OUTCOME_UNKNOWN', status: 503 });
  });

  it('does not return a runtime when insertion is not confirmed', async () => {
    const f = fixture(); f.state.confirmedBinding = false;
    await expect(f.admit()).rejects.toMatchObject({ code: 'BINDING_NOT_CONFIRMED' });
    expect(f.queries).not.toContain('COMMIT');
  });

  it('refuses current admission after revoke while preserving historical teardown', async () => {
    const f = fixture(), admitted = await f.admit(), a = { encounterId, runtimeCredential: admitted.runtimeCredential };
    f.state.action = 'revoke';
    await expect(f.service.current(a)).rejects.toMatchObject({ code: 'CONSENT_REFUSED' });
    const stopped = await f.service.stop({ ...a, requestKey: 'stop-one' });
    expect(stopped.scopeStopped).toBe(true);
    expect(stopped.summary?.pending).toHaveLength(8);
    expect(stopped.physicalMediaVerified).toBe(false);
  });

  it('refuses an ended room while keeping Stop available', async () => {
    const f = fixture(), admitted = await f.admit(), a = { encounterId, runtimeCredential: admitted.runtimeCredential };
    f.state.status = 'complete';
    await expect(f.service.current(a)).rejects.toMatchObject({ code: 'ROOM_ENDED' });
    await expect(f.service.stop({ ...a, requestKey: 'ended-stop' })).resolves.toMatchObject({ scopeStopped: true });
  });

  it('refuses changed consent generation and later different admission', async () => {
    const f = fixture(), admitted = await f.admit(), a = { encounterId, runtimeCredential: admitted.runtimeCredential };
    f.state.generation = 2;
    await expect(f.service.current(a)).rejects.toMatchObject({ code: 'STALE_CONSENT_SCOPE' });
    f.state.generation = 1; f.state.eventId = '30000000-0000-4000-8000-000000000002';
    await expect(f.service.current(a)).rejects.toMatchObject({ code: 'STALE_ADMISSION' });
  });

  it('keeps another runtime terminal observation separate from original reports', async () => {
    const f = fixture(), first = await f.admit(), second = await f.admit();
    const a = { encounterId, runtimeCredential: first.runtimeCredential }, b = { encounterId, runtimeCredential: second.runtimeCredential };
    await f.service.stop({ ...a, requestKey: 'one-stop' });
    await expect(f.service.current(b)).rejects.toMatchObject({ code: 'ROOM_STOPPED' });
    const observed = await f.service.status(b);
    expect(observed).toMatchObject({ scopeStopped: true, operationId, stopGeneration: 1, operation: null,
      summary: null, coverage: 'other_runtime', reportCredentials: {}, physicalMediaVerified: false });
    await expect(f.service.reportOwned({ ...b, target: 'signaling', state: 'stopped' })).rejects.toMatchObject({ code: 'ORIGIN_RUNTIME_REQUIRED' });
  });

  it('allows only scoped client targets and rejects wrong report credentials', async () => {
    const f = fixture(), admitted = await f.admit(), a = { encounterId, runtimeCredential: admitted.runtimeCredential };
    const initial = await f.service.stop({ ...a, requestKey: 'one-stop' });
    await expect(f.service.report({ ...a, operationId, target: 'signaling', credential: initial.reportCredentials.local_media!, state: 'stopped' } as any))
      .rejects.toMatchObject({ code: 'INVALID_CLIENT_REPORT' });
    await expect(f.service.report({ ...a, operationId, target: 'local_media', credential: initial.reportCredentials.remote_media!, state: 'stopped' }))
      .rejects.toMatchObject({ code: 'ACKNOWLEDGEMENT_REFUSED' });
    const updated = await f.service.report({ ...a, operationId, target: 'local_media', credential: initial.reportCredentials.local_media!, state: 'stopped' });
    expect(updated.operation?.targets.local_media).toBe('stopped');
    expect(updated.operation?.targets.remote_media).toBe('pending');
    expect(updated.physicalMediaVerified).toBe(false);
  });

  it('reports only the trusted never-admitted fixture targets as not_started', async () => {
    const f = fixture(), admitted = await f.admit(), a = { encounterId, runtimeCredential: admitted.runtimeCredential };
    await f.service.stop({ ...a, requestKey: 'one-stop' });
    const updated = await f.service.reportNeverStarted(a);
    expect(updated.summary?.notStarted.sort()).toEqual(['captions', 'maia_inference', 'maia_playback', 'recorder']);
    expect(updated.summary?.pending.sort()).toEqual(['late_work', 'local_media', 'remote_media', 'signaling']);
    expect(updated.summary?.status).toBe('pending');
  });

  it('preserves a failed target and never promotes complete reports to physical proof', async () => {
    const f = fixture(), admitted = await f.admit(), a = { encounterId, runtimeCredential: admitted.runtimeCredential };
    const initial = await f.service.stop({ ...a, requestKey: 'one-stop' });
    await f.service.reportNeverStarted(a);
    await f.service.reportOwned({ ...a, target: 'signaling', state: 'stopped' });
    await f.service.reportOwned({ ...a, target: 'late_work', state: 'stopped' });
    await f.service.report({ ...a, operationId, target: 'local_media', credential: initial.reportCredentials.local_media!, state: 'stopped' });
    const updated = await f.service.report({ ...a, operationId, target: 'remote_media', credential: initial.reportCredentials.remote_media!, state: 'failed' });
    expect(updated.summary?.status).toBe('failed');
    expect(updated.summary?.pending).toHaveLength(0);
    expect(updated.summary?.physicalMediaVerified).toBe(false);
  });

  it('does not hide an unknown Stop mutation outcome', async () => {
    const f = fixture(), admitted = await f.admit();
    jest.spyOn(store, 'requestRoomStop').mockRejectedValueOnce(new store.RoomStopPersistenceError('COMMIT_OUTCOME_UNKNOWN'));
    await expect(f.service.stop({ encounterId, runtimeCredential: admitted.runtimeCredential, requestKey: 'unknown' }))
      .rejects.toMatchObject({ code: 'COMMIT_OUTCOME_UNKNOWN' });
  });

  it('returns an actual opaque participant authority for the database fence', async () => {
    const f = fixture(), admitted = await f.admit();
    const authority = await f.service.participantAuthority({ encounterId, runtimeCredential: admitted.runtimeCredential });
    expect(isVerifiedParticipantStopAuthority(authority)).toBe(true);
    expect(isVerifiedParticipantStopAuthority({ ...authority })).toBe(false);
  });
});
