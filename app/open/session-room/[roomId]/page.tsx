'use client';

/** Session Room transport surface. Default server composition remains closed.
 * Runtime admission precedes all capture. Stop closes local effects independently
 * of durable request/report delivery. No recorder, transcript or MAIA is opened.
 */
import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { createRoomClientLifecycle, type RoomClientLifecycle, type RoomClientSnapshot,
  type RoomClientStopReceipt } from '@/lib/webrtc/roomClientLifecycle';
import { ROOM_STOP_TARGETS } from '@/lib/encounters/roomStopContract';

async function readResponse(response: Response): Promise<any> {
  let body: any;
  try { body = await response.json(); } catch { throw new Error('The room response was not confirmed.'); }
  if (!response.ok) {
    const error = new Error('The room did not authorize this request.') as Error & { code: string };
    error.code = typeof body?.code === 'string' ? body.code : typeof body?.error === 'string' ? body.error : `HTTP_${response.status}`;
    throw error;
  }
  return body;
}
function receipt(body: any): RoomClientStopReceipt {
  return { stopRecorded: body?.scopeStopped === true, operation: body?.operation ?? null,
    coverage: body?.coverage ?? 'none', physicalMediaVerified: body?.physicalMediaVerified,
    receiptCredentials: body?.reportCredentials };
}

