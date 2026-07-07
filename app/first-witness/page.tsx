'use client';

/**
 * The First Witness — /first-witness (standalone experiment).
 *
 * One reflective conversation that produces one artifact ("The Living Architecture … v0.1"),
 * offered back for correction. No provisioning, no account, no persistence — the whole
 * session lives in this browser tab.
 *
 * Audience: a founder/leader building a flourishing coaching practice. Commanding, warm,
 * plain — not soft, not clinical, not woo. It's an invitation into their own work.
 *
 * Success criterion (only the practitioner can answer): after reading the reflection, do
 * they recognize their own work MORE CLEARLY?
 */

import { useEffect, useRef, useState } from 'react';

type Msg = { role: 'user' | 'assistant'; content: string };

// ── Palette ──────────────────────────────────────────────────────────────────
// Soullab canonical rich-navy theme (docs/canon/SOULLAB_THEME.md). The First Witness
// is a general Soullab surface — every practitioner meets it — so it wears Soullab's
// brand, not any one practice's. Grouped so it stays a trivial single-place swap.
const C = {
  paper: '#0A1628',       // Canvas — page background
  card: '#121A2B',        // Surface — witness bubbles / input / artifact
  userBubble: '#1E3A5F',  // mid navy — the person's own turns
  ink: '#F5F7FB',         // Text Primary — headings + text on surfaces
  body: '#EAEEF6',        // body text (light on navy)
  muted: '#B7C0D1',       // Text Secondary — subtext
  faint: '#6E7C93',       // hints / disabled
  border: '#1E2F4D',      // Border Subtle
  accent: '#C9A227',      // Soullab gold — eyebrow, links, primary action
  onGold: '#0A1628',      // navy text on gold
  sendIdle: '#2A3F63',    // disabled Send
  error: '#E0705A',       // legible warm red on dark (errors, recording)
};

const OPENING =
  "Let's start with the work itself — the real thing, not the pitch. What are you building, and what do you want it to make possible for the people you'll serve?";

