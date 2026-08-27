'use client';

/**
 * MaiaBoundaryLayout — the shell for boundary rooms (Astrology, Studio, Lab
 * Tools, Circles, Community Library).
 *
 * THE DEFECT THIS FIXES (MLX-06 Unit 6). This layout rendered the left rail
 * unconditionally, at every width, with a hard `paddingLeft: 56`. On a 390px
 * phone that spent 56px — 14% of the viewport — on a navigation column the
 * founder had already retired from the member surface (ruling 2026-07-22: "the
 * member should not encounter the platform as a rail of product features").
 * MaiaShell complied with that ruling; this layout, written earlier, never
 * heard it, so the rail survived here and only here. /astrology was the one
 * member-facing room still showing it.
 *
 * THE CONTRACT, one navigation affordance per width — never two:
 *
 *   desktop (≥768px) — INHABIT. The rail persists: a member who has walked out
 *     of MAIA into a room can see the shape of their world and step sideways
 *     without going back through the House first. Orientation is the point of a
 *     wide screen, and removing it merely for symmetry would make desktop worse.
 *
 *   mobile (<768px) — ACCOMPANY. The rail goes, the room gets the full width,
 *     and the way back is the House doorway — the same doorway, from the same
 *     renderer, at the same box the member already knows from MAIA and Arrival.
 *     Not desktop minus width: a different, smaller promise.
 *
 * WHY CSS AND NOT A MEDIA-QUERY HOOK. Both affordances are always mounted and
 * width-scoped with `md:`. A JS breakpoint would render the mobile branch on the
 * server and swap after hydration, which is precisely a flash of the rail on a
 * phone — the defect, arriving 200ms late.
 *
 * WHY NOT A BOTTOM NAV. The House sheet already answers "where can I go?" in one
 * thumb-reachable gesture, and it reads from the same registry as the rail, so
 * nothing is reachable in one place and not the other. A tab bar would be a
 * second navigation system competing with the House. (The practitioner Studio
 * does carry one — it is a working tool with a day-one working set, not a
 * member's house — and it therefore passes `ownsMobileNav`.)
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MaiaLeftRail } from './MaiaLeftRail';
import { MaiaHouseSheet } from './MaiaHouseSheet';
import { MaiaHouseDoorway } from './MaiaHouseDoorway';
import { MAIA_WORLDS, RAIL_WIDTH_PX } from '@/lib/navigation/maiaNav';
import { useSession } from '@/lib/hooks/useSession';
import type { MaiaWorldId, BoundaryId } from '@/lib/navigation/types';

interface MaiaBoundaryLayoutProps {
  boundary: BoundaryId;
  children: React.ReactNode;
  /** Let the member rail recede visually so the boundary's own nav reads as primary. */
  railRecede?: boolean;
  /**
   * This room supplies its own mobile navigation (Studio's drawer + tab bar).
   * Suppresses the House doorway so the member never meets two ways out at once.
   * The rail is width-scoped regardless — a room owning its mobile nav is
   * exactly a room that must not also carry the rail on a phone.
   */
  ownsMobileNav?: boolean;
}

/**
 * `md:pl-14` must equal RAIL_WIDTH_PX. Tailwind's `pl-14` is 3.5rem = 56px at
 * the 16px base, and the rail is `w-14`. Asserted in the shell test so the two
 * cannot drift into a gap or an overlap.
 */
const RAIL_OFFSET_CLASS = 'md:pl-14';

export function MaiaBoundaryLayout({
  boundary,
  children,
  railRecede = false,
  ownsMobileNav = false,
}: MaiaBoundaryLayoutProps) {
  const router = useRouter();
  const { isAdmin, isPractitioner } = useSession();
  const [houseOpen, setHouseOpen] = useState(false);

  // Native (Capacitor) shell? Governs whether the House opens routes in-app or
  // via the honest web bridge. Client-only; SSR and web render as non-native.
  const [isNative, setIsNative] = useState(false);
  useEffect(() => {
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    setIsNative(!!cap?.isNativePlatform?.());
  }, []);

  const handleWorldChange = (world: MaiaWorldId) => {
    const worldDef = MAIA_WORLDS.find((w) => w.id === world);
    if (worldDef) {
      router.push(worldDef.route);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0d0b]">
      {/* Desktop only. Fixed-position, so the wrapper is layout-inert. */}
      <div className="hidden md:block">
        <MaiaLeftRail
          activeWorld={null}
          activeBoundary={boundary}
          calmMode={railRecede}
          calmCeiling={railRecede}
          onWorldChange={handleWorldChange}
        />
      </div>

      {/* Mobile only: the way back, at the box the member already knows. */}
      {!ownsMobileNav && (
        <>
          <MaiaHouseDoorway className="md:hidden" onOpen={() => setHouseOpen(true)} />
          <MaiaHouseSheet
            open={houseOpen}
            onClose={() => setHouseOpen(false)}
            isFounder={isAdmin || isPractitioner}
            isNative={isNative}
          />
        </>
      )}

      <div className={RAIL_OFFSET_CLASS}>{children}</div>
    </div>
  );
}

/** Exported for the shell test: the offset class and the rail width must agree. */
export const __RAIL_OFFSET_CLASS = RAIL_OFFSET_CLASS;
export const __RAIL_WIDTH_PX = RAIL_WIDTH_PX;
