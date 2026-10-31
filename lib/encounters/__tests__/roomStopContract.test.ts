import {
  ROOM_STOP_TARGETS,
  acknowledgeRoomStop,
  beginRoomStop,
  decideLateRoomWork,
  summarizeRoomStop,
  validateRoomStopContract,
  type RoomStopAcknowledgement,
  type RoomStopContract,
  type RoomStopRequest,
  type RoomStopScope,
  type RoomStopTarget,
  type RoomStopTargetBindings,
} from '../roomStopContract';

function scope(): RoomStopScope {
  return { encounterId: 'enc-1', participantId: 'participant-1', agreementVersion: 'agreement-1',
    consentGeneration: 3, runtimeId: 'runtime-1' };
}

function bindings(): RoomStopTargetBindings {
  return Object.fromEntries(ROOM_STOP_TARGETS.map((target) => [target, {
    principalId: `adapter-${target}`, adapterRuntimeId: `worker-${target}-1`, evidenceKind: 'simulated',
  }])) as RoomStopTargetBindings;
}

function request(): RoomStopRequest {
  return { operationId: 'operation-1', requestKey: 'request-1', scope: scope(), stopGeneration: 7,
    requestedByParticipantId: 'participant-1', requestedAt: 100, reason: 'participant_withdrawal',
    targetBindings: bindings() };
}

function contract(input = request()): Readonly<RoomStopContract> {
  const result = beginRoomStop(input);
  if (!result.ok) throw new Error(result.reason);
  return result.contract;
}

function ack(
  stop: Readonly<RoomStopContract>, target: RoomStopTarget = 'local_media',
  state: RoomStopAcknowledgement['state'] = 'stopped',
): RoomStopAcknowledgement {
  return { operationId: stop.operationId, scope: { ...stop.scope }, stopGeneration: stop.stopGeneration,
    target, ...stop.targetBindings[target], state, acknowledgedAt: 101 };
}

