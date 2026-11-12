'use client';

/**
 * "How do I…?" — MAIA's chartless help inside the Pro MAIA stage
 * (ASTRO-PRO-MAIA-GUIDE-R2, spec route H1, founder ruling D-03 A).
 *
 * Shown in the stage before a chart is open, and as the third mode beside Ask
 * and Mentor when one is. It sends only the question and this visit's earlier
 * help turns to /api/astrology/pro/help: never a chart, a name, birth details
 * or anything kept with MAIA. The thread stays in the page for this visit and
 * is its own, apart from any chart's conversation.
 */
import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { usePanelState } from './panelMemory';
import styles from './pro-ask-maia.module.css';

const ERRORS: Record<string, string> = {
  slow_down: 'That was a lot of questions at once. Please wait a minute and ask again.',
  question_too_long: 'Please shorten the question a little.',
  session_required: 'Please sign in again.',
  session_changed: 'Please sign in again.',
};

/** How many earlier turns go back with a question (the server's limit). */
const HISTORY_TURNS = 8;

const STARTERS = [
  'How do I add a chart for a client?',
  'How do I share a chart with a client?',
  'Where do I find progressions?',
  'How are the charts calculated, and what are the limits?',
];

interface Exchange { q: string; a: string; safety?: boolean }

export function ProHelpConversation() {
  const [question, setQuestion] = usePanelState('help.draft', '');
  const [exchanges, setExchanges] = usePanelState<Exchange[]>('help.log', []);
  const [status, setStatus] = useState<'idle' | 'asking'>('idle');
  const [error, setError] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => { end.current?.scrollIntoView?.({ block: 'nearest' }); }, [exchanges.length, status]);

  async function ask(text?: string) {
    const q = (text ?? question).trim();
    if (status === 'asking') return;
    if (!q) { setError('Enter a question first.'); return; }
    setStatus('asking');
    setError(null);
    try {
      const turns = exchanges.filter((e) => !e.safety).slice(-HISTORY_TURNS).map((e) => ({ q: e.q, a: e.a }));
      const reply = await apiFetch('/api/astrology/pro/help', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store',
        // Only the question and earlier help turns: nothing of any chart.
        body: JSON.stringify({ question: q, ...(turns.length ? { history: turns } : {}) }),
      });
      const body = await reply.json().catch(() => ({}));
      if (!reply.ok || typeof body?.answer !== 'string') {
        setError(ERRORS[body?.error] || 'MAIA could not answer just now. Please try again.');
        return;
      }
      setExchanges((list) => [...list, { q, a: body.answer, safety: body.safety === true }]);
      if (text === undefined) setQuestion('');
    } catch {
      setError('MAIA could not answer just now. Please try again.');
    } finally {
      setStatus('idle');
    }
  }

  return (
    <>
      <p className={styles.note}>
        How do I…? MAIA is not reading any chart in this mode. Ask how the workstation works, where a tool is, or how
        the figures are calculated. Only your question is sent: no chart, no names or birth details, nothing you keep
        with MAIA. Nothing is kept. MAIA is an AI, not the astrologer.
      </p>

      <div className={styles.thread} aria-live="polite">
        {exchanges.map((e, i) => (
          <div key={i} className={styles.exchange}>
            <p className={styles.q}>{e.q}</p>
            <p className={e.safety ? `${styles.a} ${styles.safety}` : styles.a}>{e.a}</p>
          </div>
        ))}
        {status === 'asking' && <p className={styles.waiting} role="status">MAIA is answering…</p>}
        <div ref={end} />
      </div>

      {exchanges.length === 0 && (
        <div className={styles.chips} aria-label="Ways to begin">
          {STARTERS.map((text) => (
            <button key={text} type="button" onClick={() => { setQuestion(text); if (error) setError(null); }}>{text}</button>
          ))}
        </div>
      )}

      <textarea value={question} rows={2} maxLength={600}
        aria-label="Your question for MAIA about the workstation"
        onChange={(e) => { setQuestion(e.target.value); if (error) setError(null); }}
        placeholder="How do I…?"
        disabled={status === 'asking'}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void ask(); } }} />
      {error && <p role="alert" className={styles.alert}>{error}</p>}
      <div className={styles.actions}>
        <button type="button" onClick={() => void ask()} disabled={status === 'asking'}>
          {status === 'asking' ? 'MAIA is answering…' : 'Ask MAIA'}
        </button>
        {exchanges.length > 0 && <button type="button" onClick={() => setExchanges([])}>Clear</button>}
      </div>
    </>
  );
}
