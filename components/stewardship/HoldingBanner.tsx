'use client';

/**
 * HOLDING BANNER
 *
 * Soft acknowledgment that Soullab is doing work on the user's behalf.
 * Appears only at the "acknowledgment" threshold (weight 21-40 for witness tier).
 *
 * No links. No CTA. No upsell. Just orientation.
 *
 * "Soullab is holding with you this week."
 */

import React from 'react';

export type StewardshipThreshold = 'none' | 'acknowledgment' | 'invitation' | 'pause';

interface HoldingBannerProps {
  threshold: StewardshipThreshold | undefined;
}

export function HoldingBanner({ threshold }: HoldingBannerProps) {
  // Only show at acknowledgment level
  if (threshold !== 'acknowledgment') return null;

  return (
    <div className="w-full rounded-xl border border-amber-600/20 bg-amber-900/20
                    px-4 py-3 text-sm text-amber-200/90 text-center">
      Soullab is holding with you this week.
    </div>
  );
}

export default HoldingBanner;
