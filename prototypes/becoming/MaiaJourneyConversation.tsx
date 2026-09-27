import React, { useEffect, useMemo, useRef, useState } from 'react';
import { buildBecomingMaiaHandoff } from '../../lib/becoming/maiaHandoff';
import type { Session } from '../../lib/becoming/core';

type ChatTurn = {
  id: string;
  role: 'member' | 'maia';
  text: string;
};

export function MaiaJourneyConversation({ session }: { session: Session }) {
  const handoff = useMemo(() => buildBecomingMaiaHandoff(session), [session]);
  const sessionIdRef = useRef(`becoming-${session.id}-${crypto.randomUUID()}`);
  const [opened, setOpened] = useState(false);
  const [shared, setShared] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const latestTurnRef = useRef<HTMLElement>(null);
  const waitingRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!opened) return;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const frame = requestAnimationFrame(() => {
      const target = busy ? waitingRef.current : latestTurnRef.current;
      target?.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'center',
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [opened, busy, turns.length]);
  async function send(message: string, initial = false) {
    const text = message.trim();
    if (!text || busy) return;
    setBusy(true);
    setError('');
    if (!initial) {
      setTurns(current => [...current, { id: crypto.randomUUID(), role: 'member', text }]);
      setInput('');
    }
    try {
      const history = turns.map(turn => ({
        role: turn.role === 'member' ? 'user' : 'assistant',
        content: turn.text,
      }));
      if (shared) {
        history.unshift({ role: 'user', content: handoff });
      }
      const response = await fetch('/api/maia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Becoming-Explicit-Handoff': '1',
        },
        body: JSON.stringify({
          message: text,
          sessionId: sessionIdRef.current,
          journeyId: session.id,
          conversationHistory: history,
          sanctuary: false,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || typeof data?.message !== 'string' || !data.message.trim()) {
        throw new Error(data?.error || 'MAIA did not return a response.');
      }
      setShared(true);
      setTurns(current => [
        ...current,
        { id: crypto.randomUUID(), role: 'maia', text: data.message.trim() },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The MAIA connection did not complete.');
    } finally {
      setBusy(false);
    }
  }

  async function beginConversation() {
    setOpened(true);
    if (shared || busy) return;
    await send(handoff, true);
  }
  return (
    <section className="maia-integration" aria-label="Continue this journey with MAIA">
      {!opened ? (
        <>
          <p className="eyebrow paper-eyebrow">RELATIONAL INTEGRATION</p>
          <h2>Stay here with MAIA.</h2>
          <p className="intro">
            You do not need to tell it all again. MAIA can receive the journey you just wrote,
            offer a supportive synthesis, and continue the conversation here in Becoming.
          </p>
          <p className="maia-consent-note">
            Choosing this sends this journey into your normal MAIA service. MAIA may also draw on
            the continuity you already permit in Soullab. Imagined future material remains labeled
            as imaginal, not predictive.
          </p>
          <details className="optional-detail">
            <summary>See exactly what MAIA will receive</summary>
            <pre className="handoff-preview">{handoff}</pre>
          </details>
          <button className="primary" disabled={busy} onClick={() => void beginConversation()}>
            {busy ? 'Bringing the journey to MAIA…' : 'Talk with MAIA about this journey'}
          </button>
        </>
      ) : (
        <div className="maia-conversation" aria-busy={busy}>
          <div className="maia-conversation-head">
            <div>
              <p className="eyebrow paper-eyebrow">WITH MAIA</p>
              <h2>Stay with what opened.</h2>
            </div>
            <span className="metadata">Journey shared by you · conversation stays in Becoming</span>
          </div>
          <div className="maia-turns" aria-live="polite">
            {turns.map((turn, index) => (
              <article
                className={'maia-turn ' + turn.role}
                key={turn.id}
                ref={index === turns.length - 1 ? latestTurnRef : undefined}
              >
                <span className="metadata">{turn.role === 'maia' ? 'MAIA' : 'You'}</span>
                <p>{turn.text}</p>
              </article>
            ))}
          </div>
          {busy && (
            <p ref={waitingRef} className="maia-thinking" role="status">
              {turns.length === 0 ? 'MAIA is taking in the whole journey…' : 'MAIA is reflecting…'}
            </p>
          )}
          {error && <p className="error" role="alert">{error}</p>}
          {shared && (
            <div className="maia-followup">
              <p className="maia-continuity-note">Stay here as long as you want. In the integrated Soullab field, continuing in full MAIA can be offered as a separate choice—not as an automatic exit from Becoming.</p>
              <label htmlFor="maia-followup">Continue with MAIA</label>
              <textarea
                id="maia-followup"
                rows={4}
                value={input}
                onChange={event => setInput(event.target.value)}
                placeholder="Respond to what feels alive…"
                disabled={busy}
              />
              <div className="journey-actions">
                <button
                  className="primary"
                  disabled={busy || !input.trim()}
                  onClick={() => void send(input)}
                >
                  {busy ? 'MAIA is reflecting…' : 'Send to MAIA'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
