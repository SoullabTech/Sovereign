import { NextRequest } from 'next/server';
import { POST as defaultRuntime } from '@/app/api/open/session-room/[roomId]/runtime/route';
import { POST as defaultStop, GET as defaultStatus, PATCH as defaultReport } from '@/app/api/open/session-room/[roomId]/stop/route';
import { GET as defaultSignal, POST as defaultPublish } from '@/app/api/open/session-room/[roomId]/signal/route';
import { GET as defaultTurn } from '@/app/api/open/session-room/[roomId]/turn-credentials/route';
import { createRuntimeHandlers, createStopHandlers, createSignalHandlers, createTurnHandlers,
  RoomRuntimeError, type RoomRuntimeSession, type RoomStopView } from '../roomRuntime';
import { createSignalRelay, type RelaySubscription } from '@/lib/webrtc/signalRelay';

const roomId = '10000000-0000-4000-8000-000000000001';
const runtimeId = '20000000-0000-4000-8000-000000000001';
const participantId = '30000000-0000-4000-8000-000000000001';
const operationId = '40000000-0000-4000-8000-000000000001';
const session: RoomRuntimeSession = {
  scope: { encounterId: roomId, participantId, runtimeId, agreementVersion: 'fictional-v1', consentGeneration: 1 },
  runtimeId, peerId: 'p_' + runtimeId, runtimeCredential: 'fictional-runtime-proof', role: 'guest',
  displayName: 'Fictional participant', expiresAt: Date.now() + 60_000,
};
const observed: RoomStopView = {
  scopeStopped: true, operationId, stopGeneration: 1, operation: null, summary: null,
  coverage: 'other_runtime', physicalMediaVerified: false, reportCredentials: {},
};
const ctx = () => ({ params: Promise.resolve({ roomId }) });
function request(endpoint: string, method = 'GET', body?: unknown, query: Record<string, string> = {}, signal?: AbortSignal) {
  const url = new URL(`http://127.0.0.1/api/open/session-room/${roomId}/${endpoint}`);
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
  return new NextRequest(url, { method, body: body === undefined ? undefined : JSON.stringify(body), signal });
}
function fixture() {
  const service = {
    admit: jest.fn(async () => session), current: jest.fn(async () => session),
    participantAuthority: jest.fn(async () => { throw new Error('Not part of HTTP composition'); }),
    stop: jest.fn(async () => observed), status: jest.fn(async () => observed), report: jest.fn(async () => observed),
    reportOwned: jest.fn(async () => observed), reportNeverStarted: jest.fn(async () => observed),
  };
  const relay = createSignalRelay();
  const intervals = new Map<number, () => void>(); let nextId = 0;
  const timers = {
    setInterval: jest.fn((callback: () => void, _ms: number) => { const id = ++nextId; intervals.set(id, callback); return id; }),
    clearInterval: jest.fn((id: unknown) => { intervals.delete(id as number); }),
    tick: () => { for (const callback of [...intervals.values()]) callback(); },
  };
  const mint = jest.fn(async () => ({ iceServers: [], ttl: 60 }));
  return { service, relay, timers, intervals, mint, runtime: createRuntimeHandlers(service), stop: createStopHandlers(service),
    signal: createSignalHandlers({ service, relay, timers }), turn: createTurnHandlers({ service, mint }) };
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}
const settle = () => new Promise<void>(resolve => setImmediate(resolve));
async function event(reader: ReadableStreamDefaultReader<Uint8Array>) {
  const result = await reader.read();
  if (result.done) return null;
  return JSON.parse(new TextDecoder().decode(result.value).replace(/^data: /, '').trim());
}

