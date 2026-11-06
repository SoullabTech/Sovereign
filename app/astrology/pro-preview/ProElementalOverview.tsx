'use client';

/**
 * Elemental Alchemy overview (founder request 2026-11-05): the chart's
 * elemental balance by sign, and its planets along Spiralogic's four elemental
 * pathways by house. Counts and the canonical Spiralogic house words only.
 */
import { useMemo } from 'react';
import type { BirthChart } from '@/lib/astrology/proEphemerisCalculator';
import { ELEMENT_ORDER, elementalOverview, type Element } from '@/lib/astrology/proElementalOverview';
import styles from './pro-elemental-overview.module.css';

const ELEMENT_LABEL: Record<Element, { name: string; gist: string }> = {
  fire: { name: 'Fire', gist: 'vision, activation and will' },
  water: { name: 'Water', gist: 'emotional depth, healing and flow' },
  earth: { name: 'Earth', gist: 'grounding, form and service' },
  air: { name: 'Air', gist: 'relationship, mind and community' },
};

export default function ProElementalOverview({ chart }: { chart: BirthChart }) {
  const overview = useMemo(() => elementalOverview(chart), [chart]);
  const total = ELEMENT_ORDER.reduce((n, e) => n + overview.elements[e].length, 0) || 1;

  return (
    <section className={styles.panel} aria-labelledby="elemental-overview-title" data-elemental-overview>
      <span className={styles.eyebrow}>ELEMENTAL ALCHEMY</span>
      <h2 id="elemental-overview-title">The elements in this chart</h2>
      <p className={styles.lead}>
        Where the planets gather, read through Spiralogic&rsquo;s four elements. Patterns to work with, not a verdict.
      </p>

      <div className={styles.balance} aria-label="Elemental balance by sign">
        {ELEMENT_ORDER.map((element) => {
          const names = overview.elements[element];
          return (
            <div key={element} className={styles[element]}>
              <div className={styles.balanceHead}>
                <b>{ELEMENT_LABEL[element].name}</b>
                <span>{names.length}</span>
              </div>
              <div className={styles.bar} aria-hidden="true"><i style={{ width: `${(names.length / total) * 100}%` }} /></div>
              <small>{names.length ? names.join(', ') : 'None'}</small>
            </div>
          );
        })}
      </div>
      <p className={styles.modes}>
        Cardinal {overview.modalities.cardinal.length} · Fixed {overview.modalities.fixed.length} · Mutable {overview.modalities.mutable.length}
        <span> — by sign, counting the ten planets and the Ascendant.</span>
      </p>

      <h3>The four pathways</h3>
      <p className={styles.lead}>Each element moves through three houses: Vector, Circle, Spiral.</p>
      <div className={styles.pathways}>
        {ELEMENT_ORDER.map((element) => (
          <div key={element} className={`${styles.pathway} ${styles[element]}`}>
            <h4>{ELEMENT_LABEL[element].name} <span>{ELEMENT_LABEL[element].gist}</span></h4>
            <ol>
              {overview.pathways[element].map((station) => (
                <li key={station.house} data-occupied={station.bodies.length > 0 || undefined}>
                  <div className={styles.stationHead}>
                    <b>House {station.house} · {station.phaseLabel}</b>
                    <span>{station.bodies.map((b) => b.glyph).join(' ')}</span>
                  </div>
                  <div>{station.facet}</div>
                  <small>{station.lesson}</small>
                  {station.bodies.length > 0 && <small className={styles.who}>{station.bodies.map((b) => b.name).join(', ')}</small>}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
