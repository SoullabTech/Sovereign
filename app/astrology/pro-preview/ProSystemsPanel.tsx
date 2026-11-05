'use client';

/**
 * ASTRO-PRO-SYSTEMS-01 — the open chart in the other systems Free Astrology
 * already calculates: Vedic (sidereal, nakshatras, Vimshottari dasha),
 * Chinese (year sign) and Mayan (Dreamspell Tzolk'in and Haab).
 * Only the subject ("own" or a saved chart id) and the ayanamsa travel;
 * birth details stay on the server.
 */
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import type { ProOtherSystems } from '@/lib/astrology/proOtherSystems';
import NakshatraCard from '@/components/astrology/NakshatraCard';
import DashaTimeline from '@/components/astrology/DashaTimeline';
import styles from './pro-systems-panel.module.css';

type SystemTab = 'vedic' | 'chinese' | 'mayan';
type Ayanamsa = 'lahiri' | 'true_chitra' | 'krishnamurti';

const TABS: Array<[SystemTab, string]> = [['vedic', 'Vedic'], ['chinese', 'Chinese'], ['mayan', 'Mayan']];
const AYANAMSAS: Array<[Ayanamsa, string]> = [
  ['lahiri', 'Lahiri'], ['true_chitra', 'True Chitra'], ['krishnamurti', 'Krishnamurti (KP)'],
];

const ERRORS: Record<string, string> = {
  astrology_consent_required: 'Astrology consent is needed for your own chart.',
  complete_birth_details_required: 'This chart needs a complete birth date, time and place.',
  saved_chart_not_found: 'That saved chart could not be found.',
  chart_source_changed: 'The birth details changed during calculation. Try again.',
};

const fmtDeg = (d: number) => {
  const whole = Math.floor(d);
  return `${whole}°${String(Math.round((d - whole) * 60)).padStart(2, '0')}′`;
};

export default function ProSystemsPanel({ subjectId, chartLabel }: { subjectId: string; chartLabel: string }) {
  const [tab, setTab] = useState<SystemTab>('vedic');
  const [ayanamsa, setAyanamsa] = useState<Ayanamsa>('lahiri');
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProOtherSystems | null>(null);

  useEffect(() => { setData(null); setError(null); }, [subjectId]);

  async function calculate(nextAyanamsa: Ayanamsa = ayanamsa) {
    setStatus('loading');
    setError(null);
    try {
      const reply = await apiFetch('/api/astrology/pro/systems', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store',
        body: JSON.stringify({ subject: subjectId, ayanamsa: nextAyanamsa }),
      });
      const body = await reply.json().catch(() => ({}));
      if (!reply.ok || !body?.data?.vedic) {
        setError(ERRORS[body?.error] || 'These systems could not be calculated for this chart.');
        setData(null);
        return;
      }
      setData(body.data);
    } catch {
      setError('These systems could not be calculated for this chart.');
    } finally {
      setStatus('idle');
    }
  }

  return (
    <div className={styles.panel} id="pro-systems" aria-labelledby="pro-systems-title">
      <div className={styles.controls}>
        <h3 id="pro-systems-title">Other systems</h3>
        <div role="tablist" aria-label="Astrology system" className={styles.tabs}>
          {TABS.map(([value, text]) => (
            <button key={value} role="tab" aria-selected={tab === value}
              className={tab === value ? styles.tabOn : undefined} onClick={() => setTab(value)}>
              {text}
            </button>
          ))}
        </div>
        {tab === 'vedic' && (
          <label>
            Ayanamsa
            <select value={ayanamsa} onChange={(e) => {
              const next = e.target.value as Ayanamsa;
              setAyanamsa(next);
              if (data) void calculate(next);
            }}>
              {AYANAMSAS.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
            </select>
          </label>
        )}
        {!data && (
          <button onClick={() => void calculate()} disabled={status === 'loading'}>
            {status === 'loading' ? 'Calculating…' : `Show ${chartLabel} in these systems`}
          </button>
        )}
      </div>
      {error && <p role="alert" className={styles.alert}>{error}</p>}
      {data && tab === 'vedic' && <VedicView v={data.vedic} />}
      {data && tab === 'chinese' && <ChineseView c={data.chinese} />}
      {data && tab === 'mayan' && <MayanView m={data.mayan} />}
    </div>
  );
}