describe('R3B-B actual HTTP handler boundary', () => {
  it('uses the URL room and sole threshold token for admission and returns the trusted service identity', async () => {
    const f = fixture();
    const response = await f.runtime.POST(request('runtime', 'POST', { thresholdToken: 'fictional-threshold' }), ctx());
    expect(response.status).toBe(200); expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(f.service.admit).toHaveBeenCalledWith({ encounterId: roomId, thresholdToken: 'fictional-threshold' });
    expect(await response.json()).toEqual(session);
  });

  it.each(['participantId', 'runtimeId', 'role', 'targetBindings', 'profile'])('refuses request-selected %s before admission', async field => {
    const f = fixture();
    const response = await f.runtime.POST(request('runtime', 'POST', { thresholdToken: 'fictional', [field]: 'forged' }), ctx());
    expect(response.status).toBe(400); expect(f.service.admit).not.toHaveBeenCalled();
  });

  it('rejects malformed and oversized runtime JSON before invoking authority', async () => {
    const f = fixture();
    for (const body of ['{', JSON.stringify({ thresholdToken: 'x'.repeat(8192) })]) {
      const response = await f.runtime.POST(new NextRequest(`http://127.0.0.1/${roomId}`, { method: 'POST', body }), ctx());
      expect(response.status).toBe(400);
    }
    expect(f.service.admit).not.toHaveBeenCalled();
  });

  it.each(['CONSENT_REFUSED', 'ROOM_STOPPED', 'EXPIRED_RUNTIME', 'STALE_CONSENT_SCOPE'])('preserves %s refusal at the admission boundary', async code => {
    const f = fixture(); f.service.admit.mockRejectedValue(new RoomRuntimeError(code, 403));
    const response = await f.runtime.POST(request('runtime', 'POST', { thresholdToken: 'fictional' }), ctx());
    expect(response.status).toBe(403); expect(await response.json()).toEqual({ code });
  });

  it('preserves uncertain Stop persistence without claiming confirmation', async () => {
    const f = fixture(); f.service.stop.mockRejectedValue(Object.assign(new Error('lost committed response'), { code: 'COMMIT_OUTCOME_UNKNOWN' }));
    const response = await f.stop.POST(request('stop', 'POST', { runtimeCredential: session.runtimeCredential, requestKey: 'one-stop' }), ctx());
    expect(response.status).toBe(503); expect(await response.json()).toEqual({ code: 'COMMIT_OUTCOME_UNKNOWN' });
    expect(f.service.current).not.toHaveBeenCalled();
    expect(f.service.stop).toHaveBeenCalledWith({ encounterId: roomId, runtimeCredential: session.runtimeCredential, requestKey: 'one-stop' });
  });

  it('does not put a fresh join gate in front of historically bound teardown', async () => {
    const f = fixture(); f.service.current.mockRejectedValue(new RoomRuntimeError('CONSENT_REFUSED'));
    const response = await f.stop.POST(request('stop', 'POST', { runtimeCredential: session.runtimeCredential, requestKey: 'after-revoke' }), ctx());
    expect(response.status).toBe(200); expect(await response.json()).toEqual(observed);
    expect(f.service.current).not.toHaveBeenCalled(); expect(f.service.stop).toHaveBeenCalledTimes(1);
  });

  it('retains other-runtime and physical-verification truth in status', async () => {
    const f = fixture();
    const response = await f.stop.GET(request('stop', 'GET', undefined, { runtimeCredential: session.runtimeCredential }), ctx());
    expect(await response.json()).toEqual(observed);
    expect(f.service.status).toHaveBeenCalledWith({ encounterId: roomId, runtimeCredential: session.runtimeCredential });
  });

  it('passes only exact client-report fields and never invokes trusted owner reporters', async () => {
    const f = fixture(); const body = { runtimeCredential: session.runtimeCredential, operationId, target: 'local_media', credential: 'fictional-report', state: 'stopped' };
    const response = await f.stop.PATCH(request('stop', 'PATCH', body), ctx());
    expect(response.status).toBe(200); expect(f.service.report).toHaveBeenCalledWith({ encounterId: roomId, ...body });
    expect(f.service.reportOwned).not.toHaveBeenCalled(); expect(f.service.reportNeverStarted).not.toHaveBeenCalled();
    const forged = await f.stop.PATCH(request('stop', 'PATCH', { ...body, principalId: 'forged-owner', evidenceKind: 'server_component' }), ctx());
    expect(forged.status).toBe(400); expect(f.service.report).toHaveBeenCalledTimes(1);
  });

  it('preserves report conflict without overwriting it with success', async () => {
    const f = fixture(); f.service.report.mockRejectedValue(Object.assign(new Error('conflict'), { code: 'ACKNOWLEDGEMENT_CONFLICT' }));
    const response = await f.stop.PATCH(request('stop', 'PATCH', { runtimeCredential: session.runtimeCredential, operationId,
      target: 'local_media', credential: 'fictional-report', state: 'failed' }), ctx());
    expect(response.status).toBe(409); expect(await response.json()).toEqual({ code: 'ACKNOWLEDGEMENT_CONFLICT' });
  });

  it.each(['from', 'peerId', 'thresholdToken', 'profile'])('refuses an extra signal %s field before authorization', async field => {
    const f = fixture();
    const response = await f.signal.POST(request('signal', 'POST', { runtimeCredential: session.runtimeCredential, type: 'offer', [field]: 'forged' }), ctx());
    expect(response.status).toBe(400); expect(f.service.current).not.toHaveBeenCalled();
  });

  it.each(['connected', 'ping', 'terminal', 'peer-join'])('refuses a client %s event before relay', async type => {
    const f = fixture();
    const response = await f.signal.POST(request('signal', 'POST', { runtimeCredential: session.runtimeCredential, type }), ctx());
    expect(response.status).toBe(400); expect(f.service.current).not.toHaveBeenCalled();
  });

  it('refuses publication from an authorized runtime without a subscribed sender', async () => {
    const f = fixture();
    const response = await f.signal.POST(request('signal', 'POST', { runtimeCredential: session.runtimeCredential, type: 'offer' }), ctx());
    expect(response.status).toBe(403); expect(await response.json()).toEqual({ code: 'UNBOUND_SIGNAL_SENDER' });
  });

  it('rejects duplicate or extra GET authority parameters across status, signaling and TURN', async () => {
    const f = fixture();
    for (const handler of [f.stop.GET, f.signal.GET, f.turn.GET]) {
      for (const query of ['runtimeCredential=fictional&runtimeCredential=second', 'runtimeCredential=fictional&peerId=forged', 'profile=isolated-simulated']) {
        const response = await handler(new NextRequest(`http://127.0.0.1/${roomId}?${query}`), ctx());
        expect(response.status).toBe(400);
      }
    }
    expect(f.service.current).not.toHaveBeenCalled(); expect(f.service.status).not.toHaveBeenCalled(); expect(f.mint).not.toHaveBeenCalled();
  });

  it('checks current authority before and after a suspended fixture TURN admission', async () => {
    const f = fixture(), pending = deferred<{ iceServers: never[]; ttl: number }>(), entered = deferred<void>();
    f.mint.mockImplementationOnce(() => { entered.resolve(); return pending.promise; });
    const response = f.turn.GET(request('turn-credentials', 'GET', undefined, { runtimeCredential: session.runtimeCredential }), ctx());
    await entered.promise; f.service.current.mockRejectedValue(new RoomRuntimeError('ROOM_STOPPED')); pending.resolve({ iceServers: [], ttl: 60 });
    expect((await response).status).toBe(403); expect(f.service.current).toHaveBeenCalledTimes(2);
    const refused = await f.turn.GET(request('turn-credentials', 'GET', undefined, { runtimeCredential: session.runtimeCredential }), ctx());
    expect(refused.status).toBe(403); expect(f.mint).toHaveBeenCalledTimes(1);
  });

  it('allows only the injected host-only fixture and refuses real relay endpoints', async () => {
    const f = fixture();
    const admitted = await f.turn.GET(request('turn-credentials', 'GET', undefined, { runtimeCredential: session.runtimeCredential }), ctx());
    expect(admitted.status).toBe(200); expect(await admitted.json()).toEqual({ iceServers: [], ttl: 60 });
    const live = createTurnHandlers({ service: f.service, mint: async () => ({ iceServers: [{ urls: 'turn:fictional.invalid', username: 'fake', credential: 'fake' }], ttl: 60 }) });
    const response = await live.GET(request('turn-credentials', 'GET', undefined, { runtimeCredential: session.runtimeCredential }), ctx());
    expect(response.status).toBe(503); expect(await response.json()).toEqual({ code: 'LIVE_RELAY_HELD' });
  });

  it('declares a fifteen-second stream recheck and cleans up on reader cancellation', async () => {
    const f = fixture();
    const response = await f.signal.GET(request('signal', 'GET', undefined, { runtimeCredential: session.runtimeCredential }), ctx());
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    const reader = response.body!.getReader();
    try {
      expect(await event(reader)).toMatchObject({ type: 'connected', from: session.peerId });
      expect(f.timers.setInterval).toHaveBeenCalledWith(expect.any(Function), 15000);
      expect(f.service.current).toHaveBeenCalledTimes(2);
      expect(f.relay.size(roomId)).toBe(1);
    } finally { await reader.cancel(); }
    expect(f.intervals.size).toBe(0); expect(f.relay.size(roomId)).toBe(0); expect(f.timers.clearInterval).toHaveBeenCalledTimes(1);
    await reader.cancel(); expect(f.timers.clearInterval).toHaveBeenCalledTimes(1);
  });

  it('removes the abort listener when subscription setup refuses the stream', async () => {
    const f = fixture(), req = request('signal', 'GET', undefined, { runtimeCredential: session.runtimeCredential });
    const remove = jest.spyOn(req.signal, 'removeEventListener');
    const signal = createSignalHandlers({ service: f.service, timers: f.timers,
      relay: { ...f.relay, subscribe: () => { throw new Error('ROOM_PARTICIPANT_LIMIT'); } } });
    try {
      const response = await signal.GET(req, ctx());
      expect(response.status).toBe(403); expect(await response.json()).toEqual({ code: 'ROOM_PARTICIPANT_LIMIT' });
      expect(remove).toHaveBeenCalledWith('abort', expect.any(Function));
      expect(f.intervals.size).toBe(0); expect(f.relay.size(roomId)).toBe(0);
    } finally { remove.mockRestore(); }
  });

  it('releases the acquired subscription when timer setup throws', async () => {
    const f = fixture(), req = request('signal', 'GET', undefined, { runtimeCredential: session.runtimeCredential });
    const remove = jest.spyOn(req.signal, 'removeEventListener');
    f.timers.setInterval.mockImplementationOnce(() => { throw new Error('fictional timer setup failure'); });
    try {
      const response = await f.signal.GET(req, ctx()); await settle();
      expect(response.status).toBe(503); expect(await response.json()).toEqual({ code: 'PERSISTENCE_FAILED' });
      expect(remove).toHaveBeenCalledWith('abort', expect.any(Function));
      expect(f.intervals.size).toBe(0); expect(f.relay.size(roomId)).toBe(0);
      expect(f.service.current).toHaveBeenCalledTimes(1);
    } finally { remove.mockRestore(); }
  });

  it('attempts every cleanup step even when timer and relay teardown throw', async () => {
    const f = fixture(), req = request('signal', 'GET', undefined, { runtimeCredential: session.runtimeCredential });
    const remove = jest.spyOn(req.signal, 'removeEventListener');
    const unsubscribe = jest.fn((handle: RelaySubscription) => { f.relay.unsubscribe(handle); throw new Error('fictional relay teardown failure'); });
    const signal = createSignalHandlers({ service: f.service, timers: f.timers, relay: { ...f.relay, unsubscribe } });
    const response = await signal.GET(req, ctx()), reader = response.body!.getReader();
    try {
      await event(reader);
      f.timers.clearInterval.mockImplementation(id => { f.intervals.delete(id as number); throw new Error('fictional timer teardown failure'); });
      await reader.cancel();
      expect(unsubscribe).toHaveBeenCalledTimes(1); expect(remove).toHaveBeenCalledWith('abort', expect.any(Function));
      expect(f.intervals.size).toBe(0); expect(f.relay.size(roomId)).toBe(0);
      await reader.cancel(); expect(unsubscribe).toHaveBeenCalledTimes(1); expect(f.timers.clearInterval).toHaveBeenCalledTimes(1);
    } finally { await reader.cancel(); remove.mockRestore(); }
  });

  it('releases a subscription returned after a synchronous abort during setup', async () => {
    const f = fixture(), abort = new AbortController();
    const signal = createSignalHandlers({ service: f.service, timers: f.timers,
      relay: { ...f.relay, subscribe: (admitted, send, authorize) => {
        const handle = f.relay.subscribe(admitted, send, authorize); abort.abort(); return handle;
      } } });
    const response = await signal.GET(request('signal', 'GET', undefined, { runtimeCredential: session.runtimeCredential }, abort.signal), ctx());
    const reader = response.body!.getReader();
    try {
      expect(await event(reader)).toBeNull(); expect(f.intervals.size).toBe(0); expect(f.relay.size(roomId)).toBe(0);
      expect(f.timers.setInterval).not.toHaveBeenCalled();
    } finally { await reader.cancel(); }
  });

  it('serializes heartbeat and relay authorization without deadlocking delivery', async () => {
    const f = fixture(), pending = deferred<RoomRuntimeSession>(), entered = deferred<void>();
    const response = await f.signal.GET(request('signal', 'GET', undefined, { runtimeCredential: session.runtimeCredential }), ctx());
    const reader = response.body!.getReader();
    try {
      await event(reader); const before = f.service.current.mock.calls.length;
      f.service.current.mockImplementationOnce(() => { entered.resolve(); return pending.promise; });
      f.timers.tick(); await entered.promise;
      const published = f.relay.publish(session, { type: 'ice', payload: { candidate: 'fictional' } });
      f.timers.tick(); await settle();
      expect(f.service.current).toHaveBeenCalledTimes(before + 1);
      pending.resolve(session); expect(await published).toBe(0); await settle();
      expect(f.service.current).toHaveBeenCalledTimes(before + 3);
      expect((await event(reader)).type).toBe('ping'); expect((await event(reader)).type).toBe('ping');
    } finally { pending.resolve(session); await reader.cancel(); }
  });

  it('closes a displaced stream while its older authorization is suspended without closing the replacement', async () => {
    const f = fixture(), pending = deferred<RoomRuntimeSession>(), entered = deferred<void>();
    const first = await f.signal.GET(request('signal', 'GET', undefined, { runtimeCredential: session.runtimeCredential }), ctx());
    const reader = first.body!.getReader(); let replacement: ReadableStreamDefaultReader<Uint8Array> | undefined;
    try {
      await event(reader);
      f.service.current.mockImplementationOnce(() => { entered.resolve(); return pending.promise; });
      f.timers.tick(); await entered.promise;
      const second = await f.signal.GET(request('signal', 'GET', undefined, { runtimeCredential: session.runtimeCredential }), ctx());
      replacement = second.body!.getReader(); expect((await event(replacement)).type).toBe('connected');
      f.timers.tick();
      expect(await event(reader)).toMatchObject({ type: 'terminal', payload: { code: 'SIGNAL_SUBSCRIPTION_REPLACED' } });
      expect(await event(reader)).toBeNull(); expect(f.intervals.size).toBe(1); expect(f.relay.size(roomId)).toBe(1);
      pending.resolve(session); await settle();
      expect((await event(replacement)).type).toBe('ping'); expect(f.relay.size(roomId)).toBe(1);
    } finally { pending.resolve(session); await reader.cancel(); await replacement?.cancel(); }
    expect(f.intervals.size).toBe(0); expect(f.relay.size(roomId)).toBe(0);
  });

  it('expires an existing stream at its next heartbeat even when a database check is suspended', async () => {
    const f = fixture(), pending = deferred<RoomRuntimeSession>(), entered = deferred<void>();
    const response = await f.signal.GET(request('signal', 'GET', undefined, { runtimeCredential: session.runtimeCredential }), ctx());
    const reader = response.body!.getReader(); let clock: jest.SpyInstance | undefined;
    try {
      await event(reader);
      f.service.current.mockImplementationOnce(() => { entered.resolve(); return pending.promise; });
      f.timers.tick(); await entered.promise;
      clock = jest.spyOn(Date, 'now').mockReturnValue(session.expiresAt + 1); f.timers.tick();
      expect(await event(reader)).toMatchObject({ type: 'terminal', payload: { code: 'EXPIRED_RUNTIME' } });
      expect(await event(reader)).toBeNull(); expect(f.intervals.size).toBe(0); expect(f.relay.size(roomId)).toBe(0);
      pending.resolve(session); await settle(); expect(await event(reader)).toBeNull();
    } finally { pending.resolve(session); clock?.mockRestore(); await reader.cancel(); }
  });

  it.each(['ROOM_STOPPED', 'CONSENT_REFUSED', 'EXPIRED_RUNTIME', 'ROOM_ENDED'])('closes an existing stream on %s without another ping', async code => {
    const f = fixture();
    const response = await f.signal.GET(request('signal', 'GET', undefined, { runtimeCredential: session.runtimeCredential }), ctx());
    const reader = response.body!.getReader();
    try {
      expect((await event(reader)).type).toBe('connected'); f.service.current.mockRejectedValue(new RoomRuntimeError(code));
      f.timers.tick(); expect(await event(reader)).toEqual({ type: 'terminal', from: '__server', payload: { code } });
      expect(await event(reader)).toBeNull(); expect(f.intervals.size).toBe(0); expect(f.relay.size(roomId)).toBe(0);
    } finally { await reader.cancel(); }
  });

  it('closes an existing stream when authority persistence becomes unavailable', async () => {
    const f = fixture();
    const response = await f.signal.GET(request('signal', 'GET', undefined, { runtimeCredential: session.runtimeCredential }), ctx());
    const reader = response.body!.getReader();
    try {
      await event(reader); f.service.current.mockRejectedValue(new Error('fictional persistence outage')); f.timers.tick();
      expect(await event(reader)).toMatchObject({ type: 'terminal', payload: { code: 'PERSISTENCE_FAILED' } });
      expect(await event(reader)).toBeNull(); expect(f.intervals.size).toBe(0); expect(f.relay.size(roomId)).toBe(0);
    } finally { await reader.cancel(); }
  });

  it('cannot emit a stale heartbeat after abort while authorization is suspended', async () => {
    const f = fixture(), abort = new AbortController(), pending = deferred<RoomRuntimeSession>(), entered = deferred<void>();
    const response = await f.signal.GET(request('signal', 'GET', undefined, { runtimeCredential: session.runtimeCredential }, abort.signal), ctx());
    const reader = response.body!.getReader();
    try {
      await event(reader);
      f.service.current.mockImplementationOnce(() => { entered.resolve(); return pending.promise; });
      f.timers.tick(); await entered.promise; abort.abort(); pending.resolve(session); await settle();
      expect(await event(reader)).toBeNull(); expect(f.intervals.size).toBe(0); expect(f.relay.size(roomId)).toBe(0);
    } finally { pending.resolve(session); await reader.cancel(); }
  });

  it('keeps every exported default closed with a syntactically valid request', async () => {
    const responses = [
      await defaultRuntime(request('runtime', 'POST', { thresholdToken: 'fictional' }), ctx()),
      await defaultStop(request('stop', 'POST', { runtimeCredential: 'fictional', requestKey: 'stop' }), ctx()),
      await defaultStatus(request('stop', 'GET', undefined, { runtimeCredential: 'fictional' }), ctx()),
      await defaultReport(request('stop', 'PATCH', { runtimeCredential: 'fictional', operationId, target: 'local_media', credential: 'fictional', state: 'stopped' }), ctx()),
      await defaultSignal(request('signal', 'GET', undefined, { runtimeCredential: 'fictional' }), ctx()),
      await defaultPublish(request('signal', 'POST', { runtimeCredential: 'fictional', type: 'offer' }), ctx()),
      await defaultTurn(request('turn-credentials', 'GET', undefined, { runtimeCredential: 'fictional' }), ctx()),
    ];
    for (const response of responses) {
      expect(response.status).toBe(503); expect(await response.json()).toEqual({ code: 'ROOM_INTEGRATION_HELD' });
    }
  });
});
