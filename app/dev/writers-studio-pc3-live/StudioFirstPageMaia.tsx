'use client';

/**
 * B · The First Page (JARVIS-WRITERS-STUDIO-INSPIRATION-OPENING-01 · S3): "Show MAIA this page".
 *
 * MAIA reads only this page, and only after the writer shows it to her (their act, scope stated first). She returns one
 * exact line and one question. The route refuses a reply whose quote is not on the page, and keeps nothing: her answer
 * lives in this component's memory only. Answering her goes through the existing Work conversation, as an unsent draft
 * the writer chooses to send.
 */
import { useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { FIRST_PAGE_COPY as C } from '@/lib/writersStudio/inspirationOpening';

type Phase = 'idle' | 'confirming' | 'reading' | 'reply';

export default function StudioFirstPageMaia(props: {
  page: string;
  sanctuary: boolean;
  onAnswer: (starter: string) => void;
}) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [reply, setReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const read = async () => {
    setPhase('reading');
    setError(null);
    try {
      const response = await apiFetch('/api/sovereign/writers-studio/arrival', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ answer: props.page, moment: 'first_page', sanctuary: props.sanctuary }),
      });
      const body = await response.json().catch(() => null) as { reply?: unknown; refusal?: unknown } | null;
      if (body?.refusal === 'quote_unverified') { setError(C.unverified); setPhase('idle'); return; }
      if (!response.ok || typeof body?.reply !== 'string') throw new Error(String(response.status));
      setReply(body.reply);
      setPhase('reply');
    } catch {
      setError('MAIA couldn’t read the page just now. Nothing was kept. You can try again.');
      setPhase('idle');
    }
  };

  return (
    <section className="wsio-first-page" data-first-page-maia>
      {phase === 'idle' ? (
        <>
          <p className="p4r1-blank-presence">{C.presence}</p>
          <button type="button" className="p4r1-talk" onClick={() => setPhase('confirming')}>{C.show}</button>
        </>
      ) : null}
      {phase === 'confirming' ? (
        <>
          <p>{C.scope}</p>
          <div className="wsio-row">
            <button type="button" className="p4r1-talk" onClick={() => void read()}>Yes, read it</button>
            <button type="button" className="wsio-link" onClick={() => setPhase('idle')}>Not yet</button>
          </div>
        </>
      ) : null}
      {phase === 'reading' ? <p role="status">{C.reading}</p> : null}
      {phase === 'reply' && reply ? (
        <>
          <p className="wsio-first-page-reply" data-first-page-reply>{reply}</p>
          <div className="wsio-row">
            <button type="button" className="p4r1-talk" onClick={() => props.onAnswer('About my first page: ')}>Answer her</button>
            <button type="button" className="wsio-link" onClick={() => { setReply(null); setPhase('idle'); }}>Keep writing</button>
          </div>
          <p className="p4r1-blank-presence">Her answer isn’t kept.</p>
        </>
      ) : null}
      {error ? <p className="p4r1-error" role="alert">{error}</p> : null}
    </section>
  );
}
