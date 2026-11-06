'use client';

/**
 * ASTRO-PRO-GRID-01 — aspect grid and declinations for the open chart.
 * Shows only aspects the calculator reported and declinations the server
 * calculated; nothing is inferred or interpreted here.
 */
import { useMemo, useState } from 'react';
import type { BirthChart } from '@/lib/astrology/proEphemerisCalculator';
import { chartBodies, ASPECT_COLOR, ANGLE_DEFINITIONS } from '@/lib/astrology/proChartGeometry';
import { declinationPairs, type Declination } from '@/lib/astrology/proDeclinations';
import styles from './pro-aspect-grid.module.css';

const ASPECT_GLYPH: Record<string, string> = {
  conjunction: '☌', opposition: '☍', trine: '△', square: '□', sextile: '⚹', quincunx: '⚻',
  semisextile: '⚺', semisquare: '∠', sesquiquadrate: '⚼', quintile: 'Q', biquintile: 'bQ',
};

function formatDeclination(value: number): string {
  const abs = Math.abs(value);
  const deg = Math.floor(abs);
  const min = Math.round((abs - deg) * 60);
  return `${deg}°${String(min === 60 ? 59 : min).padStart(2, '0')}′ ${value >= 0 ? 'N' : 'S'}`;
}

export default function ProAspectGrid({
  chart, declinations, onSelectBody, showDeclinations = true,
}: {
  chart: BirthChart;
  /** False where declinations are never available, such as a shared client chart. */
  showDeclinations?: boolean;
  declinations: readonly Declination[] | null;
  onSelectBody: (name: string) => void;
}) {
  const [tab, setTab] = useState<'grid' | 'declinations'>('grid');
  // Bodies, then the Ascendant and Midheaven as the last two rows.
  const bodies = useMemo(() => [
    ...chartBodies(chart).map((body) => ({ name: body.name as string, glyph: body.glyph, angle: false })),
    ...ANGLE_DEFINITIONS.filter(([key]) => chart[key]).map(([, name, glyph]) => ({ name, glyph, angle: true })),
  ], [chart]);
  const byPair = useMemo(() => {
    const map = new Map<string, BirthChart['aspects'][number]>();
    for (const aspect of chart.aspects || []) {
      if (!Number.isFinite(aspect.orb) || aspect.orb < 0) continue;
      map.set(`${aspect.planet1}|${aspect.planet2}`, aspect);
      map.set(`${aspect.planet2}|${aspect.planet1}`, aspect);
    }
    return map;
  }, [chart]);
  const pairs = useMemo(() => declinations ? declinationPairs(declinations, 1) : [], [declinations]);

  return (
    <section className={styles.panel} aria-labelledby="pro-grid-title">
      <div className={styles.head}>
        <h3 id="pro-grid-title">{showDeclinations ? <>Aspect grid &amp; declinations</> : "Aspect grid"}</h3>
        <div role="tablist" className={styles.tabs}>
          <button role="tab" aria-selected={tab === 'grid'} onClick={() => setTab('grid')}>Aspect grid</button>
          {showDeclinations && (
            <button role="tab" aria-selected={tab === 'declinations'} onClick={() => setTab('declinations')}>Declinations</button>
          )}
        </div>
      </div>

      {tab === 'grid' && (
        <div className={styles.scroll}>
          <table className={styles.grid} aria-label="Aspects between every pair of bodies">
            <tbody>
              {bodies.map((row, r) => (
                <tr key={row.name}>
                  {bodies.slice(0, r).map((col) => {
                    const aspect = byPair.get(`${row.name}|${col.name}`);
                    return (
                      <td key={col.name}
                        title={aspect ? `${row.name} ${aspect.type} ${col.name} · orb ${aspect.orb.toFixed(2)}°` : `${row.name} – ${col.name}: no reported aspect`}>
                        {aspect && (
                          <span style={{ color: ASPECT_COLOR[aspect.type] || '#cfd8db' }}>
                            {ASPECT_GLYPH[aspect.type] || '•'}
                            <small>{aspect.orb.toFixed(0)}°</small>
                          </span>
                        )}
                      </td>
                    );
                  })}
                  <th scope="row">
                    {row.angle
                      ? <span className={styles.angle} title={row.name}>{row.glyph}</span>
                      : <button onClick={() => onSelectBody(row.name)} title={`Select ${row.name}`}>{row.glyph}</button>}
                  </th>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.note}>Hover a cell for the exact orb. Click a glyph to focus that body on the wheel.</p>
        </div>
      )}

      {tab === 'declinations' && (
        declinations === null ? (
          <p className={styles.note}>Declinations are not available for this chart.</p>
        ) : (
          <>
            <table className={styles.decl}>
              <thead><tr><th>Body</th><th>Declination</th><th /></tr></thead>
              <tbody>
                {declinations.map((d) => (
                  <tr key={d.body}>
                    <td>{d.body}</td>
                    <td className={styles.num}>{formatDeclination(d.declination)}</td>
                    <td>{d.outOfBounds ? <span className={styles.oob}>Out of bounds</span> : null}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h4>Parallels within 1°</h4>
            {pairs.length === 0 ? <p className={styles.note}>None.</p> : (
              <ul className={styles.pairs}>
                {pairs.map((p) => (
                  <li key={`${p.a}-${p.b}`}>{p.a} {p.type} {p.b} <span className={styles.num}>{p.orb.toFixed(2)}°</span></li>
                ))}
              </ul>
            )}
            <p className={styles.note}>Geocentric, true equator of date. Out of bounds means beyond the Sun’s greatest declination that year.</p>
          </>
        )
      )}
    </section>
  );
}
