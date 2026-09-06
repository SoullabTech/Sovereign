'use client';

/**
 * Shadow Field — the place (MAIA-SHADOW-FIELD-01 · PROTOTYPE v1 · P3-R1).
 *
 * The House navigates here as a member-chosen place. This page renders Arrival and
 * nothing more: arriving is not entering. The member's explicit "Enter the Shadow Field"
 * gesture inside the sheet remains the activation act, and it is what opens the
 * server-held sitting (L1, F2, P4-C1).
 *
 * Leaving returns to MAIA, matching the destination's `back-to-maia` return behaviour.
 * The sheet's own Leave already closes the sitting server-side before this runs.
 */

import { useRouter } from 'next/navigation';
import { ShadowFieldSheet } from '@/components/maia/shadowField/ShadowFieldSheet';

export default function ShadowFieldPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#0d0b09]">
      <ShadowFieldSheet
        isOpen
        onClose={() => router.push('/maia')}
        userId=""
      />
    </main>
  );
}
