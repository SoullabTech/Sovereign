import { validateRoomStopContract, type RoomStopContract } from '../encounters/roomStopContract';

/** Browser effects are injected so the isolated witness never opens a real device. */
export interface RoomClientSession {
  runtimeId: string;
  peerId: string;
  runtimeCredential: string;
  role: string;
  displayName?: string;
}
export interface RoomClientStopReceipt {
  stopRecorded: boolean;
  operation: Readonly<RoomStopContract> | null;
  coverage: 'origin_runtime' | 'other_runtime' | 'none';
  physicalMediaVerified: false;
  receiptCredentials?: Partial<Record<'local_media' | 'remote_media', string>>;
}
export interface RoomClientSignal {
  type: string;
  from?: string;
  to?: string;
  payload?: unknown;
}
export interface RoomClientSnapshot {
  phase: 'idle' | 'admitting' | 'connecting' | 'active' | 'stopped' | 'refused';
  signaling: 'off' | 'connecting' | 'connected';
  capture: 'idle' | 'active' | 'stopped' | 'denied';
  playback: 'idle' | 'playing' | 'blocked' | 'stopped';
  durableStop: 'not_requested' | 'pending' | 'confirmed' | 'unknown' | 'failed';
  localTeardown: 'pending' | 'stopped' | 'failed';
  remoteTeardown: 'pending' | 'stopped' | 'failed';
  reason: string | null;
  runtimeId: string | null;
  role: string | null;
  displayName: string | null;
  connection: string;
  connectedVia: string | null;
  operation: Readonly<RoomStopContract> | null;
  coverage: 'origin_runtime' | 'other_runtime' | 'none';
  reportError: string | null;
  physicalMediaVerified: false;
}
export interface RoomClientDependencies {
  admit(signal: AbortSignal): Promise<RoomClientSession>;
  loadIce(session: RoomClientSession, signal: AbortSignal): Promise<RTCIceServer[]>;
  capture(): Promise<MediaStream>;
  createPeer(iceServers: RTCIceServer[]): RTCPeerConnection;
  audio(): HTMLAudioElement | null;
  connectSignals(session: RoomClientSession, message: (message: RoomClientSignal) => void,
    failed: () => void): { close(): void };
  publish(session: RoomClientSession, message: RoomClientSignal, signal: AbortSignal): Promise<void>;
  persistStop(session: RoomClientSession, requestKey: string): Promise<RoomClientStopReceipt>;
  report?(session: RoomClientSession, receipt: RoomClientStopReceipt,
    target: 'local_media' | 'remote_media', outcome: 'stopped' | 'failed'): Promise<RoomClientStopReceipt | void>;
  status?(session: RoomClientSession): Promise<RoomClientStopReceipt>;
  onChange?(snapshot: Readonly<RoomClientSnapshot>): void;
  now?: () => number;
  requestKey?: string;
  heartbeatTimeoutMs?: number;
}

export interface RoomClientLifecycle {
  start(): Promise<void>;
  stop(reason?: string): Promise<void>;
  dispose(): void;
  receive(message: RoomClientSignal): Promise<void>;
  playRemote(): Promise<void>;
  reconcile(): Promise<void>;
  snapshot(): Readonly<RoomClientSnapshot>;
}

