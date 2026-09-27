'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import type { CapsuleDTO, Element } from '@/lib/capsules/types';
import styles from '@/app/reflections/reflections-room.module.css';

type FilterTab = 'all' | 'pinned' | 'drafts' | 'archived';

const ELEMENT_TONES: Record<Element, string> = {
  fire: '#d58a28',
  water: '#6f94bd',
  earth: '#9eae6e',
  air: '#c9b995',
  aether: '#9d7fb0',
};

function dateFor(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: new Date(iso).getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  });
}

function sourceLabel(source: CapsuleDTO['sourceType']) {
  if (source === 'chat') return 'Conversation';
  if (source === 'voice') return 'Voice';
  if (source === 'journal') return 'Journal';
  if (source === 'transcript') return 'Transcript';
  if (source === 'astrology') return 'Astrology';
  return 'Note';
}

function ReflectionMark({ element }: { element?: Element }) {
  const tone = element ? ELEMENT_TONES[element] : '#d2b078';
  return (
    <span
      className={styles.reflectionMark}
      data-element={element ?? 'kept'}
      style={{ '--gem-tone': tone } as React.CSSProperties}
      aria-hidden="true"
    />
  );
}

interface ReflectionGemProps {
  capsule: CapsuleDTO;
  index: number;
  onOpen: (id: string) => void;
  onPin: (id: string, pinned: boolean) => void;
  onArchive: (id: string) => void;
}

function ReflectionGem({ capsule, index, onOpen, onPin, onArchive }: ReflectionGemProps) {
  const element = capsule.signals?.element;
  const tone = element ? ELEMENT_TONES[element] : '#d2b078';
  const gold = capsule.goldLines[0];

  return (
    <motion.article
      className={styles.gem}
      data-pinned={capsule.pinned ? 'true' : undefined}
      data-draft={capsule.draft ? 'true' : undefined}
      style={{ '--gem-tone': tone } as React.CSSProperties}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.2), duration: 0.35 }}
    >
      <button
        type="button"
        className={styles.gemOpen}
        onClick={() => onOpen(capsule.id)}
        aria-label={`Open reflection: ${capsule.title}`}
      >
        <div className={styles.gemTopline}>
          <ReflectionMark element={element} />
          <div className={styles.gemProvenance}>
            <span>{sourceLabel(capsule.sourceType)}</span>
            <i aria-hidden="true">·</i>
            <time dateTime={capsule.createdAt}>{dateFor(capsule.createdAt)}</time>
          </div>
          {capsule.draft ? <span className={styles.draftMark}>Unfinished</span> : null}
        </div>

        <h2>{capsule.title}</h2>
        <p className={styles.gemSummary}>{capsule.summary}</p>

        {gold ? (
          <blockquote className={styles.goldLine}>
            <p>“{gold.text}”</p>
            {gold.speaker ? <cite>— {gold.speaker === 'maia' ? 'MAIA' : 'You'}</cite> : null}
          </blockquote>
        ) : null}

        <div className={styles.gemReturn}>
          <span>Return to this reflection</span>
          <b aria-hidden="true">→</b>
        </div>
      </button>

      <div className={styles.gemActions} aria-label="Reflection actions">
        <button
          type="button"
          onClick={() => onPin(capsule.id, !capsule.pinned)}
          aria-pressed={capsule.pinned}
        >
          {capsule.pinned ? 'Kept close' : 'Keep close'}
        </button>
        <span aria-hidden="true">·</span>
        <button type="button" onClick={() => onArchive(capsule.id)}>
          Archive
        </button>
      </div>
    </motion.article>
  );
}

export default function ReflectionsFeed() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [capsules, setCapsules] = useState<CapsuleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const fetchCapsules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);

      switch (activeFilter) {
        case 'pinned':
          params.set('pinned', 'true');
          params.set('archived', 'false');
          break;
        case 'drafts':
          params.set('draft', 'true');
          params.set('archived', 'false');
          break;
        case 'archived':
          params.set('archived', 'true');
          break;
        default:
          params.set('archived', 'false');
      }

      const response = await fetch(`/api/capsules?${params.toString()}`);
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/signin');
          return;
        }
        throw new Error('Reflections could not be opened just now');
      }

      const data = await response.json();
      setCapsules(data.capsules || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reflections could not be opened just now');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeFilter, router]);

  useEffect(() => {
    void fetchCapsules();
  }, [fetchCapsules]);

  const handlePin = async (id: string, pinned: boolean) => {
    try {
      await fetch(`/api/capsules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned }),
      });
      void fetchCapsules();
    } catch (err) {
      console.error('Failed to pin capsule:', err);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await fetch(`/api/capsules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: true }),
      });
      void fetchCapsules();
    } catch (err) {
      console.error('Failed to archive capsule:', err);
    }
  };

  const filters: Array<{ key: FilterTab; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'pinned', label: 'Kept close' },
    { key: 'drafts', label: 'Unfinished' },
    { key: 'archived', label: 'Archive' },
  ];

  const fromHouse = searchParams?.get('from') === 'house';

  return (
    <section className={styles.reflections}>
      <header className={styles.roomIntro}>
        <div className={styles.introTitle}>
          <span className={styles.roomSigil} aria-hidden="true" />
          <p>REFLECTIONS</p>
          <h1>What mattered,<br /><em>kept.</em></h1>
        </div>
        <div className={styles.introText}>
          <p>
            Not a record of everything. A place for the moments, recognitions and
            words you chose not to lose.
          </p>
          <span>{fromHouse ? 'A room within your House.' : 'Your kept reflections live here.'}</span>
        </div>
      </header>

      <div className={styles.tools}>
        <label className={styles.search}>
          <span>FIND AMONG WHAT YOU’VE KEPT</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="A word, a title, a remembered phrase…"
          />
        </label>

        <nav className={styles.filters} aria-label="Reflection views">
          <span>VIEW</span>
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              aria-current={activeFilter === filter.key ? 'page' : undefined}
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label}
            </button>
          ))}
        </nav>
      </div>

      <div className={styles.collectionMeta}>
        <span>{loading ? 'Gathering what you kept…' : `${capsules.length} ${capsules.length === 1 ? 'reflection' : 'reflections'} here`}</span>
        <i aria-hidden="true" />
      </div>

      {loading ? (
        <div className={styles.loading} aria-label="Loading reflections">
          <span />
          <p>Gathering what you kept…</p>
        </div>
      ) : error ? (
        <div className={styles.empty}>
          <p>{error}</p>
          <button type="button" onClick={() => void fetchCapsules()}>Try again</button>
        </div>
      ) : capsules.length === 0 ? (
        <motion.div
          className={styles.empty}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className={styles.emptyMark} aria-hidden="true" />
          <h2>Nothing has been kept here yet.</h2>
          <p>
            When something matters enough to keep — a phrase, a recognition,
            a turning point — it can return here.
          </p>
          <button type="button" onClick={() => router.push('/maia')}>Meet MAIA →</button>
        </motion.div>
      ) : (
        <div className={styles.gemField} aria-label="Kept reflections">
          {capsules.map((capsule, index) => (
            <ReflectionGem
              key={capsule.id}
              capsule={capsule}
              index={index}
              onOpen={(id) => router.push(`/reflections/${id}`)}
              onPin={handlePin}
              onArchive={handleArchive}
            />
          ))}
        </div>
      )}

      <footer className={styles.roomFoot}>
        <span>What you keep can change how you return.</span>
        <button type="button" onClick={() => router.push('/maia')}>Meet MAIA →</button>
      </footer>
    </section>
  );
}
