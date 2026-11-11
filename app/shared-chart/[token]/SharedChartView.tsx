'use client';

/**
 * View-only chart for a client (ASTRO-PRO-CHART-SHARE-01). The client may
 * tap a planet, turn aspects and house lines on or off, and follow transits;
 * nothing changes and nothing is saved. The Elemental Alchemy overview shows
 * only where the astrologer chose to include it.
 */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { BirthChart } from '@/lib/astrology/proEphemerisCalculator';
import { chartBodies, selectedRelationships } from '@/lib/astrology/proChartGeometry';
import { CelestialChartWheel } from '@/app/astrology/pro-preview/CelestialChartWheel';
import ProAspectGrid from '@/app/astrology/pro-preview/ProAspectGrid';
import ProTransitPanel from '@/app/astrology/pro-preview/ProTransitPanel';
import ProElementalOverview from '@/app/astrology/pro-preview/ProElementalOverview';
import { SacredHouseWheel } from '@/components/astrology/SacredHouseWheel';
import type { TransitBody } from '@/lib/astrology/proTransits';
import SharedAskMaia from './SharedAskMaia';
import styles from './shared-chart.module.css';

function deg(value: number): string {
  const d = Math.floor(value);
  const m = Math.round((value - d) * 60);
  return `${d}°${String(m === 60 ? 59 : m).padStart(2, '0')}′`;
}

const MAJOR = new Set(['conjunction', 'sextile', 'square', 'trine', 'opposition']);

