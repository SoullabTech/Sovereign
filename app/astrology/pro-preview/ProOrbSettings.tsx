'use client';

/**
 * ASTRO-PRO-ORBS-01 — the astrologer's orbs: one for each aspect, one for each
 * point, and how a pair's two point orbs combine.
 *
 * A setting of the astrologer's own tools, kept in this browser only; it
 * changes which aspects are found, never the positions.
 */
import { useEffect, useState } from 'react';
import {
  ASPECT_DEFINITIONS, DEFAULT_ORB_SETTINGS, DEFAULT_POINT_ORB, MAX_ORB, MIN_ORB, ORB_POINTS, ORB_PRESETS,
  aspectOrb, cleanOrbSettings, isDefaultOrbs, pointOrb, type AspectType, type OrbSettings, type PairRule,
} from '@/lib/astrology/proAspectOrbs';
import styles from './astrology-pro-preview.module.css';

const STORAGE_KEY = 'soullab.astrology.pro.orbs.v2';
const OLD_STORAGE_KEY = 'soullab.astrology.pro.pointOrbs.v1';

const ASPECT_LABEL: Record<AspectType, string> = {
  conjunction: 'Conjunction', opposition: 'Opposition', trine: 'Trine', square: 'Square', sextile: 'Sextile',
  quincunx: 'Quincunx', semisextile: 'Semisextile', semisquare: 'Semisquare',
  sesquiquadrate: 'Sesquiquadrate', quintile: 'Quintile', biquintile: 'Biquintile',
};

/** The saved orbs, read once in the browser. */
export function useSavedOrbSettings(): [OrbSettings, (next: OrbSettings) => void] {
  const [settings, setSettings] = useState<OrbSettings>(DEFAULT_ORB_SETTINGS);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) { setSettings(cleanOrbSettings(JSON.parse(raw))); return; }
      // Point orbs saved by the first version carry over.
      const old = window.localStorage.getItem(OLD_STORAGE_KEY);
      if (old) setSettings(cleanOrbSettings({ points: JSON.parse(old) }));
    } catch { /* no saved orbs: the defaults apply */ }
  }, []);
  function save(next: OrbSettings) {
    const clean = cleanOrbSettings(next);
    setSettings(clean);
    try {
      window.localStorage.removeItem(OLD_STORAGE_KEY);
      if (isDefaultOrbs(clean) && clean.pairRule === 'larger') window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    } catch { /* kept for this visit only */ }
  }
  return [settings, save];
}

function OrbInput({ id, label, value, onChange }: {
  id: string; label: string; value: number; onChange: (value: number) => void;
}) {
  return (
    <label htmlFor={id}>
      <span>{label}</span>
      <input id={id} type="number" inputMode="decimal" min={MIN_ORB} max={MAX_ORB} step={0.5} value={value}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (Number.isFinite(next) && next >= MIN_ORB && next <= MAX_ORB) onChange(next);
        }} />
      <span aria-hidden="true">°</span>
    </label>
  );
}

const slug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

export default function ProOrbSettings({ settings, onChange }: {
  settings: OrbSettings; onChange: (next: OrbSettings) => void;
}) {
  const custom = !isDefaultOrbs(settings);
  return (
    <details className={styles.orbSettings}>
      <summary>Orbs{custom ? ' · custom' : ''}</summary>
      <div className={styles.orbSettingsPanel}>
        <div className={styles.orbPresets} role="group" aria-label="Orb presets">
          {ORB_PRESETS.map((preset) => (
            <button key={preset.id} type="button" onClick={() => onChange(preset.settings)}>{preset.label}</button>
          ))}
        </div>

        <h4>Aspects</h4>
        <p>The orb each aspect allows when both points are at {DEFAULT_POINT_ORB}°.</p>
        <div className={styles.orbSettingsGrid}>
          {ASPECT_DEFINITIONS.map(({ type }) => (
            <OrbInput key={type} id={`pro-orb-aspect-${type}`} label={ASPECT_LABEL[type]} value={aspectOrb(settings, type)}
              onChange={(value) => onChange({ ...settings, aspects: { ...settings.aspects, [type]: value } })} />
          ))}
        </div>

        <h4>Points</h4>
        <p>
          A point above {DEFAULT_POINT_ORB}° widens its aspects; below narrows them. Every aspect&rsquo;s orb
          scales by the pair&rsquo;s point orb over {DEFAULT_POINT_ORB}°.
        </p>
        <label className={styles.orbPairRule} htmlFor="pro-orb-pair-rule">
          A pair uses
          <select id="pro-orb-pair-rule" value={settings.pairRule}
            onChange={(event) => onChange({ ...settings, pairRule: event.target.value as PairRule })}>
            <option value="larger">the larger of its two orbs</option>
            <option value="average">the average of its two orbs (moieties)</option>
          </select>
        </label>
        <div className={styles.orbSettingsGrid}>
          {ORB_POINTS.map((name) => (
            <OrbInput key={name} id={`pro-orb-${slug(name)}`} label={name} value={pointOrb(settings, name)}
              onChange={(value) => onChange({ ...settings, points: { ...settings.points, [name]: value } })} />
          ))}
        </div>

        <p className={styles.orbSettingsNote}>
          With nothing changed, aspects are the engine&rsquo;s own. Positions never change. Kept in this browser only.
        </p>
        {custom && <button type="button" onClick={() => onChange(DEFAULT_ORB_SETTINGS)}>Reset to engine default</button>}
      </div>
    </details>
  );
}
