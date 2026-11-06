'use client';

/**
 * ASTRO-PRO-ORBS-01 — the astrologer's orb for each planet.
 *
 * A setting of the astrologer's own tools, kept in this browser only; it
 * changes which aspects are found, never the positions.
 */
import { useEffect, useState } from 'react';
import {
  DEFAULT_POINT_ORB, MAX_POINT_ORB, MIN_POINT_ORB, ORB_POINTS, cleanPointOrbs, isDefaultOrbs, pointOrb,
  type PointOrbs,
} from '@/lib/astrology/proAspectOrbs';
import styles from './astrology-pro-preview.module.css';

const STORAGE_KEY = 'soullab.astrology.pro.pointOrbs.v1';

/** The saved orbs, read once in the browser. */
export function useSavedPointOrbs(): [PointOrbs, (next: PointOrbs) => void] {
  const [orbs, setOrbs] = useState<PointOrbs>({});
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setOrbs(cleanPointOrbs(JSON.parse(raw)));
    } catch { /* no saved orbs: the defaults apply */ }
  }, []);
  function save(next: PointOrbs) {
    const clean = cleanPointOrbs(next);
    setOrbs(clean);
    try {
      if (isDefaultOrbs(clean)) window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    } catch { /* kept for this visit only */ }
  }
  return [orbs, save];
}

export default function ProOrbSettings({ orbs, onChange }: { orbs: PointOrbs; onChange: (next: PointOrbs) => void }) {
  const custom = !isDefaultOrbs(orbs);
  return (
    <details className={styles.orbSettings}>
      <summary>Orbs{custom ? ' · custom' : ''}</summary>
      <div className={styles.orbSettingsPanel}>
        <p>
          The orb for each point, for conjunctions, oppositions, squares and trines. A pair uses the
          larger orb of its two points; sextiles and the minor aspects scale from it. With every point
          at {DEFAULT_POINT_ORB}°, aspects are the engine&rsquo;s own. Kept in this browser only.
        </p>
        <div className={styles.orbSettingsGrid}>
          {ORB_POINTS.map((name) => {
            const id = `pro-orb-${name.toLowerCase().replace(/\s+/g, '-')}`;
            return (
              <label key={name} htmlFor={id}>
                <span>{name}</span>
                <input id={id} type="number" inputMode="decimal" min={MIN_POINT_ORB} max={MAX_POINT_ORB} step={0.5}
                  value={pointOrb(orbs, name)}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    if (!Number.isFinite(value) || value < MIN_POINT_ORB || value > MAX_POINT_ORB) return;
                    onChange({ ...orbs, [name]: value });
                  }} />
                <span aria-hidden="true">°</span>
              </label>
            );
          })}
        </div>
        {custom && <button type="button" onClick={() => onChange({})}>Reset all to {DEFAULT_POINT_ORB}°</button>}
      </div>
    </details>
  );
}
