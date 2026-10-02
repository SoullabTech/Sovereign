'use client';

/**
 * Journal Room — State 2: Writing Room.
 *
 * Approved reference:
 *   writing happens in place · no title ceremony · first line can become title ·
 *   classification below writing, not before it · quiet `Keep this` ·
 *   draft ≠ entry · software recedes
 *
 * DRAFT ≠ ENTRY is structural, not a flag: a draft is unsaved local text, and
 * `Keep this` is the gesture that creates the row. Nothing is persisted to the
 * member's journal until they keep it. This is why no schema change was needed.
 *
 * The draft is held in localStorage so ordinary navigation cannot lose writing
 * (Work Unit §14) — that is content protection, not autosave-as-feature, and it
 * is deliberately silent: no "Draft saved" chatter.
 *
 * MUST NOT appear (contract §4 state 2): title ceremony · required tags ·
 * toolbar · word count · "Draft saved" · AI suggestions · publish/share.
 */

import { useEffect, useRef, useState } from 'react';
import { type, color, space, focus, hit, hitTight, quiet, srOnly, spine, roomMaterial } from './tokens';
import { FacetCarryNotice, type FacetCarryRef } from '@/components/house/FacetCarryNotice';
import { SymbolicCarryNotice } from '@/components/house/SymbolicCarryNotice';

export type EntryType = 'day' | 'dream';

const DRAFT_KEY = 'journal_room_draft';

export interface WritingSurfaceProps {
  /** 'note' is the same surface in a briefer form — lower ceremony, same gestures. */
  variant: 'writing' | 'note';
  /**
   * MAIA's question, when arriving via `Write from here`.
   *
   * Deliberately NOT pre-filled into the textarea. Seeding the field would make
   * MAIA's words become the member's entry, and the member's writing must stay
   * theirs alone. It is shown quietly above the surface as context the member
   * writes *from*, never text they are handed.
   */
  fromQuestion?: string;
  carrySourceRef?: FacetCarryRef | null;
  onKeep: (
    content: string,
    entryType: EntryType,
    meta?: { place?: string; fromQuestion?: string },
    sourceRef?: FacetCarryRef | null,
  ) => Promise<void>;
  onLeave: () => void;
}

