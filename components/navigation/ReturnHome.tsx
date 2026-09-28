'use client';

/**
 * ReturnHome — the reliable way out of a Soullab room.
 *
 * A doorway, not chrome. It always returns to canonical Soullab Home and does
 * not depend on browser history or on which doorway the member used to enter.
 * Rooms own the visual register through className; destination, accessible
 * name, and touch target remain fixed here.
 */

import Link from 'next/link';
import {
  SOULLAB_HOME,
  RETURN_LABEL,
  RETURN_ARIA_LABEL,
} from '@/lib/navigation/houseReturn';

export interface ReturnHomeProps {
  className?: string;
}

export function ReturnHome({ className = '' }: ReturnHomeProps) {
  return (
    <Link
      href={SOULLAB_HOME}
      aria-label={RETURN_ARIA_LABEL}
      className={`inline-flex items-center gap-1.5 min-h-[44px] rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 transition-opacity hover:opacity-80 motion-reduce:transition-none ${className}`}
    >
      <span aria-hidden="true">&larr;</span>
      <span>{RETURN_LABEL}</span>
    </Link>
  );
}
