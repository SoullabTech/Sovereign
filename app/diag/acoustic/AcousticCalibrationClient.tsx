'use client';

/**
 * DESKTOP-VOICE-DEVICE-CALIBRATION-HARNESS-01 — local calibration surface.
 *
 * ⛔ AN INSTRUMENT, NOT A GATE. Nothing here admits, refuses, or thresholds.
 * It runs the REAL production recorder against the REAL microphone and reports
 * bounded measurements, so the acoustic-admission boundary can eventually be
 * decided from actual voices instead of synthetic fills.
 *
 * ⛔ THE AUDIO NEVER LEAVES THE DEVICE. `stopBeforeUpload` is mandatory on the
 * calibration option, so `recordAndTranscribe` returns before the transcription
 * request. This surface ends before Whisper.
 *
 * ⛔ NOTHING IS PERSISTED. Trials live in React state for the length of the
 * session and are gone on reload. No per-poll history, no waveform, no audio,
 * no transcript. Copy-out is manual and explicit.
 */

import { useCallback, useRef, useState } from 'react';
import { recordAndTranscribe, type CaptureCalibration } from '@/lib/voice/androidVoiceFallback';

/** What the harness reports about the track it is actually recording through. */
interface MicIdentity {
  label: string;
  readyState: MediaStreamTrackState;
  enabled: boolean;
  muted: boolean;
}

interface Trial extends CaptureCalibration {
  label: string;
  n: number;
}

/** The dataset the ruling unit needs. Order is the suggested walk order. */
const CLASSES = [
  { label: 'silence', target: 8, hint: 'sit normally, say nothing' },
  { label: 'hi-normal', target: 12, hint: '"Hi" — ordinary voice' },
  { label: 'hi-quiet', target: 12, hint: '"Hi" — soft but natural' },
  { label: 'okay', target: 8, hint: '"Okay" — ordinary voice' },
  { label: 'sentence-normal', target: 6, hint: 'one short sentence' },
  { label: 'sentence-quiet', target: 6, hint: 'same sentence, quiet' },
  { label: 'desk-tap', target: 8, hint: 'ordinary desk or table tap' },
  { label: 'cough', target: 6, hint: 'cough or throat-clear' },
] as const;

/** A trial is usable for acoustic calibration only if the apparatus held. */
const trusted = (t: CaptureCalibration) =>
  !t.contextTrustBroken && !t.trackEnded && !t.trackMuted && t.analyserErrors === 0;

function stats(values: number[]) {
  if (!values.length) return { min: '—', med: '—', max: '—' };
  const s = [...values].sort((a, b) => a - b);
  const med = s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
  const f = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(4));
  return { min: f(s[0]), med: f(med), max: f(s[s.length - 1]) };
}

