'use client';

/** LISTEN-01 · Listening Room — "Listen to someone".
 *
 * Soullab Picks: performers a named human signer has approved, each credited and linked to where
 * they share their work. Soullab hosts no audio or video. With no approved entry the shelf shows
 * the honest "In preparation" state and nothing else — no link, no player, no performer's name.
 * No counts, rankings or "popular" signals exist here, and no listening activity is kept.
 */
import { useEffect, useMemo, useState } from 'react';
import { PERFORMER_CATALOG } from '@/lib/listening/performerCatalogData';
import { visiblePerformers } from '@/lib/listening/performerCatalog';
import type { LinkKind, PerformerEntry } from '@/lib/listening/performerCatalog';
import { isNativeApp } from '@/lib/listening/performerEmbedLoaders';
import PerformerEmbed from './PerformerEmbed';
import styles from './PerformerShelf.module.css';

const KIND_LABEL: Record<LinkKind, string> = {
  youtube: 'YouTube', spotify: 'Spotify', tidal: 'Tidal', 'apple-music': 'Apple Music',
  bandcamp: 'Bandcamp', soundcloud: 'SoundCloud', site: 'Their own site',
};

interface Source { catalog?: ReadonlyArray<unknown>; now?: Date }

function usePerformers({ catalog, now }: Source): PerformerEntry[] {
  return useMemo(() => visiblePerformers(catalog ?? PERFORMER_CATALOG, now ?? new Date()).visible, [catalog, now]);
}

const IN_PREPARATION_LINE =
  'A shelf for the people behind the sound — each one credited, each linked to where they share their work.';

/** The row on the Now view. Non-interactive while there is nothing approved to show. */
export function PerformerNowEntry({ onOpen, ...source }: Source & { onOpen: () => void }) {
  const performers = usePerformers(source);
  if (performers.length === 0) {
    return (
      <div className={styles.inPrep} data-performer-teaser="in-preparation" role="group" aria-label="Listen to someone, in preparation">
        <h3>Listen to someone</h3>
        <strong>In preparation</strong>
        <p>{IN_PREPARATION_LINE}</p>
      </div>
    );
  }
  return (
    <button type="button" className={styles.openRow} data-performer-open="true" onClick={onOpen}>
      <strong>Listen to someone</strong>
      <span>The people behind the sound</span>
    </button>
  );
}

function Card({ entry, native }: { entry: PerformerEntry; native: boolean }) {
  return (
    <article className={styles.card} data-performer-card={entry.id}>
      <h3 className={styles.name}>{entry.name}</h3>
      <p className={styles.words}>{entry.ownWords}</p>
      {entry.tierTwo && (
        <figure className={styles.own}>
          <figcaption>In their own words</figcaption>
          <blockquote>{entry.tierTwo.ownIntroduction}</blockquote>
        </figure>
      )}
      {entry.embed && !native && <PerformerEmbed entry={entry} />}
      <div className={styles.links}>
        <h4>Where to find more of their work</h4>
        <ul>
          {entry.links.map(link => (
            <li key={`${link.kind}:${link.url}`}>
              <a href={link.url} target="_blank" rel="noopener noreferrer">{KIND_LABEL[link.kind]}</a>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default function PerformerShelf(source: Source) {
  const performers = usePerformers(source);
  const [native, setNative] = useState(false);
  useEffect(() => { setNative(isNativeApp()); }, []);
  return (
    <section className={styles.section} aria-labelledby="people-title" data-performer-shelf="true">
      <header>
        <span className={styles.eyebrow}>{performers.length === 0 ? 'IN PREPARATION' : 'WHAT WE’RE LISTENING TO'}</span>
        <h2 id="people-title" className={styles.title}>Listen to someone</h2>
        <p className={styles.lede}>{IN_PREPARATION_LINE}</p>
      </header>
      {performers.length > 0 && (
        <div className={styles.cards}>
          {performers.map(entry => <Card key={entry.id} entry={entry} native={native} />)}
        </div>
      )}
    </section>
  );
}
