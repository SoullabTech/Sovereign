'use client';

/**
 * ASTRO-PRO-FOUR-PILLARS-01 — the Four Pillars table and the luck pillars.
 *
 * Calculated characters and the standard tables only; no reading. Pillars are
 * shown Hour · Day · Month · Year, right to left in time, as BaZi charts are
 * conventionally laid out. The luck direction is the astrologer's choice:
 * tradition decides it by the year's polarity and the person's sex, which a
 * saved chart does not record.
 */
import { useState } from 'react';
import type { FourPillars, LuckPillar, Pillar } from '@/lib/astrology/proFourPillars';
import styles from './pro-four-pillars.module.css';

const ELEMENT_CLASS: Record<string, string> = {
  Wood: styles.wood, Fire: styles.fire, Earth: styles.earth, Metal: styles.metal, Water: styles.water,
};

const polarity = (p: 'yin' | 'yang') => (p === 'yang' ? 'Yang' : 'Yin');

function Character({ hanzi, pinyin, element, polarity: pol, extra }: {
  hanzi: string; pinyin: string; element: string; polarity: 'yin' | 'yang'; extra?: string;
}) {
  return (
    <div className={`${styles.character} ${ELEMENT_CLASS[element] ?? ''}`}>
      <span className={styles.hanzi} lang="zh">{hanzi}</span>
      <span className={styles.pinyin}>{pinyin}{extra ? ` · ${extra}` : ''}</span>
      <span className={styles.element}>{polarity(pol)} {element}</span>
    </div>
  );
}

function PillarColumn({ p }: { p: Pillar }) {
  return (
    <div className={styles.column} role="group" aria-label={`${p.name} pillar`}>
      <div className={styles.columnName}>{p.name}</div>
      <div className={styles.tenGod}>{p.stem.tenGod ? <>{p.stem.tenGod.english} <span lang="zh">{p.stem.tenGod.hanzi}</span></> : 'Day Master'}</div>
      <Character {...p.stem} />
      <Character {...p.branch} extra={p.branch.animal} />
      <ul className={styles.hidden} aria-label="Hidden stems">
        {p.hidden.map((h) => (
          <li key={h.index} className={ELEMENT_CLASS[h.element]}>
            <span lang="zh">{h.hanzi}</span> {h.pinyin} <small>{h.tenGod.english}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LuckRow({ pillars }: { pillars: LuckPillar[] }) {
  return (
    <ol className={styles.luck}>
      {pillars.map((l) => (
        <li key={l.fromAge}>
          <span className={styles.luckAge}>{Math.floor(l.fromAge)}–{Math.floor(l.toAge)}</span>
          <span className={`${styles.luckChars} ${ELEMENT_CLASS[l.stem.element] ?? ''}`} lang="zh">{l.stem.hanzi}{l.branch.hanzi}</span>
          <span className={styles.pinyin}>{l.stem.pinyin} {l.branch.pinyin}</span>
          <small>{l.tenGod.english}</small>
          <small className={styles.luckYear}>from {l.fromYear}</small>
        </li>
      ))}
    </ol>
  );
}

export default function ProFourPillars({ fp }: { fp: FourPillars }) {
  const [direction, setDirection] = useState<'forward' | 'backward' | null>(null);
  const [year, month, day, hour] = fp.pillars;
  const luck = direction ? fp.luck[direction] : null;
  return (
    <section className={styles.wrap} aria-labelledby="pro-four-pillars-title">
      <h4 id="pro-four-pillars-title" className={styles.title}>Four Pillars</h4>
      <p className={styles.dayMaster}>
        Day Master <strong lang="zh">{fp.dayMaster.hanzi}</strong> {fp.dayMaster.pinyin} ·{' '}
        {polarity(fp.dayMaster.polarity)} {fp.dayMaster.element}
        {fp.dayStart === 'zi-hour' && <span className={styles.muted}> · day begins at 23:00</span>}
      </p>
      <div className={styles.pillars}>
        {[hour, day, month, year].map((p) => <PillarColumn key={p.name} p={p} />)}
      </div>
      <p className={styles.elements}>
        Elements among the eight characters:{' '}
        {Object.entries(fp.elements).map(([e, n]) => `${e} ${n}`).join(' · ')}
      </p>

      <h4 className={styles.title}>Luck pillars · Da Yun</h4>
      <p className={styles.note}>
        Tradition counts forward for a man born in a yang year or a woman born in a yin year, and backward
        otherwise. This chart&rsquo;s year is <strong>{polarity(fp.yearPolarity).toLowerCase()}</strong>. Choose the direction:
      </p>
      <div className={styles.direction} role="radiogroup" aria-label="Luck pillar direction">
        {(['forward', 'backward'] as const).map((d) => (
          <label key={d}>
            <input type="radio" name="luck-direction" checked={direction === d} onChange={() => setDirection(d)} />
            {d === 'forward' ? 'Forward' : 'Backward'}
            <small>
              {' '}from age {fp.luck[d].startAge.years}
              {fp.luck[d].startAge.months ? ` y ${fp.luck[d].startAge.months} m` : ''}
            </small>
          </label>
        ))}
      </div>
      {luck && <LuckRow pillars={luck.pillars} />}
      <p className={styles.note}>Method: {fp.method}</p>
    </section>
  );
}
