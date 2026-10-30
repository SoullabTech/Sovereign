'use client';

/**
 * FG07 — first working Research instrument for the member's own chart.
 * Parent must pass ONLY a visible, re-verified private chart. When that
 * verification fails or tab blurs, this panel receives null and hides facts.
 */
import { useMemo, useState } from 'react';
import type { BirthChart } from '@/lib/astrology/proEphemerisCalculator';
import { createProResearchSnapshot, researchAspectsWithinOrb } from '@/lib/astrology/proResearchSnapshot';
import styles from './pro-research-workbench.module.css';

type OrbSetting = 'all' | '1' | '3' | '5' | '8';

export default function ProResearchWorkbench({ chart }: { chart: BirthChart | null }) {
  const [orbSetting, setOrbSetting] = useState<OrbSetting>('all');
  const snapshot = useMemo(() => chart ? createProResearchSnapshot(chart) : null, [chart]);
  const orb = orbSetting === 'all' ? null : Number(orbSetting);
  const aspects = useMemo(() => researchAspectsWithinOrb(snapshot, orb), [snapshot, orb]);

  return (
    <section id="research" className={styles.workbench} aria-labelledby="pro-research-title">
      <div className={styles.heading}>
        <span className={styles.eyebrow}>RESEARCH WORKBENCH · PRIVATE</span>
        <h3 id="pro-research-title">Chart evidence table</h3>
        <p>Inspect exact calculated positions, geometrical houses and reported aspects
          without imposing a single meaning on the chart.</p>
      </div>
      {!snapshot ? (
        <p className={styles.privatePrompt} role="status">
          Open and verify your own natal chart to examine its research data. No chart is retained here when your private view closes.
        </p>
      ) : (
        <div className={styles.privateFacts}>
          <p className={styles.disclosure} role="note">
            This is the current authorized private chart only. House placement may follow a
            separate 5° pre-angular-cusp convention; geometric house membership is shown alongside it.
            Astronomical accuracy is not yet independently certified.
          </p>
          <div className={styles.tableScroll}>
            <table className={styles.table} aria-label="Calculated planetary positions and house comparison">
              <caption>Calculated positions, in ecliptic longitude order</caption>
              <thead>
                <tr><th scope="col">Point</th><th scope="col">Zodiac</th>
                  <th scope="col">Longitude</th><th scope="col">Chart house</th>
                  <th scope="col">Geometric house</th><th scope="col">Motion</th></tr>
              </thead>
              <tbody>
                {snapshot.positions.map(point => (
                  <tr key={point.name}>
                    <th scope="row"><span aria-hidden="true">{point.glyph} </span>{point.name}</th>
                    <td>{point.zodiacSign} {point.zodiacDegree.toFixed(2)}°</td>
                    <td>{point.longitude.toFixed(2)}°</td>
                    <td>{point.calculatedHouse}</td>
                    <td>{point.geometricHouse ?? 'Unverified'}
                      {point.cuspConventionDiffers ? <span className={styles.difference}> (convention differs)</span> : null}
                    </td>
                    <td>{point.motion === 'stationary-uncertain' ? 'Station uncertain' :
                      point.motion === 'not-evaluated' ? 'Not evaluated' : point.motion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.disclosure}>
            {snapshot.countWithHouseConventionDifference} placements differ between reported and geometric house conventions.
            {' '}{snapshot.motionUncertainCount} apparent-motion results are uncertain or not evaluated.
          </p>
          <div className={styles.aspectHeading}>
            <h4>Calculator-reported aspects</h4>
            <label htmlFor="research-max-orb">
              Maximum displayed orb
              <select id="research-max-orb" value={orbSetting}
                onChange={event => {
                  const next = event.target.value;
                  if (next === 'all' || next === '1' || next === '3' || next === '5' || next === '8')
                    setOrbSetting(next);
                }}>
                <option value="all">All reported</option>
                <option value="1">1°</option>
                <option value="3">3°</option>
                <option value="5">5°</option>
                <option value="8">8°</option>
              </select>
            </label>
          </div>
          {aspects.length ? (
            <div className={styles.tableScroll}>
              <table className={styles.table} aria-label="Reported aspects">
                <thead><tr><th scope="col">Point A</th><th scope="col">Aspect</th>
                  <th scope="col">Point B</th><th scope="col">Orb</th><th scope="col">Engine exact</th></tr></thead>
                <tbody>{aspects.map((a, i) => (
                  <tr key={a.planet1 + ':' + a.type + ':' + a.planet2 + ':' + i}>
                    <td>{a.planet1}</td><td>{a.type}</td><td>{a.planet2}</td>
                    <td>{a.orb.toFixed(2)}°</td><td>{a.exact ? 'Yes' : 'No'}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : (
            <p className={styles.disclosure} role="status">
              No calculator-reported aspects meet this display filter.
            </p>
          )}
          <p className={styles.disclosure}>
            Orb filtering changes only the display. It does not calculate additional aspects,
            certify applying/separating phase, share data, save notes or send chart material to MAIA.
          </p>
        </div>
      )}
    </section>
  );
}
