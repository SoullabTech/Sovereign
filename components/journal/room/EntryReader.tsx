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

import type { ReactNode } from 'react';
import { type, color, space, focus, hit, quiet } from './tokens';

export interface JournalEntry {
  id: string;
  content: string;
  created_at: string;
}

/** Time reads as lived, not as a timestamp. */
function livedDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    ...(d.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }),
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
  return (
    <main className={`min-h-[100dvh] ${color.field} ${space.room} flex flex-col`}>
      <div className="pt-8 sm:pt-10">
        <button
          type="button"
          onClick={onLeave}
          className={`${type.marker} ${color.muted} ${focus} ${hit} ${quiet}`}
        >
          Journal
        </button>
      </div>

      <div className={`flex-1 ${space.measure} w-full mx-auto pt-10 sm:pt-14 pb-20`}>
        {/* The member's words. Nothing above them, nothing beside them. */}
        <article className={`${type.writing} ${color.human} whitespace-pre-wrap`}>
          {entry.content}
        </article>

        {/* Metadata beneath, quiet and singular — a date, not a record header. */}
        <p className={`mt-8 ${type.meta} ${color.muted}`}>{livedDate(entry.created_at)}</p>

        {!reflecting && (
          <div className="mt-12">
            <button
              type="button"
              onClick={onReflect}
              className={`${type.meta} ${color.accent} ${focus} ${hit} ${quiet}`}
            >
              Reflect with MAIA
            </button>
          </div>
        )}

        {children}
      </div>
    </main>
  );
}
