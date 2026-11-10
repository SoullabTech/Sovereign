'use client';

/**
 * Spiralogic house wheel inside Pro — the same instrument the Free chart page
 * shows, fed from the chart already open in Pro. It is a reading layer over
 * the calculated placements: house meanings and element families come from the
 * Spiralogic map, not from the calculator, and nothing is sent anywhere.
 * Bodies are the ones the calculator plots (withheld bodies stay withheld).
 */
import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { usePanelState } from './panelMemory';
import type { BirthChart } from '@/lib/astrology/proEphemerisCalculator';
import { wheelPlanets, wheelAspects } from '@/lib/astrology/proHouseWheel';
import styles from './pro-transit-panel.module.css';

// The wheel is large and animated; load it only when this panel is on screen.
const SacredHouseWheel = dynamic(
  () => import('@/components/astrology/SacredHouseWheel').then((m) => m.SacredHouseWheel),
  { ssr: false, loading: () => <p className={styles.note}>Loading the house wheel…</p> },
);

export default function ProHouseWheel({ chart }: { chart: BirthChart }) {
  const [layout, setLayout] = usePanelState<'traditional' | 'spiralogic'>('housewheel.layout', 'traditional');
  const planets = useMemo(() => wheelPlanets(chart), [chart]);
  const aspects = useMemo(() => wheelAspects(chart), [chart]);

  return (
    <div className={styles.panel} aria-labelledby="pro-housewheel-title">
      <div className={styles.controls}>
        <h3 id="pro-housewheel-title">Spiralogic house wheel</h3>
        <button aria-pressed={layout === 'traditional'} onClick={() => setLayout('traditional')}>Traditional order</button>
        <button aria-pressed={layout === 'spiralogic'} onClick={() => setLayout('spiralogic')}>Spiralogic order</button>
      </div>
      <SacredHouseWheel planets={planets} aspects={aspects} isDayMode={false} layoutMode={layout} showAspects />
      <p className={styles.note}>
        Placements and aspects are the calculated ones above. House meanings and element families are the Spiralogic map, a way of reading the chart, not a calculation.
      </p>
    </div>
  );
}
