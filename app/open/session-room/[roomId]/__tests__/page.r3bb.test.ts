/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import SessionRoom from '../page';
import { beginRoomStop, acknowledgeRoomStop, ROOM_STOP_TARGETS, type RoomStopContract,
  type RoomStopTarget, type RoomStopTargetBindings, type RoomStopTargetState } from '@/lib/encounters/roomStopContract';

let mockThreshold: string | null = 'fictional-threshold';
jest.mock('next/navigation', () => ({
  useParams: () => ({ roomId: 'encounter-one' }),
  useSearchParams: () => ({ get: (key: string) => key === 'threshold' ? mockThreshold : key === 'role' ? 'forged-role' : null }),
}));
function deferred<T>() {
  let resolve!: (value: T) => void; let reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const tick = async () => { for (let i = 0; i < 16; i += 1) await Promise.resolve(); };
const runtime = { runtimeId: 'runtime-one', peerId: 'peer-one', runtimeCredential: 'fictional-runtime-capability', role: 'guest', displayName: 'Fictional participant' };
function operation(): Readonly<RoomStopContract> {
  const result = beginRoomStop({ operationId: 'operation-one', requestKey: 'request-one',
    scope: { encounterId: 'encounter-one', participantId: 'participant-one', agreementVersion: 'v1', consentGeneration: 1, runtimeId: runtime.runtimeId },
    stopGeneration: 1, requestedByParticipantId: 'participant-one', requestedAt: 1, reason: 'participant_withdrawal',
    targetBindings: Object.fromEntries(ROOM_STOP_TARGETS.map(target => [target,
      { principalId: `fictional-${target}`, adapterRuntimeId: `adapter-${target}`, evidenceKind: 'simulated' }])) as RoomStopTargetBindings });
  if (!result.ok) throw new Error('fixture invalid'); return result.contract;
}
function report(contract: Readonly<RoomStopContract>, target: RoomStopTarget, state: Exclude<RoomStopTargetState, 'pending'>) {
  const binding = contract.targetBindings[target];
  const result = acknowledgeRoomStop(contract, { operationId: contract.operationId, scope: contract.scope,
    stopGeneration: contract.stopGeneration, target, ...binding, state, acknowledgedAt: 2 });
  if (!result.ok) throw new Error('fixture report invalid'); return result.contract;
}
function response(body: unknown, status = 200): Response {
  return { ok: status >= 200 && status < 300, status, json: async () => body } as Response;
}

describe('actual Session Room page with fake browser transports', () => {
  let container: HTMLDivElement; let root: Root;
  let fetchMock: jest.Mock; let capture: jest.Mock; let track: { stop: jest.Mock };
  let pc: any; let sources: FakeSource[]; let current: Readonly<RoomStopContract>;
  let calls: string[];
  class FakeSource {
    onmessage: ((event: { data: string }) => void) | null = null;
    onerror: (() => void) | null = null;
    close = jest.fn();
    constructor(public url: string) { sources.push(this); calls.push('SSE'); }
    message(body: unknown) { this.onmessage?.({ data: JSON.stringify(body) }); }
  }
  const bodyView = () => ({ scopeStopped: true, operation: current, operationId: current.operationId,
    stopGeneration: current.stopGeneration, coverage: 'origin_runtime', physicalMediaVerified: false,
    reportCredentials: { local_media: 'fictional-local', remote_media: 'fictional-incoming' } });
  async function render() { await act(async () => { root.render(React.createElement(SessionRoom)); await tick(); }); }
  async function click(label: string) {
    const button = [...container.querySelectorAll('button')].find(item => item.textContent === label);
    if (!button) throw new Error(`button missing: ${label}`);
    await act(async () => { button.dispatchEvent(new MouseEvent('click', { bubbles: true })); await tick(); });
  }
  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    mockThreshold = 'fictional-threshold'; calls = []; sources = []; current = operation();
    container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
    track = { stop: jest.fn() };
    capture = jest.fn(async () => { calls.push('capture'); return { getTracks: () => [track] }; });
    pc = { close: jest.fn(), addTrack: jest.fn(), getSenders: () => [{ track }], getReceivers: () => [],
      createOffer: jest.fn().mockResolvedValue({ type: 'offer' }), createAnswer: jest.fn().mockResolvedValue({ type: 'answer' }),
      setLocalDescription: jest.fn().mockResolvedValue(undefined), setRemoteDescription: jest.fn().mockResolvedValue(undefined),
      addIceCandidate: jest.fn().mockResolvedValue(undefined), getStats: jest.fn().mockResolvedValue(new Map()),
      connectionState: 'new', ontrack: null, onicecandidate: null, onconnectionstatechange: null, oniceconnectionstatechange: null };
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: capture } });
    Object.defineProperty(globalThis, 'RTCPeerConnection', { configurable: true, value: jest.fn(() => { calls.push('peer'); return pc; }) });
    Object.defineProperty(globalThis, 'EventSource', { configurable: true, value: FakeSource });
    jest.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    jest.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    fetchMock = jest.fn(async (input: string, init?: RequestInit) => {
      const url = new URL(String(input), 'http://fictional.test'); const method = init?.method ?? 'GET';
      if (url.pathname.endsWith('/runtime')) { calls.push('runtime'); return response(runtime); }
      if (url.pathname.endsWith('/turn-credentials')) { calls.push('TURN'); return response({ iceServers: [] }); }
      if (url.pathname.endsWith('/stop')) {
        if (method === 'PATCH') {
          const body = JSON.parse(String(init?.body)); current = report(current, body.target, body.state);
        }
        return response(bodyView());
      }
      if (url.pathname.endsWith('/signal')) return response({ ok: true });
      throw new Error('unexpected fixture request');
    });
    Object.defineProperty(globalThis, 'fetch', { configurable: true, value: fetchMock });
  });
  afterEach(async () => { await act(async () => { root.unmount(); await tick(); }); container.remove(); jest.restoreAllMocks(); });

  it('requires a threshold link without opening a media or network path', async () => {
    mockThreshold = null; await render();
    expect(container.textContent).toContain('participant threshold link'); expect(fetchMock).not.toHaveBeenCalled(); expect(capture).not.toHaveBeenCalled();
  });

  it('requires an explicit action and fresh admission before TURN or capture', async () => {
    await render(); expect(fetchMock).not.toHaveBeenCalled(); expect(capture).not.toHaveBeenCalled();
    await click('Enter Session Room →');
    expect(calls.slice(0, 4)).toEqual(['runtime', 'TURN', 'capture', 'peer']);
    const request = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(request).toEqual({ thresholdToken: 'fictional-threshold' });
    expect(container.textContent).toContain('Fictional participant · guest'); expect(container.textContent).not.toContain('forged-role');
  });

  it('renders default admission refusal without acquiring media', async () => {
    fetchMock.mockImplementation(async () => response({ code: 'ROOM_RUNTIME_DISABLED' }, 503));
    await render(); await click('Enter Session Room →');
    expect(container.textContent).toContain('not open for this request'); expect(capture).not.toHaveBeenCalled();
    expect(globalThis.RTCPeerConnection).not.toHaveBeenCalled(); expect(sources).toHaveLength(0);
  });

  it.each([403, 503])('a TURN HTTP %i refusal cannot fall back into a call', async status => {
    fetchMock.mockImplementation(async (input: string) => {
      if (input.endsWith('/runtime')) return response(runtime);
      if (input.includes('/turn-credentials')) return response({ code: status === 403 ? 'STOP_RECORDED' : 'turn_unconfigured' }, status);
      return response(bodyView());
    });
    await render(); await click('Enter Session Room →');
    expect(capture).not.toHaveBeenCalled(); expect(globalThis.RTCPeerConnection).not.toHaveBeenCalled();
    expect(container.textContent).toContain('not open for this request');
  });

  it('closes immediately and shows unknown durable confirmation after a lost response', async () => {
    const original = fetchMock.getMockImplementation()!;
    fetchMock.mockImplementation(async (input: string, init?: RequestInit) => {
      if (input.endsWith('/stop') && init?.method === 'POST') throw new Error('network response lost');
      return original(input, init);
    });
    await render(); await click('Enter Session Room →'); await click('Stop and leave');
    expect(track.stop).toHaveBeenCalled(); expect(pc.close).toHaveBeenCalledTimes(1); expect(sources[0].close).toHaveBeenCalled();
    expect(container.querySelector('[data-testid="durable-stop"]')?.textContent).toContain('unknown');
    expect(container.querySelector('[data-testid="physical-media"]')?.textContent).toContain('do not verify');
    expect([...container.querySelectorAll('button')].some(button => button.textContent === 'Enter Session Room →')).toBe(false);
  });

  it('disposes capture resolving after the person has already stopped', async () => {
    const pending = deferred<MediaStream>(); capture.mockReturnValue(pending.promise);
    await render(); await click('Enter Session Room →'); await click('Stop and leave');
    expect(globalThis.RTCPeerConnection).not.toHaveBeenCalled();
    await act(async () => { pending.resolve({ getTracks: () => [track] } as unknown as MediaStream); await tick(); });
    expect(track.stop).toHaveBeenCalled(); expect(globalThis.RTCPeerConnection).not.toHaveBeenCalled();
    expect(container.textContent).toContain('connection has closed');
  });

  it('pauses and detaches incoming playback on Stop', async () => {
    const remote = { stop: jest.fn() }; const incoming = { getTracks: () => [remote] };
    await render(); await click('Enter Session Room →');
    await act(async () => { pc.ontrack({ streams: [incoming], track: remote }); await tick(); });
    const audio = container.querySelector('audio')!; expect(audio.srcObject).toBe(incoming);
    await click('Stop and leave'); expect(audio.srcObject).toBeNull(); expect(remote.stop).toHaveBeenCalled();
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });

  it('retains separate failed, pending and trusted never-started component states', async () => {
    current = report(current, 'signaling', 'failed');
    for (const target of ['recorder', 'captions', 'maia_inference', 'maia_playback'] as const) current = report(current, target, 'not_started');
    await render(); await click('Enter Session Room →'); await click('Stop and leave');
    const section = container.querySelector('[aria-label="Component reports"]')!;
    expect(section.textContent).toContain('failed · simulated'); expect(section.textContent).toContain('pending · simulated');
    expect(section.textContent).toContain('not_started · simulated'); expect(section.textContent).toContain('Other connections and devices are outside these reports');
    expect(container.textContent).not.toContain(runtime.runtimeCredential);
  });

  it('control-channel loss closes the page without creating another connection', async () => {
    await render(); await click('Enter Session Room →');
    await act(async () => { sources[0].onerror?.(); await tick(); });
    expect(track.stop).toHaveBeenCalled(); expect(pc.close).toHaveBeenCalled(); expect(sources).toHaveLength(1);
    expect(container.textContent).toContain('connection has closed');
  });

  it('another runtime Stop closes locally without borrowing the origin report credentials', async () => {
    const original = fetchMock.getMockImplementation()!;
    fetchMock.mockImplementation(async (input: string, init?: RequestInit) => {
      if (input.includes('/stop?')) return response({ scopeStopped: true, operation: null,
        operationId: 'another-origin', stopGeneration: 1, coverage: 'other_runtime', physicalMediaVerified: false, reportCredentials: {} });
      return original(input, init);
    });
    await render(); await click('Enter Session Room →');
    await act(async () => { sources[0].message({ type: 'room-stopped' }); await tick(); });
    expect(track.stop).toHaveBeenCalled(); expect(container.textContent).toContain('recorded by another connection');
    expect(fetchMock.mock.calls.some(call => call[1]?.method === 'PATCH')).toBe(false);
  });
});
