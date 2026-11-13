'use client';

/** Scoped MAIA workstation Help: no automatic chart or saved-memory loading. */
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { HelpRequestGate, PRO_HELP_PRIVACY_NOTICE } from '@/lib/astrology/proHelp';
import styles from './pro-ask-maia.module.css';

const ERRORS: Record<string, string> = {
  slow_down: 'That was a lot of questions at once. Please wait a minute and ask again.',
  question_too_long: 'Please shorten the question a little.',
  session_required: 'Please sign in again.',
  session_changed: 'Please sign in again.',
};
const HISTORY_TURNS = 8;
const STARTERS = [
  'How do I add a chart for a client?',
  'How do I share a chart with a client?',
  'Where do I find progressions?',
  'How are the charts calculated, and what are the limits?',
];
export interface HelpExchange { q: string; a: string; safety?: boolean }
interface Props {
  question: string;
  setQuestion: Dispatch<SetStateAction<string>>;
  exchanges: HelpExchange[];
  setExchanges: Dispatch<SetStateAction<HelpExchange[]>>;
}

export function ProHelpConversation({ question, setQuestion, exchanges, setExchanges }: Props) {
  const [status, setStatus] = useState<'idle' | 'asking'>('idle');
  const [error, setError] = useState<string | null>(null);
  const gate = useRef(new HelpRequestGate());
  const abort = useRef<AbortController | null>(null);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    gate.current.reset();
    return () => { gate.current.close(); abort.current?.abort(); abort.current = null; };
  }, []);
  useEffect(() => { end.current?.scrollIntoView?.({ block: 'nearest' }); }, [exchanges.length, status]);

  function clear() {
    gate.current.invalidate();
    abort.current?.abort();
    abort.current = null;
    setExchanges([]);
    setQuestion('');
    setError(null);
    setStatus('idle');
  }

  async function ask(text?: string) {
    const q = (text ?? question).trim();
    if (status === 'asking') return;
    if (!q) { setError('Enter a question first.'); return; }
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    const requestId = gate.current.begin();
    setStatus('asking');
    setError(null);
    try {
      const turns = exchanges.filter((e) => !e.safety).slice(-HISTORY_TURNS).map((e) => ({ q: e.q, a: e.a }));
      const reply = await apiFetch('/api/astrology/pro/help', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store',
        signal: controller.signal,
        body: JSON.stringify({ question: q, ...(turns.length ? { history: turns } : {}) }),
      });
      const body = await reply.json().catch(() => ({}));
      if (!gate.current.accepts(requestId)) return;
      if (!reply.ok || typeof body?.answer !== 'string') {
        if ([401, 403, 404].includes(reply.status)) {
          setExchanges([]);
          setQuestion('');
        }
        setError(ERRORS[body?.error] || 'MAIA could not answer just now. Please try again.');
        return;
      }
      setExchanges((list) => [...list, { q, a: body.answer, safety: body.safety === true }]);
      if (text === undefined) setQuestion('');
    } catch {
      if (gate.current.accepts(requestId)) setError('MAIA could not answer just now. Please try again.');
    } finally {
      if (gate.current.accepts(requestId)) {
        setStatus('idle');
        if (abort.current === controller) abort.current = null;
      }
    }
  }

  return (
    <>
      <p className={styles.note}>{PRO_HELP_PRIVACY_NOTICE}</p>
      <div className={styles.thread} aria-live="polite">
        {exchanges.map((e, i) => (
          <div key={i} className={styles.exchange}>
            <p className={styles.q}>{e.q}</p>
            <p className={e.safety ? [styles.a, styles.safety].join(' ') : styles.a}>{e.a}</p>
          </div>
        ))}
        {status === 'asking' && <p className={styles.waiting} role="status">MAIA is answering…</p>}
        <div ref={end} />
      </div>
      {exchanges.length === 0 && (
        <div className={styles.chips} aria-label="Ways to begin">
          {STARTERS.map((starter) => (
            <button key={starter} type="button" onClick={() => { setQuestion(starter); if (error) setError(null); }}>{starter}</button>
          ))}
        </div>
      )}
      <textarea value={question} rows={2} maxLength={600}
        aria-label="Your question for MAIA about the workstation"
        onChange={(e) => { setQuestion(e.target.value); if (error) setError(null); }}
        placeholder="How do I…?" disabled={status === 'asking'}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void ask(); } }} />
      {error && <p role="alert" className={styles.alert}>{error}</p>}
      <div className={styles.actions}>
        <button type="button" onClick={() => void ask()} disabled={status === 'asking'}>
          {status === 'asking' ? 'MAIA is answering…' : 'Ask MAIA'}
        </button>
        {(exchanges.length > 0 || status === 'asking') && <button type="button" onClick={clear}>Clear</button>}
      </div>
    </>
  );
}
