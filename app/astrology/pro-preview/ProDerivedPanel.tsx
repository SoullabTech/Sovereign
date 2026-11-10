'use client';

/**
 * ASTRO-PRO-DERIVED-01 — progressed chart and solar / lunar / planetary
 * returns for the open chart. Only the subject ("own" or a saved chart id),
 * the kind, the date and the body travel; birth details stay on the server.
 */
import { useEffect, useState } from 'react';
import { usePanelState } from './panelMemory';
import ProAskMaiaPanel from './ProAskMaiaPanel';
import { apiFetch } from '@/lib/http/apiBase';
import type { BirthChart } from '@/lib/astrology/proEphemerisCalculator';
import { hasValidChartGeometry } from '@/lib/astrology/proChartGeometry';
import { chartAsOuterRing } from '@/lib/astrology/proComparison';
import type { TransitBody } from '@/lib/astrology/proTransits';
import { CelestialChartWheel } from './CelestialChartWheel';
import styles from './pro-transit-panel.module.css';

type Choice = 'progressed' | 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn';

const CHOICES: Array<[Choice, string]> = [
  ['progressed', 'Progressed chart'],
  ['Sun', 'Solar return'],
  ['Moon', 'Lunar return'],
  ['Mercury', 'Mercury return'],
  ['Venus', 'Venus return'],
  ['Mars', 'Mars return'],
  ['Jupiter', 'Jupiter return'],
  ['Saturn', 'Saturn return'],
];

const ERRORS: Record<string, string> = {
  moment_before_birth: 'Choose a date after the birth.',
  moment_out_of_range: 'Choose a date between 1800 and 2200.',
  return_not_found: 'No return was found in the search window after that date.',
  astrology_consent_required: 'Astrology consent is needed for your own chart.',
  chart_source_changed: 'The birth details changed during calculation. Try again.',
};

function today(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

export default function ProDerivedPanel({
  subjectId, chartLabel, houseSystem, onOuter,
}: {
  subjectId: string;
  chartLabel: string;
  houseSystem: string;
  onOuter: (bodies: TransitBody[], label: string | null) => void;
}) {
  const [choice, setChoice] = usePanelState<Choice>('derived.choice', 'progressed');
  const [date, setDate] = usePanelState('derived.date', today);
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = usePanelState<{ chart: BirthChart; instant: string; label: string; method: string } | null>('derived.result', null);
  const [focus, setFocus] = usePanelState('derived.focus', 'Sun');

  // Clear on a change of chart or house system, not when the panel remounts for the same one.
  const [shownFor, setShownFor] = usePanelState('derived.for', subjectId + '|' + houseSystem);
  useEffect(() => {
    const key = subjectId + '|' + houseSystem;
    if (key === shownFor) return;
    setShownFor(key);
    setResult(null);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId, houseSystem]);

  async function calculate() {
    setStatus('loading');
    setError(null);
    try {
      // Noon local avoids a date input landing on the previous UTC day.
      const at = new Date(date + 'T12:00:00');
      const reply = await apiFetch('/api/astrology/pro/derived?houseSystem=' + encodeURIComponent(houseSystem), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store',
        body: JSON.stringify(choice === 'progressed'
          ? { subject: subjectId, kind: 'progressed', at: at.toISOString() }
          : { subject: subjectId, kind: 'return', body: choice, at: at.toISOString() }),
      });
      const body = await reply.json().catch(() => ({}));
      if (!reply.ok || !hasValidChartGeometry(body?.data)) {
        setError(ERRORS[body?.error] || 'That chart could not be calculated.');
        setResult(null);
        return;
      }
      const label = CHOICES.find(([c]) => c === choice)![1];
      setResult({ chart: body.data, instant: body.instant, label, method: body.method });
    } catch {
      setError('That chart could not be calculated.');
    } finally {
      setStatus('idle');
    }
  }

  return (
    <div className={styles.panel} aria-labelledby="pro-derived-title">
      <div className={styles.controls}>
        <h3 id="pro-derived-title">Progressions &amp; returns</h3>
        <label>
          Chart
          <select value={choice} onChange={(e) => setChoice(e.target.value as Choice)}>
            {CHOICES.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
          </select>
        </label>
        <label>
          {choice === 'progressed' ? 'Progressed to' : 'First return on or after'}
          <input type="date" value={date} min="1800-01-01" max="2200-12-31" onChange={(e) => setDate(e.target.value)} />
        </label>
        <button onClick={() => void calculate()} disabled={status === 'loading' || !date}>
          {status === 'loading' ? 'Calculating…' : 'Calculate'}
        </button>
        {result && (
          <>
            <button onClick={() => onOuter(chartAsOuterRing(result.chart), result.label)}>Show as outer ring</button>
            <button onClick={() => { setResult(null); onOuter([], null); }}>Clear</button>
          </>
        )}
      </div>
      {error && <p role="alert" className={styles.alert}>{error}</p>}
      {result && (
        <>
          <p className={styles.note}>
            {result.label} for {chartLabel}: {new Date(result.instant).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}. Method: {result.method}.
          </p>
          <CelestialChartWheel chart={result.chart} focusedBody={focus} onFocusBody={setFocus} showAspects showHouseLines />
        </>
      )}
      {date && (
        <ProAskMaiaPanel subjectLabel="progressions and solar arcs" readsWhose={`${chartLabel === 'my chart' ? 'your' : chartLabel + '’s'} chart`}
          request={{ section: 'progressed', subject: subjectId, houseSystem, at: `${date}T12:00:00` }} />
      )}
    </div>
  );
}
