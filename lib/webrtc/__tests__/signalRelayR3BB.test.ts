import { createSignalRelay, type SignalMessage } from '../signalRelay';
import type { RoomRuntimeSession } from '../../encounters/roomRuntime';

const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
function session(participant = 1, runtime = participant, encounter = 100): RoomRuntimeSession {
  return {
    scope: { encounterId: uuid(encounter), participantId: uuid(participant), agreementVersion: 'fictional-v1',
      consentGeneration: 1, runtimeId: uuid(runtime + 1000) },
    runtimeId: uuid(runtime + 1000), peerId: 'p_' + uuid(runtime + 1000),
    runtimeCredential: `fictional-credential-${runtime}`, role: 'guest', displayName: 'Fictional participant',
    expiresAt: Date.now() + 60_000,
  };
}
const allowed = async () => true;
const settle = () => new Promise<void>(resolve => setImmediate(resolve));
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}
function paired() {
  const relay = createSignalRelay(), a = session(1), b = session(2);
  const fromA = jest.fn<void, [SignalMessage]>(), fromB = jest.fn<void, [SignalMessage]>();
  const authorizeA = jest.fn(allowed), authorizeB = jest.fn(allowed);
  const handleA = relay.subscribe(a, fromA, authorizeA), handleB = relay.subscribe(b, fromB, authorizeB);
  return { relay, a, b, fromA, fromB, authorizeA, authorizeB, handleA, handleB };
}

