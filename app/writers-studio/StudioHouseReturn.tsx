'use client';

import { useSearchParams } from 'next/navigation';
import { HouseRoomThreshold } from '@/components/house/HouseRoomThreshold';

/**
 * HOUSE-STUDIO-CIRCULATION-01R1 · H1-2 — the return membrane.
 *
 * A doorway that only opens one way is a funnel. When the member entered the
 * Studio from the House, the larger field stays one quiet step away — the
 * shared House threshold grammar, not a browser-like back button.
 *
 * Renders only on an explicit `from=house` (house-continuity-thresholds:
 * "HouseEntryThreshold renders only when the route explicitly carries
 * from=house"). Studio mode changes copy every param, so it survives Write /
 * Develop / Review without being re-added. It carries nothing back: return is
 * navigation, never content.
 *
 * The threshold's type is light-on-dark (it was drawn for the House's own
 * field); the Studio shell is light, so the threshold sits on a band of the
 * House's colour — the House framing the doorway, not entering the room.
 */
export function StudioHouseReturn() {
  const searchParams = useSearchParams();
  if (searchParams?.get('from') !== 'house') return null;
  return (
    <div data-house-return="" style={{ background: '#0d1b2e', padding: '6px 16px 0' }}>
      {/* The Studio shell carries the Soullab mark; the threshold does not repeat it. */}
      <HouseRoomThreshold room="WRITER’S STUDIO" destinationCarriesMark />
    </div>
  );
}
