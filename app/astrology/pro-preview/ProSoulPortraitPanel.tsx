'use client';

/**
 * Write a Soul Portrait from a Pro chart, without leaving Pro (founder request
 * 2026-11-07: the separate form asked again for what Pro already holds).
 *
 * The chart is named by id only; the server reads its birth details and draws
 * it with the Pro calculator, as before. The astrologer chooses only what Pro
 * cannot know: the name to address, the kind of portrait and the page theme.
 * Age comes from the birth date; under 18 the portrait is always written as a
 * minor's. Saved charts promise they are not shared with MAIA, so the panel
 * says MAIA will read this chart before anything is sent; nothing is sent until
 * "Write draft". The draft is private and opens in a new tab.
 */
import { useState } from 'react';
import { PORTRAIT_THEMES, DEFAULT_PORTRAIT_THEME, type PortraitMode, type PortraitThemeKey } from '@/lib/soulPortrait/schema';
import { parseTransitReport } from '@/lib/soulPortrait/generator/transitReportParser';
import styles from './pro-saved-charts.module.css';

const MODES: Array<[PortraitMode, string]> = [
  ['gift', 'Gift'], ['self', 'Self'], ['parent-child', 'Parent–child'], ['legacy', 'Legacy'],
];

/** Whole years from a YYYY-MM-DD birth date to today. */
export function ageOn(birthDate: string, today = new Date()): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < mo || (today.getMonth() + 1 === mo && today.getDate() < d)) age -= 1;
  return age >= 0 && age < 130 ? age : null;
}

type State =
  | { kind: 'form' }
  | { kind: 'writing' }
  | { kind: 'done'; previewUrl: string }
  | { kind: 'error'; message: string };

export default function ProSoulPortraitPanel({ source, label, chartLine, birthDate, onClose }: {
  /** 'mine' or a saved chart id. */
  source: 'mine' | string;
  /** Name shown on the portrait, prefilled; '' when Pro does not know it. */
  label: string;
  /** The chart as Pro holds it, for display only. */
  chartLine: string;
  birthDate?: string;
  onClose: () => void;
}) {
  const knownAge = birthDate ? ageOn(birthDate) : null;
  const [name, setName] = useState(label);
  const [mode, setMode] = useState<PortraitMode>('gift');
  const [theme, setTheme] = useState<PortraitThemeKey>(DEFAULT_PORTRAIT_THEME);
  const [age, setAge] = useState(knownAge !== null ? String(knownAge) : '');
  const [minorTicked, setMinorTicked] = useState(false);
  const [transitReport, setTransitReport] = useState('');
  const [state, setState] = useState<State>({ kind: 'form' });

  const ageNumber = age.trim() ? Number(age) : null;
  const ageValid = ageNumber === null || (Number.isInteger(ageNumber) && ageNumber >= 0 && ageNumber < 130);
  const minorByAge = ageNumber !== null && ageValid && ageNumber < 18;
  const isMinor = minorByAge || minorTicked;
  const transitParse = transitReport.trim() ? parseTransitReport(transitReport) : null;
  const transitUnreadable = transitParse !== null && transitParse.transits.length === 0;
  const ready = name.trim().length > 0 && ageValid && !transitUnreadable;

  async function write() {
    setState({ kind: 'writing' });
    try {
      const res = await fetch('/api/soul-portrait/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({
          name: name.trim(), mode, theme, isMinor,
          age: ageNumber ?? undefined,
          transitReport: transitReport.trim() || undefined,
          proChartSource: source,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) setState({ kind: 'error', message: 'Please sign in again to write a portrait.' });
      else if (!res.ok || !data.previewUrl) setState({ kind: 'error', message: data.error || 'The draft could not be written. Please try again.' });
      else setState({ kind: 'done', previewUrl: data.previewUrl });
    } catch {
      setState({ kind: 'error', message: 'The draft could not be written. Please try again.' });
    }
  }

  if (state.kind === 'done') {
    return (
      <div className={styles.portraitPanel} role="group" aria-label="Soul Portrait">
        <p role="status"><strong>Draft ready.</strong> It is private until you choose to share it.</p>
        <div className={styles.portraitActions}>
          <a href={state.previewUrl} target="_blank" rel="noopener noreferrer">Open draft</a>
          <button type="button" onClick={() => setState({ kind: 'form' })}>Write another</button>
          <button type="button" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  const writing = state.kind === 'writing';
  return (
    <div className={styles.portraitPanel} role="group" aria-label="Soul Portrait">
      <p className={styles.portraitChart}><span>Chart</span> {chartLine}</p>
      <p className={styles.note}>MAIA will read this chart to write a private draft. Nothing is sent until you choose Write draft.</p>
      <div className={styles.portraitFields}>
        <label>Name on the portrait
          <input value={name} onChange={(e) => setName(e.target.value)} disabled={writing} maxLength={120} />
        </label>
        <label>Kind
          <select value={mode} onChange={(e) => setMode(e.target.value as PortraitMode)} disabled={writing}>
            {MODES.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
          </select>
        </label>
        <label>Page theme
          <select value={theme} onChange={(e) => setTheme(e.target.value as PortraitThemeKey)} disabled={writing}>
            {Object.values(PORTRAIT_THEMES).map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        </label>
        <label>Age
          <input value={age} onChange={(e) => setAge(e.target.value)} inputMode="numeric" disabled={writing}
            aria-invalid={!ageValid} placeholder="optional" />
        </label>
      </div>
      <label className={styles.portraitCheck}>
        <input type="checkbox" checked={isMinor} disabled={writing || minorByAge}
          onChange={(e) => setMinorTicked(e.target.checked)} />
        {' '}Subject is a minor{minorByAge ? ' (under 18 by birth date)' : ''}
      </label>
      <details className={styles.portraitYear}>
        <summary>Add the Year Ahead (optional)</summary>
        <p className={styles.note}>
          Paste the client&rsquo;s 12-month transit report (Astrograph format). Only the transit data is read; every
          word of the Year Ahead is written fresh.
        </p>
        <textarea value={transitReport} onChange={(e) => setTransitReport(e.target.value)} rows={5} disabled={writing}
          placeholder={'Transiting Pluto in opposition with natal Jupiter\nMarch 4, 2026 until January 10, 2027'} />
        {transitParse && transitParse.transits.length > 0 && (
          <p className={styles.note}>{transitParse.transits.length} transit{transitParse.transits.length === 1 ? '' : 's'} found.</p>
        )}
        {transitUnreadable && <p role="alert" className={styles.alert}>No transit lines recognised. Clear the field or paste the report text.</p>}
      </details>
      {state.kind === 'error' && <p role="alert" className={styles.alert}>{state.message}</p>}
      <div className={styles.portraitActions}>
        <button type="button" onClick={() => void write()} disabled={!ready || writing}>
          {writing ? `Writing… about ${transitParse ? 2 : 1} min` : 'Write draft'}
        </button>
        <button type="button" onClick={onClose} disabled={writing}>Cancel</button>
      </div>
    </div>
  );
}
