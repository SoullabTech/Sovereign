'use client';

/**
 * Sovereign Lobby — Session Room Phase 2.
 *
 * Spec: docs/specs/SESSION_ROOM_VIDEO_SPEC_2026-06-14.md (§7 Phase 2, §12 LiveKit-first)
 *
 * Sits between consent-accept and entering the room. It is the first surface that feels
 * unlike Zoom/Meet: the person sees what will and won't be kept BEFORE they turn a camera on,
 * checks their own equipment on an explicit gesture (no surprise camera grab), and only then
 * enters the session.
 *
 * Sovereignty rules honored here:
 *  - The device check is OPT-IN. We never call getUserMedia until the person asks for it.
 *  - Retention (recording / transcription / Sanctuary) is DISPLAYED from the agreement the
 *    client already accepted. The Lobby never offers a control that changes retention after
 *    consent — that requires a fresh agreement version (spec §3.4 / §12).
 *  - The room/link is still gated upstream by the consent ledger; the Lobby only renders what
 *    the gate already revealed.
 *
 * Phase 3 will swap the Enter action for a LiveKit room join (the `soullab` provider). Until
 * then: external providers open their link; `soullab` shows an honest "arriving next" panel.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface LobbyRetention {
  mode: string;
  recording: boolean;
  transcript: 'none' | 'temporary' | 'kept';
  summary: boolean;
  memory: boolean;
  sanctuary: boolean;
}

export interface LobbyAgreement {
  version: string;
  maiaRetention: string | null;
  providerNotice: string | null;
  provider: string | null;
}

interface DeviceOption {
  deviceId: string;
  label: string;
}

const PROVIDER_LABEL: Record<string, string> = {
  zoom: 'Zoom',
  meet: 'Google Meet',
  doxy: 'Doxy.me',
  simplepractice: 'SimplePractice',
  custom: 'your video provider',
  soullab: 'Soullab Video',
};

function transcriptStatus(t: LobbyRetention['transcript']): string {
  if (t === 'kept') return 'Transcript kept';
  if (t === 'temporary') return 'Transcript used in-session, then discarded';
  return 'No transcript';
}

export default function SovereignLobby({
  agreement,
  retention,
  videoLink,
}: {
  agreement: LobbyAgreement;
  retention: LobbyRetention | null;
  videoLink: string | null;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  const [checking, setChecking] = useState(false);
  const [previewOn, setPreviewOn] = useState(false);
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [cameras, setCameras] = useState<DeviceOption[]>([]);
  const [mics, setMics] = useState<DeviceOption[]>([]);
  const [selectedCam, setSelectedCam] = useState('');
  const [selectedMic, setSelectedMic] = useState('');
  const [micLevel, setMicLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);

  const provider = agreement.provider || 'soullab';
  const providerLabel = PROVIDER_LABEL[provider] ?? 'your video provider';
  const isExternal = provider !== 'soullab' && !!videoLink;

  const stopStream = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setPreviewOn(false);
    setMicLevel(0);
  }, []);

  const attachMeter = useCallback((stream: MediaStream) => {
    try {
      const AC: typeof AudioContext =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let peak = 0;
        for (let i = 0; i < data.length; i++) {
          const v = Math.abs(data[i] - 128) / 128;
          if (v > peak) peak = v;
        }
        setMicLevel(peak);
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      /* meter is best-effort; absence never blocks the session */
    }
  }, []);

  const acquire = useCallback(
    async (camId?: string, micId?: string) => {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setError('This browser does not support camera and microphone preview. You can still enter the session.');
        return;
      }
      setError(null);
      setChecking(true);
      try {
        stopStream();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: camId ? { deviceId: { exact: camId } } : true,
          audio: micId ? { deviceId: { exact: micId } } : true,
        });
        streamRef.current = stream;
        stream.getVideoTracks().forEach((t) => (t.enabled = camOn));
        stream.getAudioTracks().forEach((t) => (t.enabled = micOn));
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
        attachMeter(stream);

        // Labels only populate after permission is granted.
        const devices = await navigator.mediaDevices.enumerateDevices();
        setCameras(
          devices
            .filter((d) => d.kind === 'videoinput')
            .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Camera ${i + 1}` }))
        );
        setMics(
          devices
            .filter((d) => d.kind === 'audioinput')
            .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Microphone ${i + 1}` }))
        );
        setSelectedCam(stream.getVideoTracks()[0]?.getSettings().deviceId ?? '');
        setSelectedMic(stream.getAudioTracks()[0]?.getSettings().deviceId ?? '');
        setPreviewOn(true);
      } catch (e) {
        stopStream();
        const name = (e as { name?: string })?.name;
        setError(
          name === 'NotAllowedError'
            ? 'Camera and microphone access was blocked. You can allow access and check again, or enter the session as you are.'
            : 'We could not reach your camera or microphone. You can still enter the session.'
        );
      } finally {
        setChecking(false);
      }
    },
    [stopStream, attachMeter, camOn, micOn]
  );

  useEffect(() => () => stopStream(), [stopStream]);

  const toggleCam = () => {
    const next = !camOn;
    setCamOn(next);
    streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = next));
  };
  const toggleMic = () => {
    const next = !micOn;
    setMicOn(next);
    streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = next));
  };

  const enter = () => {
    stopStream();
    if (isExternal && videoLink) {
      window.open(videoLink, '_blank', 'noopener,noreferrer');
    }
    setEntered(true);
  };

  // ---- Entered state (Phase 3 will replace this with the live room) ----
  if (entered) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-stone-50 px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-7 text-center shadow-sm">
          {isExternal ? (
            <>
              <h1 className="text-lg font-medium text-stone-800">Your session opened in {providerLabel}</h1>
              <p className="mt-2 text-sm text-stone-500">
                If the tab didn’t open, use the button below. MAIA keeps only what your agreement allows.
              </p>
              {videoLink && (
                <a
                  href={videoLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-block w-full rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-500"
                >
                  Reopen session
                </a>
              )}
            </>
          ) : (
            <>
              <h1 className="text-lg font-medium text-stone-800">You’re ready</h1>
              <p className="mt-2 text-sm text-stone-500">
                Your agreement is accepted and your devices are checked. The live Session Room opens here in the next
                release.
              </p>
            </>
          )}
        </div>
      </main>
    );
  }

  // ---- Lobby ----
  return (
    <main className="min-h-screen bg-stone-50 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-6">
          <h1 className="text-xl font-medium text-stone-800">Your session</h1>
          <p className="mt-1 text-sm text-stone-500">Check your camera and mic, review what’s kept, then enter.</p>
        </header>

        {retention?.sanctuary && (
          <div className="mb-4 rounded-xl border border-violet-200 bg-violet-50 p-4">
            <p className="text-sm font-medium text-violet-800">Sanctuary — this session won’t be remembered</p>
            <p className="mt-1 text-xs text-violet-700">
              Nothing said here is recorded, transcribed, or stored. Only the date and duration are kept.
            </p>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          {/* Equipment check */}
          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-medium text-stone-700">Camera &amp; microphone</h2>

            <div className="mt-3 aspect-video w-full overflow-hidden rounded-xl bg-stone-900">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                ref={videoRef}
                className={`h-full w-full object-cover ${previewOn && camOn ? '' : 'hidden'}`}
                playsInline
                autoPlay
                muted
              />
              {!(previewOn && camOn) && (
                <div className="flex h-full w-full items-center justify-center px-4 text-center text-xs text-stone-400">
                  {previewOn && !camOn ? 'Camera off' : 'Camera preview is off'}
                </div>
              )}
            </div>

            {previewOn && (
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500">Mic</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-200">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-[width] duration-75"
                      style={{ width: `${micOn ? Math.min(100, Math.round(micLevel * 140)) : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {!previewOn ? (
              <button
                onClick={() => acquire()}
                disabled={checking}
                className="mt-4 w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-60"
              >
                {checking ? 'Starting…' : 'Check your camera & mic'}
              </button>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={toggleCam}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium ${
                      camOn
                        ? 'border-stone-300 text-stone-700 hover:bg-stone-50'
                        : 'border-rose-200 bg-rose-50 text-rose-700'
                    }`}
                  >
                    {camOn ? 'Camera on' : 'Camera off'}
                  </button>
                  <button
                    onClick={toggleMic}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium ${
                      micOn
                        ? 'border-stone-300 text-stone-700 hover:bg-stone-50'
                        : 'border-rose-200 bg-rose-50 text-rose-700'
                    }`}
                  >
                    {micOn ? 'Mic on' : 'Mic off'}
                  </button>
                </div>

                {cameras.length > 1 && (
                  <select
                    value={selectedCam}
                    onChange={(e) => acquire(e.target.value, selectedMic || undefined)}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-700"
                  >
                    {cameras.map((c) => (
                      <option key={c.deviceId} value={c.deviceId}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                )}
                {mics.length > 1 && (
                  <select
                    value={selectedMic}
                    onChange={(e) => acquire(selectedCam || undefined, e.target.value)}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-700"
                  >
                    {mics.map((m) => (
                      <option key={m.deviceId} value={m.deviceId}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {error && <p className="mt-3 text-xs text-rose-600">{error}</p>}
          </section>

          {/* What's kept + session info */}
          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-medium text-stone-700">What’s kept</h2>

            {agreement.maiaRetention && (
              <p className="mt-3 rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm leading-relaxed text-stone-700">
                {agreement.maiaRetention}
              </p>
            )}

            {retention && (
              <ul className="mt-3 space-y-2 text-xs text-stone-600">
                <li className="flex items-center gap-2">
                  <Dot on={retention.recording} />
                  {retention.recording ? 'Recording on' : 'Not recorded'}
                </li>
                <li className="flex items-center gap-2">
                  <Dot on={retention.transcript === 'kept'} amber={retention.transcript === 'temporary'} />
                  {transcriptStatus(retention.transcript)}
                </li>
                <li className="flex items-center gap-2">
                  <Dot on={retention.summary} />
                  {retention.summary ? 'Summary kept for the continuity record' : 'No summary kept'}
                </li>
              </ul>
            )}

            {agreement.providerNotice && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-amber-700">About the video</p>
                <p className="mt-1 text-xs leading-relaxed text-amber-900">{agreement.providerNotice}</p>
              </div>
            )}

            <p className="mt-3 text-[11px] text-stone-400">Agreement {agreement.version}</p>
          </section>
        </div>

        <div className="mt-6">
          <button
            onClick={enter}
            className="w-full rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-500"
          >
            Enter session{isExternal ? ` in ${providerLabel}` : ''}
          </button>
          <p className="mt-2 text-center text-xs text-stone-400">
            You can enter with your camera or mic off — you’re in control of what’s shared.
          </p>
        </div>
      </div>
    </main>
  );
}

function Dot({ on, amber }: { on: boolean; amber?: boolean }) {
  const color = on ? 'bg-emerald-500' : amber ? 'bg-amber-400' : 'bg-stone-300';
  return <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${color}`} aria-hidden />;
}
