'use client';

/**
 * Dev-only Tier Debug Pill
 *
 * Shows tier/access information for debugging gating behavior.
 * Only renders in development mode.
 */

import React from 'react';
import type { MemberTier } from '@/lib/auth/tierAccess';

type TierDebugPillProps = {
  tier: MemberTier;
  hasAccess: boolean;
  extra?: Record<string, unknown>;
  hint?: string;
  scheme?: 'dark' | 'light';
  className?: string;
};

function formatValue(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

export default function TierDebugPill({
  tier,
  hasAccess,
  extra,
  hint,
  scheme = 'dark',
  className,
}: TierDebugPillProps) {
  if (process.env.NODE_ENV !== 'development') return null;

  const base =
    scheme === 'light'
      ? 'text-xs text-stone-600 bg-stone-100 border border-stone-200'
      : 'text-xs text-white/50 bg-white/5 border border-white/10';

  const hintClass =
    scheme === 'light' ? 'text-amber-700/70' : 'text-amber-400/60';

  const extras = extra
    ? Object.entries(extra)
        .map(([k, v]) => {
          const s = formatValue(v);
          return s ? `${k}: ${s}` : null;
        })
        .filter(Boolean)
    : [];

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'inline-flex flex-wrap items-center gap-x-2 gap-y-1 px-3 py-1 rounded-md',
        base,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span>tier: {tier}</span>
      <span>|</span>
      <span>hasAccess: {hasAccess ? 'true' : 'false'}</span>

      {extras.length > 0 && (
        <>
          <span>|</span>
          <span>{extras.join(' | ')}</span>
        </>
      )}

      {hint && (
        <span className={['ml-2', hintClass].join(' ')}>
          ({hint})
        </span>
      )}
    </div>
  );
}
