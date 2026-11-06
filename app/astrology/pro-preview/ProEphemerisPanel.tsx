'use client';

/**
 * ASTRO-PRO-EPHEMERIS-01 — graphical ephemeris and transit timeline for the
 * open chart. Only a date range is sent; natal positions stay in the page.
 */
import { useMemo, useState } from 'react';
import { usePanelState } from './panelMemory';
import { apiFetch } from '@/lib/http/apiBase';
import type { WheelBody } from '@/lib/astrology/proChartGeometry';
import { SERIES_BODIES, transitHits, type EphemerisSeries, type SeriesBody } from '@/lib/astrology/proEphemerisSeries';
import styles from './pro-transit-panel.module.css';

const COLORS: Record<SeriesBody, string> = {
  Sun: '#f2c94c', Moon: '#d9dde3', Mercury: '#9fd0d8', Venus: '#e8a5c4', Mars: '#e7735f',
  Jupiter: '#c9a46b', Saturn: '#a59a86', Uranus: '#7fc8b9', Neptune: '#7d9fe0', Pluto: '#b48ad1',
};
const GLYPH: Record<SeriesBody, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂', Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
};
const W = 900;
const H = 340;
const PAD = 34;

function todayInput(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

export default function ProEphemerisPanel({ natalBodies }: { natalBodies: readonly WheelBody[] }) {
  const [start, setStart] = usePanelState('ephemeris.start', todayInput);
  const [months, setMonths] = usePanelState('ephemeris.months', 12);
  const [modulus, setModulus] = usePanelState<360 | 90 | 45 | 30>('ephemeris.modulus', 360);
  const [hidden, setHidden] = useState<Set<SeriesBody>>(new Set(['Moon']));
  const [series, setSeries] = usePanelState<EphemerisSeries | null>('ephemeris.series', null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  async function load() {
    setStatus('loading');
    try {
      const from = new Date(start + 'T00:00:00');
      const to = new Date(from);
      to.setMonth(to.getMonth() + months);
      const stepHours = months <= 6 ? 12 : 24;
      const url = '/api/astrology/pro/ephemeris?from=' + encodeURIComponent(from.toISOString()) +
        '&to=' + encodeURIComponent(to.toISOString()) + '&step=' + stepHours;
      const reply = await apiFetch(url, { method: 'GET', cache: 'no-store' });
      if (!reply.ok) throw new Error('unavailable');
      setSeries(await reply.json());
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }

  const hits = useMemo(() => series ? transitHits(series, natalBodies) : [], [series, natalBodies]);

  const paths = useMemo(() => {
    if (!series) return [];
    return SERIES_BODIES.filter((b) => !hidden.has(b)).map((body) => {
      const values = series.longitudes[body];
      const n = values.length;
      let d = '';
      let prev: number | null = null;
      values.forEach((lon, i) => {
        const y = lon % modulus;
        const x = PAD + (i / Math.max(1, n - 1)) * (W - 2 * PAD);
        const py = H - PAD - (y / modulus) * (H - 2 * PAD);
        // Break the line where it wraps past the top or bottom.
        d += (prev === null || Math.abs(y - prev) > modulus / 2 ? 'M' : 'L') + x.toFixed(1) + ' ' + py.toFixed(1) + ' ';
        prev = y;
      });
      return { body, d };
    });
  }, [series, hidden, modulus]);

  const yFor = (lon: number) => H - PAD - ((lon % modulus) / modulus) * (H - 2 * PAD);
  const endDate = series ? new Date(new Date(series.from).getTime() + (series.longitudes.Sun.length - 1) * series.stepHours * 3_600_000) : null;

  return (
    <div className={styles.panel} aria-labelledby="pro-ephemeris-title">
      <div className={styles.controls}>
        <h3 id="pro-ephemeris-title">Ephemeris &amp; timeline</h3>
        <label>From
          <input type="date" value={start} min="1800-01-01" max="2199-01-01" onChange={(e) => setStart(e.target.value)} />
        </label>
        <label>Span
          <select value={months} onChange={(e) => setMonths(Number(e.target.value))}>
            {[3, 6, 12, 24, 36].map((m) => <option key={m} value={m}>{m} months</option>)}
          </select>
        </label>
        <label>Scale
          <select value={modulus} onChange={(e) => setModulus(Number(e.target.value) as 360 | 90 | 45 | 30)}>
            <option value={360}>360° (zodiac)</option>
            <option value={90}>90° (hard aspects)</option>
            <option value={45}>45°</option>
            <option value={30}>30° (degree in sign)</option>
          </select>
        </label>
        <button onClick={() => void load()} disabled={status === 'loading' || !start}>
          {status === 'loading' ? 'Calculating…' : 'Draw'}
        </button>
      </div>
      {status === 'error' && <p role="alert" className={styles.alert}>The ephemeris could not be calculated for that range.</p>}

      {series && (
        <>
          <div className={styles.controls} style={{ marginTop: 10 }}>
            {SERIES_BODIES.map((b) => (
              <button key={b} aria-pressed={!hidden.has(b)} style={{ color: COLORS[b] }}
                onClick={() => setHidden((h) => { const next = new Set(h); if (next.has(b)) next.delete(b); else next.add(b); return next; })}>
                {GLYPH[b]} {b}
              </button>
            ))}
          </div>
          <div style={{ overflowX: 'auto', marginTop: 10 }}>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: 640 }} role="img"
              aria-label={`Graphical ephemeris, ${modulus}° scale`}>
              <rect x={PAD} y={PAD} width={W - 2 * PAD} height={H - 2 * PAD} fill="rgba(4,14,22,.6)" stroke="rgba(160,175,186,.3)" />
              {Array.from({ length: modulus === 360 ? 13 : 7 }, (_, i) => {
                const lon = (modulus / (modulus === 360 ? 12 : 6)) * i;
                const y = H - PAD - (lon / modulus) * (H - 2 * PAD);
                return <g key={i}>
                  <line x1={PAD} x2={W - PAD} y1={y} y2={y} stroke="rgba(160,175,186,.12)" />
                  <text x={4} y={y + 4} fontSize="10" fill="#7f939b">{lon}°</text>
                </g>;
              })}
              {natalBodies.map((b) => (
                <g key={b.name}>
                  <line x1={PAD} x2={W - PAD} y1={yFor(b.longitude)} y2={yFor(b.longitude)} stroke="#e0c495" strokeDasharray="3 5" opacity=".45" />
                  <text x={W - PAD + 4} y={yFor(b.longitude) + 4} fontSize="11" fill="#e0c495">{b.glyph}</text>
                </g>
              ))}
              {paths.map(({ body, d }) => <path key={body} d={d} fill="none" stroke={COLORS[body]} strokeWidth="1.6" />)}
              <text x={PAD} y={H - 10} fontSize="11" fill="#9fb2b9">{new Date(series.from).toLocaleDateString()}</text>
              {endDate && <text x={W - PAD} y={H - 10} fontSize="11" fill="#9fb2b9" textAnchor="end">{endDate.toLocaleDateString()}</text>}
            </svg>
          </div>
          <p className={styles.note}>Dashed lines are this chart’s natal positions; a planet line crossing one is a transit. At smaller scales, crossings include the hard aspects.</p>

          <div className={styles.listHead}><strong>Transit timeline ({hits.length} exact hits)</strong></div>
          {hits.length === 0 ? <p className={styles.note}>No exact hits in this range.</p> : (
            <ul className={styles.list}>
              {hits.map((h, i) => (
                <li key={i}>
                  <span>{new Date(h.at).toLocaleDateString([], { dateStyle: 'medium' })}</span>
                  <span>{h.transit}{h.retrograde ? ' ℞' : ''}</span>
                  <span className={styles.type}>{h.type} natal {h.natal}</span>
                  <span />
                </li>
              ))}
            </ul>
          )}
          <p className={styles.note}>Exact dates are interpolated between samples and accurate to within a few hours. The Moon is not listed.</p>
        </>
      )}
    </div>
  );
}
