'use client';

/**
 * Ask MAIA about this chart — on a shared client chart, only where the
 * astrologer turned it on (founder ruling 2026-11-05). One question at a time;
 * nothing is remembered between questions or stored. Always labelled as MAIA,
 * an AI; "offered by" names the astrologer without making MAIA them.
 */
import { useState } from 'react';
import styles from './shared-chart.module.css';

const MESSAGES: Record<string, string> = {
  limit_reached: 'This link has reached its number of questions. Your astrologer can help with anything more.',
  slow_down: 'Let’s pause a moment — ask again in a minute.',
  question_too_long: 'Please keep your question a little shorter.',
};

export default function SharedAskMaia({ token, firstName, offeredBy }: {
  token: string; firstName: string; offeredBy: string | null;
}) {
  const [question, setQuestion] = useState('');
  const [asked, setAsked] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function ask() {
    const q = question.trim();
    if (!q || busy) return;
    setBusy(true); setError(''); setAnswer(''); setAsked(q); setQuestion('');
    try {
      const res = await fetch(`/api/shared-chart/${encodeURIComponent(token)}/ask`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: q }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.answer) setAnswer(data.answer);
      else setError(MESSAGES[data?.error] || 'MAIA could not answer just now. Please try again.');
    } catch {
      setError('MAIA could not answer just now. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={styles.ask} aria-labelledby="ask-maia-title" data-ask-maia>
      <span className={styles.eyebrow}>ASK MAIA</span>
      <h2 id="ask-maia-title">Ask MAIA about your chart</h2>
      <p className={styles.askNote}>
        {offeredBy ? <>Offered by {offeredBy}. </> : null}
        MAIA is an AI in Soullab, not your astrologer. It answers from this chart and today&rsquo;s transits only, and keeps nothing: your questions are not saved.
      </p>
      <div className={styles.askRow}>
        <textarea value={question} maxLength={600} rows={2}
          placeholder={`What would you like to understand, ${firstName}?`}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void ask(); } }}
          aria-label="Your question for MAIA" />
        <button onClick={() => void ask()} disabled={busy || !question.trim()}>{busy ? 'Asking…' : 'Ask'}</button>
      </div>
      {asked && (
        <div className={styles.exchange} aria-live="polite">
          <p className={styles.asked}>{asked}</p>
          {busy && <p className={styles.note}>MAIA is reading your chart…</p>}
          {answer && <div className={styles.answer}>{answer.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}</div>}
          {error && <p className={styles.note} role="alert">{error}</p>}
        </div>
      )}
    </section>
  );
}
