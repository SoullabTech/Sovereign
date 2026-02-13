'use client';

/**
 * HexagramDisplay — Full Hexagram Display
 *
 * Shows hexagram glyph, names, trigrams, judgment, image,
 * and relating hexagram info (if changing lines exist).
 */

import HexagramGlyph from '@/components/iching/HexagramGlyph';
import { getHexagram } from '@/lib/iching/lookup';
import { getTrigram } from '@/lib/iching/trigrams';

interface HexagramDisplayProps {
  hexagramNumber: number;
  changingLines?: number[];
  relatingHexagramNumber?: number | null;
  size?: 'sm' | 'md' | 'lg';
}

export default function HexagramDisplay({
  hexagramNumber,
  changingLines = [],
  relatingHexagramNumber = null,
  size = 'md',
}: HexagramDisplayProps) {
  const hexagram = getHexagram(hexagramNumber);
  const relatingHexagram = relatingHexagramNumber ? getHexagram(relatingHexagramNumber) : null;

  if (!hexagram) {
    return (
      <div className="p-4 text-center text-slate-500">
        Hexagram {hexagramNumber} not found.
      </div>
    );
  }

  const upperTrigram = getTrigram(hexagram.upperTrigram);
  const lowerTrigram = getTrigram(hexagram.lowerTrigram);

  return (
    <div className="space-y-4">
      {/* Glyph and Header */}
      <div className="flex items-start gap-4">
        <HexagramGlyph lines={hexagram.lines.map(l => l.isYang)} changingLines={changingLines} size={size} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-lg text-slate-500">{hexagram.number}.</span>
            <h3 className="text-lg font-medium text-slate-200">{hexagram.english}</h3>
          </div>
          <p className="text-sm text-slate-400">{hexagram.name}</p>
          {hexagram.changeType && (
            <p className="text-xs text-slate-500 mt-1 capitalize">{hexagram.changeType}</p>
          )}
        </div>
      </div>

      {/* Trigrams */}
      {(upperTrigram || lowerTrigram) && (
        <div className="rounded-lg border border-slate-800/40 bg-slate-900/20 p-3 space-y-2">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Trigrams</p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {upperTrigram && (
              <div>
                <span className="text-slate-500">Upper:</span>
                <span className="ml-1.5 text-slate-300">{upperTrigram.english}</span>
                <span className="ml-1 text-slate-500">({upperTrigram.name})</span>
              </div>
            )}
            {lowerTrigram && (
              <div>
                <span className="text-slate-500">Lower:</span>
                <span className="ml-1.5 text-slate-300">{lowerTrigram.english}</span>
                <span className="ml-1 text-slate-500">({lowerTrigram.name})</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Judgment */}
      <div className="space-y-1">
        <h4 className="text-xs text-amber-400 uppercase tracking-wider">The Judgment</h4>
        <p className="text-sm text-slate-300 leading-relaxed">{hexagram.judgment}</p>
      </div>

      {/* Image */}
      <div className="space-y-1">
        <h4 className="text-xs text-cyan-400 uppercase tracking-wider">The Image</h4>
        <p className="text-sm text-slate-300 leading-relaxed">{hexagram.image}</p>
      </div>

      {/* Changing Lines */}
      {changingLines.length > 0 && (
        <div className="rounded-lg border border-amber-900/30 bg-amber-950/10 p-3">
          <h4 className="text-xs text-amber-400 uppercase tracking-wider mb-1">
            Changing Lines
          </h4>
          <p className="text-xs text-amber-300/70">
            Positions: {changingLines.join(', ')}
          </p>
        </div>
      )}

      {/* Relating Hexagram */}
      {relatingHexagram && (
        <div className="rounded-lg border border-indigo-900/30 bg-indigo-950/10 p-3">
          <h4 className="text-xs text-indigo-400 uppercase tracking-wider mb-1.5">
            Relating Hexagram
          </h4>
          <div className="flex items-center gap-2">
            <HexagramGlyph lines={relatingHexagram.lines.map(l => l.isYang)} size="sm" />
            <div>
              <p className="text-sm text-slate-300">
                {relatingHexagram.number}. {relatingHexagram.english}
              </p>
              <p className="text-xs text-slate-500">{relatingHexagram.name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
