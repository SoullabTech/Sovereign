'use client';

/**
 * Journal Room — State 5: Return.
 *
 * Approved reference:
 *   one actual older piece · factual reason for resurfacing · Why this? ·
 *   no relevance theater · no carousel
 *
 * The load-bearing constraint is "no relevance theater". Selection is therefore
 * DETERMINISTIC AND DATE-DERIVED ONLY — no similarity scoring, no ranking, no
 * inference about meaning. `Why this?` discloses the literal rule that fired, so
 * the reason shown is the actual reason, not a rationalisation of one.
 *
 * MUST NOT appear (contract §4 state 5): carousel · "Recommended for you" ·
 * relevance % · multiple suggestions · "Because you wrote about X".
 */

import { useState } from 'react';
import { type, color, focus } from './tokens';

export interface ReturnPiece {
  entryId: string;
  excerpt: string;
  /** Shown to the member. Factual, derived from the date alone. */
  reason: string;
  /** The literal selection rule, disclosed by `Why this?`. */
  rule: string;
}

interface JournalRow {
  id: string;
  content: string;
  created_at: string;
}

const DAY_MS = 86_400_000;

/**
 * Pure, deterministic selection. Given the member's entries and "now", exactly
 * one piece (or none) is chosen, by date arithmetic only.
 *
 * Rules are tried in order; the first that matches fires, and its `rule` string
 * is what `Why this?` shows.
 */
export function selectReturnPiece(rows: JournalRow[], now: Date): ReturnPiece | null {
  // Only look back past the last week — returning today's writing is not a return.
  const older = rows.filter((r) => now.getTime() - new Date(r.created_at).getTime() > 7 * DAY_MS);
  if (older.length === 0) return null;

  const excerptOf = (s: string) => {
    const flat = s.replace(/\s+/g, ' ').trim();
    return flat.length > 220 ? `${flat.slice(0, 220).trimEnd()}…` : flat;
  };

  // Rule 1 — this day, a previous year.
  const anniversary = older.find((r) => {
    const d = new Date(r.created_at);
    return (
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate() &&
      d.getFullYear() < now.getFullYear()
    );
  });
  if (anniversary) {
    const years = now.getFullYear() - new Date(anniversary.created_at).getFullYear();
    return {
      entryId: anniversary.id,
      excerpt: excerptOf(anniversary.content),
      reason: years === 1 ? 'You wrote this a year ago today.' : `You wrote this ${years} years ago today.`,
      rule: 'This entry was written on today’s date in an earlier year. Nothing about its content was considered.',
    };
  }

  // Rule 2 — the oldest thing kept.
  const oldest = older.reduce((a, b) =>
    new Date(a.created_at) <= new Date(b.created_at) ? a : b,
  );
  return {
    entryId: oldest.id,
    excerpt: excerptOf(oldest.content),
    reason: 'This is the oldest thing you kept.',
    rule: 'This is simply your earliest entry by date. Nothing about its content was considered.',
  };
}

export function Return({
  piece,
  onOpen,
}: {
  piece: ReturnPiece;
  onOpen: (entryId: string) => void;
}) {
  const [showRule, setShowRule] = useState(false);

  return (
    <section aria-label="Something earlier">
      <p className={`${type.meta} ${color.muted}`}>{piece.reason}</p>

      <button
        type="button"
        onClick={() => onOpen(piece.entryId)}
        className={`block mt-3 text-left ${focus} group`}
      >
        <span className={`${type.writing} ${color.secondary} group-hover:opacity-80 transition-opacity`}>
          {piece.excerpt}
        </span>
      </button>

      <button
        type="button"
        onClick={() => setShowRule((v) => !v)}
        aria-expanded={showRule}
        className={`mt-3 ${type.meta} ${color.muted} ${focus} hover:opacity-80 transition-opacity`}
      >
        Why this?
      </button>

      {showRule && (
        <p className={`mt-2 ${type.meta} ${color.muted} max-w-[30rem]`}>{piece.rule}</p>
      )}
    </section>
  );
}
