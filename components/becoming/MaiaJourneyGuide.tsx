'use client';

import React, { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { buildJourneyGuidePrompt } from '@/lib/becoming/maiaGuide';
import type { Element, Movement, Session } from '@/lib/becoming/core';

interface Props {
  session: Session;
  movement: Movement;
  activePossibilityId: string;
  element: Element | null;
  fallbackPrompt: string;
  onAnotherFallback: () => void;
  available: boolean;
}

export function MaiaJourneyGuide(props: Props) {
  const [enabled, setEnabled] = useState(false);
  const [invitation, setInvitation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const sessionIdRef = useRef(`becoming-guide-${props.session.id}-${crypto.randomUUID()}`);
  const lastAutoKeyRef = useRef('');
  const requestSeqRef = useRef(0);
  const contextKey = `${props.movement}:${props.element ?? 'none'}:${props.activePossibilityId}`;
  async function requestGuide(kind: 'auto' | 'deepen') {
    if (!enabled || !props.available || busy) return;
    const seq = ++requestSeqRef.current;
    setBusy(true);
    setError('');
    try {
      const message = buildJourneyGuidePrompt({
        session: props.session,
        movement: props.movement,
        activePossibilityId: props.activePossibilityId,
        element: props.element,
        previousInvitation: kind === 'deepen' ? invitation : undefined,
      });
      const response = await apiFetch('/api/becoming/guide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Becoming-Guide': '1',
        },
        body: JSON.stringify({
          message,
          sessionId: sessionIdRef.current,
          journeyId: props.session.id,
          conversationHistory: [],
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || typeof data?.message !== 'string' || !data.message.trim()) {
        throw new Error(data?.error || 'MAIA did not return a guide invitation.');
      }
      if (seq === requestSeqRef.current) setInvitation(data.message.trim());
    } catch (err) {
      if (seq === requestSeqRef.current) {
        setError(err instanceof Error ? err.message : 'The live guide did not complete.');
      }
    } finally {
      if (seq === requestSeqRef.current) setBusy(false);
    }
  }

  useEffect(() => {
    if (!enabled || !props.available || busy || lastAutoKeyRef.current === contextKey) return;
    lastAutoKeyRef.current = contextKey;
    void requestGuide('auto');
    // Deliberately keyed to movement/element identity, not every change in member text.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, props.available, contextKey, busy]);

  if (!props.available) {
    return (
      <aside className="companion">
        <span className="metadata">JOURNEY GUIDE</span>
        <p>{props.fallbackPrompt}</p>
        <p className="companion-small">The guided encounter has completed. Post-Return MAIA is available inside the journey itself.</p>
      </aside>
    );
  }
  if (!enabled) {
    return (
      <aside className="companion">
        <span className="metadata">JOURNEY GUIDE</span>
        <p>{props.fallbackPrompt}</p>
        <button className="quiet" onClick={props.onAnotherFallback}>Another way in</button>
        <div className="thin-rule" />
        <p className="companion-small">
          MAIA can guide this journey one invitation at a time using only what you enter here.
          Your wider Soullab memory is not brought into the in-journey guide.
        </p>
        <button className="guide-enable" onClick={() => setEnabled(true)}>Journey with MAIA</button>
      </aside>
    );
  }

  return (
    <aside className="companion live-guide" aria-busy={busy}>
      <span className="metadata">MAIA · JOURNEY GUIDE</span>
      {busy ? (
        <p className="guide-wait" role="status">MAIA is attending to this moment…</p>
      ) : invitation ? (
        <p className="guide-invitation">{invitation}</p>
      ) : (
        <p className="guide-invitation">{props.fallbackPrompt}</p>
      )}
      {error && <p className="guide-error" role="alert">{error}</p>}
      <div className="guide-actions">
        <button className="quiet" disabled={busy} onClick={() => void requestGuide('deepen')}>
          Ask MAIA to deepen
        </button>
        <button className="quiet" disabled={busy} onClick={() => { setEnabled(false); setInvitation(''); setError(''); }}>
          Pause live guidance
        </button>
      </div>
      <div className="thin-rule" />
      <p className="companion-small">
        Current journey only · no ambient historical retrieval or retention in this guide.
        MAIA offers one invitation; you decide what to follow.
      </p>
    </aside>
  );
}