export function WritingSurface({
  variant,
  fromQuestion,
  carrySourceRef = null,
  onKeep,
  onLeave,
}: WritingSurfaceProps) {
  const [text, setText] = useState('');
  const [entryType, setEntryType] = useState<EntryType>('day');
  const [place, setPlace] = useState('');
  const [showPlace, setShowPlace] = useState(false);
  const [keeping, setKeeping] = useState(false);
  const [carrySourceReady, setCarrySourceReady] = useState<boolean | null>(
    carrySourceRef ? null : true,
  );
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);
  const restored = useRef(false);

  // Restore an unkept draft. Runs once.
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    try {
      const saved = window.localStorage.getItem(DRAFT_KEY);
      if (saved) setText(saved);
    } catch {
      /* storage unavailable — the draft is simply not restored */
    }
  }, []);

  // Hold the draft locally. Silent by design.
  useEffect(() => {
    try {
      if (text) window.localStorage.setItem(DRAFT_KEY, text);
      else window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* non-fatal */
    }
  }, [text]);

  // The surface opens focused — writing happens in place, with no step before it.
  useEffect(() => {
    ref.current?.focus();
  }, []);

  // Auto-grow: the page follows the writing, rather than the writing living in a box.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  const hasText = text.trim().length > 0;

  async function keep() {
    if (!hasText || keeping || (carrySourceRef && carrySourceReady !== true)) return;
    setKeeping(true);
    setError(null);
    try {
      const meta = {
        ...(place.trim() ? { place: place.trim().slice(0, 120) } : {}),
        ...(fromQuestion ? { fromQuestion: fromQuestion.slice(0, 500) } : {}),
      };
      await onKeep(
        text.trim(),
        entryType,
        Object.keys(meta).length > 0 ? meta : undefined,
        carrySourceRef,
      );
      try {
        window.localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* non-fatal */
      }
    } catch {
      // The draft is deliberately left intact so nothing is lost.
      setError('That didn’t save. Your writing is still here.');
      setKeeping(false);
    }
  }

  // Fixed at mount rather than read on every render: a stamp that ticked while
  // the member was mid-sentence would be movement in a room whose whole register
  // is stillness. This is when they sat down.
  const [startedAt] = useState(() => new Date());
  const stamp = startedAt.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  const period =
    startedAt.getHours() < 5 ? 'Late tonight' :
    startedAt.getHours() < 12 ? 'This morning' :
    startedAt.getHours() < 17 ? 'This afternoon' :
    startedAt.getHours() < 22 ? 'Tonight' :
    'Late tonight';

  return (
    <main
      className={`min-h-[100dvh] ${color.field} ${space.room} flex flex-col`}
      style={roomMaterial as React.CSSProperties}
      aria-labelledby="journal-writing-heading"
    >
      {/* Named for assistive technology only — the room stays visually untitled. */}
      <h1 id="journal-writing-heading" className={srOnly}>
        {variant === 'note' ? 'Note something' : 'Begin writing'}
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

      <div className={`flex-1 ${spine} pt-10 sm:pt-14 pb-16`}>
        {/* When this is being written.
            The surface opened with no date at all — a blank field under a bare
            marker, which reads as a text box rather than a page. A page in a
            notebook is dated; that stamp is also what the entry is filed under
            once it is kept, so showing it here is telling the member the truth
            about what they are making, not decorating the field. Rendered from
            the client's own clock at mount, and never sent — the row's
            authoritative created_at is set server-side on keep. */}
        <div className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2">
          <p className={`${type.meta} ${color.muted}`}>
            <time dateTime={startedAt.toISOString()}>{stamp}</time>
          </p>
          <span className={`${type.meta} ${color.muted} italic`}>{period}</span>

          {variant === 'writing' && (
            <div className="flex items-center gap-1" role="group" aria-label="Journal entry type">
              {(['day', 'dream'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setEntryType(t)}
                  aria-pressed={entryType === t}
                  className={`${type.marker} ${focus} ${hitTight} ${quiet} px-1 ${
                    entryType === t
                      ? color.accent
                      : `${color.muted} opacity-55`
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          {!showPlace && !place ? (
            <button
              type="button"
              onClick={() => setShowPlace(true)}
              className={`${type.meta} ${color.muted} ${focus} ${hit} ${quiet}`}
            >
              Add a place
            </button>
          ) : null}
        </div>

        {showPlace || place ? (
          <div className="mb-8">
            <label htmlFor="journal-place" className={srOnly}>Place for this entry</label>
            <input
              id="journal-place"
              type="text"
              value={place}
              onChange={(e) => setPlace(e.target.value.slice(0, 120))}
              placeholder="Home, the garden, New Haven…"
              autoComplete="off"
              className={`w-full max-w-[18rem] bg-transparent border-0 border-b pb-1 outline-none
                ${type.meta} ${color.secondary} ${color.hairline}
                placeholder:opacity-45 focus:border-[var(--sl-accent-primary)]`}
            />
          </div>
        ) : null}

        {carrySourceRef ? (
          <div className="mb-9">
            {carrySourceRef.sourceFacet === 'divination' ? (
              <SymbolicCarryNotice
                sourceRefId={carrySourceRef.sourceRefId}
                onResolved={(source) => setCarrySourceReady(Boolean(source))}
              />
            ) : (
              <FacetCarryNotice
                targetFacet="journal"
                sourceRef={carrySourceRef}
                tone="light"
                onResolved={(source) => setCarrySourceReady(Boolean(source))}
              />
            )}
          </div>
        ) : null}

        {/* What MAIA asked, carried as provenance — never as the member's text. */}
        {fromQuestion && (
          <div className="mb-8">
            <p className={`${type.marker} ${color.muted} mb-2`}>Written from a question with MAIA</p>
            <p className={`${type.meta} ${color.muted} italic`}>{fromQuestion}</p>
          </div>
        )}

        {/* No title field. The first line becomes the title when kept. */}
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label={variant === 'note' ? 'Note something' : 'Begin writing'}
          rows={variant === 'note' ? 3 : 8}
          className={`w-full resize-none bg-transparent border-0 outline-none ${type.writing} ${color.human}
            placeholder:opacity-40 focus:ring-0 p-0`}
          placeholder={variant === 'note' ? 'Note something…' : ''}
        />

        {hasText && (
          <div className="mt-10">
            <button
              type="button"
              onClick={keep}
              disabled={keeping || (carrySourceRef ? carrySourceReady !== true : false)}
              className={`${type.meta} ${color.accent} ${focus} ${hit} ${quiet}
                disabled:opacity-40`}
            >
              {keeping ? 'Keeping…' : 'Keep this'}
            </button>
          </div>
        )}

        {error && <p className={`mt-4 ${type.meta} ${color.secondary}`} role="alert">{error}</p>}
      </div>
    </main>
  );
}
