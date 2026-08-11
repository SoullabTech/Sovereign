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
  onKeep: (content: string, entryType: EntryType) => Promise<void>;
  onLeave: () => void;
}

export function WritingSurface({ variant, fromQuestion, onKeep, onLeave }: WritingSurfaceProps) {
  const [text, setText] = useState('');
  const [entryType, setEntryType] = useState<EntryType>('day');
  const [keeping, setKeeping] = useState(false);
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
    if (!hasText || keeping) return;
    setKeeping(true);
    setError(null);
    try {
      await onKeep(text.trim(), entryType);
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
        <p className={`mb-8 ${type.meta} ${color.muted}`}>
          <time dateTime={startedAt.toISOString()}>{stamp}</time>
        </p>

        {/* What MAIA asked, carried as context — not as the member's text. */}
        {fromQuestion && (
          <p className={`mb-8 ${type.meta} ${color.muted}`}>{fromQuestion}</p>
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

        {/* Classification sits BELOW the writing and appears only once there is
            writing to classify. It is never a step before writing. */}
        {hasText && (
          <div className="mt-10 flex items-center gap-5">
            <button
              type="button"
              onClick={keep}
              disabled={keeping}
              className={`${type.meta} ${color.accent} ${focus} ${hit} ${quiet}
                disabled:opacity-40`}
            >
              {keeping ? 'Keeping…' : 'Keep this'}
            </button>

            <div className="flex items-center gap-3" role="group" aria-label="What kind of writing">
              {(['day', 'dream'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setEntryType(t)}
                  aria-pressed={entryType === t}
                  /* hitTight, not hit: "day" measured 22px wide — under the
                     24px target-size floor. Widens the hit area only. */
                  className={`${type.meta} ${focus} ${hitTight} ${quiet} ${
                    entryType === t ? color.secondary : `${color.muted} opacity-60`
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className={`mt-4 ${type.meta} ${color.secondary}`} role="alert">{error}</p>}
      </div>
    </main>
  );
}
