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
import type { FourPillars, LuckDirection, Pillar } from '@/lib/astrology/proFourPillars';
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

type Phase = 'past' | 'current' | 'future';

function phaseOf(fromAge: number, toAge: number, ageNow: number): Phase {
  if (ageNow >= toAge) return 'past';
  return ageNow >= fromAge ? 'current' : 'future';
}

const PHASE_CLASS: Record<Phase, string> = { past: styles.past, current: styles.current, future: styles.future };

/**
 * The luck pillars on a timeline: those lived, the one now (with how far into
 * it the person is), and those to come; then the annual pillars of the luck
 * pillar in focus, with this year marked.
 */
function LuckTimeline({ luck, fp }: { luck: LuckDirection; fp: FourPillars }) {
  const age = fp.ageNow;
  const first = luck.pillars[0];
  const currentIndex = luck.pillars.findIndex((l) => phaseOf(l.fromAge, l.toAge, age) === 'current');
  // The luck pillar whose years are shown: the current one, else the first to come, else the last.
  const focus = currentIndex >= 0 ? currentIndex : age < first.fromAge ? 0 : luck.pillars.length - 1;
  const focused = luck.pillars[focus];
  const years = fp.annual.filter((a) => a.year >= focused.fromYear && a.year < focused.fromYear + 10);
  const thisYear = fp.annual.find((a) => a.year === fp.now.solarYear);
  const current = currentIndex >= 0 ? luck.pillars[currentIndex] : null;
  const nextIndex = currentIndex >= 0 ? currentIndex + 1 : age < first.fromAge ? 0 : -1;

  return (
    <>
      <p className={styles.nowLine} role="status">
        <strong>Now</strong> · age {Math.floor(age)} ·{' '}
        {current ? (
          <>luck pillar {currentIndex + 1} of {luck.pillars.length}, <span lang="zh">{current.stem.hanzi}{current.branch.hanzi}</span>{' '}
            {current.stem.pinyin} {current.branch.pinyin} ({current.tenGod.english}), ages {Math.floor(current.fromAge)}–{Math.floor(current.toAge)},
            about {Math.max(0, Math.ceil(current.toAge - age))} years left</>
        ) : age < first.fromAge ? (
          <>before the first luck pillar, which begins at age {luck.startAge.years}
            {luck.startAge.months ? ` y ${luck.startAge.months} m` : ''} (about {first.fromYear})</>
        ) : <>past the last luck pillar shown</>}
        {thisYear && <> · this year <span lang="zh">{thisYear.stem.hanzi}{thisYear.branch.hanzi}</span> {thisYear.stem.pinyin} {thisYear.branch.pinyin} ({thisYear.tenGod.english})</>}
      </p>
      <ol className={styles.luck} aria-label="Luck pillars">
        {luck.pillars.map((l, i) => {
          const phase = phaseOf(l.fromAge, l.toAge, age);
          const progress = phase === 'current' ? Math.min(100, Math.max(0, ((age - l.fromAge) / (l.toAge - l.fromAge)) * 100)) : 0;
          return (
            <li key={l.fromAge} className={PHASE_CLASS[phase]} data-phase={phase} aria-current={phase === 'current' ? 'true' : undefined}>
              <span className={styles.luckAge}>{Math.floor(l.fromAge)}–{Math.floor(l.toAge)}</span>
              <span className={`${styles.luckChars} ${ELEMENT_CLASS[l.stem.element] ?? ''}`} lang="zh">{l.stem.hanzi}{l.branch.hanzi}</span>
              <span className={styles.pinyin}>{l.stem.pinyin} {l.branch.pinyin}</span>
              <small>{l.tenGod.english}</small>
              <small className={styles.luckYear}>from about {l.fromYear}</small>
              <small className={styles.phaseLabel}>{phase === 'current' ? 'now' : phase === 'past' ? 'lived' : i === nextIndex ? 'next' : 'to come'}</small>
              {phase === 'current' && <span className={styles.progress} aria-hidden="true"><span style={{ width: `${progress}%` }} /></span>}
            </li>
          );
        })}
      </ol>
      <h5 className={styles.subtitle}>
        Years of luck pillar {focus + 1} · <span lang="zh">{focused.stem.hanzi}{focused.branch.hanzi}</span> (annual pillars)
      </h5>
      <ol className={styles.annual} aria-label="Annual pillars">
        {years.map((a) => {
          const phase: Phase = a.year < fp.now.solarYear ? 'past' : a.year === fp.now.solarYear ? 'current' : 'future';
          return (
            <li key={a.year} className={PHASE_CLASS[phase]} data-phase={phase} aria-current={phase === 'current' ? 'true' : undefined}>
              <span className={styles.luckAge}>{a.year}</span>
              <span className={`${styles.annualChars} ${ELEMENT_CLASS[a.stem.element] ?? ''}`} lang="zh">{a.stem.hanzi}{a.branch.hanzi}</span>
              <small>{a.branch.animal}</small>
              <small>{a.tenGod.english}</small>
            </li>
          );
        })}
      </ol>
      <p className={styles.note}>Each year&rsquo;s pillar begins at Lichun, in early February. Luck pillar years are approximate.</p>
    </>
  );
}

export type LuckDirectionChoice = 'forward' | 'backward' | null;

export default function ProFourPillars({ fp, direction, onDirection }: {
  fp: FourPillars; direction: LuckDirectionChoice; onDirection: (d: LuckDirectionChoice) => void;
}) {
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
      <div className={direction ? styles.directionBox : `${styles.directionBox} ${styles.directionAsk}`}>
        <p className={styles.note}>
          {direction ? '' : 'Choose a direction to map the luck pillars. '}Tradition counts forward for a man
          born in a yang year or a woman born in a yin year, and backward otherwise. This chart&rsquo;s year
          is <strong>{polarity(fp.yearPolarity).toLowerCase()}</strong>.
        </p>
        <div className={styles.direction} role="radiogroup" aria-label="Luck pillar direction">
          {(['forward', 'backward'] as const).map((d) => (
            <label key={d} className={direction === d ? styles.directionOn : undefined}>
              <input type="radio" name="luck-direction" checked={direction === d} onChange={() => onDirection(d)} />
              {d === 'forward' ? 'Forward' : 'Backward'}
              <small>
                {' '}from age {fp.luck[d].startAge.years}
                {fp.luck[d].startAge.months ? ` y ${fp.luck[d].startAge.months} m` : ''}
              </small>
            </label>
          ))}
        </div>
      </div>
      {luck && <LuckTimeline luck={luck} fp={fp} />}
      <p className={styles.note}>Method: {fp.method}</p>
    </section>
  );
}