export default function SessionRoom() {
  const params = useParams();
  const search = useSearchParams();
  const roomId = typeof params?.roomId === 'string' ? params.roomId : '';
  const threshold = search?.get('threshold') ?? '';
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lifecycle = useRef<RoomClientLifecycle | null>(null);
  const [view, setView] = useState<Readonly<RoomClientSnapshot> | null>(null);

  useEffect(() => {
    if (!roomId || !threshold) { lifecycle.current = null; setView(null); return; }
    const base = `/api/open/session-room/${encodeURIComponent(roomId)}`;
    const json = (suffix: string, body: unknown, signal?: AbortSignal, method = 'POST') => fetch(base + suffix, {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      signal, cache: 'no-store', credentials: 'same-origin',
    }).then(readResponse);
    const controller = createRoomClientLifecycle({
      admit: signal => json('/runtime', { thresholdToken: threshold }, signal),
      loadIce: async (session, signal) => {
        const body = await fetch(`${base}/turn-credentials?runtimeCredential=${encodeURIComponent(session.runtimeCredential)}`,
          { signal, cache: 'no-store', credentials: 'same-origin' }).then(readResponse);
        // Only an explicit successful server response may authorize host-only mode.
        if (!Array.isArray(body.iceServers)) throw new Error('Invalid transport admission');
        return body.iceServers;
      },
      capture: () => navigator.mediaDevices.getUserMedia({ audio: true }),
      createPeer: iceServers => new RTCPeerConnection({ iceServers }),
      audio: () => audioRef.current,
      connectSignals: (session, message, failed) => {
        const source = new EventSource(`${base}/signal?runtimeCredential=${encodeURIComponent(session.runtimeCredential)}`);
        source.onmessage = event => {
          try { message(JSON.parse(event.data)); } catch { failed(); }
        };
        source.onerror = failed;
        return { close: () => { source.onmessage = null; source.onerror = null; source.close(); } };
      },
      publish: async (session, message, signal) => { await json('/signal', { runtimeCredential: session.runtimeCredential, ...message }, signal); },
      persistStop: async (session, requestKey) => receipt(await json('/stop', { runtimeCredential: session.runtimeCredential, requestKey })),
      status: async session => receipt(await fetch(`${base}/stop?runtimeCredential=${encodeURIComponent(session.runtimeCredential)}`,
        { cache: 'no-store', credentials: 'same-origin' }).then(readResponse)),
      report: async (session, observed, target, state) => {
        const credential = observed.receiptCredentials?.[target];
        if (!credential || !observed.operation) throw new Error('No scoped component report authority');
        return receipt(await json('/stop', { runtimeCredential: session.runtimeCredential,
          operationId: observed.operation.operationId, target, credential, state }, undefined, 'PATCH'));
      },
      onChange: setView,
    });
    lifecycle.current = controller;
    setView(controller.snapshot());
    return () => { controller.dispose(); if (lifecycle.current === controller) lifecycle.current = null; };
  }, [roomId, threshold]);

  const terminal = view?.phase === 'stopped' || view?.phase === 'refused';
  const statusText = !view ? 'A participant threshold link opens this room.' : {
    idle: 'Ready to check your current permission.', admitting: 'Checking your current permission…',
    connecting: 'Opening the authorized room connection…', active: 'The room connection is open.',
    stopped: 'This room connection has closed.', refused: 'The room is not open for this request.',
  }[view.phase];
  const stopText = view ? {
    not_requested: 'No durable Stop has been requested.', pending: 'Waiting for the server to confirm Stop.',
    confirmed: 'The server has recorded Stop for this participant consent scope.',
    unknown: 'Server confirmation is unknown. This connection remains closed.',
    failed: 'The server did not confirm Stop. This connection remains closed.',
  }[view.durableStop] : '';

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="mx-auto max-w-xl space-y-5">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">Session Room</h1>
          <p className="text-base text-neutral-300">A place to meet within the Encounter, with permission to leave at any time.</p>
          <p className="text-sm text-neutral-400">Transport only. Recording, captions and MAIA participation remain closed.</p>
        </header>
        <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 space-y-4" aria-label="Room controls">
          <p role="status" data-testid="room-status">{statusText}</p>
          {view?.displayName && <p>{view.displayName} · {view.role}</p>}
          {!view && <p>Return to the participant threshold or ask the guide for the correct link.</p>}
          {view?.phase === 'idle' && <button type="button" onClick={() => { void lifecycle.current?.start(); }}
            className="rounded-lg border border-emerald-700 px-5 py-3 text-base">Enter Session Room →</button>}
          {view && !terminal && view.phase !== 'idle' && <button type="button" onClick={() => { void lifecycle.current?.stop(); }}
            className="rounded-lg border border-red-700 px-5 py-3 text-base">Stop and leave</button>}
          {view?.phase === 'active' && view.playback === 'blocked' && <button type="button" onClick={() => { void lifecycle.current?.playRemote(); }}
            className="rounded-lg border border-neutral-600 px-5 py-3 text-base">Play incoming audio</button>}
          {terminal && <p>A closed attempt cannot restart automatically. Return through the threshold to request fresh admission.</p>}
          {threshold && <a className="block underline" href={`/open/threshold/${encodeURIComponent(threshold)}`}>Return to the threshold</a>}
        </section>
        {view && <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 space-y-3" aria-label="Connection state">
          <dl className="grid grid-cols-2 gap-2 text-base">
            <dt>Capture</dt><dd data-testid="capture-state">{view.capture}</dd>
            <dt>Incoming playback</dt><dd>{view.playback}</dd>
            <dt>Signaling</dt><dd>{view.signaling}</dd>
            <dt>Connection</dt><dd>{view.connection}</dd>
            {view.connectedVia && <><dt>Transport observation</dt><dd>{view.connectedVia}</dd></>}
          </dl>
          {terminal && <>
            <p data-testid="durable-stop">{stopText}</p>
            {view.runtimeId && <button type="button" onClick={() => { void lifecycle.current?.reconcile(); }}
              className="rounded-lg border border-neutral-600 px-4 py-2">Check Stop confirmation</button>}
            {view.reportError && <p>{view.reportError}</p>}
          </>}
        </section>}
        {view?.operation && <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 space-y-3" aria-label="Component reports">
          <h2 className="text-lg font-semibold">Reports for this connection</h2>
          <p className="text-sm text-neutral-400">Runtime {view.operation.scope.runtimeId}. Other connections and devices are outside these reports.</p>
          <ul className="space-y-2">{ROOM_STOP_TARGETS.map(target => <li key={target} className="flex justify-between gap-3">
            <span>{target.replace(/_/g, ' ')}</span><span>{view.operation!.targets[target]} · {view.operation!.targetBindings[target].evidenceKind}</span>
          </li>)}</ul>
        </section>}
        {view?.coverage === 'other_runtime' && <p>Stop was recorded by another connection. Its detailed component reports do not cover this connection.</p>}
        {terminal && <p className="text-sm text-neutral-400" data-testid="physical-media">Component reports do not verify that every device is physically quiet.</p>}
        <audio ref={audioRef} className="hidden" />
      </div>
    </main>
  );
}