describe('persistent Encounter Stop contract reduction', () => {
  it('closes late work immediately while every required target remains pending', () => {
    const stop = contract();
    expect(summarizeRoomStop(stop)).toEqual({ status: 'pending', physicalMediaVerified: false,
      pending: [...ROOM_STOP_TARGETS], failed: [], acknowledged: [], stopped: [], notStarted: [] });
    expect(decideLateRoomWork(stop, scope(), 7)).toEqual({ allowed: false, reason: 'stop_requested' });
    expect(Object.values(stop.acknowledgedAt)).toEqual(ROOM_STOP_TARGETS.map(() => null));
  });

  it('does not turn one component report into aggregate or physical completion', () => {
    const stop = contract();
    const result = acknowledgeRoomStop(stop, ack(stop));
    expect(result.ok).toBe(true);
    expect(summarizeRoomStop(result.contract)).toMatchObject({ status: 'pending',
      physicalMediaVerified: false, acknowledged: ['local_media'] });
    expect(summarizeRoomStop(result.contract).pending).toHaveLength(7);
  });

  it('keeps stopped and never-started reports distinct even after every component acknowledges', () => {
    let stop = contract();
    for (const target of ROOM_STOP_TARGETS) {
      const result = acknowledgeRoomStop(stop, ack(stop, target, target === 'local_media' ? 'stopped' : 'not_started'));
      expect(result.ok).toBe(true);
      stop = result.contract;
    }
    expect(summarizeRoomStop(stop)).toEqual({ status: 'acknowledged', physicalMediaVerified: false,
      pending: [], failed: [], acknowledged: [...ROOM_STOP_TARGETS], stopped: ['local_media'],
      notStarted: ROOM_STOP_TARGETS.filter((target) => target !== 'local_media') });
    expect(decideLateRoomWork(stop, scope(), 7).allowed).toBe(false);
  });

  it('retains a failed target and refuses a later conflicting success report', () => {
    const initial = contract();
    const first = acknowledgeRoomStop(initial, ack(initial, 'recorder', 'failed'));
    if (!first.ok) throw new Error(first.reason);
    const conflict = acknowledgeRoomStop(first.contract, { ...ack(initial, 'recorder'), acknowledgedAt: 102 });
    expect(conflict).toMatchObject({ ok: false, reason: 'conflicting_ack' });
    expect(summarizeRoomStop(conflict.contract)).toMatchObject({ status: 'failed', failed: ['recorder'],
      physicalMediaVerified: false });
  });

  it('makes repeated identical reports idempotent without rewriting the original receipt time', () => {
    const initial = contract();
    const first = acknowledgeRoomStop(initial, ack(initial));
    if (!first.ok) throw new Error(first.reason);
    const second = acknowledgeRoomStop(first.contract, { ...ack(initial), acknowledgedAt: 250 });
    expect(second).toEqual({ ok: true, contract: first.contract });
    expect(second.contract.acknowledgedAt.local_media).toBe(101);
    expect(summarizeRoomStop(second.contract).acknowledged).toEqual(['local_media']);
  });

  it.each([
    ['operation', { operationId: 'operation-2' }, 'wrong_operation'],
    ['old generation', { stopGeneration: 6 }, 'wrong_generation'],
    ['future generation', { stopGeneration: 8 }, 'wrong_generation'],
    ['principal', { principalId: 'someone-else' }, 'wrong_principal'],
    ['old adapter incarnation', { adapterRuntimeId: 'worker-local_media-0' }, 'wrong_adapter_runtime'],
    ['evidence upgrade', { evidenceKind: 'server_component' }, 'wrong_evidence'],
    ['unknown target', { target: 'anything' }, 'unknown_target'],
    ['another target', { target: 'recorder' }, 'wrong_principal'],
  ] as Array<[string, Record<string, unknown>, string]>)('refuses an acknowledgement with a substituted %s', (_label, changed, reason) => {
    const stop = contract();
    const result = acknowledgeRoomStop(stop, { ...ack(stop), ...(changed as object) } as RoomStopAcknowledgement);
    expect(result).toMatchObject({ ok: false, reason });
    expect(result.contract).toBe(stop);
    expect(summarizeRoomStop(stop).acknowledged).toEqual([]);
  });

  it.each([
    { encounterId: 'enc-2' },
    { participantId: 'participant-2' },
    { agreementVersion: 'agreement-2' },
    { consentGeneration: 4 },
    { runtimeId: 'runtime-2' },
  ])('refuses acknowledgement scope substitution %j', (changed) => {
    const stop = contract();
    const wrongScope = { ...scope(), ...changed };
    expect(acknowledgeRoomStop(stop, { ...ack(stop), scope: wrongScope }))
      .toMatchObject({ ok: false, reason: 'wrong_scope' });
    expect(decideLateRoomWork(stop, wrongScope, 7)).toEqual({ allowed: false, reason: 'wrong_scope' });
  });

  it.each([
    { state: 'pending' }, { state: 'timeout' }, { acknowledgedAt: 99 },
    { acknowledgedAt: Number.NaN }, { acknowledgedAt: Number.POSITIVE_INFINITY },
  ])('does not count malformed or unconfirmed outcome %j as acknowledgement', (changed) => {
    const stop = contract();
    expect(acknowledgeRoomStop(stop, { ...ack(stop), ...changed } as RoomStopAcknowledgement))
      .toMatchObject({ ok: false, reason: 'invalid_ack' });
    expect(summarizeRoomStop(stop).status).toBe('pending');
  });

  it('refuses removal of required target bindings and malformed summaries', () => {
    const partial = { ...bindings() } as Partial<Record<RoomStopTarget, RoomStopTargetBindings[RoomStopTarget]>>;
    delete partial.remote_media;
    expect(beginRoomStop({ ...request(), targetBindings: partial as RoomStopTargetBindings }))
      .toEqual({ ok: false, reason: 'invalid_request' });
    const malformed = { ...contract(), targets: {} } as RoomStopContract;
    expect(validateRoomStopContract(malformed)).toBe(false);
    expect(summarizeRoomStop(malformed)).toMatchObject({ status: 'invalid', physicalMediaVerified: false,
      pending: [...ROOM_STOP_TARGETS], acknowledged: [] });
  });

  it('refuses impossible receipt chronology in a reconstructed contract', () => {
    const stop = contract();
    const forged = { ...stop, targets: { ...stop.targets, local_media: 'stopped' as const } };
    expect(validateRoomStopContract(forged)).toBe(false);
    expect(summarizeRoomStop(forged).status).toBe('invalid');
  });

  it('copies and freezes every identity, roster, state and receipt object', () => {
    const input = request();
    const stop = contract(input);
    (input.scope as RoomStopScope).runtimeId = 'later-mutation';
    (input.targetBindings.local_media as { principalId: string }).principalId = 'later-principal';
    expect(stop.scope.runtimeId).toBe('runtime-1');
    expect(stop.targetBindings.local_media.principalId).toBe('adapter-local_media');
    for (const value of [stop, stop.scope, stop.targets, stop.acknowledgedAt,
      stop.targetBindings, ...Object.values(stop.targetBindings)]) expect(Object.isFrozen(value)).toBe(true);
    expect(() => { (stop.targets as Record<RoomStopTarget, string>).local_media = 'stopped'; }).toThrow(TypeError);
    expect(summarizeRoomStop(stop).status).toBe('pending');
  });

  it.each([
    { operationId: '' }, { requestKey: ' padded ' }, { stopGeneration: 0 },
    { stopGeneration: Number.MAX_SAFE_INTEGER + 1 }, { requestedByParticipantId: 'participant-2' },
  ])('refuses a malformed or mismatched request %j', (changed) => {
    expect(beginRoomStop({ ...request(), ...changed } as RoomStopRequest))
      .toEqual({ ok: false, reason: 'invalid_request' });
  });
});