describe('R3B-B local relay identity and lifetime boundary', () => {
  it('keeps instances independent and requires an explicit fresh authority adapter', async () => {
    const relay = createSignalRelay(), a = session();
    relay.subscribe(a, jest.fn());
    expect(createSignalRelay().size(a.scope.encounterId)).toBe(0);
    await expect(relay.publish(a, { type: 'peer-leave' })).rejects.toThrow('SIGNAL_SENDER_REFUSED');
    expect(relay.size(a.scope.encounterId)).toBe(0);
  });

  it('refuses a session whose peer identity is not derived from its runtime', () => {
    const relay = createSignalRelay(), a = session();
    expect(() => relay.subscribe({ ...a, peerId: 'chosen-by-client' }, jest.fn(), allowed)).toThrow('INVALID_RELAY_SESSION');
    expect(() => relay.subscribe({ ...a, runtimeId: uuid(9999) }, jest.fn(), allowed)).toThrow('INVALID_RELAY_SESSION');
  });

  it('reports current ownership only for the exact active subscription handle', () => {
    const relay = createSignalRelay(), a = session();
    const original = relay.subscribe(a, jest.fn(), allowed);
    expect(relay.isCurrent(original)).toBe(true);
    expect(relay.isCurrent({ ...original })).toBe(false);
    const replacement = relay.subscribe(a, jest.fn(), allowed);
    expect(relay.isCurrent(original)).toBe(false); expect(relay.isCurrent(replacement)).toBe(true);
    relay.unsubscribe(original); expect(relay.isCurrent(replacement)).toBe(true);
    relay.closeScope(a.scope); expect(relay.isCurrent(replacement)).toBe(false);
  });

  it('derives allowed sender identity and does not copy runtime or threshold credentials', async () => {
    const f = paired(); await settle(); f.fromB.mockClear();
    await expect(f.relay.publish(f.a, { type: 'answer', to: f.b.peerId, payload: { sdp: 'fictional' } })).resolves.toBe(1);
    expect(f.fromB).toHaveBeenCalledWith({ type: 'answer', from: f.a.peerId, to: f.b.peerId, payload: { sdp: 'fictional' } });
    const sent = JSON.stringify(f.fromB.mock.calls);
    expect(sent).not.toContain('runtimeCredential'); expect(sent).not.toContain('thresholdToken');
    expect(sent).not.toContain(f.a.runtimeCredential);
  });

  it.each(['connected', 'ping', 'terminal', 'peer-join', 'peer-present'])('refuses client-authored %s control events', async type => {
    const f = paired(); await settle(); f.fromB.mockClear();
    await expect(f.relay.publish(f.a, { type } as any)).rejects.toThrow('INVALID_CLIENT_SIGNAL');
    expect(f.fromB).not.toHaveBeenCalled();
  });

  it.each(['from', 'peerId', 'runtimeCredential', 'thresholdToken'])('refuses a client-selected %s field', async field => {
    const f = paired(); await settle(); f.fromB.mockClear();
    await expect(f.relay.publish(f.a, { type: 'offer', to: f.b.peerId, [field]: 'forged' } as any))
      .rejects.toThrow('INVALID_CLIENT_SIGNAL');
    expect(f.fromB).not.toHaveBeenCalled();
  });

  it('refuses unregistered senders and substituted credentials for a registered sender', async () => {
    const f = paired(); await settle();
    await expect(f.relay.publish(session(1, 9), { type: 'offer' })).rejects.toThrow('UNBOUND_SIGNAL_SENDER');
    await expect(f.relay.publish({ ...f.a, runtimeCredential: 'forged' }, { type: 'offer' }))
      .rejects.toThrow('UNBOUND_SIGNAL_SENDER');
  });

  it('refuses destinations outside the room or belonging to another runtime of the same participant', async () => {
    const f = paired(), sibling = session(1, 3), foreign = session(2, 4, 200);
    f.relay.subscribe(sibling, jest.fn(), allowed); f.relay.subscribe(foreign, jest.fn(), allowed); await settle();
    for (const to of ['unknown-peer', sibling.peerId, foreign.peerId]) {
      await expect(f.relay.publish(f.a, { type: 'ice', to, payload: {} })).rejects.toThrow('SIGNAL_RECIPIENT_REFUSED');
    }
  });

  it('does not deliver membership or client messages across consent generations', async () => {
    const relay = createSignalRelay(), a = session(1), b = session(2);
    b.scope = { ...b.scope, consentGeneration: 2 };
    const first = jest.fn(), second = jest.fn();
    relay.subscribe(a, first, allowed); relay.subscribe(b, second, allowed); await settle();
    expect(first).not.toHaveBeenCalled(); expect(second).not.toHaveBeenCalled();
    await expect(relay.publish(a, { type: 'offer', to: b.peerId })).rejects.toThrow('SIGNAL_RECIPIENT_REFUSED');
  });

  it('counts participants rather than runtimes for the two-person local room limit', () => {
    const relay = createSignalRelay();
    for (const s of [session(1, 1), session(1, 3), session(2, 2)]) relay.subscribe(s, jest.fn(), allowed);
    expect(() => relay.subscribe(session(3, 4), jest.fn(), allowed)).toThrow('ROOM_PARTICIPANT_LIMIT');
    expect(relay.size(uuid(100))).toBe(3);
  });

  it('checks receiver authority again immediately before queued delivery', async () => {
    const f = paired(); await settle(); f.fromB.mockClear(); f.authorizeB.mockResolvedValue(false);
    await expect(f.relay.publish(f.a, { type: 'offer', to: f.b.peerId })).resolves.toBe(0);
    expect(f.fromB).not.toHaveBeenCalled(); expect(f.relay.size(f.a.scope.encounterId)).toBe(1);
  });

  it('closes a receiver when its authority lookup fails', async () => {
    const f = paired(); await settle(); f.fromB.mockClear(); f.authorizeB.mockRejectedValue(new Error('fictional database outage'));
    await expect(f.relay.publish(f.a, { type: 'offer', to: f.b.peerId })).resolves.toBe(0);
    expect(f.fromB).not.toHaveBeenCalled(); expect(f.relay.size(f.a.scope.encounterId)).toBe(1);
  });

  it('closes a sender when a fresh authority lookup fails', async () => {
    const f = paired(); await settle(); f.fromB.mockClear(); f.authorizeA.mockRejectedValue(new Error('fictional database outage'));
    await expect(f.relay.publish(f.a, { type: 'offer', to: f.b.peerId })).rejects.toThrow();
    expect(f.fromB).not.toHaveBeenCalled(); expect(f.relay.size(f.a.scope.encounterId)).toBe(1);
  });

  it('does not let a stale awaited send or unsubscribe close a replacement subscription', async () => {
    const f = paired(); await settle(); f.fromB.mockClear();
    const gate = deferred<boolean>(), entered = deferred<void>();
    f.authorizeB.mockImplementationOnce(() => { entered.resolve(); return gate.promise; });
    const publishing = f.relay.publish(f.a, { type: 'offer', to: f.b.peerId }); await entered.promise;
    const replacementSend = jest.fn();
    const replacement = f.relay.subscribe(f.b, replacementSend, allowed);
    f.relay.unsubscribe(f.handleB); gate.resolve(true);
    await expect(publishing).resolves.toBe(0); await settle();
    expect(f.fromB).not.toHaveBeenCalled();
    expect(replacementSend.mock.calls.some(([message]) => message.type === 'offer')).toBe(false);
    expect(f.relay.size(f.a.scope.encounterId)).toBe(2);
    await expect(f.relay.publish(f.a, { type: 'answer', to: f.b.peerId })).resolves.toBe(1);
    f.relay.unsubscribe(replacement); expect(f.relay.size(f.a.scope.encounterId)).toBe(1);
  });

  it.each(['removed', 'replaced'] as const)('suppresses a queued client message after its exact sender is %s', async action => {
    const f = paired(); await settle(); f.fromB.mockClear();
    const gate = deferred<boolean>(), entered = deferred<void>();
    f.authorizeB.mockImplementationOnce(() => { entered.resolve(); return gate.promise; });
    const publishing = f.relay.publish(f.a, { type: 'offer', to: f.b.peerId }); await entered.promise;
    if (action === 'removed') f.relay.closeRuntime(f.a);
    else f.relay.subscribe(f.a, jest.fn(), allowed);
    gate.resolve(true);
    await expect(publishing).resolves.toBe(0); await settle();
    expect(f.fromB.mock.calls.some(([message]) => message.type === 'offer')).toBe(false);
    expect(f.relay.size(f.a.scope.encounterId)).toBe(action === 'removed' ? 1 : 2);
  });

  it.each(['refused', 'unavailable'] as const)('rechecks a %s sender after the recipient authorization wait', async outcome => {
    const f = paired(); await settle(); f.fromB.mockClear();
    const gate = deferred<boolean>(), entered = deferred<void>();
    f.authorizeB.mockImplementationOnce(() => { entered.resolve(); return gate.promise; });
    const publishing = f.relay.publish(f.a, { type: 'ice', to: f.b.peerId, payload: {} }); await entered.promise;
    if (outcome === 'refused') f.authorizeA.mockResolvedValue(false);
    else f.authorizeA.mockRejectedValue(new Error('fictional sender authority outage'));
    gate.resolve(true);
    await expect(publishing).resolves.toBe(0);
    expect(f.fromB).not.toHaveBeenCalled(); expect(f.relay.size(f.a.scope.encounterId)).toBe(1);
  });

  it.each(['removed', 'replaced'] as const)('does not announce a queued membership from an origin that was %s', async action => {
    const relay = createSignalRelay(), a = session(1), b = session(2);
    const gate = deferred<boolean>(), entered = deferred<void>(), sendB = jest.fn<void, [SignalMessage]>();
    const authorizeB = jest.fn(allowed).mockImplementationOnce(() => { entered.resolve(); return gate.promise; });
    relay.subscribe(a, jest.fn(), allowed); relay.subscribe(b, sendB, authorizeB);
    await entered.promise;
    if (action === 'removed') relay.closeRuntime(a);
    else relay.subscribe(a, jest.fn(), allowed);
    gate.resolve(true); await settle();
    expect(sendB.mock.calls.some(([message]) => message.type === 'peer-present' && message.from === a.peerId)).toBe(false);
    if (action === 'replaced') expect(sendB).toHaveBeenCalledWith({ type: 'peer-join', from: a.peerId });
    else expect(sendB).not.toHaveBeenCalled();
  });

  it('does not announce a peer whose authority is refused before queued membership delivery', async () => {
    const relay = createSignalRelay(), a = session(1), b = session(2), sendB = jest.fn();
    relay.subscribe(a, jest.fn(), async () => false); relay.subscribe(b, sendB, allowed);
    await settle();
    expect(sendB).not.toHaveBeenCalled(); expect(relay.size(a.scope.encounterId)).toBe(1);
  });

  it('suppresses a departure queued before the same runtime reconnects', async () => {
    const f = paired(); await settle(); f.fromB.mockClear();
    const gate = deferred<boolean>(), entered = deferred<void>();
    f.authorizeB.mockImplementationOnce(() => { entered.resolve(); return gate.promise; });
    f.relay.unsubscribe(f.handleA); await entered.promise;
    f.relay.subscribe(f.a, jest.fn(), allowed); gate.resolve(true); await settle();
    expect(f.fromB.mock.calls.some(([message]) => message.type === 'peer-leave')).toBe(false);
    expect(f.fromB).toHaveBeenCalledWith({ type: 'peer-join', from: f.a.peerId });
    expect(f.relay.size(f.a.scope.encounterId)).toBe(2);
  });

  it('still delivers an ordinary departure after the sender has left', async () => {
    const f = paired(); await settle(); f.fromB.mockClear();
    f.relay.unsubscribe(f.handleA); await settle();
    expect(f.fromB).toHaveBeenCalledTimes(1);
    expect(f.fromB).toHaveBeenCalledWith({ type: 'peer-leave', from: f.a.peerId });
    expect(f.relay.size(f.a.scope.encounterId)).toBe(1);
  });

  it('removes a recipient whose enqueue callback throws', async () => {
    const f = paired(); await settle(); f.fromB.mockImplementation(() => { throw new Error('closed stream'); });
    await expect(f.relay.publish(f.a, { type: 'offer', to: f.b.peerId })).resolves.toBe(0);
    expect(f.relay.size(f.a.scope.encounterId)).toBe(1);
  });

  it('keeps exact runtime closure separate from participant generation closure', async () => {
    const relay = createSignalRelay(), a = session(1, 1), sibling = session(1, 3), future = session(1, 4), b = session(2, 2);
    future.scope = { ...future.scope, consentGeneration: 2 };
    for (const s of [a, sibling, future, b]) relay.subscribe(s, jest.fn(), allowed);
    await settle(); relay.closeRuntime(a); expect(relay.size(a.scope.encounterId)).toBe(3);
    relay.closeScope(a.scope); expect(relay.size(a.scope.encounterId)).toBe(2);
    relay.closeScope(a.scope); expect(relay.size(a.scope.encounterId)).toBe(2);
    await expect(relay.publish(future, { type: 'peer-leave' })).resolves.toBe(0);
    await expect(relay.publish(b, { type: 'peer-leave' })).resolves.toBe(0);
  });
});
