'use client';

/**
 * ASTRO-PRO-SYSTEMS-01 — the open chart in the other systems Free Astrology
 * already calculates: Vedic (sidereal, nakshatras, Vimshottari dasha),
 * Chinese (Four Pillars, luck pillars and year sign) and Mayan (Dreamspell
 * Tzolk'in and Haab).
 * Only the subject ("own" or a saved chart id), the ayanamsa and the day-start
 * convention travel;
 * birth details stay on the server.
 */
import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import type { ProOtherSystems } from '@/lib/astrology/proOtherSystems';
import type { DayStart } from '@/lib/astrology/proFourPillars';
import ProFourPillars, { type LuckDirectionChoice } from './ProFourPillars';
import NakshatraCard from '@/components/astrology/NakshatraCard';
import DashaTimeline from '@/components/astrology/DashaTimeline';
import styles from './pro-systems-panel.module.css';

export type SystemTab = 'vedic' | 'chinese' | 'mayan';
export type Ayanamsa = 'lahiri' | 'true_chitra' | 'krishnamurti';

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

/**
 * The panel's working place: which system is open, its options, the result
 * and the luck direction. Held by the page, so the panel can be unmounted
 * while access is re-checked and come back as the astrologer left it.
 */
export interface SystemsWork {
  subjectId: string;
  tab: SystemTab;
  ayanamsa: Ayanamsa;
  dayStart: DayStart;
  data: ProOtherSystems | null;
  luckDirection: LuckDirectionChoice;
  /** The latest calculation asked for; only its reply may set the result. */
  request: number;
}

export function newSystemsWork(subjectId: string): SystemsWork {
  return { subjectId, tab: 'vedic', ayanamsa: 'lahiri', dayStart: 'midnight', data: null, luckDirection: null, request: 0 };
}

export default function ProSystemsPanel({ subjectId, chartLabel, work, onWork }: {
  subjectId: string; chartLabel: string;
  work: SystemsWork | null; onWork: (update: (current: SystemsWork | null) => SystemsWork | null) => void;
}) {
  const w = work && work.subjectId === subjectId ? work : newSystemsWork(subjectId);
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const [error, setError] = useState<string | null>(null);
  const latestRequest = useRef(w.request);
  // The astrologer's own changes always apply to this subject's working place.
  const update = (patch: Partial<SystemsWork>) =>
    onWork((current) => ({ ...(current && current.subjectId === subjectId ? current : newSystemsWork(subjectId)), ...patch }));
  // A reply applies only if it is still the latest request for this subject
  // and the chart was not closed meanwhile: a reply for options the astrologer
  // has since changed is dropped, never shown under the new ones.
  const settle = (request: number, patch: Partial<SystemsWork>) =>
    onWork((current) => (current && current.subjectId === subjectId && current.request === request
      ? { ...current, ...patch } : current));

  useEffect(() => { setError(null); setStatus('idle'); }, [subjectId]);

  async function calculate(ayanamsa: Ayanamsa, dayStart: DayStart) {
    const request = w.request + 1;
    update({ request });
    const isLatest = () => latestRequest.current === request;
    latestRequest.current = request;
    setStatus('loading');
    setError(null);
    try {
      const reply = await apiFetch('/api/astrology/pro/systems', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store',
        body: JSON.stringify({ subject: subjectId, ayanamsa, dayStart }),
      });
      const body = await reply.json().catch(() => ({}));
      if (!reply.ok || !body?.data?.vedic) {
        if (isLatest()) setError(ERRORS[body?.error] || 'These systems could not be calculated for this chart.');
        settle(request, { data: null });
        return;
      }
      settle(request, { data: body.data, ayanamsa, dayStart });
    } catch {
      if (isLatest()) setError('These systems could not be calculated for this chart.');
    } finally {
      if (isLatest()) setStatus('idle');
    }
  }

  return (
    <div className={styles.panel} id="pro-systems" aria-labelledby="pro-systems-title">
      <div className={styles.controls}>
        <h3 id="pro-systems-title">Other systems</h3>
        <div role="tablist" aria-label="Astrology system" className={styles.tabs}>
          {TABS.map(([value, text]) => (
            <button key={value} role="tab" aria-selected={w.tab === value}
              className={w.tab === value ? styles.tabOn : undefined} onClick={() => update({ tab: value })}>
              {text}
            </button>
          ))}
        </div>
        {w.tab === 'vedic' && (
          <label>
            Ayanamsa
            <select value={w.ayanamsa} disabled={status === 'loading'} onChange={(e) => {
              const next = e.target.value as Ayanamsa;
              update({ ayanamsa: next });
              if (w.data) void calculate(next, w.dayStart);
            }}>
              {AYANAMSAS.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
            </select>
          </label>
        )}
        {w.tab === 'chinese' && (
          <label>
            Day begins at
            <select value={w.dayStart} disabled={status === 'loading'} onChange={(e) => {
              const next = e.target.value as DayStart;
              update({ dayStart: next });
              if (w.data) void calculate(w.ayanamsa, next);
            }}>
              <option value="midnight">Midnight</option>
              <option value="zi-hour">23:00, the Zi hour</option>
            </select>
          </label>
        )}
        {!w.data && (
          <button onClick={() => void calculate(w.ayanamsa, w.dayStart)} disabled={status === 'loading'}>
            {status === 'loading' ? 'Calculating…' : `Show ${chartLabel} in these systems`}
          </button>
        )}
        {w.data && status === 'loading' && <span role="status">Recalculating…</span>}
      </div>
      {error && <p role="alert" className={styles.alert}>{error}</p>}
      {w.data && w.tab === 'vedic' && <VedicView v={w.data.vedic} />}
      {w.data && w.tab === 'chinese' && (
        <ChineseView c={w.data.chinese} direction={w.luckDirection} onDirection={(d) => update({ luckDirection: d })}
          ask={{ subject: subjectId, readsWhose: `${chartLabel === 'my chart' ? 'your' : chartLabel + '’s'} chart` }} />
      )}
      {w.data && w.tab === 'mayan' && <MayanView m={w.data.mayan} />}
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

function ChineseView({ c, direction, onDirection, ask }: {
  ask: { subject: string; readsWhose: string };
  c: ProOtherSystems['chinese']; direction: LuckDirectionChoice; onDirection: (d: LuckDirectionChoice) => void;
}) {
  return (
    <div role="tabpanel" aria-label="Chinese">
      <ProFourPillars fp={c.fourPillars} direction={direction} onDirection={onDirection} ask={ask} />
      <h4 className={styles.subhead}>Year sign</h4>
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
  const t = m.traditional;
  return (
    <div role="tabpanel" aria-label="Mayan">
      <h4 className={styles.subhead}>Traditional count</h4>
      <p className={styles.headline}>
        {t.number} {t.kiche} <span className={styles.muted}>(Yucatec {t.number} {t.yucatec})</span>
      </p>
      <dl className={styles.facts}>
        <dt>Haab</dt><dd>{t.haab.day} {t.haab.month}</dd>
        <dt>Long Count</dt><dd>{t.longCount}</dd>
        <dt>Correlation</dt><dd>GMT {t.correlation}</dd>
      </dl>
      <p className={styles.note}>Method: {t.method}</p>

      <h4 className={styles.subhead}>Dreamspell count (modern)</h4>
      <p className={styles.note}>
        Dreamspell (José Argüelles, 1987) is a modern system with its own count; it does not follow the traditional
        day count above and is not used by Maya daykeepers.
      </p>
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
