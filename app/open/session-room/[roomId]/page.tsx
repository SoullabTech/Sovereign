'use client';

/**
 * WebRTC Session Room — Phase A smoke test. TRANSPORT ONLY.
 *
 * Proves: room entry, P2P connect, mic permission, remote audio audible, signaling route,
 * and MEASURES whether a TURN relay (coturn) was actually needed. Explicitly:
 * NO recording, NO transcript, NO memory, NO Encounter/scribe write.
 *
 * Manual smoke test: open in two browsers/tabs —
 *   /open/session-room/<roomId>?role=practitioner
 *   /open/session-room/<roomId>?role=guest
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

// R-A5: ICE endpoints are fetched at join time from /turn-credentials and are ALWAYS
// self-hosted (coturn). There is deliberately NO hardcoded third-party STUN/TURN fallback —
// if coturn is unconfigured the room proceeds host-candidate-only (empty iceServers), which
// still connects same-machine/LAN; real NAT traversal needs coturn deployed. Never a public relay.
// Spec: docs/specs/NATIVE_SESSION_ROOM_PHASE_A_REFUSAL_TESTS_2026-07-05.md (R-A5).

function randomPeerId() {
  // No Math.random dependency issues in-browser; only runs client-side on click.
  return 'p_' + Math.random().toString(36).slice(2, 10);
}

export default function WebRtcSmokeRoom() {
  const params = useParams();
  const search = useSearchParams();
  const roomId = (params?.roomId as string) ?? 'test';
  const role = (search?.get('role') === 'practitioner' ? 'practitioner' : 'guest') as
    | 'practitioner'
    | 'guest';
  const isInitiator = role === 'practitioner';

  const [joined, setJoined] = useState(false);
  // Signaling liveness is VISIBLE — a dead stream must never be silent (Phase A hardening).
  const [sigState, setSigState] = useState<'off' | 'connected' | 'reconnecting'>('off');
  const [micState, setMicState] = useState<'idle' | 'granted' | 'denied'>('idle');
  const [connState, setConnState] = useState<string>('new');
  const [iceState, setIceState] = useState<string>('new');
  const [remoteAudible, setRemoteAudible] = useState(false);
  const [connectedVia, setConnectedVia] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const peerIdRef = useRef<string>('');
  const offerSentRef = useRef(false);
  const iceServersRef = useRef<RTCIceServer[]>([]);
  // Reconnect machinery: same peerId across reconnects; backoff; staleness watchdog.
  const leftRef = useRef(false);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEventAtRef = useRef(0);

  const addLog = useCallback((line: string) => {
    setLog((l) => [...l.slice(-40), `${line}`]);
    // eslint-disable-next-line no-console
    console.log('[webrtc-smoke]', line);
  }, []);

  const post = useCallback(
    (msg: Record<string, unknown>) =>
      fetch(`/api/open/session-room/${roomId}/signal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: peerIdRef.current, ...msg }),
      }).catch(() => {}),
    [roomId]
  );

  const measureSelectedPair = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;
    const stats = await pc.getStats();
    let pairId: string | null = null;
    // NB: candidateType (host|srflx|prflx|relay) — NOT .type, which is the stat-record
    // type ('local-candidate'/'remote-candidate'). The earlier display bug read .type.
    const cands: Record<string, { candidateType?: string }> = {};
    stats.forEach((r) => {
      if (r.type === 'candidate-pair' && r.state === 'succeeded' && r.nominated) pairId = r.id;
      if (r.type === 'local-candidate' || r.type === 'remote-candidate') cands[r.id] = r as { candidateType?: string };
    });
    stats.forEach((r) => {
      if (r.id === pairId) {
        const local = cands[(r as { localCandidateId: string }).localCandidateId]?.candidateType ?? '?';
        const remote = cands[(r as { remoteCandidateId: string }).remoteCandidateId]?.candidateType ?? '?';
        const relay = local === 'relay' || remote === 'relay';
        setConnectedVia(`${local} ⇄ ${remote}${relay ? '  (TURN relay used → coturn NEEDED)' : '  (no relay → host/STUN sufficient)'}`);
        addLog(`selected pair: local=${local} remote=${remote}`);
      }
    });
  }, [addLog]);

  const createPeer = useCallback(() => {
    const pc = new RTCPeerConnection({ iceServers: iceServersRef.current });
    pcRef.current = pc;

    localStreamRef.current?.getTracks().forEach((t) => pc.addTrack(t, localStreamRef.current!));

    pc.ontrack = (e) => {
      if (audioRef.current) {
        audioRef.current.srcObject = e.streams[0];
        audioRef.current.play().then(() => setRemoteAudible(true)).catch(() => {
          addLog('autoplay blocked — click "Play remote audio"');
        });
      }
      addLog('remote track received');
    };
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        addLog(`local ICE candidate: ${e.candidate.type ?? '?'}`);
        post({ type: 'ice', payload: e.candidate.toJSON() });
      }
    };
    pc.onconnectionstatechange = () => {
      setConnState(pc.connectionState);
      addLog(`connection: ${pc.connectionState}`);
      if (pc.connectionState === 'connected') measureSelectedPair();
    };
    pc.oniceconnectionstatechange = () => setIceState(pc.iceConnectionState);
    return pc;
  }, [addLog, post, measureSelectedPair]);

  const makeOffer = useCallback(async () => {
    if (!isInitiator || offerSentRef.current) return;
    const pc = pcRef.current ?? createPeer();
    offerSentRef.current = true;
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    addLog('sent offer');
    post({ type: 'offer', payload: offer });
  }, [isInitiator, createPeer, addLog, post]);

  const handleSignal = useCallback(
    async (msg: { type: string; from: string; payload?: unknown }) => {
      // Liveness signals come BEFORE the self-check: 'connected' is our own subscribe ack,
      // 'ping' is the server heartbeat (both only update liveness, never negotiate).
      if (msg.type === 'ping') return;
      if (msg.type === 'connected') {
        reconnectAttemptRef.current = 0;
        setSigState('connected');
        return;
      }
      if (msg.from === peerIdRef.current) return;
      if (msg.type === 'peer-present' || msg.type === 'peer-join') {
        addLog(`peer ${msg.type === 'peer-join' ? 'joined' : 'present'}: ${msg.from}`);
        if (isInitiator) {
          const pc = pcRef.current;
          if (pc && pc.connectionState === 'connected') {
            // Healthy media + a re-announce (their signaling reconnected) — nothing to do.
            addLog('peer re-announced — media already connected, no renegotiation');
          } else {
            // Fresh peer, or our PC is dead/stale: rebuild and offer again.
            if (pc && pc.connectionState !== 'new') {
              pc.close();
              pcRef.current = null;
              createPeer();
              addLog('rebuilt peer connection for re-offer');
            }
            offerSentRef.current = false;
            makeOffer();
          }
        }
      } else if (msg.type === 'offer') {
        // If our old PC is dead, replace it before answering.
        if (pcRef.current && ['failed', 'disconnected', 'closed'].includes(pcRef.current.connectionState)) {
          pcRef.current.close();
          pcRef.current = null;
          addLog('rebuilt peer connection to answer fresh offer');
        }
        const pc = pcRef.current ?? createPeer();
        await pc.setRemoteDescription(msg.payload as RTCSessionDescriptionInit);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        addLog('sent answer');
        post({ type: 'answer', to: msg.from, payload: answer });
      } else if (msg.type === 'answer') {
        await pcRef.current?.setRemoteDescription(msg.payload as RTCSessionDescriptionInit);
        addLog('got answer');
      } else if (msg.type === 'ice') {
        try {
          await pcRef.current?.addIceCandidate(msg.payload as RTCIceCandidateInit);
        } catch {
          /* candidate arrived before remote desc — benign in Phase A */
        }
      } else if (msg.type === 'peer-leave') {
        addLog(`peer left: ${msg.from}`);
        setRemoteAudible(false);
        // Allow a re-offer when they (or their signaling) come back.
        offerSentRef.current = false;
      }
    },
    [isInitiator, createPeer, makeOffer, addLog, post]
  );

  const join = useCallback(async () => {
    peerIdRef.current = randomPeerId();
    addLog(`joining as ${role} (${peerIdRef.current}) room=${roomId}`);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      setMicState('granted');
      addLog('mic granted');
    } catch {
      setMicState('denied');
      addLog('mic DENIED — cannot proceed');
      return;
    }
    // R-A5: fetch self-hosted ICE (coturn). No third-party fallback — if unconfigured,
    // proceed host-candidate-only (works same-machine/LAN; real NAT traversal needs coturn).
    try {
      const r = await fetch(`/api/open/session-room/${roomId}/turn-credentials`);
      if (r.ok) {
        const j = await r.json();
        iceServersRef.current = Array.isArray(j.iceServers) ? j.iceServers : [];
        addLog(`ICE: ${iceServersRef.current.length} self-hosted endpoint(s)`);
      } else {
        iceServersRef.current = [];
        addLog('ICE: TURN not configured (host-candidate-only; NAT traversal needs coturn)');
      }
    } catch {
      iceServersRef.current = [];
      addLog('ICE: turn-credentials fetch failed (host-candidate-only)');
    }
    createPeer();
    leftRef.current = false;
    reconnectAttemptRef.current = 0;
    lastEventAtRef.current = Date.now();
    connectSignaling();
    setJoined(true);
  }, [role, roomId, createPeer, addLog]); // eslint-disable-line react-hooks/exhaustive-deps

  // Signaling connection with reconnect: SAME peerId across reconnects (the server
  // re-announces on re-subscribe, so presence self-heals). Backoff 1s→10s. A dead
  // stream is never silent: sigState goes 'reconnecting' and the log says so.
  const connectSignaling = useCallback(() => {
    esRef.current?.close();
    const es = new EventSource(`/api/open/session-room/${roomId}/signal?peerId=${peerIdRef.current}`);
    esRef.current = es;
    es.onmessage = (e) => {
      lastEventAtRef.current = Date.now();
      handleSignal(JSON.parse(e.data));
    };
    es.onerror = () => {
      es.close();
      if (leftRef.current) return;
      setSigState('reconnecting');
      const attempt = ++reconnectAttemptRef.current;
      const delay = Math.min(1000 * 2 ** Math.min(attempt - 1, 4), 10000);
      addLog(`signaling lost — reconnecting in ${Math.round(delay / 1000)}s (attempt ${attempt})`);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = setTimeout(() => {
        if (!leftRef.current) connectSignaling();
      }, delay);
    };
  }, [roomId, handleSignal, addLog]);

  // Staleness watchdog: the server pings every 15s; >45s of silence = zombie stream
  // (observed failure mode: background-tab reaping without an error event). Force reconnect.
  useEffect(() => {
    if (!joined) return;
    const iv = setInterval(() => {
      if (leftRef.current) return;
      if (Date.now() - lastEventAtRef.current > 45000) {
        addLog('signaling stale (>45s silent) — forcing reconnect');
        setSigState('reconnecting');
        lastEventAtRef.current = Date.now(); // avoid immediate re-trigger
        connectSignaling();
      }
    }, 20000);
    return () => clearInterval(iv);
  }, [joined, connectSignaling, addLog]);

  const leave = useCallback(() => {
    leftRef.current = true;
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    setSigState('off');
    esRef.current?.close();
    pcRef.current?.getSenders().forEach((s) => s.track?.stop());
    pcRef.current?.close();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    post({ type: 'peer-leave' });
    pcRef.current = null;
    offerSentRef.current = false;
    setJoined(false);
    setConnState('closed');
    setRemoteAudible(false);
    addLog('left cleanly');
  }, [post, addLog]);

  useEffect(() => () => { esRef.current?.close(); pcRef.current?.close(); }, []);

  const Row = ({ k, v }: { k: string; v: string }) => (
    <div className="flex justify-between gap-4 py-1 border-b border-neutral-800">
      <span className="text-neutral-500">{k}</span>
      <span className="text-neutral-200 font-mono text-sm">{v}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="mx-auto max-w-xl space-y-5">
        <div>
          <h1 className="text-lg font-semibold">Session Room — transport smoke test</h1>
          <p className="text-xs text-neutral-500">
            Phase A · no recording, no transcript, no memory. Room <span className="font-mono">{roomId}</span> · role{' '}
            <span className="font-mono">{role}</span>
          </p>
        </div>

        <div className="flex gap-2">
          {!joined ? (
            <button onClick={join} className="px-4 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-sm hover:bg-emerald-500/25">
              Join as {role}
            </button>
          ) : (
            <button onClick={leave} className="px-4 py-2 rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 text-sm hover:bg-red-500/25">
              Leave
            </button>
          )}
          <button
            onClick={() => audioRef.current?.play().then(() => setRemoteAudible(true)).catch(() => {})}
            className="px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300 text-sm hover:bg-neutral-700"
          >
            Play remote audio
          </button>
        </div>

        <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-4">
          <Row k="mic" v={micState} />
          <Row k="signaling" v={sigState} />
          <Row k="connection" v={connState} />
          <Row k="ice" v={iceState} />
          <Row k="remote audible" v={remoteAudible ? 'yes' : 'no'} />
          <Row k="connected via" v={connectedVia ?? '—'} />
        </div>

        <audio ref={audioRef} autoPlay className="hidden" />

        <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-3">
          <div className="text-xs text-neutral-500 mb-1 uppercase tracking-wider">Connection log</div>
          <pre className="text-xs text-neutral-300 font-mono whitespace-pre-wrap max-h-72 overflow-auto">{log.join('\n') || '—'}</pre>
        </div>
      </div>
    </div>
  );
}
