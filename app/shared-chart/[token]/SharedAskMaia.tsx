'use client';

/**
 * Ask MAIA about this chart — on a shared client chart, only where the
 * astrologer turned it on (founder ruling 2026-11-05). Each request remains
 * one question at a time; the browser may display this visit as a thread, but
 * no earlier turn is sent back and nothing is remembered or stored.
 */
import { useRef, useState } from 'react';
import styles from './shared-chart.module.css';

const MESSAGES: Record<string, string> = {
  limit_reached: 'This link has reached its number of questions. Your astrologer can help with anything more.',
  slow_down: 'Let’s pause a moment — ask again in a minute.',
  question_too_long: 'Please keep your question a little shorter.',
};

const STARTERS = [
  'What pattern holds this chart together?',
  'What do today’s transits highlight?',
  'What could I explore with my astrologer?',
];

type Turn = {
  id: number;
  question: string;
  answer?: string;
  error?: string;
  pending: boolean;
};

export default function SharedAskMaia({ token, firstName, offeredBy }: {
  token: string; firstName: string; offeredBy: string | null;
}) {
  const [question, setQuestion] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const nextId = useRef(0);

  async function ask() {
    const q = question.trim();
    if (!q || busy) return;
    const id = ++nextId.current;
    setBusy(true);
    setQuestion('');
    setTurns((current) => [...current, { id, question: q, pending: true }]);
    try {
      const res = await fetch(`/api/shared-chart/${encodeURIComponent(token)}/ask`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: q }),
      });
      const data = await res.json().catch(() => ({}));
      setTurns((current) => current.map((turn) => turn.id === id
        ? res.ok && data?.answer
          ? { ...turn, answer: data.answer, pending: false }
          : { ...turn, error: MESSAGES[data?.error] || 'MAIA could not answer just now. Please try again.', pending: false }
        : turn));
    } catch {
      setTurns((current) => current.map((turn) => turn.id === id
        ? { ...turn, error: 'MAIA could not answer just now. Please try again.', pending: false }
        : turn));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="ask-maia" className={styles.ask} aria-labelledby="ask-maia-title" data-ask-maia>
      <span className={styles.eyebrow}>ASK MAIA</span>
      <h2 id="ask-maia-title">Ask MAIA about your chart</h2>
      <p className={styles.askNote}>
        {offeredBy ? <>Offered by {offeredBy}. </> : null}
        MAIA is an AI in Soullab, not your astrologer. It answers from this chart and today&rsquo;s transits only, and keeps nothing: your questions are not saved.
      </p>

      <div className={styles.starterRow} aria-label="Ways to begin">
        {STARTERS.map((starter) => (
          <button key={starter} type="button" className={styles.starterChip}
            onClick={() => setQuestion(starter)} disabled={busy}>{starter}</button>
        ))}
      </div>

      {turns.length > 0 && (
        <div className={styles.thread} aria-live="polite">
          {turns.map((turn) => (
            <div className={styles.exchange} key={turn.id}>
              <p className={styles.asked}>{turn.question}</p>
              {turn.pending && <p className={styles.note}>MAIA is reading your chart…</p>}
              {turn.answer && <div className={styles.answer}>{turn.answer.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}</div>}
              {turn.error && <p className={styles.error} role="alert">{turn.error}</p>}
            </div>
          ))}
        </div>
      )}

      <div className={styles.askRow}>
        <textarea value={question} maxLength={600} rows={2}
          placeholder={`What would you like to understand, ${firstName}?`}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void ask(); } }}
          aria-label="Your question for MAIA" />
        <button onClick={() => void ask()} disabled={busy || !question.trim()}>{busy ? 'Asking…' : 'Ask'}</button>
      </div>
    </section>
  );
}
