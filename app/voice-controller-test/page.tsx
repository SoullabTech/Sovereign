'use client';

/**
 * VoiceController Smoke + Witness Page
 *
 * Internal diagnostic (founder-gated by layout) — proves the Swift VoiceController +
 * IOSNativeVoiceProvider substrate works end-to-end before any integration into
 * OracleConversation.
 *
 * VOICE-RECOGNITION-ENGINE-01: this page is also the same-device / same-walk
 * witness surface. Pick an engine preference, start, speak the same passage,
 * stop, compare:
 *
 *   baseline   → legacy SFSpeechRecognizer (the 2515-lineage control)
 *   modern     → SpeechAnalyzer + SpeechTranscriber, DictationTranscriber fallback,
 *                legacy if neither is supported (iOS 26+ only)
 *   dictation  → force DictationTranscriber where available
 *
 * The page shows three evidence streams (capture / recognition / transcript) and
 * the assembled utterance. "Close turn" is a MAIA-authority act on this page;
 * a finalized transcript never closes the turn by itself.
 *
 * Path: /voice-controller-test  (registered in mobileAllowlist PHONE_ROUTES)
 */

import { useState, useEffect, useRef } from 'react';
import {
  IOSNativeVoiceProvider,
  requestVoicePermission,
} from '@/lib/voice/providers/IOSNativeVoiceProvider';
import type {
  VoiceTranscript,
  VoiceState,
  VoiceError,
  CaptureEvidence,
  RecognitionEvidence,
  RecognitionCapabilities,
  RecognitionEnginePreference,
} from '@/lib/voice/contract/MAIAVoiceProvider';
import { HumanTurnAssembler, type ClosedTurn } from '@/lib/voice/recognition/humanTurnAuthority';

const PREFERENCES: RecognitionEnginePreference[] = ['baseline', 'modern', 'dictation', 'legacy'];

