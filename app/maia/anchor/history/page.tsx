'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { HouseRoomThreshold } from '@/components/house/HouseRoomThreshold';
import { cabinReturnPath, isCabinOrigin } from '@/lib/cabin/doorway';
import { apiFetch } from '@/lib/http/apiBase';
import styles from '../anchor-room.module.css';

type SurfacePreference =
  | 'member_pulled'
  | 'contextual_doorway'
  | 'ritual_review_opt_in';

interface Anchor {
  id: string;
  anchor_date: string;
  prompt_shown: string;
  response: string;
  surface_preference: SurfacePreference;
  created_at: string;
  updated_at: string;
}

function isAmbient(value: SurfacePreference): boolean {
  return value !== 'member_pulled';
}

function dateLabel(iso: string): string {
  if (!iso) return '';
  const parts = iso.split('-').map(Number);
  const dt = new Date(parts[0], parts[1] - 1, parts[2]);
  return dt.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function clockLabel(value: string): string {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function wasRevisited(anchor: Anchor): boolean {
  const created = new Date(anchor.created_at).getTime();
  const updated = new Date(anchor.updated_at).getTime();
  return Number.isFinite(created) && Number.isFinite(updated) && updated - created > 60000;
}

export default function AnchorHistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromCabin = isCabinOrigin(searchParams);
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiFetch('/api/anchor/recent?limit=30', { method: 'GET' });
        if (!res.ok) throw new Error('history');
        const data = await res.json();
        setAnchors(Array.isArray(data.anchors) ? data.anchors : []);
      } catch {
        setError('Earlier anchors could not be opened just now.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggle = useCallback(async (anchor: Anchor) => {
    if (savingId) return;
    const previous = anchor.surface_preference;
    const next: SurfacePreference = isAmbient(previous) ? 'member_pulled' : 'contextual_doorway';

    setSavingId(anchor.id);
    setRowError(null);
    setAnchors((list) =>
      list.map((item) => item.id === anchor.id ? { ...item, surface_preference: next } : item),
    );

    try {
      const res = await apiFetch('/api/anchor/' + anchor.id + '/surface-preference', {
        method: 'POST',
        body: JSON.stringify({ preference: next }),
      });
      if (!res.ok) throw new Error('preference');
      const data = await res.json().catch(() => null);
      const confirmed: SurfacePreference = data?.surface_preference ?? next;
      setAnchors((list) =>
        list.map((item) => item.id === anchor.id ? { ...item, surface_preference: confirmed } : item),
      );
    } catch {
      setAnchors((list) =>
        list.map((item) => item.id === anchor.id ? { ...item, surface_preference: previous } : item),
      );
      setRowError(anchor.id);
    } finally {
      setSavingId(null);
    }
  }, [savingId]);

  return (
    <main className={styles.page}>
      <HouseRoomThreshold room="DAILY ANCHOR" />

      <section className={styles.room}>
        <header className={styles.historyIntro}>
          <div>
            <p>EARLIER ANCHORS</p>
            <h1>A line through<br /><em>your days.</em></h1>
          </div>
          <div className={styles.historyOrientation}>
            <p>
              Not a streak and not a score. Just the threads you chose to stay connected to.
            </p>
            <button type="button" onClick={() => router.push(fromCabin ? '/maia/anchor?from=cabin' : '/maia/anchor?from=house')}>
              Today’s anchor →
            </button>
          </div>
        </header>

        {loading ? (
          <div className={styles.loading} aria-label="Opening earlier anchors"><span /></div>
        ) : error ? (
          <div className={styles.unavailable}><p>{error}</p></div>
        ) : anchors.length === 0 ? (
          <div className={styles.historyEmpty}>
            <p>Nothing has been held yet.</p>
            <button type="button" onClick={() => router.push(fromCabin ? '/maia/anchor?from=cabin' : '/maia/anchor?from=house')}>
              Begin with today →
            </button>
          </div>
        ) : (
          <div className={styles.timeline}>
            {anchors.map((anchor) => {
              const ambient = isAmbient(anchor.surface_preference);
              const revisited = wasRevisited(anchor);
              return (
                <article className={styles.timelineEntry} key={anchor.id}>
                  <div className={styles.timelineWhen}>
                    <time dateTime={anchor.anchor_date}>{dateLabel(anchor.anchor_date)}</time>
                    <span>Held · {clockLabel(anchor.created_at)}</span>
                    {revisited ? <span>Revisited · {clockLabel(anchor.updated_at)}</span> : null}
                  </div>

                  <div className={styles.timelineBody}>
                    <p className={styles.timelinePrompt}>{anchor.prompt_shown}</p>
                    <blockquote>{anchor.response}</blockquote>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={ambient}
                      disabled={savingId === anchor.id}
                      onClick={() => void toggle(anchor)}
                      className={styles.memoryChoice}
                    >
                      <span className={styles.memoryDot} data-on={ambient ? 'true' : undefined} aria-hidden="true" />
                      <span>
                        {ambient
                          ? 'MAIA may remember this with me'
                          : 'For me only'}
                      </span>
                    </button>

                    {rowError === anchor.id ? (
                      <p className={styles.rowError}>That choice did not save. Nothing changed.</p>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <footer className={styles.footer}>
          <span>Nothing here asks you to keep up.</span>
          <button type="button" onClick={() => router.push(fromCabin ? cabinReturnPath() : '/house')}>
            {fromCabin ? 'Return to Cabin →' : 'Return to House →'}
          </button>
        </footer>
      </section>
    </main>
  );
}
