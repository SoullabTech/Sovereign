'use client';

/**
 * DESKTOP-HOUSE-01 — The House as a standalone threshold.
 *
 * WHY THIS ROUTE EXISTS. Desktop's platform view needs a door to open on, and
 * DESKTOP-SHELL-01 opened it on `/journey` — a surface chosen because it was
 * safe to prove a shell with, not because it was where a member belongs. The
 * House is the member's actual threshold, and it is the one surface that knows
 * canonically which places exist and who may see them.
 *
 * ⛔ WHAT THIS IS NOT. Not a second MAIA. There is no conversation renderer on
 * this page and there must never be one: inside Desktop, the member's MAIA is
 * already mounted underneath this view, privileged and local. A conversation
 * here would be a second MAIA in the same window — the failure DS01's device
 * walk actually observed.
 *
 * ⛔ NO DESKTOP COPY OF THE REGISTRY. This renders `MaiaHouseSheet`, which
 * renders from `HOUSE_DESTINATIONS`. The grammar — Your Center · Worlds ·
 * Rooms — and the audience filtering are the canonical ones, not a Desktop
 * taxonomy. Desktop's path allow-list is GENERATED from that same registry
 * (`scripts/generate-desktop-house-allowlist.ts`), so what the House shows and
 * what Desktop permits cannot drift apart.
 *
 * ⭐ WHY CLOSING GOES TO `/maia`. On the web this is simply the way home. Inside
 * Desktop it is more than that: `navigationDecision` reads `/maia` as
 * `return-to-maia`, so the navigation never loads — Desktop detaches the
 * platform view and reveals the local conversation instead. One gesture, honest
 * in both places, with no Desktop-only branch in this file.
 */

import { useRouter } from 'next/navigation';
import { MaiaHouseSheet } from '@/components/maia/MaiaHouseSheet';
import { useSession } from '@/lib/hooks/useSession';

export default function HousePage() {
  const router = useRouter();
  const { isAdmin, isPractitioner } = useSession();

  return (
    <main className="min-h-dvh bg-[#0A0E1A]">
      <MaiaHouseSheet
        open
        // Both the explicit close and the House's own MAIA door land here.
        onClose={() => router.push('/maia')}
        // Role-aware visibility comes from the registry's `audience` field via
        // getHouseDestinations — never from a rule written here.
        isFounder={isAdmin || isPractitioner}
        // Desktop is Electron, not the Capacitor native shell. Native-only
        // reachability rules (nativeReady) do not apply to it.
        isNative={false}
      />
    </main>
  );
}
