'use client';

/**
 * ASTRO-PRO-VIEWS-01 — chart points, sidereal view and harmonic charts for the
 * open chart. Pure transforms of the calculated chart plus the Vertex and
 * ayanamsa the server returned; nothing is sent anywhere.
 */
import { useMemo } from 'react';
import { usePanelState } from './panelMemory';
import type { BirthChart } from '@/lib/astrology/proEphemerisCalculator';
import { SIGNS, normalizeLongitude } from '@/lib/astrology/proChartGeometry';
import type { ChartPoints } from '@/lib/astrology/proChartPoints';
import { harmonicChart, lots, siderealChart } from '@/lib/astrology/proChartTransforms';
import { CelestialChartWheel } from './CelestialChartWheel';
import styles from './pro-transit-panel.module.css';

function format(longitude: number): string {
  const lon = normalizeLongitude(longitude);
  const index = Math.floor(lon / 30);
  const within = lon - index * 30;
  const deg = Math.floor(within);
  const min = Math.min(59, Math.round((within - deg) * 60));
  return `${deg}°${String(min).padStart(2, '0')}′ ${SIGNS[index]}`;
}

export default function ProChartViews({ chart, points }: { chart: BirthChart; points: ChartPoints | null }) {
  const [view, setView] = usePanelState<'points' | 'sidereal' | 'harmonic'>('chartviews.view', 'points');
  const [harmonic, setHarmonic] = usePanelState('chartviews.harmonic', 5);
  const [focus, setFocus] = usePanelState('chartviews.focus', 'Sun');

  const chartLots = useMemo(() => lots(chart), [chart]);
  const sidereal = useMemo(
    () => points ? siderealChart(chart, points.ayanamsa.lahiri) : null,
    [chart, points],
  );
  const harmonicView = useMemo(() => harmonicChart(chart, harmonic), [chart, harmonic]);

  return (
    <div className={styles.panel} aria-labelledby="pro-views-title">
      <div className={styles.controls}>
        <h3 id="pro-views-title">Chart points &amp; views</h3>
        <button aria-pressed={view === 'points'} onClick={() => setView('points')}>Chart points</button>
        <button aria-pressed={view === 'sidereal'} onClick={() => setView('sidereal')}>Sidereal</button>
        <button aria-pressed={view === 'harmonic'} onClick={() => setView('harmonic')}>Harmonic</button>
        {view === 'harmonic' && (
          <label>
            Harmonic
            <input type="number" min={2} max={360} value={harmonic}
              onChange={(e) => setHarmonic(Math.max(2, Math.min(360, Math.round(Number(e.target.value) || 2))))} />
          </label>
        )}
      </div>

      {view === 'points' && (
        <ul className={styles.list}>
          {chartLots.map((lot) => (
            <li key={lot.name}><span>{lot.name}</span><span /><span>{format(lot.longitude)}</span><span className={styles.orb}>{lot.sect} chart</span></li>
          ))}
          {points?.vertex != null && (
            <li><span>Vertex</span><span /><span>{format(points.vertex)}</span><span className={styles.orb}>west, prime vertical</span></li>
          )}
          {points?.antivertex != null && (
            <li><span>Antivertex</span><span /><span>{format(points.antivertex)}</span><span className={styles.orb}>east</span></li>
          )}
          <li><span>Midheaven</span><span /><span>{chart.midheaven.degree.toFixed(0)}° {chart.midheaven.sign}</span><span /></li>
          <li><span>Ascendant</span><span /><span>{chart.ascendant.degree.toFixed(0)}° {chart.ascendant.sign}</span><span /></li>
        </ul>
      )}
      {view === 'points' && (
        <p className={styles.note}>Lots use day/night by the Sun above or below the horizon. Vertex is found from the actual sky at the birth place.</p>
      )}

      {view === 'sidereal' && (sidereal ? (
        <>
          <p className={styles.note}>Sidereal zodiac, {points!.ayanamsa.method}: ayanamsa {points!.ayanamsa.lahiri.toFixed(2)}°. Houses and aspects are unchanged.</p>
          <CelestialChartWheel chart={sidereal} focusedBody={focus} onFocusBody={setFocus} showAspects showHouseLines />
        </>
      ) : <p className={styles.note}>The sidereal view needs the chart to be reopened after this update.</p>)}

      {view === 'harmonic' && (harmonicView ? (
        <>
          <p className={styles.note}>Harmonic {harmonic}: each longitude × {harmonic}, equal houses from the harmonic Ascendant, aspects recalculated.</p>
          <CelestialChartWheel chart={harmonicView} focusedBody={focus} onFocusBody={setFocus} showAspects showHouseLines />
        </>
      ) : <p className={styles.note}>Choose a harmonic from 2 to 360.</p>)}
    </div>
  );
}
