'use client';

/**
 * ASTRO-PRO-COMPARE-01 — compare the open chart with another chart you hold:
 * your own, or one of your saved charts. Shows the other chart as an outer
 * ring with cross-aspects, or the midpoint composite as its own wheel.
 *
 * The other chart is fetched through the same owner-only routes as any Pro
 * chart; only its id (or "own") is sent.
 */
import { useEffect, useMemo, useState } from 'react';
import { usePanelState } from './panelMemory';
import ProAskMaiaPanel from './ProAskMaiaPanel';
import { apiFetch } from '@/lib/http/apiBase';
import { aspectReading } from '@/lib/astrology/proTraditionText';
import type { BirthChart } from '@/lib/astrology/proEphemerisCalculator';
import { hasValidChartGeometry, type WheelBody } from '@/lib/astrology/proChartGeometry';
import { chartAsOuterRing, compositeChart, crossAspects } from '@/lib/astrology/proComparison';
import type { TransitBody } from '@/lib/astrology/proTransits';
import { CelestialChartWheel } from './CelestialChartWheel';
import styles from './pro-transit-panel.module.css';

type Option = { id: string; label: string };

export default function ProComparePanel({
  chart, chartLabel, currentSubjectId, houseSystem, natalBodies, outer, onOuter,
}: {
  chart: BirthChart;
  chartLabel: string;
  /** 'own' or a saved chart id — excluded from the choices. */
  currentSubjectId: string;
  houseSystem: string;
  natalBodies: readonly WheelBody[];
  outer: readonly TransitBody[];
  onOuter: (bodies: TransitBody[], label: string | null) => void;
}) {
  const [options, setOptions] = useState<Option[]>([]);
  const [choice, setChoice] = usePanelState('compare.choice', '');
  const [mode, setMode] = usePanelState<'biwheel' | 'composite'>('compare.mode', 'biwheel');
  const [other, setOther] = usePanelState<{ id: string; label: string; chart: BirthChart } | null>('compare.other', null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [orb, setOrb] = usePanelState('compare.orb', 3);
  const [focus, setFocus] = usePanelState('compare.focus', 'Sun');

  useEffect(() => {
    let active = true;
    apiFetch('/api/astrology/pro/charts', { method: 'GET', cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { charts: [] }))
      .then((body) => {
        if (!active) return;
        const saved: Option[] = (Array.isArray(body?.charts) ? body.charts : [])
          .map((c: { id: string; label: string }) => ({ id: c.id, label: c.label }));
        setOptions([{ id: 'own', label: 'My chart' }, ...saved].filter((o) => o.id !== currentSubjectId));
      })
      .catch(() => { if (active) setOptions(currentSubjectId === 'own' ? [] : [{ id: 'own', label: 'My chart' }]); });
    return () => { active = false; };
  }, [currentSubjectId]);

  // A different primary chart or house system invalidates the comparison.
  // Clear on a change of chart or house system, not when the panel remounts for the same one.
  const [shownFor, setShownFor] = usePanelState<[BirthChart, string]>('compare.for', [chart, houseSystem]);
  useEffect(() => {
    if (shownFor[0] === chart && shownFor[1] === houseSystem) return;
    setShownFor([chart, houseSystem]);
    setOther(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chart, houseSystem]);

  async function compare() {
    const option = options.find((o) => o.id === choice);
    if (!option) return;
    setStatus('loading');
    try {
      const url = option.id === 'own'
        ? '/api/astrology/pro/my-chart?houseSystem=' + encodeURIComponent(houseSystem)
        : '/api/astrology/pro/charts/' + encodeURIComponent(option.id) + '?houseSystem=' + encodeURIComponent(houseSystem);
      const reply = await apiFetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}', cache: 'no-store',
      });
      if (!reply.ok) throw new Error('unavailable');
      const body = await reply.json();
      if (!hasValidChartGeometry(body?.data)) throw new Error('invalid');
      setOther({ id: option.id, label: option.label, chart: body.data });
      onOuter(chartAsOuterRing(body.data), option.label);
      setMode('biwheel');
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }

  function clear() {
    setOther(null);
    onOuter([], null);
  }

  const contacts = useMemo(
    () => other ? crossAspects(natalBodies, outer, orb) : [],
    [other, natalBodies, outer, orb],
  );
  const composite = useMemo(() => other ? compositeChart(chart, other.chart) : null, [chart, other]);

  return (
    <div className={styles.panel} aria-labelledby="pro-compare-title">
      <div className={styles.controls}>
        <h3 id="pro-compare-title">Compare</h3>
        <label>
          Compare {chartLabel} with
          <select value={choice} onChange={(e) => setChoice(e.target.value)}>
            <option value="">Choose a chart…</option>
            {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </label>
        <button onClick={() => void compare()} disabled={!choice || status === 'loading'}>
          {status === 'loading' ? 'Calculating…' : 'Compare'}
        </button>
        {other && (
          <>
            <button aria-pressed={mode === 'biwheel'} onClick={() => { setMode('biwheel'); onOuter(chartAsOuterRing(other.chart), other.label); }}>Biwheel</button>
            <button aria-pressed={mode === 'composite'} onClick={() => setMode('composite')}>Composite</button>
            <button onClick={clear}>Clear</button>
          </>
        )}
      </div>
      {options.length === 0 && <p className={styles.note}>Save a chart for someone else to compare with it.</p>}
      {status === 'error' && <p role="alert" className={styles.alert}>That chart could not be calculated for comparison.</p>}

      {other && mode === 'biwheel' && (
        <>
          <p className={styles.note}>Outer ring: {other.label}. Inner wheel: {chartLabel}.</p>
          <div className={styles.listHead}>
            <strong>Contacts between the charts</strong>
            <label>Orb
              <select value={orb} onChange={(e) => setOrb(Number(e.target.value))}>
                {[1, 2, 3, 5, 8].map((v) => <option key={v} value={v}>{v}°</option>)}
              </select>
            </label>
          </div>
          {contacts.length === 0 ? <p className={styles.note}>No major contacts within {orb}°.</p> : (
            <ul className={styles.list}>
              {contacts.map((c) => (
                <li key={`${c.inner}-${c.outer}`}>
                  <span>{chartLabel} {c.inner}</span>
                  <span className={styles.type}>{c.type}</span>
                  <span>{other.label} {c.outer}</span>
                  <span className={styles.orb}>{c.orb.toFixed(2)}°</span>
                  <small className={styles.tradition}>{aspectReading(chartLabel + '’s ' + c.inner, other.label + '’s ' + c.outer, c.type)}</small>
                </li>
              ))}
            </ul>
          )}
          <ProAskMaiaPanel subjectLabel="the two charts together" readsWhose={`${chartLabel}’s and ${other.label}’s charts`}
            request={{ section: 'biwheel', subject: currentSubjectId, other: other.id, houseSystem }} />
        </>
      )}

      {other && mode === 'composite' && (
        composite ? (
          <>
            <p className={styles.note}>
              Composite of {chartLabel} and {other.label}: midpoint method, equal houses from the composite Ascendant.
            </p>
            <CelestialChartWheel chart={composite} focusedBody={focus} onFocusBody={setFocus}
              showAspects showHouseLines />
            <ProAskMaiaPanel subjectLabel="the composite" readsWhose={`${chartLabel}’s and ${other.label}’s charts`}
              request={{ section: 'composite', subject: currentSubjectId, other: other.id, houseSystem }} />
          </>
        ) : <p className={styles.note}>A composite needs both charts’ Ascendant and MC.</p>
      )}
    </div>
  );
}
