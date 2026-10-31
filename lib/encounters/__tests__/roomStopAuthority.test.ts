import {
  assertVerifiedParticipantStopAuthority,
  assertVerifiedRoomStopAcknowledgementAuthority,
  authorizeParticipantStop,
  authorizeSubsystemAcknowledgement,
  isVerifiedParticipantStopAuthority,
  isVerifiedRoomStopAcknowledgementAuthority,
  validateRoomRuntimeBinding,
  type AuthenticatedRoomStopSubsystem,
  type ParticipantStopAuthorityDependencies,
  type RoomRuntimeBinding,
  type SubsystemAcknowledgementAuthorityDependencies,
} from '../roomStopAuthority';
import {
  ROOM_STOP_TARGETS,
  beginRoomStop,
  type RoomStopContract,
  type RoomStopReason,
  type RoomStopScope,
  type RoomStopTargetBindings,
} from '../roomStopContract';
import { decideEncounterConsent, type EncounterConsentEvent } from '../consentDecision';
import { mintThresholdToken, type ThresholdClaims } from '../threshold';

function scope(): RoomStopScope {
  return { encounterId: 'enc-1', participantId: 'participant-1', agreementVersion: 'agreement-1',
    consentGeneration: 3, runtimeId: 'runtime-1' };
}

function binding(): RoomRuntimeBinding {
  return { scope: scope(), admissionEventId: 'join-grant-1',
    targetBindings: Object.fromEntries(ROOM_STOP_TARGETS.map((target) => [target, {
      principalId: `adapter-${target}`, adapterRuntimeId: `worker-${target}-1`, evidenceKind: 'simulated',
    }])) as RoomStopTargetBindings };
}

function claims(): ThresholdClaims {
  return { encounterId: 'enc-1', participantId: 'participant-1', agreementVersion: 'agreement-1',
    generation: 3, exp: Date.now() + 60_000 };
}

function participantInput() {
  return { thresholdToken: 'fictional-signed-capability', encounterId: 'enc-1', runtimeId: 'runtime-1' };
}

function participantDependencies(record: RoomRuntimeBinding | null = binding()) {
  return { verifyThresholdToken: jest.fn((_token: string) => claims()),
    lookupRuntimeBinding: jest.fn(async (_input: { encounterId: string; participantId: string; runtimeId: string }) => record) };
}

function operation(): Readonly<RoomStopContract> {
  const result = beginRoomStop({ operationId: 'operation-1', requestKey: 'request-1', scope: scope(),
    stopGeneration: 7, requestedByParticipantId: 'participant-1', requestedAt: 100,
    reason: 'participant_withdrawal', targetBindings: binding().targetBindings });
  if (!result.ok) throw new Error(result.reason);
  return result.contract;
}

function subsystem(): AuthenticatedRoomStopSubsystem {
  return { scope: scope(), operationId: 'operation-1', stopGeneration: 7, target: 'local_media',
    principalId: 'adapter-local_media', adapterRuntimeId: 'worker-local_media-1', evidenceKind: 'simulated' };
}

