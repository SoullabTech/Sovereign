import { executeRoomWork } from '../roomWorkFence';
import { authorizeParticipantStop, type RoomRuntimeBinding } from '../roomStopAuthority';
import { ROOM_STOP_TARGETS, type RoomStopTargetBindings } from '../roomStopContract';
import type { RoomStopDatabase, RoomStopTransactionClient } from '../roomStopStore';

const scope = { encounterId: '10000000-0000-4000-8000-000000000001', participantId: '20000000-0000-4000-8000-000000000001',
  agreementVersion: 'v1', consentGeneration: 1, runtimeId: 'fixture-runtime' };
const targets = Object.fromEntries(ROOM_STOP_TARGETS.map(target => [target, { principalId: 'fixture-' + target,
  adapterRuntimeId: 'adapter-' + target, evidenceKind: 'simulated' }])) as RoomStopTargetBindings;
const binding: RoomRuntimeBinding = { scope, admissionEventId: '30000000-0000-4000-8000-000000000001', targetBindings: targets };

async function fixture() {
  const claims = { encounterId: scope.encounterId, participantId: scope.participantId, agreementVersion: 'v1', generation: 1, exp: Date.now() + 60_000 };
  const result = await authorizeParticipantStop({ thresholdToken: 'fixture', encounterId: scope.encounterId, runtimeId: scope.runtimeId },
    { verifyThresholdToken: () => claims, lookupRuntimeBinding: async () => binding });
  if (!result.ok) throw new Error('fixture authority');
  const state = { stopped: false, revoked: false, summaryGranted: true, bound: true, status: 'active',
    commitLost: false, failWrite: false, after: null as null | ((sql: string, values: any[]) => Promise<void> | void) };
  const calls: Array<{ sql: string; values: any[] }> = [];
  const release = jest.fn();
  const query = jest.fn(async (sql: string, values: any[] = []) => {
    calls.push({ sql, values }); await state.after?.(sql, values);
    if (sql === 'COMMIT' && state.commitLost) throw new Error('response lost');
    if (sql.includes('FROM encounter_room_stop_bindings')) return { rows: state.bound ? [{ admission_event_id: binding.admissionEventId, target_bindings: targets }] : [] };
    if (sql.includes('SELECT e.consent_agreement_version')) return { rows: [{ consent_agreement_version: 'v1', consent_generation: 1,
      role: 'guest', display_name: 'Fictional', status: state.status }] };
    if (sql.includes('FROM encounter_room_stop_operations')) return { rows: state.stopped ? [{ id: 'stop' }] : [] };
    if (sql.includes('FROM encounter_consent_events')) return { rows: [{ event_id: binding.admissionEventId,
      encounter_id: scope.encounterId, participant_id: scope.participantId, actor_participant_id: scope.participantId,
      agreement_version: 'v1', generation: 1, purpose: values[2], action: state.revoked ? 'revoke'
        : values[2] === 'retain_summary' && !state.summaryGranted ? 'refuse' : 'grant', decided_at_ms: 1 }] };
    if (sql.startsWith('INSERT INTO fixture_results')) {
      if (state.failWrite) throw new Error('write failed');
      return { rows: [{ id: 1 }] };
    }
    return { rows: [] };
  });
  const database: RoomStopDatabase = { connect: jest.fn(async () => ({ query, release }) as RoomStopTransactionClient) };
  const input = { authority: result.authority, purposes: ['retain_summary' as const],
    statement: { text: 'INSERT INTO fixture_results (participant_id, value) VALUES ($1,$2) RETURNING id', values: [scope.participantId, 'fictional'] } };
  return { input, database, state, calls, release, claims };
}
afterEach(() => jest.restoreAllMocks());

