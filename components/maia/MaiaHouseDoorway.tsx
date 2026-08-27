'use client';

/**
 * MaiaHouseDoorway — the one renderer of the way into The House.
 *
 * WHY THIS IS A COMPONENT AND NOT MARKUP IN TWO PLACES.
 *
 * The House is the only permanent navigation on the member surface (founder
 * ruling 2026-07-22: the member should not encounter the platform as a rail of
 * product features). "One House, one renderer, one doorway" was already the
 * rule; it was enforced by a comment. Once boundary routes needed the same
 * doorway on mobile, a comment was no longer enough — a second hand-copied box
 * is exactly how the doorway drifted before.
 *
 * GEOMETRY IS LOAD-BEARING, and this is the whole reason the box lives here:
 * the doorway must render at the SAME box wherever it appears, because Arrival,
 * conversation and the boundary rooms swap beneath a member who should never
 * have to re-find the way out. The band mirrors MaiaArrivalField's header
 * exactly — h-[54px], px-4 md:px-6 — and the button mirrors its button —
 * -ml-1, h-11, px-2, no pill. That yields an identical box in every state:
 *
 *     desktop  x=20  y=5  114x44
 *     mobile   x=12  y=5  114x44
 *
 * A previous pass placed this at `left-3 top-14` and asserted in a comment that
 * it matched Arrival. It did not: measured, it sat at (12,56) 124x44 — a 51px
 * jump and a 10px width change every time Arrival gave way to conversation. Do
 * not re-anchor this to a top-bar height or a `top-*` offset; anchor it to the
 * same header box, and verify by measuring the bounding box, not by reading
 * this comment.
 *
 * The safe-area inset is not decoration. Founder device walk 2026-07-27: with
 * no inset the doorway centred ~27px from the physical top — inside the
 * status-bar / Dynamic-Island zone, where iOS never delivers touches to the
 * WebView. The doorway wasn't broken; it was unreachable.
 */

import { Home } from 'lucide-react';

interface MaiaHouseDoorwayProps {
  onOpen: () => void;
  /** Let the doorway recede while voice is flowing. Never below reachable. */
  dimmed?: boolean;
  /** Extra classes on the band — for width-scoping (e.g. `md:hidden`). */
  className?: string;
}

export function MaiaHouseDoorway({ onOpen, dimmed = false, className = '' }: MaiaHouseDoorwayProps) {
  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-0 z-[85] flex h-[54px] items-center px-4 md:px-6 ${className}`}
      style={{ paddingTop: 'calc(max(env(safe-area-inset-top), 0px) + 6px)' }}
    >
      <button
        onClick={onOpen}
        className={`
          group pointer-events-auto -ml-1 flex h-11 min-w-[44px] items-center gap-2 rounded-full px-2
          text-[rgba(201,165,78,0.75)] transition-colors hover:text-[#c9a54e] focus:outline-none
          ${dimmed ? 'opacity-60 hover:opacity-100' : 'opacity-100'}
        `}
        title="The House — your places and practices"
        aria-label="Open The House"
      >
        <Home className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
        {/* The label is revealed, not removed. The icon alone is the resting
            state — after a few uses a doorway does not need to say its own name,
            and the permanent label was the widest thing in the bar, which is
            what crowded MAIA off small screens.

            Revealed on hover AND on keyboard focus: hover-only would hide the
            name from anyone navigating by keyboard, who needs it most. Width
            animates rather than the label appearing/disappearing, so nothing
            beside it jumps. `aria-label` carries the name unconditionally, so
            screen readers never depend on hover. */}
        <span
          className="max-w-0 overflow-hidden whitespace-nowrap text-[15px] leading-none opacity-0 transition-all duration-300 group-hover:max-w-[8rem] group-hover:opacity-100 group-focus-visible:max-w-[8rem] group-focus-visible:opacity-100"
          style={{ fontFamily: 'Spectral, Georgia, serif' }}
          aria-hidden="true"
        >
          The House
        </span>
      </button>
    </div>
  );
}