export default function AcousticCalibrationClient() {
  const [label, setLabel] = useState<string>(CLASSES[0].label);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mic, setMic] = useState<MicIdentity | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  /**
   * DIAG-ACOUSTIC-MIC-IDENTITY-01 — read the identity of the track the recorder
   * is actually using. It reads `streamRef.current` — the SAME MediaStream
   * handed to `recordAndTranscribe` — so this reports the device in the
   * measurement path, not a device the OS or Chrome merely lists. No
   * enumeration, no selection, no second acquisition.
   */
  const readMic = useCallback(() => {
    const track = streamRef.current?.getAudioTracks()[0];
    setMic(track ? {
      label: track.label || '(no label — permission granted without device name)',
      readyState: track.readyState,
      enabled: track.enabled,
      muted: track.muted,
    } : null);
  }, []);

  const capture = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      // Reuse one stream across trials, as the production surface does — a
      // fresh getUserMedia per capture would re-negotiate the device and change
      // exactly the apparatus conditions being measured.
      if (!streamRef.current) {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      // Identity is read on every capture, not only on acquisition: readyState,
      // enabled and muted are live properties that can change under the trial.
      readMic();
      let measured: CaptureCalibration | null = null;
      await recordAndTranscribe(streamRef.current, {
        calibration: {
          onMeasure: (m) => { measured = m; },
          stopBeforeUpload: true,
        },
      });
      if (!measured) {
        setError('no measurement emitted — the capture ended before the analyser ran');
        return;
      }
      setTrials((prev) => [
        ...prev,
        { ...(measured as CaptureCalibration), label, n: prev.filter((t) => t.label === label).length + 1 },
      ]);
    } catch (e) {
      setError(e instanceof Error ? `${e.name}: ${e.message}` : String(e));
    } finally {
      readMic();
      setBusy(false);
    }
  }, [label, readMic]);

  const release = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setMic(null);
  }, []);

  /** Acquire without recording, so the device can be identified before trial 1. */
  const identify = useCallback(async () => {
    setError(null);
    try {
      if (!streamRef.current) {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      readMic();
    } catch (e) {
      setError(e instanceof Error ? `${e.name}: ${e.message}` : String(e));
    }
  }, [readMic]);

  const rows = CLASSES.map((c) => {
    const all = trials.filter((t) => t.label === c.label);
    const ok = all.filter(trusted);
    return {
      label: c.label,
      target: c.target,
      n: all.length,
      trustFails: all.length - ok.length,
      count: stats(ok.map((t) => t.crossingCount)),
      rmsMax: stats(ok.map((t) => t.rmsMax)),
      rmsMean: stats(ok.map((t) => t.rmsMean)),
    };
  });

  const tsv = [
    ['label', 'n', 'durationMs', 'scheduledPolls', 'trustedPolls', 'crossingCount', 'rmsMax', 'rmsMean', 'ctxBroken', 'trackEnded', 'trackMuted', 'analyserErrors'].join('\t'),
    ...trials.map((t) => [t.label, t.n, t.durationMs, t.scheduledPolls, t.trustedPolls, t.crossingCount, t.rmsMax.toFixed(5), t.rmsMean.toFixed(5), t.contextTrustBroken, t.trackEnded, t.trackMuted, t.analyserErrors].join('\t')),
  ].join('\n');

  return (
    <div className="diag-acoustic">
      {/*
        DIAG-ACOUSTIC-WHITE-TEXT-01 — diagnostic CSS only. The page is served
        only under NEXT_PUBLIC_MOBILE_FAST_LANE=1 and never ships; no shared
        theme token, recorder, calibration, microphone or measurement code is
        touched by this styling.
      */}
      <style>{`
        /* DIAG-ACOUSTIC-WHITE-TEXT-01 — one job: white text on the existing
           dark background. The previous pass forced a white surface; that
           changed the background, which is not what was asked for. The
           background is now left exactly as the app paints it and every piece
           of text on this diagnostic page is pinned white. */
        .diag-acoustic {
          color-scheme: dark;
          min-height: 100vh;
          padding: 24px;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 13px;
          line-height: 1.5;
          color: #ffffff !important;
        }
        .diag-acoustic *,
        .diag-acoustic h1,
        .diag-acoustic p,
        .diag-acoustic div,
        .diag-acoustic span,
        .diag-acoustic strong,
        .diag-acoustic label,
        .diag-acoustic table,
        .diag-acoustic thead,
        .diag-acoustic tbody,
        .diag-acoustic tr,
        .diag-acoustic th,
        .diag-acoustic td,
        .diag-acoustic details,
        .diag-acoustic summary {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff;
        }
        .diag-acoustic table { border-collapse: collapse; margin-top: 8px; }
        .diag-acoustic thead tr { text-align: left; border-bottom: 2px solid #ffffff; }
        .diag-acoustic tbody tr { border-bottom: 1px solid #666666; }
        .diag-acoustic select,
        .diag-acoustic option,
        .diag-acoustic button,
        .diag-acoustic textarea {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff;
          background: #222222 !important;
          background-image: none !important;
          border: 1px solid #999999 !important;
          font-family: inherit;
          opacity: 1;
        }
        .diag-acoustic button { padding: 6px 14px; cursor: pointer; }
        .diag-acoustic button:disabled { background: #111111 !important; cursor: default; }
        /* Warning + flag text stays legible against dark rather than near-black red. */
        .diag-acoustic .warn,
        .diag-acoustic .warn * { color: #ff8080 !important; -webkit-text-fill-color: #ff8080; }
        .diag-acoustic .flag { color: #ffb060 !important; -webkit-text-fill-color: #ffb060; }
        .diag-acoustic .mic {
          margin: 12px 0 4px;
          padding: 10px 12px;
          border: 1px solid #999999;
          max-width: 720px;
        }
        .diag-acoustic .mic .bad { color: #ff8080 !important; -webkit-text-fill-color: #ff8080; font-weight: 700; }
      `}</style>

      <h1 style={{ fontSize: 16, marginBottom: 4 }}>Acoustic calibration harness</h1>
      <p style={{ maxWidth: 720 }}>
        Local diagnostic. Records through the production recorder, measures, and drops the audio.
        Nothing is uploaded, nothing is transcribed, nothing is persisted.
        <strong> crossingCount counts scheduled analyser observations that crossed threshold — it is not milliseconds of speech.</strong>
      </p>

      {/*
        DIAG-ACOUSTIC-MIC-IDENTITY-01. The device the harness actually acquired,
        read off the same track the recorder holds. This is the authoritative
        answer to "which microphone is this" — Chrome's settings UI describes
        what it would grant, this describes what was granted.
      */}
      <div className="mic">
        {mic ? (
          <>
            <div><strong>Microphone:</strong> {mic.label}</div>
            <div>readyState: <span className={mic.readyState === 'live' ? undefined : 'bad'}>{mic.readyState}</span></div>
            <div>enabled: <span className={mic.enabled ? undefined : 'bad'}>{String(mic.enabled)}</span></div>
            <div>muted: <span className={mic.muted ? 'bad' : undefined}>{String(mic.muted)}</span></div>
          </>
        ) : (
          <div>
            Microphone: not acquired yet.{' '}
            <button onClick={identify} disabled={busy}>Identify microphone</button>
          </div>
        )}
      </div>

      <div style={{ margin: '16px 0' }}>
        <select value={label} onChange={(e) => setLabel(e.target.value)} disabled={busy}>
          {CLASSES.map((c) => (
            <option key={c.label} value={c.label}>
              {c.label} — {c.hint} (target {c.target})
            </option>
          ))}
        </select>
        <button onClick={capture} disabled={busy} style={{ marginLeft: 12 }}>
          {busy ? 'capturing…' : 'Capture'}
        </button>
        <button onClick={release} disabled={busy} style={{ marginLeft: 8 }}>
          Release mic
        </button>
      </div>

      {error && <p className="warn">⚠ {error}</p>}

      <table cellPadding={6}>
        <thead>
          <tr>
            <th>case</th><th>n / target</th>
            <th>count min/med/max</th><th>rmsMax min/med/max</th><th>rmsMean min/med/max</th>
            <th>trust fails</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td>{r.label}</td>
              <td>{r.n} / {r.target}</td>
              <td>{r.count.min} / {r.count.med} / {r.count.max}</td>
              <td>{r.rmsMax.min} / {r.rmsMax.med} / {r.rmsMax.max}</td>
              <td>{r.rmsMean.min} / {r.rmsMean.med} / {r.rmsMean.max}</td>
              <td className={r.trustFails ? 'flag' : undefined}>{r.trustFails}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: 16 }}>
        Trials with any apparatus fault are excluded from the statistics above and counted under
        “trust fails”. Do not rehearse the utterances into uniformity — the minima matter most,
        and poll phase alone moves the count by ±1.
      </p>

      <details style={{ marginTop: 16 }}>
        <summary>Raw trials ({trials.length}) — copy out</summary>
        <textarea readOnly value={tsv} rows={14} style={{ width: '100%', fontSize: 12, marginTop: 8 }} />
      </details>
    </div>
  );
}