export default function SharedChartView({ chart, token, label, includeElemental, askMaia, birth }: {
  chart: BirthChart;
  token: string;
  label: string;
  includeElemental: boolean;
  /** Present only where the astrologer turned Ask MAIA on for this link. */
  askMaia: { offeredBy: string | null } | null;
  birth: { date: string; time: string; place: string | null };
}) {
  const [focused, setFocused] = useState('Sun');
  const [showAspects, setShowAspects] = useState(true);
  const [showHouseLines, setShowHouseLines] = useState(true);
  const [transits, setTransits] = useState<TransitBody[]>([]);
  const skyUrl = (at: string) => `/api/shared-chart/${encodeURIComponent(token)}/sky?at=${encodeURIComponent(at)}`;
  const bodies = useMemo(() => chartBodies(chart), [chart]);
  const body = bodies.find((b) => b.name === focused);
  const relationships = useMemo(() => selectedRelationships(chart, focused), [chart, focused]);

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <span className={styles.eyebrow}>A CHART SHARED WITH YOU</span>
        <h1>{label}</h1>
        <p>{birth.date} · {birth.time}{birth.place ? ` · ${birth.place}` : ''}</p>
      </header>

      <nav className={styles.sectionNav} aria-label="Explore this chart">
        <a href="#chart">Chart</a>
        <a href="#transits">Transits</a>
        <a href="#positions">Positions</a>
        <a href="#aspects">Aspects</a>
        {includeElemental && <a href="#elements">Elements</a>}
        {askMaia && <a href="#ask-maia">Ask MAIA</a>}
      </nav>

      <section id="chart" className={styles.sectionBlock} aria-labelledby="chart-title">
        <div className={styles.sectionIntro}>
          <span className={styles.eyebrow}>CHART</span>
          <h2 id="chart-title">Your natal chart</h2>
          <p>The wheel shows where each planet was when you were born. Tap a planet to see its position and strongest relationships.</p>
        </div>
        <div className={styles.instrument}>
          <div className={styles.wheel}>
            <div className={styles.toggles}>
              <button aria-pressed={showAspects} onClick={() => setShowAspects((v) => !v)}>Aspects</button>
              <button aria-pressed={showHouseLines} onClick={() => setShowHouseLines((v) => !v)}>Houses</button>
            </div>
            <CelestialChartWheel chart={chart} focusedBody={focused} onFocusBody={setFocused}
              showAspects={showAspects} showHouseLines={showHouseLines} maxAspectOrb={null}
              outerBodies={transits.length ? transits : undefined} outerLabel="Transits" />
          </div>
          <aside className={styles.side} aria-live="polite">
            {body && (
              <>
                <h2>{body.glyph} {body.name}</h2>
                <p className={styles.position}>{body.position.sign} {deg(body.position.degree)} · House {body.position.house}{body.position.retrograde ? ' · retrograde' : ''}</p>
                <h3>Aspects</h3>
                {relationships.length === 0 ? <p className={styles.note}>None within the orbs used.</p> : (
                  <ul>
                    {relationships.map((a) => (
                      <li key={`${a.planet1}-${a.type}-${a.planet2}`}>
                        <span>{a.planet1} {a.type} {a.planet2}</span><span>{a.orb.toFixed(2)}°</span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </aside>
        </div>
      </section>

      {askMaia && (
        <SharedAskMaia token={token} firstName={label.trim().split(/\s+/)[0] || 'there'} offeredBy={askMaia.offeredBy} />
      )}

      <section id="transits" className={styles.sectionBlock} aria-labelledby="transits-title">
        <div className={styles.sectionIntro}>
          <span className={styles.eyebrow}>THE SKY NOW</span>
          <h2 id="transits-title">Current transits</h2>
          <p>Follow the moving sky against your birth chart, one date at a time.</p>
        </div>
        <ProTransitPanel natalBodies={bodies} transits={transits} skyUrl={skyUrl}
          onTransits={(next) => setTransits(next)} />
      </section>

      <section id="positions" className={styles.sectionBlock} aria-labelledby="positions-title">
        <div className={styles.sectionIntro}>
          <span className={styles.eyebrow}>POSITIONS</span>
          <h2 id="positions-title">Where everything sits</h2>
          <p>The sign describes a planet&rsquo;s style; the house shows the area of life where it is expressed.</p>
        </div>
        <div className={styles.tableScroll}>
          <table>
            <tbody>
              {bodies.map((b) => (
                <tr key={b.name} aria-selected={b.name === focused}>
                  <th scope="row"><button onClick={() => setFocused(b.name)}>{b.glyph} {b.name}</button></th>
                  <td>{b.position.sign} {deg(b.position.degree)}</td>
                  <td>House {b.position.house}</td>
                </tr>
              ))}
              <tr><th scope="row">AC Ascendant</th><td>{chart.ascendant.sign} {deg(chart.ascendant.degree)}</td><td /></tr>
              <tr><th scope="row">MC Midheaven</th><td>{chart.midheaven.sign} {deg(chart.midheaven.degree)}</td><td /></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="aspects" className={styles.sectionBlock} aria-labelledby="aspects-title">
        <div className={styles.sectionIntro}>
          <span className={styles.eyebrow}>ASPECTS</span>
          <h2 id="aspects-title">How the planets relate</h2>
          <p>The grid shows the major angular relationships that organize the chart.</p>
        </div>
        <div className={styles.aspectPanel}>
          <ProAspectGrid chart={chart} declinations={null} onSelectBody={setFocused} showDeclinations={false} />
        </div>
      </section>

      {includeElemental && (
        <section id="elements" className={styles.sectionBlock} aria-labelledby="elements-title">
          <div className={styles.sectionIntro}>
            <span className={styles.eyebrow}>ELEMENTAL ALCHEMY</span>
            <h2 id="elements-title">The elements in your chart</h2>
            <p>Fire, Water, Earth and Air offer another way to notice the chart&rsquo;s balance and movement.</p>
          </div>
          <ProElementalOverview chart={chart} />
          <div className={styles.elementalWheel}>
            <h3>The chart on the Spiralogic wheel</h3>
            <p>The same planets, with the houses arranged by element: Fire, Water, Earth and Air.</p>
            <SacredHouseWheel
              planets={bodies.map((b) => ({ name: b.name, sign: b.position.sign, house: b.position.house, degree: b.position.degree }))}
              aspects={(chart.aspects || []).filter((a) => MAJOR.has(a.type)) as never}
              missionLayerSettings={{ showEmerging: false, showActive: false, showCompleted: false, showUrgent: false, showArchetypal: false, showTransits: false }}
              isDayMode={false}
              layoutMode="spiralogic"
              showAspects
              className="max-h-[560px]"
            />
          </div>
        </section>
      )}

      <footer className={styles.colophon}>
        <p>A calculated chart, not a reading: positions, aspects and transits, porphyry houses{includeElemental ? ', with the Elemental Alchemy overview your astrologer chose to include' : ''}. It was shared with you privately and can be turned off by the person who shared it.</p>
        <p>Calculated in <Link href="/">Soullab</Link>.</p>
      </footer>
    </main>
  );
}
