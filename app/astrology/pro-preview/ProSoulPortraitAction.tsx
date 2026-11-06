'use client';

/**
 * Begin a Soul Portrait from a Pro chart (founder ruling 2026-11-05).
 *
 * Saved charts promise they are not shared with MAIA, and writing a portrait
 * means MAIA reads the chart — so this asks first, every time. Continuing opens
 * the portrait writer with the chart named by id only; the server reads the
 * birth details and draws the chart with the Pro calculator.
 */
import { useState } from 'react';
import Link from 'next/link';
import styles from './pro-saved-charts.module.css';

export function soulPortraitHref(source: 'mine' | string): string {
  return `/soul-portrait/generate?proChart=${encodeURIComponent(source)}`;
}

export default function ProSoulPortraitAction({ source, whose }: { source: 'mine' | string; whose: string }) {
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return <button type="button" onClick={() => setAsking(true)}>Soul Portrait</button>;
  }
  return (
    <span className={styles.portraitConfirm} role="group" aria-label="Make a Soul Portrait">
      <span>MAIA will read {whose} chart to write a private draft. Nothing is sent until you send it.</span>
      <Link href={soulPortraitHref(source)} data-soul-portrait-continue>Continue</Link>
      <button type="button" onClick={() => setAsking(false)}>Cancel</button>
    </span>
  );
}
