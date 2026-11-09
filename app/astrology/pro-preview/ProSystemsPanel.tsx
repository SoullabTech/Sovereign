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
import { useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import type { ProOtherSystems } from '@/lib/astrology/proOtherSystems';
import type { DayStart } from '@/lib/astrology/proFourPillars';
import ProFourPillars, { type LuckDirectionChoice } from './ProFourPillars';
import ChineseReadingView from '@/components/astrology/ChineseReadingView';
import { VedicProfilePanel, VedicPlanetsPanel } from '@/components/astrology/VedicRoomViews';
import { MayanSignCard, MayanPathOfLife } from '@/components/astrology/MayanRoomViews';
import { getTodaysMayanSign } from '@/lib/astrology/mayanAstrology';
import { DaYunTimelineView } from '@/components/astrology/DaYunTimeline';
import { rehydrateDaYunProfile } from '@/lib/astrology/daYunProfileView';
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

type VedicRoom = 'profile' | 'dasha' | 'planets';
const VEDIC_ROOMS: Array<[VedicRoom, string]> = [['profile', 'Profile'], ['dasha', 'Dasha'], ['planets', 'Planets']];

/**
 * The Vedic room: the profile (Moon, Sun and ascendant signs, birth nakshatra,
 * current dasha, Spiralogic integration), the full Vimshottari dasha timeline,
 * and the planets, each the same experience the Free Vedic page offers,
 * computed on the server so no birth detail reaches the browser. The precise
 * table of graha positions stays under Planets.
 */
function VedicView({ v }: { v: ProOtherSystems['vedic'] }) {
  const [room, setRoom] = useState<VedicRoom>('profile');
  const profile = { ...v.profile, dasha: v.dasha, birthNakshatra: v.birthNakshatra };
  return (
    <div role="tabpanel" aria-label="Vedic">
      <p className={styles.summary}>
        Lagna <strong>{v.lagna.rashi} {fmtDeg(v.lagna.degree)}</strong> ({v.lagna.nakshatra}) ·
        Ayanamsa {v.ayanamsaLabel} {v.ayanamsaValue.toFixed(2)}°
      </p>
      <div role="tablist" aria-label="Vedic astrology rooms" className={styles.rooms}>
        {VEDIC_ROOMS.map(([value, text]) => (
          <button key={value} role="tab" aria-selected={room === value}
            className={room === value ? styles.tabOn : undefined} onClick={() => setRoom(value)}>
            {text}
          </button>
        ))}
      </div>

      {room === 'profile' && (
        <div role="tabpanel" aria-label="Vedic profile">
          <VedicProfilePanel profile={profile} onViewDasha={() => setRoom('dasha')} />
        </div>
      )}

      {room === 'dasha' && (
        <div role="tabpanel" aria-label="Vimshottari dasha">
          <DashaTimeline profile={v.dasha} />
        </div>
      )}

      {room === 'planets' && (
        <div role="tabpanel" aria-label="Planets">
          <VedicPlanetsPanel chart={v.profile.chart} />
          <h4 className={styles.subhead}>Positions to the arcminute</h4>
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
        </div>
      )}
      <p className={styles.note}>Method: {v.method}</p>
    </div>
  );
}

type ChineseRoom = 'pillars' | 'reading' | 'daYun';
const CHINESE_ROOMS: Array<[ChineseRoom, string]> = [
  ['pillars', 'Pillars & year sign'], ['reading', 'Zodiac reading'], ['daYun', 'Da Yun cycles'],
];

/**
 * The Chinese room: the Four Pillars and year sign, the full zodiac reading
 * and the ten-year luck cycles (with their organ, spirit and health teaching),
 * each the same experience the Free Chinese page offers, computed on the
 * server so no birth detail reaches the browser.
 */
function ChineseView({ c, direction, onDirection, ask }: {
  ask: { subject: string; readsWhose: string };
  c: ProOtherSystems['chinese']; direction: LuckDirectionChoice; onDirection: (d: LuckDirectionChoice) => void;
}) {
  const [room, setRoom] = useState<ChineseRoom>('pillars');
  const chosen = direction ? c.daYun?.[direction] : undefined;
  const daYun = chosen ? rehydrateDaYunProfile(chosen) : null;
  return (
    <div role="tabpanel" aria-label="Chinese">
      <div role="tablist" aria-label="Chinese astrology rooms" className={styles.rooms}>
        {CHINESE_ROOMS.map(([value, text]) => (
          <button key={value} role="tab" aria-selected={room === value}
            className={room === value ? styles.tabOn : undefined} onClick={() => setRoom(value)}>
            {text}
          </button>
        ))}
      </div>

      {room === 'pillars' && (
        <div role="tabpanel" aria-label="Pillars and year sign">
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
      )}

      {room === 'reading' && (
        <div role="tabpanel" aria-label="Zodiac reading">
          <ChineseReadingView reading={c.reading} />
          <p className={styles.note}>The reading follows from the Chinese year alone: {c.method}</p>
        </div>
      )}

      {room === 'daYun' && (
        <div role="tabpanel" aria-label="Da Yun cycles">
          <p className={styles.note}>
            Tradition counts forward for a man born in a yang year or a woman born in a yin year, and backward
            otherwise. A saved chart does not record sex, so choose the direction:
          </p>
          <div role="radiogroup" aria-label="Da Yun direction" className={styles.rooms}>
            {(['forward', 'backward'] as const).map((d) => (
              <button key={d} role="radio" aria-checked={direction === d}
                className={direction === d ? styles.tabOn : undefined} onClick={() => onDirection(d)}>
                {d === 'forward' ? 'Forward' : 'Backward'}
              </button>
            ))}
          </div>
          {daYun
            ? <DaYunTimelineView profile={daYun} />
            : <p className={styles.note}>Choose a direction to see the ten-year cycles.</p>}
        </div>
      )}
    </div>
  );
}

type MayanRoom = 'count' | 'path' | 'signature' | 'today';
const MAYAN_ROOMS: Array<[MayanRoom, string]> = [
  ['count', 'Traditional count'], ['path', 'Path of life'], ['signature', 'Galactic signature'], ['today', 'Today’s energy'],
];

/**
 * The Mayan room: the traditional count first (what daykeepers keep), then the
 * modern Dreamspell views the Free Mayan page offers (path of life, galactic
 * signature, today's energy), computed on the server so no birth date reaches
 * the browser. Today's energy needs no birth data at all.
 */
function MayanView({ m }: { m: ProOtherSystems['mayan'] }) {
  const t = m.traditional;
  const [room, setRoom] = useState<MayanRoom>('count');
  const today = useMemo(() => getTodaysMayanSign(), []);
  return (
    <div role="tabpanel" aria-label="Mayan">
      <div role="tablist" aria-label="Mayan astrology rooms" className={styles.rooms}>
        {MAYAN_ROOMS.map(([value, text]) => (
          <button key={value} role="tab" aria-selected={room === value}
            className={room === value ? styles.tabOn : undefined} onClick={() => setRoom(value)}>
            {text}
          </button>
        ))}
      </div>

      {room === 'count' && (
        <div role="tabpanel" aria-label="Traditional count and Dreamspell kin">
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
      )}

      {room === 'path' && (
        <div role="tabpanel" aria-label="Path of life">
          <p className={styles.note}>The modern Dreamspell count, not the traditional day count.</p>
          <MayanPathOfLife profile={m.profile} />
        </div>
      )}

      {room === 'signature' && (
        <div role="tabpanel" aria-label="Galactic signature">
          <p className={styles.note}>The modern Dreamspell count, not the traditional day count.</p>
          <MayanSignCard sign={m.profile.tzolkin} title="Your Galactic Signature" />
        </div>
      )}

      {room === 'today' && (
        <div role="tabpanel" aria-label="Today’s energy">
          <p className={styles.note}>The modern Dreamspell count for today. It uses no birth detail.</p>
          <MayanSignCard sign={today} title="Today's Galactic Energy" isToday />
        </div>
      )}
    </div>
  );
}
