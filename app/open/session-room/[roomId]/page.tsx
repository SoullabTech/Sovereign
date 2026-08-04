'use client';

/**
 * WebRTC Session Room — consent-gated door + P2P transport. TRANSPORT ONLY.
 *
 * Consent opens the door (threshold → room wiring): the room is reached from
 * /open/threshold/<token> after the participant authors their own `join` consent —
 * the URL carries ?threshold=<token>, the participant's own capability. Without a
 * valid, consented proof the room refuses: no mic is requested, no signaling occurs
 * (the signal route re-checks the consent row on EVERY request — structural, not UI).
 * Role is taken from the participant row server-side, not trusted from the URL.
 * Explicitly still: NO recording, NO transcript, NO memory, NO Encounter/scribe write.
 *
 * Slice 1a (native presence) adds the picture: 1:1 audio AND video, local preview,
 * camera/mic toggles, device selection, and typed permission failures. It adds NOTHING
 * else — recording in the native room is Slice 2 and is gated on the per-participant
 * `record` consent event. The room says so plainly rather than showing dead controls.
 *
 * Entry: mint links via POST /api/studio/encounters/[id]/threshold → each participant
 * crosses their own threshold → "Enter the session room".
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
  acquireLocalMedia,
  partitionDevices,
  setTrackEnabled,
  switchDevice,
  type MediaErrorInfo,
} from '@/lib/session/nativeMedia';

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
  const thresholdToken = search?.get('threshold') ?? null;

  // Role is SERVER-derived (participant row) once the door check passes; the ?role param is
  // only a provisional label until then. Held in a ref so signaling callbacks read the truth.
  const [role, setRole] = useState<'practitioner' | 'guest'>(
    search?.get('role') === 'practitioner' ? 'practitioner' : 'guest'
  );
  const roleRef = useRef<'practitioner' | 'guest'>(role);

  // The door: consent opens the room. 'none' = no proof in URL (refuse, no controls);
  // 'unconsented' = valid token but the participant hasn't crossed the threshold yet.
  const [door, setDoor] = useState<'checking' | 'none' | 'unconsented' | 'open' | 'refused'>(
    thresholdToken ? 'checking' : 'none'
  );
  const [doorName, setDoorName] = useState<string | null>(null);

  const [joined, setJoined] = useState(false);
  // Signaling liveness is VISIBLE — a dead stream must never be silent (Phase A hardening).
  const [sigState, setSigState] = useState<'off' | 'connected' | 'reconnecting'>('off');
  const [micState, setMicState] = useState<'idle' | 'granted' | 'denied'>('idle');
  const [connState, setConnState] = useState<string>('new');
  const [iceState, setIceState] = useState<string>('new');
  const [remoteAudible, setRemoteAudible] = useState(false);
  const [connectedVia, setConnectedVia] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);

  // Media state. `videoStatus` is 'unavailable' whenever this participant is not publishing
  // a camera — the room then runs audio-only and SAYS so, rather than showing a dead tile.
  const [videoStatus, setVideoStatus] = useState<'off' | 'on' | 'unavailable'>('off');
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [mediaError, setMediaError] = useState<MediaErrorInfo | null>(null);
  const [videoIssue, setVideoIssue] = useState<MediaErrorInfo | null>(null);
  const [remoteHasVideo, setRemoteHasVideo] = useState(false);
  const [cameras, setCameras] = useState<Array<{ deviceId: string; label: string }>>([]);
  const [microphones, setMicrophones] = useState<Array<{ deviceId: string; label: string }>>([]);
  const [selectedCam, setSelectedCam] = useState<string>('');
  const [selectedMic, setSelectedMic] = useState<string>('');

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
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

  // Door check on mount — BEFORE any mic request. The consent row is the authority; this
  // pre-check is honesty for the person (the enforcing check lives in the signal route).
  useEffect(() => {
    if (!thresholdToken) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`/api/open/threshold/${encodeURIComponent(thresholdToken)}`);
        if (cancelled) return;
        if (!r.ok) {
          setDoor('refused');
          addLog(`door: threshold link invalid (${r.status})`);
          return;
        }
        const j = await r.json();
        if (j.encounterId !== roomId) {
          setDoor('refused');
          addLog('door: this link belongs to a different room');
          return;
        }
        if (!j.joined) {
          setDoor('unconsented');
          addLog('door: consent not yet given — cross the threshold first');
          return;
        }
        const serverRole = j.role === 'practitioner' ? 'practitioner' : 'guest';
        roleRef.current = serverRole;
        setRole(serverRole);
        setDoorName(j.displayName ?? null);
        setDoor('open');
        addLog(`door: consented ✓ (${j.displayName ?? 'participant'} · ${serverRole})`);
      } catch {
        if (!cancelled) setDoor('refused');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [thresholdToken, roomId, addLog]);

  const post = useCallback(
    (msg: Record<string, unknown>) =>
      fetch(`/api/open/session-room/${roomId}/signal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // threshold = this participant's own door proof; the server verifies the consent
        // row on every publish and STRIPS the token before relaying to the peer.
        body: JSON.stringify({ from: peerIdRef.current, threshold: thresholdToken, ...msg }),
      }).catch(() => {}),
    [roomId, thresholdToken]
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
      const remote = e.streams[0];
      if (remoteVideoRef.current && remote) {
        remoteVideoRef.current.srcObject = remote;
        remoteVideoRef.current.play().then(() => setRemoteAudible(true)).catch(() => {
          addLog('autoplay blocked — click "Play remote media"');
        });
      }
      // A camera the peer has switched OFF arrives as a muted track, not an absent one.
      // Reading `muted` (not merely track count) is what keeps "their camera is off"
      // honest instead of showing a black rectangle and calling it video.
      const syncRemoteVideo = () => {
        const v = remote?.getVideoTracks() ?? [];
        setRemoteHasVideo(v.length > 0 && v.some((t) => !t.muted));
      };
      if (e.track.kind === 'video') {
        e.track.onmute = syncRemoteVideo;
        e.track.onunmute = syncRemoteVideo;
        e.track.onended = syncRemoteVideo;
      }
      syncRemoteVideo();
      addLog(`remote ${e.track.kind} track received`);
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
    if (roleRef.current !== 'practitioner' || offerSentRef.current) return;
    const pc = pcRef.current ?? createPeer();
    offerSentRef.current = true;
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    addLog('sent offer');
    post({ type: 'offer', payload: offer });
  }, [createPeer, addLog, post]);

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
        if (roleRef.current === 'practitioner') {
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
    [createPeer, makeOffer, addLog, post]
  );

  const join = useCallback(async () => {
    // Consent opens the door: no proof, no mic, no signaling. (The server enforces the
    // same rule on every signal request; this guard keeps the client honest too.)
    if (door !== 'open' || !thresholdToken) {
      addLog('door is not open — the room opens from a consent threshold');
      return;
    }
    peerIdRef.current = randomPeerId();
    addLog(`joining as ${role} (${peerIdRef.current}) room=${roomId}`);
    setMediaError(null);
    setVideoIssue(null);
    const media = await acquireLocalMedia(
      (c) => navigator.mediaDevices.getUserMedia(c),
      { audioDeviceId: selectedMic || undefined, videoDeviceId: selectedCam || undefined }
    );
    if (!media.ok) {
      // Audio is the floor: no microphone, no session. Say which device and what to do.
      setMicState('denied');
      setMediaError(media.error);
      addLog(`media DENIED — ${media.error.kind}: ${media.error.title}`);
      return;
    }
    localStreamRef.current = media.stream;
    setMicState('granted');
    setMicOn(true);
    setVideoStatus(media.video);
    setCameraOn(media.video === 'on');
    setVideoIssue(media.videoIssue ?? null);
    addLog(media.video === 'on' ? 'mic + camera granted' : `mic granted · camera unavailable (${media.videoIssue?.kind})`);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = media.stream;
      localVideoRef.current.play().catch(() => {});
    }
    // Device labels are withheld until permission is granted, so enumerate AFTER the grant —
    // enumerating earlier yields unnamed entries the participant cannot choose between.
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const { cameras: cams, microphones: mics } = partitionDevices(devices);
      setCameras(cams);
      setMicrophones(mics);
      const liveCam = media.stream.getVideoTracks()[0]?.getSettings?.().deviceId;
      const liveMic = media.stream.getAudioTracks()[0]?.getSettings?.().deviceId;
      if (liveCam) setSelectedCam(liveCam);
      if (liveMic) setSelectedMic(liveMic);
    } catch {
      /* device list is a convenience; the room works without it */
    }
    // R-A5: fetch self-hosted ICE (coturn). No third-party fallback — if unconfigured,
    // proceed host-candidate-only (works same-machine/LAN; real NAT traversal needs coturn).
    try {
      // TURN minting is consent-gated (same threshold door as signaling). We already hold a valid
      // thresholdToken here — the guard above returns early without one — so this never 403s the
      // legitimate join/reconnect path.
      const r = await fetch(
        `/api/open/session-room/${roomId}/turn-credentials?threshold=${encodeURIComponent(thresholdToken ?? '')}`,
      );
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
  }, [role, roomId, door, thresholdToken, createPeer, addLog, selectedCam, selectedMic]); // eslint-disable-line react-hooks/exhaustive-deps

  // Toggles flip `track.enabled` — the sender and its m-line stay in place, so turning the
  // camera back on never triggers a renegotiation mid-session.
  const toggleCamera = useCallback(() => {
    const next = !cameraOn;
    if (setTrackEnabled(localStreamRef.current, 'video', next) === null) return;
    setCameraOn(next);
    addLog(`camera ${next ? 'on' : 'off'}`);
  }, [cameraOn, addLog]);

  const toggleMic = useCallback(() => {
    const next = !micOn;
    if (setTrackEnabled(localStreamRef.current, 'audio', next) === null) return;
    setMicOn(next);
    addLog(`microphone ${next ? 'live' : 'muted'}`);
  }, [micOn, addLog]);

  const changeDevice = useCallback(
    async (kind: 'audio' | 'video', deviceId: string) => {
      const stream = localStreamRef.current;
      if (!stream || !deviceId) return;
      const res = await switchDevice({
        getUserMedia: (c) => navigator.mediaDevices.getUserMedia(c),
        stream,
        senders: (pcRef.current?.getSenders() ?? []) as unknown as Parameters<typeof switchDevice>[0]['senders'],
        kind,
        deviceId,
      });
      if (!res.ok) {
        // The old device is still publishing — report the failure without dropping them.
        setMediaError(res.error ?? null);
        addLog(`device switch failed (${kind}): ${res.error?.kind}`);
        return;
      }
      if (kind === 'video') {
        setSelectedCam(deviceId);
        // Re-point the preview: the stream object is the same, but the element must be told.
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      } else {
        setSelectedMic(deviceId);
      }
      addLog(`switched ${kind} device`);
    },
    [addLog]
  );

  // Signaling connection with reconnect: SAME peerId across reconnects (the server
  // re-announces on re-subscribe, so presence self-heals). Backoff 1s→10s. A dead
  // stream is never silent: sigState goes 'reconnecting' and the log says so.
  const connectSignaling = useCallback(() => {
    esRef.current?.close();
    const es = new EventSource(
      `/api/open/session-room/${roomId}/signal?peerId=${peerIdRef.current}&threshold=${encodeURIComponent(thresholdToken ?? '')}`
    );
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
  }, [roomId, thresholdToken, handleSignal, addLog]);

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
    setRemoteHasVideo(false);
    setVideoStatus('off');
    // Detach both elements so no last frame lingers after the room is gone.
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    localStreamRef.current = null;
    addLog('left cleanly');
  }, [post, addLog]);

  // Unmount cleanup. `leave()` stops the mic on the intentional exit; this covers the OTHER exits
  // (tab close, back nav, route change) where leave() never runs — otherwise localStream tracks
  // keep the mic hot (browser recording indicator stays on) after the room is gone.
  useEffect(() => () => {
    esRef.current?.close();
    pcRef.current?.close();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

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
          <h1 className="text-lg font-semibold">Session Room</h1>
          <p className="text-xs text-neutral-500">
            Room <span className="font-mono">{roomId}</span> · role <span className="font-mono">{role}</span>
          </p>
          {/* Truthful statement of current capability — not "coming soon", not "may not work". */}
          <p className="mt-1 text-xs text-neutral-500" data-testid="recording-notice">
            Recording is not yet available in the native room. Nothing here is recorded, transcribed,
            or remembered.
          </p>
        </div>

        {door === 'none' && (
          <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-5 space-y-2" data-testid="door-none">
            <h2 className="text-sm font-semibold text-neutral-200">This room opens from a consent threshold</h2>
            <p className="text-sm text-neutral-400">
              There is no side door. Ask your practitioner for your threshold link — the room opens
              after you agree there, and only for you.
            </p>
          </div>
        )}

        {door === 'checking' && (
          <p className="text-sm text-neutral-400" data-testid="door-checking">Checking your threshold…</p>
        )}

        {door === 'unconsented' && (
          <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-5 space-y-3" data-testid="door-unconsented">
            <h2 className="text-sm font-semibold text-neutral-200">You haven&apos;t crossed the threshold yet</h2>
            <p className="text-sm text-neutral-400">The room opens only after you agree at the threshold.</p>
            <a
              href={`/open/threshold/${encodeURIComponent(thresholdToken ?? '')}`}
              className="inline-block px-4 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-sm hover:bg-emerald-500/25"
            >
              Go to the threshold
            </a>
          </div>
        )}

        {door === 'refused' && (
          <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-5 space-y-2" data-testid="door-refused">
            <h2 className="text-sm font-semibold text-neutral-200">This link doesn&apos;t open this room</h2>
            <p className="text-sm text-neutral-400">
              The threshold link is invalid, expired, or belongs to a different session. Please ask
              your practitioner for a new link.
            </p>
          </div>
        )}

        {/* A media failure is the participant's problem to solve, so it names the device and
            the remedy. Shown whether or not the room is otherwise fine. */}
        {mediaError && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/40 p-4 space-y-1" data-testid="media-error">
            <h2 className="text-sm font-semibold text-red-200">{mediaError.title}</h2>
            <p className="text-sm text-red-200/80">{mediaError.detail}</p>
          </div>
        )}

        {joined && (
          <div className="space-y-3" data-testid="stage">
            {/* Remote first: the person you are with is the subject of the room, not yourself. */}
            <div className="relative rounded-xl overflow-hidden bg-black border border-neutral-800 aspect-video">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                data-testid="remote-video"
              />
              {!remoteHasVideo && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-neutral-500">
                  {remoteAudible ? 'Their camera is off' : 'Waiting for the other participant…'}
                </div>
              )}
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-xs text-neutral-200">
                {role === 'practitioner' ? 'Participant' : 'Practitioner'}
              </span>
            </div>

            <div className="relative w-48 rounded-lg overflow-hidden bg-black border border-neutral-800 aspect-video">
              {/* muted: a live preview of your own microphone would feed back. */}
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
                data-testid="local-video"
              />
              {(!cameraOn || videoStatus !== 'on') && (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-neutral-500">
                  {videoStatus === 'unavailable' ? 'No camera' : 'Camera off'}
                </div>
              )}
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-neutral-300">
                {doorName ?? 'You'}
                {!micOn && ' · muted'}
              </span>
            </div>
          </div>
        )}

        {door === 'open' && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {!joined ? (
                <button onClick={join} className="px-4 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-sm hover:bg-emerald-500/25">
                  Join as {role}
                </button>
              ) : (
                <>
                  <button
                    onClick={toggleMic}
                    data-testid="toggle-mic"
                    className={`px-4 py-2 rounded-lg border text-sm ${micOn ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700' : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'}`}
                  >
                    {micOn ? 'Mute' : 'Unmute'}
                  </button>
                  <button
                    onClick={toggleCamera}
                    disabled={videoStatus !== 'on'}
                    data-testid="toggle-camera"
                    title={videoStatus !== 'on' ? 'No camera is publishing — rejoin to enable it' : undefined}
                    className={`px-4 py-2 rounded-lg border text-sm disabled:opacity-40 disabled:cursor-not-allowed ${cameraOn ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700' : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'}`}
                  >
                    {cameraOn ? 'Camera off' : 'Camera on'}
                  </button>
                  <button onClick={leave} className="px-4 py-2 rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 text-sm hover:bg-red-500/25">
                    Leave
                  </button>
                  <button
                    onClick={() => remoteVideoRef.current?.play().then(() => setRemoteAudible(true)).catch(() => {})}
                    className="px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300 text-sm hover:bg-neutral-700"
                  >
                    Play remote media
                  </button>
                </>
              )}
            </div>

            {joined && (cameras.length > 1 || microphones.length > 1) && (
              <div className="flex flex-wrap gap-2 text-xs">
                {microphones.length > 1 && (
                  <select
                    value={selectedMic}
                    onChange={(e) => changeDevice('audio', e.target.value)}
                    data-testid="mic-select"
                    className="px-2 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300"
                  >
                    {microphones.map((m) => (
                      <option key={m.deviceId} value={m.deviceId}>{m.label}</option>
                    ))}
                  </select>
                )}
                {cameras.length > 1 && videoStatus === 'on' && (
                  <select
                    value={selectedCam}
                    onChange={(e) => changeDevice('video', e.target.value)}
                    data-testid="camera-select"
                    className="px-2 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300"
                  >
                    {cameras.map((c) => (
                      <option key={c.deviceId} value={c.deviceId}>{c.label}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Audio-only is a legitimate way to be in the room — but never a silent one. */}
            {joined && videoStatus === 'unavailable' && videoIssue && (
              <p className="text-xs text-amber-300/80" data-testid="video-degraded">
                Audio only — {videoIssue.title.toLowerCase()}. {videoIssue.detail}
              </p>
            )}
          </div>
        )}

        <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-4">
          <Row k="door" v={door === 'open' ? `consented ✓${doorName ? ` (${doorName})` : ''}` : door} />
          <Row k="mic" v={micState === 'granted' ? (micOn ? 'live' : 'muted') : micState} />
          <Row k="camera" v={videoStatus === 'on' ? (cameraOn ? 'on' : 'off') : videoStatus} />
          <Row k="signaling" v={sigState} />
          <Row k="connection" v={connState} />
          <Row k="ice" v={iceState} />
          <Row k="remote audible" v={remoteAudible ? 'yes' : 'no'} />
          <Row k="remote video" v={remoteHasVideo ? 'yes' : 'no'} />
          <Row k="connected via" v={connectedVia ?? '—'} />
        </div>

        <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-3">
          <div className="text-xs text-neutral-500 mb-1 uppercase tracking-wider">Connection log</div>
          <pre className="text-xs text-neutral-300 font-mono whitespace-pre-wrap max-h-72 overflow-auto">{log.join('\n') || '—'}</pre>
        </div>
      </div>
    </div>
  );
}
