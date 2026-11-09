'use client';

/**
 * "Ask MAIA about this" for a section of Pro (founder request 2026-11-07).
 *
 * Before anything is sent the panel says whose charts MAIA will read; only the
 * section's calculated facts reach MAIA, never names or birth details, and
 * nothing is kept. The questions and answers of this visit stay in the page
 * (kept through access checks) and go when the chart closes.
 *
 * Inside the cockpit (a MAIA dock is present) an instrument does not open its
 * own box: it offers its subject to the dock and shows one button that points
 * the dock at it. Outside a dock the panel opens in place, as before.
 */
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import type { ProAskMode, ProAskSection, ProAskView } from '@/lib/astrology/proAskMaiaSections';
import { usePanelState } from './panelMemory';
import { useMaiaDock, useMaiaSubject } from './maiaDock';
import styles from './pro-ask-maia.module.css';

export interface ProAskRequest {
  section: ProAskSection;
  subject: string;
  other?: string;
  houseSystem?: string;
  at?: string;
  dayStart?: 'midnight' | 'zi-hour';
  direction?: 'forward' | 'backward' | null;
  /** The cockpit view that is open, from the server's fixed list. */
  view?: ProAskView;
  /** A body of this chart the astrologer has selected. */
  point?: string;
}

const ERRORS: Record<string, string> = {
  slow_down: 'That was a lot of questions at once. Please wait a minute and ask again.',
  question_too_long: 'Please shorten the question a little.',
  saved_chart_not_found: 'That saved chart is no longer here.',
  complete_birth_details_required: 'This chart needs a complete birth date, time and place.',
  session_required: 'Please sign in again.',
};

interface Exchange { q: string; a: string; safety?: boolean; mentor?: boolean }

export function askKey(request: ProAskRequest): string {
  return `ask.${request.section}.${request.subject}.${request.other ?? ''}`;
}

/** The questions and answers for one subject, and the box to ask the next one. */
export function ProAskMaiaConversation({ request, readsWhose, mode = 'ask' }: {
  request: ProAskRequest;
  readsWhose: string;
  mode?: ProAskMode;
}) {
  const key = askKey(request);
  const [question, setQuestion] = usePanelState(`${key}.draft`, '');
  const [exchanges, setExchanges] = usePanelState<Exchange[]>(`${key}.log`, []);
  // Natal only: transits on a date the astrologer chooses (an event, an anniversary).
  const [onDate, setOnDate] = usePanelState(`${key}.date`, '');
  // Progressions only: a period to look across, from this date to the chosen one.
  const [since, setSince] = usePanelState(`${key}.since`, '');
  const [status, setStatus] = useState<'idle' | 'asking'>('idle');
  const [error, setError] = useState<string | null>(null);
  const mentor = mode === 'mentor';

  async function ask() {
    const q = question.trim();
    if (status === 'asking') return;
    if (!q) { setError('Enter a question first.'); return; }
    setStatus('asking');
    setError(null);
    try {
      const reply = await apiFetch('/api/astrology/pro/ask', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store',
        body: JSON.stringify({
          ...request,
          ...(request.section === 'natal' && onDate ? { at: `${onDate}T12:00:00` } : {}),
          ...(request.section === 'progressed' && since ? { from: `${since}T12:00:00` } : {}),
          ...(mentor ? { mode: 'mentor' } : {}),
          question: q,
        }),
      });
      const body = await reply.json().catch(() => ({}));
      if (!reply.ok || typeof body?.answer !== 'string') {
        setError(ERRORS[body?.error] || 'MAIA could not answer just now. Please try again.');
        return;
      }
      setExchanges((list) => [...list, { q, a: body.answer, safety: body.safety === true, mentor }]);
      setQuestion('');
    } catch {
      setError('MAIA could not answer just now. Please try again.');
    } finally {
      setStatus('idle');
    }
  }

  return (
    <>
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
      {request.section === 'progressed' && (
        <>
          <p className={styles.note}>MAIA reads the progressions and solar arcs for the date chosen above.</p>
          <label className={styles.dateField}>
            Look across a period since (optional, up to 10 years)
            <input type="date" value={since} onChange={(e) => setSince(e.target.value)} />
            {since && <button type="button" onClick={() => setSince('')}>Remove</button>}
          </label>
        </>
      )}
      {request.section === 'transits' && request.at && (
        <p className={styles.note}>
          MAIA reads the sky on {new Date(request.at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}, the moment shown in Transits. Change it there to ask about another date.
        </p>
      )}
      {exchanges.map((e, i) => (
        <div key={i} className={styles.exchange}>
          <p className={styles.q}>{e.mentor ? 'Mentor · ' : ''}{e.q}</p>
          <p className={e.safety ? `${styles.a} ${styles.safety}` : styles.a}>{e.a}</p>
        </div>
      ))}
      <textarea value={question} rows={3} maxLength={600}
        aria-label={mentor ? 'Your question for MAIA as mentor' : 'Your question for MAIA'}
        onChange={(e) => { setQuestion(e.target.value); if (error) setError(null); }}
        placeholder={mentor ? 'Which technique would you like to go deeper into?' : 'What would you like MAIA’s view on?'}
        disabled={status === 'asking'}
        onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void ask(); }} />
      {error && <p role="alert" className={styles.alert}>{error}</p>}
      <div className={styles.actions}>
        <button type="button" onClick={() => void ask()} disabled={status === 'asking'}>
          {status === 'asking' ? 'MAIA is reading…' : mentor ? 'Ask the mentor' : 'Ask MAIA'}
        </button>
        {exchanges.length > 0 && <button type="button" onClick={() => setExchanges([])}>Clear</button>}
      </div>
    </>
  );
}

export default function ProAskMaiaPanel({ request, readsWhose, subjectLabel }: {
  request: ProAskRequest;
  /** Whose charts MAIA will read, said before anything is sent: "Tim's chart", "Owen's and Tim's charts". */
  readsWhose: string;
  /** What the panel is about, for its heading: "the composite", "these transits". */
  subjectLabel: string;
}) {
  const key = askKey(request);
  const dock = useMaiaDock();
  useMaiaSubject(dock ? { key, request, readsWhose, subjectLabel } : null);
  const [open, setOpen] = usePanelState(`${key}.open`, false);

  if (dock) {
    const pointed = dock.open && dock.focusKey === key;
    return (
      <div className={styles.closed}>
        <button type="button" aria-pressed={pointed} onClick={() => dock.focus(key)}>
          <Sparkles size={14} aria-hidden="true" /> {pointed ? `MAIA is on ${subjectLabel}` : `Ask MAIA about ${subjectLabel}`}
        </button>
      </div>
    );
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
      <ProAskMaiaConversation request={request} readsWhose={readsWhose} />
    </div>
  );
}