describe('R3B-B same-transaction SQL final-write fence', () => {
  it('locks Stop then join then purpose and writes only after both current grants', async () => {
    const f = await fixture();
    await expect(executeRoomWork(f.input, f.database)).resolves.toEqual({ rows: [{ id: 1 }] });
    const locks = f.calls.filter(c => c.sql.includes('pg_advisory'));
    expect(locks[0].sql).toContain('encounter-room-stop|');
    expect(locks.slice(1).map(c => c.values[2])).toEqual(['join', 'retain_summary']);
    const effect = f.calls.findIndex(c => c.sql.startsWith('INSERT INTO fixture_results'));
    expect(effect).toBeGreaterThan(f.calls.findIndex(c => c.sql.includes('FROM encounter_consent_events') && c.values[2] === 'retain_summary'));
    expect(f.calls[f.calls.length - 1].sql).toBe('COMMIT');
    expect(f.database.connect).toHaveBeenCalledTimes(1);
    expect(f.release).toHaveBeenCalledTimes(1);
  });

  it.each(['stopped', 'revoked', 'bound', 'summaryGranted', 'status'] as const)('refuses the %s boundary without running the SQL effect', async boundary => {
    const f = await fixture();
    if (boundary === 'status') f.state.status = 'complete';
    else if (boundary === 'bound' || boundary === 'summaryGranted') f.state[boundary] = false;
    else f.state[boundary] = true;
    await expect(executeRoomWork(f.input, f.database)).rejects.toBeDefined();
    expect(f.calls.some(c => c.sql.startsWith('INSERT INTO fixture_results'))).toBe(false);
    expect(f.calls[f.calls.length - 1].sql).toBe('ROLLBACK');
    expect(f.release).toHaveBeenCalledTimes(1);
  });

  it('does not accept a copied authority object', async () => {
    const f = await fixture();
    await expect(executeRoomWork({ ...f.input, authority: { ...f.input.authority } }, f.database)).rejects.toThrow('UNVERIFIED_PARTICIPANT_STOP_AUTHORITY');
    expect(f.database.connect).not.toHaveBeenCalled();
  });

  it.each(['COMMIT', 'SELECT 1', 'INSERT INTO fixture_results VALUES (1); COMMIT'])('rejects non-owned write shape %s', async sql => {
    const f = await fixture();
    await expect(executeRoomWork({ ...f.input, statement: { text: sql } }, f.database)).rejects.toMatchObject({ code: 'INVALID_WORK_STATEMENT' });
    expect(f.database.connect).not.toHaveBeenCalled();
  });

  it('observes revoke that completes while lock acquisition is awaiting', async () => {
    const f = await fixture();
    f.state.after = sql => { if (sql.includes('pg_advisory')) f.state.revoked = true; };
    await expect(executeRoomWork(f.input, f.database)).rejects.toMatchObject({ code: 'CONSENT_REFUSED' });
    expect(f.calls.some(c => c.sql.startsWith('INSERT INTO fixture_results'))).toBe(false);
  });

  it('does not execute after authority expiry during a lock wait', async () => {
    const f = await fixture();
    let now = Date.now(); jest.spyOn(Date, 'now').mockImplementation(() => now);
    f.state.after = sql => { if (sql.includes('pg_advisory')) now += 120_000; };
    await expect(executeRoomWork(f.input, f.database)).rejects.toMatchObject({ code: 'PERSISTENCE_FAILED' });
    expect(f.calls.some(c => c.sql.startsWith('INSERT INTO fixture_results'))).toBe(false);
  });

  it('snapshots SQL and purpose arguments before the first await', async () => {
    const f = await fixture();
    f.state.after = sql => {
      if (sql === 'BEGIN') { f.input.statement.text = 'DELETE FROM someone_else'; f.input.statement.values[1] = 'mutated'; }
    };
    await executeRoomWork(f.input, f.database);
    const write = f.calls.find(c => c.sql.startsWith('INSERT INTO fixture_results'))!;
    expect(write.values).toEqual([scope.participantId, 'fictional']);
    expect(f.calls.some(c => c.sql === 'DELETE FROM someone_else')).toBe(false);
  });

  it('returns failure and rollback for a precommit write error', async () => {
    const f = await fixture(); f.state.failWrite = true;
    await expect(executeRoomWork(f.input, f.database)).rejects.toMatchObject({ code: 'PERSISTENCE_FAILED' });
    expect(f.calls.map(c => c.sql)).not.toContain('COMMIT');
    expect(f.calls[f.calls.length - 1].sql).toBe('ROLLBACK');
  });

  it('keeps a lost mutation commit response explicitly unknown', async () => {
    const f = await fixture(); f.state.commitLost = true;
    await expect(executeRoomWork(f.input, f.database)).rejects.toMatchObject({ code: 'COMMIT_OUTCOME_UNKNOWN' });
    expect(f.release).toHaveBeenCalledTimes(1);
  });
});