// Minimal, safe formatter for the reflection artifact (escape first, then light markdown).
function renderArtifact(text: string): string {
  const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc
    .split('\n')
    .map((line) => {
      if (/^---+\s*$/.test(line)) return `<hr style="border:none;border-top:1px solid ${C.border};margin:22px 0" />`;
      const bolded = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      if (/^\s*-\s+/.test(line)) return `<div style="margin:5px 0 5px 4px">• ${bolded.replace(/^\s*-\s+/, '')}</div>`;
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
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

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

  // Dictate — record → local Whisper (sovereign) → text into the same input. Nothing stored.
  async function startDictation() {
    if (recording || transcribing) return;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
        if (!blob.size) return;
        setTranscribing(true);
        try {
          const fd = new FormData();
          fd.append('file', blob, 'recording.webm');
          const res = await fetch('/api/first-witness/transcribe', { method: 'POST', body: fd });
          const data = await res.json().catch(() => ({}));
          if (res.ok && data.text) setInput((prev) => (prev ? prev.trimEnd() + ' ' : '') + data.text);
          else setError(data.error || 'Could not catch that — try again.');
        } catch {
          setError('Could not catch that — try again.');
        } finally {
          setTranscribing(false);
        }
      };
      mediaRef.current = mr;
      mr.start();
      setRecording(true);
    } catch {
      setError('I could not reach your microphone — check the browser permission.');
    }
  }

  function stopDictation() {
    if (mediaRef.current && recording) {
      mediaRef.current.stop();
      setRecording(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: C.paper, color: C.body, padding: '48px 20px 120px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <p style={{ fontSize: 12.5, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, color: C.accent, margin: '0 0 10px' }}>
          The First Witness
        </p>
        <h1 style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.18, margin: '0 0 12px', color: C.ink, letterSpacing: '-0.01em' }}>
          A visionary&rsquo;s guide to your elemental foundation.
        </h1>
        <p style={{ color: C.muted, fontSize: 16, lineHeight: 1.55, margin: '0 0 32px' }}>
          A full-spectrum conversation about what you&rsquo;re building — the elements it stands on, where it comes from,
          who it&rsquo;s for, and where you&rsquo;re taking it. Nothing here is saved or shared, and you don&rsquo;t need
          answers ready — speak from where you are now. When we&rsquo;ve covered the ground, I&rsquo;ll reflect back the
          architecture I&rsquo;ve begun to see — for you to sharpen.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '86%',
                background: m.role === 'user' ? C.userBubble : C.card,
                color: m.role === 'user' ? C.ink : C.body,
                border: m.role === 'user' ? 'none' : `1px solid ${C.border}`,
                borderRadius: 14,
                padding: '13px 16px',
                fontSize: 16,
                lineHeight: 1.58,
                whiteSpace: 'pre-wrap',
              }}
            >
              {m.content}
            </div>
          ))}
          {busy && <div style={{ alignSelf: 'flex-start', color: C.faint, fontSize: 14 }}>listening&hellip;</div>}
          <div ref={endRef} />
        </div>

        {error && <p style={{ color: C.error, fontSize: 14, marginTop: 16 }}>{error}</p>}

        {!artifact && (
          <div style={{ marginTop: 26 }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send();
              }}
              placeholder="In your own words — type or speak…"
              rows={3}
              style={{
                width: '100%',
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                background: C.card,
                padding: '13px 15px',
                fontSize: 16,
                lineHeight: 1.5,
                resize: 'vertical',
                boxSizing: 'border-box',
                color: C.body,
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
                <button
                  onClick={recording ? stopDictation : startDictation}
                  disabled={transcribing || busy}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    background: recording ? 'rgba(224,112,90,0.14)' : 'transparent',
                    border: `1px solid ${recording ? C.error : C.border}`,
                    color: recording ? C.error : transcribing ? C.faint : C.ink,
                    fontSize: 14,
                    fontWeight: 600,
                    borderRadius: 999,
                    padding: '6px 14px',
                    cursor: transcribing || busy ? 'default' : 'pointer',
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: recording ? C.error : C.accent, display: 'inline-block' }} />
                  {recording ? 'Recording — stop' : transcribing ? 'Transcribing…' : 'Speak'}
                </button>
                <button
                  onClick={offerReflection}
                  disabled={!canReflect}
                  title={userTurns < 3 ? 'A little more ground first' : ''}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: canReflect ? C.accent : C.faint,
                    fontSize: 14.5,
                    fontWeight: 600,
                    cursor: canReflect ? 'pointer' : 'default',
                    textDecoration: canReflect ? 'underline' : 'none',
                    padding: 0,
                  }}
                >
                  {reflecting ? 'Drawing it together…' : 'When we’ve covered the ground — show me the reflection'}
                </button>
              </div>
              <button
                onClick={send}
                disabled={busy || !input.trim()}
                style={{
                  background: busy || !input.trim() ? C.sendIdle : C.accent,
                  color: busy || !input.trim() ? C.faint : C.onGold,
                  border: 'none',
                  borderRadius: 10,
                  padding: '11px 24px',
                  fontSize: 15.5,
                  fontWeight: 700,
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
              marginTop: 34,
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: '30px 28px',
              fontSize: 16.5,
              lineHeight: 1.72,
              color: C.body,
              boxShadow: '0 1px 0 rgba(23,51,39,0.04)',
            }}
            dangerouslySetInnerHTML={{ __html: renderArtifact(artifact) }}
          />
        )}
        {artifact && (
          <p style={{ color: C.muted, fontSize: 14.5, marginTop: 18, lineHeight: 1.55 }}>
            This is a beginning, not a verdict — a snapshot of where you are now. From here, the team gathers to review it
            with you and offer their insights. If something&rsquo;s incomplete, off, or surprising, keep going — it sharpens
            as you do.
            <button
              onClick={() => setArtifact(null)}
              style={{ background: 'none', border: 'none', color: C.accent, textDecoration: 'underline', cursor: 'pointer', marginLeft: 6, fontSize: 14.5, fontWeight: 600 }}
            >
              Keep going
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
