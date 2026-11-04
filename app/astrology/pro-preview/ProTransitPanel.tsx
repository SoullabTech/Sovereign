'use client';

/**
 * ASTRO-PRO-TRANSITS-01 — choose a moment, see that sky around the chart.
 *
 * The browser sends only the moment; the natal chart never leaves the page.
 * Aspects are measured here and listed as geometry, without interpretation.
 */
import { useMemo, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import type { WheelBody } from '@/lib/astrology/proChartGeometry';
import { transitBodies, transitToNatalAspects, type TransitBody } from '@/lib/astrology/proTransits';
import styles from './pro-transit-panel.module.css';

function localNowInputValue(): string {
  const now = new Date();
  now.setSeconds(0, 0);
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export default function ProTransitPanel({
  natalBodies, transits, onTransits,
}: {
  natalBodies: readonly WheelBody[];
  transits: readonly TransitBody[];
  onTransits: (bodies: TransitBody[], at: string | null) => void;
}) {
  const [moment, setMoment] = useState(localNowInputValue);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [shownAt, setShownAt] = useState<string | null>(null);
  const [orb, setOrb] = useState(3);

  const aspects = useMemo(
    () => transitToNatalAspects(transits, natalBodies, orb),
    [transits, natalBodies, orb],
  );

  async function show(value: string) {
    // datetime-local is wall time in the viewer's own timezone.
    const at = new Date(value);
    if (!Number.isFinite(at.getTime())) { setStatus('error'); return; }
    setStatus('loading');
    try {
      const reply = await apiFetch('/api/astrology/pro/sky?at=' + encodeURIComponent(at.toISOString()), {
        method: 'GET', cache: 'no-store',
      });
      if (!reply.ok) throw new Error('sky_unavailable');
      const body = await reply.json();
      const bodies = transitBodies(body?.positions);
      if (bodies.length === 0) throw new Error('sky_empty');
      setShownAt(body.at);
      onTransits(bodies, body.at);
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className={styles.panel} aria-labelledby="pro-transits-title">
      <div className={styles.controls}>
        <h3 id="pro-transits-title">Transits</h3>
        <label>
          Moment (your local time)
          <input type="datetime-local" value={moment} min="1800-01-01T00:00" max="2200-12-31T23:59"
            onChange={(e) => setMoment(e.target.value)} />
        </label>
        <button onClick={() => void show(moment)} disabled={status === 'loading'}>
          {status === 'loading' ? 'Calculating…' : 'Show transits'}
        </button>
        <button onClick={() => { const now = localNowInputValue(); setMoment(now); void show(now); }}
          disabled={status === 'loading'}>Now</button>
        {transits.length > 0 && (
          <button onClick={() => { setShownAt(null); onTransits([], null); }}>Hide</button>
        )}
      </div>
      {status === 'error' && <p role="alert" className={styles.alert}>The sky for that moment could not be calculated. Choose a date between 1800 and 2200.</p>}
      {transits.length > 0 && shownAt && (
        <>
          <p className={styles.note}>
            Outer ring: the sky on {new Date(shownAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}.
            Geocentric positions; the Moon moves about 13° a day.
          </p>
          <div className={styles.listHead}>
            <strong>Transit aspects to this chart</strong>
            <label>
              Orb
              <select value={orb} onChange={(e) => setOrb(Number(e.target.value))}>
                {[1, 2, 3, 5, 8].map((value) => <option key={value} value={value}>{value}°</option>)}
              </select>
            </label>
          </div>
          {aspects.length === 0 ? (
            <p className={styles.note}>No major aspects within {orb}°.</p>
          ) : (
            <ul className={styles.list}>
              {aspects.map((a) => (
                <li key={`${a.transit}-${a.natal}`}>
                  <span>Transit {a.transit}</span>
                  <span className={styles.type}>{a.type}</span>
                  <span>natal {a.natal}</span>
                  <span className={styles.orb}>{a.orb.toFixed(2)}°</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
