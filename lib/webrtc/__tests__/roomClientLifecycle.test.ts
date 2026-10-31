import { createRoomClientLifecycle, type RoomClientDependencies, type RoomClientSession,
  type RoomClientSignal, type RoomClientStopReceipt } from '../roomClientLifecycle';
import { beginRoomStop, ROOM_STOP_TARGETS, type RoomStopTargetBindings } from '../../encounters/roomStopContract';

function deferred<T>() {
  let resolve!: (value: T) => void; let reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const tick = async () => { for (let i = 0; i < 12; i += 1) await Promise.resolve(); };
const session: RoomClientSession = { runtimeId: 'runtime-one', peerId: 'peer-one', runtimeCredential: 'fictional-runtime', role: 'practitioner', displayName: 'Fictional guide' };
function confirmed(runtimeId = session.runtimeId): RoomClientStopReceipt {
  const result = beginRoomStop({ operationId: 'stop-one', requestKey: 'request-one',
    scope: { encounterId: 'encounter-one', participantId: 'participant-one', agreementVersion: 'v1', consentGeneration: 1, runtimeId },
    stopGeneration: 1, requestedByParticipantId: 'participant-one', requestedAt: 1, reason: 'participant_withdrawal',
    targetBindings: Object.fromEntries(ROOM_STOP_TARGETS.map(target => [target,
      { principalId: `fixture-${target}`, adapterRuntimeId: `${runtimeId}-${target}`, evidenceKind: 'simulated' }])) as RoomStopTargetBindings });
  if (!result.ok) throw new Error('fixture invalid');
  return { stopRecorded: true, operation: result.contract, coverage: 'origin_runtime', physicalMediaVerified: false,
    receiptCredentials: { local_media: 'fictional-local', remote_media: 'fictional-incoming' } };
}
function fixture(override: Partial<RoomClientDependencies> = {}) {
  const local = { stop: jest.fn() } as unknown as MediaStreamTrack;
  const remote = { stop: jest.fn() } as unknown as MediaStreamTrack;
  const stream = { getTracks: () => [local] } as unknown as MediaStream;
  const incoming = { getTracks: () => [remote] } as unknown as MediaStream;
  const audio = { pause: jest.fn(), play: jest.fn().mockResolvedValue(undefined), srcObject: null } as unknown as HTMLAudioElement;
  const pc = {
    close: jest.fn(), addTrack: jest.fn(), getSenders: () => [{ track: local }], getReceivers: () => [{ track: remote }],
    createOffer: jest.fn().mockResolvedValue({ type: 'offer', sdp: 'fictional' }),
    createAnswer: jest.fn().mockResolvedValue({ type: 'answer', sdp: 'fictional' }),
    setLocalDescription: jest.fn().mockResolvedValue(undefined), setRemoteDescription: jest.fn().mockResolvedValue(undefined),
    addIceCandidate: jest.fn().mockResolvedValue(undefined), getStats: jest.fn().mockResolvedValue(new Map()),
    connectionState: 'new', ontrack: null, onicecandidate: null, onconnectionstatechange: null, oniceconnectionstatechange: null,
  } as unknown as RTCPeerConnection;
  let onMessage!: (message: RoomClientSignal) => void; let onFailure!: () => void;
  const channel = { close: jest.fn() };
  const deps: RoomClientDependencies = {
    admit: jest.fn().mockResolvedValue(session), loadIce: jest.fn().mockResolvedValue([]),
    capture: jest.fn().mockResolvedValue(stream), createPeer: jest.fn().mockReturnValue(pc), audio: () => audio,
    connectSignals: jest.fn((_session, message, failed) => { onMessage = message; onFailure = failed; message({ type: 'connected' }); return channel; }),
    publish: jest.fn().mockResolvedValue(undefined), persistStop: jest.fn().mockResolvedValue(confirmed()),
    report: jest.fn().mockResolvedValue(undefined), status: jest.fn().mockResolvedValue(confirmed()),
    onChange: jest.fn(), requestKey: 'request-one', ...override,
  };
  const lifecycle = createRoomClientLifecycle(deps);
  return { lifecycle, deps, local, remote, stream, incoming, audio, pc, channel,
    message: (value: RoomClientSignal) => onMessage(value), failed: () => onFailure(),
    attach: () => pc.ontrack!.call(pc, { streams: [incoming], track: remote } as unknown as RTCTrackEvent) };
}

describe('terminal Session Room browser lifecycle', () => {
  afterEach(() => { jest.useRealTimers(); });

  it('waits for both fresh admission and authorized transport before capture', async () => {
    const admission = deferred<RoomClientSession>(); const ice = deferred<RTCIceServer[]>();
    const f = fixture({ admit: () => admission.promise, loadIce: () => ice.promise });
    const started = f.lifecycle.start();
    expect(f.deps.capture).not.toHaveBeenCalled(); admission.resolve(session); await tick();
    expect(f.deps.capture).not.toHaveBeenCalled(); ice.resolve([]); await started;
    expect(f.deps.capture).toHaveBeenCalledTimes(1); expect(f.lifecycle.snapshot().phase).toBe('active'); f.lifecycle.dispose();
  });

  it('opens no media, peer or stream after admission refusal', async () => {
    const f = fixture({ admit: jest.fn().mockRejectedValue(new Error('consent refused')) });
    await f.lifecycle.start();
    expect(f.deps.capture).not.toHaveBeenCalled(); expect(f.deps.createPeer).not.toHaveBeenCalled();
    expect(f.deps.connectSignals).not.toHaveBeenCalled(); expect(f.lifecycle.snapshot().phase).toBe('refused');
  });

  it('does not convert TURN refusal into host-only permission', async () => {
    const f = fixture({ loadIce: jest.fn().mockRejectedValue(new Error('Stop recorded')) });
    await f.lifecycle.start(); expect(f.deps.capture).not.toHaveBeenCalled(); expect(f.deps.createPeer).not.toHaveBeenCalled();
    expect(f.lifecycle.snapshot().phase).toBe('refused');
  });

  it('closes tracks, playback, peer and SSE before waiting on durable Stop', async () => {
    const pending = deferred<RoomClientStopReceipt>(); const f = fixture({ persistStop: () => pending.promise });
    await f.lifecycle.start(); f.attach(); await tick(); const stopped = f.lifecycle.stop();
    expect(f.local.stop).toHaveBeenCalled(); expect(f.remote.stop).toHaveBeenCalled();
    expect(f.audio.pause).toHaveBeenCalled(); expect(f.audio.srcObject).toBeNull();
    expect(f.pc.close).toHaveBeenCalledTimes(1); expect(f.channel.close).toHaveBeenCalledTimes(1);
    expect(f.lifecycle.snapshot().durableStop).toBe('pending'); pending.reject(new Error('response lost')); await stopped;
    expect(f.lifecycle.snapshot().durableStop).toBe('unknown'); expect(f.lifecycle.snapshot().phase).toBe('stopped');
  });

  it('leaves capture acknowledgement pending until a late capture is actually disposed', async () => {
    const pending = deferred<MediaStream>(); const f = fixture({ capture: () => pending.promise });
    const start = f.lifecycle.start(); await tick(); await f.lifecycle.stop();
    expect(f.lifecycle.snapshot().localTeardown).toBe('pending');
    expect((f.deps.report as jest.Mock).mock.calls.some(call => call[2] === 'local_media')).toBe(false);
    pending.resolve(f.stream); await start; await tick();
    expect(f.local.stop).toHaveBeenCalled(); expect(f.deps.createPeer).not.toHaveBeenCalled();
    expect(f.lifecycle.snapshot().localTeardown).toBe('stopped');
    expect((f.deps.report as jest.Mock).mock.calls.some(call => call[2] === 'local_media' && call[3] === 'stopped')).toBe(true);
  });

  it('settles a pending admission after local Stop without acquiring media', async () => {
    const pending = deferred<RoomClientSession>(); const f = fixture({ admit: () => pending.promise });
    const start = f.lifecycle.start(); await f.lifecycle.stop(); pending.resolve(session); await start;
    expect(f.deps.capture).not.toHaveBeenCalled(); expect(f.deps.persistStop).toHaveBeenCalledTimes(1);
    expect(f.lifecycle.snapshot().runtimeId).toBe(session.runtimeId); expect(f.lifecycle.snapshot().phase).toBe('stopped');
  });

  it('does not set or publish an offer resolved after Stop', async () => {
    const pending = deferred<RTCSessionDescriptionInit>(); const f = fixture();
    (f.pc.createOffer as jest.Mock).mockReturnValue(pending.promise);
    await f.lifecycle.start(); const offer = f.lifecycle.receive({ type: 'peer-join', from: 'peer-two' });
    await f.lifecycle.stop(); pending.resolve({ type: 'offer', sdp: 'late' }); await offer;
    expect(f.pc.setLocalDescription).not.toHaveBeenCalled(); expect(f.deps.publish).not.toHaveBeenCalled();
  });

  it('does not publish after a late local-description completion', async () => {
    const pending = deferred<void>(); const f = fixture(); (f.pc.setLocalDescription as jest.Mock).mockReturnValue(pending.promise);
    await f.lifecycle.start(); const offer = f.lifecycle.receive({ type: 'peer-join', from: 'peer-two' }); await tick();
    await f.lifecycle.stop(); pending.resolve(); await offer; expect(f.deps.publish).not.toHaveBeenCalled();
  });

  it('does not create an answer after a late remote-description completion', async () => {
    const pending = deferred<void>(); const f = fixture(); (f.pc.setRemoteDescription as jest.Mock).mockReturnValue(pending.promise);
    await f.lifecycle.start(); const answer = f.lifecycle.receive({ type: 'offer', from: 'peer-two', payload: { type: 'offer' } });
    await f.lifecycle.stop(); pending.resolve(); await answer;
    expect(f.pc.createAnswer).not.toHaveBeenCalled(); expect(f.deps.publish).not.toHaveBeenCalled();
  });

  it('keeps incoming report pending until late play completion is detached', async () => {
    const pending = deferred<void>(); const f = fixture(); (f.audio.play as jest.Mock).mockReturnValue(pending.promise);
    await f.lifecycle.start(); f.attach(); await tick(); await f.lifecycle.stop();
    expect(f.lifecycle.snapshot().remoteTeardown).toBe('pending'); pending.resolve(); await tick();
    expect(f.audio.srcObject).toBeNull(); expect(f.lifecycle.snapshot().playback).toBe('stopped');
    expect(f.lifecycle.snapshot().remoteTeardown).toBe('stopped');
  });

  it('re-pauses a detached old element when pending playback fulfills after Stop', async () => {
    const pending = deferred<void>(); const f = fixture(); let paused = true;
    (f.audio.pause as jest.Mock).mockImplementation(() => { paused = true; });
    (f.audio.play as jest.Mock).mockImplementation(() => pending.promise.then(() => { paused = false; }));
    await f.lifecycle.start(); f.attach(); await tick(); await f.lifecycle.stop();
    expect(paused).toBe(true); expect(f.audio.srcObject).toBeNull();
    expect(f.lifecycle.snapshot().remoteTeardown).toBe('pending');
    pending.resolve(); await tick();
    expect(paused).toBe(true); expect(f.audio.srcObject).toBeNull();
    expect(f.lifecycle.snapshot().remoteTeardown).toBe('stopped');
  });

  it('an old play completion cannot pause or detach a newer runtime on the same element', async () => {
    const pending = deferred<void>(); const old = fixture(); (old.audio.play as jest.Mock).mockReturnValue(pending.promise);
    await old.lifecycle.start(); old.attach(); await tick(); old.lifecycle.dispose();
    const newerTrack = { stop: jest.fn() }; const newerStream = { getTracks: () => [newerTrack] } as unknown as MediaStream;
    old.audio.srcObject = newerStream; const pauses = (old.audio.pause as jest.Mock).mock.calls.length;
    pending.resolve(); await tick();
    expect(old.audio.srcObject).toBe(newerStream); expect(newerTrack.stop).not.toHaveBeenCalled();
    expect((old.audio.pause as jest.Mock).mock.calls.length).toBe(pauses);
  });

  it('a failed incoming view lookup still closes local resources and reports failure', async () => {
    const f = fixture({ audio: () => { throw new Error('view unavailable'); } }); await f.lifecycle.start(); f.attach(); await tick();
    expect(f.local.stop).toHaveBeenCalled(); expect(f.pc.close).toHaveBeenCalled();
    expect(f.lifecycle.snapshot().remoteTeardown).toBe('failed');
  });

  it('disposes a late receiver event even if an old handler is retained', async () => {
    const f = fixture(); await f.lifecycle.start(); const handler = f.pc.ontrack!; await f.lifecycle.stop();
    handler.call(f.pc, { streams: [f.incoming], track: f.remote } as unknown as RTCTrackEvent);
    expect(f.audio.srcObject).toBeNull(); expect(f.remote.stop).toHaveBeenCalled(); expect(f.audio.play).not.toHaveBeenCalled();
  });

  it('closes on control loss without automatic reconnect', async () => {
    const f = fixture(); await f.lifecycle.start(); f.failed(); await tick();
    expect(f.pc.close).toHaveBeenCalled(); expect(f.lifecycle.snapshot().reason).toBe('control_lost');
    expect(f.deps.connectSignals).toHaveBeenCalledTimes(1); await expect(f.lifecycle.start()).rejects.toThrow('ROOM_ATTEMPT_TERMINAL_OR_STARTED');
  });

  it('closes on the bounded heartbeat deadline', async () => {
    jest.useFakeTimers(); const f = fixture({ heartbeatTimeoutMs: 1000 }); await f.lifecycle.start();
    jest.advanceTimersByTime(1000); await tick();
    expect(f.lifecycle.snapshot().reason).toBe('control_timeout'); expect(f.channel.close).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
  });

  it('refuses an unsuccessful signal POST and closes owned media', async () => {
    const f = fixture({ publish: jest.fn().mockRejectedValue(new Error('403')) });
    await f.lifecycle.start(); await f.lifecycle.receive({ type: 'peer-present', from: 'peer-two' });
    expect(f.lifecycle.snapshot().reason).toBe('signal_refused'); expect(f.local.stop).toHaveBeenCalled();
  });

  it('observes another runtime Stop without borrowing its detailed reports', async () => {
    const f = fixture({ status: jest.fn().mockResolvedValue({ stopRecorded: true, operation: null, coverage: 'other_runtime', physicalMediaVerified: false }) });
    await f.lifecycle.start(); await f.lifecycle.receive({ type: 'room-stopped' });
    expect(f.lifecycle.snapshot().coverage).toBe('other_runtime'); expect(f.lifecycle.snapshot().durableStop).toBe('confirmed');
    expect(f.deps.report).not.toHaveBeenCalled(); expect(f.lifecycle.snapshot().physicalMediaVerified).toBe(false);
  });

  it('rejects another runtime detailed roster and component report credentials', async () => {
    const f = fixture({ status: jest.fn().mockResolvedValue({ ...confirmed('runtime-other'), coverage: 'other_runtime' }) });
    await f.lifecycle.start(); await f.lifecycle.receive({ type: 'room-stopped' });
    expect(f.lifecycle.snapshot().operation).toBeNull(); expect(f.lifecycle.snapshot().durableStop).toBe('unknown');
    expect(f.deps.report).not.toHaveBeenCalled();
  });

  it('reconciles unknown persistence with the identical immutable request key', async () => {
    const persist = jest.fn().mockRejectedValueOnce(new Error('lost COMMIT reply')).mockResolvedValue(confirmed());
    const f = fixture({ persistStop: persist, status: jest.fn().mockResolvedValue({
      stopRecorded: false, operation: null, coverage: 'none', physicalMediaVerified: false,
    }) }); await f.lifecycle.start(); await f.lifecycle.stop();
    expect(f.lifecycle.snapshot().durableStop).toBe('unknown'); await f.lifecycle.reconcile();
    expect(persist.mock.calls.map(call => call[1])).toEqual(['request-one', 'request-one']);
    expect(f.lifecycle.snapshot().durableStop).toBe('confirmed'); expect(f.lifecycle.snapshot().phase).toBe('stopped');
  });

  it('reconciles a conflicting second-runtime request from the existing participant Stop', async () => {
    const f = fixture({ persistStop: jest.fn().mockRejectedValue(Object.assign(new Error('conflict'), { code: 'STOP_REQUEST_CONFLICT' })),
      status: jest.fn().mockResolvedValue({ stopRecorded: true, operation: null, coverage: 'other_runtime', physicalMediaVerified: false }) });
    await f.lifecycle.start(); await f.lifecycle.stop(); await f.lifecycle.reconcile();
    expect(f.deps.persistStop).toHaveBeenCalledTimes(1); expect(f.deps.report).not.toHaveBeenCalled();
    expect(f.lifecycle.snapshot().durableStop).toBe('confirmed'); expect(f.lifecycle.snapshot().coverage).toBe('other_runtime');
  });

  it('does not call a failed persistence response a confirmed Stop', async () => {
    const error = Object.assign(new Error('rollback'), { code: 'PERSISTENCE_FAILED' });
    const f = fixture({ persistStop: jest.fn().mockRejectedValue(error) }); await f.lifecycle.start(); await f.lifecycle.stop();
    expect(f.lifecycle.snapshot().durableStop).toBe('failed'); expect(f.deps.report).not.toHaveBeenCalled();
  });

  it('does not treat cleanup failure as a successful component report', async () => {
    const f = fixture(); (f.local.stop as jest.Mock).mockImplementation(() => { throw new Error('adapter failure'); });
    await f.lifecycle.start(); await f.lifecycle.stop();
    expect(f.lifecycle.snapshot().localTeardown).toBe('failed');
    expect((f.deps.report as jest.Mock).mock.calls.some(call => call[2] === 'local_media' && call[3] === 'failed')).toBe(true);
  });

  it('unmount disposes capture that resolves afterwards without a view update', async () => {
    const pending = deferred<MediaStream>(); const f = fixture({ capture: () => pending.promise });
    const start = f.lifecycle.start(); await tick(); f.lifecycle.dispose(); const calls = (f.deps.onChange as jest.Mock).mock.calls.length;
    pending.resolve(f.stream); await start;
    expect(f.local.stop).toHaveBeenCalled(); expect(f.deps.createPeer).not.toHaveBeenCalled();
    expect((f.deps.onChange as jest.Mock).mock.calls.length).toBe(calls);
  });

  it('late stats never repaint a stopped connection', async () => {
    const pending = deferred<RTCStatsReport>(); const f = fixture(); (f.pc.getStats as jest.Mock).mockReturnValue(pending.promise);
    await f.lifecycle.start(); Object.defineProperty(f.pc, 'connectionState', { value: 'connected' });
    f.pc.onconnectionstatechange!.call(f.pc, new Event('connectionstatechange')); await f.lifecycle.stop();
    pending.resolve(new Map([['a', { id: 'a', type: 'candidate-pair', nominated: true, state: 'succeeded', localCandidateId: 'x', remoteCandidateId: 'y' }]]) as unknown as RTCStatsReport);
    await tick(); expect(f.lifecycle.snapshot().connection).toBe('closed'); expect(f.lifecycle.snapshot().connectedVia).toBeNull();
  });

  it('rejects a receipt claiming another origin runtime or physical proof', async () => {
    const f = fixture({ persistStop: jest.fn().mockResolvedValue(confirmed('another-runtime')) });
    await f.lifecycle.start(); await f.lifecycle.stop(); expect(f.lifecycle.snapshot().durableStop).toBe('unknown');
    expect(f.deps.report).not.toHaveBeenCalled(); expect(f.lifecycle.snapshot().physicalMediaVerified).toBe(false);
  });
});
