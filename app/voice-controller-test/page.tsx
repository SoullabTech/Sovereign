'use client';

/**
 * VoiceController Phase 1 Smoke Test Page
 *
 * Internal diagnostic — proves the new Swift VoiceController + IOSNativeVoiceProvider
 * substrate works end-to-end before any integration into OracleConversation.
 *
 * Acceptance criteria for Phase 1:
 *   - Tap "Request Permission" → grant in iOS dialog
 *   - Tap "Start" → speak → see partial transcripts appear in real time
 *   - Tap "Stop" → clean teardown, no audio session stuck, no memory leak
 *
 * Phase 2+ acceptance (continuous, restart, etc.) tests on this same page.
 *
 * NOT included on this page:
 *   - MAIA conversation flow (use /maia for that)
 *   - OracleConversation integration (Phase 3)
 *   - Production styling
 *
 * Path: /voice-controller-test  (registered in mobileAllowlist PHONE_ROUTES)
 */

import { useState, useEffect, useRef } from 'react';
import {
  IOSNativeVoiceProvider,
  requestVoicePermission,
} from '@/lib/voice/providers/IOSNativeVoiceProvider';
import type { VoiceTranscript, VoiceState, VoiceError } from '@/lib/voice/contract/MAIAVoiceProvider';

export default function VoiceControllerTestPage() {
  const providerRef = useRef<IOSNativeVoiceProvider | null>(null);
  const [permission, setPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [state, setState] = useState<VoiceState>('idle');
  const [partials, setPartials] = useState<string[]>([]);
  const [finals, setFinals] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const provider = new IOSNativeVoiceProvider();
    providerRef.current = provider;

    const unsubs = [
      provider.onTranscriptPartial((t: VoiceTranscript) => {
        setPartials((prev) => [...prev.slice(-9), `${t.text}  (${t.confidence.toFixed(2)})`]);
      }),
      provider.onTranscriptFinal((t: VoiceTranscript) => {
        setFinals((prev) => [...prev, t.text]);
        setPartials([]);
      }),
      provider.onStateChange((s: VoiceState) => {
        setState(s);
      }),
      provider.onError((e: VoiceError) => {
        setError(`${e.code}: ${e.message}${e.recoverable ? ' (recoverable)' : ''}`);
      }),
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

  const handleStart = async () => {
    if (!providerRef.current) return;
    setError(null);
    try {
      await providerRef.current.start();
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
      <h1 style={{ fontSize: 18, marginBottom: 4 }}>VoiceController Phase 1 Smoke Test</h1>
      <p style={{ fontSize: 11, color: '#888', marginBottom: 16 }}>
        Single recognition pass. Continuous mode arrives in Phase 2.
      </p>

      <div style={{ marginBottom: 16, fontSize: 12, color: '#aaa' }}>
        State: <strong style={{ color: '#fff' }}>{state}</strong>{'  ·  '}
        Permission: <strong style={{ color: '#fff' }}>{permission}</strong>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={handlePermission} style={btnStyle}>
          Request Permission
        </button>
        <button
          onClick={handleStart}
          style={{ ...btnStyle, opacity: permission === 'granted' ? 1 : 0.4 }}
          disabled={permission !== 'granted'}
        >
          Start
        </button>
        <button onClick={handleStop} style={btnStyle}>
          Stop
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: 12,
            background: '#3a1a1a',
            color: '#fcc',
            borderRadius: 4,
            marginBottom: 16,
            fontSize: 12,
            fontFamily: 'monospace',
          }}
        >
          {error}
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 13, marginBottom: 6, color: '#bbb' }}>Partial transcripts (last 10)</h2>
        <div
          style={{
            background: '#2a2420',
            padding: 12,
            borderRadius: 4,
            minHeight: 120,
            fontSize: 12,
            fontFamily: 'monospace',
            color: '#ddd',
          }}
        >
          {partials.length === 0 ? <em style={{ color: '#666' }}>none yet</em> : partials.map((p, i) => <div key={i}>{p}</div>)}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 13, marginBottom: 6, color: '#bbb' }}>Final transcripts</h2>
        <div
          style={{
            background: '#2a2420',
            padding: 12,
            borderRadius: 4,
            minHeight: 80,
            fontSize: 12,
            fontFamily: 'monospace',
            color: '#ddd',
          }}
        >
          {finals.length === 0 ? <em style={{ color: '#666' }}>none yet</em> : finals.map((f, i) => <div key={i}>{f}</div>)}
        </div>
      </div>

      <div style={{ marginTop: 24, fontSize: 10, color: '#666', lineHeight: 1.5 }}>
        Phase 1 acceptance:{' '}
        <em>
          tap Request Permission → grant → tap Start → speak → see partials in real time → final transcript appears →
          tap Stop → clean.
        </em>
        <br />
        Phase 2 will add continuous restart so consecutive utterances flow without re-tapping Start.
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