/** One controller is one attempt. Once terminal, only fresh server admission can start another. */
export function createRoomClientLifecycle(deps: RoomClientDependencies): RoomClientLifecycle {
  const now = deps.now ?? Date.now;
  const requestKey = deps.requestKey ?? Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)))
    .map(byte => byte.toString(16).padStart(2, '0')).join('');
  const heartbeatTimeout = deps.heartbeatTimeoutMs ?? 45_000;
  if (!Number.isFinite(heartbeatTimeout) || heartbeatTimeout < 100 || heartbeatTimeout > 45_000) {
    throw new Error('INVALID_CONTROL_TIMEOUT');
  }
  let epoch = 0;
  let terminal = false;
  let disposed = false;
  let session: RoomClientSession | null = null;
  let media: MediaStream | null = null;
  let peer: RTCPeerConnection | null = null;
  let ownedAudio: HTMLAudioElement | null = null;
  let ownedAttachment: MediaStream | null = null;
  const ownedIncoming = new Set<MediaStream>();
  const ownedReceiverTracks = new Set<MediaStreamTrack>();
  let signals: { close(): void } | null = null;
  let timer: ReturnType<typeof setInterval> | null = null;
  let lastEvent = now();
  let pendingCapture = 0;
  let pendingPlayback = 0;
  let localFailed = false;
  let remoteFailed = false;
  let offerStarted = false;
  let stopRequested = false;
  let stopPromise: Promise<void> | null = null;
  let receipt: RoomClientStopReceipt | null = null;
  let reporting = Promise.resolve();
  const reportAttempts = new Set<string>();
  const abort = new AbortController();
  let state: RoomClientSnapshot = {
    phase: 'idle', signaling: 'off', capture: 'idle', playback: 'idle',
    durableStop: 'not_requested', localTeardown: 'pending', remoteTeardown: 'pending',
    reason: null, runtimeId: null, role: null, displayName: null, connection: 'new',
    connectedVia: null, operation: null, coverage: 'none', reportError: null,
    physicalMediaVerified: false,
  };
  const snapshot = () => Object.freeze({ ...state });
  function update(next: Partial<RoomClientSnapshot>) {
    state = { ...state, ...next, physicalMediaVerified: false };
    if (!disposed) { try { deps.onChange?.(snapshot()); } catch { /* A view cannot interrupt teardown. */ } }
  }
  const live = (expected: number) => !terminal && !disposed && epoch === expected;
  function safely(action: () => void, remote = false) {
    try { action(); } catch { if (remote) remoteFailed = true; else localFailed = true; }
  }
  function stopTracks(stream: MediaStream, remote = false) {
    safely(() => { for (const track of stream.getTracks()) safely(() => track.stop(), remote); }, remote);
  }
  function pauseAttachment(audio: HTMLAudioElement, attachment: MediaStream, includeDetached = false) {
    safely(() => {
      if (audio.srcObject !== attachment && !(includeDetached && audio.srcObject === null)) return;
      safely(() => audio.pause(), true);
      // A pause listener can itself change the element; retain ownership at the write.
      if (audio.srcObject === attachment) safely(() => { audio.srcObject = null; }, true);
    }, true);
  }
  function detachAudio() {
    // A stale callback must never pause/detach a newer runtime's attachment on
    // a reused React audio element. Own concrete resources, not the latest ref.
    const audio = ownedAudio, attachment = ownedAttachment;
    ownedAudio = null; ownedAttachment = null;
    for (const stream of ownedIncoming) stopTracks(stream, true);
    for (const track of ownedReceiverTracks) safely(() => track.stop(), true);
    ownedIncoming.clear(); ownedReceiverTracks.clear();
    if (audio && attachment) pauseAttachment(audio, attachment);
  }
  function observations() {
    update({ localTeardown: localFailed ? 'failed' : pendingCapture ? 'pending' : 'stopped',
      remoteTeardown: remoteFailed ? 'failed' : pendingPlayback ? 'pending' : 'stopped' });
  }
  function terminate(reason: string, refused = false) {
    if (terminal) return;
    terminal = true;
    epoch += 1;
    abort.abort();
    if (timer !== null) { clearInterval(timer); timer = null; }
    safely(() => signals?.close()); signals = null;
    if (peer) {
      const closing = peer; peer = null;
      closing.ontrack = null; closing.onicecandidate = null;
      closing.onconnectionstatechange = null; closing.oniceconnectionstatechange = null;
      safely(() => closing.getSenders().forEach(sender => { if (sender.track) safely(() => sender.track!.stop()); }));
      safely(() => closing.getReceivers().forEach(receiver => { if (receiver.track) safely(() => receiver.track.stop(), true); }), true);
      safely(() => closing.close());
    }
    if (media) { stopTracks(media); media = null; }
    detachAudio();
    update({ phase: refused ? 'refused' : 'stopped', signaling: 'off', capture: 'stopped',
      playback: 'stopped', connection: 'closed', reason });
    observations();
  }
  function acceptReceipt(value: RoomClientStopReceipt) {
    if (!value || typeof value.stopRecorded !== 'boolean' || value.physicalMediaVerified !== false
      || !['origin_runtime', 'other_runtime', 'none'].includes(value.coverage)
      || (value.stopRecorded !== (value.coverage !== 'none'))
      || (value.operation !== null && !validateRoomStopContract(value.operation))
      || (value.coverage === 'origin_runtime' && (!value.operation || value.operation.scope.runtimeId !== session?.runtimeId))
      || (value.coverage !== 'origin_runtime' && (value.operation !== null
        || Object.keys(value.receiptCredentials ?? {}).length !== 0))) {
      throw new Error('INVALID_STOP_RECEIPT');
    }
    receipt = value;
    update({ operation: value.operation, coverage: value.coverage,
      durableStop: value.stopRecorded ? 'confirmed' : 'pending' });
  }
  function flushReports(): Promise<void> {
    reporting = reporting.then(async () => {
      if (!terminal || !session || !receipt || !receipt.stopRecorded || receipt.coverage !== 'origin_runtime' || !deps.report) return;
      for (const target of ['local_media', 'remote_media'] as const) {
        const outcome = target === 'local_media' ? state.localTeardown : state.remoteTeardown;
        if (outcome === 'pending' || reportAttempts.has(target) || !receipt.receiptCredentials?.[target]) continue;
        reportAttempts.add(target);
        try {
          const result = await deps.report(session, receipt, target, outcome);
          if (result) acceptReceipt(result);
        } catch { update({ reportError: 'A component report is not confirmed.' }); }
      }
    });
    return reporting;
  }
  async function persist() {
    if (!session) return;
    update({ durableStop: 'pending' });
    try { acceptReceipt(await deps.persistStop(session, requestKey)); await flushReports(); }
    catch (error) {
      const code = (error as { code?: string })?.code;
      update({ durableStop: code && code !== 'COMMIT_OUTCOME_UNKNOWN' ? 'failed' : 'unknown' });
    }
  }
  async function stop(reason = 'participant_withdrawal') {
    stopRequested = true;
    terminate(reason);
    if (!stopPromise && session) stopPromise = persist();
    await stopPromise;
  }
  async function publish(message: RoomClientSignal, expected: number) {
    if (!live(expected) || !session) return;
    try { await deps.publish(session, message, abort.signal); }
    catch { if (live(expected)) await stop('signal_refused'); }
  }
  async function measure(pc: RTCPeerConnection, expected: number) {
    try {
      const stats = await pc.getStats();
      if (!live(expected) || peer !== pc) return;
      const candidates = new Map<string, string>(); let selected: { localCandidateId: string; remoteCandidateId: string } | null = null;
      stats.forEach(item => {
        if (item.type === 'local-candidate' || item.type === 'remote-candidate') candidates.set(item.id, item.candidateType ?? '?');
        if (item.type === 'candidate-pair' && item.state === 'succeeded' && item.nominated) selected = item;
      });
      if (selected) {
        const pair = selected as { localCandidateId: string; remoteCandidateId: string };
        update({ connectedVia: `${candidates.get(pair.localCandidateId) ?? '?'} / ${candidates.get(pair.remoteCandidateId) ?? '?'}` });
      }
    } catch { /* Stats failure does not create permission or proof. */ }
  }
  async function playRemote() {
    const expected = epoch;
    if (!live(expected)) return;
    const audio = ownedAudio, attachment = ownedAttachment;
    if (!audio || !attachment || audio.srcObject !== attachment) return;
    pendingPlayback += 1;
    try {
      await audio.play();
      if (!live(expected)) return;
      if (ownedAudio !== audio || ownedAttachment !== attachment || audio.srcObject !== attachment) return;
      update({ playback: 'playing' });
    } catch { if (live(expected)) update({ playback: 'blocked' }); }
    finally {
      pendingPlayback -= 1;
      if (terminal) {
        // A late play fulfillment can change paused after Stop's initial pause.
        // Re-pause the captured element only while no newer attachment owns it.
        pauseAttachment(audio, attachment, true);
        observations(); void flushReports();
      }
    }
  }
  async function offer(expected: number) {
    const pc = peer;
    if (!live(expected) || !pc || session?.role !== 'practitioner' || offerStarted) return;
    offerStarted = true;
    try {
      const description = await pc.createOffer();
      if (!live(expected) || peer !== pc) return;
      await pc.setLocalDescription(description);
      if (!live(expected) || peer !== pc) return;
      await publish({ type: 'offer', payload: description }, expected);
    } catch { if (live(expected)) await stop('negotiation_failed'); }
  }
  async function receive(message: RoomClientSignal) {
    const expected = epoch;
    if (!live(expected)) return;
    if (!message || typeof message.type !== 'string') { await stop('invalid_control'); return; }
    lastEvent = now();
    if (['stop', 'room-stopped', 'consent-revoked', 'room-ended', 'refused', 'terminal'].includes(message.type)) {
      terminate(message.type);
      if (session && deps.status) {
        try { acceptReceipt(await deps.status(session)); } catch { update({ durableStop: 'unknown' }); }
      }
      return;
    }
    if (message.type === 'connected') { update({ signaling: 'connected', phase: 'active' }); return; }
    if (message.type === 'ping') return;
    if (message.from === session?.peerId) return;
    if (message.type === 'peer-present' || message.type === 'peer-join') { await offer(expected); return; }
    if (message.type === 'peer-leave') { await stop('peer_left'); return; }
    const pc = peer;
    if (!pc) return;
    try {
      if (message.type === 'offer') {
        await pc.setRemoteDescription(message.payload as RTCSessionDescriptionInit);
        if (!live(expected) || peer !== pc) return;
        const answer = await pc.createAnswer();
        if (!live(expected) || peer !== pc) return;
        await pc.setLocalDescription(answer);
        if (!live(expected) || peer !== pc) return;
        await publish({ type: 'answer', to: message.from, payload: answer }, expected);
      } else if (message.type === 'answer') {
        await pc.setRemoteDescription(message.payload as RTCSessionDescriptionInit);
        if (!live(expected) || peer !== pc) return;
      } else if (message.type === 'ice') {
        await pc.addIceCandidate(message.payload as RTCIceCandidateInit);
        if (!live(expected) || peer !== pc) return;
      } else { await stop('invalid_control'); }
    } catch { if (live(expected)) await stop('negotiation_failed'); }
  }
  async function start() {
    if (state.phase !== 'idle' || terminal || disposed) throw new Error('ROOM_ATTEMPT_TERMINAL_OR_STARTED');
    const expected = ++epoch;
    update({ phase: 'admitting' });
    try {
      session = await deps.admit(abort.signal);
      if (!session || !session.runtimeId || !session.peerId || !session.runtimeCredential) throw new Error('INVALID_RUNTIME_ADMISSION');
      update({ runtimeId: session.runtimeId, role: session.role, displayName: session.displayName ?? null });
      if (!live(expected)) { if (stopRequested && !stopPromise) { stopPromise = persist(); await stopPromise; } return; }
      update({ phase: 'connecting' });
      const ice = await deps.loadIce(session, abort.signal);
      if (!live(expected)) return;
      pendingCapture += 1;
      let captured: MediaStream;
      try { captured = await deps.capture(); }
      catch (error) { if (live(expected)) update({ capture: 'denied' }); throw error; }
      finally { pendingCapture -= 1; }
      if (!live(expected)) { stopTracks(captured); observations(); await flushReports(); return; }
      media = captured;
      update({ capture: 'active' });
      const pc = deps.createPeer(ice);
      if (!live(expected)) { pc.close(); stopTracks(captured); return; }
      peer = pc;
      for (const track of captured.getTracks()) pc.addTrack(track, captured);
      pc.ontrack = event => {
        if (!live(expected) || peer !== pc) {
          event.streams.forEach(stream => stopTracks(stream, true));
          safely(() => event.track.stop(), true); return;
        }
        // Each incoming resource belongs to this peer incarnation, including
        // streams whose callback cannot be attached to a current view.
        if (ownedAttachment && event.streams[0] && ownedAttachment !== event.streams[0]) detachAudio();
        event.streams.forEach(stream => ownedIncoming.add(stream));
        ownedReceiverTracks.add(event.track);
        try {
          const audio = deps.audio();
          if (audio && event.streams[0]) {
            ownedAudio = audio; ownedAttachment = event.streams[0];
            audio.srcObject = ownedAttachment; void playRemote();
          }
        } catch { remoteFailed = true; void stop('incoming_attachment_failed'); }
      };
      pc.onicecandidate = event => { if (live(expected) && event.candidate) void publish({ type: 'ice', payload: event.candidate.toJSON() }, expected); };
      pc.onconnectionstatechange = () => {
        if (!live(expected) || peer !== pc) return;
        update({ connection: pc.connectionState });
        if (pc.connectionState === 'connected') void measure(pc, expected);
        if (['failed', 'disconnected', 'closed'].includes(pc.connectionState)) void stop('peer_connection_lost');
      };
      lastEvent = now();
      update({ signaling: 'connecting' });
      const channel = deps.connectSignals(session, message => { void receive(message); }, () => { void stop('control_lost'); });
      if (!live(expected)) { channel.close(); return; }
      signals = channel;
      timer = setInterval(() => { if (live(expected) && now() - lastEvent >= heartbeatTimeout) void stop('control_timeout'); }, Math.min(1000, heartbeatTimeout));
    } catch {
      if (live(expected)) { terminate('admission_or_transport_refused', true); if (session) { stopRequested = true; stopPromise = persist(); await stopPromise; } }
      else { observations(); await flushReports(); }
    }
  }
  async function reconcile() {
    if (!session || !terminal) return;
    reportAttempts.clear();
    update({ reportError: null });
    // Another runtime may already have stopped this consent scope. Read its
    // minimal terminal identity before repeating an origin-specific request.
    if (deps.status) {
      try {
        acceptReceipt(await deps.status(session));
        if (state.durableStop === 'confirmed') { await flushReports(); return; }
      }
      catch { update({ durableStop: 'unknown' }); }
    }
    if (stopRequested && state.durableStop !== 'confirmed') { stopPromise = persist(); await stopPromise; }
  }
  function dispose() { terminate('unmounted'); disposed = true; }
  return { start, stop, dispose, receive, playRemote, reconcile, snapshot };
}
