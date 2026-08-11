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
 *
 * CONSOLIDATION (founder ruling, 2026-08-10). This file used to carry its own
 * `selectReturnPiece` — a second, untested implementation of the same epistemic
 * contract, with two calendar rules and an undated reason string. It has been
 * removed. Selection now lives in exactly one place, `lib/journal/return.ts`,
 * which carries five calendar rules, the `ReturnStrategy` claim classes, a
 * dated and countable account for `Why this?`, and 17 tests — including the
 * negative control that swaps every entry's text for noise and asserts the same
 * entry still returns. That control is what proves the selector is genuinely
 * date-derived rather than merely claiming to be.
 *
 * This file is now PRESENTATION ONLY. If you find yourself adding a date
 * comparison here, it belongs in lib/journal/return.ts, under test.
 */

import { useState } from 'react';
import { type, color, focus, hit, quiet, quietGroup, hitBlock } from './tokens';
import { passageOf, type ReturnedEntry } from '@/lib/journal/return';

/** The room's row shape, widened with the field `pickReturn` reads. */
export interface ReturnableRow {
  id: string;
  content: string;
  created_at: string;
  createdAt: string;
}

/** What the view receives: the chosen entry plus the reason it was chosen. */
export type ReturnPiece = ReturnedEntry<ReturnableRow>;

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
      <p className={`${type.meta} ${color.muted}`}>{piece.why}</p>

      <button
        type="button"
        onClick={() => onOpen(piece.entry.id)}
        /* hitBlock, not hit: a short one-line excerpt measured 30px tall, so it
           needs the height floor — but inline-flex would centre wrapped text. */
        className={`block mt-3 text-left ${focus} ${hitBlock} group`}
      >
        <span className={`${type.writing} ${color.secondary} ${quietGroup}`}>
          {passageOf(piece.entry.content)}
        </span>
      </button>

      <button
        type="button"
        onClick={() => setShowRule((v) => !v)}
        aria-expanded={showRule}
        className={`mt-3 ${type.meta} ${color.muted} ${focus} ${hit} ${quiet}`}
      >
        Why this?
      </button>

      {/* The account, verbatim from the selector — dates, counts, and what was
          not measured. Never a re-description written for the view. */}
      {showRule && (
        <p className={`mt-2 ${type.meta} ${color.muted} max-w-[30rem]`}>{piece.account}</p>
      )}
    </section>
  );
}