describe('participant Stop authority', () => {
  it('binds the signed participant to an exact recorded runtime and returns opaque frozen authority', async () => {
    const record = binding();
    const dependencies = participantDependencies(record);
    const result = await authorizeParticipantStop(participantInput(), dependencies);
    expect(result.ok).toBe(true);
    expect(dependencies.lookupRuntimeBinding).toHaveBeenCalledWith({ encounterId: 'enc-1',
      participantId: 'participant-1', runtimeId: 'runtime-1' });
    if (!result.ok) throw new Error(result.reason);
    expect(isVerifiedParticipantStopAuthority(result.authority)).toBe(true);
    expect(() => assertVerifiedParticipantStopAuthority(result.authority)).not.toThrow();
    expect(result.authority.reason).toBe('participant_withdrawal');
    expect(result.authority).not.toHaveProperty('thresholdToken');
    expect(Object.isFrozen(result.authority)).toBe(true);
    expect(Object.isFrozen(result.authority.binding)).toBe(true);
    expect(Object.isFrozen(result.authority.scope)).toBe(true);
    expect(Object.isFrozen(result.authority.binding.targetBindings.local_media)).toBe(true);
    (record.scope as RoomStopScope).runtimeId = 'mutated-after-authorization';
    expect(result.authority.scope.runtimeId).toBe('runtime-1');
  });

  it('allows teardown of the established binding after join has been revoked', async () => {
    const consentScope = { encounterId: 'enc-1', participantId: 'participant-1', purpose: 'join' as const,
      agreementVersion: 'agreement-1', generation: 3 };
    const events: EncounterConsentEvent[] = [
      { ...consentScope, eventId: 'join-grant-1', actorParticipantId: 'participant-1', action: 'grant', createdAt: 1 },
      { ...consentScope, eventId: 'join-revoke-1', actorParticipantId: 'participant-1', action: 'revoke', createdAt: 2 },
    ];
    expect(decideEncounterConsent(events, consentScope)).toMatchObject({ allowed: false,
      reason: 'revoked', shutdown: { required: true, state: 'required_unacknowledged' } });
    const result = await authorizeParticipantStop(participantInput(), participantDependencies());
    expect(result.ok).toBe(true);
    // Teardown authority did not append a consent event or resurrect join.
    expect(events).toHaveLength(2);
    expect(decideEncounterConsent(events, consentScope).allowed).toBe(false);
  });

  it('refuses a missing durable runtime instead of manufacturing one from the token', async () => {
    const dependencies = participantDependencies(null);
    expect(await authorizeParticipantStop(participantInput(), dependencies))
      .toEqual({ ok: false, reason: 'unbound_runtime' });
    expect(dependencies.lookupRuntimeBinding).toHaveBeenCalledTimes(1);
  });

  it('refuses a purported binding without a recorded admission or a complete trusted target roster', async () => {
    const missingAdmission = { ...binding(), admissionEventId: '' };
    expect(validateRoomRuntimeBinding(missingAdmission)).toBe(false);
    expect(await authorizeParticipantStop(participantInput(), participantDependencies(missingAdmission)))
      .toEqual({ ok: false, reason: 'unbound_runtime' });
    const wrongRoster = { ...binding(), targetBindings: {} as RoomStopTargetBindings };
    expect(await authorizeParticipantStop(participantInput(), participantDependencies(wrongRoster)))
      .toEqual({ ok: false, reason: 'unbound_runtime' });
  });

  it.each([
    { encounterId: 'enc-2' }, { participantId: 'participant-2' }, { runtimeId: 'runtime-2' },
    { agreementVersion: 'agreement-2' }, { consentGeneration: 4 },
  ])('refuses a record from another exact admission scope %j', async (changed) => {
    const record = { ...binding(), scope: { ...scope(), ...changed } };
    expect(await authorizeParticipantStop(participantInput(), participantDependencies(record)))
      .toEqual({ ok: false, reason: 'scope_mismatch' });
  });

  it('derives participant identity from the verified capability and rejects a client participant override', async () => {
    const dependencies = participantDependencies();
    const input = { ...participantInput(), participantId: 'participant-2' };
    expect(await authorizeParticipantStop(input, dependencies)).toEqual({ ok: false, reason: 'invalid_request' });
    expect(dependencies.verifyThresholdToken).not.toHaveBeenCalled();
    const otherSubject = { ...dependencies, verifyThresholdToken: () => ({ ...claims(), participantId: 'participant-2' }) };
    expect(await authorizeParticipantStop(participantInput(), otherSubject)).toEqual({ ok: false, reason: 'scope_mismatch' });
  });

  it.each(['room_ended', 'steward_emergency', 'system_failure'] as RoomStopReason[])(
    'does not derive room-wide authority from the reason %s', async (reason) => {
      const dependencies = participantDependencies();
      expect(await authorizeParticipantStop({ ...participantInput(), reason }, dependencies))
        .toEqual({ ok: false, reason: 'unsupported_reason' });
      expect(dependencies.lookupRuntimeBinding).not.toHaveBeenCalled();
    },
  );

  it('uses the existing signature and expiry verifier when no verifier is injected', async () => {
    const previous = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'fictional-r3ba-unit-threshold-secret-not-a-live-credential';
    try {
      const token = mintThresholdToken('enc-1', 'participant-1', 'agreement-1', 3);
      const dependencies = { lookupRuntimeBinding: async () => binding() };
      expect((await authorizeParticipantStop({ ...participantInput(), thresholdToken: token }, dependencies)).ok).toBe(true);
      expect(await authorizeParticipantStop({ ...participantInput(), thresholdToken: `${token}tampered` }, dependencies))
        .toEqual({ ok: false, reason: 'invalid_token' });
      const expired = mintThresholdToken('enc-1', 'participant-1', 'agreement-1', 3,
        Date.now() - 8 * 24 * 60 * 60 * 1000);
      expect(await authorizeParticipantStop({ ...participantInput(), thresholdToken: expired }, dependencies))
        .toEqual({ ok: false, reason: 'invalid_token' });
    } finally {
      if (previous === undefined) delete process.env.JWT_SECRET;
      else process.env.JWT_SECRET = previous;
    }
  });

  it.each([Date.now() - 1, Number.NaN, Number.POSITIVE_INFINITY])(
    'does not confuse invalid or expired capability authority with revoked join consent (%s)', async (exp) => {
      const dependencies = { ...participantDependencies(), verifyThresholdToken: () => ({ ...claims(), exp }) };
      expect(await authorizeParticipantStop(participantInput(), dependencies)).toEqual({ ok: false, reason: 'invalid_token' });
      expect(dependencies.lookupRuntimeBinding).not.toHaveBeenCalled();
    },
  );

  it('fails closed when identity or binding authority is unavailable', async () => {
    expect(await authorizeParticipantStop(participantInput(), {} as ParticipantStopAuthorityDependencies))
      .toEqual({ ok: false, reason: 'authority_unavailable' });
    const dependencies = { ...participantDependencies(), lookupRuntimeBinding: async () => { throw new Error('fixture unavailable'); } };
    expect(await authorizeParticipantStop(participantInput(), dependencies)).toEqual({ ok: false, reason: 'authority_unavailable' });
  });

  it('rejects copied or reconstructed verified-looking participant objects', async () => {
    const result = await authorizeParticipantStop(participantInput(), participantDependencies());
    if (!result.ok) throw new Error(result.reason);
    const copy = { ...result.authority };
    const serialized = JSON.parse(JSON.stringify(result.authority));
    expect(isVerifiedParticipantStopAuthority(copy)).toBe(false);
    expect(isVerifiedParticipantStopAuthority(serialized)).toBe(false);
    expect(() => assertVerifiedParticipantStopAuthority(copy)).toThrow('UNVERIFIED_PARTICIPANT_STOP_AUTHORITY');
  });

  it('does not let a retained authority object outlive the verified capability', async () => {
    const now = Date.now();
    const clock = jest.spyOn(Date, 'now').mockReturnValue(now);
    try {
      const dependencies = { ...participantDependencies(), verifyThresholdToken: () => ({ ...claims(), exp: now + 1000 }) };
      const result = await authorizeParticipantStop(participantInput(), dependencies);
      if (!result.ok) throw new Error(result.reason);
      clock.mockReturnValue(now + 1001);
      expect(isVerifiedParticipantStopAuthority(result.authority)).toBe(false);
      expect(() => assertVerifiedParticipantStopAuthority(result.authority))
        .toThrow('UNVERIFIED_PARTICIPANT_STOP_AUTHORITY');
    } finally {
      clock.mockRestore();
    }
  });

  it('rechecks capability expiry after waiting for admission persistence', async () => {
    const now = Date.now();
    const clock = jest.spyOn(Date, 'now').mockReturnValue(now);
    try {
      const dependencies = { verifyThresholdToken: () => ({ ...claims(), exp: now + 1000 }),
        lookupRuntimeBinding: async () => { clock.mockReturnValue(now + 1001); return binding(); } };
      expect(await authorizeParticipantStop(participantInput(), dependencies))
        .toEqual({ ok: false, reason: 'invalid_token' });
    } finally {
      clock.mockRestore();
    }
  });
});

