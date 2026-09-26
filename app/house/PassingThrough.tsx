'use client';

import { useState } from 'react';
import type { PassingQuote } from './passingContext';
import styles from './passing-through.module.css';

/** One still item per arrival. Hiding is visit-local; no tracking or account preference writes. */
export function PassingThrough({ initialQuote }: { initialQuote: PassingQuote | null }) {
  const [quote] = useState(initialQuote);
  const [hidden, setHidden] = useState(false);
  if (!quote) return null;
  if (hidden) return (
    <section className={styles.slot} aria-label="Passing through">
      <button type="button" className={styles.quietControl} onClick={() => setHidden(false)}>
        Show Passing through
      </button>
    </section>
  );
  return (
    <section className={styles.slot} aria-label="Passing through" data-source-id={quote.id}>
      <h2 className={styles.marker}>Passing through</h2>
      <p className={styles.kind}>Words to sit with</p>
      <blockquote className={styles.quotation} cite={quote.sourceUrl}>{quote.text}</blockquote>
      <cite className={styles.attribution}>
        <a href={quote.sourceUrl} target="_blank" rel="noopener noreferrer"
          aria-label={`Read source: ${quote.author}, ${quote.work}, ${quote.locator}`}>
          <span>{quote.author}</span>
          <span>{quote.work} · {quote.locator} ↗</span>
        </a>
      </cite>
      <div className={styles.controls}>
        <span>From a shared reading shelf</span>
        <button type="button" className={styles.quietControl} onClick={() => setHidden(true)}>
          Hide for this visit
        </button>
      </div>
    </section>
  );
}
