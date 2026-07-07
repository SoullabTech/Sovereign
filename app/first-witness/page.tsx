'use client';

/**
 * The First Witness — /first-witness (standalone experiment).
 *
 * One reflective conversation that produces one artifact ("The Living Architecture … v0.1"),
 * offered back for correction. No provisioning, no account, no persistence — the whole
 * session lives in this browser tab. Deliberately quiet: the practitioner should feel
 * witnessed, not onboarded.
 *
 * Success criterion (only the practitioner can answer): after reading the reflection, do
 * they recognize their own work MORE CLEARLY?
 */

import { useEffect, useRef, useState } from 'react';

type Msg = { role: 'user' | 'assistant'; content: string };

const OPENING =
  "I'd like to begin by simply understanding the work you're bringing into the world. So — what's alive for you in it right now? Start anywhere.";

// Minimal, safe formatter for the reflection artifact (escape first, then light markdown).
function renderArtifact(text: string): string {
  const esc = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return esc
    .split('\n')
    .map((line) => {
      if (/^---+\s*$/.test(line)) return '<hr style="border:none;border-top:1px solid #e5ded0;margin:20px 0" />';
      const bolded = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      if (/^\s*-\s+/.test(line)) return `<div style="margin:4px 0 4px 4px">• ${bolded.replace(/^\s*-\s+/, '')}</div>`;
      if (line.trim() === '') return '<div style="height:10px"></div>';
      return `<div>${bolded}</div>`;
    })
    .join('');
}

export default function FirstWitnessPage() {
  const [messages, setMessages] = useState<Msg[]>([{ role: 'assistant', content: OPENING }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [artifact, setArtifact] = useState<string | null>(null);
  const [reflecting, setReflecting] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const userTurns = messages.filter((m) => m.role === 'user').length;
  const canReflect = userTurns >= 3 && !busy && !reflecting;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, artifact]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    const next = [...messages, { role: 'user' as const, content: text }];
    setMessages(next);
    setInput('');
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/first-witness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'converse', messages: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error || 'Something interrupted the conversation.');
      else setMessages((m) => [...m, { role: 'assistant', content: data.reply || '…' }]);
    } catch {
      setError('Something interrupted the conversation.');
    } finally {
      setBusy(false);
    }
  }

  async function offerReflection() {
    if (reflecting || busy) return;
    setReflecting(true);
    setError(null);
    try {
      const res = await fetch('/api/first-witness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'reflect', messages }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error || 'The reflection could not form yet.');
      else setArtifact(data.artifact || '');
    } catch {
      setError('The reflection could not form yet.');
    } finally {
      setReflecting(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f4ee', color: '#2b2a26', padding: '40px 20px 120px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <p style={{ fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a89f8c', margin: '0 0 6px' }}>
          The First Witness
        </p>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 8px', color: '#1f2b22' }}>
          Before accompanying others, let's begin with your work.
        </h1>
        <p style={{ color: '#6f6a5e', fontSize: 15, lineHeight: 1.5, margin: '0 0 28px' }}>
          A single, unhurried conversation. Nothing here is saved or shared. When it feels right, I'll offer back
          what I've begun to understand — for you to correct.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '86%',
                background: m.role === 'user' ? '#1f2b22' : '#fffdf8',
                color: m.role === 'user' ? '#f2efe6' : '#33322c',
                border: m.role === 'user' ? 'none' : '1px solid #e9e2d3',
                borderRadius: 14,
                padding: '12px 15px',
                fontSize: 15.5,
                lineHeight: 1.55,
                whiteSpace: 'pre-wrap',
              }}
            >
              {m.content}
            </div>
          ))}
          {busy && <div style={{ alignSelf: 'flex-start', color: '#a89f8c', fontSize: 14 }}>witnessing…</div>}
          <div ref={endRef} />
        </div>

        {error && <p style={{ color: '#a6462f', fontSize: 14, marginTop: 16 }}>{error}</p>}

        {!artifact && (
          <div style={{ marginTop: 24 }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send();
              }}
              placeholder="Take your time…"
              rows={3}
              style={{
                width: '100%',
                borderRadius: 12,
                border: '1px solid #ddd4c2',
                background: '#fffdf8',
                padding: '12px 14px',
                fontSize: 15.5,
                lineHeight: 1.5,
                resize: 'vertical',
                boxSizing: 'border-box',
                color: '#2b2a26',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, gap: 12 }}>
              <button
                onClick={offerReflection}
                disabled={!canReflect}
                title={userTurns < 3 ? 'A little more conversation first' : ''}
                style={{
                  background: 'none',
                  border: 'none',
                  color: canReflect ? '#5a6b52' : '#c4bdae',
                  fontSize: 14,
                  cursor: canReflect ? 'pointer' : 'default',
                  textDecoration: canReflect ? 'underline' : 'none',
                  padding: 0,
                }}
              >
                {reflecting ? 'Gathering what I’ve heard…' : 'When you’re ready, offer me the reflection'}
              </button>
              <button
                onClick={send}
                disabled={busy || !input.trim()}
                style={{
                  background: busy || !input.trim() ? '#b8b0a0' : 'linear-gradient(135deg,#1f2b22,#33452f)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 20px',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: busy || !input.trim() ? 'default' : 'pointer',
                }}
              >
                Send
              </button>
            </div>
          </div>
        )}

        {artifact && (
          <div
            style={{
              marginTop: 32,
              background: '#fffdf8',
              border: '1px solid #e5ded0',
              borderRadius: 16,
              padding: '28px 26px',
              fontSize: 16,
              lineHeight: 1.7,
              color: '#2b2a26',
            }}
            dangerouslySetInnerHTML={{ __html: renderArtifact(artifact) }}
          />
        )}
        {artifact && (
          <p style={{ color: '#6f6a5e', fontSize: 14, marginTop: 18, lineHeight: 1.5 }}>
            This is a beginning, not a verdict. If something feels incomplete, inaccurate, or surprising, keep
            talking — the field grows as your understanding does.
            <button
              onClick={() => setArtifact(null)}
              style={{ background: 'none', border: 'none', color: '#5a6b52', textDecoration: 'underline', cursor: 'pointer', marginLeft: 6, fontSize: 14 }}
            >
              Continue the conversation
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