describe('subsystem acknowledgement authority', () => {
  function dependencies(principal: AuthenticatedRoomStopSubsystem = subsystem()) {
    const credentials = new Map<unknown, AuthenticatedRoomStopSubsystem>([['simulated-adapter-credential', principal]]);
    return { authenticateSubsystem: jest.fn(async (credential: unknown) => credentials.get(credential) ?? null) };
  }

  function input() {
    return { credential: 'simulated-adapter-credential', operation: operation(), target: 'local_media' as const };
  }

  it('resolves exact actor, target, epoch and evidence from the trusted adapter', async () => {
    const result = await authorizeSubsystemAcknowledgement(input(), dependencies());
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.reason);
    expect(result.authority).toEqual(subsystem());
    expect(isVerifiedRoomStopAcknowledgementAuthority(result.authority)).toBe(true);
    expect(Object.isFrozen(result.authority)).toBe(true);
    expect(Object.isFrozen(result.authority.scope)).toBe(true);
    expect(result.authority).not.toHaveProperty('credential');
  });

  it('refuses a browser-shaped identity object as a credential and has no permissive default', async () => {
    expect(await authorizeSubsystemAcknowledgement({ ...input(), credential: subsystem() }, dependencies()))
      .toEqual({ ok: false, reason: 'invalid_credential' });
    expect(await authorizeSubsystemAcknowledgement(input(), {} as SubsystemAcknowledgementAuthorityDependencies))
      .toEqual({ ok: false, reason: 'authority_unavailable' });
    expect(await authorizeSubsystemAcknowledgement({ ...input(), credential: null }, dependencies()))
      .toEqual({ ok: false, reason: 'invalid_credential' });
  });

  it.each([
    ['another operation', { operationId: 'operation-2' }, 'wrong_operation'],
    ['stale generation', { stopGeneration: 6 }, 'wrong_generation'],
    ['future generation', { stopGeneration: 8 }, 'wrong_generation'],
    ['another target', { target: 'recorder' }, 'wrong_target'],
    ['another principal', { principalId: 'adapter-recorder' }, 'wrong_principal'],
    ['retired worker', { adapterRuntimeId: 'worker-local_media-0' }, 'wrong_adapter_runtime'],
    ['evidence upgrade', { evidenceKind: 'server_component' }, 'wrong_evidence'],
  ] as Array<[string, Record<string, unknown>, string]>)('refuses %s even with an authenticated credential', async (_label, changed, reason) => {
    const principal = { ...subsystem(), ...changed } as AuthenticatedRoomStopSubsystem;
    expect(await authorizeSubsystemAcknowledgement(input(), dependencies(principal))).toEqual({ ok: false, reason });
  });

  it.each([
    { encounterId: 'enc-2' }, { participantId: 'participant-2' }, { runtimeId: 'runtime-2' },
    { agreementVersion: 'agreement-2' }, { consentGeneration: 4 },
  ])('refuses a subsystem from a different bound scope %j', async (changed) => {
    const principal = { ...subsystem(), scope: { ...scope(), ...changed } };
    expect(await authorizeSubsystemAcknowledgement(input(), dependencies(principal)))
      .toEqual({ ok: false, reason: 'wrong_scope' });
  });

  it('does not allow the requested target to widen the authenticated adapter target', async () => {
    expect(await authorizeSubsystemAcknowledgement({ ...input(), target: 'captions' }, dependencies()))
      .toEqual({ ok: false, reason: 'wrong_target' });
  });

  it('fails closed on adapter outage and on a malformed operation', async () => {
    expect(await authorizeSubsystemAcknowledgement(input(), { authenticateSubsystem: async () => { throw new Error('offline'); } }))
      .toEqual({ ok: false, reason: 'authority_unavailable' });
    const dep = dependencies();
    expect(await authorizeSubsystemAcknowledgement({ ...input(), operation: { ...operation(), targets: {} } as RoomStopContract }, dep))
      .toEqual({ ok: false, reason: 'invalid_contract' });
    expect(dep.authenticateSubsystem).not.toHaveBeenCalled();
  });

  it('snapshots the trusted target before an asynchronous authenticator returns', async () => {
    let finish!: (principal: AuthenticatedRoomStopSubsystem) => void;
    const authenticated = new Promise<AuthenticatedRoomStopSubsystem>((resolve) => { finish = resolve; });
    const mutableOperation = JSON.parse(JSON.stringify(operation())) as RoomStopContract;
    const pending = authorizeSubsystemAcknowledgement({ ...input(), operation: mutableOperation },
      { authenticateSubsystem: async () => authenticated });
    (mutableOperation.targetBindings.local_media as { principalId: string }).principalId = 'substituted-principal';
    finish({ ...subsystem(), principalId: 'substituted-principal' });
    expect(await pending).toEqual({ ok: false, reason: 'wrong_principal' });
  });

  it('rejects copied or reconstructed acknowledgement authority at the store boundary', async () => {
    const result = await authorizeSubsystemAcknowledgement(input(), dependencies());
    if (!result.ok) throw new Error(result.reason);
    expect(() => assertVerifiedRoomStopAcknowledgementAuthority(result.authority)).not.toThrow();
    const forged = { ...result.authority };
    expect(isVerifiedRoomStopAcknowledgementAuthority(forged)).toBe(false);
    expect(() => assertVerifiedRoomStopAcknowledgementAuthority(forged))
      .toThrow('UNVERIFIED_ROOM_STOP_ACKNOWLEDGEMENT_AUTHORITY');
  });
});
