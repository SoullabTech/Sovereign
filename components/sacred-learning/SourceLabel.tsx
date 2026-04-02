'use client';

/**
 * SourceLabel — Authority level badge for sacred learning content
 *
 * Every content block in the sacred learning domain carries this label.
 * Labels cannot be hidden or toggled off (Sacred Source Integrity Policy, §3).
 */

import React from 'react';
import type { AuthorityLevel, SourceMeta } from '@/lib/sacred-learning/types';
import { AUTHORITY_LABEL_FORMATS, AUTHORITY_COLORS } from '@/lib/sacred-learning/types';

interface SourceLabelProps {
  level: AuthorityLevel;
  meta?: SourceMeta;
  className?: string;
}

export function SourceLabel({ level, meta, className = '' }: SourceLabelProps) {
  const colors = AUTHORITY_COLORS[level];
  const label = AUTHORITY_LABEL_FORMATS[level](meta);

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-0.5
        text-xs font-medium tracking-wide
        rounded-full border
        ${colors.bg} ${colors.text} ${colors.border}
        ${className}
      `}
    >
      <AuthorityIcon level={level} />
      {label}
    </span>
  );
}

function AuthorityIcon({ level }: { level: AuthorityLevel }) {
  // Simple visual indicator per authority level
  const icons: Record<AuthorityLevel, string> = {
    1: '\u2726', // four-pointed star — revelation
    2: '\u25C7', // diamond — scholarship
    3: '\u25CB', // circle — mystical
    4: '\u2727', // four-pointed star variant — contemplative
    5: '\u2014', // em dash — personal
    6: '\u25A1', // square — AI
  };

  return <span className="text-[10px]">{icons[level]}</span>;
}
