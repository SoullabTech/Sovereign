'use client';

/**
 * A deep reading of the open chart by MAIA (founder request 2026-11-07, after
 * an outside analysis showed the depth astrologers need): the natal chart and
 * its patterns, transits on a chosen date, the Four Pillars and the traditional
 * Maya count, drawn together, with what the astrologer knows of the person's
 * life as optional context. The life context is sent only with this reading
 * and never stored; MAIA never treats the chart as cause or prediction of it.
 */
import { useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { LIFE_CONTEXT_MAX } from '@/lib/astrology/proAskMaiaSections';
import { usePanelState } from './panelMemory';
import styles from './pro-ask-maia.module.css';

export default function ProDeepReadingPanel({ subject, houseSystem, readsWhose }: {
  subject: string; houseSystem: string;
  /** "Tim's chart", "your chart" — said before anything is sent. */
  readsWhose: string;
}) {
  const key = `deep.${subject}`;
  const [open, setOpen] = usePanelState(`${key}.open`, false);
  const [onDate, setOnDate] = usePanelState(`${key}.date`, '');
  const [pillars, setPillars] = usePanelState(`${key}.pillars`, true);
  const [direction, setDirection] = usePanelState<'forward' | 'backward' | null>(`${key}.direction`, null);
  const [maya, setMaya] = usePanelState(`${key}.maya`, true);
  const [progressions, setProgressions] = usePanelState(`${key}.progressions`, true);
  const [since, setSince] = usePanelState(`${key}.since`, '');
  const [life, setLife] = usePanelState(`${key}.life`, '');
  const [focus, setFocus] = usePanelState(`${key}.focus`, 'Write a full reading.');
  const [reading, setReading] = usePanelState<string | null>(`${key}.reading`, null);
  const [status, setStatus] = useState<'idle' | 'writing'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function write() {
    if (status === 'writing' || !focus.trim()) return;
    setStatus('writing');
    setError(null);
    try {
      const include = [...(pillars ? ['four-pillars'] : []), ...(maya ? ['maya'] : []), ...(progressions ? ['progressions'] : [])];
      const reply = await apiFetch('/api/astrology/pro/ask', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store',
        body: JSON.stringify({
          section: 'deep', subject, houseSystem, include, question: focus.trim(),
          ...(onDate ? { at: `${onDate}T12:00:00` } : {}),
          ...(progressions && since ? { from: `${since}T12:00:00` } : {}),
          ...(pillars && direction ? { direction } : {}),
          ...(life.trim() ? { lifeContext: life.trim() } : {}),
        }),
      });
      const body = await reply.json().catch(() => ({}));
      if (!reply.ok || typeof body?.answer !== 'string') {
        setError(body?.error === 'slow_down' ? 'Please wait a minute and try again.' : 'MAIA could not write the reading just now. Please try again.');
        return;
      }
      setReading(body.answer);
    } catch {
      setError('MAIA could not write the reading just now. Please try again.');
    } finally {
      setStatus('idle');
    }
  }

  async function copy() {
    if (!reading) return;
    try { await navigator.clipboard.writeText(reading); setCopied(true); } catch { /* the text stays selectable */ }
  }

  if (!open) {
    return (
      <div className={styles.closed}>
        <button type="button" onClick={() => setOpen(true)}>Deep reading by MAIA</button>
      </div>
    );
  }
  const writing = status === 'writing';
  return (
    <div className={styles.panel} role="group" aria-label="Deep reading by MAIA">
      <div className={styles.head}>
        <strong>Deep reading by MAIA</strong>
        <button type="button" onClick={() => setOpen(false)}>Close</button>
      </div>
      <p className={styles.note}>
        MAIA will read {readsWhose}: its positions, aspects and patterns, and what you include below. Only calculated facts
        are sent, not names or birth details, unless you write them in the life notes. Nothing is kept. MAIA is an AI, not
        the astrologer, and treats the chart as symbolic language, never as cause or prediction.
      </p>
      <div className={styles.deepOptions}>
        <label className={styles.dateField}>Transits on (optional)
          <input type="date" value={onDate} onChange={(e) => setOnDate(e.target.value)} disabled={writing} />
        </label>
        <label><input type="checkbox" checked={pillars} onChange={(e) => setPillars(e.target.checked)} disabled={writing} /> Four Pillars</label>
        {pillars && (
          <span className={styles.inline} role="radiogroup" aria-label="Luck pillar direction">
            Luck pillars:
            {(['forward', 'backward'] as const).map((d) => (
              <label key={d}><input type="radio" name={`${key}-direction`} checked={direction === d} onChange={() => setDirection(d)} disabled={writing} /> {d}</label>
            ))}
            <label><input type="radio" name={`${key}-direction`} checked={direction === null} onChange={() => setDirection(null)} disabled={writing} /> leave out</label>
          </span>
        )}
        <label><input type="checkbox" checked={maya} onChange={(e) => setMaya(e.target.checked)} disabled={writing} /> Traditional Maya count</label>
        <label><input type="checkbox" checked={progressions} onChange={(e) => setProgressions(e.target.checked)} disabled={writing} /> Progressions and solar arcs</label>
        {progressions && (
          <label className={styles.dateField}>over a period since (optional)
            <input type="date" value={since} onChange={(e) => setSince(e.target.value)} disabled={writing} />
          </label>
        )}
      </div>
      <label className={styles.block}>What you know of their life (optional)
        <textarea value={life} onChange={(e) => setLife(e.target.value)} rows={4} maxLength={LIFE_CONTEXT_MAX} disabled={writing}
          placeholder="e.g. their work and interests, the people close to them, major events you know of" />
        <small className={styles.note}>Sent only with this reading and never stored. Please avoid full names. MAIA will not link it causally to the chart or diagnose.</small>
      </label>
      <label className={styles.block}>Focus
        <input value={focus} onChange={(e) => setFocus(e.target.value)} maxLength={600} disabled={writing} />
      </label>
      {error && <p role="alert" className={styles.alert}>{error}</p>}
      <div className={styles.actions}>
        <button type="button" onClick={() => void write()} disabled={writing || !focus.trim()}>
          {writing ? 'MAIA is writing… about a minute' : reading ? 'Write it again' : 'Write the reading'}
        </button>
        {reading && <button type="button" onClick={() => void copy()}>{copied ? 'Copied' : 'Copy'}</button>}
        {reading && <button type="button" onClick={() => setReading(null)}>Clear</button>}
      </div>
      {reading && <div className={styles.reading}>{reading}</div>}
    </div>
  );
}
