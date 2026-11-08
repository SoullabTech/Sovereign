'use client';

/**
 * "Ask MAIA about this" for a section of Pro (founder request 2026-11-07).
 *
 * Before anything is sent the panel says whose charts MAIA will read; only the
 * section's calculated facts reach MAIA, never names or birth details, and
 * nothing is kept. The questions and answers of this visit stay in the page
 * (kept through access checks) and go when the chart closes.
 */
import { useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import type { ProAskSection } from '@/lib/astrology/proAskMaiaSections';
import { usePanelState } from './panelMemory';
import styles from './pro-ask-maia.module.css';

export interface ProAskRequest {
  section: ProAskSection;
  subject: string;
  other?: string;
  houseSystem?: string;
  at?: string;
  dayStart?: 'midnight' | 'zi-hour';
  direction?: 'forward' | 'backward' | null;
}

const ERRORS: Record<string, string> = {
  slow_down: 'That was a lot of questions at once. Please wait a minute and ask again.',
  question_too_long: 'Please shorten the question a little.',
  saved_chart_not_found: 'That saved chart is no longer here.',
  complete_birth_details_required: 'This chart needs a complete birth date, time and place.',
  session_required: 'Please sign in again.',
};

export default function ProAskMaiaPanel({ request, readsWhose, subjectLabel }: {
  request: ProAskRequest;
  /** Whose charts MAIA will read, said before anything is sent: "Tim's chart", "Owen's and Tim's charts". */
  readsWhose: string;
  /** What the panel is about, for its heading: "the composite", "these transits". */
  subjectLabel: string;
}) {
  const key = `ask.${request.section}.${request.subject}.${request.other ?? ''}`;
  const [open, setOpen] = usePanelState(`${key}.open`, false);
  const [question, setQuestion] = usePanelState(`${key}.draft`, '');
  const [exchanges, setExchanges] = usePanelState<Array<{ q: string; a: string; safety?: boolean }>>(`${key}.log`, []);
  // Natal only: transits on a date the astrologer chooses (an event, an anniversary).
  const [onDate, setOnDate] = usePanelState(`${key}.date`, '');
  const [status, setStatus] = useState<'idle' | 'asking'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function ask() {
    const q = question.trim();
    if (!q || status === 'asking') return;
    setStatus('asking');
    setError(null);
    try {
      const reply = await apiFetch('/api/astrology/pro/ask', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store',
        body: JSON.stringify({
          ...request,
          ...(request.section === 'natal' && onDate ? { at: `${onDate}T12:00:00` } : {}),
          question: q,
        }),
      });
      const body = await reply.json().catch(() => ({}));
      if (!reply.ok || typeof body?.answer !== 'string') {
        setError(ERRORS[body?.error] || 'MAIA could not answer just now. Please try again.');
        return;
      }
      setExchanges((list) => [...list, { q, a: body.answer, safety: body.safety === true }]);
      setQuestion('');
    } catch {
      setError('MAIA could not answer just now. Please try again.');
    } finally {
      setStatus('idle');
    }
  }

  if (!open) {
    return (
      <div className={styles.closed}>
        <button type="button" onClick={() => setOpen(true)}>Ask MAIA about {subjectLabel}</button>
      </div>
    );
  }
  return (
    <div className={styles.panel} role="group" aria-label={`Ask MAIA about ${subjectLabel}`}>
      <div className={styles.head}>
        <strong>Ask MAIA about {subjectLabel}</strong>
        <button type="button" onClick={() => setOpen(false)}>Close</button>
      </div>
      <p className={styles.note}>
        MAIA will read {readsWhose} to answer: only the calculated facts of this section, not names or birth
        details. Nothing is kept. MAIA is an AI, not the astrologer.
      </p>
      {request.section === 'natal' && (
        <label className={styles.dateField}>
          Include transits on (optional)
          <input type="date" value={onDate} onChange={(e) => setOnDate(e.target.value)} />
          {onDate && <button type="button" onClick={() => setOnDate('')}>Remove date</button>}
        </label>
      )}
      {request.section === 'transits' && request.at && (
        <p className={styles.note}>
          MAIA reads the sky on {new Date(request.at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}, the moment shown above. Change it above to ask about another date.
        </p>
      )}
      {exchanges.map((e, i) => (
        <div key={i} className={styles.exchange}>
          <p className={styles.q}>{e.q}</p>
          <p className={e.safety ? `${styles.a} ${styles.safety}` : styles.a}>{e.a}</p>
        </div>
      ))}
      <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} maxLength={600}
        placeholder="What would you like MAIA's view on?" disabled={status === 'asking'}
        onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void ask(); }} />
      {error && <p role="alert" className={styles.alert}>{error}</p>}
      <div className={styles.actions}>
        <button type="button" onClick={() => void ask()} disabled={!question.trim() || status === 'asking'}>
          {status === 'asking' ? 'MAIA is reading…' : 'Ask MAIA'}
        </button>
        {exchanges.length > 0 && <button type="button" onClick={() => setExchanges([])}>Clear</button>}
      </div>
    </div>
  );
}
