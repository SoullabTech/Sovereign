'use client';

/**
 * HexagramCard — Compact display of a hexagram
 *
 * Shows the glyph, number, and English name.
 * Optionally shows changing lines and change type.
 */

import HexagramGlyph from './HexagramGlyph';

interface HexagramCardProps {
  number: number;
  name: string;
  english: string;
  lines: boolean[];                   // 6 booleans, bottom to top
  changingLines?: number[];
  changeType?: string;
  onClick?: () => void;
  selected?: boolean;
  compact?: boolean;
  className?: string;
}

export default function HexagramCard({
  number,
  name,
  english,
  lines,
  changingLines = [],
  changeType,
  onClick,
  selected = false,
  compact = false,
  className = '',
}: HexagramCardProps) {
  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      onClick={onClick}
      className={`
        flex items-center gap-3 rounded-lg border transition-colors
        ${compact ? 'p-2' : 'p-3'}
        ${selected
          ? 'border-amber-500/50 bg-amber-950/20'
          : 'border-slate-800/40 bg-slate-900/20 hover:border-slate-700/50'}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      <HexagramGlyph
        lines={lines}
        changingLines={changingLines}
        size={compact ? 'sm' : 'md'}
      />
      <div className="text-left min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500">{number}.</span>
          <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-slate-200 truncate`}>
            {english}
          </span>
        </div>
        <div className="text-xs text-slate-500 truncate">{name}</div>
        {changeType && !compact && (
          <div className="text-xs text-slate-600 mt-0.5 capitalize">{changeType}</div>
        )}
        {changingLines.length > 0 && !compact && (
          <div className="text-xs text-amber-500/70 mt-0.5">
            {changingLines.length} changing line{changingLines.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </Wrapper>
  );
}
