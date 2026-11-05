'use client';

/**
 * View-only chart for a client (ASTRO-PRO-CHART-SHARE-01). The client may
 * tap a planet and turn aspects and house lines on or off; nothing changes
 * and nothing is saved. Calculated facts only, never a reading.
 */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { BirthChart } from '@/lib/astrology/proEphemerisCalculator';
import { chartBodies, selectedRelationships } from '@/lib/astrology/proChartGeometry';
import { CelestialChartWheel } from '@/app/astrology/pro-preview/CelestialChartWheel';
import ProAspectGrid from '@/app/astrology/pro-preview/ProAspectGrid';
import styles from './shared-chart.module.css';

function deg(value: number): string {
  const d = Math.floor(value);
  const m = Math.round((value - d) * 60);
  return `${d}°${String(m === 60 ? 59 : m).padStart(2, '0')}′`;
}

export default function SharedChartView({ chart, label, birth }: {
  chart: BirthChart;
  label: string;
  birth: { date: string; time: string; place: string | null };
}) {
  const [focused, setFocused] = useState('Sun');
  const [showAspects, setShowAspects] = useState(true);
  const [showHouseLines, setShowHouseLines] = useState(true);
  const bodies = useMemo(() => chartBodies(chart), [chart]);
  const body = bodies.find((b) => b.name === focused);
  const relationships = useMemo(() => selectedRelationships(chart, focused), [chart, focused]);

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <span className={styles.eyebrow}>A CHART SHARED WITH YOU</span>
        <h1>{label}</h1>
        <p>{birth.date} · {birth.time}{birth.place ? ` · ${birth.place}` : ''}</p>
      </header>

      <section className={styles.instrument}>
        <div className={styles.wheel}>
          <div className={styles.toggles}>
            <button aria-pressed={showAspects} onClick={() => setShowAspects((v) => !v)}>Aspects</button>
            <button aria-pressed={showHouseLines} onClick={() => setShowHouseLines((v) => !v)}>Houses</button>
          </div>
          <CelestialChartWheel chart={chart} focusedBody={focused} onFocusBody={setFocused}
            showAspects={showAspects} showHouseLines={showHouseLines} maxAspectOrb={null} />
        </div>
        <aside className={styles.side} aria-live="polite">
          {body && (
            <>
              <h2>{body.glyph} {body.name}</h2>
              <p className={styles.position}>{body.position.sign} {deg(body.position.degree)} · House {body.position.house}{body.position.retrograde ? ' · retrograde' : ''}</p>
              <h3>Aspects</h3>
              {relationships.length === 0 ? <p className={styles.note}>None within the orbs used.</p> : (
                <ul>
                  {relationships.map((a) => (
                    <li key={`${a.planet1}-${a.type}-${a.planet2}`}>
                      <span>{a.planet1} {a.type} {a.planet2}</span><span>{a.orb.toFixed(2)}°</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </aside>
      </section>

      <section className={styles.positions} aria-label="Positions">
        <h2>Positions</h2>
        <table>
          <tbody>
            {bodies.map((b) => (
              <tr key={b.name} aria-selected={b.name === focused}>
                <th scope="row"><button onClick={() => setFocused(b.name)}>{b.glyph} {b.name}</button></th>
                <td>{b.position.sign} {deg(b.position.degree)}</td>
                <td>House {b.position.house}</td>
              </tr>
            ))}
            <tr><th scope="row">AC Ascendant</th><td>{chart.ascendant.sign} {deg(chart.ascendant.degree)}</td><td /></tr>
            <tr><th scope="row">MC Midheaven</th><td>{chart.midheaven.sign} {deg(chart.midheaven.degree)}</td><td /></tr>
          </tbody>
        </table>
      </section>

      <div className={styles.positions}>
        <ProAspectGrid chart={chart} declinations={null} onSelectBody={setFocused} />
      </div>

      <footer className={styles.colophon}>
        <p>A calculated chart, not a reading: positions and aspects only, porphyry houses. It was shared with you privately and can be turned off by the person who shared it.</p>
        <p>Calculated in <Link href="/">Soullab</Link>.</p>
      </footer>
    </main>
  );
}
