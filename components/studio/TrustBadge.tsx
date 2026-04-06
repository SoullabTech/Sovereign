'use client';

/**
 * TrustBadge — compact trust indicator pill
 *
 * Matches existing status badge pattern (px-2 py-0.5 text-xs rounded-full).
 * Always includes a text label — never relies on color alone.
 */

import { TRUST_BADGE_COLORS, type TrustColor } from '@/lib/trust/labels';

interface TrustBadgeProps {
  /** Category prefix shown before the label (e.g. "Calendar", "Privacy") */
  category?: string;
  /** The badge text label */
  label: string;
  /** Color key from the trust color system */
  color: TrustColor;
  /** Optional short description shown as title tooltip */
  description?: string;
}

export function TrustBadge({ category, label, color, description }: TrustBadgeProps) {
  const colors = TRUST_BADGE_COLORS[color];

  return (
    <span
      className={`px-2 py-0.5 text-xs rounded-full inline-flex items-center gap-1 ${colors.bg} ${colors.text}`}
      title={description}
    >
      {category && (
        <span className="opacity-60">{category}:</span>
      )}
      {label}
    </span>
  );
}
