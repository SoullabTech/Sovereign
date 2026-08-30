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
  const streamRef = useRef<MediaStream | null>(null);

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
      setBusy(false);
    }
  }, [label]);

  const release = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

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
    <div style={{ padding: 24, fontFamily: 'ui-monospace, monospace', fontSize: 13, lineHeight: 1.5 }}>
      <h1 style={{ fontSize: 16, marginBottom: 4 }}>Acoustic calibration harness</h1>
      <p style={{ opacity: 0.7, maxWidth: 720 }}>
        Local diagnostic. Records through the production recorder, measures, and drops the audio.
        Nothing is uploaded, nothing is transcribed, nothing is persisted.
        <strong> crossingCount counts scheduled analyser observations that crossed threshold — it is not milliseconds of speech.</strong>
      </p>

      <div style={{ margin: '16px 0' }}>
        <select value={label} onChange={(e) => setLabel(e.target.value)} disabled={busy}>
          {CLASSES.map((c) => (
            <option key={c.label} value={c.label}>
              {c.label} — {c.hint} (target {c.target})
            </option>
          ))}
        </select>
        <button onClick={capture} disabled={busy} style={{ marginLeft: 12, padding: '6px 14px' }}>
          {busy ? 'capturing…' : 'Capture'}
        </button>
        <button onClick={release} disabled={busy} style={{ marginLeft: 8, padding: '6px 14px' }}>
          Release mic
        </button>
      </div>

      {error && <p style={{ color: '#c00' }}>⚠ {error}</p>}

      <table cellPadding={6} style={{ borderCollapse: 'collapse', marginTop: 8 }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #888' }}>
            <th>case</th><th>n / target</th>
            <th>count min/med/max</th><th>rmsMax min/med/max</th><th>rmsMean min/med/max</th>
            <th>trust fails</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} style={{ borderBottom: '1px solid #333' }}>
              <td>{r.label}</td>
              <td>{r.n} / {r.target}</td>
              <td>{r.count.min} / {r.count.med} / {r.count.max}</td>
              <td>{r.rmsMax.min} / {r.rmsMax.med} / {r.rmsMax.max}</td>
              <td>{r.rmsMean.min} / {r.rmsMean.med} / {r.rmsMean.max}</td>
              <td style={{ color: r.trustFails ? '#c60' : undefined }}>{r.trustFails}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: 16, opacity: 0.7 }}>
        Trials with any apparatus fault are excluded from the statistics above and counted under
        “trust fails”. Do not rehearse the utterances into uniformity — the minima matter most,
        and poll phase alone moves the count by ±1.
      </p>

      <details style={{ marginTop: 16 }}>
        <summary>Raw trials ({trials.length}) — copy out</summary>
        <textarea readOnly value={tsv} rows={14} style={{ width: '100%', fontFamily: 'inherit', fontSize: 12, marginTop: 8 }} />
      </details>
    </div>
  );
}