export default function VoiceControllerTestPage() {
  const providerRef = useRef<IOSNativeVoiceProvider | null>(null);
  const assemblerRef = useRef<HumanTurnAssembler>(new HumanTurnAssembler());

  const [permission, setPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [state, setState] = useState<VoiceState>('idle');
  const [preference, setPreference] = useState<RecognitionEnginePreference>('baseline');
  const [capabilities, setCapabilities] = useState<RecognitionCapabilities | null>(null);
  const [capture, setCapture] = useState<CaptureEvidence | '—'>('—');
  const [recognition, setRecognition] = useState<RecognitionEvidence | '—'>('—');
  const [partials, setPartials] = useState<string[]>([]);
  const [finals, setFinals] = useState<string[]>([]);
  const [utterance, setUtterance] = useState<string>('');
  const [closedTurns, setClosedTurns] = useState<ClosedTurn[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const provider = new IOSNativeVoiceProvider();
    providerRef.current = provider;
    const assembler = assemblerRef.current;

    const unsubs = [
      provider.onTranscriptPartial((t: VoiceTranscript) => {
        const conf = t.confidenceReported === false ? 'n/a' : t.confidence.toFixed(2);
        setPartials((prev) => [...prev.slice(-9), `#${t.segmentId ?? '?'} ${t.text}  (${conf})`]);
        setUtterance(assembler.admit(t).view.text);
      }),
      provider.onTranscriptFinal((t: VoiceTranscript) => {
        setFinals((prev) => [...prev, `#${t.segmentId ?? '?'} [${t.composition ?? 'cumulative'}] ${t.text}`]);
        setPartials([]);
        // Finalized ≠ turn complete. Admit only; the turn stays open.
        setUtterance(assembler.admit(t).view.text);
      }),
      provider.onStateChange((s: VoiceState) => setState(s)),
      provider.onError((e: VoiceError) => {
        setError(`${e.code}: ${e.message}${e.recoverable ? ' (recoverable)' : ''}`);
      }),
      provider.onCaptureEvidence((e: CaptureEvidence) => setCapture(e)),
      provider.onRecognitionEvidence((e: RecognitionEvidence) => setRecognition(e)),
      provider.onEngineSelected((c: RecognitionCapabilities) => setCapabilities(c)),
    ];

    return () => {
      unsubs.forEach((u) => u());
      provider.stop().catch(() => {});
      provider.dispose().catch(() => {});
    };
  }, []);

  const handlePermission = async () => {
    setError(null);
    try {
      const granted = await requestVoicePermission();
      setPermission(granted ? 'granted' : 'denied');
    } catch (e: any) {
      setError(`Permission error: ${e?.message ?? String(e)}`);
    }
  };

  const handleProbe = async () => {
    if (!providerRef.current) return;
    setError(null);
    try {
      setCapabilities(await providerRef.current.getRecognitionCapabilities({ engine: preference }));
    } catch (e: any) {
      setError(`Probe error: ${e?.message ?? String(e)}`);
    }
  };

  const handleStart = async () => {
    if (!providerRef.current) return;
    setError(null);
    setCapture('—');
    setRecognition('—');
    try {
      await providerRef.current.start({ engine: preference });
    } catch (e: any) {
      setError(`Start error: ${e?.message ?? String(e)}`);
    }
  };

  const handleStop = async () => {
    if (!providerRef.current) return;
    try {
      await providerRef.current.stop();
    } catch (e: any) {
      setError(`Stop error: ${e?.message ?? String(e)}`);
    }
  };

  const handleCloseTurn = () => {
    const closed = assemblerRef.current.closeTurn('explicit');
    if (closed) setClosedTurns((prev) => [...prev, closed]);
    setUtterance('');
    setPartials([]);
  };

  return (
    <div
      style={{
        padding: 20,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: 600,
        margin: '0 auto',
        background: '#1A1513',
        color: '#fff',
        minHeight: '100vh',
      }}
    >
      <h1 style={{ fontSize: 18, marginBottom: 4 }}>VoiceController Witness</h1>
      <p style={{ fontSize: 11, color: '#888', marginBottom: 16 }}>
        Single recognition pass per Start. Same device, same passage, one engine at a time.
      </p>

      <div style={{ marginBottom: 12, fontSize: 12, color: '#aaa' }}>
        State: <strong style={{ color: '#fff' }}>{state}</strong>{'  ·  '}
        Permission: <strong style={{ color: '#fff' }}>{permission}</strong>
      </div>

      <div style={{ marginBottom: 12, fontSize: 12, color: '#aaa' }}>
        Engine preference:{' '}
        {PREFERENCES.map((p) => (
          <button
            key={p}
            onClick={() => setPreference(p)}
            style={{
              ...chipStyle,
              borderColor: preference === p ? '#d9a441' : '#555',
              color: preference === p ? '#d9a441' : '#ccc',
            }}
            disabled={state === 'listening'}
          >
            {p}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={handlePermission} style={btnStyle}>Request Permission</button>
        <button onClick={handleProbe} style={btnStyle}>Probe</button>
        <button
          onClick={handleStart}
          style={{ ...btnStyle, opacity: permission === 'granted' ? 1 : 0.4 }}
          disabled={permission !== 'granted'}
        >
          Start
        </button>
        <button onClick={handleStop} style={btnStyle}>Stop</button>
        <button onClick={handleCloseTurn} style={{ ...btnStyle, borderColor: '#d9a441' }}>
          Close turn (MAIA authority)
        </button>
      </div>

      {error && (
        <div style={{ padding: 12, background: '#3a1a1a', color: '#fcc', borderRadius: 4, marginBottom: 16, fontSize: 12, fontFamily: 'monospace' }}>
          {error}
        </div>
      )}

      <Section title="Evidence">
        <div>capture: <strong>{capture}</strong></div>
        <div>recognition: <strong>{recognition}</strong></div>
        <div>turn: <strong>open</strong> <span style={{ color: '#666' }}>(only “Close turn” completes it)</span></div>
      </Section>

      <Section title="Engine selected (capability telemetry — no transcript content)">
        {capabilities ? (
          <>
            <div>engine: <strong>{String(capabilities.engineSelected)}</strong></div>
            <div>reason: {capabilities.selectionReason}</div>
            <div>policy: {capabilities.policy} · preference: {String(capabilities.preference)}</div>
            <div>os: {capabilities.osVersion} · locale: {capabilities.localeRequested}</div>
            <div>
              SpeechAnalyzer API: {String(capabilities.speechAnalyzerApiPresent)} ·
              SpeechTranscriber: {fmt(capabilities.speechTranscriberAvailable)}/{fmt(capabilities.speechTranscriberLocaleSupported)} ·
              Dictation: {fmt(capabilities.dictationTranscriberAvailable)}/{fmt(capabilities.dictationTranscriberLocaleSupported)} ·
              legacy: {String(capabilities.legacyAvailable)}
            </div>
          </>
        ) : (
          <em style={{ color: '#666' }}>none yet — tap Probe or Start</em>
        )}
      </Section>

      <Section title="Utterance (assembled, turn open)">
        {utterance ? utterance : <em style={{ color: '#666' }}>empty</em>}
      </Section>

      <Section title="Volatile segments (last 10)">
        {partials.length === 0 ? <em style={{ color: '#666' }}>none yet</em> : partials.map((p, i) => <div key={i}>{p}</div>)}
      </Section>

      <Section title="Finalized segments">
        {finals.length === 0 ? <em style={{ color: '#666' }}>none yet</em> : finals.map((f, i) => <div key={i}>{f}</div>)}
      </Section>

      <Section title="Closed turns">
        {closedTurns.length === 0
          ? <em style={{ color: '#666' }}>none yet</em>
          : closedTurns.map((c) => <div key={c.utteranceId}>[{c.reason}] {c.text}</div>)}
      </Section>

      <div style={{ marginTop: 24, fontSize: 10, color: '#666', lineHeight: 1.5 }}>
        Witness: same device, same passage, <em>baseline</em> then <em>modern</em>. Compare finalized
        segments, stall events, and what the assembled utterance looked like when you chose to close the turn.
        The default stays <em>baseline</em> until the modern engine wins.
      </div>
    </div>
  );
}

function fmt(v: boolean | null | undefined): string {
  return v === null || v === undefined ? '–' : String(v);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h2 style={{ fontSize: 13, marginBottom: 6, color: '#bbb' }}>{title}</h2>
      <div style={{ background: '#2a2420', padding: 12, borderRadius: 4, minHeight: 48, fontSize: 12, fontFamily: 'monospace', color: '#ddd' }}>
        {children}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '12px 18px',
  fontSize: 14,
  border: '1px solid #555',
  borderRadius: 4,
  background: '#2a2420',
  color: '#fff',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const chipStyle: React.CSSProperties = {
  padding: '6px 10px',
  marginRight: 6,
  fontSize: 12,
  border: '1px solid #555',
  borderRadius: 999,
  background: 'transparent',
  cursor: 'pointer',
  fontFamily: 'inherit',
};
