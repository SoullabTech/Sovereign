'use client';

/**
 * ReturnToMaia — the way out of a room, in one implementation.
 *
 * A member who can enter a MAIA function must be able to leave it. Before this
 * component, Journal, Living Field and Keeps had no return affordance anywhere
 * in their component closure: the House registry declared
 * `returnBehavior: 'back-to-maia'` and no surface honoured it.
 *
 * WHAT IT IS. A doorway, not chrome. It names the PLACE it leads to and stays
 * visually recessive, per docs/design/INHABITABLE_ARCHITECTURE.md — the way out
 * of a room is architecture, so it is always present and never competes with
 * the work the member came to do.
 *
 * WHY A LINK AND NOT `router.back()`. `router.back()` is history-dependent: on
 * a cold start, a deep link, a restored PWA session or a native WebView with an
 * empty stack it is a no-op, and where it does fire it can leave the app
 * entirely. A member's way home must not depend on how they arrived. This
 * navigates to a known place. That is the whole point.
 *
 * STYLING. The rooms do not share a palette — Journal is paper, Living Field is
 * near-black, Anchor is warm stone — so the visual register is the caller's to
 * set via `className`. What is NOT the caller's to vary is the destination, the
 * accessible name, and the 44px touch floor: those are fixed here so they
 * cannot drift room by room.
 *
 * @see lib/navigation/houseReturn.ts — the destination and the labels
 * @see lib/navigation/__tests__/houseReturn.test.ts — the guard
 */

import Link from 'next/link';
import { MAIA_HOME, RETURN_LABEL, RETURN_ARIA_LABEL } from '@/lib/navigation/houseReturn';

export interface ReturnToMaiaProps {
  /**
   * The room's own register for a quiet, recessive text gesture — colour, type
   * scale, hover. The touch floor and focus ring are applied regardless.
   */
  className?: string;
}

export function ReturnToMaia({ className = '' }: ReturnToMaiaProps) {
  return (
    <Link
      href={MAIA_HOME}
      aria-label={RETURN_ARIA_LABEL}
      /* inline-flex + min-h-[44px]: WCAG 2.5.8 target floor. A short label is
         not tall enough on its own — measured across the rooms at 21–33px. */
      className={`inline-flex items-center gap-1.5 min-h-[44px] rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 transition-opacity hover:opacity-80 motion-reduce:transition-none ${className}`}
    >
      {/* Decorative: the accessible name is on the link, so the arrow must not
          be announced a second time. */}
      <span aria-hidden="true">&larr;</span>
      <span>{RETURN_LABEL}</span>
    </Link>
  );
}
