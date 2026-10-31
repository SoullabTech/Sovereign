'use client';

import { useMemo } from 'react';
import type { BirthChart } from '@/lib/astrology/proEphemerisCalculator';
import { createProRelationshipLens } from '@/lib/astrology/proRelationshipLens';
import styles from './pro-relationships-workbench.module.css';

/** In-memory, own-chart inquiry. No other-person chart inputs or persistence. */
export default function ProRelationshipsWorkbench({ chart }: { chart: BirthChart | null }) {
  const lens = useMemo(() => chart ? createProRelationshipLens(chart) : null, [chart]);
  return (
    <section id="relationships" className={styles.workbench} aria-labelledby="pro-relationships-title">
      <div className={styles.heading}>
        <span className={styles.eyebrow}>RELATIONSHIPS · OWN-CHART INQUIRY · PRIVATE</span>
        <h3 id="pro-relationships-title">Questions for relational awareness</h3>
        <p>Use positions and reported aspects as prompts for reflection, not a reading of someone else’s inner life.</p>
      </div>
      {!lens ? (
        <p role="status" className={styles.privatePrompt}>
          Open and verify your own chart to explore this instrument. It shows no private facts when the chart is closed or re-verification is pending.
        </p>
      ) : (
        <div className={styles.content}>
          <p className={styles.boundary} role="note">
            This room uses only your currently verified natal chart. No partner profile is entered, stored or compared.
            Two-person synastry awaits separate permission and consent review.
          </p>
          {lens.incompleteAnchorCount ? (
            <p role="status" className={styles.caution}>
              {lens.incompleteAnchorCount} anchor placements are missing from the calculation.
              Missing values are not inferred.
            </p>
          ) : null}
          <div className={styles.anchorGrid}>
            {lens.anchors.map(anchor => (
              <article key={anchor.name} className={styles.anchor}>
                <h4>{anchor.name}</h4>
                <p className={styles.position}>
                  {anchor.sign} {anchor.degree.toFixed(2)}° · chart house {anchor.reportedHouse}
                </p>
                <p className={styles.question}>{anchor.question}</p>
                {(anchor.motion === 'stationary-uncertain' || anchor.motion === 'not-evaluated') ? (
                  <p className={styles.caution}>
                    Apparent motion: {anchor.motion === 'stationary-uncertain' ? 'station uncertain' : 'not evaluated'}.
                  </p>
                ) : null}
              </article>
            ))}
          </div>
          <div className={styles.aspectPanel}>
            <h4>Reported aspects involving these anchors</h4>
            {lens.reportedAspects.length ? (
              <ul>
                {lens.reportedAspects.map((aspect, index) => (
                  <li key={aspect.planet1 + ':' + aspect.type + ':' + aspect.planet2 + ':' + index}>
                    {aspect.planet1} {aspect.type} {aspect.planet2} · orb {aspect.orb.toFixed(2)}°
                    {aspect.exact ? ' · engine exact' : ''}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No calculator-reported aspects qualify for this view.</p>
            )}
          </div>
          <p className={styles.disclaimer}>
            {lens.sourceNote} Neither these questions nor the aspects establish compatibility,
            predict outcomes, score relationships, or establish applying/separating phase.
            No chart data is transmitted to MAIA.
          </p>
        </div>
      )}
    </section>
  );
}