function VedicView({ v }: { v: ProOtherSystems['vedic'] }) {
  return (
    <div role="tabpanel" aria-label="Vedic">
      <p className={styles.summary}>
        Lagna <strong>{v.lagna.rashi} {fmtDeg(v.lagna.degree)}</strong> ({v.lagna.nakshatra}) ·
        Ayanamsa {v.ayanamsaLabel} {v.ayanamsaValue.toFixed(2)}°
      </p>
      <table className={styles.table}>
        <thead>
          <tr><th>Graha</th><th>Rashi</th><th>Degree</th><th>Nakshatra</th><th>Pada</th><th>House</th><th>Dignity</th></tr>
        </thead>
        <tbody>
          {v.grahas.map((g) => (
            <tr key={g.graha}>
              <td>{g.graha}{g.retrograde ? ' ℞' : ''}</td>
              <td>{g.rashi}</td>
              <td className={styles.num}>{fmtDeg(g.degree)}</td>
              <td>{g.nakshatra}</td>
              <td className={styles.num}>{g.pada}</td>
              <td className={styles.num}>{g.house}</td>
              <td className={styles.cap}>{g.dignity}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.cards}>
        <NakshatraCard nakshatra={v.birthNakshatra} pada={v.moonPada} showSpiralogic={false} />
        <DashaTimeline profile={v.dasha} />
      </div>
      <p className={styles.note}>Method: {v.method}</p>
    </div>
  );
}

function ChineseView({ c }: { c: ProOtherSystems['chinese'] }) {
  return (
    <div role="tabpanel" aria-label="Chinese">
      <p className={styles.headline}>
        <span aria-hidden="true">{c.symbol}</span> {c.yinYang === 'yang' ? 'Yang' : 'Yin'}{' '}
        <span className={styles.cap}>{c.element}</span> {c.animal}{' '}
        <span className={styles.muted}>({c.elementChineseName} {c.chineseName})</span>
      </p>
      <dl className={styles.facts}>
        <dt>Archetype</dt><dd>{c.archetype}</dd>
        <dt>60-year cycle</dt><dd>Year {c.cyclePosition} of 60</dd>
        <dt>Characteristics</dt><dd>{c.characteristics.join(', ')}</dd>
        <dt>Harmonious with</dt><dd>{c.compatibility.join(', ')}</dd>
        <dt>Challenging with</dt><dd>{c.incompatible.join(', ')}</dd>
      </dl>
      <p className={styles.note}>Method: {c.method}</p>
    </div>
  );
}

function MayanView({ m }: { m: ProOtherSystems['mayan'] }) {
  return (
    <div role="tabpanel" aria-label="Mayan">
      <p className={styles.headline}>
        <span aria-hidden="true">{m.daySign.glyph}</span> {m.galacticSignature}
      </p>
      <dl className={styles.facts}>
        <dt>Day sign</dt><dd>{m.daySign.name} — {m.daySign.archetype}; {m.daySign.meaning}</dd>
        <dt>Tone</dt><dd>{m.tone.number} {m.tone.name} — {m.tone.meaning}</dd>
        <dt>Kin</dt><dd>{m.tzolkinNumber} of 260 · {m.wavespell}</dd>
        <dt>Haab</dt><dd>{m.haab}</dd>
        <dt>Direction</dt><dd className={styles.cap}>{m.direction}</dd>
        <dt>Path of life</dt>
        <dd>{m.pathOfLife.map((p) => `${p.stage}: ${p.signature}`).join(' · ')}</dd>
      </dl>
      <p className={styles.note}>Method: {m.method}</p>
    </div>
  );
}
