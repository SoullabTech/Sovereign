'use client';

/**
 * ASTRO-PRO-REPORTS-01 — natal report labelled as tradition (founder ruling
 * 2026-11-04). Assembled from fixed traditional text in
 * lib/astrology/proTraditionText.ts; no model writes any of it. Each section
 * ends with the reflective question Pro already uses, so the reader's own
 * meaning stays first.
 */
import { useMemo, useState } from 'react';
import type { BirthChart } from '@/lib/astrology/proEphemerisCalculator';
import { chartBodies } from '@/lib/astrology/proChartGeometry';
import {
  TRADITION_NOTICE, angleReading, aspectReading, ordinal, placementReading,
} from '@/lib/astrology/proTraditionText';
import styles from './pro-tradition-report.module.css';

export default function ProTraditionReport({
  chart, chartLabel, questions,
}: {
  chart: BirthChart;
  chartLabel: string;
  questions: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const bodies = useMemo(() => chartBodies(chart), [chart]);
  const aspects = useMemo(
    () => (chart.aspects || []).filter((a) => Number.isFinite(a.orb) && a.orb <= 4 && a.type !== 'quincunx')
      .sort((a, b) => a.orb - b.orb).slice(0, 15),
    [chart],
  );

  return (
    <section className={styles.report} aria-labelledby="pro-report-title">
      <div className={styles.head}>
        <div>
          <span className={styles.eyebrow}>REPORT · LABELLED AS TRADITION</span>
          <h3 id="pro-report-title">Natal report: {chartLabel}</h3>
        </div>
        <div className={styles.actions}>
          <button onClick={() => setOpen((o) => !o)} aria-expanded={open}>{open ? 'Hide report' : 'Read report'}</button>
          {open && <button onClick={() => window.print()}>Print</button>}
        </div>
      </div>

      {open && (
        <article className={styles.body}>
          <p className={styles.notice}>{TRADITION_NOTICE}</p>

          <h4>The angles</h4>
          <p>{angleReading('Ascendant', chart.ascendant.sign)}</p>
          <p>{angleReading('Midheaven', chart.midheaven.sign)}</p>

          <h4>Placements</h4>
          {bodies.map((body) => (
            <div key={body.name} className={styles.entry}>
              <h5>{body.glyph} {body.name} in {body.position.sign}, {ordinal(body.position.house)} house
                {body.position.motionStatus === 'retrograde' ? ' · retrograde' : ''}</h5>
              {placementReading(body.name, body.position.sign, body.position.house).map((line) => <p key={line}>{line}</p>)}
              {body.position.motionStatus === 'retrograde' && (
                <p>Tradition reads a retrograde planet as turned inward or returning to its matters.</p>
              )}
              {questions[body.name] && <p className={styles.question}>For reflection: {questions[body.name]}</p>}
            </div>
          ))}

          <h4>Closest aspects</h4>
          {aspects.length === 0 ? <p>No major aspects within 4°.</p> : aspects.map((a) => {
            const text = aspectReading(a.planet1, a.planet2, a.type);
            return text ? <p key={`${a.planet1}-${a.planet2}`}>{text} <span className={styles.orb}>(orb {a.orb.toFixed(1)}°)</span></p> : null;
          })}

          <p className={styles.sources}>
            Sources: classical significations, dignities and house topics from the Hellenistic and medieval tradition;
            Uranus, Neptune, Pluto and Chiron from common modern usage. Positions from the Pro calculator.
          </p>
        </article>
      )}
    </section>
  );
}
