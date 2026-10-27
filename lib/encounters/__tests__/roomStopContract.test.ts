import {
  ROOM_STOP_TARGETS,
  acknowledgeRoomStop,
  beginRoomStop,
  decideLateRoomWork,
  summarizeRoomStop,
  type RoomStopContract,
  type RoomStopTarget,
} from '../roomStopContract';

function contract(): RoomStopContract {
  const result = beginRoomStop({
    encounterId: 'enc-1',
    requestedByParticipantId: 'participant-1',
    stopGeneration: 7,
    requestedAt: 100,
    reason: 'participant_withdrawal',
  });
  if (!result.ok) throw new Error(result.reason);
  return result.contract;
}

describe('Encounter room Stop contract', () => {
  it('begins with every subsystem pending and closes late-work admission immediately', () => {
    const stop = contract();
    expect(stop.lateWorkAdmission).toBe('closed');
    expect(summarizeRoomStop(stop)).toEqual({
      status: 'pending',
      pending: [...ROOM_STOP_TARGETS],
      failed: [],
      stopped: [],
    });
    expect(decideLateRoomWork(stop, 'enc-1', 7)).toEqual({ allowed: false, reason: 'stop_requested' });
  });

  it('becomes complete only after every exact target acknowledges stopped', () => {
    let stop = contract();
    for (const target of ROOM_STOP_TARGETS) {
      const result = acknowledgeRoomStop(stop, {
        encounterId: 'enc-1',
        stopGeneration: 7,
        target,
        state: 'stopped',
        acknowledgedAt: 101,
      });
      expect(result.ok).toBe(true);
      if (result.ok) stop = result.contract;
    }
    expect(summarizeRoomStop(stop)).toEqual({
      status: 'complete',
      pending: [],
      failed: [],
      stopped: [...ROOM_STOP_TARGETS],
    });
  });

  it('does not convert an unknown or stale acknowledgement into success', () => {
    const stop = contract();
    const unknown = acknowledgeRoomStop(stop, {
      encounterId: 'enc-1',
      stopGeneration: 7,
      target: 'unknown' as RoomStopTarget,
      state: 'stopped',
      acknowledgedAt: 101,
    });
    expect(unknown).toMatchObject({ ok: false, reason: 'unknown_target' });
    expect(summarizeRoomStop(unknown.contract).pending).toHaveLength(ROOM_STOP_TARGETS.length);

    const stale = acknowledgeRoomStop(stop, {
      encounterId: 'enc-1',
      stopGeneration: 6,
      target: 'signaling',
      state: 'stopped',
      acknowledgedAt: 101,
    });
    expect(stale).toMatchObject({ ok: false, reason: 'wrong_generation' });
    expect(summarizeRoomStop(stale.contract).status).toBe('pending');
  });

  it('keeps a failed acknowledgement failed rather than reporting completion', () => {
    const result = acknowledgeRoomStop(contract(), {
      encounterId: 'enc-1',
      stopGeneration: 7,
      target: 'recorder',
      state: 'failed',
      acknowledgedAt: 101,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.reason);
    expect(summarizeRoomStop(result.contract)).toMatchObject({
      status: 'failed',
      failed: ['recorder'],
    });
  });

  it('refuses a conflicting later acknowledgement for a terminal target state', () => {
    const failed = acknowledgeRoomStop(contract(), {
      encounterId: 'enc-1',
      stopGeneration: 7,
      target: 'captions',
      state: 'failed',
      acknowledgedAt: 101,
    });
    if (!failed.ok) throw new Error(failed.reason);
    const conflict = acknowledgeRoomStop(failed.contract, {
      encounterId: 'enc-1',
      stopGeneration: 7,
      target: 'captions',
      state: 'stopped',
      acknowledgedAt: 102,
    });
    expect(conflict).toMatchObject({ ok: false, reason: 'conflicting_ack' });
    expect(summarizeRoomStop(conflict.contract)).toMatchObject({ status: 'failed', failed: ['captions'] });
  });

  it('refuses malformed Stop requests', () => {
    expect(beginRoomStop({
      encounterId: '',
      requestedByParticipantId: 'participant-1',
      stopGeneration: 7,
      requestedAt: 100,
      reason: 'participant_withdrawal',
    })).toEqual({ ok: false, reason: 'invalid_request' });
  });
});

it('returns deeply frozen contracts so callers cannot manufacture acknowledgements by mutation', () => {
  const stop = contract();
  expect(Object.isFrozen(stop)).toBe(true);
  expect(Object.isFrozen(stop.targets)).toBe(true);
  expect(() => {
    (stop.targets as Record<RoomStopTarget, string>).local_media = 'stopped';
  }).toThrow(TypeError);
  expect(summarizeRoomStop(stop).status).toBe('pending');
});

it('a malformed or caller-reconstructed contract never summarizes as complete', () => {
  const malformed = { ...contract(), targets: {}, lateWorkAdmission: 'open' } as unknown as RoomStopContract;
  expect(summarizeRoomStop(malformed)).toEqual({
    status: 'invalid',
    pending: [...ROOM_STOP_TARGETS],
    failed: [],
    stopped: [],
  });
  expect(decideLateRoomWork(malformed, 'enc-1', 7)).toEqual({ allowed: false, reason: 'invalid_contract' });
});
