'use client';

/**
 * Journal Room — State 3: Reading Entry.
 *
 * Approved reference:
 *   member words dominate · metadata beneath · long readable measure ·
 *   no records-management chrome
 *
 * `Reflect with MAIA` appears here and ONLY here, because the reference makes it
 * conditional on the entry being kept. It is a gesture from the writing room into
 * relationship — not evidence that the room should become chat-first (Work Unit §7).
 *
 * MUST NOT appear (contract §4 state 3): edit/delete toolbars · tag chips row ·
 * "Entry #12" · metadata table · export · share · related-entries rail.
 */

import { useEffect, useState, type ReactNode } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { type, color, space, focus, hit, quiet, srOnly, spine, roomMaterial } from './tokens';
import { FacetOriginTrail } from '@/components/house/FacetOriginTrail';

export interface JournalEntry {
  id: string;
  content: string;
  created_at: string;
  entry_type?: 'day' | 'dream' | 'handwriting';
  meta?: {
    place?: string;
    fromQuestion?: string;
  } | null;
}

/**
 * Time reads as lived, not as a timestamp.
 *
 * The hour is included because an entry is a record of a moment, and "August 11"
 * alone cannot tell the member whether they wrote it before dawn or after a hard
 * evening — which is often the first thing they want to know on returning. The
 * year still appears only when it is not this one; a date does not need to
 * announce what the member already knows.
 */
function livedDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  return d.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    ...(d.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }),
    hour: 'numeric',
    minute: '2-digit',
  });
}

export interface EntryReaderProps {
  entry: JournalEntry;
  onReflect: () => void;
  onLeave: () => void;
  /** True while MAIA's reflection is showing — the invitation is then spent. */
  reflecting: boolean;
  /** State 4 renders here, beneath the entry, which stays visible and dominant. */
  children?: ReactNode;
}

export function EntryReader({ entry, onReflect, onLeave, reflecting, children }: EntryReaderProps) {
  const [reflectionId, setReflectionId] = useState<string | null>(null);
  const [checkingReflection, setCheckingReflection] = useState(true);
  const [keepingReflection, setKeepingReflection] = useState(false);
  const [reflectionError, setReflectionError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setCheckingReflection(true);
    setReflectionError(null);

    void apiFetch(`/api/journal/quick/${entry.id}/reflection`, { method: 'GET' })
      .then(async (res) => {
        if (!live || !res.ok) return;
        const data = await res.json().catch(() => null);
        if (live && data?.kept && typeof data.capsuleId === 'string') {
          setReflectionId(data.capsuleId);
        }
      })
      .catch(() => {
        // Reflection availability is optional. The Journal entry remains whole.
      })
      .finally(() => {
        if (live) setCheckingReflection(false);
      });

    return () => {
      live = false;
    };
  }, [entry.id]);

  async function keepAsReflection() {
    if (keepingReflection || reflectionId) return;
    setKeepingReflection(true);
    setReflectionError(null);
    try {
      const res = await apiFetch(`/api/journal/quick/${entry.id}/reflection`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('reflection keep failed');
      const data = await res.json().catch(() => null);
      if (typeof data?.capsuleId !== 'string') throw new Error('missing reflection id');
      setReflectionId(data.capsuleId);
    } catch {
      setReflectionError('That did not carry over. Your Journal entry is unchanged.');
    } finally {
      setKeepingReflection(false);
    }
  }

  return (
    <main
      className={`min-h-[100dvh] ${color.field} ${space.room} flex flex-col`}
      style={roomMaterial as React.CSSProperties}
      aria-labelledby="journal-reading-heading"
    >
      {/* The entry's own date names this state for assistive technology. */}
      <h1 id="journal-reading-heading" className={srOnly}>
        Entry from {new Date(entry.created_at).toLocaleDateString('en-US', {
          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
        })}
      </h1>

      <div className={`${spine} pt-8 sm:pt-10`}>
        <button
          type="button"
          onClick={onLeave}
          className={`${type.marker} ${color.muted} ${focus} ${hit} ${quiet}`}
        >
          Journal
        </button>
      </div>

      <div className={`flex-1 ${spine} pt-10 sm:pt-14 pb-20`}>
        {/* The member's words. Nothing above them, nothing beside them. */}
        <article className={`${type.writing} ${color.human} whitespace-pre-wrap`}>
          {entry.content}
        </article>

        {/* Provenance remains beneath the member's words: lived time, entry
            convention, optional member-authored place, and a real MAIA crossing
            only when this entry actually began from one. */}
        <div className={`mt-8 flex flex-wrap items-center gap-x-4 gap-y-1 ${type.meta} ${color.muted}`}>
          <span>{livedDate(entry.created_at)}</span>
          {entry.entry_type === 'dream' ? <span>DREAM</span> : null}
          {entry.meta?.place ? <span>{entry.meta.place}</span> : null}
        </div>

        {entry.meta?.fromQuestion ? (
          <div className="mt-5">
            <p className={`${type.marker} ${color.muted} mb-1`}>Written from a question with MAIA</p>
            <p className={`${type.meta} ${color.muted} italic`}>{entry.meta.fromQuestion}</p>
          </div>
        ) : null}

        <FacetOriginTrail
          targetFacet="journal"
          targetRefId={entry.id}
          tone="light"
          className="mt-7"
        />

        {!reflecting && (
          <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-2">
            {!checkingReflection && (
              reflectionId ? (
                <a
                  href={`/reflections/${reflectionId}`}
                  className={`${type.meta} ${color.accent} ${focus} ${hit} ${quiet}`}
                >
                  Kept as a reflection →
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => void keepAsReflection()}
                  disabled={keepingReflection}
                  className={`${type.meta} ${color.accent} ${focus} ${hit} ${quiet} disabled:opacity-40`}
                >
                  {keepingReflection ? 'Keeping as a reflection…' : 'Keep as a reflection'}
                </button>
              )
            )}

            {entry.entry_type === 'dream' ? (
              <a
                href={`/dream?dream=${encodeURIComponent(entry.id)}&from=journal`}
                className={`${type.meta} ${color.accent} ${focus} ${hit} ${quiet}`}
              >
                Explore this dream →
              </a>
            ) : (
              <button
                type="button"
                onClick={onReflect}
                className={`${type.meta} ${color.accent} ${focus} ${hit} ${quiet}`}
              >
                Reflect with MAIA
              </button>
            )}

            <a
              href={`/changes?sourceFacet=journal&sourceRefId=${encodeURIComponent(entry.id)}&crossingId=journal-name-as-change`}
              className={`${type.meta} ${color.muted} ${focus} ${hit} ${quiet}`}
            >
              Name this as a change →
            </a>

            <a
              href={`/decisions/new?sourceFacet=journal&sourceRefId=${encodeURIComponent(entry.id)}&crossingId=journal-consider-decision`}
              className={`${type.meta} ${color.muted} ${focus} ${hit} ${quiet}`}
            >
              Consider a decision →
            </a>
          </div>
        )}

        {reflectionError ? (
          <p className={`mt-3 ${type.meta} ${color.muted}`} role="alert">{reflectionError}</p>
        ) : null}

        {children}
      </div>
    </main>
  );
}
